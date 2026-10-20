import intl from 'utils/intl';
import { SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { c7nAmountFormatterOptions } from '@/routes/components/utils';

const commonPrompt = 'srpm.common.model.common';

const detailByHoldDS = () => ({
  autoQuery: false,
  pageSize: 20,
  dataToJSON: 'selected',
  primaryKey: 'rpLineId',
  autoLocateFirst: false,
  cacheModified: true,
  cacheSelection: true,
  autoQueryAfterSubmit: false,
  // selection: false,
  fields: [
    {
      name: 'rpLineStatus',
      lookupCode: 'SRPM.RP_LINE_STATUS',
      label: intl.get(`${commonPrompt}.rpLineStatus`).d('行状态'),
    },
    {
      name: 'disPlayRpNum',
      label: intl.get(`${commonPrompt}.rpNum`).d('需求计划单号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`${commonPrompt}.rpLineNum`).d('行号'),
    },
    {
      name: 'rpNumAndlineNum',
      label: intl.get(`${commonPrompt}.disPlayRpNumAndlineNum`).d('需求计划单号-行号'),
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
      name: 'unitName',
      label: intl.get(`${commonPrompt}.unitName`).d('部门'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`${commonPrompt}.planner`).d('计划员'),
    },
    {
      name: 'createdByName',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`entity.organization.class.inventory`).d('库存组织'),
    },
    {
      name: 'item',
      label: intl.get(`${commonPrompt}.item`).d('物料编码|物料名称'),
    },
    {
      name: 'categoryName',
      label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
    },
    {
      name: 'uomName',
      label: intl.get(`${commonPrompt}.uomName`).d('单位'),
    },
    {
      type: 'date',
      name: 'neededDate',
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
    },
    {
      name: 'quantity',
      label: intl.get(`${commonPrompt}.lineQuantity`).d('数量'),
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record?.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'taxIncludedUnitPrice',
      label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
      numberGrouping: true,
      type: 'number',
      dynamicProps: {
        formatterOptions: c7nAmountFormatterOptions(({ record }) =>
          record?.get('rpSourcePlatform') === 'REQUEST_PLAN'
            ? record?.get('defaultPrecision')
            : undefined
        ),
      },
    },
    {
      name: 'taxIncludedLineAmount',
      numberGrouping: true,
      type: 'currency',
      label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
      dynamicProps: {
        formatterOptions: c7nAmountFormatterOptions(({ record }) =>
          record?.get('rpSourcePlatform') === 'REQUEST_PLAN'
            ? record.get('financialPrecision')
            : undefined
        ),
      },
    },
    {
      name: 'remark',
      label: intl.get(`sprm.common.model.common.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${getCurrentOrganizationId()}/request-plan/line-list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          queryType: 'SUSPENDED',
          customizeUnitCode:
            'SRPM.RP_PLATFORM.DETAIL_HOLD.SEARCHBAR,SRPM.RP_PLATFORM.DETAIL_HOLD.LIST',
        }),
      };
    },
    submit: ({ dataSet }) => {
      const submitType = dataSet.getState('submitType');
      if (submitType === 'enable') {
        return {
          url: `${SRM_SRPM}/v1/${getCurrentOrganizationId()}/request-plan/batch-line-suspend-enable`,
          method: 'POST',
        };
      }
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

export { detailByHoldDS };
