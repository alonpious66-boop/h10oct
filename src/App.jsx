import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'afternet-save-v1';

const planetCatalog = [
  { id: 'aurelia-9', name: 'Zephyria', type: 'High-wind', description: 'A high-wind planet with powerful crosswinds and exposed terrain.', features: ['High winds', 'Wind energy', 'Open terrain'], temperature: 18, gravity: 1.04, atmosphere: 'N₂ / O₂ / Ar', water: 82, minerals: 71, energy: 58, radiation: 17, hazards: ['High-wind systems', 'North polar ice quakes'], status: 'Scouted', compatibility: 88, route: 'Asterion corridor' },
  { id: 'selene-7', name: 'Eclipse Prime', type: 'Low-light', description: 'A low-light planet with limited daylight and long shadowed regions.', features: ['Low light', 'Cryogenic terrain', 'Subsurface water'], temperature: -11, gravity: 0.78, atmosphere: 'N₂ / He / CO₂', water: 68, minerals: 80, energy: 31, radiation: 22, hazards: ['Cryovolcanic vents', 'Low-light storms'], status: 'Active outpost', compatibility: 64, route: 'Luna lane' },
  { id: 'vexor-3', name: 'Nexora', type: 'Alien civilization', description: 'An advanced alien civilization world with valuable technology and restricted zones.', features: ['Advanced alien civilization', 'Ancient technology', 'First-contact site'], temperature: 34, gravity: 1.28, atmosphere: 'CO₂ / SO₂ / N₂', water: 19, minerals: 91, energy: 75, radiation: 54, hazards: ['Unmapped defense systems', 'Seismic surges'], status: 'Unmapped', compatibility: 42, route: 'Ash spine' },
  { id: 'thalassa-4', name: 'Edenis', type: 'Terraforming candidate', description: 'A water-rich world and promising candidate for long-term terraforming.', features: ['Terraforming candidate', 'High water', 'Stable atmosphere'], temperature: 23, gravity: 0.92, atmosphere: 'N₂ / O₂ / H₂O vapour', water: 90, minerals: 53, energy: 48, radiation: 13, hazards: ['High-pressure tides', 'Flash floods'], status: 'Scouted', compatibility: 79, route: 'Silver current' },
  { id: 'ember-12', name: 'Solara', type: 'Solar-rich', description: 'A solar-energy-rich world with intense sunlight and exceptional power potential.', features: ['Solar-energy-rich', 'High solar output', 'Solar bursts'], temperature: 41, gravity: 1.11, atmosphere: 'CO₂ / Ar', water: 12, minerals: 74, energy: 88, radiation: 52, hazards: ['Dust cyclones', 'Solar bursts'], status: 'Surveyed', compatibility: 47, route: 'Solar flare lane' },
  { id: 'lynx-18', name: 'Vortex-6', type: 'Storm world', description: 'A volatile world battered by extreme atmospheric storms.', features: ['Extreme atmospheric storms', 'Severe weather', 'Storm shelter needed'], temperature: 15, gravity: 1.12, atmosphere: 'N₂ / O₂ / CH₄', water: 76, minerals: 60, energy: 63, radiation: 16, hazards: ['Extreme atmospheric storms', 'Root-driven sinkholes'], status: 'Scouted', compatibility: 83, route: 'Verdant arc' },
  { id: 'orion-1', name: 'Orion-1', type: 'Terrestrial', description: 'Jemiah’s established homeworld and operational baseline.', features: ['Homeworld', 'Established colony', 'Balanced resources'], temperature: 21, gravity: 1.0, atmosphere: 'N₂ / O₂ / Ar', water: 77, minerals: 58, energy: 61, radiation: 12, hazards: ['Seasonal dust storms'], status: 'Homeworld', compatibility: 92, route: 'Founding ring' }
];

const planetFeatureFilters = [
  'High winds',
  'Solar-energy-rich',
  'Advanced alien civilization',
  'Extreme atmospheric storms',
  'Low light',
  'Terraforming candidate'
];

const starchartCoordinates = {
  'orion-1': [68, 142],
  'aurelia-9': [220, 70],
  'selene-7': [320, 202],
  'vexor-3': [486, 70],
  'thalassa-4': [536, 202],
  'ember-12': [412, 137],
  'lynx-18': [150, 214]
};

const commandSections = ['#sector-starchart', '#planet-survey', '#colony-grid', '#trade-matrix'];

const speciesCatalog = [
  {
    id: 'human',
    name: 'Terran Baseline',
    description: 'Adaptable and resilient; requires standard atmosphere and moderate gravity.',
    requirements: { atmosphere: 85, temperature: 65, gravity: 76, water: 70, food: 78, energy: 60, radiation: 72, shelter: 80 },
    prep: ['Pressure-safe habitats', 'Oxygen generation', 'Water reclamation loops']
  },
  {
    id: 'nautil',
    name: 'Nautiloid',
    description: 'Amphibious and subterranean; thrives in high water availability and shaded, cold terrain.',
    requirements: { atmosphere: 68, temperature: 52, gravity: 62, water: 92, food: 66, energy: 55, radiation: 80, shelter: 86 },
    prep: ['Subterrain reef habitats', 'Thermal insulation', 'High-efficiency filtration']
  },
  {
    id: 'aether',
    name: 'Aether Bloom',
    description: 'Photosynthetic lattice-form creatures favor high-light, low-radiation worlds with elevated oxygen.',
    requirements: { atmosphere: 90, temperature: 72, gravity: 70, water: 68, food: 90, energy: 82, radiation: 88, shelter: 72 },
    prep: ['Greenhouse canopies', 'UV-filtering domes', 'Oxygen-rich circulation']
  }
];

const buildingCatalog = [
  { id: 'habitat', name: 'Residential Habitat', cost: { minerals: 25, water: 8, energy: 14 }, effect: { population: 14, health: 6 }, status: 'Operational' },
  { id: 'medical', name: 'Medical Center', cost: { minerals: 18, energy: 10, water: 6 }, effect: { health: 12 }, status: 'Operational' },
  { id: 'greenhouse', name: 'Greenhouse', cost: { minerals: 22, water: 7, energy: 11 }, effect: { food: 18 }, status: 'Operational' },
  { id: 'water-plant', name: 'Water Purification', cost: { minerals: 20, energy: 7, water: 4 }, effect: { water: 18 }, status: 'Operational' },
  { id: 'oxygen', name: 'Oxygen Generator', cost: { minerals: 16, energy: 12 }, effect: { health: 8 }, status: 'Operational' },
  { id: 'power', name: 'Solar Power Station', cost: { minerals: 26, water: 6, energy: 9 }, effect: { energy: 24 }, status: 'Operational' },
  { id: 'mine', name: 'Mining Facility', cost: { minerals: 28, energy: 12 }, effect: { minerals: 20 }, status: 'Active' },
  { id: 'lab', name: 'Research Lab', cost: { minerals: 20, energy: 18 }, effect: { sustainability: 8 }, status: 'Active' },
  { id: 'tower', name: 'Comm Tower', cost: { minerals: 14, energy: 8 }, effect: { trade: 10 }, status: 'Online' },
  { id: 'shelter', name: 'Defense Shelter', cost: { minerals: 30, energy: 15, water: 8 }, effect: { health: 10, safety: 12 }, status: 'Secure' }
];

const defaultState = {
  civilizationName: 'Jemiah',
  speciesId: 'human',
  selectedPlanetId: 'orion-1',
  discoveredPlanetIds: ['orion-1', 'aurelia-9', 'selene-7', 'thalassa-4', 'lynx-18', 'ember-12'],
  currentMission: 'Habitat survey and landing prep',
  turn: 1,
  recentAlerts: [
    'High orbit relay restored for the southern wing.',
    'Mineral haul queued for the Helios ridge.',
    'Water reserve above sustainability threshold.'
  ],
  resources: { water: 86, minerals: 72, food: 78, energy: 68, silicon: 42, rare: 23, population: 26 },
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
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

function getPlanetById(planets, id) {
  return planets.find((planet) => planet.id === id) || planets[0];
}

function getSpeciesById(species, id) {
  return species.find((entry) => entry.id === id) || species[0];
}

function calculateCompatibility(planet, species) {
  const atmosphereScore = clamp(100 - Math.abs((planet.atmosphere.includes('O₂') ? 84 : 46) - species.requirements.atmosphere));
  const tempScore = clamp(100 - Math.abs(planet.temperature - 21) * 2.5);
  const gravityScore = clamp(100 - Math.abs((planet.gravity * 100) - 100) * 1.6);
  const waterScore = clamp(Math.min(100, planet.water + 20 - Math.max(0, species.requirements.water - 60)));
  const foodScore = clamp(planet.water * 0.75 + planet.energy * 0.4);
  const energyScore = clamp(planet.energy + (planet.type === 'Desert' ? 18 : 0));
  const safetyScore = clamp(100 - planet.radiation * 1.2 - planet.hazards.length * 6);

  return Math.round(
    atmosphereScore * 0.22 +
      tempScore * 0.18 +
      gravityScore * 0.12 +
      waterScore * 0.16 +
      foodScore * 0.12 +
      energyScore * 0.1 +
      safetyScore * 0.1
  );
}

function buildCompatibilityData(planet, species) {
  return [
    { name: 'Atmosphere', value: clamp(100 - Math.abs((planet.atmosphere.includes('O₂') ? 84 : 46) - species.requirements.atmosphere)) },
    { name: 'Temperature', value: clamp(100 - Math.abs(planet.temperature - 21) * 2.5) },
    { name: 'Gravity', value: clamp(100 - Math.abs((planet.gravity * 100) - 100) * 1.6) },
    { name: 'Water', value: clamp(Math.min(100, planet.water + 20 - Math.max(0, species.requirements.water - 60))) },
    { name: 'Food', value: clamp(planet.water * 0.75 + planet.energy * 0.4) },
    { name: 'Energy', value: clamp(planet.energy + (planet.type === 'Desert' ? 18 : 0)) },
    { name: 'Safety', value: clamp(100 - planet.radiation * 1.2 - planet.hazards.length * 6) }
  ];
}

function getRecommendation(score) {
  if (score >= 75) return 'Suitable';
  if (score >= 55) return 'Suitable with Infrastructure';
  return 'Unsuitable';
}

function getStatusClass(status) {
  if (status === 'Suitable') return 'status-good';
  if (status === 'Suitable with Infrastructure') return 'status-warn';
  return 'status-danger';
}

async function requestBackend(path, payload) {
  const apiBase = window.location.port === '4173' ? 'http://localhost:3001' : '';
  const response = await fetch(`${apiBase}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: payload ? { 'Content-Type': 'application/json' } : {},
    body: payload ? JSON.stringify(payload) : undefined
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

export default function App() {
  const [planetSearch, setPlanetSearch] = useState('');
  const [planetFeature, setPlanetFeature] = useState('');
  const [activeSection, setActiveSection] = useState(() => commandSections.includes(window.location.hash) ? window.location.hash : '#sector-starchart');
  const [backendReady, setBackendReady] = useState(false);
  const [backendBusy, setBackendBusy] = useState(false);
  const actionInFlight = useRef(false);
  const [serverHabitability, setServerHabitability] = useState(null);
  const [serverCompareHabitability, setServerCompareHabitability] = useState(null);
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const restored = JSON.parse(saved);
        return {
          ...restored,
          civilizationName: restored.civilizationName === 'Astra Nova' ? 'Jemiah' : restored.civilizationName,
          comparePlanetId: restored.comparePlanetId || 'aurelia-9'
        };
      } catch (error) {
        console.warn('Failed to parse saved state', error);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const syncActiveSection = () => setActiveSection(commandSections.includes(window.location.hash) ? window.location.hash : '#sector-starchart');
    window.addEventListener('hashchange', syncActiveSection);
    return () => window.removeEventListener('hashchange', syncActiveSection);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initializeBackend = async () => {
      try {
        const result = await requestBackend('/api/state');
        let loadedState = result.state;
        if (!result.initialized) {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const migrated = await requestBackend('/api/save', { state: JSON.parse(saved) });
            loadedState = migrated.state;
          }
        }
        if (!cancelled) {
          setState(loadedState);
          setBackendReady(true);
        }
      } catch (error) {
        if (!cancelled) setState((prev) => ({ ...prev, systemMessage: `Backend unavailable: ${error.message}` }));
      }
    };
    initializeBackend();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!backendReady) return undefined;
    let cancelled = false;
    const loadHabitability = async () => {
      try {
        const [current, comparison] = await Promise.all([
          requestBackend('/api/habitability/calculate', { planetId: state.selectedPlanetId, speciesId: state.speciesId }),
          requestBackend('/api/habitability/calculate', { planetId: state.comparePlanetId || 'aurelia-9', speciesId: state.speciesId })
        ]);
        if (!cancelled) {
          setServerHabitability(current);
          setServerCompareHabitability(comparison);
        }
      } catch (error) {
        if (!cancelled) setState((prev) => ({ ...prev, systemMessage: `Habitability calculation failed: ${error.message}` }));
      }
    };
    loadHabitability();
    return () => { cancelled = true; };
  }, [backendReady, state.selectedPlanetId, state.comparePlanetId, state.speciesId]);

  const performBackendAction = async (path, payload) => {
    if (actionInFlight.current) return;
    if (!backendReady) {
      setState((prev) => ({ ...prev, systemMessage: 'Backend is connecting. Please try again in a moment.' }));
      return;
    }
    actionInFlight.current = true;
    setBackendBusy(true);
    try {
      const result = await requestBackend(path, payload);
      setState(result.state);
    } catch (error) {
      setState((prev) => ({ ...prev, systemMessage: `Backend action failed: ${error.message}` }));
    } finally {
      actionInFlight.current = false;
      setBackendBusy(false);
    }
  };

  const selectedPlanet = useMemo(() => getPlanetById(planetCatalog, state.selectedPlanetId), [state.selectedPlanetId]);
  const comparePlanet = useMemo(() => getPlanetById(planetCatalog, state.comparePlanetId || 'aurelia-9'), [state.comparePlanetId]);
  const selectedSpecies = useMemo(() => getSpeciesById(speciesCatalog, state.speciesId), [state.speciesId]);
  const localCompatibilityScore = useMemo(() => calculateCompatibility(selectedPlanet, selectedSpecies), [selectedPlanet, selectedSpecies]);
  const localCompatibilityData = useMemo(() => buildCompatibilityData(selectedPlanet, selectedSpecies), [selectedPlanet, selectedSpecies]);
  const compatibilityScore = serverHabitability?.planetId === selectedPlanet.id && serverHabitability?.speciesId === selectedSpecies.id
    ? serverHabitability.score
    : localCompatibilityScore;
  const compatibilityData = serverHabitability?.planetId === selectedPlanet.id && serverHabitability?.speciesId === selectedSpecies.id
    ? serverHabitability.factors
    : localCompatibilityData;
  const recommendation = getRecommendation(compatibilityScore);
  const filteredPlanets = planetCatalog.filter((planet) => {
    const searchable = `${planet.name} ${planet.type} ${planet.status} ${planet.description} ${planet.features.join(' ')} ${planet.hazards.join(' ')} ${planet.atmosphere} ${planet.route}`.toLowerCase();
    return searchable.includes(planetSearch.trim().toLowerCase()) &&
      (!planetFeature || planet.features.some((feature) => feature.toLowerCase().includes(planetFeature.toLowerCase())));
  });
  const compareCompatibility = serverCompareHabitability?.planetId === comparePlanet.id && serverCompareHabitability?.speciesId === selectedSpecies.id
    ? serverCompareHabitability.score
    : calculateCompatibility(comparePlanet, selectedSpecies);
  const compareFactors = serverCompareHabitability?.planetId === comparePlanet.id && serverCompareHabitability?.speciesId === selectedSpecies.id
    ? serverCompareHabitability.factors
    : buildCompatibilityData(comparePlanet, selectedSpecies);

  const resourceChart = [
    { name: 'Water', value: state.resources.water },
    { name: 'Minerals', value: state.resources.minerals },
    { name: 'Food', value: state.resources.food },
    { name: 'Energy', value: state.resources.energy },
    { name: 'Silicon', value: state.resources.silicon },
    { name: 'Rare', value: state.resources.rare }
  ];

  const tradeData = [
    { name: 'Water', value: state.resources.water },
    { name: 'Minerals', value: state.resources.minerals },
    { name: 'Food', value: state.resources.food },
    { name: 'Energy', value: state.resources.energy }
  ];

  const startMission = (type) => performBackendAction('/api/missions/launch', { planetId: state.selectedPlanetId, type });
  const mineResource = (resourceKey) => performBackendAction('/api/mining/extract', { resource: resourceKey });
  const buildStructure = (structureId) => performBackendAction('/api/colony/build', { structureId });
  const advanceTurn = (turns = 1) => performBackendAction('/api/simulation/advance', { turns });
  const transferTrade = () => performBackendAction('/api/trade/dispatch', {});
  const updateSelection = (selection) => performBackendAction('/api/selection', selection);

  const dutyIcon = (label) => {
    const icons = { Explore: '🛰️', Mining: '⛏️', Habitats: '🏙️', Trade: '📦', Defense: '🛡️' };
    return icons[label] || '✦';
  };

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <header className="topbar glass-panel">
          <div className="brand-wrap">
            <div className="brand-mark">◆</div>
            <div>
              <p className="eyebrow">{state.civilizationName} // Galactic</p>
              <h1>Command</h1>
            </div>
          </div>
          <div className="status-strip">
            <div className="telemetry-cell"><span>Cycle</span><strong>{state.turn}</strong></div>
            <div className="telemetry-cell"><span>Tier III</span><strong>Interstellar</strong></div>
            <div className="telemetry-cell"><span>Energy</span><strong>{state.resources.energy} <small>GW</small></strong></div>
            <div className="telemetry-cell"><span>Population</span><strong>{state.colonyStats.population}</strong></div>
            <div className="telemetry-cell threat-readout"><span>Threat</span><strong>{state.colonyStats.threat}</strong></div>
          </div>
        </header>

        <nav className="command-nav">
          <a className={activeSection === '#sector-starchart' ? 'nav-active' : ''} href="#sector-starchart">Sector starchart</a>
          <a className={activeSection === '#planet-survey' ? 'nav-active' : ''} href="#planet-survey">Planetary survey</a>
          <a className={activeSection === '#colony-grid' ? 'nav-active' : ''} href="#colony-grid">Colony grid</a>
          <a className={activeSection === '#trade-matrix' ? 'nav-active' : ''} href="#trade-matrix">Trade &amp; defense matrix</a>
        </nav>

        <div className="defense-banner glass-panel">
          <div>
            <strong><span className="online-dot" /> Defense / logistics matrix synced</strong>
            <small>Active freight corridors: {state.tradeRoutes.length} secure / {state.tradeRoutes.filter((route) => route.status === 'Queued').length} queued</small>
          </div>
          <div className="banner-actions">
            <button className="secondary-btn" onClick={() => performBackendAction('/api/system/calibrate', {})}>Calibrate telemetry</button>
            <button className="danger-btn" onClick={() => advanceTurn(5)}>Emergency protocol · advance 5</button>
          </div>
        </div>

        <div className="main-grid">
          <aside className="sidebar">
            <div className="glass-panel panel-block">
              <div className="panel-header">
                <h2>System</h2>
                <span className="online-dot" />
              </div>
              <ul className="system-list">
                {[
                  { label: 'Explore', value: selectedPlanet.name },
                  { label: 'Mining', value: `${state.colonyStats.miningStations} stations` },
                  { label: 'Habitats', value: `${state.colonyStats.activeHabitats} active` },
                  { label: 'Trade', value: `${state.tradeRoutes.length} routes` },
                  { label: 'Defense', value: 'Orbit shield online' }
                ].map((item) => (
                  <li key={item.label}>
                    <span>{dutyIcon(item.label)} {item.label}</span>
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel panel-block">
              <h3>Recent alerts</h3>
              <div className="alert-list">
                {state.recentAlerts.map((alert, idx) => (
                  <div key={idx} className="alert-card">{alert}</div>
                ))}
              </div>
            </div>
          </aside>

          <main className="content">
            <div className="stats-grid">
              {[
                { label: 'Water', value: state.resources.water, accent: 'cyan' },
                { label: 'Minerals', value: state.resources.minerals, accent: 'blue' },
                { label: 'Food', value: state.resources.food, accent: 'emerald' },
                { label: 'Energy', value: state.resources.energy, accent: 'violet' }
              ].map((card) => (
                <div key={card.label} className="glass-panel stat-card">
                  <div className="stat-head">
                    <span>{card.label}</span>
                    <span className={`dot dot-${card.accent}`} />
                  </div>
                  <div className="stat-value">{card.value}</div>
                  <div className="progress-bar">
                    <div className={`fill fill-${card.accent}`} style={{ width: `${Math.min(100, card.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-grid">
              <div className="glass-panel panel-large survey-panel" id="planet-survey">
                <div className="panel-topline">
                  <div>
                    <p className="eyebrow">Planetary survey / selected world</p>
                    <h2>{selectedPlanet.name}</h2>
                  </div>
                  <div className={`status-pill ${getStatusClass(recommendation)}`}>{recommendation}</div>
                </div>

                <div className="planet-layout">
                  <div className="planet-visual starchart-visual" id="sector-starchart">
                    <div className="starchart-heading"><span>SECTOR 07 / HYPERLANE CHART</span><span>{planetCatalog.length} SYSTEMS · {state.tradeRoutes.length} ACTIVE LINKS</span></div>
                    <svg className="route-map sector-map" viewBox="0 0 620 270" role="group" aria-label="Interactive sector starchart. Select a planet to open its survey.">
                      <defs>
                        <radialGradient id="starchartGlow"><stop stopColor="#16d9e8" stopOpacity=".12" /><stop offset="1" stopColor="#07101c" stopOpacity="0" /></radialGradient>
                      </defs>
                      <circle cx="300" cy="135" r="128" fill="url(#starchartGlow)" />
                      {state.tradeRoutes.map((route, index) => {
                        const from = planetCatalog.find((planet) => planet.name === route.from);
                        const to = planetCatalog.find((planet) => planet.name === route.to);
                        if (!from || !to) return null;
                        const [x1, y1] = starchartCoordinates[from.id];
                        const [x2, y2] = starchartCoordinates[to.id];
                        return <line key={`${route.from}-${route.to}-${index}`} className={`star-route ${route.status === 'Queued' ? 'queued' : ''}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
                      })}
                      {planetCatalog.map((planet) => {
                        const [x, y] = starchartCoordinates[planet.id];
                        const selected = state.selectedPlanetId === planet.id;
                        const label = planet.name === 'Eclipse Prime' ? 'ECLIPSE' : planet.name.toUpperCase();
                        return (
                          <g
                            key={planet.id}
                            className={`star-node ${selected ? 'selected' : ''}`}
                            transform={`translate(${x} ${y})`}
                            role="button"
                            tabIndex={0}
                            aria-label={`Select ${planet.name}, ${planet.type}`}
                            onClick={() => updateSelection({ planetId: planet.id })}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                updateSelection({ planetId: planet.id });
                              }
                            }}
                          >
                            <circle className="star-node-halo" r={selected ? 17 : 12} />
                            <circle className={planet.id === 'orion-1' ? 'route-node route-home' : 'route-node'} r={selected ? 6 : 4.5} />
                            <text y="22">{label}</text>
                            <title>{planet.name} · {planet.type}</title>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="starchart-legend"><span><i className="legend-dot home" />Homeworld</span><span><i className="legend-dot" />Survey target</span><span><i className="legend-line" />Trade corridor</span><span><i className="legend-line queued" />Queued route</span></div>
                  </div>

                  <div className="planet-meta">
                    <p className="survey-description">{selectedPlanet.description}</p>
                    <div className="survey-facts"><span>{selectedPlanet.type}</span><span>{selectedPlanet.status}</span><span>{selectedPlanet.hazards.length} hazard signatures</span></div>
                    <div className="mini-grid">
                      <div className="mini-box"><span>Temperature</span><strong>{selectedPlanet.temperature}°C</strong></div>
                      <div className="mini-box"><span>Gravity</span><strong>{selectedPlanet.gravity}g</strong></div>
                      <div className="mini-box"><span>Water</span><strong>{selectedPlanet.water}%</strong></div>
                      <div className="mini-box"><span>Energy</span><strong>{selectedPlanet.energy}%</strong></div>
                      <div className="mini-box"><span>Minerals</span><strong>{selectedPlanet.minerals}%</strong></div>
                      <div className="mini-box"><span>Radiation</span><strong>{selectedPlanet.radiation}%</strong></div>
                    </div>
                    <div className="compat-box">
                      <div className="compat-header">
                        <span>Compatibility score</span>
                        <strong>{compatibilityScore}/100</strong>
                      </div>
                      <div className="progress-bar">
                        <div className="fill fill-cyan" style={{ width: `${compatibilityScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel panel-stack radar-panel">
                <div className="panel-header tight">
                  <p className="eyebrow">Tactical defense / sentry grid</p>
                  <h3>Orbital threat detection</h3>
                </div>
                <div className="radar-display" role="img" aria-label="Orbital radar with a rotating scan sweep and moving threat contacts">
                  <span className="radar-sweep" />
                  <span className="radar-ping ping-one" />
                  <span className="radar-ping ping-two" />
                  <span className="radar-ping ping-three" />
                  <span className="radar-center">◆</span>
                </div>
                <div className="mission-stack">
                  <div className="mission-card alert-card-critical">{selectedPlanet.hazards[0]} · {state.colonyStats.threat} threat</div>
                  <div className="mission-card" aria-live="polite">{backendBusy ? 'Defense command in progress…' : state.currentMission}</div>
                  <button className="secondary-btn" disabled={backendBusy || !backendReady} onClick={() => performBackendAction('/api/defense/action', { action: 'scan' })}>Scan hazards</button>
                  <button className="secondary-btn" disabled={backendBusy || !backendReady || state.buildings.includes('shelter')} onClick={() => performBackendAction('/api/defense/action', { action: 'shelter' })}>{state.buildings.includes('shelter') ? 'Defense shelter online' : 'Deploy defense shelter · 30 minerals / 15 energy'}</button>
                  <button className="danger-btn" disabled={backendBusy || !backendReady || state.colonyStats.population <= 1} onClick={() => performBackendAction('/api/defense/action', { action: 'evacuate' })}>Evacuate up to 5 residents</button>
                  <button className="primary-btn" disabled={backendBusy || !backendReady} onClick={() => startMission('explore')}>Launch exploration · 10 energy</button>
                  <button className="secondary-btn" disabled={backendBusy || !backendReady} onClick={() => startMission('mine')}>Deploy mining sweep · 12 energy</button>
                </div>
              </div>
            </div>

            <div className="two-col planet-systems" id="planet-explorer">
              <div className="glass-panel panel-block" id="planet-explorer">
                <div className="panel-header tight">
                  <p className="eyebrow">Planet explorer</p>
                  <h3>Discovered systems</h3>
                </div>
                <label className="planet-search">
                  <span>Search planets</span>
                  <input
                    type="search"
                    value={planetSearch}
                    onChange={(event) => setPlanetSearch(event.target.value)}
                    placeholder="Search winds, light, storms, energy, water..."
                  />
                </label>
                <label className="planet-search planet-feature-filter">
                  <span>Filter by feature</span>
                  <select value={planetFeature} onChange={(event) => setPlanetFeature(event.target.value)}>
                    <option value="">All planetary features</option>
                    {planetFeatureFilters.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
                  </select>
                </label>
                <div className="planet-grid">
                  {filteredPlanets.map((planet) => (
                    <button
                      key={planet.id}
                      onClick={() => updateSelection({ planetId: planet.id })}
                      className={`planet-card ${state.selectedPlanetId === planet.id ? 'active' : ''}`}
                    >
                      <div className="planet-card-top">
                        <span>{planet.name}</span>
                        <small>{planet.type}</small>
                      </div>
                      <p className="planet-card-description">{planet.description}</p>
                      <div className="planet-feature-tags">{planet.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
                      <small>{planet.status}</small>
                      <div className="progress-bar tiny">
                        <div className="fill fill-cyan" style={{ width: `${calculateCompatibility(planet, selectedSpecies)}%` }} />
                      </div>
                    </button>
                  ))}
                  {filteredPlanets.length === 0 && <p className="empty-state">No planets match that search.</p>}
                </div>
              </div>

              <div className="glass-panel panel-block comparison-panel">
                <p className="eyebrow">World analysis</p>
                <h3 className="section-title">Planet adaptability comparison</h3>
                <p className="comparison-caption">Choose any world and compare {selectedSpecies.name} adaptability, atmosphere, temperature, gravity, water, energy, minerals, and radiation.</p>
                <div className="compare-select-row">
                  <div className="compare-planet-name">
                    <span>Current planet</span>
                    <strong>{selectedPlanet.name}</strong>
                  </div>
                  <label className="compare-select">
                    <span>Compare with</span>
                    <select
                      value={state.comparePlanetId || 'aurelia-9'}
                      onChange={(event) => updateSelection({ comparePlanetId: event.target.value })}
                    >
                      {planetCatalog.map((planet) => (
                        <option key={planet.id} value={planet.id}>{planet.name} — {planet.type}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="comparison-score-grid">
                  {[{ planet: selectedPlanet, score: compatibilityScore }, { planet: comparePlanet, score: compareCompatibility }].map(({ planet, score }) => (
                    <div className="comparison-score" key={planet.id}>
                      <div className="comparison-score-head"><strong>{planet.name}</strong><span>{getRecommendation(score)}</span></div>
                      <div className="progress-bar"><div className="fill fill-cyan" style={{ width: `${score}%` }} /></div>
                      <strong className="comparison-number">{score}<small>/100 adaptability</small></strong>
                    </div>
                  ))}
                </div>
                <div className="comparison-factors">
                  {compatibilityData.map((factor, index) => (
                    <div className="comparison-factor" key={factor.name}>
                      <span>{factor.name}</span>
                      <strong>{Math.round(factor.value)}</strong>
                      <div className="progress-bar tiny"><div className="fill fill-blue" style={{ width: `${factor.value}%` }} /></div>
                      <strong>{Math.round(compareFactors[index].value)}</strong>
                    </div>
                  ))}
                </div>
                <div className="comparison-resources">
                  <span>Resources</span>
                  <span>{selectedPlanet.water}% water · {selectedPlanet.minerals}% minerals · {selectedPlanet.energy}% energy</span>
                  <span>{comparePlanet.water}% water · {comparePlanet.minerals}% minerals · {comparePlanet.energy}% energy</span>
                </div>
              </div>

              <div className="glass-panel panel-block">
                <p className="eyebrow">Habitation assessment</p>
                <div className="assessment-stack">
                  <div className="assessment-box">
                    <div className="select-row">
                      <span>Civilization profile</span>
                      <select value={state.speciesId} onChange={(e) => updateSelection({ speciesId: e.target.value })}>
                        {speciesCatalog.map((species) => (
                          <option key={species.id} value={species.id}>{species.name}</option>
                        ))}
                      </select>
                    </div>
                    <p>{selectedSpecies.description}</p>
                  </div>

                  <div className="assessment-box">
                    <div className="compat-header">
                      <span>Compatibility factors</span>
                      <strong>{compatibilityScore}/100</strong>
                    </div>
                    <div className="factor-list">
                      {compatibilityData.map((factor) => (
                        <div key={factor.name} className="factor-item">
                          <div className="factor-row">
                            <span>{factor.name}</span>
                            <span>{Math.round(factor.value)}</span>
                          </div>
                          <div className="progress-bar tiny">
                            <div className="fill fill-blue" style={{ width: `${factor.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {serverHabitability?.planetId === selectedPlanet.id && serverHabitability?.speciesId === selectedSpecies.id && (
                    <div className="assessment-box adaptation-guidance">
                      <strong>Backend adaptation plan</strong>
                      <ul>{serverHabitability.adaptations.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="two-col compact resource-logistics">
              <div className="glass-panel panel-block">
                <div className="panel-header tight">
                  <p className="eyebrow">Resource mining</p>
                  <h3>Extraction matrix</h3>
                </div>
                <div className="turn-controls">
                  <button className="advance-btn" onClick={() => advanceTurn()}>Advance turn</button>
                  <button className="fast-forward-btn" onClick={() => advanceTurn(5)}>Advance 5 turns</button>
                </div>
                <div className="resource-grid">
                  {[
                    { key: 'water', label: 'Water Ice', gain: '+16', cost: 8 },
                    { key: 'minerals', label: 'Minerals', gain: '+18', cost: 10 },
                    { key: 'silicon', label: 'Silicon', gain: '+15', cost: 12 },
                    { key: 'rare', label: 'Rare Ore', gain: '+10', cost: 16 }
                  ].map((item) => (
                    <button key={item.key} className="resource-card" onClick={() => mineResource(item.key)}>
                      <div className="resource-head">
                        <span>{item.label}</span>
                        <small>{item.gain}</small>
                      </div>
                      <small>Energy cost: {item.cost}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel panel-block cargo-panel trade-defense-panel" id="trade-matrix">
                <div className="panel-header tight">
                  <div><p className="eyebrow">Operations / sector coordination</p><h3>Trade &amp; defense matrix</h3></div>
                  <span className="matrix-live"><i className="online-dot" /> LIVE</span>
                </div>
                <div className="matrix-readouts">
                  <div><span>TRADE LANES</span><strong>{state.tradeRoutes.length}</strong></div>
                  <div><span>QUEUED</span><strong>{state.tradeRoutes.filter((route) => route.status === 'Queued').length}</strong></div>
                  <div><span>SECTOR THREAT</span><strong className="threat-value">{state.colonyStats.threat}</strong></div>
                  <div><span>DEFENSE GRID</span><strong>{state.buildings.includes('shelter') ? 'SHIELDED' : 'STANDBY'}</strong></div>
                </div>
                <div className="trade-defense-layout">
                  <div className="route-list">
                    <div className="cargo-table-head"><span>TRADE CORRIDOR</span><span>CARGO</span><span>ETA</span><span>SECURITY</span></div>
                    {state.tradeRoutes.map((route, idx) => (
                      <div key={idx} className="cargo-row">
                        <span>{route.from} → {route.to}</span>
                        <span>{route.cost} units · {route.status}</span>
                        <span>{route.days} days</span>
                        <span className={route.status === 'Queued' ? 'cargo-status-warn' : 'cargo-status-safe'}>{route.status === 'Queued' ? 'MONITOR' : 'SECURE'}</span>
                      </div>
                    ))}
                    <button className="primary-btn alt" onClick={transferTrade}>Dispatch cargo</button>
                  </div>
                  <div className="defense-matrix-card">
                    <div className="defense-matrix-heading"><span>DEFENSE SECTOR</span><strong>{selectedPlanet.name}</strong></div>
                    <div className="defense-threat-line"><span className="threat-indicator" />{selectedPlanet.hazards[0]}</div>
                    <div className="defense-matrix-stats">
                      <span>Threat level<strong>{state.colonyStats.threat}</strong></span>
                      <span>Population<strong>{state.colonyStats.population} protected</strong></span>
                      <span>Shield status<strong>{state.buildings.includes('shelter') ? 'SHELTER ACTIVE' : 'NO SHELTER'}</strong></span>
                    </div>
                    <div className="defense-matrix-actions">
                      <button className="secondary-btn" disabled={backendBusy || !backendReady} onClick={() => performBackendAction('/api/defense/action', { action: 'scan' })}>Scan sector</button>
                      {!state.buildings.includes('shelter') && <button className="secondary-btn" disabled={backendBusy || !backendReady} onClick={() => performBackendAction('/api/defense/action', { action: 'shelter' })}>Deploy shelter</button>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="two-col compact colony-grid-row">
              <div className="glass-panel panel-block colony-panel" id="colony-grid">
                <div className="panel-header tight">
                  <div><p className="eyebrow">Colony sector / Jemiah Prime</p><h3>Colony grid</h3></div>
                  <span className="colony-grid-count">{state.buildings.length} / {buildingCatalog.length} sites online</span>
                </div>
                <div className="colony-site-grid">
                  {buildingCatalog.map((structure, index) => {
                    const built = state.buildings.includes(structure.id);
                    return (
                      <div className={`colony-site ${built ? 'built' : 'vacant'}`} key={structure.id}>
                        <span className="site-coordinate">{String.fromCharCode(65 + Math.floor(index / 5))}{(index % 5) + 1}</span>
                        <span className="site-symbol">{built ? '◆' : '◇'}</span>
                        <strong>{structure.name}</strong>
                        <small>{built ? 'ONLINE' : 'AVAILABLE PAD'}</small>
                        {!built && <button onClick={() => buildStructure(structure.id)}>Construct</button>}
                      </div>
                    );
                  })}
                </div>
                <p className="colony-grid-caption">Operational sites are highlighted. Select an available pad to construct the facility.</p>
                <details className="construction-details">
                  <summary>View construction costs</summary>
                  <div className="construction-grid">
                    {buildingCatalog.map((structure) => (
                    <div key={structure.id} className="structure-card">
                      <div className="structure-head">
                        <span>{structure.name}</span>
                        <button onClick={() => buildStructure(structure.id)}>Build</button>
                      </div>
                      <small>Cost: {Object.entries(structure.cost).map(([key, value]) => `${key} ${value}`).join(' · ')}</small>
                    </div>
                  ))}
                  </div>
                </details>
              </div>

              <div className="glass-panel panel-block">
                <p className="eyebrow">Colony health</p>
                <div className="health-stack">
                  <div className="bar-group">
                    <div className="bar-label"><span>Population</span><strong>{state.colonyStats.population}/{state.colonyStats.populationCapacity}</strong></div>
                    <div className="progress-bar"><div className="fill fill-emerald" style={{ width: `${(state.colonyStats.population / state.colonyStats.populationCapacity) * 100}%` }} /></div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label"><span>Health</span><strong>{state.colonyStats.colonyHealth}%</strong></div>
                    <div className="progress-bar"><div className="fill fill-amber" style={{ width: `${state.colonyStats.colonyHealth}%` }} /></div>
                  </div>
                  <div className="bar-group">
                    <div className="bar-label"><span>Sustainability</span><strong>{state.colonyStats.sustainability}%</strong></div>
                    <div className="progress-bar"><div className="fill fill-violet" style={{ width: `${state.colonyStats.sustainability}%` }} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-grid">
              <div className="glass-panel panel-block chart-panel">
                <p className="eyebrow">Resource balance</p>
                <svg viewBox="0 0 360 200" className="chart-svg">
                  {resourceChart.map((item, idx) => {
                    const max = Math.max(...resourceChart.map((r) => r.value), 1);
                    const barHeight = (item.value / max) * 140;
                    const x = 30 + idx * 52;
                    const y = 170 - barHeight;
                    return (
                      <g key={item.name}>
                        <rect x={x} y={y} width={40} height={barHeight} rx="8" fill="#67e8f9" opacity="0.9" />
                        <text x={x + 20} y="190" textAnchor="middle" fill="#cbd5e1" fontSize="10">{item.name.slice(0, 4)}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="glass-panel panel-block chart-panel">
                <p className="eyebrow">Colony pulse</p>
                <svg viewBox="0 0 360 200" className="chart-svg">
                  <defs>
                    <linearGradient id="pulseGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const max = Math.max(...tradeData.map((d) => d.value), 1);
                    const points = tradeData.map((d, i) => {
                      const x = 30 + (i * 260) / (tradeData.length - 1 || 1);
                      const y = 170 - (d.value / max) * 120;
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline points={points} fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        <polygon points={`30,170 ${points} 330,170`} fill="url(#pulseGradient)" opacity="0.8" />
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>

            <div className="bottom-grid">
              <div className="glass-panel panel-block">
                <p className="eyebrow">System message</p>
                <div className="system-banner">{state.systemMessage}</div>
              </div>

              <div className="glass-panel panel-block">
                <p className="eyebrow">Event log</p>
                <div className="event-list">
                  {state.eventLog.map((event, idx) => (
                    <div key={idx} className="event-item">
                      <span>{event.label}</span>
                      <p>{event.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
        <footer className="command-footer">
          <span>Galactic civilization matrix // system core v3.4</span>
          <span><i className="online-dot" /> Telemetry link synchronized</span>
          <span>Encryption quantum polarized</span>
        </footer>
      </div>
    </div>
  );
}
