/*
 * @Date: 2023-08-24 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getIndexDS = () => ({
  pageSize: 20,
  cacheSelection: true,
  dataToJSON: 'selected',
  primaryKey: 'changeReqId',
  fields: [
    {
      name: 'reqStatusMeaning',
      label: intl.get('sslm.enterpriseInform.model.application.applicationState').d('申请状态'),
    },
    {
      name: 'changeReqNumber',
      label: intl.get('sslm.enterpriseInform.model.application.applicationNum').d('申请单号'),
    },
    {
      name: 'changeLevelMeaning',
      label: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseNum').d('企业编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'partnerCompanyName',
      label: intl.get('sslm.enterpriseInform.model.application.company').d('对应变更采购方'),
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.enterpriseInform.model.application.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.enterpriseInform.model.application.creationDate').d('创建日期'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'webUrl',
      label: intl.get('sslm.common.domainName.webUrl').d('来源域名'),
    },
  ],
  record: {
    dynamicProps: {
      selectable: record =>
        ['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(record.get('reqStatus')),
    },
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/new`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.ENTERPRISE_INFORM_CHANGE_NEW.LIST.SEARCH_BAR,SSLM.ENTERPRISE_INFORM_CHANGE_NEW.LIST.TABLE',
        },
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change`,
      method: 'DELETE',
      data: data && data.map(n => n.changeReqId),
    }),
  },
});
