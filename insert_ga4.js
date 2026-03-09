const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const GA_CODE = `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-S36197SB40"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-S36197SB40');
    </script>
</head>`;

const addedFiles = [];
const skippedFiles = [];

fs.readdirSync(DIR).forEach(file => {
    if (file.endsWith('.html')) {
        const filepath = path.join(DIR, file);
        let content = fs.readFileSync(filepath, 'utf-8');
        
        if (content.includes('G-S36197SB40')) {
            skippedFiles.push(file);
        } else if (content.includes('</head>')) {
            // Replace the last occurrence of </head> (or simply </head>) with the GA code + </head>
            content = content.replace('</head>', GA_CODE);
            fs.writeFileSync(filepath, content, 'utf-8');
            addedFiles.push(file);
        }
    }
});

console.log("=== GA4 INJECTION REPORT ===");
console.log("Added Files: " + addedFiles.join(", "));
console.log("Skipped (Duplicate) Files: " + skippedFiles.join(", "));
