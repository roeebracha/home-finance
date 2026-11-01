const sheets = require("../services/sheets");

exports.household = async (_req, res, next) => {
  try {
    const picture = await sheets.readHousehold();
    res.json(picture);
  } catch (error) {
    next(error);
  }
};
