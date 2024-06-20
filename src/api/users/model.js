import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;
const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

usersSchema.pre("save", async function (next) {
  const currentUser = this;
  if (currentUser.isModified("password") || currentUser.isNew) {
    try {
      const plainPassword = currentUser.password;
      currentUser.password = await bcrypt.hash(plainPassword, 10);
      next(); // Proceed with save operation
    } catch (error) {
      next(error); // Pass errors to the next middleware
    }
  } else {
    next(); // No modifications to password, proceed without hashing
  }
});

usersSchema.methods.toJSON = function () {
  const usersMongoDoc = this;
  const user = usersMongoDoc.toObject();
  delete user.password;
  delete user.__v;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

usersSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("User", usersSchema);