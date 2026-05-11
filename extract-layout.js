const fs = require('fs');

const homeHtmlPath = 'src/app/shared/components/home/home.component.html';
const homeScssPath = 'src/app/shared/components/home/home.component.scss';

const headerHtmlPath = 'src/app/shared/components/header/header.component.html';
const headerScssPath = 'src/app/shared/components/header/header.component.scss';

const footerHtmlPath = 'src/app/shared/components/footer/footer.component.html';
const footerScssPath = 'src/app/shared/components/footer/footer.component.scss';

let homeHtml = fs.readFileSync(homeHtmlPath, 'utf8');
let homeScss = fs.readFileSync(homeScssPath, 'utf8');

// 1. Extract Header HTML
const headerStartIdx = homeHtml.indexOf('<!-- Top Alert Banner -->');
const headerEndIdx = homeHtml.indexOf('</nav>') + '</nav>'.length;
const headerHtml = homeHtml.substring(headerStartIdx, headerEndIdx);

// 2. Extract Footer HTML
const footerStartIdx = homeHtml.indexOf('<footer');
const footerEndIdx = homeHtml.indexOf('</footer>') + '</footer>'.length;
const footerHtml = homeHtml.substring(footerStartIdx, footerEndIdx);

// 3. Extract SCSS for Header and Footer
// We will find all class names in headerHtml and footerHtml
const headerClassRegex = /class="([^"]+)"/g;
let headerClasses = new Set();
let match;
while ((match = headerClassRegex.exec(headerHtml)) !== null) {
    match[1].split(' ').forEach(c => headerClasses.add(c));
}

const footerClassRegex = /class="([^"]+)"/g;
let footerClasses = new Set();
while ((match = footerClassRegex.exec(footerHtml)) !== null) {
    match[1].split(' ').forEach(c => footerClasses.add(c));
}

// Helper to extract SCSS rules
function extractScssRules(scss, classNames) {
    let extractedScss = '';
    classNames.forEach(cls => {
        // Find .cls { ... }
        // Note: SCSS blocks can have nested braces, but since we generated them flat with @apply, we can use a simpler regex
        const regex = new RegExp(`\\.${cls}\\s*\\{[^}]+\\}`, 'g');
        let m;
        while ((m = regex.exec(scss)) !== null) {
            extractedScss += m[0] + '\n\n';
        }
    });
    return extractedScss;
}

const headerScss = extractScssRules(homeScss, headerClasses);
const footerScss = extractScssRules(homeScss, footerClasses);

// Write to header and footer components
fs.writeFileSync(headerHtmlPath, headerHtml);
fs.writeFileSync(headerScssPath, headerScss);

fs.writeFileSync(footerHtmlPath, footerHtml);
fs.writeFileSync(footerScssPath, footerScss);

console.log("Successfully extracted Header and Footer to their respective components.");
