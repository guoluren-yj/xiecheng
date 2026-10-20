import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { amountFormatterOptions } from '@/routes/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const listLineDS = () => ({
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
      name: 'prTypeName',
      label: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
    },
    {
      name: 'title',
      label: intl.get(`${commonPrompt}.title`).d('标题'),
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
      width: 150,
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
    },
    {
      name: 'unitName',
      label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
    },
    { name: 'lotNum', label: intl.get(`${commonPrompt}.lotNum`).d('批次号') },
    {
      name: 'prSourcePlatformMeaning',
      label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
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
      type: 'currency',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },

    },
    {
      name: 'localCurrency',
      label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
    },
    {
      name: 'localCurrencyNoTaxSum',
      label: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
      type: 'currency',
      computedProps: { formatterOptions: ({ record, name }) => record.get('prSourcePlatform') === 'SRM' ? amountFormatterOptions({ record, name }) : undefined },

    },
    {
      name: 'remark',
      label: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
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
  //   }, // 标准的创建中这里是状态.
  //   {
  //     name: 'prSourcePlatform',
  //     label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
  //     lookupCode: 'SPRM.SRC_PLATFORM',
  //   },
  //   // {
  //   //   name: 'unitId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
  //   //   lovCode: 'SPRM.USER_DEPARTMENT',
  //   //   transformRequest: value => value && value.unitId,
  //   // },
  //   // {
  //   //   name: 'companyId',
  //   //   type: 'object',
  //   //   label: intl.get(`${commonPrompt}.companyName`).d('公司'),
  //   //   lovCode: 'SPFM.USER_AUTH.COMPANY',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: value => value && value.companyId,
  //   // },
  //   // {
  //   //   name: 'ouId',
  //   //   type: 'object',
  //   //   label: intl.get('entity.business.tag').d('业务实体'),
  //   //   lovCode: 'SPFM.USER_AUTH.OU',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: value => value && value.ouId,
  //   // },
  //   // {
  //   //   name: 'purchaseOrgId',
  //   //   type: 'object',
  //   //   label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
  //   //   lovCode: 'HPFM.PURCHASE_ORGANIZATION',
  //   //   lovPara: { tenantId: organizationId },
  //   //   transformRequest: value => value && value.purchaseOrgId,
  //   // },
  //   {
  //     name: 'prRequestedName',
  //     type: 'string',
  //     label: intl.get(`sprm.common.model.common.prRequestedName`).d('申请人'),
  //   },
  //   {
  //     name: 'requestDateStart',
  //     type: 'date',
  //     label: intl.get(`entity.organization.class.requestDateStart`).d('申请日期从'),
  //     max: 'requestDateEnd',
  //   },
  //   {
  //     name: 'requestDateEnd',
  //     type: 'date',
  //     label: intl.get(`entity.organization.class.requestDateEnd`).d('申请日期至'),
  //     min: 'requestDateStart',
  //   },
  //   {
  //     name: 'purchasePlatformQueryParam1',
  //     type: 'string',
  //     label: intl.get('sprm.common.model.prNumTitleCreator').d('采购申请单号、标题、创建人'),
  //   },
  //   {
  //     name: 'prStatusCode',
  //     type: 'string',
  //     label: intl.get('hzero.common.status').d('状态'),
  //     lookupCode: 'SPRM.PR_STATUS',
  //     multiple: true,
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
      const cuxQueryParams = dataSet.getState('cuxQueryParams') || {};
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-await-submit`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          ...cuxQueryParams,
          customizeUnitCode:
            'SPRM.PURCHASE_PLAFORM_BEFORESUBMIT.SEARCHBAR,SPRM.PURCHASE_PLAFORM_BEFORESUBMIT.LIST',
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

export { listLineDS };
