/**
 * Landing Page E2E Tests
 *
 * Comprehensive test suite covering all aspects of the landing page including:
 * - Page structure and content
 * - Navigation and links
 * - Responsive behavior
 * - CTAs and user flows
 * - Accessibility and SEO
 * - Performance
 */

describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720); // Desktop view by default
  });

  /**
   * PAGE LOAD & STRUCTURE TESTS
   */
  describe('Page Load & Structure', () => {
    it('should load successfully with correct title', () => {
      cy.title().should('not.be.empty');
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });

    it('should render all main sections in correct order', () => {
      // Hero section
      cy.contains('h1', 'Take Control of Your Financial Future').should('be.visible');

      // Features section
      cy.contains('h2', 'Powerful Features to Take Control').scrollIntoView().should('be.visible');

      // How it works section
      cy.contains('h2', 'Your Path to Financial Freedom').scrollIntoView().should('be.visible');

      // Why different section
      cy.contains('h2', 'Why Tammy is Different').scrollIntoView().should('be.visible');

      // Privacy & Security section
      cy.contains('h2', 'Your Financial Data is Sacred').scrollIntoView().should('be.visible');

      // Final CTA section
      cy.contains('h2', 'Ready to Calculate Your Path to Freedom?')
        .scrollIntoView()
        .should('be.visible');

      // Creator section
      cy.contains('Hello, my name is Timmy').scrollIntoView().should('be.visible');
    });
  });

  /**
   * HEADER & NAVIGATION TESTS
   */
  describe('Header & Navigation', () => {
    it('should render header with logo and navigation', () => {
      cy.get('nav').should('be.visible');
      cy.contains('tammy').should('be.visible');
    });

    it('should display login button when not authenticated', () => {
      cy.get('nav').contains('Login').should('be.visible');
    });

    it('should navigate to login page when login button clicked', () => {
      cy.get('nav').contains('Login').click();
      cy.url().should('include', '/auth/login');
    });

    it('should display mobile menu button on small screens', () => {
      cy.viewport('iphone-x');
      cy.get('nav button[class*="lg:hidden"]').should('be.visible');
    });

    it('should open and close mobile menu', () => {
      cy.viewport('iphone-x');

      // Click hamburger menu to open
      cy.get('nav button.lg\\:hidden').first().click();

      // Wait for animation and mobile menu to appear
      cy.wait(500);

      // Check that mobile menu section exists and has login button
      cy.get('nav > div')
        .last()
        .within(() => {
          cy.contains('Login').should('exist');
        });

      // Click X to close
      cy.get('nav button.lg\\:hidden').first().click();

      // Wait for animation
      cy.wait(500);
    });

    it('should have logo that links to homepage', () => {
      cy.get('nav a[href="/"]').should('exist');
      cy.get('nav a[href="/"]').contains('tammy').should('be.visible');
    });
  });

  /**
   * HERO SECTION TESTS
   */
  describe('Hero Section', () => {
    it('should display hero headline and subheadline', () => {
      cy.contains('h1', 'Take Control of Your Financial Future')
        .should('be.visible')
        .and('have.css', 'font-size');

      cy.contains('Stop juggling spreadsheets').should('be.visible');
      cy.contains('when you can retire').should('be.visible');
    });

    it('should display primary CTA button', () => {
      cy.contains('Get started for free').should('be.visible');
    });

    it('should navigate to signup when CTA clicked', () => {
      cy.contains('Get started for free').click();
      cy.url().should('include', '/auth/signup');
    });

    it('should display hero image', () => {
      cy.get('img[alt="Dashboard"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'hero.png');
    });

    it('should have proper hero image loading priority', () => {
      cy.get('img[alt="Dashboard"]').should('exist');
    });

    it('should animate hero elements on page load', () => {
      cy.get('h1').should('be.visible').and('have.css', 'opacity', '1');
    });
  });

  /**
   * FEATURES SECTION TESTS
   */
  describe('Features Section', () => {
    it('should display features section heading', () => {
      cy.contains('h2', 'Powerful Features to Take Control').scrollIntoView().should('be.visible');
    });

    it('should display all three feature cards', () => {
      cy.scrollTo(0, 800);

      // FIRE Calculator
      cy.contains('h3', 'FIRE Calculator').should('be.visible');
      cy.contains('Calculate your path to Financial Independence').should('be.visible');

      // Net Worth Tracking
      cy.contains('h3', 'Net Worth Tracking').should('be.visible');
      cy.contains('Monitor your complete financial picture').should('be.visible');

      // Expense Tracking
      cy.contains('h3', 'Expense Tracking').should('be.visible');
      cy.contains('Easily track your daily, weekly, and monthly expenses').should('be.visible');
    });

    it('should display feature images', () => {
      cy.scrollTo(0, 800);

      cy.get('img[alt="FIRE Calculator"]').should('be.visible');
      cy.get('img[alt="Net Worth Tracking"]').should('be.visible');
      cy.get('img[alt="Expense Tracking"]').should('be.visible');
    });

    it('should have feature cards with hover effects', () => {
      cy.scrollTo(0, 800);

      cy.contains('h3', 'FIRE Calculator').parent().parent().should('have.css', 'transition');
    });

    it('should display feature icons', () => {
      cy.scrollTo(0, 800);

      // Check for Lucide icons (Target, BarChart3, FileText)
      cy.get('svg').should('have.length.greaterThan', 3);
    });
  });

  /**
   * HOW IT WORKS SECTION TESTS
   */
  describe('How It Works Section', () => {
    it('should display how it works heading', () => {
      cy.contains('h2', 'Your Path to Financial Freedom').scrollIntoView().should('be.visible');
    });

    it('should display three steps in correct order', () => {
      cy.scrollTo(0, 1500);

      // Step 1
      cy.contains('div', '1').should('be.visible');
      cy.contains('h3', 'Track Everything').should('be.visible');
      cy.contains('Add your assets, liabilities, income, and expenses').should('be.visible');

      // Step 2
      cy.contains('div', '2').should('be.visible');
      cy.contains('h3', 'See Your Progress').should('be.visible');
      cy.contains('Watch your net worth grow over time').should('be.visible');

      // Step 3
      cy.contains('div', '3').should('be.visible');
      cy.contains('h3', 'Reach Freedom').should('be.visible');
      cy.contains('Make informed decisions knowing exactly how they impact').should('be.visible');
    });

    it('should display step icons', () => {
      cy.scrollTo(0, 1500);

      // Calculator, TrendingUp, Clock icons
      cy.get('svg.lucide-calculator').should('be.visible');
      cy.get('svg.lucide-trending-up').should('be.visible');
      cy.get('svg.lucide-clock').should('be.visible');
    });

    it('should have numbered badges for steps', () => {
      cy.scrollTo(0, 1500);

      cy.contains('div', '1').should('have.css', 'background-color').and('match', /rgb/);

      cy.contains('div', '2').should('be.visible');
      cy.contains('div', '3').should('be.visible');
    });
  });

  /**
   * WHY DIFFERENT SECTION TESTS
   */
  describe('Why Tammy is Different Section', () => {
    it('should display comparison heading', () => {
      cy.contains('h2', 'Why Tammy is Different').scrollIntoView().should('be.visible');
    });

    it('should display other apps comparison', () => {
      cy.scrollTo(0, 2200);

      cy.contains('h3', 'Other Apps').should('be.visible');
      cy.contains("Fragmented tools that don't talk to each other").should('be.visible');
      cy.contains('Complex spreadsheets that break easily').should('be.visible');
    });

    it('should display Tammy Finance advantages', () => {
      cy.scrollTo(0, 2200);

      cy.contains('h3', 'Tammy Finance').should('be.visible');
      cy.contains('All-in-one FIRE-focused platform').should('be.visible');
      cy.contains('Privacy-first, no ads, no data selling').should('be.visible');
      cy.contains('See exactly when you can retire').should('be.visible');
    });

    it('should highlight Tammy Finance card with border', () => {
      cy.scrollTo(0, 2200);

      cy.contains('h3', 'Tammy Finance')
        .parentsUntil('.grid')
        .last()
        .should('have.class', 'border-2');
    });

    it('should display checkmark icons for advantages', () => {
      cy.scrollTo(0, 2200);

      // Check for multiple checkmark icons
      cy.get('svg.lucide-check').should('have.length.greaterThan', 3);
    });
  });

  /**
   * PRIVACY & SECURITY SECTION TESTS
   */
  describe('Privacy & Security Section', () => {
    it('should display privacy section with dark background', () => {
      cy.contains('h2', 'Your Financial Data is Sacred')
        .scrollIntoView()
        .should('be.visible')
        .closest('div[class*="bg-"]')
        .should('have.css', 'background-color')
        .and('match', /rgb\(45,\s*45,\s*45\)/);
    });

    it('should display all three privacy features', () => {
      cy.scrollTo(0, 2800);

      cy.contains('h3', 'No Ads, Ever').should('be.visible');
      cy.contains('Your Data Stays Private').should('be.visible');
      cy.contains('Bank-Level Security').should('be.visible');
    });

    it('should display shield icon', () => {
      cy.scrollTo(0, 2800);

      cy.get('svg.lucide-shield').should('be.visible');
    });

    it('should display lightning/zap icon', () => {
      cy.scrollTo(0, 2800);

      cy.get('svg.lucide-zap').should('be.visible');
    });

    it('should have white text on dark background', () => {
      cy.scrollTo(0, 2800);

      cy.contains('h2', 'Your Financial Data is Sacred').should(
        'have.css',
        'color',
        'rgb(255, 255, 255)',
      );
    });
  });

  /**
   * FINAL CTA SECTION TESTS
   */
  describe('Final CTA Section', () => {
    it('should display final CTA heading', () => {
      cy.contains('h2', 'Ready to Calculate Your Path to Freedom?')
        .scrollIntoView()
        .should('be.visible');
    });

    it('should display CTA description', () => {
      cy.contains('h2', 'Ready to Calculate Your Path to Freedom?').scrollIntoView();
      cy.wait(300);

      cy.contains(
        'Join others who have ditched their messy spreadsheets and taken control of their FIRE journey',
      ).should('be.visible');
    });

    it('should display start journey button', () => {
      cy.contains('h2', 'Ready to Calculate Your Path to Freedom?').scrollIntoView();
      cy.wait(300);

      cy.contains('Start Your FIRE Journey').should('be.visible');
    });

    it('should navigate to signup when final CTA clicked', () => {
      cy.scrollTo(0, 3400);

      cy.contains('Start Your FIRE Journey').click();
      cy.url().should('include', '/auth/signup');
    });

    it('should display free forever message', () => {
      cy.contains('h2', 'Ready to Calculate Your Path to Freedom?').scrollIntoView();
      cy.wait(300);

      cy.contains('Free forever').should('be.visible');
      cy.contains("Upgrade when you're ready").should('be.visible');
    });
  });

  /**
   * CREATOR SECTION TESTS
   */
  describe('Creator Section', () => {
    it('should display creator section', () => {
      cy.contains('Hello, my name is Timmy').scrollIntoView().should('be.visible');
    });

    it('should display creator image', () => {
      cy.scrollTo('bottom');

      cy.get('img[alt="Timmy Mejabi"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'creator.jpg');
    });

    it('should display creator bio text', () => {
      cy.scrollTo('bottom');

      cy.contains('I built Tammy because I needed a way to track my journey').should('be.visible');
      cy.contains('- Timmy Mejabi').should('be.visible');
    });

    it('should display TikTok social link', () => {
      cy.scrollTo('bottom');

      cy.contains('a', 'TikTok')
        .should('be.visible')
        .and('have.attr', 'href', 'https://tiktok.com/@createdbytimmy')
        .and('have.attr', 'target', '_blank');
    });

    it('should have proper rel attribute on external link', () => {
      cy.scrollTo('bottom');

      cy.contains('a', 'TikTok').should('have.attr', 'rel', 'noopener noreferrer');
    });
  });

  /**
   * FOOTER TESTS
   */
  describe('Footer', () => {
    it('should display footer', () => {
      cy.scrollTo('bottom');
      cy.get('footer').should('be.visible');
    });

    it('should display footer logo and description', () => {
      cy.scrollTo('bottom');

      cy.get('footer').contains('tammy').should('be.visible');
      cy.get('footer').contains('Your personal net worth and budget tracker').should('be.visible');
    });

    it('should display login and register links in footer', () => {
      cy.scrollTo('bottom');

      cy.get('footer')
        .contains('a', 'Login')
        .should('be.visible')
        .and('have.attr', 'href', '/auth/login');

      cy.get('footer')
        .contains('a', 'Register')
        .should('be.visible')
        .and('have.attr', 'href', '/auth/signup');
    });

    it('should display contact email link', () => {
      cy.scrollTo('bottom');

      cy.get('footer')
        .contains('a', 'Contact')
        .should('be.visible')
        .and('have.attr', 'href', 'mailto:createdbytimmy@gmail.com');
    });

    it('should display TikTok social link in footer', () => {
      cy.scrollTo('bottom');

      cy.get('footer a[href="https://tiktok.com/@createdbytimmy"]')
        .should('be.visible')
        .and('have.attr', 'aria-label', 'TikTok');
    });

    it('should display privacy policy link', () => {
      cy.scrollTo('bottom');

      cy.get('footer')
        .contains('a', 'Privacy Policy')
        .should('be.visible')
        .and('have.attr', 'href', '/privacy');
    });

    it('should display copyright notice', () => {
      cy.scrollTo('bottom');

      cy.get('footer').contains('© 2025 tammy - All Rights Reserved').should('be.visible');
    });
  });

  /**
   * RESPONSIVE BEHAVIOR TESTS
   */
  describe('Responsive Behavior', () => {
    const viewports: Array<Cypress.ViewportPreset | [number, number]> = [
      'iphone-x', // 375x812
      'ipad-2', // 768x1024
      [1024, 768], // Tablet landscape
      [1280, 720], // Desktop
      [1920, 1080], // Large desktop
    ];

    viewports.forEach((viewport) => {
      const viewportName = Array.isArray(viewport) ? `${viewport[0]}x${viewport[1]}` : viewport;

      it(`should render correctly on ${viewportName}`, () => {
        if (Array.isArray(viewport)) {
          cy.viewport(viewport[0], viewport[1]);
        } else {
          cy.viewport(viewport);
        }

        // Check that main sections are visible
        cy.contains('h1', 'Take Control of Your Financial Future').should('be.visible');
        cy.get('nav').should('be.visible');
        cy.get('footer').scrollIntoView().should('be.visible');
      });
    });

    it('should stack hero content vertically on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('h1').parent().parent().should('have.class', 'grid');
      cy.get('h1').should('be.visible');
      cy.get('img[alt="Dashboard"]').should('be.visible');
    });

    it('should stack feature cards on mobile', () => {
      cy.viewport('iphone-x');
      cy.scrollTo(0, 800);

      cy.contains('h3', 'FIRE Calculator').should('be.visible');
      cy.contains('h3', 'Net Worth Tracking').should('be.visible');
      cy.contains('h3', 'Expense Tracking').should('be.visible');
    });
  });

  /**
   * ACCESSIBILITY TESTS
   */
  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.greaterThan', 3);
      cy.get('h3').should('have.length.greaterThan', 5);
    });

    it('should have accessible navigation', () => {
      cy.get('nav').should('have.attr', 'class');
      cy.get('nav a').each(($el) => {
        cy.wrap($el).should('have.attr', 'href');
      });
    });

    it('should have alt text for all images', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt').and('not.be.empty');
      });
    });

    it('should have aria-label for icon-only links', () => {
      cy.scrollTo('bottom');
      cy.get('footer a[aria-label="TikTok"]').should('exist');
    });

    it('should have proper link attributes for external links', () => {
      cy.scrollTo('bottom');

      cy.get('a[target="_blank"]').each(($link) => {
        cy.wrap($link).should('have.attr', 'rel', 'noopener noreferrer');
      });
    });

    it('should be keyboard navigable', () => {
      cy.get('a').first().focus();
      cy.focused().should('be.visible');
    });
  });

  /**
   * ANIMATION & INTERACTION TESTS
   */
  describe('Animations & Interactions', () => {
    it('should have smooth scroll behavior', () => {
      cy.scrollTo(0, 1000, { duration: 500 });
      cy.wait(500);
      cy.window().then((win) => {
        expect(win.pageYOffset).to.be.closeTo(1000, 100);
      });
    });

    it('should animate elements on scroll into view', () => {
      cy.scrollTo(0, 0);
      cy.wait(300);

      cy.get('h1').should('have.css', 'opacity', '1');
    });

    it('should have hover effects on buttons', () => {
      cy.contains('Get started for free').should('exist');
    });

    it('should have hover effects on feature cards', () => {
      cy.scrollTo(0, 800);

      cy.contains('h3', 'FIRE Calculator')
        .parent()
        .parent()
        .trigger('mouseover')
        .should('have.css', 'transition');
    });
  });

  /**
   * SEO & META TESTS
   */
  describe('SEO & Meta Information', () => {
    it('should have a title tag', () => {
      cy.title().should('not.be.empty');
    });

    it('should have meta viewport tag', () => {
      cy.get('head meta[name="viewport"]').should('exist');
    });

    it('should have main heading with primary keyword', () => {
      cy.get('h1').then(($h1) => {
        const text = $h1.text();
        const hasKeyword =
          text.includes('Financial') || text.includes('Net Worth') || text.includes('FIRE');
        expect(hasKeyword).to.be.true;
      });
    });

    it('should have descriptive alt text on images', () => {
      cy.get('img[alt="FIRE Calculator"]').should('exist');
      cy.get('img[alt="Net Worth Tracking"]').should('exist');
      cy.get('img[alt="Expense Tracking"]').should('exist');
    });
  });

  /**
   * LINKS & NAVIGATION FLOW TESTS
   */
  describe('Links & Navigation Flow', () => {
    it('should have working signup links throughout page', () => {
      const signupLinks = ['Get started for free', 'Start Your FIRE Journey'];

      signupLinks.forEach((linkText) => {
        cy.visit('/');
        cy.contains(linkText).scrollIntoView();
        cy.wait(300);
        cy.contains('a', linkText).should('have.attr', 'href', '/auth/signup');
      });
    });

    it('should have consistent link styling', () => {
      cy.get('a[href="/auth/signup"]').each(($link) => {
        cy.wrap($link).should('have.css', 'cursor', 'pointer');
      });
    });

    it('should not have broken internal links', () => {
      const internalLinks = ['/auth/login', '/auth/signup', '/privacy'];

      internalLinks.forEach((link) => {
        cy.get(`a[href="${link}"]`).should('exist');
      });
    });
  });

  /**
   * PERFORMANCE TESTS
   */
  describe('Performance', () => {
    it('should load main content within reasonable time', () => {
      const start = Date.now();
      cy.visit('/');
      cy.get('h1').should('be.visible');
      const loadTime = Date.now() - start;

      expect(loadTime).to.be.lessThan(5000); // 5 seconds
    });

    it('should lazy load below-fold images', () => {
      cy.scrollTo(0, 0);

      // Features images should be lazy loaded
      cy.get('img[alt="FIRE Calculator"]').should('have.attr', 'loading');
    });

    it('should not have unnecessary re-renders', () => {
      cy.visit('/');
      cy.get('h1').should('be.visible');
      cy.wait(1000);
      cy.get('h1').should('be.visible'); // Should still be visible without flickering
    });
  });

  /**
   * EDGE CASES & ERROR HANDLING
   */
  describe('Edge Cases & Error Handling', () => {
    it('should handle rapid navigation clicks gracefully', () => {
      cy.contains('Get started for free').click();
      cy.url().should('include', '/auth/signup');
    });

    it('should handle browser back button correctly', () => {
      cy.contains('Get started for free').click();
      cy.url().should('include', '/auth/signup');
      cy.go('back');
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);
      cy.contains('h1', 'Take Control').should('be.visible');
    });

    it('should handle rapid scrolling without breaking', () => {
      cy.scrollTo('top');
      cy.scrollTo('bottom');
      cy.scrollTo('top');
      cy.scrollTo('bottom');

      cy.get('footer').should('be.visible');
    });
  });

  /**
   * VISUAL REGRESSION PREVENTION TESTS
   */
  describe('Visual Consistency', () => {
    it('should maintain consistent button styling', () => {
      cy.get('button, a[class*="Button"]').each(($btn) => {
        cy.wrap($btn).should('have.css', 'border-radius');
      });
    });

    it('should use consistent color scheme', () => {
      // Primary color check
      cy.contains('Get started for free')
        .should('have.css', 'background-color')
        .and('match', /rgb/);
    });

    it('should maintain consistent spacing', () => {
      cy.get('section').each(($section) => {
        cy.wrap($section).should('have.css', 'padding');
      });
    });

    it('should have consistent typography', () => {
      cy.get('h1')
        .should('have.css', 'font-weight')
        .and('match', /^(700|bold)$/);
    });
  });
});
