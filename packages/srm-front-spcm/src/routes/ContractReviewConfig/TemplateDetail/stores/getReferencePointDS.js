/**
 * 引用审查点
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getUnitCodes } from '../utils/utils';

const organizationId = getCurrentOrganizationId();

const getReferencePointDs = () => ({
  primaryKey: 'reviewPointId',
  cacheSelection: true,
  pageSize: 20,
  dataToJSON: 'selected',
  fields: [
    {
      name: 'reviewCode',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointCode').d('审查点编码'),
    },
    {
      name: 'reviewName',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointName').d('审查点'),
    },
    {
      name: 'routeNameMeaning',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointService').d('审查点服务'),
    },
    {
      name: 'routeUrl',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.pointURL').d('审查点URL'),
    },
    {
      name: 'riskTypeMeaning',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.riskType').d('风险类型'),
    },
    {
      name: 'riskLevelMeaning',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.riskLevel').d('风险等级'),
    },
    {
      name: 'validationTypeMeaning',
      type: 'string',
      lookupCode: '',
      label: intl.get('spcm.contractReview.model.contractReview.checkType').d('检查类型'),
    },
    {
      name: 'ignoreReasonFlag',
      label: intl
        .get('spcm.contractReview.model.contractReview.ignoringReason')
        .d('忽略时必填原因'),
    },
    {
      name: 'riskDescription',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.riskDesc').d('风险说明'),
    },
    {
      name: 'resolution',
      type: 'string',
      label: intl.get('spcm.common.model.common.modifySuggestion').d('修改建议'),
      // label: intl.get('spcm.contractReview.model.contractReview.resolution').d('解决方案'),
    },
    {
      name: 'ruleDescription',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.reviewRuleDesc').d('审查规则说明'),
    },
    {
      name: 'ruleSourceMeaning',
      type: 'string',
      lookupCode: '',
      label: intl
        .get('spcm.contractReview.model.contractReview.reviewRuleSource')
        .d('审查规则来源'),
    },
    {
      name: 'customCopyFlag',
      label: intl
        .get('spcm.contractReview.model.contractReview.copyReviewPoint')
        .d('复制预定义审查点'),
    },
    {
      name: 'copyReviewCode',
      label: intl.get('spcm.contractReview.model.contractReview.preReviewPoint').d('预定义审查点'),
    },
    {
      name: 'reviewTypeMeaning',
      type: 'string',
      label: intl.get('spcm.contractReview.model.contractReview.reviewType').d('审查类型'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/check-point-types/quote/page`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode: getUnitCodes.lineCreateModalCodes,
        },
        data: {},
      };
    },
  },
});

export { getReferencePointDs };
