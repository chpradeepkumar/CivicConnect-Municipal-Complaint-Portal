import mongoose from 'mongoose';
import {
  COMPLAINT_STATUS,
  COMPLAINT_STATUS_VALUES,
  COMPLAINT_PRIORITY_VALUES,
} from '../utils/constants.js';

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: COMPLAINT_STATUS_VALUES, required: true },
    previousStatus: { type: String, enum: [...COMPLAINT_STATUS_VALUES, null], default: null },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, default: 'system' },
    isPublic: { type: Boolean, default: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: 15,
      maxlength: 3000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    address: { type: String, required: [true, 'Address is required'], trim: true, maxlength: 250 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: undefined,
      },
    },
    priority: {
      type: String,
      enum: COMPLAINT_PRIORITY_VALUES,
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUS_VALUES,
      default: COMPLAINT_STATUS.SUBMITTED,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedAt: { type: Date, default: null },
    attachments: { type: [attachmentSchema], default: [] },
    resolutionNotes: { type: String, trim: true, maxlength: 2000, default: '' },
    resolutionAttachments: { type: [attachmentSchema], default: [] },
    rejectionReason: { type: String, trim: true, maxlength: 1000, default: '' },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    dueAt: { type: Date, default: null, index: true },
    history: { type: [historySchema], default: [] },
    isPublic: { type: Boolean, default: true },
    reopenedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ title: 'text', description: 'text', address: 'text' });
// A 2dsphere index requires valid GeoJSON. Coordinates are optional, so we keep
// them unindexed to avoid rejecting complaints without coordinates.

complaintSchema.virtual('isOverdue').get(function isOverdue() {
  if (!this.dueAt) return false;
  const terminal = [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REJECTED];
  return !terminal.includes(this.status) && this.dueAt.getTime() < Date.now();
});

complaintSchema.set('toJSON', { virtuals: true });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);

export default Complaint;
