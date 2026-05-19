import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    orgId?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (userUpdates: Partial<User>) => void;
}

// Helper to safely parse JSON from localStorage
const getInitialUser = (): User | null => {
    try {
        const item = localStorage.getItem('patentiq_user');
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    user: getInitialUser(),
    token: localStorage.getItem('patentiq_token'),
    isAuthenticated: !!localStorage.getItem('patentiq_token'),

    login: (user, token) => {
        localStorage.setItem('patentiq_token', token);
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('patentiq_token');
        localStorage.removeItem('patentiq_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (userUpdates) => {
        set((state) => {
            const updatedUser = state.user ? { ...state.user, ...userUpdates } : (userUpdates as User);
            // Optionally persist the user profile update if your app requires storing local profile state.
            // Since this is a demo, we rely on Zustand memory state unless we stringify to localStorage:
            if (updatedUser) {
                localStorage.setItem('patentiq_user', JSON.stringify(updatedUser));
            }
            return { user: updatedUser };
        });
    },
}));

interface AppState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    activeAnalysisId: string | null;
    setActiveAnalysis: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    activeAnalysisId: null,
    setActiveAnalysis: (id) => set({ activeAnalysisId: id }),
}));
