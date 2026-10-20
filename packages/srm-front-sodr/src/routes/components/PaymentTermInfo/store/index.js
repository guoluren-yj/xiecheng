import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

const paymentTermInfo = () => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    primaryKey: 'poHeaderId',
    fields: [
      {
        name: 'fundTermId',
        label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
        type: 'object',
        lovCode: 'SBSM.TERM_HEADER',
        lovPara: { tenantId },
        transformResponse: (value, { fundTermId, fundTermName }) => {
          return value ? { termHeaderId: fundTermId, termName: fundTermName } : undefined;
        },
        transformRequest: (value) => value?.termHeaderId,
      },
      {
        name: 'fundTermName',
        bind: 'fundTermId.termName',
      },
      {
        name: 'fundTermIdDetail',
        label: intl.get('sodr.workspace.model.common.fundTermIdDetail').d('付款条款详情'),
      },
      {
        name: 'fundTermDimension',
        lookupCode: 'SPUC_FUND_PLAN_DIMENSION',
        label: intl.get('sodr.workspace.model.common.fundTermDimension').d('付款条款管控维度'),
      },
    ],
    events: {
      update: ({ dataSet }) => {
        dataSet.setState('updatedFlag', 1);
      },
    },
  };
};

export { paymentTermInfo };
