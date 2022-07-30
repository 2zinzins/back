const fs = require('fs');

module.exports = function () {
    const positionData = {
        history: [],
        actual: null
    };

    const positionWithSameCoords = ({lon, lat, at}) => {
        if(positionData.history.length==0 || !positionData.actual) return false;
        return [...positionData.history, positionData.actual].find((test)=>test.lon==lon&&test.lat==lat)
    }

    const registerPosition = ({lon, lat, at, id}) => {
        if(positionData.actual) {
            positionData.history.push({...positionData.actual});
        }
        positionData.actual = {lon, lat, at, id};
        savePositionDataToFile();
    }

    const savePositionDataToFile = () => {
        try {
            let jsonData = JSON.stringify(positionData);
            fs.writeFileSync('storage/position.json', jsonData);            
        } catch(e) {
            console.error(e);
        }
    }
    const loadPositionDataFromFile = () => {
        try {
            let rawdata = fs.readFileSync('storage/position.json');
            let jsonData = JSON.parse(rawdata);
            
            positionData.history = jsonData.history || [];
            positionData.actual = jsonData.actual || null;

        } catch(e) {
            console.error(e);
        }
    }

    loadPositionDataFromFile();

    return {
        positionData,
        registerPosition,
        savePositionDataToFile,
        loadPositionDataFromFile,
        positionWithSameCoords
    }

}