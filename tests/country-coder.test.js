import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import * as coder from '../dist/country-coder.mjs';


describe('country-coder', () => {
  describe('borders', () => {
    it('exports borders as a FeatureCollection', () => {
      const borders = coder.borders;
      assert.ok(borders instanceof Object);
      assert.equal(borders.type, 'FeatureCollection');
      assert.ok(borders.features instanceof Array);
    });

    describe('properties', () => {
      it('all identifying values are unique', () => {
        const seen = new Set();
        const identifierProps = [
          'iso1A2',
          'iso1A3',
          'm49',
          'wikidata',
          'emojiFlag',
          'ccTLD',
          'nameEn'
        ];
        for (let i in coder.borders.features) {
          let identifiers = identifierProps
            .map(function (prop) {
              return coder.borders.features[i].properties[prop];
            })
            .concat(coder.borders.features[i].properties.aliases || [])
            .filter(Boolean);
          for (let j in identifiers) {
            const id = identifiers[j];
            assert.ok(id);
            assert.ok(!seen.has(id));
            seen.add(id);
          }
        }
      });

      it('each feature has either member features or geometry but not both', () => {
        for (let i in coder.borders.features) {
          const feature = coder.borders.features[i];
          const hasMembers = feature.properties.members && feature.properties.members.length;
          assert.ok(hasMembers || feature.geometry);
          assert.ok(!(hasMembers && feature.geometry));
        }
      });
    });

    describe('id', () => {
      it('assigns unique id to every feature', () => {
        const seen = new Set();
        for (let i in coder.borders.features) {
          const id = coder.borders.features[i].properties.id;
          assert.ok(id);
          assert.ok(!seen.has(id));
          seen.add(id);
        }
      });
    });

    describe('level', () => {
      it('assigns appropriate level values', () => {
        assert.equal(coder.feature('AC')?.properties.level, 'subterritory');
        assert.equal(coder.feature('SH-HL')?.properties.level, 'subterritory');
        assert.equal(coder.feature('DG')?.properties.level, 'subterritory');
        assert.equal(coder.feature('CP')?.properties.level, 'subterritory');
        assert.equal(coder.feature('Alderney')?.properties.level, 'subterritory');
        assert.equal(coder.feature('Akrotiri')?.properties.level, 'subterritory');
        assert.equal(coder.feature('FX')?.properties.level, 'subterritory');
        assert.equal(coder.feature('IC')?.properties.level, 'subterritory');

        assert.equal(coder.feature('SBA')?.properties.level, 'territory');
        assert.equal(coder.feature('EA')?.properties.level, 'territory');
        assert.equal(coder.feature('IM')?.properties.level, 'territory');
        assert.equal(coder.feature('SH')?.properties.level, 'territory');
        assert.equal(coder.feature('IO')?.properties.level, 'territory');
        assert.equal(coder.feature('PR')?.properties.level, 'territory');
        assert.equal(coder.feature('GU')?.properties.level, 'territory');
        assert.equal(coder.feature('GB-SCT')?.properties.level, 'territory');
        assert.equal(coder.feature('Bir Tawil')?.properties.level, 'territory');
        assert.equal(coder.feature('East Malaysia')?.properties.level, 'territory');
        assert.equal(coder.feature('Cook Islands')?.properties.level, 'territory');
        assert.equal(coder.feature('Niue')?.properties.level, 'territory');

        assert.equal(coder.feature('US')?.properties.level, 'country');
        assert.equal(coder.feature('CA')?.properties.level, 'country');
        assert.equal(coder.feature('GB')?.properties.level, 'country');
        assert.equal(coder.feature('NZ')?.properties.level, 'country');
        assert.equal(coder.feature('IL')?.properties.level, 'country');
        assert.equal(coder.feature('PS')?.properties.level, 'country');
        assert.equal(coder.feature('XK')?.properties.level, 'country');

        assert.equal(coder.feature('BOTS')?.properties.level, 'subcountryGroup');

        assert.equal(coder.feature('OMR')?.properties.level, 'subunion');
        assert.equal(coder.feature('OCT')?.properties.level, 'subunion');

        assert.equal(coder.feature('EU')?.properties.level, 'union');

        assert.equal(coder.feature('UN')?.properties.level, 'unitedNations');

        assert.equal(coder.feature('001')?.properties.level, 'world');
      });

      it('each feature may have only one group per level (except North America)', () => {
        for (let i in coder.borders.features) {
          let feature = coder.borders.features[i];
          let groups = feature.properties.groups;
          if (groups) {
            groups = groups.slice().filter(function (group) {
              // North America and Northern America are overlapping subregions
              // defined by the UN, but ignore that here
              return group !== '003';
            });
            let levels = groups.map(function (group) {
              return coder.feature(group)?.properties.level;
            });
            levels.push(feature.properties.level);
            assert.equal(levels.length, [...new Set(levels)].length);
          }
        }
      });
    });
  });

  describe('feature', () => {
    it('does not find feature for empty string', () => {
      assert.equal(coder.feature(''), null);
    });

    it('does not find feature for garbage string', () => {
      assert.equal(coder.feature('fv    239uasˇÁ¨·´€Óı¨ıÎ∆πˆç´œª -aÔ˚øØTˇ°\\asdf \nK'), null);
    });

    describe('by ISO 3166-1 alpha-2', () => {
      it('finds feature by uppercase code: US', () => {
        assert.equal(coder.feature('US')?.properties.iso1N3, '840');
      });

      it('finds feature by lowercase code: us', () => {
        assert.equal(coder.feature('us')?.properties.iso1N3, '840');
      });

      it('finds feature by mixed-case code: Us', () => {
        assert.equal(coder.feature('Us')?.properties.iso1N3, '840');
      });

      it('does not find feature for unassigned code in range: AB', () => {
        assert.equal(coder.feature('AB'), null);
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds features by uppercase codes', () => {
        assert.equal(coder.feature('AND')?.properties.iso1A2, 'AD');
        assert.equal(coder.feature('BES')?.properties.iso1A2, 'BQ');
        assert.equal(coder.feature('ETH')?.properties.iso1A2, 'ET');
        assert.equal(coder.feature('SGS')?.properties.iso1A2, 'GS');
        assert.equal(coder.feature('SRB')?.properties.iso1A2, 'RS');
        assert.equal(coder.feature('USA')?.properties.iso1A2, 'US');
      });

      it('finds features by lowercase codes', () => {
        assert.equal(coder.feature('and')?.properties.iso1A2, 'AD');
        assert.equal(coder.feature('bes')?.properties.iso1A2, 'BQ');
        assert.equal(coder.feature('eth')?.properties.iso1A2, 'ET');
        assert.equal(coder.feature('sgs')?.properties.iso1A2, 'GS');
        assert.equal(coder.feature('srb')?.properties.iso1A2, 'RS');
        assert.equal(coder.feature('usa')?.properties.iso1A2, 'US');
      });

      it('finds features by mixed-case codes', () => {
        assert.equal(coder.feature('And')?.properties.iso1A2, 'AD');
        assert.equal(coder.feature('Bes')?.properties.iso1A2, 'BQ');
        assert.equal(coder.feature('Eth')?.properties.iso1A2, 'ET');
        assert.equal(coder.feature('Sgs')?.properties.iso1A2, 'GS');
        assert.equal(coder.feature('Srb')?.properties.iso1A2, 'RS');
        assert.equal(coder.feature('Usa')?.properties.iso1A2, 'US');
      });

      it('does not find features for unassigned codes in range', () => {
        assert.equal(coder.feature('ABC'), null);
        assert.equal(coder.feature('Abc'), null);
        assert.equal(coder.feature('abc'), null);
      });
    });

    describe('by ISO 3166-1 numeric-3 / M49', () => {
      it('finds feature by string: "840"', () => {
        assert.equal(coder.feature('840')?.properties.iso1A2, 'US');
      });

      it('finds feature by three-digit number: 840', () => {
        assert.equal(coder.feature(840)?.properties.iso1A2, 'US');
      });

      it('finds feature by two-digit number: 61', () => {
        assert.equal(coder.feature(61)?.properties.wikidata, 'Q35942');
      });

      it('finds feature by one-digit number: 2', () => {
        assert.equal(coder.feature(2)?.properties.wikidata, 'Q15');
      });

      it('finds feature by number with extra precision: 840.000', () => {
        assert.equal(coder.feature(840.0)?.properties.iso1A2, 'US');
      });

      it('finds world feature: "001"', () => {
        assert.equal(coder.feature('001')?.properties.wikidata, 'Q2');
      });

      it('does not find feature for unassigned code in range: "123"', () => {
        assert.equal(coder.feature('123'), null);
      });

      it('does not find feature for number outside range: 1234', () => {
        assert.equal(coder.feature(1234), null);
      });
    });

    describe('by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        assert.equal(coder.feature('🇺🇸')?.properties.iso1N3, '840');
      });

      it('does not find feature for unassigned emoji flag sequence: 🇦🇧', () => {
        assert.equal(coder.feature('🇦🇧'), null);
      });
    });

    describe('by ccTLD', () => {
      it('finds feature by uppercase code: .US', () => {
        assert.equal(coder.feature('.US')?.properties.iso1N3, '840');
      });

      it('finds feature by lowercase code: .us', () => {
        assert.equal(coder.feature('.us')?.properties.iso1N3, '840');
      });

      it('finds feature by mixed-case code: .Us', () => {
        assert.equal(coder.feature('.Us')?.properties.iso1N3, '840');
      });

      it('does not find feature for unassigned code in range: .AB', () => {
        assert.equal(coder.feature('.AB'), null);
      });

      it('finds United Kingdom feature by code: .uk', () => {
        assert.equal(coder.feature('.uk')?.properties.iso1N3, '826');
      });

      it('does not find United Kingdom feature by code: .gb', () => {
        assert.equal(coder.feature('.gb'), null);
      });
    });

    describe('by Wikidata QID', () => {
      it('finds feature by uppercase QID: Q30', () => {
        assert.equal(coder.feature('Q30')?.properties.iso1A2, 'US');
      });

      it('finds feature by lowercase QID: q30', () => {
        assert.equal(coder.feature('q30')?.properties.iso1A2, 'US');
      });

      it('finds feature with no ISO or M49 codes by QID: Q153732', () => {
        assert.equal(coder.feature('Q153732')?.properties.nameEn, 'Mariana Islands');
      });

      it('does not find feature for non-feature QID: Q123456', () => {
        assert.equal(coder.feature('Q123456'), null);
      });
    });

    describe('by English name', () => {
      it('finds feature for exact name: Bhutan', () => {
        assert.equal(coder.feature('Bhutan')?.properties.iso1A2, 'BT');
      });
      it('finds feature for exact name containing "And": Andorra', () => {
        assert.equal(coder.feature('Andorra')?.properties.iso1A2, 'AD');
      });
      it('finds feature for lowercase name containing "and": andorra', () => {
        assert.equal(coder.feature('andorra')?.properties.iso1A2, 'AD');
      });
      it('finds feature for name containing "the": Northern Europe', () => {
        assert.equal(coder.feature('Northern Europe')?.properties.m49, '154');
      });
      it('finds feature for name with extra "The": The United States of America', () => {
        assert.equal(coder.feature('The United States of America')?.properties.iso1A2, 'US');
      });
      it('finds feature for name without "The": Gambia', () => {
        assert.equal(coder.feature('Gambia')?.properties.iso1A2, 'GM');
      });
      it('finds feature not in country for name: Bir Tawil', () => {
        assert.equal(coder.feature('Bir Tawil')?.properties.wikidata, 'Q620634');
      });
    });

    describe('by alias', () => {
      it('finds by European Commission codes', () => {
        assert.equal(coder.feature('EL')?.properties.iso1N3, '300');
        assert.equal(coder.feature('el')?.properties.iso1N3, '300');
        assert.equal(coder.feature('UK')?.properties.iso1N3, '826');
      });

      it('finds by transitionally-reserved codes', () => {
        assert.equal(coder.feature('BU')?.properties.iso1N3, '104');
      });

      it('finds by indeterminately-reserved codes', () => {
        assert.equal(coder.feature('PI')?.properties.iso1N3, '608');
        assert.equal(coder.feature('RP')?.properties.iso1N3, '608');
      });

      it('finds by ISO 3166-2 codes', () => {
        assert.equal(coder.feature('UM-71')?.properties.nameEn, 'Midway Atoll');
        assert.equal(coder.feature('UM71')?.properties.nameEn, 'Midway Atoll');
        assert.equal(coder.feature('UM 71')?.properties.nameEn, 'Midway Atoll');
        assert.equal(coder.feature('US-AK')?.properties.nameEn, 'Alaska');
      });

      it('finds by deleted codes', () => {
        assert.equal(coder.feature('MI')?.properties.nameEn, 'Midway Atoll');
        assert.equal(coder.feature('MID')?.properties.nameEn, 'Midway Atoll');
        assert.equal(coder.feature('488')?.properties.nameEn, 'Midway Atoll');
      });

      it('finds by common abbreviations', () => {
        assert.equal(coder.feature('CONUS')?.properties.nameEn, 'Contiguous United States');
        assert.equal(coder.feature('SBA')?.properties.wikidata, 'Q37362');
        assert.equal(coder.feature('BOTS')?.properties.wikidata, 'Q46395');
        assert.equal(coder.feature('UKOTS')?.properties.wikidata, 'Q46395');
      });
    });

    describe('by location', () => {
      it('returns country feature by default', () => {
        assert.equal(coder.feature([12.59, 55.68])?.properties.iso1A2, 'DK');
        assert.equal(coder.feature([-74, 40.6])?.properties.iso1A2, 'US');
        assert.equal(coder.feature([-12.3, -37.1])?.properties.iso1A2, 'GB');
        assert.equal(coder.feature([153, -27.4])?.properties.iso1A2, 'AU');
      });
      it('returns country feature for country level', () => {
        assert.equal(coder.feature([12.59, 55.68], { level: 'country' })?.properties.iso1A2, 'DK');
        assert.equal(coder.feature([-74, 40.6], { level: 'country' })?.properties.iso1A2, 'US');
        assert.equal(coder.feature([-12.3, -37.1], { level: 'country' })?.properties.iso1A2, 'GB');
        assert.equal(coder.feature([153, -27.4], { level: 'country' })?.properties.iso1A2, 'AU');
      });
      it('returns next-higher-level feature for country level where no country exists (Bir Tawil)', () => {
        assert.equal(coder.feature([33.75, 21.87])?.properties.m49, '015');
        assert.equal(coder.feature([33.75, 21.87], { level: 'country' })?.properties.m49, '015');
      });
      it('returns null for country level where no country exists', () => {
        assert.equal(coder.feature([33.75, 21.87], { maxLevel: 'country' }), null);
        assert.equal(coder.feature([33.75, 21.87], { level: 'country', maxLevel: 'country' }), null);
      });

      it('returns subterritory feature for subterritory level', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'subterritory' })?.properties.iso1A2, 'TA');
      });
      it('returns country feature for subterritory level where no subterritory or territory exists', () => {
        assert.equal(coder.feature([-79.4, 43.7], { level: 'subterritory' })?.properties.iso1A2, 'CA');
      });

      it('returns territory feature for territory level', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'territory' })?.properties.iso1A2, 'SH');
        assert.equal(coder.feature([33.75, 21.87], { level: 'territory' })?.properties.wikidata, 'Q620634');
        assert.equal(coder.feature([33.75, 21.87], { level: 'territory' })?.properties.wikidata, 'Q620634');
      });
      it('returns country feature for territory level where no territory exists', () => {
        assert.equal(coder.feature([-79.4, 43.7], { level: 'territory' })?.properties.iso1A2, 'CA');
      });
      it('returns null for territory level where no territory exists', () => {
        assert.equal(coder.feature([-79.4, 43.7], { level: 'territory', maxLevel: 'territory' }) , null);
      });

      it('returns intermediateRegion feature for intermediateRegion level', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'intermediateRegion' })?.properties.m49, '011');
      });
      it('returns subregion feature for subregion level', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'subregion' })?.properties.m49, '202');
      });
      it('returns region feature for region level', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'region' })?.properties.m49, '002');
      });
      it('returns union feature for union level', () => {
        assert.equal(coder.feature([2.35, 48.85], { level: 'union' })?.properties.iso1A2, 'EU');
      });

      it('returns null for invalid level options', () => {
        assert.equal(coder.feature([-12.3, -37.1], { level: 'planet' }), null);
        assert.equal(coder.feature([-12.3, -37.1], { maxLevel: 'mars' }), null);
        assert.equal(coder.feature([-12.3, -37.1], { maxLevel: 'subterritory' }), null);
        assert.equal(coder.feature([-12.3, -37.1], { level: 'country', maxLevel: 'subterritory' }), null);
      });
      it('returns Antarctica for South Pole, country level', () => {
        assert.equal(coder.feature([0, -90])?.properties.iso1A2, 'AQ');
        assert.equal(coder.feature([0, -90], { level: 'country' })?.properties.iso1A2, 'AQ');
      });
      it('returns null for North Pole', () => {
        assert.equal(coder.feature([0, 90]), null);
        assert.equal(coder.feature([0, 90], { level: 'country' }), null);
        assert.equal(coder.feature([0, 90], { level: 'subterritory' }), null);
      });
    });
  });

  describe('iso1A2Code', () => {
    describe('by ISO 3166-1 alpha-2', () => {
      it('finds by ISO 3166-1 alpha-2 code: US', () => {
        assert.equal(coder.iso1A2Code('US'), 'US');
      });

      it('does not find for unassigned alpha-2 code: AB', () => {
        assert.equal(coder.iso1A2Code('AB'), null);
      });
    });

    describe('by ISO 3166-1 alpha-3', () => {
      it('finds by ISO 3166-1 alpha-3 code: USA', () => {
        assert.equal(coder.iso1A2Code('USA'), 'US');
      });

      it('does not find feature for unassigned alpha-3 code: ABC', () => {
        assert.equal(coder.iso1A2Code('ABC'), null);
      });
    });

    describe('by ISO 3166-1 numeric-3', () => {
      it('finds by ISO 3166-1 numeric-3 code: "840"', () => {
        assert.equal(coder.iso1A2Code('840'), 'US');
      });

      it('does not find for unassigned numeric-3 code: "123"', () => {
        assert.equal(coder.iso1A2Code('123'), null);
      });
    });

    describe('finds by emoji flag sequence', () => {
      it('finds feature for emoji flag sequence: 🇺🇸', () => {
        assert.equal(coder.iso1A2Code('🇺🇸'), 'US');
      });

      it('does not find for unassigned emoji flag sequence: 🇦🇧', () => {
        assert.equal(coder.iso1A2Code('🇦🇧'), null);
      });
    });

    describe('by ccTLD', () => {
      it('finds by ccTLD code: .us', () => {
        assert.equal(coder.iso1A2Code('.us'), 'US');
      });

      it('does not find for unassigned ccTLD code: .ab', () => {
        assert.equal(coder.iso1A2Code('.ab'), null);
      });

      it('finds United Kingdom by ccTLD code: .uk', () => {
        assert.equal(coder.iso1A2Code('.uk'), 'GB');
      });

      it('does not find United Kingdom by ccTLD code: .gb', () => {
        assert.equal(coder.iso1A2Code('.gb'), null);
      });

      it('finds Germany by ccTLD code: .de', () => {
        assert.equal(coder.iso1A2Code('.de'), 'DE');
      });
    });

    describe('by Wikidata QID', () => {
      it('finds by Wikidata QID: Q30', () => {
        assert.equal(coder.iso1A2Code('Q30'), 'US');
      });

      it('does not find for non-feature Wikidata QID code: Q123456', () => {
        assert.equal(coder.iso1A2Code('Q123456'), null);
      });
    });

    describe('by alias', () => {
      it('finds Greece by European Commission code: EL', () => {
        assert.equal(coder.iso1A2Code('EL'), 'GR');
      });

      it('finds United Kingdom by European Commission code: UK', () => {
        assert.equal(coder.iso1A2Code('UK'), 'GB');
      });

      it('finds Myanmar by transitionally-reserved code: BU', () => {
        assert.equal(coder.iso1A2Code('BU'), 'MM');
      });

      it('finds Philippines by indeterminately-reserved code 1: PI', () => {
        assert.equal(coder.iso1A2Code('PI'), 'PH');
      });

      it('finds Philippines by indeterminately-reserved code 2: RP', () => {
        assert.equal(coder.iso1A2Code('RP'), 'PH');
      });
    });
    describe('by M49', () => {
      it('does not find for feature with geography but no ISO code', () => {
        assert.equal(coder.iso1A2Code('061'), null);
      });
      it('does not find for feature with no geography and no ISO code', () => {
        assert.equal(coder.iso1A2Code('142'), null);
      });
    });
    describe('by location, country level', () => {
      it('codes location in officially-assigned country: Toronto, Canada as CA', () => {
        assert.equal(coder.iso1A2Code([-79.4, 43.7], { level: 'country' }), 'CA');
      });

      it('codes location in non-ISO territory of officially-assigned country: New York, United States as US', () => {
        assert.equal(coder.iso1A2Code([-74, 40.6], { level: 'country' }), 'US');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
        assert.equal(coder.iso1A2Code([6.1, 46.2], { level: 'country' }), 'CH');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
        assert.equal(coder.iso1A2Code([12.59, 55.68], { level: 'country' }), 'DK');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
        assert.equal(coder.iso1A2Code([13.4, 52.5], { level: 'country' }), 'DE');
      });

      it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as GB', () => {
        assert.equal(coder.iso1A2Code([-4.5, 54.2], { level: 'country' }), 'GB');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
        assert.equal(coder.iso1A2Code([2.35, 48.85], { level: 'country' }), 'FR');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as GB', () => {
        assert.equal(coder.iso1A2Code([-12.3, -37.1], { level: 'country' }), 'GB');
      });

      it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
        assert.equal(coder.iso1A2Code([21, 42.6], { level: 'country' }), 'XK');
      });

      it('codes location in Northern Cyprus as NULL', () => {  // #121
        assert.equal(coder.iso1A2Code([33.8, 35.3]), null);
        assert.equal(coder.iso1A2Code([33.8, 35.3], { level: 'country' }), null);
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
        assert.equal(coder.iso1A2Code([71.13, 39.96], { level: 'country' }), 'UZ');
      });

      it('codes location in feature without an ISO code: Sark as GB', () => {
        assert.equal(coder.iso1A2Code([-2.35, 49.43], { level: 'country' }), 'GB');
      });

      it('codes South Pole as AQ', () => {
        assert.equal(coder.iso1A2Code([0, -90], { level: 'country' }), 'AQ');
      });

      it('does not code North Pole', () => {
        assert.equal(coder.iso1A2Code([0, 90], { level: 'country' }), null);
      });

      it('does not code location in Bir Tawil', () => {
        assert.equal(coder.iso1A2Code([33.75, 21.87]), null);
        assert.equal(coder.iso1A2Code([33.75, 21.87], { level: 'country' }), null);
      });
    });
    describe('by location, territory level', () => {
      it('codes location in officially-assigned country: Toronto, Canada as CA', () => {
        assert.equal(coder.iso1A2Code([-79.4, 43.7], { level: 'territory' }), 'CA');
      });

      it('codes location in non-ISO territory of officially-assigned country: New York, United States as US', () => {
        assert.equal(coder.iso1A2Code([-74, 40.6], { level: 'territory' }), 'US');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland as CH', () => {
        assert.equal(coder.iso1A2Code([6.1, 46.2], { level: 'territory' }), 'CH');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark as DK', () => {
        assert.equal(coder.iso1A2Code([12.59, 55.68], { level: 'territory' }), 'DK');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany as DE', () => {
        assert.equal(coder.iso1A2Code([13.4, 52.5], { level: 'territory' }), 'DE');
      });

      it('codes location in officially-assigned subfeature of officially-assigned country: Isle of Man, United Kingdom as IM', () => {
        assert.equal(coder.iso1A2Code([-4.5, 54.2], { level: 'territory' }), 'IM');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country: Paris, Metropolitan France as FR', () => {
        assert.equal(coder.iso1A2Code([2.35, 48.85], { level: 'territory' }), 'FR');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature of officially-assigned country: Tristan da Cunha, SH, UK as SH', () => {
        assert.equal(coder.iso1A2Code([-12.3, -37.1], { level: 'territory' }), 'SH');
      });

      it('codes location in user-assigned, de facto country: Kosovo as XK', () => {
        assert.equal(coder.iso1A2Code([21, 42.6], { level: 'territory' }), 'XK');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan as UZ', () => {
        assert.equal(coder.iso1A2Code([71.13, 39.96], { level: 'territory' }), 'UZ');
      });

      it('codes location in feature without an ISO code: Sark as GG', () => {
        assert.equal(coder.iso1A2Code([-2.35, 49.43], { level: 'territory' }), 'GG');
      });

      it('codes South Pole as AQ', () => {
        assert.equal(coder.iso1A2Code([0, -90], { level: 'territory' }), 'AQ');
      });

      it('does not code North Pole', () => {
        assert.equal(coder.iso1A2Code([0, 90], { level: 'territory' }), null);
      });

      it('does not code location in Bir Tawil', () => {
        assert.equal(coder.iso1A2Code([33.75, 21.87], { level: 'territory' }), null);
      });
    });
    describe('by GeoJSON point feature, country level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
        const coords = [-74, 40.6];

        const pointFeature = {
          type: 'Feature',
          properties: null,
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        };
        assert.equal(coder.iso1A2Code(pointFeature), 'US');
      });
    });
    describe('by GeoJSON point geometry, country level', () => {
      it('codes location in officially-assigned country: New York, United States as US', () => {
        let pointGeometry = {
          type: 'Point',
          coordinates: [-74, 40.6]
        };
        assert.equal(coder.iso1A2Code(pointGeometry), 'US');
      });
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('iso1A3Code', () => {
    it('codes location in officially-assigned country: New York, United States as USA', () => {
      assert.equal(coder.iso1A3Code([-74, 40.6]), 'USA');
      assert.equal(coder.iso1A3Code([-74, 40.6], { level: 'country' }), 'USA');
    });

    it('codes location in user-assigned, de facto country: Kosovo as XKX', () => {
      assert.equal(coder.iso1A3Code([21, 42.6]), 'XKX');
      assert.equal(coder.iso1A3Code([21, 42.6], { level: 'country' }), 'XKX');
    });

    it('codes location in Northern Cyprus as NULL', () => {  // #121
      assert.equal(coder.iso1A3Code([33.8, 35.3]), null);
      assert.equal(coder.iso1A3Code([33.8, 35.3], { level: 'country' }), null);
    });

    it('does not code location of North Pole', () => {
      assert.equal(coder.iso1A3Code([0, 90]), null);
      assert.equal(coder.iso1A3Code([0, 90], { level: 'country' }), null);
    });

    it('does not code location in Bir Tawil', () => {
      assert.equal(coder.iso1A3Code([33.75, 21.87]), null);
      assert.equal(coder.iso1A3Code([33.75, 21.87], { level: 'country' }), null);
    });

    it('does not code feature without alpha-3 code by identifier', () => {
      assert.equal(coder.iso1A3Code('Bir Tawil'), null);
      assert.equal(coder.iso1A3Code('830'), null);
      assert.equal(coder.iso1A3Code('Northern America'), null);
      assert.equal(coder.iso1A3Code('Oceania'), null);
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('iso1N3Code', () => {
    it('codes location in officially-assigned country: New York, United States as 840', () => {
      assert.equal(coder.iso1N3Code([-74, 40.6], { level: 'country' }), '840');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      assert.equal(coder.iso1N3Code([21, 42.6], { level: 'country' }), null);
    });

    it('codes location in North Cyprus', () => {  // #121
      assert.equal(coder.iso1N3Code([33.8, 35.3]), null);
      assert.equal(coder.iso1N3Code([33.8, 35.3], { level: 'country' }), null);
    });

    it('does not code non-geography, non-ISO feature by Wikidata QID: Q48', () => {
      assert.equal(coder.iso1N3Code('Q48'), null);
    });

    it('does not code North Pole', () => {
      assert.equal(coder.iso1N3Code([0, 90], { level: 'country' }), null);
    });

    it('does not code location in Bir Tawil', () => {
      assert.equal(coder.iso1N3Code([33.75, 21.87], { level: 'country' }), null);
    });
  });

  describe('m49Code', () => {
    it('codes location in officially-assigned country: New York, United States as 840', () => {
      assert.equal(coder.m49Code([-74, 40.6], { level: 'country' }), '840');
    });

    it('codes non-geography, non-ISO feature by Wikidata QID: Q48 as 142', () => {
      assert.equal(coder.m49Code('Q48'), '142');
    });

    it('does not have code for location in user-assigned, de facto country: Kosovo', () => {
      assert.equal(coder.m49Code([21, 42.6], { maxLevel: 'country' }), null);
      assert.equal(coder.m49Code([21, 42.6], { level: 'country', maxLevel: 'country' }), null);
    });

    it('codes location in Northern Cyprus as 145 (West Asia)', () => {  // #121
      assert.equal(coder.m49Code([33.8, 35.3]), '145');
      assert.equal(coder.m49Code([33.8, 35.3], { level: 'country' }), '145');
    });

    it('does not code location of North Pole', () => {
      assert.equal(coder.m49Code([0, 90], { level: 'country' }), null);
    });

    it('does not code "Bir Tawil"', () => {
      assert.equal(coder.m49Code('Bir Tawil'), null);
    });
    it('codes location in Bir Tawil as 015', () => {
      assert.equal(coder.m49Code([33.75, 21.87]), '015');
      assert.equal(coder.m49Code([33.75, 21.87], { level: 'country' }), '015');
    });

    it('does not code location in Bir Tawil, maxLevel=country', () => {
      assert.equal(coder.m49Code([33.75, 21.87], { maxLevel: 'country' }), null);
      assert.equal(coder.m49Code([33.75, 21.87], { level: 'country', maxLevel: 'country' }), null);
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('wikidataQID', () => {
    it('codes location in officially-assigned country: New York, United States as Q30', () => {
      assert.equal(coder.wikidataQID([-74, 40.6], { level: 'country' }), 'Q30');
    });

    it('codes location in user-assigned, de facto country: Kosovo as Q1246', () => {
      assert.equal(coder.wikidataQID([21, 42.6], { level: 'country' }), 'Q1246');
    });

    it('does not code North Pole', () => {
      assert.equal(coder.wikidataQID([0, 90], { level: 'country' }), null);
    });

    it('codes Bir Tawil', () => {
      assert.equal(coder.wikidataQID('Bir Tawil'), 'Q620634');
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('emojiFlag', () => {
    it('codes location in officially-assigned country: New York, United States as 🇺🇸', () => {
      assert.equal(coder.emojiFlag([-74, 40.6], { level: 'country' }), '🇺🇸');
    });

    it('codes location in user-assigned, de facto country: Kosovo as 🇽🇰', () => {
      assert.equal(coder.emojiFlag([21, 42.6], { level: 'country' }), '🇽🇰');
    });

    it('does not find for M49 code with no corresponding ISO code', () => {
      assert.equal(coder.emojiFlag('150'), null);
    });

    it('does not code North Pole', () => {
      assert.equal(coder.emojiFlag([0, 90], { level: 'country' }), null);
    });
  });

  // this doesn't need extensive tests since it's just a fetcher using `feature`
  describe('ccTLD', () => {
    it('returns ccTLD in officially-assigned country: New York, United States as .us', () => {
      assert.equal(coder.ccTLD([-74, 40.6], { level: 'country' }), '.us');
    });

    it('returns ccTLD in officially-assigned country: London, United Kingdom as .uk', () => {
      assert.equal(coder.ccTLD([0, 51.5], { level: 'country' }), '.uk'); // not .gb
    });

    it('does not return a ccTLD for a region with no ccTLD', () => {
      assert.equal(coder.ccTLD('Bir Tawil'), null);
    });

    it('does not return a ccTLD for uncovered location North Pole', () => {
      assert.equal(coder.ccTLD([0, 90]), null);
    });
  });

  describe('iso1A2Codes', () => {
    it('codes locations', () => {
      assert.deepEqual(coder.iso1A2Codes([-4.5, 54.2]), ['IM', 'GB', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([-2.35, 49.43]), ['CQ', 'GG', 'GB', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([-12.3, -37.1]), ['TA', 'SH', 'GB', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([12.59, 55.68]), ['DK', 'EU', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([2.35, 48.85]), ['FX', 'FR', 'EU', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([-74, 40.6]), ['US', 'UN']);
      assert.deepEqual(coder.iso1A2Codes([21, 42.6]), ['XK']);
      assert.deepEqual(coder.iso1A2Codes([0, -90]), ['AQ']);
    });

    it('codes bounding boxes', () => {
      assert.deepEqual(coder.iso1A2Codes([-4.5, 54.2, -4.4, 54.3]), ['IM', 'GB', 'UN']);
      // area of US overlapping Canada's bounding box but not its polygon
      assert.deepEqual(coder.iso1A2Codes([-74, 40.6, -71.3, 44.7]), ['US', 'UN']);
      // area overlapping both US and Canada
      assert.deepEqual(coder.iso1A2Codes([-74, 40.6, -71.3, 45]), ['CA', 'UN', 'US']);
    });

    it('does not code invalid arguments', () => {
      assert.deepEqual(coder.iso1A2Codes([]), []);
      assert.deepEqual(coder.iso1A2Codes([-900, 900]), []);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.iso1A2Codes([0, 90]), []);
      assert.deepEqual(coder.iso1A2Codes([-0.1, 89.9, 0, 90]), []);
    });

    it('does not code location in Bir Tawil', () => {
      assert.deepEqual(coder.iso1A2Codes([33.75, 21.87]), []);
    });
  });

  describe('iso1A3Codes', () => {
    it('codes locations', () => {
      assert.deepEqual(coder.iso1A3Codes([-4.5, 54.2]), ['IMN', 'GBR']);
      assert.deepEqual(coder.iso1A3Codes([-2.35, 49.43]), ['CRQ', 'GGY', 'GBR']);
      assert.deepEqual(coder.iso1A3Codes([-12.3, -37.1]), ['TAA', 'SHN', 'GBR']);
      assert.deepEqual(coder.iso1A3Codes([12.59, 55.68]), ['DNK', 'EUE']);
      assert.deepEqual(coder.iso1A3Codes([2.35, 48.85]), ['FXX', 'FRA', 'EUE']);
      assert.deepEqual(coder.iso1A3Codes([-74, 40.6]), ['USA']);
      assert.deepEqual(coder.iso1A3Codes([21, 42.6]), ['XKX']);
      assert.deepEqual(coder.iso1A3Codes([0, -90]), ['ATA']);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.iso1A3Codes([0, 90]), []);
    });

    it('does not code location in Bir Tawil', () => {
      assert.deepEqual(coder.iso1A3Codes([33.75, 21.87]), []);
    });
  });

  describe('iso1N3Codes', () => {
    it('codes locations', () => {
      assert.deepEqual(coder.iso1N3Codes([-4.5, 54.2]), ['833', '826']);
      assert.deepEqual(coder.iso1N3Codes([-2.35, 49.43]), ['680', '831', '826']);
      assert.deepEqual(coder.iso1N3Codes([-2.53, 49.45]), ['831', '826']);
      assert.deepEqual(coder.iso1N3Codes([-12.3, -37.1]), ['654', '826']);
      assert.deepEqual(coder.iso1N3Codes([12.59, 55.68]), ['208']);
      assert.deepEqual(coder.iso1N3Codes([2.35, 48.85]), ['249', '250']);
      assert.deepEqual(coder.iso1N3Codes([-74, 40.6]), ['840']);
      assert.deepEqual(coder.iso1N3Codes([21, 42.6]), []);
      assert.deepEqual(coder.iso1N3Codes([0, -90]), ['010']);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.iso1N3Codes([0, 90]), []);
    });

    it('does not code location in Bir Tawil', () => {
      assert.deepEqual(coder.iso1N3Codes([33.75, 21.87]), []);
    });
  });

  describe('m49Codes', () => {
    it('codes locations', () => {
      // isle of man
      assert.deepEqual(coder.m49Codes([-4.5, 54.2]), ['833', '826', '154', '150', '001']);
      assert.deepEqual(coder.m49Codes([-2.35, 49.43]), [
        '680',
        '831',
        '826',
        '830',
        '154',
        '150',
        '001'
      ]);
      assert.deepEqual(coder.m49Codes([-12.3, -37.1]), [
        '654',
        '826',
        '011',
        '202',
        '002',
        '001'
      ]);
      assert.deepEqual(coder.m49Codes([12.59, 55.68]), ['208', '154', '150', '001']);
      assert.deepEqual(coder.m49Codes([2.35, 48.85]), ['249', '250', '155', '150', '001']);
      assert.deepEqual(coder.m49Codes([-74, 40.6]), ['840', '021', '003', '019', '001']);
      assert.deepEqual(coder.m49Codes([21, 42.6]), ['039', '150', '001']);
      assert.deepEqual(coder.m49Codes([0, -90]), ['010', '001']);
      assert.deepEqual(coder.m49Codes([33.75, 21.87]), ['015', '002', '001']);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.m49Codes([0, 90]), []);
    });
  });

  describe('wikidataQIDs', () => {
    it('codes locations', () => {
      // isle of man
      assert.deepEqual(coder.wikidataQIDs([-4.5, 54.2]), [
        'Q9676',
        'Q185086',
        'Q145',
        'Q27479',
        'Q46',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([-2.35, 49.43]), [
        'Q3405693',
        'Q25230',
        'Q185086',
        'Q145',
        'Q42314',
        'Q27479',
        'Q46',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([-12.3, -37.1]), [
        'Q220982',
        'Q192184',
        'Q46395',
        'Q145',
        'Q4412',
        'Q132959',
        'Q15',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([12.59, 55.68]), [
        'Q35',
        'Q756617',
        'Q27479',
        'Q46',
        'Q458',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([2.35, 48.85]), [
        'Q212429',
        'Q142',
        'Q27496',
        'Q46',
        'Q458',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([-74, 40.6]), [
        'Q578170',
        'Q35657',
        'Q30',
        'Q2017699',
        'Q49',
        'Q828',
        'Q1065',
        'Q2'
      ]);
      assert.deepEqual(coder.wikidataQIDs([21, 42.6]), ['Q1246', 'Q27449', 'Q46', 'Q2']);
      assert.deepEqual(coder.wikidataQIDs([0, -90]), ['Q51', 'Q2']);
      assert.deepEqual(coder.wikidataQIDs([33.75, 21.87]), ['Q620634', 'Q27381', 'Q15', 'Q2']);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.wikidataQIDs([0, 90]), []);
    });
  });

  describe('emojiFlags', () => {
    it('codes locations', () => {
      // isle of man
      assert.deepEqual(coder.emojiFlags([-4.5, 54.2]), ['🇮🇲', '🇬🇧', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([-2.35, 49.43]), ['🇨🇶', '🇬🇬', '🇬🇧', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([-12.3, -37.1]), ['🇹🇦', '🇸🇭', '🇬🇧', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([12.59, 55.68]), ['🇩🇰', '🇪🇺', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([2.35, 48.85]), ['🇫🇽', '🇫🇷', '🇪🇺', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([-74, 40.6]), ['🇺🇸', '🇺🇳']);
      assert.deepEqual(coder.emojiFlags([21, 42.6]), ['🇽🇰']);
      assert.deepEqual(coder.emojiFlags([0, -90]), ['🇦🇶']);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.emojiFlags([0, 90]), []);
    });

    it('does not code location in Bir Tawil', () => {
      assert.deepEqual(coder.emojiFlags([33.75, 21.87]), []);
    });
  });

  describe('ccTLDs', () => {
    it('codes locations', () => {
      assert.deepEqual(coder.ccTLDs([-4.5, 54.2]), ['.im', '.uk']); // not .gb
      assert.deepEqual(coder.ccTLDs([-2.35, 49.43]), ['.gg', '.uk']); // not .gb
      assert.deepEqual(coder.ccTLDs([-12.3, -37.1]), ['.ta', '.sh', '.uk']); // not .gb
      assert.deepEqual(coder.ccTLDs([12.59, 55.68]), ['.dk', '.eu']);
      assert.deepEqual(coder.ccTLDs([2.35, 48.85]), ['.fx', '.fr', '.eu']);
      assert.deepEqual(coder.ccTLDs([-74, 40.6]), ['.us']);
      assert.deepEqual(coder.ccTLDs([21, 42.6]), ['.xk']);
      assert.deepEqual(coder.ccTLDs([0, -90]), ['.aq']);
    });

    it('codes bounding boxes', () => {
      assert.deepEqual(coder.ccTLDs([-4.5, 54.2, -4.4, 54.3]), ['.im', '.uk']); // not .gb
      // area of US overlapping Canada's bounding box but not its polygon
      assert.deepEqual(coder.ccTLDs([-74, 40.6, -71.3, 44.7]), ['.us']);
      // area overlapping both US and Canada
      assert.deepEqual(coder.ccTLDs([-74, 40.6, -71.3, 45]), ['.ca', '.us']);
    });

    it('does not code invalid arguments', () => {
      assert.deepEqual(coder.ccTLDs([]), []);
      assert.deepEqual(coder.ccTLDs([-900, 900]), []);
    });

    it('does not code North Pole', () => {
      assert.deepEqual(coder.ccTLDs([0, 90]), []);
      assert.deepEqual(coder.ccTLDs([-0.1, 89.9, 0, 90]), []);
    });

    it('does not code location in Bir Tawil', () => {
      assert.deepEqual(coder.ccTLDs([33.75, 21.87]), []);
    });
  });

  describe('featuresContaining', () => {
    describe('by location', () => {
      it('codes location in officially-assigned country: New York, United States', () => {
        let features = coder.featuresContaining([-74, 40.6]);
        assert.equal(features.length, 8);
        assert.equal(features[0].properties.nameEn, 'Contiguous United States');
        assert.equal(features[1].properties.nameEn, 'US States');
        assert.equal(features[2].properties.iso1A2, 'US');
        assert.equal(features[3].properties.m49, '021');
        assert.equal(features[4].properties.m49, '003');
        assert.equal(features[5].properties.m49, '019');
        assert.equal(features[6].properties.iso1A2, 'UN');
        assert.equal(features[7].properties.m49, '001');
      });

      it('codes location in officially-assigned country: New York, United States, strict', () => {
        let features = coder.featuresContaining([-74, 40.6], true);
        assert.equal(features.length, 8);
        assert.equal(features[0].properties.nameEn, 'Contiguous United States');
        assert.equal(features[1].properties.nameEn, 'US States');
        assert.equal(features[2].properties.iso1A2, 'US');
        assert.equal(features[3].properties.m49, '021');
        assert.equal(features[4].properties.m49, '003');
        assert.equal(features[5].properties.m49, '019');
        assert.equal(features[6].properties.iso1A2, 'UN');
        assert.equal(features[7].properties.m49, '001');
      });

      it('codes location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland', () => {
        let features = coder.featuresContaining([6.1, 46.2]);
        assert.equal(features.length, 5);
        assert.equal(features[0].properties.iso1A2, 'CH');
        assert.equal(features[1].properties.m49, '155');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.iso1A2, 'UN');
        assert.equal(features[4].properties.m49, '001');
      });

      it('codes location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark', () => {
        let features = coder.featuresContaining([12.59, 55.68]);
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.wikidata, 'Q35');
        assert.equal(features[1].properties.iso1A2, 'DK');
        assert.equal(features[2].properties.m49, '154');
        assert.equal(features[3].properties.m49, '150');
        assert.equal(features[4].properties.iso1A2, 'EU');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes location in officially-assigned country, in EU, in Eurozone: Berlin, Germany', () => {
        let features = coder.featuresContaining([13.4, 52.5]);
        assert.equal(features.length, 6);
        assert.equal(features[0].properties.iso1A2, 'DE');
        assert.equal(features[1].properties.m49, '155');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.iso1A2, 'EU');
        assert.equal(features[4].properties.iso1A2, 'UN');
        assert.equal(features[5].properties.m49, '001');
      });

      it('codes location in officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Isle of Man, United Kingdom', () => {
        let features = coder.featuresContaining([-4.5, 54.2]);
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.iso1A2, 'IM');
        assert.equal(features[1].properties.wikidata, 'Q185086');
        assert.equal(features[2].properties.iso1A2, 'GB');
        assert.equal(features[3].properties.m49, '154');
        assert.equal(features[4].properties.m49, '150');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes location in England, United Kingdom', () => {
        let features = coder.featuresContaining([0, 51.5]);
        assert.equal(features.length, 8);
        assert.equal(features[0].properties.nameEn, 'England');
        assert.equal(features[1].properties.nameEn, 'Countries of the United Kingdom');
        assert.equal(features[2].properties.iso1A2, 'GB');
        assert.equal(features[3].properties.nameEn, 'Great Britain');
        assert.equal(features[4].properties.m49, '154');
        assert.equal(features[5].properties.m49, '150');
        assert.equal(features[6].properties.iso1A2, 'UN');
        assert.equal(features[7].properties.m49, '001');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned country, in EU, in Eurozone: Paris, Metropolitan France', () => {
        let features = coder.featuresContaining([2.35, 48.85]);
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.iso1A2, 'FX');
        assert.equal(features[1].properties.iso1A2, 'FR');
        assert.equal(features[2].properties.m49, '155');
        assert.equal(features[3].properties.m49, '150');
        assert.equal(features[4].properties.iso1A2, 'EU');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK', () => {
        let features = coder.featuresContaining([-12.3, -37.1]);
        assert.equal(features.length, 9);
        assert.equal(features[0].properties.iso1A2, 'TA');
        assert.equal(features[1].properties.iso1A2, 'SH');
        assert.equal(features[2].properties.wikidata, 'Q46395');
        assert.equal(features[3].properties.iso1A2, 'GB');
        assert.equal(features[4].properties.m49, '011');
        assert.equal(features[5].properties.m49, '202');
        assert.equal(features[6].properties.m49, '002');
        assert.equal(features[7].properties.iso1A2, 'UN');
        assert.equal(features[8].properties.m49, '001');
      });

      it('codes location in user-assigned, de facto country: Kosovo', () => {
        let features = coder.featuresContaining([21, 42.6]);
        assert.equal(features.length, 4);
        assert.equal(features[0].properties.iso1A2, 'XK');
        assert.equal(features[1].properties.m49, '039');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.m49, '001');
      });

      it('codes location in exclave of officially-assigned country: Sokh District, Uzbekistan', () => {
        let features = coder.featuresContaining([71.13, 39.96]);
        assert.equal(features.length, 5);
        assert.equal(features[0].properties.iso1A2, 'UZ');
        assert.equal(features[1].properties.m49, '143');
        assert.equal(features[2].properties.m49, '142');
        assert.equal(features[3].properties.iso1A2, 'UN');
        assert.equal(features[4].properties.m49, '001');
      });

      it('codes South Pole as AQ', () => {
        let features = coder.featuresContaining([0, -90]);
        assert.equal(features.length, 2);
        assert.equal(features[0].properties.iso1A2, 'AQ');
        assert.equal(features[1].properties.m49, '001');
      });

      it('does not code North Pole', () => {
        assert.deepEqual(coder.featuresContaining([0, 90]), []);
      });
    });
    describe('by code', () => {
      it('codes US', () => {
        let features = coder.featuresContaining('US');
        assert.equal(features.length, 3);
        assert.equal(features[0].properties.iso1A2, 'US');
        assert.equal(features[1].properties.iso1A2, 'UN');
        assert.equal(features[2].properties.m49, '001');
      });

      it('codes US, strict', () => {
        let features = coder.featuresContaining('US', true);
        assert.equal(features.length, 2);
        assert.equal(features[0].properties.iso1A2, 'UN');
        assert.equal(features[1].properties.m49, '001');
      });

      it('codes CONUS', () => {
        let features = coder.featuresContaining('CONUS');
        assert.equal(features.length, 8);
        assert.equal(features[0].properties.nameEn, 'Contiguous United States');
        assert.equal(features[1].properties.nameEn, 'US States');
        assert.equal(features[2].properties.iso1A2, 'US');
        assert.equal(features[3].properties.m49, '021');
        assert.equal(features[4].properties.m49, '003');
        assert.equal(features[5].properties.m49, '019');
        assert.equal(features[6].properties.iso1A2, 'UN');
        assert.equal(features[7].properties.m49, '001');
      });

      it('codes CONUS, strict', () => {
        let features = coder.featuresContaining('CONUS', true);
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.nameEn, 'US States');
        assert.equal(features[1].properties.iso1A2, 'US');
        assert.equal(features[2].properties.m49, '021');
        assert.equal(features[3].properties.m49, '003');
        assert.equal(features[4].properties.m49, '019');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes CH', () => {
        let features = coder.featuresContaining('CH');
        assert.equal(features.length, 5);
        assert.equal(features[0].properties.iso1A2, 'CH');
        assert.equal(features[1].properties.m49, '155');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.iso1A2, 'UN');
        assert.equal(features[4].properties.m49, '001');
      });

      it('codes DK', () => {
        let features = coder.featuresContaining('DK');
        assert.equal(features.length, 3);
        assert.equal(features[0].properties.iso1A2, 'DK');
        assert.equal(features[1].properties.iso1A2, 'UN');
        assert.equal(features[2].properties.m49, '001');
      });

      it('codes DE', () => {
        let features = coder.featuresContaining('DE');
        assert.equal(features.length, 6);
        assert.equal(features[0].properties.iso1A2, 'DE');
        assert.equal(features[1].properties.m49, '155');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.iso1A2, 'EU');
        assert.equal(features[4].properties.iso1A2, 'UN');
        assert.equal(features[5].properties.m49, '001');
      });

      it('codes IM', () => {
        let features = coder.featuresContaining('IM');
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.iso1A2, 'IM');
        assert.equal(features[1].properties.wikidata, 'Q185086');
        assert.equal(features[2].properties.iso1A2, 'GB');
        assert.equal(features[3].properties.m49, '154');
        assert.equal(features[4].properties.m49, '150');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes GB', () => {
        let features = coder.featuresContaining('GB');
        assert.equal(features.length, 3);
        assert.equal(features[0].properties.iso1A2, 'GB');
        assert.equal(features[1].properties.iso1A2, 'UN');
        assert.equal(features[2].properties.m49, '001');
      });

      it('codes FX', () => {
        let features = coder.featuresContaining('FX');
        assert.equal(features.length, 7);
        assert.equal(features[0].properties.iso1A2, 'FX');
        assert.equal(features[1].properties.iso1A2, 'FR');
        assert.equal(features[2].properties.m49, '155');
        assert.equal(features[3].properties.m49, '150');
        assert.equal(features[4].properties.iso1A2, 'EU');
        assert.equal(features[5].properties.iso1A2, 'UN');
        assert.equal(features[6].properties.m49, '001');
      });

      it('codes TA', () => {
        let features = coder.featuresContaining('TA');
        assert.equal(features.length, 9);
        assert.equal(features[0].properties.iso1A2, 'TA');
        assert.equal(features[1].properties.iso1A2, 'SH');
        assert.equal(features[2].properties.wikidata, 'Q46395');
        assert.equal(features[3].properties.iso1A2, 'GB');
        assert.equal(features[4].properties.m49, '011');
        assert.equal(features[5].properties.m49, '202');
        assert.equal(features[6].properties.m49, '002');
        assert.equal(features[7].properties.iso1A2, 'UN');
        assert.equal(features[8].properties.m49, '001');
      });

      it('codes XK', () => {
        let features = coder.featuresContaining('XK');
        assert.equal(features.length, 4);
        assert.equal(features[0].properties.iso1A2, 'XK');
        assert.equal(features[1].properties.m49, '039');
        assert.equal(features[2].properties.m49, '150');
        assert.equal(features[3].properties.m49, '001');
      });

      it('codes UZ', () => {
        let features = coder.featuresContaining('UZ');
        assert.equal(features.length, 5);
        assert.equal(features[0].properties.iso1A2, 'UZ');
        assert.equal(features[1].properties.m49, '143');
        assert.equal(features[2].properties.m49, '142');
        assert.equal(features[3].properties.iso1A2, 'UN');
        assert.equal(features[4].properties.m49, '001');
      });

      it('codes AQ', () => {
        let features = coder.featuresContaining('AQ');
        assert.equal(features.length, 2);
        assert.equal(features[0].properties.iso1A2, 'AQ');
        assert.equal(features[1].properties.m49, '001');
      });
    });
  });

  describe('featuresIn', () => {
    it('codes CN', () => {
      let features = coder.featuresIn('CN');
      assert.equal(features.length, 4);
      assert.equal(features[0].properties.iso1A2, 'CN');
      assert.equal(features[1].properties.wikidata, 'Q19188');
      assert.equal(features[2].properties.iso1A2, 'HK');
      assert.equal(features[3].properties.iso1A2, 'MO');
    });

    it('codes CN, strict', () => {
      let features = coder.featuresIn('CN', true);
      assert.equal(features.length, 3);
      assert.equal(features[0].properties.wikidata, 'Q19188');
      assert.equal(features[1].properties.iso1A2, 'HK');
      assert.equal(features[2].properties.iso1A2, 'MO');
    });

    it('codes 830', () => {
      let features = coder.featuresIn(830);
      assert.equal(features.length, 6);
      assert.equal(features[0].properties.m49, '830');
      assert.equal(features[1].properties.wikidata, 'Q179313');
      assert.equal(features[2].properties.wikidata, 'Q3311985');
      assert.equal(features[3].properties.m49, '680');
      assert.equal(features[4].properties.iso1A2, 'GG');
      assert.equal(features[5].properties.iso1A2, 'JE');
    });

    it('codes 830, strict', () => {
      let features = coder.featuresIn(830, true);
      assert.equal(features.length, 5);
      assert.equal(features[0].properties.wikidata, 'Q179313');
      assert.equal(features[1].properties.wikidata, 'Q3311985');
      assert.equal(features[2].properties.m49, '680');
      assert.equal(features[3].properties.iso1A2, 'GG');
      assert.equal(features[4].properties.iso1A2, 'JE');
    });

    it('codes "Crown Dependencies", strict', () => {
      let features = coder.featuresIn('Crown Dependencies', true);
      assert.equal(features.length, 6);
      assert.equal(features[0].properties.wikidata, 'Q179313');
      assert.equal(features[1].properties.wikidata, 'Q3311985');
      assert.equal(features[2].properties.m49, '680');
      assert.equal(features[3].properties.iso1A2, 'GG');
      assert.equal(features[4].properties.iso1A2, 'IM');
      assert.equal(features[5].properties.iso1A2, 'JE');
    });

    it('codes "SBA", strict', () => {
      let features = coder.featuresIn('SBA', true);
      assert.equal(features.length, 2);
      assert.equal(features[0].properties.wikidata, 'Q9143535');
      assert.equal(features[1].properties.wikidata, 'Q9206745');
    });

    it('codes 🇸🇭 (Saint Helena)', () => {
      let features = coder.featuresIn('🇸🇭');
      assert.equal(features.length, 4);
      assert.equal(features[0].properties.iso1A2, 'SH');
      assert.equal(features[1].properties.wikidata, 'Q34497');
      assert.equal(features[2].properties.iso1A2, 'AC');
      assert.equal(features[3].properties.iso1A2, 'TA');
    });

    it('codes 🇸🇭 (Saint Helena), strict', () => {
      let features = coder.featuresIn('🇸🇭', true);
      assert.equal(features.length, 3);
      assert.equal(features[0].properties.wikidata, 'Q34497');
      assert.equal(features[1].properties.iso1A2, 'AC');
      assert.equal(features[2].properties.iso1A2, 'TA');
    });

    it('codes UN', () => {
      let features = coder.featuresIn('UN').filter(function (feature) {
        return feature.properties.level === 'country';
      });
      // there are exactly 193 UN member states as of August 2020
      assert.equal(features.length, 193);
    });

    it('codes AQ', () => {
      let features = coder.featuresIn('AQ');
      assert.equal(features.length, 1);
      assert.equal(features[0].properties.iso1A2, 'AQ');
    });

    it('codes AQ, strict', () => {
      assert.deepEqual(coder.featuresIn('AQ', true), []);
    });

    it('does not code ABC', () => {
      assert.deepEqual(coder.featuresIn('ABC'), []);
    });
  });

  describe('aggregateFeature', () => {
    it('returns aggregate for feature with geometry', () => {
      assert.equal(coder.aggregateFeature('TA')?.geometry.coordinates.length, 1);
    });
    it('returns aggregate for feature without geometry', () => {
      assert.equal(coder.aggregateFeature('CN')?.geometry.coordinates.length, 3);
      assert.equal(coder.aggregateFeature('SH')?.geometry.coordinates.length, 3);
      assert.equal(coder.aggregateFeature('EU')?.geometry.coordinates.length, 63);
    });
    it('returns null for invalid ID', () => {
      assert.equal(coder.aggregateFeature('ABC'), null);
    });
  });
  describe('isIn', () => {
    describe('by location', () => {
      it('returns true: US location in US', () => {
        assert.equal(coder.isIn([-74, 40.6], 'US'), true);
      });
      it('returns false: US location in CH', () => {
        assert.equal(coder.isIn([-74, 40.6], 'CH'), false);
      });
      it('returns true: US location in 19 (Americas)', () => {
        assert.equal(coder.isIn([-74, 40.6], 19), true);
      });
      it('returns true: US location in "021" (Northern America)', () => {
        assert.equal(coder.isIn([-74, 40.6], '021'), true);
      });
      it('returns true: US location in Q2 (World)', () => {
        assert.equal(coder.isIn([-74, 40.6], 'Q2'), true);
      });
      it('returns false: US location in Q15 (Africa)', () => {
        assert.equal(coder.isIn([-74, 40.6], 'Q15'), false);
      });
    });

    describe('by code', () => {
      it('returns true: US in US', () => {
        assert.equal(coder.isIn('US', 'US'), true);
      });
      it('returns false: US in CH', () => {
        assert.equal(coder.isIn('US', 'CH'), false);
      });
      it('returns false: USA in 19 (Americas)', () => {
        assert.equal(coder.isIn('USA', 19), false);
      });
      it('returns false: US in "021" (Northern America)', () => {
        assert.equal(coder.isIn('US', '021'), false);
      });
      it('returns false: US location in Q15 (Africa)', () => {
        assert.equal(coder.isIn('US', 'Q15'), false);
      });
      it('returns true: CONUS in 19 (Americas)', () => {
        assert.equal(coder.isIn('CONUS', 19), true);
      });
      it('returns true: CONUS in "021" (Northern America)', () => {
        assert.equal(coder.isIn('CONUS', '021'), true);
      });
      it('returns true: PR in US', () => {
        assert.equal(coder.isIn('PR', 'US'), true);
      });
      it('returns false: US in PR', () => {
        assert.equal(coder.isIn('US', 'PR'), false);
      });
      it('returns true: TA in SH', () => {
        assert.equal(coder.isIn('TA', 'SH'), true);
      });
      it('returns true: TA in GB', () => {
        assert.equal(coder.isIn('TA', 'GB'), true);
      });
      it('returns false: TA in EU', () => {
        assert.equal(coder.isIn('TA', 'EU'), false);
      });
      it('returns true: MP in "Q153732"', () => {
        assert.equal(coder.isIn('MP', 'Q153732'), true);
      });
      it('returns true: "Navassa Island" in "UM"', () => {
        assert.equal(coder.isIn('Navassa Island', 'UM'), true);
      });
      it('returns true: "Navassa Island" in "029" (Caribbean)', () => {
        assert.equal(coder.isIn('Navassa Island', '029'), true);
      });
      it('returns false: "UM" in "029"', () => {
        assert.equal(coder.isIn('UM', '029'), false);
      });
      it('returns true: "Midway Atoll" in "UM"', () => {
        assert.equal(coder.isIn('Midway Atoll', 'UM'), true);
      });
      it('returns true: "Midway Atoll" in "US"', () => {
        assert.equal(coder.isIn('Midway Atoll', 'US'), true);
      });
      it('returns false: "Midway Atoll" in "Hawaii"', () => {
        assert.equal(coder.isIn('Midway Atoll', 'Hawaii'), false);
      });
      it('returns true: GU in "Q153732" (Mariana Islands)', () => {
        assert.equal(coder.isIn('GU', 'Q153732'), true);
      });
      it('returns true: "GU" in US', () => {
        assert.equal(coder.isIn('GU', 'US'), true);
      });
      it('returns true: "Alaska" in "US"', () => {
        assert.equal(coder.isIn('Alaska', 'US'), true);
      });
      it('returns true: "Hawaii" in "US"', () => {
        assert.equal(coder.isIn('Hawaii', 'US'), true);
      });
      it('returns true: "CONUS" in "US"', () => {
        assert.equal(coder.isIn('CONUS', 'US'), true);
      });
      it('returns false: "US" in "CONUS"', () => {
        assert.equal(coder.isIn('US', 'CONUS'), false);
      });
      it('returns false: "Q153732" in "019" (Mariana Islands in Americas)', () => {
        assert.equal(coder.isIn('Q153732', '019'), false);
      });
      it('returns false: "Hawaii" in "019"', () => {
        assert.equal(coder.isIn('Hawaii', '019'), false);
      });
      it('returns true: "Alaska" in "019"', () => {
        assert.equal(coder.isIn('Alaska', '019'), true);
      });
      it('returns true: "021" in "019" (Northern America in Americas)', () => {
        assert.equal(coder.isIn('021', '019'), true);
      });
      it('returns true: "XK" in "europe"', () => {
        assert.equal(coder.isIn('XK', 'europe'), true);
      });
      it('returns true: "TW" in "Asia"', () => {
        assert.equal(coder.isIn('TW', 'Asia'), true);
      });
      it('returns true: 🇵🇷 in 🇺🇸', () => {
        assert.equal(coder.isIn('🇵🇷', '🇺🇸'), true);
      });
      it('returns true: "Bir Tawil" in "015"', () => {
        assert.equal(coder.isIn('Bir Tawil', '015'), true);
      });
      it('returns false: "Bir Tawil" in "Sudan"', () => {
        assert.equal(coder.isIn('Bir Tawil', 'Sudan'), false);
      });
      it('returns false: "Bir Tawil" in "Egypt"', () => {
        assert.equal(coder.isIn('Bir Tawil', 'Egypt'), false);
      });
      it('returns true: "Subsaharan africa" in "AFRICA"', () => {
        assert.equal(coder.isIn('Subsaharan africa', 'AFRICA'), true);
      });
      it('returns true: "Africa" in "World"', () => {
        assert.equal(coder.isIn('Africa', 'World'), true);
      });
    });
  });

  describe('isInEuropeanUnion', () => {
    describe('by location', () => {
      it('returns false for location in officially-assigned country, outside EU: New York, United States', () => {
        assert.equal(coder.isInEuropeanUnion([-74, 40.6]), false);
      });

      it('returns false for location in officially-assigned country, outside but surrounded by EU: Geneva, Switzerland', () => {
        assert.equal(coder.isInEuropeanUnion([6.1, 46.2]), false);
      });

      it('returns true for France', () => {
        assert.equal(coder.isInEuropeanUnion('fr'), true);
      });

      it('returns true for location in officially-assigned country, in EU, outside Eurozone: Copenhagen, Denmark', () => {
        assert.equal(coder.isInEuropeanUnion([12.59, 55.68]), true);
      });

      it('returns true for location in officially-assigned country, in EU, in Eurozone: Berlin, Germany', () => {
        assert.equal(coder.isInEuropeanUnion([13.4, 52.5]), true);
      });

      it('returns false for location in officially-assigned subfeature, oustide EU, of officially-assigned country, in EU: Isle of Man, United Kingdom', () => {
        assert.equal(coder.isInEuropeanUnion([-4.5, 54.2]), false);
      });

      it('returns true for location in exceptionally-reserved subfeature, in EU: Paris, Metropolitan France', () => {
        assert.equal(coder.isInEuropeanUnion([2.35, 48.85]), true);
      });

      it('returns false for location in exceptionally-reserved subfeature of officially-assigned subfeature, outside EU, of officially-assigned country, in EU: Tristan da Cunha, SH, UK', () => {
        assert.equal(coder.isInEuropeanUnion([-12.3, -37.1]), false);
      });

      it('returns false for location in user-assigned, de facto country, in Europe, outside EU: Kosovo', () => {
        assert.equal(coder.isInEuropeanUnion([21, 42.6]), false);
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
        assert.equal(coder.isInEuropeanUnion(pointFeature), true);
      });
      it('returns true for GeoJSON point geometry in Germany', () => {
        let pointGeometry = {
          type: 'Point',
          coordinates: [13.4, 52.5]
        };
        assert.equal(coder.isInEuropeanUnion(pointGeometry), true);
      });
    });
    describe('by code', () => {
      it('returns true for European Union itself: EU', () => {
        assert.equal(coder.isInEuropeanUnion('EU'), true);
      });

      it('returns true for countries inside the EU', () => {
        assert.equal(coder.isInEuropeanUnion('SE'), true);
        assert.equal(coder.isInEuropeanUnion('DE'), true);
        assert.equal(coder.isInEuropeanUnion('FX'), true);
        assert.equal(coder.isInEuropeanUnion('CY'), true);
      });

      it('returns true for certain territories of EU countries that are inside the EU', () => {
        // Outermost regions
        assert.equal(coder.isInEuropeanUnion('OMR'), true);
        assert.equal(coder.isInEuropeanUnion('Q2914565'), true);
        assert.equal(coder.isInEuropeanUnion('Azores'), true);
        assert.equal(coder.isInEuropeanUnion('Madeira'), true);
        assert.equal(coder.isInEuropeanUnion('IC'), true);
        assert.equal(coder.isInEuropeanUnion('GF'), true);
        assert.equal(coder.isInEuropeanUnion('GP'), true);
        assert.equal(coder.isInEuropeanUnion('MQ'), true);
        assert.equal(coder.isInEuropeanUnion('YT'), true);
        assert.equal(coder.isInEuropeanUnion('RE'), true);
        assert.equal(coder.isInEuropeanUnion('MF'), true);
        // special cases
        assert.equal(coder.isInEuropeanUnion('EA'), true);
        assert.equal(coder.isInEuropeanUnion('Ceuta'), true);
        assert.equal(coder.isInEuropeanUnion('Melilla'), true);
        assert.equal(coder.isInEuropeanUnion('AX'), true);
      });

      it('returns false for certain territories of EU countries outside of the EU', () => {
        // Overseas countries and territories
        assert.equal(coder.isInEuropeanUnion('OCT'), false);
        assert.equal(coder.isInEuropeanUnion('Greenland'), false);
        assert.equal(coder.isInEuropeanUnion('CW'), false);
        assert.equal(coder.isInEuropeanUnion('Aruba'), false);
        assert.equal(coder.isInEuropeanUnion('SX'), false);
        assert.equal(coder.isInEuropeanUnion('BQ'), false);
        assert.equal(coder.isInEuropeanUnion('Bonaire'), false);
        assert.equal(coder.isInEuropeanUnion('Sint Eustatius'), false);
        assert.equal(coder.isInEuropeanUnion('Saba'), false);
        // special case
        assert.equal(coder.isInEuropeanUnion('FO'), false);
      });

      it('returns false for countries outside the EU', () => {
        assert.equal(coder.isInEuropeanUnion('US'), false);
        assert.equal(coder.isInEuropeanUnion('RU'), false);
        assert.equal(coder.isInEuropeanUnion('NO'), false);
        assert.equal(coder.isInEuropeanUnion('CH'), false);
        assert.equal(coder.isInEuropeanUnion('CN'), false);
        assert.equal(coder.isInEuropeanUnion('XK'), false);
      });

      it('returns false for territories outside the EU', () => {
        assert.equal(coder.isInEuropeanUnion('IM'), false);
        assert.equal(coder.isInEuropeanUnion('TA'), false);
        assert.equal(coder.isInEuropeanUnion('HK'), false);
        assert.equal(coder.isInEuropeanUnion('VI'), false);
      });

      it('returns false for M49 super-region code: 150', () => {
        assert.equal(coder.isInEuropeanUnion('150'), false);
      });

      it('returns false for "world"', () => {
        assert.equal(coder.isInEuropeanUnion('world'), false);
      });

      it('returns null for unassigned alpha-2 code: AB', () => {
        assert.equal(coder.isInEuropeanUnion('AB'), null);
      });

      it('returns null for empty string', () => {
        assert.equal(coder.isInEuropeanUnion(''), null);
      });
    });
  });

  describe('isInUnitedNations', () => {
    describe('by location', () => {
      it('returns for coordinate location:', () => {
        assert.equal(coder.isInUnitedNations([-74, 40.6]), true); // New York, United States
        assert.equal(coder.isInUnitedNations([6.1, 46.2]), true); // Geneva, Switzerland
        assert.equal(coder.isInUnitedNations([12.59, 55.68]), true); // Copenhagen, Denmark
        assert.equal(coder.isInUnitedNations([13.4, 52.5]), true); // Berlin, Germany
        assert.equal(coder.isInUnitedNations([-4.5, 54.2]), true); // Isle of Man, United Kingdom
        assert.equal(coder.isInUnitedNations([2.35, 48.85]), true); // Metropolitan France
        assert.equal(coder.isInUnitedNations([-12.3, -37.1]), true); // Tristan da Cunha, SH, UK
        assert.equal(coder.isInUnitedNations([21, 42.6]), false); // Kosovo
      });
      it('returns for GeoJSON point feature', () => {
        let pointFeature = {
          type: 'Feature',
          properties: null,
          geometry: {
            type: 'Point',
            coordinates: [13.4, 52.5] // Berlin, Germany
          }
        };
        assert.equal(coder.isInUnitedNations(pointFeature), true);
      });
      it('returns for GeoJSON point geometry', () => {
        let pointGeometry = {
          type: 'Point',
          coordinates: [13.4, 52.5] // Berlin, Germany
        };
        assert.equal(coder.isInUnitedNations(pointGeometry), true);
      });
    });
    describe('by code', () => {
      it('returns true for features in UN', () => {
        assert.equal(coder.isInUnitedNations('EU'), true);
        assert.equal(coder.isInUnitedNations('SE'), true);
        assert.equal(coder.isInUnitedNations('DE'), true);
        assert.equal(coder.isInUnitedNations('FX'), true);
        assert.equal(coder.isInUnitedNations('CY'), true);
        assert.equal(coder.isInUnitedNations('OMR'), true);
        assert.equal(coder.isInUnitedNations('Q2914565'), true);
        assert.equal(coder.isInUnitedNations('Azores'), true);
        assert.equal(coder.isInUnitedNations('Madeira'), true);
        assert.equal(coder.isInUnitedNations('IC'), true);
        assert.equal(coder.isInUnitedNations('GF'), true);
        assert.equal(coder.isInUnitedNations('GP'), true);
        assert.equal(coder.isInUnitedNations('MQ'), true);
        assert.equal(coder.isInUnitedNations('YT'), true);
        assert.equal(coder.isInUnitedNations('RE'), true);
        assert.equal(coder.isInUnitedNations('MF'), true);
        assert.equal(coder.isInUnitedNations('EA'), true);
        assert.equal(coder.isInUnitedNations('Ceuta'), true);
        assert.equal(coder.isInUnitedNations('Melilla'), true);
        assert.equal(coder.isInUnitedNations('AX'), true);
        assert.equal(coder.isInUnitedNations('OCT'), true);
        assert.equal(coder.isInUnitedNations('Greenland'), true);
        assert.equal(coder.isInUnitedNations('CW'), true);
        assert.equal(coder.isInUnitedNations('Aruba'), true);
        assert.equal(coder.isInUnitedNations('SX'), true);
        assert.equal(coder.isInUnitedNations('BQ'), true);
        assert.equal(coder.isInUnitedNations('Bonaire'), true);
        assert.equal(coder.isInUnitedNations('Sint Eustatius'), true);
        assert.equal(coder.isInUnitedNations('Saba'), true);
        assert.equal(coder.isInUnitedNations('PF'), true);
        assert.equal(coder.isInUnitedNations('NC'), true);
        assert.equal(coder.isInUnitedNations('WF'), true);
        assert.equal(coder.isInUnitedNations('BL'), true);
        assert.equal(coder.isInUnitedNations('TF'), true);
        assert.equal(coder.isInUnitedNations('FO'), true);
        assert.equal(coder.isInUnitedNations('US'), true);
        assert.equal(coder.isInUnitedNations('RU'), true);
        assert.equal(coder.isInUnitedNations('NO'), true);
        assert.equal(coder.isInUnitedNations('CH'), true);
        assert.equal(coder.isInUnitedNations('CN'), true);
        assert.equal(coder.isInUnitedNations('IM'), true);
        assert.equal(coder.isInUnitedNations('TA'), true);
        assert.equal(coder.isInUnitedNations('HK'), true);
        assert.equal(coder.isInUnitedNations('VI'), true);
      });

      it('returns false for features not in UN', () => {
        assert.equal(coder.isInUnitedNations('XK'), false);
        assert.equal(coder.isInUnitedNations('PS'), false);
        assert.equal(coder.isInUnitedNations('TW'), false);
        assert.equal(coder.isInUnitedNations('AQ'), false);
        assert.equal(coder.isInUnitedNations('VA'), false);
        assert.equal(coder.isInUnitedNations('Western Sahara'), false);
        assert.equal(coder.isInUnitedNations('Northern Cyprus'), false);
        assert.equal(coder.isInUnitedNations('Bir Tawil'), false);
        assert.equal(coder.isInUnitedNations('150'), false);
        assert.equal(coder.isInUnitedNations('world'), false);
      });

      it('returns null for invalid codes', () => {
        assert.equal(coder.isInUnitedNations('AB'), null);
        assert.equal(coder.isInUnitedNations(''), null);
      });
    });
  });

  describe('driveSide', () => {
    it('finds feature using right by location', () => {
      assert.equal(coder.driveSide([-74, 40.6]), 'right');
    });

    it('finds feature using left by location', () => {
      assert.equal(coder.driveSide([-4.5, 54.2]), 'left');
    });

    it('finds feature using right by identifier', () => {
      assert.equal(coder.driveSide('DE'), 'right');
      assert.equal(coder.driveSide('CA'), 'right');
      assert.equal(coder.driveSide('IO'), 'right');
      assert.equal(coder.driveSide('PR'), 'right');
      assert.equal(coder.driveSide('GI'), 'right');
      assert.equal(coder.driveSide('ES'), 'right');
      assert.equal(coder.driveSide('FR'), 'right');
      assert.equal(coder.driveSide('Midway Atoll'), 'right');
      assert.equal(coder.driveSide('Hawaii'), 'right');
      assert.equal(coder.driveSide('CONUS'), 'right');
    });

    it('finds feature using left by identifier', () => {
      assert.equal(coder.driveSide('VI'), 'left');
      assert.equal(coder.driveSide('GB-SCT'), 'left');
      assert.equal(coder.driveSide('IM'), 'left');
      assert.equal(coder.driveSide('IE'), 'left');
      assert.equal(coder.driveSide('IN'), 'left');
      assert.equal(coder.driveSide('AU'), 'left');
      assert.equal(coder.driveSide('NZ'), 'left');
      assert.equal(coder.driveSide('SH'), 'left');
      assert.equal(coder.driveSide('TA'), 'left');
      assert.equal(coder.driveSide('HMD'), 'left');
      assert.equal(coder.driveSide('JP'), 'left');
      assert.equal(coder.driveSide('ZA'), 'left');
      assert.equal(coder.driveSide('Great Britain'), 'left');
    });

    it('finds null for EU', () => {
      assert.equal(coder.driveSide('EU'), null);
    });

    it('finds null for 001', () => {
      assert.equal(coder.driveSide('001'), null);
    });

    it('finds null for North Pole', () => {
      assert.equal(coder.driveSide([0, 90]), null);
    });
  });

  describe('roadSpeedUnit', () => {
    it('finds feature using km/h by location', () => {
      assert.equal(coder.roadSpeedUnit([2.35, 48.85]), 'km/h');
    });

    it('finds feature using mph by location', () => {
      assert.equal(coder.roadSpeedUnit([-74, 40.6]), 'mph');
    });

    it('finds feature using km/h by identifier', () => {
      assert.equal(coder.roadSpeedUnit('IO'), 'km/h');
      assert.equal(coder.roadSpeedUnit('IE'), 'km/h');
      assert.equal(coder.roadSpeedUnit('AU'), 'km/h');
      assert.equal(coder.roadSpeedUnit('NZ'), 'km/h');
      assert.equal(coder.roadSpeedUnit('ES'), 'km/h');
      assert.equal(coder.roadSpeedUnit('TK'), 'km/h');
      assert.equal(coder.roadSpeedUnit('GI'), 'km/h');
      assert.equal(coder.roadSpeedUnit('FR'), 'km/h');
    });

    it('finds feature using mph by identifier', () => {
      assert.equal(coder.roadSpeedUnit('US'), 'mph');
      assert.equal(coder.roadSpeedUnit('CONUS'), 'mph');
      assert.equal(coder.roadSpeedUnit('US-AK'), 'mph');
      assert.equal(coder.roadSpeedUnit('Midway Atoll'), 'mph');
      assert.equal(coder.roadSpeedUnit('VI'), 'mph');
      assert.equal(coder.roadSpeedUnit('VG'), 'mph');
      assert.equal(coder.roadSpeedUnit('IM'), 'mph');
      assert.equal(coder.roadSpeedUnit('GB-ENG'), 'mph');
      assert.equal(coder.roadSpeedUnit('Great Britain'), 'mph');
    });

    it('finds null for 001', () => {
      assert.equal(coder.roadSpeedUnit('001'), null);
    });

    it('finds null for location of North Pole', () => {
      assert.equal(coder.roadSpeedUnit([0, 90]), null);
    });
  });

  describe('roadHeightUnit', () => {
    it('finds feature using m by location', () => {
      assert.equal(coder.roadHeightUnit([2.35, 48.85]), 'm');
    });

    it('finds feature using ft by location', () => {
      assert.equal(coder.roadHeightUnit([-74, 40.6]), 'ft');
    });

    it('finds feature using m by identifier', () => {
      assert.equal(coder.roadHeightUnit('IO'), 'm');
      assert.equal(coder.roadHeightUnit('IE'), 'm');
      assert.equal(coder.roadHeightUnit('AU'), 'm');
      assert.equal(coder.roadHeightUnit('NZ'), 'm');
      assert.equal(coder.roadHeightUnit('ES'), 'm');
      assert.equal(coder.roadHeightUnit('TK'), 'm');
      assert.equal(coder.roadHeightUnit('GI'), 'm');
      assert.equal(coder.roadHeightUnit('FR'), 'm');
      assert.equal(coder.roadHeightUnit('PR'), 'm');
      assert.equal(coder.roadHeightUnit('US-PR'), 'm');
    });

    it('finds feature using ft by identifier', () => {
      assert.equal(coder.roadHeightUnit('CONUS'), 'ft');
      assert.equal(coder.roadHeightUnit('US-AK'), 'ft');
      assert.equal(coder.roadHeightUnit('Midway Atoll'), 'ft');
      assert.equal(coder.roadHeightUnit('VI'), 'ft');
      assert.equal(coder.roadHeightUnit('VG'), 'ft');
      assert.equal(coder.roadHeightUnit('IM'), 'ft');
      assert.equal(coder.roadHeightUnit('GB-ENG'), 'ft');
      assert.equal(coder.roadHeightUnit('Great Britain'), 'ft');
    });

    it('finds null for 001', () => {
      assert.equal(coder.roadHeightUnit('001'), null);
    });

    it('finds null for location of North Pole', () => {
      assert.equal(coder.roadHeightUnit([0, 90]), null);
    });

    it('finds null for United States due to variation in Puerto Rico', () => {
      assert.equal(coder.roadHeightUnit('US'), null);
    });
  });

  describe('callingCodes', () => {
    it('finds one prefix for feature with one', () => {
      assert.deepEqual(coder.callingCodes([2.35, 48.85]), ['33']);
      assert.deepEqual(coder.callingCodes('ES-CE'), ['34']);
    });

    it('finds multiple prefixes for feature with multiple', () => {
      const results = coder.callingCodes('PR');
      assert.ok(results instanceof Array);
      assert.equal(results.length, 2);
      assert.ok(results.includes('1 787'));
      assert.ok(results.includes('1 939'));
    });

    it('finds none for feature without data', () => {
      assert.deepEqual(coder.callingCodes('Bir Tawil'), []);
    });

    it('finds none for location of North Pole', () => {
      assert.deepEqual(coder.callingCodes([0, 90]), []);
    });
  });
});
