/**
 * conditionDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import intl from 'utils/intl';

export function getConditonDs(listRecord) {
  return {
    autoQuery: false,

    fields: [
      {
        name: 'deliverDimension',
        type: 'string',
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.deliverDimension').d('转交维度'),
        lookupCode: 'SPFM.DOC_DELIVER_DIMENSION',
      },
      {
        name: 'tableColumnObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.tableField').d('表字段'),
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
        dynamicProps: {
          lovPara: () => {
            return {
              tableName: listRecord.get('tableName'),
            };
          },
        },
      },
      {
        name: 'tableColumn',
        type: 'string',
        required: true,
        bind: 'tableColumnObj.columnName',
      },
      {
        name: 'lovViewCodeObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.lovViewCode').d('视图编码'),
        lovCode: 'SPFM.REL_TABLE_LOV_VIEW_VIEW',
      },
      {
        name: 'lovViewCode',
        type: 'string',
        required: true,
        bind: 'lovViewCodeObj.viewCode',
      },
    ],
  };
}

export function getRelationDs(listRecord) {
  return {
    autoQuery: false,

    fields: [
      {
        name: 'tableColumnObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.tableField').d('表字段'),
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
        dynamicProps: {
          lovPara: () => {
            return {
              tableName: listRecord.get('tableName'),
            };
          },
        },
      },
      {
        name: 'tableColumn',
        type: 'string',
        required: true,
        bind: 'tableColumnObj.columnName',
      },
      {
        name: 'relationTableNameObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.relationTableName').d('关联表'),
        lovCode: 'HPFM.TO_DEFINE.IN_TABLE',
      },
      {
        name: 'relationTableName',
        type: 'string',
        required: true,
        bind: 'relationTableNameObj.tableName',
      },
      {
        name: 'relationTableColumnObj',
        type: 'object',
        cascadeMap: {
          tableName: 'relationTableNameObj.tableName',
        },
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.relationTableColumn').d('关联字段'),
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
      },
      {
        name: 'relationTableColumn',
        type: 'string',
        required: true,
        bind: 'relationTableColumnObj.columnName',
      },
    ],

    events: {
      update: ({ record, name }) => {
        if (name === 'relationTableNameObj') {
          record.set('relationTableColumnObj', null);
        }
      },
    },
  };
}
export function getTransferConditionDsDs() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'relationTableNameObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.relationTableName').d('关联表'),
        lovCode: 'HPFM.TO_DEFINE.IN_TABLE',
      },
      {
        name: 'relationTableName',
        type: 'string',
        required: true,
        bind: 'relationTableNameObj.tableName',
      },
      {
        name: 'conditionTableColumnObj',
        type: 'object',
        cascadeMap: {
          tableName: 'relationTableNameObj.tableName',
        },
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.relationTableColumn').d('关联字段'),
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
      },
      {
        name: 'conditionTableColumn',
        type: 'string',
        required: true,
        bind: 'conditionTableColumnObj.columnName',
      },
      {
        name: 'conditionOperator',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.conditionOperator').d('条件'),
        transformRequest: () => '=',
      },
      {
        name: 'conditionValue',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.conditionValue').d('值'),
        required: true,
      },
    ],

    events: {
      update: ({ record, name }) => {
        if (name === 'relationTableNameObj') {
          record.set('conditionTableColumnObj', null);
        }
      },
    },
  };
}
