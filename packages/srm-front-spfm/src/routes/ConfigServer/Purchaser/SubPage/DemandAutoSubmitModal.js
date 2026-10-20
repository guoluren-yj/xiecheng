/*
 * PurchaseRequisitionApprovalConfig - 采购申请审批配置弹窗
 * @date: 2020-05-25
 * @author: PN <na.peng@hand-china.com>
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
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/fetchDemandAutoSubmit'],
  saving: loading.effects['configServer/saveDemandAutoSubmit'],
  deleting: loading.effects['configServer/removeDemandAutoSubmit'],
}))
export default class PurchaseRequisitionApprovalConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
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
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    dataSource.forEach(item => {
      if (item.$form) item.$form.resetFields();
    });
    dispatch({
      type: 'configServer/fetchDemandAutoSubmit',
      payload: { page },
    }).then(res => {
      if (res && res.content) {
        this.setState({
          dataSource: res.content.map(item => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
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
    const { dataSource, pagination } = this.state;
    this.setState({
      dataSource: [{ prSubmitConfigId: uuid(), _status: 'create' }, ...dataSource],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  @Bind()
  updateFlag(record) {
    const { dataSource } = this.state;
    const newData = dataSource.map(item =>
      item.prSubmitConfigId === record.prSubmitConfigId
        ? {
            ...item,
            updateFlag: 1,
          }
        : {
            ...item,
          }
    );
    this.setState({ dataSource: newData });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource, tenantId } = this.state;
    const { dispatch } = this.props;
    const prSyncConfig = getEditTableData(dataSource, ['prSubmitConfigId'])
      .filter(e => e.updateFlag === 1)
      .map(item => {
        return {
          tenantId,
          ...item,
        };
      });
    if (isArray(prSyncConfig) && !isEmpty(prSyncConfig)) {
      dispatch({
        type: 'configServer/saveDemandAutoSubmit',
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
      handleModal('demandAutoSubmitVisible', false);
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
    const { dispatch } = this.props;
    const selectedRowKeys = selectedRows.map(item => item.prSubmitConfigId);
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.configServer.view.message.shield.title.content`).d('确定删除吗？'),
      onOk: () => {
        dataSource.forEach(item => {
          if (!selectedRowKeys.includes(item.prSubmitConfigId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'configServer/removeDemandAutoSubmit',
            payload: deleteList,
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
        this.setState({
          selectedRows: [],
          dataSource: newDataSource,
          pagination: delItemsToPagination(selectedRows.length, dataSource.length, pagination),
        });
      },
    });
  }

  @Bind()
  handleRecordChange(row, record) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map(item => {
      if (item.prSubmitConfigId === record.prSubmitConfigId) {
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

  @Bind()
  changePrSourcePlatform(val, item, record) {
    const meaning = item ? item.props.children : '';
    if (record.$form) {
      const { $form } = record;
      $form.registerField('prSourcePlatformMeaning');
      $form.setFieldsValue({ prSourcePlatformMeaning: meaning });
      this.updateFlag(record);
    }
  }

  render() {
    const {
      loading,
      saving,
      deleting,
      visible = false,
      configServer: { enumMap = {} },
    } = this.props;
    const { dataSource = [], tenantId, selectedRows, pagination } = this.state;

    const { prSrcPlateFormSubmit = [] } = enumMap;
    // const editPlatform = dataSource.map(e => e.prSourcePlatform);

    const rowSelection = {
      selectedRowKeys: selectedRows.map(item => item.prSubmitConfigId),
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = [
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`companyId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
                initialValue: record.companyId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.COMPANY"
                  textValue={record.companyName}
                  queryParams={{ tenantId }}
                  onChange={() => this.updateFlag(record)}
                />
              )}
            </FormItem>
          ) : (
            val
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
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.prSourcePlatform`)
                        .d('单据来源'),
                    }),
                  },
                ],
              })(
                <Select
                  showSearch
                  style={{ width: '150px' }}
                  allowClear
                  onChange={(value, item) => this.changePrSourcePlatform(value, item, record)}
                >
                  {prSrcPlateFormSubmit.map(item => (
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
        title: intl.get(`spfm.configServer.model.configServer.purchaseAgentName`).d('默认采购员'),
        dataIndex: 'purchaseAgentName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseAgentId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.purchaseAgentName`)
                        .d('默认采购员'),
                    }),
                  },
                ],
                initialValue: record.purchaseAgentId,
              })(
                <Lov
                  code="SFIN.USER_AUTH.PURCHASE_AGENT"
                  queryParams={{ organizationId: tenantId, tenantId }}
                  textFeild="purchaseAgentName"
                  onChange={() => this.updateFlag(record)}
                  textValue={record.purchaseAgentName}
                  lovOptions={{ displayField: 'purchaseAgentName', valueField: 'purchaseAgentId' }}
                />
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
      pagination,
      bordered: true,
      rowKey: 'prSubmitConfigId',
      onChange: page => this.handleSearch(page),
    };
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.message.modal.demandAutoSubmit`)
          .d('采购申请默认采购员配置')}
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
