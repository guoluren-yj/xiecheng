import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const basicFormDS = () => ({
  fields: [
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'sourceCategoryMeaning',
      label: intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      label: intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式'),
    },
    {
      name: 'expertScoreTypeMeaning',
      label: intl.get(`ssrc.expertScoring.view.message.title.expertScore`).d('专家评分'),
    },
    {
      name: 'openBidOrderMeaning',
      label: intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制'),
    },
    {
      name: 'reviewDisplayFlag',
      type: 'number',
    },
  ],
});

const reviewTableDS = () => {
  return {
    selection: false,
    autoQuery: false,
    primaryKey: 'quotationHeaderId',
    paging: false,
    fields: [
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.supplierCompanysName').d('供应商名称'),
      },
      {
        name: 'summaryReviewResult',
        type: 'string',
        label: intl.get(`ssrc.common.complianceReviewResults`).d('符合性审查结果'),
      },
      {
        name: 'reviewResultGroup',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {} } = data || {};
        const { organizationId, customizeUnitCode, ...resetData } = commonProps || {};
        const newParams = {
          ...(params || {}),
          customizeUnitCode,
        };

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/evaluate-summary/review`,
          method: 'POST',
          params: newParams,
          data: resetData,
        };
      },
    },
  };
};

export { basicFormDS, reviewTableDS };
