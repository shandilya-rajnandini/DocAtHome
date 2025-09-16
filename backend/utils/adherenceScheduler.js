// utils/adherenceScheduler.js
const cron = require('node-cron');
const MedicationLog = require('../models/MedicationLog');
const User = require('../models/User');

const calculateAdherenceScore = async () => {
  try {
    console.log('Starting nightly adherence score calculation...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all patients with medication logs in the last 30 days
    const patientsWithLogs = await MedicationLog.distinct('patient', {
      scheduledDate: { $gte: thirtyDaysAgo }
    });
    
    for (const patientId of patientsWithLogs) {
      const logs = await MedicationLog.find({
        patient: patientId,
        scheduledDate: { $gte: thirtyDaysAgo }
      });
      
      const totalScheduled = logs.length;
      const totalTaken = logs.filter(log => log.isTaken).length;
      const adherenceScore = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
      
      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sortedLogs = logs.sort((a, b) => b.scheduledDate - a.scheduledDate);
      
      for (const log of sortedLogs) {
        const logDate = new Date(log.scheduledDate);
        logDate.setHours(0, 0, 0, 0);
        
        if (logDate.getTime() === today.getTime() - (streak * 24 * 60 * 60 * 1000) && log.isTaken) {
          streak++;
        } else {
          break;
        }
      }
      
      // Update user
      await User.findByIdAndUpdate(patientId, {
        medicationAdherenceScore: adherenceScore,
        adherenceStreak: streak,
        lastAdherenceUpdate: new Date()
      });
      
      console.log(`Updated adherence for patient ${patientId}: ${adherenceScore}% (${streak} day streak)`);
    }
    
    console.log('Adherence score calculation completed.');
  } catch (error) {
    console.error('Error calculating adherence scores:', error);
  }
};

// Schedule to run daily at 2 AM
const startScheduler = () => {
  cron.schedule('0 2 * * *', calculateAdherenceScore);
  console.log('Adherence scheduler started - runs daily at 2 AM');
};

module.exports = { startScheduler, calculateAdherenceScore };