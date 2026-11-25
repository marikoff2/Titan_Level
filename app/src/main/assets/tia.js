// Режим раздела для Android 2.0 (стартовое меню home.html → index.html?mode=pre|fin, geom.html?mode=geom).
// Без параметра mode ничего не делает: Windows и старый вид работают как раньше.
(function(){
  var m = (location.search.match(/[?&]mode=(pre|fin|geom)/) || [])[1];
  if (!m) return;
  var root = document.documentElement;
  root.dataset.mode = m;
  root.dataset.theme = 'light';                 // серая гамма в духе TIA Portal — всегда светлая
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'tia.css';
  document.head.appendChild(l);
  var TITLE = { pre: 'Предварительное выставление станин X', fin: 'Окончательное выставление станин X', geom: 'Геометрия' };
  function back(){ if (history.length > 1) history.back(); else location.replace('home.html'); }
  window.titanMenu = back;
  document.addEventListener('DOMContentLoaded', function(){
    var bar = document.createElement('div'); bar.className = 'tiabar';
    bar.innerHTML = '<button type="button" class="tiaback" aria-label="В меню">◂ Меню</button>' +
      '<div class="tiapath"><span>TITAN 4020</span><b>' + TITLE[m] + '</b></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('.tiaback').onclick = back;
  });
})();
