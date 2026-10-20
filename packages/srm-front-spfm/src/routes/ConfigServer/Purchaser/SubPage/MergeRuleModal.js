/*
 * 并单规则定义
 * @date: 2018/11/09 14:56:50
 * @author: Liu zhaohui <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form } from 'hzero-ui';
import { isArray, isEmpty, sum, isNumber } from 'lodash';
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
  saving: loading.effects['configServer/saveAsnMergeRules'],
  loading: loading.effects['configServer/fetchAsnMergeRules'],
  configServer,
}))
export default class MergeRuleModal extends Component {
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
   * 查询并单规则列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchAsnMergeRules',
      payload: {
        page,
      },
    });
  }

  /**
   * 关闭并单规则弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('singleRuleVisible', false);
    }
  }

  /**
   * 新建一条并单规则
   */
  @Bind()
  create() {
    const { tenantId } = this.state;
    const {
      configServer: { mergeRules, mergeRulesPagination },
      dispatch,
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        mergeRules: [
          {
            tenantId,
            ruleId: uuidv4(),
            _status: 'create',
          },
          ...mergeRules,
        ],
        mergeRulesPagination: addItemToPagination(mergeRules.length, mergeRulesPagination),
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
   * 删除并单规则
   */
  @Bind()
  handleDeleteRules() {
    const that = this;
    const { selectedRows } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.ruleId);
    const {
      dispatch,
      configServer: { mergeRules, mergeRulesPagination },
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.deliver.modal.delete.sure`).d('确定删除吗?'),
        onOk() {
          const items = [];
          const newDataSource = [];
          mergeRules.forEach((item) => {
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
                const newPagination = delItemToPagination(mergeRules.length, mergeRulesPagination);
                dispatch({
                  type: 'configServer/updateState',
                  payload: {
                    mergeRules: newDataSource,
                    mergeRulesPagination: newPagination,
                  },
                });
              }
            });
          } else {
            that.handleSelectedRows([], []);
            notification.success();
            const newPagination = delItemToPagination(mergeRules.length, mergeRulesPagination);
            dispatch({
              type: 'configServer/updateState',
              payload: {
                mergeRules: newDataSource,
                mergeRulesPagination: newPagination,
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
   * 保存并单规则
   * @returns
   */
  @Bind()
  saveList() {
    const {
      configServer: { mergeRules, mergeRulesPagination },
      dispatch,
    } = this.props;
    const addList = getEditTableData(mergeRules, ['ruleId']);
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    dispatch({
      type: 'configServer/saveAsnMergeRules',
      payload: addList,
    }).then((data) => {
      if (data) {
        this.handleSearch(mergeRulesPagination);
        notification.success();
      }
    });
  }

  render() {
    const {
      visible,
      saving,
      loading,
      configServer: { mergeRules, mergeRulesPagination },
    } = this.props;
    const { tenantId, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.ruleId),
      onChange: this.handleSelectedRows,
    };
    const columns = [
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyId',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('companyId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.company.tag`).d('公司'),
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
        title: intl.get(`spfm.configServer.view.deliver.modal.mergeCompanyFlag`).d('企业'),
        dataIndex: 'mergeCompanyFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeCompanyFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('entity.supplier.tag').d('供应商'),
        dataIndex: 'mergeSupplierFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mergeSupplierFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.supplierSiteFlag`).d('供应商地点'),
        dataIndex: 'supplierSiteFlag',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`supplierSiteFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.shipToLocationAddress`).d('收货地点'),
        dataIndex: 'shipToLocationAddressFlag',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`shipToLocationAddressFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('entity.organization.class.receiving').d('收货组织'),
        dataIndex: 'meargeInvOrganizationFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`meargeInvOrganizationFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.inventoryFlag`).d('收货库房'),
        dataIndex: 'inventoryFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`inventoryFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.shipToThirdPartyFlag`).d('送达方'),
        dataIndex: 'shipToThirdPartyFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`shipToThirdPartyFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`purchaseOrgFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.purchaseAgentFlag`).d('采购员'),
        dataIndex: 'purchaseAgentFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`purchaseAgentFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('entity.order.class.purchase').d('采购订单'),
        dataIndex: 'poFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`poFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.sourcePlatform`).d('订单来源'),
        dataIndex: 'poSourcePlatformFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`poSourcePlatformFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.orderTypeName`).d('订单类型'),
        dataIndex: 'poTypeFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`poTypeFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.deliver.modal.immedShippedFlag`).d('直发属性'),
        dataIndex: 'immedShippedFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`immedShippedFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl
          .get(`spfm.configServer.view.message.model.configServer.exemptInspectionFlag`)
          .d('是否免检'),
        dataIndex: 'exemptInspectionFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`exemptInspectionFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl
          .get(`spfm.configServer.view.message.model.configServer.inspectionFlag`)
          .d('是否寄售'),
        dataIndex: 'inspectionFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`inspectionFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl
          .get(`spfm.configServer.view.message.model.configServer.needDateFlag`)
          .d('需求日期'),
        dataIndex: 'needDateFlag',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`needDateFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.currencyFlag`).d('币种'),
        dataIndex: 'currencyCodeFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`currencyCodeFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.categoryFlag`).d('物料品类'),
        dataIndex: 'categoryFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`categoryFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.supplier.carriersFlag`).d('加工厂'),
        dataIndex: 'carriersFlag',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`carriersFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 200;
    return (
      <Modal
        title={intl.get(`spfm.configServer.view.deliver.modal.mergeRule.title`).d('并单规则定义')}
        visible={visible}
        footer={null}
        width={1200}
        onCancel={this.hideModal}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="primary" onClick={this.create} style={{ marginLeft: 8 }}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button onClick={this.saveList} style={{ marginLeft: 8 }} loading={saving || loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            type="default"
            onClick={this.handleDeleteRules}
            disabled={isArray(selectedRows) && isEmpty(selectedRows)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        <EditTable
          bordered
          className={styles['order-config-table']}
          loading={loading}
          rowKey="ruleId"
          scroll={{ x: scrollX }}
          dataSource={mergeRules}
          pagination={mergeRulesPagination}
          onChange={this.handleSearch}
          columns={columns}
          rowSelection={rowSelection}
        />
      </Modal>
    );
  }
}
