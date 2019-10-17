import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Subscription from '../app/models/Subscription';
import { Mongoose } from 'mongoose';

const models = [User, File, Meetup, Subscription];

class Database {
  constructor() {
    this.init();
    // this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  // mongo() {
  //   this.mongoConnection = Mongoose.connect(
  //     'mongodb://localhost:27019/mongomeetapp',
  //     {
  //       useNewUrlParser: true,
  //       useFindAndModify: true,
  //     }
  //   );
  // }
}

export default new Database();
