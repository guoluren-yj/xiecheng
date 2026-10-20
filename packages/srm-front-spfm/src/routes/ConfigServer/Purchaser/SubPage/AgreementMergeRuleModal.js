/*
 * 采购协议并单规则定义
 * @date: 2019-12-12
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Form } from 'hzero-ui';
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
export default class AgreementMergeRuleModal extends Component {
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
      type: 'configServer/queryAgreementMergeRule',
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
      handleModal(false);
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
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    dispatch({
      type: 'configServer/saveAgreementMergeRule',
      payload: addList,
    }).then((data) => {
      if (data) {
        if (isArray(dataSource) && !isEmpty(dataSource)) {
          dataSource[0].$form.resetFields();
        }
        this.hideModal();
        notification.success();
      }
    });
  }

  render() {
    const { visible, loading } = this.props;
    const { dataSource } = this.state;
    // const rowSelection = {
    //   selectedRowKeys: selectedRows.map(n => n.ruleId),
    //   onChange: this.handleSelectedRows,
    // };
    const columns = [
      {
        title: intl.get(`spfm.configServer.view.order.modal.companyFlag`).d('公司'),
        dataIndex: 'mrCompanyFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrCompanyFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.supplierFlag`).d('供应商'),
        dataIndex: 'mrSupplierFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrSupplierFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('spfm.configServer.model.supplier.businessUnitFlag').d('业务实体'),
        dataIndex: 'mrBeFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrBeFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.purchaseOrgFlag`).d('采购组织'),
        dataIndex: 'mrPoFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrPoFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.view.order.modal.purchaseAgentFlag`).d('采购员'),
        dataIndex: 'mrBuyerFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrBuyerFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.mrCosdFlag`).d('来源单据编码'),
        dataIndex: 'mrCosdFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`mrCosdFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'mrMcFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('mrMcFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.mrMcfFlag`).d('物料分类'),
        dataIndex: 'mrMcfFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('mrMcfFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.mrTcFlag`).d('税种'),
        dataIndex: 'mrTcFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('mrTcFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.mrCurrencyFlag`).d('币种'),
        dataIndex: 'mrCurrencyFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('mrCurrencyFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.mrTermsFlag`).d('付款条款'),
        dataIndex: 'mrTermsFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('mrTermsFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.departmentFlag`).d('部门'),
        dataIndex: 'departmentFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator('departmentFlag', {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
    ];
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.purchaseContract.010609lable`)
          .d('采购协议并单规则')}
        visible={visible}
        width={1200}
        onOk={this.saveList}
        onCancel={this.hideModal}
      >
        {/* <Row>
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
        </Row> */}

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
