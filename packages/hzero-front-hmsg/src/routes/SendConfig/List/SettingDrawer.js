import React, { PureComponent } from 'react';
import { Form, InputNumber, Modal, Spin, Icon, Select, Tooltip } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { isNil } from 'lodash';
import notification from 'utils/notification';
import { isTenantRoleLevel, getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';

import intl from 'utils/intl';
import Switch from 'components/Switch';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class SettingDrawer extends PureComponent {
  state = {
    dataLoading: false,
    saving: false,
    data: {},
  };

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(_) {
    if (!_.visible && this.props.visible) {
      this.queryData();
    }
  }

  queryData() {
    this.setState({
      dataLoading: true,
    });
    const url = isTenantRoleLevel()
      ? `${HZERO_IAM}/v1/tenants/${getCurrentOrganizationId()}/msg-threshold`
      : `${HZERO_IAM}/v1/tenants/site/msg-threshold/${getCurrentOrganizationId()}`;
    request(url, {
      method: 'GET',
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          dataLoading: false,
          data: res,
        });
      }
    });
  }

  save = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ saving: true });
      let url = `${HZERO_IAM}/v1/tenants/${getCurrentOrganizationId()}/msg-threshold`;
      if (!isTenantRoleLevel()) {
        url = `${HZERO_IAM}/v1/tenants/site/msg-threshold`;
        values.tenantId = getCurrentOrganizationId();
      }
      request(url, {
        method: 'PUT',
        body: values,
      }).then(res => {
        if (getResponse(res)) {
          notification.success();
        }
      }).finally(() => {
        this.setState({ saving: false });
      });
    });
  };

  render() {
    const { visible, form, onCancel, tenantRoleLevel } = this.props;
    const { getFieldDecorator } = form;
    const {
      dataLoading,
      data: { messageThreshold, tenantExtend },
      saving,
    } = this.state;
    const { messageLangFrom, messageTimeZoneFrom, msgPurchaserMqFlag } = tenantExtend || {};
    return (
      <Modal
        destroyOnClose
        width={600}
        title={intl.get('hmsg.sendConfig.view.title.messageSendSetting').d('消息发送设置')}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
        okButtonProps={{ loading: saving || dataLoading }}
      >
        <Spin spinning={dataLoading}>
          <Form>
            <FormItem
              label={intl
                .get('hmsg.sendConfig.model.sendConfig.messageThreshold')
                .d('消息发送阈值设置')}
              {...formItemLayout}
            >
              {getFieldDecorator('messageThreshold', {
                initialValue: messageThreshold,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.sendConfig.model.sendConfig.messageThreshold')
                        .d('消息发送阈值设置'),
                    }),
                  },
                ],
              })(<InputNumber style={{ width: '100%' }} min={0} step={1} />)}
            </FormItem>
            <FormItem
              label={
                <>
                  <Text style={{ maxWidth: '120px' }}>
                    {intl
                    .get('hmsg.sendConfig.model.sendConfig.messageLangFrom')
                    .d('消息默认语言来源')}
                  </Text>
                  <Tooltip
                    title={intl
                      .get('hmsg.sendConfig.model.sendConfig.messageLangFrom.tooltip')
                      .d('消息正文显示的语言种类依据是当前配置，“消息发送方租户”则语言来源是消息发出对应租户的默认语言设置，“消息接收方子账户”则语言来源是消息接收的子账户个人偏好语言设置。')}
                  >
                    <Icon type="question-circle-o" style={{ marginLeft: '4px', verticalAlign: 'baseline' }} />
                  </Tooltip>
                </>
              }
              {...formItemLayout}
            >
              {getFieldDecorator('tenantExtend.messageLangFrom', {
                initialValue: messageLangFrom || 'SENDER',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.sendConfig.model.sendConfig.messageLangFrom')
                        .d('消息默认语言来源'),
                    }),
                  },
                ],
              })(
                <Select>
                  <Select.Option value='SENDER'>
                    {intl.get('hmsg.sendConfig.model.sendConfig.messageLangSender').d('消息发送方租户')}
                  </Select.Option>
                  <Select.Option value='RECEIVER'>
                    {intl.get('hmsg.sendConfig.model.sendConfig.messagLangReceiver').d('消息接收方子账户')}
                  </Select.Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              label={(
                <>
                  <Text style={{ maxWidth: '120px' }}>
                    {intl
                      .get('hmsg.sendConfig.model.sendConfig.messageTimeZoneFrom')
                      .d('消息默认时区来源')}
                  </Text>
                  <Tooltip
                    title={intl
                      .get('hmsg.sendConfig.model.sendConfig.messageTimeZoneFrom.tooltip')
                      .d('消息正文显示的“时间”相关字段的对应时区依据是当前配置，“消息发送方租户”则时区来源是消息发出对应租户的默认时区设置，“消息接收方子账户”则时区来源是消息接收的子账户个人偏好时区设置。')}
                  >
                    <Icon type='question-circle-o' style={{ marginLeft: '4px', verticalAlign: 'baseline' }} />
                  </Tooltip>
                </>
              )}
              {...formItemLayout}
            >
              {getFieldDecorator('tenantExtend.messageTimeZoneFrom', {
                initialValue: messageTimeZoneFrom || 'SENDER',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.sendConfig.model.sendConfig.messageTimeZoneFrom')
                        .d('消息默认时区来源'),
                    }),
                  },
                ],
              })(
                <Select>
                  <Select.Option value='SENDER'>
                    {intl.get('hmsg.sendConfig.model.sendConfig.messageTimeZoneSender').d('消息发送方租户')}
                  </Select.Option>
                  <Select.Option value='RECEIVER'>
                    {intl.get('hmsg.sendConfig.model.sendConfig.messagTimeZoneReceiver').d('消息接收方子账户')}
                  </Select.Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              label={(
                <>
                  <Text style={{ maxWidth: '120px' }}>
                    {intl
                      .get('hmsg.sendConfig.model.sendConfig.msgPurchaserMqFlag')
                      .d('供应商发送消息同步外部系统')}
                  </Text>
                  <Tooltip
                    title={intl
                      .get('hmsg.sendConfig.model.sendConfig.msgPurchaserMqFlag.tooltip')
                      .d('供应商发送消息同步外部系统')}
                  >
                    <Icon type='question-circle-o' style={{ marginLeft: '4px', verticalAlign: 'baseline' }} />
                  </Tooltip>
                </>
              )}
              {...formItemLayout}
            >
              {getFieldDecorator('tenantExtend.msgPurchaserMqFlag', {
                initialValue: isNil(msgPurchaserMqFlag) ? 0 : msgPurchaserMqFlag,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hmsg.sendConfig.model.sendConfig.msgPurchaserMqFlag')
                        .d('供应商发送消息同步外部系统'),
                    }),
                  },
                ],
              })(<Switch />)}
            </FormItem>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
