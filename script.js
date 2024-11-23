let map, polyline, watchId, timerInterval;
let tracking = false, paused = false;
let totalDistance = 0, previousDistance = 0;
let coordinates = [];
let startTime, pauseTime = 0, elapsedTime = 0;

// Inicializa o mapa
function initMap() {
  map = L.map('map').setView([0, 0], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  polyline = L.polyline([], { color: 'blue' }).addTo(map);
}

// Calcula a distância entre dois pontos geográficos em km
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Atualiza o tempo decorrido
function updateElapsedTime() {
  const now = new Date();
  elapsedTime = (now - startTime - pauseTime) / 1000;
  const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
  const seconds = String(Math.floor(elapsedTime % 60)).padStart(2, '0');
  document.getElementById('timeElapsed').textContent = `${hours}:${minutes}:${seconds}`;
}

// Envia uma notificação push
function sendPushNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.showNotification('Rastreamento', {
          body: message,
          icon: './icon-192.png'
        });
      }
    });
  }
}

// Inicia o rastreamento
document.getElementById('start').addEventListener('click', () => {
  if (!tracking && navigator.geolocation) {
    tracking = true;
    paused = false;
    totalDistance = 0;
    coordinates = [];
    startTime = new Date();

    document.getElementById('start').disabled = true;
    document.getElementById('pause').disabled = false;
    document.getElementById('stop').disabled = false;

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;

        if (coordinates.length > 0) {
          const lastCoords = coordinates[coordinates.length - 1];
          totalDistance += calculateDistance(
            lastCoords.latitude,
            lastCoords.longitude,
            latitude,
            longitude
          );
          if (totalDistance > previousDistance + 0.1) {
            sendPushNotification(`Você percorreu ${totalDistance.toFixed(2)} km!`);
            previousDistance = totalDistance;
          }
        } else {
          document.getElementById('startLat').textContent = latitude.toFixed(6);
          document.getElementById('startLng').textContent = longitude.toFixed(6);
          document.getElementById('startAlt').textContent = altitude ? `${altitude.toFixed(2)} m` : 'N/A';
        }

        coordinates.push({ latitude, longitude });
        polyline.addLatLng([latitude, longitude]);
        map.setView([latitude, longitude]);
        document.getElementById('distance').textContent = totalDistance.toFixed(2);
      },
      (error) => alert('Erro ao acessar localização: ' + error.message),
      { enableHighAccuracy: true }
    );

    timerInterval = setInterval(updateElapsedTime, 1000);
  }
});

// Pausa o rastreamento
document.getElementById('pause').addEventListener('click', () => {
  if (tracking && !paused) {
    paused = true;
    pauseTime += new Date() - startTime - elapsedTime * 1000;

    document.getElementById('pause').textContent = 'CONTINUAR';
    navigator.geolocation.clearWatch(watchId);
    clearInterval(timerInterval);
  } else if (tracking && paused) {
    paused = false;
    startTime = new Date() - elapsedTime * 1000;

    document.getElementById('pause').textContent = 'PAUSAR';
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;

        if (coordinates.length > 0) {
          const lastCoords = coordinates[coordinates.length - 1];
          totalDistance += calculateDistance(
            lastCoords.latitude,
            lastCoords.longitude,
            latitude,
            longitude
          );
        }

        coordinates.push({ latitude, longitude });
        polyline.addLatLng([latitude, longitude]);
        map.setView([latitude, longitude]);
        document.getElementById('distance').textContent = totalDistance.toFixed(2);
      },
      (error) => alert('Erro ao acessar localização: ' + error.message),
      { enableHighAccuracy: true }
    );

    timerInterval = setInterval(updateElapsedTime, 1000);
  }
});

// Para o rastreamento
document.getElementById('stop').addEventListener('click', () => {
  if (tracking) {
    tracking = false;
    navigator.geolocation.clearWatch(watchId);
    clearInterval(timerInterval);

    const lastCoords = coordinates[coordinates.length - 1];
    document.getElementById('endLat').textContent = lastCoords.latitude.toFixed(6);
    document.getElementById('endLng').textContent = lastCoords.longitude.toFixed(6);
    document.getElementById('endAlt').textContent = lastCoords.altitude ? `${lastCoords.altitude.toFixed(2)} m` : 'N/A';

    const data = {
      start: {
        latitude: parseFloat(document.getElementById('startLat').textContent),
        longitude: parseFloat(document.getElementById('startLng').textContent),
        altitude: document.getElementById('startAlt').textContent
      },
      end: {
        latitude: lastCoords.latitude,
        longitude: lastCoords.longitude,
        altitude: document.getElementById('endAlt').textContent
      },
      distance: totalDistance,
      elapsedTime: document.getElementById('timeElapsed').textContent,
      coordinates
    };

    // Cria o Blob do JSON
    jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    // Exibe o botão de download
    const downloadButton = document.getElementById('downloadJson');
    downloadButton.classList.remove('hidden');
    downloadButton.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(jsonBlob);
      link.download = 'tracking_data.json';
      link.click();
    });

    document.getElementById('summary').classList.remove('hidden');
    document.getElementById('start').disabled = false;
    document.getElementById('pause').disabled = true;
    document.getElementById('stop').disabled = true;
  }
});

// Inicializa o mapa ao carregar
window.onload = initMap;
