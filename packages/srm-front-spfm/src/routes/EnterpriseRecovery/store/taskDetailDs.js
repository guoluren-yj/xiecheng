/**
 * index.js
 * 适配器列表
 * @date: 2020-12-30
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';

export function getBaseDs() {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'processRemark',
        type: 'string',
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
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantPhone')
          .d('申请人手机号'),
      },
      {
        name: 'email',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.applicantEmail')
          .d('申请人邮箱'),
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.applyDate').d('申请日期'),
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
      {
        name: 'businessRegistrationNumber',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
      },
      {
        name: 'retrieveId',
        type: 'string',
      },
      {
        name: 'adminSuggest',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.viewAdminSuggest')
          .d('管理员意见'),
        bind: 'retrieveId',
      },
      {
        name: 'attachmentType',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.attachmentType')
          .d('附件类型'),
      },
      {
        name: 'attachmentUuid',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.attachmentUuid')
          .d('查看附件'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.remark').d('附件备注'),
        // ignore: 'always',
      },
      {
        name: 'purchasePartner',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchase')
          .d('采购方企业名称'),
      },
      {
        name: 'purchaseUnifiedSocialCode',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseUnifiedCode')
          .d('采购方企业统一社会信用代码'),
      },
      {
        name: 'purchaseDunsCode',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseDunsCode')
          .d('采购方邓白氏编码'),
      },
      {
        name: 'purchaseBusinessRegistrationNumber',
        label: intl
          .get(
            'spfm.enterpriseRecovery.model.enterpriseRecovery.purchaseBusinessRegistrationNumber'
          )
          .d('采购方企业注册登记号/税号'),
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { id } = data;
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves/${id}`,
          method: 'GET',
        };
      },
      submit: (a = {}) => {
        const { data = [], dataSet = {} } = a;
        const body = data[0] || {};
        const { processRemark = '' } = body;
        const { queryParameter = {} } = dataSet;
        const { params = {} } = queryParameter;
        const { flag, retrieveId, ...otherParams } = params;
        if (flag === 'reject' && !processRemark) {
          notification.warning({
            message: intl
              .get('spfm.enterpriseRecovery.model.enterpriseRecovery.remarkMust')
              .d('拒绝意见必输'),
          });
          return null;
        }
        return flag === 'pass'
          ? {
              url: `${SRM_PLATFORM}/v1/company-retrieves/approve`,
              method: 'POST',
              data: { retrieveId, processRemark, ...otherParams },
            }
          : flag === 'reject'
          ? {
              url: `${SRM_PLATFORM}/v1/company-retrieves/reject/${retrieveId}`,
              method: 'POST',
              data: { processRemark, ...otherParams },
            }
          : flag === 'notice'
          ? {
              url: `${SRM_PLATFORM}/v1/company-retrieves/inform`,
              method: 'POST',
              data: { retrieveId, ...otherParams },
            }
          : null;
      },
    },
  };
}

export function getCompanyDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'basic',
        type: 'object',
      },
      {
        name: 'business',
        type: 'object',
      },
      {
        name: 'contactList',
        type: 'object',
      },
      {
        name: 'addressList',
        type: 'object',
      },
      {
        name: 'action',
        type: 'object',
      },
      {
        name: 'bankAccountList',
        type: 'object',
      },
      {
        name: 'financeList',
        type: 'object',
      },
      {
        name: 'attachmentList',
        type: 'object',
      },
      {
        name: 'invoice',
        type: 'object',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.companyName').d('名称'),
        bind: 'basic.companyName',
      },
      {
        name: 'companyEnglishName',
        type: 'string',
        label: intl
          .get('spfm.certificationApproval.model.detailForm.englishName')
          .d('企业英文名称'),
        bind: 'basic.companyEnglishName',
      },
      {
        name: 'companyTypeMeaning',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.TypeMeaning').d('企业类型'),
        bind: 'basic.companyTypeMeaning',
      },
      {
        name: 'registeredCountryName',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.country').d('注册国家'),
        bind: 'basic.registeredCountryName',
      },
      {
        name: 'registeredRegionName',
        type: 'string',
        label: intl
          .get('spfm.certificationApproval.model.detailForm.registeredRegion')
          .d('注册地址'),
        bind: 'basic.registeredRegionName',
      },
      {
        name: 'legalRepName',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.legalRepName').d('法定代表人'),
        bind: 'basic.legalRepName',
      },
      {
        name: 'registeredCapital',
        type: 'string',
        label: intl.get('spfm.enterprise.view.message.registeredCapital').d('注册资本'),
        bind: 'basic.registeredCapital',
      },
      {
        name: 'currencyName',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.currencyName').d('注册币种'),
        bind: 'basic.currencyName',
      },
      {
        name: 'licenceUrl',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.licenceUrl').d('企业注册证书'),
        bind: 'basic.licenceUrl',
      },
      {
        name: 'buildDate',
        type: 'date',
        label: intl.get('spfm.certificationApproval.model.detailForm.buildDate').d('成立日期'),
        bind: 'basic.buildDate',
      },
      {
        name: 'licenceEndDate',
        type: 'date',
        label: intl.get('spfm.certificationApproval.model.detailForm.licenceEndDate').d('营业期限'),
        bind: 'basic.licenceEndDate',
      },
      {
        name: 'longTermFlag',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.longTermFlag').d('长期'),
        bind: 'basic.longTermFlag',
      },
      {
        name: 'businessScope',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.businessScope').d('经营范围'),
        bind: 'basic.businessScope',
      },
      {
        name: 'shortName',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.shortName').d('简称'),
        bind: 'basic.shortName',
      },
      {
        name: 'domesticForeignRelation',
        type: 'number',
        label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        bind: 'basic.domesticForeignRelation',
      },
      {
        name: 'certificationType',
        lookupCode: 'SSLM_CERTIFICATION_TYPE',
        label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
      },
      {
        name: 'certificationRegionId',
        type: 'object',
        lovCode: 'HPFM.COUNTRY',
        label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        transformRequest: (value) => (value ? value.countryId : null),
        transformResponse: (value, data) =>
          value
            ? {
                countryId: data.certificationRegionId,
                countryName: data.certificationRegionIdMeaning,
              }
            : null,
      },
      {
        name: 'dunsCode',
        type: 'string',
        label: 'D-U-N-S',
        // ignore: 'always',
        bind: 'basic.dunsCode',
      },
      {
        name: 'organizingInstitutionCode',
        type: 'string',
        label: intl
          .get('spfm.supplier.model.supplier.erp.organizingInstitutionCode')
          .d('组织机构代码'),
        bind: 'basic.organizingInstitutionCode',
      },
      {
        name: 'taxpayerTypeMeaning',
        type: 'string',
        label: intl.get('spfm.certificationApproval.model.detailForm.taxpayerType').d('纳税人标识'),
        bind: 'basic.taxpayerTypeMeaning',
      },
      {
        name: 'businessRegistrationNumber',
        type: 'string',
        label: intl
          .get('spfm.certificationApproval.model.detailForm.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
        bind: 'basic.businessRegistrationNumber',
      },
      {
        name: 'unifiedSocialCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.unifiedSocialCode')
          .d('统一社会信用码'),
        bind: 'basic.unifiedSocialCode',
      },
      {
        name: 'businessTypeValue',
        type: 'object',
        label: intl
          .get('spfm.certificationApproval.model.detailForm.primaryIdentity')
          .d('主要身份'),
      },
      {
        name: 'purchaseFlag',
        type: 'number',
        bind: 'business.purchaseFlag',
      },
      {
        name: 'saleFlag',
        type: 'number',
        bind: 'business.saleFlag',
      },
      {
        name: 'serviceTypeValue',
        type: 'object',
        bind: 'business.serviceTypeValue',
        label: intl.get('spfm.certificationApproval.model.detailForm.businessNature').d('经营性质'),
      },
      {
        name: 'interBusinessShield',
        type: 'number',
        label: intl
          .get(`spfm.enterprise.model.message.interBusinessShield`)
          .d('不允许其他企业找到我'),
        bind: 'business.interBusinessShield',
      },
      {
        name: 'industryList',
        type: 'object',
        label: intl.get('spfm.certificationApproval.model.detailForm.industryList').d('行业类型'),
        bind: 'business.industryList',
      },
      {
        name: 'industryCategoryList',
        type: 'object',
        label: intl.get('spfm.certificationApproval.model.detailForm.categoryList').d('主营品类'),
        bind: 'business.industryCategoryList',
      },
      {
        name: 'serviceAreaList',
        type: 'object',
        label: intl
          .get('spfm.certificationApproval.model.detailForm.serviceAreaList')
          .d('送货服务范围'),
        bind: 'business.serviceAreaList',
      },
      {
        label: intl.get('spfm.invoice.view.message.invoiceHeader').d('发票头：'),
        name: 'invoiceHeader',
        bind: 'invoice.invoiceHeader',
      },
      {
        label: intl.get('spfm.invoice.view.message.taxRegistrationNumber').d('税务登记号：'),
        name: 'taxRegistrationNumber',
        bind: 'invoice.taxRegistrationNumber',
      },
      {
        label: intl.get('spfm.invoice.view.message.depositBank').d('开户行：'),
        name: 'depositBank',
        bind: 'invoice.depositBank',
      },
      {
        label: intl.get('spfm.invoice.view.message.bankAccountNum').d('开户行账号：'),
        name: 'bankAccountNum',
        bind: 'invoice.bankAccountNum',
      },
      {
        label: intl.get('spfm.invoice.view.message.taxRegistrationAddress').d('税务登记地址：'),
        name: 'taxRegistrationAddress',
        bind: 'invoice.taxRegistrationAddress',
      },
      {
        label: intl.get('spfm.invoice.view.message.taxRegistrationPhone').d('税务登记电话：'),
        name: 'taxRegistrationPhone',
        bind: 'invoice.taxRegistrationPhone',
      },
      {
        label: intl.get('spfm.invoice.view.message.receiveMail').d('收票人邮箱：'),
        name: 'receiveMail',
        bind: 'invoice.receiveMail',
      },
      {
        label: intl.get('spfm.invoice.view.message.receivePhone').d('收票人手机号：'),
        name: 'receivePhone',
        bind: 'invoice.receivePhone',
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { id } = data;
        return {
          url: `${SRM_PLATFORM}/v1/companies/latest`,
          method: 'GET',
          data: { companyId: id },
        };
      },
    },
  };
}
export function getAttachmentUuidDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('entity.attachment.type').d('附件类型'),
        name: 'attachmentFileType',
        bind: 'attachamentList.attachmentFileType',
        group: 10,
      },
      {
        label: intl.get('entity.attachment.description').d('附件描述'),
        name: 'description',
        bind: 'attachamentList.description',
        group: 10,
      },
      {
        label: intl.get('spfm.certificationApproval.model.attachmentTable.endDate').d('文件到期日'),
        width: 150,
        // align: 'center',
        name: 'endDate',
        bind: 'attachamentList.endDate',
        group: 10,
      },
      {
        label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
        width: 150,
        // align: 'center',
        name: 'uploadDate',
        bind: 'attachamentList.uploadDate',
        group: 10,
      },
      {
        label: intl.get('spfm.attachment.model.attachment.filesContent').d('附件内容'),
        width: 120,
        name: 'attachmentUuid',
        bind: 'attachamentList.attachmentUuid',
        group: 10,
      },
    ],
  };
}
export function getFinanceInfoDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('spfm.certificationApproval.model.financeTable.year').d('年份'),
        width: 70,
        name: 'year',
        bind: 'financeList.year',
      },
      {
        name: 'currencyName',
        label: intl.get('spfm.common.model.currency').d('币种'),
        bind: 'financeList.currencyName',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.totalAssets')
          .d('企业总资产(万元)'),
        width: 180,
        name: 'totalAssets',
        bind: 'financeList.totalAssets',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.totalLiab')
          .d('总负债(万元)'),
        width: 150,
        name: 'totalLiabilities',
        bind: 'financeList.totalLiabilities',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.currentAssets')
          .d('流动资产(万元)'),
        width: 150,
        name: 'currentAssets',
        bind: 'financeList.currentAssets',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.liabilities')
          .d('流动负债(万元)'),
        width: 150,
        name: 'currentLiabilities',
        bind: 'financeList.currentLiabilities',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.revenue')
          .d('营业收入(万元)'),
        width: 150,
        name: 'revenue',
        bind: 'financeList.revenue',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.netProfit')
          .d('净利润(万元)'),
        width: 150,
        name: 'netProfit',
        bind: 'financeList.netProfit',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.liabilityRatio')
          .d('资产负债率'),
        width: 150,
        name: 'assetLiabilityRatio',
        bind: 'financeList.assetLiabilityRatio',
      },
      {
        label: intl.get('spfm.certificationApproval.model.financeTable.currentRatio').d('流动比率'),
        // align: 'right',
        width: 120,
        name: 'currentRatio',
        bind: 'financeList.currentRatio',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.financeTable.totalRatio')
          .d('总资产收益率'),
        // align: 'right',
        width: 150,
        name: 'totalAssetsEarningsRatio',
        bind: 'financeList.totalAssetsEarningsRatio',
      },
    ],
  };
}
export function getBankInfoDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.bankCountryName').d('国家'),
        width: 150,
        name: 'bankCountryName',
        bind: 'bankAccountList.bankCountryName',
      },
      {
        label: intl.get(`spfm.bank.model.bank.bankInternalCode`).d('银行（国际）代码'),
        width: 150,
        name: 'bankCode',
        bind: 'bankAccountList.bankCode',
      },
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.bankName').d('银行名称'),
        width: 180,
        name: 'bankName',
        bind: 'bankAccountList.bankName',
      },
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.bankFirm').d('联行行号'),
        width: 150,
        name: 'bankFirm',
        bind: 'bankAccountList.bankFirm',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.bankTable.bankBranchName')
          .d('开户行名称'),
        width: 180,
        name: 'bankBranchName',
        bind: 'bankAccountList.bankBranchName',
      },
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.bankAccountName').d('账户名称'),
        width: 220,
        // align: 'center',
        name: 'bankAccountName',
        bind: 'bankAccountList.bankAccountName',
      },
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.bankAccountNum').d('银行账号'),
        width: 240,
        name: 'bankAccountNum',
        bind: 'bankAccountList.bankAccountNum',
      },
      {
        label: intl.get('spfm.certificationApproval.model.bankTable.masterFlag').d('是否主账户'),
        width: 100,
        name: 'masterFlag',
        bind: 'bankAccountList.masterFlag',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        width: 80,
        // align: 'center',
        name: 'enabledFlag',
        bind: 'bankAccountList.enabledFlag',
      },
    ],
  };
}
export function getAddressInfoDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('spfm.certificationApproval.model.addressTable.countryName').d('国家'),
        width: 160,
        name: 'countryName',
        bind: 'addressList.countryName',
      },
      {
        label: intl.get('spfm.address.model.address.regionCity').d('省/市/区'),
        // align: 'center',
        width: 180,
        name: 'regionPathName',
        bind: 'addressList.regionPathName',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.addressTable.addressDetail')
          .d('详细地址'),
        // align: 'center',
        width: 300,
        name: 'addressDetail',
        bind: 'addressList.addressDetail',
      },
      {
        label: intl.get('spfm.address.model.address.postCode').d('邮政编码'),
        // align: 'center',
        width: 120,
        name: 'postCode',
        bind: 'addressList.postCode',
      },
      {
        label: intl.get('spfm.address.model.address.description').d('地址备注'),
        // align: 'center',
        width: 250,
        name: 'description',
        bind: 'addressList.description',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        width: 80,
        // align: 'center',
        name: 'enabledFlag',
        bind: 'addressList.enabledFlag',
      },
    ],
  };
}
export function getContactInfoDs() {
  return {
    selection: false,
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.name').d('姓名'),
        name: 'name',
        width: 100,
        bind: 'contactList.name',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.gender').d('性别'),
        name: 'gender',
        width: 80,
        bind: 'contactList.gender',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.mail').d('邮箱'),
        name: 'mail',
        width: 150,
        bind: 'contactList.mail',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.mobilephone').d('手机号码'),
        name: 'mobilephone',
        width: 150,
        bind: 'contactList.mobilephone',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.telephone').d('固定电话'),
        name: 'telephone',
        width: 150,
        bind: 'contactList.telephone',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.department').d('部门'),
        name: 'department',
        width: 100,
        bind: 'contactList.department',
      },
      {
        label: intl.get('spfm.certificationApproval.model.contactTable.position').d('职位'),
        name: 'position',
        width: 100,
        bind: 'contactList.position',
      },
      {
        label: intl.get('hzero.common.remark').d('备注'),
        name: 'description',
        width: 100,
        bind: 'contactList.description',
      },
      {
        label: intl
          .get('spfm.certificationApproval.model.contactTable.defaultFlag')
          .d('默认联系人'),
        name: 'defaultFlag',
        width: 150,
        bind: 'contactList.defaultFlag',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        width: 80,
        bind: 'contactList.enabledFlag',
      },
    ],
  };
}

export function getTableDs() {
  return {
    // paging: false,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'supplier',
        type: 'string',
        label: intl.get('entity.supplier.tag').d('供应商'),
      },
      {
        name: 'supplierCompanyCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyCode')
          .d('公司编码'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyName')
          .d('公司名称'),
      },
      {
        name: 'supplierGroupName',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.groupName').d('所属集团'),
      },
      {
        name: 'purchaser',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaser').d('采购方'),
      },
      {
        name: 'purchaserCompanyCode',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyCode')
          .d('公司编码'),
      },
      {
        name: 'purchaserCompanyName',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.companyName')
          .d('公司名称'),
      },
      {
        name: 'purchaserGroupName',
        type: 'string',
        label: intl.get('spfm.enterpriseRecovery.model.enterpriseRecovery.groupName').d('所属集团'),
      },
      {
        name: 'inviteStatusMeaning',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.inviteStatus')
          .d('邀约状态'),
      },
      {
        name: 'purchaserInvite',
        type: 'number',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaserInvite')
          .d('采购方发起'),
      },
      {
        name: 'supplierInvite',
        type: 'number',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.supplierInvite')
          .d('供应商发起'),
      },
      {
        name: 'privateFlag',
        type: 'number',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.purchaserInvite')
          .d('私有户'),
      },
      {
        name: 'inviteDate',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.inviteDate')
          .d('创建日期'),
      },
      {
        name: 'oprationRecord',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.oprationRecord')
          .d('操作记录'),
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { id } = data;
        return {
          url: `${SRM_PLATFORM}/v1/company-retrieves/partner/${id}`,
          method: 'GET',
        };
      },
    },
  };
}

export function getOprationDs() {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'inviteMess',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.inviteMess')
          .d('邀请方操作人'),
      },
      {
        name: 'inviteDate',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.inviteDate')
          .d('邀请时间'),
      },
      {
        name: 'processDate',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.processDate')
          .d('处理时间'),
      },
      {
        name: 'processStatusMeaning',
        type: 'string',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.processStatusMeaning')
          .d('处理状态'),
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { params } = data;
        return {
          url: `${SRM_PLATFORM}/v1/partners/invite/operations`,
          method: 'GET',
          data: params,
        };
      },
    },
  };
}

export function getPassModalDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'tenant',
        type: 'object',
        label: intl
          .get('spfm.enterpriseRecovery.model.enterpriseRecovery.selectTenant')
          .d('选择租户'),
        required: true,
        textField: 'tenantName',
        valueField: 'tenantId',
        options: passSelectDs,
      },
    ],
  };
}

export const passSelectDs = new DataSet({
  autoQuery: false,
  fields: [
    {
      name: 'tenantId',
      type: 'number',
      required: true,
    },
    {
      name: 'tenantName',
      type: 'string',
      required: true,
    },
  ],
  transport: {
    read: ({ data = {} }) => {
      const { id } = data;
      return {
        url: `${SRM_PLATFORM}/v1/company-retrieves/tenant/${id}`,
        method: 'GET',
      };
    },
  },
});
