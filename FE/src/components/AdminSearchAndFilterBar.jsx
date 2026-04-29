import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

const AdminSearchAndFilterBar = ({ items, onFilterChange, resultCount }) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [location, setLocation] = useState('all');

    const uniqueLocations = useMemo(() => {
        const locs = new Set(items.map(item => item.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [items]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = items.filter(item => {
                // 1. Xử lý từ khóa tìm kiếm (Chuẩn hóa về chữ thường và xóa khoảng trắng thừa)
                const searchLower = search.toLowerCase().trim();

                // Lấy các trường dữ liệu cần tìm (Lưu ý: dùng name_id hoặc user_id tùy DB của bạn)
                const itemName = (item.item_name || "").toLowerCase();
                const description = (item.description || "").toLowerCase();
                const userName = (item.expand?.user_id?.name || item.expand?.name_id?.name || "").toLowerCase();
                const userEmail = (item.expand?.user_id?.email || item.expand?.name_id?.email || "").toLowerCase();
                const phone = String(item.phone || "");

                // Kiểm tra nếu từ khóa xuất hiện trong bất kỳ trường nào bên dưới
                const matchesSearch = !searchLower ||
                    itemName.includes(searchLower) ||
                    description.includes(searchLower) ||
                    userName.includes(searchLower) ||
                    userEmail.includes(searchLower) ||
                    String(item.phone || "").includes(searchLower);

                // 2. Lọc theo trạng thái
                const matchesStatus = status === 'all' || item.status === status;

                // 3. Lọc theo địa điểm
                const matchesLocation = location === 'all' || item.location === location;

                // 4. Lọc theo thời gian đăng
                let matchesDate = true;
                const dateField = item.created_at || item.created; // Đảm bảo lấy đúng field ngày của PocketBase
                if (dateRange !== 'all' && dateField) {
                    const itemDate = parseISO(dateField);
                    if (dateRange === 'today') matchesDate = isToday(itemDate);
                    else if (dateRange === 'week') matchesDate = isThisWeek(itemDate);
                    else if (dateRange === 'month') matchesDate = isThisMonth(itemDate);
                }

                return matchesSearch && matchesStatus && matchesLocation && matchesDate;
            });

            onFilterChange(filtered);
        }, 300);

        return () => clearTimeout(handler);
    }, [search, status, dateRange, location, items, onFilterChange]);

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setDateRange('all');
        setLocation('all');
    };

    const hasActiveFilters = search.trim() !== '' || status !== 'all' || dateRange !== 'all' || location !== 'all';

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo tên đồ, người đăng, sđt..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-3">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="approved">Đã duyệt</SelectItem>
                            <SelectItem value="complete">Hoàn thành</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Mọi lúc</SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
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
                            <SelectItem value="Nơi khác">Nơi khác</SelectItem>
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
                            search.trim() && 'từ khóa',
                            status !== 'all' && 'trạng thái',
                            location !== 'all' && 'địa điểm',
                            dateRange !== 'all' && 'thời gian'
                        ].filter(Boolean).join(', ')}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AdminSearchAndFilterBar;