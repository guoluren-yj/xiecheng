/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-28 15:12:55
 * @LastEditors: 杨一昊 yihao.yang@going-link.com
 * @LastEditTime: 2022-07-28 15:15:20
 * @FilePath: /srm-front-sslm/src/routes/EnterpriseCertificationApproval/stores/indexDS.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

const certificationApprovalDS = () => ({
  selection: false,
  dataToJSON: 'selected',
  pageSize: 20,
  autoCount: false,
  fields: [
    {
      name: 'companyNum',
      label: intl.get('spfm.certificationApproval.model.certification.companyNum').d('企业编码'),
    },
    {
      name: 'companyName',
      label: intl.get('spfm.certificationApproval.model.certification.company').d('企业名称'),
    },
    {
      name: 'tenantName',
      label: intl.get('sslm.certificationApproval.model.certification.tenant').d('所属租户'),
    },
    {
      name: 'reqStatus',
      label: intl.get('sslm.certificationApproval.model.certification.status').d('状态'),
    },
    {
      name: 'domesticForeignRelationMeaning',
      label: intl.get('spfm.certificationApproval.model.certification.Relation').d('认证地区'),
    },

    {
      name: 'unifiedSocialCode',
      label: intl
        .get('spfm.certificationApproval.model.certification.SocialCode')
        .d('统一社会信用代码'),
    },
    {
      name: 'dunsCode',
      label: intl.get('spfm.certificationApproval.model.certification.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('spfm.certificationApproval.model.certification.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
    },
    {
      name: 'legalRepName',
      label: intl
        .get('spfm.certificationApproval.model.certification.legalRepName')
        .d('法定代表人'),
    },
    {
      name: 'saleName',
      label: intl.get('sslm.certificationApproval.model.certification.applicant').d('申请人'),
    },
    {
      name: 'submitDate',
      type: 'dateTime',
      label: intl.get('spfm.certificationApproval.model.certification.processDate').d('申请时间'),
    },
    {
      name: 'approveMethodMeaning',
      label: intl
        .get('spfm.certificationApproval.model.certification.tenantApproval')
        .d('审批方式'),
    },

    {
      name: 'registerUrlTenantName',
      label: intl
        .get('spfm.certificationApproval.model.certification.tenantName')
        .d('注册域名所属租户'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new/submited`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: 'SSLM.CERTIFICATION_APPROVAL_LIST.SEARCH_BAR',
        },
        data,
      };
    },
  },
});

export { certificationApprovalDS };
