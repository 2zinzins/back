const API_GET_POSITION = '/api/position/get';
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CLUSTER_DISTANCE = 30;
const CLUSTER_RESOLUTION = 80;
const TOTAL_LINE_ANIMATION_TIME = 3000; // milliseconds
const GEOGRAPHIC_PROJ  = "EPSG:4326"; 
const MERCATOR_PROJ = "EPSG:3857";
const BASE_ZOOM = 11;

function getAnimationDurationFromDistance(d) {
    return getBaseLog(10, d/500);
}

function getBaseLog(base, x) {
    return Math.log(x) / Math.log(base);
}

function getZoomFromTimeAndDuration(t, d) {
    const f = 1/8; // curve flexion 
    const s = d**4; // flexion sensibility 
    return BASE_ZOOM + ((f*s)/8)*( Math.sin(Math.PI*((4*t+d)/(2*d)))-1)
}

function fetchPositionData() {   
    return new Promise((resolve, reject) => {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", API_GET_POSITION, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
        
        xhr.onload = function () {
            resolve(xhr.response);
        }
    })
}

(async ()=>{
    window.lc.appKey = "map-sng";

    document.getElementById('map').style.height = `${window.innerHeight}px`;

    const rawPositionData = await fetchPositionData();
    const positionData = JSON.parse(rawPositionData);

    const map = new ol.Map({
        controls: new ol.control.defaults().extend([new AnimateAgainControl()]),
        target: 'map',
        layers: [
            new ol.layer.Tile({source: new ol.source.Stamen({layer: 'watercolor'})}),
            new ol.layer.Tile({source: new ol.source.Stamen({layer: 'terrain-labels'})}),
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(
                positionData.history[0]?
                [
                    positionData.history[0].lon,
                    positionData.history[0].lat
                ]
                :
                [
                    positionData.actual.lon,
                    positionData.actual.lat
                ]
            ),
            zoom: BASE_ZOOM
        })
    });

    const positionsSource = new ol.source.Vector({});
    const linesSource = new ol.source.Vector({});

    
    
    
    const allPositions = [...positionData.history, positionData.actual];
    let positionsToRenderDirectly = [];
    let positionsToAnimate = [];
    const lastAnimatedId = window.lc.get(LAST_ANIMATED_ID_LC_ITEM);
    const lastAnimatedPositionIndex = lastAnimatedId ? allPositions.findIndex(position=>position.id == lastAnimatedId) +1 : undefined;
    const fallbackAnimCount = 3;
    if(lastAnimatedPositionIndex) {
        positionsToRenderDirectly = allPositions.slice(0, lastAnimatedPositionIndex);
        positionsToAnimate = allPositions.slice(lastAnimatedPositionIndex-1);
    } else {
        const toAnimStartIndex = allPositions.length - fallbackAnimCount;
        positionsToRenderDirectly = allPositions.slice(0, toAnimStartIndex);
        positionsToAnimate = allPositions.slice(toAnimStartIndex-1);
        // positionsToAnimate = [...allPositions];
    }

    console.log('to render directly', positionsToRenderDirectly);
    console.log('to animate', positionsToAnimate);

    // direct rendering
    positionsToRenderDirectly.forEach(async (position, index) => {
        let animationLayer = null;
        let positionFeature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([
            position.lon,
            position.lat
        ])))

        position.date = new Date(position.at);
        position.day = DAYS[position.date.getDay()];
        position.numberDay = `${position.date.getDate().toString().padStart(2, '0')}/${position.date.getMonth().toString().padStart(2, '0')}`
        position.label = `${position.day} ${position.numberDay}\nà ${position.date.getHours()}H`

        positionFeature.attributes = position

        if(index==0) {
            positionsSource.addFeature(positionFeature);
            return;
        }
        const startCoords = ol.proj.transform([
            positionsToRenderDirectly[index-1].lon, 
            positionsToRenderDirectly[index-1].lat,
        ], 'EPSG:4326', 'EPSG:3857');
        const endCoords =  ol.proj.transform([
            position.lon, 
            position.lat,
        ], 'EPSG:4326', 'EPSG:3857');

        const line = new ol.geom.LineString([startCoords, endCoords]);
        const lineFeature = new ol.Feature({
            geometry: line
        });
        const lineSource = new ol.source.Vector({});
        lineSource.addFeature(lineFeature);
        lineLayer = new ol.layer.Vector({
            source: lineSource,
            style: MAP_STYLE.line,
        })
        map.addLayer(lineLayer);
        if(animationLayer) map.removeLayer(animationLayer);
        animationLayer = lineLayer;
        map.getView().setCenter(endCoords);

        positionsSource.addFeature(positionFeature)
    })
    
    // animation rendering
    const animationsTl = gsap.timeline();
    await new Promise((resolve)=>setTimeout(resolve, 1000));
    positionsToAnimate.forEach(async (position, index) => {
        let animationLayer = null;
        let positionFeature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([
            position.lon,
            position.lat
        ])))

        position.date = new Date(position.at);
        position.day = DAYS[position.date.getDay()];
        position.numberDay = `${position.date.getDate().toString().padStart(2, '0')}/${position.date.getMonth().toString().padStart(2, '0')}`
        position.label = `${position.day} ${position.numberDay}\nà ${position.date.getHours()}H`

        positionFeature.attributes = position

        if(index==0) {
            positionsSource.addFeature(positionFeature);
            return;
        }

        const startCoords = ol.proj.transform([
            positionsToAnimate[index-1].lon, 
            positionsToAnimate[index-1].lat,
        ], GEOGRAPHIC_PROJ, MERCATOR_PROJ);

        const animationCoords = {
            ...startCoords
        }

        const endCoords =  ol.proj.transform([
            position.lon, 
            position.lat,
        ], GEOGRAPHIC_PROJ, MERCATOR_PROJ);
        
        const distanceBetweenStartEnd = ol.sphere.getLength(new ol.geom.LineString([startCoords, endCoords])); 
        const duration = getAnimationDurationFromDistance(distanceBetweenStartEnd);

        animationsTl.to(animationCoords, {
            duration,
            ...endCoords,
            // onStart: function() {
            //     console.groupCollapsed(`animation\nduration: ${duration}\ndistance: ${distanceBetweenStartEnd}`);
            // },
            onUpdate: function() {
                const line = new ol.geom.LineString([startCoords, animationCoords]);
                const lineFeature = new ol.Feature({
                    geometry: line
                });
                const lineSource = new ol.source.Vector({});
                lineSource.addFeature(lineFeature);
                lineLayer = new ol.layer.Vector({
                    source: lineSource,
                    style: MAP_STYLE.line,
                })
                map.addLayer(lineLayer);
                if(animationLayer) map.removeLayer(animationLayer);
                animationLayer = lineLayer;
                map.getView().setCenter(animationCoords);
                let zoom = getZoomFromTimeAndDuration(this.time(), duration);
                // console.log(zoom, this.time());
                map.getView().setZoom(zoom);
            },
            onComplete: function() {
                // console.groupEnd();
                positionsSource.addFeature(positionFeature)
                window.lc.set(LAST_ANIMATED_ID_LC_ITEM, positionFeature.attributes.id)
            }
        })
    })



    const unclusteredPositionsLayer = new ol.layer.Vector({
        maxResolution: CLUSTER_RESOLUTION,
        source: positionsSource,
        style: MAP_STYLE.unclustered_place,
        zIndex: 1000
    });
    map.addLayer(unclusteredPositionsLayer)

    const clusteredPositionsLayer = new ol.layer.Vector({
        minResolution: CLUSTER_RESOLUTION,
        source: new ol.source.Cluster({
            distance: CLUSTER_DISTANCE,
            source: positionsSource
        }),
        style: MAP_STYLE.clustered_place,
        zIndex: 1000
    });
    map.addLayer(clusteredPositionsLayer)


    const linesLayer = new ol.layer.Vector({
        source: linesSource
    });
    map.addLayer(linesLayer)

})()