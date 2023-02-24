import { faker } from '@faker-js/faker';
import request from 'supertest';
import { URLSearchParams } from 'url';
import app from '../../app';
import { UserLoginDTO } from '../../dtos/login.dto';
import { RegisterUserDTO } from '../../dtos/register-user.dto';
import { UserModel } from '../../models/user';

function jsonToFormData(objectToConvert: object) {
  const formData = new URLSearchParams();
  Object.keys(objectToConvert).forEach(key => formData.append(key, objectToConvert[key]));
  return formData.toString();
}

function createRegisterUserDTO(): RegisterUserDTO {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'NORMAL_USER',
    dob: 'I don\'t know what it mean'
  }
}

async function sendUserRegistrationRequest(registerUserDTO: string) {
  return request(app)
    .post('/api/register')
    .set('Accept', 'application/json')
    .send(registerUserDTO)
}

function createLoginDTO(): UserLoginDTO {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
}

async function sendUserLoginRequest(userLoginDTO: string) {
  return request(app)
    .post('/api/login')
    .set('Accept', 'application/json')
    .send(userLoginDTO)
}

describe('Auth Controller Tests', () => {
  describe('Sign Up API', () => {
    let userRegistrationDTO: RegisterUserDTO;

    beforeEach(() => userRegistrationDTO = createRegisterUserDTO())

    it('Should return a BAD_REQUEST if e-mail isn\'t in the body', async () => {
      delete userRegistrationDTO.email;

      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'email should not be null or undefined',
        isEmail: 'email must be an email',
        isString: 'email must be a string'
      })
    })

    it('Should return a BAD_REQUEST if password isn\'t in the body', async () => {
      delete userRegistrationDTO.password;

      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'password should not be null or undefined',
        isString: 'password must be a string'
      })
    })

    it('Should return a BAD_REQUEST if name isn\'t in the body', async () => {
      delete userRegistrationDTO.name;

      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'name should not be null or undefined',
        isString: 'name must be a string'
      })
    })

    it('Should return a BAD_REQUEST if role isn\'t in the body', async () => {
      delete userRegistrationDTO.role;

      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'role should not be null or undefined',
        isString: 'role must be a string'
      })
    })

    it('Should return a CREATED if dob isn\'t in the body', async () => {
      delete userRegistrationDTO.dob;

      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(201);
      expect(response.body.success).toBeTruthy()
    })


    it('Should return a CREATED and save in DB if DTO is correct', async () => {
      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(201);
      expect(response.body.success).toBeTruthy()

      const dbUser = await UserModel.findOne({ email: userRegistrationDTO.email })
      expect(dbUser.name).toBe(userRegistrationDTO.name)
      expect(dbUser.password).toBe(userRegistrationDTO.password)
      expect(dbUser.role).toBe(userRegistrationDTO.role)
      expect(dbUser.dob).toBe(userRegistrationDTO.dob)
    })

    it('Should return an error if the e-mail already exists', async () => {
      const response = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));
      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(201);
      expect(response.body.success).toBeTruthy()

      const secondResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));
      expect(secondResponse.status).toBe(403)
      expect(secondResponse.body.success).toBeFalsy()
      expect(secondResponse.body.message).toBe('User already exists')
    })
  })

  describe('Login API', () => {
    let userLoginDTO: UserLoginDTO;
    beforeEach(() => userLoginDTO = createLoginDTO())

    it('Should return a BAD_REQUEST if e-mail isn\'t in the body', async () => {
      delete userLoginDTO.email;

      const response = await sendUserLoginRequest(jsonToFormData(userLoginDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'email should not be null or undefined',
        isEmail: 'email must be an email',
        isString: 'email must be a string'
      })
    })

    it('Should return a BAD_REQUEST if password isn\'t in the body', async () => {
      delete userLoginDTO.password;

      const response = await sendUserLoginRequest(jsonToFormData(userLoginDTO));

      expect(response.headers["content-type"]).toMatch(/json/);
      expect(response.status).toEqual(400);
      expect(response.body[0]).toStrictEqual({
        isDefined: 'password should not be null or undefined',
        isString: 'password must be a string'
      })
    })

    it('Should return a BAD_REQUEST if e-mail are wrong', async () => {
      const response = await sendUserLoginRequest(jsonToFormData(userLoginDTO));

      expect(response.headers["content-type"]).toMatch(/json/)
      expect(response.status).toEqual(400)
      expect(response.body.message).toBe('E-mail not found! Please, check it and try again')
    })

    it('Should return a BAD_REQUEST if password are wrong', async () => {
      const userRegistrationDTO = createRegisterUserDTO()
      const userRegistrationResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(userRegistrationResponse.headers["content-type"]).toMatch(/json/);
      expect(userRegistrationResponse.status).toEqual(201);
      expect(userRegistrationResponse.body.success).toBeTruthy()

      const response = await sendUserLoginRequest(
        jsonToFormData({
          email: userRegistrationDTO.email,
          password: faker.internet.password()
        })
      )

      expect(response.headers["content-type"]).toMatch(/json/)
      expect(response.status).toEqual(400)
      expect(response.body.error.message).toBe(
        `Wrong password!
        Please, check it and try again. 
        PS: You have three chances!`
      )
    })

    it('Should return a token if DTO is correct', async () => {
      const userRegistrationDTO = createRegisterUserDTO()
      const userRegistrationResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));
      expect(userRegistrationResponse.headers["content-type"]).toMatch(/json/);
      expect(userRegistrationResponse.status).toEqual(201);
      expect(userRegistrationResponse.body.success).toBeTruthy()

      const response = await sendUserLoginRequest(
        jsonToFormData({
          email: userRegistrationDTO.email,
          password: userRegistrationDTO.password
        })
      )
      expect(response.headers["content-type"]).toMatch(/json/)
      expect(response.status).toEqual(200)
      expect(typeof response.body.token).toBe('string')
    })

    it('Should return a token and save it in DB if DTO is correct', async () => {
      const userRegistrationDTO = createRegisterUserDTO()
      const userRegistrationResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(userRegistrationResponse.headers["content-type"]).toMatch(/json/);
      expect(userRegistrationResponse.status).toEqual(201);
      expect(userRegistrationResponse.body.success).toBeTruthy()

      const response = await sendUserLoginRequest(
        jsonToFormData({
          email: userRegistrationDTO.email,
          password: userRegistrationDTO.password
        })
      )

      expect(response.headers["content-type"]).toMatch(/json/)
      expect(response.status).toEqual(200)
      expect(typeof response.body.token).toBe('string')

      const dbUser = await UserModel.findOne({ email: userRegistrationDTO.email })
      expect(dbUser.name).toBe(userRegistrationDTO.name)
      expect(dbUser.password).toBe(userRegistrationDTO.password)
      expect(dbUser.role).toBe(userRegistrationDTO.role)
      expect(dbUser.dob).toBe(userRegistrationDTO.dob)
    })

    it('Must force customers to reset their password after 3 unsuccessful login attempts', async () => {
      const userRegistrationDTO = createRegisterUserDTO()
      const userRegistrationResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(userRegistrationResponse.headers["content-type"]).toMatch(/json/);
      expect(userRegistrationResponse.status).toEqual(201);
      expect(userRegistrationResponse.body.success).toBeTruthy()

      for (let index = 0; index < 3; index++) {
        const response = await sendUserLoginRequest(
          jsonToFormData({
            email: userRegistrationDTO.email,
            password: faker.internet.password()
          })
        )

        expect(response.headers["content-type"]).toMatch(/json/)
        expect(response.status).toEqual(400)
        if (index < 2) {
          expect(response.body.error.message).toMatch(/Wrong password/)
        } else {
          expect(response.body.error.message.trim()).toMatch(/You\'ve reached your login attempts/)
        }
      }
    })

    it('Must force customers to reset their password after 3 unsuccessful login attempts (EVEN IF THEY FORCE IT)', async () => {
      const userRegistrationDTO = createRegisterUserDTO()
      const userRegistrationResponse = await sendUserRegistrationRequest(jsonToFormData(userRegistrationDTO));

      expect(userRegistrationResponse.headers["content-type"]).toMatch(/json/);
      expect(userRegistrationResponse.status).toEqual(201);
      expect(userRegistrationResponse.body.success).toBeTruthy()

      for (let index = 0; index < 3; index++) {
        const response = await sendUserLoginRequest(
          jsonToFormData({
            email: userRegistrationDTO.email,
            password: faker.internet.password()
          })
        )

        expect(response.headers["content-type"]).toMatch(/json/)
        expect(response.status).toEqual(400)
        if (index < 2) {
          expect(response.body.error.message).toMatch(/Wrong password/)
        } else {
          expect(response.body.error.message.trim()).toMatch(/You\'ve reached your login attempts/)
        }
      }

      const fourthAttemptResponse = await sendUserLoginRequest(
        jsonToFormData({
          email: userRegistrationDTO.email,
          password: faker.internet.password()
        })
      )

      expect(fourthAttemptResponse.headers["content-type"]).toMatch(/json/)
      expect(fourthAttemptResponse.status).toEqual(400)
      expect(fourthAttemptResponse.body.error.message).toMatch(/Still here\?/)
    })
  })
})