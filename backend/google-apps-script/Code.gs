/*
  Google Sheets backend for the Not KNOT SMP GitHub Pages site.

  Setup:
  1. Create a new Google Sheet.
  2. Go to Extensions > Apps Script.
  3. Paste this entire file into Code.gs.
  4. Change ADMIN_KEY below to a strong password/key.
  5. Deploy > New deployment > Web app.
  6. Execute as: Me. Who has access: Anyone.
  7. Copy the Web App /exec URL into config.js as appsScriptUrl.
*/

const SHEET_NAME = 'Responses';
const ADMIN_KEY = 'CHANGE_ME_TO_A_LONG_SECRET_KEY';

const HEADERS = [
  'Timestamp',
  'Name',
  'Email or Phone',
  'Discord',
  'Days',
  'Birthday',
  'No Griefing Agreement',
  'Application Video',
  'Minecraft IGN',
  'Minecraft Edition',
  'User Agent'
];

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    if (!data.name || !data.contact || !data.birthday || !data.video) {
      return output_({ ok: false, error: 'Missing required fields.' });
    }

    const sheet = getSheet_();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.contact || '',
      data.discord || '',
      Array.isArray(data.days) ? data.days.join(', ') : (data.days || ''),
      data.birthday || '',
      data.noGriefing || '',
      data.video || '',
      data.ign || '',
      data.edition || '',
      data.userAgent || ''
    ]);

    return output_({ ok: true });
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback || '';

  try {
    if (params.action !== 'list') {
      return output_({ ok: true, message: 'Not KNOT SMP backend is running.' }, callback);
    }

    if (params.key !== ADMIN_KEY) {
      return output_({ ok: false, error: 'Wrong admin key.' }, callback);
    }

    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1).reverse().map(row => ({
      timestamp: row[0],
      name: row[1],
      contact: row[2],
      discord: row[3],
      days: String(row[4] || '').split(/,\s*/).filter(Boolean),
      birthday: row[5],
      noGriefing: row[6],
      video: row[7],
      ign: row[8],
      edition: row[9]
    }));

    return output_({ ok: true, responses: rows }, callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeaders = firstRow.every(cell => cell === '');
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function output_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    const safeCallback = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
    return ContentService
      .createTextOutput(`${safeCallback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
