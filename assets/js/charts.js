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

    // This object is created to store a copy of the charts. So when the modal is in use, it will show the chart
    const chartConfigs = {};
    
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

        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
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

        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
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

        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
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

        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
        new Chart(ctx, config);
    }

    function chartBarChart(canvasId, group, chartTitle) {
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
                    backgroundColor: backgroundChart2,
                },
                {
                    label: "2024",
                    data: values2024,
                    backgroundColor: backgroundChart1,
                }
            ]
        };
        
        const config = {
            type: "bar",
            data: dataBar,
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
        }
        
        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
        new Chart(ctx, config);
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
        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
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

        chartConfigs[canvasId] = JSON.parse(JSON.stringify(config)); // store a pure data copy
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
            paragraph2025.innerHTML = `2025 - ${values2025[i].toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            })}
            <i class="fa-solid fa-arrow-up fa-xl" style="color: #389473;"></i>`;

            paragraph2025.style.textShadow = "1px 1px 1px rgba(1, 8, 32, 0.22)";

            const paragraph2024 = document.createElement("p");
            paragraph2024.textContent = `2024 - ${values2024[i].toLocaleString("en-GB", {
                style: "currency",
                currency: "GBP"
            })}`;
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

    const chartInfoMap = {
        chartBar1: {
            debtToEquity: {
                title: "Debt-to-Equity Ratio",
                info1: "Compares total debt to shareholders’ equity. It reflects how much debt a company uses for every unit of equity.",
                info2: "A higher ratio suggests more reliance on debt (higher financial risk), while a lower ratio means the company is more equity-financed (potentially lower risk).",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 1.0", "= 1.0", "> 1.0", "> 2.0"],
                    meaning: ["More equity than debt", "Equal debt and equity", "More debt than equity", "Heavy reliance on debt"],
                    riskLevel: ["Low risk", "Balanced", "Higher risk", "Very high risk"],
                },
                calculation: {
                    accounts: ["Total Liabilities", "Shareholders' Equity"],
                    info3: "All debts and obligations the company owes.",
                    info4: "What remains for shareholders after liabilities are subtracted from assets."
                }
            },
            debtRatio: {
                title: "Debt Ratio",
                info1: "Measures the proportion of a company’s assets that are financed through debt.",
                info2: "A higher ratio indicates greater leverage and financial risk, while a lower ratio suggests a more conservative use of debt.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.5", "= 0.5", "> 0.5", "> 0.75"],
                    meaning: ["Low debt usage", "Balanced", "More debt-financed", "High debt burden"],
                    riskLevel: ["Low risk", "Moderate", "High risk", "Very high risk"],
                },
                calculation: {
                    accounts: ["Total Liabilities", "Total Assets"],
                    info3: "All debts and obligations the company owes.",
                    info4: "The total value of everything the company owns."
                }
            },
            equityRatio: {
                title: "Equity Ratio",
                info1: "Shows the proportion of a company’s total assets financed by shareholders' equity.",
                info2: "A higher ratio indicates stronger equity funding, while a lower ratio suggests reliance on debt.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.3", "= 0.5", "> 0.5", "> 0.7"],
                    meaning: ["Low equity", "Balanced", "Strong equity base", "Very strong equity base"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"],
                },
                calculation: {
                    accounts: ["Shareholders' Equity", "Total Assets"],
                    info3: "What remains for shareholders after liabilities are subtracted from assets.",
                    info4: "The total value of everything the company owns."
                }
            }
        },
        chartBar3: {
            operatingCashFlow: {
                title: "Cash Generated from Operating Activities",
                info1: "Represents the amount of cash a company generates from its core business operations, such as sales and services.",
                info2: "Consistently positive values suggest that the company can sustain its operations and growth without relying on external financing.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                        "A steady or growing operating cash flow indicates a healthy core business.",
                        "Sudden drops may suggest operational issues, declining sales, or rising costs.",
                        "Compare this value across several periods to assess sustainability.",
                        "Negative cash flow may be acceptable for startups but concerning for mature businesses."
                    ]
                },
                calculation: {
                    accounts: ["Receipts from Customers", "Payments to Suppliers and Employees", "Other Operating Cash Flows"],
                    info3: "Cash inflows from selling goods and services.",
                    info4: "Cash outflows for operating expenses and working capital changes."
                }
            },
            investingCashFlow: {
                title: "Net Cash Flow from Investing Activities",
                info1: "Shows cash used for or generated by investments in long-term assets such as property, equipment, or securities.",
                info2: "Negative values typically indicate reinvestment in the business, while positive values may result from asset sales or reduced investment activity.",
                trendAndContext: {
                info: "Trend & Context",
                    highlights: [
                        "Negative values often mean the company is reinvesting in assets (e.g., property, equipment).",
                        "Positive values could reflect asset sales or a slowdown in investment.",
                        "Compare with the company’s growth strategy: heavy investment might be good in growth phases.",
                        "Consistency or large fluctuations could provide insight into capital allocation decisions."
                    ]
                },
                calculation: {
                    accounts: ["Purchase of Property, Plant and Equipment", "Sale of Assets", "Investments in Subsidiaries or Securities"],
                    info3: "Outflows for acquiring long-term assets.",
                    info4: "Inflows from selling assets or divesting investments."
                }
            }
        },
        chartBar4: {
            interestCoverage: {
                title: "Interest Coverage Ratio",
                info1: "Measures a company's ability to pay interest on its outstanding debt using its operating profit.",
                info2: "A higher ratio indicates better ability to meet interest obligations, while a lower ratio suggests potential difficulty servicing debt.",
                interpretation: {
                    info: "Understanding interest payment capacity",
                    ratioRange: ["< 1.5", "1.5 - 3", "3 - 6", "> 6"],
                    meaning: ["Insufficient earnings", "Low coverage", "Comfortable", "Strong coverage"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Operating Profit (EBIT)", "Interest Expense"],
                    info3: "Earnings before interest and tax—core operating profit.",
                    info4: "Cost of servicing debt over the period."
                }
            },
            operatingCashFlowRatio: {
                title: "Operating Cash Flow Ratio",
                info1: "Assesses the ability to cover short-term liabilities using cash generated from operations.",
                info2: "Higher values indicate stronger liquidity from business operations.",
                interpretation: {
                    info: "Understanding short-term liquidity strength",
                    ratioRange: ["< 0.5", "0.5 - 1", "1 - 2", "> 2"],
                    meaning: ["Weak liquidity", "Tight liquidity", "Healthy", "Very strong liquidity"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Operating Cash Flow", "Current Liabilities"],
                    info3: "Cash generated by core business operations.",
                    info4: "Debts due within the next 12 months."
                }
            },
            cashFlowToDebtRatio: {
                title: "Cash Flow to Debt Ratio",
                info1: "Measures a company’s ability to repay its total debt with the cash it generates from operations.",
                info2: "It provides insight into solvency—higher values mean more available cash to pay down debt.",
                interpretation: {
                    info: "Evaluating debt repayment capacity",
                    ratioRange: ["< 0.1", "0.1 - 0.3", "0.3 - 0.6", "> 0.6"],
                    meaning: ["Insufficient cash", "Weak coverage", "Moderate", "Strong debt coverage"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Operating Cash Flow", "Total Debt"],
                    info3: "Cash generated from operating activities.",
                    info4: "All short- and long-term debt obligations."
                }
            }
        },
        myRadarChart: {
            operatingMargin: {
                title: "Operating Margin",
                info1: "Measures what percentage of revenue remains after covering operating expenses.",
                info2: "A higher operating margin indicates greater efficiency in managing core business operations.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.1", "0.1 - 0.2", "0.2 - 0.3", "> 0.3"],
                    meaning: ["Low operating efficiency", "Moderate efficiency", "Good efficiency", "High operating efficiency"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Operating Profit", "Revenue"],
                    info3: "Earnings before interest and taxes, excluding non-operating items.",
                    info4: "Total income generated from sales of goods or services."
                }
            },
            profitMargin: {
                title: "Profit Margin",
                info1: "Indicates how much net income a company retains from its total revenue.",
                info2: "A higher profit margin means more profitability after all expenses are deducted.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.05", "0.05 - 0.1", "0.1 - 0.2", "> 0.2"],
                    meaning: ["Very low profitability", "Moderate", "Good", "Strong profitability"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Net Profit", "Revenue"],
                    info3: "The final profit after all expenses, taxes, and costs.",
                    info4: "Total income generated from sales of goods or services."
                }
            },
            returnOnAssets: {
                title: "Return on Assets (ROA)",
                info1: "Evaluates how efficiently a company uses its assets to generate profit.",
                info2: "Higher ROA suggests effective use of assets to drive earnings.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.03", "0.03 - 0.07", "0.07 - 0.1", "> 0.1"],
                    meaning: ["Poor asset use", "Average", "Good", "Efficient asset utilization"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Net Profit", "Total Assets"],
                    info3: "The final profit after all expenses, taxes, and costs.",
                    info4: "The total value of everything the company owns."
                }
            },
            returnOnEquity: {
                title: "Return on Equity (ROE)",
                info1: "Indicates how effectively a company generates profit from shareholders' investments.",
                info2: "A higher ROE means better returns on equity capital invested by shareholders.",
                interpretation: {
                    info: "Understanding the indicator ratio",
                    ratioRange: ["< 0.05", "0.05 - 0.15", "0.15 - 0.25", "> 0.25"],
                    meaning: ["Low return", "Moderate return", "Strong return", "Very high return"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Net Profit", "Shareholders' Equity"],
                    info3: "The final profit after all expenses, taxes, and costs.",
                    info4: "What remains for shareholders after liabilities are subtracted from assets."
                }
            }
        },
        myDoughnutChart: {
            grossProfit: {
                title: "Gross Profit",
                info1: "Shows the profit a company makes after subtracting the cost of goods sold (COGS) from revenue.",
                info2: "It reflects production or purchasing efficiency and pricing strategy.",
                interpretation: {
                    info: "Understanding gross profitability",
                    ratioRange: ["< 20%", "20% - 40%", "40% - 60%", "> 60%"],
                    meaning: ["Low markup", "Moderate", "Healthy margin", "Strong pricing power"],
                    riskLevel: ["High risk", "Moderate", "Low risk", "Very low risk"]
                },
                calculation: {
                    accounts: ["Revenue", "Cost of Goods Sold"],
                    info3: "Total income from sales.",
                    info4: "Direct costs of producing goods or services sold."
                }
            },
        }
    }

    /**
     * Builds the modal content HTML from a chartInfo object.
     * @param {Object} chartInfo - The info object from chartInfoMap.
     * @returns {Object} { infoText, interpInfo, interpTable, calcInfoText, calcHtml }
    */
    function buildModalContent(chartInfo) {
        // Info text (title and descriptions)
        const infoText = `
            <div class="p-4">
                <p style="font-size: 0.95rem; color:rgba(245, 245, 245, 0.9);">${chartInfo.info1}</p>
                <p style="font-size: 0.95rem; color:rgba(245, 245, 245, 0.9);">${chartInfo.info2}</p>
            </div>
        `;

        // Interpretation info (above the table)
        const interpInfo = `<p class="mb-1 px-4" style="text-align: center;">${chartInfo.interpretation.info}</p>`;

        // Interpretation table
        const interpKeys = Object.keys(chartInfo.interpretation).filter(key => key !== "info");
        const tableHeader = interpKeys.map(
            key => `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
        ).join('');
        let tableRows = '';
        const numRows = chartInfo.interpretation[interpKeys[0]].length;
        for (let i = 0; i < numRows; i++) {
            tableRows += '<tr>';
            interpKeys.forEach(key => {
                tableRows += `<td>${chartInfo.interpretation[key][i]}</td>`;
            });
            tableRows += '</tr>';
        }
        const interpTable = `
            <div class="table-responsive px-4">
                <table class="table table-sm table-bordered my-3 custom-bg-table">
                    <thead>
                        <tr style="border-radius:10px;">
                            ${tableHeader}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;

        // Calculation info (above the calculation)
        const calcInfoText = `<p class="mb-1 px-4" style="text-align: center;">Understanding how it is calculated</p>`;

        // Calculation HTML
        const calcHtml = `
            <div class="px-4 mb-3">
                <div class="p-2 my-3 calculation" style="color:#222b4b;">
                    <p><strong>${chartInfo.title} = </strong>${chartInfo.calculation.accounts[0]} / ${chartInfo.calculation.accounts[1]}</p>
                    <p><strong>${chartInfo.calculation.accounts[0]}: </strong>${chartInfo.calculation.info3}</p>
                    <p><strong>${chartInfo.calculation.accounts[1]}: </strong>${chartInfo.calculation.info4}</p>
                </div>
            </div>
        `;

        return { infoText, interpInfo, interpTable, calcInfoText, calcHtml };
    }

    /**
     * Dynamically builds modal tabs and content from chartInfoMap.
     * @param {Object} chartInfoMap - The info object from chartInfoMap.
     */
    function buildModalTabs(chartInfoMap) {
        const tabNav = document.getElementById('modalTabNav');
        const tabContent = document.getElementById('modalTabContent');
        tabNav.innerHTML = '';
        tabContent.innerHTML = '';

        let first = true;
        Object.entries(chartInfoMap).forEach(([tabKey, tabObj], idx) => {
            // Each tabObj may have multiple indicators (e.g., debtToEquity, debtRatio, etc.)
            Object.entries(tabObj).forEach(([indicatorKey, chartInfo]) => {
                const tabId = `tab-${tabKey}-${indicatorKey}`;
                // Tab button
                const tabBtn = document.createElement('button');
                tabBtn.className = `nav-link${first ? ' active' : ''}`;
                tabBtn.id = `${tabId}-tab`;
                tabBtn.setAttribute('data-bs-toggle', 'tab');
                tabBtn.setAttribute('data-bs-target', `#${tabId}`);
                tabBtn.type = 'button';
                tabBtn.role = 'tab';
                tabBtn.textContent = chartInfo.title;

                const tabLi = document.createElement('li');
                tabLi.className = 'nav-item';
                tabLi.role = 'presentation';
                tabLi.appendChild(tabBtn);
                tabNav.appendChild(tabLi);

                // Tab content
                const tabPane = document.createElement('div');
                tabPane.className = `tab-pane fade${first ? ' show active' : ''}`;
                tabPane.id = tabId;
                tabPane.role = 'tabpanel';
                tabPane.setAttribute('aria-labelledby', `${tabId}-tab`);

                // Build modal content for this indicator
                const { infoText, interpInfo, interpTable, calcInfoText, calcHtml } = buildModalContent(chartInfo);

                tabPane.innerHTML = `
                    <div id="modalChartInfoText">${infoText}</div>
                    <div id="modalInterpInfo">${interpInfo}</div>
                    <div id="modalChartInfoTable">${interpTable}</div>
                    <div id="modalCalcInfo" style="display:none">${calcInfoText}</div>
                    <div id="modalChartCalculation" style="display:none">${calcHtml}</div>
                    <div class="px-4">
                        <button class="btn-primary-custom-calculation mb-2 toggleMeaningCalcBtn" type="button">How is it calculated?</button>
                    </div>
                `;
                tabContent.appendChild(tabPane);

                first = false;
            });
        });

        // Add toggle logic for each tab's button
        tabContent.querySelectorAll('.toggleMeaningCalcBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = btn.closest('.tab-pane');
                const interpInfoDiv = parent.querySelector('#modalInterpInfo');
                const tableDiv = parent.querySelector('#modalChartInfoTable');
                const calcInfoDiv = parent.querySelector('#modalCalcInfo');
                const calcDiv = parent.querySelector('#modalChartCalculation');
                if (tableDiv.style.display === '' || tableDiv.style.display === 'block') {
                    tableDiv.style.display = 'none';
                    interpInfoDiv.style.display = 'none';
                    calcDiv.style.display = '';
                    calcInfoDiv.style.display = '';
                    btn.textContent = 'How is it interpreted?';
                } else {
                    tableDiv.style.display = '';
                    interpInfoDiv.style.display = '';
                    calcDiv.style.display = 'none';
                    calcInfoDiv.style.display = 'none';
                    btn.textContent = 'How is it calculated?';
                }
            });
        });
    }

    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.addEventListener('click', function () {
            const config = chartConfigs[this.id];
            if (config && chartInfoMap[this.id]) {
                buildModalTabs({ [this.id]: chartInfoMap[this.id] }); // Only show tabs for this chart
                const modal = new bootstrap.Modal(document.getElementById('chartModal'));
                modal.show();
                if (window.modalChartInstance) window.modalChartInstance.destroy();
                const ctx = document.getElementById('modalChart').getContext('2d');
                window.modalChartInstance = new Chart(ctx, config);
            }
        });
    });


   
});