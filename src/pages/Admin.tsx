import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
// Ensure these icons are installed: npm install lucide-react
import { CheckCircle, Shield, Users, FileText, Lock, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Admin() {
  // Using 'any' for now to stop TypeScript from throwing errors about missing fields
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isUnlocked) return;

    // Fetch Ads - Simplified query
    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
    });

    return () => { unsubAds(); unsubUsers(); };
  }, [isUnlocked]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "z@gmail.com" && password === "admin1234") {
      setIsUnlocked(true);
      toast.success('Dashboard Unlocked');
    } else {
      toast.error('Invalid Credentials');
    }
  };

  const handleApproveAd = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { status: 'active' });
      toast.success('Ad Approved!');
    } catch (e) { toast.error('Error'); }
  };

  const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerified: !currentStatus });
      toast.success('User Updated');
    } catch (e) { toast.error('Update Failed'); }
  };

  if (!isUnlocked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <form onSubmit={handleAdminLogin} style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>Admin Login</h2>
          <input type="email" placeholder="Email" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '0.5rem' }} value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{ width: '100%', background: '#15803d', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Panel</h1>
        <div>
          <button onClick={() => setActiveTab('ads')} style={{ padding: '0.5rem 1rem', marginRight: '0.5rem', background: activeTab === 'ads' ? '#15803d' : '#eee', color: activeTab === 'ads' ? 'white' : 'black', borderRadius: '0.5rem', border: 'none' }}>Ads</button>
          <button onClick={() => setActiveTab('users')} style={{ padding: '0.5rem 1rem', background: activeTab === 'users' ? '#15803d' : '#eee', color: activeTab === 'users' ? 'white' : 'black', borderRadius: '0.5rem', border: 'none' }}>Users</button>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '1rem', overflow: 'hidden' }}>
        {activeTab === 'ads' ? (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Seller</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{ad.id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{ad.title}</td>
                  <td style={{ padding: '1rem' }}>{ad.sellerName || 'Unknown'}</td>
                  <td style={{ padding: '1rem' }}>
                    {ad.status === 'pending' && <button onClick={() => handleApproveAd(ad.id)} style={{ color: 'green', background: 'none', border: 'none', cursor: 'pointer' }}><CheckCircle /></button>}
                    <Link to={`/ad/${ad.id}`} style={{ marginLeft: '0.5rem', color: 'blue' }}><ExternalLink /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Verify</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.displayName || 'User'}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleVerifyUser(u.uid, !!u.isVerified)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ShieldCheck style={{ color: u.isVerified ? 'blue' : '#ccc' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}