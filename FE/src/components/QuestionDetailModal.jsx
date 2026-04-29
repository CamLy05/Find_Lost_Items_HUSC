import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, MessageSquare, User, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

const QuestionDetailModal = ({ question, isOpen, onClose, onQuestionDeleted }) => {
    const { currentUser, userRole } = useAuth();
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [usersMap, setUsersMap] = useState({});

    // PHÂN QUYỀN: Kiểm tra xem người dùng có quyền xem câu hỏi này không
    const isOwner = currentUser?.id === question?.user_id;
    const isAdmin = userRole === 'admin';
    const canAccess = isOwner || isAdmin;

    useEffect(() => {
        if (isOpen && question && canAccess) {
            fetchAnswersAndUsers();
        }
    }, [isOpen, question, canAccess]);

    const fetchAnswersAndUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Lấy danh sách câu trả lời
            const answersData = await pb.collection('answers').getFullList({
                filter: `question_id="${question.id}"`,
                sort: 'created_at',
                $autoCancel: false,
            });
            setAnswers(answersData);

            // 2. Lấy thông tin những người tham gia hội thoại để hiện tên
            const userIds = new Set([question.user_id]);
            answersData.forEach(a => userIds.add(a.user_id));

            if (userIds.size > 0) {
                const usersData = await pb.collection('users').getFullList({
                    filter: Array.from(userIds).map(id => `id="${id}"`).join(' || '),
                    $autoCancel: false,
                });

                const map = {};
                usersData.forEach(u => {
                    map[u.id] = {
                        name: u.name || u.email,
                        role: u.role
                    };
                });
                setUsersMap(map);
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Không thể tải dữ liệu hội thoại.');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            // 1. Tạo câu trả lời trong bảng answers
            const newAnswer = await pb.collection('answers').create({
                question_id: question.id,
                user_id: currentUser.id,
                content: replyContent.trim(),
            });

            // 2. Gửi thông báo
            if (userRole === 'admin') {
                // Nếu ADMIN trả lời -> Gửi thông báo cho SINH VIÊN (chủ câu hỏi)
                await pb.collection('notifications').create({
                    user_id: question.user_id,
                    type: 'question_answered',
                    item_id: question.id,
                    message: `Quản trị viên đã phản hồi câu hỏi của bạn.`,
                    is_read: false
                });
            } else {
                // Nếu SINH VIÊN phản hồi -> Gửi cho TẤT CẢ ADMIN
                const admins = await pb.collection('users').getFullList({
                    filter: 'role = "admin"',
                });

                // Tạo hàng loạt thông báo cho các Admin
                const adminNotifications = admins.map(admin =>
                    pb.collection('notifications').create({
                        user_id: admin.id,
                        type: 'answer_received',
                        item_id: question.id,
                        message: `Sinh viên ${currentUser.name || 'ẩn danh'} vừa gửi tin nhắn mới trong mục hỏi đáp.`,
                        is_read: false
                    })
                );
                await Promise.all(adminNotifications);
            }

            toast.success('Đã gửi phản hồi');
            setReplyContent('');
            fetchAnswersAndUsers();
        } catch (err) {
            toast.error('Lỗi khi gửi thông báo cho hệ thống');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
        try {
            await pb.collection('questions').delete(question.id);
            toast.success('Đã xóa câu hỏi');
            onClose();
            if (onQuestionDeleted) onQuestionDeleted();
        } catch (err) {
            toast.error('Không thể xóa.');
        }
    };

    // Nếu không có câu hỏi hoặc không có quyền truy cập, không hiện gì cả
    if (!question || !canAccess) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
                        {question.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Nội dung câu hỏi gốc */}
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{usersMap[question.user_id]?.name || 'Người dùng'}</div>
                                    <div className="text-xs text-slate-500">{format(new Date(question.created_at || question.created), 'dd/MM/yyyy HH:mm')}</div>
                                </div>
                            </div>
                            {(isAdmin || isOwner) && (
                                <Button variant="ghost" size="sm" onClick={handleDeleteQuestion} className="text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{question.content}</p>
                    </div>

                    {/* Danh sách câu trả lời */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Hội thoại ({answers.length})
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full rounded-xl" />
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </div>
                        ) : answers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm">
                                Chưa có phản hồi nào cho câu hỏi này.
                            </div>
                        ) : (
                            answers.map((answer) => {
                                // KIỂM TRA: Nếu user_id của câu trả lời trùng với ID người đang đăng nhập thì hiện bên PHẢI
                                const isMe = currentUser?.id === answer.user_id;
                                // Kiểm tra xem người gửi có phải là Admin không để hiện icon bảo mật
                                const isSenderAdmin = usersMap[answer.user_id]?.role === 'admin';

                                return (
                                    <div key={answer.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${isMe
                                            ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none' // Tin nhắn của tôi
                                            : 'bg-white border-slate-200 text-slate-900 rounded-tl-none'  // Tin nhắn của người khác/Admin
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[11px] font-bold ${isMe ? 'opacity-70' : 'text-blue-600'}`}>
                                                    {usersMap[answer.user_id]?.name || 'Người dùng'}
                                                </span>
                                                {isSenderAdmin && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                                            </div>
                                            <p className="text-sm leading-relaxed">{answer.content}</p>
                                            <div className={`text-[10px] opacity-50 mt-2 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {format(new Date(answer.created_at || answer.created), 'HH:mm - dd/MM')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Form trả lời - Cho phép cả sinh viên (chủ câu hỏi) và Admin */}
                    <div className="mt-6 pt-6 border-t">
                        <form onSubmit={handleReplySubmit} className="space-y-3">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={isAdmin ? "Trả lời hỗ trợ sinh viên..." : "Nhập phản hồi của bạn..."}
                                rows={3}
                                className="resize-none rounded-xl border-slate-200 focus:ring-blue-500"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={submitting || !replyContent.trim()}
                                    className={isAdmin ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"}
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuestionDetailModal;