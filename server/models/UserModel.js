import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // ADD minlength: 6, maxlength: 15 (debugging)
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    notifications: { type: Boolean, required: true, default: true },
    privilege: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Runs before save
UserSchema.pre("save", function (next) {
  // If password has not been modified (or not new), then dont hash it
  if (!this.isModified("password")) return next();

  // If modified or new, hash it
  bcrypt.hash(this.password, 10, (err, hashedPassword) => {
    if (err) return next(err);

    this.password = hashedPassword;
    next();
  });
});

// Compare plain text password to encrypted from DB
UserSchema.methods.comparePassword = function (password, callback) {
  // callback is the done Function from passport.js
  // bcrypt.compare(password, encryptedPassword, callback(err, isMatch))
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return callback(err);
    else {
      if (!isMatch) return callback(null, isMatch); // Does not match

      return callback(null, this); // When match.. 'this' is the user
    }
  });
};

export default mongoose.model("User", UserSchema);
