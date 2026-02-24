const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 8 },
  role: { type: String, enum: ['client', 'partner', 'investor', 'admin'], default: 'client' },
  googleId: String,
  isVerified: { type: Boolean, default: false },
  savedServices: [String],
  consultationHistory: [{ service: String, date: Date, status: String }],
  botInteractions: [{ botType: String, query: String, timestamp: { type: Date, default: Date.now } }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
