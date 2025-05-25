import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.min.mjs"; // import the libray PDF.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs'; // means that PDF.js requires a worker script to function,
//explicitly telling it where to find the worker file. Required when working with modules.

document.addEventListener("DOMContentLoaded", function() {
    // Show uploaded file name
    const fileInput = document.getElementById("file");
    const fileNameDisplay = document.getElementById("fileNameDisplay");
    fileInput.addEventListener("change", function() {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = `Selected file: ${fileInput.files[0].name}`;
        } else {
            fileNameDisplay.textContent = "";
        }
    });

    // Global variables
    const loadFileBtn = document.getElementById('loadFile');
    const processingMessage = document.getElementById('processingMessage');

    // This variable is storing the account names + values extracted from the financial reports
    const data = new Map();
    // Variable the the button analyze
    const loadFile = document.getElementById("loadFile");

    // When clicking the analyze button it calls the functions to handle the file
    loadFile.addEventListener("click", handleFileUpload);

    // Function to handle the file (user input)
    function handleFileUpload() {
        // Variable to the file pdf
        const fileInput = document.getElementById("file");
        // Save the file position 0 in a const variable
        const file = fileInput.files[0];

        // Show "Processing..." message and disable button
        processingMessage.style.display = 'block';
        loadFile.disabled = true;
        loadFile.textContent = 'Processing...';

        // Check if the file is empty or is not a pdf
        if (!file || file.type !== 'application/pdf') {
            alert("Please select a PDF file.");

        // Reset UI state
        processingMessage.style.display = 'none';
        loadFile.disabled = false;
        loadFile.textContent = 'Start Analyzing';
        return;
        }

        // Read the file using file reader
        const reader = new FileReader();

        reader.onload = function(e) {
            // Turn array buffer into typed array (as text)
            const typedArray = new Uint8Array(e.target.result);

            // Call the function to load the pdf
            processPdf(typedArray);
        }
        reader.readAsArrayBuffer(file);
    }

    // Delay function to make sure users notice the "Processing..." state
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Async wrapper to handle UI reset after processing
    async function processPdf(typedArray) {
        try {
            await delay(1500); // Delay 1.5 seconds before real processing
            await loadPdf(typedArray); // make sure loadPdf is async or returns a Promise
            // Save your data Map to localStorage for charts.html
            localStorage.setItem('chartData', JSON.stringify(Array.from(data.entries())));
        } catch (err) {
            alert("Error processing PDF.");
            console.error(err);
        } finally {
            // Always reset the UI
            processingMessage.style.display = 'none';
            loadFile.disabled = false;
            loadFile.textContent = 'Start Analyzing';
        }
        window.location.href = "charts.html";
    }

    // Function to load the file
    // Using the async here, so it is waiting the page being loaded before execute the following code
    async function loadPdf(typedArray) {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        // Call the process page function having as a parameter the pdf file loaded
        const statements = await getFinancialReportsPages(pdf);

        handleAccountsName(statements);
    }

    // Function to get the content from the pages that contains the financial reports
    // Using the async here, so it is waiting the page being loaded before execute the following code
    async function getFinancialReportsPages(pdf) {
        let statements = "";
        for(let pagNum = 1; pagNum <= pdf.numPages; pagNum++) {
            const pageText = await extractFinancialReportsPageText(pagNum, pdf);

            if (
                pageText.includes("Consolidated income statement") &&
                pageText.includes("For the year ended 28 February 2025")
            ) {
                statements += pageText;

                let pageNumStatements = pagNum + 1;

                while(pageNumStatements <= pdf.numPages)
                {
                    const pageStatement = await extractFinancialReportsPageText(pageNumStatements, pdf);

                    if (
                        pageStatement.includes("Notes") &&
                        pageStatement.includes("(Forming part of the Financial Statements)")
                    ) {
                        return statements;
                    }

                    statements += pageStatement;
                    pageNumStatements++;
                }
            }
        }
    }

    // This function extracts the text from the selecteds financial report pages
    async function extractFinancialReportsPageText(pagNum, pdf) {
        const page = await pdf.getPage(pagNum); // wait for page to load
        const pageContent = await page.getTextContent(); // wait for page to load

        /*
            The pageContent above, has a property called Items, that is an array with all the text fragments on the page.
            Then I am accessing the "str" from the Item property and this one contains the text I need and using map
            to go over all the str that are in the item
        */
        
        const pageText = pageContent.items.map(item => item.str).join(' ');

        return pageText;
    }

    // Function to create an array to account names and call the function to find it into the report
    function handleAccountsName(statements) {
        // Creating this array to save account names needed to calculate the indicators
        const accountNames = ["Revenue", "Gross profit", "Operating profit", "Profit after tax", 
            "Intangible assets", "Goodwill", "Property, plant and equipment", "Deferred tax asset",
            "Cash and cash equivalents", "Trade and other receivables", "Current tax receivable",
            "Trade and other payables",
            "Current tax payable",
            "Provisions", "Finance costs", "Cash generated from operating activities",
            "Net cash flow from investing activities", "Share capital","Foreign exchange reserve",
            "Other reserves", "Retained earnings"
        ];

        const groupedAccounts = [
            {
                groupName: "Current liabilities",
                accountName: "Loans and borrowings"
            },
            {
                groupName: "Current liabilities",
                accountName: "Lease liabilities"
            },
            {
                groupName: "Non - current liabilities",
                accountName: "Loans and borrowings"
            },
            {
                groupName: "Non - current liabilities",
                accountName: "Lease liabilities"
            },
        ];
        
        
        for (let group of groupedAccounts) {
            getAccountByGroupAndName(statements, group.groupName, group.accountName);
        }

        // Calling the account name function to find the account name into the report
        for (let accountName of accountNames) {
            getAccountByName(statements, accountName);
        }

        // Save the indicators values to a variable and returning it to be used in the charts.js and charts.html pages
        const indicators = SaveIndicatorsToObject();
        localStorage.setItem('indicators', JSON.stringify(indicators)); // storing indicators to use it in the charts.js file
        window.location.href = "charts.html";
    }

    function getAccountByName(statements, accountName, group = "") {
        // Get the account name initial position
        let positionAccountName = statements.indexOf(accountName);
        // Get the account name final position
        positionAccountName += accountName.length;
        
        // Get the quantity of positions between the first character after the account name and the last character before starting a new account name
        let i = findFinalPositionAccount(statements, positionAccountName);

        // Convert the account values to integers
        let values = convertAccountValuesToInt(statements, positionAccountName, i);
        
        saveValuesAndAccountNamesToMap(accountName, values, data, group);
    }

    /*
        This function finds the index to the group account and uses a substring function to cut the statement after this index
        Then it calls the getAccountByName function that handles other functions to find the account name and values into 
        the statement and save it to the data Map.
    */
    function getAccountByGroupAndName(statements, groupName, accountName){
        let positionGroup = statements.indexOf(groupName);
        let cutStatements = statements.substring(positionGroup);
        getAccountByName(cutStatements, accountName, groupName);
    }
    
    function findFinalPositionAccount(statements, positionAccountName) {
        // Add one position after the account name last character
        let i = positionAccountName + 1;

        // While the current char is digit(numbers), spaces, comma or parentheses increse the variable i
        while(
            statements[i] === " " ||
            !isNaN(Number(statements[i])) ||
            statements[i] === "(" ||
            statements[i] === ")" ||
            statements[i] === "," ||
            statements[i] === "-"
        ) {
            i++;
        }
        return i;
    }

    function convertAccountValuesToInt(statements, positionAccountName, i) {
        /*
            The variable i is the quantity of characters between the first character after the account 
            name and the last character before starting a new account name.
            Taking out the initial spaces using trim(), using split("  ") to break the text to an array of strings
            The map function works similar to a for replacing spaces to "" and replacing parentheses (negative numbers) to "" and -
        */
        
        let data = (statements.substring(positionAccountName, i)
            .trim())
            .split("  ")
            .map(v => v.replace(/ /g, "")
            .replace("-", "0")
            .replace(/,/g, "")
            .replace(")", "")
            .replace("(", "-")
            
        ).map(n => parseInt(n));

        return data;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    // https://stackoverflow.com/questions/3559070/are-there-dictionaries-in-javascript-like-python
    function saveValuesAndAccountNamesToMap(accountName, values, data, group = "") {
        
        if (accountName !== "Current tax receivable" && accountName !== "Trade and other receivables") {
            // If array of values has 3 positions, it means the index 0 is a note, not a value, and I don't need it to calculations
            if (values.length > 2) {
                values = cleanValuesArray(values);
            }
            data.set(group + accountName, [values[0], values[1]]);
        }

        // Exception to handle the counts that are not right in the extracted text from the report
        if (accountName === "Current tax receivable") {
            data.set("Trade and other receivables", [values[0], values[2]]);
            data.set(accountName, [values[1], values[3]]);
        }

    }

    function cleanValuesArray(values) {
        // Clean the notes number
        if (values[0] <= 10 && values[0] > 0) {
            values.shift();
        }

        // Clean the totals that are not necessary for the calculations
        if (values.length > 2) {
            while (values.length > 2) {
                values.pop();
            }
        }
        return values;
    }

    // Totals and averages calculations
    function calculateNonCurrentAssets() {
        let currentAssets = [];
        for (let i = 0; i <= 1; i++) {
            let asset = data.get("Intangible assets")[i];
            asset += data.get("Goodwill")[i];
            asset += data.get("Property, plant and equipment")[i];
            asset += data.get("Deferred tax asset")[i];
            currentAssets.push(asset);
        }
        return currentAssets;
    }

    function calculateCurrentAssets() {
        let nonCurrentAssets = [];
        for (let i = 0; i <= 1; i++) {
            let asset = data.get("Cash and cash equivalents")[i];
            asset += data.get("Trade and other receivables")[i];
            asset += data.get("Current tax receivable")[i];
            nonCurrentAssets.push(asset);
        }
        return nonCurrentAssets;
    }
    
    function calculateNonCurrentLiabilities() {
        let nonCurrentLiabilities = [];
        for (let i = 0; i <= 1; i++) {
            let liabilities = data.get("Non - current liabilitiesLoans and borrowings")[i];
            liabilities += data.get("Non - current liabilitiesLease liabilities")[i];
            liabilities += data.get("Provisions")[i];

            nonCurrentLiabilities.push(liabilities);
        }
        return nonCurrentLiabilities;
    }

    function calculateCurrentLiabilities() {
        let currentLiabilities = [];
        for (let i = 0; i <= 1; i++) {
            let liabilities = data.get("Trade and other payables")[i];
            liabilities += data.get("Current liabilitiesLoans and borrowings")[i];
            liabilities += data.get("Current liabilitiesLease liabilities")[i];
            liabilities += data.get("Current tax payable")[i];

            currentLiabilities.push(liabilities);
        }
        return currentLiabilities;
    }   

    function calculateTotalCurrentAndNonCurrentAccounts(currentAccount, nonCurrentAccount) {
        let totalAccounts = [];
        for (let i = 0; i <=1; i++) {
            let total = currentAccount[i] + nonCurrentAccount[i];
            totalAccounts.push(total);
        }
        return totalAccounts;
    }
    function calculateAverageAssets(currentAssets, nonCurrentAssets) {
        let totalAssets = [];
        for (let i = 0; i <= 1; i++) {
            let assets = currentAssets[i] + nonCurrentAssets[i];
            totalAssets.push(assets);
        }
        
        let average = (totalAssets[0] + totalAssets[1]) / 2; // 671.093,50
        console.log(average);
        average = average.toFixed(2);
        return average;
    }

    function calculateAverageEquity(totalEquity) {
        let average = (totalEquity[0] + totalEquity[1]) / 2; // 297.381,50
        average = average.toFixed(2);
        console.log(average)
        return average;
    }

    function calculateEquity() {
        let totalEquity = [];
        for (let i = 0; i <= 1; i++) {
            let equity = data.get("Share capital")[i];
            equity += data.get("Foreign exchange reserve")[i];
            equity += data.get("Other reserves")[i];
            equity += data.get("Retained earnings")[i];
            totalEquity.push(equity);
        }
        return totalEquity;
    }

    function calculateNetCurrentLiabilities(currentAssets, currentLiabilities) {
        let netCurrentLiabilities = [];
        for (let i = 0; i <= 1; i++) {
            let net = currentAssets[i] + currentLiabilities[i];
            netCurrentLiabilities.push(net);
        }
        return netCurrentLiabilities;
    }

    // Profitability Ratios
    function calculateProfitIndicators(account1) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = ((data.get(account1)[i] / data.get("Revenue")[i]) * 100).toFixed(1);
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateReturns(average) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let returnAssets = ((data.get("Profit after tax")[i] / average) * 100).toFixed(1); 
            indicators.push(returnAssets);
        }
        console.log(indicators);
        return indicators;
    }

    // Liquidity and Solvency ratios
    function calculateRatios(account1, account2) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = Math.abs(account1[i] / account2[i]).toFixed(2);
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateCashRatio(account1, account2) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let ratio = Math.abs(data.get(account1)[i] / account2[i]).toFixed(2);
            indicators.push(ratio);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateinterestCoverageRatio() {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = Math.abs(data.get("Operating profit")[i] / data.get("Finance costs")[i]).toFixed(2);
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateAssetsTurnover(average) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = (data.get("Revenue")[i] / average).toFixed(2); 
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateFreeCashFlow() {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = (data.get("Cash generated from operating activities")[i] + data.get("Net cash flow from investing activities")[i]).toFixed(2);
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }
    
    function calculateCashFlowToDebtRatio(currentLiabilities) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let totalDebt = currentLiabilities[i] - data.get("Current tax payable")[i];
            let indicator = Math.abs((data.get("Cash generated from operating activities")[i] /  totalDebt).toFixed(2));
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function SaveIndicatorsToObject() {
        // Totals and averages
        const nonCurrentAssets = calculateNonCurrentAssets();
        const currentAssets = calculateCurrentAssets();
        const nonCurrentLiabilities = calculateNonCurrentLiabilities();
        const currentLiabilities = calculateCurrentLiabilities();
        const totalAssets =  calculateTotalCurrentAndNonCurrentAccounts(currentAssets, nonCurrentAssets); // 660.254 and 681.933
        const totalLiabilities = calculateTotalCurrentAndNonCurrentAccounts(currentLiabilities, nonCurrentLiabilities); // 377.507 and 369.917
        const averageAssets = calculateAverageAssets(currentAssets, nonCurrentAssets); // 671.093,50
        const totalEquity = calculateEquity(); // 282747 and 312016
        const averageEquity = calculateAverageEquity(totalEquity); // 297.381,50
        const netCurrentLiabilities = calculateNetCurrentLiabilities(currentAssets, currentLiabilities); // 160.432 and 71.545

        // 16 indicators
        // Profitability Ratios
        const grossProfit = calculateProfitIndicators("Gross profit"); // 79.7% and 77%
        const operatingMargin = calculateProfitIndicators("Operating profit"); // 19.4% and 14%
        const profitMargin = calculateProfitIndicators("Profit after tax"); // 13.2% and 8.6%
        const returnAssets = calculateReturns(averageAssets); // 8.7% and 5.1%
        const returnEquity = calculateReturns(averageEquity); // 19.6% and 11.4%

        // Liquidity Ratios
        const currentRatio = calculateRatios(currentAssets, currentLiabilities); // 0.47 and 0.68
        // Since this company doesn't have intentory, the values are equal to current ratio. It is a services company.
        const quickRatio = calculateRatios(currentAssets, currentLiabilities); // 0.47 and 0.68
        const cashRatio = calculateCashRatio("Cash and cash equivalents", currentLiabilities); // 0.25 and 0.41

        // Solvency (Leverage) Ratios
        const debtToEquityRatio = calculateRatios(totalLiabilities, totalEquity); // 1.34 and 1.19
        const debtRatio = calculateRatios(totalLiabilities, totalAssets); // 0.57 and 0.54
        const equityRatio = calculateRatios(totalEquity, totalAssets); // 0.43 and 0.46
        const interestCoverageRatio = calculateinterestCoverageRatio(); // 9.85 and 5.44
        
        // Efficiency (Activity) Ratios
        const assetsTurnover = calculateAssetsTurnover(averageAssets); // 0.66 and 0.59

        // Cash Flow Ratios
        const operatingCashFlowRatio = calculateCashRatio("Cash generated from operating activities", netCurrentLiabilities); // 0.92 and 1.81
        const freeCashFlow = calculateFreeCashFlow(); // £104.565 and £89.036
        const cashFlowDebtRatio = calculateCashFlowToDebtRatio(currentLiabilities); // 0.48 and 0.59

        // "Cash generated from operating activities", "Net cash flow from investing activities"
        const indicators = {
            "Revenue": {
                values: [data.get("Revenue")[0], data.get("Revenue")[1]],
                chartType: "bar",
                group: "accounts"
            },
            "Gross profit": {
                values: [data.get("Gross profit")[0], data.get("Gross profit")[1]],
                chartType: "bar",
                group: "accounts"
            },
            "Operating profit": {
                values: [data.get("Operating profit")[0], data.get("Operating profit")[1]],
                chartType: "bar",
                group: "accounts"
            },     
            "Profit after tax": {
                values: [data.get("Profit after tax")[0], data.get("Profit after tax")[1]],
                chartType: "bar",
                group: "accounts"
            },            
            "Cash generated from operating activities": {
                values: [data.get("Cash generated from operating activities")[0], data.get("Cash generated from operating activities")[1]],
                chartType: "bar",
                group: "cash insights"
            },
            "Net cash flow from investing activities": {
                values: [data.get("Net cash flow from investing activities")[0], data.get("Net cash flow from investing activities")[1]],
                chartType: "bar",
                group: "cash insights"
            },
            "Gross Profit": {
                values: grossProfit,
                chartType: "bar",
                group: "profit"
            },
            "Operating Margin": {
                values: operatingMargin,    
                chartType: "radar",
                group: "profit"
            },
            "Profit Margin":{
                values: profitMargin,
                chartType: "radar",
                group: "profit"
            },
            "Return on Assets": {
                values: returnAssets,
                chartType: "radar",
                group: "profit"
            },
            "Return on Equity": {
                values: returnEquity,
                chartType: "radar",
                group: "profit"
            },
            "Current Ratio": {
                values: currentRatio,
                chartType: "doughnut",
                group: ""
            },
            "Quick Ratio": {
                values: quickRatio,
                chartType: "doughnut",
                group: ""
            },
            "Cash Ratio": {
                values: cashRatio,
                chartType: "doughnut",
                group: ""
            },
            "Debt to Equity Ratio": {
                values: debtToEquityRatio,
                chartType: "bar",
                group: "solvency"
            },
            "Debt Ratio": {
                values: debtRatio,
                chartType: "bar",
                group: "solvency"
            },
            "Equity Ratio": {
                values: equityRatio,
                chartType: "bar",
                group: "solvency"
            },
            "Interest Coverage Ratio": {
                values: interestCoverageRatio,
                chartType: "bar",
                group: "cash flow"
            },
            "Assets Turn Over": {
                values: assetsTurnover,
                chartType: "doughnut",
                group: ""
            },
            "Operating Cash Flow Ratio": {
                values: operatingCashFlowRatio,
                chartType: "bar",
                group: "cash flow"
            },
            "Free Cash Flow": {
                values: freeCashFlow,
                chartType: "line",
                group: "cash flow"
            },
            "Cash Flow Debt Ratio": {
                values: cashFlowDebtRatio,
                chartType: "bar", 
                group: "cash flow"
            }
        };
        console.log(indicators);
        return indicators;
    }
})