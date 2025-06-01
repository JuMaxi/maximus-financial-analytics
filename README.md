# Maximus Financial Analytics
![Mock-up Homepage](assets/images/Maximus-MockUp-Homepage.webp)
---
![Mock-up Homepage](assets/images/Maximus-MockUp-Charts.webp)
---
![Mock-up Homepage](assets/images/Maximus-MockUp-Charts-light-theme.webp)

## Demo video

[![Watch the demo video on YouTube](https://img.youtube.com/vi/wREyLs9gU-g/0.jpg)](https://www.youtube.com/watch?v=wREyLs9gU-g)


## Project Goal

Maximus Financial Analytics is a web-based platform that allows users to submit financial statements for **automated analysis**. The system extracts key data from uploaded PDF reports and calculates **financial indicators**, presenting them in a clean and user-friendly format. The goal is to support users in making more **informed financial decisions** based on quick, accessible insights.

---

## Target Audience

This project is designed for:

- Investors  
- Financial analysts  
- Business managers  
- Accountants  
- Stakeholders and decision-makers  

Anyone who needs quick and reliable insights from financial statements for strategic planning, investment evaluation, or performance assessment will benefit from this tool.

---

## About the PDF Used

For development and demonstration purposes, this project uses a **publicly available financial report**.  
The PDF file is an official **financial statement released by a company that shares it publicly**, in accordance with transparency and disclosure policies. No confidential or private data is being used.

---

## Features

- Upload PDF financial statements  
- Extract data from PDFs using `pdf.js`  
- Calculate and display financial indicators (profitability ratios, performance metrics, etc.)  
- Generate visual reports using `Chart.js` (bar, pie, line, doughnut, and bubble charts)  
- Responsive layout with Bootstrap  

---

## Technologies Used

- **HTML / CSS**  
- **Bootstrap** for responsive design  
- **JavaScript**  
- **pdf.js** for PDF parsing  
- **Chart.js** for interactive charts  
- **AI** assistance for learning, debugging, and optimizing chart generation  

---

## Use of AI

I used AI to:

- Understand new programming concepts I wasn’t familiar with  
- Debug my code when DevTools and browser debugging didn’t lead to a solution  
- Help design and optimize chart rendering logic with Chart.js  

However, the **core logic for analyzing financial data, extracting it from PDFs, and calculating indicators** was developed by myself through **personal research and financial knowledge**, not with AI.

---

## File Structure

- `index.html` – Main HTML layout  
- `style.css` – Custom styles  
- `script.js` – PDF parsing and financial data analysis logic  
- `charts.js` – Chart creation functions  

---

## Design Choices

The design of **Maximus Financial Analytics** focuses on clarity, professionalism, and ease of use. The homepage is clean and straightforward, guiding users immediately to upload their financial statement files for analysis. This simplicity supports users who want quick, reliable insights without distraction.

The color scheme is based on dark tones to convey seriousness and trust, using the following core colors defined in CSS variables:

- **Primary Color (`--primary-color: #010820`)**  
  A deep navy blue that establishes a strong, authoritative presence for primary interface elements and headers.

- **Accent Color (`--accent-color: #3498DB`)**  
  A vivid, modern blue used to draw attention to interactive components like buttons and highlights.

- **Secondary Color (`--secondary-color: #f5f5f5`)**  
  A soft, light gray ideal for supporting text, icons, and subtle UI details, enhancing readability.

- **Background Color (`--background-color: #111525`)**  
  A rich, dark indigo tone that creates a sleek and immersive backdrop for the entire interface.

These colors create a sleek, modern interface with high readability and professionalism.

> **Note:** The design and color styling of charts are currently a work in progress and will be refined in future updates.

---

## Responsiveness

The homepage and all its components are designed to be fully responsive, ensuring a smooth and user-friendly experience across all devices—from desktops and laptops to tablets and smartphones.

Layouts adapt dynamically to different screen sizes, making it easy to upload files and view financial data wherever you are.

> **Note:** The chart designs are currently a work in progress and will be optimized for better responsiveness and clarity in future updates.

--- 

## HTML & CSS Validation

Both the HTML and CSS code for this project have been fully validated using the official **W3C Validation Services**:

- [W3C Markup Validation Service](https://validator.w3.org/) – **No errors or warnings** found in the HTML.
- [W3C CSS Validation Service](https://jigsaw.w3.org/css-validator/) – **No errors** found in the CSS.

These validations ensure that the code follows web standards and promotes better accessibility, compatibility, and performance across browsers.

## Light & Dark Theme Support

This website includes a built-in **light and dark theme toggle**, allowing users to switch between themes based on their preference.

- **Light Mode**: Clean and bright interface for daytime or well-lit environments.
- **Dark Mode**: Eye-friendly, low-light interface ideal for night-time browsing.

Users can easily switch between themes for a more comfortable and personalized browsing experience.

## Notes on Minor Improvements

While the project is fully functional and achieves its intended purpose, a few minor areas for enhancement were noted during development. These do not impact the overall usability but could be refined in future updates for improved maintainability and polish.

### Chart Functions

The JavaScript functions used to generate the charts work as expected. However, since many chart configurations share similar structures, there is room to refactor them into more reusable functions to reduce code repetition.

### Gauge Chart Responsiveness

The gauge charts display correctly in most cases, but their responsiveness could be improved on smaller screens. Adjusting their scaling behavior would help maintain a more consistent appearance across devices.

### Modal Button Behavior (Light Theme)

In the light theme, the modal buttons currently do not switch between general information and calculation views as intended. This works correctly in the dark theme and is likely due to a small JavaScript issue in the dynamically generated content.

---

## Light Theme – Small Layout Enhancements

Although the light theme is fully functional, most styling and layout attention was focused on the dark theme. As a result, a few light theme-specific elements could benefit from minor adjustments:

- **General layout tweaks** to enhance visual consistency and clarity.
- **Uploaded file field** on the homepage could be more clearly styled to match the overall light theme.
- **Modal buttons**, as mentioned above, could use a fix to align behavior with the dark mode version.

These are relatively small details and do not affect the core features, but addressing them in the future would help bring both themes to the same level of refinement.

## Screenshots

### Validation Screenshots

Below are the screenshots confirming that both the HTML and CSS files for this project have passed validation using the official **W3C Validation Services** with no errors. The CSS validations presented a few warning that can be ignored.

#### HTML Validation

- **Homepage HTML**  
  ![HTML Validation - Homepage](assets/images/validations/validation-html-homepage.webp)

- **Charts Page HTML**  
  ![HTML Validation - Charts Page](assets/images/validations/validations-html-charts.webp)

#### CSS Validation

- **Main Stylesheet (style.css)**  
  ![CSS Validation - style.css](assets/images/validations/validation-style-css.webp)

- **Charts CSS**  
  ![CSS Validation - charts.css](assets/images/validations/validation-charts-css.webp)

---

## Credits & Resources

- **pdf.js**:  
  - [cdnjs](https://cdnjs.com/libraries/pdf.js/5.0.375)  
  - [Official Examples](https://mozilla.github.io/pdf.js/examples/)  
  - [GitHub Example](https://github.com/pescad085/PDFJSLibrary/blob/main/loadPDF.html)  
  - [StackOverflow – How to open local PDF](https://stackoverflow.com/questions/22048395/how-to-open-a-local-pdf-in-pdfjs-using-file-input)

- **JavaScript Resources**:  
  - [MDN – Default Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)  
  - [MDN – Math.abs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs)  
  - [MDN – Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)  
  - [StackOverflow – Dictionaries in JS](https://stackoverflow.com/questions/3559070/are-there-dictionaries-in-javascript-like-python)

- **Charts & Design Inspiration**:  
  - [Chart.js Documentation](https://www.chartjs.org/docs/latest/)  
  - [W3Schools – Chart.js](https://www.w3schools.com/js/js_graphics_chartjs.asp)  
  - [Codepen UI Inspiration](https://codepen.io/haiiaaa/pen/rNVbmYy)

---
