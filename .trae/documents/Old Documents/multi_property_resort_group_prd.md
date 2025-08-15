# Multi-Property Resort Group Platform - Product Requirements Document

## 1. Product Overview
A comprehensive multi-property resort group platform supporting multiple resort properties across different locations, each with distinct branding, stay types, and location-based SEO optimization.
- The platform serves as a unified digital presence for a resort group with properties in various cities, enabling guests to discover, explore, and request stays across the entire portfolio while maintaining property-specific branding and experiences.
- Target market: Resort groups, hospitality chains, and multi-location accommodation providers seeking centralized management with localized optimization.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Guest User | No registration required | Browse all properties, filter by location/stay type, view galleries, submit enquiries |
| Group Admin | Firebase Authentication | Full platform management, all properties access, analytics, SEO management, AI system prompt editing, AI content approval |
| Property Manager | Admin-created Firebase accounts | Property-specific content management, enquiry management, local analytics, AI content generation for assigned properties |
| City Manager | Admin-created Firebase accounts | City-wide content management, location-based SEO, cross-property coordination, AI content generation for city pages |
| SEO Manager | Admin-created Firebase accounts | AI system prompt management, SEO content generation, performance tracking, content registry oversight |
| Content Editor | Admin-created Firebase accounts | AI content generation, draft review and editing, cannot apply changes to production |

### 2.2 Multi-Property Architecture
Our resort group platform consists of the following hierarchical structure:
1. **Group Homepage**: Brand overview, property showcase, location-based discovery, unified search
2. **Property Pages**: Individual resort branding, accommodation showcase, property-specific experiences, local information
3. **Stay Type Pages**: Detailed accommodation types within properties (treehouses, villas, suites, etc.)
4. **City Landing Pages**: Location-based discovery, all properties in city, local attractions, curated experiences
5. **Combo Pages**: City + stay type combinations ("Treehouses in Wayanad", "Villas in Goa")
6. **Request Stay System**: Multi-property enquiry handling with property routing and unified communication
7. **Admin Dashboard**: Multi-tenant management with property-specific and group-wide analytics

### 2.3 URL Strategy & SEO Architecture
| URL Pattern | Purpose | SEO Focus |
|-------------|---------|----------|
| / | Group homepage with property discovery | Brand keywords, "resort group", "luxury accommodations" |
| /properties/{property-slug} | Individual property homepage | Property name, location, unique features |
| /properties/{property-slug}/stays/{stay-type} | Specific accommodation types | Stay type + location combinations |
| /locations/{city-slug} | City-based landing pages | City tourism, "resorts in {city}", local attractions |
| /locations/{city-slug}/{stay-type} | Curated city + stay type pages | Long-tail: "treehouses in wayanad", "villas in goa" |
| /experiences/{city-slug} | Location-specific experiences | Activity-based keywords, adventure tourism |
| /request-stay | Multi-property enquiry form | Conversion-focused, minimal SEO |

### 2.4 Page Details
| Page Name | Module Name | Feature Description |
|-----------|-------------|---------------------|
| Group Homepage | Hero Section | Dynamic property carousel with location-based filtering, unified brand messaging, call-to-action for property discovery |
| Group Homepage | Property Discovery | Interactive map with property markers, filter by location/stay type/amenities, property comparison tools |
| Group Homepage | Location Showcase | Featured cities with property counts, seasonal highlights, curated travel guides |
| Property Pages | Property Hero | Location-specific imagery, property branding, unique selling propositions, local weather integration |
| Property Pages | Stay Type Grid | Accommodation showcase with availability indicators, pricing ranges, booking integration |
| Property Pages | Local Experiences | Property-specific activities, nearby attractions, partnership integrations |
| Stay Type Pages | Accommodation Details | Comprehensive room information, 360° tours, amenity lists, capacity details, seasonal pricing |
| Stay Type Pages | Availability Calendar | Real-time availability display, seasonal information, enquiry integration |
| City Landing Pages | City Overview | Destination information, climate, attractions, transportation, property locations |
| City Landing Pages | Property Listings | All group properties in city, comparison tools, unified booking flow |
| City Landing Pages | Local Experiences | City-wide activity recommendations, seasonal events, cultural highlights |
| Combo Pages | Curated Collections | "Treehouses in Wayanad" with property comparisons, unique features, booking options |
| Request Stay System | Property Selection | Dynamic property dropdown based on location/dates, property-specific forms |
| Request Stay System | Multi-Property Enquiry | Unified enquiry handling with automatic property routing, preference matching |
| Admin Dashboard | Group Analytics | Cross-property performance metrics, revenue analytics, occupancy trends |
| Admin Dashboard | Property Management | Individual property content management, local team coordination |
| Admin Dashboard | SEO Management | Location-based keyword tracking, content optimization, schema markup management |
| Admin Dashboard | Content Registry | Centralized content management with duplication detection, brand consistency checks |
| Admin Dashboard | AI SEO System | System prompt management with versioning, AI content generation interface, draft review and approval workflow |
| AI SEO Interface | System Prompt Editor | Rich markdown editor with token counter, version history, property-specific prompt templates, activation controls |
| AI SEO Interface | Content Generation | Scope picker for pages/sections, SEO input controls (keywords, audience, tone), context input, draft results with diff viewer |
| AI SEO Interface | Draft Management | Side-by-side content comparison, quality checks (readability, keyword density), manual editing capabilities, apply/discard controls |

## 3. Core Process

**Guest Discovery Flow:**
Guests discover properties through location-based search, explore individual properties and stay types, compare options across the group, and submit enquiries through the unified request system with automatic property routing.

**Multi-Property Enquiry Flow:**
Enquiries are automatically routed to appropriate property managers based on location and stay type preferences, with group-level oversight and cross-property recommendations when applicable.

**Admin Management Flow:**
Group admins manage overall platform strategy and SEO, property managers handle location-specific content and enquiries, city managers coordinate cross-property initiatives and location-based marketing.

```mermaid
graph TD
    A[Group Homepage] --> B[Location Discovery]
    A --> C[Property Discovery]
    B --> D[City Landing Page]
    C --> E[Property Page]
    D --> F[Property Listings]
    E --> G[Stay Type Pages]
    F --> E
    G --> H[Request Stay]
    H --> I[Property Routing]
    I --> J[Property Manager]
    
    K[Admin Login] --> L[Group Dashboard]
    L --> M[Property Management]
    L --> N[SEO Management]
    L --> O[Content Registry]
    M --> P[Local Analytics]
    N --> Q[Location SEO]
```

## 4. Faceted Discovery System

### 4.1 Multi-Level Filtering
- **Primary Filters**: Location (city/region), Property (specific resort), Stay Type (treehouse, villa, suite)
- **Secondary Filters**: Capacity (guests), Amenities (pool, spa, adventure), Price Range, Availability
- **Advanced Filters**: Accessibility features, Pet-friendly, Eco-certified, Family-friendly

### 4.2 Curated Collections
- **Location-Based**: "Resorts in Kerala", "Hill Station Properties", "Coastal Accommodations"
- **Stay Type Collections**: "Luxury Treehouses", "Family Villas", "Romantic Suites"
- **Experience-Based**: "Adventure Resorts", "Wellness Retreats", "Cultural Experiences"
- **Seasonal Collections**: "Monsoon Getaways", "Winter Escapes", "Festival Destinations"

### 4.3 Smart Recommendations
- **Similar Properties**: Same stay type in different locations
- **Location Alternatives**: Different properties in same city
- **Upgrade Suggestions**: Premium stay types within selected property
- **Cross-Selling**: Complementary experiences and add-ons

## 5. SEO Strategy & Content Management

### 5.1 Location-Based SEO
- **City-Specific Optimization**: Target "resorts in {city}", "{stay-type} in {city}", "{city} accommodation"
- **Local Schema Markup**: Resort/Hotel for properties, HotelRoom for stay types, CollectionPage for city pages
- **Topical Clustering**: Internal linking prioritizes same-city and same-stay-type connections
- **Local Citations**: City-specific business listings, tourism board partnerships

### 5.2 AI-Powered Content Generation (Google Gemini Integration)

**Two-Level AI System:**
- **Level A - System Prompt Manager**: Versioned, property-aware system prompts reflecting latest resort updates (amenities, pricing, policies, seasonal offers, local highlights)
- **Level B - Generate Website Content**: AI-powered SEO content generation using active system prompt + site content for structured page updates

**AI Content Features:**
- **Scope-Aware Generation**: Multi-property system prompts targeting Group/Property/City/Stay Type/Combo levels with property-specific context
- **Content Registry**: Centralized content management with field-level mapping, duplication detection, and content hashing
- **Draft-First Workflow**: All AI changes start as drafts with diff viewer and explicit apply step (zero direct overwrites)
- **Field-Level Updates**: JSON patches for title/meta/H1-H3/FAQ/JSON-LD/internal links with validation
- **SEO Pack Generation**: Complete page-level SEO optimization including structured data, internal linking, and quality checks
- **Version Control**: System prompt versioning with rollback capability and change audit logs

### 5.3 Schema.org Implementation
```json
{
  "@type": "Resort",
  "name": "Property Name",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "City",
    "addressRegion": "State"
  },
  "hasAccommodation": [
    {
      "@type": "HotelRoom",
      "name": "Stay Type Name",
      "occupancy": {
        "@type": "QuantitativeValue",
        "maxValue": 4
      }
    }
  ]
}
```

### 5.4 Canonical & Indexing Strategy
- **Property Pages**: Self-canonical, full indexing
- **Stay Type Pages**: Self-canonical, full indexing
- **City Pages**: Self-canonical, full indexing
- **Combo Pages**: Canonical to most relevant property if duplicate content
- **Filter Pages**: Noindex for dynamic filters, canonical for static collections

## 6. Data Model & Content Structure

### 6.1 Namespaced Content Architecture
```
pages/
├── group/home
├── property:{property-id}/home
├── property:{property-id}/stay:{stay-type-id}
├── city:{city-slug}/landing
├── city:{city-slug}/stay-type:{stay-type}
└── experiences/{city-slug}
```

### 6.2 Segmented Sitemaps
- **Main Sitemap**: Group homepage, primary navigation
- **Properties Sitemap**: All property pages and stay types
- **Locations Sitemap**: City pages and location-based content
- **Experiences Sitemap**: Activity and experience pages

### 6.3 Content Guardrails
- **Duplication Checker**: Cross-property content analysis
- **Brand Consistency**: Template enforcement with property customization
- **Manual Approval**: Review process for AI-generated content
- **Quality Scoring**: Content quality metrics and improvement suggestions

## 7. Performance & Analytics

### 7.1 Multi-Property Analytics
- **Group-Level KPIs**: Total enquiries, conversion rates, revenue attribution
- **Property Performance**: Individual property metrics, competitive analysis
- **Location Analytics**: City-based performance, seasonal trends
- **SEO Tracking**: Keyword rankings by location and stay type

### 7.2 User Journey Analytics
- **Cross-Property Discovery**: User flow between properties
- **Location-Based Behavior**: City page performance, local search patterns
- **Conversion Attribution**: Multi-touch attribution across property touchpoints
- **Content Performance**: Page engagement, content effectiveness scoring

## 8. Technical Requirements

### 8.1 Multi-Tenancy Support
- **Property Isolation**: Separate content namespaces, independent customization
- **Shared Resources**: Common components, unified design system
- **Role-Based Access**: Property-specific and group-wide permissions
- **Data Segregation**: Property-specific analytics with group aggregation

### 8.2 Scalability Considerations
- **Dynamic Routing**: Automatic route generation for new properties
- **Content Caching**: Location and property-specific cache strategies
- **Image Optimization**: Property-specific image processing and CDN
- **Search Optimization**: Elasticsearch integration for complex filtering

### 8.3 SEO Technical Implementation
- **Dynamic Meta Generation**: Location and property-specific meta tags
- **Structured Data**: Automated schema markup for all content types
- **Sitemap Generation**: Automated sitemap updates for new properties
- **Internal Linking**: Algorithmic internal link suggestions and implementation