/**
 * Drawer - 分配采购组织弹窗
 * @date: 2019-11-21
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Table, Modal, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import { connect } from 'dva';

import Search from './Search';
@connect(({ loading }) => ({
  setDefaultPurOrganizationLoading: loading.effects['assignOrganization/setDefaultPurOrganization'],
}))
export default class Drawer extends PureComponent {
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
  fetchPurOrganization(page) {
    const { onFetchPurOrganization } = this.props;
    const params = this.form.getFieldsValue();
    onFetchPurOrganization(page, params);
    this.setState({ defaultFlag: '', editingKey: '' });
  }

  /**
   * 删除
   */
  @Bind()
  deletePurOrganization() {
    const { selectedRows } = this.state;
    const { onDeletePurOrganization } = this.props;
    onDeletePurOrganization(selectedRows);
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 勾选行
   */
  @Bind()
  onTableSelectedRowChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  actionRender(text, record) {
    const editable = this.isEditing(record);
    return (
      <div>
        {editable ? (
          <span>
            <a onClick={() => this.save(record)} style={{ marginRight: 8 }}>
              {intl.get(`hzero.common.button.save`).d('保存')}
            </a>
            <a onClick={() => this.cancel(record.purchaseOrgId)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          </span>
        ) : (
          <a onClick={() => this.edit(record.purchaseOrgId, record.defaultFlag)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        )}
      </div>
    );
  }

  isEditing = (record) => {
    return record.purchaseOrgId === this.state.editingKey;
  };

  edit(purchaseOrgId, defaultFlag) {
    this.setState({ editingKey: purchaseOrgId, defaultFlag });
  }

  save(record) {
    // 调接口保存
    const { dispatch, ouId } = this.props;
    const { defaultFlag } = this.state;
    dispatch({
      type: 'assignOrganization/setDefaultPurOrganization',
      payload: {
        ouId,
        purchaseOrganization: { ...record, defaultFlag: defaultFlag ? 1 : 0 },
      },
    }).then((res) => {
      if (res) {
        this.setState({ defaultFlag: '', editingKey: '' });
        // 重新拉取数据
        this.fetchPurOrganization();
      }
    });
  }

  cancel = () => {
    this.setState({ editingKey: '', defaultFlag: '' });
  };

  onDefaultFlagChange = (e) => {
    this.setState({ defaultFlag: e.target.checked });
  };

  render() {
    const { selectedRows = [] } = this.state;
    const {
      purOrganizationList = [],
      purOrgPagination = {},
      purOrgLoading,
      setDefaultPurOrganizationLoading = false,
      visibleModal,
      anchor,
      onCancel,
      onAddOrganization,
    } = this.props;
    const filterProps = {
      onRef: this.handleRef,
      onSearch: this.fetchPurOrganization,
    };
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.purchaseOrgId),
      onChange: this.onTableSelectedRowChange,
    };
    const columns = [
      {
        title: intl
          .get('hpfm.operationUnit.model.operationUnit.organizationCode')
          .d('采购组织编码'),
        dataIndex: 'organizationCode',
        width: 120,
      },
      {
        title: intl
          .get('hpfm.operationUnit.model.operationUnit.organizationName')
          .d('采购组织名称'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.sourceCode').d('数据来源'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.externalSystemCode').d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 120,
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.defalutFlag').d('是否默认采购组织'),
        width: 120,
        dataIndex: 'defaultFlag',
        render: (val, record) =>
          this.isEditing(record) ? (
            <Checkbox checked={this.state.defaultFlag} onChange={this.onDefaultFlagChange} />
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: this.actionRender,
      },
    ];
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width={800}
          title={intl
            .get('hpfm.operationUnit.model.operationUnit.assignProOrganization')
            .d('分配采购组织')}
          visible={visibleModal}
          footer={null}
          onCancel={()=>{
            onCancel();
            this.setState({
              selectedRows: [],
            });
          }}
          wrapClassName={`ant-modal-sidebar-${anchor}`}
          transitionName={`move-${anchor}`}
        >
          <div className="table-list-search">
            <Search {...filterProps} />
          </div>
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={this.deletePurOrganization}
              disabled={selectedRows.length <= 0}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button type="primary" onClick={() => onAddOrganization()}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </div>
          <Table
            bordered
            rowKey="purchaseOrgId"
            rowSelection={rowSelection}
            loading={purOrgLoading || setDefaultPurOrganizationLoading}
            dataSource={purOrganizationList}
            columns={columns}
            pagination={purOrgPagination}
            onChange={(page) => this.fetchPurOrganization(page)}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
