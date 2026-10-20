// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isEmpty } from 'lodash';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getDocTags } from '@/services/purchasePlatformService';
import { amountFormatterOptions, getBatchOperationFlag } from '@/routes/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';

const wholeDs = () => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'prHeaderId',
  autoLocateFirst: false,
  cacheSelection: true,
  fields: [
    {
      name: 'rpSourceFlag',
      label: intl.get(`${commonPrompt}.rpSourceFlag`).d('需求计划来源标识'),
      type: 'number',
    },
    {
      name: 'prStatusCode',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'displayPrNum',
      label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      type: 'string',
    },
    {
      name: 'operatorRecord',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'title',
      label: intl.get(`${commonPrompt}.title`).d('标题'),
    },
    {
      name: 'prTypeName',
      label: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
    },
    {
      name: 'prRequestedName',
      label: intl.get(`${commonPrompt}.prRequestedName`).d('申请人'),
    },
    {
      name: 'requestDate',
      label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
      type: 'date',
    },
    {
      name: 'createByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
    },
    {
      name: 'unitName',
      label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
    },
    {
      name: 'companyName',
      label: intl.get(`entity.company.tag`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`entity.business.tag`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'originalCurrency',
      label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
    },
    {
      name: 'headerPriceHiddenFlag',
    },
    {
      name: 'amount',
      label: intl.get(`${commonPrompt}.amount`).d('申请总额'),
      type: 'number',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },
    },
    {
      name: 'localCurrency',
      label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
    },
    {
      name: 'localCurrencyNoTaxSum',
      label: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
      type: 'number',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },

    },
    {
      name: 'prSourcePlatformMeaning',
      label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
    },
    {
      name: 'remark',
      label: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
    },
    {
      name: 'prNum',
      label: intl.get(`${commonPrompt}.prApplyNum`).d('SRM申请编号'),
    },
    { name: 'lotNum', label: intl.get(`${commonPrompt}.lotNum`).d('批次号') },
    {
      name: 'urgentFlag',
      label: intl.get(`${commonPrompt}.urgentFlag`).d('是否加急'),
    },
    {
      name: 'urgentDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.urgentDate`).d('加急时间'),
    },
    {
      name: 'closeStatusMeaning',
      label: intl.get(`${modelPrompt}.closedStatus`).d('关闭状态'),
    },
    {
      name: 'cancelStatusMeaning',
      label: intl.get(`${modelPrompt}.cancelledStatus`).d('取消状态'),
    },
    {
      name: 'labels',
      label: intl.get(`${commonPrompt}.docTags`).d('单据标签'),
    },
    {
      name: 'changedFlag',
      label: intl.get(`${commonPrompt}.changedFlag`).d('变更中'),
    },
    {
      name: 'evaluateFlag',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.needsAssessment`).d('需求评价'),
    },
  ],
  // queryFields: [
  //   {
  //     name: 'displayPrNum',
  //     type: 'string',
  //     label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
  //   },
  //   {
  //     name: 'title',
  //     type: 'string',
  //     label: intl.get(`${commonPrompt}.title`).d('标题'),
  //   },
  //   {
  //     name: 'creatorName',
  //     type: 'string',
  //     label: intl.get('entity.roles.creator').d('创建人'),
  //   },
  //   {
  //     name: 'prStatusCode',
  //     type: 'string',
  //     lookupCode: 'SPRM.PR_STATUS',
  //     label: intl.get('hzero.common.status').d('状态'),
  //   },
  //   {
  //     name: 'prSourcePlatform',
  //     label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
  //     lookupCode: 'SPRM.SRC_PLATFORM',
  //   },
  //   {
  //     name: 'creationDateFrom',
  //     type: 'time',
  //     label: intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从'),
  //     max: 'creationDateTo',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
  //   },
  //   {
  //     name: 'creationDateTo',
  //     type: 'time',
  //     label: intl.get(`${commonPrompt}.creationDateTo`).d('创建时间至'),
  //     min: 'creationDateFrom',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
  //   },
  //   {
  //     name: 'closeStatusCode',
  //     label: intl.get(`${modelPrompt}.closedStatus`).d('关闭状态'),
  //     lookupCode: 'SPRM.PR_CLOSE_STATUS',
  //   },
  //   {
  //     name: 'cancelStatusCode',
  //     label: intl.get(`${modelPrompt}.cancelledStatus`).d('取消状态'),
  //     lookupCode: 'SPRM.PR_CANCEL_STATUS',
  //   },
  //   // {
  //   //   name: 'unitId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
  //   //   lovCode: 'SPRM.USER_DEPARTMENT',
  //   //   transformRequest: (value) => value && value.unitId,
  //   // },
  //   {
  //     name: 'urgentFlag',
  //     label: intl.get(`${commonPrompt}.urgentFlag`).d('是否加急'),
  //     lookupCode: 'HPFM.FLAG',
  //   },
  //   // {
  //   //   name: 'companyId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.companyName`).d('公司'),
  //   //   lovCode: 'SPFM.USER_AUTH.COMPANY',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: (value) => value && value.companyId,
  //   // },
  //   // {
  //   //   name: 'purchaseOrgId',
  //   //   type: 'object',
  //   //   label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
  //   //   lovCode: 'HPFM.PURCHASE_ORGANIZATION',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: (value) => value && value.purchaseOrgId,
  //   // },
  //   // {
  //   //   name: 'purchaseAgentId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
  //   //   lovCode: 'SPRM.PURCHASE_AGENT',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: (value) => value && value.purchaseAgentId,
  //   // },
  //   {
  //     name: 'purchasePlatformQueryParam1',
  //     type: 'string',
  //     label: intl.get('sprm.common.model.prNumTitleCreator').d('采购申请单号、标题、创建人'),
  //   },
  //   {
  //     name: 'prStatusCodeList',
  //     type: 'string',
  //     label: intl.get('hzero.common.status').d('状态'),
  //     lookupCode: 'SPRM.PR_STATUS',
  //     multiple: true,
  //   },
  // ],
  transport: {
    read: ({ data, dataSet }) => {
      const { prStatusCodeList = [] } = data;
      const cuxQueryParams = dataSet.getState('cuxQueryParams') || {};
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-all`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          ...cuxQueryParams,
          prStatusCodeList: prStatusCodeList.join(','),
          customizeUnitCode:
            'SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.SEARCHBAR,SPRM.PURCHASE_PLAFORM_ALLBYWHOLE.LIST',
        }),
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
      const { records } = dataSet;
      getDocTags({
        query: {
          primaryKey: 'prHeaderId',
          entityCode: 'SPUC_AUTO_DOC_LABEL',
        },
        body: dataSet.toJSONData(),
      }).then((res) => {
        const list = getResponse(res);
        if (list) {
          records.forEach((record) => {
            const data = list.find((e) => e.primaryKey === record.get('prHeaderId'));
            if (data) {
              record.init({
                labels: data.labels,
              });
            }
          });
        }
      });
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workflowBusinessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

export { wholeDs };
