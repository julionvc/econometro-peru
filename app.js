/**
 * Económetro de Estabilidad Monetaria del Perú - app.js
 * Lógica de negocio, controladores de datos y visualización de datos macroeconómicos.
 */

// Datos de Fallback Completos (Garantizan que la aplicación funcione localmente sin red)
const FALLBACK_DATA = {
  "metadata": {
    "fecha_actualizacion": "2026-06-11",
    "fuente": "Banco Central de Reserva del Perú (BCRPData) - Modo Fuera de Línea",
    "series": {
      "tipo_cambio": "PD04638PD",
      "rin": "PD04650MD",
      "riesgo_pais": "PD04709XD",
      "inflacion": "PN01273PM"
    }
  },
  "indicadores_actuales": {
    "tipo_cambio": { "valor": 3.742, "cambio_porcentaje": -0.15, "tendencia": "estable", "fecha": "2026-06-11" },
    "inflacion": { "valor": 2.42, "cambio_porcentaje": 0.05, "tendencia": "dentro_rango", "fecha": "2026-05" },
    "rin": { "valor": 75420, "cambio_anual_m": 1280, "meta_seguridad_pbi": 27.5, "fecha": "2026-06-10" },
    "deuda_publica": { "valor": 32.8, "limite_prudencial": 38.0, "tendencia": "sostenible", "fecha": "2026-05" },
    "riesgo_pais": { "valor": 134, "cambio_bps": -4, "promedio_latam": 320, "fecha": "2026-06-11" }
  },
  "historico": [
    {"fecha": "2026-01-02", "tipo_cambio": 3.712, "rin": 74120, "riesgo_pais": 142, "inflacion": 2.89, "intervencion": 0},
    {"fecha": "2026-01-09", "tipo_cambio": 3.718, "rin": 74150, "riesgo_pais": 140, "inflacion": 2.89, "intervencion": 0},
    {"fecha": "2026-01-16", "tipo_cambio": 3.725, "rin": 74080, "riesgo_pais": 139, "inflacion": 2.89, "intervencion": 0},
    {"fecha": "2026-01-23", "tipo_cambio": 3.738, "rin": 74100, "riesgo_pais": 141, "inflacion": 2.89, "intervencion": 0},
    {"fecha": "2026-01-30", "tipo_cambio": 3.745, "rin": 73950, "riesgo_pais": 144, "inflacion": 2.80, "intervencion": -20},
    {"fecha": "2026-02-06", "tipo_cambio": 3.762, "rin": 73800, "riesgo_pais": 148, "inflacion": 2.72, "intervencion": -50},
    {"fecha": "2026-02-13", "tipo_cambio": 3.785, "rin": 73650, "riesgo_pais": 150, "inflacion": 2.72, "intervencion": -80},
    {"fecha": "2026-02-20", "tipo_cambio": 3.792, "rin": 73700, "riesgo_pais": 152, "inflacion": 2.72, "intervencion": -30},
    {"fecha": "2026-02-27", "tipo_cambio": 3.805, "rin": 73500, "riesgo_pais": 155, "inflacion": 2.65, "intervencion": -120},
    {"fecha": "2026-03-06", "tipo_cambio": 3.818, "rin": 73400, "riesgo_pais": 154, "inflacion": 2.58, "intervencion": -150},
    {"fecha": "2026-03-13", "tipo_cambio": 3.824, "rin": 73600, "riesgo_pais": 149, "inflacion": 2.58, "intervencion": -40},
    {"fecha": "2026-03-20", "tipo_cambio": 3.801, "rin": 74200, "riesgo_pais": 143, "inflacion": 2.58, "intervencion": 10},
    {"fecha": "2026-03-27", "tipo_cambio": 3.782, "rin": 74500, "riesgo_pais": 139, "inflacion": 2.49, "intervencion": 30},
    {"fecha": "2026-04-03", "tipo_cambio": 3.771, "rin": 74620, "riesgo_pais": 138, "inflacion": 2.41, "intervencion": 0},
    {"fecha": "2026-04-10", "tipo_cambio": 3.765, "rin": 74750, "riesgo_pais": 136, "inflacion": 2.41, "intervencion": 0},
    {"fecha": "2026-04-17", "tipo_cambio": 3.758, "rin": 74900, "riesgo_pais": 135, "inflacion": 2.41, "intervencion": 0},
    {"fecha": "2026-04-24", "tipo_cambio": 3.749, "rin": 75020, "riesgo_pais": 133, "inflacion": 2.41, "intervencion": 0},
    {"fecha": "2026-05-01", "tipo_cambio": 3.741, "rin": 75150, "riesgo_pais": 132, "inflacion": 2.38, "intervencion": 0},
    {"fecha": "2026-05-08", "tipo_cambio": 3.738, "rin": 75200, "riesgo_pais": 130, "inflacion": 2.38, "intervencion": 0},
    {"fecha": "2026-05-15", "tipo_cambio": 3.732, "rin": 75310, "riesgo_pais": 128, "inflacion": 2.38, "intervencion": 0},
    {"fecha": "2026-05-22", "tipo_cambio": 3.739, "rin": 75290, "riesgo_pais": 131, "inflacion": 2.38, "intervencion": 0},
    {"fecha": "2026-05-29", "tipo_cambio": 3.744, "rin": 75350, "riesgo_pais": 133, "inflacion": 2.42, "intervencion": 0},
    {"fecha": "2026-06-05", "tipo_cambio": 3.746, "rin": 75380, "riesgo_pais": 135, "inflacion": 2.42, "intervencion": 0},
    {"fecha": "2026-06-08", "tipo_cambio": 3.745, "rin": 75400, "riesgo_pais": 134, "inflacion": 2.42, "intervencion": 0},
    {"fecha": "2026-06-09", "tipo_cambio": 3.743, "rin": 75410, "riesgo_pais": 135, "inflacion": 2.42, "intervencion": 0},
    {"fecha": "2026-06-10", "tipo_cambio": 3.742, "rin": 75420, "riesgo_pais": 134, "inflacion": 2.42, "intervencion": 0},
    {"fecha": "2026-06-11", "tipo_cambio": 3.742, "rin": 75420, "riesgo_pais": 134, "inflacion": 2.42, "intervencion": 0}
  ],
  "coyuntura_semanal": {
    "flujos_negativos": [
      { "categoria": "Ruido Político", "descripcion": "Incertidumbre legislativa y tensiones políticas locales", "monto_millones": 210, "porcentaje_impacto": 42 },
      { "categoria": "Incremento de Tasas FED", "descripcion": "Presión alcista global de la Reserva Federal de EE.UU.", "monto_millones": 150, "porcentaje_impacto": 30 },
      { "categoria": "Importaciones Corporativas", "descripcion": "Demanda estacional de dólares de grandes empresas", "monto_millones": 90, "porcentaje_impacto": 18 },
      { "categoria": "Salida de Portafolios", "descripcion": "Retiro marginal de inversores offshore en renta fija", "monto_millones": 50, "porcentaje_impacto": 10 }
    ],
    "flujos_positivos": [
      { "categoria": "Exportaciones Mineras", "descripcion": "Ingreso de divisas por ventas de cobre, oro y zinc", "monto_millones": 340, "porcentaje_impacto": 48 },
      { "categoria": "Remesas del Exterior", "descripcion": "Flujo continuo de peruanos en el extranjero", "monto_millones": 160, "porcentaje_impacto": 23 },
      { "categoria": "Intervención BCRP", "descripcion": "Inyección cambiaria preventiva en ventanilla interbancaria", "monto_millones": 120, "porcentaje_impacto": 17 },
      { "categoria": "Inversión Extranjera Directa", "descripcion": "Aporte de capital para proyectos de infraestructura local", "monto_millones": 85, "porcentaje_impacto": 12 }
    ]
  },
  "regiones": {
    "PE-ANC": {
      "nombre": "Áncash",
      "canon_minero": 1240,
      "pbi_aporte": 3.8,
      "flujo_comercial": "Alto",
      "actividad_principal": "Minería (Cobre, Zinc - Antamina)",
      "estado": "Crecimiento Sostenido"
    },
    "PE-ARE": {
      "nombre": "Arequipa",
      "canon_minero": 980,
      "pbi_aporte": 5.4,
      "flujo_comercial": "Alto",
      "actividad_principal": "Minería (Cobre - Cerro Verde) e Industria",
      "estado": "Crecimiento Moderado"
    },
    "PE-LMA": {
      "nombre": "Lima Metropolitana & Prov.",
      "canon_minero": 45,
      "pbi_aporte": 45.2,
      "flujo_comercial": "Ultra Alto",
      "actividad_principal": "Servicios Financieros, Comercio, Manufactura",
      "estado": "Estable / Expansión"
    },
    "PE-CUS": {
      "nombre": "Cusco",
      "canon_minero": 820,
      "pbi_aporte": 4.1,
      "flujo_comercial": "Medio-Alto",
      "actividad_principal": "Gas de Camisea y Turismo Internacional",
      "estado": "Recuperación Fuerte"
    },
    "PE-PIU": {
      "nombre": "Piura",
      "canon_minero": 310,
      "pbi_aporte": 4.3,
      "flujo_comercial": "Alto",
      "actividad_principal": "Agroexportación, Pesca Harinera y Petróleo",
      "estado": "Estable"
    },
    "PE-LAL": {
      "nombre": "La Libertad",
      "canon_minero": 420,
      "pbi_aporte": 4.8,
      "flujo_comercial": "Alto",
      "actividad_principal": "Agroexportación (Arándanos/Espárragos) y Oro",
      "estado": "Crecimiento Alto"
    },
    "PE-CAJ": {
      "nombre": "Cajamarca",
      "canon_minero": 340,
      "pbi_aporte": 2.6,
      "flujo_comercial": "Medio",
      "actividad_principal": "Minería Aurífera (Yanacocha) y Lácteos",
      "estado": "Estable / Retos de Inversión"
    },
    "PE-MOQ": {
      "nombre": "Moquegua",
      "canon_minero": 480,
      "pbi_aporte": 1.9,
      "flujo_comercial": "Medio",
      "actividad_principal": "Cobre de Alta Calidad (Quellaveco)",
      "estado": "Boom Minero"
    },
    "PE-TAC": {
      "nombre": "Tacna",
      "canon_minero": 290,
      "pbi_aporte": 1.5,
      "flujo_comercial": "Alto (Frontera)",
      "actividad_principal": "Minería (Toquepala) y Comercio Transfronterizo",
      "estado": "Estable"
    },
    "PE-ICA": {
      "nombre": "Ica",
      "canon_minero": 190,
      "pbi_aporte": 3.2,
      "flujo_comercial": "Alto",
      "actividad_principal": "Agroexportación (Uva/Pisco) y Hierro (Marcona)",
      "estado": "Crecimiento Sostenido"
    }
  }
};

// Configuración de Estado
let state = {
  data: null,
  currentFilter: 'mes', // 'hoy' | 'semana' | 'mes' | 'historico'
  activeRegion: 'PE-LMA',
  source: 'offline' // 'api' | 'local' | 'offline'
};

// Elementos de Gráficos (Chart.js)
let bandChartInstance = null;

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // Ocultar tooltip al hacer scroll (evita que quede flotando en desktops al mover la página)
  window.addEventListener('scroll', () => {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
    }
  }, { passive: true });
});

async function initApp(cacheBust = false) {
  updateStatusIndicator('loading', 'Cargando datos...');
  
  // Intentar cargar datos desde API -> JSON Local -> Fallback
  await fetchAllData(cacheBust);
  
  // Actualizar fecha de actualización dinámica en el header
  const updateDateEl = document.getElementById('update-date');
  if (updateDateEl && state.data && state.data.metadata && state.data.metadata.fecha_actualizacion) {
    updateDateEl.innerText = `Actualizado: ${state.data.metadata.fecha_actualizacion}`;
  }

  // Inicializar componentes UI
  renderHeaderTermometro();
  renderEstructuraSolidez();
  renderCoyunturaSemanal();
  await initInteractiveMap();
  initFilterButtons();
  renderBandChart();
  
  // Ocultar pantalla de carga
  document.getElementById('loading-overlay').classList.add('opacity-0', 'pointer-events-none');
}

// Actualiza el indicador de conexión en el header
function updateStatusIndicator(status, message) {
  const badge = document.getElementById('status-badge');
  const badgeText = document.getElementById('status-text');
  
  badge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ';
  
  if (status === 'loading') {
    badge.classList.add('bg-slate-100', 'text-slate-600');
    badgeText.innerText = message;
  } else if (status === 'api') {
    badge.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
    badgeText.innerText = 'Conectado a BCRP API';
    // Agregar círculo verde que pulse
    badge.innerHTML = `<span class="h-2 w-2 rounded-full bg-emerald-500 pulse-green"></span> <span>Conectado a BCRP API</span>`;
  } else if (status === 'local') {
    badge.classList.add('bg-blue-50', 'text-blue-700', 'border', 'border-blue-200');
    badge.innerHTML = `<span class="h-2 w-2 rounded-full bg-blue-500 pulse-green"></span> <span>Conectado (Base de Datos Central)</span>`;
  } else {
    badge.classList.add('bg-orange-50', 'text-orange-700', 'border', 'border-orange-200');
    badge.innerHTML = `<span class="h-2 w-2 rounded-full bg-orange-500"></span> <span>Modo Simulación (Offline)</span>`;
  }
}

// Carga asíncrona robusta con fallbacks
async function fetchAllData(cacheBust = false) {
  // 1. Si no es un refresco forzado, intentar cargar desde caché local para carga instantánea (<100ms)
  if (!cacheBust) {
    try {
      console.log('Cargando datos iniciales desde el caché local (datos_dashboard.json)...');
      const localResponse = await fetch('datos_dashboard.json');
      if (localResponse.ok) {
        const localJson = await localResponse.json();
        state.data = localJson;
        state.source = 'local';
        updateStatusIndicator('local');
        console.log('Datos cargados exitosamente desde el caché local (Inicio Rápido)');
        return;
      }
    } catch (error) {
      console.warn('No se pudo cargar el JSON local al inicio. Intentando conectar a la API...', error);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  // Cargar últimos 6 meses para visualización histórica
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  
  // URLs divididas por frecuencia
  const bcrpUrlDaily = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD-PD04650MD-PD04709XD/json/${sixMonthsAgo}/${today}/esp`;
  const bcrpUrlMonthly = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PN01273PM/json/${sixMonthsAgo}/${today}/esp`;
  
  const buster = cacheBust ? `&t=${Date.now()}` : '';
  const proxyUrlDaily = `https://api.allorigins.win/raw?url=${encodeURIComponent(bcrpUrlDaily)}${buster}`;
  const proxyUrlMonthly = `https://api.allorigins.win/raw?url=${encodeURIComponent(bcrpUrlMonthly)}${buster}`;
  
  // 2. Intentar consumir API BCRP Real usando un CORS Proxy público
  try {
    console.log('Intentando cargar API del BCRP (diario y mensual) a través de Proxy CORS...');
    const [resDaily, resMonthly] = await Promise.all([
      fetch(proxyUrlDaily),
      fetch(proxyUrlMonthly)
    ]);
    
    if (resDaily.ok && resMonthly.ok) {
      const dailyData = await resDaily.json();
      const monthlyData = await resMonthly.json();
      if (dailyData && dailyData.periods && dailyData.periods.length > 0) {
        state.data = parseBCRPResponse(dailyData, monthlyData);
        state.source = 'api';
        updateStatusIndicator('api');
        console.log('Datos cargados exitosamente de BCRP API via Proxy');
        return;
      }
    }
  } catch (error) {
    console.warn('Fallo en el Proxy CORS para BCRP API. Intentando consulta directa...', error);
  }

  // 3. Intentar consulta directa (por si el cliente tiene CORS deshabilitado o proxy de red propio)
  try {
    const [resDaily, resMonthly] = await Promise.all([
      fetch(bcrpUrlDaily, { method: 'GET', mode: 'cors' }),
      fetch(bcrpUrlMonthly, { method: 'GET', mode: 'cors' })
    ]);
    
    if (resDaily.ok && resMonthly.ok) {
      const dailyData = await resDaily.json();
      const monthlyData = await resMonthly.json();
      state.data = parseBCRPResponse(dailyData, monthlyData);
      state.source = 'api';
      updateStatusIndicator('api');
      console.log('Datos cargados de BCRP API directamente');
      return;
    }
  } catch (error) {
    console.warn('Consulta directa al BCRP bloqueada. Intentando cargar caché local (datos_dashboard.json)...', error);
  }

  // 4. Intentar cargar archivo JSON local (datos_dashboard.json)
  try {
    const jsonBuster = cacheBust ? `?t=${Date.now()}` : '';
    const localResponse = await fetch(`datos_dashboard.json${jsonBuster}`);
    if (localResponse.ok) {
      const localJson = await localResponse.json();
      state.data = localJson;
      state.source = 'local';
      updateStatusIndicator('local');
      console.log('Datos cargados desde el caché local (datos_dashboard.json)');
      return;
    }
  } catch (error) {
    console.warn('No se pudo cargar el JSON local. Activando Fallback fuera de línea.', error);
  }

  // 5. Activar Fallback incorporado en JS (Offline)
  state.data = JSON.parse(JSON.stringify(FALLBACK_DATA));
  state.source = 'offline';
  updateStatusIndicator('offline');
}

// Parsea y limpia los datos en bruto devueltos de la consulta multi-serie
function parseBCRPResponse(dailyJson, monthlyJson) {
  const base = JSON.parse(JSON.stringify(FALLBACK_DATA));
  
  if (dailyJson && dailyJson.periods && dailyJson.periods.length > 0) {
    // Construir mapa de inflación mensual
    const inflationMap = {};
    if (monthlyJson && monthlyJson.periods) {
      const months = {'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06', 
                      'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'};
      monthlyJson.periods.forEach((period) => {
        const parts = period.name.split('.');
        if (parts.length === 2) {
          const monthStr = parts[0];
          let year = parts[1];
          if (year.length === 2) {
            year = '20' + year;
          }
          const month = months[monthStr];
          if (month) {
            const val = parseFloat(period.values[0]);
            if (!isNaN(val)) {
              inflationMap[`${year}-${month}`] = val;
            }
          }
        }
      });
    }

    const bcrpPeriods = dailyJson.periods;
    
    // Función auxiliar para parsear fecha BCRP a formato ISO para ordenamiento
    function bcrpNameToDateStr(bcrpName) {
      const dateParts = bcrpName.split('.');
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const monthStr = dateParts[1];
        const year = '20' + dateParts[2];
        const months = {
          'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06', 
          'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
        };
        const month = months[monthStr] || '01';
        return `${year}-${month}-${day}`;
      }
      return bcrpName;
    }
    
    // Ordenar períodos cronológicamente antes del carry-over
    bcrpPeriods.sort((a, b) => bcrpNameToDateStr(a.name).localeCompare(bcrpNameToDateStr(b.name)));

    const mappedHistorico = [];
    
    // Variables de persistencia (carry-over) para limpiar valores "n/d" o nulos
    let lastValidTC = base.indicadores_actuales.tipo_cambio.valor;
    let lastValidRIN = base.indicadores_actuales.rin.valor;
    let lastValidEMBI = base.indicadores_actuales.riesgo_pais.valor;
    let lastValidInf = base.indicadores_actuales.inflacion.valor;
    
    bcrpPeriods.forEach((period) => {
      // Parsear fecha: dd.mm.yy -> YYYY-MM-DD
      const dateParts = period.name.split('.');
      let formattedDate = period.name;
      let yearMonthKey = '';
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const monthStr = dateParts[1];
        const year = '20' + dateParts[2];
        const months = {'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06', 
                        'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'};
        const month = months[monthStr] || '01';
        formattedDate = `${year}-${month}-${day}`;
        yearMonthKey = `${year}-${month}`;
      }
      
      // Mapeo de valores (índices correspondientes al orden en la URL de consulta multi-serie diaria)
      // values[0] -> PD04638PD (Tipo de Cambio)
      // values[1] -> PD04650MD (RIN)
      // values[2] -> PD04709XD (Riesgo País EMBI)
      
      const rawTC = parseFloat(period.values[0]);
      const rawRIN = parseFloat(period.values[1]);
      const rawEMBI = parseFloat(period.values[2]);
      
      if (!isNaN(rawTC) && rawTC > 0) lastValidTC = rawTC;
      if (!isNaN(rawRIN) && rawRIN > 0) lastValidRIN = rawRIN;
      // El EMBI a veces viene como porcentaje en decimales (ej. 1.34) o entero. Mapear a bps.
      if (!isNaN(rawEMBI) && rawEMBI > 0) {
        lastValidEMBI = rawEMBI < 10 ? Math.round(rawEMBI * 100) : Math.round(rawEMBI);
      }
      
      // Obtener la inflación correspondiente al mes/año de este período diario
      if (yearMonthKey && inflationMap[yearMonthKey] !== undefined) {
        lastValidInf = inflationMap[yearMonthKey];
      }
      
      mappedHistorico.push({
        "fecha": formattedDate,
        "tipo_cambio": lastValidTC,
        "rin": lastValidRIN,
        "riesgo_pais": lastValidEMBI,
        "inflacion": lastValidInf,
        "intervencion": 0 // Se estimará dinámicamente
      });
    });
    
    // Estimar intervenciones del BCRP según cambios bruscos en las reservas (RIN) o tipo de cambio
    for (let i = 1; i < mappedHistorico.length; i++) {
      const prev = mappedHistorico[i - 1];
      const curr = mappedHistorico[i];
      const tcDiff = curr.tipo_cambio - prev.tipo_cambio;
      const rinDiff = curr.rin - prev.rin;
      
      if (tcDiff > 0.012 && rinDiff < -30) {
        curr.intervencion = -80; // Venta de dólares para mitigar devaluación
      } else if (tcDiff < -0.012 && rinDiff > 30) {
        curr.intervencion = 60; // Compra de dólares para acumular reservas y mitigar caída
      }
    }
    
    if (mappedHistorico.length > 0) {
      base.historico = mappedHistorico;
      
      // Actualizar indicadores actuales al último registro disponible
      const latest = mappedHistorico[mappedHistorico.length - 1];
      base.indicadores_actuales.tipo_cambio.valor = latest.tipo_cambio;
      base.indicadores_actuales.tipo_cambio.fecha = latest.fecha;
      base.indicadores_actuales.rin.valor = latest.rin;
      base.indicadores_actuales.riesgo_pais.valor = latest.riesgo_pais;
      base.indicadores_actuales.inflacion.valor = latest.inflacion;
      
      // Calcular variación de tipo de cambio diaria
      if (mappedHistorico.length > 1) {
        const prev = mappedHistorico[mappedHistorico.length - 2];
        const pct = ((latest.tipo_cambio - prev.tipo_cambio) / prev.tipo_cambio) * 100;
        base.indicadores_actuales.tipo_cambio.cambio_porcentaje = parseFloat(pct.toFixed(2));
      }
    }
  }
  return base;
}


// ----------------------------------------------------
// CONTROLADORES DE RENDERIZADO UI
// ----------------------------------------------------

// 1. Cabecera: El Termómetro Cambiario
function renderHeaderTermometro() {
  const historico = state.data.historico;
  if (!historico || historico.length === 0) return;
  
  const latest = historico[historico.length - 1];
  
  // Encontrar el punto de comparación según el filtro
  const filter = state.currentFilter;
  let compIdx = historico.length - 2; // Default hoy
  let labelSuffix = 'hoy';
  
  if (filter === 'semana') {
    compIdx = Math.max(0, historico.length - 7);
    labelSuffix = 'esta sem.';
  } else if (filter === 'mes') {
    compIdx = Math.max(0, historico.length - 12);
    labelSuffix = 'este mes';
  } else if (filter === 'historico') {
    compIdx = 0;
    labelSuffix = 'histórico';
  }
  
  if (compIdx < 0) compIdx = 0;
  const comp = historico[compIdx];
  
  // Elementos
  const tcValor = document.getElementById('tc-value');
  const tcCambio = document.getElementById('tc-change');
  const ipcValor = document.getElementById('ipc-value');
  const ipcCambio = document.getElementById('ipc-change');
  const balanceForceText = document.getElementById('balance-force-text');
  
  // Rellenar valores con efecto suave de número
  tcValor.innerText = `S/. ${latest.tipo_cambio.toFixed(3)}`;
  
  // Calcular cambio de tipo de cambio
  const tcDiff = ((latest.tipo_cambio - comp.tipo_cambio) / comp.tipo_cambio) * 100;
  const tcSign = tcDiff > 0 ? '+' : '';
  tcCambio.innerText = `${tcSign}${tcDiff.toFixed(2)}% ${labelSuffix}`;
  tcCambio.className = tcDiff >= 0 
    ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 glow-orange' 
    : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 glow-blue';

  // Inflación IPC (variación en puntos porcentuales)
  ipcValor.innerText = `${latest.inflacion.toFixed(2)}%`;
  const ipcDiff = latest.inflacion - comp.inflacion;
  const ipcSign = ipcDiff > 0 ? '+' : '';
  ipcCambio.innerText = `${ipcSign}${ipcDiff.toFixed(2)}% vs ${labelSuffix}`;
  
  // Rango meta BCRP es 1% - 3%.
  if (latest.inflacion >= 1.0 && latest.inflacion <= 3.0) {
    ipcCambio.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else {
    ipcCambio.className = 'text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200';
  }

  // Barra de progreso segmentada central (Tensión cambiaria vs Control de inflación)
  const inflationPressure = Math.max(0, Math.min(100, (latest.inflacion / 4.0) * 100));
  const exchangePressure = Math.max(0, Math.min(100, ((latest.tipo_cambio - 3.65) / 0.25) * 100));
  
  const balanceRatio = Math.round((exchangePressure + (100 - inflationPressure)) / 2);
  
  const barCian = document.getElementById('force-bar-cyan');
  const barAmber = document.getElementById('force-bar-amber');
  
  barCian.style.width = `${100 - balanceRatio}%`;
  barAmber.style.width = `${balanceRatio}%`;
  
  if (balanceRatio > 60) {
    balanceForceText.innerText = 'Presión del Dólar Moderada (Demanda de divisas)';
    balanceForceText.className = 'text-xs font-semibold text-orange-600';
  } else if (balanceRatio < 40) {
    balanceForceText.innerText = 'Presión Inflacionaria (Tensión por costos)';
    balanceForceText.className = 'text-xs font-semibold text-slate-700';
  } else {
    balanceForceText.innerText = 'Equilibrio de Fuerzas Macroeconómicas';
    balanceForceText.className = 'text-xs font-semibold text-blue-600';
  }
}

// 2. Panel Divisible: Solidez Estructural (Derecha)
function renderEstructuraSolidez() {
  const historico = state.data.historico;
  if (!historico || historico.length === 0) return;
  
  const latest = historico[historico.length - 1];
  
  const filter = state.currentFilter;
  let compIdx = historico.length - 2; // Default hoy
  let labelSuffix = 'hoy';
  
  if (filter === 'semana') {
    compIdx = Math.max(0, historico.length - 7);
    labelSuffix = 'esta sem.';
  } else if (filter === 'mes') {
    compIdx = Math.max(0, historico.length - 12);
    labelSuffix = 'este mes';
  } else if (filter === 'historico') {
    compIdx = 0;
    labelSuffix = 'histórico';
  }
  
  if (compIdx < 0) compIdx = 0;
  const comp = historico[compIdx];

  // 2.1 Reservas Internacionales Netas (RIN)
  const rinVal = document.getElementById('rin-val');
  const rinValPct = document.getElementById('rin-val-pct');
  const rinBarPe = document.getElementById('rin-bar-pe');
  const rinChangeText = document.getElementById('rin-change-text');
  
  rinVal.innerText = `$ ${latest.rin.toLocaleString('en-US')} M`;
  
  // Calcular porcentaje del PBI dinámicamente (PBI estimado Perú: $264,000 M)
  const rinPctPbi = Math.min(100, (latest.rin / 2640)).toFixed(1);
  if (rinValPct) rinValPct.innerText = `${rinPctPbi}%`;
  if (rinBarPe) rinBarPe.style.width = `${rinPctPbi}%`;

  const rinDiff = latest.rin - comp.rin;
  const rinSign = rinDiff >= 0 ? '+' : '';
  const rinColorClass = rinDiff >= 0 ? 'text-emerald-600' : 'text-orange-600';
  const rinIcon = rinDiff >= 0 ? 'fa-circle-up' : 'fa-circle-down';
  if (rinChangeText) {
    rinChangeText.innerHTML = `<i class="fa-solid ${rinIcon} mr-1"></i>${rinSign}${rinDiff.toLocaleString('en-US')}M dólares vs ${labelSuffix}`;
    rinChangeText.className = `text-xs font-semibold mt-1 ${rinColorClass}`;
  }

  // 2.2 Deuda Pública / PBI
  const deudaVal = document.getElementById('deuda-val');
  const deudaValPct = document.getElementById('deuda-val-pct');
  const deudaBarPe = document.getElementById('deuda-bar-pe');
  
  const deudaActual = state.data.indicadores_actuales.deuda_publica.valor;
  deudaVal.innerText = `${deudaActual.toFixed(1)}% del PBI`;
  if (deudaValPct) deudaValPct.innerText = `${deudaActual.toFixed(1)}%`;
  if (deudaBarPe) {
    deudaBarPe.style.width = `${deudaActual}%`;
    if (deudaActual > 35) {
      deudaBarPe.className = 'progress-indicator bg-orange-500 rounded-full';
    } else {
      deudaBarPe.className = 'progress-indicator bg-blue-600 rounded-full';
    }
  }

  // 2.3 Riesgo País (EMBI+ Perú)
  const embiVal = document.getElementById('embi-val');
  const embiValPct = document.getElementById('embi-val-pct');
  const embiBarPe = document.getElementById('embi-bar-pe');
  const embiChangeText = document.getElementById('embi-change-text');
  
  embiVal.innerText = `${latest.riesgo_pais} bps`;
  if (embiValPct) embiValPct.innerText = `${latest.riesgo_pais} bps`;
  
  const embiPercent = Math.min(100, (latest.riesgo_pais / 400) * 100);
  if (embiBarPe) embiBarPe.style.width = `${embiPercent}%`;

  const embiDiff = latest.riesgo_pais - comp.riesgo_pais;
  const embiSign = embiDiff >= 0 ? '+' : '';
  const embiColorClass = embiDiff <= 0 ? 'text-blue-600' : 'text-orange-600';
  const embiIcon = embiDiff <= 0 ? 'fa-circle-down' : 'fa-circle-up';
  if (embiChangeText) {
    embiChangeText.innerHTML = `<i class="fa-solid ${embiIcon} mr-1"></i>${embiSign}${embiDiff} bps vs ${labelSuffix}`;
    embiChangeText.className = `text-xs font-semibold mt-1 ${embiColorClass}`;
  }
}

// 3. Bloque de Coyuntura Semanal (Barras Bidireccionales)
function renderCoyunturaSemanal() {
  const coy = state.data.coyuntura_semanal;
  const negContainer = document.getElementById('coy-negativos');
  const posContainer = document.getElementById('coy-positivos');
  
  // Limpiar
  negContainer.innerHTML = '';
  posContainer.innerHTML = '';

  // Renderizar flujos negativos (Demanda de dólares - Naranja - Eje Izquierdo)
  coy.flujos_negativos.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 text-right group py-1.5';
    
    row.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center justify-end gap-2">
          <span class="text-xs font-semibold text-slate-800">${item.categoria}</span>
          <span class="text-[10px] text-[#FF6B1A] font-mono font-bold">-$${item.monto_millones}M</span>
        </div>
        <div class="w-full flex justify-end mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="bg-[#FF6B1A] rounded-full bar-transition" style="width: 0%"></div>
        </div>
      </div>
      <div class="text-[11px] text-slate-800 font-medium w-28 leading-tight text-right">${item.descripcion}</div>
    `;
    negContainer.appendChild(row);
    
    // Trigger animación de ancho
    setTimeout(() => {
      row.querySelector('.bg-\\[\\#FF6B1A\\]').style.width = `${item.porcentaje_impacto}%`;
    }, 100);
  });

  // Renderizar flujos positivos (Inyección de divisas - Azul - Eje Derecho)
  coy.flujos_positivos.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-3 text-left group py-1.5';
    
    row.innerHTML = `
      <div class="text-[11px] text-slate-800 font-medium w-28 leading-tight text-left order-1">${item.descripcion}</div>
      <div class="flex-1 order-2">
        <div class="flex items-center justify-start gap-2">
          <span class="text-[10px] text-blue-600 font-mono font-bold">+$${item.monto_millones}M</span>
          <span class="text-xs font-semibold text-slate-800">${item.categoria}</span>
        </div>
        <div class="w-full flex justify-start mt-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="bg-blue-600 rounded-full bar-transition" style="width: 0%"></div>
        </div>
      </div>
    `;
    posContainer.appendChild(row);
    
    // Trigger animación
    setTimeout(() => {
      row.querySelector('.bg-blue-600').style.width = `${item.porcentaje_impacto}%`;
    }, 100);
  });
}

// 4. Panel Divisible: Mapa Interactivo de Impacto Regional (Izquierda)
async function initInteractiveMap() {
  const svg = d3.select('#peru-map-svg');
  const canvas = d3.select('#map-canvas');
  const tooltip = document.getElementById('map-tooltip');
  
  if (!canvas.node()) return;
  
  // Limpiar contenido previo si existe
  canvas.selectAll('*').remove();
  
  let geojsonData;
  try {
    const response = await fetch('peru_departamental_simple.geojson');
    if (!response.ok) throw new Error('Network response was not ok');
    geojsonData = await response.json();
  } catch (error) {
    console.error('Error al cargar el GeoJSON del mapa:', error);
    canvas.append('text')
      .attr('x', 300)
      .attr('y', 390)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '14px')
      .text('Error al cargar mapa regional. Intente refrescar.');
    return;
  }
  
  // Configurar la proyección para ajustar el GeoJSON al viewBox 600x780
  const width = 600;
  const height = 780;
  
  const projection = d3.geoMercator()
    .fitSize([width, height], geojsonData);
    
  const pathGenerator = d3.geoPath().projection(projection);
  
  // Diccionario de mapeo de nombres de departamentos en GeoJSON a códigos del dashboard
  const DEPT_NAME_TO_CODE = {
    "AMAZONAS": "PE-AMA",
    "ANCASH": "PE-ANC",
    "APURIMAC": "PE-APU",
    "AREQUIPA": "PE-ARE",
    "AYACUCHO": "PE-AYA",
    "CAJAMARCA": "PE-CAJ",
    "CALLAO": "PE-CAL",
    "CUSCO": "PE-CUS",
    "HUANCAVELICA": "PE-HUV",
    "HUANUCO": "PE-HUA",
    "ICA": "PE-ICA",
    "JUNIN": "PE-JUN",
    "LA LIBERTAD": "PE-LAL",
    "LAMBAYEQUE": "PE-LAM",
    "LIMA": "PE-LMA",
    "LORETO": "PE-LOR",
    "MADRE DE DIOS": "PE-MDD",
    "MOQUEGUA": "PE-MOQ",
    "PASCO": "PE-PAS",
    "PIURA": "PE-PIU",
    "PUNO": "PE-PUN",
    "SAN MARTIN": "PE-SAM",
    "TACNA": "PE-TAC",
    "TUMBES": "PE-TUM",
    "UCAYALI": "PE-UCA"
  };

  // Estimaciones productivas para regiones de monitoreo general para poblar la ficha cuando se haga click
  const GENERAL_REGIONS_DATA = {
    "PE-AMA": { nombre: "Amazonas", canon_minero: 0, pbi_aporte: 0.8, flujo_comercial: "Bajo-Medio", actividad_principal: "Agricultura (Café, Cacao) y Ecoturismo", estado: "Monitoreo General" },
    "PE-APU": { nombre: "Apurímac", canon_minero: 580, pbi_aporte: 1.8, flujo_comercial: "Medio (Minero)", actividad_principal: "Minería (Cobre - Las Bambas)", estado: "Estable / Social" },
    "PE-AYA": { nombre: "Ayacucho", canon_minero: 110, pbi_aporte: 1.1, flujo_comercial: "Medio", actividad_principal: "Minería de Plata/Oro y Agricultura", estado: "Estable" },
    "PE-CAL": { nombre: "Prov. Const. del Callao", canon_minero: 0, pbi_aporte: 3.9, flujo_comercial: "Muy Alto (Puerto)", actividad_principal: "Logística Portuaria e Industria Pesquera", estado: "Estable" },
    "PE-HUV": { nombre: "Huancavelica", canon_minero: 65, pbi_aporte: 0.7, flujo_comercial: "Bajo", actividad_principal: "Minería Polymetálica y Agricultura Andina", estado: "Monitoreo General" },
    "PE-HUA": { nombre: "Huánuco", canon_minero: 15, pbi_aporte: 1.2, flujo_comercial: "Medio", actividad_principal: "Cacao, Café y Ganadería", estado: "Estable" },
    "PE-JUN": { nombre: "Junín", canon_minero: 210, pbi_aporte: 2.9, flujo_comercial: "Alto", actividad_principal: "Minería, Energía Hidroeléctrica y Agro", estado: "Crecimiento" },
    "PE-LAM": { nombre: "Lambayeque", canon_minero: 0, pbi_aporte: 2.2, flujo_comercial: "Medio-Alto", actividad_principal: "Agroexportación (Azúcar, Limón) y Comercio", estado: "Estable" },
    "PE-MDD": { nombre: "Madre de Dios", canon_minero: 0, pbi_aporte: 0.9, flujo_comercial: "Bajo-Medio", actividad_principal: "Castaña, Minería Aurífera y Turismo", estado: "Estable / Informalidad" },
    "PE-PAS": { nombre: "Pasco", canon_minero: 180, pbi_aporte: 0.9, flujo_comercial: "Medio", actividad_principal: "Minería (Plomo, Zinc, Plata - Volcan)", estado: "Estable" },
    "PE-SAM": { nombre: "San Martín", canon_minero: 0, pbi_aporte: 1.6, flujo_comercial: "Medio", actividad_principal: "Arroz, Café, Palma Aceitera y Turismo", estado: "Crecimiento Alto" },
    "PE-TUM": { nombre: "Tumbes", canon_minero: 25, pbi_aporte: 0.5, flujo_comercial: "Medio (Frontera)", actividad_principal: "Pesca Langostera, Hidrocarburos y Turismo", estado: "Estable" },
    "PE-UCA": { nombre: "Ucayali", canon_minero: 40, pbi_aporte: 1.1, flujo_comercial: "Medio", actividad_principal: "Industria Maderera y Gas Natural", estado: "Estable" }
  };

  // Renderizar los departamentos de Perú
  const departmentPaths = canvas.selectAll('path')
    .data(geojsonData.features)
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('class', d => {
      const nomb = d.properties.NOMBDEP;
      const code = DEPT_NAME_TO_CODE[nomb];
      const hasDetailedData = state.data.regiones[code] !== undefined;
      return `map-department ${hasDetailedData ? 'active-region' : ''} ${code === state.activeRegion ? 'selected-dept' : ''}`;
    })
    .attr('id', d => {
      const nomb = d.properties.NOMBDEP;
      return DEPT_NAME_TO_CODE[nomb] || `PE-UNKNOWN-${nomb}`;
    });

  // Agregar etiquetas de texto en los centroides para mejorar legibilidad
  const departmentLabels = canvas.selectAll('text')
    .data(geojsonData.features)
    .enter()
    .append('text')
    .attr('x', d => {
      const centroid = pathGenerator.centroid(d);
      return centroid ? centroid[0] : 0;
    })
    .attr('y', d => {
      const centroid = pathGenerator.centroid(d);
      return centroid ? centroid[1] + 3 : 0;
    })
    .attr('font-size', d => {
      const nomb = d.properties.NOMBDEP;
      return nomb === "CALLAO" ? "8px" : "10.5px";
    })
    .attr('text-anchor', 'middle')
    .attr('font-weight', '800')
    .attr('fill', d => {
      const nomb = d.properties.NOMBDEP;
      const code = DEPT_NAME_TO_CODE[nomb];
      const isSelected = code === state.activeRegion;
      const isDetailed = state.data.regiones[code] !== undefined;
      
      if (isSelected) return '#ffffff';
      if (isDetailed) return '#1e3a8a';
      return '#64748b';
    })
    .attr('class', 'pointer-events-none font-display')
    .text(d => {
      const nomb = d.properties.NOMBDEP;
      const code = DEPT_NAME_TO_CODE[nomb];
      return code ? code.replace('PE-', '') : nomb.substring(0, 3);
    });

  // Vincular eventos interactivos utilizando D3
  departmentPaths
    .on('mousemove', function(event, d) {
      const nomb = d.properties.NOMBDEP;
      const code = DEPT_NAME_TO_CODE[nomb];
      
      let info = state.data.regiones[code];
      let isDetailed = true;
      
      if (!info) {
        info = GENERAL_REGIONS_DATA[code] || {
          nombre: nomb.charAt(0) + nomb.slice(1).toLowerCase(),
          actividad_principal: "Actividades Agropecuarias / Comercio",
          canon_minero: 0,
          pbi_aporte: 0.5,
          estado: "Monitoreo General"
        };
        isDetailed = false;
      }
      
      tooltip.innerHTML = `
        <div class="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-800 text-xs w-52 leading-relaxed">
          <div class="font-bold border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
            <span>${info.nombre}</span>
            <span class="px-1.5 py-0.5 rounded text-[8px] font-bold ${isDetailed ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'} uppercase">
              ${isDetailed ? 'Flujo Crítico' : 'Monitoreo Gral'}
            </span>
          </div>
          <div><span class="text-slate-400">Actividad:</span> <span class="font-medium text-slate-200">${info.actividad_principal}</span></div>
          ${info.canon_minero > 0 ? `<div><span class="text-slate-400">Canon/Regalías:</span> <span class="font-medium text-emerald-400 font-mono">S/. ${info.canon_minero} M</span></div>` : ''}
          <div><span class="text-slate-400">Aporte PBI Nac:</span> <span class="font-semibold text-slate-100">${info.pbi_aporte}%</span></div>
          <div><span class="text-slate-400">Dinámica:</span> <span class="font-semibold ${isDetailed ? 'text-blue-400' : 'text-slate-400'}">${info.estado}</span></div>
        </div>
      `;

      // Medir dinámicamente las dimensiones del tooltip para evitar colisiones
      const rect = tooltip.getBoundingClientRect();
      const tooltipWidth = rect.width || 220;
      const tooltipHeight = rect.height || 160;
      const xOffset = 15;
      const yOffset = 15;

      let x = event.clientX + xOffset;
      let y = event.clientY + yOffset;

      // Colisión borde derecho del viewport
      if (x + tooltipWidth > window.innerWidth) {
        x = event.clientX - tooltipWidth - xOffset;
      }
      // Colisión borde inferior del viewport
      if (y + tooltipHeight > window.innerHeight) {
        y = event.clientY - tooltipHeight - yOffset;
      }

      // Evitar salirse de los límites superior/izquierdo absolutos
      if (x < 10) x = 10;
      if (y < 10) y = 10;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.opacity = '1';
    })
    .on('mouseleave', function() {
      tooltip.style.opacity = '0';
    })
    .on('click', function(event, d) {
      const nomb = d.properties.NOMBDEP;
      const code = DEPT_NAME_TO_CODE[nomb];
      
      departmentPaths.classed('selected-dept', false);
      d3.select(this).classed('selected-dept', true);
      
      departmentLabels.attr('fill', dLabel => {
        const dNomb = dLabel.properties.NOMBDEP;
        const dCode = DEPT_NAME_TO_CODE[dNomb];
        if (dCode === code) return '#ffffff';
        const isDetailed = state.data.regiones[dCode] !== undefined;
        return isDetailed ? '#1e3a8a' : '#64748b';
      });
      
      state.activeRegion = code;
      
      let info = state.data.regiones[code];
      if (!info) {
        info = GENERAL_REGIONS_DATA[code] || {
          nombre: nomb.charAt(0) + nomb.slice(1).toLowerCase(),
          actividad_principal: "Actividades Agropecuarias / Comercio",
          canon_minero: 0,
          pbi_aporte: 0.5,
          estado: "Monitoreo General"
        };
      }
      
      renderRegionDetailCard(info);
    });

  // Mostrar por defecto los datos de la región activa al cargar
  let defaultInfo = state.data.regiones[state.activeRegion];
  if (!defaultInfo) {
    defaultInfo = GENERAL_REGIONS_DATA[state.activeRegion] || {
      nombre: "Lima Metropolitana & Prov.",
      actividad_principal: "Servicios Financieros, Comercio, Manufactura",
      canon_minero: 45,
      pbi_aporte: 45.2,
      estado: "Estable / Expansión"
    };
  }
  renderRegionDetailCard(defaultInfo);
}

// Actualiza la tarjeta lateral detallada del departamento
function renderRegionDetailCard(info) {
  const card = document.getElementById('region-detail-card');
  if (!card) return;

  card.innerHTML = `
    <div class="border-b border-slate-100 pb-3 mb-3">
      <div class="flex items-center justify-between">
        <h4 class="text-md font-bold text-slate-900">${info.nombre}</h4>
        <span class="px-2 py-0.5 text-[10px] font-semibold bg-cyan-50 text-cyan-700 rounded-full border border-cyan-100">${info.estado}</span>
      </div>
      <p class="text-xs text-slate-500 mt-1">Indicadores de inyección y producción regional</p>
    </div>
    
    <div class="space-y-3.5">
      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-500 font-medium">Actividad Principal</span>
          <span class="font-semibold text-slate-800">${info.actividad_principal}</span>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-500 font-medium">Aporte al PBI Peruano</span>
          <span class="font-semibold text-slate-900">${info.pbi_aporte}%</span>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-cyan-500 h-full rounded-full" style="width: ${info.pbi_aporte * 2}%"></div>
        </div>
      </div>

      <div>
        <div class="flex justify-between text-xs mb-1">
          <span class="text-slate-500 font-medium">Canon y Regalías Recibidas</span>
          <span class="font-semibold text-emerald-600 font-mono">${info.canon_minero > 45 ? `S/. ${info.canon_minero} M` : 'N/A'}</span>
        </div>
        ${info.canon_minero > 45 ? `
          <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" style="width: ${Math.min(100, (info.canon_minero / 1300) * 100)}%"></div>
          </div>
        ` : ''}
      </div>

      <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
        <svg class="h-3.5 w-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Los flujos comerciales impactan el tipo de cambio interbancario.</span>
      </div>
    </div>
  `;
}

// 5. Inicializar Filtros de Botones Píldora
function initFilterButtons() {
  const pills = document.querySelectorAll('.pill-button');
  
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const filter = pill.getAttribute('data-filter');
      state.currentFilter = filter;
      
      // Actualizar todo el dashboard de acuerdo al filtro de tiempo
      renderHeaderTermometro();
      renderEstructuraSolidez();
      updateBandChart();
    });
  });
}

// 6. Evolución e Intervención: Gráfico de Bandas (Chart.js)
function getChartYLimits(values) {
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const margin = (maxVal - minVal) * 0.2 || 0.05;
  const min = parseFloat((minVal - margin).toFixed(3));
  const max = parseFloat((maxVal + margin).toFixed(3));
  return { min, max };
}

function renderBandChart() {
  const ctx = document.getElementById('band-chart').getContext('2d');
  
  // Preparar datos filtrados (Por defecto: Histórico)
  const chartData = getChartDataForFilter(state.currentFilter);
  const yLimits = getChartYLimits(chartData.values);
  
  // Plugin para pintar el sombreado del Rango Meta/Tolerancia del BCRP de fondo
  const targetRangePlugin = {
    id: 'targetRange',
    beforeDraw: (chart) => {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea) return;
      
      const PenValues = chart.data.datasets[0].data;
      if (!PenValues || PenValues.length === 0) return;
      
      const avgPen = PenValues.reduce((a, b) => a + b, 0) / PenValues.length;
      
      // Banda de tolerancia cambiaria dinámica (+/- 1.5% del promedio de flotación reciente)
      const bottomBand = parseFloat((avgPen * 0.985).toFixed(3));
      const topBand = parseFloat((avgPen * 1.015).toFixed(3));
      
      const yScale = scales.y;
      const topY = yScale.getPixelForValue(topBand);
      const bottomY = yScale.getPixelForValue(bottomBand);
      
      ctx.save();
      ctx.fillStyle = 'rgba(37, 99, 235, 0.04)'; // Azul muy tenue
      ctx.fillRect(
        chartArea.left, 
        topY, 
        chartArea.right - chartArea.left, 
        bottomY - topY
      );
      
      // Línea punteada límite superior
      ctx.strokeStyle = 'rgba(255, 107, 26, 0.25)'; // Naranja tenue
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(chartArea.left, topY);
      ctx.lineTo(chartArea.right, topY);
      ctx.stroke();

      // Línea punteada límite inferior
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)'; // Azul tenue
      ctx.beginPath();
      ctx.moveTo(chartArea.left, bottomY);
      ctx.lineTo(chartArea.right, bottomY);
      ctx.stroke();
      
      ctx.restore();
    }
  };

  // Crear Gradiente para la línea del Sol Peruano (PEN)
  const lineGradient = ctx.createLinearGradient(0, 0, 0, 300);
  lineGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)'); // Azul Marino Profundo
  lineGradient.addColorStop(1, 'rgba(51, 65, 85, 0.4)'); // Gris Pizarra

  bandChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Tipo de Cambio (USD/PEN)',
          data: chartData.values,
          borderColor: '#0f172a',
          borderWidth: 2.5,
          pointBackgroundColor: chartData.pointColors,
          pointBorderColor: chartData.pointBorderColors,
          pointRadius: chartData.pointRadii,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Plus Jakarta Sans', size: 11 },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              let label = `Tipo de Cambio: S/. ${context.parsed.y.toFixed(3)}`;
              const itemIdx = context.dataIndex;
              const date = chartData.dates[itemIdx];
              const histPoint = state.data.historico.find(p => p.fecha === date);
              
              if (histPoint && histPoint.intervencion !== 0) {
                const action = histPoint.intervencion < 0 ? 'VENTA' : 'COMPRA';
                label += `\n🚨 INTERVENCIÓN BCRP: ${action} ($${Math.abs(histPoint.intervencion)}M)`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 10 },
            color: '#64748b'
          }
        },
        y: {
          min: yLimits.min,
          max: yLimits.max,
          ticks: {
            stepSize: 0.05,
            font: { family: 'Plus Jakarta Sans', size: 10 },
            color: '#64748b',
            callback: function(value) {
              return 'S/. ' + value.toFixed(2);
            }
          },
          grid: {
            color: '#f1f5f9'
          }
        }
      }
    },
    plugins: [targetRangePlugin]
  });
}

// Actualiza el gráfico con nuevos datos al filtrar
function updateBandChart() {
  if (!bandChartInstance) return;
  
  const chartData = getChartDataForFilter(state.currentFilter);
  const yLimits = getChartYLimits(chartData.values);
  
  bandChartInstance.data.labels = chartData.labels;
  bandChartInstance.data.datasets[0].data = chartData.values;
  bandChartInstance.data.datasets[0].pointBackgroundColor = chartData.pointColors;
  bandChartInstance.data.datasets[0].pointBorderColor = chartData.pointBorderColors;
  bandChartInstance.data.datasets[0].pointRadius = chartData.pointRadii;
  
  // Actualizar los límites de la escala Y dinámicamente
  bandChartInstance.options.scales.y.min = yLimits.min;
  bandChartInstance.options.scales.y.max = yLimits.max;
  
  bandChartInstance.update();
}

// Filtra los datos según la píldora temporal seleccionada
function getChartDataForFilter(filter) {
  const historico = state.data.historico;
  let subset = [...historico];
  
  if (filter === 'hoy') {
    // Solo mostramos los últimos 2 puntos para dar sensación de día
    subset = historico.slice(-2);
  } else if (filter === 'semana') {
    subset = historico.slice(-7);
  } else if (filter === 'mes') {
    subset = historico.slice(-12);
  }
  
  const labels = subset.map(item => {
    const d = new Date(item.fecha);
    // Retornar formato corto: "dd Ene" o similar
    const day = d.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[d.getMonth()]}`;
  });
  
  const values = subset.map(item => item.tipo_cambio);
  const dates = subset.map(item => item.fecha);
  
  // Marcar puntos de intervención
  const pointColors = [];
  const pointBorderColors = [];
  const pointRadii = [];
  
  subset.forEach(item => {
    if (item.intervencion < 0) {
      // Venta de dólares (BCRP frena alza) -> Punto Naranja
      pointColors.push('#FF6B1A');
      pointBorderColors.push('rgba(255, 107, 26, 0.3)');
      pointRadii.push(6);
    } else if (item.intervencion > 0) {
      // Compra de dólares (BCRP frena caída) -> Punto Azul
      pointColors.push('#2563eb');
      pointBorderColors.push('rgba(37, 99, 235, 0.3)');
      pointRadii.push(6);
    } else {
      // Sin intervención -> Punto invisible o pequeño gris
      pointColors.push('#0f172a');
      pointBorderColors.push('#ffffff');
      pointRadii.push(3.5);
    }
  });

  return { labels, values, dates, pointColors, pointBorderColors, pointRadii };
}

// 7. Función Global para Refrescar Resultados
window.refreshData = async function() {
  console.log('Solicitud de refresco de datos recibida...');
  const btnIcon = document.querySelector('header button i.fa-arrows-rotate');
  if (btnIcon) {
    btnIcon.classList.add('animate-spin');
  }
  
  // Mostrar recarga visual en el badge
  updateStatusIndicator('loading', 'Recargando...');
  
  // Breve retardo para dar feedback de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    await initApp(true); // Pasar cacheBust = true
  } catch (err) {
    console.error('Error al recargar datos:', err);
  } finally {
    if (btnIcon) {
      btnIcon.classList.remove('animate-spin');
    }
  }
};
