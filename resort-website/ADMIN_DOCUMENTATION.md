# Resort Website Admin CMS Documentation

## Overview

The Resort Website Admin CMS is a comprehensive local-only content management system designed for resort websites. It provides full control over properties, rooms, media, enquiries, and site settings with a focus on reliability and future cloud migration readiness.

## Features

### 1. Media Library
- **Upload Validation**:
  - Hero images: 2000×1333px, max 1.5MB
  - Gallery images: 1600×1066px, max 1MB
  - Videos: Max 50MB
- **Automatic Optimization**: Images are optimized for web display
- **Deduplication**: Checksum-based duplicate prevention
- **Usage Tracking**: Tracks where media is used across the site
- **Metadata Management**: Alt text, captions, and file information

### 2. Content Management

#### Properties
- Complete property information management
- Hero image and gallery management
- Amenities and features
- Location and contact details
- SEO configuration
- Schema.org markup

#### Room Types
- Room categories and pricing
- Capacity and occupancy settings
- Rate bands with seasonal multipliers
- Image galleries
- Amenity listings

#### Places & Attractions
- On-site facilities (restaurants, spa, etc.)
- Local attractions
- Opening hours
- Location details

#### Offers & Promotions
- Percentage and fixed amount discounts
- Validity periods
- Usage limits
- Booking conditions
- Customer restrictions

#### Promo Codes
- Unique discount codes
- Per-customer usage limits
- Minimum booking values
- Maximum discount caps

#### Referrers
- Referral partner management
- Commission tracking
- Performance statistics
- Referral link generation

### 3. Enquiry Management
- **Auto-generated Reference Codes**: ENQ-YYYY-NNNN format
- **Status Tracking**: New → Contacted → Quoted → Confirmed → Cancelled
- **Timeline History**: Complete audit trail of all changes
- **Search & Filter**: By status, date, name, or reference
- **Statistics Dashboard**: Conversion rates and monthly trends
- **Quick Actions**: Email, call, WhatsApp integration

### 4. Site Settings
- Contact information (multiple phone numbers)
- Legal pages configuration
- Booking settings (SLA, payment methods)
- Currency configuration
- Feature flags for modules
- Discount caps

### 5. Export/Import System
- **Complete Backups**: All content, media, and settings
- **Schema Versioning**: Ensures compatibility (v1.0.0)
- **Dry Run Mode**: Preview changes before applying
- **Selective Export**: Include/exclude media and snapshots
- **Diff Preview**: See exactly what will change
- **ZIP Format**: Standard archive format with manifest

### 6. Security
- **Bcrypt Password Hashing**: Secure password storage
- **Session Management**: 15-minute sessions with auto-extension
- **First-Run Setup**: Secure initial admin creation
- **Role-Based Access**: Admin and Editor roles

## Getting Started

### First-Time Setup
1. Navigate to `/admin/login`
2. Follow the first-run setup wizard
3. Create your admin account with a strong password
4. Setup completes automatically

### Daily Operations
- Log in at `/admin/login`
- Dashboard shows overview of content and enquiries
- Use sidebar navigation to access different modules
- All changes are saved to draft mode
- Publish when ready to go live

## Architecture

### Data Storage
- **localStorage**: All content and settings
- **Base64**: Media files stored as base64 strings
- **File Structure**: Organized folders for different content types

### Service Layer
- **Content Service**: CRUD operations for all entities
- **Media Service**: Upload, validation, and tracking
- **Auth Service**: User authentication and sessions
- **Export/Import Service**: Backup and restore functionality
- **Enquiries Service**: Enquiry management and statistics

### UI Components
- **Form Components**: Reusable form elements with validation
- **Media Editor**: Complete media management interface
- **Content Editors**: Entity-specific editing forms
- **Dashboard**: Overview and statistics

## API Reference

### Content Service
```typescript
// Properties
await contentService.createProperty(propertyData);
await contentService.updateProperty(id, updates);
await contentService.deleteProperty(id);

// Rooms
await contentService.createRoom(roomData);
await contentService.updateRoom(id, updates);

// All other entities follow similar patterns
```

### Media Service
```typescript
// Upload media
const result = await mediaService.uploadMedia(file, options);

// Update usage
await mediaService.updateMediaUsage(mediaId, entityType, entityId, field, action);

// Get media with filters
const media = await mediaService.getMedia({ type: 'image', usage: 'hero' });
```

### Enquiries Service
```typescript
// Create enquiry
const enquiry = await enquiriesService.createEnquiry(enquiryData);

// Update status
await enquiriesService.updateEnquiry(id, { status: 'Contacted' });

// Get statistics
const stats = await enquiriesService.getEnquiryStats();
```

### Export/Import Service
```typescript
// Export data
const blob = await exportImportService.exportData({
  includeMedia: true,
  includeSnapshots: true
});

// Import with preview
const result = await exportImportService.importData(file, true); // dry run
```

## Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Data Migration
To move data between environments:
1. Export data from source
2. Import data to target
3. Verify all content and media

## Best Practices

### Media Management
- Use appropriate image sizes for each use case
- Add descriptive alt text for accessibility
- Regular cleanup of unused media
- Keep filenames descriptive and consistent

### Content Creation
- Fill all required fields
- Use consistent naming conventions
- Review content before publishing
- Keep SEO fields optimized

### Enquiry Handling
- Respond promptly to new enquiries
- Update status regularly
- Add notes for important communications
- Track conversion rates

### Security
- Use strong passwords
- Log out when finished
- Regular backups
- Limit admin access

## Troubleshooting

### Common Issues

**Media Upload Fails**
- Check file size and dimensions
- Verify file type is supported
- Ensure browser has sufficient memory

**Import Fails**
- Verify export file is not corrupted
- Check schema version compatibility
- Ensure sufficient browser storage

**Performance Issues**
- Clear unused media
- Archive old enquiries
- Keep image sizes optimized

## Future Enhancements

### Planned Features
- Multi-language support
- Advanced analytics
- Email templates
- Online booking integration
- Payment gateway integration

### Cloud Migration
The system is designed for easy cloud migration:
- Service-based architecture
- Clear data separation
- Standard file formats
- No external dependencies

## Support

For issues and questions:
1. Check this documentation
2. Review browser console for errors
3. Clear browser data and try again
4. Contact development team

---

*Last Updated: September 2024*