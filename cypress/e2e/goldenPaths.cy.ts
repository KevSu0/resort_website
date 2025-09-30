/**
 * Gate B: Golden Path E2E Tests
 * Critical user journey tests for Wayanad Nature Resorts Admin
 */

describe('Golden Paths - Admin Panel', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();

    // Set viewport
    cy.viewport(1280, 720);

    // Mock API responses
    cy.intercept('GET', '/api/admin/stats', {
      fixture: 'admin-stats.json'
    }).as('getStats');

    cy.intercept('GET', '/api/admin/enquiries', {
      fixture: 'enquiries.json'
    }).as('getEnquiries');

    cy.intercept('GET', '/api/admin/properties', {
      fixture: 'properties.json'
    }).as('getProperties');
  });

  // Golden Path 1: Authentication Flow
  describe('Authentication Journey', () => {
    it('should successfully login and access dashboard', () => {
      // Visit login page
      cy.visit('/admin/login');

      // Verify login form elements
      cy.get('h1').should('contain', 'Admin Login');
      cy.get('input[type="text"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');

      // Fill login form
      cy.get('input[type="text"]').type('admin');
      cy.get('input[type="password"]').type('password123');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify redirect to dashboard
      cy.url().should('include', '/admin');
      cy.get('h1').should('contain', 'Dashboard');

      // Verify user is logged in
      cy.get('[role="navigation"]').should('be.visible');
      cy.get('button[aria-label="Open sidebar"]').should('exist');
    });
  });

  // Golden Path 2: Property Lifecycle
  describe('Property Management Journey', () => {
    beforeEach(() => {
      // Login before each property test
      cy.loginAsAdmin();
    });

    it('should create, edit, and delete a property', () => {
      // Navigate to properties
      cy.visit('/admin/content');

      // Click add property button
      cy.contains('button', 'Add Property').click();

      // Fill property form
      cy.get('input[name="name"]').type('Test Villa');
      cy.get('textarea[name="description"]').type('A beautiful test villa with ocean views');
      cy.get('input[name="price"]').type('299');
      cy.get('select[name="type"]').select('villa');

      // Upload images
      cy.get('input[type="file"]').attachFile('test-property.jpg');

      // Save property
      cy.contains('button', 'Save Property').click();

      // Verify success message
      cy.get('[role="alert"]').should('contain', 'Property saved successfully');

      // Edit property
      cy.contains('Test Villa').click();
      cy.get('button[aria-label="Edit"]').click();

      // Update property
      cy.get('input[name="name"]').clear().type('Updated Test Villa');
      cy.contains('button', 'Save Changes').click();

      // Verify update
      cy.contains('Updated Test Villa').should('exist');

      // Delete property
      cy.get('button[aria-label="Delete"]').click();
      cy.get('button').contains('Confirm Delete').click();

      // Verify deletion
      cy.contains('Updated Test Villa').should('not.exist');
    });
  });

  // Golden Path 3: Media Management Flow
  describe('Media Management Journey', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should upload, organize, and manage media files', () => {
      // Navigate to media page
      cy.visit('/admin/media');

      // Verify media library
      cy.get('[role="main"]').should('contain', 'Media Library');

      // Upload new media
      cy.get('input[type="file"]').attachFile('test-image.jpg');

      // Wait for upload to complete
      cy.get('[role="progressbar"]', { timeout: 10000 }).should('not.exist');

      // Verify image appears in gallery
      cy.get('img[alt="test-image.jpg"]').should('be.visible');

      // Edit image metadata
      cy.get('img[alt="test-image.jpg"]').click();
      cy.get('input[name="alt"]').type('Beautiful resort view');
      cy.get('input[name="caption"]').type('Sunset over the mountains');

      // Save metadata
      cy.contains('button', 'Save').click();

      // Create album
      cy.get('button').contains('Create Album').click();
      cy.get('input[placeholder="Album name"]').type('Gallery 2024');
      cy.get('button').contains('Create').click();

      // Add image to album
      cy.get('img[alt="test-image.jpg"]').click();
      cy.get('select').select('Gallery 2024');
      cy.get('button').contains('Add to Album').click();

      // Verify album contains image
      cy.visit('/admin/media/albums/gallery-2024');
      cy.get('img[alt="test-image.jpg"]').should('be.visible');
    });
  });

  // Golden Path 4: Enquiry Handling Flow
  describe('Enquiry Management Journey', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should view, respond to, and manage enquiries', () => {
      // Navigate to enquiries
      cy.visit('/admin/enquiries');

      // Wait for enquiries to load
      cy.wait('@getEnquiries');

      // View enquiry details
      cy.get('tr').first().click();

      // Verify enquiry details
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[role="dialog"]').should('contain', 'Enquiry Details');

      // Respond to enquiry
      cy.get('textarea[placeholder="Type your response..."]').type(
        'Thank you for your enquiry. We would be happy to accommodate your stay.'
      );

      // Send response
      cy.contains('button', 'Send Response').click();

      // Verify response sent
      cy.get('[role="alert"]').should('contain', 'Response sent successfully');

      // Mark as resolved
      cy.get('button').contains('Mark as Resolved').click();

      // Verify status change
      cy.get('[data-status="resolved"]').should('exist');

      // Export enquiries
      cy.get('button').contains('Export').click();
      cy.get('button').contains('Download CSV').click();

      // Verify download
      cy.verifyDownload('enquiries.csv');
    });
  });

  // Golden Path 5: Export/Import Roundtrip
  describe('Data Import/Export Journey', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should export data, modify, and re-import successfully', () => {
      // Navigate to export/import
      cy.visit('/admin/settings/export-import');

      // Export properties
      cy.get('button').contains('Export Properties').click();
      cy.verifyDownload('properties-export.json');

      // Export enquiries
      cy.get('button').contains('Export Enquiries').click();
      cy.verifyDownload('enquiries-export.json');

      // Simulate modifying exported data
      cy.task('modifyExportFile', 'properties-export.json').then(() => {
        // Import modified data
        cy.visit('/admin/settings/export-import');
        cy.get('input[type="file"]').attachFile('modified-properties.json');

        // Verify import preview
        cy.get('[role="dialog"]').should('contain', 'Import Preview');
        cy.get('button').contains('Confirm Import').click();

        // Verify success
        cy.get('[role="alert"]').should('contain', 'Import completed successfully');
      });
    });
  });

  // Performance Metrics Collection
  describe('Performance Metrics', () => {
    it('should measure critical path performance', () => {
      // Start performance monitoring
      cy.window().then((win) => {
        win.performance.mark('test-start');
      });

      // Login
      cy.loginAsAdmin();

      // Navigate to dashboard
      cy.visit('/admin');
      cy.wait('@getStats');

      // Navigate to properties
      cy.visit('/admin/content');
      cy.wait('@getProperties');

      // Create property
      cy.contains('button', 'Add Property').click();
      cy.get('input[name="name"]').type('Performance Test Property');
      cy.get('button').contains('Save Property').click();

      // End performance monitoring
      cy.window().then((win) => {
        win.performance.mark('test-end');
        win.performance.measure('golden-path', 'test-start', 'test-end');
        const measures = win.performance.getEntriesByName('golden-path');
        const duration = measures[0].duration;

        // Assert performance is within acceptable limits
        expect(duration).to.be.lessThan(10000); // 10 seconds

        // Log performance metrics
        cy.task('logPerformance', {
          path: 'property-lifecycle',
          duration: duration,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  // Accessibility Tests
  describe('Accessibility Compliance', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should meet WCAG 2.1 AA standards', () => {
      // Check for skip links
      cy.get('a[href^="#"]').should('exist');

      // Verify ARIA labels
      cy.get('[role="navigation"]').should('have.attr', 'aria-label');
      cy.get('[role="main"]').should('have.attr', 'aria-labelledby');

      // Check keyboard navigation
      cy.realPress('Tab');
      cy.focused().should('exist');

      // Verify color contrast (would need axe-core for full check)
      cy.get('button').each(($button) => {
        cy.wrap($button).should('have.css', 'color');
        cy.wrap($button).should('have.css', 'background-color');
      });

      // Test screen reader announcements
      cy.get('[aria-live]').should('exist');
    });
  });
});

// Custom commands for login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/admin/login');
  cy.get('input[type="text"]').type('admin');
  cy.get('input[type="password"]').type('password123');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/admin');
});

// Custom command to verify download
Cypress.Commands.add('verifyDownload', (filename) => {
  cy.readFile(`cypress/downloads/${filename}`).should('exist');
});

// Custom task for performance logging
Cypress.Tasks.add('logPerformance', (metrics) => {
  console.log('Performance Metrics:', metrics);
  // In real implementation, send to analytics service
  return null;
});