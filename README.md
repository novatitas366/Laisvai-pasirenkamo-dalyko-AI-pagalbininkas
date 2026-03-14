# AI Pasirenkamo Dalyko Pagalbininkas

Universitetui skirtas AI pagrindu veikiantis pasirenkamų dalykų rekomendacijų pagalbininkas.

## Struktūra

```
├── client/                 # React + Tailwind frontend
│   ├── src/
│   │   ├── components/     # Layout, forms, recommendations, shared
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── public/
├── server/                 # Node.js backend
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/        # auth, users, upload, documents, recommendations, ai
│       └── utils/
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
│   └── ARCHITECTURE.md     # Techninis architektūros planas
└── .env.example
```

## Technologijos

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Anthropic SDK
- **DB:** MySQL
- **Auth:** JWT, Argon2id
- **Upload:** Multer

## Dokumentacija

Pilnas techninis planas: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
