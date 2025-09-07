;(function(){
  const PX='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Yg7Q7MAAAAASUVORK5CYII=';
  if (window.L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({ iconUrl: PX, iconRetinaUrl: PX, shadowUrl: PX });
  }
})();
