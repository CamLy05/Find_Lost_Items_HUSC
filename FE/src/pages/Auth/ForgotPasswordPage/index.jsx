import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbase'; // Đảm bảo bạn đã export instance pocketbase
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // PocketBase xử lý việc gửi email reset mật khẩu rất đơn giản
            // Nó sẽ gửi mail dựa trên template trong Admin Dashboard của bạn
            await pb.collection('users').requestPasswordReset(email);

            setIsSubmitted(true);
            toast.success('Gửi yêu cầu thành công!');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Email không tồn tại hoặc lỗi hệ thống.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Quên mật khẩu - HUSC Lost & Found</title>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Header />

                <div className="flex-1 flex items-center justify-center py-12 px-4">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100 transition-all">

                            {!isSubmitted ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <KeyRound className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quên mật khẩu?</h1>
                                        <p className="text-slate-500 text-sm">
                                            Đừng lo lắng, hãy nhập email tài khoản HUSC của bạn bên dưới.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email đăng ký</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="23t102... @husc.edu.vn"
                                                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...
                                                </span>
                                            ) : 'Gửi liên kết đặt lại'}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                /* Giao diện sau khi gửi thành công cực kỳ thân thiện */
                                <div className="text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Kiểm tra Email</h2>
                                    <p className="text-slate-600 mb-6 leading-relaxed">
                                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến: <br />
                                        <span className="font-bold text-slate-900">{email}</span>
                                    </p>
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-sm mb-8">
                                        Nếu không thấy email trong vài phút, hãy kiểm tra hòm thư <strong>Spam (Thư rác)</strong>.
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl"
                                        onClick={() => setIsSubmitted(false)}
                                    >
                                        Dùng email khác
                                    </Button>
                                </div>
                            )}

                            <div className="mt-8 text-center pt-6 border-t border-slate-50">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default ForgotPasswordPage;