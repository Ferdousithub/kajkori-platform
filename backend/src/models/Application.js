const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  workerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  employerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'applied',
      'viewed',
      'shortlisted',
      'interview_scheduled',
      'interviewed',
      'offered',
      'hired',
      'rejected',
      'withdrawn'
    ),
    defaultValue: 'applied'
  },
  matchScore: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100
    }
  },
  coverLetter: {
    type: DataTypes.TEXT
  },
  expectedSalary: {
    type: DataTypes.INTEGER
  },
  availableFrom: {
    type: DataTypes.DATEONLY
  },
  interviewDate: {
    type: DataTypes.DATE
  },
  interviewLocation: {
    type: DataTypes.STRING
  },
  interviewNotes: {
    type: DataTypes.TEXT
  },
  rejectionReason: {
    type: DataTypes.STRING
  },
  viewedByEmployerAt: {
    type: DataTypes.DATE
  },
  shortlistedAt: {
    type: DataTypes.DATE
  },
  interviewedAt: {
    type: DataTypes.DATE
  },
  hiredAt: {
    type: DataTypes.DATE
  },
  rejectedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'applications',
  indexes: [
    { fields: ['jobId'] },
    { fields: ['workerId'] },
    { fields: ['employerId'] },
    { fields: ['status'] },
    { fields: ['matchScore'] },
    { fields: ['createdAt'] },
    { unique: true, fields: ['jobId', 'workerId'] } // Prevent duplicate applications
  ]
});

// Instance methods
Application.prototype.updateStatus = async function(newStatus, notes = null) {
  this.status = newStatus;
  
  const statusTimeFields = {
    viewed: 'viewedByEmployerAt',
    shortlisted: 'shortlistedAt',
    interviewed: 'interviewedAt',
    hired: 'hiredAt',
    rejected: 'rejectedAt'
  };
  
  if (statusTimeFields[newStatus]) {
    this[statusTimeFields[newStatus]] = new Date();
  }
  
  if (notes && newStatus === 'rejected') {
    this.rejectionReason = notes;
  }
  
  if (notes && newStatus === 'interview_scheduled') {
    this.interviewNotes = notes;
  }
  
  await this.save();
};

module.exports = Application;
