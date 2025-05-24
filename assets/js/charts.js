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
    function initChart(key, index) {
        const ctx2 = document.getElementById("gaugeChart").getContext("2d");
        console.log(indicators);
        const indicator = indicators[key][index];
        
        let gaugeChart = new Chart(ctx2, {
            type: "doughnut",
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
        
        updateNeedle(indicator);

        // Show the value in the gauge
        document.getElementById('gaugeValue').textContent = indicator;
    }

    // Function to change the needle
    function updateNeedle(value) {
        const angle = 270 + ((value * 100) / 100) * 180; // 270 to 450 degrees
        const needle = document.getElementById('needle');
        needle.style.transform = `translate(-50%, 0%) rotate(${angle}deg)`;
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

    // Initialize the chart when page loads
    initChart("Current Ratio", 0);

});