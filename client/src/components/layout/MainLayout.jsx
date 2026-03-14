import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <>
      <Header />
      <div className="flex pt-16 min-h-screen">
        <Sidebar />
        <main className="ml-56 flex-1 p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </>
  )
}
