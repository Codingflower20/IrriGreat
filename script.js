// REPLACE with your API Gateway URL
const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";

let charts = {};

// 1. Chart Helper Function
function createChart(ctxId, label, dataArray, color, labels) {
  const ctx = document.getElementById(ctxId).getContext('2d');
  
  // Destroy old chart if exists to prevent glitching
  if (charts[ctxId]) charts[ctxId].destroy();

  charts[ctxId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels, 
      datasets: [{
        label: label,
        data: dataArray,
        borderColor: color,
        backgroundColor: color + '20', // Transparent fill
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#ccc' } } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } },
        x: { grid: { color: '#333' }, ticks: { color: '#888' } }
      }
    }
  });
}

// 2. Main Fetch Function
async function fetchSensorData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const data = await response.json(); 
    
    // Create generic labels "1" to "10"
    // (Use data.t length to determine count)
    const count = data.t ? data.t.length : 0;
    const labels = Array.from({length: count}, (_, i) => `Pt ${i + 1}`);

    // --- RENDER 7 CHARTS ---
    createChart("tempChart", "Temperature (°C)", data.t, "#ff3e3e", labels);
    createChart("humChart",  "Humidity (%)",     data.h, "#3385ff", labels);
    createChart("sunChart",  "Sunlight (%)",     data.s, "#ffcc00", labels);
    
    createChart("moistChart","Moisture (%)",     data.m, "#03dac6", labels);
    createChart("nChart",    "Nitrogen (mg/kg)", data.n, "#ef5350", labels);
    createChart("pChart",    "Phosphorus (mg/kg)",data.p, "#ffa726", labels);
    createChart("kChart",    "Potassium (mg/kg)", data.k, "#42a5f5", labels);

    // --- UPDATE LIVE CARDS (Last Point) ---
    const container = document.getElementById("data-container");
    container.innerHTML = "";
    
    if(count > 0) {
        const i = count - 1; // Last index
        
        // Helper to build a card
        const addCard = (icon, title, val, unit, color) => {
            container.innerHTML += `
            <div class="data-card" style="border-top: 3px solid ${color}">
                <h3>${icon} ${title}</h3>
                <p style="color:${color}; font-weight:bold; font-size:1.4rem;">${val}${unit}</p>
            </div>`;
        };

        addCard("🌡️", "Temp", data.t[i], "°C", "#ff3e3e");
        addCard("💧", "Humidity", data.h[i], "%", "#3385ff");
        addCard("☀️", "Sunlight", data.s[i], "%", "#ffcc00");
        addCard("🌱", "Moisture", data.m[i], "%", "#03dac6");
        addCard("🔴", "Nitrogen", data.n[i], "", "#ef5350");
        addCard("🟠", "Phosphorus", data.p[i], "", "#ffa726");
        addCard("🔵", "Potassium", data.k[i], "", "#42a5f5");
    } else {
        container.innerHTML = "<p>No data received yet.</p>";
    }

  } catch (err) {
    console.error("Fetch error:", err);
    document.getElementById("data-container").innerHTML = 
        `<p style='color:#ff3e3e'>⚠️ Error: ${err.message}. Check Console.</p>`;
  }
}

// Start
fetchSensorData();
setInterval(fetchSensorData, 30000); // Auto-refresh every 30s
