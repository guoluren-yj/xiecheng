/*
 * PurchaseRequisitionApprovalConfig - 采购申请审批配置弹窗
 * @date: 2019-07-10
 * @author: ZXY <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, omit } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchPurchaseRequisitionSendBackPurchaseRequest'],
  saving: loading.effects['configServer/savefetchPurchaseRequisitionSendBackPurchaseRequest'],
  deleting: loading.effects['configServer/deletefetchPurchaseRequisitionSendBackPurchaseRequest'],
}))
export default class PurchaseRequisitionApprovalConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
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
      type: 'configServer/fetchPurchaseRequisitionSendBackPurchaseRequest',
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  /**
   * 新建
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ prSyncConfigId: uuid(), _status: 'create' }, ...dataSource],
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource, tenantId } = this.state;
    const { dispatch } = this.props;
    const prSyncConfig = getEditTableData(dataSource, ['prSyncConfigId']).map(item => ({
      tenantId,
      ...item,
      // companyName: item.compName || companyName,
    }));
    if (isArray(prSyncConfig) && !isEmpty(prSyncConfig)) {
      dispatch({
        type: 'configServer/savefetchPurchaseRequisitionSendBackPurchaseRequest',
        payload: prSyncConfig,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('billUpdateRuleVisible', false);
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
    const { selectedRows, dataSource } = this.state;
    const { dispatch } = this.props;
    const selectedRowKeys = selectedRows.map(item => item.prSyncConfigId);
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.shield.title.content`).d('确定删除吗？'),
      onOk: () => {
        dataSource.forEach(item => {
          if (!selectedRowKeys.includes(item.prSyncConfigId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'configServer/deletefetchPurchaseRequisitionSendBackPurchaseRequest',
            payload: deleteList,
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
        this.setState({ selectedRows: [], dataSource: newDataSource });
      },
    });
  }

  @Bind()
  handleRecordChange(row, record) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map(item => {
      if (item.prSyncConfigId === record.prSyncConfigId) {
        return {
          ...item,
          companyName: row.companyName,
        };
      }
      return item;
    });
    this.setState({
      dataSource: newDataSource,
    });
  }

  render() {
    const {
      loading,
      saving,
      deleting,
      visible = false,
      configServer: { enumMap = {} },
    } = this.props;
    const { dataSource = [], tenantId, selectedRows } = this.state;
    const { listType = [], prSrcPlateForm = [] } = enumMap;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item.prSyncConfigId),
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get(`entity.item.companyId`).d('公司'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`companyId`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.item.companyId`).d('公司'),
                  }),
                },
              ],
              initialValue: val,
            })(
              <Lov
                code="HPFM.COMPANY"
                textValue={record.companyName}
                queryParams={{
                  enabledFlag: 1,
                  tenantId,
                }}
                onChange={(value, row) => this.handleRecordChange(row, record)}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatform',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`prSourcePlatform`, {
                initialValue: record.prSourcePlatform,
              })(
                <Select showSearch style={{ width: '150px' }} allowClear>
                  {prSrcPlateForm
                    .filter(n => !['ERP'].includes(n.value))
                    .map(item => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get(`spfm.configServer.model.configServer.erpExecutionTypeCode`)
          .d('执行单据类型'),
        dataIndex: 'erpExecutionTypeCode',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`erpExecutionTypeCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.erpExecutionTypeCode`)
                        .d('执行单据类型'),
                    }),
                  },
                ],
                initialValue: record.erpExecutionTypeCode,
              })(
                <Select showSearch style={{ width: '150px' }} allowClear>
                  {listType.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const editTableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination: false,
      bordered: true,
      rowKey: 'prSyncConfigId',
    };
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.message.modal.backOrderDefine`)
          .d('需求回传ERP配置')}
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
          <Button type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}
