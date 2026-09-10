(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * CONFIGURACIÓN — cámbialo todo aquí y se actualiza en toda la web
   *
   * Configuración de la landing: email, RRSS y datos de contacto.
   * ------------------------------------------------------------------ */
  var SITIO = {
    nombre: 'Komandi',
    email: 'komandiapp@gmail.com',
    rrss: {
      instagram: 'https://www.instagram.com/komandiapp'
    },
    horario: '10:00 a 20:00',    // ← horario de soporte y atención
    url: 'https://jedahee.github.io/Komandi-Landing/', // ← URL final de la landing (para el QR del folleto)
    demo: 'demo/index.html',     // ← Generado por build-demo.js: app completa en un solo archivo, SIN PIN
    mensaje: 'Hola, he probado la demo de Komandi y quiero montarla en mi negocio.',
    planes: {
      mensual: {
        nombre: 'Mensual',
        mensaje: 'Hola, quiero el plan Mensual de Komandi (14,99 €/mes). ¿Me montáis la carta?'
      },
      anual: {
        nombre: 'Anual',
        mensaje: 'Hola, quiero el plan Anual de Komandi (149,99 €/año, 12 meses al precio de 10). ¿Me montáis la carta?'
      }
    },
    dev: {
      precioHora: '30',                 // ← €/hora de desarrollo a medida
      mensaje: 'Hola, necesito un desarrollo a medida y quiero que me hagáis presupuesto.'
    }
  };

  document.querySelectorAll('[data-email]').forEach(function (a) {
    a.href = 'mailto:' + SITIO.email +
      '?subject=' + encodeURIComponent(SITIO.mensaje) +
      '&body=' + encodeURIComponent(SITIO.mensaje);
  });

  document.querySelectorAll('[data-plan]').forEach(function (a) {
    var plan = SITIO.planes[a.getAttribute('data-plan')];
    if (!plan) return;
    a.href = 'mailto:' + SITIO.email +
      '?subject=' + encodeURIComponent(plan.nombre + ' - Komandi') +
      '&body=' + encodeURIComponent(plan.mensaje);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  function ponerDevEnlaces(mensaje) {
    document.querySelectorAll('[data-dev-email]').forEach(function (a) {
      a.href = 'mailto:' + SITIO.email +
        '?subject=' + encodeURIComponent('Presupuesto de desarrollo a medida') +
        '&body=' + encodeURIComponent(mensaje);
    });
  }
  ponerDevEnlaces(SITIO.dev.mensaje);

  document.querySelectorAll('[data-demo]').forEach(function (a) {
    a.href = SITIO.demo;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  document.querySelectorAll('[data-rrss]').forEach(function (a) {
    var red = a.getAttribute('data-rrss');
    if (SITIO.rrss[red]) a.href = SITIO.rrss[red];
    a.target = '_blank';
    a.rel = 'noopener';
  });

  document.querySelectorAll('[data-horario]').forEach(function (el) {
    el.textContent = SITIO.horario;
  });

  document.querySelectorAll('[data-email-txt]').forEach(function (el) {
    el.textContent = SITIO.email;
  });

  /* Calculadora de presupuesto a medida: suma horas, las multiplica por el
   * precio/hora interno y muestra solo el resultado aproximado. */
  var tarifa = parseInt(SITIO.dev.precioHora, 10) || 30;
  var calcTotal = document.querySelector('[data-calc-total]');
  if (calcTotal) {
    var calcResultado = calcTotal.closest('.calc-resultado');
    function opcionesMarcadas() {
      var opciones = [];
      document.querySelectorAll('[data-calc-horas]').forEach(function (cb) {
        if (cb.checked) {
          var label = cb.closest('.calc-op');
          var txt = label ? label.querySelector('span') : null;
          if (txt) opciones.push(txt.textContent.trim());
        }
      });
      return opciones;
    }
    function mensajeDev() {
      var opciones = opcionesMarcadas();
      var horas = 0;
      document.querySelectorAll('[data-calc-horas]').forEach(function (cb) {
        if (cb.checked) horas += parseInt(cb.getAttribute('data-calc-horas'), 10) || 0;
      });
      if (horas === 0) return SITIO.dev.mensaje;
      var total = horas * tarifa;
      var txt = total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return 'Hola, quiero un desarrollo a medida que incluya: ' + opciones.join(', ') +
        '. Presupuesto aproximado: ~' + txt + ' €. ¿Lo hablamos?'
    }
    function actualizarCalc() {
      var horas = 0;
      document.querySelectorAll('[data-calc-horas]').forEach(function (cb) {
        if (cb.checked) horas += parseInt(cb.getAttribute('data-calc-horas'), 10) || 0;
      });
      if (horas > 0) {
        var total = horas * tarifa;
        var txt = total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        calcTotal.textContent = '~' + txt + ' €';
        calcResultado.classList.add('activo');
      } else {
        calcResultado.classList.remove('activo');
      }
      ponerDevEnlaces(mensajeDev());
    }
    document.querySelectorAll('[data-calc-horas]').forEach(function (cb) {
      cb.addEventListener('change', actualizarCalc);
    });
    actualizarCalc();
  }

  document.querySelectorAll('#nombre-marca, #nombre-pie, [data-nombre]').forEach(function (el) {
    el.textContent = SITIO.nombre;
  });

  var pieUrl = document.getElementById('pie-url');
  if (pieUrl) pieUrl.textContent = SITIO.url;

  document.getElementById('anio') && (document.getElementById('anio').textContent = String(new Date().getFullYear()));

  /* Aparición de componentes al hacer scroll */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealados = [];
  document.querySelectorAll('.reveal-grupo').forEach(function (grupo) {
    Array.prototype.forEach.call(grupo.children, function (hijo, i) {
      if (hijo.classList.contains('reveal')) {
        hijo.style.transitionDelay = Math.min(i, 3) * 90 + 'ms';
      }
    });
  });
  document.querySelectorAll('.reveal').forEach(function (el) { revealados.push(el); });
  if ('IntersectionObserver' in window && !(reduce && reduce.matches)) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (ent) {
        if (ent.isIntersecting) {
          ent.target.classList.add('reveal-on');
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: .15 });
    revealados.forEach(function (el) { obs.observe(el); });
  } else {
    revealados.forEach(function (el) { el.classList.add('reveal-on'); });
  }

  /* CTA flotante: aparece tras bajar un poco */
  var sticky = document.getElementById('cta-sticky');
  if (sticky) {
    var umbral = 500;
    function onScroll() {
      sticky.classList.toggle('visible', window.scrollY > umbral);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* PWA: registro del service worker para instalación y offline */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }

  /* FAQ: animación de apertura/cierre en ambos sentidos (max-height vía JS,
   * funciona también en navegadores y WebViews antiguos) */
  document.querySelectorAll('#faq details').forEach(function (d) {
    var c = d.querySelector('.faq-cuerpo');
    if (!c) return;
    c.style.maxHeight = d.open ? 'none' : '0px';
    d.addEventListener('toggle', function () {
      if (d.open) {
        c.style.maxHeight = c.scrollHeight + 'px';
        var fin = function () {
          c.style.maxHeight = 'none';
          c.removeEventListener('transitionend', fin);
        };
        c.addEventListener('transitionend', fin);
      } else {
        c.style.maxHeight = c.scrollHeight + 'px';
        void c.offsetHeight;
        c.style.maxHeight = '0px';
      }
    });
  });
})();
