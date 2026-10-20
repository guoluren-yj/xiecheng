/*
 * 查单定义
 * @date: 2018/11/09 14:56:50
 * @author: Liu zhaohui <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

import {
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  delItemToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Lov from 'components/Lov';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  saving: loading.effects['configServer/saveSplitOrderRules'],
  loading: loading.effects['configServer/fetchSplitOrderRules'],
  configServer,
}))
export default class SplitOrderRuleModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询查单列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchSplitOrderRules',
      payload: {
        page,
      },
    });
  }

  /**
   * 关闭查单弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('splitOrderRulesVisible', false);
    }
  }

  /**
   * 新建一条查单
   */
  @Bind()
  create() {
    const { tenantId } = this.state;
    const {
      configServer: { splitOrderRules, splitOrderPagination },
      dispatch,
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        splitOrderRules: [
          {
            tenantId,
            ruleId: uuidv4(),
            _status: 'create',
          },
          ...splitOrderRules,
        ],
        splitOrderPagination: addItemToPagination(splitOrderRules.length, splitOrderPagination),
      },
    });
  }

  /**
   * 改变选中主键
   * @param {[String]} selectedRowKeys
   * @param {[String]} selectedRows
   */
  @Bind()
  handleSelectedRows(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 删除查单
   */
  @Bind()
  handleDeleteRules() {
    const that = this;
    const { selectedRows } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.ruleId);
    const {
      dispatch,
      configServer: { splitOrderRules, splitOrderPagination },
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.deliver.modal.delete.sure`).d('确定删除吗?'),
        onOk() {
          const items = [];
          const newDataSource = [];
          splitOrderRules.forEach((item) => {
            if (item._status !== 'create' && selectedRowKeys.indexOf(item.ruleId) >= 0) {
              items.push(item);
            }
            if (selectedRowKeys.indexOf(item.ruleId) < 0) {
              newDataSource.push(item);
            }
          });
          if (items.length > 0) {
            dispatch({
              type: 'configServer/deleteAsnMergeRules',
              payload: items,
            }).then((res) => {
              if (res) {
                that.handleSelectedRows([], []);
                notification.success();
                const newPagination = delItemToPagination(
                  splitOrderRules.length,
                  splitOrderPagination
                );
                dispatch({
                  type: 'configServer/updateState',
                  payload: {
                    splitOrderRules: newDataSource,
                    splitOrderPagination: newPagination,
                  },
                });
              }
            });
          } else {
            that.handleSelectedRows([], []);
            notification.success();
            const newPagination = delItemToPagination(splitOrderRules.length, splitOrderPagination);
            dispatch({
              type: 'configServer/updateState',
              payload: {
                splitOrderRules: newDataSource,
                splitOrderPagination: newPagination,
              },
            });
          }
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 保存查单
   * @returns
   */
  @Bind()
  saveList() {
    const {
      configServer: { splitOrderRules, splitOrderPagination },
      dispatch,
    } = this.props;
    const addList = getEditTableData(splitOrderRules, ['ruleId']);
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    dispatch({
      type: 'configServer/saveSplitOrderRules',
      payload: addList,
    }).then((data) => {
      if (data) {
        this.handleSearch(splitOrderPagination);
        notification.success();
      }
    });
  }

  render() {
    const {
      visible,
      saving,
      loading,
      configServer: { splitOrderRules, splitOrderPagination },
    } = this.props;
    const { tenantId, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.ruleId),
      onChange: this.handleSelectedRows,
    };
    const columns = [
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('companyId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.company.name').d('公司名称'),
                  }),
                },
              ],
              initialValue: val,
            })(
              <Lov
                code="SPFM.USER_AUTHORITY_COMPANY"
                textValue={record.companyName}
                queryParams={{ tenantId }}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.productSourceFlag`).d('商品来源'),
        dataIndex: 'productSourceFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`productSourceFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.supplierFlag`).d('供应商'),
        dataIndex: 'supplierFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`supplierFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.businessUnitFlag`).d('业务实体'),
        dataIndex: 'businessUnitFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`businessUnitFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.purOrgFlag`).d('采购组织'),
        dataIndex: 'purOrgFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`purOrgFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.addressFlag`).d('采购方收获地址'),
        dataIndex: 'addressFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`addressFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.invoiceTypeFlag`).d('发票类型'),
        dataIndex: 'invoiceTypeFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`invoiceTypeFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.currencyFlag`).d('币种'),
        dataIndex: 'currencyFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`currencyFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.warehousing`).d('物料类别'),
        dataIndex: 'warehousing',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`warehousing`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
    ];
    return (
      <Modal
        title={intl
          .get('spfm.configServer.view.SplitOrderRuleModal.title')
          .d('采购申请拆单规则定义')}
        visible={visible}
        footer={null}
        width={1200}
        onCancel={this.hideModal}
      >
        <div className="header" style={{ overflow: 'hidden' }}>
          <Button type="primary" onClick={this.create} style={{ float: 'right' }}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            onClick={this.saveList}
            style={{ marginRight: 10, float: 'right' }}
            loading={saving || loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable
          className={styles['order-config-table']}
          loading={loading}
          rowKey="ruleId"
          bordered
          dataSource={splitOrderRules}
          pagination={splitOrderPagination}
          onChange={this.handleSearch}
          columns={columns}
          rowSelection={rowSelection}
        />
      </Modal>
    );
  }
}
