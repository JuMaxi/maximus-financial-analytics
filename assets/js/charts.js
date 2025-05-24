// Read data from localStorage and reconstruct the Map
const stored = localStorage.getItem('chartData');
const data = new Map(stored ? JSON.parse(stored) : []);

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




    


   

    
   

   


});

 


