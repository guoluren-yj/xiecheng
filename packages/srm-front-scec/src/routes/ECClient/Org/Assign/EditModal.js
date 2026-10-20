/**
 * ecClientAssign - 电商账号管理 - 分配数据维护表单
 * @date: 2019-2-25
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

/**
 * 数据维护表单
 * @extends {Component} - Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class EditModal extends Component {
  /**
   * 确认操作
   */
  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  /**
   * 选择Lov带出对应的名称
   * @param {Object} record
   */
  @Bind()
  onHandleSelect(_, record) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      companyNum: record.companyNum,
    });
  }

  render() {
    const {
      form,
      initData,
      title,
      loading,
      onCancel,
      editModalVisible,
      mapStatusList = [],
    } = this.props;
    const { getFieldDecorator } = form;
    const tenantId = getCurrentOrganizationId();
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={editModalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOk}
        {...otherProps}
      >
        <Form>
          <FormItem
            {...formLayout}
            label={intl.get('scec.assign.model.assign.companyNum').d('公司编码')}
          >
            {getFieldDecorator('companyNum', {
              initialValue: initData.companyNum,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.assign.model.assign.companyNum').d('公司编码'),
                  }),
                },
              ],
            })(<Input trim disabled />)}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('scec.assign.model.assign.companyName').d('公司名称')}
          >
            {getFieldDecorator('companyId', {
              initialValue: initData.companyId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.assign.model.assign.companyName').d('公司名称'),
                  }),
                },
              ],
            })(
              <Lov
                code="HPFM.COMPANY"
                textValue={initData.companyName}
                onChange={(rowKeys, record) => this.onHandleSelect(rowKeys, record)}
                queryParams={{ tenantId }}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('scec.assign.model.assign.currencyName').d('默认币种')}
          >
            {getFieldDecorator('currencyCode', {
              initialValue: initData.currencyCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.assign.model.assign.currencyName').d('默认币种'),
                  }),
                },
              ],
            })(
              <Lov
                code="SCEI.COMPANY_ASSIGN.CURRENCY"
                textValue={initData.currencyName}
                queryParams={{ tenantId }}
              />
            )}
          </FormItem>
          <FormItem
            {...formLayout}
            label={intl.get('scec.assign.model.assign.uomName').d('默认计量单位')}
          >
            {getFieldDecorator('uomId', {
              initialValue: initData.uomId,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('scec.assign.model.assign.uomName').d('默认计量单位'),
                  }),
                },
              ],
            })(
              <Lov
                code="SCEI.COMPANY_ASSIGN.UOM"
                textValue={initData.uomName}
                queryParams={{ tenantId }}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
