/**
 * AssignOrganizationLov - 采购组织多选lov
 * @date: 2019-11-22
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import Search from './Search';

export default class AssignOrganizationLov extends PureComponent {
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
  fetchPurOrganizationLov(page) {
    const { onFetchPurOrganization } = this.props;
    const params = this.form.getFieldsValue();
    onFetchPurOrganization(page, params);
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

  /**
   * 勾选行确定
   */
  @Bind()
  handleOk() {
    const { selectedRows } = this.state;
    const { onOk } = this.props;
    onOk(selectedRows);
    this.setState({
      selectedRows: [],
    });
  }

  render() {
    const { selectedRows = [] } = this.state;
    const {
      purOrganizationLovList = [],
      purOrgLovPagination = {},
      purOrgLovLoading,
      visibleLovModal,
      onCancel,
    } = this.props;
    const filterProps = {
      onRef: this.handleRef,
      onSearch: this.fetchPurOrganizationLov,
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
        width: 200,
      },
      {
        title: intl
          .get('hpfm.operationUnit.model.operationUnit.organizationName')
          .d('采购组织名称'),
        dataIndex: 'organizationName',
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.sourceCode').d('数据来源'),
        dataIndex: 'sourceCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.operationUnit.model.operationUnit.externalSystemCode').d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 150,
      },
    ];
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width={800}
          title={intl.get('hpfm.operationUnit.model.operationUnit.proOrganization').d('采购组织')}
          visible={visibleLovModal}
          onCancel={() => {
            onCancel();
            this.setState({
              selectedRows: [],
            });
          }}
          onOk={this.handleOk}
        >
          <div className="table-list-search">
            <Search {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="purchaseOrgId"
            rowSelection={rowSelection}
            loading={purOrgLovLoading}
            dataSource={purOrganizationLovList}
            columns={columns}
            pagination={purOrgLovPagination}
            onChange={this.fetchPurOrganizationLov}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
