import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["DONATOR", "NGO", "ADMIN"],
      required: true
    },
    name: {
      type: String,
      default: ""
    },
    lastReadAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderUsername: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ["DONATOR", "NGO", "ADMIN"],
      required: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    editedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 2,
        message: "Conversation must have exactly two participants"
      }
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

conversationSchema.index({ "participants.username": 1, "participants.role": 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
