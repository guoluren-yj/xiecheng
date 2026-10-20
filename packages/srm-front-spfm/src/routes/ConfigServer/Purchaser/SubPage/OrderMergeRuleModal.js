/*
 * 订单并单规则定义
 * @date: 2019-02-19
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Row, Col } from 'hzero-ui';
import { isArray, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  saving: loading.effects['configServer/saveOrderMergeRule'],
  loading: loading.effects['configServer/fetchOrderMergeRuleList'],
  configServer,
}))
export default class OrderMergeRuleModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
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
  handleSearch() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    if (isArray(dataSource) && !isEmpty(dataSource)) {
      dataSource[0].$form.resetFields();
    }
    dispatch({
      type: 'configServer/fetchOrderMergeRuleList',
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.map((item) => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  /**
   * 关闭并单规则弹窗
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('orderMergeRulesVisible', false);
    }
  }

  /**
   * 新建一条并单规则
   */
  @Bind()
  create() {
    const { tenantId } = this.state;
    this.setState({
      dataSource: [
        {
          tenantId,
          ruleId: uuidv4(),
          _status: 'create',
        },
      ],
    });
  }

  /**
   * 改变选中主键
   * @param {[String]} selectedRowKeys
   * @param {[String]} selectedRows
   */
  // @Bind()
  // handleSelectedRows(selectedRowKeys, selectedRows) {
  //   this.setState({ selectedRows });
  // }

  /**
   * 保存并单规则
   * @returns
   */
  @Bind()
  saveList() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const addList = getEditTableData(dataSource, ['ruleId']);
    const choosedFlag = addList.some((ele) => ele.enabledFlag === 1);
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    if (!choosedFlag) {
      notification.warning({
        message: intl
          .get('spfm.configServer.view.order.enableBusinessType')
          .d('请至少启用一种业务类型！'),
      });
      return;
    }
    dispatch({
      type: 'configServer/saveOrderMergeRule',
      payload: {
        poMergeRules: addList,
      },
    }).then((data) => {
      if (data) {
        if (isArray(dataSource) && !isEmpty(dataSource)) {
          dataSource[0].$form.resetFields();
        }
        this.handleSearch();
        notification.success();
      }
    });
  }

  @Bind()
  renderCheckBox(record = {}) {
    return record.businessType === 'IMPORT_CHANGE_ORDER';
  }

  render() {
    const { visible, saving, loading } = this.props;
    const { dataSource } = this.state;
    // const rowSelection = {
    //   selectedRowKeys: selectedRows.map(n => n.ruleId),
    //   onChange: this.handleSelectedRows,
    // };
    const columns = [
      {
        title: intl.get(`spfm.configServer.view.order.modal.businessType`).d('业务类型'),
        dataIndex: 'businessType',
        align: 'left',
        render: (val, record) => <FormItem>{record.businessTypeMeaning}</FormItem>,
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.source`).d('单据来源'),
        dataIndex: 'prSourcePlatformFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`prSourcePlatformFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.supplierFlag`).d('供应商'),
        dataIndex: 'supplierFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`supplierFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.companyFlag`).d('公司'),
        dataIndex: 'companyFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`companyFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled />)}
            </FormItem>
          ),
      },
      {
        title: intl.get('entity.organization.class.ouFlag').d('业务实体'),
        dataIndex: 'ouFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`ouFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.purchaseOrgFlag`).d('采购组织'),
        dataIndex: 'purchaseOrgFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseOrgFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.purchaseAgentFlag`).d('采购员'),
        dataIndex: 'purchaseAgentFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`purchaseAgentFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.invOrgFlag`).d('库存组织'),
        dataIndex: 'invOrgFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`invOrgFlag`, {
                initialValue: val === 1 ? 1 : 0,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get('spfm.configServer.view.order.modal.receiverAddressName').d('收货方地址'),
        dataIndex: 'receiveAddressFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType !== 'PR_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`receiveAddressFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get('spfm.configServer.view.order.modal.docNum').d('单据编号'),
        dataIndex: 'billNumFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`billNumFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get('spfm.configServer.view.docMergeRules.prType').d('单据类型'),
        dataIndex: 'prTypeFlag',
        align: 'left',
        render: (val, record) =>
          record.businessType === 'MANUALLY_CHANGE_ORDER' || this.renderCheckBox(record) ? (
            ''
          ) : (
            <FormItem>
              {record.$form.getFieldDecorator(`prTypeFlag`, {
                initialValue: val === 0 ? 0 : 1,
              })(<Checkbox disabled={record.$form.getFieldValue('enabledFlag') === 0} />)}
            </FormItem>
          ),
      },
    ];
    return (
      <Modal
        title={intl.get(`spfm.configServer.view.order.modal.mergeRule.title`).d('采购订单并单规则')}
        visible={visible}
        footer={null}
        width={1200}
        onCancel={this.hideModal}
      >
        <Row>
          <Col>
            <Button
              icon="save"
              type="primary"
              onClick={this.saveList}
              style={{ float: 'right' }}
              loading={saving || loading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Col>
        </Row>

        <EditTable
          bordered
          className={styles['order-config-table']}
          loading={loading}
          rowKey="ruleId"
          dataSource={dataSource}
          pagination={false}
          onChange={this.handleSearch}
          columns={columns}
        />
      </Modal>
    );
  }
}
