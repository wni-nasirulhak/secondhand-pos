'use client';
import { useState } from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/pos/ProductCard';
import PosSearch from '@/components/pos/PosSearch';
import PosCart from '@/components/pos/PosCart';
import CartBottomSheet from '@/components/pos/CartBottomSheet';
import PosReceiptModal from '@/components/pos/PosReceiptModal';
import { usePos } from '@/hooks/use-pos';

export default function PosPage() {
  const pos = usePos();
  const [showMobileCart, setShowMobileCart] = useState(false);

  if (pos.loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 font-bold">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] lg:overflow-hidden items-stretch px-3 md:px-0">
      {/* Product Grid Section */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        <div className="sticky top-0 z-20 bg-[var(--background)]/90 backdrop-blur-md pb-2">
          <PosSearch 
            searchQuery={pos.searchQuery}
            setSearchQuery={pos.setSearchQuery}
            selectedCategory={pos.selectedCategory}
            setSelectedCategory={pos.setSelectedCategory}
            filterBrand={pos.filterBrand}
            setFilterBrand={pos.setFilterBrand}
            categories={pos.categories}
            brands={pos.brands}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 pb-20 lg:pb-0">
            {pos.paginatedItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                <Package className="w-16 h-16 opacity-20" />
                <p className="font-bold text-sm">ไม่พบสินค้าที่คุณต้องการ</p>
              </div>
            ) : (
              <>
                <div className="product-grid mb-6">
                    {pos.paginatedItems.map(item => (
                      <ProductCard 
                        key={item.barcode_id} 
                        item={item} 
                        inCart={pos.cart.some(c => c.barcode_id === item.barcode_id)}
                        onAdd={() => pos.addToCart(item)}
                      />
                    ))}
                </div>
                <Pagination 
                  currentPage={pos.currentPage}
                  totalPages={pos.totalPages}
                  onPageChange={pos.setCurrentPage}
                  itemsPerPage={pos.itemsPerPage}
                  onItemsPerPageChange={(val) => { pos.setItemsPerPage(val); pos.setCurrentPage(1); }}
                  totalItems={pos.filteredItems.length}
                />
              </>
            )}
        </div>
      </div>

      {/* Desktop Cart (hidden on mobile) */}
      <div className="hidden lg:block">
        <PosCart 
          cart={pos.cart}
          removeFromCart={pos.removeFromCart}
          phoneSearch={pos.phoneSearch}
          setPhoneSearch={pos.setPhoneSearch}
          findCustomer={pos.findCustomer}
          selectedCustomer={pos.selectedCustomer}
          newCustomerName={pos.newCustomerName}
          setNewCustomerName={pos.setNewCustomerName}
          customerAddress={pos.customerAddress}
          setCustomerAddress={pos.setCustomerAddress}
          subtotal={pos.subtotal}
          total={pos.total}
          checkoutLoading={pos.checkoutLoading}
          handleCheckout={pos.handleCheckout}
          discountAmount={pos.discountAmount}
          setDiscountAmount={pos.setDiscountAmount}
          shippingCost={pos.shippingCost}
          setShippingCost={pos.setShippingCost}
          packingCost={pos.packingCost}
          setPackingCost={pos.setPackingCost}
          otherCost={pos.otherCost}
          setOtherCost={pos.setOtherCost}
          pointsUsed={pos.pointsUsed}
          setPointsUsed={pos.setPointsUsed}
        />
      </div>

      {/* Mobile FAB Cart Button */}
      <button
        onClick={() => setShowMobileCart(true)}
        className="lg:hidden fixed z-[100] shadow-2xl shadow-indigo-500/30 active:scale-90 transition-all"
        style={{ 
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', 
          right: '16px',
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <ShoppingBag size={24} />
        {pos.cart.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 900,
            border: '3px solid white',
          }}>
            {pos.cart.length}
          </span>
        )}
      </button>

      {/* Mobile Cart Bottom Sheet */}
      <CartBottomSheet
        isOpen={showMobileCart}
        onClose={() => setShowMobileCart(false)}
        cart={pos.cart}
        removeFromCart={pos.removeFromCart}
        phoneSearch={pos.phoneSearch}
        setPhoneSearch={pos.setPhoneSearch}
        findCustomer={pos.findCustomer}
        selectedCustomer={pos.selectedCustomer}
        newCustomerName={pos.newCustomerName}
        setNewCustomerName={pos.setNewCustomerName}
        customerAddress={pos.customerAddress}
        setCustomerAddress={pos.setCustomerAddress}
        subtotal={pos.subtotal}
        total={pos.total}
        checkoutLoading={pos.checkoutLoading}
        handleCheckout={pos.handleCheckout}
        discountAmount={pos.discountAmount}
        setDiscountAmount={pos.setDiscountAmount}
        shippingCost={pos.shippingCost}
        setShippingCost={pos.setShippingCost}
        packingCost={pos.packingCost}
        setPackingCost={pos.setPackingCost}
        otherCost={pos.otherCost}
        setOtherCost={pos.setOtherCost}
        pointsUsed={pos.pointsUsed}
        setPointsUsed={pos.setPointsUsed}
      />

      {/* Result & Receipt Modal */}
      <PosReceiptModal 
        show={pos.showResultModal}
        onClose={() => pos.setShowResultModal(false)}
        lastSaleData={pos.lastSaleData}
      />
    </div>
  );
}
