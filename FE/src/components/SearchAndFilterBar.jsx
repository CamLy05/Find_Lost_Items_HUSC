import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, MapPin, Calendar } from 'lucide-react';

const SearchAndFilterBar = ({
    onSearch,
    onCategoryChange,
    onLocationChange,
    onDateRangeChange,
    onClear,
    isLoading,
    activeCount = 0
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [location, setLocation] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleCategoryChange = (val) => {
        setCategory(val);
        if (onCategoryChange) onCategoryChange(val === 'all' ? '' : val);
    };

    const handleLocationChange = (e) => {
        const val = e.target.value;
        setLocation(val);
        if (onLocationChange) onLocationChange(val);
    };

    const handleDateFromChange = (e) => {
        const val = e.target.value;
        setDateFrom(val);
        if (onDateRangeChange) onDateRangeChange(val, dateTo);
    };

    const handleDateToChange = (e) => {
        const val = e.target.value;
        setDateTo(val);
        if (onDateRangeChange) onDateRangeChange(dateFrom, val);
    };

    const handleClear = () => {
        setSearchTerm('');
        setCategory('all');
        setLocation('');
        setDateFrom('');
        setDateTo('');
        if (onClear) onClear();
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4 transition-all">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap md:flex-nowrap gap-3">
                    <Select value={category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full md:w-[140px] bg-slate-50/50">
                            <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="find">Tìm đồ</SelectItem>
                            <SelectItem value="lost">Nhặt đồ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative w-full md:w-[160px]">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Địa điểm..."
                            value={location}
                            onChange={handleLocationChange}
                            className="pl-9 bg-slate-50/50"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50/50 border border-slate-200 rounded-md px-3 focus-within:ring-1 focus-within:ring-ring">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={handleDateFromChange}
                            className="bg-transparent border-none text-sm focus:outline-none w-[110px] text-slate-600"
                            aria-label="Từ ngày"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={handleDateToChange}
                            className="bg-transparent border-none text-sm focus:outline-none w-[110px] text-slate-600"
                            aria-label="Đến ngày"
                        />
                    </div>

                    {activeCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={handleClear}
                            className="px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 w-full md:w-auto"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Xóa lọc
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>
                        {isLoading ? 'Đang lọc...' : `Đang áp dụng ${activeCount} bộ lọc`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SearchAndFilterBar;