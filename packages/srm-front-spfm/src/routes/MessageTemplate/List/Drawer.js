import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 消息模板-数据修改滑窗(抽屉)
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
    const { form, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          onOk({ data: values, form });
        }
      });
    }
  }

  @Bind()
  cancelBtn() {
    const { form, onCancel } = this.props;
    form.resetFields();
    onCancel();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, visible, title, form, targetItem } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={title}
        width={450}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        onCancel={this.cancelBtn}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get(`spfm.messageTemplate.model.template.tenantId`).d('租户')}
            {...formLayout}
          >
            {getFieldDecorator('tenantId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.messageTemplate.model.template.tenantId`).d('租户'),
                  }),
                },
              ],
              initialValue: targetItem.tenantId,
            })(
              <Lov
                code="HPFM.TENANT"
                disabled={!isUndefined(targetItem.tenantId)}
                textValue={targetItem.tenantName}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`spfm.messageTemplate.model.template.code`).d('消息模板代码')}
            {...formLayout}
          >
            {getFieldDecorator('templateCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.messageTemplate.model.template.code`).d('消息模板代码'),
                  }),
                },
              ],
              initialValue: targetItem.templateCode,
            })(
              <Input
                trim
                typeCase="upper"
                inputChinese={false}
                disabled={!isUndefined(targetItem.tenantId)}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`spfm.messageTemplate.model.template.name`).d('消息模板名称')}
            {...formLayout}
          >
            {getFieldDecorator('templateName', {
              initialValue: targetItem.templateName,
            })(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get(`hzero.common.remark`).d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: targetItem.remark,
            })(<Input.TextArea rows={5} />)}
          </Form.Item>
          <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(targetItem.enabledFlag) ? 1 : targetItem.enabledFlag,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
