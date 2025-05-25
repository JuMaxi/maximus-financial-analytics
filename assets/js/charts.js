// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

// Read data from localStorage and reconstruct the Indicators object
const storedIndicators = localStorage.getItem('indicators');
const indicators = storedIndicators ? JSON.parse(storedIndicators) : {};

// Chart.js code
document.addEventListener("DOMContentLoaded", function() {

    // Function to create bar chart html elements dinamically via JS
    function addBarChartCanvas(canvasId, containerSelector) {

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

    // Function to create Gauge chart
    function createGaugeChart(key, year, index) {
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
        
        updateNeedleGuageChart(indicator, key, year);

        // Show the value in the gauge
        document.getElementById(`gaugeValue${key}${year}`).textContent = indicator;
    }

    // Function to change the gauge chart needle
    function updateNeedleGuageChart(indicador, key, year) {
        const angle = 270 + ((indicador * 100) / 100) * 180; // 270 to 450 degrees
        const needle = document.getElementById(`needle${key}${year}`);
        needle.style.transform = `translate(-50%, 0%) rotate(${angle}deg)`;
    }

    // Function to create gauge chart html elements dinamically via JS
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

    // Function to selected indicators to create gauge charts
    function selectIndicatorToGaugeChart() {
        for (let key in indicators) {

            if (indicators[key].chartType === "doughnut") {
                addGaugeChartCanvas(key, "2025");
                addGaugeChartCanvas(key, "2024");

                createGaugeChart(key, "2025", 0);
                createGaugeChart(key, "2024", 1);
            } 
        }
    }

    // Function to create Pie chart
    function createPieChart(accounts, index, canvasId, year, chartTitle) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Build data arrays for each year using .map()
        let values = accounts.map(acc => data.get(acc) ? data.get(acc)[index] : 0);

        values = checkIfValueIsNegative(values);

        const dataToChart = {
            labels: accounts,
            datasets: [{
                label: "Total",
                data: values,
                backgroundColor: ['#3498db', '#2ecc71'],
                borderWidth: 0,
            }]
        };

        const config = {
            type: "pie",
            data: dataToChart,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: `${chartTitle} ${year}`
                    }
                }
            }
        };

        new Chart(ctx, config);
    }

    function createDoughnutChart(canvasId, group, chartTitle) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        let doughnut = Object.keys(indicators).filter(k => indicators[k].chartType === "doughnut" && indicators[k].group === group).map(k => indicators[k]);
        let values2025 = doughnut.map(v => v.values[0]);
        let values2024 = doughnut.map(v => v.values[1]);
        

        //values = checkIfValueIsNegative(values);

        const dataToChart = {
            labels: ["Gross Profit 2025", "Gross Profit 2024"],
            datasets: [{
                // label: "Total",
                data: [values2025, values2024],
                backgroundColor: ['#3498db', '#2ecc71'],
                borderWidth: 0,
            }]
        };

        const config = {
            type: "doughnut",
            data: dataToChart,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: chartTitle
                    }
                }
            }
        };

        new Chart(ctx, config);
    }

    function checkIfValueIsNegative(values) {
        for (let i = 0; i < values.length; i++) {
            if (values[i] < 0) {
                values[i] = Math.abs(values[i]);
            }
        }
        return values;
    }

    function createLineChart(canvasId, key) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        const dataLine = {
            labels:  ["2024", "2025"],
            datasets: [
                {
                    label: 'Free cash flow indicator from 2024 to 2025',
                    data: [indicators[key].values[1], indicators[key].values[0]],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
            ]
        };

        const config = {
            type: 'line',
            data: dataLine,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Free Cash Flow'
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    function createBubbleChart(canvasId, key1, key2) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        const dataBubble = {
            datasets: [{
                label: 'Revenue X Profit after tax',
                data: [{
                    x: data.get(key1)[0],
                    y: data.get(key2)[0],
                    r: 13 // size ball
                }, {
                    x: data.get(key1)[1],
                    y: data.get(key2)[1],
                    r: 8
                }],
                backgroundColor: 'rgb(255, 99, 132)'
            }]
        }
        
        const config = {
            type: 'bubble',
            data: dataBubble,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Gross Margin'
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    function chartBarChart(canvasId, group, chartTitle) {
        // Create html elements dinamically via JS to Bar Charts
        addBarChartCanvas(canvasId, "#chartsBar");
        const ctx = document.getElementById(canvasId).getContext('2d');

        let bars = Object.keys(indicators).filter(k => indicators[k].chartType === "bar" && indicators[k].group === group).map(k => indicators[k]);
        let labels = Object.keys(indicators).filter(k => indicators[k].chartType === "bar" && indicators[k].group === group);
        let values2025 = bars.map(v => v.values[0]);
        let values2024 = bars.map(v => v.values[1]);
        
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "2025",
                        data: values2025,
                        backgroundColor: "#3498db"
                    },
                    {
                        label: "2024",
                        data: values2024,
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
                        text: chartTitle
                    }
                }
            }
        });
    }    
    
    function createRadarChart(canvasId, group) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        let radars = Object.keys(indicators).filter(k => indicators[k].chartType === "radar" && indicators[k].group === group).map(k => indicators[k]);
        let labels = Object.keys(indicators).filter(k => indicators[k].chartType === "radar" && indicators[k].group === group);
        let values2025 = radars.map(v => v.values[0]);
        let values2024 = radars.map(v => v.values[1]);


        const dataRadar = {
           labels: labels,
            datasets: [{
                label: '2025',
                data: values2025,
                fill: true,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }, {
                label: '2024',
                data: values2024,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }]
        };

        const config = {
            type: 'radar',
            data: dataRadar,
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    createRadarChart("myRadarChart", "profit");
    createBubbleChart("myBubbleChart", "Revenue", "Profit after tax");
    createLineChart("myLineChart", "Free Cash Flow");    



    // Create html elements dinamically via JS to Pie Charts
    addBarChartCanvas("chart1Pie", "#chartsPie");
    addBarChartCanvas("chart2Pie", "#chartsPie");
    addBarChartCanvas("chart3Pie", "#chartsPie");
    addBarChartCanvas("chart4Pie", "#chartsPie");


    // Create Bar Charts (accounts not indicators)
    chartBarChart("chart1Bar", "solvency", "Solvency Ratios");
    chartBarChart("chart2Bar", "accounts", "Revenue X Profit");
    chartBarChart("chart3Bar", "cash insights", "Cash Flow Insights");
    chartBarChart("chart4Bar", "cash flow", "Cash Flow and Solvency");
  
    
    // Create Gauge Charts (ratio indicators)
    selectIndicatorToGaugeChart();

    // Create Pie Charts (accounts not indicators)
    createPieChart(["Intangible assets", "Goodwill", "Property, plant and equipment", "Deferred tax asset",
        "Cash and cash equivalents", "Trade and other receivables", "Current tax Receivable"], 0, "chart1Pie", 2025, "Assets BreakDown");
    createPieChart(["Intangible assets", "Goodwill", "Property, plant and equipment", "Deferred tax asset",
        "Cash and cash equivalents", "Trade and other receivables", "Current tax Receivable"], 1, "chart2Pie", 2024, "Assets BreakDown");
    createPieChart(["Share capital", "Other reserves", "Retained earnings", "Foreign exchange reserve"], 0, "chart3Pie", 2025, "Equity Composition");
    createPieChart(["Share capital", "Other reserves", "Retained earnings", "Foreign exchange reserve"], 1, "chart4Pie", 2024, "Equity Composition");
    
    // Create Doughnut Chart
    createDoughnutChart("myDoughnutChart", "profit", "Gross Profit");

});