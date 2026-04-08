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
import { LogIn } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
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
            toast.success('Đăng nhập thành công');

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <LogIn className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
                                <p className="text-slate-600">Truy cập vào tài khoản của bạn</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="email@husc.edu.vn"
                                        className="mt-1.5"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="mt-1.5"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-600">
                                    Chưa có tài khoản?{' '}
                                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
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