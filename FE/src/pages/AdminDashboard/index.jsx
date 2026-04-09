import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import AdminSearchAndFilterBar from '@/components/AdminSearchAndFilterBar.jsx';
import AdminNotificationModal from '@/components/AdminNotificationModal.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Trash2, Package, Clock, ThumbsUp, ThumbsDown, MapPin, Calendar, Phone, Mail, HelpCircle, Send } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifyingItem, setNotifyingItem] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const allItems = await pb.collection('lost_items').getFullList({
                sort: '-created_at',
                expand: 'user_id',
                $autoCancel: false,
            });
            setItems(allItems);
            setFilteredItems(allItems);

            // Calculate stats
            setStats({
                total: allItems.length,
                approved: allItems.filter(item => item.status === 'approved').length,
                pending: allItems.filter(item => item.status === 'pending').length,
                rejected: allItems.filter(item => item.status === 'rejected').length,
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleApprove = async (id) => {
        try {
            await pb.collection('lost_items').update(id, { status: 'approved' }, { $autoCancel: false });
            toast.success('Đã phê duyệt bài đăng');
            fetchItems();
        } catch (error) {
            console.error('Error approving item:', error);
            toast.error('Không thể phê duyệt bài đăng');
        }
    };


    const handleReject = async (id) => {
        try {
            await pb.collection('lost_items').update(id, { status: 'rejected' }, { $autoCancel: false });
            toast.success('Đã từ chối bài đăng');
            fetchItems();
        } catch (error) {
            console.error('Error rejecting item:', error);
            toast.error('Không thể từ chối bài đăng');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
            return;
        }

        try {
            await pb.collection('lost_items').delete(id, { $autoCancel: false });
            toast.success('Đã xóa bài đăng');
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Không thể xóa bài đăng');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ duyệt', icon: Clock },
            approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã duyệt', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối', icon: XCircle },
        };
        const badge = badges[status];
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {badge.label}
            </span>
        );
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-600 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Helmet>
                <title>Quản trị - HUSC Lost & Found</title>
                <meta name="description" content="Quản lý tất cả bài đăng tìm đồ thất lạc" />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-slate-50">
                <Header />

                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bảng điều khiển quản trị</h1>
                                <p className="text-slate-600">Quản lý và phê duyệt các bài đăng tìm đồ thất lạc</p>
                            </div>
                            <div className="flex gap-3">
                                <Link to="/qa">
                                    <Button variant="outline" className="gap-2 bg-white">
                                        <HelpCircle className="w-4 h-4" />
                                        Quản lý Hỏi đáp
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard icon={Package} label="Tổng số bài" value={stats.total} color="bg-blue-600" />
                            <StatCard icon={CheckCircle} label="Đã duyệt" value={stats.approved} color="bg-green-600" />
                            <StatCard icon={Clock} label="Chờ duyệt" value={stats.pending} color="bg-yellow-600" />
                            <StatCard icon={XCircle} label="Từ chối" value={stats.rejected} color="bg-red-600" />
                        </div>

                        {/* Search and Filter */}
                        <AdminSearchAndFilterBar
                            items={items}
                            onFilterChange={setFilteredItems}
                            resultCount={filteredItems.length}
                        />

                        {/* Items List */}
                        <section>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Danh sách bài đăng</h2>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                                            <Skeleton className="h-6 w-1/3 mb-4" />
                                            <Skeleton className="h-4 w-full mb-2" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="empty-state">
                                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy bài đăng</h3>
                                    <p className="text-slate-600">Không có bài đăng nào khớp với điều kiện lọc.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredItems.map((item) => (
                                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                                                {/* Image */}
                                                {item.image && (
                                                    <div className="lg:col-span-3">
                                                        <img
                                                            src={pb.files.getURL(item, item.image)}
                                                            alt={item.item_name}
                                                            className="w-full h-48 lg:h-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className={item.image ? 'lg:col-span-6' : 'lg:col-span-9'}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h3 className="text-xl font-semibold text-slate-900">{item.item_name}</h3>
                                                        {getStatusBadge(item.status)}
                                                    </div>

                                                    <p className="text-slate-600 mb-4">{item.description}</p>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                                            <span>{item.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                                            {(() => {
                                                                try {
                                                                    const d = new Date(item.created_at || item.created);
                                                                    if (isNaN(d.getTime())) return "Chưa có ngày";
                                                                    return format(d, "dd/MM/yyyy HH:mm"); // Hoặc formatDistanceToNow tùy code cũ của bạn
                                                                } catch (e) {
                                                                    return "Ngày lỗi";
                                                                }
                                                            })()}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                                            <span>{item.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 flex-shrink-0" />
                                                            <span className="truncate">{item.email}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                                                        Người đăng: <span className="font-medium text-slate-900">{item.expand?.user_id?.name || item.expand?.user_id?.email || 'Không rõ'}</span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="lg:col-span-3 flex flex-col gap-2 justify-center">
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                onClick={() => handleApprove(item.id)}
                                                                className="gap-2 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <ThumbsUp className="w-4 h-4" />
                                                                Phê duyệt
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleReject(item.id)}
                                                                variant="outline"
                                                                className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                                                            >
                                                                <ThumbsDown className="w-4 h-4" />
                                                                Từ chối
                                                            </Button>
                                                        </>
                                                    )}
                                                    {item.status === 'approved' && (
                                                        <Button
                                                            onClick={() => handleReject(item.id)}
                                                            variant="outline"
                                                            className="gap-2"
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                            Hủy phê duyệt
                                                        </Button>
                                                    )}
                                                    {item.status === 'rejected' && (
                                                        <Button
                                                            onClick={() => handleApprove(item.id)}
                                                            variant="outline"
                                                            className="gap-2"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                            Phê duyệt lại
                                                        </Button>
                                                    )}

                                                    <Button
                                                        onClick={() => setNotifyingItem(item)}
                                                        variant="outline"
                                                        className="gap-2 mt-2"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Gửi thông báo
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleDelete(item.id)}
                                                        variant="destructive"
                                                        className="gap-2 mt-auto lg:mt-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                <Footer />

                <AdminNotificationModal
                    item={notifyingItem}
                    isOpen={!!notifyingItem}
                    onClose={() => setNotifyingItem(null)}
                />
            </div>
        </>
    );
};

export default AdminDashboard;