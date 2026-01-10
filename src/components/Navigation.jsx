import { NavLink } from 'react-router-dom'

function Navigation() {
  const navItems = [
    { to: '/journal', label: 'Dagboek' },
    { to: '/notes', label: 'Notities' },
    // Future items will be added here:
    // { to: '/todos', label: 'Todo' },
    // { to: '/calendar', label: 'Afspraken' },
    // { to: '/knowledge', label: 'Kennisbase' },
  ]

  return (
    <nav className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-white">Personal Suite</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-accent text-white'
                        : 'border-transparent text-gray-300 hover:border-accent-light hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
