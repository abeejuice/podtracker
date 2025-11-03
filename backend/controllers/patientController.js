import { Patient } from '../models/patientModel.js';
import { getPOD } from '../utils/dateUtils.js';

export async function createPatient(req, res) {
  try {
    const { name, mrn, surgeryType, otDate, surgeon, unit } = req.body;
    if (!name || !mrn || !otDate) {
      return res.status(400).json({ message: 'name, mrn, and otDate are required' });
    }
    const patient = await Patient.create({ name, mrn, surgeryType, otDate, surgeon, unit });
    const json = patient.toObject();
    json.pod = getPOD(json.otDate);
    res.status(201).json(json);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create patient', error: err.message });
  }
}

export async function getPatients(req, res) {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    const withPod = patients.map((p) => {
      const obj = p.toObject();
      obj.pod = getPOD(obj.otDate);
      return obj;
    });
    res.json(withPod);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
}

export async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const obj = patient.toObject();
    obj.pod = getPOD(obj.otDate);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient', error: err.message });
  }
}

export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const patient = await Patient.findByIdAndUpdate(id, updates, { new: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const obj = patient.toObject();
    obj.pod = getPOD(obj.otDate);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update patient', error: err.message });
  }
}

export async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete patient', error: err.message });
  }
}



