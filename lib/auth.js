import usersData from '@/data/users.json';

const SESSION_KEY = 'perpus_session';
const USERS_KEY = 'perpus_users_local';

// --- FUNGSI LOGIN ---
export async function login(credentials) {
  // Simulasi loading biar terasa kayak aplikasi beneran
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. Ambil user bawaan dari JSON (Admin/Member lama)
  let user = usersData.find(u => u.email === credentials.email && u.password === credentials.password);

  // 2. Jika tidak ketemu, cari di LocalStorage (Member yang baru daftar lewat web)
  if (!user && typeof window !== 'undefined') {
    const localUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    user = localUsers.find(u => u.email === credentials.email && u.password === credentials.password);
  }

  // 3. Jika ketemu, simpan sesi
  if (user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      // Kabari komponen lain (seperti Navbar) bahwa ada yang login
      window.dispatchEvent(new Event('storage'));
    }
    return user;
  }
  
  throw new Error('Email atau password salah!');
}

// --- FUNGSI REGISTER ---
export async function register(data) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Cek apakah email sudah ada
  const existingUser = usersData.find(u => u.email === data.email);
  if (existingUser) throw new Error('Email sudah terdaftar!');

  const newUser = {
    id: 'usr-' + Date.now(),
    ...data,
    role: 'member',
    noAnggota: 'MBR-' + Math.floor(1000 + Math.random() * 9000), // Generate nomor anggota
    createdAt: new Date().toISOString()
  };

  // Simpan user baru ke browser (LocalStorage)
  if (typeof window !== 'undefined') {
    const localUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Cek duplikat di local storage juga
    if (localUsers.find(u => u.email === data.email)) {
      throw new Error('Email sudah terdaftar!');
    }

    localUsers.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
  }
  
  return newUser;
}

// --- FUNGSI LOGOUT ---
export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('storage'));
  }
  return true;
}

// --- CEK SESI (SIAPA YG LOGIN?) ---
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}
