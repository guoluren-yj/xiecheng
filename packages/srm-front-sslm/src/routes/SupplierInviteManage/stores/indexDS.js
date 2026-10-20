import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

// 发现供应商
const findSupplierDS = () => ({
  // cacheSelection: true,
  selection: false,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    { name: 'companyId' },
    {
      name: 'companyName',
      label: intl.get('sslm.supplierInvite.model.invite.enterpriseName').d('企业名称'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'riskScan',
      label: intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描'),
    },
    {
      name: 'industries',
      label: intl.get('spfm.companySearch.model.company.industry').d('行业'),
    },
    {
      name: 'childrenIndustryNames',
      label: intl.get('spfm.companySearch.model.company.childrenIndustry').d('产品服务分类'),
    },
    {
      name: 'industryCategoryNames',
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
    },
    {
      name: 'zhimaLabels',
      label: intl.get('sslm.common.model.field.strengthStandard').d('实力标'),
    },
    {
      name: 'serviceAreaCodeNames',
      label: intl.get('spfm.companySearch.model.company.serviceArea').d('送货或服务范围'),
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl.get('spfm.approval.model.legal.registereCapital').d('注册资本(万元)'),
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierInvite.model.invite.lastRiskScanDate').d('最新风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
    },
    {
      name: 'relationSearch',
      label: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
    },
    {
      name: 'latestCheckTime',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.latestRelationDate').d('最新关系排查时间'),
    },
    {
      name: 'latestCheckFileUrl',
      label: intl.get('sslm.common.view.common.latestRelationReport').d('最新关系排查报告'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { registeredRegionId, registeredCityId, registeredDistrictId, ...others } = data;
      const registeredRegionIdsStr = registeredDistrictId || registeredCityId || registeredRegionId;
      const registeredRegionIds = registeredRegionIdsStr
        ? registeredRegionIdsStr.split(',')
        : undefined;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/companies/attestation/search/supplier`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_INVITE_MANAGE_LIST.FIND_SUPPLIER,SSLM.SUPPLIER_INVITE_MANAGE_LIST.FIND_SUPPLIER_LIST',
        },
        data: {
          ...others,
          registeredRegionIds,
        },
      };
    },
  },
});

// 认证处理
const certificationDealDS = () => ({
  selection: false,
  dataToJSON: 'selected',
  // autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'companyName',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'reqStatus',
      label: intl.get('sslm.enterpriseInform.model.application.status').d('状态'),
    },
    {
      name: 'domesticForeignRelationMeaning',
      label: intl.get('spfm.certificationApproval.model.certification.relation').d('认证地区'),
    },
    {
      name: 'certificationTypeMeaning',
      label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
    },
    {
      name: 'certificationRegionIdMeaning',
      label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
    },
    {
      name: 'saleName',
      label: intl.get('sslm.supplierInvite.model.invite.supplierSales').d('供应商销售员'),
    },
    {
      name: 'submitDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierInvite.model.invite.submitTime').d('认证提交时间'),
    },
    {
      name: 'supRegisteredSourceMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.supplierSource').d('供应商来源'),
    },
    {
      name: 'invitorName',
      label: intl.get('sslm.supplierInvite.model.invite.invitorName').d('发起邀请人'),
    },
    {
      name: 'inviteId',
      label: intl.get('sslm.supplierInvite.model.invite.inviteRegisterCode').d('邀请注册编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierInvite.model.invite.inviteRegisterName').d('邀请注册名称'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/${organizationId}/new/submited`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_INVITE_MANAGE_LIST.CERTIFI_DEAL,SSLM.ENT_CER_PRO.LIST.CERTIFICATION_DEAL_TABLE',
        },
        data,
      };
    },
  },
});

// 邀约处理
const inviteDealDS = () => ({
  cacheSelection: true,
  primaryKey: 'inviteId',
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'displayInviteId',
      label: intl.get(`spfm.invitationList.model.invitationList.inviteId`).d('邀请编号'),
    },
    {
      name: 'processStatusMeaning',
      label: intl.get(`spfm.invitationList.model.invitationList.processStatus`).d('邀约状态'),
    },
    {
      name: 'inviteTypeMeaning',
      label: intl.get(`spfm.invitationList.model.invitationList.inviteTypeMeaning`).d('邀请类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`spfm.invitationList.model.invitationList.companyName`).d('发起邀请的公司'),
    },
    {
      name: 'inviteCompanyName',
      label: intl
        .get(`spfm.invitationList.model.invitationList.inviteCompanyName`)
        .d('被邀请企业名称'),
    },
    {
      name: 'salesPersonName',
      label: intl.get(`spfm.invitationList.model.invitationList.salesPersonName`).d('供应商销售员'),
    },
    {
      name: 'sendUserName',
      label: intl.get(`spfm.invitationList.model.invitationList.sendUserName`).d('发起邀请人'),
    },

    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`spfm.invitationList.model.invitationList.creationDate`).d('发出邀请时间'),
    },
    {
      name: 'handleUserName',
      label: intl.get(`spfm.invitationList.model.invitationList.handleUserName`).d('邀约处理人'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get(`spfm.invitationList.model.invitationList.processDate`).d('最后处理时间'),
    },
    {
      name: 'purchaseAgentNameJoint',
      label: intl.get(`spfm.invitationRegister.model.invitation.purchaseAgentId`).d('采购员'),
    },
    {
      name: 'levelTypeFlag',
      label: intl.get(`spfm.invitationList.model.invitationList.levelTypeFlag`).d('是否集团级'),
    },
    {
      name: 'investigateFlag',
      label: intl
        .get(`spfm.invitationList.model.invitationList.investigateFalg`)
        .d('是否发出调查表'),
    },
    {
      name: 'inviteRegisterId',
      label: intl.get('sslm.supplierInvite.model.invite.inviteRegisterCode').d('邀请注册编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierInvite.model.invite.inviteRegisterName').d('邀请注册名称'),
    },
    {
      name: 'riskScan',
      label: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.riskScanDate').d('最新风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/new_invites`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_DEAL,SSLM.SUP_INV_MAN_INV_PROCESS.LIST_TABLE',
        },
        data,
      };
    },
  },
});

// 邀约进度查询 - 供应商
const inviteScheduleDS = () => ({
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'inviteRegister',
      label: intl.get('sslm.supplierInvite.model.invite.inviteRegister').d('是否邀请注册'),
    },
    {
      name: 'registrationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.register').d('注册时间'),
    },
    {
      name: 'registrationStatusMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.cooperationProgress').d('合作进度'),
    },
    {
      name: 'detailInfo',
      label: intl.get('sslm.supplierInvite.model.invite.detailInfo').d('邀约情况'),
    },
    {
      name: 'levelTypeFlagMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.groupCooperation').d('集团级邀约'),
    },
    {
      name: 'cooperationInfo',
      label: intl.get('sslm.supplierInvite.model.invite.cooperation').d('合作情况'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/invites_schedule`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_QUERY,SSLM.INVITE_MANAGE_INVITE_QUERY.SUPPLIER_TABLE',
        },
        data: {
          ...data,
        },
      };
    },
  },
});

// 邀约进度查询 - 按邀约编码
const getInviteRecordDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayInviteId',
      label: intl.get('sslm.supplierInvite.model.invite.displayInviteId').d('邀约编码'),
    },
    {
      name: 'processStatusInviteMeaning',
      label: intl.get(`spfm.invitationList.model.invitationList.processStatus`).d('邀约状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'purchaseInviteTypeMeaning',
      label: intl.get(`sslm.supplierInvite.model.invite.invitationType`).d('邀约类型'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'companyNum',
      label: intl.get(`spfm.disposeInvite.view.message.companyNum`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get('entity.company.companyName').d('公司名称'),
    },
    {
      name: 'levelTypeFlagMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.groupInvitation').d('集团级邀约'),
    },
    {
      name: 'sendUserName',
      label: intl.get('sslm.supplierInvite.model.invite.invitorName').d('发起邀请人'),
    },
    {
      name: 'salesPersonName',
      label: intl.get('sslm.supplierInvite.model.invite.supplierSales').d('供应商销售员'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`spfm.invitationList.model.invitationList.creationDate`).d('发出邀请时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`spfm.invitationList.model.invitationList.processDate`).d('最后处理时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/invites_schedule_purchaser`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.INVITE_MANAGE_INVITE_QUERY.INVITE_RECORD,SSLM.INVITE_MANAGE_INVITE_QUERY.INVITE_TABLE',
        },
        data: {
          ...data,
        },
      };
    },
  },
});

// 详细情况
const inviteDetailDS = () => ({
  selection: false,
  fields: [
    {
      name: 'displayInviteId',
      label: intl.get('sslm.supplierInvite.model.invite.displayInviteId').d('邀约编码'),
    },
    {
      name: 'salesPersonName',
      label: intl.get('sslm.supplierInvite.model.invite.seller').d('销售员'),
    },
    {
      name: 'salesPersonPhone',
      label: intl.get('hzero.common.cellphone').d('手机号'),
    },
    {
      name: 'salesPersonEmail',
      label: intl.get('hzero.common.email').d('邮箱'),
    },
    {
      name: 'registrationStatusMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.details').d('详细情况'),
    },
    {
      name: 'registrationDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.time.lastUpdateTime').d('最后更新时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/invites_details`,
        method: 'POST',
        params,
        data,
      };
    },
  },
});

// 合作情况
const cooperationInfoDS = () => ({
  selection: false,
  fields: [
    {
      name: 'companyNum',
      label: intl.get(`spfm.disposeInvite.view.message.companyNum`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get('entity.company.companyName').d('公司名称'),
    },
    {
      name: 'registrationStatusMeaning',
      label: intl.get('sslm.supplierInvite.model.invite.cooperation').d('合作情况'),
    },
    {
      name: 'registrationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierInvite.model.invite.cooperationTime').d('合作时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/parent_details`,
        method: 'POST',
        params,
        data,
      };
    },
  },
});

export {
  findSupplierDS,
  certificationDealDS,
  inviteScheduleDS,
  inviteDetailDS,
  inviteDealDS,
  cooperationInfoDS,
  getInviteRecordDS,
};
