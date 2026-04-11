// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Hozircha oddiy: faqat login tekshiradi
  const user = localStorage.getItem('user'); // yoki o'zingizning auth usuli

  if (!user) return <Navigate to="/login" />;

  return children;
}