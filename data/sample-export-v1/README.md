# Sample Export v1

This directory contains the canonical layout for admin exports in Wayanad Nature Resorts Admin v1.

## Directory Structure

```
sample-export-v1/
├── manifest.json          # Export metadata and checksums
├── content/               # All entity data as JSON
│   ├── properties.json    # Property entities
│   ├── roomTypes.json     # Room type entities
│   ├── places.json        # Place entities
│   ├── offers.json        # Offer entities
│   ├── promoCodes.json    # Promo code entities
│   ├── enquiries.json     # Enquiry entities
│   └── settings.json      # Settings entity
├── snapshots/             # Entity snapshots (ring buffers)
│   ├── properties.snapshots.json
│   ├── roomTypes.snapshots.json
│   ├── places.snapshots.json
│   └── offers.snapshots.json
└── media/                 # Media files (when included)
    ├── manifest.json      # Media metadata
    └── files/            # Binary files
```

## Key Points

- **PII Warning**: Enquiries contain personally identifiable information
- **Media**: Optional - only included when export includes media files
- **Snapshots**: Ring buffers of <= 20 snapshots per entity type
- **Checksums**: SHA256 hashes for content integrity verification
- **Aliases**: Import also accepts legacy names (e.g., `rooms.json` for `roomTypes.json`)

## Import/Export Process

1. **Export**:
   - Generate ZIP with this structure
   - Include manifest with metadata
   - Add checksums for integrity
   - Warn about PII content

2. **Import (Dry-run)**:
   - Read and validate manifest
   - Show diff of changes
   - Verify checksums
   - Get user confirmation

3. **Import (Apply)**:
   - Create automatic backup
   - Apply changes with replace semantics
   - Update snapshots
   - Allow one-click rollback

## Amenities

All amenities are normalized using the catalog from `src/admin/reference/amenities.ts`.
Import de-duplicates amenities using the normalize function.