const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
    // garments, delivery, construction, retail, service, hospitality, etc.
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT
  },
  requiredSkills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  salaryMin: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  salaryMax: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  salaryNegotiable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  positions: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  positionsFilled: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  jobType: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'internship'),
    defaultValue: 'full_time'
  },
  shift: {
    type: DataTypes.ENUM('day', 'night', 'rotational', 'flexible'),
    defaultValue: 'day'
  },
  experienceRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 0
    // In months
  },
  educationRequired: {
    type: DataTypes.STRING
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subDistrict: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY
  },
  startDateType: {
    type: DataTypes.ENUM('immediate', 'scheduled'),
    defaultValue: 'immediate'
  },
  benefits: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
    // overtime_pay, transport, lunch, accommodation, insurance, etc.
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'paused', 'filled'),
    defaultValue: 'active'
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  applicationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featuredUntil: {
    type: DataTypes.DATE
  },
  isUrgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'jobs',
  indexes: [
    { fields: ['employerId'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['district'] },
    { fields: ['requiredSkills'], using: 'gin' },
    { fields: ['location'], type: 'GIST' },
    { fields: ['createdAt'] }
  ]
});

// Instance methods
Job.prototype.incrementView = async function() {
  this.viewCount += 1;
  await this.save();
};

Job.prototype.incrementApplication = async function() {
  this.applicationCount += 1;
  await this.save();
};

Job.prototype.checkIfFilled = async function() {
  if (this.positionsFilled >= this.positions) {
    this.status = 'filled';
    await this.save();
  }
};

module.exports = Job;
