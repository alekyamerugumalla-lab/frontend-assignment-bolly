/* bolly — small UI interactions (nav + cart), kept deliberately minimal */
(function () {
  const cart = document.querySelector('.cart');
  const badge = document.querySelector('.cart-badge');
  let count = 0;

  if (cart && badge) {
    cart.addEventListener('click', () => {
      count += 1;
      badge.textContent = count;
      cart.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }],
        { duration: 220, easing: 'ease-out' }
      );
    });
  }

  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
})();
