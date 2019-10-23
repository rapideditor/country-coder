import CountryCoder from '..';

describe('country-coder', () => {

  describe('countryIso1A2Code', () => {

    it('codes location in officially-assigned country: New York, United States as US', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([-74, 40.6])).toBe('US');
    });

    it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([6.1, 46.2])).toBe('CH');
    });

    it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([12.59, 55.68])).toBe('DK');
    });

    it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([13.4, 52.5])).toBe('DE');
    });

    it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as GB', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([-4.5, 54.2])).toBe('GB');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([2.35, 48.85])).toBe('FR');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as GB', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([-12.3, -37.1])).toBe('GB');
    });

    it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([21, 42.6])).toBe('XK');
    });

    it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([71.13, 39.96])).toBe('UZ');
    });

    it('codes South Pole as AQ', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([0, -90])).toBe('AQ');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A2Code([0, 90])).toBeNull();
    });

  });

  // this doesn't need extensive tests since it's just a fetcher using countryIso1A2Code
  describe('countryIso1A3Code', () => {

    it('codes location in officially-assigned country: New York, United States as USA', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A3Code([-74, 40.6])).toBe('USA');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A3Code([21, 42.6])).toBeNull();
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1A3Code([0, 90])).toBeNull();
    });

  });

  // this doesn't need extensive tests since it's just a fetcher using countryIso1A2Code
  describe('countryIso1N3Code', () => {

    it('codes location in officially-assigned country: New York, United States as 840', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1N3Code([-74, 40.6])).toBe('840');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1N3Code([21, 42.6])).toBeNull();
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.countryIso1N3Code([0, 90])).toBeNull();
    });

  });

  // this doesn't need extensive tests since it's just a fetcher using countryIso1A2Code
  describe('countryWikidataQID', () => {

    it('codes location in officially-assigned country: New York, United States as Q30', () => {
      const coder = new CountryCoder();
      expect(coder.countryWikidataQID([-74, 40.6])).toBe('Q30');
    });

    it('codes location in user-assigned, de facto country: Kosovo as Q1246', () => {
      const coder = new CountryCoder();
      expect(coder.countryWikidataQID([21, 42.6])).toBe('Q1246');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.countryWikidataQID([0, 90])).toBeNull();
    });

  });

  describe('officialIso1A2Code', () => {

    it('codes location in officially-assigned country: New York, United States as US', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([-74, 40.6])).toBe('US');
    });

    it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([6.1, 46.2])).toBe('CH');
    });

    it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([12.59, 55.68])).toBe('DK');
    });

    it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([13.4, 52.5])).toBe('DE');
    });

    it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as IM', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([-4.5, 54.2])).toBe('IM');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([2.35, 48.85])).toBe('FR');
    });

    it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as SH', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([-12.3, -37.1])).toBe('SH');
    });

    it('does not code location in user-assigned, de facto country: Kosovo as XK', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([21, 42.6])).toBeNull();
    });

    it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([71.13, 39.96])).toBe('UZ');
    });

    it('codes South Pole as AQ', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([0, -90])).toBe('AQ');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.officialIso1A2Code([0, 90])).toBeNull();
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
