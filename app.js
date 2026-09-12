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

  /* Galería: carrusel con Swiper (3 capturas en PC, 1 en móvil) */
  var galeriaEl = document.querySelector('[data-galeria]');
  if (window.Swiper && galeriaEl) {
    var galeriaWrap = galeriaEl.parentElement;
    var reduceMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    new Swiper(galeriaEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 450,
      loop: true,
      grabCursor: true,
      keyboard: { enabled: true },
      pagination: { el: galeriaWrap.querySelector('.swiper-pagination'), clickable: true },
      navigation: {
        nextEl: galeriaWrap.querySelector('.galeria-next'),
        prevEl: galeriaWrap.querySelector('.galeria-prev')
      },
      autoplay: reduceMov && reduceMov.matches
        ? false
        : { delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: {
        760: { slidesPerView: 3, spaceBetween: 24 }
      }
    });
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

  /* Comparativa: deslizar la tabla. El ratón arrastra con el cursor (para que
   * siga al puntero), y el dedo usa el scroll nativo del contenedor, que es
   * fluido y con inercia. */
  if (window.PointerEvent) {
    document.querySelectorAll('.tabla-envoltura').forEach(function (ec) {
      var arrastrando = false;
      var moved = false;
      var inicioX = 0;
      var inicioY = 0;
      var inicioScroll = 0;
      ec.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;          /* el táctil es nativo */
        if (e.target.closest('a, button, input')) return;
        arrastrando = true;
        moved = false;
        inicioX = e.clientX;
        inicioY = e.clientY;
        inicioScroll = ec.scrollLeft;
        ec.classList.add('deslizando');
      });
      ec.addEventListener('pointermove', function (e) {
        if (!arrastrando || e.pointerType !== 'mouse') return;
        var dx = e.clientX - inicioX;
        var dy = e.clientY - inicioY;
        if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        if (Math.abs(dx) < Math.abs(dy)) return;        /* gesto vertical: nativo */
        moved = true;
        ec.scrollLeft = inicioScroll - dx;
      });
      function soltarDesliz() {
        arrastrando = false;
        ec.classList.remove('deslizando');
      }
      ec.addEventListener('pointerup', soltarDesliz);
      ec.addEventListener('pointercancel', soltarDesliz);
      ec.addEventListener('pointerleave', soltarDesliz);
      ec.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
  }

  /* Aviso "Desliza": solo se muestra cuando la tabla realmente desborda y,
   * al estar fuera del contenedor con scroll, queda siempre a la vista por
   * mucho que se deslice la tabla. */
  document.querySelectorAll('.tabla-envoltura').forEach(function (ec) {
    var aviso = ec.nextElementSibling;
    if (!aviso || !aviso.classList.contains('tabla-desliza')) return;
    function comprobarDesliza() {
      ec.classList.toggle('con-scroll', ec.scrollWidth > ec.clientWidth + 1);
    }
    comprobarDesliza();
    window.addEventListener('resize', comprobarDesliza);
    window.addEventListener('orientationchange', comprobarDesliza);
  });

  /* FAQ: animación de apertura/cierre en ambos sentidos y en CADA ciclo.
   * No se usan transiciones CSS de max-height dentro de <details>: en los
   * navegadores modernos la animación nativa del elemento las corta a mitad
   * (el pliegue se quedaba a medias y el resto de ciclos saltaba). Se anima a
   * mano con requestAnimationFrame fijando valores explícitos en px. */
  var FAQ_DUR = 300;
  var faqRaF = 0;
  var tResize = 0;

  function faqDetener(c) {
    if (faqRaF) { cancelAnimationFrame(faqRaF); faqRaF = 0; }
  }

  function faqAjustar(c) {
    c.style.maxHeight = c.scrollHeight + 'px';
    void c.offsetHeight;
  }

  function faqAnimar(c, destino) {
    faqDetener(c);
    var scH = c.scrollHeight;                 /* altura natural del contenido */
    var desde = Math.max(0, Math.min(scH, c.getBoundingClientRect().height));
    var hasta = destino ? scH : 0;
    c.style.maxHeight = desde + 'px';
    void c.offsetHeight;
    var inicio = performance.now();
    function paso(now) {
      var k = Math.min(1, (now - inicio) / FAQ_DUR);
      var ease = 1 - Math.pow(1 - k, 3);      /* easeOutCubic */
      var v = desde + (hasta - desde) * ease;
      c.style.maxHeight = (Math.round(v * 100) / 100) + 'px';
      faqRaF = k < 1 ? requestAnimationFrame(paso) : 0;
    }
    faqRaF = requestAnimationFrame(paso);
  }

  function faqReajustar() {
    faqDetener(null);
    document.querySelectorAll('#faq details[open]').forEach(function (od) {
      var oc = od.querySelector('.faq-cuerpo');
      if (oc) faqAjustar(oc);
    });
  }

  document.querySelectorAll('#faq details').forEach(function (d) {
    var c = d.querySelector('.faq-cuerpo');
    if (!c) return;
    c.style.transition = 'none';
    c.style.maxHeight = d.open ? 'none' : '0px';
    d.addEventListener('toggle', function () { faqAnimar(c, d.open); });
  });

  /* Si la ventana cambia de tamaño y el texto se repliega, las preguntas
     abiertas se reajustan a su nueva altura sin cortarse. */
  window.addEventListener('resize', function () {
    clearTimeout(tResize);
    tResize = setTimeout(faqReajustar, 150);
  });
})();
