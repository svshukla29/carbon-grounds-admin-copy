# Carbon Grounds — Admin Dashboard (Next.js)

Admin dashboard for the Carbon Credit Platform — managing farmers, farm plots, GIS mapping, tree monitoring, and carbon credit calculations across Chhattisgarh.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Maps:** Leaflet.js (OpenStreetMap + Google Satellite)
- **Auth:** JWT via backend API
- **Language:** TypeScript

---

## Prerequisites
- Node.js 18+
- npm
- **Backend API must be running** (`http://localhost:3000`)

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/svshukla29/carbon-grounds-admin-copy.git
cd carbon-grounds-admin-copy
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start Backend First
Make sure the backend is running at `http://localhost:3000`
(See backend repo: [C-Grounds Backend](https://github.com/svshukla29/c-grounds-backend))

### 4. Run Frontend
```bash
npm run dev
```
Dashboard: `http://localhost:3001`

---

## Login
```
Email:    admin@carboncredit.in
Password: Admin@1234
```

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Stats overview |
| Farmers | `/dashboard/farmers` | Register & manage farmers |
| Farm Plots | `/dashboard/instances` | All plots with GPS boundaries |
| GIS Map | `/dashboard/map` | Satellite map with plot boundaries |
| Trees | `/dashboard/trees` | Individual tree records |
| Gram Panchayat | `/dashboard/gram-panchayat` | 89 CG GPs management |
| Species | `/dashboard/species` | Tree species master |
| Monitoring | `/dashboard/monitoring` | Field visit records |
| Calculations | `/dashboard/calculations` | Carbon credit calculator |

---

## Project Structure
```
carbon-grounds-admin/
├── app/
│   ├── dashboard/
│   │   ├── farmers/         # Farmer management
│   │   ├── instances/       # Farm plots
│   │   ├── map/             # GIS satellite map
│   │   ├── trees/           # Tree monitoring
│   │   ├── gram-panchayat/  # GP management
│   │   ├── species/         # Species master
│   │   ├── monitoring/      # Field monitoring
│   │   └── calculations/    # Carbon calculations
│   └── login/
├── components/
│   ├── farmers/             # Farmer form, list, details
│   ├── dashboard/           # Charts, metric cards
│   └── ui/                  # shadcn components
└── lib/
    ├── api.ts               # All API calls
    └── auth-context.tsx     # Auth state
```

---

## Running Both Together (Quick Start)

### Terminal 1 — SSH Tunnel
```bash
ssh -i "harshit-lakra.pem" -L 5433:rds-endpoint:5432 ubuntu@43.204.144.76 -N
```

### Terminal 2 — Backend
```bash
cd C-Grounds/backend
npm run start:dev
```

### Terminal 3 — Frontend
```bash
cd carbon-grounds-admin-copy
npm run dev
```

Open: `http://localhost:3001`

---

## Notes
- `.env.local` is not in git — create it manually
- SSH tunnel `.pem` key needed — get from repo owner
- Backend must be running for API calls to work
