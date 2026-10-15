import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'afternet-save-v1';

const planetCatalog = [
  { id: 'aurelia-9', name: 'Aurelia-9', type: 'Oceanic', temperature: 18, gravity: 1.04, atmosphere: 'N₂ / O₂ / Ar', water: 82, minerals: 71, energy: 58, radiation: 17, hazards: ['Acid storms', 'North polar ice quakes'], status: 'Scouted', compatibility: 88, route: 'Asterion corridor' },
  { id: 'selene-7', name: 'Selene-7', type: 'Cryo', temperature: -11, gravity: 0.78, atmosphere: 'N₂ / He / CO₂', water: 68, minerals: 80, energy: 31, radiation: 22, hazards: ['Cryovolcanic vents', 'Low-light storms'], status: 'Active outpost', compatibility: 64, route: 'Luna lane' },
  { id: 'vexor-3', name: 'Vexor-3', type: 'Volcanic', temperature: 34, gravity: 1.28, atmosphere: 'CO₂ / SO₂ / N₂', water: 19, minerals: 91, energy: 75, radiation: 54, hazards: ['Ash plumes', 'Seismic surges'], status: 'Unmapped', compatibility: 42, route: 'Ash spine' },
  { id: 'thalassa-4', name: 'Thalassa-4', type: 'Tidal', temperature: 23, gravity: 0.92, atmosphere: 'N₂ / O₂ / H₂O vapour', water: 90, minerals: 53, energy: 48, radiation: 13, hazards: ['High-pressure tides', 'Flash floods'], status: 'Scouted', compatibility: 79, route: 'Silver current' },
  { id: 'ember-12', name: 'Ember-12', type: 'Desert', temperature: 41, gravity: 1.11, atmosphere: 'CO₂ / Ar', water: 12, minerals: 74, energy: 88, radiation: 52, hazards: ['Dust cyclones', 'Solar bursts'], status: 'Surveyed', compatibility: 47, route: 'Solar flare lane' },
  { id: 'lynx-18', name: 'Lynx-18', type: 'Forest', temperature: 15, gravity: 1.12, atmosphere: 'N₂ / O₂ / CH₄', water: 76, minerals: 60, energy: 63, radiation: 16, hazards: ['Dense biohazard haze', 'Root-driven sinkholes'], status: 'Scouted', compatibility: 83, route: 'Verdant arc' },
  { id: 'orion-1', name: 'Orion-1', type: 'Terrestrial', temperature: 21, gravity: 1.0, atmosphere: 'N₂ / O₂ / Ar', water: 77, minerals: 58, energy: 61, radiation: 12, hazards: ['Seasonal dust storms'], status: 'Homeworld', compatibility: 92, route: 'Founding ring' }
];

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
    { from: 'Orion-1', to: 'Aurelia-9', cost: 12, days: 3, status: 'Available' },
    { from: 'Orion-1', to: 'Thalassa-4', cost: 18, days: 4, status: 'Available' },
    { from: 'Aurelia-9', to: 'Lynx-18', cost: 14, days: 3, status: 'Queued' }
  ],
  eventLog: [
    { label: 'Turn 1', detail: 'Long-range scans identified a stable geothermal pocket on Selene-7.' },
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

function advanceSimulationTurn(prev) {
  const nextResources = { ...prev.resources };
  const populationUse = Math.max(4, prev.colonyStats.population / 2);
  nextResources.food = clamp(nextResources.food - populationUse, 0, 200);
  nextResources.water = clamp(nextResources.water - populationUse * 0.8, 0, 200);
  nextResources.energy = clamp(nextResources.energy - 6 + (prev.buildings.includes('power') ? 10 : 0), 0, 200);
  nextResources.minerals = clamp(nextResources.minerals + (prev.buildings.includes('mine') ? 8 : 2), 0, 200);

  const colonyHealth = clamp(
    prev.colonyStats.colonyHealth - (nextResources.food <= 15 ? 8 : 0) - (nextResources.water <= 20 ? 7 : 0) + (prev.buildings.includes('medical') ? 6 : 0),
    0,
    100
  );
  const sustainability = clamp(
    prev.colonyStats.sustainability + (nextResources.energy > 25 ? 3 : -3) + (prev.buildings.includes('lab') ? 2 : 0),
    0,
    100
  );
  const nextThreat = sustainability < 50 ? 'Critical' : sustainability < 70 ? 'Elevated' : 'Stable';
  const eventRoll = ['Solar flare watch', 'Tidal nutrient bloom', 'Dust storm disruption', 'Rare mineral veins discovered'];
  const pickedEvent = eventRoll[Math.floor(Math.random() * eventRoll.length)];

  return {
    ...prev,
    turn: prev.turn + 1,
    eventLog: [{ label: `Turn ${prev.turn + 1}`, detail: pickedEvent }, ...prev.eventLog].slice(0, 5),
    recentAlerts: [pickedEvent, ...prev.recentAlerts].slice(0, 5),
    resources: nextResources,
    colonyStats: {
      ...prev.colonyStats,
      colonyHealth,
      sustainability,
      threat: nextThreat,
      population: Math.min(prev.colonyStats.population + 1, prev.colonyStats.populationCapacity)
    },
    systemMessage: `Turn advanced successfully. Colony stability is ${sustainability}/100. ${pickedEvent}.`
  };
}

export default function App() {
  const [planetSearch, setPlanetSearch] = useState('');
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

  const selectedPlanet = useMemo(() => getPlanetById(planetCatalog, state.selectedPlanetId), [state.selectedPlanetId]);
  const comparePlanet = useMemo(() => getPlanetById(planetCatalog, state.comparePlanetId || 'aurelia-9'), [state.comparePlanetId]);
  const selectedSpecies = useMemo(() => getSpeciesById(speciesCatalog, state.speciesId), [state.speciesId]);
  const compatibilityScore = useMemo(() => calculateCompatibility(selectedPlanet, selectedSpecies), [selectedPlanet, selectedSpecies]);
  const compatibilityData = useMemo(() => buildCompatibilityData(selectedPlanet, selectedSpecies), [selectedPlanet, selectedSpecies]);
  const recommendation = getRecommendation(compatibilityScore);
  const filteredPlanets = planetCatalog.filter((planet) =>
    `${planet.name} ${planet.type} ${planet.status}`.toLowerCase().includes(planetSearch.toLowerCase())
  );
  const compareCompatibility = calculateCompatibility(comparePlanet, selectedSpecies);
  const compareFactors = buildCompatibilityData(comparePlanet, selectedSpecies);

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

  const startMission = (type) => {
    const missionText = type === 'explore'
      ? `Launch ${selectedPlanet.name} survey and orbital mapping sweep.`
      : `Deploy mining corridor to ${selectedPlanet.name}.`;

    setState((prev) => ({
      ...prev,
      discoveredPlanetIds: prev.discoveredPlanetIds.includes(selectedPlanet.id) ? prev.discoveredPlanetIds : [...prev.discoveredPlanetIds, selectedPlanet.id],
      currentMission: missionText,
      recentAlerts: [missionText, ...prev.recentAlerts].slice(0, 4),
      systemMessage: `Mission launched for ${selectedPlanet.name}. Resource telemetry is now streaming to the command deck.`
    }));
  };

  const mineResource = (resourceKey) => {
    const cost = resourceKey === 'minerals' ? 10 : resourceKey === 'silicon' ? 12 : resourceKey === 'rare' ? 16 : 8;
    if (state.resources.energy < cost) {
      setState((prev) => ({
        ...prev,
        systemMessage: `Extraction blocked: ${cost} energy required to mine ${resourceKey}, but only ${prev.resources.energy} is available.`
      }));
      return;
    }

    const gain = resourceKey === 'minerals' ? 18 : resourceKey === 'silicon' ? 15 : resourceKey === 'rare' ? 10 : 16;

    setState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [resourceKey]: clamp(prev.resources[resourceKey] + gain),
        energy: clamp(prev.resources.energy - cost)
      },
      systemMessage: `Mining operation successful. ${resourceKey.toUpperCase()} yield increased, with ${cost} energy consumed.`
    }));
  };

  const buildStructure = (structureId) => {
    const structure = buildingCatalog.find((item) => item.id === structureId);
    if (!structure) return;

    const enough = Object.entries(structure.cost).every(([key, value]) => state.resources[key] >= value);
    if (!enough) {
      setState((prev) => ({
        ...prev,
        systemMessage: `Construction failed: insufficient materials for ${structure.name}. Review the inventory and resource balance.`
      }));
      return;
    }

    setState((prev) => {
      const nextResources = { ...prev.resources };
      Object.entries(structure.cost).forEach(([key, value]) => {
        nextResources[key] = clamp(nextResources[key] - value);
      });

      return {
        ...prev,
        buildings: [...new Set([...prev.buildings, structureId])],
        resources: nextResources,
        colonyStats: {
          ...prev.colonyStats,
          populationCapacity: prev.colonyStats.populationCapacity + (structure.effect.population || 0),
          colonyHealth: clamp(prev.colonyStats.colonyHealth + (structure.effect.health || 0)),
          sustainability: clamp(prev.colonyStats.sustainability + (structure.effect.sustainability || 0), 0, 100),
          habitats: prev.colonyStats.habitats + ((structureId === 'habitat') ? 1 : 0),
          activeHabitats: prev.colonyStats.activeHabitats + ((structureId === 'habitat') ? 1 : 0)
        },
        systemMessage: `${structure.name} was constructed successfully. Colony capacity and resilience improve.`
      };
    });
  };

  const advanceTurn = (turnCount = 1) => {
    setState((prev) => {
      let nextState = prev;
      for (let i = 0; i < turnCount; i += 1) {
        nextState = advanceSimulationTurn(nextState);
      }
      return nextState;
    });
  };

  const transferTrade = () => {
    if (!state.tradeRoutes.length) {
      setState((prev) => ({ ...prev, systemMessage: 'No active trade channels available to dispatch cargo.' }));
      return;
    }

    const selectedRoute = state.tradeRoutes[0];
    setState((prev) => ({
      ...prev,
      tradeRoutes: prev.tradeRoutes.slice(1),
      resources: {
        ...prev.resources,
        water: clamp(prev.resources.water + 8),
        minerals: clamp(prev.resources.minerals + 10),
        food: clamp(prev.resources.food + 6)
      },
      systemMessage: `Cargo delivered to ${selectedRoute.to}. Supply chain stable and route efficiency improved.`
    }));
  };

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
          <a href="#planet-explorer">Sector starchart</a>
          <a href="#planet-overview">Planetary survey</a>
          <a href="#colony-grid">Colony grid</a>
          <a className="nav-active" href="#trade-matrix">Trade &amp; defense matrix</a>
        </nav>

        <div className="defense-banner glass-panel">
          <div>
            <strong><span className="online-dot" /> Defense / logistics matrix synced</strong>
            <small>Active freight corridors: {state.tradeRoutes.length} secure / {state.tradeRoutes.filter((route) => route.status === 'Queued').length} queued</small>
          </div>
          <div className="banner-actions">
            <button className="secondary-btn" onClick={() => setState((prev) => ({ ...prev, systemMessage: `Telemetry calibrated for ${selectedPlanet.name}. Planetary readings are current.` }))}>Calibrate telemetry</button>
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
              <div className="glass-panel panel-large" id="planet-overview">
                <div className="panel-topline">
                  <div>
                    <p className="eyebrow">Tactical hyperlane route topology</p>
                    <h2>{selectedPlanet.name}</h2>
                  </div>
                  <div className={`status-pill ${getStatusClass(recommendation)}`}>{recommendation}</div>
                </div>

                <div className="planet-layout">
                  <div className="planet-visual">
                    <svg className="route-map" viewBox="0 0 620 260" role="img" aria-label="Orbital route map">
                      <path d="M65 155 C150 90 190 55 286 68 S430 135 548 196" />
                      <path className="route-secondary" d="M65 155 C170 218 240 222 325 190 S450 95 548 196" />
                      <path className="route-alert" d="M286 68 C375 88 438 142 548 196" />
                      {[['65','155','ORION'],['175','94','LYNX'],['286','68','AURELIA'],['325','190','SELENE'],['548','196','THALASSA']].map(([x,y,name]) => (
                        <g key={name}><circle cx={x} cy={y} r="7" className={name === 'ORION' ? 'route-node route-home' : 'route-node'} /><text x={x} y={Number(y) + 23}>{name}</text></g>
                      ))}
                    </svg>
                    <div className="planet-badge">{selectedPlanet.status} · {selectedPlanet.route}</div>
                  </div>

                  <div className="planet-meta">
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
                <div className="radar-display">
                  <span className="radar-sweep" />
                  <span className="radar-ping ping-one" />
                  <span className="radar-ping ping-two" />
                  <span className="radar-ping ping-three" />
                  <span className="radar-center">◆</span>
                </div>
                <div className="mission-stack">
                  <div className="mission-card alert-card-critical">{selectedPlanet.hazards[0]} · {state.colonyStats.threat} threat</div>
                  <div className="mission-card">{state.currentMission}</div>
                  <button className="primary-btn" onClick={() => startMission('explore')}>Launch exploration</button>
                  <button className="secondary-btn" onClick={() => startMission('mine')}>Deploy mining sweep</button>
                </div>
              </div>
            </div>

            <div className="two-col planet-systems">
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
                    placeholder="Name, type, or status..."
                  />
                </label>
                <div className="planet-grid">
                  {filteredPlanets.map((planet) => (
                    <button
                      key={planet.id}
                      onClick={() => setState((prev) => ({ ...prev, selectedPlanetId: planet.id }))}
                      className={`planet-card ${state.selectedPlanetId === planet.id ? 'active' : ''}`}
                    >
                      <div className="planet-card-top">
                        <span>{planet.name}</span>
                        <small>{planet.type}</small>
                      </div>
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
                <p className="comparison-caption">Compare habitability for the selected {selectedSpecies.name} profile.</p>
                <div className="compare-select-row">
                  <div className="compare-planet-name">
                    <span>Current planet</span>
                    <strong>{selectedPlanet.name}</strong>
                  </div>
                  <label className="compare-select">
                    <span>Compare with</span>
                    <select
                      value={state.comparePlanetId || 'aurelia-9'}
                      onChange={(event) => setState((prev) => ({ ...prev, comparePlanetId: event.target.value }))}
                    >
                      {planetCatalog.map((planet) => (
                        <option key={planet.id} value={planet.id}>{planet.name}</option>
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
                      <select value={state.speciesId} onChange={(e) => setState((prev) => ({ ...prev, speciesId: e.target.value }))}>
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

              <div className="glass-panel panel-block cargo-panel" id="trade-matrix">
                <p className="eyebrow">Active cargo freighter manifest</p>
                <div className="route-list">
                  <div className="cargo-table-head"><span>Route ID</span><span>Freight</span><span>ETA</span><span>Threat</span></div>
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
              </div>
            </div>

            <div className="two-col compact colony-grid-row">
              <div className="glass-panel panel-block" id="colony-grid">
                <div className="panel-header tight">
                  <p className="eyebrow">Colony construction</p>
                  <h3>Buildable structures</h3>
                </div>
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
