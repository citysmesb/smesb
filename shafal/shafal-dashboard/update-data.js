const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Configuration
const EXCEL_PATH = path.join(__dirname, '..', 'indicator reporting', 'Shafal Project - Results Framework.xlsx');
const BENEFICIARY_DIR = path.join(__dirname, '..', 'Beneficiary List');
const DFL_DATA_PATH = path.join(BENEFICIARY_DIR, 'DFL Indicator Progress Data (Participant List).xlsx');
const DFS_DATA_PATH = path.join(BENEFICIARY_DIR, 'DFS Indicator Progress Data (Participant List).xlsx');

const OUTPUT_JSON_PATH = path.join(__dirname, 'public', 'data', 'dashboard-data.json');
const BENEFICIARY_JSON_PATH = path.join(__dirname, 'public', 'data', 'beneficiaries.json');
const GEOJSON_SRC = path.join(__dirname, '..', 'Location Based Map Apps', 'bd-districts.geojson');
const GEOJSON_DEST = path.join(__dirname, 'public', 'data', 'bd-districts.json');

console.log("Starting static data generation (Phase 4)...");

// 1. Process Results Framework for exact string indicators
console.log("Parsing Results Framework...");
const wb = xlsx.readFile(EXCEL_PATH);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

let headerRowIdx = -1;
for (let i = 0; i < data.length; i++) {
    if (data[i] && (data[i].includes('Indicator Number') || data[i].includes('Component'))) {
        headerRowIdx = i;
        break;
    }
}

if (headerRowIdx === -1) {
    console.error("Could not find header row in Results Framework.");
    process.exit(1);
}

const headers = data[headerRowIdx];
const compIdx = headers.indexOf('Component');
const indNumIdx = headers.indexOf('Indicator Number');
const indDescIdx = headers.indexOf('Indicator Description');
const indTargetIdx = headers.indexOf('Target');
const indResultIdx = headers.indexOf('Actual Result');

const indicators = [];
for (let i = headerRowIdx + 1; i < data.length; i++) {
    const row = data[i];
    if (row && row[compIdx]) {
        const component = row[compIdx].toString().trim();
        if (component !== 'DFL' && component !== 'DFS') continue;
        
        indicators.push({
            id: component + ' - ' + row[indNumIdx].toString().trim().replace('Indicator ', ''),
            component: component,
            number: row[indNumIdx] ? row[indNumIdx].toString().trim() : '',
            description: row[indDescIdx] ? row[indDescIdx].toString().trim() : '',
            target_str: row[indTargetIdx] ? row[indTargetIdx].toString().trim() : '',
            actual_str: row[indResultIdx] ? row[indResultIdx].toString().trim() : '',
        });
    }
}

// 2. Process Beneficiary Data (For Map stats and Data Table)
console.log("Parsing Beneficiary Lists...");
const parseGender = (val) => {
    if (!val) return 'Unknown';
    const s = val.toString().trim().toUpperCase();
    if (s === 'F' || s === 'FEMALE') return 'Female';
    if (s === 'M' || s === 'MALE') return 'Male';
    return 'Other';
};

const beneficiaries = [];

if (fs.existsSync(DFL_DATA_PATH)) {
    const wbDfl = xlsx.readFile(DFL_DATA_PATH);
    const sheetData = xlsx.utils.sheet_to_json(wbDfl.Sheets['Full List']);
    sheetData.forEach(row => {
        if (!row['Acct Name']) return;
        beneficiaries.push({
            component: 'DFL',
            indicator: 'N/A', // Full List doesn't specify indicator
            name: row['Acct Name'],
            phone: row['Phone'] ? row['Phone'].toString() : null,
            gender: parseGender(row['Gender']),
            district: row['District'] ? row['District'].trim() : 'Unknown',
            source: row['Source'] || ''
        });
    });
}

if (fs.existsSync(DFS_DATA_PATH)) {
    const wbDfs = xlsx.readFile(DFS_DATA_PATH);
    const sheetData = xlsx.utils.sheet_to_json(wbDfs.Sheets['Full List']);
    sheetData.forEach(row => {
        if (!row['Acct Name']) return;
        beneficiaries.push({
            component: 'DFS',
            indicator: 'N/A', // Full List doesn't specify indicator
            name: row['Acct Name'],
            phone: row['Phone'] ? row['Phone'].toString() : null,
            gender: parseGender(row['Gender']),
            district: row['District'] ? row['District'].trim() : 'Unknown',
            source: row['Source'] || ''
        });
    });
}

// 3. Pre-calculate district stats for map performance
console.log("Pre-calculating district statistics...");
const districtStats = {};
let dflReached = 0, dfsReached = 0;
let dflFemale = 0, dfsFemale = 0;

beneficiaries.forEach(b => {
    const d = b.district;
    if (!districtStats[d]) {
        districtStats[d] = { bCount: 0, fCount: 0, dflCount: 0, dfsCount: 0, dflFCount: 0, dfsFCount: 0 };
    }
    districtStats[d].bCount++;
    if (b.gender === 'Female') districtStats[d].fCount++;
    if (b.component === 'DFL') {
        districtStats[d].dflCount++;
        dflReached++;
        if (b.gender === 'Female') {
            dflFemale++;
            districtStats[d].dflFCount++;
        }
    }
    if (b.component === 'DFS') {
        districtStats[d].dfsCount++;
        dfsReached++;
        if (b.gender === 'Female') {
            dfsFemale++;
            districtStats[d].dfsFCount++;
        }
    }
});

const globalStats = {
    dflTarget: 5000,
    dfsTarget: 5000,
    dflReached,
    dfsReached,
    dflFemale,
    dfsFemale
};

// 4. Save JSON decoupled
console.log("Saving data to static JSON files (Decoupled)...");
fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify({
    indicators,
    districtStats,
    globalStats
}, null, 2));

// Save beneficiaries payload separately so it doesn't block SSR
fs.writeFileSync(BENEFICIARY_JSON_PATH, JSON.stringify(beneficiaries));

// 5. Copy GeoJSON
if (fs.existsSync(GEOJSON_SRC)) {
    fs.copyFileSync(GEOJSON_SRC, GEOJSON_DEST);
    console.log("GeoJSON copied to public/data.");
}

console.log("Phase 4 Data generation complete! Architecture is now decoupled.");
