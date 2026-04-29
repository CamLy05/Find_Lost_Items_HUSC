import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Bell, CheckCircle, XCircle, Info, Trash2, Check, MessageSquare, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

const NotificationsPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [relatedData, setRelatedData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await pb.collection('notifications').getList(1, 50, {
                sort: '-created_at',
                filter: `user_id="${currentUser.id}"`,
                $autoCancel: false,
            });

            const notifs = result.items;
            setNotifications(notifs);

            // Fetch related data based on item_id and type
            const itemIds = notifs.map(n => n.item_id).filter(Boolean);
            if (itemIds.length > 0) {
                const dataMap = {};

                // Separate IDs by expected collection
                const lostItemIds = notifs.filter(n => ['approved', 'rejected'].includes(n.type) && n.item_id).map(n => n.item_id);
                const questionIds = notifs.filter(n => ['question_answered', 'answer_received'].includes(n.type) && n.item_id).map(n => n.item_id);

                // Fetch lost items
                if (lostItemIds.length > 0) {
                    const items = await pb.collection('lost_items').getFullList({
                        filter: lostItemIds.map(id => `id="${id}"`).join(' || '),
                        $autoCancel: false
                    });
                    items.forEach(item => { dataMap[item.id] = item; });
                }

                // Fetch questions
                if (questionIds.length > 0) {
                    const questions = await pb.collection('questions').getFullList({
                        filter: questionIds.map(id => `id="${id}"`).join(' || '),
                        $autoCancel: false
                    });
                    questions.forEach(q => { dataMap[q.id] = q; });
                }

                setRelatedData(dataMap);
            }

        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Không thể tải thông báo. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [currentUser.id]);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [fetchNotifications, currentUser]);

    const handleMarkAsRead = async (id) => {
        try {
            await pb.collection('notifications').update(id, { is_read: true }, { $autoCancel: false });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await pb.collection('notifications').delete(id, { $autoCancel: false });
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Đã xóa thông báo');
        } catch (err) {
            console.error('Error deleting notification:', err);
            toast.error('Không thể xóa thông báo');
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        if ((notification.type === 'question_answered' || notification.type === 'answer_received') && notification.item_id) {
            navigate('/qa');
        }
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case 'approved':
                return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
            case 'rejected':
                return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
            case 'question_answered':
            case 'answer_received':
                return { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
            case 'admin_message':
                return { icon: Info, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
            case 'student_message':
                return { icon: Info, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
            default:
                return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' };
        }
    };

    const renderNotificationContent = (notification) => {
        const relatedItem = relatedData[notification.item_id];

        if (['approved', 'rejected'].includes(notification.type) && relatedItem) {
            return (
                <>
                    <p className={`text-slate-800 ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                        {notification.type === 'approved' ? 'Bài đăng đã được duyệt' : 'Bài đăng bị từ chối'}
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                        Đồ vật: <span className="font-medium">{relatedItem.item_name}</span>
                    </p>
                    {notification.message && notification.message !== 'Bài đăng đã được duyệt' && (
                        <p className="text-slate-500 text-sm mt-1 italic">"{notification.message}"</p>
                    )}
                </>
            );
        }

        if (['question_answered', 'answer_received'].includes(notification.type) && relatedItem) {
            return (
                <>
                    <p className={`text-slate-800 ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                        Có câu trả lời mới
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                        Câu hỏi: <span className="font-medium">{relatedItem.title}</span>
                    </p>
                    <div className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        Nhấn để xem chi tiết
                    </div>
                </>
            );
        }

        // Default fallback (admin_message or missing related data)
        return (
            <p className={`text-slate-800 ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                {notification.message}
            </p>
        );
    };

    return (
        <>
            <Helmet>
                <title>Thông báo - HUSC Lost & Found</title>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-slate-50/50">
                <Header />

                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Thông báo</h1>
                                <p className="text-slate-600 text-lg">Cập nhật trạng thái bài đăng và câu hỏi của bạn</p>
                            </div>
                        </div>

                        {error ? (
                            <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 border border-red-100">
                                <AlertCircle className="w-10 h-10" />
                                <p className="text-center font-medium">{error}</p>
                                <Button variant="outline" onClick={fetchNotifications} className="bg-white mt-2">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                                </Button>
                            </div>
                        ) : loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex gap-5">
                                            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                                            <div className="flex-1 space-y-3 py-1">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-state py-20">
                                <Bell className="w-20 h-20 text-slate-200 mb-5" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Không có thông báo nào</h3>
                                <p className="text-slate-500">Bạn đã xem hết tất cả thông báo hiện có.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => {
                                    const style = getNotificationStyle(notification.type);
                                    const Icon = style.icon;
                                    const isClickable = (notification.type === 'question_answered' || notification.type === 'answer_received') && notification.item_id;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`bg-white p-5 rounded-2xl border transition-all duration-200 ${notification.is_read ? 'border-slate-200 opacity-75' : `border-l-4 ${style.border} shadow-md`} ${isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
                                            onClick={() => isClickable && handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-5">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>

                                                <div className="flex-1 pt-1">
                                                    {renderNotificationContent(notification)}
                                                    <p className="text-xs text-slate-400 mt-3 font-medium">
                                                        {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start" onClick={e => e.stopPropagation()}>
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="h-9 text-xs gap-2 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Đã đọc</span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                                        aria-label="Xóa thông báo"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default NotificationsPage;