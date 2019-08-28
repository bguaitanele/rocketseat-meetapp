import Sequelize from 'sequelize';
import config from '../config/database';
import * as fs from 'fs';
const { resolve } = require('path');
class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(config);
    const dirModels = resolve(__dirname, '..', 'app', 'models');
    const models = fs.readdirSync(dirModels);
    models.map(async file => {
      const model = await import(resolve(dirModels, file));
      model.default.init(this.connection);
    });
  }
}

export default new Database();
