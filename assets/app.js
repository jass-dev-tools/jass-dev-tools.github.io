(() => {
'use strict';
const $ = s => document.querySelector(s);
const nodes = CV.nodes;
const byId = new Map(nodes.map(n => [n.id, n]));
let lang = 'es', theme = 'dark', graphFilter = 'all';
try { lang = localStorage.getItem('cv-lang') === 'en' ? 'en' : 'es'; theme = localStorage.getItem('cv-theme') === 'light' ? 'light' : 'dark'; } catch {}
const t = v => Array.isArray(v) ? v[lang === 'es' ? 0 : 1] : v;
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy = {
 search:['Buscar en mi trayectoria','Search my journey'],location:['Barcelona, España','Barcelona, Spain'],vault:['Mi trayectoria','My journey'],pdf:['Descargar CV','Download CV'],footer:['Conectar ideas. Construir productos. Hacer crecer equipos.','Connecting ideas. Building products. Growing teams.'],static:['100% estático','100% static'],searchMove:['moverse','move'],searchOpen:['abrir','open'],searchClose:['cerrar','close'],home:['Visión general','Overview'],graph:['Mapa de conexiones','Connection map'],experience:['Experiencia','Experience'],project:['Proyectos','Projects'],skill:['Conocimientos','Knowledge'],education:['Formación e idiomas','Education & languages'],all:['Todos','All'],connected:['Notas relacionadas','Related notes'],backlinks:['Enlaces hacia esta nota','Links to this note'],explore:['Explorar conexiones','Explore connections'],read:['Abrir nota','Open note'],back:['Volver al inicio','Back to overview'],contact:['Hablemos','Get in touch'],notes:['notas','notes'],connections:['conexiones','connections']
};
const c = k => t(copy[k] || [k,k]);
const icon = type => ({experience:'◷',project:'◇',skill:'✧'}[type] || '◈');
const link = (id, cls = '') => { const n = byId.get(id); return n ? `<a class="note-link ${n.type} ${cls}" href="#${n.id}"><span>${icon(n.type)}</span>${esc(t(n.title))}<span class="link-arrow">↗</span></a>` : ''; };
const tagLinks = n => n.links.filter(id => byId.get(id)?.type === 'skill').map(id => `<a class="tag" href="#${id}">${esc(t(byId.get(id).title))}</a>`).join('');
function current() { try { return decodeURIComponent(location.hash.slice(1)) || 'inicio'; } catch { return 'inicio'; } }
function persist(k,v) { try { localStorage.setItem(k,v); } catch {} }
function applyChrome() {
 document.documentElement.lang = lang; document.documentElement.dataset.theme = theme;
 document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = c(el.dataset.i18n); });
 $('#language').textContent = lang === 'es' ? 'EN' : 'ES';
 $('#language').setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
 $('#theme').textContent = theme === 'dark' ? '☼' : '☾';
 $('#theme').setAttribute('aria-label', t(['Cambiar a tema '+(theme==='dark'?'claro':'oscuro'),'Switch to '+(theme==='dark'?'light':'dark')+' theme']));
 $('#download').href = `downloads/Jose-Antonio-Sanchez-CV-${lang.toUpperCase()}.pdf`;
 $('#search-title').textContent = t(['Buscar en el CV','Search the CV']);
 $('#search-input').placeholder = t(['Prueba: arquitectura, Scytl, Temporal…','Try: architecture, Scytl, Temporal…']);
 $('#search-close').setAttribute('aria-label',t(['Cerrar búsqueda','Close search']));
 $('#menu-toggle').setAttribute('aria-label',t(['Alternar navegación','Toggle navigation']));
 $('#sidebar').setAttribute('aria-label',t(['Explorador del CV','CV explorer']));
 $('.skip').textContent = t(['Saltar al contenido','Skip to content']);
 renderExplorer();
}
function renderExplorer() {
 const id = current();
 const nav = (route,label,symbol) => `<a href="#${route}" class="nav-link ${id === route ? 'active' : ''}" ${id === route ? 'aria-current="page"' : ''}><span>${symbol}</span>${label}</a>`;
 $('#explorer').innerHTML = `<div class="primary-nav">${nav('inicio',c('home'),'⌂')}${nav('mapa',c('graph'),'⠿')}</div>` + ['experience','project','skill'].map(type => `<details ${type !== 'skill' || byId.get(id)?.type === 'skill' ? 'open' : ''}><summary>${c(type)}<span>${nodes.filter(n=>n.type===type).length}</span></summary><div class="tree">${nodes.filter(n=>n.type===type).map(n=>nav(n.id,esc(t(n.title)),icon(type))).join('')}</div></details>`).join('') + `<div class="extra-nav">${nav('formacion',c('education'),'▤')}</div>`;
}
const edges = [];
const edgeKeys = new Set();
nodes.forEach(n => n.links.forEach(id => { const key=[n.id,id].sort().join(':'); if(byId.has(id) && !edgeKeys.has(key)) {edges.push([n.id,id]);edgeKeys.add(key);} }));
function graphMarkup(compact=false, focused=null) {
 let list = nodes.filter(n => graphFilter === 'all' || n.type === graphFilter);
 if (compact) list = ['bondy','scytl-director','strategying','bondy-platform','semantic-search','orion','privacy-broker','urnextstep','leadership','architecture','ai','bpm','cloud','quality'].map(id=>byId.get(id));
 const positions = new Map();
 const clusters={experience:{x:207,y:160}, project:{x:568,y:180},skill:{x:390,y:380}};
 ['experience','project','skill'].forEach(type=> {
  const group=list.filter(n=>n.type===type);
  group.forEach((n,i)=>{ const angle=(i/group.length)*Math.PI*2 - Math.PI/2; const r=compact ? 76 : (type==='skill'?124:112); const cluster=clusters[type]; positions.set(n.id,{x:cluster.x+Math.cos(angle)*r,y:cluster.y+Math.sin(angle)*r*.63}); });
 });
 if (compact) {
  const points = {'bondy':[190,145],'scytl-director':[105,245],'strategying':[270,75],'bondy-platform':[475,95],'semantic-search':[645,175],'orion':[565,290],'privacy-broker':[385,225],'urnextstep':[650,385],'leadership':[155,370],'architecture':[315,325],'ai':[455,405],'bpm':[310,445],'cloud':[565,465],'quality':[95,465]};
  Object.entries(points).forEach(([id,[x,y]]) => positions.set(id,{x,y}));
 }
 const selected = focused || 'bondy';
 let markup=`<svg class="knowledge-graph" viewBox="${compact ? '25 35 710 475' : '0 0 800 550'}" role="group" aria-label="${c('graph')}"><defs><radialGradient id="graph-glow${compact?'mini':''}"><stop stop-color="#a99af5" stop-opacity=".1"/><stop offset="1" stop-color="#a99af5" stop-opacity="0"/></radialGradient></defs><circle cx="400" cy="275" r="260" fill="url(#graph-glow${compact?'mini':''})"/>`;
 edges.forEach(([a,b])=>{if(!positions.has(a)||!positions.has(b))return;const p=positions.get(a),q=positions.get(b);markup+=`<line class="graph-edge ${a===selected||b===selected?'highlight':''}" data-from="${a}" data-to="${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;});
 list.forEach(n=>{const p=positions.get(n.id),label=t(n.title).replace('Scytl · ','Scytl / '); const shortLabels = {'bondy':'Bondy','scytl-director':'Scytl','strategying':'Strategying','bondy-platform':'People & Tickets','semantic-search':t(['Búsqueda semántica','Semantic search']),'leadership':t(['Liderazgo','Leadership']),'architecture':t(['Arquitectura','Architecture']),'ai':t(['IA aplicada','Applied AI']),'bpm':'BPM','cloud':'Cloud','quality':t(['Calidad','Quality'])}; const displayLabel = compact ? (shortLabels[n.id] || label) : label;markup+=`<a href="#${n.id}" class="graph-node ${n.type} ${n.id===selected?'selected':''}" data-node="${n.id}" aria-label="${esc(label)}"><title>${esc(label)} · ${esc(t(n.subtitle))}</title><circle class="node-halo" cx="${p.x}" cy="${p.y}" r="13"/><circle cx="${p.x}" cy="${p.y}" r="${n.id===selected?7:5}"/><text x="${p.x}" y="${p.y+23}" text-anchor="middle">${esc(displayLabel.length>29?displayLabel.slice(0,27)+'…':displayLabel)}</text></a>`;});
 return markup+'</svg>';
}
function legend() { return `<div class="legend">${['experience','project','skill'].map(type=>`<span class="${type}"><i></i>${c(type)}</span>`).join('')}</div>`; }
function card(n) { return `<a href="#${n.id}" class="note-card ${n.type}"><div class="card-top"><span>${icon(n.type)} ${esc(t(n.subtitle))}</span><span>↗</span></div><h3>${esc(t(n.title))}</h3><p>${esc(t(n.summary))}</p>${n.status?`<span class="state">${esc(t(n.status))}</span>`:''}</a>`; }
function renderHome() {
 return `<div class="home page-content"><div class="eyebrow"><span class="status-dot"></span>${t(['UN CV, MUCHAS CONEXIONES','ONE CV, MANY CONNECTIONS'])}<span class="edition">VOL. 2026</span></div><div class="intro-grid"><section class="intro"><div class="small-label">CTO / ENGINEERING LEADERSHIP</div><h1>José Antonio<br>Sánchez<span class="accent">.</span></h1><p class="hero-line">${t(['Tecnología con visión.<br>Ingeniería con criterio.','Technology with vision.<br>Engineering with judgment.'])}</p><p class="hero-description">${t(['Lidero equipos y construyo productos. Conecto estrategia, arquitectura y desarrollo, con la IA como parte de mi práctica de ingeniería.','I lead teams and build products. I connect strategy, architecture and development, with AI as part of my engineering practice.'])}</p><div class="hero-actions"><a class="primary-button" href="#bondy">${t(['Explorar mi trayectoria','Explore my journey'])} <span>↗</span></a><a class="quiet-link" href="mailto:darthplaguesi@gmail.com">${c('contact')} ↗</a></div></section><section class="graph-preview" aria-label="${c('graph')}"><div class="panel-top"><span>⠿ ${c('graph')}</span><a href="#mapa" aria-label="${c('explore')}">⤢</a></div><div class="mini-graph">${graphMarkup(true)}</div>${legend()}<a href="#mapa" class="graph-caption">${t(['Cada punto, una historia. Explora cómo se conectan.','Every node tells a story. Explore the connections.'])} <span>↗</span></a></section></div>
 <section class="metrics" aria-label="${t(['Trayectoria en cifras','Career in numbers'])}"><div><strong>25<span>+</span></strong><span>${t(['años en software','years in software'])}</span></div><div><strong>10<span>+</span></strong><span>${t(['años en liderazgo','years in leadership'])}</span></div><div><strong>40<span>+</span></strong><span>${t(['ingenieros dirigidos','engineers led'])}</span></div><div class="metric-note">${t(['De escribir código<br>a hacer crecer equipos.<br><b>Sin perder el contacto con el producto.</b>','From writing code<br>to growing teams.<br><b>Staying close to the product.</b>'])}</div></section>
 <section class="explore-section"><div class="section-heading"><div><span class="small-label">01 / ${t(['EXPLORAR','EXPLORE'])}</span><h2>${t(['Tres formas de conocer mi trabajo','Three ways to explore my work'])}</h2></div><span class="muted">${nodes.length} ${c('notes')} · ${edges.length} ${c('connections')}</span></div><div class="path-grid">${[['experience','◷',t(['La trayectoria','The journey']),t(['Puestos, responsabilidades y equipos. Desde el desarrollo hasta la dirección tecnológica.','Roles, responsibilities and teams. From development to technology leadership.'])],['project','◇',t(['Lo que construyo','What I build']),t(['Productos, integraciones y prototipos que llevan las ideas a la práctica.','Products, integrations and prototypes that put ideas into practice.'])],['skill','✧',t(['Cómo trabajo','How I work']),t(['Arquitectura, liderazgo, IA y las tecnologías que conectan mi experiencia.','Architecture, leadership, AI and the technologies connecting my experience.'])]].map(([type,symbol,title,desc])=>`<a href="#${type}" class="path-card ${type}"><span class="path-icon">${symbol}</span><span class="path-count">${String(nodes.filter(n=>n.type===type).length).padStart(2,'0')} ${c('notes')}</span><h3>${title}</h3><p>${desc}</p><span class="path-arrow">↗</span></a>`).join('')}</div></section>
 <section><div class="section-heading"><div><span class="small-label">02 / ${t(['EN FOCO','IN FOCUS'])}</span><h2>${t(['Ahora y en construcción','Current work & explorations'])}</h2></div><a class="quiet-link" href="#project">${t(['Todos los proyectos','All projects'])} ↗</a></div><div class="featured-grid">${['bondy-platform','privacy-broker','urnextstep'].map(id=>card(byId.get(id))).join('')}</div></section><div class="contact-strip"><div><span class="small-label">${t(['SIGAMOS LA CONVERSACIÓN','LET’S CONTINUE THE CONVERSATION'])}</span><h2>${t(['Las buenas ideas empiezan conectando.','Good ideas start with a connection.'])}</h2></div><a href="mailto:darthplaguesi@gmail.com">Email ↗</a><a href="https://www.linkedin.com/in/jasanchez1976/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/jass-dev-tools" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div>`;
}
function renderCollection(type) {
 return `<div class="page-content collection"><div class="eyebrow">${icon(type)} ${t(['EXPLORADOR DE TRAYECTORIA','CAREER EXPLORER'])}</div><h1>${c(type)}<span class="accent">.</span></h1><p class="page-lead">${t({experience:['De la ingeniería a la dirección de equipos. Cada etapa conecta con proyectos y conocimientos.','From engineering to team leadership. Every chapter connects to projects and knowledge.'],project:['Una selección de productos y herramientas. Cada ficha indica su alcance y estado.','A selection of products and tools. Each note describes its scope and status.'],skill:['Conocimientos con contexto: explora dónde y cómo los he aplicado.','Knowledge in context: explore where and how I have applied it.']}[type])}</p><div class="${type==='experience'?'timeline':'collection-grid'}">${nodes.filter(n=>n.type===type).map(n=>card(n)).join('')}</div></div>`;
}
function renderNote(n) {
 const incoming=nodes.filter(other=>other.links.includes(n.id));
 return `<div class="page-content note-page"><div class="note-layout"><article class="note-article"><div class="eyebrow ${n.type}">${icon(n.type)} <a href="#${n.type}">${c(n.type)}</a>${n.status?`<span class="state">${esc(t(n.status))}</span>`:''}</div><h1>${esc(t(n.title))}<span class="accent">.</span></h1><p class="note-subtitle">${esc(t(n.subtitle))}</p><p class="note-lead">${esc(t(n.summary))}</p>${(n.body||[]).map(p=>`<p>${esc(t(p))}</p>`).join('')}${n.bullets?`<h2>${t(['Áreas de trabajo','Areas of work'])}</h2><ul class="work-list">${n.bullets.map(b=>`<li>${esc(t(b))}</li>`).join('')}</ul>`:''}${n.external?`<a class="primary-button external-button" href="${esc(n.external)}" target="_blank" rel="noopener noreferrer">${t(['Ver código público en GitHub','View public code on GitHub'])} ↗</a>`:''}${tagLinks(n)?`<div class="note-tags">${tagLinks(n)}</div>`:''}<section class="related-section"><div class="section-heading"><h2>${c('connected')}</h2><span class="muted">${n.links.length}</span></div><div class="related-grid">${n.links.map(id=>link(id)).join('')}</div></section>${incoming.length?`<section class="backlink-section"><h2>↙ ${c('backlinks')}</h2><div class="backlink-list">${incoming.map(other=>link(other.id)).join('')}</div></section>`:''}</article><aside class="context-panel"><div class="context-title">${t(['EN ESTA CONEXIÓN','IN THIS CONNECTION'])}</div><div class="local-graph">${localGraph(n)}</div>${legend()}<h3>${t(['Sigue explorando','Keep exploring'])}</h3>${n.links.slice(0,5).map(id=>link(id)).join('')}<a class="full-map-link" href="#mapa">⠿ ${c('graph')} ↗</a><div class="context-tip">${t(['Sigue los enlaces para descubrir cómo se relacionan experiencia, proyectos y conocimientos.','Follow the links to discover how experience, projects and knowledge relate.'])}</div></aside></div></div>`;
}
function localGraph(n) {
 const list=n.links.slice(0,7).map(id=>byId.get(id));
 return `<svg viewBox="0 0 320 240" role="group" aria-label="${c('connected')}">${list.map((other,i)=>{const angle=i/list.length*Math.PI*2;const x=160+Math.cos(angle)*112,y=120+Math.sin(angle)*83;return `<line class="graph-edge highlight" x1="160" y1="120" x2="${x}" y2="${y}"/><a href="#${other.id}" class="graph-node ${other.type}" aria-label="${esc(t(other.title))}"><title>${esc(t(other.title))}</title><circle cx="${x}" cy="${y}" r="5"/><text x="${x}" y="${y+18}" text-anchor="middle">${esc(t(other.title).split(' · ')[0].slice(0,20))}</text></a>`;}).join('')}<circle cx="160" cy="120" r="9" class="center-node"/><text class="center-label" x="160" y="147" text-anchor="middle">${esc(t(n.title).split(' · ')[0].slice(0,24))}</text></svg>`;
}
function renderMap() {
 return `<div class="page-content map-page"><div class="eyebrow">⠿ ${t(['UNA TRAYECTORIA CONECTADA','A CONNECTED JOURNEY'])}</div><h1>${c('graph')}<span class="accent">.</span></h1><p class="page-lead">${t(['Los puestos aportan contexto. Los proyectos muestran la práctica. Los conocimientos los conectan. Selecciona un nodo para abrir su nota.','Roles provide context. Projects show the practice. Knowledge connects them. Select a node to open its note.'])}</p><div class="map-controls" role="group" aria-label="${t(['Filtrar mapa','Filter map'])}">${['all','experience','project','skill'].map(type=>`<button data-filter="${type}" aria-pressed="${graphFilter===type}" class="filter ${graphFilter===type?'selected':''}">${c(type)}</button>`).join('')}<span class="map-stats">${nodes.filter(n=>graphFilter==='all'||n.type===graphFilter).length} ${c('notes')}</span></div><div class="full-graph">${graphMarkup()}</div>${legend()}<details class="map-text"><summary>${t(['Explorar como lista accesible','Explore as an accessible list'])}</summary><div class="related-grid">${nodes.filter(n=>graphFilter==='all'||n.type===graphFilter).map(n=>link(n.id)).join('')}</div></details></div>`;
}
function renderEducation() {
 return `<div class="page-content education-page"><div class="eyebrow">▤ ${t(['BASE Y APRENDIZAJE','FOUNDATION & LEARNING'])}</div><h1>${c('education')}<span class="accent">.</span></h1><section class="education-block"><span class="small-label">2004 — 2009 / UOC</span><h2>${t(['Ingeniería Técnica en Informática de Gestión','University degree in Business Informatics'])}</h2><p>Universitat Oberta de Catalunya</p>${lang==='en'?'<p class="muted">Ingeniería Técnica en Informática de Gestión</p>':''}</section><section class="education-block"><h2>${t(['Certificaciones','Certifications'])}</h2><div class="education-row"><span>SAP Business ByDesign</span><span>2012</span></div><div class="education-row"><span>Expert Scrum Foundations</span><span>2015</span></div></section><section class="education-block"><h2>${t(['Idiomas','Languages'])}</h2>${[[['Castellano','Spanish'],['Nativo','Native']],[['Catalán','Catalan'],['Nativo','Native']],[['Inglés','English'],['Profesional avanzado','Advanced professional']]].map(([name,level])=>`<div class="education-row"><span>${t(name)}</span><span>${t(level)}</span></div>`).join('')}</section><a class="quiet-link" href="#skill">${t(['Explorar conocimientos aplicados','Explore applied knowledge'])} ↗</a></div>`;
}
function render({focus=false}={}) {
 const id=current(); const n=byId.get(id); let title=c('home');
 if(n) {$('#content').innerHTML=renderNote(n); title=t(n.title);}
 else if(['experience','project','skill'].includes(id)) {$('#content').innerHTML=renderCollection(id);title=c(id);}
 else if(id==='mapa') {$('#content').innerHTML=renderMap();title=c('graph');}
 else if(id==='formacion') {$('#content').innerHTML=renderEducation();title=c('education');}
 else if(id==='inicio') $('#content').innerHTML=renderHome();
 else { $('#content').innerHTML=`<div class="page-content"><h1>${t(['Nota no encontrada','Note not found'])}</h1><p>${t(['Este enlace no corresponde a una nota del CV.','This link does not match a CV note.'])}</p><a class="primary-button" href="#inicio">${c('back')} ↗</a></div>`;title=t(['Nota no encontrada','Note not found']); }
 $('#breadcrumb').textContent=title; document.title=`${title} · José Antonio Sánchez`;
 renderExplorer(); bindGraphs();
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{graphFilter=b.dataset.filter; render(); $(`[data-filter="${graphFilter}"]`).focus();}));
 if(focus) {window.scrollTo(0,0);$('#content').focus({preventScroll:true});}
}
function bindGraphs() {
 document.querySelectorAll('[data-node]').forEach(el=>{
  const highlight=on=>{const svg=el.closest('svg');svg.classList.toggle('has-focus',on);svg.querySelectorAll('.graph-edge').forEach(edge=>edge.classList.toggle('hover-edge',on&&(edge.dataset.from===el.dataset.node||edge.dataset.to===el.dataset.node)));};
  el.addEventListener('mouseenter',()=>highlight(true));el.addEventListener('mouseleave',()=>highlight(false));el.addEventListener('focus',()=>highlight(true));el.addEventListener('blur',()=>highlight(false));
 });
}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let resultIndex=-1;
function search() {
 const q=normalize($('#search-input').value.trim());
 const matches=nodes.filter(n=>normalize([t(n.title),t(n.subtitle),t(n.summary),...(n.body||[]).map(t),...(n.bullets||[]).map(t)].join(' ')).includes(q));
 $('#search-results').innerHTML=matches.length ? matches.map(n=>`<a class="search-result ${n.type}" href="#${n.id}"><span>${icon(n.type)}</span><div><strong>${esc(t(n.title))}</strong><small>${c(n.type)} · ${esc(t(n.subtitle))}</small></div><span>↵</span></a>`).join('') : `<p class="empty-results">${t(['No hay resultados. Prueba otra palabra.','No results. Try another word.'])}</p>`;
 resultIndex=-1; $('#search-results').scrollTop=0;
 $('#search-results').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>$('#search-dialog').close()));
}
$('#search-launch').addEventListener('click',()=>{$('#search-dialog').showModal();$('#search-input').value='';search();$('#search-input').focus();});
$('#search-close').addEventListener('click',()=>$('#search-dialog').close());
$('#search-dialog').addEventListener('click',e=>{if(e.target===$('#search-dialog')) {const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#search-input').addEventListener('input',search);
$('#search-dialog').addEventListener('keydown',e=>{
 const results=[...$('#search-results').querySelectorAll('a')];
 if(['ArrowDown','ArrowUp'].includes(e.key)&&results.length) {e.preventDefault();resultIndex=(resultIndex+(e.key==='ArrowDown'?1:-1)+results.length)%results.length;results.forEach((r,i)=>r.classList.toggle('selected',i===resultIndex));results[resultIndex].focus();}
 if(e.key==='Enter'&&e.target===$('#search-input')&&results.length){e.preventDefault();results[Math.max(resultIndex,0)].click();}
});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!$('#search-dialog').open)$('#search-launch').click();}});
$('#language').addEventListener('click',()=>{lang=lang==='es'?'en':'es';persist('cv-lang',lang);applyChrome();render();});
$('#theme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';persist('cv-theme',theme);applyChrome();});
$('#menu-toggle').addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');$('#menu-toggle').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('menu-open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
$('#content').addEventListener('click',()=>{document.body.classList.remove('menu-open');$('#menu-toggle').setAttribute('aria-expanded','false');});
$('#explorer').addEventListener('click',e=>{if(e.target.closest('a')){document.body.classList.remove('menu-open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',()=>render({focus:true}));
applyChrome();render();
})();
