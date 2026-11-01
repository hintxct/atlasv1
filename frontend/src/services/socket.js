import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 3000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners = {};
    }
  }

  // Location updates
  sendLocation(deliveryId, lat, lng) {
    if (this.socket?.connected) {
      this.socket.emit('location:update', { deliveryId, lat, lng });
    }
  }

  onLocationUpdate(callback) {
    this.on('delivery:location', callback);
  }

  // Blockage events
  reportBlockage(data) {
    if (this.socket?.connected) {
      this.socket.emit('blockage:new', data);
    }
  }

  onBlockageAlert(callback) {
    this.on('blockage:alert', callback);
  }

  reportBlockageCleared(data) {
    if (this.socket?.connected) {
      this.socket.emit('blockage:cleared', data);
    }
  }

  onBlockageCleared(callback) {
    this.on('blockage:clear', callback);
  }

  // Delivery events
  updateDeliveryStatus(deliveryId, status) {
    if (this.socket?.connected) {
      this.socket.emit('delivery:status', { deliveryId, status });
    }
  }

  onDeliveryUpdate(callback) {
    this.on('delivery:update', callback);
  }

  // Rerouting
  requestReroute(deliveryId, driverId, newRoute) {
    if (this.socket?.connected) {
      this.socket.emit('delivery:reroute', { deliveryId, driverId, newRoute });
    }
  }

  onRouteChange(callback) {
    this.on('route:change', callback);
  }

  // Emergency alerts
  sendEmergencyAlert(data) {
    if (this.socket?.connected) {
      this.socket.emit('emergency:alert', data);
    }
  }

  onEmergencyAlert(callback) {
    this.on('alert:emergency', callback);
  }

  // Chat
  sendMessage(recipientId, message) {
    if (this.socket?.connected) {
      this.socket.emit('chat:message', { recipientId, message });
    }
  }

  onMessageReceive(callback) {
    this.on('chat:receive', callback);
  }

  sendTyping(recipientId) {
    if (this.socket?.connected) {
      this.socket.emit('chat:typing', { recipientId });
    }
  }

  onTyping(callback) {
    this.on('chat:typing', callback);
  }

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
    delete this.listeners[event];
  }
}

const socketService = new SocketService();

export default socketService;
