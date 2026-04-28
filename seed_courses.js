const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'academy_db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err);
        process.exit(1);
    }
});

const courses = [
    { title: "SOC Analyst Fundamentals", description: "Learn the core skills required to analyze logs, respond to alerts, and operate in a modern Security Operations Center environment.", category: "soc", difficulty: "beginner" },
    { title: "Digital Forensics Deep Dive", description: "Master the art of memory analysis, network forensics, disk image analysis, and malware artifact recovery.", category: "forensics", difficulty: "advanced" },
    { title: "Threat Intelligence & Hunting", description: "Learn to proactively hunt for adversaries, analyze intelligence feeds, and map TTPs using MITRE ATT&CK.", category: "threat-intel", difficulty: "intermediate" },
    { title: "Incident Response Playbooks", description: "Handle critical infrastructure incidents using industry-standard playbooks tailored for major enterprise breaches.", category: "ir", difficulty: "advanced" },
    { title: "Red Team Methodologies", description: "Understand the attacker's mindset. Covers basic exploitation, privilege escalation, and lateral movement.", category: "red-team", difficulty: "intermediate" },
    { title: "CISO Leadership & Strategy", description: "Learn risk management, compliance frameworks, and high-level cybersecurity strategic planning.", category: "ciso", difficulty: "beginner" }
];

db.serialize(() => {
    db.run("DELETE FROM courses");
    const stmt = db.prepare("INSERT INTO courses (title, description, category, difficulty) VALUES (?, ?, ?, ?)");
    for (const c of courses) {
        stmt.run(c.title, c.description, c.category, c.difficulty);
    }
    stmt.finalize();
});

db.close((err) => {
    if (err) console.error("Error closing DB:", err);
    else console.log("Academy database courses successfully seeded.");
});
