/**
 * MitrePanel.jsx — Maps threat labels to MITRE ATT&CK tactics and techniques.
 * Shown in the simulation analysis sidebar.
 */

const MITRE_MAP = {
  brute_force: {
    tactic: 'Credential Access', id: 'TA0006',
    technique: 'Brute Force', tid: 'T1110',
    subtechniques: ['Password Spraying (T1110.003)', 'Credential Stuffing (T1110.004)'],
    mitigation: 'Account lockout policies, MFA, fail2ban, rate-limiting on auth endpoints.',
    color: 'text-orange-400', border: 'border-orange-800', bg: 'bg-orange-950/30',
  },
  sql_injection: {
    tactic: 'Initial Access', id: 'TA0001',
    technique: 'Exploit Public-Facing Application', tid: 'T1190',
    subtechniques: ['SQL Injection (T1190)', 'Command Injection'],
    mitigation: 'Parameterised queries, input validation, WAF rules, least-privilege DB accounts.',
    color: 'text-yellow-400', border: 'border-yellow-800', bg: 'bg-yellow-950/30',
  },
  ransomware: {
    tactic: 'Impact', id: 'TA0040',
    technique: 'Data Encrypted for Impact', tid: 'T1486',
    subtechniques: ['Inhibit System Recovery (T1490)', 'Service Stop (T1489)'],
    mitigation: 'Offline backups, EDR with rollback, network segmentation, disable SMBv1.',
    color: 'text-red-400', border: 'border-red-800', bg: 'bg-red-950/30',
  },
  ddos: {
    tactic: 'Impact', id: 'TA0040',
    technique: 'Network Denial of Service', tid: 'T1498',
    subtechniques: ['Direct Network Flood (T1498.001)', 'Reflection Amplification (T1498.002)'],
    mitigation: 'Rate limiting, upstream scrubbing, Anycast, CDN, ISP-level BGP filtering.',
    color: 'text-red-400', border: 'border-red-800', bg: 'bg-red-950/30',
  },
  lateral_movement: {
    tactic: 'Lateral Movement', id: 'TA0008',
    technique: 'Use Alternate Authentication Material', tid: 'T1550',
    subtechniques: ['Pass the Hash (T1550.002)', 'Pass the Ticket (T1550.003)'],
    mitigation: 'Privileged Access Workstations, Credential Guard, network segmentation.',
    color: 'text-purple-400', border: 'border-purple-800', bg: 'bg-purple-950/30',
  },
  data_exfil: {
    tactic: 'Exfiltration', id: 'TA0010',
    technique: 'Exfiltration Over C2 Channel', tid: 'T1041',
    subtechniques: ['Exfiltration Over DNS (T1048.003)', 'Exfiltration Over HTTPS'],
    mitigation: 'DLP solutions, DNS monitoring, block large outbound transfers, CASB.',
    color: 'text-blue-400', border: 'border-blue-800', bg: 'bg-blue-950/30',
  },
  phishing: {
    tactic: 'Initial Access', id: 'TA0001',
    technique: 'Phishing', tid: 'T1566',
    subtechniques: ['Spearphishing Attachment (T1566.001)', 'Spearphishing Link (T1566.002)'],
    mitigation: 'Email filtering, DMARC/DKIM/SPF, user awareness training, URL sandboxing.',
    color: 'text-green-400', border: 'border-green-800', bg: 'bg-green-950/30',
  },
  zero_day: {
    tactic: 'Initial Access / Execution', id: 'TA0001',
    technique: 'Exploit Public-Facing Application', tid: 'T1190',
    subtechniques: ['Zero-Day Exploitation', 'Memory Corruption'],
    mitigation: 'Isolate affected system, capture memory dump, escalate to IR team, patch vendor.',
    color: 'text-red-400', border: 'border-red-800', bg: 'bg-red-950/40',
  },
  benign: {
    tactic: 'None', id: '—',
    technique: 'Normal Traffic', tid: '—',
    subtechniques: ['No indicators of compromise'],
    mitigation: 'No action required. Continue monitoring baseline traffic.',
    color: 'text-green-400', border: 'border-green-800', bg: 'bg-green-950/20',
  },
}

export default function MitrePanel({ threatLabel }) {
  const info = MITRE_MAP[threatLabel?.toLowerCase()] || MITRE_MAP['benign']
  return (
    <div className={`rounded border p-3 text-xs font-mono ${info.border} ${info.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-bold text-sm ${info.color}`}>MITRE ATT&CK</span>
        <span className="text-gray-600 text-[10px]">Framework Mapping</span>
      </div>
      <div className="space-y-1.5">
        <Row label="Tactic" value={`${info.tactic} (${info.id})`} color={info.color} />
        <Row label="Technique" value={`${info.technique} (${info.tid})`} color={info.color} />
        <div>
          <span className="text-gray-500">Sub-techniques:</span>
          <ul className="mt-0.5 ml-3 space-y-0.5">
            {info.subtechniques.map((s, i) => (
              <li key={i} className="text-gray-400 list-disc list-inside">{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-gray-500">Mitigation:</span>
          <p className="text-gray-400 mt-0.5 leading-relaxed">{info.mitigation}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-20 shrink-0">{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  )
}
