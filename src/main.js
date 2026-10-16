import './style.css';
import './integrations.js';

// Año automático en el footer
const currentYear = document.querySelector('#current-year');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// Menú de navegación adaptable
const menuToggle = document.querySelector('#menu-toggle');
const navLinks = document.querySelector('#nav-links');

function setMenu(open) {
  if (!menuToggle || !navLinks) return;

  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navLinks.classList.toggle('is-open', open);
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Esc cierra el menú y devuelve el foco al botón
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });
}

// Sección activa en la navegación (aria-current)
const sectionLinks = new Map();

document.querySelectorAll('#nav-links a[href^="#"]').forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) sectionLinks.set(section, link);
});

if ('IntersectionObserver' in window && sectionLinks.size) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = sectionLinks.get(entry.target);
        if (!link) return;

        if (entry.isIntersecting) {
          sectionLinks.forEach((other) => other.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sectionLinks.forEach((_, section) => spy.observe(section));
}

// Políticas legales (ventanas modales)
document.querySelectorAll('[data-legal]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const dialog = document.getElementById(`dialog-${trigger.dataset.legal}`);

    if (!dialog) return;

    event.preventDefault();

    // Si hay otra política abierta (por ejemplo, desde un enlace interno), se cierra primero
    document.querySelectorAll('dialog.legal[open]').forEach((openDialog) => {
      if (openDialog !== dialog) openDialog.close();
    });

    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('legal-open');

    const body = dialog.querySelector('.legal-body');
    if (body) body.scrollTop = 0;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'legal_open',
      legal_document: trigger.dataset.legal,
    });
  });
});

document.querySelectorAll('dialog.legal').forEach((dialog) => {
  // Botón de cerrar
  dialog.querySelector('[data-legal-close]')?.addEventListener('click', () => {
    dialog.close();
  });

  // Al cerrar la última ventana se reactiva el scroll y las animaciones de fondo
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog.legal[open]')) {
      document.documentElement.classList.remove('legal-open');
    }
  });

  // Clic fuera de la ventana (en el fondo oscuro)
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

// Medición de clics en llamadas a la acción
document.querySelectorAll('[data-cta]').forEach((button) => {
  button.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: 'cta_click',
      cta_name: button.dataset.cta,
      cta_text: button.textContent.trim(),
      page_location: window.location.href,
    });
  });
});

// Medición del inicio de interacción con el formulario
const leadForm = document.querySelector('#lead-form');
let formStarted = false;

if (leadForm) {
  leadForm.addEventListener('input', () => {
    if (formStarted) return;

    formStarted = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'lead_form_start',
      form_id: 'lead-form',
    });
  });

  leadForm.addEventListener('submit', (event) => {
    // Evitamos enviar datos a un destino inexistente.
    // HubSpot se conectará en la siguiente etapa.
    event.preventDefault();

    const message = document.querySelector('#form-message');

    if (message) {
      message.textContent =
        'El formulario todavía está en configuración. Pronto podrás enviar tus datos.';
    }
  });
}

// Medición de preguntas frecuentes
document.querySelectorAll('#faq details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'faq_interaction',
      faq_question: item.querySelector('summary')?.textContent.trim() ?? '',
    });
  });
});