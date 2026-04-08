/**
 * ============================================================
 * NovaByte Studio — Script Principal
 * Archivo: script.js
 * ============================================================
 * Módulos implementados:
 *   1. Header con efecto scroll
 *   2. Menú hamburguesa móvil
 *   3. Animaciones de entrada con IntersectionObserver
 *   4. Filtro dinámico del portafolio
 *   5. Animación de contadores en estadísticas
 *   6. Validación completa del formulario de contacto
 *   7. Contador de caracteres en textarea
 *   8. Botón "volver arriba"
 *   9. Smooth scroll mejorado
 *  10. Accesibilidad: manejo de foco y teclado
 * ============================================================
 * Buenas prácticas aplicadas:
 *   - Uso de const/let (no var)
 *   - Funciones nombradas y modulares
 *   - Delegación de eventos donde corresponde
 *   - Manejo de errores con try/catch
 *   - Comentarios explicativos en secciones clave
 *   - Código limpio y legible
 * ============================================================
 */

'use strict';

/* ============================================================
   UTILIDADES GENERALES
   ============================================================ */

/**
 * Selecciona un elemento del DOM. Lanza advertencia si no existe.
 * @param {string} selector - Selector CSS
 * @param {Element} [parent=document] - Contexto de búsqueda
 * @returns {Element|null}
 */
const $ = (selector, parent = document) => {
  const el = parent.querySelector(selector);
  if (!el) console.warn(`[NovaByte] Elemento no encontrado: "${selector}"`);
  return el;
};

/**
 * Selecciona múltiples elementos del DOM.
 * @param {string} selector - Selector CSS
 * @param {Element} [parent=document] - Contexto de búsqueda
 * @returns {NodeList}
 */
const $$ = (selector, parent = document) => parent.querySelectorAll(selector);


/* ============================================================
   1. HEADER — Efecto al hacer scroll
   Añade la clase 'scrolled' al header cuando el usuario baja
   más de 50px para activar el fondo con blur.
   ============================================================ */

/**
 * Inicializa el efecto de scroll en el header.
 * Usa requestAnimationFrame para optimizar el rendimiento.
 */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  let ticking = false;  // Bandera para throttle con rAF

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Añade/quita la clase 'scrolled' según posición de scroll
        header.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();  // Estado inicial
}


/* ============================================================
   2. MENÚ HAMBURGUESA MÓVIL
   Controla la apertura/cierre del menú en pantallas pequeñas.
   Gestiona accesibilidad: aria-expanded, foco y tecla Escape.
   ============================================================ */

/**
 * Inicializa el menú hamburguesa para dispositivos móviles.
 */
function initMobileMenu() {
  const toggleBtn = $('#navToggle');
  const nav       = $('#mainNav');
  const navLinks  = $$('.nav-link', nav);

  if (!toggleBtn || !nav) return;

  /**
   * Abre o cierra el menú de navegación móvil.
   * @param {boolean} open - true para abrir, false para cerrar
   */
  const toggleMenu = (open) => {
    nav.classList.toggle('open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));

    // Bloquea el scroll del body cuando el menú está abierto
    document.body.style.overflow = open ? 'hidden' : '';

    // Si se abre, enfoca el primer enlace de navegación
    if (open) {
      const firstLink = nav.querySelector('.nav-link');
      if (firstLink) setTimeout(() => firstLink.focus(), 100);
    }
  };

  // Evento: botón hamburguesa
  toggleBtn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Evento: cierre al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Evento: cierre con tecla Escape (accesibilidad)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggleMenu(false);
      toggleBtn.focus();  // Devuelve el foco al botón
    }
  });
}


/* ============================================================
   3. ANIMACIONES DE ENTRADA (REVEAL)
   Usa IntersectionObserver para detectar cuándo un elemento
   entra en el viewport y añade la clase 'visible' para
   activar la animación CSS definida en styles.css.
   ============================================================ */

/**
 * Inicializa las animaciones de entrada con IntersectionObserver.
 * Más eficiente que escuchar el evento 'scroll'.
 */
function initRevealAnimations() {
  const revealElements = $$('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Desconecta el observer tras la animación (evita re-trigger)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // El elemento debe ser 12% visible
      rootMargin: '0px 0px -40px 0px'  // Margen para activar un poco antes
    }
  );

  revealElements.forEach(el => observer.observe(el));
}


/* ============================================================
   4. FILTRO DINÁMICO DEL PORTAFOLIO
   Implementación de filtrado de proyectos por categoría.
   Al hacer clic en un botón de filtro, se muestran/ocultan
   las tarjetas de proyectos según su atributo data-category.
   ============================================================ */

/**
 * Inicializa el sistema de filtrado del portafolio.
 * Maneja accesibilidad: aria-pressed para los botones de filtro.
 */
function initPortfolioFilter() {
  const filterBtns    = $$('.filter-btn');
  const portfolioGrid = $('#portfolioGrid');

  if (!filterBtns.length || !portfolioGrid) return;

  const cards = $$('.portfolio-card', portfolioGrid);

  /**
   * Aplica el filtro seleccionado.
   * @param {string} filter - Categoría a mostrar ('todos' muestra todo)
   */
  const applyFilter = (filter) => {
    cards.forEach(card => {
      const category = card.getAttribute('data-category');

      if (filter === 'todos' || category === filter) {
        // Mostrar tarjeta con animación suave
        card.classList.remove('hidden');
        card.style.animation = 'none';

        // Forzar reflow para reiniciar la animación CSS
        void card.offsetWidth;
        card.style.animation = '';
      } else {
        // Ocultar tarjeta
        card.classList.add('hidden');
      }
    });

    // Anunciar el cambio a lectores de pantalla
    const visibleCount = portfolioGrid.querySelectorAll('.portfolio-card:not(.hidden)').length;
    portfolioGrid.setAttribute('aria-label', `Proyectos — ${visibleCount} resultado${visibleCount !== 1 ? 's' : ''}`);
  };

  // Asignar evento a cada botón de filtro
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Actualizar estado activo de los botones
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Aplicar el filtro seleccionado
      applyFilter(filter);
    });
  });
}


/* ============================================================
   5. ANIMACIÓN DE CONTADORES
   Anima los números de las estadísticas del Hero desde 0
   hasta su valor objetivo (data-target) cuando entran en pantalla.
   ============================================================ */

/**
 * Anima un elemento de contador desde 0 hasta su valor objetivo.
 * @param {Element} element  - Elemento span con el número
 * @param {number}  target   - Número objetivo
 * @param {number}  duration - Duración en milisegundos
 */
function animateCounter(element, target, duration = 2000) {
  const startTime  = performance.now();
  const startValue = 0;

  /**
   * Función de easing: desaceleración al final (ease-out cubic)
   * @param {number} t - Progreso normalizado [0..1]
   */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const update = (currentTime) => {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const currentValue  = Math.round(startValue + (target - startValue) * easedProgress);

    element.textContent = currentValue.toLocaleString('es-CL');

    if (progress < 1) {
      requestAnimationFrame(update);  // Continúa la animación
    }
  };

  requestAnimationFrame(update);
}

/**
 * Inicializa los contadores con IntersectionObserver.
 * Cada contador se activa solo cuando entra en el viewport.
 */
function initCounters() {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-target'), 10);
          if (!isNaN(target)) {
            animateCounter(entry.target, target);
          }
          observer.unobserve(entry.target);  // Se anima solo una vez
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}


/* ============================================================
   6. VALIDACIÓN COMPLETA DEL FORMULARIO DE CONTACTO
   Sistema de validación con:
   - Validación al enviar (submit)
   - Validación en tiempo real al salir del campo (blur)
   - Mensajes de error específicos por tipo de error
   - Retroalimentación visual (clases CSS: error/success)
   - Simulación de envío con estado de carga
   ============================================================ */

/**
 * Objeto que centraliza las reglas de validación del formulario.
 * Cada clave es el name del campo y su valor es una función
 * que retorna un string con el error o null si es válido.
 */
const VALIDATION_RULES = {
  /**
   * Valida el campo nombre: mínimo 2 palabras, solo letras y espacios.
   */
  nombre: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Por favor, ingresa tu nombre completo.';
    if (trimmed.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmed)) {
      return 'El nombre solo puede contener letras y espacios.';
    }
    return null;  // Sin errores
  },

  /**
   * Valida el correo electrónico con expresión regular estándar.
   */
  email: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Por favor, ingresa tu correo electrónico.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).';
    }
    return null;
  },

  /**
   * Valida que se haya seleccionado un servicio.
   */
  servicio: (value) => {
    if (!value) return 'Por favor, selecciona el servicio de tu interés.';
    return null;
  },

  /**
   * Valida el mensaje: mínimo 20 caracteres, máximo 500.
   */
  mensaje: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Por favor, describe tu proyecto o consulta.';
    if (trimmed.length < 20) {
      return `El mensaje es demasiado corto. Mínimo 20 caracteres (tienes ${trimmed.length}).`;
    }
    if (trimmed.length > 500) {
      return `El mensaje supera los 500 caracteres. Reduce a ${trimmed.length - 500} caracteres más.`;
    }
    return null;
  },

  /**
   * Valida que el checkbox de términos esté marcado.
   */
  terminos: (checked) => {
    if (!checked) return 'Debes aceptar la política de privacidad para continuar.';
    return null;
  }
};

/**
 * Muestra un mensaje de error en el campo correspondiente
 * y aplica los estilos visuales de error.
 * @param {Element} input     - Campo de formulario
 * @param {string}  errorMsg  - Mensaje de error a mostrar
 * @param {string}  fieldName - Nombre del campo (para aria-describedby)
 */
function showFieldError(input, errorMsg, fieldName) {
  const errorEl = $(`#${fieldName}-error`);
  input.classList.add('error');
  input.classList.remove('success');
  input.setAttribute('aria-invalid', 'true');
  if (errorEl) errorEl.textContent = errorMsg;
}

/**
 * Limpia el estado de error de un campo y muestra estado de éxito.
 * @param {Element} input     - Campo de formulario
 * @param {string}  fieldName - Nombre del campo
 */
function clearFieldError(input, fieldName) {
  const errorEl = $(`#${fieldName}-error`);
  input.classList.remove('error');
  input.classList.add('success');
  input.setAttribute('aria-invalid', 'false');
  if (errorEl) errorEl.textContent = '';
}

/**
 * Valida un campo individual y actualiza su estado visual.
 * @param {Element} input - Campo a validar
 * @returns {boolean} true si es válido, false si tiene errores
 */
function validateField(input) {
  const name  = input.name;
  const rule  = VALIDATION_RULES[name];

  // Si no hay regla definida para este campo, se considera válido
  if (!rule) return true;

  // Obtener el valor según el tipo de campo
  const value = input.type === 'checkbox' ? input.checked : input.value;
  const error = rule(value);

  if (error) {
    showFieldError(input, error, name);
    return false;
  } else {
    clearFieldError(input, name);
    return true;
  }
}

/**
 * Simula el envío del formulario con un delay de 1.5 segundos.
 * En producción, aquí se haría el fetch/XMLHttpRequest al servidor.
 * @returns {Promise<boolean>} Resuelve a true (éxito simulado)
 */
function simulateFormSubmit() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1500);
  });
}

/**
 * Inicializa el formulario de contacto con todas sus validaciones.
 */
function initContactForm() {
  const form      = $('#contactForm');
  const submitBtn = $('#submitBtn');
  const successEl = $('#formSuccess');

  if (!form || !submitBtn) return;

  // ---- Validación en tiempo real al salir de cada campo (blur) ----
  const inputs = $$('[name]', form);
  inputs.forEach(input => {
    // Validar al salir del campo
    input.addEventListener('blur', () => {
      input.dataset.touched = 'true';
      validateField(input);
    });

    // Revalidar mientras el usuario corrige el campo después de haberlo tocado
    if (input.type !== 'checkbox') {
      input.addEventListener('input', () => {
        if (input.dataset.touched === 'true' || input.classList.contains('error')) {
          validateField(input);
        }
      });
    }

    // Para checkboxes y selects, validar inmediatamente al cambiar
    if (input.type === 'checkbox' || input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        input.dataset.touched = 'true';
        validateField(input);
      });
    }
  });

  // ---- Manejo del envío del formulario ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Evitar el envío HTML nativo

    // Validar todos los campos antes de proceder
    const fieldsToValidate = $$('[name]', form);
    let isFormValid = true;
    let firstErrorField = null;

    fieldsToValidate.forEach(input => {
      // Solo validar campos con regla definida
      if (VALIDATION_RULES[input.name]) {
        const isValid = validateField(input);
        if (!isValid && !firstErrorField) {
          firstErrorField = input;  // Guardar el primer campo con error
        }
        if (!isValid) isFormValid = false;
      }
    });

    // Si hay errores, enfocar el primer campo inválido y detener
    if (!isFormValid) {
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // ---- Formulario válido: simular envío ----
    try {
      // Mostrar estado de carga
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

      // Simular petición al servidor
      await simulateFormSubmit();

      // Éxito: ocultar formulario y mostrar mensaje de confirmación
      form.querySelectorAll('.form-group, .form-row').forEach(group => {
        group.style.display = 'none';
      });
      submitBtn.style.display = 'none';

      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

    } catch (error) {
      // Error inesperado: mostrar mensaje genérico
      console.error('[NovaByte] Error al enviar el formulario:', error);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Enviar mensaje';

      // Mostrar un mensaje de error genérico al usuario
      const genericError = document.createElement('p');
      genericError.style.cssText = 'color: var(--color-accent-2); font-size: 0.875rem; text-align: center; margin-top: 1rem;';
      genericError.textContent = 'Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.';
      form.appendChild(genericError);
    }
  });
}


/* ============================================================
   7. CONTADOR DE CARACTERES EN TEXTAREA
   Actualiza en tiempo real el contador de caracteres del campo
   de mensaje y aplica estilo de advertencia al acercarse al límite.
   ============================================================ */

/**
 * Inicializa el contador de caracteres del textarea de mensaje.
 */
function initCharCounter() {
  const textarea = $('#mensaje');
  const counter  = $('#charCounter');

  if (!textarea || !counter) return;

  const MAX_CHARS = 500;
  const WARN_AT   = 400;

  const updateCounter = () => {
    const length = textarea.value.length;
    counter.textContent = `${length} / ${MAX_CHARS} caracteres`;

    if (length >= MAX_CHARS) {
      counter.style.color = 'var(--color-accent-2)';
    } else if (length >= WARN_AT) {
      counter.style.color = '#f59e0b';
    } else {
      counter.style.color = 'var(--color-text-faint)';
    }
  };

  textarea.addEventListener('input', updateCounter);
  updateCounter();  // Estado inicial
}


/* ============================================================
   8. BOTÓN "VOLVER ARRIBA"
   Muestra/oculta el botón cuando el usuario baja más de 400px.
   Al hacer clic, desplaza suavemente al inicio de la página.
   ============================================================ */

/**
 * Inicializa el botón de "volver arriba".
 */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  // Mostrar/ocultar según posición del scroll
  const toggleVisibility = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  // Scroll suave al inicio al hacer clic
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   9. SMOOTH SCROLL MEJORADO
   Intercepta los clics en enlaces internos (#ancla) y aplica
   smooth scroll teniendo en cuenta el alto del header fijo.
   ============================================================ */

/**
 * Inicializa el smooth scroll personalizado.
 */
function initSmoothScroll() {
  const HEADER_OFFSET = 80;  // px de margen sobre el destino

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href   = link.getAttribute('href');
    if (href === '#') return;  // Evitar scroll al clic en "#"

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const targetTop  = target.getBoundingClientRect().top + window.scrollY;
    const scrollTo   = Math.max(0, targetTop - HEADER_OFFSET);

    window.scrollTo({ top: scrollTo, behavior: 'smooth' });

    // Actualizar la URL sin saltar (mejora UX y SEO)
    history.pushState(null, '', href);

    // Gestión de foco para accesibilidad
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}


/* ============================================================
   10. ACCESIBILIDAD — FOCO EN TARJETAS
   Permite navegar por las tarjetas del portafolio con el teclado
   usando Enter/Espacio para activar el overlay de información.
   ============================================================ */

/**
 * Mejora la accesibilidad de las tarjetas del portafolio.
 */
function initCardAccessibility() {
  const cards = $$('.portfolio-card[tabindex="0"]');

  cards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      // Simula hover al presionar Enter o Espacio
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const overlay = card.querySelector('.portfolio-overlay');
        if (overlay) {
          overlay.style.opacity = overlay.style.opacity === '1' ? '0' : '1';
        }
      }
    });
  });
}


/* ============================================================
   INICIALIZACIÓN PRINCIPAL
   Se ejecuta cuando el DOM está completamente cargado.
   Inicializa todos los módulos en el orden correcto.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  try {
    initHeader();            // 1. Efecto scroll en header
    initMobileMenu();        // 2. Menú hamburguesa móvil
    initRevealAnimations();  // 3. Animaciones de entrada
    initPortfolioFilter();   // 4. Filtro del portafolio
    initCounters();          // 5. Contadores animados
    initContactForm();       // 6. Validación del formulario
    initCharCounter();       // 7. Contador de caracteres
    initBackToTop();         // 8. Botón volver arriba
    initSmoothScroll();      // 9. Smooth scroll
    initCardAccessibility(); // 10. Accesibilidad en tarjetas

    console.log('%c✓ NovaByte Studio — Todos los módulos iniciados correctamente.',
      'color: #6c63ff; font-weight: bold;');
  } catch (error) {
    console.error('[NovaByte] Error durante la inicialización:', error);
  }
});
