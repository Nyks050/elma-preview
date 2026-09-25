(()=>{
  const guard=document.createElement('style');
  guard.id='elmaFlowBootGuard';
  guard.textContent='.mapwrap #map{display:none!important}.hero,.top{display:none!important}';
  document.head.appendChild(guard);
  const icons=document.createElement('script');
  icons.src='icon-skin-3d.js?v=20260925-qr-position1';
  icons.defer=true;
  document.head.appendChild(icons);
  const core=document.createElement('script');
  // Use the same URL as the preload so runtime and preload cannot drift apart.
  const preloadedCore=document.querySelector('link[rel="preload"][href^="maps-core-soft-route.js"]');
  core.src=preloadedCore?.getAttribute('href')||'maps-core-soft-route.js?v=20260925-qr-position1';
  core.defer=true;
  document.head.appendChild(core);
})();
