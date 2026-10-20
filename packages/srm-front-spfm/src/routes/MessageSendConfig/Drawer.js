import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';

/**
 * 消息发送配置-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: e => e,
    onCancel: e => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, targetItem, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          onOk({ ...targetItem, ...values });
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, visible, title, form, loading, targetItem, onCancel } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, resetFields } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={loading}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.save').d('保存')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          <Form.Item label={intl.get(`entity.tenant.tag`).d('租户')} {...formLayout}>
            {getFieldDecorator('tenantId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.tenant.tag`).d('租户'),
                  }),
                },
              ],
              initialValue: targetItem.tenantId,
            })(
              <Lov
                code="HPFM.TENANT"
                disabled={!isUndefined(targetItem.relationId)}
                textValue={targetItem.tenantName}
                onChange={() => {
                  resetFields(['messageCode', 'receiverTypeCode']);
                }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`spfm.messageSendConfig.model.receiver.messageName`).d('消息名称')}
            {...formLayout}
          >
            {getFieldDecorator('messageCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.messageSendConfig.model.receiver.messageName`)
                      .d('消息名称'),
                  }),
                },
              ],
              initialValue: targetItem.messageCode,
            })(
              <Lov
                code="SPFM.MESSAGE_CODE"
                disabled={
                  !isUndefined(targetItem.relationId) || isUndefined(getFieldValue('tenantId'))
                }
                textValue={targetItem.messageName}
                queryParams={{ tenantId: getFieldValue('tenantId') }}
                onChange={(val, item) => {
                  setFieldsValue({ messageName: item.messageName });
                }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`spfm.messageSendConfig.model.receiver.receiverType`).d('接收者类型')}
            {...formLayout}
          >
            {getFieldDecorator('receiverTypeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.messageSendConfig.model.receiver.receiverType`)
                      .d('接收者类型'),
                  }),
                },
              ],
              initialValue: targetItem.receiverTypeCode,
            })(
              <Lov
                code="SPFM.RECEIVER_TYPE"
                textValue={targetItem.receiverTypeName}
                disabled={isUndefined(getFieldValue('tenantId'))}
                queryParams={{ tenantId: getFieldValue('tenantId') }}
                onChange={(val, item) => {
                  setFieldsValue({ receiverTypeName: item.typeName });
                }}
              />
            )}
          </Form.Item>
          <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(targetItem.enabledFlag) ? 1 : targetItem.enabledFlag,
            })(<Switch />)}
          </Form.Item>
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('messageName', { initialValue: targetItem.messageName })}
          </Form.Item>
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('receiverTypeName', { initialValue: targetItem.receiverTypeName })}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
