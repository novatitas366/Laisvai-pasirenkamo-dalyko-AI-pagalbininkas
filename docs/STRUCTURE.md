# Projekto folder ir failų struktūra

```
Laisvai-pasirenkamo-dalyko-AI-pagalbininkas/
│
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── forms/
│   │   │   │   ├── StudyProgramForm.jsx
│   │   │   │   ├── CompletedCoursesForm.jsx
│   │   │   │   ├── HobbiesForm.jsx
│   │   │   │   └── ElectivesListForm.jsx
│   │   │   ├── recommendations/
│   │   │   │   ├── RecommendationInput.jsx
│   │   │   │   ├── RecommendationResult.jsx
│   │   │   │   └── RecommendationHistory.jsx
│   │   │   └── shared/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── FileUpload.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── DocumentUploadPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useRecommendations.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validateRequest.js
│   │   │   └── rateLimiter.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   └── auth.routes.js
│   │   │   ├── users/
│   │   │   │   ├── users.controller.js
│   │   │   │   ├── users.service.js
│   │   │   │   └── users.routes.js
│   │   │   ├── upload/
│   │   │   │   ├── upload.controller.js
│   │   │   │   ├── upload.service.js
│   │   │   │   └── upload.routes.js
│   │   │   ├── documents/
│   │   │   │   ├── documents.controller.js
│   │   │   │   ├── documents.service.js
│   │   │   │   └── documents.routes.js
│   │   │   ├── recommendations/
│   │   │   │   ├── recommendations.controller.js
│   │   │   │   ├── recommendations.service.js
│   │   │   │   └── recommendations.routes.js
│   │   │   └── ai/
│   │   │       ├── ai.service.js
│   │   │       └── prompts.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── errors.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_user_profiles.sql
│   │   ├── 003_create_documents.sql
│   │   ├── 004_create_elective_courses.sql
│   │   └── 005_create_recommendation_sessions.sql
│   └── seeds/
│       └── elective_courses.sql
│
├── docs/
│   ├── ARCHITECTURE.md              # Techninis architektūros planas
│   └── STRUCTURE.md                 # Šis failas
│
├── .env.example
└── README.md
```
