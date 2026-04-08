import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const EditLostItemModal = ({ item, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        item_name: '',
        description: '',
        location: '',
        lost_date: '',
        category: 'other',
        phone: '',
        email: '',
        image: null,
    });

    useEffect(() => {
        if (item && isOpen) {
            setFormData({
                item_name: item.item_name || '',
                description: item.description || '',
                location: item.location || '',
                lost_date: item.lost_date ? item.lost_date.split('T')[0] : '',
                category: item.category || 'other',
                phone: item.phone || '',
                email: item.email || '',
                image: null, // null means keep existing
            });

            if (item.image) {
                setImagePreview(pb.files.getUrl(item, item.image));
            } else {
                setImagePreview(null);
            }
        }
    }, [item, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (value) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error('Kích thước ảnh không được vượt quá 20MB');
                return;
            }
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: 'delete' })); // Special flag to delete
        setImagePreview(null);
    };

    const validateForm = () => {
        if (!formData.item_name.trim()) return 'Vui lòng nhập tên đồ vật';
        if (!formData.description.trim()) return 'Vui lòng nhập mô tả chi tiết';
        if (!formData.location.trim()) return 'Vui lòng nhập địa điểm';
        if (!formData.lost_date) return 'Vui lòng chọn ngày';
        if (!formData.phone.trim()) return 'Vui lòng nhập số điện thoại';
        if (!formData.email.trim()) return 'Vui lòng nhập email';
        if (!formData.category) return 'Vui lòng chọn danh mục';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('item_name', formData.item_name.trim());
            data.append('description', formData.description.trim());
            data.append('location', formData.location.trim());
            data.append('lost_date', formData.lost_date);
            data.append('category', formData.category);
            data.append('phone', formData.phone.trim());
            data.append('email', formData.email.trim());

            // If previously approved, reset to pending
            if (item.status === 'approved') {
                data.append('status', 'pending');
            }

            if (formData.image === 'delete') {
                data.append('image', '');
            } else if (formData.image) {
                data.append('image', formData.image);
            }

            await pb.collection('lost_items').update(item.id, data, { $autoCancel: false });

            toast.success('Đã cập nhật bài đăng thành công');
            if (item.status === 'approved') {
                toast.info('Bài đăng đã được chuyển về trạng thái chờ duyệt do có thay đổi.');
            }
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error('Không thể cập nhật bài đăng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa bài đăng</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div>
                        <Label htmlFor="item_name">Tên đồ vật *</Label>
                        <Input
                            id="item_name"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            required
                            className="mt-1.5"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category">Danh mục *</Label>
                            <Select value={formData.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="mt-1.5">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="find">Tìm đồ</SelectItem>
                                    <SelectItem value="lost">Mất đồ</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="lost_date">Ngày mất/nhặt được *</Label>
                            <Input
                                id="lost_date"
                                name="lost_date"
                                type="date"
                                value={formData.lost_date}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Mô tả chi tiết *</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label htmlFor="location">Địa điểm *</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="mt-1.5"
                        />
                    </div>

                    <div>
                        <Label htmlFor="image">Hình ảnh</Label>
                        <div className="mt-1.5">
                            {!imagePreview ? (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Nhấn để tải ảnh lên</span>
                                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, WebP (tối đa 20MB)</span>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">Số điện thoại *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditLostItemModal;