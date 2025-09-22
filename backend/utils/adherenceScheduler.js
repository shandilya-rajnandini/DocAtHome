// utils/adherenceScheduler.js
const cron = require('node-cron');
const MedicationLog = require('../models/MedicationLog');
const User = require('../models/User');
const aggregateDemandInsights = require('./aggregateDemandInsights');

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
      
      // Build a set of days with any taken dose
      const dayKey = d => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x.getTime();
      };
      const takenDays = new Set(
        logs.filter(l => l.isTaken).map(l => dayKey(l.scheduledDate))
      );
      // Count consecutive days from today
      let cursor = new Date(today);
      while (takenDays.has(cursor.getTime())) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
        cursor.setHours(0, 0, 0, 0);
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

  // Run demand insights aggregation weekly on Monday at 3 AM
  cron.schedule('0 3 * * 1', aggregateDemandInsights);
  console.log('Demand insights scheduler started - runs weekly on Monday at 3 AM');
};

module.exports = { startScheduler, calculateAdherenceScore };