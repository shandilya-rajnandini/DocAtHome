// Import required models
const RefillRequest = require('../models/RefillRequest');
const Prescription = require('../models/Prescription');


exports.createRefillRequest = async (req, res) => {
  try {
    const { originalPrescriptionId } = req.body; // Prescription patient is requesting a refill for

    
    const prescription = await Prescription.findById(originalPrescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    // 2️⃣ Optional: Extra security — ensure the logged-in user is the patient of this prescription
    if (prescription.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to request refill for this prescription.' });
    }


    const existingRequest = await RefillRequest.findOne({
      originalPrescriptionId,
      status: 'pending',
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'A refill request for this prescription is already pending.' });
    }

    
    const refillRequest = new RefillRequest({
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      originalPrescriptionId,
      status: 'pending', // default status
    });
    await refillRequest.save();

    
    return res.status(201).json({ message: 'Refill request created successfully.', refillRequest });
  } catch (error) {
    console.error('Error creating refill request:', error);
    return res.status(500).json({ message: 'Server error while creating refill request.' });
  }
};


exports.getRefillRequestsForDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id; // Assuming logged-in doctor ID from auth middleware

    const requests = await RefillRequest.find({ doctorId })
      .populate('originalPrescriptionId') // get prescription details
      .populate('patientId', 'name email'); // get patient details

    return res.json(requests);
  } catch (error) {
    console.error('Error fetching refill requests:', error);
    return res.status(500).json({ message: 'Server error while fetching refill requests.' });
  }
};


exports.approveRefillRequest = async (req, res) => {
  try {
    const { id } = req.params; // refillRequestId

   
    const request = await RefillRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Refill request not found or already processed.' });
    }

    const originalPrescription = await Prescription.findById(request.originalPrescriptionId);
    if (!originalPrescription) {
      return res.status(404).json({ message: 'Original prescription not found.' });
    }

    const newPrescription = new Prescription({
      patientId: originalPrescription.patientId,
      doctorId: originalPrescription.doctorId,
      diagnosis: originalPrescription.diagnosis,
      medicines: originalPrescription.medicines,
      date: new Date(),
    });
    await newPrescription.save();

    
    request.status = 'approved';
    await request.save();

    return res.json({
      message: 'Refill request approved and new prescription created.',
      newPrescription,
    });
  } catch (error) {
    console.error('Error approving refill request:', error);
    return res.status(500).json({ message: 'Server error while approving refill request.' });
  }
};


exports.denyRefillRequest = async (req, res) => {
  try {
    const { id } = req.params; 
    const { notes } = req.body; 

    // 1️⃣ Find and validate the refill request
    const request = await RefillRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Refill request not found or already processed.' });
    }

    // 2️⃣ Update status and add denial notes
    request.status = 'denied';
    request.notes = notes || 'Refill denied by doctor.';
    await request.save();

    

    return res.json({ message: 'Refill request denied successfully.' });
  } catch (error) {
    console.error('Error denying refill request:', error);
    return res.status(500).json({ message: 'Server error while denying refill request.' });
  }
};










// What & Why Summary
// Why verify prescription exists?
// To avoid requests for deleted/invalid prescriptions.

// Why check if logged-in user is the patient?
// To prevent one patient from requesting a refill for another patient’s prescription.

// Why check existing pending request?
// Avoids spam/duplicate refill requests.

// Why populate doctor/patient fields in getRefillRequestsForDoctor?
// So that the UI can display names and details instead of just IDs.

// Why copy prescription in approveRefillRequest?
// Because each prescription should be unique and have its own date, avoiding editing the original.

// Why optional notifications?
// To keep patients/doctors informed in real time (especially in medical apps).