import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import app from '../index'; 
import mongoose from 'mongoose';
import User from '../modal/User'; 

jest.mock('../middleware/authMiddleware', () => ({
  authenticateUser: (req: any, res: any, next: any) => next(), 
}));

describe('POST /google-signin', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 400 if token is not provided', async () => {
    const res = await request(app)
      .post('/google-signin')
      .send({}); 

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token is required');
  });

  it('should return 200 if token is valid and user exists', async () => {
    const user = new User({
      googleId: '123',
      name: 'Test User',
      email: 'test@user.com',
      avatar: 'avatar-url',
    });

    await user.save();

    const res = await request(app)
      .post('/google-signin')
      .send({ token: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Google Sign-In successful');
    expect(res.body.data.user.email).toBe('test@user.com');
  });

  it('should create a new user if one does not exist', async () => {
    const res = await request(app)
      .post('/google-signin')
      .send({ token: 'new-user-token' }); 

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Google Sign-In successful');
    expect(res.body.data.user).toHaveProperty('email');
    expect(res.body.data.user).toHaveProperty('name');
  });

  it('should return 500 if an error occurs during user lookup', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => { throw new Error('Database Error'); });

    const res = await request(app)
      .post('/google-signin')
      .send({ token: 'valid-token' }); 

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal Server Error');
  });
});
