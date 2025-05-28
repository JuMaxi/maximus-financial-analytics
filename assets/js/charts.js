// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

// Read data from localStorage and reconstruct the Indicators object
const storedIndicators = localStorage.getItem('indicators');
const indicators = storedIndicators ? JSON.parse(storedIndicators) : {};

// Chart.js code
document.addEventListener("DOMContentLoaded", function() {
    Chart.defaults.color = "#ddd";
    Chart.defaults.borderColor = "#444";

    // Global variables
    // Purple-magenta-blue range palette
    const titleColor = "#f5f5f5";
    const backgroundChart1 = "#960f88";
    const backgroundChart2 = "#441375";
    const backgroundChart3 = "#246C9A";
    const backgroundChart4 = "#CD74F3";
    const backgroundChart5 = "#a0486a";
    const backgroundChart6 = "#36a2eb";
    const backgroundChart7 = "#e5aed6";
    const backgroundChart8 = "#BFD7F6"; 
    const backgroundChart9 = "#7A51A1";
    const backgroundChart10 = "#5E0C50";
    const backgroundChart11 = "#8A3E8F";
    const backgroundChart12 = "#3A5F8A";

    // Function to create Gauge chart
    function createGaugeChart(key, year, index) {
        const ctx2 = document.getElementById(`gaugeChart${key}${year}`).getContext("2d");
        const indicator = indicators[key].values[index];
        new Chart(ctx2, {
            type: indicators[key].chartType,
            data: {
                labels: ["Red Zone", "Yellow Zone", "Green Zone"],
                datasets: [
                    {
                        data: [33, 33, 33],
                        backgroundColor: [backgroundChart8, backgroundChart9, backgroundChart10],
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
                        enabled: true
                    },
                    title: {
                    display: true,
                    text: `${key} ${year}`,
                    font: { size: 13 },
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
        const container = document.querySelector(`#chartsGauge .row`);
        if (!container) return;

        // Create a Bootstrap column wrapper
        const colDiv = document.createElement('div');
        colDiv.className = "col-12 col-sm-6 d-flex align-items-center justify-content-center py-3 mb-2"; // Responsive column

        // Create a wrapper for the gauge chart
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = "chart-container"; // custom styling
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

        // Append elements to the wrapper
        wrapperDiv.appendChild(canvas);
        wrapperDiv.appendChild(needle);
        wrapperDiv.appendChild(needleCenter);
        wrapperDiv.appendChild(gaugeValue);

        // Append the wrapper to the column, then to the container
        colDiv.appendChild(wrapperDiv);
        container.appendChild(colDiv);
    }    

    // Function to selected indicators to create gauge charts
    function selectIndicatorToGaugeChart() {
        for (let key in indicators) {

            if (indicators[key].chartType === "doughnut" && indicators[key].group === "gauge") {
                addGaugeChartCanvas(key, "2025");
                addGaugeChartCanvas(key, "2024");

                createGaugeChart(key, "2025", 0);
                createGaugeChart(key, "2024", 1);
            } 
        }
    }

    // Function to create Pie chart
    function createPieChart(canvasId, group, index, year) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        console.log(indicators);
        let bars = Object.keys(indicators).filter(k => indicators[k].chartType === "pie" && indicators[k].group === group).map(k => indicators[k]);
        let labels = Object.keys(indicators).filter(k => indicators[k].chartType === "pie" && indicators[k].group === group);
        let values = bars.map(v => v.values[index]);

        values = checkIfValueIsNegative(values);

        const dataToChart = {
            labels: labels,
            datasets: [{
                label: "Total",
                data: values,
                backgroundColor: [backgroundChart1, backgroundChart2, backgroundChart3, backgroundChart4, backgroundChart5, backgroundChart6, backgroundChart7],
                borderWidth: 0,
            }]
        };

        const config = {
            type: "pie",
            data: dataToChart,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    title: {
                        display: true,
                        align: "center",
                        text: `${group} ${year}`,
                        color: titleColor
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
                backgroundColor: [backgroundChart4, backgroundChart3],
                borderWidth: 0,
            }]
        };

        const config = {
            type: "doughnut",
            data: dataToChart,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: chartTitle,
                        color: titleColor
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
                    label: "2024 to 2025",
                    data: [indicators[key].values[1], indicators[key].values[0]],
                    fill: false,
                    borderColor: backgroundChart3,
                    tension: 0.1
                },
            ]
        };

        const config = {
            type: 'line',
            data: dataLine,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Free Cash Flow',
                        color: titleColor
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
                backgroundColor: backgroundChart4
            }]
        }
        
        const config = {
            type: 'bubble',
            data: dataBubble,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Gross Margin',
                        color: titleColor
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    function chartBarChart(canvasId, group, chartTitle) {
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
                        backgroundColor: backgroundChart2
                    },
                    {
                        label: "2024",
                        data: values2024,
                        backgroundColor:  backgroundChart1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        text: chartTitle,
                        color: titleColor
                    },
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
                label: "2025",
                data: values2025,
                fill: true,
                backgroundColor: "rgb(221, 107, 246, 0.2)",
                borderColor: backgroundChart5,
                pointBackgroundColor: backgroundChart5,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: backgroundChart5
            }, {
                label: "2024",
                data: values2024,
                fill: true,
                backgroundColor: "rgb(54, 162, 235, 0.2)",
                borderColor: backgroundChart6,
                pointBackgroundColor: backgroundChart6,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: backgroundChart6
            }]
        };

        const config = {
            type: "radar",
            data: dataRadar,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                    title: {
                        display: true,
                        text: "Operating Margin",
                        color: titleColor,
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    function createBarHorizontalChart(canvasId, group, chartTitle) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        let bars = Object.keys(indicators).filter(k => indicators[k].chartType === "bar" && indicators[k].group === group).map(k => indicators[k]);
        let labels = Object.keys(indicators).filter(k => indicators[k].chartType === "bar" && indicators[k].group === group);
        let values2025 = bars.map(v => v.values[0]);
        let values2024 = bars.map(v => v.values[1]);

        const dataBar = {
            labels: labels,
            datasets: [
                {
                    label: "2025",
                    data: values2025,
                    backgroundColor: backgroundChart11,
                },
                {
                    label: "2024",
                    data: values2024,
                    backgroundColor: backgroundChart12,
                }
            ]
        };

        const config = {
            type: 'bar',
            data: dataBar,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                elements: {
                    bar: {
                        borderWidth: 2,
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `${chartTitle}`,
                        color: titleColor
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    function writeCards(group) {
        let bars = Object.keys(indicators).filter(k => indicators[k].group === group).map(k => indicators[k]);
        let labels = Object.keys(indicators).filter(k => indicators[k].group === group);
        let values2025 = bars.map(v => v.values[0]);
        let values2024 = bars.map(v => v.values[1]);

        for (let i = 0; i < values2025.length; i++) {
            const card = document.getElementById(`card${i+1}`);
            
            const account = document.createElement("h5");
            account.textContent = labels[i];
            account.style.paddingBottom = "10px";
            account.style.fontSize = "22px";
            account.style.textShadow = "1px 1px 1px rgba(1, 8, 32, 0.34)";

            const paragraph2025 = document.createElement("p");
            paragraph2025.innerHTML = `${values2025[i].toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            })}
            <i class="fa-solid fa-arrow-up fa-xl" style="color: #389473;"></i>`;

            paragraph2025.style.textShadow = "1px 1px 1px rgba(1, 8, 32, 0.22)";

            const paragraph2024 = document.createElement("p");
            paragraph2024.textContent = values2024[i].toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            });
            paragraph2024.style.textShadow = "1px 1px 1px rgba(1, 8, 32, 0.22)";

            // Append the child elements to the card
            card.appendChild(account);
            card.appendChild(paragraph2025);
            card.appendChild(paragraph2024);
        }
    }

    writeCards("accounts");

    createRadarChart("myRadarChart", "profit");
    createBubbleChart("myBubbleChart", "Revenue", "Profit after tax");
    createLineChart("myLineChart", "Free Cash Flow");    


    // Create Bar Charts (accounts not indicators)
    chartBarChart("chartBar1", "solvency", "Solvency Ratios");
    chartBarChart("chartBar2", "accounts", "Revenue X Profit");
    chartBarChart("chartBar3", "cash insights", "Cash Flow Insights");
    chartBarChart("chartBar4", "cash flow", "Cash Flow and Solvency");
  
    
    // Create Gauge Charts (ratio indicators)
    selectIndicatorToGaugeChart();

    // Create Pie Charts (accounts not indicators)
    createPieChart("chartPie1", "Assets BreakDown", 0, 2025);
    createPieChart("chartPie2", "Assets BreakDown", 1, 2024);

    // Create Horizontal Bar Charts
    createBarHorizontalChart("myHorizontalBarChart1", "equity", "Equity Composition Other Reserves and Retained Earnings");
    createBarHorizontalChart("myHorizontalBarChart2", "equity2", "Equity Composition Share Capital and Foreign Exchange");
    
    // Create Doughnut Chart
    createDoughnutChart("myDoughnutChart", "profit", "Gross Profit");

});