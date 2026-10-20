/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Table } from 'hzero-ui';
import { isFunction, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

const modelPrompt = 'sprm.purchaseRequisitionApproval.model.common';
const commonPrompt = 'sprm.common.model.common';

@withRouter
export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props, state, snap) {
    if (snap) {
      const { handleOperationRecordSearch } = this.props;
      if (isFunction(handleOperationRecordSearch)) {
        handleOperationRecordSearch();
      }
    }
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      loading,
      visible,
      hideModal,
      pagination,
      dataSource,
      handleOperationRecordSearch,
    } = this.props;
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.operationHandleDate`).d('操作时间'),
        width: 140,
        dataIndex: 'processedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.motion`).d('动作'),
        width: 100,
        dataIndex: 'processTypeCodeMeaning',
      },
      {
        title: intl.get(`${modelPrompt}.handleRemark`).d('操作说明'),
        width: 100,
        dataIndex: 'processRemark',
      },
      {
        title: intl.get(`${modelPrompt}.changeField`).d('修改内容'),
        width: 100,
        dataIndex: 'changeField',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        width: 80,
        dataIndex: 'displayLineNum',
      },
      {
        title: intl.get(`${modelPrompt}.beforeModify`).d('修改前'),
        dataIndex: 'oldValue',
        onCell: this.onCell,
        width: 250,
      },
      {
        title: intl.get(`${modelPrompt}.afterModify`).d('修改后'),
        dataIndex: 'newValue',
        onCell: this.onCell,
        width: 250,
      },
    ];
    const modalProps = {
      visible,
      width: 880,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: (record, index) => index,
      onChange: handleOperationRecordSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) + 300 };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
