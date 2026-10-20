import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import switchJpg from '@/assets/icon/switch.jpg';
import uuid from 'uuid/v4';

const nodes = [
  {
    id: 'node1',
    name: '新增记录',
    code: 'IR',
    category: 'DATA_OPERATE',
    type: 'regular',
    icon: 'xinzhen16.svg',
  },
  {
    id: 'node2',
    name: '删除记录',
    code: 'DR',
    category: 'DATA_OPERATE',
    type: 'regular',
    icon: 'sancu16.svg',
  },
  {
    id: 'node3',
    name: '修改记录',
    code: 'UR',
    category: 'DATA_OPERATE',
    type: 'regular',
    icon: 'xiugai16.svg',
  },
  {
    id: 'node4',
    name: '查询记录',
    code: 'SR',
    category: 'DATA_OPERATE',
    type: 'regular',
    icon: 'chaxun16.svg',
  },
  {
    id: 'node5',
    name: '条件',
    code: 'CONDITION',
    category: 'FLOW_DEFINITION',
    type: 'condition',
    icon: 'tiaojian16.svg',
  },
  {
    id: 'node6',
    name: '结束',
    code: 'END',
    category: 'FLOW_DEFINITION',
    type: 'end',
    icon: 'jiesu16.svg',
  },
  {
    id: 'node7',
    name: '脚本',
    code: 'SCRIPT',
    category: 'OTHER',
    type: 'regular',
    icon: 'jiaoben16.svg',
  },
  // {
  //   id: 'node8',
  //   name: '变量赋值',
  //   code: 'VA',
  //   category: 'OTHER',
  //   type: 'regular',
  //   icon: 'bianliang16.svg',
  // },
  {
    id: 'node9',
    name: '消息通知',
    code: 'MN',
    category: 'OTHER',
    type: 'regular',
    icon: 'xiaoxi16.svg',
  },
];

const regularNode = () => ({
  width: 100,
  height: 40,
  nodeCode: '',
  nodeType: 'regular',
  detail: {},
  flowNodeId: '',
  attrs: {
    image: {},
    label: {
      cursor: 'pointer',
      text: 'Rect',
      fill: '#6a6c8a',
    },
    body: {
      stroke: '#eeeeee',
      strokeWidth: 1,
      cursor: 'pointer',
    },
  },
  ports: {
    groups: {
      top: {
        position: 'top',
      },
      bottom: {
        position: 'bottom',
      },
    },
    items: [
      {
        id: `p1-${uuid()}`,
        group: 'top',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
      {
        id: `p2-${uuid()}`,
        group: 'bottom',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
    ],
  },
});

const conditionNode = {
  width: 100,
  height: 60,
  detail: {},
  nodeCode: '',
  nodeType: 'condition',
  flowNodeId: '',
  shape: 'polygon',
  attrs: {
    image: {
      x: 16,
      y: 16,
      width: 56,
      height: 56,
      xlinkHref: switchJpg,
    },
    label: {
      cursor: 'pointer',
      text: 'Rect',
      fill: '#6a6c8a',
    },
    body: {
      cursor: 'pointer',
      strokeWidth: 1,
      fill: '#ffffff',
      stroke: '#a0d2ff',
      // 指定 refPoints 属性，多边形顶点随图形大小自动缩放
      // https://x6.antv.vision/zh/docs/api/registry/attr#refpointsresetoffset
      refPoints: '0,10 10,0 20,10 10,20',
    },
  },
  ports: {
    groups: {
      left: {
        position: 'left',
      },
      bottom: {
        position: 'bottom',
      },
      right: {
        position: 'right',
      },
      top: {
        position: 'top',
      },
    },
    items: [
      {
        id: 'pints1',
        group: 'left',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
      {
        id: 'pints2',
        group: 'bottom',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
      {
        id: 'pints3',
        group: 'right',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
      {
        id: 'pints4',
        group: 'top',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
    ],
  },
};

const endNode = {
  nodeCode: 'END',
  width: 20, // Number，可选，节点大小的 width 值
  height: 20, // Number，可选，节点大小的 height 值
  shape: 'circle',
  detail: {},
  attrs: {
    cursor: 'pointer',
    body: {
      fill: '#FFF0F0',
      cursor: 'pointer',
    },
  },
  ports: {
    groups: {
      end: {
        position: 'top',
      },
    },
    items: [
      {
        id: 'end',
        group: 'end',
        attrs: {
          circle: {
            r: 6,
            magnet: true,
            stroke: '#a0d2ff',
            strokeWidth: 1,
            fill: '#fff',
          },
        },
      },
    ],
  },
};

const fieldsMap = new Map([
  [
    'IR-FieldAssign',
    [
      'requiredFlag',
      'fieldCode',
      'sourceType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
  ['DR-FieldAssign', []],
  [
    'UR-FieldAssign',
    [
      'requiredFlag',
      'fieldCode',
      'sourceType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
  [
    'SR-FieldAssign',
    [
      'fieldCode',
      'sourceType',
      'componentType',
      'operatorType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
  ['END-FieldAssign', []],
  [
    'SCRIPT-FieldAssign',
    [
      'code',
      'type',
      'sourceType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
  [
    'VA-FieldAssign',
    [
      'code',
      'sourceType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
  [
    'MN-FieldAssign',
    [
      'templateCode',
      'fieldCode',
      'sourceType',
      'inputParameterId',
      'inputParameterOriginData',
      'value',
      'inputParameter',
      'refField',
      'customVariable',
      'expression',
    ],
  ],
]);

const fieldsObjMap: Map<any, any> = new Map([
  [
    'requiredFlag',
    {
      name: 'requiredFlag',
      type: FieldType.boolean,
      label: '必填',
      computedProps: {},
    },
  ],
  [
    'templateCode',
    {
      name: 'templateCode',
      type: FieldType.string,
      label: '模板code',
      computedProps: {},
    },
  ],
  [
    'code',
    {
      name: 'code',
      type: FieldType.string,
      label: '字段编码',
      required: true,
      computedProps: {},
    },
  ],
  [
    'fieldCode',
    {
      name: 'fieldCode',
      type: FieldType.string,
      label: '字段编码',
      required: true,
      computedProps: {},
    },
  ],
  [
    'sourceType',
    {
      name: 'sourceType',
      type: FieldType.string,
      label: '来源',
      computedProps: {
        required: ({ record }) => {
          if (record.get('operatorType')) {
            return (
              record.get('operatorType') !== 'IS_NULL' &&
              record.get('operatorType') !== 'IS_NOT_NULL'
            );
          } else {
            return true;
          }
        },
      },
    },
  ],
  [
    'componentType',
    {
      name: 'componentType',
      type: FieldType.string,
      label: '组件类型',
      computedProps: {},
    },
  ],
  [
    'inputParameterId',
    {
      name: 'inputParameterId',
      type: FieldType.string,
      label: '业务对象code',
      computedProps: {
        required: ({ record }) => {
          if (record.get('sourceType') === 'inputParameter') {
            if (record.get('operatorType')) {
              return (
                record.get('operatorType') !== 'IS_NULL' &&
                record.get('operatorType') !== 'IS_NOT_NULL'
              );
            } else {
              return true;
            }
          } else {
            return false;
          }
        },
      },
    },
  ],
  [
    'inputParameterOriginData',
    {
      name: 'inputParameterOriginData',
      type: FieldType.object,
      ignore: FieldIgnore.always,
    },
  ],
  [
    'value',
    {
      name: 'value',
      type: FieldType.string,
      label: '固定值',
      computedProps: {
        required: ({ record }) => {
          if (record.get('sourceType') === 'fixedValue') {
            if (record.get('operatorType')) {
              return (
                record.get('operatorType') !== 'IS_NULL' &&
                record.get('operatorType') !== 'IS_NOT_NULL'
              );
            } else {
              return true;
            }
          } else {
            return false;
          }
        },
      },
    },
  ],
  [
    'inputParameter',
    {
      name: 'inputParameter',
      type: FieldType.string,
      label: '入参值',
      computedProps: {
        required: () => {
          return false;
          // const inputParameterOriginData = record.get('inputParameterOriginData');
          // const inputParameterId = record.get('inputParameterId');
          // const data = inputParameterOriginData.find((item) => item.id === inputParameterId);
          // if (record.get('sourceType') === 'inputParameter') {
          //   if (record.get('type') && record.get('type') === 'any') {
          //     return false;
          //   }
          //   if (record.get('operatorType')) {
          //     if (
          //       record.get('operatorType') !== 'IS_NULL' &&
          //       record.get('operatorType') !== 'IS_NOT_NULL'
          //     ) {
          //       return data?.parentId === 1 || data?.componentType?.indexOf('RELATION') !== -1;
          //     } else {
          //       return false;
          //     }
          //   } else {
          //     return data?.parentId === 1 || data?.componentType?.indexOf('RELATION') !== -1;
          //   }
          // } else {
          //   return false;
          // }
        },
      },
    },
  ],
  [
    'refField',
    {
      name: 'refField',
      type: FieldType.string,
      computedProps: {},
    },
  ],
  [
    'customVariable',
    {
      name: 'customVariable',
      type: FieldType.string,
      label: '必填',
      computedProps: {
        required: ({ record }) => {
          if (record.get('sourceType') === 'customVariable') {
            if (record.get('operatorType')) {
              return (
                record.get('operatorType') !== 'IS_NULL' &&
                record.get('operatorType') !== 'IS_NOT_NULL'
              );
            } else {
              return true;
            }
          } else {
            return false;
          }
        },
      },
    },
  ],
  [
    'expression',
    {
      name: 'expression',
      type: FieldType.string,
      label: '必填',
      computedProps: {
        required: ({ record }) => {
          if (record.get('sourceType') === 'expression') {
            if (record.get('operatorType')) {
              return (
                record.get('operatorType') !== 'IS_NULL' &&
                record.get('operatorType') !== 'IS_NOT_NULL'
              );
            } else {
              return true;
            }
          } else {
            return false;
          }
        },
      },
    },
  ],
  [
    'operatorType',
    {
      name: 'operatorType',
      type: FieldType.string,
      textField: 'meaning',
      valueField: 'value',
      lookupCode: 'HMDE.FILTER_CONDITION',
      label: '操作类型',
      required: true,
    },
  ],
  ['type', { name: 'type', type: FieldType.string, label: '参数类型' }],
]);

// 每个节点的相关配置，用于渲染出相应的组件
export { nodes, regularNode, conditionNode, endNode, fieldsMap, fieldsObjMap };
