export default function Card({ children, variant = 'default', size = 'medium' }) {
  // Determine card class based on variant
  const variantClass = {
    default: 'card',
    primary: 'water-primary-card',
    alert: 'water-alert-card',
    future: 'water-future-card'
  }[variant] || 'card';

  // Determine size class
  const sizeClass = {
    small: 'water-card-small',
    medium: 'water-card-medium',
    large: 'water-card-large',
    full: 'water-card-full'
  }[size] || '';

  const className = `${variantClass} ${sizeClass}`.trim();

  return (
    <div className={className}>
      {children}
    </div>
  );
}
