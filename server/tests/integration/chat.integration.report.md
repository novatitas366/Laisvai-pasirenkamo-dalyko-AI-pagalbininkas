# Integracinio testo ataskaita

| Laukas | Reikšmė |
|---|---|
| **Failas** | `server/tests/integration/chat.integration.test.js` |
| **Susijęs SCRUM** | SCRUM-47 |
| **Užduotis** | 3_užduotis |

---

## Užduoties reikalavimų įvykdymas

| Reikalavimas | Tipas | Aprašymas | Padengtas testu |
|---|---|---|---|
| Pokalbiai rodomi nuo naujausio iki seniausio | Funkcinis | Rūšiavimas pagal `updated_at DESC` | TA-01 |
| Prieiga tik autorizuotam vartotojui (JWT) | Funkcinis | 401 be žetono / su neteisingas žetonas | TA-02 |
| Užklausos vykdymo laikas < 200ms | Nefunkcinis (Performance) | Laikmatis aplink HTTP užklausą | TA-03 |
| Pokalbio pavadinimas ribotas iki 100 simbolių | Funkcinis | Sutrumpinimas `substring(0, 100)` serviso lygmenyje | TA-04 |

---

## Kas yra integracinis testas ir kodėl šis testas yra integracinis?

**Integracinis testas** patikrina, ar keli sistemos komponentai teisingai veikia kartu — ne izoliuotai (kaip unit testai), bet sujungti į srautą. Integracinis testas atskleidžia klaidas, kylančias iš komponentų **sąveikos**: neteisingi duomenų perdavimai, netinkami atsakymų formatai, ar auth middleware neteisingai perduoda `req.user`.

**Šis testas yra integracinis**, nes:

1. **Controller + Service sąveika tikrinama kartu.** `conversations.controller.js` iškviečia `conversations.service.js` metodus (`getConversations`, `renameConversation`). Testas per realų HTTP srautą patikrina, ar controller teisingai perduoda DB rezultatus klientui, o ne testuoja kiekvieną funkciją atskirai.

2. **Realus HTTP sluoksnis naudojamas per Supertest.** Supertest paleidžia Express app (su visais middleware ir maršrutais) ir siunčia tikras HTTP užklausas — taip tikrinama viso maršruto logika nuo `app.use('/api', router)` iki galutinio `res.json()`.

3. **Auth middleware integruojamas į srautą.** JWT `authenticate` middleware turi būti aktyvus maršrute, kad TA-02 praeitų — tai reiškia, kad testas tikrina ne tik controller logiką, bet ir middleware bei controller integraciją.

4. **DB sluoksnis mock'inamas kontroliuojamai.** `pool.query` ir `pool.execute` mock'inami, kad testas būtų deterministinis ir greitas, tačiau visi kiti sluoksniai (Express routing, middleware, controller, service) dirba realiai.

---

## Integracija tarp ko?

```
HTTP užklausa (Supertest)
        │
        ▼
Express app.js
  ├── cors() middleware
  ├── express.json() middleware
  └── /api maršrutų registracija
        │
        ▼
conversations.routes.js
  ├── authenticate middleware  ← JWT tikrinimas (req.headers.authorization)
  │       └── 401 jei nėra / neteisingas žetonas
  └── conversationsController.list / .rename
        │
        ▼
conversations.controller.js
  ├── Iškviečia conversationsService.getConversations()
  ├── Arba conversationsService.renameConversation(id, title)
  └── res.json(result) arba next(error)
        │
        ▼
conversations.service.js
  ├── pool.query('SELECT ... ORDER BY updated_at DESC')  ← [MOCK]
  └── pool.execute('UPDATE conversations SET title = ?') ← [MOCK]
        │
        ▼
MySQL duomenų bazė  ← jest.mock imituoja pool.query / pool.execute
```

**Komponentai, kurie integruojami šiame teste:**
- **HTTP sluoksnis** — Express app su visais middleware
- **Maršrutų sluoksnis** — `conversations.routes.js` su JWT apsauga (`authenticate`)
- **Controller sluoksnis** — `conversations.controller.js` (HTTP ↔ Service ryšys)
- **Service sluoksnis** — `conversations.service.js` (verslo logika + SQL formavimas)
- **DB mock** — `pool.query` / `pool.execute` imituojami per `jest.unstable_mockModule`

---

## Testų atvejų aprašymas

### TA-01 — Sėkmingas pokalbių gavimas ir rūšiavimas

| Laukas | Aprašymas |
|---|---|
| **Scenarijus** | Autorizuotas vartotojas kreipiasi į `GET /api/conversations`. DB grąžina tris pokalbius surūšiuotus pagal `updated_at DESC`. |
| **Prielaidos** | JWT žetonas galiojantis; `pool.query` mock'intas grąžinti `MOCK_CONVERSATIONS` masyvą nuo naujausio iki seniausio. |
| **Žingsniai** | 1. Sukurti galiojantį JWT (`makeToken(1)`). 2. Siųsti `GET /api/conversations` su `Authorization: Bearer <token>`. 3. Patikrinti atsakymą. |
| **PASS kriterijus** | HTTP 200; atsakymas yra masyvas; kiekvienas `updated_at` >= sekančio elemento `updated_at`; `pool.query` iškviestas su `ORDER BY updated_at DESC`. |
| **FAIL kriterijus** | Ne 200 statusas; masyvas ne rūšiuotas; `pool.query` neiškviestas arba iškviestas be `ORDER BY updated_at DESC`. |

---

### TA-02 — Neautorizuota prieiga (JWT apsauga)

| Laukas | Aprašymas |
|---|---|
| **Scenarijus** | Neautorizuotas vartotojas bando gauti pokalbių sąrašą be žetono arba su neteisingas žetonas. |
| **Prielaidos** | `authenticate` middleware prijungtas prie `GET /api/conversations` maršruto. |
| **Žingsniai** | 1. Siųsti `GET /api/conversations` be `Authorization` antraštės. 2. Siųsti su `Authorization: Bearer neteisingas.zetonas.cia`. 3. Siųsti su žetonu, bet be `Bearer ` prefikso. |
| **PASS kriterijus** | Visais atvejais HTTP 401; atsakyme `error` laukas; `pool.query` **neiškviestas** (DB nepasiekiama neautorizuotiems). |
| **FAIL kriterijus** | Bet kuri užklausa grąžina ne 401 (pvz., 200 reiškia, kad `authenticate` middleware neprijungtas); DB pasiekiama neautorizuotu atveju. |

---

### TA-03 — Greičio reikalavimas (< 200ms)

| Laukas | Aprašymas |
|---|---|
| **Scenarijus** | Autorizuotas vartotojas kreipiasi į `GET /api/conversations`. Tikrinama, ar visas HTTP ciklas (nuo užklausos iki atsakymo) trunka mažiau nei 200ms. |
| **Prielaidos** | `pool.query` mock'intas (nėra tikro DB laukimo); serveris lokalioje aplinkoje. |
| **Žingsniai** | 1. Įrašyti `Date.now()` prieš užklausą. 2. Siųsti `GET /api/conversations`. 3. Apskaičiuoti `Date.now() - start`. |
| **PASS kriterijus** | `duration < 200` ms. |
| **FAIL kriterijus** | `duration >= 200` ms — reiškia, kad middleware grandinė, routing arba serialization yra per lėti net su mock'inta DB. |

---

### TA-04 — Pokalbio pavadinimo 100 simbolių riba

| Laukas | Aprašymas |
|---|---|
| **Scenarijus** | Vartotojas bando pervadinti pokalbį pateikdamas per ilgą pavadinimą (150 simbolių). Sistema turi jį sutrumpinti iki 100 simbolių prieš išsaugant DB. |
| **Prielaidos** | `pool.execute` mock'intas: pirmasis kvietimas imituoja `UPDATE` sėkmę (`affectedRows: 1`), antrasis — `SELECT` su jau sutrumpintu pavadinimu. |
| **Žingsniai** | 1. Sukurti pavadinimą iš 150 `'A'` simbolių. 2. Siųsti `PATCH /api/conversations/1/rename` su `{ title: longTitle }`. 3. Patikrinti atsakymą. 4. Patikrinti `pool.execute` kvietimą. |
| **PASS kriterijus** | HTTP 200; `res.body.title` ilgis = 100; `pool.execute` kviestas su `UPDATE conversations` ir sutrumpintu pavadinimu (`'A'.repeat(100)`). Tuščias pavadinimas grąžina 400. Lygiai 100 simbolių — priimamas be sutrumpinimo. |
| **FAIL kriterijus** | Pavadinimas nesutrumpinamas (ilgis > 100); `pool.execute` kviestas su originaliu ilgu pavadinimu; 200 grąžinamas tuščiam pavadinimui. |

---

## Reikalavimų padengimo lentelė

| Reikalavimas | Tipas | Testinis atvejis | Padengimas |
|---|---|---|---|
| Pokalbiai rodomi nuo naujausio iki seniausio | Funkcinis | TA-01 | Pilnas |
| Sąrašas prieinamas tik autorizuotam vartotojui | Funkcinis | TA-02 | Pilnas |
| Pokalbio pavadinimas ribotas iki 100 simbolių | Funkcinis | TA-04 | Pilnas |
| API užklausa < 200ms | Nefunkcinis (Performance) | TA-03 | Pilnas |
| Tuščio pavadinimo validacija | Funkcinis (edge case) | TA-04 | Pilnas |
| Lygiai 100 simbolių pavadinimas | Funkcinis (ribinis atvejis) | TA-04 | Pilnas |

---

## Kaip paleisti testą

### Prieš paleidimą

Įsitikinkite, kad esate `server/` kataloge ir įdiegtos priklausomybės:

```bash
cd server
npm install
```

### Paleidimas

```bash
npm run test:chat-integration
```

Šis skriptas vykdo:

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js \
  --config jest.config.cjs \
  --testPathPatterns=integration/chat \
  --runInBand \
  --forceExit \
  --no-coverage
```

### Tikėtina išvestis

```
PASS tests/integration/chat.integration.test.js
  TA-01 | GET /api/conversations — sėkmingas gavimas ir rūšiavimas
    ✓ grąžina 200 ir pokalbių masyvą surūšiuotą nuo naujausio iki seniausio
    ✓ grąžina tuščią masyvą, kai pokalbių nėra
  TA-02 | GET /api/conversations — neautorizuota prieiga (JWT apsauga)
    ✓ grąžina 401, kai Authorization antraštė nepateikta
    ✓ grąžina 401, kai pateiktas neteisingas JWT žetonas
    ✓ grąžina 401, kai Authorization antraštė pateikta be Bearer prefikso
  TA-03 | GET /api/conversations — greičio reikalavimas (< 200ms)
    ✓ užklausa įvykdoma per mažiau nei 200ms
  TA-04 | PATCH /api/conversations/:id/rename — 100 simbolių riba
    ✓ sutrumpina pavadinimą iki 100 simbolių ir išsaugo
    ✓ grąžina 400, kai pavadinimas tuščias
    ✓ priima lygiai 100 simbolių pavadinimą be sutrumpinimo

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```
