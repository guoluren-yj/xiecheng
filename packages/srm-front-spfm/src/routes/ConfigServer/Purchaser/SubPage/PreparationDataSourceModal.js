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
export default class PreparationDataSourceModal extends Component {
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
      type: 'configServer/queryAgreementDataSource',
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.map(item => ({ ...item, _status: 'update' })),
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
      type: 'configServer/saveAgreementDataSource',
      payload: addList,
    }).then(data => {
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
        title: intl.get(`spfm.configServer.model.purchaseContract.dsHcFlag`).d('手工创建'),
        dataIndex: 'dsHcFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`dsHcFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.dsPrFlag`).d('采购需求'),
        dataIndex: 'dsPrFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`dsPrFlag`, {
              initialValue: val === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get('spfm.configServer.model.purchaseContract.dsPoFlag').d('采购订单'),
        dataIndex: 'dsPoFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`dsPoFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spfm.configServer.model.purchaseContract.dsFrFlag`).d('寻源结果'),
        dataIndex: 'dsFrFlag',
        align: 'left',
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`dsFrFlag`, {
              initialValue: val === 1 ? 1 : 0,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
    ];
    return (
      <Modal
        title={intl
          .get(`spfm.configServer.view.purchaseContract.protocolDateSource`)
          .d('协议拟制数据来源')}
        visible={visible}
        width={600}
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
