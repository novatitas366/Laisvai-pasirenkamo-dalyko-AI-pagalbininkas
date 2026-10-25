# ND1: kodo kokybės įrankiai

Konfigūracija ir rezultatai 1 namų darbui. Programos kodas nekeičiamas.

```bash
npm install                                            # ESLint + sonarjs, dependency-cruiser
python3 -m venv .venv && .venv/bin/pip install lizard  # Lizard

npm run metrics:lizard   # CC ir NLOC kiekvienai funkcijai
npm run lint             # ESLint (complexity > 10, cognitive > 15 ir kt.)
npm run metrics:deps     # priklausomybės, fan-in / fan-out
npm run sonar:setup     # SonarQube konteineris, projektas, raktas (kartoti saugu)
npm run sonar           # SonarQube analizė
npm run sonar:results   # santrauka terminale, arba http://localhost:9000
npm run all             # viskas iš eilės
```

SonarQube: projektas `elective-assistant`, vartotojas `admin`, slaptažodis `Nd1_Kokybe_2026!` (tik lokalus konteineris).
Analizės raktas laikomas `.sonar-token` (neįtraukiamas į git).

Neapdoroti rezultatai: `results/` (eslint.json, lizard.csv, depcruise.json, sonar-*.json).
