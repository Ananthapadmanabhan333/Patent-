import { useState, useEffect } from 'react';
import { Save, User as UserIcon, Shield, Mail, Building } from 'lucide-react';
import { useAuthStore } from '../../store';

export const SettingsView = () => {
    const { user, updateUser } = useAuthStore();

    // Local state for the form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        orgId: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initialize form with current store user data
    useEffect(() => {
        setFormData({
            fullName: user?.fullName || 'Demo User',
            email: user?.email || 'demo@patentiq.ai',
            role: user?.role || 'Enterprise Plan',
            orgId: user?.orgId || 'ORG-8X99A'
        });
    }, [user]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        // Simulate API saving the profile
        setTimeout(() => {
            // Update the global Zustand store
            updateUser({
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                orgId: formData.orgId
            });
            setIsSaving(false);
            setSaveSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Account Settings</h2>
                <p className="text-sm text-gray-400 mt-1">Manage your enterprise profile, billing plan, and API configurations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Profile Form */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-brand-500" />
                        Personal Information
                    </h3>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Job Title / Role</label>
                                <div className="relative">
                                    <Shield className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Organization ID</label>
                                <div className="relative">
                                    <Building className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        name="orgId"
                                        value={formData.orgId}
                                        onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                                        className="input-field pl-10"
                                        readOnly
                                    />
                                </div>
                                <p className="text-xs text-brand-500/80 mt-1">Contact support to change Org ID.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-dark-border flex items-center justify-between">
                            <div>
                                {saveSuccess && (
                                    <span className="text-emerald-400 text-sm flex items-center">
                                        <Shield className="w-4 h-4 mr-1" />
                                        Profile updated successfully
                                    </span>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-primary flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Subscription</h3>
                        <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-brand-400">Enterprise Plan</span>
                                <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">Active</span>
                            </div>
                            <p className="text-sm text-gray-300">Renews on Jan 1, 2027</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
