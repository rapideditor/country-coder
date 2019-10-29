import CountryCoder from '..';

describe('country-coder', () => {
  describe('constructor', () => {
    it('initializes without error', () => {
      const coder = new CountryCoder();
      expect(coder.borders).toHaveProperty('features');
    });
  });

  describe('feature', () => {
    it('finds feature by ISO 3166-1 alpha-2 code: US', () => {
      const coder = new CountryCoder();
      expect(coder.feature('US').properties.iso1N3).toBe('840');
    });

    it('does not find feature for unassigned alpha-2 code: AB', () => {
      const coder = new CountryCoder();
      expect(coder.feature('AB')).toBeNull();
    });

    it('finds feature by ISO 3166-1 alpha-3 code: USA', () => {
      const coder = new CountryCoder();
      expect(coder.feature('USA').properties.iso1A2).toBe('US');
    });

    it('does not find feature for unassigned alpha-3 code: ABC', () => {
      const coder = new CountryCoder();
      expect(coder.feature('ABC')).toBeNull();
    });

    it('finds feature by ISO 3166-1 numeric-3 code: 840', () => {
      const coder = new CountryCoder();
      expect(coder.feature('840').properties.iso1A2).toBe('US');
    });

    it('does not find feature for unassigned numeric-3 code: 123', () => {
      const coder = new CountryCoder();
      expect(coder.feature('123')).toBeNull();
    });

    it('finds feature for emoji flag sequence: 🇺🇸', () => {
      const coder = new CountryCoder();
      expect(coder.feature('🇺🇸').properties.iso1N3).toBe('840');
    });

    it('does not find feature for unassigned emoji flag sequence: 🇦🇧', () => {
      const coder = new CountryCoder();
      expect(coder.feature('🇦🇧')).toBeNull();
    });

    it('finds feature by Wikidata QID: Q30', () => {
      const coder = new CountryCoder();
      expect(coder.feature('Q30').properties.iso1A2).toBe('US');
    });

    it('does not find feature for non-feature Wikidata QID code: Q123456', () => {
      const coder = new CountryCoder();
      expect(coder.feature('Q123456')).toBeNull();
    });

    it('does not find feature for empty string', () => {
      const coder = new CountryCoder();
      expect(coder.feature('')).toBeNull();
    });

    it('does not find feature for full English country name: The United State of America', () => {
      const coder = new CountryCoder();
      expect(coder.feature('The United State of America')).toBeNull();
    });

    it('does not find feature for garbage string', () => {
      const coder = new CountryCoder();
      expect(coder.feature('fv    239uasˇÁ¨·´€Óı¨ıÎ∆πˆç´œª -aÔ˚øØTˇ°\\asdf \nK')).toBeNull();
    });
  });

  describe('iso1A2Code, country level', () => {
    it('codes location in officially-assigned country: New York, United States as US', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-74, 40.6], { level: 'country' })).toBe('US');
    });

    it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([6.1, 46.2], { level: 'country' })).toBe('CH');
    });

    it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([12.59, 55.68], { level: 'country' })).toBe('DK');
    });

    it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([13.4, 52.5], { level: 'country' })).toBe('DE');
    });

    it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as GB', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-4.5, 54.2], { level: 'country' })).toBe('GB');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([2.35, 48.85], { level: 'country' })).toBe('FR');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as GB', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-12.3, -37.1], { level: 'country' })).toBe('GB');
    });

    it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([21, 42.6], { level: 'country' })).toBe('XK');
    });

    it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([71.13, 39.96], { level: 'country' })).toBe('UZ');
    });

    it('codes South Pole as AQ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([0, -90], { level: 'country' })).toBe('AQ');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([0, 90], { level: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using iso1A2Code
  describe('iso1A3Code', () => {
    it('codes location in officially-assigned country: New York, United States as USA', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A3Code([-74, 40.6], { level: 'country' })).toBe('USA');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A3Code([21, 42.6], { level: 'country' })).toBeNull();
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A3Code([0, 90], { level: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using iso1A2Code
  describe('iso1N3Code', () => {
    it('codes location in officially-assigned country: New York, United States as 840', () => {
      const coder = new CountryCoder();
      expect(coder.iso1N3Code([-74, 40.6], { level: 'country' })).toBe('840');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      const coder = new CountryCoder();
      expect(coder.iso1N3Code([21, 42.6], { level: 'country' })).toBeNull();
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.iso1N3Code([0, 90], { level: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using iso1A2Code
  describe('wikidataQID', () => {
    it('codes location in officially-assigned country: New York, United States as Q30', () => {
      const coder = new CountryCoder();
      expect(coder.wikidataQID([-74, 40.6], { level: 'country' })).toBe('Q30');
    });

    it('codes location in user-assigned, de facto country: Kosovo as Q1246', () => {
      const coder = new CountryCoder();
      expect(coder.wikidataQID([21, 42.6], { level: 'country' })).toBe('Q1246');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.wikidataQID([0, 90], { level: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using iso1A2Code
  describe('flag', () => {
    it('codes location in officially-assigned country: New York, United States as 🇺🇸', () => {
      const coder = new CountryCoder();
      expect(coder.flag([-74, 40.6], { level: 'country' })).toBe('🇺🇸');
    });

    it('codes location in user-assigned, de facto country: Kosovo as 🇽🇰', () => {
      const coder = new CountryCoder();
      expect(coder.flag([21, 42.6], { level: 'country' })).toBe('🇽🇰');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.flag([0, 90], { level: 'country' })).toBeNull();
    });
  });

  describe('iso1A2Code, smallest level', () => {
    it('codes location in officially-assigned country: New York, United States as US', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-74, 40.6], { level: 'smallest' })).toBe('US');
    });

    it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([6.1, 46.2], { level: 'smallest' })).toBe('CH');
    });

    it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([12.59, 55.68], { level: 'smallest' })).toBe('DK');
    });

    it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([13.4, 52.5], { level: 'smallest' })).toBe('DE');
    });

    it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as IM', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-4.5, 54.2], { level: 'smallest' })).toBe('IM');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([2.35, 48.85], { level: 'smallest' })).toBe('FR');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as SH', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([-12.3, -37.1], { level: 'smallest' })).toBe('SH');
    });

    it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([21, 42.6], { level: 'smallest' })).toBe('XK');
    });

    it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([71.13, 39.96], { level: 'smallest' })).toBe('UZ');
    });

    it('codes South Pole as AQ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([0, -90], { level: 'smallest' })).toBe('AQ');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Code([0, 90], { level: 'smallest' })).toBeNull();
    });
  });

  describe('iso1A2Codes', () => {
    it('codes location in officially-assigned country: New York, United States as US', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([-74, 40.6])).toStrictEqual(['US']);
    });

    it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([6.1, 46.2])).toStrictEqual(['CH']);
    });

    it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK, EU', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([12.59, 55.68])).toStrictEqual(['DK', 'EU']);
    });

    it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE, EU', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([13.4, 52.5])).toStrictEqual(['DE', 'EU']);
    });

    it('codes location in officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Isle of Man, United Kingdom as IM, GB', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([-4.5, 54.2])).toStrictEqual(['IM', 'GB']);
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned country, in EU, in Eurozone: Paris, Metropolitan France as FX, FR, EU', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([2.35, 48.85])).toStrictEqual(['FX', 'EU', 'FR']);
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK as TA, SH, GB', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([-12.3, -37.1])).toStrictEqual(['TA', 'SH', 'GB']);
    });

    it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([21, 42.6])).toStrictEqual(['XK']);
    });

    it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([71.13, 39.96])).toStrictEqual(['UZ']);
    });

    it('codes South Pole as AQ', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([0, -90])).toStrictEqual(['AQ']);
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.iso1A2Codes([0, 90])).toStrictEqual([]);
    });
  });

  describe('isInEuropeanUnion', () => {
    it('returns false for location in officially-assigned country, outside EU: New York, United States', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([-74, 40.6])).toBe(false);
    });

    it('returns false for location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([6.1, 46.2])).toBe(false);
    });

    it('returns true for location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([12.59, 55.68])).toBe(true);
    });

    it('returns true for location in officially-assigned country, in EU, in Eurozone: Berlin, Germany', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([13.4, 52.5])).toBe(true);
    });

    it('returns false for location in officially-assigned subfeature, oustide EU, of officially-assigned country, in EU: Isle of Man, United Kingdom ', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([-4.5, 54.2])).toBe(false);
    });

    it('returns true for location in exceptionally-reserved subfeature, in EU: Paris, Metropolitan France', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([2.35, 48.85])).toBe(true);
    });

    it('returns false for location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([-12.3, -37.1])).toBe(false);
    });

    it('returns false for location in user-assigned, de facto country, in Europe, outside EU: Kosovo', () => {
      const coder = new CountryCoder();
      expect(coder.isInEuropeanUnion([21, 42.6])).toBe(false);
    });
  });
});
