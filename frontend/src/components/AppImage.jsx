import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  iconName = null,
  iconSize = 24,
  iconColor = "currentColor",
  useIcon = false,
  fallbackIcon = "HelpCircle",
  ...props
}) {
  // If useIcon is true or src is not provided, use icon instead
  if (useIcon || !src) {
    const IconComponent = iconName ? LucideIcons?.[iconName] : LucideIcons?.[fallbackIcon] || HelpCircle;
    return (
      <IconComponent
        size={iconSize}
        color={iconColor}
        className={className}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // If image fails to load and iconName is provided, replace with icon
        if (iconName) {
          const IconComponent = LucideIcons?.[iconName] || HelpCircle;
          const svg = IconComponent({ size: iconSize, color: iconColor, className });
          e.target.replaceWith(svg);
        } else {
          e.target.src = "/assets/images/no_image.png";
        }
      }}
      {...props}
    />
  );
}

export default Image;
