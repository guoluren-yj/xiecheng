import React, { PureComponent } from 'react';
import { Modal, Form, Row, Col, Select, Input, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';
import { filterNullValueObject } from 'utils/utils';

import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */

/**
 * 组织维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 组织实体
 * @reactProps {Array} unitType - 公司类型值集
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, itemData = {}, tenantId } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          let data = {
            ...values,
            tenantId,
            indent: (itemData.indent || 0) + 1,
            parentUnitId: itemData.unitId,
            parentUnitName: itemData.unitName,
            enabledFlag: 1, // 新增节点默认启用
          };
          data = [filterNullValueObject(data)];
          // 校验通过，进行保存操作
          onOk(data);
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      title,
      form,
      loading,
      itemData,
      unitType,
      onCancel,
      customizeForm,
    } = this.props;
    const formLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible
        confirmLoading={loading}
        onOk={this.saveBtn}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {customizeForm(
          {
            code: 'SPFM.ORGANIZATION.EDIT_FORM',
            form,
            dataSource: itemData,
          },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('entity.organization.code').d('组织编码')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('unitCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.organization.code').d('组织编码'),
                        }),
                      },
                      {
                        pattern: '^[a-zA-Z0-9][\\x00-\\x7B\\x7D-\\xFF]*$',
                        message: intl
                          .get('hzero.common.validation.codeAndSymbols')
                          .d('必须以字母、数字开头，可包含除"|"外的英文符号'),
                      },
                      {
                        max: 130,
                        message: intl.get('hzero.common.validation.max', { max: 130 }),
                      },
                    ],
                  })(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('entity.organization.name').d('组织名称')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('unitName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.organization.name').d('组织名称'),
                        }),
                      },
                      {
                        max: 40,
                        message: intl.get('hzero.common.validation.max', { max: 40 }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get('entity.organization.name').d('组织名称')}
                      field="unitName"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('entity.organization.type').d('组织类型')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('unitTypeCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.organization.type').d('组织类型'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }}>
                      {unitType.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {itemData.unitId && (
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={intl.get('hpfm.organization.model.unit.parentUnit').d('上级组织')}
                    {...formLayout}
                  >
                    {form.getFieldDecorator('parentUnitName', {
                      initialValue: itemData.unitName,
                    })(<Input disabled />)}
                  </Form.Item>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hpfm.common.model.common.orderSeq').d('排序号')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('orderSeq', {
                    initialValue: 1,
                  })(<InputNumber min={1} precision={0} style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get('hpfm.organization.model.unit.supervisorFlag').d('主管组织')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('supervisorFlag', {
                    initialValue: 0,
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
