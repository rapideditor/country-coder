import * as coder from '..';

describe('country-coder', () => {
  describe('borders', () => {
    it('exports borders as a feature collection', () => {
      expect(coder.borders).toHaveProperty('features');
    });

    describe('properties', () => {
      it('all identifying values are unique', () => {
        let ids = {};
        let identifierProps = ['iso1A2', 'iso1A3', 'm49', 'wikidata', 'emojiFlag', 'nameEn'];
        for (let i in coder.borders.features) {
          let identifiers = identifierProps
            .map(function (prop) {
              return coder.borders.features[i].properties[prop];
            })
            .concat(coder.borders.features[i].properties.aliases || [])
            .filter(Boolean);
          for (let j in identifiers) {
            let id = identifiers[j];
            expect(ids[id]).toBeUndefined();
            ids[id] = true;
          }
        }
      });
    });

    describe('id', () => {
      it('assigns unique id to every feature', () => {
        let ids = {};
        for (let i in coder.borders.features) {
          let id = coder.borders.features[i].properties.id;
          expect(id).not.toBeNull();
          expect(ids[id]).toBeUndefined();
          ids[id] = true;
        }
      });
    });

    it('level', () => {
      expect(coder.feature('CA').properties.level).toBe('country');
      expect(coder.feature('IM').properties.level).toBe('territory');
      expect(coder.feature('GB-SCT').properties.level).toBe('territory');
      expect(coder.feature('EU').properties.level).toBe('union');
      expect(coder.feature('XK').properties.level).toBe('country');
      expect(coder.feature('AC').properties.level).toBe('subterritory');
      expect(coder.feature('Bir Tawil').properties.level).not.toBe('country');
    });
  });

  describe('feature', () => {
    it('does not find feature for empty string', () => {
      expect(coder.feature('')).toBeNull();
    });

    it('does not find feature for garbage string', () => {
      expect(coder.feature('fv    239uasˇÁ¨·´€Óı¨ıÎ∆πˆç´œª -aÔ˚øØTˇ°\\asdf \nK')).toBeNull();
    });

    describe('by ISO 3166-1 alpha-2', () => {
      it('finds feature by uppercase code: US', () => {
        expect(coder.feature('US').properties.iso1N3).toBe('840');
      });

      it('finds feature by lowercase code: us', () => {
        expect(coder.feature('us').properties.iso1N3).toBe('840');
      });

      it('finds feature by mixed-case code: Us', () => {
        expect(coder.feature('Us').properties.iso1N3).toBe('840');
      });

      it('does not find feature for unassigned code in range: AB', () => {
        expect(coder.feature('AB')).toBeNull();
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds feature by uppercase code: USA', () => {
        expect(coder.feature('USA').properties.iso1A2).toBe('US');
      });

      it('finds Andorra by uppercase code: AND', () => {
        expect(coder.feature('AND').properties.iso1A2).toBe('AD');
      });

      it('finds feature by lowercase code: usa', () => {
        expect(coder.feature('usa').properties.iso1A2).toBe('US');
      });

      it('finds feature by mixed-case code: Usa', () => {
        expect(coder.feature('Usa').properties.iso1A2).toBe('US');
      });

      it('does not find feature for unassigned code in range: ABC', () => {
        expect(coder.feature('ABC')).toBeNull();
      });
    });

    describe('by ISO 3166-1 numeric-3 / M49', () => {
      it('finds feature by string: "840"', () => {
        expect(coder.feature('840').properties.iso1A2).toBe('US');
      });

      it('finds feature by three-digit number: 840', () => {
        expect(coder.feature(840).properties.iso1A2).toBe('US');
      });

      it('finds feature by two-digit number: 61', () => {
        expect(coder.feature(61).properties.wikidata).toBe('Q35942');
      });

      it('finds feature by one-digit number: 2', () => {
        expect(coder.feature(2).properties.wikidata).toBe('Q15');
      });

      it('finds feature by number with extra precision: 840.000', () => {
        expect(coder.feature(840.0).properties.iso1A2).toBe('US');
      });

      it('finds world feature: "001"', () => {
        expect(coder.feature('001').properties.wikidata).toBe('Q2');
      });

      it('does not find feature for unassigned code in range: "123"', () => {
        expect(coder.feature('123')).toBeNull();
      });

      it('does not find feature for number outside range: 1234', () => {
        expect(coder.feature(1234)).toBeNull();
      });
    });

    describe('by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        expect(coder.feature('🇺🇸').properties.iso1N3).toBe('840');
      });

      it('does not find feature for unassigned emoji flag sequence: 🇦🇧', () => {
        expect(coder.feature('🇦🇧')).toBeNull();
      });
    });

    describe('by Wikidata QID', () => {
      it('finds feature by uppercase QID: Q30', () => {
        expect(coder.feature('Q30').properties.iso1A2).toBe('US');
      });

      it('finds feature by lowercase QID: q30', () => {
        expect(coder.feature('q30').properties.iso1A2).toBe('US');
      });

      it('finds feature with no ISO or M49 codes by QID: Q153732', () => {
        expect(coder.feature('Q153732').properties.nameEn).toBe('Mariana Islands');
      });

      it('does not find feature for non-feature QID: Q123456', () => {
        expect(coder.feature('Q123456')).toBeNull();
      });
    });

    describe('by English name', () => {
      it('finds feature for exact name: Bhutan', () => {
        expect(coder.feature('Bhutan').properties.iso1A2).toBe('BT');
      });
      it('finds feature for exact name containing "And": Andorra', () => {
        expect(coder.feature('Andorra').properties.iso1A2).toBe('AD');
      });
      it('finds feature for lowercase name containing "and": andorra', () => {
        expect(coder.feature('andorra').properties.iso1A2).toBe('AD');
      });
      it('finds feature for name containing "the": Northern Europe', () => {
        expect(coder.feature('Northern Europe').properties.m49).toBe('154');
      });
      it('finds feature for name with extra "The": The United States of America', () => {
        expect(coder.feature('The United States of America').properties.iso1A2).toBe('US');
      });
      it('finds feature for name without "The": Gambia', () => {
        expect(coder.feature('Gambia').properties.iso1A2).toBe('GM');
      });
      it('finds feature not in country for name: Bir Tawil', () => {
        expect(coder.feature('Bir Tawil').properties.wikidata).toBe('Q620634');
      });
    });

    describe('by alias', () => {
      it('finds by European Commission codes', () => {
        expect(coder.feature('EL').properties.iso1N3).toBe('300');
        expect(coder.feature('el').properties.iso1N3).toBe('300');
        expect(coder.feature('UK').properties.iso1N3).toBe('826');
      });

      it('finds by transitionally-reserved codes', () => {
        expect(coder.feature('BU').properties.iso1N3).toBe('104');
      });

      it('finds by indeterminately-reserved codes', () => {
        expect(coder.feature('PI').properties.iso1N3).toBe('608');
        expect(coder.feature('RP').properties.iso1N3).toBe('608');
      });

      it('finds by ISO 3166-2 codes', () => {
        expect(coder.feature('UM-71').properties.nameEn).toBe('Midway Atoll');
        expect(coder.feature('UM71').properties.nameEn).toBe('Midway Atoll');
        expect(coder.feature('UM 71').properties.nameEn).toBe('Midway Atoll');
        expect(coder.feature('US-AK').properties.nameEn).toBe('Alaska');
      });

      it('finds by deleted codes', () => {
        expect(coder.feature('MI').properties.nameEn).toBe('Midway Atoll');
        expect(coder.feature('MID').properties.nameEn).toBe('Midway Atoll');
        expect(coder.feature('488').properties.nameEn).toBe('Midway Atoll');
      });

      it('finds by common abbreviations', () => {
        expect(coder.feature('CONUS').properties.nameEn).toBe('Contiguous United States');
        expect(coder.feature('SBA').properties.wikidata).toBe('Q37362');
        expect(coder.feature('BOTS').properties.wikidata).toBe('Q46395');
        expect(coder.feature('UKOTS').properties.wikidata).toBe('Q46395');
      });
    });

    describe('by location', () => {
      it('returns country feature by default', () => {
        expect(coder.feature([12.59, 55.68]).properties.iso1A2).toBe('DK');
        expect(coder.feature([-74, 40.6]).properties.iso1A2).toBe('US');
        expect(coder.feature([-12.3, -37.1]).properties.iso1A2).toBe('GB');
        expect(coder.feature([153, -27.4]).properties.iso1A2).toBe('AU');
      });
      it('returns country feature for country level', () => {
        expect(coder.feature([12.59, 55.68], { level: 'country' }).properties.iso1A2).toBe('DK');
        expect(coder.feature([-74, 40.6], { level: 'country' }).properties.iso1A2).toBe('US');
        expect(coder.feature([-12.3, -37.1], { level: 'country' }).properties.iso1A2).toBe('GB');
        expect(coder.feature([153, -27.4], { level: 'country' }).properties.iso1A2).toBe('AU');
      });
      it('returns next-higher-level feature for country level where no country exists (Bir Tawil)', () => {
        expect(coder.feature([33.75, 21.87]).properties.m49).toBe('015');
        expect(coder.feature([33.75, 21.87], { level: 'country' }).properties.m49).toBe('015');
      });
      it('returns null for country level where no country exists', () => {
        expect(coder.feature([33.75, 21.87], { maxLevel: 'country' })).toBeNull();
        expect(coder.feature([33.75, 21.87], { level: 'country', maxLevel: 'country' })).toBeNull();
      });

      it('returns subterritory feature for subterritory level', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'subterritory' }).properties.iso1A2).toBe(
          'TA'
        );
      });
      it('returns country feature for subterritory level where no subterritory or territory exists', () => {
        expect(coder.feature([-79.4, 43.7], { level: 'subterritory' }).properties.iso1A2).toBe(
          'CA'
        );
      });

      it('returns territory feature for territory level', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'territory' }).properties.iso1A2).toBe('SH');
        expect(coder.feature([33.75, 21.87], { level: 'territory' }).properties.wikidata).toBe(
          'Q620634'
        );
        expect(coder.feature([33.75, 21.87], { level: 'territory' }).properties.wikidata).toBe(
          'Q620634'
        );
      });
      it('returns country feature for territory level where no territory exists', () => {
        expect(coder.feature([-79.4, 43.7], { level: 'territory' }).properties.iso1A2).toBe('CA');
      });
      it('returns null for territory level where no territory exists', () => {
        expect(
          coder.feature([-79.4, 43.7], { level: 'territory', maxLevel: 'territory' })
        ).toBeNull();
      });

      it('returns intermediateRegion feature for intermediateRegion level', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'intermediateRegion' }).properties.m49).toBe(
          '011'
        );
      });
      it('returns subregion feature for subregion level', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'subregion' }).properties.m49).toBe('202');
      });
      it('returns region feature for region level', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'region' }).properties.m49).toBe('002');
      });
      it('returns union feature for union level', () => {
        expect(coder.feature([2.35, 48.85], { level: 'union' }).properties.iso1A2).toBe('EU');
      });

      it('returns null for invalid level option', () => {
        expect(coder.feature([-12.3, -37.1], { level: 'planet' })).toBeNull();
      });
      it('returns Antarctica for South Pole, country level', () => {
        expect(coder.feature([0, -90]).properties.iso1A2).toBe('AQ');
        expect(coder.feature([0, -90], { level: 'country' }).properties.iso1A2).toBe('AQ');
      });
      it('returns null for North Pole', () => {
        expect(coder.feature([0, 90])).toBeNull();
        expect(coder.feature([0, 90], { level: 'country' })).toBeNull();
        expect(coder.feature([0, 90], { level: 'subterritory' })).toBeNull();
      });
    });
  });

  describe('iso1A2Code', () => {
    describe('by ISO 3166-1 alpha-2', () => {
      it('finds by ISO 3166-1 alpha-2 code: US', () => {
        expect(coder.iso1A2Code('US')).toBe('US');
      });

      it('does not find for unassigned alpha-2 code: AB', () => {
        expect(coder.iso1A2Code('AB')).toBeNull();
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds by ISO 3166-1 alpha-3 code: USA', () => {
        expect(coder.iso1A2Code('USA')).toBe('US');
      });

      it('does not find feature for unassigned alpha-3 code: ABC', () => {
        expect(coder.iso1A2Code('ABC')).toBeNull();
      });
    });

    describe('by ISO 3166-1 numeric-3', () => {
      it('finds by ISO 3166-1 numeric-3 code: "840"', () => {
        expect(coder.iso1A2Code('840')).toBe('US');
      });

      it('does not find for unassigned numeric-3 code: "123"', () => {
        expect(coder.iso1A2Code('123')).toBeNull();
      });
    });

    describe('finds by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        expect(coder.iso1A2Code('🇺🇸')).toBe('US');
      });

      it('does not find for unassigned emoji flag sequence: 🇦🇧', () => {
        expect(coder.iso1A2Code('🇦🇧')).toBeNull();
      });
    });

    describe('by Wikidata QID', () => {
      it('finds by Wikidata QID: Q30', () => {
        expect(coder.iso1A2Code('Q30')).toBe('US');
      });

      it('does not find for non-feature Wikidata QID code: Q123456', () => {
        expect(coder.iso1A2Code('Q123456')).toBeNull();
      });
    });

    describe('by alias', () => {
      it('finds Greece by European Commission code: EL', () => {
        expect(coder.iso1A2Code('EL')).toBe('GR');
      });

      it('finds United Kingdom by European Commission code: UK', () => {
        expect(coder.iso1A2Code('UK')).toBe('GB');
      });

      it('finds Myanmar by transitionally-reserved code: BU', () => {
        expect(coder.iso1A2Code('BU')).toBe('MM');
      });

      it('finds Philippines by indeterminately-reserved code 1: PI', () => {
        expect(coder.iso1A2Code('PI')).toBe('PH');
      });

      it('finds Philippines by indeterminately-reserved code 2: RP', () => {
        expect(coder.iso1A2Code('RP')).toBe('PH');
      });
    });
    describe('by M49', () => {
      it('does not find for feature with geography but no ISO code', () => {
        expect(coder.iso1A2Code('680')).toBeNull();
      });
      it('does not find for feature with no geography and no ISO code', () => {
        expect(coder.iso1A2Code('142')).toBeNull();
      });
    });
    describe('by location, country level', () => {
      it('codes location in officially-assigned country: Toronto, Canada as CA', () => {
        expect(coder.iso1A2Code([-79.4, 43.7], { level: 'country' })).toBe('CA');
      });

      it('codes location in non-ISO territory of officially-assigned country: New York, United States as US', () => {
        expect(coder.iso1A2Code([-74, 40.6], { level: 'country' })).toBe('US');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
        expect(coder.iso1A2Code([6.1, 46.2], { level: 'country' })).toBe('CH');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
        expect(coder.iso1A2Code([12.59, 55.68], { level: 'country' })).toBe('DK');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
        expect(coder.iso1A2Code([13.4, 52.5], { level: 'country' })).toBe('DE');
      });

      it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as GB', () => {
        expect(coder.iso1A2Code([-4.5, 54.2], { level: 'country' })).toBe('GB');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
        expect(coder.iso1A2Code([2.35, 48.85], { level: 'country' })).toBe('FR');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as GB', () => {
        expect(coder.iso1A2Code([-12.3, -37.1], { level: 'country' })).toBe('GB');
      });

      it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
        expect(coder.iso1A2Code([21, 42.6], { level: 'country' })).toBe('XK');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
        expect(coder.iso1A2Code([71.13, 39.96], { level: 'country' })).toBe('UZ');
      });

      it('codes location in feature without an ISO code: Sark as GB', () => {
        expect(coder.iso1A2Code([-2.35, 49.43], { level: 'country' })).toBe('GB');
      });

      it('codes South Pole as AQ', () => {
        expect(coder.iso1A2Code([0, -90], { level: 'country' })).toBe('AQ');
      });

      it('does not code North Pole', () => {
        expect(coder.iso1A2Code([0, 90], { level: 'country' })).toBeNull();
      });

      it('does not code location in Bir Tawil', () => {
        expect(coder.iso1A2Code([33.75, 21.87])).toBeNull();
        expect(coder.iso1A2Code([33.75, 21.87], { level: 'country' })).toBeNull();
      });
    });
    describe('by location, territory level', () => {
      it('codes location in officially-assigned country: Toronto, Canada as CA', () => {
        expect(coder.iso1A2Code([-79.4, 43.7], { level: 'territory' })).toBe('CA');
      });

      it('codes location in non-ISO territory of officially-assigned country: New York, United States as US', () => {
        expect(coder.iso1A2Code([-74, 40.6], { level: 'territory' })).toBe('US');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
        expect(coder.iso1A2Code([6.1, 46.2], { level: 'territory' })).toBe('CH');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
        expect(coder.iso1A2Code([12.59, 55.68], { level: 'territory' })).toBe('DK');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
        expect(coder.iso1A2Code([13.4, 52.5], { level: 'territory' })).toBe('DE');
      });

      it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as IM', () => {
        expect(coder.iso1A2Code([-4.5, 54.2], { level: 'territory' })).toBe('IM');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
        expect(coder.iso1A2Code([2.35, 48.85], { level: 'territory' })).toBe('FR');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as SH', () => {
        expect(coder.iso1A2Code([-12.3, -37.1], { level: 'territory' })).toBe('SH');
      });

      it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
        expect(coder.iso1A2Code([21, 42.6], { level: 'territory' })).toBe('XK');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
        expect(coder.iso1A2Code([71.13, 39.96], { level: 'territory' })).toBe('UZ');
      });

      it('codes location in feature without an ISO code: Sark as GG', () => {
        expect(coder.iso1A2Code([-2.35, 49.43], { level: 'territory' })).toBe('GG');
      });

      it('codes South Pole as AQ', () => {
        expect(coder.iso1A2Code([0, -90], { level: 'territory' })).toBe('AQ');
      });

      it('does not code North Pole', () => {
        expect(coder.iso1A2Code([0, 90], { level: 'territory' })).toBeNull();
      });

      it('does not code location in Bir Tawil', () => {
        expect(coder.iso1A2Code([33.75, 21.87], { level: 'territory' })).toBeNull();
      });
    });
    describe('by GeoJSON point feature, country level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
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
        let pointGeometry = {
          type: 'Point',
          coordinates: [-74, 40.6]
        };
        expect(coder.iso1A2Code(pointGeometry)).toBe('US');
      });
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('iso1A3Code', () => {
    it('codes location in officially-assigned country: New York, United States as USA', () => {
      expect(coder.iso1A3Code([-74, 40.6])).toBe('USA');
      expect(coder.iso1A3Code([-74, 40.6], { level: 'country' })).toBe('USA');
    });

    it('codes location in user-assigned, de facto country: Kosovo as XKX', () => {
      expect(coder.iso1A3Code([21, 42.6])).toBe('XKX');
      expect(coder.iso1A3Code([21, 42.6], { level: 'country' })).toBe('XKX');
    });

    it('does not code North Pole', () => {
      expect(coder.iso1A3Code([0, 90])).toBeNull();
      expect(coder.iso1A3Code([0, 90], { level: 'country' })).toBeNull();
    });

    it('does not code location in Bir Tawil', () => {
      expect(coder.iso1A3Code([33.75, 21.87])).toBeNull();
      expect(coder.iso1A3Code([33.75, 21.87], { level: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('iso1N3Code', () => {
    it('codes location in officially-assigned country: New York, United States as 840', () => {
      expect(coder.iso1N3Code([-74, 40.6], { level: 'country' })).toBe('840');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      expect(coder.iso1N3Code([21, 42.6], { level: 'country' })).toBeNull();
    });

    it('does not code non-geography, non-ISO feature by Wikidata QID: Q48', () => {
      expect(coder.iso1N3Code('Q48')).toBeNull();
    });

    it('does not code North Pole', () => {
      expect(coder.iso1N3Code([0, 90], { level: 'country' })).toBeNull();
    });

    it('does not code location in Bir Tawil', () => {
      expect(coder.iso1N3Code([33.75, 21.87], { level: 'country' })).toBeNull();
    });
  });

  describe('m49Code', () => {
    it('codes location in officially-assigned country: New York, United States as 840', () => {
      expect(coder.m49Code([-74, 40.6], { level: 'country' })).toBe('840');
    });

    it('codes non-geography, non-ISO feature by Wikidata QID: Q48 as 142', () => {
      expect(coder.m49Code('Q48')).toBe('142');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      expect(coder.m49Code([21, 42.6], { maxLevel: 'country' })).toBeNull();
      expect(coder.m49Code([21, 42.6], { level: 'country', maxLevel: 'country' })).toBeNull();
    });

    it('does not code location of North Pole', () => {
      expect(coder.m49Code([0, 90], { level: 'country' })).toBeNull();
    });

    it('does not code "Bir Tawil"', () => {
      expect(coder.m49Code('Bir Tawil')).toBeNull();
    });
    it('codes location in Bir Tawil as 015', () => {
      expect(coder.m49Code([33.75, 21.87])).toBe('015');
      expect(coder.m49Code([33.75, 21.87], { level: 'country' })).toBe('015');
    });

    it('does not code location in Bir Tawil, maxLevel=country', () => {
      expect(coder.m49Code([33.75, 21.87], { maxLevel: 'country' })).toBeNull();
      expect(coder.m49Code([33.75, 21.87], { level: 'country', maxLevel: 'country' })).toBeNull();
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('wikidataQID', () => {
    it('codes location in officially-assigned country: New York, United States as Q30', () => {
      expect(coder.wikidataQID([-74, 40.6], { level: 'country' })).toBe('Q30');
    });

    it('codes location in user-assigned, de facto country: Kosovo as Q1246', () => {
      expect(coder.wikidataQID([21, 42.6], { level: 'country' })).toBe('Q1246');
    });

    it('does not code North Pole', () => {
      expect(coder.wikidataQID([0, 90], { level: 'country' })).toBeNull();
    });

    it('codes Bir Tawil', () => {
      expect(coder.wikidataQID('Bir Tawil')).toBe('Q620634');
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('flag', () => {
    it('codes location in officially-assigned country: New York, United States as 🇺🇸', () => {
      expect(coder.emojiFlag([-74, 40.6], { level: 'country' })).toBe('🇺🇸');
    });

    it('codes location in user-assigned, de facto country: Kosovo as 🇽🇰', () => {
      expect(coder.emojiFlag([21, 42.6], { level: 'country' })).toBe('🇽🇰');
    });

    it('does not find for M49 code with no corresponding ISO code', () => {
      expect(coder.emojiFlag('150')).toBeNull();
    });

    it('does not code North Pole', () => {
      expect(coder.emojiFlag([0, 90], { level: 'country' })).toBeNull();
    });
  });

  describe('featuresContaining', () => {
    describe('by location', () => {
      it('codes location in officially-assigned country: New York, United States', () => {
        let features = coder.featuresContaining([-74, 40.6]);
        expect(features.length).toBe(6);
        expect(features[0].properties.nameEn).toBe('Contiguous United States');
        expect(features[1].properties.iso1A2).toBe('US');
        expect(features[2].properties.m49).toBe('021');
        expect(features[3].properties.m49).toBe('003');
        expect(features[4].properties.m49).toBe('019');
        expect(features[5].properties.m49).toBe('001');
      });

      it('codes location in officially-assigned country: New York, United States, strict', () => {
        let features = coder.featuresContaining([-74, 40.6], true);
        expect(features.length).toBe(6);
        expect(features[0].properties.nameEn).toBe('Contiguous United States');
        expect(features[1].properties.iso1A2).toBe('US');
        expect(features[2].properties.m49).toBe('021');
        expect(features[3].properties.m49).toBe('003');
        expect(features[4].properties.m49).toBe('019');
        expect(features[5].properties.m49).toBe('001');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland', () => {
        let features = coder.featuresContaining([6.1, 46.2]);
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('CH');
        expect(features[1].properties.m49).toBe('155');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark', () => {
        let features = coder.featuresContaining([12.59, 55.68]);
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('DK');
        expect(features[1].properties.m49).toBe('154');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.iso1A2).toBe('EU');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany', () => {
        let features = coder.featuresContaining([13.4, 52.5]);
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('DE');
        expect(features[1].properties.m49).toBe('155');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.iso1A2).toBe('EU');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes location in officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Isle of Man, United Kingdom', () => {
        let features = coder.featuresContaining([-4.5, 54.2]);
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('IM');
        expect(features[1].properties.iso1A2).toBe('GB');
        expect(features[2].properties.m49).toBe('154');
        expect(features[3].properties.m49).toBe('150');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country, in EU, in Eurozone: Paris, Metropolitan France', () => {
        let features = coder.featuresContaining([2.35, 48.85]);
        expect(features.length).toBe(6);
        expect(features[0].properties.iso1A2).toBe('FX');
        expect(features[1].properties.iso1A2).toBe('FR');
        expect(features[2].properties.m49).toBe('155');
        expect(features[3].properties.m49).toBe('150');
        expect(features[4].properties.iso1A2).toBe('EU');
        expect(features[5].properties.m49).toBe('001');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK', () => {
        let features = coder.featuresContaining([-12.3, -37.1]);
        expect(features.length).toBe(8);
        expect(features[0].properties.iso1A2).toBe('TA');
        expect(features[1].properties.iso1A2).toBe('SH');
        expect(features[2].properties.wikidata).toBe('Q46395');
        expect(features[3].properties.iso1A2).toBe('GB');
        expect(features[4].properties.m49).toBe('011');
        expect(features[5].properties.m49).toBe('202');
        expect(features[6].properties.m49).toBe('002');
        expect(features[7].properties.m49).toBe('001');
      });

      it('codes location in user-assigned, de facto country: Kosovo', () => {
        let features = coder.featuresContaining([21, 42.6]);
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('XK');
        expect(features[1].properties.m49).toBe('039');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan', () => {
        let features = coder.featuresContaining([71.13, 39.96]);
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('UZ');
        expect(features[1].properties.m49).toBe('143');
        expect(features[2].properties.m49).toBe('142');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes South Pole as AQ', () => {
        let features = coder.featuresContaining([0, -90]);
        expect(features.length).toBe(2);
        expect(features[0].properties.iso1A2).toBe('AQ');
        expect(features[1].properties.m49).toBe('001');
      });

      it('does not code North Pole', () => {
        expect(coder.featuresContaining([0, 90])).toStrictEqual([]);
      });
    });
    describe('by code', () => {
      it('codes USA', () => {
        let features = coder.featuresContaining('USA');
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('US');
        expect(features[1].properties.m49).toBe('021');
        expect(features[2].properties.m49).toBe('003');
        expect(features[3].properties.m49).toBe('019');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes USA, strict', () => {
        let features = coder.featuresContaining('USA', true);
        expect(features.length).toBe(4);
        expect(features[0].properties.m49).toBe('021');
        expect(features[1].properties.m49).toBe('003');
        expect(features[2].properties.m49).toBe('019');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes CH', () => {
        let features = coder.featuresContaining('CH');
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('CH');
        expect(features[1].properties.m49).toBe('155');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes DK', () => {
        let features = coder.featuresContaining('DK');
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('DK');
        expect(features[1].properties.m49).toBe('154');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.iso1A2).toBe('EU');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes DE', () => {
        let features = coder.featuresContaining('DE');
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('DE');
        expect(features[1].properties.m49).toBe('155');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.iso1A2).toBe('EU');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes IM', () => {
        let features = coder.featuresContaining('IM');
        expect(features.length).toBe(5);
        expect(features[0].properties.iso1A2).toBe('IM');
        expect(features[1].properties.iso1A2).toBe('GB');
        expect(features[2].properties.m49).toBe('154');
        expect(features[3].properties.m49).toBe('150');
        expect(features[4].properties.m49).toBe('001');
      });

      it('codes FX', () => {
        let features = coder.featuresContaining('FX');
        expect(features.length).toBe(6);
        expect(features[0].properties.iso1A2).toBe('FX');
        expect(features[1].properties.iso1A2).toBe('FR');
        expect(features[2].properties.m49).toBe('155');
        expect(features[3].properties.m49).toBe('150');
        expect(features[4].properties.iso1A2).toBe('EU');
        expect(features[5].properties.m49).toBe('001');
      });

      it('codes TA', () => {
        let features = coder.featuresContaining('TA');
        expect(features.length).toBe(8);
        expect(features[0].properties.iso1A2).toBe('TA');
        expect(features[1].properties.iso1A2).toBe('SH');
        expect(features[2].properties.wikidata).toBe('Q46395');
        expect(features[3].properties.iso1A2).toBe('GB');
        expect(features[4].properties.m49).toBe('011');
        expect(features[5].properties.m49).toBe('202');
        expect(features[6].properties.m49).toBe('002');
        expect(features[7].properties.m49).toBe('001');
      });

      it('codes XK', () => {
        let features = coder.featuresContaining('XK');
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('XK');
        expect(features[1].properties.m49).toBe('039');
        expect(features[2].properties.m49).toBe('150');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes UZ', () => {
        let features = coder.featuresContaining('UZ');
        expect(features.length).toBe(4);
        expect(features[0].properties.iso1A2).toBe('UZ');
        expect(features[1].properties.m49).toBe('143');
        expect(features[2].properties.m49).toBe('142');
        expect(features[3].properties.m49).toBe('001');
      });

      it('codes AQ', () => {
        let features = coder.featuresContaining('AQ');
        expect(features.length).toBe(2);
        expect(features[0].properties.iso1A2).toBe('AQ');
        expect(features[1].properties.m49).toBe('001');
      });
    });
  });

  describe('featuresIn', () => {
    it('codes CN', () => {
      let features = coder.featuresIn('CN');
      expect(features.length).toBe(4);
      expect(features[0].properties.iso1A2).toBe('CN');
      expect(features[1].properties.wikidata).toBe('Q19188');
      expect(features[2].properties.iso1A2).toBe('HK');
      expect(features[3].properties.iso1A2).toBe('MO');
    });

    it('codes CN, strict', () => {
      let features = coder.featuresIn('CN', true);
      expect(features.length).toBe(3);
      expect(features[0].properties.wikidata).toBe('Q19188');
      expect(features[1].properties.iso1A2).toBe('HK');
      expect(features[2].properties.iso1A2).toBe('MO');
    });

    it('codes 830', () => {
      let features = coder.featuresIn(830);
      expect(features.length).toBe(4);
      expect(features[0].properties.m49).toBe('830');
      expect(features[1].properties.m49).toBe('680');
      expect(features[2].properties.iso1A2).toBe('GG');
      expect(features[3].properties.iso1A2).toBe('JE');
    });

    it('codes 830, strict', () => {
      let features = coder.featuresIn(830, true);
      expect(features.length).toBe(3);
      expect(features[0].properties.m49).toBe('680');
      expect(features[1].properties.iso1A2).toBe('GG');
      expect(features[2].properties.iso1A2).toBe('JE');
    });

    it('codes 🇸🇭 (Saint Helena)', () => {
      let features = coder.featuresIn('🇸🇭');
      expect(features.length).toBe(4);
      expect(features[0].properties.iso1A2).toBe('SH');
      expect(features[1].properties.wikidata).toBe('Q34497');
      expect(features[2].properties.iso1A2).toBe('AC');
      expect(features[3].properties.iso1A2).toBe('TA');
    });

    it('codes 🇸🇭 (Saint Helena), strict', () => {
      let features = coder.featuresIn('🇸🇭', true);
      expect(features.length).toBe(3);
      expect(features[0].properties.wikidata).toBe('Q34497');
      expect(features[1].properties.iso1A2).toBe('AC');
      expect(features[2].properties.iso1A2).toBe('TA');
    });

    it('codes AQ', () => {
      let features = coder.featuresIn('AQ');
      expect(features.length).toBe(1);
      expect(features[0].properties.iso1A2).toBe('AQ');
    });

    it('codes AQ, strict', () => {
      expect(coder.featuresIn('AQ', true)).toStrictEqual([]);
    });

    it('does not code ABC', () => {
      expect(coder.featuresIn('ABC')).toStrictEqual([]);
    });
  });

  describe('aggregateFeature', () => {
    it('returns aggregate for feature with geometry: SH', () => {
      expect(coder.aggregateFeature('SH').geometry.coordinates.length).toBe(3);
    });
    it('returns aggregate for feature without geometry: EU', () => {
      expect(coder.aggregateFeature('EU').geometry.coordinates.length).toBe(45);
    });
    it('returns null for invalid ID: ABC', () => {
      expect(coder.aggregateFeature('ABC')).toBeNull();
    });
  });
  describe('isIn', () => {
    describe('by location', () => {
      it('returns true: US location in US', () => {
        expect(coder.isIn([-74, 40.6], 'US')).toBe(true);
      });
      it('returns false: US location in CH', () => {
        expect(coder.isIn([-74, 40.6], 'CH')).toBe(false);
      });
      it('returns true: US location in 19 (Americas)', () => {
        expect(coder.isIn([-74, 40.6], 19)).toBe(true);
      });
      it('returns true: US location in "021" (Northern America)', () => {
        expect(coder.isIn([-74, 40.6], '021')).toBe(true);
      });
      it('returns true: US location in Q2 (World)', () => {
        expect(coder.isIn([-74, 40.6], 'Q2')).toBe(true);
      });
      it('returns false: US location in Q15 (Africa)', () => {
        expect(coder.isIn([-74, 40.6], 'Q15')).toBe(false);
      });
    });

    describe('by code', () => {
      it('returns true: US in US', () => {
        expect(coder.isIn('US', 'US')).toBe(true);
      });
      it('returns false: US in CH', () => {
        expect(coder.isIn('US', 'CH')).toBe(false);
      });
      it('returns true: USA in 19 (Americas)', () => {
        expect(coder.isIn('USA', 19)).toBe(true);
      });
      it('returns true: US in "021" (Northern America)', () => {
        expect(coder.isIn('US', '021')).toBe(true);
      });
      it('returns false: US location in Q15 (Africa)', () => {
        expect(coder.isIn('US', 'Q15')).toBe(false);
      });
      it('returns true: PR in US', () => {
        expect(coder.isIn('PR', 'US')).toBe(true);
      });
      it('returns false: US in PR', () => {
        expect(coder.isIn('US', 'PR')).toBe(false);
      });
      it('returns true: TA in SH', () => {
        expect(coder.isIn('TA', 'SH')).toBe(true);
      });
      it('returns true: TA in GB', () => {
        expect(coder.isIn('TA', 'GB')).toBe(true);
      });
      it('returns false: TA in EU', () => {
        expect(coder.isIn('TA', 'EU')).toBe(false);
      });
      it('returns true: MP in "Q153732"', () => {
        expect(coder.isIn('MP', 'Q153732')).toBe(true);
      });
      it('returns true: "Navassa Island" in "UM"', () => {
        expect(coder.isIn('Navassa Island', 'UM')).toBe(true);
      });
      it('returns true: "Navassa Island" in "029" (Caribbean)', () => {
        expect(coder.isIn('Navassa Island', '029')).toBe(true);
      });
      it('returns false: "UM" in "029"', () => {
        expect(coder.isIn('UM', '029')).toBe(false);
      });
      it('returns true: "Midway Atoll" in "UM"', () => {
        expect(coder.isIn('Midway Atoll', 'UM')).toBe(true);
      });
      it('returns true: "Midway Atoll" in "US"', () => {
        expect(coder.isIn('Midway Atoll', 'US')).toBe(true);
      });
      it('returns false: "Midway Atoll" in "Hawaii"', () => {
        expect(coder.isIn('Midway Atoll', 'Hawaii')).toBe(false);
      });
      it('returns true: GU in "Q153732" (Mariana Islands)', () => {
        expect(coder.isIn('GU', 'Q153732')).toBe(true);
      });
      it('returns true: "GU" in US', () => {
        expect(coder.isIn('GU', 'US')).toBe(true);
      });
      it('returns true: "Q153732" in US', () => {
        expect(coder.isIn('Q153732', 'US')).toBe(true);
      });
      it('returns true: "Alaska" in "US"', () => {
        expect(coder.isIn('Alaska', 'US')).toBe(true);
      });
      it('returns true: "Hawaii" in "US"', () => {
        expect(coder.isIn('Hawaii', 'US')).toBe(true);
      });
      it('returns true: "CONUS" in "US"', () => {
        expect(coder.isIn('CONUS', 'US')).toBe(true);
      });
      it('returns false: "US" in "CONUS"', () => {
        expect(coder.isIn('US', 'CONUS')).toBe(false);
      });
      it('returns false: "Q153732" in "019" (Mariana Islands in Americas)', () => {
        expect(coder.isIn('Q153732', '019')).toBe(false);
      });
      it('returns false: "Hawaii" in "019"', () => {
        expect(coder.isIn('Hawaii', '019')).toBe(false);
      });
      it('returns true: "Alaska" in "019"', () => {
        expect(coder.isIn('Alaska', '019')).toBe(true);
      });
      it('returns true: "CONUS" in "019"', () => {
        expect(coder.isIn('CONUS', '019')).toBe(true);
      });
      it('returns true: "US" in "019" (United States in Americas)', () => {
        expect(coder.isIn('US', '019')).toBe(true);
      });
      it('returns true: "021" in "019" (Northern America in Americas)', () => {
        expect(coder.isIn('021', '019')).toBe(true);
      });
      it('returns true: "XK" in "europe"', () => {
        expect(coder.isIn('XK', 'europe')).toBe(true);
      });
      it('returns true: "TW" in "Asia"', () => {
        expect(coder.isIn('TW', 'Asia')).toBe(true);
      });
      it('returns true: 🇵🇷 in 🇺🇸', () => {
        expect(coder.isIn('🇵🇷', '🇺🇸')).toBe(true);
      });
      it('returns true: "Bir Tawil" in "015"', () => {
        expect(coder.isIn('Bir Tawil', '015')).toBe(true);
      });
      it('returns false: "Bir Tawil" in "Sudan"', () => {
        expect(coder.isIn('Bir Tawil', 'Sudan')).toBe(false);
      });
      it('returns false: "Bir Tawil" in "Egypt"', () => {
        expect(coder.isIn('Bir Tawil', 'Egypt')).toBe(false);
      });
      it('returns true: "Subsaharan africa" in "AFRICA"', () => {
        expect(coder.isIn('Subsaharan africa', 'AFRICA')).toBe(true);
      });
      it('returns true: "Africa" in "World"', () => {
        expect(coder.isIn('Africa', 'World')).toBe(true);
      });
    });
  });

  describe('isInEuropeanUnion', () => {
    describe('by location', () => {
      it('returns false for location in officially-assigned country, outside EU: New York, United States', () => {
        expect(coder.isInEuropeanUnion([-74, 40.6])).toBe(false);
      });

      it('returns false for location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland', () => {
        expect(coder.isInEuropeanUnion([6.1, 46.2])).toBe(false);
      });

      it('returns true for location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark', () => {
        expect(coder.isInEuropeanUnion([12.59, 55.68])).toBe(true);
      });

      it('returns true for location in officially-assigned country, in EU, in Eurozone: Berlin, Germany', () => {
        expect(coder.isInEuropeanUnion([13.4, 52.5])).toBe(true);
      });

      it('returns false for location in officially-assigned subfeature, oustide EU, of officially-assigned country, in EU: Isle of Man, United Kingdom ', () => {
        expect(coder.isInEuropeanUnion([-4.5, 54.2])).toBe(false);
      });

      it('returns true for location in exceptionally-reserved subfeature, in EU: Paris, Metropolitan France', () => {
        expect(coder.isInEuropeanUnion([2.35, 48.85])).toBe(true);
      });

      it('returns false for location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK', () => {
        expect(coder.isInEuropeanUnion([-12.3, -37.1])).toBe(false);
      });

      it('returns false for location in user-assigned, de facto country, in Europe, outside EU: Kosovo', () => {
        expect(coder.isInEuropeanUnion([21, 42.6])).toBe(false);
      });
      it('returns true for GeoJSON point feature in Germany', () => {
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
        let pointGeometry = {
          type: 'Point',
          coordinates: [13.4, 52.5]
        };
        expect(coder.isInEuropeanUnion(pointGeometry)).toBe(true);
      });
    });
    describe('by code', () => {
      it('returns true for European Union itself: EU', () => {
        expect(coder.isInEuropeanUnion('EU')).toBe(true);
      });

      it('returns false for officially-assigned country, outside EU: US', () => {
        expect(coder.isInEuropeanUnion('US')).toBe(false);
      });

      it('returns false for officially-assigned country, outside but surrounded by EU: CH', () => {
        expect(coder.isInEuropeanUnion('CH')).toBe(false);
      });

      it('returns true for officially-assigned country, in EU: DE', () => {
        expect(coder.isInEuropeanUnion('DE')).toBe(true);
      });

      it('returns false for officially-assigned subfeature, oustide EU, of officially-assigned country, in EU: IM', () => {
        expect(coder.isInEuropeanUnion('IM')).toBe(false);
      });

      it('returns true for exceptionally-reserved subfeature, in EU: FX', () => {
        expect(coder.isInEuropeanUnion('FX')).toBe(true);
      });

      it('returns false for exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: TA', () => {
        expect(coder.isInEuropeanUnion('TA')).toBe(false);
      });

      it('returns false for user-assigned, de facto country, in Europe, outside EU: XK', () => {
        expect(coder.isInEuropeanUnion('XK')).toBe(false);
      });

      it('returns false for M49 super-region code: 150', () => {
        expect(coder.isInEuropeanUnion('150')).toBe(false);
      });

      it('returns false for "world"', () => {
        expect(coder.isInEuropeanUnion('world')).toBe(false);
      });

      it('returns false for unassigned alpha-2 code: AB', () => {
        expect(coder.isInEuropeanUnion('AB')).toBe(false);
      });

      it('returns false for empty string', () => {
        expect(coder.isInEuropeanUnion('')).toBe(false);
      });
    });
  });

  describe('driveSide', () => {
    it('finds feature using right by location', () => {
      expect(coder.driveSide([-74, 40.6])).toBe('right');
    });

    it('finds feature using left by location', () => {
      expect(coder.driveSide([-4.5, 54.2])).toBe('left');
    });

    it('finds feature using right by code', () => {
      expect(coder.driveSide('DE')).toBe('right');
      expect(coder.driveSide('CA')).toBe('right');
      expect(coder.driveSide('IO')).toBe('right');
      expect(coder.driveSide('PR')).toBe('right');
      expect(coder.driveSide('GI')).toBe('right');
      expect(coder.driveSide('Midway Atoll')).toBe('right');
      expect(coder.driveSide('Hawaii')).toBe('right');
      expect(coder.driveSide('CONUS')).toBe('right');
      expect(coder.driveSide('US')).toBe('right');
    });

    it('finds feature using left by code', () => {
      expect(coder.driveSide('VI')).toBe('left');
      expect(coder.driveSide('GB')).toBe('left');
      expect(coder.driveSide('GB-SCT')).toBe('left');
      expect(coder.driveSide('IM')).toBe('left');
      expect(coder.driveSide('IE')).toBe('left');
      expect(coder.driveSide('IN')).toBe('left');
      expect(coder.driveSide('AU')).toBe('left');
      expect(coder.driveSide('HMD')).toBe('left');
      expect(coder.driveSide('JP')).toBe('left');
      expect(coder.driveSide('ZA')).toBe('left');
    });

    it('finds null for EU', () => {
      expect(coder.driveSide('EU')).toBeNull();
    });

    it('finds null for 001', () => {
      expect(coder.driveSide('001')).toBeNull();
    });

    it('finds null for North Pole', () => {
      expect(coder.driveSide([0, 90])).toBeNull();
    });
  });

  describe('roadSpeedUnit', () => {
    it('finds feature using km/h by location', () => {
      expect(coder.roadSpeedUnit([2.35, 48.85])).toBe('km/h');
    });

    it('finds feature using mph by location', () => {
      expect(coder.roadSpeedUnit([-74, 40.6])).toBe('mph');
    });

    it('finds feature using km/h by code', () => {
      expect(coder.roadSpeedUnit('IO')).toBe('km/h');
      expect(coder.roadSpeedUnit('IE')).toBe('km/h');
      expect(coder.roadSpeedUnit('AU')).toBe('km/h');
      expect(coder.roadSpeedUnit('TK')).toBe('km/h');
      expect(coder.roadSpeedUnit('GI')).toBe('km/h');
    });

    it('finds feature using mph by code', () => {
      expect(coder.roadSpeedUnit('US')).toBe('mph');
      expect(coder.roadSpeedUnit('US-AK')).toBe('mph');
      expect(coder.roadSpeedUnit('Midway Atoll')).toBe('mph');
      expect(coder.roadSpeedUnit('VI')).toBe('mph');
      expect(coder.roadSpeedUnit('VG')).toBe('mph');
      expect(coder.roadSpeedUnit('UK')).toBe('mph');
      expect(coder.roadSpeedUnit('IM')).toBe('mph');
      expect(coder.roadSpeedUnit('GB-ENG')).toBe('mph');
    });

    it('finds null for EU', () => {
      expect(coder.roadSpeedUnit('EU')).toBeNull();
    });

    it('finds null for 001', () => {
      expect(coder.roadSpeedUnit('001')).toBeNull();
    });

    it('finds null for North Pole', () => {
      expect(coder.roadSpeedUnit([0, 90])).toBeNull();
    });
  });

  describe('callingCodes', () => {
    it('finds one prefix for feature with one', () => {
      expect(coder.callingCodes([2.35, 48.85])).toStrictEqual(['33']);
      expect(coder.callingCodes('ES')).toStrictEqual(['34']);
      expect(coder.callingCodes('ES-CE')).toStrictEqual(['34']);
    });

    it('finds multiple prefixes for feature with multiple', () => {
      expect(coder.callingCodes('PR')).toStrictEqual(['1 787', '1 939']);
    });

    it('finds none for feature without data', () => {
      expect(coder.callingCodes('EU')).toStrictEqual([]);
    });

    it('finds none for North Pole', () => {
      expect(coder.callingCodes([0, 90])).toStrictEqual([]);
    });
  });
});
