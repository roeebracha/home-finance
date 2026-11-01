function sheetError(message) {
  const error = new Error(message);
  error.code = "SHEET_INVALID";
  return error;
}

module.exports = { sheetError };
