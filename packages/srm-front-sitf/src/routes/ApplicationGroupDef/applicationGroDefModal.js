/**
 * ApplicationGroDefModal -应用组定义编辑
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import intl from 'utils/intl';

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
 * @reactProps {Function} groupDateSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} modalVisible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ApplicationGroDefModal extends PureComponent {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onSaveDate, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      const { productLineCode, ...otherValues } = values;
      if (isEmpty(err)) {
        onSaveDate({
          ...tableRecord,
          productLineCode:
            productLineCode === tableRecord.productLineName
              ? tableRecord.productLineCode
              : productLineCode,
          ...otherValues,
        });
      }
    });
  }

  render() {
    const { modalVisible, onCancel, anchor, tableRecord = {}, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl
          .get(`sitf.applicationGroupDef.view.applicationGroupDef.modelTitle`)
          .d('应用组定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl
              .get(`sitf.applicationGroupDef.model.applicationGroupDef.applicationGroupCode`)
              .d('应用组代码')}
            {...formLayout}
          >
            {getFieldDecorator('applicationGroupCode', {
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
                      .get(
                        `sitf.applicationGroupDef.model.applicationGroupDef.applicationGroupCode`
                      )
                      .d('应用组代码'),
                  }),
                },
              ],
              initialValue: tableRecord.applicationGroupCode,
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                disabled={tableRecord.applicationGroupCode}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get(`sitf.common.applicationGroup.name`).d('应用组名称')}
            {...formLayout}
          >
            {getFieldDecorator('applicationGroupName', {
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
                    name: intl.get(`sitf.common.applicationGroup.name`).d('应用组名称'),
                  }),
                },
              ],
              initialValue: tableRecord.applicationGroupName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get(`sitf.common.product.name`).d('产品线名称')} {...formLayout}>
            {getFieldDecorator('productLineCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sitf.common.product.name`).d('产品线名称'),
                  }),
                },
              ],
              initialValue: tableRecord.productLineName,
            })(
              <Lov
                code="SIFC.PRODUCT_LINE"
                textValue={tableRecord.productLineName}
                disabled={tableRecord.productLineCode}
              />
            )}
          </FormItem>
          <FormItem label={intl.get(`hzero.common.status.enable`).d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
          <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
