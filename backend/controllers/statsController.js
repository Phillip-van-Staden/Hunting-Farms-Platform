const pool = require('../db');

exports.getPersonCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(pID) FROM Person');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.getFarmCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(fID) FROM Farms');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.getSpeciesCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(dID) FROM Deer');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.getArticlesCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(bID) FROM Blogs');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};