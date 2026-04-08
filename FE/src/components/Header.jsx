import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import { Menu, X, LogOut, Bell, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
    const { isAuthenticated, currentUser, userRole, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        const fetchUnreadCount = async () => {
            try {
                const result = await pb.collection('notifications').getList(1, 1, {
                    filter: `user_id="${currentUser.id}" && is_read=false`,
                    $autoCancel: false,
                });
                setUnreadCount(result.totalItems);
            } catch (error) {
                console.error('Error fetching notifications count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, [isAuthenticated, currentUser]);

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const NavLinks = () => (
        <>
            {isAuthenticated && (
                <>
                    <Link to="/qa" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant={location.pathname === '/qa' ? 'default' : 'ghost'} className="gap-2 w-full justify-start md:w-auto md:justify-center">
                            <HelpCircle className="w-4 h-4" />
                            Hỏi đáp
                        </Button>
                    </Link>

                    {userRole === 'student' && (
                        <Link to="/student-dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant={location.pathname === '/student-dashboard' ? 'default' : 'ghost'} className="w-full justify-start md:w-auto md:justify-center">
                                Bảng điều khiển
                            </Button>
                        </Link>
                    )}
                    {userRole === 'admin' && (
                        <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant={location.pathname === '/admin-dashboard' ? 'default' : 'ghost'} className="w-full justify-start md:w-auto md:justify-center">
                                Quản trị
                            </Button>
                        </Link>
                    )}
                </>
            )}
        </>
    );

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="https://horizons-cdn.hostinger.com/1e6c14a0-cc3e-4d18-8dc1-4875e2304bc8/44a321d85dc17c47847ba39797db687c.png"
                            alt="HUSC Logo"
                            className="h-10 w-auto"
                        />
                        <span className="font-bold text-lg text-slate-900 hidden sm:block">
                            HUSC Lost & Found
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2 lg:gap-4">
                        <NavLinks />

                        {!isAuthenticated ? (
                            <div className="flex items-center gap-2 ml-4 border-l pl-4 border-slate-200">
                                <Link to="/login">
                                    <Button variant="ghost">Đăng nhập</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Đăng ký</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-4 border-l pl-4 border-slate-200">
                                <Link to="/notifications" className="relative p-2 text-slate-600 hover:text-primary transition-colors rounded-full hover:bg-slate-100">
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <span className="text-sm text-slate-600 hidden lg:block">
                                    Xin chào, <span className="font-medium text-slate-900">{currentUser?.name || currentUser?.email}</span>
                                </span>

                                <Button variant="outline" onClick={handleLogout} className="gap-2 ml-2">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden lg:inline">Đăng xuất</span>
                                </Button>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 md:hidden">
                        {isAuthenticated && (
                            <Link to="/notifications" className="relative p-2 text-slate-600">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <nav className="flex flex-col gap-2">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            Đăng nhập
                                        </Button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full justify-start">Đăng ký</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="px-4 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg mb-2">
                                        Xin chào, <span className="font-medium text-slate-900">{currentUser?.name || currentUser?.email}</span>
                                    </div>
                                    <NavLinks />
                                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2 mt-2 text-destructive hover:text-destructive">
                                        <LogOut className="w-4 h-4" />
                                        Đăng xuất
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;