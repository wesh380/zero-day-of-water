export async function loadModel(){
  const res = await fetch('/data/water/cld-model.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('model fetch failed: '+res.status);
  return await res.json();
}
window.CLD_LOAD_MODEL = loadModel;
