/**
 * 列表整单DS
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const toBeSubmitCodeList = [
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.TO_SUBMIT_SEARCH',
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.TO_SUBMIT_LIST',
];

const allCodeList = [
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.ALL_SEARCH',
  'SSLM.SUPPLY_ABILITY_DOC.SUPPLIER_WHOLE_ORDER.ALL_LIST',
];

const getCommonFields = () => [
  {
    name: 'abilityReqStatus',
    label: intl.get('hzero.common.common.status').d('状态'),
  },
  {
    name: 'option',
    label: intl.get('hzero.common.button.action').d('操作'),
  },
  {
    name: 'abilityReqNum',
    label: intl.get('sslm.common.model.applicationNumber').d('申请单号'),
  },
  {
    name: 'supplierCompanyName',
    label: intl.get('sslm.common.company').d('公司'),
  },
  {
    name: 'companyName',
    label: intl.get('sslm.common.view.common.customer').d('客户'),
  },
  {
    name: 'createdUserName',
    label: intl.get('hzero.common.creationName').d('创建人'),
  },
  {
    name: 'creationDate',
    type: 'dateTime',
    label: intl.get('hzero.common.creationDate').d('创建时间'),
  },
];
/**
 * 待提交 dataSet
 * @returns
 */
const getToBeSubmitDs = () => ({
  primaryKey: 'abilityReqId',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: getCommonFields(),
  record: {
    dynamicProps: {
      selectable: record => ['NEW', 'REJECTED'].includes(record.get('abilityReqStatus')),
    },
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/sup/to-submit`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: toBeSubmitCodeList.join(','),
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs`,
        method: 'DELETE',
        data: data && data.map(n => n.abilityReqId),
      };
    },
  },
});

/**
 * 全部 dataSet
 * @returns
 */
const getWholeOrderAllDs = () => ({
  primaryKey: 'abilityReqId',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: getCommonFields(),
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/sup/all`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: allCodeList.join(','),
        },
      };
    },
  },
});

export { getToBeSubmitDs, getWholeOrderAllDs };
