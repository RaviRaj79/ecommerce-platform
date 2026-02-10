# E-commerce Platform

Full-stack e-commerce app with React frontend and Express/MongoDB backend. Includes product browsing, cart, checkout with Cashfree payment flow, and order management.

## Tech Stack
- Frontend: React (CRA), React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose)
- Payments: Cashfree (sandbox)
- Auth: JWT (email/password)

## Monorepo Structure
- `frontend/` React app
- `backend/` Express API

## Local Setup
### 1) Backend
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:
```
MONGO_URI=...
JWT_SECRET=...
PORT=5000
CASHFREE_APP_ID=...
CASHFREE_SECRET=...
CASHFREE_API_VERSION=2023-08-01
CASHFREE_ENV=sandbox
CLIENT_URL=http://localhost:3000
```

### 2) Frontend
```bash
cd frontend
npm install
npm start
```

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CASHFREE_CLIENT_ID=...
```

## Deployment (Render + Netlify)
### Backend (Render)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Env vars: same as `backend/.env`

### Frontend (Netlify)
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`
- Env var:
```
REACT_APP_API_URL=https://<your-render-backend>.onrender.com
```

### CORS
Set Render `CLIENT_URL` to your Netlify domain (no trailing slash):
```
CLIENT_URL=https://<your-netlify-site>.netlify.app
```

## Useful Scripts
Backend:
```bash
npm run dev
npm start
```

Frontend:
```bash
npm start
npm run build
```

## Notes
- Cashfree is configured for sandbox by default.
- For production, update `CASHFREE_ENV=production` and use live keys.

## License
MIT
MIT License

Copyright (c) 2026 Ravi Raj

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
