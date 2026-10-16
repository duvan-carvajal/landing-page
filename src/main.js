
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

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    navLinks.classList.toggle('is-open', !isExpanded);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    });
  });
}

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
