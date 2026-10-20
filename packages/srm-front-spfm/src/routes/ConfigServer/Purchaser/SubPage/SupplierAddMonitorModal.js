/*
 * SupplierAddMonitorModal - 供应商加入监控弹出框
 * @date: 2019/07/04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Button, Row, Col, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import { isEmpty, cloneDeep } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getUserOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import Checkbox from 'components/Checkbox';
import styles from './index.less';

const tenantId = getUserOrganizationId();

@Form.create({ fieldNameProp: null })
@connect(({ configServer, loading }) => ({
  configServer,
  enumMap: configServer.enumMap,
  supplierAddMonitor: configServer.enumMap.supplierAddMonitor,
  supplierAddMonitorList: configServer.supplierAddMonitorList,
  queryLoading: loading.effects['configServer/fetchSupplierAddMonitor'],
  saveLoading: loading.effects['configServer/saveSupplierAddMonitor'],
}))
export default class SupplierAddMonitorModal extends Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.handleSupplierAddMonitor();
  }

  /**
   * 查询供应商加入监控
   */
  handleSupplierAddMonitor() {
    const { dispatch, supplierAddMonitor } = this.props;
    dispatch({
      type: 'configServer/fetchSupplierAddMonitor',
      payload: {},
    }).then(res => {
      if (isEmpty(res)) {
        const newList = supplierAddMonitor.map(item => {
          const { ...newItem } = item;
          return { ...newItem, enabledFlag: 0, tenantId, functionCode: item.value };
        });
        this.setState({
          dataSource: newList,
        });
      } else {
        const newList = res.map(item => {
          const { ...newItem } = item;
          return { ...newItem, meaning: item.functionCodeMeaning, value: item.functionCode };
        });
        this.setState({
          dataSource: newList,
        });
      }
    });
  }

  /**
   * 保存供应商加入监控
   */
  @Bind()
  handleSaveSupplierAddMonitor() {
    const { dataSource } = this.state;
    const { dispatch, form } = this.props;
    const value = form.getFieldsValue();
    const dataList = cloneDeep(dataSource);
    dataList.forEach(e => {
      e.enabledFlag = value[`enabledFlag#${e.value}`] === 1 ? 1 : 0;
    });
    dispatch({
      type: 'configServer/saveSupplierAddMonitor',
      payload: {
        adds: dataList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSupplierAddMonitor();
      }
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleModalVisible() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('supplierAddMonitorVisible', false);
    }
  }

  render() {
    const { dataSource } = this.state;
    const { supplierAddMonitorVisible, saveLoading, queryLoading, form } = this.props;

    const columns = [
      {
        title: intl.get(`spfm.configServer.view.message.function`).d('功能'),
        dataIndex: 'meaning',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 70,
        render: (text, record) => {
          return (
            <Form>
              <Form.Item style={{ margin: 0, height: 16 }}>
                {form.getFieldDecorator(`enabledFlag#${record.value}`, {
                  initialValue: record.enabledFlag,
                })(<Checkbox />)}
              </Form.Item>
            </Form>
          );
        },
      },
    ];

    return (
      <Modal
        title={
          <div>
            {intl.get(`spfm.configServer.view.message.functionMaintain`).d('功能维护')}
            <span style={{ color: '#bbb', marginLeft: '20px', fontSize: '12px' }}>
              {intl
                .get(`spfm.configServer.view.message.functionIntroduce`)
                .d('选择需启用“加入监控”的功能页面，可在对应功能下将未监控供应商加入监控')}
            </span>
          </div>
        }
        width={620}
        footer={null}
        visible={supplierAddMonitorVisible}
        onCancel={this.handleModalVisible}
        wrapClassName={styles['risk-scan']}
      >
        <Row type="flex" justify="end">
          <Col>
            <Button
              type="primary"
              loading={saveLoading}
              onClick={this.handleSaveSupplierAddMonitor}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Col>
        </Row>
        <Table
          bordered
          rowKey="supplierAddMonitorId"
          loading={queryLoading || saveLoading}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
        />
      </Modal>
    );
  }
}
