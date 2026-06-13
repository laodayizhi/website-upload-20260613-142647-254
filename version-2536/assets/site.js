(function(){
  function qsa(sel, root){return Array.prototype.slice.call((root||document).querySelectorAll(sel));}
  function setOptions(select, values){
    if(!select) return;
    values.sort(function(a,b){return String(b).localeCompare(String(a));}).forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;select.appendChild(o);});
  }
  function applyFilters(root){
    var input=root.querySelector('.movie-search');
    var year=root.querySelector('.year-filter');
    var region=root.querySelector('.region-filter');
    var cards=qsa('.movie-card', root.parentNode || document);
    var empty=(root.parentNode || document).querySelector('.empty-result');
    var term=(input&&input.value||'').trim().toLowerCase();
    var y=year&&year.value||'';
    var r=region&&region.value||'';
    var visible=0;
    cards.forEach(function(card){
      var hay=[card.dataset.title,card.dataset.year,card.dataset.region,card.dataset.genre,card.dataset.tags].join(' ').toLowerCase();
      var ok=(!term||hay.indexOf(term)>-1)&&(!y||card.dataset.year===y)&&(!r||card.dataset.region===r);
      card.classList.toggle('is-hidden',!ok);
      if(ok) visible++;
    });
    if(empty) empty.classList.toggle('show', visible===0);
  }
  document.addEventListener('DOMContentLoaded',function(){
    var btn=document.querySelector('.menu-btn');
    var mob=document.querySelector('.mobile-nav');
    if(btn&&mob){btn.addEventListener('click',function(){mob.classList.toggle('open');});}
    qsa('.search-panel').forEach(function(panel){
      var scope=panel.parentNode || document;
      var cards=qsa('.movie-card', scope);
      var years=[];var regions=[];
      cards.forEach(function(card){if(card.dataset.year&&years.indexOf(card.dataset.year)<0)years.push(card.dataset.year);if(card.dataset.region&&regions.indexOf(card.dataset.region)<0)regions.push(card.dataset.region);});
      setOptions(panel.querySelector('.year-filter'),years);
      setOptions(panel.querySelector('.region-filter'),regions);
      qsa('input,select',panel).forEach(function(el){el.addEventListener('input',function(){applyFilters(panel);});el.addEventListener('change',function(){applyFilters(panel);});});
    });
  });
  window.initMoviePlayer=function(url){
    var video=document.getElementById('player');
    if(!video||!url)return;
    if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=url;return;}
    if(window.Hls&&window.Hls.isSupported()){
      var hls=new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src=url;
  };
})();