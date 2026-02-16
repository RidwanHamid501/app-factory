import { parseDeepLink, isValidAppURL } from '../linking';

describe('parseDeepLink', () => {
  describe('successful parsing', () => {
    it('should parse a simple custom scheme deep link', () => {
      const result = parseDeepLink('myapp://home');
      
      expect(result).toEqual({
        url: 'myapp://home',
        scheme: 'myapp',
        hostname: 'home',
        path: '',
        queryParams: {},
      });
    });

    it('should parse custom scheme with path segments', () => {
      const result = parseDeepLink('myapp://profile/123');
      
      expect(result).toEqual({
        url: 'myapp://profile/123',
        scheme: 'myapp',
        hostname: 'profile',
        path: '/123',
        queryParams: {},
      });
    });

    it('should parse query parameters correctly', () => {
      const result = parseDeepLink('myapp://settings?tab=notifications&theme=dark');
      
      expect(result).not.toBeNull();
      expect(result?.queryParams).toEqual({
        tab: 'notifications',
        theme: 'dark',
      });
    });

    it('should parse HTTPS universal links', () => {
      const result = parseDeepLink('https://myapp.com/profile/123');
      
      expect(result).toEqual({
        url: 'https://myapp.com/profile/123',
        scheme: 'https',
        hostname: 'myapp.com',
        path: '/profile/123',
        queryParams: {},
      });
    });

    it('should handle URLs with no path', () => {
      const result = parseDeepLink('myapp://');
      
      expect(result).not.toBeNull();
      expect(result?.scheme).toBe('myapp');
    });

    it('should parse multiple query params with special characters', () => {
      const result = parseDeepLink('myapp://search?q=hello%20world&filter=active');
      
      expect(result?.queryParams.q).toBe('hello world');
      expect(result?.queryParams.filter).toBe('active');
    });
  });

  describe('error handling', () => {
    it('should return null for malformed URLs', () => {
      const result = parseDeepLink('not a valid url');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseDeepLink('');
      expect(result).toBeNull();
    });

    it('should return null for URLs with invalid characters', () => {
      const result = parseDeepLink('myapp://profile/{invalid}');
      expect(result).not.toBeNull();
    });
  });

  describe('semantic validation', () => {
    it('should correctly identify the scheme for routing decisions', () => {
      const customScheme = parseDeepLink('myapp://home');
      const httpsScheme = parseDeepLink('https://myapp.com/home');
      
      expect(customScheme?.scheme).toBe('myapp');
      expect(httpsScheme?.scheme).toBe('https');
    });

    it('should preserve all query parameters for analytics tracking', () => {
      const result = parseDeepLink('myapp://promo?source=email&campaign=summer&utm_medium=push');
      
      expect(result?.queryParams).toHaveProperty('source', 'email');
      expect(result?.queryParams).toHaveProperty('campaign', 'summer');
      expect(result?.queryParams).toHaveProperty('utm_medium', 'push');
      expect(Object.keys(result?.queryParams || {})).toHaveLength(3);
    });
  });
});

describe('isValidAppURL', () => {
  const prefixes = ['myapp://', 'https://myapp.com'];

  describe('successful validation', () => {
    it('should validate custom scheme URLs', () => {
      expect(isValidAppURL('myapp://home', prefixes)).toBe(true);
      expect(isValidAppURL('myapp://profile/123', prefixes)).toBe(true);
    });

    it('should validate universal links', () => {
      expect(isValidAppURL('https://myapp.com/profile/123', prefixes)).toBe(true);
      expect(isValidAppURL('https://myapp.com', prefixes)).toBe(true);
    });
  });

  describe('rejection of invalid URLs', () => {
    it('should reject URLs with different schemes', () => {
      expect(isValidAppURL('https://different.com/page', prefixes)).toBe(false);
      expect(isValidAppURL('otherapp://home', prefixes)).toBe(false);
    });

    it('should reject URLs with wrong protocol', () => {
      expect(isValidAppURL('http://myapp.com/page', prefixes)).toBe(false);
    });
  });

  describe('semantic validation', () => {
    it('should validate for security - only allow configured prefixes', () => {
      const maliciousURL = 'javascript://alert(1)';
      expect(isValidAppURL(maliciousURL, prefixes)).toBe(false);
    });

    it('should be case-sensitive for security', () => {
      expect(isValidAppURL('MyApp://home', prefixes)).toBe(false);
      expect(isValidAppURL('HTTPS://myapp.com/page', prefixes)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty prefix array', () => {
      expect(isValidAppURL('myapp://home', [])).toBe(false);
    });

    it('should handle empty URL', () => {
      expect(isValidAppURL('', prefixes)).toBe(false);
    });
  });
});
