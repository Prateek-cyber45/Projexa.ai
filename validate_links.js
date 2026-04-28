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

let report = `# Link QA Report\n\n`;
let totalIssues = 0;

htmlFiles.forEach(file => {
    let category = 'Unknown';
    if (file.includes('before_signup')) category = 'Pre-login';
    else if (file.includes('after_signup')) category = 'Post-login';
    else if (file.includes('common_pages')) category = 'Common';

    const content = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(content);
    
    // Heuristic selectors for header and footer navigation
    const headerLinks = $('nav a, header a, .header a, #navbar a').toArray();
    const footerLinks = $('footer a, .footer a, #footer a').toArray();

    const links = [...headerLinks, ...footerLinks];
    let fileReport = `## File: [${category}] ${file}\n`;
    let fileHasIssues = false;

    // deduplicate by DOM element
    const uniqueLinks = new Set(links);

    let i = 1;
    for (const link of uniqueLinks) {
        const $link = $(link);
        const href = $link.attr('href') || '';
        const text = $link.text().trim().replace(/\s+/g, ' ');

        let issue = null;
        
        // Rules
        if (!href || href === '#' || href === 'javascript:void(0)') {
             // Exception: might be a toggle/dropdown
             if (!$link.attr('onclick') && !$link.hasClass('dropdown-toggle')) {
                 issue = 'Empty or placeholder href ("#")';
             }
        } else if (href.includes('mailto:')) {
             // allow
        } else {
            // Check cross-access boundaries according to Step 4
            if (category === 'Pre-login' && href.includes('after_signup')) {
                issue = 'Pre-login page links directly to post-login page.';
            }
            if (category === 'Post-login' && href.includes('before_signup/index.html') && text.toLowerCase() !== 'home') {
                issue = 'Post-login page links to before_signup indiscriminately.';
            }
        }
        
        // specific logic to verify URL mappings and labels
        const map = {
            'dashboard': 'dashboard.html',
            'threat intel': 'threat_intelligence.html',
            'alerts': 'alerts_management.html',
            'endpoint': 'endpoint_security.html',
            'incident': 'incident_investigation.html',
            'siem': 'siem_logs.html',
            'settings': 'settings_soc.html'
        };

        const tLower = text.toLowerCase();
        for (const [k, v] of Object.entries(map)) {
             if (tLower.includes(k) && !href.includes(v) && href !== '#' && !href.includes('dashboard_')) {
                 issue = `Label/URL mismatch: Text says "${text}", href is "${href}". Expected containing "${v}"`;
             }
        }
        
        // Detect login rule implementation
        
        if (issue) {
            fileHasIssues = true;
            fileReport += `- ❌ **Issue:** [Label: "${text}"] [Href: "${href}"] -> ${issue}\n`;
            totalIssues++;
        }
    }
    
    // Check global requirements Step 4
    let hasLoginLink = false;
    let hasDashboardLink = false;
    let hasLogoutLink = false;

    $('a').each((_, a) => {
        const href = $(a).attr('href') || '';
        const txt = $(a).text().toLowerCase();
        if (txt.includes('login') || href.includes('login.html')) hasLoginLink = true;
        if (txt.includes('logout') || href.includes('#')) hasLogoutLink = true; // placeholder for logout logic
        if (txt.includes('dashboard') || href.includes('dashboard')) hasDashboardLink = true;
    });

    if (category === 'Pre-login' && !hasLoginLink) {
        fileReport += `- ⚠️ **Missing Rule:** Pre-login page does not have a clear "Login" link.\n`;
        fileHasIssues = true;
        totalIssues++;
    }
    
    if (category === 'Post-login' && !hasDashboardLink && !file.includes('dashboard')) {
        fileReport += `- ⚠️ **Missing Rule:** Post-login page missing Dashboard navigation.\n`;
        fileHasIssues = true;
        totalIssues++;
    }

    if (fileHasIssues) {
        report += fileReport + '\n';
    }
});

report = `**Total issues found: ${totalIssues}**\n\n` + report;
fs.writeFileSync('link_qa_report.md', report, 'utf-8');
console.log('Analysis complete. Found', totalIssues, 'issues. Check link_qa_report.md');
