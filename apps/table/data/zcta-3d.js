window.CBCAP_ZCTA3D = window.CBCAP_ZCTA3D || null;
fetch("./data/zcta-3d.json").then((r)=>r.json()).then((d)=>{ window.CBCAP_ZCTA3D = d; });
