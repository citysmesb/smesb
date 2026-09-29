import * as L from 'leaflet';
import * as XLSX from 'xlsx';

// Initialize Map
// Centered on Bangladesh
const map = L.map('map', {
  zoomControl: false // Move zoom control to bottom right
}).setView([23.6850, 90.3563], 7);

const markersGroup = L.layerGroup().addTo(map);


// Set a clean map background without any tile layer noise
document.getElementById('map').style.backgroundColor = '#ffffff';

// Bangla District Mapping
const districtBn = {
  'Bagerhat': 'বাগেরহাট', 'Bandarban': 'বান্দরবান', 'Barguna': 'বরগুনা', 'Barisal': 'বরিশাল',
  'Bhola': 'ভোলা', 'Bogra': 'বগুড়া', 'Brahamanbaria': 'ব্রাহ্মণবাড়িয়া', 'Chandpur': 'চাঁদপুর',
  'Chittagong': 'চট্টগ্রাম', 'Chuadanga': 'চুয়াডাঙ্গা', 'Comilla': 'কুমিল্লা', "Cox's Bazar": 'কক্সবাজার',
  'Dhaka': 'ঢাকা', 'Dinajpur': 'দিনাজপুর', 'Faridpur': 'ফরিদপুর', 'Feni': 'ফেনী',
  'Gaibandha': 'গাইবান্ধা', 'Gazipur': 'গাজীপুর', 'Gopalganj': 'গোপালগঞ্জ', 'Habiganj': 'হবিগঞ্জ',
  'Jamalpur': 'জামালপুর', 'Jessore': 'যশোর', 'Jhalokati': 'ঝালকাঠি', 'Jhenaidah': 'ঝিনাইদহ',
  'Joypurhat': 'জয়পুরহাট', 'Khagrachhari': 'খাগড়াছড়ি', 'Khulna': 'খুলনা', 'Kishoreganj': 'কিশোরগঞ্জ',
  'Kurigram': 'কুড়িগ্রাম', 'Kushtia': 'কুষ্টিয়া', 'Lakshmipur': 'লক্ষ্মীপুর', 'Lalmonirhat': 'লালমনিরহাট',
  'Madaripur': 'মাদারীপুর', 'Magura': 'মাগুরা', 'Manikganj': 'মানিকগঞ্জ', 'Maulvibazar': 'মৌলভীবাজার',
  'Meherpur': 'মেহেরপুর', 'Munshiganj': 'মুন্সীগঞ্জ', 'Mymensingh': 'ময়মনসিংহ', 'Naogaon': 'নওগাঁ',
  'Narail': 'নড়াইল', 'Narayanganj': 'নারায়ণগঞ্জ', 'Narsingdi': 'নরসিংদী', 'Natore': 'নাটোর',
  'Nawabganj': 'নবাবগঞ্জ', 'Netrakona': 'নেত্রকোণা', 'Nilphamari': 'নীলফামারী', 'Noakhali': 'নোয়াখালী',
  'Pabna': 'পাবনা', 'Panchagarh': 'পঞ্চগড়', 'Patuakhali': 'পটুয়াখালী', 'Pirojpur': 'পিরোজপুর',
  'Rajbari': 'রাজবাড়ী', 'Rajshahi': 'রাজশাহী', 'Rangamati': 'রাঙ্গামাটি', 'Rangpur': 'রংপুর',
  'Satkhira': 'সাতক্ষীরা', 'Shariatpur': 'শরীয়তপুর', 'Sherpur': 'শেরপুর', 'Sirajganj': 'সিরাজগঞ্জ',
  'Sunamganj': 'সুনামগঞ্জ', 'Sylhet': 'সিলেট', 'Tangail': 'টাঙ্গাইল', 'Thakurgaon': 'ঠাকুরগাঁও'
};

// Dynamic district border weight scaling to keep lines crisp and hairline thin
const updateBorderWeights = (z) => {
    const districtWeight = Math.max(0.1, Math.min(0.4, 0.15 + (z - 6) * 0.05));
    if (districtLayer) {
        districtLayer.setStyle({ weight: districtWeight });
    }
};

let districtLayer = null;

fetch('./bd-districts.geojson')
  .then(res => res.json())
  .then(data => {
      districtLayer = L.geoJSON(data, {
          style: {
              color: '#cbd5e1', // Light slate grey district separators
              weight: 0.25,     // Hairline border stroke
              fillColor: 'var(--land-fill)', // Clean white landmass
              fillOpacity: 1
          },
          interactive: false,
      }).addTo(map);

      map.fitBounds(districtLayer.getBounds(), { padding: [20, 20], maxZoom: 9 });

      // Render custom geographic labels using Turf centerOfMass for perfect placement inside district borders
      districtLayer.eachLayer(layer => {
          const feature = layer.feature;
          const engName = feature.properties.shapeName || feature.properties.name || feature.properties.ADM2_EN || "";
          const bnName = districtBn[engName] || engName;
          
          if (bnName) {
              let centerLatLng;
              
              try {
                  if (typeof turf !== 'undefined') {
                      const centerPoint = turf.centerOfMass(feature);
                      centerLatLng = L.latLng(centerPoint.geometry.coordinates[1], centerPoint.geometry.coordinates[0]);
                  }
              } catch (e) {
                  console.warn("Turf failed for", engName, e);
              }
              
              if (!centerLatLng) {
                  centerLatLng = layer.getBounds().getCenter();
              }
              
              L.tooltip({
                  permanent: true,
                  direction: "center",
                  className: "district-label"
              })
              .setLatLng(centerLatLng)
              .setContent(bnName)
              .addTo(map);
          }
      });
      
      if (currentMapData && currentMapData.length > 0) {
          renderMarkers();
      }
  })
  .catch(err => console.error("Could not load districts: ", err));

// DOM Elements
const fileUpload = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const errorMsg = document.getElementById('error-msg');
const statLocations = document.getElementById('stat-locations');
const statExcellent = document.getElementById('stat-excellent');
const statGood = document.getElementById('stat-good');
const statPoor = document.getElementById('stat-poor');
const toggleBtn = document.getElementById('toggle-panel-btn');
const controlPanel = document.getElementById('control-panel');
const zoomInput = document.getElementById('zoom-level');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const legendPanel = document.getElementById('legend-panel');
const toggleLegendBtn = document.getElementById('toggle-legend-btn');
const toggleStatsBtn = document.getElementById('toggle-stats-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const backToNationalBtn = document.getElementById('back-to-national-btn');
const customZoomContainer = document.querySelector('.custom-zoom-control');

// Prevent leaflet from swallowing clicks on custom controls
L.DomEvent.disableClickPropagation(customZoomContainer);
L.DomEvent.disableClickPropagation(themeToggleBtn);
L.DomEvent.disableClickPropagation(legendPanel);
L.DomEvent.disableClickPropagation(controlPanel);
const statsPanel = document.getElementById('stats-container');
L.DomEvent.disableClickPropagation(statsPanel);

// Zoom Control Logic
zoomInput.addEventListener('change', (e) => {
    let val = parseInt(e.target.value);
    if(val >= 1 && val <= 20) {
        map.setZoom(val);
    }
});

zoomInBtn.addEventListener('click', () => map.zoomIn());
zoomOutBtn.addEventListener('click', () => map.zoomOut());

map.on('zoomend', () => {
    const currentZoom = map.getZoom();
    zoomInput.value = currentZoom;
    
    // Dynamic Scale for fonts (min 0.8, max 1.5)
    let scale = 1 + (currentZoom - 7) * 0.25;
    scale = Math.max(0.6, Math.min(2.5, scale));
    document.documentElement.style.setProperty('--dynamic-scale', scale);
    updateBorderWeights(currentZoom);
});

// Theme Toggle Logic
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('theme-icon-sun').classList.toggle('hidden');
    document.getElementById('theme-icon-moon').classList.toggle('hidden');
});

// PDF Export Logic
const exportPdfBtn = document.getElementById('export-pdf-btn');
if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', () => {
      // Physically hide controls to ensure they aren't captured
      controlPanel.style.display = 'none';
      customZoomContainer.style.display = 'none';
      themeToggleBtn.style.display = 'none';
      
      // Store current view
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();
      
      // Prevent blank page bug with overflow: hidden
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'visible';
      
      // Zoom out to fit Bangladesh perfectly in the natural viewport (instantly)
      if (typeof boundaryLayer !== 'undefined' && boundaryLayer) {
          map.fitBounds(boundaryLayer.getBounds(), { padding: [30, 30], animate: false });
      }
      
      // Wait for Leaflet to finalize its immediate SVG render
      setTimeout(() => {
          const appContainer = document.getElementById('app-container');
          
          // Use html-to-image for flawless SVG and transform capture
          htmlToImage.toJpeg(appContainer, {
              quality: 0.9,
              pixelRatio: 2, // 2x high-resolution multiplier
              backgroundColor: '#f8fafc' // Solid background
          }).then(imgData => {
              // Restore UI
              controlPanel.style.display = '';
              customZoomContainer.style.display = '';
              themeToggleBtn.style.display = '';
              document.body.style.overflow = origOverflow;
              map.setView(currentCenter, currentZoom);
              
              // Calculate PDF scaling (A3 Landscape is 420x297 mm)
              const pdf = new jspdf.jsPDF({
                  orientation: 'landscape',
                  unit: 'mm',
                  format: 'a3'
              });
              
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              
              const canvasWidth = appContainer.clientWidth * 2;
              const canvasHeight = appContainer.clientHeight * 2;
              
              // Calculate perfect aspect ratio to fit inside A3 without cropping
              const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
              const renderWidth = canvasWidth * ratio;
              const renderHeight = canvasHeight * ratio;
              
              // Perfectly center the image on the PDF page
              const xOffset = (pdfWidth - renderWidth) / 2;
              const yOffset = (pdfHeight - renderHeight) / 2;
              
              pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderWidth, renderHeight);
              pdf.save('SME_Location_Map_Export.pdf');
              
          }).catch(err => {
              console.error("PDF Export failed", err);
              controlPanel.style.display = '';
              customZoomContainer.style.display = '';
              themeToggleBtn.style.display = '';
              document.body.style.overflow = origOverflow;
              map.setView(currentCenter, currentZoom);
          });
      }, 1500); // 1.5s delay to ensure all DOM mutations have settled
  });
}

// Legend Checkbox Listeners
document.querySelectorAll('.legend-filter').forEach(cb => {
    cb.addEventListener('change', () => {
        // Prevent map clicks from firing when clicking checkboxes
        renderMarkers();
    });
});

// Toggle Legend Logic
toggleLegendBtn.addEventListener('click', () => {
    legendPanel.classList.toggle('collapsed');
    toggleLegendBtn.classList.toggle('rotated');
});

// Toggle Stats Logic
if (toggleStatsBtn) {
    toggleStatsBtn.addEventListener('click', () => {
        statsPanel.classList.toggle('collapsed');
        toggleStatsBtn.classList.toggle('rotated');
    });
}

// Toggle Panel Logic
toggleBtn.addEventListener('click', () => {
  controlPanel.classList.toggle('collapsed');
  toggleBtn.classList.toggle('rotated');
});

// Handle File Upload
fileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  fileNameDisplay.textContent = file.name;
  errorMsg.style.display = 'none';

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const summarySheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'summary') || workbook.SheetNames[0];
      const detailsSheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'details');
      
      const summarySheet = workbook.Sheets[summarySheetName];
      const summaryJson = XLSX.utils.sheet_to_json(summarySheet, { defval: "" });
      
      let detailsJson = [];
      if (detailsSheetName) {
        detailsJson = XLSX.utils.sheet_to_json(workbook.Sheets[detailsSheetName], { defval: "" });
      }
      
      const payload = { summary: summaryJson, details: detailsJson, fileName: file.name, timestamp: new Date().getTime() };
      
      if (summaryJson.length > 0) {
        try {
          localStorage.setItem('sms_saved_map_data', JSON.stringify(payload));
        } catch (err) {
          console.warn('Failed to save to localStorage:', err);
        }
        processData(payload);
        
        // Save the parsed JSON to our Vite backend
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(res => res.json())
          .then(data => console.log('Data saved to local json file'))
          .catch(err => console.error('Failed to save data:', err));

      } else {
        showError('The uploaded file is empty or contains no valid data.');
      }
        
    } catch (err) {
      console.error(err);
      showError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
    }
  };
  reader.readAsArrayBuffer(file);
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
  statsPanel.style.display = 'none';
}

// Global utility function for column matching
const getCol = (row, possibleNames) => {
  const key = Object.keys(row).find(k => possibleNames.some(name => k.toLowerCase().includes(name.toLowerCase())));
  return key ? row[key] : "";
};

let currentMapData = []; // Store parsed excel summary globally
let currentDetailsData = []; // Store parsed excel details globally

function processData(data) {
  if (Array.isArray(data)) {
    // Legacy support: if the data is just an array, it's the summary
    currentMapData = data;
    currentDetailsData = [];
  } else {
    currentMapData = data.summary || [];
    currentDetailsData = data.details || [];
  }
  renderMarkers();
}

function renderMarkers() {
  markersGroup.clearLayers();
  let validCount = 0;
  let countExcellent = 0;
  let countGood = 0;
  let countPoor = 0;

  // Get active legend filters
  const activeFilters = Array.from(document.querySelectorAll('.legend-filter'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);

  // Find which districts have data to color them indigo
  const districtsWithData = new Set();
  const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = {
      "chattogram": "chittagong", "barishal": "barisal", "bogura": "bogra",
      "cumilla": "comilla", "jashore": "jessore", "chapainawabganj": "nawabganj",
      "brahmanbaria": "brahamanbaria", "moulvibazar": "maulvibazar"
  };
  
  currentMapData.forEach(row => {
      let loc = getCol(row, ['location', 'district', 'upazila']);
      if (loc) {
          let cleaned = clean(loc);
          if (aliases[cleaned]) cleaned = aliases[cleaned];
          districtsWithData.add(cleaned);
      }
  });

  if (districtLayer) {
      districtLayer.eachLayer(l => {
          const engName = l.feature.properties.shapeName || l.feature.properties.name || l.feature.properties.ADM2_EN || "";
          let cleanedEng = clean(engName);
          if (aliases[cleanedEng]) cleanedEng = aliases[cleanedEng];
          
          const bnName = districtBn[engName] || engName;
          
          if (districtsWithData.has(cleanedEng)) {
              l.setTooltipContent(`<div style="color: #4338ca; font-weight: 800; font-size: calc(0.7rem * var(--dynamic-scale, 1)); text-shadow: 0 0 6px #fff, 0 0 3px #fff;">${bnName}</div>`);
          } else {
              l.setTooltipContent(`<div style="color: #64748b; font-weight: 500; font-size: calc(0.6rem * var(--dynamic-scale, 1)); text-shadow: 0 0 3px #fff;">${bnName}</div>`);
          }
      });
  }

  currentMapData.forEach(row => {
    // Extract lat and long
    const latRaw = getCol(row, ['lat', 'latitude']);
    const lngRaw = getCol(row, ['long', 'longitude', 'lng']);
    
    const lat = parseFloat(latRaw);
    const lng = parseFloat(lngRaw);

    if (isNaN(lat) || isNaN(lng)) return; // Skip invalid coordinates

    // Extract other fields based on requested column names
    const locationName = getCol(row, ['location', 'district', 'upazila']);
    const empId = getCol(row, ['employee id', 'emp id']);
    const officerName = getCol(row, ['officer name', 'name', 'person']);
    const designation = getCol(row, ['designation', 'desig']);
    const portfolio = getCol(row, ['portfolio']);
    const mobile = getCol(row, ['mobile', 'phone']);
    
    const targetRaw = getCol(row, ['target', 'target participant']);
    const target = parseInt(targetRaw) || 0;
    
    const achievedRaw = getCol(row, ['achievement', 'achieved', 'achieved participant']);
    const achieved = parseInt(achievedRaw) || 0;
    
    // Count Number of Files from currentDetailsData
    let fileCount = 0;
    if (empId) {
      fileCount = currentDetailsData.filter(d => {
        let dEmpId = getCol(d, ['employee id', 'emp id']);
        return String(dEmpId).trim() === String(empId).trim();
      }).length;
    }
    
    // Grab raw productivity and safely parse/round it
    const productivityRaw = getCol(row, ['productivity', 'productvity', 'prod']);
    let prodStr = String(productivityRaw).replace(/[^0-9.]/g, ''); // Remove %, letters, etc.
    let productivity = prodStr ? parseFloat(prodStr) : 0;
    
    // Fix for Excel percentage format (e.g. 65% is read as 0.65)
    if (productivity > 0 && productivity <= 1.0) {
        productivity = productivity * 100;
    }
    productivity = Math.round(productivity);

    // Determine Color based on Productivity
    // < 50: Poor (Red)
    // < 60: Good (Yellow)
    // >= 60: Excellent (Green)
    let colorCode = '#ef4444'; // Red (Poor)
    let statusText = 'Poor';
    if (productivity >= 60) {
        colorCode = '#22c55e'; // Green (Excellent)
        statusText = 'Excellent';
    } else if (productivity >= 50) {
        colorCode = '#eab308'; // Yellow (Good)
        statusText = 'Good';
    }

    // Check if this marker should be rendered based on legend filters
    if (!activeFilters.includes(statusText)) return;

    // Progress percentage
    const progress = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

    // Create Custom HTML Marker with exact color (Reduced size)
    const customIcon = L.divIcon({
      className: 'custom-marker-wrapper',
      html: `<div class="custom-marker" style="background-color: ${colorCode}; box-shadow: 0 0 8px ${colorCode};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6]
    });

    // HTML for the slick popup
    const popupHTML = `
      <div class="popup-content">
        <h3>${locationName || 'Unknown Location'}</h3>
        <p><strong>Name & Designation</strong> <span style="text-align: right;">${officerName || '-'}${designation ? ` (${designation})` : ''}</span></p>
        <p><strong>Mobile</strong> <span>${mobile || '-'}</span></p>
        <p><strong>Portfolio</strong> <span>${portfolio || '-'}</span></p>
        <p><strong>Productivity</strong> <span style="color: ${colorCode}; font-weight: 700;">${productivity}% (${statusText})</span></p>
        <p><strong>Number of files/AC</strong> <span><a href="javascript:void(0)" class="details-link" data-empid="${empId}" style="color: #3b82f6; font-weight: 700; text-decoration: underline;">${fileCount}</a></span></p>
        
        <div class="progress-container">
          <div class="progress-bar-bg" style="width: 100%; height: 100%; position: relative;">
            <div class="progress-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; width: ${progress}%; background: ${colorCode}; border-radius: 6px;"></div>
            <div style="position: absolute; width: 100%; text-align: center; top: -16px; font-size: 0.75rem; color: var(--text-secondary);">Target: ${achieved}/${target}</div>
          </div>
        </div>
      </div>
    `;

    // Create Marker
    const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupHTML);
    marker.status = statusText;
    marker.addTo(markersGroup);
    validCount++;
    
    if (statusText === 'Excellent') countExcellent++;
    else if (statusText === 'Good') countGood++;
    else if (statusText === 'Poor') countPoor++;
  });

  // Update Stats UI
  const totalROEl = document.getElementById('total-ro');
  if (totalROEl) totalROEl.textContent = validCount;
  
  if (validCount === 0) {
    showError("No valid locations found. Please ensure 'Lat' and 'Long' columns exist and contain numbers.");
  } else {
    statsPanel.style.display = 'flex';
    statLocations.textContent = validCount;
    statExcellent.textContent = countExcellent;
    statGood.textContent = countGood;
    statPoor.textContent = countPoor;
    
    // Fit bounds if we have points
    if (markersGroup.getLayers().length > 0) {
      const group = new L.featureGroup(markersGroup.getLayers());
      map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 10 });
    }
  }
}

// Check for saved data on startup
window.addEventListener('DOMContentLoaded', () => {
    const localSaved = localStorage.getItem('sms_saved_map_data');
    if (localSaved) {
        try {
            const parsed = JSON.parse(localSaved);
            if (parsed && (parsed.length > 0 || (parsed.summary && parsed.summary.length > 0))) {
                if (parsed.fileName && fileNameDisplay) {
                    fileNameDisplay.textContent = parsed.fileName;
                }
                processData(parsed);
                console.log('Loaded saved map data from localStorage.');
                return;
            }
        } catch (e) {
            console.warn('Failed to load map data from localStorage:', e);
        }
    }

    // Add cache-busting timestamp to avoid stale reads
    fetch('/saved_map_data.json?t=' + new Date().getTime())
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('No saved data found.');
        })
        .then(data => {
            if (data && (data.length > 0 || (data.summary && data.summary.length > 0))) {
                processData(data);
                console.log('Loaded saved map data automatically.');
            }
        })
        .catch(err => {
            console.log('No saved data available. Waiting for manual upload.');
        });
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.id === 'details-modal') {
      window.closeDetailsModal();
  }
});

// Setup Event Listener for popup hyperlinks using Leaflet's popupopen event
map.on('popupopen', function(e) {
  const popupNode = e.popup._contentNode;
  if (!popupNode) return;
  
  const link = popupNode.querySelector('.details-link');
  if (link) {
    link.addEventListener('click', function(ev) {
      ev.preventDefault();
      const empId = this.getAttribute('data-empid');
      if (empId && window.showDetailsModal) {
        window.showDetailsModal(empId);
      }
    });
  }
});

// Modal Logic
window.showDetailsModal = function(empId) {
  console.log("showDetailsModal called with empId:", empId);
  const modal = document.getElementById('details-modal');
  const tableBody = document.getElementById('details-table-body');
  const title = document.getElementById('details-modal-title');
  
  if (!modal || !tableBody) {
    console.error("Modal DOM elements not found!");
    return;
  }
  
  // Filter details data
  const empDetails = currentDetailsData.filter(d => {
    let dEmpId = getCol(d, ['employee id', 'emp id']);
    return String(dEmpId).trim() === String(empId).trim();
  });
  
  console.log("Filtered empDetails length:", empDetails.length);
  
  title.textContent = `Loan Details for Employee: ${empId}`;
  tableBody.innerHTML = '';
  
  if (empDetails.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 20px;">No detailed records found for this employee.</td></tr>';
  } else {
    empDetails.forEach(d => {
      const custId = getCol(d, ['cust_id', 'cust id', 'customer id', 'customer']) || '-';
      const ac = getCol(d, ['ac', 'a/c', 'account']) || '-';
      
      const disbAmtRaw = getCol(d, ['disb_amt', 'disb amt', 'disbursement amount', 'disbursed']);
      const disbAmt = disbAmtRaw ? Number(disbAmtRaw).toLocaleString('en-US', { style: 'currency', currency: 'BDT' }) : '-';
      
      let disbDateRaw = getCol(d, ['disb_date', 'disb date', 'disbursement date', 'date']);
      let disbDate = '-';
      if (disbDateRaw) {
        if (typeof disbDateRaw === 'number') {
          // Excel serial date to JS Date
          const dateObj = new Date(Math.round((disbDateRaw - 25569) * 86400 * 1000));
          disbDate = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
        } else {
          disbDate = disbDateRaw;
        }
      }
      
      const balanceRaw = getCol(d, ['balance', 'outstanding']);
      const balance = balanceRaw ? Number(balanceRaw).toLocaleString('en-US', { style: 'currency', currency: 'BDT' }) : '-';
      
      const bArea = getCol(d, ['business area', 'area']) || '-';
      const territory = getCol(d, ['territory']) || '-';
      const region = getCol(d, ['region']) || '-';
      const zone = getCol(d, ['zone']) || '-';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${custId}</td>
        <td>${ac}</td>
        <td>${disbAmt}</td>
        <td>${disbDate}</td>
        <td><strong style="color: #3b82f6;">${balance}</strong></td>
        <td>${empId}</td>
        <td>${bArea}</td>
        <td>${territory}</td>
        <td>${region}</td>
        <td>${zone}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
  
  // Show Modal
  modal.classList.add('active');
};

window.closeDetailsModal = function() {
  const modal = document.getElementById('details-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};
