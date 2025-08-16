import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, LucideIcon } from 'lucide-react';
import { Section } from './Layout';

interface CallToActionProps {
  title: string;
  subtitle: string;
  primaryButton: {
    text: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  className?: string;
  variant?: 'blue' | 'gradient' | 'dark';
}

export function CallToAction({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  className = '',
  variant = 'blue'
}: CallToActionProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const renderButton = (button: typeof primaryButton, isPrimary: boolean = true) => {
    const baseClasses = isPrimary
      ? 'px-8 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium'
      : 'px-8 py-3 border border-white text-white rounded-md hover:bg-white hover:text-blue-600 transition-colors font-medium';

    const content = (
      <>
        {button.icon && <button.icon className="w-4 h-4 mr-2 inline" />}
        {button.text}
      </>
    );

    if (button.href) {
      return (
        <Link to={button.href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button onClick={button.onClick} className={baseClasses}>
        {content}
      </button>
    );
  };

  return (
    <Section className={`${getVariantClasses()} ${className}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-xl mb-6">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {renderButton(primaryButton, true)}
          {secondaryButton && renderButton(secondaryButton, false)}
        </div>
      </div>
    </Section>
  );
}

// Preset variants for common use cases
export function BookingCallToAction({ cityName, propertyCount }: { cityName: string; propertyCount: number }) {
  return (
    <CallToAction
      title={`Ready to Book Your Stay in ${cityName}?`}
      subtitle={`Browse our selection of ${propertyCount} properties and find your perfect accommodation`}
      primaryButton={{
        text: 'Book Now',
        icon: Calendar,
        onClick: () => console.log('Book now clicked')
      }}
      secondaryButton={{
        text: 'Contact Us',
        href: '/contact'
      }}
    />
  );
}

export function PropertyCallToAction({ propertyName }: { propertyName: string }) {
  return (
    <CallToAction
      title={`Book Your Stay at ${propertyName}`}
      subtitle="Experience luxury and comfort in this exceptional property"
      primaryButton={{
        text: 'Check Availability',
        icon: Calendar,
        onClick: () => console.log('Check availability clicked')
      }}
      secondaryButton={{
        text: 'View Gallery',
        onClick: () => console.log('View gallery clicked')
      }}
      variant="gradient"
    />
  );
}