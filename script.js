'use strict'

window.addEventListener('load', () => {
  const imageElement = document.getElementById('image-preview')

  document.getElementById("file-input")
    .addEventListener('change', buildNewImageHandler(imageElement))
})

function buildNewImageHandler(imageElement) {
  return function () {
    if (!this.files.length) return
    const file = this.files[0]
    imageElement.src = URL.createObjectURL(file)
  }
}

function enableImageResize(target, container) {
  container.style.width = `${target.width}px`;
  container.style.height = `${target.height}px`;
  container.classList.add('show')
}