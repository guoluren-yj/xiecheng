/**
 * DirectInvoiceModal 直连开票规则定义弹窗
 * @date: 2019-9-25
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isArray } from 'lodash';

import EditTable from 'components/EditTable';
import { getEditTableData, createPagination } from 'utils/utils';
import notification from 'utils/notification';
import Switch from 'components/Switch';
import { isFunction } from 'util';

import styles from './index.less';

@connect(({ configServer, loading }) => ({
  queryOrderEvaluateLoading: loading.effects['configServer/queryOrderEvaluate'],
  saving: loading.effects['configServer/saveOrderEvaluate'],
  configServer,
}))
@Form.create({ fieldNameProp: null })
export default class OrderEvaluateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 订单评价配置数据
      pagination: {}, // 订单评价配置分页信息
    };
  }

  componentDidMount() {
    this.handleQuery();
  }

  /**
   * 订单评价配置查询
   */
  @Bind()
  handleQuery(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/queryOrderEvaluate',
      payload: { page },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content.map(item => {
            return { ...item, _status: 'update' };
          }),
          pagination: createPagination(res),
        });
        this.setUpdate('reset');
      }
    });
  }

  /**
   * 订单评价配置保存
   */
  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource = [] } = this.state;
    const editTableData = getEditTableData(dataSource, ['rowkey']);
    if (isArray(editTableData)) {
      dispatch({
        type: 'configServer/saveOrderEvaluate',
        payload: editTableData,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleQuery();
        }
      });
    }
  }

  /**
   * 关闭订单评价弹窗
   */
  @Bind()
  handleModalVisible() {
    const { handleStateVisible } = this.props;
    if (isFunction(handleStateVisible)) {
      handleStateVisible('orderEvaluateVisible', false);
    }
  }

  render() {
    const { saving, orderEvaluateVisible, queryOrderEvaluateLoading = false } = this.props;
    const { dataSource = [], pagination } = this.state;
    const columns = [
      {
        title: intl.get(`entity.company.companyCode`).d('公司编码'),
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 220,
      },
      {
        title: intl.get(`hzero.common.status.enableFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 120,
        render: (val, record) => {
          return (
            <Form.Item record={record}>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val,
              })(<Switch />)}
            </Form.Item>
          );
        },
      },
    ];
    return (
      <Fragment>
        <Modal
          title={intl.get(`spfm.configServer.view.order.message.010217`).d('启用订单评价')}
          visible={orderEvaluateVisible}
          onCancel={this.handleModalVisible}
          footer={null}
          width={600}
          className={styles['order-evaluate']}
        >
          <div className={styles.header}>
            <Button onClick={this.handleSave} loading={saving} type="primary">
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          <EditTable
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            bordered
            onChange={this.handleQuery}
            loading={queryOrderEvaluateLoading}
          />
        </Modal>
      </Fragment>
    );
  }
}
