const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// (The 'register' and 'getMe' functions can remain as they are)
// ...

exports.login = async (req, res) => {
  console.log("\n--- LOGIN ATTEMPT INITIATED ---");

  try {
    const { email, password } = req.body;
    
    // --- DEBUG PROBE 1 ---
    // Let's see what the frontend is sending us.
    console.log("1. Received from frontend - Email:", email);
    console.log("1. Received from frontend - Password:", password);

    if (!email || !password) {
        console.log("ERROR: Email or password was not received from the frontend.");
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // --- DEBUG PROBE 2 ---
    // Let's find the user in the database and see what we get.
    console.log("2. Searching database for user with email:", email);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log("3. RESULT: User NOT found in the database. Login failed.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    
    console.log("3. RESULT: User FOUND in the database. User's name:", user.name);
    
    // --- DEBUG PROBE 3 ---
    // Let's look at the hashed password stored in the database.
    // It should be a very long string of random characters.
    console.log("4. Hashed password stored in DB:", user.password);

    // --- DEBUG PROBE 4 ---
    // Now, let's compare the password from the form with the one from the DB.
    console.log("5. Comparing form password with hashed password...");
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("6. RESULT: Passwords DO NOT MATCH. Login failed.");
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log("6. RESULT: Passwords MATCH! Login successful.");
    
    // If we reach here, the login is successful. Now create and send the token.
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        console.log("7. JWT token created and sent to user.");
        console.log("--- LOGIN ATTEMPT FINISHED ---\n");
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('FATAL LOGIN ERROR:', err.message);
    res.status(500).send('Server error');
  }
};


// ... Make sure your other functions (register, getMe) are also in this file
exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const newUser = new User(req.body);
    await newUser.save();
    const payload = { user: { id: newUser.id, role: newUser.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err.message);
    res.status(500).send('Server error');
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('GETME ERROR:', err.message);
    res.status(500).send('Server Error');
  }
};