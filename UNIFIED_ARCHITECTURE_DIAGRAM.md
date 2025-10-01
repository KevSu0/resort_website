# Unified Content Management Architecture Diagrams

## Current vs. Unified Architecture Comparison

### Current Architecture (Fragmented)

```mermaid
graph TB
    subgraph "Current Fragmented Architecture"
        subgraph "CMS System"
            CMS1[cms/editor/RichContentEditor]
            CMS2[cms/editor/BlockEditor]
            CMS3[cms/editor/MediaManager]
            CMS4[cms/editor/BlockSelector]
        end
        
        subgraph "Content System"
            CONT1[content/RichContentEditor]
            CONT2[content/ContentBlockSystem]
        end
        
        subgraph "Editor System"
            EDIT1[editor/UnifiedRichTextEditor]
            EDIT2[editor/RichTextEditor]
        end
        
        subgraph "Admin System"
            ADMIN1[admin/RichTextEditor]
        end
        
        subgraph "Type Systems"
            TYPE1[types/cms/index.ts]
            TYPE2[types/content.ts]
        end
        
        subgraph "Services"
            SVC1[services/cms/*]
            SVC2[services/content/*]
        end
    end
    
    CMS1 -.-> EDIT1
    CMS2 -.-> EDIT1
    CONT1 -.-> EDIT1
    ADMIN1 -.-> EDIT2
    
    CMS1 --> TYPE1
    CONT1 --> TYPE2
    
    CMS3 --> SVC1
```

### Unified Architecture (Consolidated)

```mermaid
graph TB
    subgraph "Unified Content Management Architecture"
        subgraph "Core Components"
            CORE1[content/UnifiedContentEditor]
            CORE2[content/UnifiedBlockSystem]
            CORE3[content/UnifiedMediaManager]
        end
        
        subgraph "Mode Configurations"
            MODE1[modes/simple.ts]
            MODE2[modes/standard.ts]
            MODE3[modes/advanced.ts]
            MODE4[modes/cms.ts]
        end
        
        subgraph "Backward Compatibility"
            WRAP1[wrappers/CMSRichContentEditor]
            WRAP2[wrappers/ContentRichContentEditor]
            WRAP3[wrappers/AdminRichTextEditor]
        end
        
        subgraph "Unified Type System"
            TYPES[types/index.ts]
        end
        
        subgraph "Utilities & Hooks"
            UTIL1[utils/editor-utils.ts]
            UTIL2[hooks/useContentEditor.ts]
            UTIL3[hooks/useBlockSystem.ts]
        end
        
        subgraph "Services"
            SVC[services/content/*]
        end
    end
    
    CORE1 --> MODE1
    CORE1 --> MODE2
    CORE1 --> MODE3
    CORE1 --> MODE4
    
    WRAP1 --> CORE1
    WRAP2 --> CORE1
    WRAP3 --> CORE1
    
    CORE1 --> TYPES
    CORE2 --> TYPES
    CORE3 --> TYPES
    
    CORE1 --> UTIL1
    CORE1 --> UTIL2
    CORE2 --> UTIL3
    
    CORE3 --> SVC
```

## Data Flow Diagram

### Unified Content Management Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant UCE as UnifiedContentEditor
    participant Mode as ModeConfig
    participant Store as ContentStore
    participant API as ContentAPI
    
    User->>App: Request content editor
    App->>UCE: Initialize with mode
    UCE->>Mode: Load configuration
    Mode-->>UCE: Return features & extensions
    UCE->>Store: Load initial content
    Store-->>UCE: Return content data
    
    User->>UCE: Edit content
    UCE->>UCE: Process changes
    UCE->>Store: Update content state
    Store->>API: Persist changes
    API-->>Store: Confirm save
    Store-->>UCE: Update complete
    UCE-->>User: Show updated content
    
    User->>UCE: Add media
    UCE->>UCE: Open MediaManager
    User->>UCE: Select media files
    UCE->>API: Upload media
    API-->>UCE: Return media URLs
    UCE->>UCE: Insert media into content
    UCE->>Store: Update content with media
```

## Component Hierarchy

### Unified Content Editor Component Structure

```mermaid
graph TD
    UCE[UnifiedContentEditor] --> TB[Toolbar]
    UCE --> EC[EditorContent]
    UCE --> BM[BubbleMenu]
    UCE --> FM[FloatingMenu]
    UCE --> CC[CharacterCount]
    UCE --> MM[MediaManager]
    UCE --> BS[BlockSelector]
    
    TB --> TBG[ToolbarGroup]
    TBG --> TBB[ToolbarButton]
    TB --> TBD[ToolbarDropdown]
    
    BM --> BMG[BubbleMenuGroup]
    BMG --> BMB[BubbleMenuButton]
    
    FM --> FMG[FloatingMenuGroup]
    FMG --> FMB[FloatingMenuButton]
    
    MM --> MGL[MediaGallery]
    MM --> MUL[MediaUpload]
    MM --> MFI[MediaFilter]
    
    BS --> BSC[BlockSelectorCategories]
    BS --> BST[BlockSelectorTemplates]
    
    UCE --> MODE[ModeConfiguration]
    MODE --> SIM[SimpleMode]
    MODE --> STD[StandardMode]
    MODE --> ADV[AdvancedMode]
    MODE --> CMS[CMSMode]
```

## Mode-Based Feature Matrix

### Editor Modes and Features

| Feature | Simple | Standard | Advanced | CMS |
|---------|--------|----------|----------|-----|
| Basic Formatting | ✅ | ✅ | ✅ | ✅ |
| Advanced Formatting | ❌ | ✅ | ✅ | ✅ |
| Headings | ❌ | ✅ | ✅ | ✅ |
| Lists | ✅ | ✅ | ✅ | ✅ |
| Links | ❌ | ✅ | ✅ | ✅ |
| Images | ❌ | ✅ | ✅ | ✅ |
| Tables | ❌ | ❌ | ✅ | ✅ |
| Code Blocks | ❌ | ❌ | ✅ | ✅ |
| Media Manager | ❌ | ❌ | ❌ | ✅ |
| Block Templates | ❌ | ❌ | ❌ | ✅ |
| Character Count | ❌ | ❌ | ✅ | ✅ |
| Word Count | ❌ | ❌ | ✅ | ✅ |
| Preview Mode | ❌ | ❌ | ✅ | ✅ |
| HTML Output | ✅ | ✅ | ✅ | ❌ |
| JSON Output | ❌ | ❌ | ❌ | ✅ |
| Collaboration | ❌ | ❌ | ❌ | ❌ |

## Migration Path Visualization

### Phase-by-Phase Migration

```mermaid
gantt
    title Content Management Migration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Create Directory Structure    :p1-1, 2023-10-01, 2d
    Implement Type System        :p1-2, after p1-1, 3d
    Create Mode Configurations    :p1-3, after p1-2, 2d
    Set Up Backward Compatibility :p1-4, after p1-3, 2d
    
    section Phase 2: Core Components
    Implement UnifiedEditor      :p2-1, after p1-4, 3d
    Implement UnifiedBlockSystem :p2-2, after p2-1, 3d
    Implement UnifiedMediaManager:p2-3, after p2-2, 2d
    Create Utility Functions     :p2-4, after p2-3, 2d
    
    section Phase 3: Migration
    Update Internal Usage        :p3-1, after p2-4, 3d
    Migrate Wrapper Components   :p3-2, after p3-1, 2d
    Update Type Definitions      :p3-3, after p3-2, 2d
    Test Backward Compatibility  :p3-4, after p3-3, 2d
    
    section Phase 4: Cleanup
    Remove Deprecated Components :p4-1, after p3-4, 2d
    Clean Up Unused Code         :p4-2, after p4-1, 2d
    Update Documentation         :p4-3, after p4-2, 2d
    Performance Optimization     :p4-4, after p4-3, 2d
```

## State Management Architecture

### Unified Content State Flow

```mermaid
graph LR
    subgraph "UI Layer"
        UI[UnifiedContentEditor]
        BLOCKS[UnifiedBlockSystem]
        MEDIA[UnifiedMediaManager]
    end
    
    subgraph "State Management"
        STORE[ContentStore]
        CONTEXT[ContentContext]
    end
    
    subgraph "Services Layer"
        API[ContentAPI]
        STORAGE[FileStorage]
        CACHE[CacheService]
    end
    
    subgraph "Data Layer"
        DB[(Database)]
        FILES[(File Storage)]
    end
    
    UI --> CONTEXT
    BLOCKS --> CONTEXT
    MEDIA --> CONTEXT
    
    CONTEXT --> STORE
    STORE --> API
    STORE --> STORAGE
    STORE --> CACHE
    
    API --> DB
    STORAGE --> FILES
    CACHE --> DB
    
    API --> STORE
    STORAGE --> STORE
    CACHE --> STORE
```

## Performance Optimization

### Bundle Size Optimization

```mermaid
graph TB
    subgraph "Current Bundle"
        CURRENT[Current Bundle Size: ~250KB]
        DUP1[Duplicated Editor Code: ~80KB]
        DUP2[Duplicated Type Definitions: ~20KB]
        DUP3[Duplicated Utilities: ~30KB]
    end
    
    subgraph "Optimized Bundle"
        OPTIMIZED[Optimized Bundle Size: ~150KB]
        SHARED[Shared Core: ~50KB]
        MODES[Mode-Specific Code: ~60KB]
        LAZY[Lazy-Loaded Components: ~40KB]
    end
    
    CURRENT --> OPTIMIZED
    DUP1 -.-> SHARED
    DUP2 -.-> SHARED
    DUP3 -.-> SHARED
```

## Testing Strategy

### Test Coverage Architecture

```mermaid
graph TB
    subgraph "Test Pyramid"
        E2E[End-to-End Tests: 10%]
        INT[Integration Tests: 20%]
        UNIT[Unit Tests: 70%]
    end
    
    subgraph "Test Categories"
        COMP[Component Tests]
        HOOK[Hook Tests]
        UTIL[Utility Tests]
        MODE[Mode Tests]
        MIGR[Migration Tests]
        PERF[Performance Tests]
    end
    
    UNIT --> COMP
    UNIT --> HOOK
    UNIT --> UTIL
    UNIT --> MODE
    
    INT --> MIGR
    INT --> PERF
    
    E2E --> COMP
```

## Deployment Strategy

### Feature Flag Rollout

```mermaid
graph LR
    subgraph "Development"
        DEV[Development Environment]
        FEAT[Feature Flags Enabled]
    end
    
    subgraph "Staging"
        STAGE[Staging Environment]
        TEST[Full Testing]
    end
    
    subgraph "Production Rollout"
        PROD1[10% Users]
        PROD2[50% Users]
        PROD3[100% Users]
    end
    
    DEV --> STAGE
    STAGE --> PROD1
    PROD1 --> PROD2
    PROD2 --> PROD3
    
    FEAT --> TEST
```

## Monitoring and Analytics

### Performance Monitoring Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Monitor as PerformanceMonitor
    participant Analytics as AnalyticsService
    participant Alerts as AlertService
    
    User->>App: Use content editor
    App->>Monitor: Start performance timer
    App->>Monitor: End performance timer
    Monitor->>Analytics: Send performance metrics
    Analytics-->>Monitor: Confirm receipt
    
    alt Performance Issue Detected
        Monitor->>Alerts: Trigger alert
        Alerts-->>DevTeam: Notify developers
    end
```

These diagrams provide a visual representation of the unified architecture, making it easier to understand the component relationships, data flow, and migration strategy.