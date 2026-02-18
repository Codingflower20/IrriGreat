const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";
let charts = {};

// 1. Improved Chart Helper
function createChart(ctxId, label, dataArray, color, labels) {
    const canvas = document.getElementById(ctxId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (charts[ctxId]) charts[ctxId].destroy();

    charts[ctxId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [{
                label: label,
                data: dataArray,
                borderColor: color,
                backgroundColor: color + '15',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { size: 12, family: 'Inter' } } }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.05)' }, 
                    ticks: { color: '#64748b' } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#64748b' } 
                }
            }
        }
    });
}

// 2. Fetch & Render
async function fetchSensorData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json(); 
        const count = data.t ? data.t.length : 0;
        const labels = Array.from({length: count}, (_, i) => `${i + 1}`);

        // RENDER CHARTS
        createChart("tempChart", "Temperature (°C)", data.t, "#ff3e3e", labels);
        createChart("humChart",  "Humidity (%)",     data.h, "#3385ff", labels);
        createChart("sunChart",  "Sunlight (%)",     data.s, "#ffcc00", labels);
        createChart("moistChart","Moisture (%)",     data.m, "#03dac6", labels);
        createChart("nChart",    "Nitrogen",         data.n, "#ef5350", labels);
        createChart("pChart",    "Phosphorus",       data.p, "#ffa726", labels);
        createChart("kChart",    "Potassium",        data.k, "#42a5f5", labels);

        // UPDATE LIVE CARDS
        const container = document.getElementById("data-container");
        container.innerHTML = "";
        
        if(count > 0) {
            const i = count - 1;
            const metrics = [
                { icon: "🌡️", title: "Temp", val: data.t[i], unit: "°C", col: "#ff3e3e" },
                { icon: "💧", title: "Humidity", val: data.h[i], unit: "%", col: "#3385ff" },
                { icon: "☀️", title: "Sunlight", val: data.s[i], unit: "%", col: "#ffcc00" },
                { icon: "🌱", title: "Moisture", val: data.m[i], unit: "%", col: "#03dac6" },
                { icon: "🔴", title: "Nitrogen", val: data.n[i], unit: "", col: "#ef5350" },
                { icon: "🟠", title: "Phosphorus", val: data.p[i], unit: "", col: "#ffa726" },
                { icon: "🔵", title: "Potassium", val: data.k[i], unit: "", col: "#42a5f5" }
            ];

            metrics.forEach(m => {
                container.innerHTML += `
                <div class="data-card" style="border-top: 4px solid ${m.col}">
                    <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:8px;">${m.icon} ${m.title}</div>
                    <div style="color:${m.col}; font-weight:600; font-size:1.5rem;">${m.val}${m.unit}</div>
                </div>`;
            });
        }
    } catch (err) {
        console.error("Fetch error:", err);
        document.getElementById("data-container").innerHTML = `<p style='color:#ef4444'>Connection Error</p>`;
    }
}

fetchSensorData();
setInterval(fetchSensorData, 30000);
