import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 分数提醒配置DS
const getScoreReminderDS = ({ evalTplId, evalTplIndId, isEdit }) => ({
  primaryKey: 'tplIndRemindId',
  autoQuery: false,
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'remindScoreFrom',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.remindScoreFrom').d('提醒分数从'),
      required: true,
    },
    {
      name: 'remindScoreTo',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.remindScoreTo').d('提醒分数至'),
      required: true,
    },
    {
      name: 'remindDesc',
      label: intl.get('spfm.supplierKpiIndicator.model.supplier.remindDesc').d('提醒内容'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/${evalTplId}/indicators/${evalTplIndId}`,
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/${evalTplId}/indicators/${evalTplIndId}/delete`,
        method: 'DELETE',
        data,
      };
    },
    submit: ({ data }) => {
      const bodyParams =
        data.map(item => ({ ...item, evalTplId, evalTplIndId, tenantId: organizationId })) || [];
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-templates/${evalTplId}/indicators/${evalTplIndId}/operate`,
        method: 'POST',
        data: bodyParams,
      };
    },
  },
});

export { getScoreReminderDS };
