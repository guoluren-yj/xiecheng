/**
 * InterfaceTableDefModal -接口表结构定义-modal 编辑
 * @date: 2018-9-20
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const { Option } = Select;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSaveDate - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} modalVisible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InterfaceTableDefModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newInterfaceId: '',
    };
  }

  /**
   * 确认后保存数据
   */
  @Bind()
  onOk() {
    const { form, onHandleSaveDate, tableRecord } = this.props;
    const { newInterfaceId } = this.state;
    form.validateFields((err, values) => {
      const { interfaceId, ...other } = tableRecord;
      if (isEmpty(err)) {
        onHandleSaveDate({
          ...other,
          ...values,
          interfaceId: newInterfaceId === '' ? interfaceId : newInterfaceId,
        });
      }
    });
  }

  @Bind()
  onChangeInterFace(text, record) {
    this.setState({
      newInterfaceId: record.interfaceId,
    });
  }

  render() {
    const { modalVisible, onCancel, anchor, tableRecord = {}, updateLoading, code } = this.props;
    const { getFieldDecorator } = this.props.form;
    const numberValidator = (_, value, callback) => {
      if (value && value.toString().length > 9) {
        callback(
          intl.get(`sitf.interTableDef.view.interTableDef.min`).d('排序号大于0且在10位数内')
        );
      } else {
        callback();
      }
    };
    return (
      <Modal
        destroyOnClose
        title={intl.get(`sitf.interTableDef.view.interTableDef.modelTitle`).d('接口表结构定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={updateLoading}
      >
        <Form>
          <FormItem
            label={intl.get(`sitf.interTableDef.model.interTableDef.tableName`).d('表名称')}
            {...formLayout}
          >
            {getFieldDecorator('tableName', {
              rules: [
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 30,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sitf.interTableDef.model.interTableDef.tableName`).d('表名称'),
                  }),
                },
              ],
              initialValue: tableRecord.tableName,
            })(tableRecord.tableName === undefined ? <Input /> : <Input disabled />)}
          </FormItem>
          <FormItem label={intl.get(`entity.interface.tag`).d('接口')} {...formLayout}>
            {getFieldDecorator('interfaceCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`entity.interface.tag`).d('接口'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceName,
            })(
              <Lov
                textValue={tableRecord.interfaceName}
                code="SITF.INTERFACE"
                onChange={(text, record) => this.onChangeInterFace(text, record)}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get(`sitf.interTableDef.model.interTableDef.erpSystemType`)
              .d('外部系统类别')}
            {...formLayout}
          >
            {getFieldDecorator('erpSystemType', {
              initialValue: tableRecord.erpSystemType,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sitf.interTableDef.model.interTableDef.erpSystemType`)
                      .d('外部系统类别'),
                  }),
                },
              ],
            })(
              <Select allowClear>
                {(code || []).map(
                  n =>
                    (n || {}).value ? (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ) : (
                      undefined
                    )
                )}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get(`sitf.interTableDef.model.interTableDef.orderSeq`).d('排序号')}
            {...formLayout}
          >
            {getFieldDecorator('orderSeq', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sitf.interTableDef.model.interTableDef.orderSeq`).d('排序号'),
                  }),
                },
                {
                  validator: numberValidator,
                },
              ],
              initialValue: tableRecord.orderSeq,
            })(<InputNumber min={0} style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem
            label={intl.get(`sitf.interTableDef.model.interTableDef.tableDescription`).d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('tableDescription', {
              initialValue: tableRecord.tableDescription,
              rules: [
                {
                  max: 500,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 500,
                    }),
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
