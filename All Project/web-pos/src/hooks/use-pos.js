'use client';
import { useState, useEffect, useMemo } from 'react';
import { normPhone } from '@/lib/utils';

export function usePos() {
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');

  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAddress, setCustomerAddress] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [pointsUsed, setPointsUsed] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);

  const fetchData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/customers')
      ]);
      const invData = await invRes.json();
      const custData = await custRes.json();
      setInventory(Array.isArray(invData) ? invData : []);
      setCustomers(Array.isArray(custData.customers) ? custData.customers : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableItems = useMemo(() => inventory.filter(i => i.status === 'Available'), [inventory]);
  
  const categories = useMemo(() => ['All', ...new Set(availableItems.map(i => i.Category_Name).filter(Boolean))], [availableItems]);
  const brands = useMemo(() => ['All', ...new Set(availableItems.map(i => i.brand).filter(Boolean))], [availableItems]);
  
  const filteredItems = useMemo(() => availableItems.filter(i => {
    const matchSearch = String(i.item_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        String(i.barcode_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || i.Category_Name === selectedCategory;
    const matchBrand = filterBrand === 'All' || i.brand === filterBrand;
    return matchSearch && matchCategory && matchBrand;
  }), [availableItems, searchQuery, selectedCategory, filterBrand]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filterBrand]);

  const addToCart = (item) => {
    if (cart.find(c => c.barcode_id === item.barcode_id)) {
      setCart(cart.filter(c => c.barcode_id !== item.barcode_id));
      return;
    }
    setCart([...cart, item]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.barcode_id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.selling_price || 0), 0);
  const total = Math.max(0, subtotal - discountAmount - pointsUsed);

  const findCustomer = () => {
    const searchNorm = phoneSearch;
    const found = customers.find(c => {
      const cPhone = String(c.Phone_Number || c.Phone || '');
      return cPhone === searchNorm && searchNorm !== '';
    });
    if (found) {
      setSelectedCustomer(found);
      setCustomerAddress(found.Address || found.address || '');
      setNewCustomerName('');
    } else {
      setSelectedCustomer(null);
      setCustomerAddress('');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customerPhone: phoneSearch,
          customerAddress,
          paymentMethod,
          discountAmount,
          pointsUsed,
          newCustomerName
        })
      });
      const data = await res.json();
      if (data.success) {
        setLastSaleData({
          saleId: data.saleId,
          cart: [...cart],
          total,
          customer: selectedCustomer || { name: newCustomerName || 'ลูกค้าทั่วไป', phone: phoneSearch },
          timestamp: new Date().toLocaleString('th-TH')
        });
        setShowResultModal(true);
        setCart([]);
        setPhoneSearch('');
        setSelectedCustomer(null);
        setCustomerAddress('');
        fetchData(); // Refresh data
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (err) {
      alert('Error during checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    inventory, customers, loading,
    cart, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    filterBrand, setFilterBrand,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    phoneSearch, setPhoneSearch,
    selectedCustomer, setSelectedCustomer,
    customerAddress, setCustomerAddress,
    newCustomerName, setNewCustomerName,
    pointsUsed, setPointsUsed,
    paymentMethod, setPaymentMethod,
    discountAmount, setDiscountAmount,
    checkoutLoading, showResultModal, setShowResultModal,
    lastSaleData,
    // Derived
    categories, brands, filteredItems, paginatedItems, totalPages, subtotal, total,
    // Actions
    addToCart, removeFromCart, findCustomer, handleCheckout
  };
}
