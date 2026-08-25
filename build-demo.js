'use strict';

/* Genera landing/demo/index.html: la app en un solo archivo, SIN PIN, en una
 * URL aparte de la landing (la «demo gratuita»).
 *
 * - Inyecta los datos de la tienda real de ejemplo (Golden Kebab / kebab-ali)
 *   en EMBEDDED_DATA, igual que base/build.js, pero para la demo de la landing.
 * - Elimina los links de PWA/manifest/iconos y el título pasa a «Komandi · Demo».
 * - La demo NUNCA pide PIN: con EMBEDDED_DATA la app ignora el estado del
 *   servidor (no hay secret.json ni pareados.json en un archivo estático).
 * - Mock completo de fetch para /api/* que usa localStorage, de modo que
 *   COMANDAS, CLIENTES, COBROS y CIERRES persisten entre sesiones.
 * - Es la app de verdad con un menú de ejemplo: se puede probar siempre que se
 *   quiera, en móvil, tablet o PC.
 *
 * Uso: node build-demo.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'base');
const DATOS_EJEMPLO = path.join(ROOT, '..', 'kebab-cantillana', 'kebab-ali', 'datos', 'productos.json');
const SALIDA = path.join(__dirname, 'demo', 'index.html');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
let js = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const raw = JSON.parse(fs.readFileSync(DATOS_EJEMPLO, 'utf8'));

/* Sanitizar datos sensibles para la demo pública */
const datos = JSON.parse(JSON.stringify(raw));
if (datos.config) {
  if (datos.config.email) {
    datos.config.email.desde = 'demo@komandi.es';
    datos.config.email.usuario = '';
    datos.config.email.clave = '';
    datos.config.email.claveGuardada = false;
    datos.config.email.inseguro = false;
  }
  if (datos.config.cif) datos.config.cif = '';
  if (datos.config.direccion) datos.config.direccion = 'Calle de ejemplo, 123';
  if (datos.config.usuarios) {
    datos.config.usuarios = [
      { nombre: 'Admin', historial: true, cobros: true },
      { nombre: 'Ana', historial: true, cobros: true },
      { nombre: 'Carlos', historial: true, cobros: false }
    ];
  }
}

const json = JSON.stringify(datos);
const literal = json.replace(/<\//g, '<\\/');
js = js.replace('const EMBEDDED_DATA = null;', 'const EMBEDDED_DATA = ' + literal + ';');

/* ======================================================================
   MOCK COMPLETO DE FETCH PARA LA DEMO (solo cuando EMBEDDED_DATA)
   Intercepta todas las llamadas /api/* y las resuelve con localStorage.
   NO se inyecta en tiendas reales: solo se añade al JS de la demo.
   ====================================================================== */

const DEMO_FETCH_MOCK = `
/* --- Mock fetch para demo: todas las /api/* se resuelven con localStorage --- */
if (typeof EMBEDDED_DATA !== 'undefined' && EMBEDDED_DATA) {
  (function () {
    var _fetch = window.fetch;
    var CL = 'komandi_comandas';
    var CC = 'komandi_clientes';
    var CO = 'komandi_cobros';
    var CI = 'komandi_cierres';
    var NK = 'komandi_num';

    function ls(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
    function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

    function mockResp(data) {
      return {
        ok: true,
        status: 200,
        json: function () { return Promise.resolve(data); }
      };
    }

    function mockErr(code, msg) {
      return {
        ok: false,
        status: code,
        json: function () { return Promise.resolve({ error: msg }); }
      };
    }

    function parseBody(body) {
      if (!body) return {};
      if (typeof body === 'string') { try { return JSON.parse(body); } catch (e) { return {}; } }
      return body;
    }

    function nextId() { return Date.now() + '-' + Math.floor(Math.random() * 1000); }
    function nextNum() { return (ls(NK, 0) || 0) + 1; }

    /* --- Route handler: devuelve {data, statusCode} --- */
    function route(method, url, body) {
      var u = url.split('?')[0];
      var b = parseBody(body);

      /* POST /api/comanda — crear comanda */
      if (u === '/api/comanda' && method === 'POST') {
        var com = b.comanda || b;
        var num = nextNum();
        var nc = Object.assign({
          id: nextId(), num: num, hora: new Date().toISOString(), estado: 'pendiente'
        }, com);
        var lista = ls(CL, []);
        lista.push(nc);
        ss(CL, lista);
        ss(NK, num);
        return { data: { ok: true, id: nc.id, num: nc.num }, code: 200 };
      }

      /* GET /api/comandas — listar comandas */
      if (u === '/api/comandas' && method === 'GET') {
        return { data: { comandas: ls(CL, []) }, code: 200 };
      }

      /* POST /api/comanda/:id/haciendo — toggle hacer/hacer */
      var mHac = u.match(/^\\/api\\/comanda\\/([^/]+)\\/haciendo$/);
      if (mHac && method === 'POST') {
        var lista = ls(CL, []);
        var idx = -1;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === mHac[1]) { idx = i; break; } }
        if (idx >= 0) {
          var c = lista[idx];
          var esHac = c.estado !== 'haciendo';
          c.estado = esHac ? 'haciendo' : 'pendiente';
          if (esHac) { var coc = (b.cocinero || '').toString().trim(); if (coc) c.cocinero = coc; }
          else { delete c.cocinero; }
          ss(CL, lista);
          return { data: { ok: true, estado: c.estado }, code: 200 };
        }
        return { data: { ok: false, estado: null }, code: 200 };
      }

      /* POST /api/comanda/:id/hecha — marcar hecha */
      var mHec = u.match(/^\\/api\\/comanda\\/([^/]+)\\/hecha$/);
      if (mHec && method === 'POST') {
        var lista = ls(CL, []);
        var idx = -1;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === mHec[1]) { idx = i; break; } }
        if (idx >= 0) {
          var c = lista[idx];
          c.estado = 'hecha';
          c.horaHecha = new Date().toISOString();
          var coc = (b.cocinero || '').toString().trim();
          if (coc) c.cocinero = coc;
          ss(CL, lista);
          return { data: { ok: true }, code: 200 };
        }
        return { data: { ok: false }, code: 200 };
      }

      /* POST /api/comanda/:id — editar comanda */
      var mEd = u.match(/^\\/api\\/comanda\\/([^/]+)$/);
      if (mEd && method === 'POST') {
        var lista = ls(CL, []);
        var idx = -1;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === mEd[1]) { idx = i; break; } }
        if (idx < 0) return { data: { ok: false, error: 'no_encontrada' }, code: 404 };
        var c = lista[idx];
        if (typeof b.para === 'string') c.para = b.para.trim();
        if (b.tipo === 'comer' || b.tipo === 'llevar') c.tipo = b.tipo;
        if (Array.isArray(b.items)) c.items = b.items;
        if (typeof b.total === 'number') c.total = Math.round(b.total * 100) / 100;
        if (typeof b.clienteId === 'string') c.clienteId = b.clienteId.trim() || null;
        if (typeof b.clienteNombre === 'string') c.clienteNombre = b.clienteNombre.trim();
        if (typeof b.nota === 'string') c.nota = b.nota.trim();
        if (b.envio !== undefined) {
          if (b.envio && typeof b.envio === 'object') c.envio = b.envio;
          else delete c.envio;
        }
        ss(CL, lista);
        return { data: { ok: true }, code: 200 };
      }

      /* DELETE /api/comanda/:id — borrar comanda */
      if (method === 'DELETE') {
        var mDel = u.match(/^\\/api\\/comanda\\/([^/]+)$/);
        if (mDel) {
          var lista = ls(CL, []);
          var antes = lista.length;
          lista = lista.filter(function (x) { return x.id !== mDel[1]; });
          ss(CL, lista);
          return { data: { ok: lista.length !== antes }, code: 200 };
        }
      }

      /* GET /api/clientes — listar clientes */
      if (u === '/api/clientes' && method === 'GET') {
        var cli = ls(CC, []);
        return { data: { ok: true, clientes: cli.map(function (c) { return { id: c.id, nombre: c.nombre, telefono: c.telefono || '', email: c.email || '' }; }) }, code: 200 };
      }

      /* POST /api/clientes/guardar — guardar cliente */
      if (u === '/api/clientes/guardar' && method === 'POST') {
        var cliData = (b.cliente || {});
        var nombre = (cliData.nombre || '').toString().trim().slice(0, 40);
        if (!nombre) return { data: { error: 'nombre_obligatorio' }, code: 400 };
        var telefono = (cliData.telefono || '').toString().trim().slice(0, 20);
        var email = (cliData.email || '').toString().trim().slice(0, 80).toLowerCase();
        var lista = ls(CC, []);
        var obj = null;
        if (cliData.id) {
          for (var i = 0; i < lista.length; i++) { if (lista[i].id === cliData.id) { obj = lista[i]; break; } }
        }
        if (!obj) {
          for (var i = 0; i < lista.length; i++) { if (lista[i].nombre === nombre) { obj = lista[i]; break; } }
        }
        if (obj) {
          obj.nombre = nombre;
          obj.telefono = telefono;
          obj.email = email;
        } else {
          obj = { id: 'cli-' + Date.now() + '-' + Math.floor(Math.random() * 1000), nombre: nombre, telefono: telefono, email: email, creado: new Date().toISOString() };
          lista.push(obj);
        }
        ss(CC, lista);
        return { data: { ok: true, cliente: obj }, code: 200 };
      }

      /* POST /api/clientes/borrar — borrar cliente */
      if (u === '/api/clientes/borrar' && method === 'POST') {
        var id = (b.id || '').toString().trim();
        var lista = ls(CC, []);
        var antes = lista.length;
        lista = lista.filter(function (x) { return x.id !== id; });
        ss(CC, lista);
        return { data: { ok: lista.length !== antes }, code: 200 };
      }

      /* POST /api/cobros/panel — panel de cobros */
      if (u === '/api/cobros/panel' && method === 'POST') {
        var todas = ls(CL, []);
        var pendientes = todas.filter(function (c) { return !c.cobrado; })
          .sort(function (a, b) { return (a.estado === 'hecha' ? 0 : 1) - (b.estado === 'hecha' ? 0 : 1) || (a.num || 0) - (b.num || 0); });
        return { data: { ok: true, comandas: pendientes, clientes: ls(CC, []), cobros: ls(CO, []) }, code: 200 };
      }

      /* POST /api/cobrar — cobrar una comanda */
      if (u === '/api/cobrar' && method === 'POST') {
        var lista = ls(CL, []);
        var cobros = ls(CO, []);
        var cId = (b.comandaId || '').toString().trim();
        var idx = -1;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === cId) { idx = i; break; } }
        if (idx < 0) return { data: { error: 'comanda_no_encontrada' }, code: 404 };
        var c = lista[idx];
        if (c.cobrado) return { data: { error: 'ya_cobrada' }, code: 400 };
        var metodo = (b.metodo || 'efectivo').toString().trim().slice(0, 20) || 'efectivo';
        var pagos = (Array.isArray(b.pagos) && b.pagos.length) ? b.pagos : [{ nombre: 'Conjunto', monto: Number(c.total) || 0 }];
        var hora = new Date().toISOString();
        var clienteId = (b.clienteId || c.clienteId || '').toString().trim() || null;
        c.cobrado = true;
        c.metodo = metodo;
        c.cobradoHora = hora;
        c.pagos = pagos.map(function (p) {
          return { nombre: (p.nombre || 'Conjunto').toString().slice(0, 40), monto: Math.round((Number(p.monto) || 0) * 100) / 100, clienteId: p.clienteId ? String(p.clienteId).trim() : clienteId };
        });
        if (clienteId) c.clienteId = clienteId;
        for (var pi = 0; pi < c.pagos.length; pi++) {
          var p = c.pagos[pi];
          cobros.push({ id: 'pago-' + Date.now() + '-' + pi, comandaId: c.id, clienteId: p.clienteId || null, nombre: p.nombre, monto: p.monto, metodo: metodo, hora: hora, cajero: (b.cajero || '').toString().slice(0, 40) });
        }
        ss(CL, lista);
        ss(CO, cobros);
        return { data: { ok: true }, code: 200 };
      }

      /* GET /api/repartos/panel — panel de repartos */
      if (u === '/api/repartos/panel' && method === 'GET') {
        var lista = ls(CL, []);
        var rep = lista
          .filter(function (c) { return c.envio && (c.envio.direccion || '').trim() && c.estado === 'hecha'; })
          .map(function (c) {
            return {
              id: c.id, num: c.num || 0, hora: c.hora || '', estado: c.estado || 'pendiente',
              cobrado: !!c.cobrado, metodo: c.metodo || '', total: c.total || 0, para: c.para || '',
              envio: c.envio || null,
              items: (c.items || []).map(function (it) { return { nombre: it.nombre, qty: it.qty || 1, sub: it.sub || 0, mods: (it.mods || []).map(function (m) { return { n: m.n, p: m.p }; }) }; }),
              cliente: null, clienteNombre: c.clienteNombre || '',
              entregado: !!c.entregado, horaEntrega: c.horaEntrega || ''
            };
          })
          .sort(function (a, b) { return (a.entregado ? 1 : 0) - (b.entregado ? 1 : 0) || (a.num || 0) - (b.num || 0); });
        return { data: { ok: true, repartos: rep }, code: 200 };
      }

      /* POST /api/repartos/entregar — marcar entregado */
      if (u === '/api/repartos/entregar' && method === 'POST') {
        var lista = ls(CL, []);
        var id = (b.id || '').toString().trim();
        var entregado = b.entregado !== false;
        var idx = -1;
        for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { idx = i; break; } }
        if (idx < 0) return { data: { ok: false, error: 'comanda_no_encontrada' }, code: 404 };
        lista[idx].entregado = !!entregado;
        if (entregado) lista[idx].horaEntrega = new Date().toISOString();
        else delete lista[idx].horaEntrega;
        ss(CL, lista);
        return { data: { ok: true, entregado: lista[idx].entregado }, code: 200 };
      }

      /* POST /api/historial — historial y cierres */
      if (u === '/api/historial' && method === 'POST') {
        var todas = ls(CL, []);
        /* Construir historial agrupado por día */
        var dias = {};
        for (var i = 0; i < todas.length; i++) {
          var c = todas[i];
          var f = c.hora ? new Date(c.hora) : new Date();
          var clave = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
          if (!dias[clave]) dias[clave] = { fecha: clave, total: 0, numComandas: 0, comandas: [], productos: {} };
          var d = dias[clave];
          d.total += c.total || 0;
          d.numComandas++;
          d.comandas.push(c);
          for (var j = 0; j < (c.items || []).length; j++) {
            var it = c.items[j];
            var n = it.nombre || '?';
            if (!d.productos[n]) d.productos[n] = { nombre: n, qty: 0, total: 0 };
            d.productos[n].qty += it.qty || 0;
            d.productos[n].total += it.sub || 0;
          }
        }
        var hist = [];
        for (var k in dias) {
          if (!dias.hasOwnProperty(k)) continue;
          var d = dias[k];
          d.total = Math.round(d.total * 100) / 100;
          var prods = [];
          for (var pn in d.productos) { if (d.productos.hasOwnProperty(pn)) prods.push(d.productos[pn]); }
          d.productos = prods.sort(function (a, b) { return b.total - a.total; });
          d.comandas.sort(function (a, b) { return (a.num || 0) - (b.num || 0); });
          hist.push(d);
        }
        hist.sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; });
        return { data: { ok: true, historial: hist, cierres: ls(CI, []) }, code: 200 };
      }

      /* POST /api/cierres — guardar cierre de día */
      if (u === '/api/cierres' && method === 'POST') {
        if (b.accion === 'guardar' && b.cierre) {
          var cierres = ls(CI, []);
          var existe = -1;
          for (var i = 0; i < cierres.length; i++) { if (cierres[i].fecha === b.cierre.fecha) { existe = i; break; } }
          if (existe >= 0) cierres[existe] = b.cierre;
          else cierres.push(b.cierre);
          ss(CI, cierres);
          return { data: { ok: true, cierres: cierres }, code: 200 };
        }
        return { data: { cierres: ls(CI, []) }, code: 200 };
      }

      /* POST /api/productos — guardar productos (no-op en demo) */
      if (u === '/api/productos' && method === 'POST') {
        return { data: { ok: true }, code: 200 };
      }

      /* POST /api/recordar — recordar PIN (no-op en demo) */
      if (u === '/api/recordar' && method === 'POST') {
        return { data: { ok: true, token: '', hasta: '', dias: 0 }, code: 200 };
      }

      /* POST /api/parear — parear dispositivo (no-op en demo) */
      if (u === '/api/parear' && method === 'POST') {
        return { data: { ok: true, token: '', hasta: '', dias: 0 }, code: 200 };
      }

      /* GET /api/estado — estado del servidor */
      if (u === '/api/estado' && method === 'GET') {
        return { data: { estado: 'ok', pin: false }, code: 200 };
      }

      /* POST /api/geo — geocoding (devolver vacío) */
      if (u.indexOf('/api/geo') === 0 && method === 'GET') {
        return { data: { features: [] }, code: 200 };
      }

      /* POST /api/enviar-email — no-op en demo */
      if (u === '/api/enviar-email' && method === 'POST') {
        return { data: { ok: true, demo: true }, code: 200 };
      }

      /* POST /api/cierres (sin accion) — fallback */
      if (u === '/api/cierres' && method === 'POST') {
        return { data: { cierres: ls(CI, []) }, code: 200 };
      }

      /* Cualquier otra /api/*: devolver ok vacío */
      return { data: { ok: true }, code: 200 };
    }

    /* Interceptar window.fetch */
    window.fetch = function (url, opts) {
      var method = (opts && opts.method) ? opts.method.toUpperCase() : 'GET';
      var u = typeof url === 'string' ? url : (url.url || '');
      if (u.indexOf('/api/') !== 0) return _fetch.call(window, url, opts);
      var body = (opts && opts.body) || null;
      var result = route(method, u, body);
      return Promise.resolve(mockResp(result.data));
    };
  })();
}
`;

/* Inyectar el mock justo después de EMBEDDED_DATA */
js = js.replace(
  /^(const EMBEDDED_DATA = [^;]+;)/m,
  '$1\n' + DEMO_FETCH_MOCK
);

/* --- Parches para demo: eliminar return 'error' de EMBEDDED_DATA --- */

/* 1) abrirRepartos: el mock ya resuelve /api/repartos/panel, pero el guard
   early-return sigue bloqueando. Quitar el return 'error'. */
js = js.replace(
  /async function abrirRepartos\(\) \{\n  if \(catActual !== '__repartos'\) return 'ok';\n  if \(EMBEDDED_DATA\) return 'error';/,
  'async function abrirRepartos() {\n  if (catActual !== \'__repartos\') return \'ok\';\n  if (EMBEDDED_DATA) { /* mock fetch se encarga */ }'
);

/* 2) abrirCobros: el mock ya resuelve /api/cobros/panel, pero el guard
   early-return sigue bloqueando. Quitar el return 'error'. */
js = js.replace(
  /async function abrirCobros\(\) \{\n  if \(EMBEDDED_DATA\) return 'error';/,
  'async function abrirCobros() {\n  if (EMBEDDED_DATA) { /* mock fetch se encarga */ }'
);

/* 3) Mostrar selector de clientes en demo: quitar el oculto del selector-cliente */
js = js.replace(
  'if (EMBEDDED_DATA) {\n' +
  '    /* En el archivo único (demo) no hay servidor: el selector de clientes y la\n' +
  '       pestaña Cobros quedan desactivados. */\n' +
  '    const sel = $(\'#selector-cliente\');\n' +
  '    if (sel) sel.classList.add(\'oculto\');\n' +
  '  } else {\n' +
  '    cargarClientesLigeros();\n' +
  '    vaciarCola();\n' +
  '  }',
  'if (EMBEDDED_DATA) {\n' +
  '    /* En la demo el selector de clientes sí se muestra + clientes desde localStorage. */\n' +
  '    cargarClientesLigeros();\n' +
  '  } else {\n' +
  '    cargarClientesLigeros();\n' +
  '    vaciarCola();\n' +
  '  }'
);

/* 4) guardarCierreEnServidor: el guard early-return devuelve 'local'. Quitarlo
   para que el mock fetch resuelva. */
js = js.replace(
  /async function guardarCierreEnServidor\(cierre\) \{\n  if \(EMBEDDED_DATA\) return 'local';/,
  'async function guardarCierreEnServidor(cierre) {\n  if (EMBEDDED_DATA) return \'ok\';'
);

/* 5) abrirEstadisticas: el guard de EMBEDDED_DATA fuerza historialDesdeLocal.
   Con el mock, la llamada /api/historial sí responde, así que quitamos el
   bloque EMBEDDED_DATA que salta directo a historialDesdeLocal. */
js = js.replace(
  /async function abrirEstadisticas\(\) \{\n  let historial = null;\n  let cierres = null;\n  const estado = await pedirEstado\(\);\n  if \(estado\) \{\n    if \(estado\.pin && paginaProtegidaUsuario\('historial'\)\) \{\n      const d = await accederConPinVerificacion\(\n        '\/api\/historial',/,
  'async function abrirEstadisticas() {\n  let historial = null;\n  let cierres = null;\n  const estado = await pedirEstado();\n  if (estado) {\n    if (EMBEDDED_DATA || (estado.pin && paginaProtegidaUsuario(\'historial\'))) {\n      const d = await accederConPinVerificacion(\n        \'/api/historial\','
);

/* 6) Nunca pedir PIN en demo: pedirPin y pedirPinVerificacion resuelven null */
js = js.replace(
  /function pedirPin\(\) \{\n  return new Promise\(\(resolve\) => \{/,
  'function pedirPin() {\n  if (EMBEDDED_DATA) return Promise.resolve(null);\n  return new Promise((resolve) => {'
);
js = js.replace(
  /function pedirPinVerificacion\(endpoint, titulo, sub, accion, datos\) \{\n  return new Promise\(\(resolve\) => \{/,
  'function pedirPinVerificacion(endpoint, titulo, sub, accion, datos) {\n  if (EMBEDDED_DATA) return Promise.resolve(null);\n  return new Promise((resolve) => {'
);

const salida = html
  .replace(/<link rel="manifest"[^>]*>\n/g, '')
  .replace(/<link rel="icon"[^>]*>\n/g, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n/g, '')
  .replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
  .replace('<title>Komandi · Cuentas</title>', '<title>Komandi · Demo</title>')
  .replace('<script src="app.js"></script>', function () { return '<script>\n' + js + '\n</script>'; });

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, salida);

console.log('✓ Generado: ' + SALIDA);
console.log('  Tamaño: ' + (salida.length / 1024).toFixed(1) + ' KB');
console.log('  Demo SIN PIN: con datos incrustados la app nunca pide el código.');
console.log('  Mock fetch: todas las /api/* se resuelven con localStorage.');
console.log('  Sube esta carpeta con la landing: la demo quedará en ' + path.join('landing', 'demo', '') + ' (URL aparte).');
