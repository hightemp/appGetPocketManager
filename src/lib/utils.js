
const fs = require('fs');

export function fnSaveToJSONFile(sFileName, mValue)
{
    fs.writeFileSync(sFileName, JSON.stringify(mValue, null, 4));
}