/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-17 15:14:05
 */
import intl from 'utils/intl';
import { SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'srpm.common.model.common';

const listLineDS = () => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'rpHeaderId',
  autoLocateFirst: false,
  cacheModified: true,
  // cacheSelection: true,
  selection: false,
  fields: [
    {
      name: 'rpStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'displayRpNum',
      label: intl.get(`${commonPrompt}.rpNum`).d('需求计划单号'),
    },
    {
      name: 'templateCode',
      label: intl.get(`${commonPrompt}.templateCode`).d('计划模版编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`${commonPrompt}.templateName`).d('计划模版名称'),
    },
    {
      name: 'templateType',
      label: intl.get(`${commonPrompt}.templateType`).d('模版类型'),
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
      name: 'originalCurrency',
      label: intl.get('srpm.common.model.common.currency').d('币种'),
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
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan/list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          queryType: 'TO_SUBMIT',
          customizeUnitCode:
            'SRPM.RP_PLATFORM.BEFORESUBMIT.LIST,SRPM.RP_PLATFORM.BEFORESUBMIT_SEARCHBAR',
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
