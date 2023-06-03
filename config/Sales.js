import { StatesInUS } from '~/config/StatesInUS';
import { countries } from '~/config/Countries';

const paidOrUnpaidOrgsSearchFilters = {
  orgName: '', // cal -> is actually the search term
  orgId: '', // 627b8af52bf1c1f0750c92ea
  orgState: '', // TX
  orgType: '', // org
  page: 1,
  pageSize: 20,
};

const salesContants = {
  planTypes: {
    'K-12': {
      DISTRICT: 'district',
      SCHOOL: 'school',
      DEPARTMENT: 'department',
      INTERNATIONAL: 'international',
    },
    Others: {
      MISC: 'misc',
    },
  },
  paidOrUnpaidOrgsSearchFilters,
  paidOrgsSearchFilters: {
    ...paidOrUnpaidOrgsSearchFilters,
    exist: ['paidOrgId'],
  },
  unpaidOrgsSearchFilters: {
    ...paidOrUnpaidOrgsSearchFilters,
    notExist: ['paidOrgId'],
  },
  schoolTypes: [
    {
      title: 'Public',
      value: 'public',
    },
    {
      title: 'Private',
      value: 'private',
    },
  ],
  miscTypes: [
    {
      title: 'Vocational',
      value: 'vocational',
    },
    {
      title: 'Higher Education',
      value: 'higher education',
    },
  ],
  statesListForSelect: StatesInUS.map((state) => ({
    title: `${state.abbreviation}-${state.name}`,
    value: state.abbreviation,
  })),
  countryListForSelect: countries.map((country) => ({
    title: `${country.Code}-${country.Name}`,
    value: country.Code,
  })),
};

export default salesContants;
