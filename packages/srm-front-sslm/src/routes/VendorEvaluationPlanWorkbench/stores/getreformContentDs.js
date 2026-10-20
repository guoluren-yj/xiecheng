import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getReformContentDs = ({ evalHeaderId }) => {
  return {
    fields: [
      {
        name: 'reformContent',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.scoreTable.label.reformContent')
          .d('整改内容'),
        required: true,
      },
      {
        name: 'problemTitle',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.scoreTable.label.problemTitle')
          .d('整改报告标题'),
      },
      {
        name: 'problemStatusMeaning',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.scoreTable.label.problemTitle')
          .d('单据状态'),
      },
      {
        name: 'problemNum',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.scoreTable.label.problemNum')
          .d('整改报告编号'),
      },
      {
        name: 'opteration',
        label: intl.get('sslm.vendorEvaluationPlanDetail.scoreTable.label.opteration').d('操作'),
      },
      {
        name: 'externalOrderId',
      },
    ],
    transport: {
      read: ({ params }) => ({
        url: `${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/eval-report/${evalHeaderId}`,
        method: 'POST',
        params: {
          ...params,
        },
        data: {
          orderSource: 'reportEval',
        },
      }),
    },
  };
};

export { getReformContentDs };
