/*
 * @Date: 2023-11-03 14:22:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();

export const getListDs = type => ({
  pageSize: 20,
  selection: false,
  queryParameter: {
    tenantId: organizationId,
    progressStatus: type,
  },
  fields: [
    {
      label:
        type === 'DETAIL_ALL'
          ? intl.get(`sslm.common.model.archive.status`).d('档案状态')
          : intl.get('hzero.common.status').d('状态'),
      name: 'evalStatus',
    },
    {
      name: 'lineStatusMeaning',
      label: intl.get('sslm.common.model.field.ratingResultLineStatus').d('评分结果行状态'),
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.venderCode').d('供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.venderName').d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('sslm.common.category.categoryName').d('品类名称'),
      name: 'categoryName',
    },
    {
      label: intl.get('sslm.common.item.itemName').d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`sslm.supplierDocManage.model.docManage.sumScore`).d('汇总得分'),
      name: 'lineScore',
      type: 'number',
    },
    {
      name: 'checkCollectScore',
      type: 'number',
      label: intl.get('sslm.common.model.docManage.checkCollectScore').d('校准得分'),
    },
    {
      name: 'rankNum',
      label: intl.get('sslm.common.model.field.rank').d('排名'),
      type: 'number',
    },
    {
      name: 'levelCode',
      label: intl.get('sslm.common.model.archiveFilled.level').d('等级'),
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.checkLevelDesc').d('校准等级'),
      name: 'checkLevelDesc',
      lookupCode: 'SSLM.KPI_TPL_EVAL_COLLECT_LEVEL_CODE',
    },
    {
      name: 'executeAction',
      multiple: ',',
      lookupCode: 'SSLM_KPI_EVAL_EXECUTE_ACTION',
      label: intl.get('sslm.common.model.field.subsequentExecutionAction').d('后续执行动作'),
    },
    {
      label: intl.get('sslm.common.model.field.executionDocument').d('执行单据'),
      name: 'executeTotalCount',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'option',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalNum').d('档案编码'),
      name: 'evalNum',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalName').d('档案描述'),
      name: 'evalName',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalTplName').d('考评模板'),
      name: 'evalTplName',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalTplType').d('模板类型'),
      name: 'evalTplTypeMeaning',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.kpiMethod').d('考评方式'),
      name: 'kpiMethod',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.docManage.evalCycle').d('考评周期'),
      name: 'evalCycleMeaning',
    },
    {
      name: 'evalDate',
      type: 'date',
      label: intl.get('sslm.common.model.evaluation.evalDate').d('考评日期'),
    },
    {
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.evalLevel').d('考评维度'),
      name: 'evalDimensionMeaning',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.levelValue').d('维度值'),
      name: 'evalDimensionValueMeaning',
    },
    {
      label: intl
        .get('sslm.supplierDocManage.model.evaluationDocManage.createdUserName')
        .d('创建人'),
      name: 'createdUserName',
    },
    {
      label: intl.get('sslm.supplierDocManage.model.evalDocManage.createTime').d('建档时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      name: 'publishDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { customizeUnitCode } = data;
      const urlPath =
        type === 'DETAIL_ALL'
          ? 'eval-headers/eval-manage/result-detail'
          : 'eval-headers/eval-manage/list';
      const method = type === 'DETAIL_ALL' ? 'POST' : 'GET';
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/${urlPath}`,
        method,
        params: { customizeUnitCode, ...params },
      };
    },
  },
});
