/*
 * ListForm - 采购订单类型维护表单
 * @date: 2018/10/13 11:15:59
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Row, Col, Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty, isFunction } from 'lodash';

import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tenantId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
export default class ListForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
  }

  @Bind()
  validator(rule, value, callback) {
    const { orderTypeList = [], editValue } = this.props;
    if (!editValue.orderTypeId && orderTypeList.find((item) => item.orderTypeCode === value)) {
      callback(intl.get(`sodr.orderType.view.message.codeRepeat`).d('编码重复'));
    }
    callback();
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd(values);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue, setFieldsValue },
      editValue,
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
      customizeForm,
    } = this.props;
    const currentRecord = getFieldsValue();
    return (
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
            code: 'SODR.ORDER_TYPE.LIST.ORDER_EDIT', // 必传，和unitCode一一对应
            form: this.props.form, // 无论个性化单元是否只读，均必传
            dataSource: editValue, // 必传，从后端接口获取到的数据/
          },
          <Form className="whole-form">
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`entity.order.type.code`).d('订单类型编码')}
                >
                  {getFieldDecorator('orderTypeCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.order.type.code`).d('订单类型编码'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                      { validator: this.validator },
                    ],
                    initialValue: editValue.orderTypeCode,
                  })(<Input disabled={!!editValue.orderTypeId} inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`entity.order.type.name`).d('订单类型名称')}
                >
                  {getFieldDecorator('orderTypeName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.order.type.name`).d('订单类型名称'),
                        }),
                      },
                      {
                        max: 120,
                        message: intl.get('hzero.common.validation.max', {
                          max: 120,
                        }),
                      },
                    ],
                    initialValue: editValue.orderTypeName,
                  })(
                    <TLEditor
                      label={intl.get(`entity.order.type.name`).d('订单类型名称')}
                      field="orderTypeName"
                      token={editValue._token}
                      disabled={!!editValue.orderTypeId && editValue.sourceCode !== 'SRM'}
                    />
                  )}
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
                  label={intl
                    .get(`sodr.orderType.model.orderType.linkOrderTypeCode`)
                    .d('关联平台级类型')}
                >
                  {getFieldDecorator('refOrderTypeCode', {
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl.get(`sodr.orderType.model.orderType.linkOrderTypeCode`).d('关联订单类型代码'),
                    //     }),
                    //   },
                    // ],
                    initialValue: editValue.refOrderTypeCode,
                  })(<Lov textValue={editValue.linkOrderTypeName} code="SPFM.ORDER.ORDER_TYPE" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sodr.orderType.model.orderType.linkAgreeType`).d('关联协议类型')}
                >
                  {getFieldDecorator('pcTypeId', {
                    initialValue: editValue.pcTypeId,
                  })(
                    <Lov
                      textValue={editValue.pcTypeName}
                      queryParams={{ tenantId }}
                      code="SODR.ORDER_PC_TYPE"
                      onChange={(value) => {
                        if (!value) {
                          setFieldsValue({
                            pcTemplateId: undefined,
                            pcTemplateName: undefined,
                          });
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sodr.orderType.model.orderType.linkAgreeTemplate`)
                    .d('关联协议模板')}
                >
                  {getFieldDecorator('pcTemplateId', {
                    rules: [
                      {
                        required: currentRecord.pcTypeId,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sodr.orderType.model.orderType.linkAgreeType`)
                            .d('关联协议类型'),
                        }),
                      },
                    ],
                    initialValue: editValue.pcTemplateId,
                  })(
                    <Lov
                      disabled={!currentRecord.pcTypeId}
                      textValue={editValue.pcTemplateName}
                      code="SODR.ORDER_PC_TEMPLATE"
                      queryParams={{
                        tenantId,
                        pcTypeId: currentRecord.pcTypeId,
                      }}
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
                        message: intl.get(`hzero.common.validation.requireNumber`).d('请输入数字'),
                      },
                    ],
                    initialValue: editValue.orderSeq,
                  })(<InputNumber min={0} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
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
                  label={intl.get(`sodr.orderType.model.orderType.returnOrderFlag`).d('退货订单')}
                >
                  {getFieldDecorator('returnOrderFlag', {
                    initialValue: editValue.returnOrderFlag === 1 ? 1 : 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sodr.orderType.model.orderType.outsourceOrderFlag`)
                    .d('委外订单')}
                >
                  {getFieldDecorator('outsourceOrderFlag', {
                    initialValue: editValue.outsourceOrderFlag === 1 ? 1 : 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={
                    <span>
                      {intl.get(`sodr.orderType.model.orderType.fixedAssetsFlag`).d('固定资产订单')}
                      <Tooltip
                        title={intl
                          .get('sodr.orderType.model.orderType.fixedAssetsFlagTooltip')
                          .d(
                            '开启该配置，则所有订单行默认为固定资产行，订单提交将校验固定资产行数量必须为1'
                          )}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('fixedAssetsFlag', {
                    initialValue: editValue.fixedAssetsFlag === 1 ? 1 : 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48} className="form-row">
              <Col span={48}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sodr.orderType.model.orderType.createDeliveryFlag`)
                    .d('可创建送货单')}
                >
                  {getFieldDecorator('createDeliveryFlag', {
                    initialValue: editValue.createDeliveryFlag === 0 ? 0 : 1,
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
                    initialValue: editValue.defaultFlag === 1 ? 1 : 0,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
