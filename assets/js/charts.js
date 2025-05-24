// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

// Read data from localStorage and reconstruct the Indicators object
const storedIndicators = localStorage.getItem('indicators');
const indicators = storedIndicators ? JSON.parse(storedIndicators) : {};

// Chart.js code
document.addEventListener("DOMContentLoaded", function() {
    const containerSelector = "#chartsRow";

    function addChartCanvas(canvasId) {
        // Find the container where you want to add the chart
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Create the Bootstrap column div
        const colDiv = document.createElement('div');
        colDiv.className = "col-12 col-xl-6 d-flex justify-content-center mb-4";

        // Create the chart wrapper div
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = "chart-wrapper";

        // Create the canvas element
        const canvas = document.createElement('canvas');
        canvas.id = canvasId;

        // Put the canvas inside the wrapper, and the wrapper inside the column
        wrapperDiv.appendChild(canvas);
        colDiv.appendChild(wrapperDiv);

        // Add the column to the container
        container.appendChild(colDiv);
    }
  
    function createChart(accounts, canvasId, charTitle) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Build data arrays for each year using .map()
        const data2025 = accounts.map(acc => data.get(acc) ? data.get(acc)[0] : 0);
        const data2024 = accounts.map(acc => data.get(acc) ? data.get(acc)[1] : 0);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: accounts,
                datasets: [
                    {
                        label: "2025",
                        data: data2025,
                        backgroundColor: "#3498db"
                    },
                    {
                        label: "2024",
                        data: data2024,
                        backgroundColor: "#2ecc71"
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                    },
                    title: {
                        display: true,
                        text: charTitle
                    }
                }
            }
        });
    }

    // Gauge chart
    function initChart(key, year, index) {
        const ctx2 = document.getElementById(`gaugeChart${key}${year}`).getContext("2d");
        const indicator = indicators[key].values[index];
        new Chart(ctx2, {
            type: indicators[key].chartType,
            data: {
                labels: ["Red Zone", "Yellow Zone", "Green Zone"],
                datasets: [
                    // Background segments (red, yellow, green)
                    {
                        data: [40, 80, 30],
                        backgroundColor: [
                            "#dc3545", // Red
                            "#ffc107", // Yellow  
                            "#28a745" // Green
                        ],
                        cutout: "60%",
                        borderWidth: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                circumference: 180,
                rotation: 270,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    title: {
                    display: true,
                    text: key,
                    font: { size: 18 },
                    color: "#f5f5f5"
                }
                },
                animation: false,
            },
        });
        
        updateNeedle(indicator, key, year);

        // Show the value in the gauge
        document.getElementById(`gaugeValue${key}${year}`).textContent = indicator;
    }

    // Function to change the needle
    function updateNeedle(indicador, key, year) {
        const angle = 270 + ((indicador * 100) / 100) * 180; // 270 to 450 degrees
        const needle = document.getElementById(`needle${key}${year}`);
        needle.style.transform = `translate(-50%, 0%) rotate(${angle}deg)`;
    }

    function addGaugeChartCanvas(key, year) {
        // Find the container where you want to add the gauge chart
        const container = document.querySelector("#chartsGauge");
        if (!container) return;

        // Create a wrapper for the gauge chart
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = "chart-container";
        wrapperDiv.id = `gaugeContainer${key}${year}`;

        // Create the canvas element
        const canvas = document.createElement('canvas');
        canvas.id = `gaugeChart${key}${year}`;

        // Create the needle, center, and value elements
        const needle = document.createElement('div');
        needle.className = "needle";
        needle.id = `needle${key}${year}`;

        const needleCenter = document.createElement('div');
        needleCenter.className = "needle-center";
        needleCenter.id = `needleCenter${key}${year}`;

        const gaugeValue = document.createElement('div');
        gaugeValue.className = "gauge-value";
        gaugeValue.id = `gaugeValue${key}${year}`;

        // Append all elements to the wrapper
        wrapperDiv.appendChild(canvas);
        wrapperDiv.appendChild(needle);
        wrapperDiv.appendChild(needleCenter);
        wrapperDiv.appendChild(gaugeValue);

        // Add the wrapper to the container
        container.appendChild(wrapperDiv);
    }    

    function createGaugeChart() {
        for (let key in indicators) {

            if (indicators[key].chartType === "doughnut") {
                addGaugeChartCanvas(key, "2025");
                addGaugeChartCanvas(key, "2024");

                initChart(key, "2025", 0);
                initChart(key, "2024", 1);
            }
            
        }
    }


    addChartCanvas("chart1");
    addChartCanvas("chart2");
    addChartCanvas("chart3");
    addChartCanvas("chart4");

    createChart(["Revenue", "Gross profit", "Operating profit", "Profit after tax"], "chart1", "Revenue X Profit" );
    createChart(["Intangible assets", "Goodwill", "Property, plant and equipment", "Deferred tax asset",
        "Cash and cash equivalents", "Cash and cash equivalents", "Trade and other receivables", 
        "Current tax Receivable"], "chart2", "Assets Breakdown"
    );
    createChart(["Share capital", "Other reserves", "Retained earnings", "Foreign exchange reserve"], "chart3", "Equity Composition");
    createChart(["Cash generated from operating activities", "Net cash flow from investing activities"], "chart4", "Cash Flow Movement");

    createGaugeChart();

});