'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Calendar, CreditCard, Loader2, UserPlus, Filter,
  ChevronDown,
  Tag as TagIcon,
  ShoppingBag,
  XCircle
} from 'lucide-react';
import Pagination from '@/components/Pagination';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

export default function DashboardPage() {
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [salesLimit, setSalesLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Data
  const [dashboardData, setDashboardData] = useState(null);
  const [sales, setSales] = useState([]);
  const [salesCount, setSalesCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]); // Store full inventory for dependent filters
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Initial lookup data
  useEffect(() => {
    async function fetchLookups() {
      try {
        const [catRes, invRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/inventory')
        ]);
        const cats = await catRes.json();
        const inv = await invRes.json();
        setCategories(Array.isArray(cats) ? cats : []);
        setInventory(Array.isArray(inv) ? inv : []);
      } catch (err) {
        console.error('Lookup fetch error:', err);
      }
    }
    fetchLookups();
  }, []);

  // Derived brands based on selected category
  const filteredBrands = useMemo(() => {
    let list = inventory;
    if (categoryId) {
      list = inventory.filter(p => p.category_id && p.category_id.toString() === categoryId.toString());
    }
    return [...new Set(list.map(i => i.brand).filter(Boolean))].sort();
  }, [inventory, categoryId]);

  // Reset brand if it's no longer in the filtered list
  useEffect(() => {
    if (brandId && !filteredBrands.includes(brandId)) {
      setBrandId('');
    }
  }, [categoryId, filteredBrands, brandId]);

  // Main data fetch with filters
  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (categoryId) params.append('categoryId', categoryId);
        if (brandId) params.append('brand', brandId);
        params.append('limit', salesLimit);
        params.append('page', currentPage);

        const [statsRes, salesRes] = await Promise.all([
          fetch(`/api/dashboard/stats?${params.toString()}`),
          fetch(`/api/sales?${params.toString()}`)
        ]);
        const statsData = await statsRes.json();
        const salesData = await salesRes.json();

        setDashboardData(statsData);
        setSales(Array.isArray(salesData.sales) ? salesData.sales : []);
        setSalesCount(salesData.pagination?.total || 0);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, categoryId, brandId, salesLimit, currentPage]);

  const stats = useMemo(() => {
    if (!dashboardData) return null;
    return dashboardData.summary;
  }, [dashboardData]);

  const chartData = useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData.revenueByDay)) return [];
    return dashboardData.revenueByDay.map(d => ({
      name: d.date ? d.date.split('-').slice(1).join('/') : 'N/A',
      total: d.total || 0
    }));
  }, [dashboardData, salesLimit, currentPage]);

  const totalPages = Math.ceil(salesCount / salesLimit);

  const handleVoid = async (saleId) => {
    if (!confirm(`ยืนยันการยกเลิกบิล #${saleId}? สินค้าจะถูกคืนกลับเข้าสต๊อก`)) return;
    try {
      const res = await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId })
      });
      if (res.ok) {
        alert('ยกเลิกบิลสำเร็จ');
        setSales(prev => prev.filter(s => s.ID !== saleId));
        setSalesCount(prev => prev - 1);
        // Force refresh of stats by doing a soft reload
        window.location.reload();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const categoryBarData = useMemo(() => {
    if (!dashboardData || !Array.isArray(dashboardData.revenueByCategory)) return [];
    return dashboardData.revenueByCategory.map(c => ({
      name: c.category || 'Unknown',
      cost: c.total_cost || 0,
      profit: Math.max(0, (c.total_revenue || 0) - (c.total_cost || 0))
    })).slice(0, 8);
  }, [dashboardData]);

  if (loading && !dashboardData) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 px-3 md:px-6">
      {/* Header & Filters Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Analytics</h1>
          <p className="text-slate-400 font-bold text-[8px] md:text-xs leading-none uppercase tracking-tighter">Smart Overview</p>
        </div>

        {/* Mobile: Toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 active:scale-95 transition-all shadow-sm w-full justify-center"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'ปิดตัวกรอง' : 'ตัวกรองข้อมูล'}
        </button>

        {/* Filters: always visible on md+, toggle on mobile */}
        <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-1 md:gap-2 bg-white/80 backdrop-blur-md p-1 md:p-2 rounded-lg md:rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md`}>
          <div className="flex items-center gap-1 px-0.5">
            <Filter className="w-3 h-3 text-slate-400" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Filters</span>
          </div>

          <div className="h-8 w-[1px] bg-slate-100 hidden sm:block mx-1"></div>

          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5 md:gap-2 w-full md:w-auto">
            <FilterItem icon={Calendar}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[10px] md:text-xs font-semibold text-slate-600 focus:ring-0 outline-none w-full md:w-[110px]"
              />
            </FilterItem>

            <FilterItem icon={Calendar}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[10px] md:text-xs font-semibold text-slate-600 focus:ring-0 outline-none w-full md:w-[110px]"
              />
            </FilterItem>

            <FilterItem icon={TagIcon}>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-transparent border-none text-[10px] md:text-xs font-semibold text-slate-600 focus:ring-0 outline-none appearance-none w-full md:min-w-[130px] pr-4 md:pr-6"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400 pointer-events-none" />
            </FilterItem>

            <FilterItem icon={ShoppingBag}>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="bg-transparent border-none text-[10px] md:text-xs font-semibold text-slate-600 focus:ring-0 outline-none appearance-none w-full md:min-w-[130px] pr-4 md:pr-6"
              >
                <option value="">ทุกแบรนด์</option>
                {filteredBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400 pointer-events-none" />
            </FilterItem>

            {(startDate || endDate || categoryId || brandId) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setCategoryId(''); setBrandId(''); }}
                className="px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-6">
        <StatCard
          title="Revenue"
          value={`฿${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle={`${stats?.totalSales || 0} Transactions`}
          color="bg-indigo-500"
          lightColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <StatCard
          title="Profit"
          value={`฿${(stats?.totalProfit || 0).toLocaleString()}`}
          icon={TrendingUp}
          subtitle={stats?.totalRevenue ? Math.round((stats.totalProfit / stats.totalRevenue) * 100) + "% Margin" : "0% Margin"}
          color="bg-emerald-500"
          lightColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <StatCard
          title="Customers"
          value={(stats?.totalCustomers || 0).toLocaleString()}
          icon={Users}
          subtitle="Registered users"
          color="bg-amber-500"
          lightColor="bg-amber-50"
          textColor="text-amber-600"
        />
        <StatCard
          title="Active Stock"
          value={(stats?.availableStock || 0).toLocaleString()}
          icon={Package}
          subtitle="Units in inventory"
          color="bg-rose-500"
          lightColor="bg-rose-50"
          textColor="text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg md:rounded-[24px] border border-slate-200 p-1.5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <div>
              <h2 className="text-sm md:text-xl font-black text-slate-900 leading-none">Sales Trends</h2>
              <p className="text-slate-400 text-[8px] md:text-xs leading-none mt-0.5">Real-time performance</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Data</span>
            </div>
          </div>
          <div className="h-[180px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => `฿${v >= 1000 ? (v / 1000) + 'k' : v}`}
                />
                <Tooltip
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  labelStyle={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}
                  itemStyle={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}
                  formatter={(v) => [`฿${v.toLocaleString()}`, 'ยอดขาย']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Performance */}
        <div className="bg-white rounded-lg md:rounded-[24px] border border-slate-200 p-1.5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-2 md:mb-6">
            <h2 className="text-sm md:text-xl font-black text-slate-900 leading-none">Top Brands</h2>
            <p className="text-slate-400 text-[8px] md:text-xs leading-none mt-0.5">Best performing labels</p>
          </div>

          <div className="space-y-5">
            {(dashboardData?.topBrands || []).slice(0, 6).map((brand, i) => (
              <div key={i} className="group flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-slate-700 truncate pr-2">{brand.name}</span>
                    <span className="text-xs font-black text-slate-900">฿{brand.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: i === 0 ? '100%' : Math.max(10, (brand.total_revenue / (dashboardData.topBrands?.[0]?.total_revenue || 1)) * 100) + '%' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {(!dashboardData || !dashboardData.topBrands || dashboardData.topBrands.length === 0) && (
              <div className="py-20 text-center flex flex-col items-center gap-3 opacity-20">
                <BarChart3 className="w-12 h-12" />
                <p className="text-sm font-bold">No brand data available</p>
              </div>
            )}
          </div>

          <div className="mt-6 md:mt-10 pt-4 md:pt-8 border-t border-slate-50">
            <div className="bg-slate-900 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Profit</p>
                <h4 className="text-xl md:text-2xl font-bold italic tracking-tighter">฿{(stats?.totalProfit || 0).toLocaleString()}</h4>
                <div className="mt-2 md:mt-4 flex items-center gap-2 text-emerald-400">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-bold">{stats?.totalRevenue ? Math.round((stats.totalProfit / stats.totalRevenue) * 100) : 0}% Margin Rate</span>
                </div>
              </div>
              <Activity className="absolute bottom-[-15%] right-[-5%] w-24 h-24 md:w-32 md:h-32 text-white/5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost vs Profit Breakdown */}
        <div className="bg-white rounded-xl md:rounded-[32px] border border-slate-200 p-2 md:p-8 shadow-sm">
          <div className="mb-4 md:mb-8">
            <h2 className="text-lg font-bold text-slate-900">Finance breakdown</h2>
            <p className="text-slate-400 text-[10px] md:text-sm">เปรียบเทียบต้นทุนและกำไรตามหมวดหมู่</p>
          </div>

          <div className="h-[220px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(v, name) => [`฿${v.toLocaleString()}`, name === 'profit' ? 'Profit' : 'Cost']}
                />
                <Bar dataKey="cost" stackId="a" fill="#1e1b4b" radius={[0, 0, 0, 0]} barSize={12} name="cost" />
                <Bar dataKey="profit" stackId="a" fill="#38bdf8" radius={[0, 10, 10, 0]} barSize={12} name="profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 md:mt-4 flex flex-wrap justify-center gap-3 md:gap-6">
            <LegendItem color="bg-[#1e1b4b]" label="Cost" />
            <LegendItem color="bg-[#38bdf8]" label="Profit" />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-lg md:rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-1.5 md:p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-1.5 md:gap-3">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-md md:rounded-xl bg-indigo-50 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm md:text-lg font-black text-slate-900 leading-none">Recent Sales</h2>
                <p className="text-slate-400 text-[8px] md:text-xs mt-0.5 leading-none tracking-tighter">Live feed</p>
              </div>
            </div>
            <div className="text-[7px] md:text-[8px] font-black text-slate-500 bg-slate-100 px-1.5 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-xl uppercase tracking-tighter border border-slate-200/50">
              Live Feed
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex-1 overflow-y-auto space-y-2 p-2">
            {sales.map((item) => (
              <div key={item.ID} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-indigo-600">#{item.ID}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.Timestamp).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button onClick={() => handleVoid(item.ID)} className="text-rose-400 bg-rose-50 p-2 rounded-xl active:scale-90 transition-all" title="Void">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-700 mb-1">{item.Customer_Name || 'General'}</div>
                <div className="text-xs text-slate-400 truncate mb-3">{item.Product_Name}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div>
                    <div className="text-xs text-slate-400 font-bold">Revenue</div>
                    <div className="text-base font-black text-slate-800">฿{item.Price.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold">Profit</div>
                    <div className="text-base font-black text-emerald-600">+฿{item.Profit_Baht.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-3 opacity-20">
                <ShoppingCart className="w-12 h-12" />
                <p className="text-sm font-bold">ไม่พบข้อมูล</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                  <th className="pl-4 md:pl-8 py-3 md:py-5">Order ID</th>
                  <th className="px-4 py-3 md:py-5">Customer & Product</th>
                  <th className="px-4 py-3 md:py-5 text-center">Amount</th>
                  <th className="pr-4 md:pr-8 py-3 md:py-5 text-right">Net Profit</th>
                  <th className="pr-4 md:pr-8 py-3 md:py-5 text-right w-[60px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((item) => (
                  <tr key={item.ID} className="group hover:bg-slate-50/60 transition-colors">
                    <td className="pl-4 md:pl-8 py-2 md:py-5">
                      <div className="text-[10px] md:text-sm font-bold text-slate-800 leading-none">#{item.ID}</div>
                      <div className="text-[8px] md:text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                        {new Date(item.Timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-2 md:py-5">
                      <div className="text-[10px] md:text-sm font-semibold text-slate-700 leading-none">{item.Customer_Name || 'General'}</div>
                      <div className="text-[8px] md:text-[10px] text-slate-400 font-medium truncate max-w-[100px] md:max-w-[200px] mt-0.5 leading-none">{item.Product_Name}</div>
                    </td>
                    <td className="px-4 py-2 md:py-5 text-center">
                      <div className="text-[10px] md:text-sm font-bold text-slate-900 tracking-tight leading-none">฿{item.Price.toLocaleString()}</div>
                    </td>
                    <td className="pr-4 md:pr-8 py-3 md:py-5 text-right">
                      <div className="text-xs md:text-sm font-bold text-emerald-600 tracking-tight">+฿{item.Profit_Baht.toLocaleString()}</div>
                      <div className="text-[9px] font-bold text-emerald-500/80 mt-1 uppercase">
                        {Math.round(item.Profit_Percent)}% Profit
                      </div>
                    </td>
                    <td className="pr-4 md:pr-8 py-2 md:py-5 text-right">
                      <button onClick={() => handleVoid(item.ID)} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 md:p-2 rounded-lg transition-all" title="Void Bill">
                        <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="opacity-10 grayscale flex flex-col items-center">
                        <ShoppingCart className="w-16 h-16 mb-2" />
                        <p className="text-lg font-bold italic">No data matched filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={salesLimit}
              onItemsPerPageChange={(val) => { setSalesLimit(val); setCurrentPage(1); }}
              totalItems={salesCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterItem({ icon: Icon, children }) {
  return (
    <div className="relative group bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1 md:p-2 transition-all flex items-center gap-1 md:gap-2">
      <Icon className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-slate-400" />
      {children}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle, color, lightColor, textColor }) {
  return (
    <div className="bg-white rounded-lg md:rounded-[24px] p-2 md:p-6 border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5 group relative overflow-hidden min-w-0">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-1.5 md:mb-4">
          <div className={`${lightColor} ${textColor} p-1.5 md:p-3 rounded-lg md:rounded-2xl group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full border border-slate-100 truncate ml-1">
            {title}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 md:mb-2 truncate">{value}</p>
          <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none truncate">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
