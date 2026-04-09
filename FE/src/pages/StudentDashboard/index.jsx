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
import { Edit3, Plus, MapPin, Calendar, Phone, Mail, Trash2, Package, Bell, HelpCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns'; // Thêm formatDistanceToNow
import { vi } from 'date-fns/locale'; // Thêm locale tiếng Việt
import AdminSearchAndFilterBar from '@/components/AdminSearchAndFilterBar.jsx';

const StudentDashboard = () => {
    const { currentUser } = useAuth();
    const [approvedItems, setApprovedItems] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [filteredApprovedItems, setFilteredApprovedItems] = useState([]);

    const [editingItem, setEditingItem] = useState(null);
    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingItem(null); // Reset trạng thái sửa
        fetchItems();
    };

    // 2. Hàm xử lý khi nhấn nút Sửa
    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };
    const fetchItems = async () => {
        setLoading(true);
        try {
            // Fetch approved items from all students
            const approved = await pb.collection('lost_items').getFullList({
                filter: 'status = "approved"',
                sort: '-created_at',
                $autoCancel: false,
            });
            setApprovedItems(approved);

            // 2. Khởi tạo giá trị ban đầu cho danh sách lọc
            setFilteredApprovedItems(approved);
            // Fetch current user's posts
            const myItems = await pb.collection('lost_items').getFullList({
                filter: `user_id = "${currentUser.id}"`,
                sort: '-created_at',
                $autoCancel: false,
            });
            setMyPosts(myItems);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [currentUser.id]);


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
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        const labels = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
                {labels[status]}
            </span>
        );
    };
    const displayDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "Ngày không xác định";
            // Nếu không có 'vi' ở đây, nó sẽ crash toàn bộ dashboard
            return formatDistanceToNow(d, { addSuffix: true, locale: vi });
        } catch (error) {
            return "Vừa xong";
        }
    };
    const ItemCard = ({ item, showActions = false }) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            {item.image && (
                <img
                    src={pb.files.getURL(item, item.image)}
                    alt={item.item_name}
                    className="w-full h-48 object-cover"
                />
            )}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{item.item_name}</h3>
                    {showActions && getStatusBadge(item.status)}
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
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
                                return format(d, "dd/MM/yyyy HH:mm");
                            } catch (e) {
                                return "Ngày lỗi";
                            }
                        })()}
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a href={`tel:${item.phone}`} className="hover:text-blue-600 transition-colors">
                            {item.phone}
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${item.email}`} className="hover:text-blue-600 transition-colors truncate">
                            {item.email}
                        </a>
                    </div>
                </div>

                {showActions && (
                    <div className="mt-auto pt-4 border-t border-slate-200 flex gap-2">
                        {/* 3. Thêm nút Chỉnh sửa */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="flex-1 gap-2 border-slate-200 hover:bg-slate-50"
                        >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                            Sửa bài đăng
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="flex-1 gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );


    return (
        <>
            <Helmet>
                <title>Bảng điều khiển sinh viên - HUSC Lost & Found</title>
                <meta name="description" content="Quản lý bài đăng tìm đồ thất lạc của bạn" />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-slate-50">
                <Header />

                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header & Quick Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bảng điều khiển sinh viên</h1>
                                <p className="text-slate-600">Xem và quản lý các bài đăng tìm đồ thất lạc</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/notifications">
                                    <Button variant="outline" className="gap-2 bg-white">
                                        <Bell className="w-4 h-4" />
                                        Thông báo
                                    </Button>
                                </Link>
                                <Link to="/qa">
                                    <Button variant="outline" className="gap-2 bg-white">
                                        <HelpCircle className="w-4 h-4" />
                                        Hỏi đáp
                                    </Button>
                                </Link>
                                <Button onClick={() => setShowForm(true)} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Đăng bài mới
                                </Button>
                            </div>
                        </div>

                        <div className="mb-8">
                            <AdminSearchAndFilterBar
                                items={approvedItems}
                                onFilterChange={setFilteredApprovedItems}
                                resultCount={filteredApprovedItems.length}
                            />
                        </div>

                        {/* My Posts Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Bài đăng của tôi</h2>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                                            <Skeleton className="h-48 w-full mb-4" />
                                            <Skeleton className="h-6 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-full mb-4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : myPosts.length === 0 ? (
                                <div className="empty-state">
                                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có bài đăng nào</h3>
                                    <p className="text-slate-600 mb-6">Bạn chưa đăng bài tìm đồ nào. Nhấn nút bên trên để tạo bài đăng mới.</p>
                                    <Button onClick={() => setShowForm(true)} className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        Đăng bài ngay
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myPosts.map((item) => (
                                        <ItemCard key={item.id} item={item} showActions={true} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Approved Items Section */}
                        <section>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Đồ thất lạc đã được phê duyệt</h2>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                                            <Skeleton className="h-48 w-full mb-4" />
                                            <Skeleton className="h-6 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-full mb-4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredApprovedItems.length === 0 ? (
                                <div className="empty-state">
                                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">Không tìm thấy kết quả</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredApprovedItems.map((item) => (
                                        <ItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                <Footer />

                <Dialog
                    open={showForm}
                    onOpenChange={(open) => {
                        setShowForm(open);
                        if (!open) setEditingItem(null); // Reset khi đóng dialog
                    }}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Chỉnh sửa bài đăng' : 'Đăng bài tìm đồ mới'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingItem
                                    ? 'Cập nhật lại thông tin chính xác cho bài đăng của bạn.'
                                    : 'Vui lòng điền đầy đủ thông tin chi tiết về món đồ để mọi người dễ dàng nhận diện.'}
                            </DialogDescription>
                        </DialogHeader>

                        <LostItemForm
                            initialData={editingItem} // Truyền dữ liệu cũ vào form
                            onSuccess={handleFormSuccess}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingItem(null);
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default StudentDashboard;