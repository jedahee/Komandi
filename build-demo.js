'use strict';

/* Genera landing/demo/index.html: la app en un solo archivo, SIN PIN, en una
 * URL aparte de la landing (la «demo gratuita»).
 *
 * - Inyecta los datos de la tienda real de ejemplo (Golden Kebab / kebab-ali)
 *   en EMBEDDED_DATA, igual que base/build.js, pero para la demo de la landing.
 * - Elimina los links de PWA/manifest/iconos y el título pasa a «Komandi · Demo».
 * - La demo NUNCA pide PIN: con EMBEDDED_DATA la app ignora el estado del
 *   servidor (no hay secret.json ni pareados.json en un archivo estático).
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

/* --- Parches para demo: hacer que cobros/repartos funcionen en local --- */

/* 1) abrirRepartos: quitar el return 'error' de EMBEDDED_DATA y cargar desde localStorage.
   Filtra comandas hechas con envío activo (pendientes de reparto). */
js = js.replace(
  /async function abrirRepartos\(\) \{\n  if \(catActual !== '__repartos'\) return 'ok';\n  if \(EMBEDDED_DATA\) return 'error';/,
  'async function abrirRepartos() {\n  if (catActual !== \'__repartos\') return \'ok\';\n  if (EMBEDDED_DATA) {\n    repartosDatos = cargarComandasLocal().filter(function (c) { return c && c.estado === \'hecha\' && c.envio && c.envio.activo; });\n    renderRepartos();\n    return \'ok\';\n  }'
);

/* 2) abrirCobros: quitar el return 'error' de EMBEDDED_DATA y cargar desde localStorage.
   Muestra comandas no cobradas del historial. */
js = js.replace(
  /async function abrirCobros\(\) \{\n  if \(EMBEDDED_DATA\) return 'error';/,
  'async function abrirCobros() {\n  if (EMBEDDED_DATA) {\n    var todas = cargarComandasLocal();\n    var pendientes = todas.filter(function (c) { return c && !c.cobrado; });\n    cobrosDatos = { ok: true, comandas: pendientes, clientes: [], cobros: [] };\n    renderCobros();\n    return \'ok\';\n  }'
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
console.log('  Sube esta carpeta con la landing: la demo quedará en ' + path.join('landing', 'demo', '') + ' (URL aparte).');
