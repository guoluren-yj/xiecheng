/**
 * FreightTypeModal - 电商账号管理 - 支付方式
 * @date: 2019-8-28
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Spin, Form, Row, Col, Radio } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import styles from './CommonModal.less';

/**
 * 支付方式
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element
 */
export default class FreightTypeModal extends React.Component {
  state = {
    radioValue: null,
    radioName: null,
  };

  /**
   * 点击取消关闭模态框
   */
  @Bind()
  cancelHandle() {
    const { onCloseCommonModal } = this.props;
    this.setState({
      radioValue: null,
      radioName: null,
    });
    onCloseCommonModal();
  }

  @Bind()
  handleChange(e) {
    const { mapStatusList } = this.props;
    this.setState({
      radioValue: e.target.value,
      radioName: mapStatusList.filter((n) => n.value === e.target.value)[0].meaning,
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { radioName, radioValue } = this.state;
    const { onSave, commonData = [], record } = this.props;
    const { ecClientId, tenantId } = record;
    const { valueCode: value = null, valueName: name = null } =
      !isEmpty(commonData) && commonData[0];
    const params = [
      {
        ...commonData[0],
        ecClientId,
        tenantId,
        valueCode: radioValue || value,
        valueName: radioName || name,
        valueType: 'FREIGHT_TYPE',
        enabledFlag: 1,
      },
    ];
    onSave(params, 'freightType');
  }

  render() {
    const { radioValue } = this.state;
    const {
      commonModalVisible,
      commonData = [],
      modalTitle,
      mapStatusList = [],
      loading,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={`${modalTitle}`}
        visible={commonModalVisible}
        width={420}
        onOk={this.handleSave}
        onCancel={this.cancelHandle}
      >
        <Spin spinning={loading}>
          <Form>
            <Row>
              <Col span={24}>
                {intl
                  .get('small.ecClient.view.message.freightType')
                  .d('请选择与电商协议中所签订的运费类型')}
              </Col>
            </Row>
            <Row>
              {mapStatusList.map((item) => (
                <Col span={24}>
                  <Form.Item className={styles['radio-item']}>
                    <Radio.Group
                      name="freightType"
                      value={radioValue || (commonData[0] && commonData[0].valueCode)}
                      onChange={this.handleChange}
                    >
                      <Radio value={item.value}>{item.meaning}</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
