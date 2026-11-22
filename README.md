# SMART CLASS – 智慧班级

**Together We Learn, Together We Improve.**  
International Chinese Language Classroom Management Platform · Lanzhou University of Technology (兰州理工大学)

## Architecture
- **100% Frontend-Only Static Web Application** (React + TypeScript + Vite + Tailwind CSS).
- **Zero External Databases or Backend Servers**: All classroom data (17 students, 3 balanced teams, attendance, weekly cleaning rotation, points & badges, Chinese lessons & quizzes, homework, calendar, rules, anonymous suggestions, and local PINs) is persisted automatically in browser `localStorage` with JSON backup export/import.

## Local Development
```bash
npm install
npm run dev
```

## Static Production Build
```bash
npm run build
```
Outputs the static site into `./dist`.

## Free Deployment on GitHub Pages
1. Push this repository to GitHub on the `main` branch.
2. In your GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` automatically sets the repository `VITE_BASE_PATH` (`/` for `<username>.github.io` or `/<repo-name>/` for project repositories), builds `./dist`, and publishes the live static site.
