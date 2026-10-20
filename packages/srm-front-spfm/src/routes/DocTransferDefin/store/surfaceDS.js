/*
 * @Description: 新增字段：字段更新描述
 * @Version: 2.0
 * @Autor: lhl
 * @Date: 2021-08-31 15:16:27
 * @LastEditors: lhl
 * @LastEditTime: 2021-09-14 17:21:41
 */
/**
 * surfaceDS.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

export default function() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'tableSchema',
        label: intl.get('spfm.docTransferDefin.model.view.tableSchema').d('配置Schema'),
        required: true,
        defaultValue: 'srm',
      },
      {
        name: 'tableNameObj',
        type: 'object',
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.tableName').d('涉及相关表'),
        lovCode: 'HPFM.TO_DEFINE.IN_TABLE',
      },
      {
        name: 'tableName',
        type: 'string',
        required: true,
        bind: 'tableNameObj.tableName',
      },
      {
        name: 'tableColumnObj',
        type: 'object',
        cascadeMap: {
          tableName: 'tableNameObj.tableName',
        },
        ignore: true,
        required: true,
        label: intl.get('spfm.docTransferDefin.model.view.tableColumn').d('更改字段'),
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
      },
      {
        name: 'tableColumn',
        type: 'string',
        required: true,
        bind: 'tableColumnObj.columnName',
      },
      {
        name: 'tableColumnDesc',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.tableColumnDesc').d('更新字段描述'),
        // bind: 'tableColumnObj.columnName',
      },
      {
        name: 'tableMasterFlag',
        type: 'boolean',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.docTransferDefin.model.view.tableMasterFlag').d('是否主表'),
      },
      {
        name: 'tableColumnDisplay',
        type: 'object',
        required: true,
        lovCode: 'HPFM.TO_DEFINE.CHANGE_FIELD',
        cascadeMap: {
          tableName: 'tableNameObj.tableName',
        },
        label: intl
          .get('spfm.docTransferDefin.model.view.tableColumnDisplay')
          .d('业务单据编码字段'),
        transformRequest(value) {
          return value && value.columnName;
        },
        transformResponse(value) {
          return {
            columnName: value,
          };
        },
      },
      {
        name: 'isEditor',
        type: 'boolean',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('spfm.docTransferDefin.model.view.action').d('操作'),
      },
    ],
    selection: false,
    events: {
      update: ({ record, name, oldValue }) => {
        if (name === 'tableNameObj') {
          if (!record.getState('cancelFlag')) {
            const { docDeliverLineConditionList, docDeliverTableRelationList } = record.toData();
            if (!isEmpty(docDeliverLineConditionList) || !isEmpty(docDeliverTableRelationList)) {
              Modal.confirm({
                title: intl
                  .get('spfm.docTransferDefin.view.header.clearConfig')
                  .d('条件设置或关联子表有值，更新主表将清空条件设置和关联子表'),
                onOk: () => {
                  record.set({
                    tableColumnObj: null,
                    docDeliverTableRelationList: null,
                    docDeliverLineConditionList: null,
                  });
                },
                onCancel: () => {
                  record.setState({
                    cancelFlag: true,
                  });
                  record.set({
                    tableNameObj: oldValue,
                  });
                },
              });
            } else {
              record.set({
                tableColumnObj: null,
              });
            }
          } else {
            record.setState({
              cancelFlag: false,
            });
          }
        }
      },
    },
  };
}
