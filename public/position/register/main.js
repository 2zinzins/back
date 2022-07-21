const API_REGISTER_POSITION = '/api/position/register';
const logsList = document.getElementById('logs');
const registerPositionBtn = document.getElementById('registerPositionBtn');

const logger = new Logger(logsList);

function sendRegisterPositionRequest(position) {   
    logger.log({
        text: 'Envoi de la position au serveur...',
        state: 'loading'
    })
    const logErrorSending = e=>{
        logger.getLast().update({
            text: `Erreur serveur: ${e}`,
            state: 'error'
        })
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", API_REGISTER_POSITION, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    console.log(position);

    xhr.onload = function () {
        if (xhr.status == 200) {
            logger.getLast().update({
                text: `Nouvelle position enregistrée avec succès!`,
                state: 'success'
            })
        } else {
            logErrorSending(xhr.responseText)
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
    logger.getLast().update({
        text: `Position récupérée: ${position.coords.latitude}, ${position.coords.longitude}`,
        state: 'success'
    })
    registerPositionBtn.addEventListener('click', function() {
        registerPositionBtn.classList.add('hidden')
        sendRegisterPositionRequest(position)
    })
    registerPositionBtn.classList.remove('hidden')
}

function geolocationFailure() {
    logger.getLast().update({
        text: 'Veuillez autoriser l\'accès à la position',
        state: 'error'
    })
}

if(navigator.geolocation){
    logger.log({
        text: 'Géolocalisation supportée',
        state: 'success'
    })
    logger.log({
        text: 'Récupération de la position en cours...',
        state: 'loading'
    })
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
} else {
    logger.log({
        text: 'Géolocalisation non supportée',
        state: 'error'
    })
}