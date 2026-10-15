<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# JEMIAH 🚀

## Galactic Civilization Builder: manage planets, resources, and colonies from a space-themed dashboard.

### Team Name: [Your Team Name]

### Team Members
- Member 1: Alon pious - VAST
- Member 2: Adarsh K P - VAST

### Hosted Project Link
https://jemiah.vercel.app/

### Project Description
JEMIAH is a galactic civilization builder web application where users manage planets and grow colonies.
It features an interactive dashboard with planet overviews, a resource inventory, colony statistics, and easy navigation.
A Node.js backend runs the planetary and colony simulation, so users can pick up where they left off.

### The Problem statement
[Add your problem statement here]Exploring and establishing sustainable colonies on unfamiliar planets is challenging due to limited resources, environmental hazards, and the difficulty of adapting civilizations to different planetary conditions.

### The Solution
JEMIAH provides an interactive platform for exploring planets, assessing habitability, managing resources, adapting habitats, and monitoring threats to establish sustainable galactic colonies.

---

## Technical Details

### Technologies/Components Used

**For Software:**

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | Builds the interactive user interface, including planet dashboards, resource inventory, colony statistics, and navigation. |
| Build Tool | Vite | Runs the development server and builds the frontend for production deployment. |
| Styling | Tailwind CSS v3 + Custom CSS | Creates the dark, space-themed dashboard and responsive layouts. |
| Programming Language | JavaScript (ES Modules) | Implements frontend interactions, backend operations, and simulation logic. |
| Backend | Node.js HTTP Server | Handles API requests, game logic, and saved game data. |
| API Communication | REST-style API using HTTP | Enables communication between the frontend and backend. |
| Data Storage | JSON file (`data/save.json`) | Saves and loads game progress without a separate database. |
| CSS Processing | PostCSS + Autoprefixer | Processes CSS and supports browser compatibility. |
| Deployment | Vercel for the frontend; separate backend hosting if needed | Makes the application accessible online. |

- Languages used: JavaScript (ES Modules), HTML, CSS
- Frameworks used: React 18
- Libraries used: Tailwind CSS v3, PostCSS, Autoprefixer
- Tools used: VS Code, Git, Node.js, Vite, Vercel

### Architecture Summary
The frontend is built with React 18 and styled using Tailwind CSS v3 and custom CSS. Vite handles local development and production builds. A Node.js HTTP server provides the backend API and processes the planetary and colony simulation. The backend reads and writes game progress to `data/save.json`, so the current setup uses JSON file storage rather than a separate database.

**In one line:** React 18 + Vite + Tailwind CSS + JavaScript + Node.js + HTTP API + JSON file storage.

### Deployment Note
Vercel can host the React/Vite frontend. The Node.js backend should be deployed separately if required. Permanent game progress should use suitable persistent storage, because a JSON file on a serverless deployment may not persist reliably.

---

## Features

List the key features of your project:
- Planet Dashboards: View and manage planets through an interactive, space-themed interface.
- Resource Inventory: Keep track of the resources available to your civilization.
- Colony Statistics: Monitor colony data and growth at a glance.
- Simulation Engine: A Node.js backend processes planetary and colony simulation logic.
- Save & Load Progress: Game progress is stored in `data/save.json` and restored when you return.
- Responsive Design: A dark, responsive layout built with Tailwind CSS that works across screen sizes.

---

#### Screenshots 

<img width="1896" height="900" alt="Screenshot 2026-10-15 153522" src="https://github.com/user-attachments/assets/31bedd30-5cdd-48bb-8d20-ced1b2b56ed9" />
<img width="1885" height="903" alt="Screenshot 2026-10-15 153613" src="https://github.com/user-attachments/assets/98ded60f-3880-45c2-ae54-6b85a4079236" />
<img width="1881" height="893" alt="Screenshot 2026-10-15 153555" src="https://github.com/user-attachments/assets/499e6dbb-f688-4daa-b6b8-53391da4f5fa" />


#### Diagrams

[Add architecture / flow diagrams here]
