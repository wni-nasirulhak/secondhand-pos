'use client';
import { Package } from 'lucide-react';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/pos/ProductCard';
import PosSearch from '@/components/pos/PosSearch';
import PosCart from '@/components/pos/PosCart';
import PosReceiptModal from '@/components/pos/PosReceiptModal';
import { usePos } from '@/hooks/use-pos';

export default function PosPage() {
  const pos = usePos();

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

        <div className="flex-1 overflow-y-auto pr-1">
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

      {/* Cart & Checkout Section */}
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

      {/* Result & Receipt Modal */}
      <PosReceiptModal 
        show={pos.showResultModal}
        onClose={() => pos.setShowResultModal(false)}
        lastSaleData={pos.lastSaleData}
      />
    </div>
  );
}
