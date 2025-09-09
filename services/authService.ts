import type { User } from '../types';

const USER_KEY = 'artisan_users';
const SESSION_KEY = 'artisan_session';

// In a real app, you would never store passwords in plain text.
// This is for demonstration purposes only.
const getUsers = (): Record<string, Omit<User, 'id'> & { password: string }> => {
    const users = localStorage.getItem(USER_KEY);
    return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, Omit<User, 'id'> & { password: string }>) => {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
};

export const authService = {
    async signup(name: string, email: string, password: string, bio: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                if (users[email]) {
                    return reject(new Error('User with this email already exists.'));
                }
                const newUser: User = { id: Date.now().toString(), name, email, bio };
                users[email] = { name, email, password, bio };
                saveUsers(users);
                localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
                resolve(newUser);
            }, 500);
        });
    },

    async login(email: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                const storedUser = users[email];
                if (storedUser && storedUser.password === password) {
                    const sessionUser: User = { id: Date.now().toString(), name: storedUser.name, email: storedUser.email, bio: storedUser.bio };
                    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
                    resolve(sessionUser);
                } else {
                    reject(new Error('Invalid email or password.'));
                }
            }, 500);
        });
    },

    async updateUser(currentEmail: string, updatedData: { name: string; email: string; bio: string }): Promise<User> {
        return new Promise((resolve, reject) => {
             setTimeout(() => {
                const users = getUsers();
                const currentUserData = users[currentEmail];

                if (!currentUserData) {
                    return reject(new Error("User not found. Please log out and log back in."));
                }
                
                // Check if the new email is already taken by another user
                if (currentEmail !== updatedData.email && users[updatedData.email]) {
                    return reject(new Error('This email address is already in use by another account.'));
                }

                const updatedUserRecord = {
                    ...currentUserData,
                    ...updatedData,
                };
                
                // If email has changed, we need to update the key in our 'database'
                if (currentEmail !== updatedData.email) {
                    delete users[currentEmail];
                }
                
                users[updatedData.email] = updatedUserRecord;
                saveUsers(users);

                const newSessionUser: User = {
                    id: this.getCurrentUser()?.id || Date.now().toString(), // Keep the same session ID
                    name: updatedData.name,
                    email: updatedData.email,
                    bio: updatedData.bio
                };
                
                localStorage.setItem(SESSION_KEY, JSON.stringify(newSessionUser));
                resolve(newSessionUser);
             }, 500);
        });
    },

    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser(): User | null {
        const user = localStorage.getItem(SESSION_KEY);
        return user ? JSON.parse(user) : null;
    }
};