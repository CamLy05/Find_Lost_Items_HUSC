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

    // Extract unique locations from items
    const uniqueLocations = useMemo(() => {
        const locs = new Set(items.map(item => item.location).filter(Boolean));
        return Array.from(locs).sort();
    }, [items]);

    useEffect(() => {
        const filtered = items.filter(item => {
            // Search filter (item_name, user name via expand, phone)
            const searchLower = search.toLowerCase();
            const userName = item.expand?.user_id?.name || item.expand?.user_id?.email || '';

            const matchesSearch = !search ||
                item.item_name?.toLowerCase().includes(searchLower) ||
                userName.toLowerCase().includes(searchLower) ||
                item.phone?.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus = status === 'all' || item.status === status;

            // Location filter
            const matchesLocation = location === 'all' || item.location === location;

            // Date filter
            let matchesDate = true;
            if (dateRange !== 'all' && item.created_at) {
                const itemDate = parseISO(item.created_at);
                if (dateRange === 'today') matchesDate = isToday(itemDate);
                else if (dateRange === 'week') matchesDate = isThisWeek(itemDate);
                else if (dateRange === 'month') matchesDate = isThisMonth(itemDate);
            }

            return matchesSearch && matchesStatus && matchesLocation && matchesDate;
        });

        onFilterChange(filtered);
    }, [search, status, dateRange, location, items]);

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setDateRange('all');
        setLocation('all');
    };

    const hasActiveFilters = search || status !== 'all' || dateRange !== 'all' || location !== 'all';

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
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                            <SelectItem value="approved">Đã duyệt</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
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

                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Địa điểm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả địa điểm</SelectItem>
                            {uniqueLocations.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
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

            <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Hiển thị {resultCount} kết quả</span>
                </div>
            </div>
        </div>
    );
};

export default AdminSearchAndFilterBar;