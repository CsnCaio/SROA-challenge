import { faker } from '@faker-js/faker';
import request from 'supertest';
import app from '../../app';
import { registerUserDTO } from '../../controllers/dtos/register-user.dto';

function createRegisterUserDTO(): registerUserDTO {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    role: 'NORMAL_USER',
    dob: 'I don\'t know what it mean'
  }
}

describe('Auth Controller Tests', () => {
  describe('Sign Up', () => {

    describe('DTO Validation', () => {
      let userDTO: registerUserDTO;
      beforeEach(() => userDTO = createRegisterUserDTO())

      it('Should return a BAD_REQUEST if e-mail isn\'t in the body', async () => {
        const user = { ...userDTO }
        delete user.email;

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)


        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(400);
        expect(response.body[0]).toStrictEqual({ isDefined: 'email should not be null or undefined' })
      })

      it('Should return a BAD_REQUEST if password isn\'t in the body', async () => {
        const user = { ...userDTO }
        delete user.password;

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)


        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(400);
        expect(response.body[0]).toStrictEqual({ isDefined: 'password should not be null or undefined' })
      })

      it('Should return a BAD_REQUEST if name isn\'t in the body', async () => {
        const user = { ...userDTO }
        delete user.name;

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)


        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(400);
        expect(response.body[0]).toStrictEqual({ isDefined: 'name should not be null or undefined' })
      })

      it('Should return a BAD_REQUEST if role isn\'t in the body', async () => {
        const user = { ...userDTO }
        delete user.role;

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)


        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(400);
        expect(response.body[0]).toStrictEqual({ isDefined: 'role should not be null or undefined' })
      })

      it('Should return a CREATED if dob isn\'t in the body', async () => {
        const user = { ...userDTO }
        delete user.dob;

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(201);
        expect(response.body.success).toBeTruthy()
      })
    })

    describe('DB Validation', () => {
      let userDTO: registerUserDTO;
      beforeEach(() => userDTO = createRegisterUserDTO())

      it('Should return a CREATED and persist in DB if DTO is correct', async () => {
        const user = { ...userDTO }

        const response = await request(app)
          .post('/api/register')
          .set('Accept', 'application/json')
          .send(user)

        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.status).toEqual(201);
        expect(response.body.success).toBeTruthy()
      })
    })

  })
})