import { getGoogleAccessToken } from './google-auth';

const SPREADSHEET_ID = process.env.GCP_SPREADSHEET_ID;

export async function getSheetData(range) {
  const token = await getGoogleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet data: ${data.error?.message || 'Unknown error'}`);
  }

  // Convert rows to objects if desired
  const values = data.values;
  if (!values || values.length === 0) return [];

  const headers = values[0];
  const rows = values.slice(1);

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    return obj;
  });
}

export async function appendSheetRow(range, rowValues) {
  const token = await getGoogleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowValues],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to append row: ${data.error?.message || 'Unknown error'}`);
  }

  return data;
}

export async function updateSheetRows(range, values) {
  const token = await getGoogleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to update rows: ${data.error?.message || 'Unknown error'}`);
  }

  return data;
}

export async function batchUpdate(data) {
  const token = await getGoogleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: data, // Array of { range, values }
    }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed batch update: ${resData.error?.message || 'Unknown error'}`);
  }

  return resData;
}

export async function getFullSheet(sheetName) {
  const token = await getGoogleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A1:Z`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to fetch full sheet: ${data.error?.message || 'Unknown error'}`);
  }

  return data.values || [];
}
