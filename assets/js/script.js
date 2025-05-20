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
            "Trade and other payables", "Lease liabilities",
            "Current tax payable", "Loans and borrowings", 
            "Provisions", "Finance costs", "Cash generated from operating activities",
            "Net cash flow from investing activities", "Share capital","Foreign exchange reserve",
            "Other reserves", "Retained earnings"
        ];
        
        // Calling the account name function to find the account name into the report
        for (let accountName of accountNames) {
            getAccountByName(statements, accountName);
        }
        callIndicatorsCalculations(data);
    }

    function getAccountByName(statements, accountName) {
        // Get the account name initial position
        let positionAccountName = statements.indexOf(accountName);
        // Get the account name final position
        positionAccountName += accountName.length;
        
        // Get the quantity of positions between the first character after the account name and the last character before starting a new account name
        let i = findFinalPositionAccount(statements, positionAccountName);

        // Convert the account values to integers
        let values = convertAccountValuesToInt(statements, positionAccountName, i);
        
        saveValuesAndAccountNamesToMap(accountName, values, data);
    }

    // Get the groupName position and return statement just after the group name index
    function getGroupNameIndex(statements, groupName){
        let positionGroup = statements.indexOf(groupName);
        statements = statements.substring(positionGroup);
        return statements;
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
    function saveValuesAndAccountNamesToMap(accountName, values, data) {
        
        if (accountName !== "Current tax receivable" && accountName !== "Trade and other receivables") {
            // If array of values has 3 positions, it means the index 0 is a note, not a value, and I don't need it to calculations
            if (values.length > 2) {
                values = cleanValuesArray(values);
            }
            data.set(accountName, [values[0], values[1]]);
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
    function calculateProfitIndicators(account1, data) {
        const indicators = [];

        for (let i = 0; i <= 1; i++) {
            let indicator = data.get(account1)[i] / data.get("Revenue")[i] * 100;
            indicator = indicator.toFixed(1) + "%";
            indicators.push(indicator);
        }
        console.log(indicators);
        return indicators;
    }

    function calculateAverageAssets(data) {
        let assets = [];
        for (let i = 0; i <= 1; i++) {
            let asset = data.get("Intangible assets")[i];
            asset += data.get("Goodwill")[i];
            asset += data.get("Property, plant and equipment")[i];
            asset += data.get("Deferred tax asset")[i];
            asset += data.get("Cash and cash equivalents")[i];
            asset += data.get("Trade and other receivables")[i];
            asset += data.get("Current tax receivable")[i];
            assets.push(asset);
        }
        
        let average = (assets[0] + assets[1]) / 2; // 671.093,50
        console.log(average);
        average = average.toFixed(2);
        return average;
    }

    function calculateAverageEquity(data) {
        let totalEquity = [];
        for (let i = 0; i <= 1; i++) {
            let equity = data.get("Share capital")[i];
            equity += data.get("Foreign exchange reserve")[i];
            equity += data.get("Other reserves")[i];
            equity += data.get("Retained earnings")[i];
            totalEquity.push(equity);
        }

        let average = (totalEquity[0] + totalEquity[1]) / 2; // 297.381,50
        average = average.toFixed(2);
        console.log(average)
        return average;
    }

    // Return on Assets (ROA)
    function calculateReturnAssets(data) {
        let average = calculateAverageAssets(data);
        return average;
    }

    // Return on Equity (ROE)
    function calculateReturnEquity(data) {
        let average = calculateAverageEquity(data);
        return average;
    }
    
    function callIndicatorsCalculations(data) {
        const grossProfit = calculateProfitIndicators("Gross profit", data); // 79.7% and 77%
        const operatingMargin = calculateProfitIndicators("Operating profit", data); // 19.4% and 14%
        const profitMargin = calculateProfitIndicators("Profit after tax", data); // 13.2% and 8.6%
        const returnAssets = calculateReturnAssets(data);
        const returnEquity = calculateReturnEquity(data);
    }
    
})