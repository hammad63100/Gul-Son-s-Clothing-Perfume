const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomerInteraction = sequelize.define('CustomerInteraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  interactionType: {
    type: DataTypes.ENUM('call', 'email', 'sms', 'chat', 'visit', 'social_media', 'other'),
    allowNull: false
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  outcome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  followUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sentiment: {
    type: DataTypes.ENUM('positive', 'neutral', 'negative'),
    defaultValue: 'neutral'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'customer_interactions',
  timestamps: true
});

module.exports = CustomerInteraction;
