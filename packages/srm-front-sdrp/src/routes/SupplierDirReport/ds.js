import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.suppierDir.model.companyName').d('所属公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierCompanyNum').d('供应商代码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierCompanyName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierCompanyCategory').d('供应商分类'),
        name: 'supplierCompanyCategory',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplyCategoryName').d('供货品类名称'),
        name: 'supplyCategoryName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.purchaseAgentName').d('采购组'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.contactName').d('联系人'),
        name: 'contactName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.mobilePhone').d('联系人电话'),
        name: 'mobilePhones',
      },
      {
        label: intl.get('sdrp.suppierDir.model.contactMail').d('联系人邮箱'),
        name: 'contactMails',
      },
      {
        label: intl.get('sdrp.suppierDir.model.businessNature').d('经营性质'),
        name: 'businessNature',
      },
      {
        label: intl.get('sdrp.suppierDir.model.bankAccountName').d('开户行'),
        name: 'bankAccountName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.bankAccountNum').d('银行账号'),
        name: 'bankAccountNums',
      },
      {
        label: intl.get('sdrp.suppierDir.model.typeName').d('付款条款'),
        name: 'typeName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.paymentTypeName').d('结算方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.firstRegionName').d('省份'),
        name: 'firstRegionName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registeredAddress').d('地址'),
        name: 'registeredAddress',
      },
      {
        label: intl.get('sdrp.suppierDir.model.stageDescription').d('生命阶段'),
        name: 'stageDescription',
      },
      {
        label: intl.get('sdrp.suppierDir.model.stageCreationDate').d('生命阶段创建时间'),
        name: 'stageCreationDate',
      },
      {
        label: intl.get('sdrp.suppierDir.model.stageRealName').d('生命阶段经办人'),
        name: 'stageRealName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.levelDesc').d('最近一次绩效等级'),
        name: 'levelDesc',
      },
      {
        label: intl.get('sdrp.suppierDir.model.finalScore').d('最近一次绩效得分'),
        name: 'finalScore',
      },
      {
        label: intl.get('sdrp.suppierDir.model.poFlag').d('是否连续两年无订单'),
        lookupCode: 'HPFM.FLAG',
        name: 'poFlag',
      },
      {
        label: intl.get('sdrp.suppierDir.model.organizationName').d('采购组织'),
        name: 'organizationName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.headerCount').d('索赔次数'),
        name: 'headerCount',
      },
      {
        label: intl.get('sdrp.suppierDir.model.totalAmount').d('索赔金额'),
        name: 'totalAmount',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierFlag').d('是否平台供应商'),
        lookupCode: 'HPFM.FLAG',
        name: 'supplierFlag',
      },

      {
        label: intl.get('sdrp.suppierDir.model.registerTime').d('注册时间'),
        name: 'supplierCreationDate',
      },
      {
        label: intl.get('sdrp.suppierDir.model.updateTimes').d('更新次数'),
        name: 'supplierCnt',
      },
      {
        label: intl.get('sdrp.suppierDir.model.lastUpdateTime').d('最后更新时间'),
        name: 'supplierLastUpdateDate',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registerArea').d('认证地区'),
        name: 'domesticForeignRelation',
      },
      {
        label: intl.get('sdrp.suppierDir.model.uscc').d('统一社会信用代码'),
        name: 'unifiedSocialCode',
      },
      {
        label: intl.get('sdrp.suppierDir.model.organCode').d('组织机构代码'),
        name: 'organizingInstitutionCode',
      },
      {
        label: intl.get('sdrp.suppierDir.model.dunsCode').d('邓白氏编码'),
        name: 'dunsCode',
      },
      {
        label: intl.get('sdrp.suppierDir.model.organType').d('机构类型'),
        name: 'organType',
      },
      {
        label: intl.get('sdrp.suppierDir.model.groupType').d('企业类型'),
        name: 'groupType',
      },
      {
        label: intl.get('sdrp.suppierDir.model.legalRepName').d('法定代表人/负责人'),
        name: 'legalRepName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registerCounty').d('注册国家/地区'),
        name: 'supplierRegisteredCountry',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierCountry').d('省/市/区'),
        name: 'supplierRegisteredAddress',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registerAddress').d('注册地址'),
        name: 'supplierAddressDetail',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registeredCapital').d('注册资本(万)'),
        name: 'registeredCapital',
      },
      {
        label: intl.get('sdrp.suppierDir.model.registeredCurrency').d('注册资本币种'),
        name: 'registeredCurrency',
      },
      {
        label: intl.get('sdrp.suppierDir.model.taxpayerType').d('纳税人标识'),
        name: 'taxpayerType',
      },
      {
        label: intl.get('sdrp.suppierDir.model.buildDate').d('成立日期'),
        name: 'buildDate',
      },
      {
        label: intl.get('sdrp.suppierDir.model.businessTerm').d('营业期限'),
        name: 'businessTerm',
      },
      {
        label: intl.get('sdrp.suppierDir.model.industryName').d('行业类型'),
        name: 'industryName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.industryCategoryName').d('主营品类'),
        name: 'industryCategoryName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.serviceAreaName').d('送货服务范围'),
        name: 'serviceAreaName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.website').d('公司官网'),
        name: 'website',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierLevel').d('供应商等级'),
        name: 'supplierStageDescription',
      },
      {
        label: intl.get('sdrp.suppierDir.model.countryName').d('国家'),
        name: 'supplierCountryName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.businessAddress').d('经营地址'),
        name: 'businessAddress',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierLinkName').d('姓名'),
        name: 'supplierLinkName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.department').d('部门'),
        name: 'supplierDepartment',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierPosition').d('职位'),
        name: 'supplierPosition',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierLinkPhone').d('手机号码'),
        name: 'supplierLinkPhone',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierTelephone').d('固定电话'),
        name: 'supplierTelephone',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierLinkEmail').d('邮箱'),
        name: 'supplierLinkEmail',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierBankCode').d('银行编码'),
        name: 'supplierBankCode',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierBankName').d('银行名称'),
        name: 'supplierBankName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierBankFirm').d('联行行号'),
        name: 'supplierBankFirm',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierBranchName').d('开户名称'),
        name: 'supplierBranchName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierAccountName').d('账户名称'),
        name: 'supplierAccountName',
      },
      {
        label: intl.get('sdrp.suppierDir.model.supplierAccountNum').d('银行账户'),
        name: 'supplierAccountNum',
      },
      {
        label: intl.get('sdrp.suppierDir.model.publicOrPrivate').d('对公对私'),
        name: 'publicOrPrivate',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/supplier/report/qualified/dir`,
          method: 'POST',
          params: {
            ...params,
            tenantId,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}
