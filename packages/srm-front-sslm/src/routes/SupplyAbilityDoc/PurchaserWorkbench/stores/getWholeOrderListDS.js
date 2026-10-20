/**
 * 列表整单DS
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

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
    name: 'initiateCampMeaning',
    label: intl.get('sslm.supplyAbilityDoc.model.supplyAbility.reqInitiator').d('申请单发起方'),
  },
  {
    name: 'supplierCompanyName',
    label: intl.get('sslm.common.supplier').d('供应商'),
  },
  {
    name: 'companyName',
    label: intl.get('sslm.common.company').d('公司'),
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
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/to-submit`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.TO_SUBMIT_SEARCH,SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.TO_SUBMIT_LIST',
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
 * 审批中 dataSet
 * @returns
 */
const getApprovalDs = () => ({
  primaryKey: 'abilityReqId',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: getCommonFields(),
  record: {
    dynamicProps: {
      selectable: record =>
        ['WAIT_APPROVAL', 'REJECTED_WFL'].includes(record.get('abilityReqStatus')),
    },
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/to-approval`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.APPROVAL_SEARCH,SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.APPROVAL_LIST',
        },
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
        url: `${SRM_SSLM}/v1/${organizationId}/supply-ability-change-reqs/all`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.ALL_SEARCH,SUPPLY_ABILITY_DOC.PURCHASER_WHOLE_ORDER.ALL_LIST',
        },
      };
    },
  },
});

export { getToBeSubmitDs, getApprovalDs, getWholeOrderAllDs };
