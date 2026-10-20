/**
 * EcPlatformDef -前置机定义modal 编辑页
 * @date: 2018-9-13
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, Input, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
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
 * @reactProps {Function} onHandleSaveFrontCompter - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FrontComputerModal extends Component {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveEcDef, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      const { tenantId } = values;
      if (isEmpty(err)) {
        onHandleSaveEcDef({
          ...tableRecord,
          ...values,
          tenantId: tenantId === tableRecord.tenantName ? tableRecord.tenantId : tenantId,
        });
      }
    });
  }

  render() {
    const { loading, visible, anchor, tableRecord = {}, onCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.ecAddressManage.E-commerce.platform.maintain').d('维护电商平台')}
        width={540}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem
            label={intl.get('scec.ecAddressManage.model.Ec.platform.coding').d('电商平台编码')}
            {...formLayout}
          >
            {getFieldDecorator('ecPlatformCode', {
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
                      .get('scec.ecAddressManage.model.Ec.platform.coding')
                      .d('电商平台编码'),
                  }),
                },
              ],
              initialValue: tableRecord.ecPlatformCode,
            })(
              <Input
                disabled={tableRecord.ecPlatformCode}
                typeCase="upper"
                trim
                inputChinese={false}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('scec.ecAddressManage.E-commerce.platform.name').d('电商平台名称')}
            {...formLayout}
          >
            {getFieldDecorator('ecPlatformName', {
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
                      .get('scec.ecAddressManage.E-commerce.platform.name')
                      .d('电商平台名称'),
                  }),
                },
              ],
              initialValue: tableRecord.ecPlatformName,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get('scec.ecplatformDef.model.ecplatformDef.tenant').d('租户')}
            {...formLayout}
          >
            {getFieldDecorator('tenantId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.ecplatformDef.model.ecplatformDef.tenant').d('租户'),
                  }),
                },
              ],
              initialValue: tableRecord.tenantName,
            })(<Lov code="HPFM.TENANT" textValue={tableRecord.tenantName} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('small.ecplatformDef.model.ecplatformDef.purchaseQuantity')
              .d('单次采购最大购买量')}
            {...formLayout}
          >
            {getFieldDecorator('purchaseQuantity', {
              rules: [],
              initialValue: tableRecord.purchaseQuantity,
            })(<InputNumber max={99999} min={1} style={{ width: '100%' }} />)}
          </FormItem>
          <FormItem
            label={intl.get('scec.ecplatformDef.model.ecplatformDef.remarke').d('备注')}
            {...formLayout}
          >
            {getFieldDecorator('remark', {
              initialValue: tableRecord.remark,
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
