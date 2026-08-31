/**
 * Económetro de Estabilidad Monetaria del Perú - update_data.js
 * Script backend automatizado para actualizar datos_dashboard.json consultando el API del BCRPData.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuración de rutas
const JSON_FILE_PATH = path.join(__dirname, 'datos_dashboard.json');

// Extrae y parsea el objeto JSON limpio incluso si el servidor del BCRP agrega advertencias PHP o HTML al final
function extractCleanJson(rawText) {
  if (typeof rawText !== 'string') return rawText;
  const start = rawText.indexOf('{');
  if (start === -1) {
    return JSON.parse(rawText);
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < rawText.length; i++) {
    const char = rawText[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end !== -1) {
    return JSON.parse(rawText.substring(start, end + 1));
  }
  return JSON.parse(rawText);
}

// Función auxiliar para realizar peticiones HTTP GET y retornar JSON
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    };
    
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Error al conectar con BCRP: Estado ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(extractCleanJson(data));
        } catch (e) {
          reject(new Error(`Error al decodificar JSON de BCRP: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Función principal
async function main() {
  console.log('Iniciando script de actualización del Económetro BCRP...');
  
  // 1. Cargar el JSON de caché existente para preservar configuraciones estáticas (regiones, coyuntura, deuda)
  let dashboardData;
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const fileContent = fs.readFileSync(JSON_FILE_PATH, 'utf8');
      dashboardData = JSON.parse(fileContent);
      console.log('Caché existente cargada correctamente.');
    } else {
      throw new Error('No se encontró el archivo datos_dashboard.json en la raíz del proyecto.');
    }
  } catch (error) {
    console.error(`Error crítico al cargar caché local: ${error.message}`);
    process.exit(1);
  }

  // 2. Definir rango de fechas para la consulta (últimos 6 meses hasta hoy)
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().slice(0, 10);
  
  const sixMonthsAgoObj = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const sixMonthsAgoStr = sixMonthsAgoObj.toISOString().slice(0, 10);
  
  console.log(`Rango de consulta BCRP: Desde ${sixMonthsAgoStr} hasta ${todayStr}`);

  // URL del API multi-serie del BCRP (dividido por frecuencias):
  // Diarias (7 series consolidadas):
  // PD04638PD: Tipo de cambio venta diario (interbancario)
  // PD04650MD: Reservas Internacionales Netas (RIN) diario
  // PD04692MD: Tasa de interés interbancaria en Soles (BCRP)
  // PD04693MD: Tasa de interés interbancaria en Dólares (FED proxy)
  // PD04701XD: Cotización internacional Cobre (cUS$/lb)
  // PD04704XD: Cotización internacional Oro (US$/oz)
  // PD04709XD: Riesgo país EMBI+ diario (bps)
  const bcrpUrlDaily = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD-PD04650MD-PD04692MD-PD04693MD-PD04701XD-PD04704XD-PD04709XD/json/${sixMonthsAgoStr}/${todayStr}/esp`;
  
  // Mensuales:
  // PN01273PM: Inflación doce meses mensual
  const bcrpUrlMonthly = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PN01273PM/json/${sixMonthsAgoStr}/${todayStr}/esp`;

  // 3. Consultar la API del BCRP
  let bcrpDailyJson, bcrpMonthlyJson;
  try {
    console.log('Consultando API del BCRPData (7 Series Diarias)...');
    bcrpDailyJson = await fetchJson(bcrpUrlDaily);
    
    if (!bcrpDailyJson || !bcrpDailyJson.periods || bcrpDailyJson.periods.length === 0) {
      throw new Error('La respuesta diaria del BCRP no contiene períodos de datos válidos.');
    }
    console.log(`Petición diaria exitosa: Recibidos ${bcrpDailyJson.periods.length} períodos de datos.`);
    
    console.log('Consultando API del BCRPData (Series Mensuales)...');
    bcrpMonthlyJson = await fetchJson(bcrpUrlMonthly);
    console.log('Petición mensual exitosa.');
  } catch (error) {
    console.error(`Error crítico al consultar BCRP API: ${error.message}`);
    console.log('Manteniendo la caché existente intacta.');
    process.exit(1); // Falla el job pero mantiene la web existente funcional
  }

  // 4. Parsear y limpiar datos del BCRP
  try {
    // 4.1 Construir mapa de inflación mensual
    const inflationMap = {};
    if (bcrpMonthlyJson && bcrpMonthlyJson.periods) {
      const months = {
        'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06', 
        'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
      };
      bcrpMonthlyJson.periods.forEach((period) => {
        // Formato esperado: "Ene.2026" o "Ene.26"
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
    console.log('Mapa de inflación mensual procesado:', inflationMap);

    const bcrpPeriods = bcrpDailyJson.periods;
    
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
    
    // Inicializar persistencia de datos (carry-over) en caso de celdas "n/d"
    let lastValidTC = (dashboardData.indicadores_actuales.tipo_cambio && dashboardData.indicadores_actuales.tipo_cambio.valor) || 3.35;
    let lastValidRIN = (dashboardData.indicadores_actuales.rin && dashboardData.indicadores_actuales.rin.valor) || 98000;
    let lastValidTasaBCRP = (dashboardData.indicadores_actuales.tasa_interes_bcrp && dashboardData.indicadores_actuales.tasa_interes_bcrp.valor) || 4.25;
    let lastValidTasaUSD = (dashboardData.indicadores_actuales.tasa_interes_fed && dashboardData.indicadores_actuales.tasa_interes_fed.valor) || 3.75;
    let lastValidCobre = (dashboardData.indicadores_actuales.cobre_precio && dashboardData.indicadores_actuales.cobre_precio.valor) || 640;
    let lastValidOro = (dashboardData.indicadores_actuales.oro_precio && dashboardData.indicadores_actuales.oro_precio.valor) || 4100;
    let lastValidEMBI = (dashboardData.indicadores_actuales.riesgo_pais && dashboardData.indicadores_actuales.riesgo_pais.valor) || 110;
    let lastValidInf = (dashboardData.indicadores_actuales.inflacion && dashboardData.indicadores_actuales.inflacion.valor) || 4.0;
    
    bcrpPeriods.forEach((period) => {
      // Convertir fecha de formato BCRP (dd.Mmm.yy) a ISO (YYYY-MM-DD)
      const dateParts = period.name.split('.');
      let formattedDate = period.name;
      let yearMonthKey = '';
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const monthStr = dateParts[1];
        const year = '20' + dateParts[2];
        const months = {
          'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06', 
          'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
        };
        const month = months[monthStr] || '01';
        formattedDate = `${year}-${month}-${day}`;
        yearMonthKey = `${year}-${month}`;
      }
      
      // Mapear celdas de acuerdo al orden en el URL multi-serie diario
      // values[0] -> Tipo de Cambio (PD04638PD)
      // values[1] -> Reservas Internacionales Netas (PD04650MD)
      // values[2] -> Tasa Interbancaria Soles (PD04692MD)
      // values[3] -> Tasa Interbancaria Dólares (PD04693MD)
      // values[4] -> Cobre (PD04701XD)
      // values[5] -> Oro (PD04704XD)
      // values[6] -> Riesgo País EMBI+ (PD04709XD)
      const rawTC = parseFloat(period.values[0]);
      const rawRIN = parseFloat(period.values[1]);
      const rawTasaBCRP = parseFloat(period.values[2]);
      const rawTasaUSD = parseFloat(period.values[3]);
      const rawCobre = parseFloat(period.values[4]);
      const rawOro = parseFloat(period.values[5]);
      const rawEMBI = parseFloat(period.values[6]);
      
      if (!isNaN(rawTC) && rawTC > 0) lastValidTC = rawTC;
      if (!isNaN(rawRIN) && rawRIN > 0) lastValidRIN = rawRIN;
      if (!isNaN(rawTasaBCRP) && rawTasaBCRP > 0) lastValidTasaBCRP = rawTasaBCRP;
      if (!isNaN(rawTasaUSD) && rawTasaUSD > 0) lastValidTasaUSD = rawTasaUSD;
      if (!isNaN(rawCobre) && rawCobre > 0) lastValidCobre = parseFloat(rawCobre.toFixed(1));
      if (!isNaN(rawOro) && rawOro > 0) lastValidOro = parseFloat(rawOro.toFixed(1));
      
      // Adaptar el riesgo EMBI+ a puntos básicos (ej. 1.34% -> 134 bps)
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
        "tasa_bcrp": lastValidTasaBCRP,
        "tasa_usd": lastValidTasaUSD,
        "cobre": lastValidCobre,
        "oro": lastValidOro,
        "riesgo_pais": lastValidEMBI,
        "inflacion": lastValidInf,
        "intervencion": 0 // Estimado abajo
      });
    });
    
    // Estimar dinámicamente las intervenciones spot del BCRP
    for (let i = 1; i < mappedHistorico.length; i++) {
      const prev = mappedHistorico[i - 1];
      const curr = mappedHistorico[i];
      const tcDiff = curr.tipo_cambio - prev.tipo_cambio;
      const rinDiff = curr.rin - prev.rin;
      
      if (tcDiff > 0.012 && rinDiff < -30) {
        curr.intervencion = -80; // Venta para frenar devaluación del Sol
      } else if (tcDiff < -0.012 && rinDiff > 30) {
        curr.intervencion = 60;  // Compra para acumular reservas
      }
    }
    
    // 5. Sobrescribir el histórico en la estructura de datos
    dashboardData.historico = mappedHistorico;
    
    // 6. Actualizar indicadores actuales basándose en el último registro del histórico
    const latest = mappedHistorico[mappedHistorico.length - 1];
    const prev = mappedHistorico.length > 1 ? mappedHistorico[mappedHistorico.length - 2] : latest;

    dashboardData.indicadores_actuales.tipo_cambio = {
      valor: latest.tipo_cambio,
      cambio_porcentaje: parseFloat((((latest.tipo_cambio - prev.tipo_cambio) / prev.tipo_cambio) * 100).toFixed(2)),
      tendencia: "estable",
      fecha: latest.fecha
    };
    
    dashboardData.indicadores_actuales.rin = {
      valor: latest.rin,
      cambio_anual_m: 1280,
      meta_seguridad_pbi: 27.5,
      fecha: latest.fecha
    };

    dashboardData.indicadores_actuales.riesgo_pais = {
      valor: latest.riesgo_pais,
      cambio_bps: latest.riesgo_pais - prev.riesgo_pais,
      promedio_latam: 320,
      fecha: latest.fecha
    };

    dashboardData.indicadores_actuales.inflacion = {
      valor: latest.inflacion,
      cambio_porcentaje: 0.05,
      tendencia: latest.inflacion >= 1.0 && latest.inflacion <= 3.0 ? "dentro_rango" : "monitoreo",
      fecha: latest.fecha
    };

    // Nuevos Indicadores: Tasas y Commodities
    const diffTasa = parseFloat((latest.tasa_bcrp - latest.tasa_usd).toFixed(2));
    dashboardData.indicadores_actuales.tasa_interes_bcrp = {
      valor: latest.tasa_bcrp,
      tasa_usd: latest.tasa_usd,
      diferencial_carry: diffTasa,
      descripcion: diffTasa > 0 ? "Premio positivo por mantener Soles (Carry Trade)" : "Presión por diferencial estrecho",
      fecha: latest.fecha
    };

    const cobrePct = parseFloat((((latest.cobre - prev.cobre) / prev.cobre) * 100).toFixed(2));
    dashboardData.indicadores_actuales.cobre_precio = {
      valor: latest.cobre,
      unidad: "cUS$/lb",
      cambio_porcentaje: isNaN(cobrePct) ? 0 : cobrePct,
      fecha: latest.fecha
    };

    const oroPct = parseFloat((((latest.oro - prev.oro) / prev.oro) * 100).toFixed(2));
    dashboardData.indicadores_actuales.oro_precio = {
      valor: latest.oro,
      unidad: "US$/oz",
      cambio_porcentaje: isNaN(oroPct) ? 0 : oroPct,
      fecha: latest.fecha
    };

    // 7. Calcular el Índice de Fortaleza del Sol (Score Sintético 0 - 100)
    // Pilar 1: RIN (% PBI estimado en ~$264B) -> Máx 30 pts
    const rinPctPbi = (latest.rin / 2640);
    const pilarRIN = Math.min(30, Math.max(10, (rinPctPbi / 28) * 30));

    // Pilar 2: Inflación vs Rango Meta (1% - 3%) -> Máx 25 pts
    let pilarInf = 25;
    if (latest.inflacion > 3.0) {
      pilarInf = Math.max(5, 25 - (latest.inflacion - 3.0) * 7);
    } else if (latest.inflacion < 1.0) {
      pilarInf = Math.max(5, 25 - (1.0 - latest.inflacion) * 10);
    }

    // Pilar 3: Riesgo Soberano EMBI+ (Perú vs promedio 320 bps) -> Máx 25 pts
    let pilarEMBI = 25;
    if (latest.riesgo_pais > 120) {
      pilarEMBI = Math.max(5, 25 - ((latest.riesgo_pais - 120) / 100) * 10);
    }

    // Pilar 4: Política Monetaria & Commodities (Carry + Cobre) -> Máx 20 pts
    const pilarCarry = diffTasa >= 0.5 ? 10 : (diffTasa >= 0 ? 8 : 4);
    const pilarCobre = latest.cobre >= 400 ? 10 : (latest.cobre >= 350 ? 7 : 4);
    const pilarMotor = pilarCarry + pilarCobre;

    const totalScore = Math.min(100, Math.max(10, Math.round(pilarRIN + pilarInf + pilarEMBI + pilarMotor)));
    
    let estadoFortaleza = "Solidez Extrema";
    let colorFortaleza = "emerald";
    if (totalScore < 50) {
      estadoFortaleza = "Alerta de Tensión";
      colorFortaleza = "red";
    } else if (totalScore < 70) {
      estadoFortaleza = "Monitoreo Cauteloso";
      colorFortaleza = "orange";
    } else if (totalScore < 85) {
      estadoFortaleza = "Estabilidad Sostenida";
      colorFortaleza = "blue";
    }

    dashboardData.indicadores_actuales.indice_fortaleza = {
      score: totalScore,
      estado: estadoFortaleza,
      color: colorFortaleza,
      pilares: {
        reservas_pts: Math.round(pilarRIN),
        inflacion_pts: Math.round(pilarInf),
        riesgo_soberano_pts: Math.round(pilarEMBI),
        politica_commodities_pts: Math.round(pilarMotor)
      },
      fecha: latest.fecha
    };

    // Actualizar metadatos
    dashboardData.metadata.fecha_actualizacion = todayStr;
    dashboardData.metadata.fuente = "Banco Central de Reserva del Perú (BCRPData) - Actualizado Automático";
    dashboardData.metadata.series = {
      tipo_cambio: "PD04638PD",
      rin: "PD04650MD",
      tasa_bcrp: "PD04692MD",
      tasa_usd: "PD04693MD",
      cobre: "PD04701XD",
      oro: "PD04704XD",
      riesgo_pais: "PD04709XD",
      inflacion: "PN01273PM"
    };
    
    // 8. Guardar de vuelta en datos_dashboard.json
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(dashboardData, null, 2), 'utf8');
    console.log(`datos_dashboard.json actualizado con éxito. Score de Fortaleza: ${totalScore}/100 (${estadoFortaleza})`);
    
  } catch (error) {
    console.error(`Error durante el mapeo de datos o la escritura del archivo: ${error.message}`);
    process.exit(1);
  }
}

main();
