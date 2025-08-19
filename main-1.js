/*
 * Friluftskartan Gävle – uppdaterad main.js (31 maj 2025)
 * • En enda require‑block (ingen dubblett)
 * • Sök‑ och längdfilter utanför for‑loopen
 * • Beräknar LENGTH_M (meter) för motionsspår i minnet → definitionExpression fungerar
 * • Popup‑template förenklad
 */

// Friluftskartan Gävle – modulär och städad version
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/layers/GraphicsLayer",     
  "esri/widgets/Sketch",
    "esri/geometry/geometryEngine",
    "esri/Graphic"  // <--- lägg till denna rad
 
  ], function (Map, MapView, GeoJSONLayer, GraphicsLayer, Sketch, geometryEngine, Graphic) {

    "use strict";
    let poiLageAktiv = false; ////////////////////

  
    // Initiera karta och vy
    const map = new Map({ basemap: "topo-vector" });
    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [17.1413, 60.6749],
      zoom: 12,
    });
  
    // Återställ kartvy från localStorage
    const saved = JSON.parse(localStorage.getItem("kartvy"));
    if (saved) {
      view.center = saved.center;
      view.zoom = saved.zoom;
    }
    view.watch(["center", "zoom"], () => {
      const c = [view.center.longitude, view.center.latitude];
      localStorage.setItem("kartvy", JSON.stringify({ center: c, zoom: view.zoom }));
    });
  
    // ---------------------------------------------------------------------------
    // Datakategorier
    // ---------------------------------------------------------------------------
    /**
     * Alla nycklar motsvarar id:t för ett <input type="checkbox" id="<id>Box"> i HTML.
     * motionsspar har en egen renderer med unika färger.
     */
    const kategorier = {
      motionsspar: {
        fil: "Data/motionsspar_length_fixed.json",
        typ: "line",
        renderer: {
          type: "unique-value",
          field: "NAMN",
          defaultSymbol: { type: "simple-line", color: "green", width: 2 },
          uniqueValueInfos: [  
            { value: "Barnens kulturstig", symbol: { type: "simple-line", color: "#f9cab9", width: 2 } },
            { value: "Bomhus motionsspår 2 km", symbol: { type: "simple-line", color: "#f9c897", width: 2 } },
            { value: "Bomhus motionsspår 4 km", symbol: { type: "simple-line", color: "#9370b0", width: 2 } },
            { value: "Bomhus naturstig", symbol: { type: "simple-line", color: "#4d6ada", width: 2 } },
            { value: "Gavlehov motionsspår 2,5 km", symbol: { type: "simple-line", color: "#d48e26", width: 2 } },
            { value: "Gavlehov motionsspår 5,5 km", symbol: { type: "simple-line", color: "#399655", width: 2 } },
            { value: "Gavlehov tillgänglighetsspår", symbol: { type: "simple-line", color: "#fe8328", width: 2 } },
            { value: "Gysinge bruk-Hedesunda, Gästrikeleden etapp 14", symbol: { type: "simple-line", color: "#13fc16", width: 2 } },
            { value: "Hagaströms motionsspår", symbol: { type: "simple-line", color: "#1a68f2", width: 2 } },
            { value: "Hedens motionsspår 1,9 km", symbol: { type: "simple-line", color: "#26b662", width: 2 } },
            { value: "Hedens motionsspår 2,5 km", symbol: { type: "simple-line", color: "#13ead1", width: 2 } },
            { value: "Hedens motionsspår 3,4 km", symbol: { type: "simple-line", color: "#cc061e", width: 2 } },
            { value: "Hedens motionsspår 4 km", symbol: { type: "simple-line", color: "#e48160", width: 2 } },
            { value: "Hedens motionsspår 5 km", symbol: { type: "simple-line", color: "#f51ef4", width: 2 } },
            { value: "Hedesunda motionsspår 1 km", symbol: { type: "simple-line", color: "#a7cf1b", width: 2 } },
            { value: "Hedesunda motionsspår 17 km", symbol: { type: "simple-line", color: "#0c5b1f", width: 2 } },
            { value: "Hedesunda motionsspår 2 km", symbol: { type: "simple-line", color: "#0881e6", width: 2 } },
            { value: "Hedesunda motionsspår 2,5 km", symbol: { type: "simple-line", color: "#0facaf", width: 2 } },
            { value: "Hedesunda motionsspår 5 km", symbol: { type: "simple-line", color: "#210f93", width: 2 } },
            { value: "Hedesunda motionsspår 7 km", symbol: { type: "simple-line", color: "#949c33", width: 2 } },
            { value: "Hedesunda-Kågbo, Gästrikeleden etapp 15", symbol: { type: "simple-line", color: "#683679", width: 2 } },
            { value: "Hemlingby Naturstig", symbol: { type: "simple-line", color: "#9f1302", width: 2 } },
            { value: "Hemlingby motionsspår 10 km", symbol: { type: "simple-line", color: "#b00626", width: 2 } },
            { value: "Hemlingby motionsspår 2 km & Hemlingbyrundan", symbol: { type: "simple-line", color: "#08e331", width: 2 } },
            { value: "Hemlingby motionsspår 2,5 km", symbol: { type: "simple-line", color: "#52e5b6", width: 2 } },
            { value: "Hemlingby motionsspår 3 km", symbol: { type: "simple-line", color: "#f59afb", width: 2 } },
            { value: "Hemlingby motionsspår 5 km", symbol: { type: "simple-line", color: "#60cc4a", width: 2 } },
            { value: "Hemlingby motionsspår 6 km", symbol: { type: "simple-line", color: "#709de7", width: 2 } },
            { value: "Hemlingby-Valbo köpcentrum, Gästrikeleden Etapp 1", symbol: { type: "simple-line", color: "#7285e8", width: 2 } },
            { value: "Kungsbäck motionsspår 3 km", symbol: { type: "simple-line", color: "#3bf18b", width: 2 } },
            { value: "Kungsbäck motionsspår 5 km", symbol: { type: "simple-line", color: "#ca065c", width: 2 } },
            { value: "Kågbo-Långhäll, Gästrikeleden etapp 16", symbol: { type: "simple-line", color: "#c4c0bc", width: 2 } },
            { value: "Långhäll-Hemlingby, Gästrikeleden etapp 17", symbol: { type: "simple-line", color: "#4f0f66", width: 2 } },
            { value: "Mariehovs motionsspår", symbol: { type: "simple-line", color: "#4fa3d0", width: 2 } },
            { value: "Norrlandets kustled", symbol: { type: "simple-line", color: "#406533", width: 2 } },
            { value: "Skidstavallen motionsspår 1,5 km", symbol: { type: "simple-line", color: "#326bb1", width: 2 } },
            { value: "Skidstavallen motionsspår 10 km", symbol: { type: "simple-line", color: "#dc9ba9", width: 2 } },
            { value: "Skidstavallen motionsspår 15 km", symbol: { type: "simple-line", color: "#31cf0e", width: 2 } },
            { value: "Skidstavallen motionsspår 2,5 km", symbol: { type: "simple-line", color: "#aa2873", width: 2 } },
            { value: "Skidstavallen motionsspår 5,5 km", symbol: { type: "simple-line", color: "#cfe269", width: 2 } },
            { value: "Skidstavallen motionsspår 7 km", symbol: { type: "simple-line", color: "#ee55ca", width: 2 } },
            { value: "Storskogen - upplevelsespår/barnspår", symbol: { type: "simple-line", color: "#c290a3", width: 2 } },
            { value: "Valbo Sportcentrum motionsspår", symbol: { type: "simple-line", color: "#f0dd04", width: 2 } },
            { value: "Valbo köpcentrum-Högbo bruk, Gästrikeleden Etapp 2", symbol: { type: "simple-line", color: "#4c93a8", width: 2 } },
            { value: "Åbyvallen motionsspår 1,5 km", symbol: { type: "simple-line", color: "#d0f75f", width: 2 } },
            { value: "Åbyvallen motionsspår 2,5 km", symbol: { type: "simple-line", color: "#5fb9e4", width: 2 } },
            { value: "Åbyvallen motionsspår 3,5 km", symbol: { type: "simple-line", color: "#5b81e7", width: 2 } },
          ],
        },
      },
      pulkabackar: { fil: "Data/pulkabackar.json", färg: "orange", typ: "marker" },
      aktivitetsytor: { fil: "Data/aktivitetsytor.json", färg: "purple", typ: "marker" },
      badplatser: { fil: "Data/badplatser.json", färg: "blue", typ: "marker" },
      parkmobler: { fil: "Data/parkmobler.json", färg: "brown", typ: "marker" },
      papperskorgar: { fil: "Data/papperskorgar.json", färg: "gray", typ: "marker" },
      idrottsanlaggningar: { fil: "Data/idrott_motion.json", färg: "red", typ: "marker" },
      utegym: { fil: "Data/utegym.json", färg: "teal", typ: "marker" },
      lekplatser: { fil: "Data/lekplatser.json", färg: "magenta", typ: "marker" },
      toaletter: { fil: "Data/offentliga_toaletter.json", färg: "black", typ: "marker" },
      livraddning: { fil: "Data/livraddningsutrustning.json", färg: "yellow", typ: "marker" },
    };
  
    // ---------------------------------------------------------------------------
    // Lager, checkrutor & legend
    // ---------------------------------------------------------------------------
    const lagerMap = {};
    const legendList = document.getElementById("legendList");
  
    // Skapa lager
    for (const id in kategorier) {
      const info = kategorier[id];
      const layer = skapaLager(id, info);
      map.add(layer);
      lagerMap[id] = layer;
  
      
      
    }
    function fyllTeckenforklaring() {
      const layer = lagerMap.motionsspar;
      if (!layer) return;
    
      const infos = kategorier.motionsspar.renderer.uniqueValueInfos;
      legendList.innerHTML = ""; // Rensa gammal innehåll
    
      infos.forEach(info => {
        const färg = info.symbol.color;
        const namn = info.value;
    
        const färgHex = typeof färg === "string" ? färg : `rgb(${färg.join(",")})`;
    
        const li = document.createElement("li");
        li.innerHTML = `<span style="display:inline-block;width:16px;height:16px;background:${färgHex};margin-right:8px;border-radius:4px;"></span>${namn}`;
        legendList.appendChild(li);
      });
    }
    
  
    // ===== Funktioner =====
  
    function skapaLager(id, info) {
      const layer = new GeoJSONLayer({
        url:  info.fil, 
        outFields: ["*"],
        renderer: info.renderer || standardSymbol(info),
        popupTemplate: skapaPopup(id),
      });
  
      const box = document.getElementById(`${id}Box`);
      if (box) {
        layer.visible = box.checked;
        box.addEventListener("change", e => layer.visible = e.target.checked);
      }
  
      if (id === "motionsspar") {
        layer.when(() => {
          layer.queryFeatures(layer.createQuery()).then(({ features }) => {
            features.forEach(f => f.attributes.LENGTH_M = geometryEngine.geodesicLength(f.geometry, "meters"));
            uppdateraStatistik();
          });
        });
      }
  
      return layer;
    }
  
    function standardSymbol(info) {
      return {
        type: "simple",
        symbol: info.typ === "line"
          ? { type: "simple-line", color: info.färg, width: 2 }
          : { type: "simple-marker", color: info.färg, size: 8 }
      };
    }
  
    function skapaPopup(id) {
      return id === "motionsspar" ? {
        title: "{NAMN}",
        content: e => {
          const a = e.graphic.attributes;
          const km = typeof a.length_m === "number" ? (a.length_m / 1000).toFixed(1) : "Okänd";
          return `<b>Längd:</b> ${km} km<br><b>Beskrivning:</b> ${a.BESKRVN || "–"}`;
        }
      } : {
        title: "{NAMN}",
        content: e => {
          const a = e.graphic.attributes;
          return Object.entries(a).filter(([k, v]) => k !== "NAMN" && v)
            .map(([k, v]) => `<b>${k}:</b> ${v}<br>`).join("") || "Ingen information.";
        }
      };
    }
  
    // Statistik + diagram
    function uppdateraStatistik() {
      const layer = lagerMap.motionsspar;
      if (!layer) return;
      const q = layer.createQuery();
      q.where = layer.definitionExpression || "1=1";
  
      layer.queryFeatures(q).then(({ features }) => {
        const antal = features.length;
        const totalMeter = features.reduce((sum, f) => sum + (f.attributes.length_m || 0), 0);
        const totalKm = (totalMeter / 1000).toFixed(1);
        document.getElementById("statistikText").textContent = `Visar ${antal} spår • Total längd: ${totalKm} km`;
  
        document.getElementById("ingetResultat").style.display = antal === 0 ? "block" : "none";
  
        const grupper = { kort: 0, medel: 0, lång: 0 };
        features.forEach(f => {
          const l = f.attributes.length_m;
          if (l < 3000) grupper.kort++; else if (l <= 5000) grupper.medel++; else grupper.lång++;
        });
        visaDiagram(grupper);
      });
    }
  
    function visaDiagram(data) {
      const ctx = document.getElementById("diagram").getContext("2d");
      if (window.diagram) window.diagram.destroy();
      window.diagram = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: "Antal spår",
            data: Object.values(data),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Antal spår per längdkategori" }
          }
        }
      });
    }
  
    // Händelser – sök, filter, export
    document.getElementById("sokSpår").addEventListener("input", function () {
      const q = this.value.trim().toLowerCase();
      localStorage.setItem("sokning", q);
      const l = lagerMap.motionsspar;
      l.definitionExpression = q ? `LOWER(NAMN) LIKE '%${q}%'` : null;
      if (q) l.queryExtent().then(r => r.extent && view.goTo(r.extent.expand(1.5)));
      uppdateraStatistik();
    });
  
    document.getElementById("langdFilter").addEventListener("change", function () {
      const v = this.value;
      localStorage.setItem("langdFilter", v);
      const l = lagerMap.motionsspar;
      let expr = v === "kort" ? "LENGTH_M < 3000" : v === "medel" ? "LENGTH_M >= 3000 AND LENGTH_M <= 5000" : v === "lang" ? "LENGTH_M > 5000" : "";
      l.definitionExpression = expr;
      uppdateraStatistik();
    });
  
    document.getElementById("exportBtn").addEventListener("click", async () => {
      const l = lagerMap.motionsspar;
      const res = await l.queryFeatures(l.createQuery());
      if (!res.features.length) return alert("Inga resultat att exportera.");
      const gj = {
        type: "FeatureCollection",
        features: res.features.map(f => f.toJSON()),
      };
      const blob = new Blob([JSON.stringify(gj, null, 2)], { type: "application/geo+json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exporterade_motionsspar.geojson";
      a.click();
      URL.revokeObjectURL(url);
    });
    let markerGrafik; // Temporär markör
    const poiGraphics = []; // Alla POI-grafiker
    
    // Klicka på kartan för att skapa ny POI
    view.on("click", async function (event) {
      if (!poiLageAktiv) return;
    
      const hit = await view.hitTest(event);
      const hasGraphic = hit.results.some(r => r.graphic.layer && r.graphic.layer.type !== "graphics");
      if (hasGraphic) return;
    
      view.graphics.remove(markerGrafik);
      view.popup.close();
      document.getElementById("poiForm").style.display = "block";
      document.getElementById("poiName").value = "";
      document.getElementById("poiDesc").value = "";
    
      const point = event.mapPoint;
      markerGrafik = new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          color: "gold",
          size: 10
        },
        attributes: {
          NAMN: "",
          BESKRIVNING: ""
        },
        popupTemplate: {
          title: "",
          content: ""
        }
      });
      view.graphics.add(markerGrafik);
    
      poiLageAktiv = false;
    });
    
    
    // Spara POI till karta och sessionStorage
    document.getElementById("savePoiBtn").addEventListener("click", function () {
      const namn = document.getElementById("poiName").value.trim();
      const beskrivning = document.getElementById("poiDesc").value.trim();
    
      if (!namn) return alert("Ange ett namn");
    
      markerGrafik.attributes.NAMN = namn;
      markerGrafik.attributes.BESKRIVNING = beskrivning;
      markerGrafik.popupTemplate.title = namn;
      markerGrafik.popupTemplate.content = beskrivning;
      
    
      poiGraphics.push(markerGrafik);
      sparaPOITillSession();
      document.getElementById("poiForm").style.display = "none";
      markerGrafik = null;
    });
    
    // Spara till sessionStorage
    function sparaPOITillSession() {
      const json = poiGraphics.map(g => ({
        x: g.geometry.longitude,
        y: g.geometry.latitude,
        namn: g.attributes.NAMN,
        beskrivning: g.attributes.BESKRIVNING
      }));
      sessionStorage.setItem("minaPOI", JSON.stringify(json));
    }
    
    // Läs från sessionStorage vid start
    function lasPOI() {
      const data = JSON.parse(sessionStorage.getItem("minaPOI")) || [];
      data.forEach(d => {
        const g = new Graphic({
          geometry: {
            type: "point",
            longitude: d.x,
            latitude: d.y
          },
          symbol: {
            type: "simple-marker",
            color: "gold",
            size: 10
          },
          attributes: {
            NAMN: d.namn,
            BESKRIVNING: d.beskrivning
          },
          popupTemplate: {
            title: d.namn,
            content: d.beskrivning
          }
        });
        
        poiGraphics.push(g);
        view.graphics.add(g);
      });
    }
    
    lasPOI();

  const ritlager = new GraphicsLayer(); // Lager för ritad polygon
  map.add(ritlager);

  const sketch = new Sketch({
    layer: ritlager,
    view: view,
    creationMode: "update",
    availableCreateTools: ["polygon"],
    visibleElements: { createTools: { point: false, polyline: false, rectangle: false, circle: false } }
  });

  view.ui.add(sketch, "top-right");

  document.getElementById("polygonBtn").addEventListener("click", () => {
    poiLageAktiv = true;
    alert("Klicka på kartan för att lägga till en POI");
  });
  

  sketch.on("create", async (event) => {
    if (event.state === "complete") {
      const polygon = event.graphic.geometry;
      const resultat = [];

      for (const id in lagerMap) {
        const layer = lagerMap[id];
        const query = layer.createQuery();
        query.geometry = polygon;
        query.spatialRelationship = "intersects";
        query.returnGeometry = false;

        const res = await layer.queryFeatures(query);
        res.features.forEach(f => {
          resultat.push({ namn: f.attributes.NAMN || "Okänd", kategori: id });
        });
      }

      if (resultat.length === 0) {
        view.popup.open({
          title: "Inga objekt",
          content: "Inga objekt finns inom polygonen.",
          location: polygon.centroid
        });
      } else {
        const html = resultat.map(r => `• <b>${r.kategori}</b>: ${r.namn}`).join("<br>");
        view.popup.open({
          title: `Objekt inom område (${resultat.length})`,
          content: html,
          location: polygon.centroid
        });
      }
    }
  });




    
    // Visa/dölj teckenförklaring

    window.toggleLegend = function () {
      const el = document.getElementById("legendContainer");
      el.style.display = el.style.display === "none" ? "block" : "none";
      
    };
    document.getElementById("legendToggleBtn").addEventListener("click", toggleLegend);

    fyllTeckenforklaring();


  });


  
  
  