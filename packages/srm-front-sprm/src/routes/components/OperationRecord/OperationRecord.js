/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Table, Tooltip, Tabs } from 'hzero-ui';
import { isFunction, sum, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

import ApproveHistory from './ApproveHistory';
import CancelingHistory from './CancelingHistory';

const commonPrompt = 'sprm.common.model.common';
const { TabPane } = Tabs;
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
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  // @Bind()
  // tabChange(activeKey) {
  //   const { handleOperationRecordSearch } = this.props;
  //   if (activeKey === 'operation') {
  //     handleOperationRecordSearch();
  //   } else {
  //     // console.log(this.approveHistory);
  //     if (this.approveHistory) {
  //       this.approveHistory.queryApproveRecords();
  //     }
  //     // this.approveHistory?this.approveHistory.queryApproveRecords()
  //   }
  // }

  render() {
    const {
      loading,
      visible,
      hideModal,
      pagination,
      dataSource,
      handleOperationRecordSearch,
      filterCondition = [],
      title,
      columnsCover,
      record,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.roles.operator').d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
        width: 140,
        dataIndex: 'processedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrompt}.motion`).d('动作'),
        width: 100,
        dataIndex: 'processTypeCodeMeaning',
      },
      {
        title: intl.get(`${commonPrompt}.handleRemark`).d('操作说明'),
        width: 100,
        dataIndex: 'processRemark',
        render: (text, currentRecord) => {
          const { processTypeCode, multiExecutorName } = currentRecord;
          const assignRemark =
            processTypeCode === 'ASSIGNED' && text
              ? intl.get('sprm.common.model.assignText', { text }).d(`,分配说明：${text}`)
              : '';
          const textRender =
            processTypeCode !== 'ASSIGNED'
              ? text
              : multiExecutorName
              ? intl
                  .get('sprm.purchaseRequisitionApproval.model.assignRemark', {
                    multiExecutorName,
                    text: assignRemark,
                  })
                  .d(`申请行已分配给${multiExecutorName}${assignRemark}`)
              : intl.get('sprm.purchaseRequisitionApproval.model.assigned').d('申请行已分配');
          return (
            <Tooltip title={textRender} placement="left">
              {textRender}
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
        width: 100,
        dataIndex: 'changeField',
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        width: 80,
        dataIndex: 'displayLineNum',
      },
      {
        title: intl.get(`${commonPrompt}.beforeModify`).d('修改前'),
        dataIndex: 'oldValue',
        onCell: this.onCell,
        width: 250,
      },
      {
        title: intl.get(`${commonPrompt}.afterModify`).d('修改后'),
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
      title: title || intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    const tableProps = {
      loading,
      columns: isArray(columnsCover)
        ? columnsCover
        : columns.filter((item) => !filterCondition.includes(item.dataIndex)),
      dataSource,
      pagination,
      bordered: true,
      rowKey: (_, index) => index,
      onChange: handleOperationRecordSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return visible ? (
      <Modal {...modalProps}>
        <Tabs animated={false}>
          <TabPane tab={intl.get(`hzero.common.button.operating`).d('操作记录')} key="operation">
            <Table {...tableProps} />
          </TabPane>
          <TabPane tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')} key="approve">
            {visible && (
              <ApproveHistory
                record={record}
                onRef={(node) => {
                  this.approveHistory = node;
                }}
              />
            )}
          </TabPane>
          <TabPane
            tab={intl.get(`hzero.common.button.cancelHistory`).d('取消审批记录')}
            key="cancel"
          >
            {visible && (
              <CancelingHistory
                record={record}
                onRef={(node) => {
                  this.approveHistory = node;
                }}
              />
            )}
          </TabPane>
        </Tabs>
      </Modal>
    ) : (
      ''
    );
  }
}
