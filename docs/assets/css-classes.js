export function setClass(el, add=[], remove=[]){
  if(!el) return;
  add.forEach(c=>el.classList.add(c));
  remove.forEach(c=>el.classList.remove(c));
}
