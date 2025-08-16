import { BreadcrumbItem } from '../components/Breadcrumb';

export function createPropertyBreadcrumb({
  cityName,
  citySlug,
  propertyName
}: {
  cityName: string;
  citySlug: string;
  propertyName: string;
}): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: cityName, href: `/locations/${citySlug}` },
    { label: propertyName, isActive: true }
  ];
}

export function createCityBreadcrumb({
  cityName
}: {
  cityName: string;
}): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Cities', href: '/cities' },
    { label: cityName, isActive: true }
  ];
}

export function createStayTypeBreadcrumb({
  stayTypeName
}: {
  stayTypeName: string;
}): BreadcrumbItem[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Stay Types', href: '/stay-types' },
    { label: stayTypeName, isActive: true }
  ];
}