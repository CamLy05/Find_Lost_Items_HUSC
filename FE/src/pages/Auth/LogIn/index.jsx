import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            toast.success('Đăng nhập thành công! Chào mừng bạn quay trở lại.');

            // Điều hướng dựa trên vai trò (role)
            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Đăng nhập - HUSC Lost & Found</title>
                <meta name="description" content="Đăng nhập vào hệ thống tìm đồ thất lạc của Đại học Khoa học Huế" />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Header />

                <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 transition-all hover:shadow-2xl">

                            {/* Logo & Tiêu đề */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                                    <LogIn className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
                                <p className="text-slate-500">Sử dụng tài khoản HUSC của bạn</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Trường Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email sinh viên</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="username@husc.edu.vn"
                                            className="pl-10 h-11 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Trường Mật khẩu */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="pl-10 h-11 focus-visible:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Nút Đăng nhập */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang xử lý...
                                        </div>
                                    ) : 'Đăng nhập'}
                                </Button>
                            </form>

                            {/* Link đăng ký */}
                            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                    Chưa có tài khoản?{' '}
                                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default LoginPage;