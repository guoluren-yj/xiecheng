/*
 * @Date: 2023-08-25 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getHeaderDS = ({ partnerTenantId, pageSource = '' } = {}) => ({
  primaryKey: 'changeReqId',
  forceValidate: true,
  paging: false,
  autoCreate: true,
  fields: [
    {
      name: 'changeReqNumber',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.applicationNum').d('申请单号'),
    },
    {
      name: 'changeLevel',
      disabled: true,
      lookupCode: 'SSLM.FIRM_CHANGE_LEVEL',
      label: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
    },
    {
      name: 'reqStatus',
      lookupCode: 'SSLM.ENTERPRISE_CHANGE_REQ_STATUS',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.applicationState').d('申请状态'),
    },
    {
      name: 'companyNum',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseNum').d('企业编码'),
    },
    {
      name: 'companyName',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'createUserRealName',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.creator').d('创建人'),
    },
    {
      name: 'submitDate',
      type: 'date',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.submitDate').d('提交日期'),
    },
    {
      name: 'creationDate',
      type: 'date',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.creationDate').d('创建日期'),
    },
    {
      name: 'partnerCompanyName',
      disabled: true,
      dynamicProps: {
        label: ({ record }) => {
          const groupLevelFlag = record && record.get('changeLevel') === 'GROUP';
          return groupLevelFlag
            ? intl.get('sslm.enterpriseInform.model.application.purchaserName').d('采购方名称')
            : intl
                .get('sslm.enterpriseInform.model.application.partnerCompanyName')
                .d('采购方公司名称');
        },
      },
    },
    {
      name: 'partnerCompanyNum',
      disabled: true,
      label: intl
        .get('sslm.enterpriseInform.model.application.partnerCompanyNum')
        .d('采购方公司编码'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.enterpriseInform.model.application.changeRemark').d('变更备注'),
    },
    {
      name: 'oldApprovalOpinion',
      disabled: true,
      label: intl.get('sslm.enterpriseInform.model.application.approvalOpinion').d('审批意见'),
      transformResponse: (value, data) => data?.approvalOpinion,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sslm-enterprise',
    },
  ],
  transport: {
    read: ({ params, data }) => {
      const { queryParmas = {} } = data;
      const url =
        pageSource === 'approval'
          ? '/enterprise-change/firm-confirm-detail'
          : '/enterprise-change/firm-detail';
      return {
        url: `${SRM_SSLM}/v1/${organizationId}${url}`,
        method: 'GET',
        params: {
          ...params,
          customizeTenantId: partnerTenantId,
        },
        data: { ...queryParmas },
      };
    },
  },
});

export const getAppealDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'appealReason',
      label: intl.get('sslm.enterpriseInform.model.view.appealReason').d('申诉原因'),
    },
  ],
});
