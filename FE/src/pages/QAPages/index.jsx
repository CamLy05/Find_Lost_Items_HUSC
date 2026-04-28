import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import QuestionDetailModal from '@/components/QuestionDetailModal.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MessageCircle, HelpCircle, User, AlertCircle, RefreshCw } from 'lucide-react';

const QAPage = () => {
  const { currentUser, userRole } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [answerCounts, setAnswerCounts] = useState({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other'
  });

  // Modal state
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection('questions').getList(1, 50, {
        sort: '-created_at',
        $autoCancel: false,
      });

      setQuestions(result.items);

      // Fetch users for these questions
      const userIds = [...new Set(result.items.map(q => q.user_id))];
      if (userIds.length > 0) {
        const usersData = await pb.collection('users').getFullList({
          filter: userIds.map(id => `id="${id}"`).join(' || '),
          $autoCancel: false,
        });
        const map = {};
        usersData.forEach(u => { map[u.id] = u.name || u.email; });
        setUsersMap(map);
      }

      // Fetch answer counts
      const allAnswers = await pb.collection('answers').getFullList({
        fields: 'question_id',
        $autoCancel: false,
      });
      const counts = {};
      allAnswers.forEach(a => {
        counts[a.question_id] = (counts[a.question_id] || 0) + 1;
      });
      setAnswerCounts(counts);

    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    setSubmitting(true);
    try {
      await pb.collection('questions').create({
        user_id: currentUser.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
      }, { $autoCancel: false });

      toast.success('Đã gửi câu hỏi thành công');
      setFormData({ title: '', content: '', category: 'other' });
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error creating question:', err);
      toast.error('Không thể gửi câu hỏi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat) => {
    const labels = { found: 'Tìm đồ', lost: 'Nhặt đồ', other: 'Khác' };
    return labels[cat] || 'Khác';
  };

  return (
    <>
      <Helmet>
        <title>Hỏi đáp - HUSC Lost & Found</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Header />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Hỏi đáp & Hỗ trợ</h1>
                <p className="text-slate-600 text-lg">Nơi giải đáp các thắc mắc về việc tìm và nhận lại đồ</p>
              </div>
              {userRole === 'student' && (
                <Button onClick={() => setShowForm(!showForm)} className="gap-2 shadow-sm px-6">
                  <HelpCircle className="w-4 h-4" />
                  {showForm ? 'Hủy đặt câu hỏi' : 'Đặt câu hỏi mới'}
                </Button>
              )}
            </div>

            {/* Ask Question Form */}
            {showForm && userRole === 'student' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 animate-in fade-in slide-in-from-top-4">
                <h2 className="text-xl font-bold mb-6 text-slate-900">Đặt câu hỏi mới</h2>
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="title" className="text-slate-700">Tiêu đề</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Tóm tắt câu hỏi của bạn..."
                      required
                      className="mt-2 bg-slate-50 focus-visible:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="category" className="text-slate-700">Danh mục</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                      >
                        <SelectTrigger className="mt-2 bg-slate-50 focus:bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="found">Tìm đồ</SelectItem>
                          <SelectItem value="lost">Nhặt đồ</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="content" className="text-slate-700">Nội dung chi tiết</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                      required
                      rows={5}
                      className="mt-2 bg-slate-50 focus-visible:bg-white resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={submitting} className="px-8">
                      {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5">
              {error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 border border-red-100">
                  <AlertCircle className="w-10 h-10" />
                  <p className="text-center font-medium">{error}</p>
                  <Button variant="outline" onClick={fetchQuestions} className="bg-white mt-2">
                    <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
                  </Button>
                </div>
              ) : loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <Skeleton className="h-7 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))
              ) : questions.length === 0 ? (
                <div className="empty-state py-20">
                  <MessageCircle className="w-20 h-20 text-slate-200 mb-5" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có câu hỏi nào</h3>
                  <p className="text-slate-500 max-w-md mx-auto">Hệ thống chưa ghi nhận câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi nếu bạn cần hỗ trợ.</p>
                </div>
              ) : (
                questions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{question.title}</h3>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full whitespace-nowrap">
                        {getCategoryLabel(question.category)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-base line-clamp-2 mb-6 leading-relaxed">
                      {question.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 font-medium text-slate-700">
                          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-500" />
                          </div>
                          {usersMap[question.user_id] || 'Sinh viên'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{format(new Date(question.created_at), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${answerCounts[question.id] > 0 ? 'text-primary' : 'text-slate-400'}`}>
                        <MessageCircle className="w-4 h-4" />
                        {answerCounts[question.id] || 0} trả lời
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <Footer />

        <QuestionDetailModal
          question={selectedQuestion}
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onQuestionDeleted={() => {
            setSelectedQuestion(null);
            fetchQuestions();
          }}
        />
      </div>
    </>
  );
};

export default QAPage;