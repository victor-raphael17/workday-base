CA Pharmacy is a system that controls pharmacy medication sells and stock. It consists of a frontend built with HTML, Bootstrap (CSS), and JavaScript, and an API developed using pure PHP. The frontend design is located in the /design-system directory, which provides a user-friendly interface for managing medication sales and stock. The database will be a PostgreSQL instance, dockerized for easy deployment and management. The frontend and backend will also be dockerized.

Each part of the software will have a Dockefile.

## Frontend

The frontend lives in `frontend/` and runs with Vite.

Install dependencies from the repository root:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The Vite dev server runs on `http://localhost:4173/` and redirects the root entry to `frontend/pages/dashboard.html`.

Build the frontend for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```