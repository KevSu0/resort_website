import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { type Property } from '@/types';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ property }: { property?: Property }) {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const crumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    const pathname = location.pathname;

    if (pathname === '/') {
      return crumbs.slice(0, 1);
    }

    if (pathname.startsWith('/properties')) {
      crumbs.push({ label: 'Properties', href: '/#featured' });

      if (property) {
        crumbs.push({ label: property.name, href: `/properties/${property.slug}` });
      }
    }

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="py-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
            )}

            {crumb.href ? (
              <Link
                to={crumb.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  index < breadcrumbs.length - 1
                    ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    : 'text-gray-900 bg-gray-100'
                }`}
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span className={index < breadcrumbs.length - 1 ? '' : 'font-medium'}>{crumb.label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-900 bg-gray-100">
                {index === 0 && <Home className="w-4 h-4" />}
                <span className="font-medium">{crumb.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}