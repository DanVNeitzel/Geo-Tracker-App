let map, polyline, watchId, timerInterval;
let tracking = false, paused = false;
let totalDistance = 0;
let coordinates = [];
let startTime, pauseTime = 0, elapsedTime = 0;
let jsonBlob = null;

// Variáveis para velocidades
let maxSpeed = 0, totalSpeed = 0, speedCount = 0;

// Inicializa o mapa
function initMap() {
  map = L.map('map').setView([0, 0], 40);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© Vida de Patinador',
  }).addTo(map);
  polyline = L.polyline([], { color: 'Orange', weight: 3 }).addTo(map);
}

// Calcula a distância entre dois pontos
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

// Calcula e atualiza as velocidades
function calculateSpeed(lastCoords, latitude, longitude, timestamp) {
  const distance = calculateDistance(lastCoords.latitude, lastCoords.longitude, latitude, longitude);
  const timeDiff = (timestamp - lastCoords.timestamp) / 1000; // Tempo em segundos

  if (timeDiff > 0) {
    const speed = distance / (timeDiff / 3600); // Velocidade em km/h
    totalSpeed += speed;
    speedCount++;
    if (speed > maxSpeed) maxSpeed = speed;

    document.getElementById('maxSpeed').textContent = maxSpeed.toFixed(2);
    document.getElementById('avgSpeed').textContent = (totalSpeed / speedCount).toFixed(2);
  }
}

// Inicia o rastreamento
document.getElementById('start').addEventListener('click', () => {
  if (!tracking && navigator.geolocation) {
    tracking = true;
    paused = false;
    totalDistance = 0;
    maxSpeed = 0;
    totalSpeed = 0;
    speedCount = 0;
    coordinates = [];
    startTime = new Date();

    document.getElementById('start').disabled = true;
    document.getElementById('pause').disabled = false;
    document.getElementById('stop').disabled = false;

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, timestamp } = position.coords;

        if (coordinates.length > 0) {
          const lastCoords = coordinates[coordinates.length - 1];
          totalDistance += calculateDistance(
            lastCoords.latitude,
            lastCoords.longitude,
            latitude,
            longitude
          );
          calculateSpeed(lastCoords, latitude, longitude, timestamp);
        } else {
          document.getElementById('startLat').textContent = latitude.toFixed(6);
          document.getElementById('startLng').textContent = longitude.toFixed(6);
          document.getElementById('startAlt').textContent = altitude ? `${altitude.toFixed(2)} m` : 'N/A';
        }

        coordinates.push({ latitude, longitude, timestamp });
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
  if (tracking) {
    if (!paused) {
      paused = true;
      pauseTime += new Date() - startTime - elapsedTime * 1000;
      navigator.geolocation.clearWatch(watchId);
      clearInterval(timerInterval);
    } else {
      paused = false;
      startTime = new Date() - elapsedTime * 1000;
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude, timestamp } = position.coords;

          if (coordinates.length > 0) {
            const lastCoords = coordinates[coordinates.length - 1];
            totalDistance += calculateDistance(
              lastCoords.latitude,
              lastCoords.longitude,
              latitude,
              longitude
            );
            calculateSpeed(lastCoords, latitude, longitude, timestamp);
          }

          coordinates.push({ latitude, longitude, timestamp });
          polyline.addLatLng([latitude, longitude]);
          map.setView([latitude, longitude]);
          document.getElementById('distance').textContent = totalDistance.toFixed(2);
        },
        (error) => alert('Erro ao acessar localização: ' + error.message),
        { enableHighAccuracy: true }
      );
      timerInterval = setInterval(updateElapsedTime, 1000);
    }
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
        altitude: document.getElementById('startAlt').textContent,
      },
      end: {
        latitude: lastCoords.latitude,
        longitude: lastCoords.longitude,
        altitude: document.getElementById('endAlt').textContent,
      },
      distance: totalDistance,
      elapsedTime: document.getElementById('timeElapsed').textContent,
      maxSpeed: maxSpeed.toFixed(2),
      avgSpeed: (totalSpeed / speedCount).toFixed(2),
      coordinates,
    };

    jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    document.getElementById('summary').classList.remove('hidden');
    document.getElementById('start').disabled = false;
    document.getElementById('pause').disabled = true;
    document.getElementById('stop').disabled = true;

    document.getElementById('menuPrincipal').innerHTML += `
    <button id="downloadJson" class="btn btn-info btn-lg"><span class="material-icons">download</span></button>
  `;

  document.getElementById('downloadJson').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(jsonBlob);
    link.download = 'tracking_data.json';
    link.click();
  });
}
});

// Inicializa o mapa ao carregar
window.onload = initMap;
