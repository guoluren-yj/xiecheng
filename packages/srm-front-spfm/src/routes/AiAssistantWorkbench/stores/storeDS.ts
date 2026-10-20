import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_PLATFORM}/v1/${organizationId}/agent-monitor`;

const getStatKeys = () => [
  {
    code: 'assistant',
    name: intl.get('spfm.aiAssistant.view.stat.view.assistantCount').d('采购助手总数'),
    valueField: 'assistantTotal',
    // changeField: 'assistantTotalChange',
  },
  {
    code: 'todayTaskCount',
    name: intl.get('spfm.aiAssistant.view.stat.todayTaskCount').d('今日处理任务数'),
    valueField: 'todayTaskCount',
    changeField: 'todayTaskChange',
  },
  {
    code: 'automationRate',
    name: intl.get('spfm.aiAssistant.view.stat.automationRate').d('自动化率'),
    unit: '%',
    valueField: 'automationRate',
    changeField: 'automationRateChange',
  },
  {
    code: 'manualInterventionRate',
    name: intl.get('spfm.aiAssistant.view.stat.manualInterventionRate').d('人工介入率'),
    unit: '%',
    valueField: 'manualInterventionRate',
    changeField: 'manualInterventionRateChange',
  },
  {
    code: 'avgProcessingTime',
    name: intl.get('spfm.aiAssistant.view.stat.avgProcessingTime').d('平均处理时长'),
    unit: intl.get('spfm.aiAssistant.view.stat.minute').d('分钟'),
    valueField: 'avgDurationMinutes',
    changeField: 'avgDurationChange',
  },
];

const dashboardStatsDS = (): DataSetProps => ({
  autoQuery: true,
  paging: false,
  primaryKey: 'code',
  fields: [
    { name: 'code', type: FieldType.string },
    { name: 'name', type: FieldType.string },
    { name: 'value', type: FieldType.number },
    { name: 'changeValue', type: FieldType.number },
    { name: 'unit', type: FieldType.string },
  ],
  transport: {
    read: {
      url: `${prefix}/overview`,
      method: 'get',
      transformResponse: (data: any) => {
        try {
          const json = typeof data === 'string' ? JSON.parse(data) : data;
          return getStatKeys().map(({ valueField, changeField, ...rest }) => ({
            ...rest,
            value: json[valueField] ?? 0,
            changeValue: changeField ? json[changeField] ?? 0 : null,
          }));
        } catch {
          return [];
        }
      },
    },
  },
});

const assistantListDS = (): DataSetProps => ({
  primaryKey: 'key',
  paging: false,
  autoQuery: true,
  selection: false,
  fields: [
    { name: 'code', type: FieldType.string },
    { name: 'name', type: FieldType.string },
    { name: 'icon', type: FieldType.string },
    { name: 'description', type: FieldType.string },
    { name: 'pendingManualCount', type: FieldType.number },
    { name: 'pendingCount', type: FieldType.number },
    { name: 'processingCount', type: FieldType.number },
  ],
  transport: {
    read: {
      url: `${prefix}/employee-cards`,
      method: 'get',
    },
  },
});

const pendingTaskDS = (): DataSetProps => ({
  primaryKey: 'chatId',
  autoQuery: true,
  selection: false,
  pageSize: 10,
  fields: [
    { name: 'chatId', type: FieldType.number },
    { name: 'chatCode', type: FieldType.string },
    { name: 'title', type: FieldType.string, label: intl.get('spfm.aiAssistant.model.taskTitle').d('任务标题') },
    { name: 'sourceAgentName', type: FieldType.string, label: intl.get('spfm.aiAssistant.model.sourceAssistant').d('来源助手') },
    {
      name: 'taskTypeMeaning', // SPFM.AI_AGENT_TASK_TYPE
      type: FieldType.string,
      label: intl.get('spfm.aiAssistant.model.taskType').d('任务类型'),
    },
    { name: 'creationDate', type: FieldType.string, label: intl.get('spfm.aiAssistant.model.creationDate').d('创建时间') },
  ],
  transport: {
    read: {
      url: `${prefix}/pending-tasks`,
      method: 'get',
    },
  },
});

export { dashboardStatsDS, assistantListDS, pendingTaskDS };
