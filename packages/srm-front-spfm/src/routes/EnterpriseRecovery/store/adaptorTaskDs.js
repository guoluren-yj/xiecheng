/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT} from 'utils/constants';

export function getModalDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'adminMess',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.adminMess')
          .d('租户管理员'),
      },
      {
        name: 'confirmRemark',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.confirmRemark')
          .d('申诉意见'),
      },
    ],
    selection: false,
    paging: false,
    transport: {
      read: (value) => {
        const { data = {} } = value;
        const { retrieveId } = data;
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves/list/inform/${retrieveId}`,
          method: 'GET',
        };
      },
    },
  };
}

export function getOprationTableDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'operateUserName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.operateUserName')
          .d('操作人'),
      },
      {
        name: 'actionTypeMeaning',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.actionType').d('动作'),
      },
      {
        name: 'actionContent',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.actionContent')
          .d('操作内容'),
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.creationDate').d('时间'),
      },
    ],
    selection: false,
    paging: false,
    transport: {
      read: (value) => {
        const { data = {} } = value;
        const { retrieveId } = data;
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves/action/${retrieveId}`,
          method: 'GET',
        };
      },
    },
  };
}

export function getListDs() {
  return {
    // autoQuery: true,
    dataToJSON: 'selected',
    pageSize: 20,
    record: {
      dynamicProps: {
        selectable: (record) => record.get('processStatus') === 'PENDING',
      },
    },
    fields: [
      {
        name: 'processStatusMeaning',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.processStatus').d('状态'),
        // ignore: 'always',
      },
      {
        name: 'retrieveNum',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.retrieveNum')
          .d('申请单号'),
      },
      {
        name: 'webUrlTenantName',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.webUrlTenant')
          .d('域名所属租户'),
      },
      {
        name: 'documentSourceMeaning',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.documentSource')
          .d('单据来源'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyName')
          .d('企业名称'),
      },
      {
        name: 'unifiedSocialCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.unifiedSocialCode')
          .d('统一社会信用码'),
      },
      {
        name: 'organizingInstitutionCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.organizingInstitutionCode')
          .d('组织机构代码'),
      },
      {
        name: 'dunsCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.dunsCode')
          .d('邓白氏编码'),
      },
      // {
      //   name: 'version',
      //   type: 'string',
      //   label: '版本号',
      // },
      {
        name: 'businessRegistrationNumber',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
      },
      {
        name: 'applicantName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantName')
          .d('申请人姓名'),
      },
      {
        name: 'phone',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.phone').d('手机号码'),
      },
      {
        name: 'email',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.email').d('邮箱'),
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.applyDate').d('申请日期'),
      },
      {
        name: 'adminSuggest',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.adminSuggest')
          .d('管理员意见'),
      },
      {
        name: 'opration',
        type: 'string',
        label: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ],
    queryFields: [
      {
        name: 'retrieveNum',
        display: true,
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.retrieveNum')
          .d('申请单号'),
      },
      {
        name: 'processStatus',
        display: true,
        defaultValue: 'PENDING',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.processStatus').d('状态'),
        lookupCode: 'SPFM.COMPANY_RETRIEVE_STATUS',
      },
      {
        name: 'companyName',
        display: true,
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyName')
          .d('企业名称'),
      },
      {
        name: 'applicantName',
        display: true,
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantName')
          .d('申请人姓名'),
      },
      {
        name: 'phone',
        display: true,
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.phone').d('手机号码'),
      },
      {
        name: 'email',
        display: true,
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.email').d('邮箱'),
      },
      {
        name: 'creationDate',
        display: true,
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
        range: true,
        label: intl
          .get(`spfm.enterpriseRecovery.model.enterpriseRecovery.creationDate`)
          .d('提交时间'),
      },
    ],
    transport: {
      read: ({ data = {}, params }) => {
        const {creationDate} = data;
        const otherParam={};
        if (creationDate) {
          const creationDateFrom = creationDate.split(",")[0];
          const creationDateTo = creationDate.split(",")[1];
          otherParam.creationDateFrom = creationDateFrom;
          otherParam.creationDateTo = creationDateTo;
        }
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves`,
          method: 'GET',
          params: {
            ...params,
            ...otherParam,
          },
        };
      },
    },
  };
}

export function getCompanyTableDs() {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'companyNum',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.verifiedCompanyCode')
          .d('已认证企业编码'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.verifiedCompanyName')
          .d('已认证企业名称'),
      },
      {
        name: 'unifiedSocialCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.unifiedSocialCode')
          .d('统一社会信用码'),
      },
      {
        name: 'organizingInstitutionCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.organizingInstitutionCode')
          .d('组织机构代码'),
      },
      {
        name: 'dunsCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.dunsCode')
          .d('邓白氏编码'),
      },
      {
        name: 'businessRegistrationNumber',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
      },
      {
        name: 'loginName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.createSubAccount')
          .d('新建子账户'),
      },
      {
        name: 'basicCompanyId',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { retrieveId } = data;
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves/company/${retrieveId}`,
          method: 'GET',
        };
      },
    },
  };
}

export function getRejectFormDS() {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'processRemark',
        required: true,
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.suggetion').d('审批意见'),
      },
    ],
  };
}
