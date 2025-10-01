describe('CMS Workflow Tests', () => {
  beforeEach(() => {
    // Clean up and reset
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as admin
    cy.visit('/admin/login');
    cy.get('[data-testid=email-input]').type('admin@resort.com');
    cy.get('[data-testid=password-input]').type('admin123');
    cy.get('[data-testid=login-button]').click();

    // Wait for dashboard to load
    cy.url().should('include', '/admin/dashboard');
    cy.get('[data-testid=dashboard-container]').should('be.visible');
  });

  describe('Content Management', () => {
    it('should create and publish a new property', () => {
      // Navigate to properties
      cy.get('[data-testid=nav-properties]').click();
      cy.url().should('include', '/admin/properties');

      // Click add new property
      cy.get('[data-testid=add-property-button]').click();
      cy.url().should('include', '/admin/properties/new');

      // Fill in property details
      cy.get('[data-testid=property-name-input]').type('Test Villa Paradise');
      cy.get('[data-testid=property-description-input]').type('Beautiful villa with ocean view');
      cy.get('[data-testid=property-location-input]').type('Maldives');
      cy.get('[data-testid=property-price-input]').type('1500');
      cy.get('[data-testid=property-capacity-input]').type('8');

      // Upload images
      cy.get('[data-testid=image-upload]').attachFile('property-image.jpg');
      cy.get('[data-testid=image-preview]').should('be.visible');

      // Save as draft
      cy.get('[data-testid=save-draft-button]').click();
      cy.get('[data-testid=success-toast]').should('contain', 'Property saved as draft');

      // Publish property
      cy.get('[data-testid=publish-button]').click();
      cy.get('[data-testid=confirm-publish-button]').click();
      cy.get('[data-testid=success-toast]').should('contain', 'Property published successfully');

      // Verify property appears in published list
      cy.get('[data-testid=published-properties-list]').should('contain', 'Test Villa Paradise');
    });

    it('should edit existing property with version control', () => {
      // Navigate to properties
      cy.get('[data-testid=nav-properties]').click();

      // Click on first property
      cy.get('[data-testid=property-item]').first().click();

      // Edit property details
      cy.get('[data-testid=edit-property-button]').click();
      cy.get('[data-testid=property-name-input]').clear().type('Updated Villa Name');
      cy.get('[data-testid=property-description-input]').clear().type('Updated description with new amenities');

      // Add new amenities
      cy.get('[data-testid=add-amenity-button]').click();
      cy.get('[data-testid=amenity-input]').type('Private Pool');
      cy.get('[data-testid=save-amenity-button]').click();

      // Save changes
      cy.get('[data-testid=save-changes-button]').click();

      // Verify version history
      cy.get('[data-testid=version-history-button]').click();
      cy.get('[data-testid=version-list]').should('contain', 'Updated Villa Name');
      cy.get('[data-testid=version-item]').should('have.length.greaterThan', 1);

      // Test version rollback
      cy.get('[data-testid=version-item]').first().click();
      cy.get('[data-testid=rollback-button]').click();
      cy.get('[data-testid=confirm-rollback-button]').click();
      cy.get('[data-testid=success-toast]').should('contain', 'Rolled back to previous version');
    });
  });

  describe('Media Management', () => {
    it('should upload and organize media files', () => {
      // Navigate to media
      cy.get('[data-testid=nav-media]').click();
      cy.url().should('include', '/admin/media');

      // Upload multiple files
      cy.get('[data-testid=media-upload]').attachFile([
        'property-1.jpg',
        'property-2.jpg',
        'property-3.jpg'
      ]);

      // Verify uploads complete
      cy.get('[data-testid=upload-progress]').should('not.exist');
      cy.get('[data-testid=media-grid]').should('have.length.greaterThan', 2);

      // Organize files into folders
      cy.get('[data-testid=media-item]').first().click();
      cy.get('[data-testid=organize-button]').click();
      cy.get('[data-testid=folder-input]').type('Villas/Featured');
      cy.get('[data-testid=move-button]').click();

      // Create new folder
      cy.get('[data-testid=create-folder-button]').click();
      cy.get('[data-testid=folder-name-input]').type('Galleries');
      cy.get('[data-testid=create-folder-button]').click();

      // Verify folder structure
      cy.get('[data-testid=folder-tree]').should('contain', 'Villas');
      cy.get('[data-testid=folder-tree]').should('contain', 'Galleries');

      // Test image optimization
      cy.get('[data-testid=media-item]').first().rightclick();
      cy.get('[data-testid=optimize-button]').click();
      cy.get('[data-testid=optimization-progress]').should('be.visible');
      cy.get('[data-testid=optimization-complete]').should('be.visible');
    });

    it('should handle bulk operations', () => {
      // Navigate to media
      cy.get('[data-testid=nav-media]').click();

      // Select multiple files
      cy.get('[data-testid=media-item]').first().click();
      cy.get('[data-testid=media-item]').eq(1).click({ ctrlKey: true });
      cy.get('[data-testid=media-item]').eq(2).click({ ctrlKey: true });

      // Bulk delete
      cy.get('[data-testid=bulk-delete-button]').click();
      cy.get('[data-testid=confirm-bulk-delete-button]').click();
      cy.get('[data-testid=success-toast]').should('contain', 'Deleted 3 files');

      // Bulk tag
      cy.get('[data-testid=media-item]').first().click();
      cy.get('[data-testid=bulk-tag-button]').click();
      cy.get('[data-testid=tag-input]').type('featured');
      cy.get('[data-testid=apply-tags-button]').click();
      cy.get('[data-testid=media-item]').first().should('contain', 'featured');
    });
  });

  describe('User Management', () => {
    it('should create and manage users with roles', () => {
      // Navigate to users
      cy.get('[data-testid=nav-users]').click();
      cy.url().should('include', '/admin/users');

      // Create new user
      cy.get('[data-testid=add-user-button]').click();
      cy.get('[data-testid=user-name-input]').type('John Editor');
      cy.get('[data-testid=user-email-input]').type('editor@resort.com');
      cy.get('[data-testid=user-role-select]').select('editor');
      cy.get('[data-testid=create-user-button]').click();

      // Verify user created
      cy.get('[data-testid=success-toast]').should('contain', 'User created successfully');
      cy.get('[data-testid=users-list]').should('contain', 'John Editor');

      // Test role-based access
      cy.get('[data-testid=logout-button]').click();

      // Login as editor
      cy.visit('/admin/login');
      cy.get('[data-testid=email-input]').type('editor@resort.com');
      cy.get('[data-testid=password-input]').type('password123');
      cy.get('[data-testid=login-button]').click();

      // Verify limited access
      cy.get('[data-testid=nav-settings]').should('not.exist');
      cy.get('[data-testid=nav-users]').should('not.exist');
      cy.get('[data-testid=nav-properties]').should('be.visible');
      cy.get('[data-testid=nav-media]').should('be.visible');

      // Login back as admin
      cy.get('[data-testid=logout-button]').click();
      cy.visit('/admin/login');
      cy.get('[data-testid=email-input]').type('admin@resort.com');
      cy.get('[data-testid=password-input]').type('admin123');
      cy.get('[data-testid=login-button]').click();
    });
  });

  describe('Analytics and Reporting', () => {
    it('should display analytics dashboard', () => {
      // Navigate to analytics
      cy.get('[data-testid=nav-analytics]').click();
      cy.url().should('include', '/admin/analytics');

      // Verify analytics widgets
      cy.get('[data-testid=total-properties-widget]').should('be.visible');
      cy.get('[data-testid=total-bookings-widget]').should('be.visible');
      cy.get('[data-testid=revenue-chart]').should('be.visible');
      cy.get('[data-testid=popular-properties-chart]').should('be.visible');

      // Test date range filter
      cy.get('[data-testid=date-range-picker]').click();
      cy.get('[data-testid=last-30-days]').click();
      cy.get('[data-testid=apply-filter-button]').click();

      // Verify data updates
      cy.get('[data-testid=analytics-loading]').should('not.exist');
      cy.get('[data-testid=chart-data]').should('be.visible');

      // Export reports
      cy.get('[data-testid=export-button]').click();
      cy.get('[data-testid=export-format-select]').select('csv');
      cy.get('[data-testid=export-confirm-button]').click();

      // Verify download starts
      cy.get('[data-testid=export-success]').should('be.visible');
    });
  });

  describe('Security Features', () => {
    it('should enforce session timeout', () => {
      // Wait for session timeout (mocked)
      cy.wait(30000); // Adjust based on your timeout setting

      // Verify session expired modal
      cy.get('[data-testid=session-timeout-modal]').should('be.visible');
      cy.get('[data-testid=extend-session-button]').click();

      // Verify session extended
      cy.get('[data-testid=session-timeout-modal]').should('not.exist');
    });

    it('should log security events', () => {
      // Navigate to audit logs
      cy.get('[data-testid=nav-settings]').click();
      cy.get('[data-testid=audit-logs-tab]').click();

      // Verify security events are logged
      cy.get('[data-testid=audit-logs-table]').should('be.visible');
      cy.get('[data-testid=security-events-filter]').click();
      cy.get('[data-testid=filter-apply-button]').click();

      // Verify filtered results
      cy.get('[data-testid=audit-logs-table]').should('contain', 'LOGIN_SUCCESS');
    });

    it('should handle failed login attempts', () => {
      // Logout first
      cy.get('[data-testid=logout-button]').click();

      // Attempt failed login
      cy.visit('/admin/login');
      cy.get('[data-testid=email-input]').type('admin@resort.com');
      cy.get('[data-testid=password-input]').type('wrongpassword');
      cy.get('[data-testid=login-button]').click();

      // Verify error message
      cy.get('[data-testid=error-message]').should('contain', 'Invalid credentials');

      // Verify account lockout after multiple attempts
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid=password-input]').clear().type('wrongpassword');
        cy.get('[data-testid=login-button]').click();
      }

      cy.get('[data-testid=account-locked-message]').should('be.visible');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      // Navigate to properties with large dataset
      cy.get('[data-testid=nav-properties]').click();

      // Test pagination performance
      cy.get('[data-testid=page-size-select]').select('100');
      cy.get('[data-testid=loading-indicator]').should('be.visible');
      cy.get('[data-testid=loading-indicator]').should('not.exist', { timeout: 5000 });

      // Test search performance
      cy.get('[data-testid=search-input]').type('villa');
      cy.get('[data-testid=search-results]').should('be.visible', { timeout: 3000 });

      // Verify virtual scrolling works
      cy.get('[data-testid=virtual-list]').scrollTo('bottom');
      cy.get('[data-testid=loading-more-indicator]').should('be.visible');
      cy.get('[data-testid=loading-more-indicator]').should('not.exist', { timeout: 5000 });
    });

    it('should handle concurrent operations', () => {
      // Open multiple tabs/windows
      cy.window().then((win) => {
        win.open('/admin/properties', '_blank');
      });

      // Perform simultaneous operations
      cy.get('[data-testid=nav-properties]').click();
      cy.get('[data-testid=add-property-button]').click();

      // Switch to other window and perform operation
      cy.get('@newWindow').then((newWin) => {
        cy.wrap(newWin).its('document').then((doc) => {
          cy.wrap(doc).find('[data-testid=nav-media]').click();
        });
      });

      // Verify no conflicts occur
      cy.get('[data-testid=conflict-resolution-modal]').should('not.exist');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should work correctly on mobile devices', () => {
      // Test navigation
      cy.get('[data-testid=mobile-menu-button]').click();
      cy.get('[data-testid=mobile-navigation]').should('be.visible');

      // Test responsive layouts
      cy.get('[data-testid=nav-properties]').click();
      cy.get('[data-testid=properties-grid]').should('have.class', 'mobile-grid');

      // Test touch interactions
      cy.get('[data-testid=property-card]').first().swipe('left');
      cy.get('[data-testid=quick-actions-menu]').should('be.visible');

      // Test mobile forms
      cy.get('[data-testid=add-property-button]').click();
      cy.get('[data-testid=property-form]').should('have.class', 'mobile-form');
      cy.get('[data-testid=mobile-keyboard]').should('be.visible');
    });
  });

  afterEach(() => {
    // Clean up test data
    cy.get('[data-testid=logout-button]').click();
    cy.clearLocalStorage();
    cy.clearCookies();
  });
});

// Helper commands for CMS testing
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/admin/login');
  cy.get('[data-testid=email-input]').type('admin@resort.com');
  cy.get('[data-testid=password-input]').type('admin123');
  cy.get('[data-testid=login-button]').click();
  cy.url().should('include', '/admin/dashboard');
});

Cypress.Commands.add('createTestProperty', (propertyData) => {
  cy.get('[data-testid=nav-properties]').click();
  cy.get('[data-testid=add-property-button]').click();

  if (propertyData.name) {
    cy.get('[data-testid=property-name-input]').type(propertyData.name);
  }
  if (propertyData.description) {
    cy.get('[data-testid=property-description-input]').type(propertyData.description);
  }
  if (propertyData.location) {
    cy.get('[data-testid=property-location-input]').type(propertyData.location);
  }
  if (propertyData.price) {
    cy.get('[data-testid=property-price-input]').type(propertyData.price);
  }

  cy.get('[data-testid=save-draft-button]').click();
  cy.get('[data-testid=success-toast]').should('be.visible');
});

Cypress.Commands.add('uploadTestImage', (filename) => {
  cy.get('[data-testid=image-upload]').attachFile(filename);
  cy.get('[data-testid=upload-progress]').should('not.exist');
  cy.get('[data-testid=image-preview]').should('be.visible');
});

// Global test configuration
before(() => {
  // Set up test environment
  cy.task('setupTestDatabase');
  cy.task('seedTestData');
});

after(() => {
  // Clean up test environment
  cy.task('cleanupTestData');
  cy.task('resetTestDatabase');
});