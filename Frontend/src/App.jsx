import Home from "./pages/MoodMusixPlayer";
import axios from "./api/axiosInstance";
import { useEffect, useState } from "react";
import Auth from "./pages/Auth";
import { Routes, Route, Navigate } from "react-router-dom";
import SongCreate from "./pages/SongCreate";
// ...existing code...

const ProtectedRoute = ({ user, children }) => {
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/auth/user")
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setUser(null);
        setLoading(false);
      });
  }, []);
  

  return (
    <>
      {/* Logout Button */}
      {user && !loading && (
        <div style={{ position: 'fixed', top: 20, right: 30, zIndex: 1000 }}>
          <button
            onClick={async () => {
              try {
                await axios.post('/auth/logout');
                setUser(null);
              } catch (err) {
                alert('Logout failed');
              }
            }}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Logout
          </button>
        </div>
      )}
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loader" style={{ marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" stroke="#6366f1" strokeWidth="4" strokeDasharray="100" strokeDashoffset="60"/>
              </svg>
            </div>
            <div style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '1.2rem' }}>Loading user...</div>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/" replace /> : <Auth setUser={setUser} />
            }
          />
          <Route
            path="/create-song"
            element={
              <ProtectedRoute user={user}>
                <SongCreate />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

export default App;
