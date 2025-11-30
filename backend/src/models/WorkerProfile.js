const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkerProfile = sequelize.define('WorkerProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 16,
      max: 70
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
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
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience: {
    type: DataTypes.JSONB,
    defaultValue: []
    // Format: [{ company: '', position: '', duration: '', description: '' }]
  },
  education: {
    type: DataTypes.STRING
  },
  expectedSalaryMin: {
    type: DataTypes.INTEGER
  },
  expectedSalaryMax: {
    type: DataTypes.INTEGER
  },
  availability: {
    type: DataTypes.ENUM('immediate', 'within_week', 'within_month', 'negotiable'),
    defaultValue: 'immediate'
  },
  preferredJobTypes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  preferredShifts: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['day']
    // Options: 'day', 'night', 'rotational'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cvUrl: {
    type: DataTypes.STRING
  },
  bio: {
    type: DataTypes.TEXT
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['bn']
  },
  nidNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nidVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profileCompleteness: {
    type: DataTypes.INTEGER,
    defaultValue: 0
    // Percentage: 0-100
  }
}, {
  tableName: 'worker_profiles',
  indexes: [
    { fields: ['userId'] },
    { fields: ['district'] },
    { fields: ['skills'], using: 'gin' },
    { fields: ['location'], type: 'GIST' }
  ]
});

// Calculate profile completeness
WorkerProfile.prototype.calculateCompleteness = function() {
  let score = 0;
  if (this.age) score += 10;
  if (this.district) score += 10;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.experience && this.experience.length > 0) score += 20;
  if (this.expectedSalaryMin && this.expectedSalaryMax) score += 10;
  if (this.bio) score += 10;
  if (this.cvUrl) score += 10;
  if (this.nidVerified) score += 10;
  
  this.profileCompleteness = score;
  return score;
};

module.exports = WorkerProfile;
