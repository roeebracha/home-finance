const { GoogleAuth } = require("google-auth-library");
const { sheetError } = require("./sheetError");
const {
  assertRowId,
  parseTransactions,
  parseSettings,
  parseActions,
  parseBalanceFinal,
} = require("./sheetParse");
const { assertAgorot } = require("./money");
const { applyPendingActions } = require("./overlay");
const { groupTransactions, spendAgorot, presentBalance } = require("./grouping");

const CACHE_TTL_MS = 45_000;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const RANGES = ["תנועות!A:K", "הגדרות!A:D", "פעולות!A:G", "balance_final"];

let cache = null;

function notConfigured(message) {
  const error = new Error(message);
  error.code = "SHEETS_NOT_CONFIGURED";
  return error;
}

function loadCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!raw || !String(raw).trim() || !sheetId || !String(sheetId).trim()) {
    throw notConfigured(
      "גיליון Google לא מוגדר. חסר GOOGLE_SERVICE_ACCOUNT_JSON או GOOGLE_SHEET_ID.",
    );
  }
  try {
    const credentials = JSON.parse(raw);
    if (!credentials || typeof credentials !== "object" || !credentials.client_email || !credentials.private_key) {
      throw new Error("missing fields");
    }
    return { credentials, sheetId: String(sheetId).trim() };
  } catch {
    throw notConfigured("GOOGLE_SERVICE_ACCOUNT_JSON אינו מפתח תקין של חשבון שירות.");
  }
}

function composeHousehold(grids) {
  const transactions = parseTransactions(grids.transactions);
  const settings = parseSettings(grids.settings);
  const actions = parseActions(grids.actions);
  const sheetBalanceAgorot = parseBalanceFinal(grids.balance);
  const applied = applyPendingActions(transactions, actions);
  const receipts = groupTransactions(applied.transactions);
  return {
    balanceAgorot: presentBalance(sheetBalanceAgorot, transactions, applied.transactions),
    sheetBalanceAgorot,
    pendingCount: applied.pendingCount,
    settings,
    transactions: applied.transactions,
    receipts,
    spendAgorot: spendAgorot(applied.transactions),
  };
}

async function fetchGrids(credentials, sheetId) {
  const params = new URLSearchParams();
  for (const range of RANGES) params.append("ranges", range);
  params.set("valueRenderOption", "UNFORMATTED_VALUE");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values:batchGet?${params}`;
  let response;
  try {
    const auth = new GoogleAuth({ credentials, scopes: SCOPES });
    const client = await auth.getClient();
    response = await client.request({ url });
  } catch {
    const wrapped = new Error("קריאת הגיליון נכשלה.");
    wrapped.code = "SHEETS_UPSTREAM";
    throw wrapped;
  }
  const ranges = response.data && response.data.valueRanges;
  if (!Array.isArray(ranges) || ranges.length !== RANGES.length) {
    throw sheetError("תשובת הגיליון חסרה אחד מהטווחים: תנועות, הגדרות, פעולות, balance_final.");
  }
  return {
    transactions: ranges[0].values || [],
    settings: ranges[1].values || [],
    actions: ranges[2].values || [],
    balance: ranges[3].values || [],
  };
}

async function readHousehold() {
  const now = Date.now();
  if (cache && now - cache.storedAt < CACHE_TTL_MS) return cache.payload;

  const { credentials, sheetId } = loadCredentials();
  const grids = await fetchGrids(credentials, sheetId);
  const picture = composeHousehold(grids);
  const payload = { ...picture, updatedAt: new Date(now).toISOString() };
  cache = { storedAt: now, payload };
  return payload;
}

function clearHouseholdCache() {
  cache = null;
}

module.exports = {
  readHousehold,
  composeHousehold,
  clearHouseholdCache,
  assertRowId,
  assertAgorot,
  CACHE_TTL_MS,
};
