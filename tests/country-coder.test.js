import CountryCoder from '..';

describe('country-coder', () => {
  describe('constructor', () => {
    it('initializes without error', () => {
      const coder = new CountryCoder();
      expect(coder.borders).toHaveProperty('features');
    });
  });

  describe('feature', () => {
    it('does not find feature for empty string', () => {
      const coder = new CountryCoder();
      expect(coder.feature('')).toBeNull();
    });

    it('does not find feature for garbage string', () => {
      const coder = new CountryCoder();
      expect(coder.feature('fv    239uasˇÁ¨·´€Óı¨ıÎ∆πˆç´œª -aÔ˚øØTˇ°\\asdf \nK')).toBeNull();
    });

    it('does not find feature for full English country name: The United State of America', () => {
      const coder = new CountryCoder();
      expect(coder.feature('The United State of America')).toBeNull();
    });

    describe('by ISO 3166-1 alpha-2', () => {
      it('finds feature by ISO 3166-1 alpha-2 code: US', () => {
        const coder = new CountryCoder();
        expect(coder.feature('US').properties.iso1N3).toBe('840');
      });

      it('does not find feature for unassigned alpha-2 code: AB', () => {
        const coder = new CountryCoder();
        expect(coder.feature('AB')).toBeNull();
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds feature by ISO 3166-1 alpha-3 code: USA', () => {
        const coder = new CountryCoder();
        expect(coder.feature('USA').properties.iso1A2).toBe('US');
      });

      it('does not find feature for unassigned alpha-3 code: ABC', () => {
        const coder = new CountryCoder();
        expect(coder.feature('ABC')).toBeNull();
      });
    });

    describe('by ISO 3166-1 numeric-3', () => {
      it('finds feature by ISO 3166-1 numeric-3 code: 840', () => {
        const coder = new CountryCoder();
        expect(coder.feature('840').properties.iso1A2).toBe('US');
      });

      it('does not find feature for unassigned numeric-3 code: 123', () => {
        const coder = new CountryCoder();
        expect(coder.feature('123')).toBeNull();
      });
    });

    describe('by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        const coder = new CountryCoder();
        expect(coder.feature('🇺🇸').properties.iso1N3).toBe('840');
      });

      it('does not find feature for unassigned emoji flag sequence: 🇦🇧', () => {
        const coder = new CountryCoder();
        expect(coder.feature('🇦🇧')).toBeNull();
      });
    });

    describe('by Wikidata QID', () => {
      it('finds feature by Wikidata QID: Q30', () => {
        const coder = new CountryCoder();
        expect(coder.feature('Q30').properties.iso1A2).toBe('US');
      });

      it('does not find feature for non-feature Wikidata QID code: Q123456', () => {
        const coder = new CountryCoder();
        expect(coder.feature('Q123456')).toBeNull();
      });
    });

    describe('by alias', () => {
      it('finds Greece by European Commission code: EL', () => {
        const coder = new CountryCoder();
        expect(coder.feature('EL').properties.iso1N3).toBe('300');
      });

      it('finds United Kingdom by European Commission code: UK', () => {
        const coder = new CountryCoder();
        expect(coder.feature('UK').properties.iso1N3).toBe('826');
      });

      it('finds Myanmar by transitionally-reserved code: BU', () => {
        const coder = new CountryCoder();
        expect(coder.feature('BU').properties.iso1N3).toBe('104');
      });

      it('finds Philippines by indeterminately-reserved code 1: PI', () => {
        const coder = new CountryCoder();
        expect(coder.feature('PI').properties.iso1N3).toBe('608');
      });

      it('finds Philippines by indeterminately-reserved code 2: RP', () => {
        const coder = new CountryCoder();
        expect(coder.feature('RP').properties.iso1N3).toBe('608');
      });
    });
  });

  describe('iso1A2Code', () => {
    describe('by ISO 3166-1 alpha-2', () => {
      it('finds by ISO 3166-1 alpha-2 code: US', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('US')).toBe('US');
      });

      it('does not find for unassigned alpha-2 code: AB', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('AB')).toBeNull();
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds by ISO 3166-1 alpha-3 code: USA', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('USA')).toBe('US');
      });

      it('does not find feature for unassigned alpha-3 code: ABC', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('ABC')).toBeNull();
      });
    });

    describe('by ISO 3166-1 numeric-3', () => {
      it('finds by ISO 3166-1 numeric-3 code: 840', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('840')).toBe('US');
      });

      it('does not find for unassigned numeric-3 code: 123', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('123')).toBeNull();
      });
    });

    describe('finds by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('🇺🇸')).toBe('US');
      });

      it('does not find for unassigned emoji flag sequence: 🇦🇧', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('🇦🇧')).toBeNull();
      });
    });

    describe('by Wikidata QID', () => {
      it('finds by Wikidata QID: Q30', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('Q30')).toBe('US');
      });

      it('does not find for non-feature Wikidata QID code: Q123456', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('Q123456')).toBeNull();
      });
    });

    describe('by alias', () => {
      it('finds Greece by European Commission code: EL', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('EL')).toBe('GR');
      });

      it('finds United Kingdom by European Commission code: UK', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('UK')).toBe('GB');
      });

      it('finds Myanmar by transitionally-reserved code: BU', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('BU')).toBe('MM');
      });

      it('finds Philippines by indeterminately-reserved code 1: PI', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('PI')).toBe('PH');
      });

      it('finds Philippines by indeterminately-reserved code 2: RP', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code('RP')).toBe('PH');
      });
    });
    describe('by location, country level', () => {
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
    describe('by location, region level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([-74, 40.6], { level: 'region' })).toBe('US');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([6.1, 46.2], { level: 'region' })).toBe('CH');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([12.59, 55.68], { level: 'region' })).toBe('DK');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([13.4, 52.5], { level: 'region' })).toBe('DE');
      });

      it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as IM', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([-4.5, 54.2], { level: 'region' })).toBe('IM');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([2.35, 48.85], { level: 'region' })).toBe('FR');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as SH', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([-12.3, -37.1], { level: 'region' })).toBe('SH');
      });

      it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([21, 42.6], { level: 'region' })).toBe('XK');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([71.13, 39.96], { level: 'region' })).toBe('UZ');
      });

      it('codes South Pole as AQ', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([0, -90], { level: 'region' })).toBe('AQ');
      });

      it('does not code North Pole', () => {
        const coder = new CountryCoder();
        expect(coder.iso1A2Code([0, 90], { level: 'region' })).toBeNull();
      });
    });
    describe('by GeoJSON point feature, country level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
        const coder = new CountryCoder();
        let pointFeature = {
          type: 'Feature',
          properties: null,
          geometry: {
            type: 'Point',
            coordinates: [-74, 40.6]
          }
        };
        expect(coder.iso1A2Code(pointFeature)).toBe('US');
      });
    });
    describe('by GeoJSON point geometry, country level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
        const coder = new CountryCoder();
        let pointGeometry = {
          type: 'Point',
          coordinates: [-74, 40.6]
        };
        expect(coder.iso1A2Code(pointGeometry)).toBe('US');
      });
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

    it('does not find QID for EA', () => {
      const coder = new CountryCoder();
      expect(coder.wikidataQID('EA')).toBeNull();
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
      expect(coder.emojiFlag([-74, 40.6], { level: 'country' })).toBe('🇺🇸');
    });

    it('codes location in user-assigned, de facto country: Kosovo as 🇽🇰', () => {
      const coder = new CountryCoder();
      expect(coder.emojiFlag([21, 42.6], { level: 'country' })).toBe('🇽🇰');
    });

    it('does not code North Pole', () => {
      const coder = new CountryCoder();
      expect(coder.emojiFlag([0, 90], { level: 'country' })).toBeNull();
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
    describe('by location', () => {
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
      it('returns true for GeoJSON point feature in Germany', () => {
        const coder = new CountryCoder();
        let pointFeature = {
          type: 'Feature',
          properties: null,
          geometry: {
            type: 'Point',
            coordinates: [13.4, 52.5]
          }
        };
        expect(coder.isInEuropeanUnion(pointFeature)).toBe(true);
      });
      it('returns true for GeoJSON point geometry in Germany', () => {
        const coder = new CountryCoder();
        let pointGeometry = {
          type: 'Point',
          coordinates: [13.4, 52.5]
        };
        expect(coder.isInEuropeanUnion(pointGeometry)).toBe(true);
      });
    });
    describe('by code', () => {
      it('returns true for European Union itself: EU', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('EU')).toBe(true);
      });

      it('returns false for officially-assigned country, outside EU: US', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('US')).toBe(false);
      });

      it('returns false for officially-assigned country, outside but surrounded by EU: CH', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('CH')).toBe(false);
      });

      it('returns true for officially-assigned country, in EU: DE', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('DE')).toBe(true);
      });

      it('returns false for officially-assigned subfeature, oustide EU, of officially-assigned country, in EU: IM', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('IM')).toBe(false);
      });

      it('returns true for exceptionally-reserved subfeature, in EU: FX', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('FX')).toBe(true);
      });

      it('returns false for exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: TA', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('TA')).toBe(false);
      });

      it('returns false for user-assigned, de facto country, in Europe, outside EU: XK', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('XK')).toBe(false);
      });

      it('returns false for unassigned alpha-2 code: AB', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('AB')).toBe(false);
      });

      it('returns false for empty string', () => {
        const coder = new CountryCoder();
        expect(coder.isInEuropeanUnion('')).toBe(false);
      });
    });
  });
});
