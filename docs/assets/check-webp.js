if (!document.createElement('canvas').toDataURL('image/webp').includes('data:image/webp')) {
  document.documentElement.classList.add('no-webp');
}
