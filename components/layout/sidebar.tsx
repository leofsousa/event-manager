import { Home, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Sidebar({ open, setOpen }) {
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const pathName = usePathname();
  return (
    <section
      className={`flex flex-col w-64 h-screen border-r justify-between bg-white fixed top-0 left-0 z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static`}
    >
      <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight my-6">
        Event Manager
      </h1>
      <ul className="flex flex-col gap-5 mx-4">
        <li
          onClick={() => {
            router.push('/dashboard');
            setOpen(false);
          }}
          className={`flex items-center rounded-lg p-2 transition gap-2 cursor-pointer ${
            pathName === '/dashboard'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </li>

        <li
          onClick={() => {
            router.push('/dashboard/eventos');
            setOpen(false);
          }}
          className={`flex items-center cursor-pointer rounded-lg p-2 transition gap-2 ${
            pathName === '/dashboard/eventos'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Calendar size={20} />
          <span>Eventos</span>
        </li>

        <li
          onClick={() => {
            router.push('/dashboard/colaboradores');
            setOpen(false);
          }}
          className={`flex items-center cursor-pointer rounded-lg p-2 transition gap-2 ${
            pathName === '/dashboard/colaboradores'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Users size={20} />
          <span>Colaboradores</span>
        </li>

        <li
          onClick={() => {
            router.push('/dashboard/settings');
            setOpen(false);
          }}
          className={`flex items-center cursor-pointer rounded-lg p-2 transition gap-2 ${
            pathName === '/dashboard/settings'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </li>
      </ul>
      <div></div>
      <div></div>
      <div
        onClick={handleLogout}
        className="flex items-center hover:bg-red-200 rounded-lg p-2 transition gap-2 mb-2 mx-3 cursor-pointer"
      >
        <LogOut size={20} />
        <span>Sair</span>
      </div>
    </section>
  );
}
