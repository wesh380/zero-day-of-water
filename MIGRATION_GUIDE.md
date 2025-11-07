# راهنمای Migration به معماری جدید CLD

## 🎯 هدف
Migration تدریجی از Vanilla JS فعلی به معماری مدرن با Vite + Zustand

---

## 📦 نصب Dependencies

```bash
# Development dependencies
npm install -D vite
npm install -D vitest @vitest/ui
npm install -D playwright @playwright/test
npm install -D @sentry/vite-plugin

# Runtime dependencies
npm install zustand
npm install @sentry/browser
```

---

## 🔧 Setup اولیه

### 1. ایجاد package.json

```json
{
  "name": "wesh360-cld",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "playwright": "^1.40.0",
    "@sentry/vite-plugin": "^2.0.0"
  },
  "dependencies": {
    "zustand": "^4.4.0",
    "@sentry/browser": "^7.0.0",
    "cytoscape": "^3.28.0",
    "cytoscape-elk": "^2.2.0",
    "cytoscape-dagre": "^2.5.0",
    "tippy.js": "^6.3.7"
  }
}
```

---

### 2. ایجاد vite.config.js

```javascript
import { defineConfig } from 'vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  root: 'src',
  base: '/water/cld/',

  build: {
    outDir: '../docs/assets/dist-v2',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: './src/main.js'
      },

      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',

        manualChunks: {
          // Vendor chunks
          'vendor-cytoscape': ['cytoscape'],
          'vendor-layout': ['cytoscape-elk', 'cytoscape-dagre'],
          'vendor-ui': ['tippy.js'],
          'vendor-state': ['zustand']
        }
      }
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    sourcemap: true
  },

  server: {
    port: 3000,
    open: '/water/cld/',
    proxy: {
      '/api': 'http://localhost:8888' // Netlify functions
    }
  },

  optimizeDeps: {
    include: ['cytoscape', 'zustand', 'tippy.js']
  },

  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'wesh360',
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ]
});
```

---

### 3. ساختار پوشه‌های جدید

```
src/
├── main.js                 # Entry point
├── cld/
│   ├── core/
│   │   ├── manager.js      # CLDManager class
│   │   ├── validator.js    # Validation logic
│   │   └── error-handler.js
│   ├── components/
│   │   ├── graph.js        # Graph component
│   │   ├── controls.js     # Control panel
│   │   ├── filters.js      # Filter controls
│   │   └── toolbar.js      # Toolbar
│   ├── store/
│   │   └── cld-store.js    # Zustand store
│   ├── utils/
│   │   ├── layout.js       # Layout utilities
│   │   ├── styles.js       # Style definitions
│   │   └── helpers.js      # Helper functions
│   └── types/
│       └── index.js        # JSDoc types
├── styles/
│   ├── main.css
│   ├── graph.css
│   └── controls.css
└── __tests__/
    ├── unit/
    │   ├── manager.test.js
    │   └── validator.test.js
    └── e2e/
        └── graph.spec.js
```

---

## 🏗️ پیاده‌سازی

### 1. Zustand Store (src/cld/store/cld-store.js)

```javascript
import { createStore } from 'zustand/vanilla';

export const cldStore = createStore((set, get) => ({
  // State
  cy: null,
  model: null,
  layout: 'elk',
  zoom: 1,
  filters: {
    minWeight: 0,
    maxDelay: 5,
    groups: [],
    searchTerm: ''
  },
  loading: false,
  error: null,

  // Actions
  setCy: (cy) => set({ cy }),

  setModel: (model) => set({ model }),

  setLayout: (layout) => {
    set({ layout });
    get().applyLayout();
  },

  setZoom: (zoom) => {
    set({ zoom });
    get().cy?.zoom(zoom);
  },

  updateFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  })),

  resetFilters: () => set({
    filters: {
      minWeight: 0,
      maxDelay: 5,
      groups: [],
      searchTerm: ''
    }
  }),

  applyFilters: () => {
    const { cy, filters } = get();
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass('hidden');

      // Filter by weight
      cy.edges().forEach(edge => {
        const weight = edge.data('weight') || 0;
        if (weight < filters.minWeight) {
          edge.addClass('hidden');
        }
      });

      // Filter by delay
      cy.edges().forEach(edge => {
        const delay = edge.data('delayYears') || 0;
        if (delay > filters.maxDelay) {
          edge.addClass('hidden');
        }
      });

      // Filter by search term
      if (filters.searchTerm) {
        cy.nodes().forEach(node => {
          const label = node.data('label') || '';
          if (!label.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
            node.addClass('hidden');
          }
        });
      }
    });
  },

  applyLayout: async () => {
    const { cy, layout } = get();
    if (!cy) return;

    set({ loading: true });

    try {
      const layoutOptions = {
        name: layout,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 50
      };

      if (layout === 'elk') {
        Object.assign(layoutOptions, {
          elk: {
            algorithm: 'layered',
            'elk.direction': 'RIGHT',
            'elk.spacing.nodeNode': 60,
            'elk.layered.spacing.nodeNodeBetweenLayers': 90
          }
        });
      } else if (layout === 'dagre') {
        Object.assign(layoutOptions, {
          rankDir: 'LR',
          nodeSep: 60,
          rankSep: 90
        });
      }

      await cy.layout(layoutOptions).run();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('[CLD Store] Layout failed:', error);
    }
  },

  loadModel: async (url) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.status}`);
      }

      const model = await response.json();
      set({ model, loading: false });

      return model;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

// Subscribe helper for vanilla JS
export const subscribe = (selector, callback) => {
  return cldStore.subscribe(
    state => selector(state),
    callback
  );
};

// Getters
export const getState = () => cldStore.getState();
export const getCy = () => getState().cy;
```

---

### 2. CLDManager (src/cld/core/manager.js)

```javascript
import { cldStore } from '../store/cld-store.js';
import { CLDValidator } from './validator.js';
import { CLDErrorHandler } from './error-handler.js';
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';
import dagre from 'cytoscape-dagre';
import tippy from 'tippy.js';

// Register layout algorithms
cytoscape.use(elk);
cytoscape.use(dagre);

export class CLDManager {
  constructor() {
    this.initialized = false;
    this.plugins = [];
  }

  async init(config) {
    if (this.initialized) {
      console.warn('[CLD] Already initialized');
      return cldStore.getState().cy;
    }

    try {
      // Validate dependencies
      if (!CLDValidator.validateDependencies()) {
        throw new Error('Missing required dependencies');
      }

      // Create Cytoscape instance
      const cy = this._createCytoscape(config);
      cldStore.getState().setCy(cy);

      // Load model if provided
      if (config.modelUrl) {
        const model = await cldStore.getState().loadModel(config.modelUrl);
        this._applyModel(cy, model);
      }

      // Apply styles
      this._applyStyles(cy);

      // Initialize plugins
      this._initPlugins(cy);

      // Setup event listeners
      this._setupEventListeners(cy);

      // Apply initial layout
      if (config.layout) {
        cldStore.getState().setLayout(config.layout);
      }

      this.initialized = true;
      console.log('[CLD] Initialization complete ✓');

      return cy;
    } catch (error) {
      CLDErrorHandler.handleError(error);
      throw error;
    }
  }

  _createCytoscape(config) {
    const container = document.querySelector(config.container);
    if (!container) {
      throw new Error(`Container not found: ${config.container}`);
    }

    return cytoscape({
      container: container,
      elements: [],
      style: this._getStyles(),
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.2,
      ...config.cytoscapeOptions
    });
  }

  _applyModel(cy, model) {
    if (!CLDValidator.validateModel(model)) {
      throw new Error('Invalid model structure');
    }

    const elements = this._convertModelToElements(model);

    cy.batch(() => {
      cy.elements().remove();
      cy.add(elements);
    });

    console.log('[CLD] Model applied:', {
      nodes: cy.nodes().length,
      edges: cy.edges().length
    });
  }

  _convertModelToElements(model) {
    const elements = [];

    // Add nodes
    model.nodes.forEach(node => {
      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          label: node.label || node.id,
          ...node
        }
      });
    });

    // Add edges
    model.edges.forEach(edge => {
      elements.push({
        group: 'edges',
        data: {
          id: edge.id || `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          sign: edge.sign || '+',
          weight: edge.weight || 0,
          delayYears: edge.delayYears || 0,
          ...edge
        }
      });
    });

    return elements;
  }

  _getStyles() {
    return [
      {
        selector: 'node',
        style: {
          'background-color': '#f0f4f8',
          'border-color': '#64748b',
          'border-width': 3,
          'color': '#0f172a',
          'font-size': '16px',
          'font-weight': 700,
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': '280px',
          'width': 'label',
          'height': 'label',
          'padding': '22px',
          'shape': 'round-rectangle',
          'text-valign': 'center',
          'text-halign': 'center'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3.5,
          'line-color': '#475569',
          'target-arrow-color': '#475569',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '13px'
        }
      },
      {
        selector: 'edge[sign = "+"]',
        style: {
          'line-color': '#16a34a',
          'target-arrow-color': '#16a34a'
        }
      },
      {
        selector: 'edge[sign = "-"]',
        style: {
          'line-color': '#dc2626',
          'target-arrow-color': '#dc2626'
        }
      },
      {
        selector: '.hidden',
        style: {
          'display': 'none'
        }
      }
    ];
  }

  _applyStyles(cy) {
    // Styles are already applied in _getStyles()
    console.log('[CLD] Styles applied ✓');
  }

  _initPlugins(cy) {
    this.plugins.forEach(plugin => {
      try {
        plugin.init(cy);
        console.log(`[CLD] Plugin ${plugin.name} initialized ✓`);
      } catch (error) {
        console.error(`[CLD] Plugin ${plugin.name} failed:`, error);
      }
    });
  }

  _setupEventListeners(cy) {
    // Zoom tracking
    cy.on('zoom', () => {
      const zoom = cy.zoom();
      cldStore.getState().setZoom(zoom);
    });

    // Node hover effects
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const neighborhood = node.closedNeighborhood();

      cy.elements().difference(neighborhood).addClass('faded');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('faded');
    });
  }

  registerPlugin(name, initFn) {
    this.plugins.push({ name, init: initFn });
  }

  destroy() {
    const cy = cldStore.getState().cy;
    if (cy) {
      cy.destroy();
    }
    this.initialized = false;
    console.log('[CLD] Destroyed');
  }
}

// Singleton instance
export const cldManager = new CLDManager();
```

---

### 3. Main Entry Point (src/main.js)

```javascript
import { cldManager } from './cld/core/manager.js';
import { cldStore, subscribe } from './cld/store/cld-store.js';
import * as Sentry from '@sentry/browser';
import './styles/main.css';

// Initialize Sentry
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1
  });
}

// Initialize CLD
async function init() {
  try {
    const cy = await cldManager.init({
      container: '#cy',
      modelUrl: '/data/water-cld-poster.json',
      layout: 'elk'
    });

    console.log('[App] CLD initialized successfully');

    // Setup UI bindings
    setupUIBindings();
  } catch (error) {
    console.error('[App] Initialization failed:', error);
    Sentry.captureException(error);
  }
}

function setupUIBindings() {
  // Zoom controls
  document.getElementById('zoom-in')?.addEventListener('click', () => {
    const state = cldStore.getState();
    state.setZoom(state.zoom * 1.2);
  });

  document.getElementById('zoom-out')?.addEventListener('click', () => {
    const state = cldStore.getState();
    state.setZoom(state.zoom / 1.2);
  });

  // Filter controls
  document.getElementById('filter-weight')?.addEventListener('input', (e) => {
    cldStore.getState().updateFilter('minWeight', parseFloat(e.target.value));
    cldStore.getState().applyFilters();
  });

  // Subscribe to state changes
  subscribe(
    state => state.loading,
    loading => {
      document.body.classList.toggle('loading', loading);
    }
  );

  subscribe(
    state => state.error,
    error => {
      if (error) {
        alert(`خطا: ${error}`);
      }
    }
  );
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

---

### 4. Unit Test نمونه (src/__tests__/unit/manager.test.js)

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CLDManager } from '../../cld/core/manager.js';

describe('CLDManager', () => {
  let manager;
  let container;

  beforeEach(() => {
    // Setup DOM
    container = document.createElement('div');
    container.id = 'cy';
    document.body.appendChild(container);

    manager = new CLDManager();
  });

  afterEach(() => {
    manager.destroy();
    document.body.removeChild(container);
  });

  it('should initialize without errors', async () => {
    const mockModel = {
      nodes: [{ id: 'n1', label: 'Node 1' }],
      edges: []
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockModel)
      })
    );

    const cy = await manager.init({
      container: '#cy',
      modelUrl: '/mock-model.json'
    });

    expect(cy).toBeDefined();
    expect(cy.nodes().length).toBe(1);
  });

  it('should throw error for missing container', async () => {
    await expect(manager.init({ container: '#nonexistent' }))
      .rejects
      .toThrow('Container not found');
  });

  it('should apply filters correctly', async () => {
    // Test implementation
  });
});
```

---

## 🚀 اجرا

```bash
# نصب dependencies
npm install

# Development mode
npm run dev

# Build برای production
npm run build

# اجرای تست‌ها
npm test

# E2E tests
npm run test:e2e
```

---

## 📈 مزایای این معماری

1. **Modularity**: کد organized و قابل نگهداری
2. **Type Safety**: با JSDoc comments
3. **Testing**: Unit و E2E tests
4. **Performance**: Bundle splitting, tree shaking
5. **Developer Experience**: HMR, better debugging
6. **Production Ready**: Error tracking, monitoring

---

## 🔄 Migration تدریجی

می‌توانید به صورت تدریجی migrate کنید:

1. **هفته 1**: Setup Vite + Zustand
2. **هفته 2**: Migrate یک component
3. **هفته 3**: Write tests
4. **هفته 4**: Migrate بقیه components

---

**آماده برای شروع هستید؟**
