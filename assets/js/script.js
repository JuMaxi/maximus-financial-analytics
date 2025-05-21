import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.min.mjs"; // import the libray PDF.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs'; // means that PDF.js requires a worker script to function,
//explicitly telling it where to find the worker file. Required when working with modules.

document.addEventListener("DOMContentLoaded", function() {
    // Global variables

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
        // Check if the file is empty or is not a pdf
        if (!file || file.type !== 'application/pdf') {
            alert("Please select a PDF file.");
            return;
        }

        // Read the file using file reader
        const reader = new FileReader();

        reader.onload = function(e) {
            // Turn array buffer into typed array (as text)
            const typedArray = new Uint8Array(e.target.result);

            // Call the function to load the pdf
            loadPdf(typedArray);
        }
        reader.readAsArrayBuffer(file);
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

        callIndicatorsCalculations(data);
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

    // Profitability Ratios
    // Account1 / Revenue * 100
    function calculateProfitIndicators(account1) {
        const indicators = [];
        for (let i = 0; i <= 1; i++) {
            let indicator = data.get(account1)[i] / data.get("Revenue")[i] * 100;
            indicator = indicator.toFixed(1) + "%";
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateCurrentAssets() {
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

    function calculateNonCurrentAssets() {
        let nonCurrentAssets = [];
        for (let i = 0; i <= 1; i++) {
            let asset = data.get("Cash and cash equivalents")[i];
            asset += data.get("Trade and other receivables")[i];
            asset += data.get("Current tax receivable")[i];
            nonCurrentAssets.push(asset);
        }
        return nonCurrentAssets;
    }

    function calculateAverageAssets() {
        let totalAssets = [];
        let currentAssets = calculateCurrentAssets();
        let nonCurrentAssets = calculateNonCurrentAssets();

        for (let i = 0; i <= 1; i++) {
            let assets = currentAssets[i] + nonCurrentAssets[i];
            totalAssets.push(assets);
        }
        
        let average = (totalAssets[0] + totalAssets[1]) / 2; // 671.093,50
        console.log(average);
        average = average.toFixed(2);
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

    function calculateAverageEquity() {
        let totalEquity = calculateEquity();

        let average = (totalEquity[0] + totalEquity[1]) / 2; // 297.381,50
        average = average.toFixed(2);
        console.log(average)
        return average;
    }

    // Return on Assets (ROA) and Return on Equity (ROE)
    function calculateReturns(average) {
        let indicators = [];
        for (let i = 0; i <= 1; i++) {
            let returnAssets = (data.get("Profit after tax")[i] / average) * 100; 
            returnAssets = returnAssets.toFixed(1) + "%";
            indicators.push(returnAssets);
        }
        console.log(indicators);
        return indicators;
    }

    // Liquidity Ratios
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

    function calculateNonCurrentLiabilities() {
        let nonCurrentLiabilities = [];
        for (let i = 0; i <= 1; i++) {
            let liabilities = data.get("Non - Current liabilitiesLoans and borrowings")[i];
            liabilities += data.get("Non - Current liabilitiesLease liabilities")[i];
            liabilities += data.get("Provisions")[i];

            nonCurrentLiabilities.push(liabilities);
        }
        return nonCurrentLiabilities;
    }

    function calculateLiquidityRatios() {
        let indicators = [];
        let currentLiabilities = calculateCurrentLiabilities();

        for (let i = 0; i <= 1; i++) {
            let currentAssets = data.get("Cash and cash equivalents")[i];
            currentAssets += data.get("Trade and other receivables")[i];
            currentAssets += data.get("Current tax receivable")[i];

            let ratio = (currentAssets / currentLiabilities[i]) * 100;
            ratio = Math.abs(ratio).toFixed(1) + "%";
            indicators.push(ratio);
        }
        console.log(indicators);
        return indicators;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
    function calculateCashRatio() {
        let indicators = [];
        let currentLiabilities = calculateCurrentLiabilities();

        for (let i = 0; i <= 1; i++) {
            let cashAndEquivalents = data.get("Cash and cash equivalents")[i];

            let ratio = (cashAndEquivalents / currentLiabilities[i]) * 100;
            ratio = Math.abs(ratio).toFixed(1) + "%";
            indicators.push(ratio);
        }
        console.log(indicators);
        return indicators;
    }

    // Solvency (Leverage) Ratios


    function callIndicatorsCalculations() {
        // Profitability Ratios
        const grossProfit = calculateProfitIndicators("Gross profit"); // 79.7% and 77%
        const operatingMargin = calculateProfitIndicators("Operating profit"); // 19.4% and 14%
        const profitMargin = calculateProfitIndicators("Profit after tax"); // 13.2% and 8.6%
        const averageAssets = calculateAverageAssets(); // 671.093,50
        const returnAssets = calculateReturns(averageAssets); // 8.7% and 5.1%
        const averageEquity = calculateAverageEquity(); // 297.381,50
        const returnEquity = calculateReturns(averageEquity); // 19.6% and 11.4%

        // Liquidity Ratios
        const currentRatio = calculateLiquidityRatios(); // 47.5% and 67.7
        // Since this company doesn't have intentory, the values are equal to current ratio. It is a services company.
        const quickRatio = calculateLiquidityRatios(); // 47.5% and 67.7
        const cashRatio = calculateCashRatio(); // 25.1% and 41.1%

        // Solvency (Leverage) Ratios

    }
    
})