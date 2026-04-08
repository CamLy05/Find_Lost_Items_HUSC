import React, { useState } from 'react';
import pb from '@/lib/pocketbase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminNotificationModal = ({ item, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            await pb.collection('notifications').create({
                user_id: item.user_id,
                type: 'admin_message',
                item_id: item.id,
                message: message.trim(),
                is_read: false
            }, { $autoCancel: false });

            toast.success('Đã gửi thông báo thành công');
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Không thể gửi thông báo');
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Gửi thông báo cho người đăng</DialogTitle>
                </DialogHeader>

                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-4 border border-slate-100">
                    Đang gửi thông báo về bài đăng: <span className="font-medium text-slate-900">{item.item_name}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="message">Nội dung thông báo *</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung thông báo bạn muốn gửi..."
                            required
                            rows={4}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading || !message.trim()}>
                            {loading ? 'Đang gửi...' : 'Gửi thông báo'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminNotificationModal;