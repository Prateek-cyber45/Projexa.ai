// inject_nav.js
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const rootDir = 'html_stack';
const htmlFiles = [];

function getAllFiles(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath);
        } else if (file.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    });
}

getAllFiles(rootDir);

let resultsReport = `# Navigation Injection Report\n\n`;
let filesModified = 0;
let filesSkipped = 0;

htmlFiles.forEach(file => {
    let category = 'Unknown';
    if (file.includes('before_signup')) category = 'Pre-login';
    else if (file.includes('after_signup')) category = 'Post-login';
    else if (file.includes('common_pages')) category = 'Common';
    
    // Skip common_pages - they don't need injection
    if (category === 'Common') {
        filesSkipped++;
        return;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(content);
    
    // Check if nav already exists
    const existingNav = $('nav').length > 0;
    const existingLoginLink = $('a[href*="login"]').length > 0;
    const existingDashboardLink = $('a[href*="dashboard"]').length > 0 && category === 'Post-login';
    
    let shouldInject = false;
    let navHtml = '';
    
    // Determine if injection is needed
    if (category === 'Pre-login') {
        // Pre-login pages should have login link
        if (!existingLoginLink) {
            shouldInject = true;
            navHtml = `<nav class="w-full z-50 bg-[#131313]/90 backdrop-blur-2xl border-b border-white/5 py-4 px-6 flex items-center justify-between">
              <span class="text-sm font-bold text-on-surface-variant">
                <a href="/common_pages/login.html" class="hover:text-white transition-colors">Login</a>
              </span>
            </nav>`;
        }
    } else if (category === 'Post-login') {
        // Post-login pages should have dashboard and logout links
        if (!existingDashboardLink && !file.includes('dashboard')) {
            shouldInject = true;
            navHtml = `<nav class="w-full z-50 bg-[#131313]/90 backdrop-blur-2xl border-b border-white/5 py-4 px-6 flex items-center gap-4 text-sm font-bold">
                <a href="/after_signup/services/dashboard_pro.html" class="text-on-surface-variant hover:text-white transition-colors">Dashboard</a>
                <a href="/common_pages/login.html" class="text-on-surface-variant hover:text-white transition-colors">Logout</a>
            </nav>`;
        }
    }
    
    if (shouldInject && navHtml) {
        // Find body tag and insert nav as first child
        const body = $('body');
        if (body.length > 0) {
            body.prepend(navHtml);
            const modifiedContent = $.html();
            fs.writeFileSync(file, modifiedContent, 'utf-8');
            filesModified++;
            resultsReport += `✅ **Modified:** ${file}\n  - Category: ${category}\n  - Injected navigation\n\n`;
        } else {
            resultsReport += `⚠️ **ERROR:** ${file}\n  - No body tag found\n\n`;
            filesSkipped++;
        }
    } 
});

resultsReport = `**Files Modified: ${filesModified}**\n**Files Skipped: ${filesSkipped}**\n\n` + resultsReport;
fs.writeFileSync('nav_injection_report.md', resultsReport, 'utf-8');
console.log(`\n✅ Navigation injection complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Files skipped: ${filesSkipped}`);
