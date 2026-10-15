import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(ROOT, 'data');
const SAVE_FILE = path.join(DATA_DIR, 'save.json');
const PORT = Number(process.env.PORT || 3001);
const MAX_BODY_BYTES = 64 * 1024;

const planets = [
  { id: 'aurelia-9', name: 'Zephyria', type: 'High-wind', description: 'A high-wind planet with powerful crosswinds and exposed terrain.', features: ['High winds', 'Wind energy', 'Open terrain'], temperature: 18, gravity: 1.04, atmosphere: 'N₂ / O₂ / Ar', water: 82, minerals: 71, energy: 58, radiation: 17, hazards: ['High-wind systems', 'North polar ice quakes'], status: 'Scouted', route: 'Asterion corridor' },
  { id: 'selene-7', name: 'Eclipse Prime', type: 'Low-light', description: 'A low-light planet with limited daylight and long shadowed regions.', features: ['Low light', 'Cryogenic terrain', 'Subsurface water'], temperature: -11, gravity: 0.78, atmosphere: 'N₂ / He / CO₂', water: 68, minerals: 80, energy: 31, radiation: 22, hazards: ['Cryovolcanic vents', 'Low-light storms'], status: 'Active outpost', route: 'Luna lane' },
  { id: 'vexor-3', name: 'Nexora', type: 'Alien civilization', description: 'An advanced alien civilization world with valuable technology and restricted zones.', features: ['Advanced alien civilization', 'Ancient technology', 'First-contact site'], temperature: 34, gravity: 1.28, atmosphere: 'CO₂ / SO₂ / N₂', water: 19, minerals: 91, energy: 75, radiation: 54, hazards: ['Unmapped defense systems', 'Seismic surges'], status: 'Unmapped', route: 'Ash spine' },
  { id: 'thalassa-4', name: 'Edenis', type: 'Terraforming candidate', description: 'A water-rich world and promising candidate for long-term terraforming.', features: ['Terraforming candidate', 'High water', 'Stable atmosphere'], temperature: 23, gravity: 0.92, atmosphere: 'N₂ / O₂ / H₂O vapour', water: 90, minerals: 53, energy: 48, radiation: 13, hazards: ['High-pressure tides', 'Flash floods'], status: 'Scouted', route: 'Silver current' },
  { id: 'ember-12', name: 'Solara', type: 'Solar-rich', description: 'A solar-energy-rich world with intense sunlight and exceptional power potential.', features: ['Solar-energy-rich', 'High solar output', 'Solar bursts'], temperature: 41, gravity: 1.11, atmosphere: 'CO₂ / Ar', water: 12, minerals: 74, energy: 88, radiation: 52, hazards: ['Dust cyclones', 'Solar bursts'], status: 'Surveyed', route: 'Solar flare lane' },
  { id: 'lynx-18', name: 'Vortex-6', type: 'Storm world', description: 'A volatile world battered by extreme atmospheric storms.', features: ['Extreme atmospheric storms', 'Severe weather', 'Storm shelter needed'], temperature: 15, gravity: 1.12, atmosphere: 'N₂ / O₂ / CH₄', water: 76, minerals: 60, energy: 63, radiation: 16, hazards: ['Extreme atmospheric storms', 'Root-driven sinkholes'], status: 'Scouted', route: 'Verdant arc' },
  { id: 'orion-1', name: 'Orion-1', type: 'Terrestrial', description: 'Jemiah’s established homeworld and operational baseline.', features: ['Homeworld', 'Established colony', 'Balanced resources'], temperature: 21, gravity: 1, atmosphere: 'N₂ / O₂ / Ar', water: 77, minerals: 58, energy: 61, radiation: 12, hazards: ['Seasonal dust storms'], status: 'Homeworld', route: 'Founding ring' }
];

const species = [
  { id: 'human', name: 'Terran Baseline', requirements: { atmosphere: 85, water: 70 } },
  { id: 'nautil', name: 'Nautiloid', requirements: { atmosphere: 68, water: 92 } },
  { id: 'aether', name: 'Aether Bloom', requirements: { atmosphere: 90, water: 68 } }
];

const buildings = [
  { id: 'habitat', name: 'Residential Habitat', cost: { minerals: 25, water: 8, energy: 14 }, effect: { population: 14, health: 6 } },
  { id: 'medical', name: 'Medical Center', cost: { minerals: 18, energy: 10, water: 6 }, effect: { health: 12 } },
  { id: 'greenhouse', name: 'Greenhouse', cost: { minerals: 22, water: 7, energy: 11 }, effect: { food: 18 } },
  { id: 'water-plant', name: 'Water Purification', cost: { minerals: 20, energy: 7, water: 4 }, effect: { water: 18 } },
  { id: 'oxygen', name: 'Oxygen Generator', cost: { minerals: 16, energy: 12 }, effect: { health: 8 } },
  { id: 'power', name: 'Solar Power Station', cost: { minerals: 26, water: 6, energy: 9 }, effect: { energy: 24 } },
  { id: 'mine', name: 'Mining Facility', cost: { minerals: 28, energy: 12 }, effect: { minerals: 20 } },
  { id: 'lab', name: 'Research Lab', cost: { minerals: 20, energy: 18 }, effect: { sustainability: 8 } },
  { id: 'tower', name: 'Comm Tower', cost: { minerals: 14, energy: 8 }, effect: { trade: 10 } },
  { id: 'shelter', name: 'Defense Shelter', cost: { minerals: 30, energy: 15 }, effect: { health: 10, safety: 12 } }
];

const makeInitialState = () => ({
  civilizationName: 'Jemiah',
  speciesId: 'human',
  selectedPlanetId: 'orion-1',
  comparePlanetId: 'aurelia-9',
  discoveredPlanetIds: ['orion-1', 'aurelia-9', 'selene-7', 'thalassa-4', 'lynx-18', 'ember-12'],
  currentMission: 'Habitat survey and landing prep',
  turn: 1,
  recentAlerts: [
    'High orbit relay restored for the southern wing.',
    'Mineral haul queued for the Helios ridge.',
    'Water reserve above sustainability threshold.'
  ],
  resources: { water: 86, minerals: 72, food: 78, energy: 68, silicon: 42, rare: 23 },
  colonyStats: { population: 26, colonyHealth: 79, sustainability: 82, threat: 'Elevated', habitats: 3, miningStations: 2, activeHabitats: 2, populationCapacity: 44 },
  buildings: ['habitat', 'greenhouse', 'power'],
  tradeRoutes: [
    { from: 'Orion-1', to: 'Zephyria', cost: 12, days: 3, status: 'Available' },
    { from: 'Orion-1', to: 'Edenis', cost: 18, days: 4, status: 'Available' },
    { from: 'Zephyria', to: 'Vortex-6', cost: 14, days: 3, status: 'Queued' }
  ],
  eventLog: [
    { label: 'Turn 1', detail: 'Long-range scans identified a stable geothermal pocket on Eclipse Prime.' },
    { label: 'Turn 2', detail: 'Settlement nutrient loop is achieving 94% efficiency.' }
  ],
  systemMessage: 'All systems stable. Planetary adaptation model ready for deployment.'
});

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);
let state = makeInitialState();
let initializedFromDisk = false;

if (fs.existsSync(SAVE_FILE)) {
  state = { ...makeInitialState(), ...JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8')) };
  initializedFromDisk = true;
}

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporaryFile = `${SAVE_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(temporaryFile, SAVE_FILE);
  initializedFromDisk = true;
}

function migratePlanetNames(value) {
  const names = [
    ['Aurelia-9', 'Zephyria'],
    ['Selene-7', 'Eclipse Prime'],
    ['Vexor-3', 'Nexora'],
    ['Thalassa-4', 'Edenis'],
    ['Ember-12', 'Solara'],
    ['Lynx-18', 'Vortex-6']
  ];
  if (typeof value === 'string') {
    return names.reduce((text, [oldName, newName]) => text.replaceAll(oldName, newName), value);
  }
  if (Array.isArray(value)) return value.map(migratePlanetNames);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, migratePlanetNames(entry)]));
  }
  return value;
}

if (initializedFromDisk) {
  const saved = JSON.stringify(state);
  state = migratePlanetNames(state);
  if (JSON.stringify(state) !== saved) persist();
}

function getPlanet(id) {
  const planet = planets.find((item) => item.id === id);
  if (!planet) throw new HttpError(404, `Unknown planet: ${id}`);
  return planet;
}

function getSpecies(id) {
  const profile = species.find((item) => item.id === id);
  if (!profile) throw new HttpError(400, `Unknown species: ${id}`);
  return profile;
}

function getCompatibilityFactors(planet, profile) {
  return [
    { name: 'Atmosphere', value: clamp(100 - Math.abs((planet.atmosphere.includes('O₂') ? 84 : 46) - profile.requirements.atmosphere)) },
    { name: 'Temperature', value: clamp(100 - Math.abs(planet.temperature - 21) * 2.5) },
    { name: 'Gravity', value: clamp(100 - Math.abs(planet.gravity * 100 - 100) * 1.6) },
    { name: 'Water', value: clamp(Math.min(100, planet.water + 20 - Math.max(0, profile.requirements.water - 60))) },
    { name: 'Food', value: clamp(planet.water * 0.75 + planet.energy * 0.4) },
    { name: 'Energy', value: clamp(planet.energy + (planet.type === 'Desert' ? 18 : 0)) },
    { name: 'Radiation protection', value: clamp(100 - planet.radiation * 1.2 - planet.hazards.length * 6) }
  ];
}

function getRecommendation(score) {
  if (score >= 75) return 'Suitable';
  if (score >= 55) return 'Suitable with Infrastructure';
  return 'Unsuitable';
}

function getAdaptations(factors) {
  const values = Object.fromEntries(factors.map(({ name, value }) => [name, value]));
  const recommendations = [];
  if (values.Atmosphere < 70) recommendations.push('Oxygen generation and pressure-safe habitats');
  if (values.Water < 70) recommendations.push('Water recycling and purification systems');
  if (values.Temperature < 70) recommendations.push('Thermal regulation habitats');
  if (values.Gravity < 70) recommendations.push('Adaptive-gravity living spaces');
  if (values['Radiation protection'] < 70) recommendations.push('Radiation shielding and storm shelters');
  return recommendations.length ? recommendations : ['Standard habitat infrastructure'];
}

function calculateHabitability(planet, profile) {
  const factors = getCompatibilityFactors(planet, profile);
  const weights = [0.22, 0.18, 0.12, 0.16, 0.12, 0.1, 0.1];
  const score = Math.round(factors.reduce((total, factor, index) => total + factor.value * weights[index], 0));
  return { planetId: planet.id, speciesId: profile.id, score, recommendation: getRecommendation(score), factors, adaptations: getAdaptations(factors) };
}

function recordEvent(detail) {
  const item = { label: `Turn ${state.turn}`, detail };
  state.eventLog = [item, ...state.eventLog].slice(0, 5);
  state.recentAlerts = [detail, ...state.recentAlerts].slice(0, 5);
}

function advanceOneTurn() {
  const resources = { ...state.resources };
  const populationUse = Math.max(4, state.colonyStats.population / 2);
  resources.food = clamp(resources.food - populationUse, 0, 200);
  resources.water = clamp(resources.water - populationUse * 0.8, 0, 200);
  resources.energy = clamp(resources.energy - 6 + (state.buildings.includes('power') ? 10 : 0), 0, 200);
  resources.minerals = clamp(resources.minerals + (state.buildings.includes('mine') ? 8 : 2), 0, 200);
  state.colonyStats.colonyHealth = clamp(
    state.colonyStats.colonyHealth - (resources.food <= 15 ? 8 : 0) - (resources.water <= 20 ? 7 : 0) + (state.buildings.includes('medical') ? 6 : 0)
  );
  state.colonyStats.sustainability = clamp(
    state.colonyStats.sustainability + (resources.energy > 25 ? 3 : -3) + (state.buildings.includes('lab') ? 2 : 0)
  );
  state.colonyStats.threat = state.colonyStats.sustainability < 50 ? 'Critical' : state.colonyStats.sustainability < 70 ? 'Elevated' : 'Stable';
  state.colonyStats.population = Math.min(state.colonyStats.population + 1, state.colonyStats.populationCapacity);
  state.resources = resources;
  state.turn += 1;
  const event = ['Solar flare watch', 'Tidal nutrient bloom', 'Dust storm disruption', 'Rare mineral veins discovered'][Math.floor(Math.random() * 4)];
  recordEvent(event);
  state.systemMessage = `Turn advanced successfully. Colony stability is ${state.colonyStats.sustainability}/100. ${event}.`;
}

function extractResource(resource) {
  const settings = {
    water: { cost: 8, gain: 16 },
    minerals: { cost: 10, gain: 18 },
    silicon: { cost: 12, gain: 15 },
    rare: { cost: 16, gain: 10 }
  };
  const operation = settings[resource];
  if (!operation) throw new HttpError(400, 'Resource must be water, minerals, silicon, or rare.');
  if (state.resources.energy < operation.cost) throw new HttpError(409, `Extraction requires ${operation.cost} energy; ${state.resources.energy} available.`);
  state.resources.energy -= operation.cost;
  state.resources[resource] = clamp((state.resources[resource] || 0) + operation.gain, 0, 200);
  state.systemMessage = `Mining operation successful. ${resource.toUpperCase()} yield increased, with ${operation.cost} energy consumed.`;
}

function buildStructure(id) {
  const structure = buildings.find((item) => item.id === id);
  if (!structure) throw new HttpError(404, `Unknown structure: ${id}`);
  if (state.buildings.includes(id)) throw new HttpError(409, `${structure.name} is already operational.`);
  const shortage = Object.entries(structure.cost).find(([resource, cost]) => (state.resources[resource] || 0) < cost);
  if (shortage) throw new HttpError(409, `Insufficient ${shortage[0]} to construct ${structure.name}.`);
  for (const [resource, cost] of Object.entries(structure.cost)) state.resources[resource] -= cost;
  state.buildings = [...new Set([...state.buildings, id])];
  state.colonyStats.populationCapacity += structure.effect.population || 0;
  state.colonyStats.colonyHealth = clamp(state.colonyStats.colonyHealth + (structure.effect.health || 0));
  state.colonyStats.sustainability = clamp(state.colonyStats.sustainability + (structure.effect.sustainability || 0));
  if (id === 'habitat') {
    state.colonyStats.habitats += 1;
    state.colonyStats.activeHabitats += 1;
  }
  state.systemMessage = `${structure.name} was constructed successfully. Colony capacity and resilience improve.`;
}

function launchMission(planetId, type = 'explore') {
  const planet = getPlanet(planetId);
  if (type !== 'explore' && type !== 'mine') throw new HttpError(400, 'Mission type must be explore or mine.');
  const cost = type === 'explore' ? 10 : 12;
  if (state.resources.energy < cost) throw new HttpError(409, `Mission requires ${cost} energy; ${state.resources.energy} available.`);
  state.resources.energy -= cost;
  state.selectedPlanetId = planet.id;
  state.currentMission = type === 'explore'
    ? `Launch ${planet.name} survey and orbital mapping sweep.`
    : `Deploy mining corridor to ${planet.name}.`;
  if (type === 'explore') {
    const newlyDiscovered = !state.discoveredPlanetIds.includes(planet.id);
    state.discoveredPlanetIds = [...new Set([...state.discoveredPlanetIds, planet.id])];
    state.resources.minerals = clamp(state.resources.minerals + (newlyDiscovered ? 8 : 3), 0, 200);
  } else {
    state.resources.minerals = clamp(state.resources.minerals + Math.max(4, Math.round(planet.minerals / 10)), 0, 200);
  }
  state.recentAlerts = [state.currentMission, ...state.recentAlerts].slice(0, 5);
  state.systemMessage = `Mission launched for ${planet.name}. Energy cost: ${cost}.`;
}

function performDefenseAction(action) {
  const planet = getPlanet(state.selectedPlanetId);
  if (action === 'shelter') {
    if (!state.buildings.includes('shelter')) buildStructure('shelter');
    state.colonyStats.threat = 'Stable';
    state.systemMessage = `Defense shelter online on ${planet.name}. Residents are protected and sector threat is stable.`;
  } else if (action === 'evacuate') {
    if (!Number.isInteger(state.colonyStats.population) || state.colonyStats.population <= 1) {
      throw new HttpError(409, 'Evacuation requires at least two residents in the colony.');
    }
    const evacuated = Math.min(5, state.colonyStats.population - 1);
    state.colonyStats.population -= evacuated;
    state.colonyStats.threat = 'Elevated';
    state.systemMessage = `${evacuated} residents moved to orbital safe zones from ${planet.name}.`;
  } else if (action === 'scan') {
    const alert = `Defense scan: ${planet.hazards.join(', ')} detected near ${planet.name}.`;
    state.systemMessage = alert;
  } else {
    throw new HttpError(400, 'Defense action must be shelter, evacuate, or scan.');
  }
  state.recentAlerts = [state.systemMessage, ...state.recentAlerts].slice(0, 5);
  state.eventLog = [{ label: `Turn ${state.turn}`, detail: state.systemMessage }, ...state.eventLog].slice(0, 5);
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Request body is too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!body) return resolve({});
      try {
        const value = JSON.parse(body);
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object.');
        resolve(value);
      } catch {
        reject(new HttpError(400, 'Request body must be a valid JSON object.'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  response.end(JSON.stringify(value));
}

function sendError(response, error) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status === 500) console.error(error);
  sendJson(response, status, { error: status === 500 ? 'Internal server error.' : error.message });
}

async function handleApi(request, response, url) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    response.end();
    return;
  }

  const body = request.method === 'POST' ? await readJson(request) : {};
  const route = `${request.method} ${url.pathname}`;
  let result;

  if (route === 'GET /api/state' || route === 'GET /api/colony/status' || route === 'GET /api/save') {
    result = { state, initialized: initializedFromDisk };
  } else if (route === 'GET /api/planets') {
    result = { planets: planets.map((planet) => ({ ...planet, discovered: state.discoveredPlanetIds.includes(planet.id) })) };
  } else if (route.startsWith('GET /api/planets/')) {
    const planet = getPlanet(decodeURIComponent(url.pathname.slice('/api/planets/'.length)));
    result = { ...planet, discovered: state.discoveredPlanetIds.includes(planet.id) };
  } else if (route === 'POST /api/habitability/calculate') {
    const planet = getPlanet(body.planetId || state.selectedPlanetId);
    const profile = getSpecies(body.speciesId || state.speciesId);
    result = calculateHabitability(planet, profile);
  } else if (route === 'POST /api/mining/extract') {
    extractResource(body.resource);
    persist();
    result = { state };
  } else if (route === 'POST /api/colony/build') {
    buildStructure(body.structureId);
    persist();
    result = { state };
  } else if (route === 'POST /api/simulation/advance') {
    const count = body.turns === undefined ? 1 : Number(body.turns);
    if (!Number.isInteger(count) || count < 1 || count > 25) throw new HttpError(400, 'turns must be an integer from 1 to 25.');
    for (let i = 0; i < count; i += 1) advanceOneTurn();
    persist();
    result = { state };
  } else if (route === 'POST /api/defense/action') {
    performDefenseAction(body.action);
    persist();
    result = { state };
  } else if (route === 'POST /api/trade/dispatch') {
    const selectedRoute = state.tradeRoutes[0];
    if (!selectedRoute) throw new HttpError(409, 'No active trade channels available to dispatch cargo.');
    state.tradeRoutes = state.tradeRoutes.slice(1);
    state.resources.water = clamp(state.resources.water + 8, 0, 200);
    state.resources.minerals = clamp(state.resources.minerals + 10, 0, 200);
    state.resources.food = clamp(state.resources.food + 6, 0, 200);
    state.systemMessage = `Cargo delivered to ${selectedRoute.to}. Supply chain stable and route efficiency improved.`;
    persist();
    result = { state };
  } else if (route === 'POST /api/system/calibrate') {
    const planet = getPlanet(state.selectedPlanetId);
    state.systemMessage = `Telemetry calibrated for ${planet.name}. Planetary readings are current.`;
    persist();
    result = { state };
  } else if (route === 'POST /api/missions/launch') {
    launchMission(body.planetId || state.selectedPlanetId, body.type || 'explore');
    persist();
    result = { state };
  } else if (route === 'POST /api/save') {
    const next = body.state;
    if (!next || typeof next !== 'object' || !next.resources || !next.colonyStats) throw new HttpError(400, 'A complete game state is required.');
    state = migratePlanetNames({ ...makeInitialState(), ...next });
    persist();
    result = { state, saved: true };
  } else if (route === 'POST /api/selection') {
    if (body.planetId) getPlanet(body.planetId);
    if (body.comparePlanetId) getPlanet(body.comparePlanetId);
    if (body.speciesId) getSpecies(body.speciesId);
    state = {
      ...state,
      ...(body.planetId ? { selectedPlanetId: body.planetId } : {}),
      ...(body.comparePlanetId ? { comparePlanetId: body.comparePlanetId } : {}),
      ...(body.speciesId ? { speciesId: body.speciesId } : {})
    };
    persist();
    result = { state };
  } else {
    throw new HttpError(404, 'API endpoint not found.');
  }

  sendJson(response, 200, result);
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function serveStatic(request, response, url) {
  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`) && filePath !== ROOT) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
      return;
    }
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
    } else if (request.method === 'GET' || request.method === 'HEAD') {
      serveStatic(request, response, url);
    } else {
      sendJson(response, 405, { error: 'Method not allowed.' });
    }
  } catch (error) {
    if (!response.headersSent) sendError(response, error);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AFTERNET backend and app listening at http://localhost:${PORT}`);
});
