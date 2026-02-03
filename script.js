// REPLACE with your actual API Gateway URL
const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";

let charts = {};

// Helper to create charts
function createChart(ctxId, label, dataArray, color, labels) {
  const ctx = document.getElementById(ctxId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels, // X-Axis Labels (Pt 1, Pt 2...)
      datasets: [{
        label: label,
        data: dataArray,
        borderColor: color,
        backgroundColor: color + '20', // Add slight fill transparency
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#ccc' } } // Dark mode text
      },
      scales: {
        y: { 
            beginAtZero: true,
            grid: { color: '#333' },
            ticks: { color: '#888' }
        },
        x: {
            grid: { color: '#333' },
            ticks: { color: '#888' }
        }
      }
    }
  });
}

function showAverages(data) {
    // Helper to calc average of an array
    const calcAvg = (arr) => {
        if(!arr || arr.length === 0) return 0;
        const sum = arr.reduce((a, b) => a + b, 0);
        return (sum / arr.length).toFixed(1);
    };

    document.getElementById("avg-moisture").textContent = `Moisture: ${calcAvg(data.m)} %`;
    document.getElementById("avg-n").textContent = `Nitrogen: ${calcAvg(data.n)} mg/kg`;
    document.getElementById("avg-p").textContent = `Phosphorus: ${calcAvg(data.p)} mg/kg`;
    document.getElementById("avg-k").textContent = `Potassium: ${calcAvg(data.k)} mg/kg`;
}

async function fetchSensorData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json(); 
    
    // Note: data is now object { m:[], n:[], p:[], k:[] }
    
    // 1. Update Charts
    // Generate generic labels "1" to "10" since Python didn't return timestamps
    const labels = data.m.map((_, i) => `Pt ${i + 1}`);

    if (charts.moistureChart) charts.moistureChart.destroy();
    if (charts.nChart) charts.nChart.destroy();
    if (charts.pChart) charts.pChart.destroy();
    if (charts.kChart) charts.kChart.destroy();

    charts.moistureChart = createChart("moistureChart", "Soil Moisture (%)", data.m, "#03dac6", labels);
    charts.nChart = createChart("nChart", "Nitrogen (N)", data.n, "#ef5350", labels);
    charts.pChart = createChart("pChart", "Phosphorus (P)", data.p, "#ffa726", labels);
    charts.kChart = createChart("kChart", "Potassium (K)", data.k, "#42a5f5", labels);

    // 2. Update Averages
    showAverages(data);

    // 3. Update "Live" Card (Take the last point)
    const container = document.getElementById("data-container");
    container.innerHTML = "";
    
    // Check if we have data
    if(data.m.length > 0) {
        const lastIdx = data.m.length - 1;
        const card = document.createElement("div");
        card.className = "data-card";
        card.innerHTML = `
            <h3>Latest Reading</h3>
            <p>🌱 Moisture: <span style="color:#03dac6">${data.m[lastIdx]}%</span></p>
            <p>🔴 Nitrogen: ${data.n[lastIdx]}</p>
            <p>🟠 Phosphorus: ${data.p[lastIdx]}</p>
            <p>🔵 Potassium: ${data.k[lastIdx]}</p>
        `;
        container.appendChild(card);
    }

  } catch (err) {
    console.error("Failed to fetch sensor data:", err);
    document.getElementById("data-container").innerHTML = "<p style='color:red'>Error loading data.</p>";
  }
}

// Initial Load
fetchSensorData();
// Refresh every 30 seconds
setInterval(fetchSensorData, 30000);
