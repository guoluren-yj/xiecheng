/**
 * basicDS - 基本信息DataSet
 * @date: 2020/11/25
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { SRM_SSLM } from '_utils/config';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

export default () => ({
  fields: [
    {
      name: 'evalNum',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
    },
    {
      name: 'evalDescription',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
    },
    {
      name: 'evalStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'evalStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人'),
    },
    {
      name: 'unitName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.createDepartment').d('创建人部门'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.businessEntity').d('业务实体'),
    },
    {
      name: 'organizationName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.inventoryOrg').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.warehouse').d('库房'),
    },
    {
      name: 'evalTypeMeaning',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.scoreWay').d('评分方式'),
    },
    {
      name: 'evalTplName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.inspectionTemplate').d('考察模板'),
    },
    {
      name: 'weightedFlag',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.weightCalculation').d('权重式计算'),
    },
    {
      name: 'evalDateFrom',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sslm.siteInvestigateReport.modal.mange.surveyTimeFrom').d('考察时间从'),
    },
    {
      name: 'evalDateTo',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('sslm.siteInvestigateReport.modal.mange.surveyTimeTo').d('考察时间至'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.supplier').d('供应商'),
    },
    {
      name: 'supplierContactor',
      required: true,
      label: intl.get('sslm.siteInvestigateReport.modal.mange.supplierContact').d('供应商联系人'),
    },
    {
      name: 'supplierContactMail',
      type: 'email',
      required: true,
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.supplierContactMail')
        .d('供应商联系邮箱'),
    },
    {
      name: 'supplierContactPhone',
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.supplierContactPhone')
        .d('供应商联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'investigationTypeMeaning',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.investigationType').d('考察类型'),
    },
    {
      name: 'needFeedbackFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.needSupplierFeedback')
        .d('需要供应商反馈信息'),
    },
    {
      name: 'callSuppliersFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.releasedToSupplier')
        .d('最终考察结果发布至供应商'),
    },
    {
      name: 'supplierTypeMeaning',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.supplierType').d('供应商类型'),
    },
    {
      name: 'supplierOverview',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.supplierProfile').d('供应商概况'),
    },
    {
      name: 'supplierRegisteredAddress',
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.supplierRegistAddress')
        .d('供应商注册地址'),
    },
    {
      name: 'evalAddress',
      required: true,
      label: intl
        .get('sslm.siteInvestigateReport.modal.mange.actualSurveyAddress')
        .d('实际考察地址'),
    },
    {
      name: 'evalRemark',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.inspectionInstruct').d('考察说明'),
    },
    {
      name: 'backRemark',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.backRemark').d('反馈说明'),
    },
    {
      name: 'backReason',
      label: intl.get('sslm.siteInvestigateReport.view.title.backReason').d('退回原因'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { evalHeaderId, tabPaneKey } = data;
      // 区分已反馈
      const defaultUrl = ['alreadyFeedback'].includes(tabPaneKey)
        ? `${SRM_SSLM}/v1/${organizationId}/site-eval-header-copy/${evalHeaderId}/supplierHeaderDetail`
        : `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/supplierHeaderDetail`;
      return {
        url: defaultUrl,
        data: {},
        params: {
          customizeUnitCode:
            'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.RATING_INFO',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});
