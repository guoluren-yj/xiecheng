/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, createPagination } from 'utils/utils';

import { fetchHistory } from '@/services/tenderPlanService';

const commonPrompt = 'ssrc.common.model.common';

export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleOperationRecordSearch();
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

  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { projectId } = this.props;
    this.setState({
      loading: true,
    });
    fetchHistory({
      projectId,
      page,
    })
      .then((result) => {
        if (getResponse(result)) {
          this.setState({
            dataSource: result.content,
            pagination: createPagination(result),
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  render() {
    const { visible, hideModal } = this.props;

    const { pagination, dataSource, loading } = this.state;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.processUserName`).d('操作人'),
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
      // {
      //   title: intl.get(`${commonPrompt}.handleRemark`).d('操作说明'),
      //   width: 100,
      //   dataIndex: 'processRemark',
      //   render: (text) => {
      //     return (
      //       <Tooltip title={text} placement="left">
      //         {text}
      //       </Tooltip>
      //     );
      //   },
      // },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        width: 80,
        dataIndex: 'lineNum',
      },
      {
        title: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
        width: 100,
        dataIndex: 'changeFieldName',
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
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: (_, index) => index,
      onChange: this.handleOperationRecordSearch,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
