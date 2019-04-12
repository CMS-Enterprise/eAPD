import { fromAPI, toAPI } from './apd';

describe('APD serializer', () => {
  describe('deserializer from API format to redux state shape', () => {
    it('deserializes everything given to it', () => {
      const apdAPI = {
        id: 'apd id',
        activities: ['an activity'],
        federalCitations: 'federal things, like that s with a circle on it',
        incentivePayments: [
          {
            q1: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q2: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q3: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q4: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            year: '1431'
          }
        ],
        keyPersonnel: [
          {
            email: 'alice@thebuilder.net',
            hasCosts: false,
            isPrimary: true,
            name: 'Alice the Architect',
            percentTime: 0.21,
            position: 'Architect',
            costs: []
          },
          {
            email: 'bob@thebuilder.net',
            hasCosts: true,
            isPrimary: false,
            name: 'Bob the Builder',
            percentTime: 0.37,
            position: 'Builder',
            costs: [
              {
                cost: '50',
                year: 1903
              },
              {
                cost: '73293',
                year: 2018
              }
            ]
          }
        ],
        narrativeHIE: 'hie hie hie',
        narrativeHIT: 'hit hit hit',
        narrativeMMIS: 'mmis mmis mmis',
        programOverview: 'doing the moop moop',
        pointsOfContact: 'people to talk to',
        previousActivityExpenses: [
          {
            hithie: 'pa hithie',
            mmis: 'pa mmis',
            year: '1431'
          }
        ],
        previousActivitySummary: 'last time on Batman...',
        stateProfile: {
          thing: null,
          other: 'text'
        },
        years: ['1431']
      };

      expect(fromAPI(apdAPI, a => a)).toEqual({
        id: 'apd id',
        activities: ['an activity'],
        federalCitations: 'federal things, like that s with a circle on it',
        incentivePayments: {
          ehAmt: { '1431': { 1: 47, 2: 47, 3: 47, 4: 47 } },
          ehCt: { '1431': { 1: 9, 2: 9, 3: 9, 4: 9 } },
          epAmt: { '1431': { 1: 355, 2: 355, 3: 355, 4: 355 } },
          epCt: { '1431': { 1: 59, 2: 59, 3: 59, 4: 59 } }
        },
        keyPersonnel: [
          {
            email: 'alice@thebuilder.net',
            expanded: true,
            hasCosts: false,
            isPrimary: true,
            key: expect.stringMatching(/^[a-f0-9]{8}$/),
            name: 'Alice the Architect',
            percentTime: 21,
            position: 'Architect',
            costs: {}
          },
          {
            email: 'bob@thebuilder.net',
            expanded: false,
            hasCosts: true,
            isPrimary: false,
            key: expect.stringMatching(/^[a-f0-9]{8}$/),
            name: 'Bob the Builder',
            percentTime: 37,
            position: 'Builder',
            costs: {
              1903: 50,
              2018: 73293
            }
          }
        ],
        narrativeHIE: 'hie hie hie',
        narrativeHIT: 'hit hit hit',
        narrativeMMIS: 'mmis mmis mmis',
        pointsOfContact: 'people to talk to',
        previousActivityExpenses: {
          '1431': {
            hithie: 'pa hithie',
            mmis: 'pa mmis'
          }
        },
        previousActivitySummary: 'last time on Batman...',
        programOverview: 'doing the moop moop',
        stateProfile: {
          thing: '',
          other: 'text'
        },
        years: ['1431']
      });
    });
  });

  describe('serializes redux state shape into API format', () => {
    it('does the magical serialization', () => {
      const apdState = {
        federalCitations: '45 CFR something something',
        incentivePayments: {
          ehAmt: { '1431': { 1: 47, 2: 47, 3: 47, 4: 47 } },
          ehCt: { '1431': { 1: 9, 2: 9, 3: 9, 4: 9 } },
          epAmt: { '1431': { 1: 355, 2: 355, 3: 355, 4: 355 } },
          epCt: { '1431': { 1: 59, 2: 59, 3: 59, 4: 59 } }
        },
        keyPersonnel: [
          {
            email: 'bob@thebuilder.net',
            expanded: false,
            hasCosts: true,
            isPrimary: false,
            name: 'Bob the Builder',
            percentTime: 37,
            position: 'Builder',
            costs: {
              1903: 50,
              2018: 73293
            }
          }
        ],
        narrativeHIE: 'hie hie hie',
        narrativeHIT: 'hit hit hit',
        narrativeMMIS: 'mmis mmis mmis',
        pointsOfContact: 'people to talk to',
        previousActivityExpenses: {
          '1431': {
            hithie: 'pa hithie',
            mmis: 'pa mmis'
          }
        },
        previousActivitySummary: 'last time on Batman...',
        programOverview: 'doing the moop moop',
        stateProfile: 'big, lots of dirt and trees and stuff',
        years: ['1431']
      };

      const activityState = {
        byKey: {
          a: 'first activity',
          b: 'second activity'
        }
      };

      expect(toAPI(apdState, activityState, a => a)).toEqual({
        activities: ['first activity', 'second activity'],
        federalCitations: '45 CFR something something',
        incentivePayments: [
          {
            q1: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q2: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q3: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            q4: {
              ehPayment: 47,
              ehCount: 9,
              epPayment: 355,
              epCount: 59
            },
            year: '1431'
          }
        ],
        keyPersonnel: [
          {
            email: 'bob@thebuilder.net',
            expanded: false,
            hasCosts: true,
            isPrimary: false,
            name: 'Bob the Builder',
            percentTime: 0.37,
            position: 'Builder',
            costs: [{ cost: 50, year: '1903' }, { cost: 73293, year: '2018' }]
          }
        ],
        narrativeHIE: 'hie hie hie',
        narrativeHIT: 'hit hit hit',
        narrativeMMIS: 'mmis mmis mmis',
        pointsOfContact: 'people to talk to',
        previousActivityExpenses: [
          {
            hithie: 'pa hithie',
            mmis: 'pa mmis',
            year: '1431'
          }
        ],
        previousActivitySummary: 'last time on Batman...',
        programOverview: 'doing the moop moop',
        stateProfile: 'big, lots of dirt and trees and stuff',
        years: ['1431']
      });
    });
  });
});
