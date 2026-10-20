/*
 * @Date: 2023-10-20 17:18:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getBasicDs = ({ evalHeaderId }) => ({
  paging: false,
  queryParameter: {
    pageEntryPoint: 'CUSTOMER_OWNED',
  },
  fields: [
    {
      name: 'evalNum',
      label: intl.get('sslm.supplierDocManage.model.evaluationDocManage.docCode').d('档案编码'),
    },
    {
      name: 'evalName',
      label: intl.get(`sslm.common.model.archive.fileDescribe`).d('档案描述'),
    },
    {
      name: 'evalStatusMeaning',
      label: intl.get(`sslm.common.model.archive.status`).d('档案状态'),
    },
    {
      name: 'evalTplName',
      label: intl.get(`sslm.common.model.evaluation.template`).d('考评模板'),
    },
    {
      name: 'evalDimensionMeaning',
      label: intl.get(`sslm.common.view.archiveFilled.evaluationDimension`).d('考评维度'),
    },
    {
      name: 'evalDimensionValueMeaning',
      label: intl.get(`sslm.common.model.dimension.value`).d('维度值'),
    },
    {
      name: 'evalCycleMeaning',
      label: intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期'),
    },
    {
      name: 'evalTplTypeMeaning',
      label: intl.get(`sslm.common.model.archive.evaluation.evalTplType`).d('模板类型'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sslm.common.model.archive.create.time`).d('建档时间'),
    },
    {
      name: 'createdUserName',
      label: intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人'),
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      name: 'docTypeMeaning',
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docType`).d('单据类型'),
    },
    {
      name: 'docNum',
      type: 'object',
      multiple: true,
      label: intl.get(`sslm.supplierDocManage.model.evalDocManage.docNum`).d('单据'),
      dynamicProps: {
        lovCode: ({ record }) => {
          const docType = record.get('docType');
          return docType === 'YS'
            ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
            : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT';
        },
        textField: ({ record }) => (record.get('docType') === 'YS' ? 'displayTrxNum' : 'pcNum'),
      },
      transformRequest: value => value && value.docNum,
      transformResponse: (value, data) => value && data.docNumMeaning,
    },
    {
      name: 'evalRuleRemark',
      label: intl.get(`sslm.common.model.evaluation.rule`).d('考评规则说明'),
    },
    {
      name: 'remark',
      label: intl.get(`sslm.common.model.evaluation.remark`).d('考评说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...rest } = data;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/detail/${evalHeaderId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
  },
});
