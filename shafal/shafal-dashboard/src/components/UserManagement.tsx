"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, User, Key, Mail } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "geographic-map", label: "Geographic Map" },
    { id: "indicators", label: "Indicator Progress" },
    { id: "data", label: "Beneficiary Records" },
    { id: "users", label: "User Management" }
];

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Viewer",
        permissions: [] as string[]
    });

    const fetchUsers = async () => {
        try {
            // Mock users for static export
            const mockUsers = [
                { "id": "1", "name": "Admin User", "email": "admin@shafal.org", "role": "Admin", "permissions": ["dashboard", "indicators", "geographic-map", "data", "case-stories", "archive", "uncdf", "remittance", "users"] },
                { "id": "2", "name": "City Bank", "email": "cbl@shafal.org", "role": "CBL", "permissions": ["dashboard", "indicators", "geographic-map", "data"] },
                { "id": "3", "name": "UNCDF", "email": "uncdf@shafal.org", "role": "UNCDF", "permissions": ["dashboard", "indicators", "geographic-map", "data", "case-stories", "archive", "uncdf", "remittance"] },
                { "id": "4", "name": "Swiss Contact", "email": "swiss@shafal.org", "role": "Swiss", "permissions": ["dashboard", "geographic-map", "indicators", "case-stories"] }
            ];
            setUsers(mockUsers);
        } catch (e) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const method = editingUser ? 'PUT' : 'POST';
        const body = editingUser ? { ...formData, id: editingUser.id } : formData;

        try {
            const res = await fetch('/api/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowModal(false);
                fetchUsers();
            } else {
                alert("Error saving user");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: "", // don't load existing password
                role: user.role,
                permissions: user.permissions || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "Viewer",
                permissions: ["dashboard"]
            });
        }
        setShowModal(true);
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => {
            if (prev.permissions.includes(permId)) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...prev.permissions, permId] };
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">User & Role Management</h2>
                    <p className="text-sm text-slate-500">Manage system access and sidebar permissions.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm h-9"
                >
                    <Plus className="w-4 h-4 mr-2" /> New User
                </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-40"><span className="text-slate-400">Loading...</span></div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {users.map(user => (
                            <div key={user.id} className="border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{user.name}</h3>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(user)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                        <Shield className="w-3 h-3 mr-1" /> {user.role}
                                    </span>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(user.permissions || []).map((p: string) => (
                                            <span key={p} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200">
                                                {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{editingUser ? "Edit User" : "Create User"}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Admin, Viewer, etc." />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="user@example.com" />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Password {editingUser && "(Leave blank to keep)"}</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input required={!editingUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="********" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-600 mb-3 uppercase">Menu Permissions</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.permissions.includes(perm.id)} 
                                                onChange={() => togglePermission(perm.id)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
