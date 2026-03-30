//Sewni

import mongoose from "mongoose";

const adminProfileSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    ref: 'Admin'
  },
  profilepic: { 
    type: String, 
    default: null 
  },
  nic: { 
    type: String, 
    default: null 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'], 
    default: null 
  },
  bio: { 
    type: String, 
    default: null 
  },
  dateOfBirth: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

export default mongoose.model("AdminProfile", adminProfileSchema);
