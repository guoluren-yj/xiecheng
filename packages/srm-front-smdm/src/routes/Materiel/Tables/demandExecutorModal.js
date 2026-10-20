/**
 * Drawer - 分配采购组织弹窗
 * @date: 2019-11-21
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Modal, Input, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import Search from './Search';

export default class DemandExecutorModal extends PureComponent {
  form;

  state = {
    selectedRows: [],
  };

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchDemand(payload = { current: 1, pageSize: 10 }) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'materiel/fetchExecutorData',
      payload: {
        ...{ size: payload.pageSize, page: payload.current - 1 },
        ...filterValues,
      },
    });
  }

  /**
   * 勾选行
   */
  @Bind()
  onTableSelectedRowChange(selectedRowKeys, addSelectedRows) {
    const { ExecutorData } = this.props;
    const { selectedRows } = this.state;
    const currentRows = ExecutorData.map((item) => item.id);
    const oldRows = selectedRows.filter((item) => !currentRows.includes(item.id));
    const newSelectedRow = [...new Set([...oldRows, ...addSelectedRows])];
    this.setState({
      selectedRows: newSelectedRow,
      selectedRowKeys,
    });
  }

  @Bind()
  onSearchBtnClick() {
    this.fetchDemand();
    this.setState({
      visibleModal: true,
      selectedRowKeys: [],
    });
  }

  @Bind()
  onConfirm() {
    const { onChange, lovType = 'demandExecutor' } = this.props;
    const { selectedRows = [], selectedRowKeys = [] } = this.state;
    let demandExecutor = '';
    selectedRows.forEach((element, index) => {
      if (index > 0) {
        demandExecutor += ';';
      }
      demandExecutor += element.realName;
    });
    onChange(demandExecutor, selectedRowKeys, lovType);
    this.setState({
      visibleModal: false,
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    }
    return (
      <Icon
        key="search"
        type="search"
        onClick={this.onSearchBtnClick}
        style={{ cursor: 'pointer', color: '#666' }}
      />
    );
  }

  render() {
    const { selectedRowKeys = [], visibleModal = false } = this.state;
    const {
      ExecutorData = [],
      ExtorPagination = {},
      demanding,
      onChange,
      text,
      lovType,
    } = this.props;
    const filterProps = {
      onRef: this.handleRef,
      onSearch: this.fetchDemand,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.demand.loginName').d('账号'),
        dataIndex: 'loginName',
        width: 150,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.demand.realName').d('名称'),
        dataIndex: 'realName',
        width: 150,
      },
    ];
    const lovClassNames = ['lov-input'];
    lovClassNames.push('lov-suffix');
    const suffix = (
      <React.Fragment>
        <Icon
          style={{ cursor: 'pointer', color: '#666', marginRight: '4px' }}
          key="clear"
          className="lov-clear"
          type="close-circle"
          onClick={() => onChange(null, null, lovType)}
        />
        {this.searchButton()}
      </React.Fragment>
    );
    return (
      <React.Fragment>
        <div>
          <Input
            readOnly
            value={text}
            suffix={suffix}
            className={lovClassNames.join(' ')}
            allowClear
          />
        </div>
        <Modal
          destroyOnClose
          width={800}
          title={intl.get('smdm.materiel.model.materiel.demandExecutor').d('需求执行人')}
          visible={visibleModal}
          onCancel={() => {
            this.setState({
              visibleModal: false,
              selectedRows: [],
              selectedRowKeys: [],
            });
          }}
          onOk={this.onConfirm}
        >
          <div className="table-list-search">
            <Search {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="id"
            rowSelection={rowSelection}
            loading={demanding}
            dataSource={ExecutorData}
            columns={columns}
            pagination={ExtorPagination}
            onChange={this.fetchDemand}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
