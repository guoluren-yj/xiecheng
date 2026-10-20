/**
 * Drawer - 新增采购类型定义侧滑表单
 * @date: 2018-9-15
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import intl from 'utils/intl';

/**
 * 新增
 * @extends {PureComponent} -React.PureComponent
 * @reactProps {Function} onHandleSelect //lov设置名称
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

  @Bind()
  saveBtn() {
    const { form, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          onOk({ ...values });
        }
      });
    }
  }

  /**
   * 采购订单类型编码重复性校验
   */
  checkContent(rule, value, callback) {
    const { dataList, data } = this.props;
    dataList.forEach(item => {
      if (item.orderTypeId !== data.orderTypeId && item.orderTypeCode === value) {
        callback(
          intl
            .get(`spfm.purchaseOrder.view.message.callback.codeRepeat`)
            .d('采购订单类型编码重复，请重新输入')
        );
      }
    });
    callback();
  }

  render() {
    const { form, data, title, anchor, visible, onCancel } = this.props;
    return (
      <Modal
        title={title}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`spfm.purchaseOrder.model.purchaseOrder.orderSeq`).d('排序号')}
          >
            {form.getFieldDecorator('orderSeq', {
              initialValue: data.orderSeq,
            })(<InputNumber style={{ width: 290 }} min={0} />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 15 }}
            label={intl
              .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeCode`)
              .d('采购订单类型编码')}
          >
            {form.getFieldDecorator(`orderTypeCode`, {
              initialValue: data.orderTypeCode,
              validateFirst: false,
              validate: [
                {
                  trigger: 'onChange',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeCode`)
                          .d('采购订单类型编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                    {
                      validator: (rule, value, callback) => {
                        this.checkContent.bind(this)(rule, value, callback);
                      },
                    },
                  ],
                },
              ],
            })(<Input typeCase="upper" inputChinese={false} disabled={data.orderTypeCode} />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 15 }}
            label={intl
              .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeName`)
              .d('采购订单类型名称')}
          >
            {form.getFieldDecorator('orderTypeName', {
              initialValue: data.orderTypeName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeName`)
                      .d('采购订单类型名称'),
                  }),
                },
                {
                  max: 120,
                  message: intl.get('hzero.common.validation.max', {
                    max: 120,
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl
                  .get(`spfm.purchaseOrder.model.purchaseOrder.orderTypeName`)
                  .d('采购订单类型名称')}
                field="orderTypeName"
                token={data._token}
              />
            )}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get('hzero.common.status.enable').d('启用')}
          >
            {form.getFieldDecorator('enabledFlag', {
              initialValue: data.enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
