/**
 * Económetro de Estabilidad Monetaria del Perú - update_data.js
 * Script backend automatizado para actualizar datos_dashboard.json consultando el API del BCRPData.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuración de rutas
const JSON_FILE_PATH = path.join(__dirname, 'datos_dashboard.json');

// Función auxiliar para realizar peticiones HTTP GET y retornar JSON
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
          resolve(JSON.parse(data));
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
  // Diarias:
  // PD04638PD: Tipo de cambio venta diario (interbancario)
  // PD04650MD: Reservas Internacionales Netas (RIN) diario
  // PD04709XD: Riesgo país EMBI+ diario
  const bcrpUrlDaily = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PD04638PD-PD04650MD-PD04709XD/json/${sixMonthsAgoStr}/${todayStr}/esp`;
  
  // Mensuales:
  // PN01273PM: Inflación doce meses mensual
  const bcrpUrlMonthly = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/PN01273PM/json/${sixMonthsAgoStr}/${todayStr}/esp`;

  // 3. Consultar la API del BCRP
  let bcrpDailyJson, bcrpMonthlyJson;
  try {
    console.log('Consultando API del BCRPData (Series Diarias)...');
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
    const mappedHistorico = [];
    
    // Inicializar persistencia de datos (carry-over) en caso de celdas "n/d"
    let lastValidTC = dashboardData.indicadores_actuales.tipo_cambio.valor;
    let lastValidRIN = dashboardData.indicadores_actuales.rin.valor;
    let lastValidEMBI = dashboardData.indicadores_actuales.riesgo_pais.valor;
    let lastValidInf = dashboardData.indicadores_actuales.inflacion.valor;
    
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
      // values[2] -> Riesgo País EMBI+ (PD04709XD)
      const rawTC = parseFloat(period.values[0]);
      const rawRIN = parseFloat(period.values[1]);
      const rawEMBI = parseFloat(period.values[2]);
      
      if (!isNaN(rawTC) && rawTC > 0) lastValidTC = rawTC;
      if (!isNaN(rawRIN) && rawRIN > 0) lastValidRIN = rawRIN;
      
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
    dashboardData.indicadores_actuales.tipo_cambio.valor = latest.tipo_cambio;
    dashboardData.indicadores_actuales.tipo_cambio.fecha = latest.fecha;
    
    dashboardData.indicadores_actuales.rin.valor = latest.rin;
    dashboardData.indicadores_actuales.riesgo_pais.valor = latest.riesgo_pais;
    dashboardData.indicadores_actuales.inflacion.valor = latest.inflacion;
    
    // Calcular variación diaria del tipo de cambio
    if (mappedHistorico.length > 1) {
      const prev = mappedHistorico[mappedHistorico.length - 2];
      const pct = ((latest.tipo_cambio - prev.tipo_cambio) / prev.tipo_cambio) * 100;
      dashboardData.indicadores_actuales.tipo_cambio.cambio_porcentaje = parseFloat(pct.toFixed(2));
    }
    
    // Actualizar metadatos
    dashboardData.metadata.fecha_actualizacion = todayStr;
    dashboardData.metadata.fuente = "Banco Central de Reserva del Perú (BCRPData) - Actualizado Automático";
    
    // 7. Guardar de vuelta en datos_dashboard.json
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(dashboardData, null, 2), 'utf8');
    console.log('datos_dashboard.json actualizado con éxito con los datos más recientes del BCRP.');
    
  } catch (error) {
    console.error(`Error durante el mapeo de datos o la escritura del archivo: ${error.message}`);
    process.exit(1);
  }
}

main();
