import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mrn: { type: String, required: true, trim: true },
    surgeryType: { type: String, default: '', trim: true },
    otDate: { type: Date, required: true },
    surgeon: { type: String, default: '', trim: true },
    unit: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

patientSchema.index({ mrn: 1 }, { unique: false });

export const Patient = mongoose.model('Patient', patientSchema);



