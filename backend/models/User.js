const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    // Stores the refresh token — set on login, cleared on logout
    // Stored in DB so we can invalidate it (unlike access tokens)
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// ── Pre-save Hook ───────────────────────────────────────────
// Runs automatically before saving a user to the database
// Hashes the plain text password so we never store it raw
userSchema.pre('save', async function (next) {
  // Only hash if the password field was actually modified (or is new)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method ─────────────────────────────────────────
// Called on a user document to compare a plain password with the hashed one
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
