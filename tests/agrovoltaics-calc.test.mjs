import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScenario, defaultState, presets, sanitizeInputs, validateInputs } from '../docs/solar/agrivoltaics/calc.mjs';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const baseState = () => clone(defaultState);

test('validation fails for negative area', () => {
  const state = baseState();
  state.project_area_ha = -1;
  const validation = validateInputs(state, true);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.project_area_ha);
});

test('calculation returns ready with default state', () => {
  const result = calculateScenario(baseState(), true);
  assert.equal(result.ready, true);
  assert.equal(result.ok, true);
  assert.ok(Number.isFinite(result.npv_incremental));
});

test('increasing tariff increases npv', () => {
  const state = baseState();
  const base = calculateScenario(state, true);
  state.ppa_or_fit_tariff *= 1.2;
  const higher = calculateScenario(state, true);
  assert.ok(higher.ok);
  assert.ok(higher.npv_incremental > base.npv_incremental);
});

test('extremely small capacity keeps outputs finite', () => {
  const state = baseState();
  state.pv_capacity_kWp_total = 0.001;
  const result = calculateScenario(state, true);
  assert.equal(result.ok, true);
  assert.ok(Number.isFinite(result.totalPVkWhYear1));
});

test('net metering requires buy price in advanced mode', () => {
  const state = baseState();
  state.grid_scheme = 'NetMetering';
  state.net_metering_buy_price = null;
  const validation = validateInputs(state, false);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.net_metering_buy_price);
});

test('net metering requires sell price in advanced mode', () => {
  const state = baseState();
  state.grid_scheme = 'NetMetering';
  state.net_metering_sell_price = undefined;
  const validation = validateInputs(state, false);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.net_metering_sell_price);
});

test('negative yield change lowers revenue', () => {
  const state = baseState();
  const base = calculateScenario(state, true);
  state.expected_yield_change_pct_under_AGV = -50;
  const lower = calculateScenario(state, true);
  assert.ok(lower.meta.ag_rev_agv < base.meta.ag_rev_agv);
});

test('short horizon still computes', () => {
  const state = baseState();
  state.time_horizon_years = 1;
  const result = calculateScenario(state, true);
  assert.equal(result.years, 1);
  assert.equal(result.cashflowsIncremental.length, 2);
});

test('changing region updates specific yield', () => {
  const state = baseState();
  state.specific_yield_kWh_per_kWp_year = presets.regions.mashhad.sun;
  const result = calculateScenario(state, true);
  assert.equal(result.ready, true);
  assert.equal(state.specific_yield_kWh_per_kWp_year, presets.regions.mashhad.sun);
});

test('sanitizeInputs strips separators and clamps values', () => {
  const state = { project_area_ha: '1,200', salinity_EC: -5, baseline_yield_t_per_ha: '10' };
  const { values, errors, valid } = sanitizeInputs(state, true);
  assert.equal(values.project_area_ha, 1000);
  assert.equal(values.salinity_EC, 0);
  assert.equal(valid, false);
  assert.ok(errors.salinity_EC);
});

test('zero area returns not ready and reports error', () => {
  const state = baseState();
  state.project_area_ha = 0;
  const result = calculateScenario(state, true);
  assert.equal(result.ready, false);
  assert.equal(result.ok, false);
  assert.ok(result.errors.project_area_ha);
});

test('calculator avoids NaN for zero tariffs and high curtailment', () => {
  const state = baseState();
  state.ppa_or_fit_tariff = 0;
  state.curtailment_pct = 80;
  state.tariff_escalation_pct_per_year = 0;
  const result = calculateScenario(state, true);
  assert.equal(result.ok, true);
  assert.ok(Number.isFinite(result.npv_incremental));
  assert.ok(Number.isFinite(result.cashflowsIncremental[1]));
});

test('irr can be null without failing readiness', () => {
  const state = baseState();
  state.ppa_or_fit_tariff = 0;
  state.module_price_per_kWp = 5000000000;
  state.mounting_structure_cost_per_kWp = 3000000000;
  state.inverter_BOS_cost_per_kWp = 3000000000;
  const result = calculateScenario(state, true);
  assert.equal(result.ok, true);
  assert.ok(Number.isFinite(result.npv_incremental));
  assert.equal(result.irr_incremental === null || Number.isFinite(result.irr_incremental), true);
});
