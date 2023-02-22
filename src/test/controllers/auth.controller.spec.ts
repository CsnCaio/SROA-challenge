import * as request from 'supertest'

describe('Auth Controller Tests', () => {

  describe('Sign Up', () => {

    describe('DTO Validation', () => {
      it.todo('Should return a BAD_REQUEST if e-mail isn\'t in the body')
      it.todo('Should return a BAD_REQUEST if password isn\'t in the body')
      it.todo('Should return a BAD_REQUEST if name isn\'t in the body')
      it.todo('Should return an OK if dob isn\'t in the body')
      it.todo('Should return a BAD_REQUEST if role isn\'t in the body')
    })

    it.todo('Should return an OK and persist in DB if DTO is correct')
  })
})