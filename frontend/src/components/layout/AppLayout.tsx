import { Outlet, NavLink } from 'react-router-dom';
import {
    ShieldAlert, Upload, Search, FileText,
    Settings, Menu, Bell, PieChart as PieChartIcon
} from 'lucide-react';
import { useAppStore, useAuthStore } from '../../store';
import clsx from 'clsx';

const AppLayout = () => {
    const { isSidebarOpen, toggleSidebar } = useAppStore();
    const { user } = useAuthStore();

    const navItems = [
        { to: '/dashboard', icon: <PieChartIcon className="w-5 h-5 mr-3" />, label: 'Dashboard' },
        { to: '/analysis/new', icon: <Upload className="w-5 h-5 mr-3" />, label: 'New Analysis' },
        { to: '/search', icon: <Search className="w-5 h-5 mr-3" />, label: 'Prior Art Search' },
        { to: '/reports', icon: <FileText className="w-5 h-5 mr-3" />, label: 'Reports' },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-dark-bg text-gray-100 font-sans">

            {/* Sidebar */}
            <aside className={clsx(
                "bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300",
                isSidebarOpen ? "w-64" : "w-20 lg:w-64 overflow-hidden"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-dark-border shrink-0">
                    <ShieldAlert className="w-8 h-8 text-brand-500 mr-2 shrink-0" />
                    <span className="text-xl font-bold tracking-wide text-white truncate">PatentIQ</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto hidden-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => clsx(
                                "w-full flex items-center px-4 py-3 rounded-lg transition-colors truncate",
                                isActive ? "bg-brand-600/20 text-brand-400" : "hover:bg-gray-800 text-gray-400"
                            )}
                        >
                            {item.icon}
                            <span className={clsx("transition-opacity duration-200", !isSidebarOpen && "lg:block hidden")}>
                                {item.label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-dark-border shrink-0">
                    <NavLink to="/settings" className="bg-gray-800/50 rounded-lg p-2 flex items-center cursor-pointer hover:bg-gray-800 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold shrink-0">
                            {user?.fullName?.charAt(0) || 'D'}
                        </div>
                        <div className={clsx("ml-3 overflow-hidden transition-opacity duration-200", !isSidebarOpen && "lg:block hidden")}>
                            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'Demo User'}</p>
                            <p className="text-xs text-brand-400 truncate">{user?.role || 'Enterprise Plan'}</p>
                        </div>
                    </NavLink>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden">

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 bg-dark-card/50 backdrop-blur-md border-b border-dark-border shrink-0 z-20">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 mr-4 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold capitalize hidden sm:block">
                            Intelligence Platform
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-dark-card"></span>
                        </button>
                        <NavLink to="/settings" className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                            <Settings className="w-5 h-5" />
                        </NavLink>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AppLayout;
