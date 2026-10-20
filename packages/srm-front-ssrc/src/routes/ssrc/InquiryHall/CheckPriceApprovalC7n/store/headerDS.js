/**
 * 核价单 基础信息 + 成本备注 ds
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { INQUIRY, getCheckPriceName, Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const headerInfoDS = ({ sourceKey = INQUIRY, sectionFlag = false }) => ({
  primaryKey: 'rfxHeaderId',
  paging: false,
  fields: [
    {
      name: 'sourceCategoryMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'unitName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
    },
    {
      name: 'budgetAmount',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
    },
    {
      name: 'totalEstimatedAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
        .d('预估金额(含税)'),
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`).d('最高金额'),
    },
    {
      name: 'minSuggestedAmount',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`).d('最低金额'),
    },
    {
      name: 'totalNetEstimatedAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
        .d('预估金额(不含税)'),
    },
    {
      name: 'totalPrice2',
      label: sectionFlag
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
        : intl
            .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
              checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
            })
            .d('{checkPriceName}总金额'),
    },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'currencyCodeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
    },
    {
      name: 'projectBudgetAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.projectBudgetAmount`)
        .d('寻源项目预算金额'),
    },
    {
      name: 'projectEstimatedAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.projectEstimatedAmount`)
        .d('寻源项目预估金额(含税)'),
    },
    {
      name: 'projectNetEstimatedAmount',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.projectNetEstimatedAmount`)
        .d('寻源项目预估金额(不含税)'),
    },
    {
      name: 'rfxRemark',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
    },
    {
      name: 'internalRemark',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)'),
    },
    {
      name: 'pretrailRemark',
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
          checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
        })
        .d('{checkPriceName}备注'),
    },
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, {
          checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
    },
  ],
  transport: {
    read: ({ dataSet: { queryParameter } }) => {
      const { queryParams = {} } = queryParameter || {};
      const { rfxHeaderId, ...others } = queryParams || {};
      return {
        url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}`,
        method: 'GET',
        data: others,
      };
    },
  },
});

// 由于接口是同一个, 拆分ds 实际意义不大, 由于ds, 监测到具体的属性变更, 故不用担心效率!!!
const costRemarkDS = (sectionFlag, sourceKey = INQUIRY) => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      name: 'totalCost',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本'),
    },
    {
      name: 'projectTotalPrice',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`).d('寻源项目总金额'),
    },
    {
      name: 'totalPrice',
      label: sectionFlag
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
        : intl
            .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
              checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比'),
    },
    {
      name: 'costRemark',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注'),
    },
  ],
});

export { headerInfoDS, costRemarkDS };
