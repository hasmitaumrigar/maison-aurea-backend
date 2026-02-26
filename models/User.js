const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'NAME IS REQUIRED'], trim: true, minlength: 2, maxlength: 80 },
  email:    { type: String, required: [true, 'EMAIL IS REQUIRED'], unique: true, lowercase: true, trim: true,
              match: [/^\S+@\S+\.\S+$/, 'INVALID EMAIL FORMAT'] },
  password: { type: String, required: [true, 'PASSWORD IS REQUIRED'], minlength: 8 },
  ordersPlaced:    { type: Number, default: 0 },
  isFirstTimeBuyer:{ type: Boolean, default: true },
  wishlist: [{ type: Number }], // product IDs (1-20)
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLogin: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Safe profile (no password)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
