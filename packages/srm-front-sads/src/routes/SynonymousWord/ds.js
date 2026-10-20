import intl from 'utils/intl';

const tableDS = () => ({
  autoQuery: true,
  cacheSelection: true,
  primaryKey: 'synonymousId',
  pageSize: 20,
  fields: [
    {
      label: intl.get('sads.synonymousWord.model.wordsCode').d('词组编码'),
      name: 'synonymGroupCode',
    },
    {
      label: intl.get('sads.synonymousWord.model.wordsGroup').d('词组'),
      name: 'synonymGroup',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/sads/v1/search-synonymouss`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SYNONYMOUS_WORD.LIST.SEARCHBAR' },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/sads/v1/search-synonymouss`,
        data: {
          synonymousIdList: data.map((r) => r.synonymousId),
        },
        method: 'DELETE',
      };
    },
  },
});

const formDS = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('sads.synonymousWord.model.wordsCode').d('词组编码'),
      name: 'synonymGroupCode',
      disabled: true,
    },
    {
      label: intl.get('sads.synonymousWord.model.wordsGroup').d('词组'),
      name: 'synonymGroupList',
      multiple: true,
      required: true,
    },
  ],
  transport: {
    create: ({ data }) => {
      return {
        url: `/sads/v1/search-synonymouss`,
        data: data?.[0] || {},
        method: 'POST',
        headers: { responseType: 'text' },
      };
    },
  },
});

export { tableDS, formDS };
