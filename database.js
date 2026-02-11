const fs = require('fs');
const path = require('path');

/**
 * SurakshaSetu Database Controller
 * Centralizes data persistence using a JSON store.
 */

const DB_PATH = path.join(__dirname, 'suraksha_db.json');

// Initialize database if it doesn't exist
const initializeDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialState = {
      users: [],
      scamRegistry: [
        { id: 1, identifier: "paytm.rewards@okicici", type: "VPA", risk: 98, reports: 142, city: "Delhi" },
        { id: 2, identifier: "+91 98210-45621", type: "PHONE", risk: 95, reports: 89, city: "Mumbai" }
      ],
      otpStore: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2));
    console.log('✔ Initialized New Suraksha Database');
  }
};

const readDB = () => {
  initializeDB();
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  // User Management
  findUserByEmail: (email) => {
    const db = readDB();
    return db.users.find(u => u.email === email);
  },

  saveUser: (user) => {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
    return user;
  },

  updateUserSubscription: (email, status, subscriptionId) => {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      db.users[userIndex].isPro = status === 'active';
      db.users[userIndex].subscriptionId = subscriptionId;
      db.users[userIndex].securityLevel = status === 'active' ? 'Maximum' : 'Standard';
      writeDB(db);
      return db.users[userIndex];
    }
    return null;
  },

  // OTP / Verification Sessions
  saveOTPSession: (email, sessionData) => {
    const db = readDB();
    db.otpStore[email] = {
      ...sessionData,
      expires: Date.now() + (5 * 60 * 1000) // 5 minutes
    };
    writeDB(db);
  },

  getOTPSession: (email) => {
    const db = readDB();
    return db.otpStore[email];
  },

  clearOTPSession: (email) => {
    const db = readDB();
    delete db.otpStore[email];
    writeDB(db);
  },

  // Scam Registry
  getScamRegistry: (query = '') => {
    const db = readDB();
    if (!query) return db.scamRegistry;
    return db.scamRegistry.filter(s => 
      s.identifier.toLowerCase().includes(query.toLowerCase())
    );
  },

  addScamReport: (report) => {
    const db = readDB();
    const newEntry = {
      id: Date.now(),
      reports: 1,
      risk: 75,
      city: "Reported",
      ...report
    };
    db.scamRegistry.unshift(newEntry);
    writeDB(db);
    return newEntry;
  }
};