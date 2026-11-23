// Вкладка «Геометрия» — только для Windows. Встраивается поверх той же страницы, что в APK:
// добавляет кнопку в ряд вкладок и панель с geom.html (сектора оси C, пластины корзины, пересчёт).
(function(){
  if (document.getElementById('tabGeom')) return;
  const nav = document.querySelector('nav.tabs');
  const last = document.getElementById('tabFChart');
  if (!nav || !last) return;
  const btn = document.createElement('button');
  btn.setAttribute('role', 'tab'); btn.dataset.tab = 'geom'; btn.setAttribute('aria-selected', 'false');
  btn.textContent = 'Геометрия';
  nav.appendChild(btn);
  const pane = document.createElement('div');
  pane.className = 'tabpane'; pane.id = 'tabGeom'; pane.hidden = true;
  const fr = document.createElement('iframe');
  fr.src = 'geom.html'; fr.title = 'Геометрия';
  fr.style.cssText = 'display:block;width:100%;border:0;height:calc(100vh - 150px);min-height:560px;background:transparent';
  pane.appendChild(fr);
  last.parentNode.insertBefore(pane, last.nextSibling);
  const panes = ['tabMain', 'tabChart', 'tabFinal', 'tabFChart'];
  btn.addEventListener('click', () => {
    panes.forEach(id => { const p = document.getElementById(id); if (p) p.hidden = true; });
    pane.hidden = false;
    document.querySelectorAll('nav.tabs button').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    const c = document.querySelector('header .controls'); if (c) c.hidden = true;
  });
  // любая другая вкладка прячет «Геометрию» (их переключает сама страница)
  nav.querySelectorAll('button').forEach(b => { if (b !== btn) b.addEventListener('click', () => { pane.hidden = true; }); });
})();
