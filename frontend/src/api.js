import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Har bir so'rovga avtomatik token qo'shish
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token muddati tugasa — avtomatik chiqish
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ─── CHALLENGES ───────────────────────────────────────────
export const getChallenges = (params) => API.get('/challenges', { params });
export const getChallenge = (id) => API.get(`/challenges/${id}`);
export const createChallenge = (data) => API.post('/challenges', data);
export const joinChallenge = (id) => API.post(`/challenges/${id}/join`);
export const getMyChallenges = () => API.get('/challenges/my/active');

// ─── PROGRESS ─────────────────────────────────────────────
export const completeDaily = (data) => API.post('/progress/daily', data);
export const getMyProgress = () => API.get('/progress/my');
export const getAnalytics = () => API.get('/progress/analytics');
export const getStreak = () => API.get('/progress/streak');

// ─── COMMUNITY ────────────────────────────────────────────
export const getFeed = () => API.get('/community/feed');
export const createPost = (data) => API.post('/community/posts', data);
export const likePost = (id) => API.post(`/community/posts/${id}/like`);
export const getLeaderboard = () => API.get('/community/leaderboard');

// ─── ACHIEVEMENTS ─────────────────────────────────────────
export const getAchievements = () => API.get('/achievements');
export const getMyAchievements = () => API.get('/achievements/my');

// ─── RECOMMENDATIONS ──────────────────────────────────────
export const getRecommendations = () => API.get('/recommendations');
export const getTrending = () => API.get('/recommendations/trending');

export default API;
