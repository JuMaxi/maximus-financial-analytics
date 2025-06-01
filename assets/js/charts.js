// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

// Read data from localStorage and reconstruct the Indicators object
const storedIndicators = localStorage.getItem('indicators');
const indicators = storedIndicators ? JSON.parse(storedIndicators) : {};

// This object is created to store a copy of the charts. So when the modal is in use, it will show the chart
const chartConfigs = {};

// Saves a reference to the created chart so it can be destroyed
const chartReferences = {};

// Chart.js code
document.addEventListener("DOMContentLoaded", function() {
    Chart.defaults.color = "#ddd";
    Chart.defaults.borderColor = "#444";
    // Global variables
    // Purple-magenta-blue range palette
    let titleColor = "#f5f5f5";
    let modalTextColor = "rgba(245, 245, 245, 0.9)";
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
        chartReferences[`gaugeChart${key}${year}`] = new Chart(ctx2, {
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
                    color: titleColor
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

        // Don't add again if already exists
        if(document.getElementById(`gaugeChart${key}${year}`) !== null)
            return;


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
        chartReferences[canvasId] = new Chart(ctx, config);
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
                scales: {
                    r: {
                        pointLabels: {
                            font: {
                                size: 14
                            }
                        },
                        ticks: {
                            color: "#222b4b", // <-- grid value numbers
                        }
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
        chartReferences[canvasId] = new Chart(ctx, config);
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
            <i class="fa-solid fa-arrow-up fa-xl" style="color: #09d506;"></i>`;

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

    function createAllCharts(){
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
    }

    createAllCharts();

    function destroyAllCharts(){
        for (const [key, value] of Object.entries(chartReferences)) {
           value.destroy();
        }
    }
    

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
        chartBar2: {
            revenue: {
            title: "Revenue",
            info1: "Revenue represents the total income generated by a company from its core operations, typically from sales of goods or services.",
            info2: "It's often referred to as the 'top line' because it's the starting point for calculating profit.",
            trendAndContext: {
                info: "Trend & Context",
                highlights: [
                "Consistent revenue growth usually indicates increasing market demand or successful expansion.",
                "Declining revenue may suggest competitive pressure or weakening customer interest.",
                "Compare revenue trends across periods and against industry peers.",
                "Revenue alone doesn't indicate profitability – it's crucial to analyze alongside costs."
                ]
            },
            calculation: {
                accounts: ["Sales", "Service Income", "Other Operating Income"],
                info3: "Total income earned from primary business operations.",
                info4: "May include multiple streams of income depending on the business model."
            }
        },
        grossProfit: {
            title: "Gross Profit",
            info1: "Gross Profit is the revenue remaining after deducting the cost of goods sold (COGS). It shows how efficiently a company produces and sells its products.",
            info2: "It reflects core profitability before accounting for overhead and other operating costs.",
            trendAndContext: {
                info: "Trend & Context",
                highlights: [
                "Rising gross profit may indicate better cost control or pricing power.",
                "Shrinking gross profit margins could signal increasing production costs or pricing pressure.",
                "It's crucial to monitor gross profit trends relative to revenue growth.",
                "Industry benchmarks help assess whether gross margins are healthy."
                ]
            },
            calculation: {
                accounts: ["Revenue", "Cost of Goods Sold"],
                info3: "Total income from sales before expenses.",
                info4: "Direct costs involved in producing or delivering products or services."
            }
        },
        operatingProfit: {
            title: "Operating Profit",
            info1: "Operating Profit reflects the profit from regular business activities after deducting operating expenses like salaries, rent, and utilities.",
            info2: "It's a key measure of operational efficiency and core profitability.",
            trendAndContext: {
                info: "Trend & Context",
                highlights: [
                "Stable or rising operating profit indicates strong management and cost efficiency.",
                "Declining values may suggest issues in operations or rising overheads.",
                "Compare operating profit with gross profit to see how much is consumed by operational costs.",
                "Used in calculating key profitability and efficiency ratios like Operating Margin."
                ]
            },
            calculation: {
                accounts: ["Gross Profit", "Operating Expenses"],
                info3: "Gross profit from core operations.",
                info4: "Expenses related to regular business functions (e.g., admin, marketing, utilities)."
            }
        },
        profitAfterTax: {
            title: "Profit After Tax",
            info1: "Profit After Tax is the net income a company retains after all expenses, interest, and taxes have been deducted.",
            info2: "It's commonly referred to as the 'bottom line' and reflects the company's overall profitability.",
            trendAndContext: {
                info: "Trend & Context",
                highlights: [
                "Increasing profit after tax is a strong sign of sustainable business performance.",
                "Falling profits may reflect rising costs, declining sales, or high tax burdens.",
                "This figure is often used to assess dividend potential and retained earnings.",
                "Compare across periods to understand growth and risk trends."
                ]
            },
            calculation: {
                accounts: ["Operating Profit", "Interest", "Taxes"],
                info3: "Profit from operations before non-operating costs and taxes.",
                info4: "Obligations paid to lenders and government."
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
        chartPie1: {
            intangibleAssets: {
                title: "Intangible Assets",
                info1: "Intangible assets are non-physical assets that provide value to the business, such as patents, trademarks, copyrights, and software.",
                info2: "These assets are often critical to a company’s competitive advantage, especially in tech and brand-driven industries.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "An increase may result from acquisitions, R&D, or IP investments.",
                    "Must be evaluated for impairment regularly, as their value can fluctuate.",
                    "High intangible assets are common in tech, pharma, and media sectors.",
                    "Not easily liquidated, so they don’t improve short-term financial flexibility."
                    ]
                },
                calculation: {
                    accounts: ["Patents", "Trademarks", "Licenses", "Software"],
                    info3: "Rights and creations that provide long-term economic benefits.",
                    info4: "Valued based on acquisition cost or internal development."
                }
            },
            goodwill: {
                title: "Goodwill",
                info1: "Goodwill arises when a company acquires another for more than the fair value of its net assets.",
                info2: "It reflects brand reputation, customer relationships, and other intangibles not separately recognized.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Appears on the balance sheet only after acquisitions.",
                    "High goodwill may indicate an aggressive acquisition strategy.",
                    "Subject to annual impairment testing rather than amortization.",
                    "Impairment losses can significantly affect profit."
                    ]
                },
                calculation: {
                    accounts: ["Purchase Price", "Fair Value of Net Assets Acquired"],
                    info3: "The premium paid over the fair value of acquired net assets.",
                    info4: "Does not reflect a physical or separately identifiable asset."
                }
            },
            propertyPlantEquipment: {
                title: "Property, Plant and Equipment (PPE)",
                info1: "PPE includes tangible fixed assets used in the production of goods and services, such as buildings, machinery, and vehicles.",
                info2: "These are long-term assets and typically depreciated over their useful lives.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Growth in PPE may indicate expansion or capital investment.",
                    "Stagnation or shrinkage might signal underinvestment or asset sales.",
                    "Higher PPE can increase depreciation expenses.",
                    "Asset efficiency should be measured against revenue generated."
                    ]
                },
                calculation: {
                    accounts: ["Buildings", "Machinery", "Equipment", "Vehicles"],
                    info3: "Physical assets used in operations.",
                    info4: "Recorded at cost and depreciated over time."
                }
            },
            deferredTaxAsset: {
                title: "Deferred Tax Asset",
                info1: "A deferred tax asset arises when a company has overpaid taxes or has deductible temporary differences to recover in the future.",
                info2: "It represents future tax relief and is recorded on the balance sheet.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Often arises from tax losses carried forward or temporary differences.",
                    "Must be supported by future taxable income to be realized.",
                    "Can fluctuate with changes in tax laws or accounting adjustments.",
                    "Not immediately liquid, but beneficial over time."
                    ]
                },
                calculation: {
                    accounts: ["Tax Loss Carryforwards", "Temporary Differences"],
                    info3: "Amounts deductible from future taxable income.",
                    info4: "Recognized when it is probable they will be utilized."
                }
            },
            cashAndCashEquivalents: {
                title: "Cash and Cash Equivalents",
                info1: "This includes the most liquid assets a company holds—cash on hand and short-term investments easily convertible to cash.",
                info2: "It is a key indicator of the company’s liquidity and ability to meet short-term obligations.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "A high balance provides financial flexibility and resilience.",
                    "Too much idle cash may suggest inefficient capital allocation.",
                    "Declining trends may raise liquidity concerns.",
                    "Important for calculating liquidity ratios like current and quick ratios."
                    ]
                },
                calculation: {
                    accounts: ["Cash", "Bank Balances", "Short-Term Investments"],
                    info3: "Funds available for immediate use.",
                    info4: "Includes investments with maturities of 3 months or less."
                }
            },
            tradeAndOtherReceivables: {
                title: "Trade and Other Receivables",
                info1: "This account includes money owed to the company by customers and other parties, typically from sales on credit.",
                info2: "It represents expected future cash inflows and is considered a current asset.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Rising receivables may suggest growing sales, but also possible collection risks.",
                    "Persistent high receivables can strain cash flow if collection is slow.",
                    "Should be analyzed alongside bad debt provisions.",
                    "Key for assessing working capital efficiency."
                    ]
                },
                calculation: {
                    accounts: ["Trade Debtors", "Other Receivables"],
                    info3: "Amounts customers owe for delivered goods/services.",
                    info4: "Includes accrued income and prepayments."
                }
            },
            currentTaxReceivable: {
                title: "Current Tax Receivable",
                info1: "Represents income tax payments made in excess of the current liability, which are expected to be refunded.",
                info2: "It is recorded as a current asset on the balance sheet until settled with tax authorities.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "May result from overestimated tax payments or tax incentives.",
                    "Usually a temporary balance resolved in the following tax cycle.",
                    "Persistent tax receivables should be examined for underlying issues.",
                    "Not a performance measure, but affects short-term liquidity."
                    ]
                },
                calculation: {
                    accounts: ["Advance Income Taxes", "Tax Refunds Due"],
                    info3: "Overpaid taxes expected to be recovered.",
                    info4: "Typically settled within one year."
                }
            }
        },
        chartPie2: {
            intangibleAssets: {
                title: "Intangible Assets",
                info1: "Intangible assets are non-physical assets that provide value to the business, such as patents, trademarks, copyrights, and software.",
                info2: "These assets are often critical to a company’s competitive advantage, especially in tech and brand-driven industries.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "An increase may result from acquisitions, R&D, or IP investments.",
                    "Must be evaluated for impairment regularly, as their value can fluctuate.",
                    "High intangible assets are common in tech, pharma, and media sectors.",
                    "Not easily liquidated, so they don’t improve short-term financial flexibility."
                    ]
                },
                calculation: {
                    accounts: ["Patents", "Trademarks", "Licenses", "Software"],
                    info3: "Rights and creations that provide long-term economic benefits.",
                    info4: "Valued based on acquisition cost or internal development."
                }
            },
            goodwill: {
                title: "Goodwill",
                info1: "Goodwill arises when a company acquires another for more than the fair value of its net assets.",
                info2: "It reflects brand reputation, customer relationships, and other intangibles not separately recognized.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Appears on the balance sheet only after acquisitions.",
                    "High goodwill may indicate an aggressive acquisition strategy.",
                    "Subject to annual impairment testing rather than amortization.",
                    "Impairment losses can significantly affect profit."
                    ]
                },
                calculation: {
                    accounts: ["Purchase Price", "Fair Value of Net Assets Acquired"],
                    info3: "The premium paid over the fair value of acquired net assets.",
                    info4: "Does not reflect a physical or separately identifiable asset."
                }
            },
            propertyPlantEquipment: {
                title: "Property, Plant and Equipment (PPE)",
                info1: "PPE includes tangible fixed assets used in the production of goods and services, such as buildings, machinery, and vehicles.",
                info2: "These are long-term assets and typically depreciated over their useful lives.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Growth in PPE may indicate expansion or capital investment.",
                    "Stagnation or shrinkage might signal underinvestment or asset sales.",
                    "Higher PPE can increase depreciation expenses.",
                    "Asset efficiency should be measured against revenue generated."
                    ]
                },
                calculation: {
                    accounts: ["Buildings", "Machinery", "Equipment", "Vehicles"],
                    info3: "Physical assets used in operations.",
                    info4: "Recorded at cost and depreciated over time."
                }
            },
            deferredTaxAsset: {
                title: "Deferred Tax Asset",
                info1: "A deferred tax asset arises when a company has overpaid taxes or has deductible temporary differences to recover in the future.",
                info2: "It represents future tax relief and is recorded on the balance sheet.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Often arises from tax losses carried forward or temporary differences.",
                    "Must be supported by future taxable income to be realized.",
                    "Can fluctuate with changes in tax laws or accounting adjustments.",
                    "Not immediately liquid, but beneficial over time."
                    ]
                },
                calculation: {
                    accounts: ["Tax Loss Carryforwards", "Temporary Differences"],
                    info3: "Amounts deductible from future taxable income.",
                    info4: "Recognized when it is probable they will be utilized."
                }
            },
            cashAndCashEquivalents: {
                title: "Cash and Cash Equivalents",
                info1: "This includes the most liquid assets a company holds—cash on hand and short-term investments easily convertible to cash.",
                info2: "It is a key indicator of the company’s liquidity and ability to meet short-term obligations.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "A high balance provides financial flexibility and resilience.",
                    "Too much idle cash may suggest inefficient capital allocation.",
                    "Declining trends may raise liquidity concerns.",
                    "Important for calculating liquidity ratios like current and quick ratios."
                    ]
                },
                calculation: {
                    accounts: ["Cash", "Bank Balances", "Short-Term Investments"],
                    info3: "Funds available for immediate use.",
                    info4: "Includes investments with maturities of 3 months or less."
                }
            },
            tradeAndOtherReceivables: {
                title: "Trade and Other Receivables",
                info1: "This account includes money owed to the company by customers and other parties, typically from sales on credit.",
                info2: "It represents expected future cash inflows and is considered a current asset.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Rising receivables may suggest growing sales, but also possible collection risks.",
                    "Persistent high receivables can strain cash flow if collection is slow.",
                    "Should be analyzed alongside bad debt provisions.",
                    "Key for assessing working capital efficiency."
                    ]
                },
                calculation: {
                    accounts: ["Trade Debtors", "Other Receivables"],
                    info3: "Amounts customers owe for delivered goods/services.",
                    info4: "Includes accrued income and prepayments."
                }
            },
            currentTaxReceivable: {
                title: "Current Tax Receivable",
                info1: "Represents income tax payments made in excess of the current liability, which are expected to be refunded.",
                info2: "It is recorded as a current asset on the balance sheet until settled with tax authorities.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "May result from overestimated tax payments or tax incentives.",
                    "Usually a temporary balance resolved in the following tax cycle.",
                    "Persistent tax receivables should be examined for underlying issues.",
                    "Not a performance measure, but affects short-term liquidity."
                    ]
                },
                calculation: {
                    accounts: ["Advance Income Taxes", "Tax Refunds Due"],
                    info3: "Overpaid taxes expected to be recovered.",
                    info4: "Typically settled within one year."
                }
            }
        },
        myHorizontalBarChart1: {
            otherReserves: {
                title: "Other Reserves",
                info1: "Other reserves represent components of equity that arise from transactions not related to share capital or retained earnings. These often include revaluation reserves, foreign currency translation reserves, or unrealized gains/losses.",
                info2: "They provide insight into accumulated changes in value not captured in retained earnings, and are usually not distributable as dividends.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Increases may result from asset revaluations, hedging gains, or foreign currency translations.",
                    "Volatility may be influenced by market movements, currency rates, or revaluation policies.",
                    "Can provide insight into how a company handles unrealized items and comprehensive income.",
                    "Not typically used for paying dividends or reinvestment decisions."
                    ]
                },
                calculation: {
                    accounts: ["Revaluation Surplus", "Currency Translation Reserve", "Unrealized Gains/Losses"],
                    info3: "Accumulated unrealized or non-operating equity movements.",
                    info4: "Recorded under 'Other Comprehensive Income' in equity section."
                }
            },
            retainedEarnings: {
                title: "Retained Earnings",
                info1: "Retained earnings are the cumulative net profits or losses that a company has retained after paying dividends to shareholders.",
                info2: "This figure reflects the company’s ability to reinvest earnings into operations, pay off debt, or reserve for future use.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Growing retained earnings indicate profitable performance and reinvestment strategy.",
                    "Declines may suggest dividend payouts, losses, or reserves for contingencies.",
                    "Key for measuring long-term financial sustainability and self-financing capability.",
                    "Often used in calculating Return on Equity (ROE)."
                    ]
                },
                calculation: {
                    accounts: ["Net Profit", "Dividends Paid"],
                    info3: "Cumulative net income retained in the business.",
                    info4: "Calculated by adding current net income to retained earnings and subtracting dividends."
                }
            }
        },
        myHorizontalBarChart2: {
            shareCapital: {
                title: "Share Capital",
                info1: "Share capital represents the total amount of capital that shareholders have invested in a company by purchasing its shares.",
                info2: "It forms the foundation of the company’s equity and reflects the funding raised through issuing ordinary or preference shares.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Increases typically indicate new equity issued to raise funds.",
                    "Stable share capital may reflect maturity or consistent ownership structure.",
                    "Dilution of existing shares may occur if new shares are issued.",
                    "Key for calculating ownership stakes and equity ratios."
                    ]
                },
                calculation: {
                    accounts: ["Number of Shares Issued", "Par Value per Share"],
                    info3: "Represents ownership interest contributed by shareholders.",
                    info4: "Usually recorded at nominal or par value, excluding premiums."
                }
            },
            foreignExchangeReserve: {
                title: "Foreign Exchange Reserve",
                info1: "Foreign exchange reserve (or currency translation reserve) reflects gains or losses resulting from translating foreign operations into the company’s reporting currency.",
                info2: "It captures currency fluctuations that affect the value of foreign subsidiaries, impacting equity but not current-period profit.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Fluctuates based on exchange rate movements and international exposure.",
                    "A growing reserve may indicate increasing foreign operations.",
                    "Losses may result from currency depreciation in foreign markets.",
                    "Non-cash in nature, yet it affects comprehensive income."
                    ]
                },
                calculation: {
                    accounts: ["Foreign Currency Translation Adjustments"],
                    info3: "Arises from converting foreign subsidiaries' financials into the group’s currency.",
                    info4: "Part of Other Comprehensive Income; does not affect net profit directly."
                }
            }
        },
        myLineChart: {
            freeCashFlow: {
                title: "Free Cash Flow (FCF)",
                info1: "Free Cash Flow represents the cash a company generates after accounting for operating expenses and capital expenditures. It reflects the money available to be distributed to investors or reinvested.",
                info2: "It is a key measure of financial flexibility and health, especially important for evaluating a company’s ability to fund growth, pay dividends, or reduce debt.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Consistently positive FCF indicates strong cash generation and operational efficiency.",
                    "Negative FCF may suggest high reinvestment or potential liquidity issues.",
                    "Used by investors to assess sustainability and value creation.",
                    "Volatility in FCF could result from irregular capital spending or seasonal changes in operations."
                    ]
                },
                calculation: {
                    accounts: ["Cash Flow from Operating Activities", "Capital Expenditures"],
                    info3: "Cash generated from core business activities (excluding financing or investing).",
                    info4: "Spending on property, plant, equipment or other capital assets needed to sustain operations."
                }
            }
        },
        myBubbleChart: {
            revenueVsProfit: {
                title: "Revenue vs Profit After Tax",
                info1: "This chart visualizes how total revenue relates to profit after tax, helping to assess how effectively a company turns sales into profit.",
                info2: "It allows comparisons between companies, time periods, or business segments, highlighting operational efficiency and profitability margins.",
                trendAndContext: {
                    info: "Trend & Context",
                    highlights: [
                    "Larger bubbles often represent higher revenue or profit volumes.",
                    "A high revenue with low profit may suggest high costs or inefficiencies.",
                    "A low revenue with high profit can indicate a premium pricing strategy or lean cost structure.",
                    "Tracking these metrics over time reveals growth patterns and profitability improvements or concerns."
                    ]
                },
                calculation: {
                    accounts: ["Revenue", "Profit After Tax"],
                    info3: "Total income from goods sold or services rendered before any expenses are deducted.",
                    info4: "Final profit after all operating costs, interest, taxes, and other expenses are subtracted."
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
     * Supports both interpretation and trendAndContext.
     * @param {Object} chartInfo - The info object from chartInfoMap.
     * @returns {Object} { infoText, interpInfo, interpTable, calcInfoText, calcHtml }
     */
    function buildModalContent(chartInfo) {
        // Info text (title and descriptions)
        // 
        // modaltextColor
        const infoText = `
            <div class="p-4">
                <p style="font-size: 0.95rem; color:${modalTextColor};">${chartInfo.info1}</p>
                <p style="font-size: 0.95rem; color:${modalTextColor};">${chartInfo.info2}</p>
            </div>
        `;

        let interpInfo = '';
        let interpTable = '';

        // Support for interpretation or trendAndContext
        if (chartInfo.interpretation) {
            interpInfo = `<p class="mb-1 px-4" style="text-align: center;">${chartInfo.interpretation.info}</p>`;
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
            interpTable = `
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
        } else if (chartInfo.trendAndContext) {
            interpInfo = `<p class="mb-1 px-4" style="text-align: center;">${chartInfo.trendAndContext.info}</p>`;
            interpTable = `
                <div class="table-responsive mx-4 my-3 custom-bg-table">
                    <ul class="list-group py-0">
                        ${chartInfo.trendAndContext.highlights.map(item => `<li class="list-group-item">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

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

    function darkTheme(){
        Chart.defaults.color = "#ddd";
        titleColor = "#f5f5f5";
        modalTextColor = "rgba(245, 245, 245, 0.9)";

        const chartsBackgroundLightElements = document.querySelectorAll('div.charts-background-light');

        chartsBackgroundLightElements.forEach(element => {
                    element.classList.remove('charts-background-light');
                    element.classList.add('charts-background');
                });

        const modalElements = document.querySelectorAll('div.modal-content-light');

         // Found elements with charts-background, switch to charts-background-light
        modalElements.forEach(element => {
            element.classList.remove('modal-content-light');
            element.classList.add('modal-content');
        }); 
                
        console.log(`Switched ${chartsBackgroundLightElements.length} elements from 'charts-background-light' to 'charts-background'`);
        document.documentElement.style.setProperty('--bs-body-bg', '#111525');
        document.documentElement.style.setProperty('--background-color', '#111525');
        document.documentElement.style.setProperty('--secondary-color', titleColor);
        destroyAllCharts();
        createAllCharts();
    }

    function lightTheme(){
        Chart.defaults.color = "#7c0b84";
        titleColor = "#7c0b84";
        modalTextColor = "rgba(0, 0, 0, 0.8)";
        const chartsBackgroundElements = document.querySelectorAll('div.charts-background');

         // Found elements with charts-background, switch to charts-background-light
        chartsBackgroundElements.forEach(element => {
            element.classList.remove('charts-background');
            element.classList.add('charts-background-light');
        }); 

        const modalElements = document.querySelectorAll('div.modal-content');

         // Found elements with charts-background, switch to charts-background-light
        modalElements.forEach(element => {
            element.classList.remove('modal-content');
            element.classList.add('modal-content-light');
        }); 
        
        console.log(`Switched ${chartsBackgroundElements.length} elements from 'charts-background' to 'charts-background-light'`);
        document.documentElement.style.setProperty('--bs-body-bg', '#ffeefa');
        document.documentElement.style.setProperty('--background-color', '#ffeefa');
        document.documentElement.style.setProperty('--secondary-color', titleColor);
        destroyAllCharts();
        createAllCharts();
    }

    function toggleTheme() {
        // First, look for elements with 'charts-background' class
        const chartsBackgroundElements = document.querySelectorAll('div.charts-background');
        
        if (chartsBackgroundElements.length > 0) {
           lightTheme();
        } else {
            const chartsBackgroundLightElements = document.querySelectorAll('div.charts-background-light');
            
            if (chartsBackgroundLightElements.length > 0) {
                darkTheme();
            } else {
                console.log('No theme detected');
            }
        }
    }

    document.getElementById('theme-change').onclick = toggleTheme;

    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.addEventListener('click', function () {
            const config = chartConfigs[this.id];
            if (config && chartInfoMap[this.id]) {
                buildModalTabs({ [this.id]: chartInfoMap[this.id] }); // Only show tabs for this chart
                const modal = new bootstrap.Modal(document.getElementById('chartModal'));
                modal.show();
                if (window.modalChartInstance) window.modalChartInstance.destroy();
                const ctx = document.getElementById('modalChart').getContext('2d');

                if(window.modalChartInstance !== undefined){
                    window.modalChartInstance.destroy();
                }
                window.modalChartInstance = new Chart(ctx, config);
            }
        });
    });
});