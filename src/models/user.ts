import { ReturnModelType, getModelForClass, plugin, prop } from '@typegoose/typegoose';
import paginate from 'mongoose-paginate-v2';
import { RegisterUserDTO } from '../dtos/register-user.dto';
import { v4 as uuidv4 } from 'uuid'

// You User Model definition here

@plugin(paginate)
export class User {
  @prop({ required: true })
  _id: string;

  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: true })
  password: string;

  @prop({ required: true })
  name: string;

  @prop()
  dob?: string;

  @prop({ required: true })
  role: string;

  @prop()
  navigationToken?: string;

  @prop({default: 0})
  failLoginAttempts?: number;

  @prop()
  passwordResetToken?: string;

  @prop()
  passwordResetTokenExpires?: Date;

  @prop()
  createdAt?: Date;

  @prop()
  updatedAt?: Date;

  static async getUsers(
    this: ReturnModelType<typeof User>,
    page: number,
    limit: number,
    parsedFilter: object
  ) {
    this.find(parsedFilter).skip(page * limit).limit(limit);
  }

  static async getById(this: ReturnModelType<typeof User>, userId: string) {
    return this.findById(userId);
  }

  static async getByEmail(this: ReturnModelType<typeof User>, email: string) {
    return this.findOne({ email });
  }

  static async add(
    this: ReturnModelType<typeof User>,
    user: RegisterUserDTO
  ) {
    const now = new Date();
    const newUser = new UserModel({
      ...user,
      _id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });
    return newUser.save();
  }

  static async updateUser(this: ReturnModelType<typeof User>, userId: string, payload: object) {
    return this.updateOne({ _id: userId }, payload)
  }

  static async deleteById(this: ReturnModelType<typeof User>, userId: string) {
    return this.deleteById(userId)
  }
}

const DefaultTransform = {
  schemaOptions: {
    collection: 'users',
    toJSON: {
      virtuals: true,
      getters: true,
      // versionKey: false,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._id;
        return ret;
      },
    },
  },
};

export const UserModel = getModelForClass(User, DefaultTransform);
