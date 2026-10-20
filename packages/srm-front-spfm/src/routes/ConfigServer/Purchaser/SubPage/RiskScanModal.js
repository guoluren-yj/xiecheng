/*
 * RiskScanModal - 未加入监控企业的风险扫描弹出框
 * @date: 2019/07/04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Modal, Button, Table, Form } from 'hzero-ui';
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
  riskScan: configServer.enumMap.riskScan,
  riskScanList: configServer.riskScanList,
  queryLoading: loading.effects['configServer/fetchRiskScan'],
  saveLoading: loading.effects['configServer/saveRiskScan'],
}))
export default class RiskScanModal extends Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.handleRiskScan();
  }

  /**
   * 查询风险扫描
   */
  @Bind()
  handleRiskScan() {
    const { dispatch, riskScan } = this.props;
    dispatch({
      type: 'configServer/fetchRiskScan',
      payload: {},
    }).then(res => {
      if (isEmpty(res)) {
        const newList = riskScan.map(item => {
          const { ...newItem } = item;
          return { ...newItem, enabledFlag: 0, tenantId, scanCode: item.value };
        });
        this.setState({
          dataSource: newList,
        });
      } else {
        const newList = res.map(item => {
          const { ...newItem } = item;
          return { ...newItem, meaning: item.scanCodeMeaning, value: item.scanCode };
        });
        this.setState({
          dataSource: newList,
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveRiskScan() {
    const { dataSource } = this.state;
    const { dispatch, form } = this.props;
    const value = form.getFieldsValue();
    const dataList = cloneDeep(dataSource);
    dataList.forEach(e => {
      e.enabledFlag = value[`enabledFlag#${e.value}`] === 1 ? 1 : 0;
    });
    dispatch({
      type: 'configServer/saveRiskScan',
      payload: {
        adds: dataList,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleRiskScan();
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
      handleModal('riskScanVisible', false);
    }
  }

  render() {
    const { dataSource } = this.state;
    const { riskScanVisible, saveLoading, queryLoading, form } = this.props;
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
            {intl.get(`spfm.configServer.view.message.riskScanDefine`).d('风险扫描功能定义')}
            <span style={{ color: '#bbb', marginLeft: '20px', fontSize: '12px' }}>
              {intl
                .get(`spfm.configServer.view.message.riskScanIntroduce`)
                .d('选择需启用的功能页面，可在对应功能下对未加入监控的企业进行风险扫描')}
            </span>
          </div>
        }
        width={620}
        footer={null}
        visible={riskScanVisible}
        onCancel={this.handleModalVisible}
        wrapClassName={styles['risk-scan']}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="primary" loading={saveLoading} onClick={this.handleSaveRiskScan}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <Table
          bordered
          rowKey="orderSeq"
          loading={queryLoading || saveLoading}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
        />
      </Modal>
    );
  }
}
