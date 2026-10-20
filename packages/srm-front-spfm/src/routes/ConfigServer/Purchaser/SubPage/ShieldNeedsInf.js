/*
 * PurchaseRequisitionApprovalConfig - 采购申请审批配置弹窗
 * @date: 2019-07-10
 * @author: ZXY <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty } from 'lodash';
import { connect } from 'dva';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import {
  getCurrentOrganizationId,
  createPagination,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

// const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchShieldNeedsInfList'],
  saving: loading.effects['configServer/saveShieldNeedsInf'],
  deleting: loading.effects['configServer/deleteShieldNeedsInf'],
}))
export default class PurchaseRequisitionApprovalConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
      pagination: {},
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchShieldNeedsInfList',
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 新建
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate(value, lovRecord) {
    const { dataSource, pagination } = this.state;
    const roleIdExitFlag = dataSource.some((item) => item.roleId === value);
    if (!roleIdExitFlag) {
      this.setState({
        dataSource: [
          ...dataSource,
          {
            roleId: lovRecord.roleId,
            roleName: lovRecord.roleName,
            roleCode: lovRecord.roleCode,
            roleLevel: lovRecord.roleLevel,
          },
        ],
        pagination: addItemToPagination(dataSource.length, pagination),
      });
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/saveShieldNeedsInf',
      payload: dataSource,
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('shieldNeedsInfVisible', false);
    }
  }

  /**
   * 改变主键
   * @param {Array} selectedRows 选中数据数组
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { selectedRows, dataSource, pagination } = this.state;
    const selectedRowsKeys = selectedRows.map((ele) => ele.roleId);
    const { dispatch } = this.props;
    const newDataSource = [];
    const deleteList = [];

    dataSource.forEach((item) => {
      if (!selectedRowsKeys.includes(item.roleId)) {
        newDataSource.push(item);
      } else if (item.hideId && selectedRowsKeys.includes(item.roleId)) {
        deleteList.push(item);
      }
    });

    if (!isEmpty(deleteList)) {
      Modal.confirm({
        title: intl.get(`spfm.configServer.view.message.shield.title.content`).d('确定删除吗？'),
        onOk: () => {
          dispatch({
            type: 'configServer/deleteShieldNeedsInf',
            payload: deleteList,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        },
      });
    } else {
      this.setState({
        selectedRows: [],
        dataSource: newDataSource,
        pagination: delItemsToPagination(selectedRowsKeys.length, dataSource.length, pagination),
      });
    }
  }

  render() {
    const { loading, saving, deleting, visible = false } = this.props;
    const { dataSource = [], tenantId, selectedRows, pagination } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item.roleId),
      onChange: this.handleChangeSelectRowKeys,
    };
    const excludeRoleIds = (dataSource.map((ele) => ele.roleId) || []).join() || undefined;
    const columns = [
      {
        title: intl.get(`hiam.subAccount.model.role.name`).d('角色名称'),
        dataIndex: 'roleName',
        width: 200,
      },
      {
        title: intl.get(`spfm.configServer.model.purchaser.roleCode`).d('角色编码'),
        dataIndex: 'roleCode',
        width: 200,
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination,
      bordered: true,
      rowKey: 'roleId',
    };
    return (
      <Modal
        title={intl.get(`spfm.configServer.view.message.modal.authorityControl`).d('权限控制')}
        visible={visible}
        onCancel={this.hideModal}
        width={800}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            onClick={this.handleDelete}
            loading={deleting}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            onClick={this.handleSave}
            loading={saving || loading}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Lov
            isButton
            code="SPUC.PR_HIDE_SUPPLIER_ROLE"
            type="primary"
            queryParams={{ tenantId, excludeRoleIds }}
            textField="roleName"
            onChange={this.handleCreate}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Lov>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}
