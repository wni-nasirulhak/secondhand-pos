import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <BottomNav />
      <main className="app-main">
        <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
