This file documents the JWT-based auth added to the project.

Endpoints
- POST /api/auth/signup { username, password } -> { id, username, accessToken }
- POST /api/auth/signin { username, password } -> { id, username, accessToken }
- GET /api/protected (Authorization: Bearer <token>) -> protected resource

Env
- JWT_SECRET (recommended to set in .env)
- PORT

Dev
- npm i
- npm run dev
