# AI Pasirenkamo Dalyko Pagalbininkas – Techninis Architektūros Planas

## 1. Sistemos Architektūra

### 1.1 Bendras vaizdas

```
┌─────────────────┐     REST API      ┌─────────────────┐     Anthropic SDK    ┌──────────────┐
│   React SPA      │ ◄──────────────► │   Node.js       │ ◄──────────────────► │  Claude AI   │
│   (Tailwind)     │     JWT Auth     │   Backend       │                      │   Model      │
└─────────────────┘                  └────────┬────────┘                      └──────────────┘
                                              │
                                              │ MySQL2
                                              ▼
                                     ┌─────────────────┐
                                     │   MySQL DB      │
                                     └─────────────────┘
```

### 1.2 Architektūros principai

- **Frontend/Backend atskyrimas** – SPA ir API kaip atskiri servisai
- **Event loop** – Node.js asinchroninis modelis, non-blocking I/O
- **Modulinė struktūra** – Backend organizuotas pagal domain modulius
- **REST API** – Stateless, resource-oriented endpointai

---

## 2. Backend Moduliai

| Modulis | Atsakomybė |
|---------|------------|
| **auth** | Registracija, prisijungimas, JWT išdavimas, Argon2id hash |
| **users** | Vartotojo profilio CRUD, studijų duomenų valdymas |
| **upload** | Multer failų įkėlimas, validacija (tipas, dydis) |
| **documents** | Studijų dokumentų saugojimas, susiejimas su vartotoju |
| **recommendations** | Rekomendacijų užklausų orkestravimas |
| **ai** | Anthropic SDK integracija, promptų sudarymas, atsakymų apdorojimas |

---

## 3. Duomenų bazės struktūra (MySQL)

### Pagrindinės lentelės

- **users** – id, email, password_hash, created_at, updated_at
- **user_profiles** – user_id, study_program, completed_courses (JSON), hobbies (JSON)
- **documents** – id, user_id, filename, file_path, mime_type, size_bytes, uploaded_at
- **elective_courses** – id, code, name, description, credits (katalogas)
- **recommendation_sessions** – id, user_id, input_data (JSON), ai_response (JSON), created_at
- **audit_log** – id, user_id, action, resource, created_at (auditas)

### Reliacinės sąsajos

- users 1:1 user_profiles
- users 1:N documents
- users 1:N recommendation_sessions
- elective_courses – atskira katalogo lentelė (admin gali keisti)

---

## 4. API Endpointai

### Autentifikacija
- `POST /api/auth/register` – Registracija
- `POST /api/auth/login` – Prisijungimas, JWT grąžinimas
- `POST /api/auth/refresh` – Token atnaujinimas
- `GET /api/auth/me` – Dabartinis vartotojas (protected)

### Vartotojas
- `GET /api/users/profile` – Profilis
- `PUT /api/users/profile` – Profilio atnaujinimas (studijos, hobiai, išklausyti dalykai)

### Dokumentai
- `POST /api/documents/upload` – Failo įkėlimas (multipart/form-data)
- `GET /api/documents` – Vartotojo dokumentų sąrašas
- `DELETE /api/documents/:id` – Dokumento ištrynimas

### Rekomendacijos
- `POST /api/recommendations` – Siųsti duomenis AI, gauti rekomendacijas
- `GET /api/recommendations/history` – Istorija

### Admin (optional)
- `GET /api/admin/elective-courses` – Pasirenkamų dalykų katalogas
- `POST /api/admin/elective-courses` – Naujas dalykas

---

## 5. Frontend komponentų struktūra

### Pages
- Login, Register, Dashboard, Recommendations, Profile, DocumentUpload

### Komponentai
- **Layout** – Header, Sidebar, MainContent
- **Forms** – StudyProgramForm, CompletedCoursesForm, HobbiesForm, ElectivesListForm
- **Recommendations** – RecommendationInput, RecommendationResult, RecommendationHistory
- **Shared** – Button, Input, Card, Modal, Spinner, FileUpload

### State & Services
- AuthContext, API service (axios/fetch), real-time form state (be puslapio perkrovimo)

---

## 6. AI integracija

### Srautas
1. Backend surenka: studijų programa, išklausyti dalykai, hobiai, pasirenkamų dalykų sąrašas, dokumentų turinys
2. Sudaromas struktūrizuotas promptas su kontekstu
3. Anthropic SDK kvietimas (Claude model)
4. Atsakymas parsintas ir grąžinamas kaip rekomendacijos + paaiškinimai

### Saugumas
- API key saugomas .env, niekada neperduodamas į frontend
- Rate limiting rekomendacijų endpointui
- Input sanitization prieš siuntimą į AI

---

## 7. Saugumo mechanizmai

- JWT su trumpu expiry, refresh token
- Argon2id slaptažodžiams
- CORS konfigūracija
- Helmet, rate limiting
- Failų validacija (whitelist MIME, max size)
- SQL injection apsauga (prepared statements)

---

## 8. Klaidų valdymas

- Centralizuotas error handler middleware
- Standartizuoti API klaidų atsakymai (status, code, message)
- Logging (Winston/Pino) – klaidos, audit įvykiai
