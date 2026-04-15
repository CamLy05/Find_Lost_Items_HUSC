import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Search, FileText, CheckCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const HomePage = () => {
    const { isAuthenticated, userRole } = useAuth();

    return (
        <>
            <Helmet>
                <title>HUSC Lost & Found - Hệ thống tìm đồ thất lạc</title>
                <meta name="description" content="Hệ thống tìm đồ thất lạc của Đại học Khoa học Huế. Đăng bài và tìm kiếm đồ vật bị mất một cách nhanh chóng và hiệu quả." />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-[#f8fafc]">
                <Header />

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"></div>
                            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-100/40 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                                {/* Left Content */}
                                <div className="lg:col-span-7 text-center lg:text-left space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 animate-fade-in">
                                        <ShieldCheck className="w-4 h-4" />
                                        Hệ thống chính thức dành cho sinh viên HUSC
                                    </div>

                                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                                        Tìm lại đồ thất lạc <br />
                                        <span className="text-blue-600">dễ dàng hơn bao giờ hết</span>
                                    </h1>

                                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                        Nền tảng kết nối thông minh giúp sinh viên Đại học Khoa học Huế đăng tin và tìm lại tài sản bị mất một cách nhanh chóng, minh bạch và hoàn toàn miễn phí.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                        {!isAuthenticated ? (
                                            <>
                                                <Link to="/signup">
                                                    <Button size="xl" className="w-full sm:w-auto px-8 py-7 text-lg rounded-2xl shadow-blue-200 shadow-lg hover:shadow-xl transition-all">
                                                        Bắt đầu ngay
                                                        <ArrowRight className="ml-2 w-5 h-5" />
                                                    </Button>
                                                </Link>
                                                <Link to="/login">
                                                    <Button size="xl" variant="outline" className="w-full sm:w-auto px-8 py-7 text-lg rounded-2xl bg-white/50 backdrop-blur-sm">
                                                        Đăng nhập
                                                    </Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <Link to={userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard'}>
                                                <Button size="xl" className="px-10 py-7 text-lg rounded-2xl shadow-lg">
                                                    Vào Dashboard của bạn
                                                    <ArrowRight className="ml-2 w-5 h-5" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Right Image/Logo */}
                                <div className="lg:col-span-5 relative group">
                                    <div className="relative z-10 w-full animate-float">
                                        <img
                                            src="https://horizons-cdn.hostinger.com/1e6c14a0-cc3e-4d18-8dc1-4875e2304bc8/44a321d85dc17c47847ba39797db687c.png"
                                            alt="HUSC Lost and Found Logo"
                                            className="w-full max-w-[420px] mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    {/* Glassmorphism card decoration */}
                                    <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white hidden md:block animate-bounce-slow">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Trạng thái</p>
                                                <p className="text-sm font-bold text-slate-800">Hoạt động 24/7</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How it works Section */}
                    <section className="py-24 bg-white border-y border-slate-100 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16 space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                    Quy trình hoạt động đơn giản
                                </h2>
                                <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                                {/* Feature 1 */}
                                <div className="group p-10 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                                        <FileText className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Đăng tin tìm đồ</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        Bạn bị mất đồ hoặc nhặt được đồ? Chỉ cần vài phút để mô tả, tải ảnh và để lại thông tin liên hệ. Bài đăng sẽ được đội ngũ hỗ trợ duyệt nhanh trong ngày.
                                    </p>
                                </div>

                                {/* Feature 2 */}
                                <div className="group p-10 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300">
                                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-200 group-hover:-rotate-6 transition-transform">
                                        <Search className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Tìm kiếm thông tin</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        Sử dụng bộ lọc thông minh để tìm kiếm theo loại đồ vật hoặc khu vực trong trường. Kết nối trực tiếp với người nhặt/mất thông qua hệ thống bảo mật.
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-20">
                                {[
                                    { label: 'Chi phí', value: '100% Free', icon: CheckCircle },
                                    { label: 'Sẵn sàng', value: 'Mọi lúc', icon: Clock },
                                    { label: 'Hỗ trợ', value: 'Tận tâm', icon: ShieldCheck },
                                ].map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <stat.icon className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-sm text-slate-500">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>

            {/* Thêm một chút CSS animation nếu bạn chưa có trong file toàn cục */}
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};

export default HomePage;