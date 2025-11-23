import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import '../../hr-home/styles/AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

