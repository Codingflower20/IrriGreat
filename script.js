const API_URL = "https://x1m6pukjwc.execute-api.eu-north-1.amazonaws.com/GetData-1";
let charts = {};

function updateChart(ctxId, label, dataArray, color) {
    const canvas = document.getElementById(ctxId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (charts[ctxId]) charts[ctxId].destroy();

    charts[ctxId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataArray.map((_, i) => i + 1),
            datasets: [{
                label: label,
                data: dataArray,
                borderColor: color,
                backgroundColor: color + '10',
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
                y: { grid: { color: '#f5f5f5' }, ticks: { font: { size: 9 }, color: '#95a5a6' } }
            }
        }
    });
}

async function fetchSensorData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const i = data.t.length - 1;

        // Individual Charts
        updateChart("tempChart", "Temp", data.t, "#ff7675");
        updateChart("humChart", "Hum", data.h, "#74b9ff");
        updateChart("sunChart", "Sun", data.s, "#fdcb6e");
        updateChart("moistChart", "Moist", data.m, "#4f7942");
        updateChart("nChart", "N", data.n, "#55efc4");
        updateChart("pChart", "P", data.p, "#e67e22");
        updateChart("kChart", "K", data.k, "#9b59b6");

        // Live Cards
        const container = document.getElementById("data-container");
        const metrics = [
            { l: "Temp", v: data.t[i], u: "°C" },
            { l: "Humid", v: data.h[i], u: "%" },
            { l: "Sun", v: data.s[i], u: "%" },
            { l: "Moist", v: data.m[i], u: "%" },
            { l: "Nitro", v: data.n[i], u: "" },
            { l: "Phos", v: data.p[i], u: "" },
            { l: "Potas", v: data.k[i], u: "" }
        ];

        container.innerHTML = metrics.map(m => `
            <div class="data-card">
                <div style="font-size:0.7rem; color:#95a5a6; text-transform:uppercase;">${m.l}</div>
                <div class="value">${m.v}${m.u}</div>
            </div>
        `).join('');

        document.getElementById("time-stamp").innerText = new Date().toLocaleTimeString();
    } catch (err) { console.error("Sync Error:", err); }
}

setInterval(fetchSensorData, 30000);
fetchSensorData();
