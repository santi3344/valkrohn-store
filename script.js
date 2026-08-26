const products = [
  {
    id: 1,
    name: 'Tech Jacket',
    category: 'chaquetas',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    description: 'Chaqueta ligera con corte amplio, acabados premium y la silueta ideal para combinar con looks urbanos.',
    tags: ['NOVA', 'Premium'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Cargo Pants',
    category: 'pantalones',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    description: 'Pantalón cómodo y estructurado con múltiples detalles funcionales para uso diario y looks rebeldes.',
    tags: ['Urban', 'Comfy'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 3,
    name: 'Logo Hoodie',
    category: 'sudaderas',
    price: 445000,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    description: 'Sudadera sobria con estampado minimalista, gran calidez y un ajuste cómodo para cada ocasión.',
    tags: ['Core', 'Casual'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'Logo Cap',
    category: 'accesorios',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1521369909026-2afed882baee?auto=format&fit=crop&w=900&q=80',
    description: 'Gorra con estructura firme y acabado limpio, perfecta para completar cualquier conjunto.',
    tags: ['Essentials', 'Street'],
    sizes: ['Único']
  },
  {
    id: 5,
    name: 'Field Coat',
    category: 'chaquetas',
    price: 960000,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    description: 'Abrigo versátil con estética técnica y detalles premium para mantener estilo incluso en días fríos.',
    tags: ['Outerwear', 'Exclusive'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 6,
    name: 'Relax Tee',
    category: 'sudaderas',
    price: 310000,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    description: 'Camiseta de corte relajado, suave al tacto y con diseño limpio para todas las ocasiones.',
    tags: ['Daily', 'Soft'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];

const CART_KEY = 'nova-cart';

const countries = [
  { code: 'ES', name: 'España', dial: '+34', flag: '🇪🇸' },
  { code: 'MX', name: 'México', dial: '+52', flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', dial: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'Reino Unido', dial: '+44', flag: '🇬🇧' },
  { code: 'FR', name: 'Francia', dial: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', dial: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', dial: '+39', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
  { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷' }
];

function getCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return storedCart.map((item) => typeof item === 'number'
      ? { productId: item, size: '' }
      : { productId: Number(item.productId), size: item.size || '' });
  } catch (error) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function updateCartBadge() {
  const cartBadges = document.querySelectorAll('.cart-badge');
  const count = getCart().length;
  cartBadges.forEach((badge) => {
    badge.textContent = String(count);
  });
}

function addProductToCart(productId, size) {
  const cart = getCart();
  cart.push({ productId, size });
  saveCart(cart);
  updateCartBadge();
}

function removeProductFromCart(productId, size) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.productId === productId && item.size === size);
  if (index !== -1) {
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
  }
}

function getCartCounts() {
  const counts = {};
  getCart().forEach((item) => {
    const key = `${item.productId}|${item.size}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function getCartLines() {
  const counts = getCartCounts();
  return Object.entries(counts).map(([key, quantity]) => {
    const [productId, size] = key.split('|');
    return {
      product: products.find((item) => item.id === Number(productId)),
      size,
      quantity
    };
  }).filter((line) => line.product);
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value));
}

function showPaymentSuccess(form, total, orderNumber = `VK-${Date.now().toString().slice(-6)}`) {
  const page = form.closest('.checkout-page');
  if (!page) return;

  page.innerHTML = `
    <section class="payment-success" aria-live="polite">
      <div class="success-brand">
        <img src="assets/valkrohn-logo.svg" alt="VALKROHN" />
        <span>VALKROHN</span>
      </div>
      <div class="success-check" aria-hidden="true">✓</div>
      <p class="eyebrow">Pedido confirmado</p>
      <h1>¡Pago realizado!</h1>
      <p class="success-lead">Tu pedido ha sido confirmado y ya estamos preparándolo.</p>

      <div class="success-summary">
        <div>
          <span>Pedido</span>
          <strong>#${orderNumber}</strong>
        </div>
        <div>
          <span>Total pagado</span>
          <strong>${formatPrice(total)}</strong>
        </div>
      </div>

      <div class="order-progress" aria-label="Estado del pedido">
        <div class="progress-step active"><i></i><span>Confirmado</span></div>
        <div class="progress-step active"><i></i><span>Preparando</span></div>
        <div class="progress-step"><i></i><span>Enviado</span></div>
        <div class="progress-step"><i></i><span>Entregado</span></div>
      </div>
      <p class="delivery-note">Entrega estimada: 2–4 días laborables</p>

      <div class="success-actions">
        <a href="index.html" class="button primary">Seguir comprando</a>
        <a href="cart.html" class="button secondary">Ver carrito</a>
      </div>
    </section>
  `;
}

function ensureCartNotice() {
  if (document.getElementById('cart-notice')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="cart-notice" class="cart-notice" hidden>
      <div class="cart-notice-backdrop" data-notice-close></div>
      <div class="cart-notice-dialog" role="dialog" aria-modal="true" aria-labelledby="cart-notice-title">
        <button type="button" class="cart-notice-close" data-notice-close aria-label="Cerrar">×</button>
        <img class="cart-notice-logo" src="assets/valkrohn-logo.svg" alt="VALKROHN" />
        <p class="eyebrow">VALKROHN</p>
        <h2 id="cart-notice-title"></h2>
        <p id="cart-notice-message"></p>
        <div class="cart-notice-actions">
          <button type="button" class="button secondary" data-notice-cancel>Cancelar</button>
          <button type="button" class="button primary" data-notice-confirm>Continuar</button>
        </div>
      </div>
    </div>
  `);
}

function showCartNotice({ title, message, confirmText = 'Continuar', cancelText = '', showLogo = true, onConfirm = null }) {
  ensureCartNotice();
  const modal = document.getElementById('cart-notice');
  if (!modal) return;
  const titleElement = document.getElementById('cart-notice-title');
  const messageElement = document.getElementById('cart-notice-message');
  const confirmButton = modal.querySelector('[data-notice-confirm]');
  const cancelButton = modal.querySelector('[data-notice-cancel]');
  const logo = modal.querySelector('.cart-notice-logo');

  titleElement.textContent = title;
  messageElement.textContent = message;
  confirmButton.textContent = confirmText;
  cancelButton.textContent = cancelText || 'Cerrar';
  cancelButton.hidden = !cancelText;
  logo.hidden = !showLogo;
  modal.hidden = false;

  const close = () => {
    modal.hidden = true;
    confirmButton.onclick = null;
    document.removeEventListener('keydown', handleEscape);
  };

  const handleEscape = (event) => {
    if (event.key === 'Escape') close();
  };

  modal.querySelectorAll('[data-notice-close], [data-notice-cancel]').forEach((button) => {
    button.onclick = close;
  });
  confirmButton.onclick = () => {
    close();
    onConfirm?.();
  };
  document.addEventListener('keydown', handleEscape);
  confirmButton.focus();
}

function getVisibleProducts() {
  const currentFilter = document.querySelector('.filter-button.active')?.dataset.filter || 'all';
  const searchInput = document.getElementById('search-input');
  const searchValue = (searchInput?.value || '').trim().toLowerCase();

  let filtered = currentFilter === 'all'
    ? [...products]
    : products.filter((product) => product.category === currentFilter);

  if (searchValue) {
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(searchValue) ||
      product.description.toLowerCase().includes(searchValue)
    );
  }

  const sortSelect = document.getElementById('sort-select');
  const order = sortSelect?.value || 'featured';

  if (order === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (order === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (order === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

function renderCatalog() {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;

  const visibleProducts = getVisibleProducts();

  productGrid.innerHTML = visibleProducts.length ? visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" />
        <a class="card-view-link" href="product.html?id=${product.id}">Ver producto <span>↗</span></a>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="tag">${product.tags[0]}</span>
          <span class="price">${formatPrice(product.price)}</span>
        </div>
        <h3>${product.name}</h3>
        <label class="size-select-label">Talla
          <select class="size-select" data-size-select>
            ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join('')}
          </select>
        </label>
        <button class="button product-button" data-product="${product.id}">Añadir al carrito</button>
      </div>
    </article>
  `).join('') : '<div class="empty-state" style="grid-column:1/-1;"><h3>No encontramos resultados</h3><p>Prueba otra palabra clave o cambia el filtro.</p></div>';

  bindProductButtons();
}

function renderFeaturedProducts() {
  const featuredGrid = document.getElementById('featured-product-grid');
  const carousel = document.querySelector('[data-featured-carousel]');
  if (!featuredGrid || !carousel) return;

  featuredGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <a class="card-view-link" href="product.html?id=${product.id}">Ver producto <span>↗</span></a>
      </div>
      <div class="product-info">
        <div class="product-meta">
          <span class="tag">${product.tags[0]}</span>
          <span class="price">${formatPrice(product.price)}</span>
        </div>
        <h3>${product.name}</h3>
        <label class="size-select-label">Talla
          <select class="size-select" data-size-select>
            ${product.sizes.map((size) => `<option value="${size}"${size === product.sizes[0] ? ' selected' : ''}>${size}</option>`).join('')}
          </select>
        </label>
        <button class="button product-button" data-product="${product.id}">Añadir al carrito</button>
      </div>
    </article>
  `).join('');

  bindProductButtons();

  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const getScrollAmount = () => Math.max(featuredGrid.clientWidth * 0.78, 260);
  const updateArrowState = () => {
    const maxScroll = featuredGrid.scrollWidth - featuredGrid.clientWidth - 2;
    previousButton.disabled = featuredGrid.scrollLeft <= 2;
    nextButton.disabled = featuredGrid.scrollLeft >= maxScroll;
  };

  previousButton.addEventListener('click', () => {
    featuredGrid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });
  nextButton.addEventListener('click', () => {
    featuredGrid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });
  featuredGrid.addEventListener('scroll', updateArrowState, { passive: true });
  window.addEventListener('resize', updateArrowState);
  updateArrowState();
}

function renderProductDetail() {
  const root = document.getElementById('product-detail');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get('id')) || 1;
  const product = products.find((item) => item.id === productId) || products[0];
  const requestedSize = params.get('size');
  const initialSize = product.sizes.includes(requestedSize) ? requestedSize : product.sizes[0];

  root.innerHTML = `
    <div class="product-detail-gallery">
      <img src="${product.image}" alt="${product.name}" />
    </div>

    <div class="product-detail-info">
      <p class="eyebrow">${product.tags[0]}</p>
      <h1>${product.name}</h1>
      <div class="product-price">${formatPrice(product.price)}</div>
      <p class="product-description">${product.description}</p>

      <div class="detail-meta">
        <label class="detail-size-label" for="detail-size">Selecciona tu talla</label>
        <div class="size-options" id="detail-size" role="group" aria-label="Tallas disponibles">
          ${product.sizes.map((size) => `<button type="button" class="detail-pill size-option${size === initialSize ? ' active' : ''}" data-size-option="${size}" aria-pressed="${size === initialSize}">${size}</button>`).join('')}
        </div>
      </div>

      <div class="product-actions">
        <button class="button primary" data-product="${product.id}">Añadir al carrito</button>
        <a href="catalog.html" class="button secondary">Volver</a>
      </div>
    </div>
  `;

  bindProductButtons();
}

function bindProductDetailLinks() {
  document.querySelectorAll('.card-view-link').forEach((link) => {
    const media = link.closest('.product-media');

    media?.addEventListener('click', (event) => {
      if (event.target.closest('.card-view-link')) return;
      link.click();
    });

    link.addEventListener('click', () => {
      const sizeSelect = link.closest('.product-card')?.querySelector('[data-size-select]');
      if (!sizeSelect?.value) return;

      const url = new URL(link.href, window.location.href);
      url.searchParams.set('size', sizeSelect.value);
      link.href = url.toString();
    });
  });
}

function renderCart() {
  const cartItemsRoot = document.getElementById('cart-items');
  if (!cartItemsRoot) return;

  const cartLines = getCartLines();

  if (!cartLines.length) {
    cartItemsRoot.innerHTML = `
      <div class="empty-state">
        <h3>Tu carrito está vacío</h3>
        <p>Aún no has añadido ningún producto.</p>
      </div>
    `;
    updateSummary(0);
    return;
  }

  cartItemsRoot.innerHTML = cartLines.map(({ product, size, quantity }) => `
    <article class="cart-item">
      <a class="cart-product-link" href="product.html?id=${product.id}&size=${encodeURIComponent(size)}" aria-label="Ver ${product.name}">
        <img src="${product.image}" alt="${product.name}" />
      </a>
      <div class="cart-product-copy">
        <h3><a href="product.html?id=${product.id}&size=${encodeURIComponent(size)}">${product.name}</a></h3>
        <p>${product.tags[0]} · Talla: ${size || 'Única'} · Cantidad: ${quantity}</p>
      </div>
      <div>
        <div class="cart-item-price">${formatPrice(product.price * quantity)}</div>
        <button class="remove-button" data-action="remove" data-product="${product.id}" data-size="${size}">Eliminar</button>
      </div>
    </article>
  `).join('');

  const subtotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);
  updateSummary(subtotal);

  const removeButtons = document.querySelectorAll('[data-action="remove"]');
  removeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const product = products.find((item) => item.id === Number(button.dataset.product));
      showCartNotice({
        title: '¿Eliminar producto?',
        message: `¿Seguro que quieres eliminar ${product?.name || 'este producto'}${button.dataset.size ? ` · Talla ${button.dataset.size}` : ''} de tu carrito?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        onConfirm: () => {
          removeProductFromCart(Number(button.dataset.product), button.dataset.size);
          renderCart();
          renderCheckoutSummary();
        }
      });
    });
  });
}

function updateSummary(subtotal) {
  const subtotalEl = document.getElementById('subtotal');
  const shippingEl = document.getElementById('shipping');
  const totalEl = document.getElementById('total');

  if (!subtotalEl || !shippingEl || !totalEl) return;

  const shipping = subtotal > 0 ? 20000 : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(shipping);
  totalEl.textContent = formatPrice(total);
}

function renderCheckoutSummary() {
  const root = document.getElementById('checkout-summary');
  const totalEl = document.getElementById('checkout-total');
  if (!root || !totalEl) return;

  const cartLines = getCartLines();

  if (!cartLines.length) {
    root.innerHTML = '<p class="empty-state">No hay productos en tu carrito.</p>';
    totalEl.textContent = formatPrice(0);
    return;
  }

  const subtotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const shipping = subtotal > 0 ? 20000 : 0;
  const total = subtotal + shipping;

  root.innerHTML = cartLines.map(({ product, size, quantity }) => `
    <div class="summary-item">
      <span class="summary-product">
        <img src="${product.image}" alt="${product.name}" />
        <span>${product.name} · Talla ${size || 'Única'} × ${quantity}</span>
      </span>
      <strong>${formatPrice(product.price * quantity)}</strong>
    </div>
  `).join('');

  root.insertAdjacentHTML('beforeend', `
    <div class="summary-item">
      <span>Envío</span>
      <strong>${formatPrice(shipping)}</strong>
    </div>
  `);

  totalEl.textContent = formatPrice(total);
}

function getDigits(value) {
  return value.replace(/\D/g, '');
}

function isValidLuhn(value) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return value.length >= 13 && value.length <= 19 && sum % 10 === 0;
}

function validateCheckoutForm(form) {
  const values = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: getDigits(form.elements.phone.value),
    address: form.elements.address.value.trim(),
    city: form.elements.city.value.trim(),
    zip: form.elements.zip.value.trim()
  };
  const selectedPayment = form.querySelector('input[name="payment"]:checked')?.value;
  const errors = new Map();

  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,60}$/.test(values.name)) {
    errors.set(form.elements.name, 'Escribe un nombre válido de 2 a 60 letras.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    errors.set(form.elements.email, 'Escribe un email válido.');
  }
  if (values.phone.length < 7 || values.phone.length > 15) {
    errors.set(form.elements.phone, 'El teléfono debe tener entre 7 y 15 números.');
  }
  if (values.address.length < 5 || values.address.length > 120) {
    errors.set(form.elements.address, 'Escribe una dirección de entre 5 y 120 caracteres.');
  }
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{2,60}$/.test(values.city)) {
    errors.set(form.elements.city, 'Escribe una ciudad válida.');
  }
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(values.zip)) {
    errors.set(form.elements.zip, 'Escribe un código postal válido.');
  }

  form.querySelectorAll('.field-group').forEach((group) => {
    group.classList.remove('has-error');
    group.querySelector('.field-error')?.remove();
  });

  errors.forEach((message, input) => {
    const group = input.closest('.field-group');
    if (!group) return;
    group.classList.add('has-error');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    group.append(error);
  });

  const errorSummary = document.getElementById('checkout-error');
  if (errorSummary) {
    errorSummary.hidden = errors.size === 0;
    errorSummary.textContent = errors.size ? 'Revisa los campos marcados antes de continuar.' : '';
  }

  if (errors.size) {
    errors.keys().next().value?.focus();
    return false;
  }

  return true;
}

function bindProductButtons() {
  const buttons = document.querySelectorAll('[data-product]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.product);
      const productRoot = button.closest('.product-card, .product-detail-info');
      const sizeSelect = productRoot?.querySelector('[data-size-select]');
      const selectedSize = productRoot?.querySelector('.size-option.active');
      const size = selectedSize?.dataset.sizeOption || sizeSelect?.value || 'Única';
      const product = products.find((item) => item.id === productId);
      showCartNotice({
        title: '¿Confirmas tu elección?',
        message: `¿Quieres añadir ${product?.name || 'este producto'}${size ? ` · Talla ${size}` : ''} a tu carrito?`,
        confirmText: 'Sí, añadir',
        cancelText: 'No, volver',
        showLogo: false,
        onConfirm: () => {
          addProductToCart(productId, size);
          const originalText = button.textContent;
          button.textContent = 'Añadido';
          button.disabled = true;
          setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
          }, 800);
          updateCartBadge();
          showCartNotice({
            title: 'Producto añadido',
            message: `${product?.name || 'El producto'}${size ? ` · Talla ${size}` : ''} ya está en tu carrito.`,
            confirmText: 'Ver carrito',
            cancelText: 'Seguir comprando',
            showLogo: true,
            onConfirm: () => {
              window.location.href = 'cart.html';
            }
          });
        }
      });
    });
  });

  document.querySelectorAll('.size-option').forEach((option) => {
    option.addEventListener('click', () => {
      const options = option.closest('.size-options')?.querySelectorAll('.size-option') || [];
      options.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      option.classList.add('active');
      option.setAttribute('aria-pressed', 'true');
    });
  });
}

function bindFilterButtons() {
  const buttons = document.querySelectorAll('.filter-button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      renderCatalog();
    });
  });

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  searchInput?.addEventListener('input', renderCatalog);
  sortSelect?.addEventListener('change', renderCatalog);
}

function bindForms() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    document.querySelectorAll('.social-login-button').forEach((button) => {
      button.addEventListener('click', async () => {
        const provider = button.classList.contains('google-login') ? 'google' : 'facebook';
        const error = document.getElementById('login-error');
        try {
          const response = await fetch(`/api/auth/${provider}/start`);
          const responseText = await response.text();
          let result = {};
          try {
            result = responseText ? JSON.parse(responseText) : {};
          } catch {
            result = {};
          }
          if (!response.ok) throw new Error(result.error || `No se pudo iniciar sesión con ${provider}.`);
          window.location.href = result.url;
        } catch (requestError) {
          if (error) {
            error.hidden = false;
            error.textContent = requestError.message;
          }
        }
      });
    });

    let isRegisterMode = false;
    const nameField = loginForm.querySelector('.register-only');
    const nameInput = document.getElementById('login-name');
    const submitButton = document.getElementById('login-submit');
    const registerToggle = document.getElementById('register-toggle');

    registerToggle?.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      if (nameField) nameField.hidden = !isRegisterMode;
      if (nameInput) nameInput.required = isRegisterMode;
      if (submitButton) submitButton.textContent = isRegisterMode ? 'Crear mi cuenta' : 'Entrar a mi cuenta';
      if (registerToggle) registerToggle.textContent = isRegisterMode ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Crear una';
    });

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');
      const error = document.getElementById('login-error');
      const isValid = (!isRegisterMode || (nameInput?.value.trim() || '').length >= 2)
        && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email?.value.trim() || '')
        && (password?.value || '').length >= 6;

      if (!isValid) {
        if (error) {
          error.hidden = false;
          error.textContent = isRegisterMode
            ? 'Escribe tu nombre, un correo válido y una contraseña de al menos 6 caracteres.'
            : 'Escribe un correo válido y una contraseña de al menos 6 caracteres.';
        }
        return;
      }

      try {
        const response = await fetch(`/api/auth/${isRegisterMode ? 'register' : 'login'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput?.value.trim(),
            email: email.value.trim(),
            password: password.value
          })
        });
        const responseText = await response.text();
        let result = {};
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch {
          result = {};
        }
        if (!response.ok) throw new Error(result.error || 'No se pudo completar el acceso.');
        sessionStorage.setItem('nova-checkout-mode', 'account');
        window.location.href = 'checkout.html';
      } catch (requestError) {
        if (error) {
          error.hidden = false;
          error.textContent = requestError.message;
        }
      }
    });
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    const countryCodeInput = document.getElementById('country-code');
    const countryTrigger = document.getElementById('country-trigger');
    const countryMenu = document.getElementById('country-menu');
    const selectedFlag = document.getElementById('selected-country-flag');
    const selectedName = document.getElementById('selected-country-name');
    const selectedDial = document.getElementById('selected-country-dial');

    const updateCountry = (country) => {
      if (!countryCodeInput || !selectedFlag || !selectedName || !selectedDial) return;

      countryCodeInput.value = country.code;
      selectedFlag.src = `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`;
      selectedFlag.alt = `Bandera de ${country.name}`;
      selectedName.textContent = country.name;
      selectedDial.textContent = country.dial;
      countryMenu?.querySelectorAll('.country-option').forEach((option) => {
        option.setAttribute('aria-selected', String(option.dataset.country === country.code));
      });
    };

    if (countryMenu) {
      countryMenu.innerHTML = countries.map((country) => `
        <button type="button" class="country-option" role="option" data-country="${country.code}" aria-selected="${country.code === 'ES'}">
          <img src="https://flagcdn.com/w40/${country.code.toLowerCase()}.png" alt="" />
          <span>${country.name}</span>
          <strong>${country.dial}</strong>
        </button>
      `).join('');

      countryMenu.querySelectorAll('.country-option').forEach((option) => {
        option.addEventListener('click', () => {
          const country = countries.find((item) => item.code === option.dataset.country);
          if (!country) return;
          updateCountry(country);
          countryMenu.hidden = true;
          countryTrigger?.setAttribute('aria-expanded', 'false');
        });
      });
    }

    countryTrigger?.addEventListener('click', () => {
      const isOpen = countryMenu && !countryMenu.hidden;
      if (countryMenu) countryMenu.hidden = isOpen;
      countryTrigger.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', (event) => {
      if (countryMenu && countryTrigger && !countryMenu.contains(event.target) && !countryTrigger.contains(event.target)) {
        countryMenu.hidden = true;
        countryTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    const defaultCountry = countries.find((country) => country.code === 'CO');
    if (defaultCountry) {
      updateCountry(defaultCountry);
    }

    const paymentInputs = checkoutForm.querySelectorAll('input[name="payment"]');
    const cardFields = document.getElementById('card-fields');
    const cardInputs = cardFields?.querySelectorAll('input') || [];
    const cardOption = checkoutForm.querySelector('.payment-option input[value="tarjeta"]')?.closest('.payment-option');
    const selectedPaymentSummary = document.getElementById('selected-payment');
    const selectedPaymentToggle = document.getElementById('selected-payment-toggle');
    const savedCardSummary = document.getElementById('saved-card-summary');
    const changePayment = document.getElementById('change-payment');
    const cardNameInput = document.getElementById('card-name');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardPreviewName = document.getElementById('card-preview-name');
    const cardPreviewNumber = document.getElementById('card-preview-number');
    const cardPreviewExpiry = document.getElementById('card-preview-expiry');

    const updateCardPreview = () => {
      const cardName = cardNameInput?.value.trim().toUpperCase() || 'NOMBRE DEL TITULAR';
      const digits = (cardNumberInput?.value || '').replace(/\D/g, '').slice(0, 16);
      const groups = digits.match(/.{1,4}/g) || [];
      const maskedNumber = groups.map((group, index) => index < groups.length - 1 ? '••••' : group.padEnd(4, '•')).join(' ');

      if (cardPreviewName) cardPreviewName.textContent = cardName;
      if (cardPreviewNumber) cardPreviewNumber.textContent = maskedNumber || '•••• •••• •••• ••••';
      if (cardPreviewExpiry) cardPreviewExpiry.textContent = cardExpiryInput?.value || 'MM/AA';

      if (savedCardSummary) {
        const lastFour = digits.length >= 4 ? digits.slice(-4) : '----';
        const savedName = cardName || 'Titular pendiente';
        savedCardSummary.textContent = `${savedName} · •••• ${lastFour}`;
      }

      sessionStorage.setItem('nova-card-summary', JSON.stringify({
        name: cardName,
        lastFour: digits.length >= 4 ? digits.slice(-4) : '',
        expiry: cardExpiryInput?.value || ''
      }));
    };

    cardNameInput?.addEventListener('input', () => {
      cardNameInput.value = cardNameInput.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').slice(0, 60);
      updateCardPreview();
    });
    cardNumberInput?.addEventListener('input', () => {
      const digits = getDigits(cardNumberInput.value).slice(0, 16);
      cardNumberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
      updateCardPreview();
    });
    cardExpiryInput?.addEventListener('input', () => {
      const digits = getDigits(cardExpiryInput.value).slice(0, 4);
      cardExpiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      updateCardPreview();
    });
    document.getElementById('card-cvv')?.addEventListener('input', (event) => {
      event.target.value = getDigits(event.target.value).slice(0, 4);
    });
    document.getElementById('phone')?.addEventListener('input', (event) => {
      event.target.value = getDigits(event.target.value).slice(0, 15);
    });
    document.getElementById('name')?.addEventListener('input', (event) => {
      event.target.value = event.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '').slice(0, 60);
    });
    document.getElementById('zip')?.addEventListener('input', (event) => {
      event.target.value = getDigits(event.target.value).slice(0, 10);
    });
    document.getElementById('city')?.addEventListener('input', (event) => {
      event.target.value = event.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]/g, '').slice(0, 60);
    });
    updateCardPreview();

    const updatePaymentFields = () => {
      const selectedMethod = checkoutForm.querySelector('input[name="payment"]:checked')?.value;
      const isCardPayment = selectedMethod === 'tarjeta';

      if (selectedMethod) {
        sessionStorage.setItem('nova-payment-method', selectedMethod);
      }

      if (cardFields) {
        cardFields.hidden = !isCardPayment;
      }

      cardInputs.forEach((input) => {
        input.required = isCardPayment;
      });
    };

    paymentInputs.forEach((input) => {
      input.addEventListener('change', updatePaymentFields);
    });

    cardOption?.querySelector('input')?.addEventListener('click', () => {
      cardOption.classList.add('payment-hidden');
      if (selectedPaymentSummary) selectedPaymentSummary.hidden = false;
    });

    changePayment?.addEventListener('click', () => {
      if (cardOption) cardOption.classList.remove('payment-hidden');
      if (selectedPaymentSummary) selectedPaymentSummary.hidden = true;
      if (cardFields) cardFields.hidden = false;
      selectedPaymentToggle?.setAttribute('aria-expanded', 'true');
      cardOption?.querySelector('input')?.focus();
    });

    selectedPaymentToggle?.addEventListener('click', () => {
      const isExpanded = selectedPaymentToggle.getAttribute('aria-expanded') === 'true';
      const willExpand = !isExpanded;
      selectedPaymentToggle.setAttribute('aria-expanded', String(!isExpanded));
      if (cardFields) cardFields.hidden = isExpanded;
      if (cardOption) cardOption.classList.toggle('payment-hidden', !willExpand);
    });

    updatePaymentFields();

    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorSummary = document.getElementById('checkout-error');
      if (!getCart().length) {
        if (errorSummary) {
          errorSummary.hidden = false;
          errorSummary.textContent = 'Tu carrito está vacío. Añade un producto antes de pagar.';
        }
        return;
      }
      if (!validateCheckoutForm(checkoutForm)) return;
      const cartLines = getCartLines();
      const subtotal = cartLines.reduce((total, line) => total + line.product.price * line.quantity, 0);
      const total = subtotal + (subtotal > 0 ? 15 : 0);

      const orderPayload = {
        name: document.getElementById('name')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        phone: document.getElementById('phone')?.value.trim(),
        address: document.getElementById('address')?.value.trim(),
        city: document.getElementById('city')?.value.trim(),
        zip: document.getElementById('zip')?.value.trim(),
        total,
        items: cartLines.map(({ product, size, quantity }) => ({
          productId: product.id,
          name: product.name,
          size,
          quantity,
          price: product.price
        }))
      };

      try {
        const response = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || 'No se pudo iniciar el pago.');
        window.location.assign(result.url);
      } catch (error) {
        if (errorSummary) {
          errorSummary.hidden = false;
          errorSummary.textContent = error.message || 'No se pudo iniciar el pago. Inténtalo de nuevo.';
        }
      }
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    const contactMessage = document.getElementById('contact-message');
    const contactError = document.getElementById('contact-error');
    const namePattern = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g;

    contactName?.addEventListener('input', () => {
      contactName.value = contactName.value.replace(namePattern, '').slice(0, 60);
    });
    contactEmail?.addEventListener('input', () => {
      contactEmail.value = contactEmail.value.slice(0, 120);
    });
    contactMessage?.addEventListener('input', () => {
      contactMessage.value = contactMessage.value.slice(0, 500);
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = contactName?.value.trim() || '';
      const email = contactEmail?.value.trim() || '';
      const message = contactMessage?.value.trim() || '';
      const isValid = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,60}$/.test(name)
        && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
        && message.length >= 10;

      if (!isValid) {
        if (contactError) {
          contactError.hidden = false;
          contactError.textContent = 'Revisa el nombre, el email y escribe un mensaje de al menos 10 caracteres.';
        }
        return;
      }

      if (contactError) contactError.hidden = true;
      alert('Tu mensaje ha sido enviado correctamente. Te responderemos pronto.');
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('¡Gracias por suscribirte! Te enviaremos promociones exclusivas.');
      newsletterForm.reset();
    });
  }
}

function init() {
  ensureCartNotice();
  updateCartBadge();
  confirmStripeReturn();
  bindFilterButtons();
  bindForms();
  renderFeaturedProducts();
  bindProductButtons();
  renderCatalog();
  renderProductDetail();
  renderCart();
  renderCheckoutSummary();
  bindProductDetailLinks();
}

async function confirmStripeReturn() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  if (params.get('payment') !== 'success' || !sessionId) return;

  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;

  try {
    const response = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo confirmar el pago.');
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    showPaymentSuccess(checkoutForm, result.total, result.orderNumber);
    window.history.replaceState({}, document.title, 'checkout.html');
  } catch (error) {
    const errorSummary = document.getElementById('checkout-error');
    if (errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent = error.message || 'No se pudo confirmar el pago.';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
