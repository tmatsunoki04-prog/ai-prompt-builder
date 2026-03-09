const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OLD_DOMAIN = "https://pitaprompt.com/";
const NEW_DOMAIN = "https://pitaprompt.vercel.app/";

const files = [
    "index.html",
    "index-ja.html",
    "chatgpt-does-not-understand.html",
    "why-ai-misunderstands-intent.html",
    "rough-notes-to-ai-prompts.html",
    "sitemap.xml",
    "robots.txt"
];

let changedFiles = 0;

files.forEach(file => {
    const filepath = path.join(DIR, file);
    if (fs.existsSync(filepath)) {
        let content = fs.readFileSync(filepath, 'utf-8');
        // Replace all occurrences of https://pitaprompt.com/ with https://pitaprompt.vercel.app/
        // as well as https://pitaprompt.com without the trailing slash just in case
        
        let newContent = content.replace(/https:\/\/pitaprompt\.com\//g, NEW_DOMAIN);
        newContent = newContent.replace(/https:\/\/pitaprompt\.com/g, NEW_DOMAIN.slice(0, -1)); // without trailing slash

        if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf-8');
            changedFiles++;
            console.log(`Updated ${file}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});

// Also check seo/howto.jsonld and seo/faq.jsonld if they exist
const seoFiles = ["seo/howto.jsonld", "seo/faq.jsonld", "privacy.html", "privacy-ja.html", "terms.html", "terms-ja.html"];
seoFiles.forEach(file => {
     const filepath = path.join(DIR, file);
     if (fs.existsSync(filepath)) {
         let content = fs.readFileSync(filepath, 'utf-8');
         let newContent = content.replace(/https:\/\/pitaprompt\.com\//g, NEW_DOMAIN);
         newContent = newContent.replace(/https:\/\/pitaprompt\.com/g, NEW_DOMAIN.slice(0, -1));
         
         if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf-8');
            changedFiles++;
            console.log(`Updated ${file}`);
        }
     }
});

console.log(`Domain replacement completed. Total files updated: ${changedFiles}`);
