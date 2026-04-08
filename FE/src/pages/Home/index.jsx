import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Search, FileText, CheckCircle, ArrowRight } from 'lucide-react';

const HomePage = () => {
    const { isAuthenticated, userRole } = useAuth();

    return (
        <>
            <Helmet>
                <title>HUSC Lost & Found - Hệ thống tìm đồ thất lạc</title>
                <meta name="description" content="Hệ thống tìm đồ thất lạc của Đại học Khoa học Huế. Đăng bài và tìm kiếm đồ vật bị mất một cách nhanh chóng và hiệu quả." />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Header />

                {/* Hero Section */}
                <section className="flex-1 flex items-center py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                    <CheckCircle className="w-4 h-4" />
                                    Hệ thống chính thức của HUSC
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                                    Tìm lại đồ thất lạc dễ dàng hơn
                                </h1>

                                <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-prose">
                                    Hệ thống tìm đồ thất lạc của Đại học Khoa học Huế giúp sinh viên đăng bài và tìm kiếm đồ vật bị mất một cách nhanh chóng, miễn phí và hiệu quả.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!isAuthenticated ? (
                                        <>
                                            <Link to="/signup">
                                                <Button size="lg" className="w-full sm:w-auto gap-2">
                                                    Đăng ký ngay
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link to="/login">
                                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                                    Đăng nhập
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <Link to={userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard'}>
                                            <Button size="lg" className="gap-2">
                                                Vào bảng điều khiển
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className="relative">
                                <div className="relative z-10">
                                    <img
                                        src="https://horizons-cdn.hostinger.com/1e6c14a0-cc3e-4d18-8dc1-4875e2304bc8/44a321d85dc17c47847ba39797db687c.png"
                                        alt="HUSC University Logo"
                                        className="w-full max-w-md mx-auto drop-shadow-2xl"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ textWrap: 'balance' }}>
                                Cách thức hoạt động
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Quy trình đơn giản giúp bạn tìm lại đồ thất lạc nhanh chóng
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                    Đăng bài tìm đồ
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Sinh viên đăng thông tin về đồ vật bị mất kèm hình ảnh, mô tả chi tiết và thông tin liên hệ. Bài đăng sẽ được quản trị viên xét duyệt trước khi hiển thị.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    <Search className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                    Tìm kiếm và liên hệ
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Xem danh sách các đồ vật đã được phê duyệt, tìm kiếm theo tên hoặc địa điểm. Liên hệ trực tiếp với người đăng qua số điện thoại hoặc email.
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
                            <div className="text-center p-6 bg-slate-50 rounded-xl">
                                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                                <div className="text-sm text-slate-600">Miễn phí</div>
                            </div>
                            <div className="text-center p-6 bg-slate-50 rounded-xl">
                                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                                <div className="text-sm text-slate-600">Hoạt động</div>
                            </div>
                            <div className="text-center p-6 bg-slate-50 rounded-xl col-span-2 md:col-span-1">
                                <div className="text-3xl font-bold text-blue-600 mb-2">Nhanh</div>
                                <div className="text-sm text-slate-600">Phê duyệt trong ngày</div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
};

export default HomePage;