import assurancesList from '../data/assurancesAndCompliance.yaml';

const initialAssurances = Object.entries(assurancesList).reduce(
  (acc, [name, regulations]) => ({
    ...acc,
    [name]: Object.keys(regulations).map(reg => ({
      title: reg,
      checked: '',
      explanation: ''
    }))
  }),
  {}
);

export default initialAssurances;
