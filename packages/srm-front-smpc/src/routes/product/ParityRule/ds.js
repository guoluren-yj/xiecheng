// import intl from 'utils/intl';

// 表格ds
const tableDs = () => ({
  autoQuery: false,
  queryFields: [],
  fields: [],
  transport: {
    read: ({ data }) => {
      const { cid, ...other } = data;
      return {
        url: `/smpc/v1/productCompareRule/${cid}/showCompare`,
        method: 'GET',
        data: other,
      };
    },
  },
});

export { tableDs };
