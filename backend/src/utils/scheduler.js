const Tournament = require('../models/Tournament');
const tournamentController = require('../controllers/tournamentController');

/**
 * Checks for tournaments that should have started automatically
 */
const runTournamentScheduler = async () => {
  try {
    const now = new Date();
    
    // Find tournaments where registration has ended but they are still 'upcoming'
    const tournamentsToStart = await Tournament.find({
      status: 'upcoming',
      registrationEndDate: { $lte: now }
    });

    if (tournamentsToStart.length > 0) {
      console.log(`[Scheduler] Found ${tournamentsToStart.length} tournaments to start automatically.`);
      
      for (const t of tournamentsToStart) {
        try {
          // We simulate the req/res for the controller function or just refactor the logic
          // Since startTournament expects req.params.id, we can call it if we mock the req/res
          // Better: Refactor the startTournament logic into a service function (but for now let's just do a direct call)
          
          const mockReq = { params: { id: t._id } };
          const mockRes = { 
            json: (data) => console.log(`[Scheduler] Successfully started tournament: ${t.name}`),
            status: (code) => ({ json: (err) => console.error(`[Scheduler] Failed to start tournament ${t.name}:`, err.message) })
          };
          
          await tournamentController.startTournament(mockReq, mockRes);
        } catch (err) {
          console.error(`[Scheduler] Error starting tournament ${t._id}:`, err.message);
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Critical error:', err.message);
  }
};

// Export to be started in server.js
module.exports = {
  initScheduler: () => {
    console.log('🚀 Tournament Scheduler Initialized (Checking every 1 minute)');
    setInterval(runTournamentScheduler, 60000); // Run every minute
  }
};
