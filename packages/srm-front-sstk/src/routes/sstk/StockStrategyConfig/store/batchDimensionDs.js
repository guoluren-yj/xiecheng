import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const batchDimensionDS = (noCheck, relationDimensionIds = [], params ={}) => ({
  autoCreate: false,
  paging: false,
  autoQuery: true,
  selection: noCheck ? false : 'multiple',
  fields: [
    {
      label: intl.get('sstk.stockConfig.model.status').d('状态'),
      name: 'enabledFlag',
    },
    {
      label: intl.get('sstk.stockConfig.model.dimensionCode').d('维度编码'),
      name: 'dimensionCode',
    },
    {
      label: intl.get('sstk.stockConfig.model.dimensionName').d('维度名称'),
      name: 'dimensionName',
    },
    {
      label: intl.get('sstk.stockConfig.model.sourceType').d('维度来源'),
      name: 'sourceType',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/stck/v1/${organizationId}/batch-dimensions/page`,
        method: 'GET',
        data: { ...data, ...params },
        // 过滤掉策略已维护的维度
        transformResponse(d) {
          try {
            const res = JSON.parse(d);
            const _content = (res.content || []).filter(f => !relationDimensionIds.includes(f.dimensionId));
            return {
              ...res,
              content: _content,
            };
          } catch (e) {
            console.log(e);
          }
          return null;
        },
      };
    },
  },
});

export default batchDimensionDS;