import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

import { getCheckPriceName } from '@/utils/globalVariable';

const basicInfoDataSet = (options = {}) => {
  const { sectionFlag, bidFlag } = options || {};

  return {
    primaryKey: 'rfxHeaderId',
    dataToJSON: 'all',
    fields: [
      {
        name: 'templateNum',
        label: intl.get(`ssrc.common.view.templateCode`).d('模板编码'),
        disabled: true,
      },
      {
        name: 'companyName',
        disabled: true,
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'sourceCategory',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
      },
      {
        name: 'sourceMethod',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
      },
      {
        name: 'savingAmount',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingAmount`).d('节支金额'),
      },
      {
        name: 'savingRatio',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingRatio`).d('节支率'),
      },
      {
        name: 'maxSuggestedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`)
          .d('最高金额'),
      },
      {
        name: 'minSuggestedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`)
          .d('最低金额'),
      },

      {
        name: 'purOrganizationName',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
      },

      {
        name: 'unitName',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      },
      {
        name: 'budgetAmount',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
      },
      {
        name: 'totalEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
          .d('预估金额(含税)'),
      },

      {
        name: 'totalNetEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
          .d('预估金额(不含税)'),
      },
      {
        name: 'currencyCodeMeaning',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      },
      {
        name: 'projectBudgetAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectBudgetAmount`)
          .d('寻源项目预算金额'),
      },
      {
        name: 'projectEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectEstimatedAmount`)
          .d('寻源项目预估金额(含税)'),
      },
      {
        name: 'projectNetEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectNetEstimatedAmount`)
          .d('寻源项目预估金额(不含税)'),
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
        disabled: true,
      },
      {
        name: 'sourceProjectName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`).d('寻源项目名称'),
        disabled: true,
      },

      {
        name: 'rfxRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
      },
      {
        name: 'internalRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)'),
      },
      {
        name: 'pretrailRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注'),
      },
      {
        name: 'pretrialUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`).d('初审附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-pretrial',
        readOnly: true,
      },
      {
        name: 'checkRemark',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commomCheckRemark`, {
            checkPriceName: getCheckPriceName(bidFlag),
          })
          .d('{checkPriceName}备注'),
        disabled: true,
      },
      {
        name: 'totalCost',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本'),
        type: 'number',
      },
      {
        name: 'projectTotalPrice',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`).d('寻源项目总金额'),
      },
      {
        name: 'totalPrice',
        type: 'number',
        label: sectionFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                checkPriceName: getCheckPriceName(bidFlag),
              })
              .d('{checkPriceName}总金额'),
      },
      {
        name: 'totalPrice',
        type: 'number',
        label: sectionFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                checkPriceName: getCheckPriceName(bidFlag),
              })
              .d('{checkPriceName}总金额'),
      },
      {
        name: 'overCostFlag',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本'),
      },
      {
        name: 'overCostPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额'),
      },
      {
        name: 'overCostScale',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比'),
      },
      {
        name: 'costRemark',
        maxLength: 480,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注'),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, {
            checkPriceName: getCheckPriceName(bidFlag),
          })
          .d('{checkPriceName}附件'),
        name: 'checkAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        readOnly: true,
      },
      {
        name: 'applicationScopeFlag',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
      },
      {
        name: 'totalCost',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本'),
      },
      {
        name: 'projectTotalPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`).d('寻源项目总金额'),
      },
      {
        name: 'totalPrice',
        label: sectionFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                checkPriceName: getCheckPriceName(bidFlag),
              })
              .d('{checkPriceName}总金额'),
      },
      {
        name: 'overCostFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本'),
      },
      {
        name: 'overCostPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额'),
      },
      {
        name: 'overCostScale',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比'),
      },
      {
        name: 'costRemark',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注'),
      },
    ],
  };
};

export { basicInfoDataSet };
