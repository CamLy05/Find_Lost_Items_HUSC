import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, MessageSquare, User, AlertCircle, RefreshCw } from 'lucide-react';

const QuestionDetailModal = ({ question, isOpen, onClose, onQuestionDeleted }) => {
    const { currentUser, userRole } = useAuth();
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        if (isOpen && question) {
            fetchAnswersAndUsers();
        }
    }, [isOpen, question]);

    const fetchAnswersAndUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch answers
            const answersData = await pb.collection('answers').getFullList({
                filter: `question_id="${question.id}"`,
                sort: 'created_at',
                $autoCancel: false,
            });
            setAnswers(answersData);

            // Collect unique user IDs from question and answers
            const userIds = new Set([question.user_id]);
            answersData.forEach(a => userIds.add(a.user_id));

            // Fetch user details
            if (userIds.size > 0) {
                const usersData = await pb.collection('users').getFullList({
                    filter: Array.from(userIds).map(id => `id="${id}"`).join(' || '),
                    $autoCancel: false,
                });

                const map = {};
                usersData.forEach(u => {
                    map[u.id] = u.name || u.email;
                });
                setUsersMap(map);
            }
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Không thể tải chi tiết câu hỏi và câu trả lời.');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) {
            toast.error('Vui lòng nhập nội dung câu trả lời');
            return;
        }

        setSubmitting(true);
        try {
            // Create answer
            const newAnswer = await pb.collection('answers').create({
                question_id: question.id,
                user_id: currentUser.id,
                content: replyContent.trim(),
            }, { $autoCancel: false });

            // Create notification for the question author
            if (currentUser.id !== question.user_id) {
                const preview = replyContent.length > 50 ? replyContent.substring(0, 50) + '...' : replyContent;
                await pb.collection('notifications').create({
                    user_id: question.user_id,
                    type: 'question_answered',
                    item_id: question.id,
                    message: `Câu hỏi '${question.title}' của bạn đã được trả lời: ${preview}`,
                    is_read: false
                }, { $autoCancel: false });
            }

            toast.success('Đã gửi câu trả lời và thông báo');
            setReplyContent('');
            fetchAnswersAndUsers();
        } catch (err) {
            console.error('Error submitting reply:', err);
            toast.error('Không thể gửi câu trả lời. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

        try {
            await pb.collection('questions').delete(question.id, { $autoCancel: false });
            toast.success('Đã xóa câu hỏi');
            onClose();
            if (onQuestionDeleted) onQuestionDeleted();
        } catch (err) {
            console.error('Error deleting question:', err);
            toast.error('Không thể xóa câu hỏi');
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm('Bạn có chắc muốn xóa câu trả lời này?')) return;

        try {
            await pb.collection('answers').delete(answerId, { $autoCancel: false });
            toast.success('Đã xóa câu trả lời');
            fetchAnswersAndUsers();
        } catch (err) {
            console.error('Error deleting answer:', err);
            toast.error('Không thể xóa câu trả lời');
        }
    };

    if (!question) return null;

    const canDeleteQuestion = currentUser?.id === question.user_id || userRole === 'admin';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold pr-8 leading-tight">{question.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Question Content */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{usersMap[question.user_id] || 'Người dùng'}</div>
                                    <div className="text-xs">{format(new Date(question.created_at), 'dd/MM/yyyy HH:mm')}</div>
                                </div>
                            </div>
                            {canDeleteQuestion && (
                                <Button variant="ghost" size="sm" onClick={handleDeleteQuestion} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{question.content}</p>
                    </div>

                    {/* Answers Section */}
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Câu trả lời ({answers.length})
                        </h3>

                        {error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-red-100">
                                <AlertCircle className="w-6 h-6" />
                                <p>{error}</p>
                                <Button variant="outline" size="sm" onClick={fetchAnswersAndUsers} className="bg-white">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                                </Button>
                            </div>
                        ) : loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ) : answers.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Chưa có câu trả lời nào.</p>
                                <p className="text-sm text-slate-400 mt-1">Hãy là người đầu tiên giải đáp thắc mắc này.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {answers.map((answer) => (
                                    <div key={answer.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                                    {usersMap[answer.user_id]?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{usersMap[answer.user_id] || 'Quản trị viên'}</div>
                                                    <div className="text-xs text-slate-500">{format(new Date(answer.created_at), 'dd/MM/yyyy HH:mm')}</div>
                                                </div>
                                            </div>
                                            {userRole === 'admin' && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteAnswer(answer.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed pl-11">{answer.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply Form (Admin Only) */}
                    {userRole === 'admin' && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <h4 className="font-medium mb-3 text-slate-900">Thêm câu trả lời</h4>
                            <form onSubmit={handleReplySubmit} className="space-y-3">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Nhập câu trả lời của bạn..."
                                    rows={4}
                                    required
                                    className="resize-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={submitting || !replyContent.trim()} className="px-6">
                                        {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuestionDetailModal;