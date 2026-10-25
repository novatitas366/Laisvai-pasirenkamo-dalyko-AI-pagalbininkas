// Atspausdina pagrindinius SonarQube rezultatus terminale (prižiūrimumas, patikimumas, saugumas, skola)
const URL = 'http://localhost:9000'
const auth = 'Basic ' + Buffer.from('admin:Nd1_Kokybe_2026!').toString('base64')
const keys = 'ncloc,sqale_rating,sqale_index,sqale_debt_ratio,reliability_rating,security_rating,bugs,vulnerabilities,code_smells,duplicated_lines_density,complexity,cognitive_complexity'
const res = await fetch(`${URL}/api/measures/component?component=elective-assistant&metricKeys=${keys}`, { headers: { Authorization: auth } })
const m = Object.fromEntries((await res.json()).component.measures.map((x) => [x.metric, x.value]))
const grade = (v) => 'ABCDE'[Math.round(Number(v)) - 1]
console.log(`NCLOC: ${m.ncloc}`)
console.log(`Maintainability Rating: ${grade(m.sqale_rating)} (skola ${m.sqale_index} min, santykis ${m.sqale_debt_ratio} %)`)
console.log(`Reliability: ${grade(m.reliability_rating)} (bugs ${m.bugs})`)
console.log(`Security: ${grade(m.security_rating)} (vulnerabilities ${m.vulnerabilities})`)
console.log(`Code smells: ${m.code_smells}, dubliavimas ${m.duplicated_lines_density} %`)
console.log(`CC / kognityvinis (suma): ${m.complexity} / ${m.cognitive_complexity}`)
