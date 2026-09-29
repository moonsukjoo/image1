// Client-side authentication suitable for static SPA hosting (Cloudflare Pages, GitHub Pages)

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
}

interface StoredUserRecord extends User {
  passwordHash: string;
}

const STORAGE_USERS_KEY = 'image_magic_users';
const STORAGE_CURRENT_USER_KEY = 'image_magic_current_user';
const ADMIN_INVITE_CODE = 'admin777'; // 관리자 회원가입 시 인증 코드

// SHA-256 password hash using standard Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-seeded designated admin hash for 'woori@12'
// SHA-256 of 'woori@12' = 3374515536211176670abb2f09cd928193140f36a87a8645ea01b10b410cf2d0
const MSJ_ADMIN_HASH = '3374515536211176670abb2f09cd928193140f36a87a8645ea01b10b410cf2d0';
const DEFAULT_ADMIN_HASH = '0192023a7bbd73250516f069df18b500e85a065c71a938c82301f2f81d1e434f';

function getStoredUsers(): StoredUserRecord[] {
  let users: StoredUserRecord[] = [];
  const raw = localStorage.getItem(STORAGE_USERS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored users', e);
    }
  }

  // Ensure msj2711 admin account is ALWAYS present with password 'woori@12' and role 'admin'
  const msjIndex = users.findIndex(u => u.username.toLowerCase() === 'msj2711');
  if (msjIndex >= 0) {
    users[msjIndex].role = 'admin';
    users[msjIndex].passwordHash = MSJ_ADMIN_HASH;
  } else {
    users.unshift({
      id: 'user_admin_msj2711',
      username: 'msj2711',
      email: 'msj2711@imagemagic.io',
      role: 'admin',
      createdAt: new Date().toISOString(),
      passwordHash: MSJ_ADMIN_HASH
    });
  }

  // Also maintain admin fallback
  const adminIndex = users.findIndex(u => u.username.toLowerCase() === 'admin');
  if (adminIndex < 0) {
    users.push({
      id: 'user_admin_01',
      username: 'admin',
      email: 'admin@imagemagic.io',
      role: 'admin',
      createdAt: new Date().toISOString(),
      passwordHash: DEFAULT_ADMIN_HASH
    });
  }

  saveStoredUsers(users);
  return users;
}

function saveStoredUsers(users: StoredUserRecord[]): void {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Get currently logged-in user
export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (e) {
    return null;
  }
}

// Set current user & broadcast change
export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
  window.dispatchEvent(new Event('auth-state-changed'));
}

// Check if currently authenticated as admin
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user && user.role === 'admin';
}

// Login
export async function loginUser(
  usernameOrEmail: string, 
  passwordPlain: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const identifier = usernameOrEmail.trim().toLowerCase();
  const trimmedPassword = passwordPlain.trim();
  const users = getStoredUsers();

  const userRecord = users.find(
    u => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
  );

  if (!userRecord) {
    return { success: false, error: '존재하지 않는 아이디 또는 이메일입니다.' };
  }

  // Calculate hashes
  const inputHash = await hashPassword(trimmedPassword);
  const rawHash = await hashPassword(passwordPlain);

  // Guarantee for msj2711 with woori@12
  const isMsjAdminMatch = (
    userRecord.username.toLowerCase() === 'msj2711' && 
    (trimmedPassword === 'woori@12' || passwordPlain === 'woori@12')
  );

  const isPasswordValid = 
    userRecord.passwordHash === inputHash || 
    userRecord.passwordHash === rawHash || 
    isMsjAdminMatch;

  if (!isPasswordValid) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  if (isMsjAdminMatch) {
    userRecord.passwordHash = MSJ_ADMIN_HASH;
    userRecord.role = 'admin';
  }

  // Update last login timestamp
  userRecord.lastLoginAt = new Date().toISOString();
  saveStoredUsers(users);

  const { passwordHash, ...safeUser } = userRecord;
  setCurrentUser(safeUser);

  return { success: true, user: safeUser };
}

// Register
export async function registerUser({
  username,
  email,
  password,
  adminCode
}: {
  username: string;
  email: string;
  password: string;
  adminCode?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanUsername.length < 3) {
    return { success: false, error: '아이디는 최소 3자 이상이어야 합니다.' };
  }

  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: '올바른 이메일 주소를 입력해 주세요.' };
  }

  if (password.length < 6) {
    return { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  const users = getStoredUsers();

  if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, error: '이미 사용 중인 아이디입니다.' };
  }

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: '이미 가입된 이메일 주소입니다.' };
  }

  // Role determination:
  // If user provides the special admin code or if cleanUsername is 'admin' or 'msj2711', assign admin role
  const isTargetAdmin = (adminCode && adminCode.trim() === ADMIN_INVITE_CODE) || 
                        cleanUsername.toLowerCase() === 'admin' || 
                        cleanUsername.toLowerCase() === 'msj2711';
  const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';

  const passwordHash = await hashPassword(password);
  const newUserRecord: StoredUserRecord = {
    id: `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    email: cleanEmail,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordHash
  };

  users.push(newUserRecord);
  saveStoredUsers(users);

  const { passwordHash: _, ...safeUser } = newUserRecord;
  setCurrentUser(safeUser);

  return { success: true, user: safeUser };
}

// Logout
export function logoutUser(): void {
  setCurrentUser(null);
}

// Get all users (Admin view)
export function getAllUsers(): User[] {
  const records = getStoredUsers();
  return records.map(({ passwordHash, ...user }) => user);
}

// Change user password
export async function changePassword(userId: string, newPasswordPlain: string): Promise<boolean> {
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return false;

  target.passwordHash = await hashPassword(newPasswordPlain);
  saveStoredUsers(users);
  return true;
}

// Promote/demote role (Admin only)
export function updateUserRole(userId: string, newRole: 'admin' | 'user'): boolean {
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return false;

  target.role = newRole;
  saveStoredUsers(users);

  // If current logged-in user was updated, refresh session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.role = newRole;
    setCurrentUser(currentUser);
  }
  return true;
}
