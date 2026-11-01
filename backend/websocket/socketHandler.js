const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.IO Event Handlers
 */

module.exports = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.fullName} (${socket.user.userType})`);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);
    
    // Join district room if applicable
    if (socket.user.district) {
      socket.join(`district:${socket.user.district}`);
    }

    // Join state room if applicable
    if (socket.user.state) {
      socket.join(`state:${socket.user.state}`);
    }

    // GPS Location Update (from driver)
    socket.on('location:update', async (data) => {
      try {
        const { deliveryId, lat, lng } = data;
        
        // Broadcast to all admins and relevant stakeholders
        io.to(`district:${socket.user.district}`).emit('delivery:location', {
          deliveryId,
          driverId: socket.user._id,
          location: { lat, lng },
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    // Blockage Alert (from driver/official)
    socket.on('blockage:new', async (data) => {
      try {
        // Broadcast blockage to all users in affected district/state
        io.to(`district:${data.district}`).emit('blockage:alert', data);
        io.to(`state:${data.state}`).emit('blockage:alert', data);
      } catch (error) {
        console.error('Blockage alert error:', error);
      }
    });

    // Blockage Cleared (from official/admin)
    socket.on('blockage:cleared', async (data) => {
      try {
        io.to(`district:${data.district}`).emit('blockage:clear', data);
        io.to(`state:${data.state}`).emit('blockage:clear', data);
      } catch (error) {
        console.error('Blockage clear error:', error);
      }
    });

    // Delivery Status Update
    socket.on('delivery:status', async (data) => {
      try {
        const { deliveryId, status } = data;
        
        // Notify relevant parties
        io.to(`district:${socket.user.district}`).emit('delivery:update', {
          deliveryId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Delivery status error:', error);
      }
    });

    // Rerouting Request (from admin)
    socket.on('delivery:reroute', async (data) => {
      try {
        const { deliveryId, driverId, newRoute } = data;
        
        // Send reroute instruction to specific driver
        io.to(`user:${driverId}`).emit('route:change', {
          deliveryId,
          newRoute,
          message: 'Your route has been updated due to a blockage'
        });
      } catch (error) {
        console.error('Reroute error:', error);
      }
    });

    // Emergency Alert (from admin)
    socket.on('emergency:alert', async (data) => {
      try {
        // Broadcast emergency to all users in affected area
        io.to(`district:${data.district}`).emit('alert:emergency', data);
        io.to(`state:${data.state}`).emit('alert:emergency', data);
      } catch (error) {
        console.error('Emergency alert error:', error);
      }
    });

    // Chat Message (driver <-> admin)
    socket.on('chat:message', async (data) => {
      try {
        const { recipientId, message } = data;
        
        // Send message to recipient
        io.to(`user:${recipientId}`).emit('chat:receive', {
          senderId: socket.user._id,
          senderName: socket.user.fullName,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Chat error:', error);
      }
    });

    // Typing indicator
    socket.on('chat:typing', (data) => {
      io.to(`user:${data.recipientId}`).emit('chat:typing', {
        userId: socket.user._id,
        userName: socket.user.fullName
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.fullName}`);
    });
  });

  return io;
};
