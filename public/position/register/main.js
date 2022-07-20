const API_REGISTER_POSITION = '/api/position/register';
const logsList = document.getElementById('logs');

function sendRegisterPositionRequest(position) {   
    logsList.innerHTML += `<li>Envoi de la position au serveur...</li>`
    const logErrorSending = e=>{logsList.innerHTML += `<li>Erreur: ${e}</li>`};

    var xhr = new XMLHttpRequest();
    xhr.open("POST", API_REGISTER_POSITION, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    console.log(position);

    xhr.onload = function () {
        if (xhr.status == 200) {
            logsList.innerHTML += `<li>Nouvelle position enregistrée avec succès!</li>`
        } else {
            logErrorSending()
        }
    }

    xhr.onerror = function () {
        logErrorSending()
    }

    xhr.send(JSON.stringify({
        registerToken,
        position: {
            lon: position.coords.longitude,
            lat: position.coords.latitude,
            at: Date.now()
        }
    }));
}

function geolocationSuccess(position) {
    logsList.innerHTML += `<li>Position récupérée: ${position.coords.latitude}, ${position.coords.longitude}</li>`
    sendRegisterPositionRequest(position)
}

function geolocationFailure() {
    logsList.innerHTML += "<li>Veuillez autoriser l'accès à la position</li>"
}

if(navigator.geolocation){
    logsList.innerHTML += "<li>Géolocalisation supportée</li>"
    logsList.innerHTML += "<li>Récupération de la position en cours...</li>"
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
} else {
    logsList.innerHTML += "<li>Géolocalisation non supportée</li>"
}