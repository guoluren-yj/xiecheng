import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const customizeUnitCodeObj = {
  waitRelease:
    'SSLM.INVESTIGATION_WAIT_RELEASE.SEARCH_BAR,SSLM.INVESTIGATION_WAIT_RELEASE.TABLE_LIST',
  waitApprove:
    'SSLM.INVESTIGATION_WAIT_APPROVE.SEARCH_BAR,SSLM.INVESTIGATION_WAIT_APPROVE.TABLE_LIST',
  all: 'SSLM.INVESTIGATION_ALL.SEARCH_BAR,SSLM.INVESTIGATION_ALL.LIST_TABLE',
};

const getListDS = key => ({
  pageSize: 20,
  cacheSelection: true,
  dataToJSON: 'selected',
  primaryKey: 'investgHeaderId',
  fields: [
    {
      name: 'investgNumber',
      type: 'string',
      label: intl.get(`sslm.common.model.investigate.code`).d('调查表编号'),
    },
    {
      name: 'processStatusMeaning',
      label: intl.get(`sslm.common.model.investigate.status`).d('调查表状态'),
    },
    {
      name: 'partnerCompanyNum',
      label: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
    },
    {
      name: 'supplierZhOrEnCompanyNum',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
    },
    {
      name: 'partnerRegisteredCapital',
      label: intl.get('sslm.common.view.companyInfo.registeredCapital').d('注册资本(万元)'),
    },
    {
      name: 'partnerBuildDate',
      type: 'date',
      label: intl.get(`sslm.common.view.companyInfo.registerDate`).d('成立日期'),
    },
    {
      label: intl.get(`sslm.common.view.company.code`).d('公司编码'),
      name: 'companyNum',
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
    },
    {
      name: 'investigateTypeMeaning',
      label: intl.get(`sslm.common.model.investigate.type`).d('调查表类型'),
    },
    {
      name: 'investigateLevelMeaning',
      label: intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度'),
    },
    {
      name: 'templateCode',
      label: intl
        .get(`sslm.investDefOrg.model.investDefOrg.investTemplateCode`)
        .d('调查表模板代码'),
    },
    {
      name: 'templateName',
      label: intl.get(`sslm.common.model.investigate.template.name`).d('调查表模板名称'),
    },
    {
      name: 'versionNumber',
      label: intl.get(`sslm.common.model.investigate.template.versionNumber`).d('版本号'),
    },
    {
      label: intl.get(`sslm.common.view.creator.name`).d('创建人'),
      name: 'createUserName',
    },
    {
      name: 'createDate',
      type: 'dateTime',
      label: intl.get(`sslm.common.view.creation.time`).d('创建时间'),
    },
    {
      label: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
      name: 'unitName',
    },
    {
      label: intl.get(`hzero.common.date.release`).d('发布日期'),
      name: 'releaseDate',
      type: 'date',
    },
    {
      label: intl.get(`sslm.investigationCorrelation.date.supplierReleaseDate`).d('供应商提交时间'),
      name: 'submitDate',
      type: 'dateTime',
    },
    // {
    //   label: intl.get(`sslm.common.view.creation.inviteSchedule`).d('邀约调查表'),
    //   name: 'inviteFlag',
    // },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
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
    {
      name: 'triggerByCodeMeaning',
      label: intl.get('sslm.investigCorrelat.view.message.investigate.source').d('调查表来源'),
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
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      const queryPath =
        key === 'waitRelease'
          ? 'investigate'
          : key === 'waitApprove'
          ? 'investigate/listSubmitted'
          : 'investigate/sending';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${queryPath}`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode: customizeUnitCodeObj[key],
        },
        data: {},
      };
    },
  },
});

export { getListDS };
