// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

// Chart.js code
document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Revenue', 'Gross Profit', 'Operating Profit', 'Net Profit'],
            datasets: [
                {
                    label: '2025',
                    data: [
                        data.get("Revenue") ? data.get("Revenue")[0] : 0,
                        data.get("Gross profit") ? data.get("Gross profit")[0] : 0,
                        data.get("Operating profit") ? data.get("Operating profit")[0] : 0,
                        data.get("Profit after tax") ? data.get("Profit after tax")[0] : 0
                    ],
                    backgroundColor: '#3498db'
                },
                {
                    label: '2024',
                    data: [
                        data.get("Revenue") ? data.get("Revenue")[1] : 0,
                        data.get("Gross profit") ? data.get("Gross profit")[1] : 0,
                        data.get("Operating profit") ? data.get("Operating profit")[1] : 0,
                        data.get("Profit after tax") ? data.get("Profit after tax")[1] : 0
                    ],
                    backgroundColor: '#2ecc71'
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
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Revenue X Profit'
                }
            }
        }
    });


    const ctxAssets = document.getElementById('myChartAssets').getContext('2d');
    new Chart(ctxAssets, {
        type: 'bar',
        data: {
        labels: [
            ['Intangible', 'Assets'],
            ['Goodwill'],
            ['Property, Plant', 'and Equipment'],
            ['Deferred', 'Tax Asset'],
            ['Cash and', 'Cash Equivalents'],
            ['Trade and Other', 'Receivables'],
            ['Current Tax', 'Receivable']
        ],
            datasets: [
                {
                    label: '2025',
                    data: [
                        data.get("Intangible assets") ? data.get("Intangible assets")[0] : 0,
                        data.get("Goodwill") ? data.get("Goodwill")[0] : 0,
                        data.get("Property, plant and equipment") ? data.get("Property, plant and equipment")[0] : 0,
                        data.get("Deferred tax asset") ? data.get("Deferred tax asset")[0] : 0,
                        data.get("Cash and cash equivalents") ? data.get("Cash and cash equivalents")[0] : 0,
                        data.get("Trade and other receivables") ? data.get("Trade and other receivables")[0] : 0,
                        data.get("Current tax Receivable") ? data.get("Current tax receivable")[0] : 0
                    ],
                    backgroundColor: '#8e44ad'
                },
                {
                    label: '2024',
                    data: [
                        data.get("Intangible assets") ? data.get("Intangible assets")[1] : 0,
                        data.get("Goodwill") ? data.get("Goodwill")[1] : 0,
                        data.get("Property, plant and equipment") ? data.get("Property, plant and equipment")[1] : 0,
                        data.get("Deferred tax asset") ? data.get("Deferred tax asset")[1] : 0,
                        data.get("Cash and cash equivalents") ? data.get("Cash and cash equivalents")[1] : 0,
                        data.get("Trade and other receivables") ? data.get("Trade and other receivables")[1] : 0,
                        data.get("Current tax receivable") ? data.get("Current tax receivable")[1] : 0
                    ],
                    backgroundColor: '#f39c12'
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
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Assets Breakdown'
                }
            }
        }
    });

    const ctxEquity = document.getElementById('myChartEquity').getContext('2d');
    new Chart(ctxEquity, {
        type: 'bar',
        data: {
        labels: [
            "Share Capital",
            "Other Reserves",
            "Retained Earnings",
            "Foreign Exchange Reserve",
        ],
            datasets: [
                {
                    label: "2025",
                    data: [
                        data.get("Share capital") ? data.get("Share capital")[0] : 0,
                        data.get("Other reserves") ? data.get("Other reserves")[0] : 0,
                        data.get("Retained earnings") ? data.get("Retained earnings")[0] : 0,
                        data.get("Foreign exchange reserve") ? data.get("Foreign exchange reserve")[0] : 0,
                    ],
                    backgroundColor: '#8e44ad'
                },
                {
                    label: "2024",
                    data: [
                        data.get("Share capital") ? data.get("Share capital")[1] : 0,
                        data.get("Other reserves") ? data.get("Other reserves")[1] : 0,
                        data.get("Retained earnings") ? data.get("Retained earnings")[1] : 0,
                        data.get("Foreign exchange reserve") ? data.get("Foreign exchange reserve")[1] : 0,
                    ],
                    backgroundColor: '#f39c12'
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
                    text: "Equity Composition"
                }
            }
        }
    });

    
    const ctxCash = document.getElementById('myChartCash').getContext('2d');
    new Chart(ctxCash, {
        type: 'bar',
        data: {
        labels: [
            "Cash Generated from Operating Activities",
            "Net Cash Flow from Investing Activities",
        ],
            datasets: [
                {
                    label: "2025",
                    data: [
                        data.get("Cash generated from operating activities") ? data.get("Cash generated from operating activities")[0] : 0,
                        data.get("Net cash flow from investing activities") ? data.get("Net cash flow from investing activities")[0] : 0,
                    ],
                    backgroundColor: '#8e44ad'
                },
                {
                    label: "2024",
                    data: [
                        data.get("Cash generated from operating activities") ? data.get("Cash generated from operating activities")[1] : 0,
                        data.get("Net cash flow from investing activities") ? data.get("Net cash flow from investing activities")[1] : 0,
                    ],
                    backgroundColor: '#f39c12'
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
                    text: "Equity Composition"
                }
            }
        }
    });

    // Function to create Indicators Id, dinamically
    function createGaugeChartElements(containerId, indicators) {
        const container = document.getElementById(containerId);

        indicators.forEach((indicator, index) => {
            const chartId = `gaugeChart${index}`;

            const col = document.createElement("div");
            col.className = "col-12 col-md-4 d-flex flex-column align-items-center mb-4";

            const title = document.createElement("p");
            title.textContent = indicator.label;
            title.className = "fw-bold";

            const canvas = document.createElement("canvas");
            canvas.id = chartId;
            canvas.style.maxWidth = "180px";

            col.appendChild(title);
            col.appendChild(canvas);
            container.appendChild(col);
        });

        // Return all generated ids for later chart creation
        return indicators.map((_, index) => `gaugeChart${index}`);
    }


    function renderGaugeCharts(chartIds, indicators) {
    const gaugeCharts = {};

    chartIds.forEach((chartId, index) => {
        const ctx = document.getElementById(chartId).getContext('2d');
        const value = indicators[index].value;

        gaugeCharts[chartId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
            data: [value, 100 - value],
            backgroundColor: ['#2ecc71', '#ecf0f1'],
            borderWidth: 0,
            cutout: '80%',
            circumference: 180,
            rotation: 270
            }]
        },
        options: {
            responsive: true,
            plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
            }
        }
        });
    });

    return gaugeCharts;  // Return if you want to manipulate charts later
    }

});

 


