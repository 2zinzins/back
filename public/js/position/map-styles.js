const getImagePlace = features => (
    features.some(feature=> feature.attributes.id == window.lc.get(LAST_ANIMATED_ID_LC_ITEM)) ?
    '/zinzin-x128.png'
    :
    '/zinzin-x128-wb.png'
);

window.MAP_STYLE = {
    clustered_place: feature=> {
        return new ol.style.Style({
        image: new ol.style.Icon({
            src: getImagePlace(feature.get('features')),
            scale: 0.4
        }),
    })},
    unclustered_place: feature=>new ol.style.Style({
        image: new ol.style.Icon({
            src: getImagePlace([feature]),
            scale: 0.6
        }),
        text: new ol.style.Text({
            text: feature.attributes.label,
            font: '15px Arial',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            offsetY: 60
        })
    }),
    line: feature=>new ol.style.Style({
        fill: new ol.style.Fill({ 
            color: '#FFF', weight: 10 }),
        stroke: new ol.style.Stroke({ 
            color: '#FFF', 
            width: 4,
            lineDash: [10,10],
        })
    })
}