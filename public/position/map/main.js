const API_GET_POSITION = '/api/position/get';
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CLUSTER_DISTANCE = 30;
const CLUSTER_RESOLUTION = 80;
const TOTAL_LINE_ANIMATION_TIME = 3000; // milliseconds

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

function drawAnimatedLine({map, startCoords, endCoords, style, steps, time}) {
    return new Promise((resolve)=>{
        console.time('test');
        const directionX = (endCoords[0] - startCoords[0]) / steps;
        const directionY = (endCoords[1] - startCoords[1]) / steps;
        let i = 0;
        let prevLayer;
        let ivlDraw = setInterval(function () {
            if (i > steps) {
                clearInterval(ivlDraw);
                console.timeEnd('test');
                resolve();
                return;
            }
            const newEndCoords = [startCoords[0] + i * directionX, startCoords[1] + i * directionY];
            const line = new ol.geom.LineString([startCoords, newEndCoords]);
            const lineFeature = new ol.Feature({
                geometry: line
            });
            const lineSource = new ol.source.Vector({});
            lineSource.addFeature(lineFeature);
            lineLayer = new ol.layer.Vector({
                source: lineSource,
                style
            })
            map.addLayer(lineLayer);
            if(prevLayer) map.removeLayer(prevLayer);
            prevLayer = lineLayer;
            i++;
        }, time / steps);
    })
}
(async ()=>{

    const rawPositionData = await fetchPositionData();
    const positionData = JSON.parse(rawPositionData);

    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({source: new ol.source.Stamen({layer: 'watercolor'})}),
            new ol.layer.Tile({source: new ol.source.Stamen({layer: 'terrain-labels'})}),
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([
                positionData.history[0].lon,
                positionData.history[0].lat
            ]),
            zoom: 11
        })
    });

    const positionsSource = new ol.source.Vector({});
    const linesSource = new ol.source.Vector({});

    const allPositions = [...positionData.history, positionData.actual]
    
    const animationsTl = gsap.timeline();

    await new Promise((resolve)=>setTimeout(resolve, 1000));
    allPositions.forEach(async (position, index) => {
        let animationLayer = null;
        let positionFeature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([
            position.lon,
            position.lat
        ])))

        position.date = new Date(position.at);
        position.day = DAYS[position.date.getDay()];
        position.label = `${position.day}\nà ${position.date.getHours()}H`

        positionFeature.attributes = position

        if(index==0) {
            positionsSource.addFeature(positionFeature)
        } else {
            const startCoords = ol.proj.transform([
                allPositions[index-1].lon, 
                allPositions[index-1].lat,
            ], 'EPSG:4326', 'EPSG:3857');
            const endCoords = {
                ...startCoords
            }
            const finalEndCoords =  ol.proj.transform([
                position.lon, 
                position.lat,
            ], 'EPSG:4326', 'EPSG:3857');
            

            animationsTl.to(endCoords, {
                duration: 1,
                ...finalEndCoords,
                onUpdate: function() {
                    const line = new ol.geom.LineString([startCoords, endCoords]);
                    const lineFeature = new ol.Feature({
                        geometry: line
                    });
                    const lineSource = new ol.source.Vector({});
                    lineSource.addFeature(lineFeature);
                    lineLayer = new ol.layer.Vector({
                        source: lineSource,
                        style: feature=>new ol.style.Style({
                            fill: new ol.style.Fill({ 
                                color: '#000000', weight: 10 }),
                            stroke: new ol.style.Stroke({ 
                                color: '#000000', 
                                width: 3,
                                lineDash: [5,5],
                            })
                        }),
                    })
                    map.addLayer(lineLayer);
                    if(animationLayer) map.removeLayer(animationLayer);
                    animationLayer = lineLayer;
                    map.getView().setCenter(endCoords);
                },
                onComplete: function() {
                    positionsSource.addFeature(positionFeature)
                }
            })
        }
    })



    const unclusteredPositionsLayer = new ol.layer.Vector({
        maxResolution: CLUSTER_RESOLUTION,
        source: positionsSource,
        style: feature=>new ol.style.Style({
            image: new ol.style.Icon({
                src: '/place.png',
                anchor: [0.5, 1],
                scale: 0.8
            }),
            text: new ol.style.Text({
                text: feature.attributes.label,
                font: '15px Arial',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                offsetY: 20
            })
        })
    });
    map.addLayer(unclusteredPositionsLayer)

    const clusteredPositionsLayer = new ol.layer.Vector({
        minResolution: CLUSTER_RESOLUTION,
        source: new ol.source.Cluster({
            distance: CLUSTER_DISTANCE,
            source: positionsSource
        }),
        style: function(feature) {
            return new ol.style.Style({
                image: new ol.style.Icon({
                    src: '/place.png',
                    anchor: [0.5, 1],
                    scale: 0.8
                })
            })
        }
    });
    map.addLayer(clusteredPositionsLayer)


    const linesLayer = new ol.layer.Vector({
        source: linesSource
    });
    map.addLayer(linesLayer)

})()