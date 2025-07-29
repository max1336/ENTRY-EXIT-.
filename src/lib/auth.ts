// Simple authentication system using localStorage
interface User {
  id: string;
  email: string;
  name: string;
}

class AuthService {
  private currentUser: User | null = null;
  private users: User[] = [];

  constructor() {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // Register a new user
  async register(email: string, password: string, name: string): Promise<User> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name
    };

    // Save password separately (in real app, this would be hashed)
    const userWithPassword = { ...newUser, password };
    this.users.push(userWithPassword);
    localStorage.setItem('app_users', JSON.stringify(this.users));

    return newUser;
  }

  // Login user
  async login(email: string, password: string): Promise<User> {
    const userWithPassword = this.users.find(u => u.email === email && (u as any).password === password);
    
    if (!userWithPassword) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name
    };

    this.currentUser = user;
    localStorage.setItem('current_user', JSON.stringify(user));

    return user;
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('current_user');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
export type { User };