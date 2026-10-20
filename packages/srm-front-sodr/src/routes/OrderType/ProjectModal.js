/*
 * ListForm - 采购订单类型维护表单
 * @date: 2018/10/13 11:15:59
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber, Modal, Col, Row } from 'hzero-ui';
import { isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class DemandListForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {};
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd({
          ...values,
        });
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      editValue,
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
      customizeForm,
    } = this.props;

    return (
      <Fragment>
        <Modal
          destroyOnClose
          title={title}
          width={520}
          wrapClassName={`ant-modal-sidebar-${anchor}`}
          transitionName={`move-${anchor}`}
          visible={visible}
          onOk={this.saveBtn}
          onCancel={onCancel}
          confirmLoading={confirmLoading}
          okText={intl.get('hzero.common.button.sure').d('确定')}
          cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        >
          {customizeForm(
            {
              code: 'SODR.PROJECT_TYPE.EDIT_FROM', // 必传，和unitCode一一对应
              form: this.props.form, // 无论个性化单元是否只读，均必传
              dataSource: editValue, // 必传，从后端接口获取到的数据/
            },

            <Form className="whole-form">
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    {...formLayout}
                    label={intl.get(`entity.order.type.typeCode`).d('项目类型编码')}
                  >
                    {getFieldDecorator('typeCode', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`entity.order.type.typeCode`).d('项目类型编码'),
                          }),
                        },
                      ],
                      initialValue: editValue.typeCode,
                    })(<Input disabled={!!editValue.typeId} inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    {...formLayout}
                    label={intl.get(`entity.order.type.typeDescription`).d('项目类型')}
                  >
                    {getFieldDecorator('typeDescription', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`entity.order.type.typeDescription`).d('项目类型'),
                          }),
                        },
                        {
                          max: 120,
                          message: intl.get('hzero.common.validation.max', {
                            max: 120,
                          }),
                        },
                      ],
                      initialValue: editValue.typeDescription,
                    })(
                      <TLEditor
                        label={intl.get(`entity.order.type.typeDescription`).d('项目类型')}
                        field="typeDescription"
                        token={editValue._token}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    {...formLayout}
                    label={intl.get(`sodr.orderType.model.orderType.orderSeq`).d('排序号')}
                  >
                    {getFieldDecorator('orderSeq', {
                      rules: [
                        {
                          pattern: /\d/,
                          message: intl
                            .get(`hzero.common.validation.requireNumber`)
                            .d('请输入数字'),
                        },
                      ],
                      initialValue: editValue.orderSeq,
                    })(<InputNumber min={0} style={{ width: '100%' }} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    label={intl.get(`sodr.common.model.common.sourceCode`).d('来源系统')}
                    {...formLayout}
                  >
                    {getFieldDecorator('sourceCode', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
                          }),
                        },
                      ],
                      initialValue: editValue.sourceCode || 'SRM',
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    {...formLayout}
                    label={intl.get(`hzero.common.status.enable`).d('启用')}
                  >
                    {getFieldDecorator('enabledFlag', {
                      initialValue: editValue.enabledFlag === 0 ? 0 : 1,
                    })(<Switch />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={48} className="form-row">
                <Col span={48}>
                  <Form.Item
                    {...formLayout}
                    label={intl.get(`sodr.orderType.model.orderType.defaultFlag`).d('是否默认')}
                  >
                    {getFieldDecorator('defaultFlag', {
                      initialValue: editValue.defaultFlag === 1 ? 1 : 0, // disabled={defaultData.length === 0}
                    })(<Switch />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </Modal>
      </Fragment>
    );
  }
}
