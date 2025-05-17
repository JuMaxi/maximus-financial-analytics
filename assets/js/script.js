import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.min.mjs"; // import the libray PDF.js

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs'; // means that PDF.js requires a worker script to function,
//explicitly telling it where to find the worker file. Required when working with modules.

document.addEventListener("DOMContentLoaded", function() {

    // Variable to the file pdf
    const fileInput = document.getElementById("file");
    // Variable the the button analyze
    const loadFile = document.getElementById("loadFile");

    // When clicking the analyze button it calls the functions to handle the file
    loadFile.addEventListener("click", handleFileUpload);

    // Function to handle the file (user input)
    function handleFileUpload() {
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

        /*
            The array buffer is a chunk of binary data in memory. A low-level representation of binary data in JavaScript.
            Read the file as ArrayBuffer
        */
        
        reader.readAsArrayBuffer(file);
    }

    // Function to load the file
    // Using the async here, so it is waiting the page being loaded before execute the following code
    async function loadPdf(typedArray) {
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        // Call the process page function having as a parameter the pdf file loaded
        const statements = await processPage(pdf);

        let firstAccount = findAccountName(statements, "Revenue");
        let secondAccount = findAccountName(statements, "Depreciation and amortisation");
        let thirdAccount = findAccountName(statements, "Cash and cash equivalents");

    }

    // Function to process the pages
    // Using the async here, so it is waiting the page being loaded before execute the following code
    async function processPage(pdf) {
        let statements = "";
        for(let pagNum = 1; pagNum <= pdf.numPages; pagNum++) {
            const pageText = await extractPageText(pagNum, pdf);

            if (
                pageText.includes("Consolidated income statement") &&
                pageText.includes("For the year ended 28 February 2025")
            ) {
                statements += pageText;

                let pageNumStatements = pagNum + 1;

                while(pageNumStatements <= pdf.numPages)
                {
                    const pageStatement = await extractPageText(pageNumStatements, pdf);

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

    async function extractPageText(pagNum, pdf) {
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

    function findAccountName(statements, accountName) {
        // Get the account name initial position
        let positionAccountName = statements.indexOf(accountName);
        // Get the account name final position
        positionAccountName += accountName.length;
        
        // Get the quantity of positions between the first character after the account name and the last character before starting a new account name
        let i = findFinalPositionAccount(statements, positionAccountName);

        // Convert the account values to integers
        let data = convertAccountValuesToInt(statements, positionAccountName, i);
       
        console.log(data);
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
            statements[i] === ","
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
            .replace(",", "")
            .replace(")", "")
            .replace("(", "-")
            
        ).map(n => parseInt(n));

        return data;
    }


})