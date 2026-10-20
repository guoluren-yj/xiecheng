import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';

const ds = ({ taskDocType, createdBy }) => ({
  selection: false,
  page: 20,
  fields: [
    {
      name: 'taskDocNum',
      type: 'string',
      label: intl.get('ssta.exectionProgress.model.taskDocNum').d('任务号'),
    },
    {
      name: 'taskDocType',
      type: 'string',
      lookupCode: 'SPFM.ASYNC_TASK_DOC_TYPE',
      label: intl.get('ssta.exectionProgress.model.taskDocType').d('单据类型'),
    },
    {
      name: 'status',
      type: 'string',
      lookupCode: 'SPFM.ASYNC_TASK_STATUS',
      label: intl.get('ssta.exectionProgress.model.taskDocStatus').d('任务状态'),
    },
    {
      name: 'totalBatches',
      type: 'number',
      label: intl.get('ssta.exectionProgress.model.totalBatches').d('拆分批数'),
    },
    {
      name: 'readyQuantityProcess',
      type: 'number',
      label: intl.get('ssta.exectionProgress.model.readyQuantity').d('数据准备进度'),
    },
    {
      name: 'readySuccessTime',
      type: 'dateTime',
      label: intl.get('ssta.exectionProgress.model.readySuccessTime').d('准备完成时间'),
    },
    {
      name: 'executeQuantityProcess',
      type: 'number',
      label: intl.get('ssta.exectionProgress.model.executeQuantity').d('数据执行进度'),
    },
    {
      name: 'executeSuccessTime',
      type: 'dateTime',
      label: intl.get('ssta.exectionProgress.model.executeSuccessTime').d('执行完成时间'),
    },
    {
      name: 'mergeSuccessTime',
      type: 'dateTime',
      label: intl.get('ssta.exectionProgress.model.mergeSuccessTime').d('汇总合并完成时间'),
    },
    {
      name: 'remark',
      label: intl.get('ssta.exectionProgress.model.remark').d('备注'),
    },
  ],
  queryFields: [
    {
      name: 'taskDocNum',
      type: 'string',
      display: true,
      label: intl.get('ssta.exectionProgress.model.taskDocNum').d('任务号'),
    },
    {
      name: 'status',
      type: 'string',
      display: true,
      lookupCode: 'SPFM.ASYNC_TASK_STATUS',
      label: intl.get('ssta.exectionProgress.model.taskDocStatus').d('任务状态'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${getCurrentOrganizationId()}/async-tasks/list`,
        method: 'GET',
        data: { ...data, taskDocType, tenantId: getCurrentOrganizationId(), createdBy },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const { executeQuantity, totalBatches, readyQuantity } = record.get([
          'executeQuantity',
          'totalBatches',
          'readyQuantity',
        ]);
        record.init({
          executeQuantityProcess: math.div(math.multipliedBy(executeQuantity, 100), totalBatches),
          readyQuantityProcess: math.div(math.multipliedBy(readyQuantity, 100), totalBatches),
        });
      });
    },
  },
});


const detailDS = ({ taskDocNum }) => ({
  selection: false,
  page: 20,
  autoQuery: true,
  fields: [
    {
      name: 'taskDocLineNum',
      type: 'string',
      label: intl.get('ssta.exectionProgress.model.taskDocLineNum').d('任务行号'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('ssta.exectionProgress.model.quantity').d('完成数'),
    },
    {
      name: 'completedTime',
      type: 'dateTime',
      label: intl.get('ssta.exectionProgress.model.completedTime').d('完成时间'),
    },
    {
      name: 'type',
      type: 'string',
      lookupCode: 'SPFM.ASYNC_TASK_LINE_TYPE',
      label: intl.get('ssta.exectionProgress.model.type').d('类型'),
    },
    {
      name: 'errorCode',
      type: 'string',
      label: intl.get('ssta.exectionProgress.model.errorCode').d('是否成功'),
      lookupCode: 'SPFM.ASYNC_TASK_LINE_ERROR_CODE',
    },
    {
      name: 'errorMsg',
      type: 'string',
      label: intl.get('ssta.exectionProgress.model.errorMsg').d('错误内容'),
    },
    {
      name: 'remark',
      label: intl.get('ssta.exectionProgress.model.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/ssta/v1/${getCurrentOrganizationId()}/spfm-async-task-lines/list`,
        method: 'GET',
        data: { ...data, taskDocNum, tenantId: getCurrentOrganizationId() },
      };
    },
  },
});

export { ds, detailDS };
