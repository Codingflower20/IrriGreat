const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";
let charts = {};

function createChart(ctxId, label, dataArray, color) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    if (charts[ctxId]) charts[ctxId].destroy();

    charts[ctxId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: dataArray.length}, (_, i) => i + 1),
            datasets: [{
                label: label,
                data: dataArray,
                borderColor: color,
                backgroundColor: color + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: '#f0f0f0' }, ticks: { color: '#b2bec3' } }
            }
        }
    });
}

async function fetchSensorData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const i = data.t.length - 1;

        // Update Charts
        createChart("moistChart", "Moisture", data.m, "#4f7942");
        createChart("tempChart", "Temperature", data.t, "#e67e22");

        // Update Cards
        const container = document.getElementById("data-container");
        const metrics = [
            { icon: "🌡️", label: "Temp", val: data.t[i], unit: "°C" },
            { icon: "💧", label: "Humidity", val: data.h[i], unit: "%" },
            { icon: "☀️", label: "Light", val: data.s[i], unit: "%" },
            { icon: "🌱", label: "Moisture", val: data.m[i], unit: "%" },
            { icon: "🧪", label: "Nitrogen", val: data.n[i], unit: "" }
        ];

        container.innerHTML = metrics.map(m => `
            <div class="data-card">
                <span class="icon">${m.icon}</span>
                <div class="label">${m.label}</div>
                <div class="value">${m.val}${m.unit}</div>
            </div>
        `).join('');

        document.getElementById("time-stamp").innerText = new Date().toLocaleTimeString();
    } catch (e) { console.error(e); }
}

setInterval(fetchSensorData, 30000);
fetchSensorData();
