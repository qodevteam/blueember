// 📦 Mock Database Client (LocalStorage)
// Simulates a real database for offline/demo functionality

const DB = {
    // Keys
    USERS_KEY: 'be_users',
    SESSION_KEY: 'be_session',
    ORDERS_KEY: 'be_orders',

    // --- Auth Methods ---

    // Sign Up: Create a new user
    signUp: async (email, password, fullName) => {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));

        const users = DB.getUsers();
        if (users.find(u => u.email === email)) {
            return { error: { message: 'User already exists' } };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email,
            password, // In a real app, this should be hashed!
            user_metadata: { full_name: fullName },
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        DB.saveUsers(users);

        // Auto Login
        DB.setSession(newUser);
        return { data: { user: newUser }, error: null };
    },

    // Sign In: Find user by credentials
    signInWithPassword: async ({ email, password }) => {
        await new Promise(r => setTimeout(r, 800));

        const users = DB.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { error: { message: 'Invalid email or password' } };
        }

        DB.setSession(user);
        return { data: { user }, error: null };
    },

    // Sign Out: Clear session
    signOut: async () => {
        localStorage.removeItem(DB.SESSION_KEY);
        return { error: null };
    },

    // Get Current Session
    getSession: async () => {
        const userStr = localStorage.getItem(DB.SESSION_KEY);
        if (!userStr) return { data: { session: null } };
        return { data: { session: { user: JSON.parse(userStr) } } };
    },

    // Get User Data (Mocking supabase.auth.getUser())
    getUser: async () => {
        const userStr = localStorage.getItem(DB.SESSION_KEY);
        if (!userStr) return { data: { user: null } };
        return { data: { user: JSON.parse(userStr) } };
    },

    // --- Data Helpers ---

    getUsers: () => {
        return JSON.parse(localStorage.getItem(DB.USERS_KEY) || '[]');
    },

    saveUsers: (users) => {
        localStorage.setItem(DB.USERS_KEY, JSON.stringify(users));
    },

    setSession: (user) => {
        localStorage.setItem(DB.SESSION_KEY, JSON.stringify(user));
    },

    // --- Order Methods ---

    // Get orders for current user
    getMyOrders: () => {
        const user = JSON.parse(localStorage.getItem(DB.SESSION_KEY));
        if (!user) return [];
        const allOrders = JSON.parse(localStorage.getItem(DB.ORDERS_KEY) || '[]');
        return allOrders.filter(o => o.user_id === user.id);
    },

    // Create a new order
    createOrder: (orderData) => {
        const user = JSON.parse(localStorage.getItem(DB.SESSION_KEY));
        if (!user) return null;

        const allOrders = JSON.parse(localStorage.getItem(DB.ORDERS_KEY) || '[]');
        const newOrder = {
            id: 'ord_' + Date.now(),
            user_id: user.id,
            ...orderData,
            status: 'Processing',
            created_at: new Date().toISOString()
        };
        allOrders.unshift(newOrder); // Add to top
        localStorage.setItem(DB.ORDERS_KEY, JSON.stringify(allOrders));
        return newOrder;
    }
};

// Expose globally as 'supabase' to mimic the previous API structure (partially)
// or just as 'DB' for cleaner usage. We'll use 'DB' in our new scripts.
window.DB = DB;

// Log initialization
console.log('✅ Mock Database (LocalStorage) Initialized');
window.dispatchEvent(new CustomEvent('dbReady'));
