/*
 * RiskScanModal - 未加入监控企业的风险扫描弹出框
 * @date: 2019/07/04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Modal, Button, Form, Select } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { getUserOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
// import Switch from 'components/Switch';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ configServer, loading }) => ({
  configServer,
  queryLoading: loading.effects['configServer/fetchDeliverySource'],
  saveLoading: loading.effects['configServer/saveDeliverySource'],
}))
export default class DeliverClosedModal extends Component {
  state = {
    dataSource: [],
    tenantId: getUserOrganizationId(),
  };

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchDeliverySource',
      payload: { tenantId },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.map(item => ({ ...item, _status: 'update' })),
        });
      }
    });
  }

  @Bind()
  save() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const data = getEditTableData(dataSource, ['_status', 'autoCloseConfigId']);
    if (Array.isArray(data) && data.length !== 0) {
      dispatch({
        type: 'configServer/saveDeliverySource',
        payload: data,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  /**
   * 添加行
   */
  @Bind()
  newAdd() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ _status: 'create', autoCloseConfigId: uuid() }, ...dataSource],
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('deliverClosedVisible', false);
    }
  }

  render() {
    const { dataSource } = this.state;
    const { visible, saveLoading, queryLoading, enumMap } = this.props;
    const { deliveryType } = enumMap;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.purchaser.sourceCode`).d('数据来源'),
        dataIndex: 'asnType',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`asnType`, {
                initialValue: record.asnType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.configServer.model.purchaser.sourceCode`).d('数据来源'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {deliveryType.map(n => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.status.ifEnabled').d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag || 0,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get('hzero.common.status.default').d('默认'),
      //   dataIndex: 'defaultFlag',
      //   width: 70,
      //   render: (val, record) =>
      //     ['create', 'update'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator(`defaultFlag`, {
      //           initialValue: record.defaultFlag || 0,
      //         })(<Switch />)}
      //       </Form.Item>
      //     ) : (
      //       val
      //     ),
      // },
    ];

    return (
      <Modal
        title={intl.get(`spfm.configServer.model.purchaser.sourceCode`).d('数据来源')}
        visible={visible}
        onCancel={this.handleModalVisible}
        width={600}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button onClick={this.save} loading={saveLoading} style={{ marginRight: '8px' }}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" onClick={this.newAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="autoCloseConfigId"
          loading={queryLoading}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
        />
      </Modal>
    );
  }
}
