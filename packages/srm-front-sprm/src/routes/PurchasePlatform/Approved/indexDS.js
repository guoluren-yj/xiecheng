// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { amountFormatterOptions } from '@/routes/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const approvedDs = () => ({
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
      label: intl.get(`entity.roles.creator`).d('创建人'),
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
      name: 'linePriceHiddenFlag',
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
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.urgentDate`).d('加急时间'),
    },
    {
      name: 'closeStatusMeaning',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.closedStatus`).d('关闭状态'),
    },
    {
      name: 'cancelStatusMeaning',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.cancelledStatus`).d('取消状态'),
    },
    {
      name: 'operable',
      label: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
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
  //     label: intl.get(`entity.roles.creator`).d('创建人'),
  //   },
  //   {
  //     name: 'prSourcePlatform',
  //     label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
  //     lookupCode: 'SPRM.SRC_PLATFORM',
  //   },

  //   {
  //     name: 'creationDateFrom',
  //     type: 'date',
  //     label: intl.get(`${commonPrompt}.creationDateStart`).d('创建时间从'),
  //     max: 'creationDateTo',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
  //   },
  //   {
  //     name: 'creationDateTo',
  //     type: 'date',
  //     label: intl.get(`${commonPrompt}.creationDateTo`).d('创建时间至'),
  //     min: 'creationDateFrom',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
  //   },
  //   // {
  //   //   name: 'unitId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
  //   //   lovCode: 'SPRM.USER_DEPARTMENT',
  //   //   transformRequest: (value) => value && value.unitId,
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
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-approved`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          ...cuxQueryParams,
          prStatusCodeList: prStatusCodeList.join(','),
          customizeUnitCode:
            'SPRM.PURCHASE_PLAFORM_APPROVED.SEARCHBAR,SPRM.PURCHASE_PLAFORM_APPROVED.LIST',
        }),
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

export { approvedDs };
