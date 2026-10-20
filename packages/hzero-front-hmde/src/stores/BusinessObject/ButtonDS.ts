import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HLOD } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

enum USER_ACTION {
  DISABLE = 'DISABLE', // 禁用
  DELETE = 'DELETE', // 删除
}

const buttonDs = () => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  primaryKey: 'id',
  parentField: 'parentId',
  idField: 'id',
  queryFields: [
    {
      name: 'businessObjectButtonName',
      type: 'string',
      label: intl.get('hmde.bo.button.name').d('按钮名称'),
    },
    {
      name: 'businessObjectButtonCode',
      type: 'string',
      label: intl.get('hmde.bo.button.code').d('按钮代码'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl.get('hmde.bo.button.status').d('按钮状态'),
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  fields: [
    {
      name: 'businessObjectButtonName',
      type: 'intl',
      label: intl.get('hmde.bo.button.name').d('按钮名称'),
    },
    {
      name: 'businessObjectButtonCode',
      type: 'string',
      label: intl.get('hmde.bo.button.code').d('按钮代码'),
    },
    {
      name: 'sourceType',
      type: 'string',
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'HLOD.BUSINESS_OBJECT_BUTTON.SOURCE_TYPE',
      label: intl.get('hmde.bo.button.sourceType').d('按钮分类'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-buttons/tree`,
        method: 'GET', // FIXME: method必须全大写 GET POST DELETE PUT
      };
    },
    destroy: ({ dataSet, data }) => {
      const action = dataSet.getState('__userAction');

      if (action === USER_ACTION.DISABLE) {
        // 禁用/启用
        const flag = (data[0] || {}).enabledFlag ? 'disable' : 'enable';
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-buttons/${flag}`,
          method: 'PUT',
          data: data[0],
        };
      } else {
        // 删除
        return {
          url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-buttons`,
          method: 'DELETE',
          data: data[0],
        };
      }
    },
  },
});

const detailDs = (businessObjectCode) => ({
  autoQuery: false,
  autoCreate: false,
  fields: [
    {
      name: 'businessObjectButtonName',
      type: 'intl',
      label: intl.get('hmde.bo.button.name').d('按钮名称'),
      required: true,
      maxLength: 30,
    },
    {
      name: 'businessObjectButtonCode',
      type: 'string',
      label: intl.get('hmde.bo.button.code').d('按钮代码'),
      required: true,
    },
    {
      name: 'businessObjectButtonType',
      type: 'string',
      label: intl.get('hmde.bo.button.type').d('按钮位置'),
      lookupCode: 'HLOD.BUSINESS_OBJECT_BUTTON.TYPE',
      required: true,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
      maxLength: 120,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('hzero.common.status').d('状态'),
      defaultValue: true,
      required: true,
    },
    {
      name: 'eventFlow',
      type: 'object',
      label: intl.get('hmde.bo.view.message.tab.eventFlow').d('事件流程'),
      textField: 'flowName',
      valueField: 'flowCode',
      lookupAxiosConfig: () => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-event-flows/list`,
        method: 'GET',
        params: {
          businessObjectCode,
        },
      }),
      ignore: 'always',
    },
    {
      name: 'businessObjectFlowCode',
      type: 'string',
      bind: 'eventFlow.flowCode',
    },
    {
      name: 'businessObjectFlowName',
      type: 'string',
      bind: 'eventFlow.flowName',
    },
    // TODO 以下表单字段，暂时不开发，等UI设计器那边完工了再说
    {
      name: 'a',
      type: 'string',
      label: intl.get('hmde.bo.button.operator').d('按钮行为'),
    },
    {
      name: 'b',
      type: 'string',
      label: intl.get('hmde.bo.button.processType').d('按钮事件流类型'),
    },
    {
      name: 'c',
      type: 'string',
      label: intl.get('hmde.bo.button.processNodeProps').d('事件流节点属性'),
    },
    {
      name: 'd',
      type: 'string',
      label: intl.get('hmde.bo.button.modalMsg').d('提示弹窗信息'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const businessObjectButtonId = dataSet.getState('businessObjectButtonId');
      return {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HLOD,
        })}/business-object-buttons/${businessObjectButtonId}/detail`,
        method: 'GET',
      };
    },
    update: ({ data }) => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-buttons`,
        method: 'PUT',
        data: data[0],
        params: {
          businessObjectCode,
        },
      };
    },
    create: ({ data }) => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-buttons`,
        method: 'POST',
        data: { ...data[0], businessObjectCode },
        params: {
          businessObjectCode,
        },
      };
    },
  },
});

export { buttonDs, detailDs };
