import { Schema, model, models } from "mongoose";

const AdminSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  }
);

const Admin = models.Admin || model('Admin', AdminSchema);

export default Admin;
