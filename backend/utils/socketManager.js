/**
 * Socket.IO Manager
 * Centralizes socket.io operations and provides a singleton instance
 */

let io = null;

/**
 * Initialize the Socket.IO instance
 * @param {Object} socketIo - The Socket.IO instance
 */
const initialize = (socketIo) => {
  io = socketIo;
};

/**
 * Get the Socket.IO instance
 * @returns {Object} The Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit to a specific room
 * @param {String} room - Room name
 * @param {String} event - Event name
 * @param {Object} data - Data to send
 */
const emitToRoom = (room, event, data) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(room).emit(event, data);
};

/**
 * Emit to a specific socket
 * @param {String} socketId - Socket ID
 * @param {String} event - Event name
 * @param {Object} data - Data to send
 */
const emitToSocket = (socketId, event, data) => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  io.to(socketId).emit(event, data);
};

/**
 * Sanitize city name for room usage
 * @param {String} city - City name
 * @returns {String} Sanitized city name
 */
const getCityRoom = (city) => {
  if (!city) return null;
  return `ambulance:${city.toLowerCase().trim().replace(/\s+/g, '-')}`;
};

module.exports = {
  initialize,
  getIO,
  emitToRoom,
  emitToSocket,
  getCityRoom
};
