import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <img
                            src="https://horizons-cdn.hostinger.com/1e6c14a0-cc3e-4d18-8dc1-4875e2304bc8/44a321d85dc17c47847ba39797db687c.png"
                            alt="HUSC Logo"
                            className="h-12 w-auto mb-4 brightness-0 invert"
                        />
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Hệ thống tìm đồ thất lạc của Đại học Khoa học Huế
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
                        <div className="space-y-3 text-sm text-slate-300">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>77 Nguyễn Huệ, Thành phố Huế</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>0234 3822 041</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>lostandfound@husc.edu.vn</span>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Thông tin</h3>
                        <div className="space-y-2 text-sm text-slate-300">
                            <p>Giờ làm việc: 7:30 - 17:00</p>
                            <p>Thứ 2 - Thứ 6</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Đại học Khoa học Huế. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;