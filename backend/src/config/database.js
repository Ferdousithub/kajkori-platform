const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kajkori',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? msg => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
    
    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

async function closeDatabase() {
  await sequelize.close();
}

module.exports = {
  sequelize,
  connectDatabase,
  closeDatabase
};
