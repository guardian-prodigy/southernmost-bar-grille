import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'index.html','menu/index.html','order/index.html','events/index.html','private-events/index.html','visit/index.html','loyalty/index.html','staff/index.html','admin/index.html','admin/qr-kit.html',
  'platform.css','data.js','platform-store.js','platform.js','three-scenes-pro.js','sw.js','manifest.webmanifest','robots.txt','sitemap.xml',
  'assets/southernmost-wordmark.webp','assets/og-southernmost.jpg','assets/menu-board-complete.jpg','assets/qr-table-12.png','assets/qr-patio-07.png','assets/qr-bar-03.png','assets/qr-lounge-04.png',
  'qr/table-12.html','qr/patio-07.html','qr/bar-03.html','qr/lounge-04.html',
  'legal/terms.html','legal/privacy.html','legal/allergens.html','legal/refunds.html','legal/accessibility.html','docs/PRODUCTION_BACKEND.md','docs/PLATFORM_SCOPE.md'
];
const html = ['index.html','menu/index.html','order/index.html','events/index.html','private-events/index.html','visit/index.html','loyalty/index.html','staff/index.html','admin/index.html','admin/qr-kit.html','404.html',...fs.readdirSync(path.join(root,'legal')).filter(name=>name.endsWith('.html')).map(name=>`legal/${name}`)];
const errors=[];
for (const file of required) { const full=path.join(root,file); if(!fs.existsSync(full)||fs.statSync(full).size===0) errors.push(`Missing or empty ${file}`); }
for (const file of html) {
  const text=fs.readFileSync(path.join(root,file),'utf8');
  if(!text.includes('<meta name="viewport"')) errors.push(`${file}: missing viewport`);
  if(!text.includes('<title>')) errors.push(`${file}: missing title`);
  if(/>[^<]*\bdemo(?:nstration)?\b[^<]*</i.test(text)) errors.push(`${file}: prohibited public wording`);
  if(text.includes('atob(')) errors.push(`${file}: base64 loader found`);
  for(const match of text.matchAll(/(?:src|href)="([^"#]+)"/g)){
    const ref=match[1]; if(/^(?:https?:|mailto:|tel:|data:)/.test(ref)) continue;
    const clean=ref.split('?')[0]; const resolved=path.resolve(path.dirname(path.join(root,file)),clean);
    if(clean.endsWith('/') ? !fs.existsSync(path.join(resolved,'index.html')) : !fs.existsSync(resolved)) errors.push(`${file}: broken reference ${ref}`);
  }
}
for(const file of ['platform-store.js','platform.js','three-scenes-pro.js','data.js','sw.js']){
  const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
  if(result.status!==0) errors.push(`${file}: ${(result.stderr||result.stdout).trim()}`);
}
const source=fs.readFileSync(path.join(root,'data.js'),'utf8'); const sandbox={window:{}}; vm.createContext(sandbox); try{vm.runInContext(source,sandbox)}catch(error){errors.push(`data.js runtime: ${error.message}`)}
const data=sandbox.window.SOUTHERNMOST; const itemCount=data?.menu?.reduce((sum,category)=>sum+category.items.length,0)||0;
if(itemCount<50) errors.push(`Expected at least 50 menu entries, found ${itemCount}`);
const platform=fs.readFileSync(path.join(root,'platform.js'),'utf8');
for(const token of ['renderHome','renderMenuPage','renderOrderPage','renderEventsPage','renderPrivateEvents','renderVisit','renderLoyalty','renderStaff','renderAdmin','guideReply','checkoutModal']) if(!platform.includes(token)) errors.push(`platform.js missing ${token}`);
const store=fs.readFileSync(path.join(root,'platform-store.js'),'utf8');
for(const token of ['openSession','verifyGuest','authorizeTab','submitRound','requestService','splitByMember','recordPayment','joinWaitlist','setAvailability','updateTicket']) if(!store.includes(token)) errors.push(`platform-store.js missing ${token}`);
const css=fs.readFileSync(path.join(root,'platform.css'),'utf8');
for(const token of ['.mobile-dock','.menu-grid','.book-zone','.order-layout','.dashboard-grid','.layer.open','@media(max-width:640px)']) if(!css.includes(token)) errors.push(`platform.css missing ${token}`);
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
if(!sw.includes('southernmost-v18-20260727b')) errors.push('Service worker release mismatch');
for(const route of ['./menu/','./order/','./events/','./private-events/','./visit/','./loyalty/','./staff/','./admin/','./qr/lounge-04.html']) if(!sw.includes(route)) errors.push(`Service worker missing ${route}`);
for(const file of ['index.html','menu/index.html','order/index.html','events/index.html','private-events/index.html','visit/index.html','loyalty/index.html','staff/index.html','admin/index.html']) if(!fs.readFileSync(path.join(root,file),'utf8').includes('data-release="20260727b"')) errors.push(`${file}: stale release marker`);
if(errors.length){console.error(errors.map(error=>`✗ ${error}`).join('\n'));process.exit(1)}
console.log(`✓ ${required.length} required production files present`);
console.log(`✓ ${html.length} public, legal and operational pages validated`);
console.log(`✓ ${data.menu.length} menu categories and ${itemCount} menu entries loaded`);
console.log('✓ ordering, group tabs, service, checkout, events, loyalty, staff and admin features present');
console.log('✓ JavaScript syntax, route references, QR assets and PWA release validated');
