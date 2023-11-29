const fs = require('fs');
const { parse } = require('csv-parse');
const output = 'infoDict.js';
const csv = '../doc/PL_Bedroom.csv'

// Read the CSV file
const csvData = fs.readFileSync(csv, 'utf-8');

// Parse CSV data
parse(csvData, {
    columns: true,          // Treat the first row as headers
    skip_empty_lines: true, // Skip empty lines
}, (err, records) => {
    if (err) {
        console.error(err);
        return;
    }

    // Extract lines from csv, create object dictionaries
    const items = Object.fromEntries(records.map(item => 
        [item.Object, { subCat: item.SubCat, description: item.Description, links: item.Links }]
        ));

    // Write the JavaScript code directly to designated out file as dictionary
    fs.writeFileSync(output, 
        `var items = ${JSON.stringify(items, null, 2)};\n\nfunction getInfoDict(){ return items; }\n\nexport { getInfoDict };`);
});

