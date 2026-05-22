import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import ToastContainer from './ToastContainer';
import { useToast } from '../../hooks/useToast';
import { createContext, useContext } from 'react';
import type { Toast } from '../../hooks/useToast';

interface ToastCtx { show: (msg: string, type?: Toast['type']) => void }
export const ToastContext = createContext<ToastCtx>({ show: () => {} });
export const useToastContext = () => useContext(ToastContext);

export default function Layout() {
  const { toasts, show, dismiss } = useToast();
  return (
    <ToastContext.Provider value={{ show }}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
