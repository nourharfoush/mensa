import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('RolePermission', rolePermissionSchema);
