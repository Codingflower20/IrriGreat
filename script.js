const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";
let charts = {};

function createChart(ctxId, datasets) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    if (charts[ctxId]) charts[ctxId].destroy();

    charts[ctxId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datasets[0].data.map((_, i) => i + 1),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } },
            scales: {
                x: { display: false },
                y: { grid: { color: '#f0f0f0' }, ticks: { color: '#b2bec3', font: { size: 10 } } }
            }
        }
    });
}

async function fetchSensorData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const i = data.t.length - 1;

        // 1. Restore Charts (Grouped for 2x2 layout)
        createChart("tempChart", [
            { label: 'Temp', data: data.t, borderColor: '#ff7675', tension: 0.4, pointRadius: 0 },
            { label: 'Humidity', data: data.h, borderColor: '#74b9ff', tension: 0.4, pointRadius: 0 }
        ]);
        createChart("moistChart", [
            { label: 'Moisture', data: data.m, borderColor: '#55efc4', tension: 0.4, pointRadius: 0 },
            { label: 'Sunlight', data: data.s, borderColor: '#ffeaa7', tension: 0.4, pointRadius: 0 }
        ]);
        createChart("nChart", [
            { label: 'Nitrogen', data: data.n, borderColor: '#4f7942', tension: 0.4, pointRadius: 0 }
        ]);
        createChart("pkChart", [
            { label: 'Phosphorus', data: data.p, borderColor: '#e67e22', tension: 0.4, pointRadius: 0 },
            { label: 'Potassium', data: data.k, borderColor: '#9b59b6', tension: 0.4, pointRadius: 0 }
        ]);

        // 2. Restore all 7 Live Cards
        const container = document.getElementById("data-container");
        const metrics = [
            { l: "Temp", v: data.t[i], u: "°C", i: "🌡️" },
            { l: "Humid", v: data.h[i], u: "%", i: "💧" },
            { l: "Sun", v: data.s[i], u: "%", i: "☀️" },
            { l: "Moist", v: data.m[i], u: "%", i: "🌱" },
            { l: "Nitro", v: data.n[i], u: "", i: "🧪" },
            { l: "Phos", v: data.p[i], u: "", i: "🟠" },
            { l: "Potas", v: data.k[i], u: "", i: "🔵" }
        ];

        container.innerHTML = metrics.map(m => `
            <div class="data-card">
                <div class="label">${m.i} ${m.l}</div>
                <div class="value">${m.v}${m.u}</div>
            </div>
        `).join('');

        document.getElementById("time-stamp").innerText = new Date().toLocaleTimeString();
    } catch (err) { console.error("Data Fetch Error:", err); }
}

setInterval(fetchSensorData, 30000);
fetchSensorData();
