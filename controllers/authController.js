const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    
    const user = new User({ email, name, password, role });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN 
    });
    
    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};