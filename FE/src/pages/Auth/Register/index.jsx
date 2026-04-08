import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'student',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setLoading(true);

        try {
            const user = await signup(formData.email, formData.password, formData.name, formData.role);
            toast.success('Đăng ký thành công');

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Đăng ký - HUSC Lost & Found</title>
                <meta name="description" content="Tạo tài khoản mới trong hệ thống tìm đồ thất lạc của Đại học Khoa học Huế" />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Header />

                <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký tài khoản</h1>
                                <p className="text-slate-600">Tạo tài khoản mới để sử dụng hệ thống</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nguyễn Văn A"
                                        className="mt-1.5"
                                    />
                                </div>

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
                                    <Label htmlFor="role">Vai trò</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Sinh viên</SelectItem>
                                            <SelectItem value="admin">Quản trị viên</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <p className="text-xs text-slate-500 mt-1">Tối thiểu 8 ký tự</p>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="mt-1.5"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-600">
                                    Đã có tài khoản?{' '}
                                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Đăng nhập
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

export default SignupPage;