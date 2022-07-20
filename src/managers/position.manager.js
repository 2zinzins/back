const fs = require('fs');

module.exports = function () {
    const positionData = {
        history: [],
        actual: null
    };

    const registerPosition = ({lon, lat, at}) => {
        if(positionData.actual) {
            positionData.history.push({...positionData.actual});
        }
        positionData.actual = {lon, lat, at};
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
            
            positionData.history = jsonData.history;
            positionData.actual = jsonData.actual;

        } catch(e) {
            console.error(e);
        }
    }

    loadPositionDataFromFile();

    return {
        positionData,
        registerPosition,
        savePositionDataToFile,
        loadPositionDataFromFile
    }

}