const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";

let charts = {};

function createChart(ctxId, label, data, color) {
  return new Chart(document.getElementById(ctxId), {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.Timestamp * 1000).toLocaleTimeString()),
      datasets: [{
        label,
        data: data.map(d => d[label]),
        borderColor: color,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function showAverages(data) {
  const latest = data.slice(-3);
  const avg = (key) => (latest.reduce((sum, i) => sum + i[key], 0) / latest.length).toFixed(2);
  document.getElementById("avg-temp").textContent = `Temperature Avg: ${avg("Temperature")} °C`;
  document.getElementById("avg-humidity").textContent = `Humidity Avg: ${avg("Humidity")} %`;
  document.getElementById("avg-moisture").textContent = `Moisture Avg: ${avg("Moisture")} %`;
  document.getElementById("avg-sunlight").textContent = `Sunlight Avg: ${avg("Sunlight")} %`;
}

async function fetchSensorData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const container = document.getElementById("data-container");
    container.innerHTML = "";

    // ➕ Only keep the latest 3 readings for the card display
    const recentData = data.slice(-3); 

    recentData.forEach(item => {
      const card = document.createElement("div");
      card.className = "data-card";
      card.innerHTML = `
        <h3>${new Date(item.Timestamp * 1000).toLocaleString()}</h3>
        <p>🌡️ Temperature: ${item.Temperature} °C</p>
        <p>💧 Humidity: ${item.Humidity} %</p>
        <p>🌱 Moisture: ${item.Moisture} %</p>
        <p>☀️ Sunlight: ${item.Sunlight} %</p>
      `;
      container.appendChild(card);
    });

    // 🎯 Still use full dataset for graphs and averages
    if (charts.tempChart) charts.tempChart.destroy();
    if (charts.humidityChart) charts.humidityChart.destroy();
    if (charts.moistureChart) charts.moistureChart.destroy();
    if (charts.sunlightChart) charts.sunlightChart.destroy();

    charts.tempChart = createChart("tempChart", "Temperature", data, "#ff3e3e");
    charts.humidityChart = createChart("humidityChart", "Humidity", data, "#3385ff");
    charts.moistureChart = createChart("moistureChart", "Moisture", data, "#33cc99");
    charts.sunlightChart = createChart("sunlightChart", "Sunlight", data, "#ffcc00");

    showAverages(data); // averages from full data
  } catch (err) {
    console.error("Failed to fetch sensor data:", err);
  }
}


fetchSensorData();
