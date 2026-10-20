import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getIndexDS = ({ pcHeaderId, isEdit = false } = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'riskLevel',
      type: 'string',
      label: intl.get('spcm.common.model.common.riskLevel').d('风险等级'),
      lookupCode: 'SPCM_RISK_LEVEL',
      disabled: true,
    },
    {
      name: 'locationField',
      type: 'string',
      label: intl.get('spcm.common.model.common.positionInfo').d('定位信息'),
      disabled: true,
    },
    {
      name: 'riskDescription',
      label: intl.get('spcm.common.model.common.riskDesc').d('风险说明'),
      disabled: true,
    },
    {
      name: 'resolution',
      label: intl.get('spcm.common.model.common.modifySuggestion').d('修改建议'),
      disabled: true,
    },
    {
      name: 'ignoreReasonFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      disabled: true,
      label: intl.get('spcm.common.model.common.ignoringReasonRequired').d('忽略原因必填'),
      ignore: 'always',
    },
    {
      name: 'ignoreReason',
      type: 'string',
      label: intl.get('spcm.common.model.common.ignoreReason').d('忽略原因'),
      dynamicProps: {
        required: ({ record }) => !!isEdit && record.get('ignoreReasonFlag'),
      },
    },
    {
      name: 'ignoreLink',
      type: 'string',
      ignore: 'always',
      label: intl.get('spcm.common.model.common.ignoreReason').d('忽略原因'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('spcm.common.model.common.errorMessage').d('异常信息'),
      disabled: true,
    },
    {
      name: 'reviewResult',
      type: 'string',
      lookupCode: 'SPCM_CHECK_RESULT_STATUS',
      disabled: true,
      label: intl.get('spcm.common.model.common.reviewResult').d('审查结果'),
    },
    {
      name: 'isEdit',
      defaultValue: isEdit,
    },
  ],
  transport: {
    read: ({ params, data }) => {
      const { queryParams = {}, ...rest } = data || {};
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-point-results/list`,
        method: 'GET',
        params: {
          ...params,
          ...rest,
          ...queryParams,
          pcHeaderId,
          // page: 0,
          // size: 0,
        },
        data: {},
      };
    },
  },
});

export { getIndexDS };
