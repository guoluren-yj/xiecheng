/**
 * InterfaceCateDefModal -接口类别定义 -model 编辑页
 * @date: 2018-9-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';

const FormItem = Form.Item;

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
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InterfaceCateDefModal extends PureComponent {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onSaveDate, tableRecord } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onSaveDate({
          ...tableRecord,
          ...values,
        });
      }
    });
  }

  render() {
    const { modalVisible, onCancel, updateLoading, tableRecord = {} } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get(`sitf.interfaceCateDef.view.interfaceCateDef.modelTitle`).d('接口类别维护')}
        width={520}
        visible={modalVisible}
        onOk={this.onOk}
        onCancel={onCancel}
        confirmLoading={updateLoading}
        // 暂时注释
        // footer={[
        //   <Button key="back" onClick={onCancel}>
        //     {intl.get('hzero.common.button.back').d('返回')}
        //   </Button>,
        //   <Button key="submit" type="primary" loading={updateLoading} onClick={this.onOk}>
        //     {intl.get('hzero.common.button.save').d('保存')}
        //   </Button>,
        // ]}
      >
        <Form>
          <FormItem
            label={intl
              .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryCode`)
              .d('接口类别代码')}
            {...formLayout}
          >
            {getFieldDecorator('interfaceCategoryCode', {
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
                    name: intl
                      .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryCode`)
                      .d('接口类别代码'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCategoryCode,
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                disabled={tableRecord.interfaceCategoryCode}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryDesc`)
              .d('接口类别描述')}
            {...formLayout}
          >
            {getFieldDecorator('interfaceCategoryName', {
              rules: [
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 100,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryDesc`)
                      .d('接口类别描述'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCategoryName,
            })(<TLEditor token={tableRecord._token} field="interfaceCategoryName" abel={intl.get('sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryDesc').d('接口类别描述')} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
