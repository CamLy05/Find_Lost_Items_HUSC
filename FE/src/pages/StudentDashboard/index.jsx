import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LostItemForm from '@/components/LostItemForm.jsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Edit3, Plus, MapPin, Calendar, Phone, Mail, MessageSquare, Trash2, Package, Bell, HelpCircle, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import StudentSearchAndFilterBar from '@/components/StudentSearchAndFilterBar.jsx';

const StudentDashboard = () => {
    const { currentUser } = useAuth();
    const [approvedItems, setApprovedItems] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filteredApprovedItems, setFilteredApprovedItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            // Lấy danh sách đồ đã duyệt (Trừ bài của mình ra nếu muốn, hoặc hiện tất cả)
            const approved = await pb.collection('lost_items').getFullList({
                filter: 'status = "approved" || status = "complete"',
                sort: '-created_at',
                $autoCancel: false,
            });
            setApprovedItems(approved);
            setFilteredApprovedItems(approved);

            // Lấy bài đăng cá nhân
            const myItems = await pb.collection('lost_items').getFullList({
                filter: `user_id = "${currentUser.id}"`,
                sort: '-created_at',
                $autoCancel: false,
            });
            setMyPosts(myItems);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) fetchItems();
    }, [currentUser?.id]);

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingItem(null);
        fetchItems();
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleContactAdminDirect = async (item) => {
        try {
            setLoading(true);
            // 1. Tự động tạo một "Câu hỏi" mới đóng vai trò là tin nhắn gửi Admin
            const newQuestion = await pb.collection('questions').create({
                user_id: currentUser.id,
                title: `Yêu cầu nhận lại: ${item.item_name}`,
                content: `Chào Admin, mình muốn liên hệ nhận lại đồ vật: ${item.item_name} (ID: ${item.id}) được tìm thấy tại ${item.location}. Mong Admin hỗ trợ!`,
            });

            // 2. Tạo thông báo cho tất cả Admin biết có tin nhắn mới
            const admins = await pb.collection('users').getFullList({ filter: 'role = "admin"' });
            const adminNotifications = admins.map(admin =>
                pb.collection('notifications').create({
                    user: admin.id,
                    type: 'answer_received',
                    item_id: newQuestion.id,
                    message: `Sinh viên ${currentUser.name} gửi yêu cầu nhận lại đồ: ${item.item_name}`,
                    is_read: false
                })
            );
            await Promise.all(adminNotifications);

            toast.success('Đã gửi yêu cầu tới Admin! Đang chuyển đến phần nhắn tin...');

            // 3. Chuyển hướng sang trang Hỏi đáp để theo dõi phản hồi
            setTimeout(() => navigate('/qa'), 1500);

        } catch (error) {
            console.error(error);
            toast.error('Không thể gửi yêu cầu lúc này.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) return;
        try {
            await pb.collection('lost_items').delete(id);
            toast.success('Đã xóa bài đăng');
            fetchItems();
        } catch (error) {
            toast.error('Không thể xóa bài đăng');
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm('Xác nhận món đồ này đã được tìm thấy/trả lại?')) return;
        try {
            await pb.collection('lost_items').update(id, { status: 'complete' });
            toast.success('Chúc mừng bạn đã hoàn thành bài đăng!');
            fetchItems();
        } catch (error) {
            toast.error('Lỗi cập nhật trạng thái');
        }
    };

    const displayDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? "Ngày không xác định" : format(d, "dd/MM/yyyy HH:mm");
        } catch (error) {
            return "Ngày lỗi";
        }
    };

    const ItemCard = ({ item, showActions = false }) => {
        const isComplete = item.status === 'complete';

        return (
            <div className={`relative bg-white rounded-xl border ${isComplete ? 'border-green-500 shadow-sm' : 'border-slate-200'} overflow-hidden hover:shadow-lg transition-all flex flex-col h-full`}>

                {/* THANH TRẠNG THÁI TRÊN CÙNG */}
                <div className="absolute top-0 left-0 right-0 z-10">
                    {isComplete ? (
                        <div className="bg-green-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest shadow-sm flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                        </div>
                    ) : (
                        <div className="bg-blue-500 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest">
                            • Đang tìm kiếm
                        </div>
                    )}
                </div>

                {/* Hình ảnh */}
                <div className="pt-5">
                    {item.image ? (
                        <img
                            src={pb.files.getURL(item, item.image)}
                            alt={item.item_name}
                            className={`w-full h-48 object-cover ${isComplete ? 'opacity-50 grayscale-[50%]' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-48 bg-slate-50 flex items-center justify-center text-slate-300">
                            <Package className="w-12 h-12" />
                        </div>
                    )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-lg font-bold ${isComplete ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {item.item_name}
                        </h3>
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>

                    <div className="space-y-2 text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-400" />
                            <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>{displayDate(item.created_at || item.created)}</span>
                        </div>
                    </div>

                    {/* Nút bấm */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                        {showActions ? (
                            <>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="flex-1" disabled={isComplete}>
                                        <Edit3 className="w-4 h-4 mr-1" /> Sửa
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} className="flex-1">
                                        <Trash2 className="w-4 h-4 mr-1" /> Xóa
                                    </Button>
                                </div>
                                {!isComplete && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" size="sm" onClick={() => handleComplete(item.id)}>
                                        <CheckCircle2 className="w-4 h-4" /> Đã nhận lại đồ
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md transition-all"
                                onClick={() => handleContactAdminDirect(item)}
                                disabled={loading}
                            >
                                <MessageSquare className="w-4 h-4" />
                                {loading ? 'Đang gửi...' : 'Nhắn tin Admin lấy đồ'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Helmet>
                <title>Sinh viên - HUSC Lost & Found</title>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
                <Header />
                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bảng điều khiển sinh viên</h1>
                                <p className="text-slate-600">Xem và quản lý các bài đăng tìm đồ thất lạc</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/notifications"><Button variant="outline" className="gap-2 bg-white"><Bell className="w-4 h-4" /> Thông báo</Button></Link>
                                <Link to="/qa"><Button variant="outline" className="gap-2 bg-white"><HelpCircle className="w-4 h-4" /> Hỏi đáp</Button></Link>
                                <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Đăng bài mới</Button>
                            </div>
                        </div>

                        <StudentSearchAndFilterBar items={approvedItems} onFilterChange={setFilteredApprovedItems} resultCount={filteredApprovedItems.length} />

                        {/* Danh sách đồ dùng chung */}
                        <section className="mb-12">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" /> Bản tin tìm đồ
                            </h2>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
                                </div>
                            ) : filteredApprovedItems.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">Không tìm thấy bài đăng nào</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredApprovedItems.map((item) => <ItemCard key={item.id} item={item} />)}
                                </div>
                            )}
                        </section>

                        {/* Bài đăng của tôi */}
                        <section>
                            <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2">
                                <Edit3 className="w-5 h-5" /> Quản lý bài đăng cá nhân
                            </h2>
                            {myPosts.length === 0 ? (
                                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                                    <p className="text-slate-500 mb-4">Bạn chưa đăng bài nào.</p>
                                    <Button onClick={() => setShowForm(true)} variant="outline">Đăng ngay</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myPosts.map((item) => <ItemCard key={item.id} item={item} showActions={true} />)}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
                <Footer />

                <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingItem(null); }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Chỉnh sửa bài đăng' : 'Đăng bài mới'}</DialogTitle>
                        </DialogHeader>
                        <LostItemForm initialData={editingItem} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setEditingItem(null); }} />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default StudentDashboard;