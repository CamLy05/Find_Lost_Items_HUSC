import React, { useState, useEffect } from 'react'; // Cần có useEffect ở đây
import { useAuth } from '@/context/AppContext.jsx';
import pb from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const LostItemForm = ({ onSuccess, onCancel, initialData }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const initialFormState = {
    item_name: '',
    description: '',
    location: '',
    lost_date: '',
    category: 'other',
    image: null,
    phone: '',
    email: currentUser?.email || '',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Cập nhật dữ liệu khi vào chế độ chỉnh sửa
  useEffect(() => {
    if (initialData) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
          // PocketBase trả về YYYY-MM-DD HH:mm:ss, input date chỉ nhận YYYY-MM-DD
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };

      setFormData({
        item_name: initialData.item_name || '',
        description: initialData.description || '',
        location: initialData.location || '',
        lost_date: formatDateForInput(initialData.lost_date),
        category: initialData.category || 'other',
        image: null,
        phone: initialData.phone || '',
        email: initialData.email || currentUser?.email || '',
      });

      if (initialData.image) {
        setImagePreview(pb.files.getURL(initialData, initialData.image));
      }
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
  }, [initialData, currentUser]);

  if (!currentUser) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  const handleLocationChange = (value) => {
    setFormData(prev => ({ ...prev, location: value }));
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('user_id', currentUser.id);
      data.append('item_name', String(formData.item_name || "").trim());
      data.append('description', String(formData.description || "").trim());
      data.append('location', String(formData.location || "").trim());
      data.append('lost_date', formData.lost_date);
      data.append('category', formData.category);
      data.append('phone', String(formData.phone || "").trim());
      data.append('email', String(formData.email || "").trim());
      data.append('status', 'pending');

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (initialData?.id) {
        await pb.collection('lost_items').update(initialData.id, data);
        toast.success('Cập nhật bài đăng thành công!');
      } else {
        await pb.collection('lost_items').create(data);
        toast.success('Đăng bài thành công. Chờ phê duyệt.');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="item_name">Tên đồ vật *</Label>
        <Input id="item_name" name="item_name" value={formData.item_name} onChange={handleChange} required className="mt-1.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Danh mục *</Label>
          <Select value={formData.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="found">Tìm đồ</SelectItem>
              <SelectItem value="lost">Nhặt đồ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="lost_date">Ngày mất/nhặt được *</Label>
          <Input id="lost_date" name="lost_date" type="date" value={formData.lost_date} onChange={handleChange} required className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Mô tả chi tiết *</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="location">Địa điểm *</Label>
        <Select value={formData.location} onValueChange={handleLocationChange}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Chọn địa điểm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả địa điểm</SelectItem>
            <SelectItem value="Tòa A">Tòa A</SelectItem>
            <SelectItem value="Tòa H">Tòa H</SelectItem>
            <SelectItem value="Tòa E">Tòa E</SelectItem>
            <SelectItem value="Nhà Xe">Nhà Xe</SelectItem>
            <SelectItem value="Sân Trường">Sân Trường</SelectItem>
            <SelectItem value="Tòa F">Tòa F</SelectItem>
            <SelectItem value="Nơi Khác">Nơi khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Hình ảnh</Label>
        <div className="mt-1.5">
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          ) : (
            <div className="relative">
              <img src={imagePreview} className="w-full h-48 object-cover rounded-xl" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Đăng bài'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Hủy</Button>
      </div>
    </form>
  );
};

export default LostItemForm;