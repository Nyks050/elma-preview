/* Elma Go map adapter. All map pixels and route geometry come from OpenStreetMap data. */
(()=>{
  const L=window.L;
  if(!L){console.error('Leaflet yüklenemedi');return}
  const coords=value=>Array.isArray(value)?value:[typeof value.lat==='function'?value.lat():value.lat,typeof value.lng==='function'?value.lng():value.lng??value.lon];
  const tileUrl=window.ELMA_OSM_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const distanceText=meters=>meters<1000?Math.round(meters)+' m':(meters/1000).toFixed(1).replace('.',',')+' km';
  const durationText=seconds=>Math.max(1,Math.round(seconds/60))+' dk.';
  class MapView{
    constructor(element,options={}){
      this._leaflet=L.map(element,{zoomControl:false,attributionControl:false,scrollWheelZoom:false,preferCanvas:true}).setView(coords(options.center||{lat:40.65,lng:35.83}),options.zoom||14);
      this._tiles=L.tileLayer(tileUrl,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> katkıda bulunanlar'});
      if(element.id!=='map')this.activate();
      this._leaflet.attributionControl=L.control.attribution({position:'topright'}).addTo(this._leaflet);
      this._leaflet.attributionControl.setPrefix(false);
    }
    activate(){if(!this._leaflet.hasLayer(this._tiles))this._tiles.addTo(this._leaflet)}
    addListener(type,listener){this._leaflet.on(type,event=>listener(type==='click'?{latLng:{lat:()=>event.latlng.lat,lng:()=>event.latlng.lng}}:event))}
    panTo(value){this._leaflet.panTo(coords(value))}
    setZoom(zoom){this._leaflet.setZoom(zoom)}
    getZoom(){return this._leaflet.getZoom()}
    getCenter(){const center=this._leaflet.getCenter();return {lat:()=>center.lat,lng:()=>center.lng}}
    getBounds(){return this._leaflet.getBounds()}
    fitBounds(bounds,padding=48){if(bounds?.isEmpty?.())return;const p=typeof padding==='number'?padding:Math.max(padding.top||0,padding.right||0,padding.bottom||0,padding.left||0);this._leaflet.fitBounds(bounds._leaflet||bounds,{padding:[p,p],maxZoom:16})}
    setOptions(){}
    invalidateSize(){this._leaflet.invalidateSize()}
  }
  class Bounds{
    constructor(){this._leaflet=L.latLngBounds([])}
    extend(point){this._leaflet.extend(coords(point));return this}
    isEmpty(){return !this._leaflet.isValid()}
  }
  class Polyline{
    constructor(options){this.options=options;this.path=options.path||[];const dotted=!!options.icons?.length;this.layer=L.polyline(this.path.map(coords),{color:dotted?(options.icons[0].icon.strokeColor||'#171717'):(options.strokeColor||'#171717'),weight:dotted?3:(options.strokeWeight||5),opacity:dotted?1:(options.strokeOpacity??1),dashArray:dotted?'2 10':undefined,lineCap:'round',lineJoin:'round',interactive:options.clickable!==false});this.setMap(options.map||null)}
    setMap(map){if(this.map)this.map._leaflet.removeLayer(this.layer);this.map=map;if(map)map._leaflet.addLayer(this.layer)}
    setPath(path){this.path=path;this.layer.setLatLngs(path.map(coords))}
  }
  class Marker{
    constructor(options){this.options=options;const icon=options.icon||{};const size=icon.scale||9;const fill=icon.fillColor||'#111';const stroke=icon.strokeColor||'#fff';const label=options.label?.text;
      if(label){const html='<span class="osm-stop-marker" style="width:'+size*2+'px;height:'+size*2+'px;background:'+fill+';color:'+options.label.color+';border-color:'+stroke+'">'+String(label).replace(/[^0-9]/g,'')+'</span>';this.layer=L.marker(coords(options.position),{icon:L.divIcon({html,className:'osm-marker-wrap',iconSize:[size*2,size*2],iconAnchor:[size,size]}),interactive:options.clickable!==false,title:options.title||''})}
      else this.layer=L.circleMarker(coords(options.position),{radius:size,fillColor:fill,fillOpacity:1,color:stroke,weight:icon.strokeWeight||3,interactive:options.clickable!==false});
      this.setMap(options.map||null)
    }
    setMap(map){if(this.map)this.map._leaflet.removeLayer(this.layer);this.map=map;if(map)map._leaflet.addLayer(this.layer)}
  }
  async function route(request){
    const points=[request.origin,...(request.waypoints||[]).map(value=>value.location),request.destination].map(coords);
    const walking=request.travelMode==='WALKING';const service=walking?'routed-foot':'routed-car';
    const endpoints=points.map(value=>value[1]+','+value[0]).join(';');
    const url='https://routing.openstreetmap.de/'+service+'/route/v1/driving/'+endpoints+'?overview=full&geometries=geojson&steps=true';
    const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('OSM rota: '+response.status);
    const data=await response.json(),result=data.routes?.[0];if(!result)throw new Error('Rota bulunamadı');
    const overview_path=result.geometry.coordinates.map(value=>({lat:value[1],lng:value[0]}));
    const legs=result.legs.map(leg=>({distance:{value:leg.distance,text:distanceText(leg.distance)},duration:{value:leg.duration,text:durationText(leg.duration)},steps:(leg.steps||[]).map(step=>({path:(step.geometry?.coordinates||[]).map(value=>({lat:value[1],lng:value[0]}))}))}));
    return {routes:[{overview_path,legs,summary:result.legs?.[0]?.summary||'OpenStreetMap rotası'}]};
  }
  window.ElmaMaps={Map:MapView,Marker,Polyline,LatLngBounds:Bounds,DirectionsService:class{route(request){return route(request)}},DirectionsRenderer:class{setMap(){}},TravelMode:{DRIVING:'DRIVING',WALKING:'WALKING'},SymbolPath:{CIRCLE:'CIRCLE'},event:{trigger(map,type){if(type==='resize')map.invalidateSize()},addListenerOnce(map,type,callback){map._leaflet.once(type==='idle'?'moveend':type,callback)}}};
  const style=document.createElement('style');style.textContent='.osm-marker-wrap{background:transparent;border:0}.osm-stop-marker{display:grid;place-items:center;border:2px solid;border-radius:50%;font:800 9px/1 Inter,sans-serif;box-shadow:0 1px 5px #0003}.leaflet-control-attribution{font:10px/1.4 Inter,sans-serif!important;background:#ffffffed!important;border-radius:7px 0 0 0;padding:3px 6px!important}.mapwrap .leaflet-control-attribution{margin-top:calc(100px + env(safe-area-inset-top))!important;margin-right:14px!important;border-radius:8px!important}.eg-route1-map .leaflet-control-attribution,.eg-route6-map .leaflet-control-attribution{margin-top:0!important;margin-right:0!important}.eg-route1-map .leaflet-control-attribution,.eg-route6-map .leaflet-control-attribution{margin-bottom:0!important}.leaflet-container{font-family:Inter,-apple-system,sans-serif}';style.textContent+='.osm-map-ui{position:absolute;z-index:820}.osm-map-toolbar{left:16px;right:16px;top:calc(18px + env(safe-area-inset-top));max-width:520px;margin:auto;display:none}.osm-map-search{width:100%;min-height:67px;display:grid;grid-template-columns:1fr 32px;grid-template-rows:28px 18px;align-content:center;padding:8px 16px;border:1px solid #e2e2e4;border-radius:23px;background:#ffffffeb;box-shadow:0 12px 34px #10121621;backdrop-filter:blur(16px);text-align:left}.osm-map-logo{font:850 23px/26px Inter,sans-serif;letter-spacing:-1.1px;color:#0a0a0b}.osm-map-logo b{font-weight:750}.osm-map-subtitle{font:550 11px/16px Inter,sans-serif;color:#686b70;grid-column:1}.osm-map-search-icon{grid-column:2;grid-row:1/3;align-self:center;text-align:center;font:30px/1 Inter,sans-serif;color:#111}.osm-map-controls{display:none;right:16px;bottom:calc(176px + env(safe-area-inset-bottom));flex-direction:column;gap:8px}.osm-map-controls button{width:48px;height:48px;border:1px solid #e3e3e4;border-radius:16px;background:#fff;color:#111;font:600 25px/1 Inter,sans-serif;box-shadow:0 6px 22px #0002}.mapwrap.elma-map-open .osm-map-ui{display:flex}.mapwrap.elma-map-open .osm-map-toolbar{display:block}body.elma-white-flow .osm-map-ui{display:none!important}';document.head.appendChild(style);
})();
