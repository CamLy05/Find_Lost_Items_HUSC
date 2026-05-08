import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, parseISO, set } from 'date-fns';

const StudentSearchAndFilterBar = ({ items, onFilterChange, resultCount }) => {
    const [search, setSearch] = useState('');
    const [item_name, setItemName] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [location, setLocation] = useState('all');
    const [category, setCategory] = useState('all');

    // Extract unique locations from items
    const uniqueLocations = useMemo(() => {
        const locs = new Set(items.map(item => item.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [items]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = items.filter(item => {
                // 1. CHUẨN BỊ DỮ LIỆU (Đổi tên biến để không trùng với State)
                const searchLower = search.toLowerCase().trim();
                const itemCatData = (item.category || "").toLowerCase();
                const itemNameData = (item.item_name || "").toLowerCase();
                const itemDescData = (item.description || "").toLowerCase();
                const userName = (item.expand?.user_id?.name || item.expand?.name_id?.name || "").toLowerCase();

                // 2. LOGIC TÌM KIẾM 
                const matchesSearch = !search ||
                    itemNameData.includes(searchLower) ||
                    itemCatData.includes(searchLower) ||
                    itemDescData.includes(searchLower) ||
                    userName.includes(searchLower) ||
                    String(item.phone || "").includes(searchLower);

                // 3. LOGIC LỌC DROPDOWN (Quan trọng: So sánh item.category với state category)
                const matchesItemName = item_name === 'all' || item.item_name === item_name;

                // ĐÃ SỬA: Không khai báo biến 'category' ở đây nữa
                const matchesCategory = category === 'all' || item.category === category;

                const matchesLocation = location === 'all' || item.location === location;

                // 4. LOGIC LỌC NGÀY
                let matchesDate = true;
                const dateField = item.created_at || item.created;
                if (dateRange !== 'all' && dateField) {
                    const itemDate = parseISO(dateField);
                    if (dateRange === 'today') matchesDate = isToday(itemDate);
                    else if (dateRange === 'week') matchesDate = isThisWeek(itemDate);
                    else if (dateRange === 'month') matchesDate = isThisMonth(itemDate);
                }

                // 5. TRẢ VỀ KẾT QUẢ (Đã thêm matchesCategory)
                return matchesSearch && matchesItemName && matchesLocation && matchesDate && matchesCategory;
            });

            onFilterChange(filtered);
        }, 300);

        return () => clearTimeout(handler);

    }, [search, item_name, dateRange, category, location, items, onFilterChange]);

    const handleReset = () => {
        setSearch('');
        setItemName('all');
        setDateRange('all');
        setLocation('all');
        setCategory('all');
    };

    const hasActiveFilters = search || item_name !== 'all' || dateRange !== 'all' || location !== 'all' || category !== 'all';

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên đồ vật, người đăng, số điện thoại..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-3">
                    <Select value={item_name} onValueChange={setItemName}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Tên Đồ Vật" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tên Đồ Vật</SelectItem>
                            <SelectItem value="Ví">Ví</SelectItem>
                            <SelectItem value="Thẻ xe">Thẻ xe</SelectItem>
                            <SelectItem value="Giấy tờ">Giấy tờ</SelectItem>
                            <SelectItem value="Điện thoại">Điện thoại</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                            <SelectItem value="Balo">Balo</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Thời gian đăng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Mọi lúc</SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Danh mục</SelectItem>
                            <SelectItem value="lost">Mất</SelectItem>
                            <SelectItem value="found">Tìm thấy</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Địa điểm" />
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

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={handleReset} className="px-3 text-slate-500 hover:text-slate-900">
                            <X className="w-4 h-4 mr-2" />
                            Xóa lọc
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-500" />
                    <span>
                        Kết quả: <strong className="text-slate-900">{resultCount}</strong> bài viết
                        {hasActiveFilters && " (đã áp dụng bộ lọc)"}
                    </span>
                </div>
                {hasActiveFilters && (
                    <span className="text-xs italic text-slate-400">
                        Đang lọc theo: {[
                            search && 'từ khóa',
                            item_name !== 'all' && 'tên đồ vật',
                            location !== 'all' && 'địa điểm',
                            dateRange !== 'all' && 'thời gian',
                            category !== 'all' && 'danh mục'
                        ].filter(Boolean).join(', ')}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StudentSearchAndFilterBar;