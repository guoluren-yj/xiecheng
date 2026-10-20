import intl from 'utils/intl';
import { SRM_INTERFACE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const prefix = `sitf.sourceDataSearch`;

const filterFormDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'applicationGroupCode',
      type: 'object',
      label: intl.get(`${prefix}.model.sourceDataSearch.applicationGroupCode`).d('应用组'),
      lovCode: 'SIFC.APPLICATION_GROUPS',
      transformRequest: (value) => value && value.applicationGroupCode,
    },
    {
      name: 'externalSystemCode',
      type: 'object',
      label: intl.get(`${prefix}.model.sourceDataSearch.externalSystemName`).d('外部系统名称'),
      lovCode: 'SIFC.EXTERNAL_SYSTEM',
      transformRequest: (value) => value && value.externalSystemCode,
    },
    {
      name: 'esInterfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.esInterfaceCode`).d('外部接口代码'),
    },
    {
      name: 'errorFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.errorFlag`).d('是否出错'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'consumedFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.consumedFlag`).d('是否消费'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'docNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.docNum`).d('IDOC编码'),
    },
    {
      name: 'batchNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.batchNum`).d('批次号'),
    },
    {
      name: 'creationDateFrom',
      type: 'date',
      label: intl.get(`${prefix}.model.sourceDataSearch.creationDateFrom`).d('创建时间从'),
      max: 'creationDateTo',
      required: true,
    },
    {
      name: 'creationDateTo',
      type: 'date',
      label: intl.get(`${prefix}.model.sourceDataSearch.creationDateTo`).d('创建时间至'),
      min: 'creationDateFrom',
    },
  ],
});

const tableDs = () => ({
  autoQuery: false,
  selection: 'multiple',
  fields: [
    {
      name: 'externalSystemName',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.externalSystemName`).d('外部系统名称'),
    },
    {
      name: 'esInterfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.esInterfaceCode`).d('外部接口代码'),
    },
    {
      name: 'mqEsInterfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.esInterfaceCode`).d('外部接口代码'),
    },
    {
      name: 'messageKey',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.messageKey`).d('消息key'),
    },
    {
      name: 'mqTopic',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.mqTopic`).d('Topic'),
    },
    {
      name: 'docNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.docNum`).d('IDOC编号'),
    },
    {
      name: 'mqDocNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.docNum`).d('IDOC编码'),
    },
    {
      name: 'batchNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.batchNum`).d('批次号'),
    },
    {
      name: 'mqBatchNum',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.batchNum`).d('批次号'),
    },
    {
      name: 'mqCreationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.mqCreationDate`).d('创建时间'),
    },
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.statusMeaning`).d('批次状态'),
    },
    {
      name: 'finishedFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.finishedFlag`).d('完成'),
    },
    {
      name: 'errorFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.errorFlag`).d('是否出错'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.errorMessage`).d('错误信息'),
    },
    {
      name: 'dataExecuteResultMeaning',
      type: 'string',
      label: intl
        .get(`${prefix}.model.sourceDataSearch.dataExecuteResultMeaning`)
        .d('数据执行结果'),
    },
    {
      name: 'confirmFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.confirmFlag`).d('批次确认'),
    },
    {
      name: 'historyFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.sourceDataSearch.historyFlag`).d('历史数据'),
    },
    {
      name: 'applicationGroupName',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.applicationGroupName`).d('应用组'),
    },
    {
      name: 'applicationCodeName',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.applicationCodeName`).d('应用'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.sourceDataSearch.creationDate`).d('创建时间'),
    },
  ],

  transport: {
    read: (values) => {
      const {
        data: { params = {} },
      } = values;
      return {
        url: `${SRM_INTERFACE}/v1/${organizationId}/source-batch-info-imps`,
        method: 'GET',
        data: { ...params },
      };
    },
  },

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const { consumedFlag } = record.data;
        if (consumedFlag) {
          // eslint-disable-next-line no-param-reassign
          record.selectable = false;
        }
      });
    },
  },
});

export { tableDs, filterFormDs };
