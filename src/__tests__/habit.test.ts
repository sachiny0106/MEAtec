import request from 'supertest';
import app from '../app';
import { connectTestDB, closeTestDB, clearTestDB } from './setup';

describe('Habit Routes', () => {
  let token: string;
  let habitId: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await closeTestDB();
  });

  describe('POST /api/habits', () => {
    it('should create a new habit', async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Exercise',
          description: 'Daily workout',
          frequency: 'daily',
          tags: ['health'],
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Exercise');
      expect(res.body.tags).toContain('health');
      habitId = res.body._id;
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .post('/api/habits')
        .send({
          title: 'Exercise',
          frequency: 'daily',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/habits', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Habit 1', frequency: 'daily', tags: ['health'] });

      await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Habit 2', frequency: 'weekly', tags: ['work'] });
    });

    it('should get all habits', async () => {
      const res = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.habits).toHaveLength(2);
      expect(res.body.page).toBe(1);
    });

    it('should filter by tag', async () => {
      const res = await request(app)
        .get('/api/habits?tag=health')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.habits).toHaveLength(1);
      expect(res.body.habits[0].title).toBe('Habit 1');
    });
  });

  describe('POST /api/habits/:id/track', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Exercise', frequency: 'daily' });

      habitId = res.body._id;
    });

    it('should track habit and update streak', async () => {
      const res = await request(app)
        .post(`/api/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.streak).toBe(1);
      expect(res.body.longestStreak).toBe(1);
    });

    it('should not allow tracking twice on same day', async () => {
      await request(app)
        .post(`/api/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .post(`/api/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Habit already tracked for today');
    });
  });

  describe('GET /api/habits/:id/history', () => {
    beforeEach(async () => {
      const habitRes = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Exercise', frequency: 'daily' });

      habitId = habitRes.body._id;

      await request(app)
        .post(`/api/habits/${habitId}/track`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should get habit history', async () => {
      const res = await request(app)
        .get(`/api/habits/${habitId}/history`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].completed).toBe(true);
    });
  });

  describe('PUT /api/habits/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Exercise', frequency: 'daily' });

      habitId = res.body._id;
    });

    it('should update habit', async () => {
      const res = await request(app)
        .put(`/api/habits/${habitId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Morning Jog' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Morning Jog');
    });
  });

  describe('DELETE /api/habits/:id', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/habits')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Exercise', frequency: 'daily' });

      habitId = res.body._id;
    });

    it('should delete habit', async () => {
      const res = await request(app)
        .delete(`/api/habits/${habitId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Habit removed');
    });
  });
});
