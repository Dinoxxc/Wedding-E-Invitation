// ==========================================
// PHOTO GALLERY WITH LIGHTBOX
// ==========================================

function initGallery() {
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (!gallery || !lightbox) return;

  const images = gallery.querySelectorAll('.gallery-item img');
  let currentIndex = 0;

  // Open lightbox
  images.forEach((img, index) => {
    img.parentElement.addEventListener('click', (e) => {
      e.preventDefault();
      currentIndex = index;
      openLightbox(img.src, img.alt);
    });
  });

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    if (index >= 0 && index < images.length) {
      currentIndex = index;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }
  }

  // Close lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Previous image
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
      showImage(currentIndex - 1 >= 0 ? currentIndex - 1 : images.length - 1);
    });
  }

  // Next image
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
      showImage(currentIndex + 1 < images.length ? currentIndex + 1 : 0);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showImage(currentIndex - 1 >= 0 ? currentIndex - 1 : images.length - 1);
        break;
      case 'ArrowRight':
        showImage(currentIndex + 1 < images.length ? currentIndex + 1 : 0);
        break;
    }
  });
}

document.addEventListener('DOMContentLoaded', initGallery);
