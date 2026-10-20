import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SWBH } from '@/routes/components/utils/config';

const SearchDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'keyword',
      type: 'string',
      label: intl.get('srm.common.view.placeholder.KeywordSearch').d('请输入单号、标题、供应商、创建人等关键词搜索'),
    },
  ],
});
// RFI
const synthesesHeaderDS = (currentCarousel) => ({
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
  queryParameter: {
    cardCode: currentCarousel,
  },
  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;

      return {
        url: `${SRM_SWBH}/v1/${getCurrentOrganizationId()}/card-search/draft/query`,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          ...params,
        }),
      };
    },
  },
});

const synthesesTableDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`srm.common.model.common.companyName`).d('公司'),
    },
  ],
});

export { SearchDS, synthesesHeaderDS, synthesesTableDS };
