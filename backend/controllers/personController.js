const bcrypt = require('bcrypt');
const pool = require('../db');

exports.getPeople = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Person');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
//get person with email
exports.getPersonByEmail = async (req, res) => {
    const {id}=req.params;
  try {
    const result = await pool.query('SELECT * FROM Person WHERE pEmail = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

//update person
exports.updatePerson = async (req, res) => {
    const { id } = req.params;
    const { pnaam, pvan, pemail} = req.body;

    try {
        const result = await pool.query(
            `UPDATE person SET pnaam = $1, pvan = $2, pemail = $3 WHERE pid = $4 RETURNING *`,
            [pnaam, pvan, pemail, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

//update password
exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE person SET ppassword = $1 WHERE pid = $2 RETURNING *`,
            [hashedPassword, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};
//update notifications
exports.updateNotifications = async (req, res) => {
    const { id } = req.params;
    const { psubscribe } = req.body;

    try {
        const result = await pool.query(
            `UPDATE person SET psubscribe = $1 WHERE pid = $2 RETURNING *`,
            [psubscribe, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

//Register new user
exports.signup = async (req, res) => {
    const { pnaam, pvan, pemail, ppassword, pcategory, psubscribe, padmin } = req.body;

    if (!pnaam || !pemail || !ppassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // 1. Check if user already exists
        const userCheck = await pool.query('SELECT * FROM person WHERE pemail = $1', [pemail]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(ppassword, 10);

        // 3. Insert new user
        const newPerson = await pool.query(
            `INSERT INTO person (pnaam, pvan, pemail, ppassword, pcategory, psubscribe, padmin)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [pnaam, pvan, pemail, hashedPassword, pcategory, psubscribe, padmin]
        );

        // 4. Send response
        res.status(201).json(newPerson.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error creating person');
    }
};

   


// Route for user login
exports.login = async (req, res) => {
    try {
        const { pemail, ppassword } = req.body;

        // 1. Check if user exists
        const result = await pool.query('SELECT * FROM person WHERE pemail = $1', [pemail]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = result.rows[0];
       
        // 2. Compare passwords
        const isMatch = await bcrypt.compare(ppassword, user.ppassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect details' });
        }
        // 3. Checked if blocked
         if(user.pblocked){
          return res.status(400).json({ message: 'Your account has been blocked. For help, please reach out to our support team' });
        }
        // 4. Send success response
        // res.status(200).json({ message: 'Login successful' });
         res.status(200).json({
            id: user.pid,
            first_name: user.pnaam,
            last_name: user.pvan,
            email: user.pemail,
            admin: user.padmin,
            category: user.pcategory
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error logging in');
    }


};