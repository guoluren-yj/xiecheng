/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-03 15:24:41
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-24 15:55:10
 */
/**
 * CurrencyForm - 租户级币种定义Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, InputNumber, Row, Col, Icon, Modal } from 'hzero-ui';
import { TextField, Form as ChProForm } from 'choerodon-ui/pro';
import Switch from 'components/Switch';
import ModalForm from 'components/Modal/ModalForm';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import request from 'utils/request';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 付款方式定义模态框表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class CurrencyForm extends ModalForm {
  constructor(props) {
    super(props);
    this.state = {
      intlVisible: false,
      intlData: [],
    };
  }

  @Bind()
  handleClickIntl(fieldName) {
    const { data = {} } = this.props;
    request('/hpfm/v1/multi-language', {
      method: 'GET',
      query: { _token: data?._token ?? '', fieldName },
    }).then(res => {
      this.setState({
        intlData: res,
        intlVisible: true,
      });
    });
  }

  @Bind()
  handleClose() {
    this.setState({
      intlVisible: false,
    });
  }

  renderForm() {
    const { form, data = {}, customizeForm } = this.props;

    return (
      <React.Fragment>
        {customizeForm(
          {
            code: 'SMDM_CURRENCY.EDIT_FORM',
            form,
            dataSource: data,
          },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.currencyOrg.model.currency.currencyCode`).d('引用币种代码')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('currencyCode', {
                    initialValue: data.currencyCode,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.currencyOrg.model.currency.currencyName`).d('引用币种名称')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('currencyName', {
                    initialValue: data.currencyName,
                  })(
                    // <TLEditor field="currencyName" token={data._token} readOnly disabled />
                    <Input
                      disabled
                      addonAfter={
                        <Icon
                          type="global"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            this.handleClickIntl('currencyName');
                          }}
                        />
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl
                    .get(`smdm.currencyOrg.model.currency.financialPrecision`)
                    .d('财务精度')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('financialPrecision', {
                    initialValue: data.financialPrecision,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.currencyOrg.model.currency.financialPrecision`)
                            .d('财务精度'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber precision={0} min={0} max={2147483647} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.currencyOrg.model.currency.defaultPrecision`).d('精度')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('defaultPrecision', {
                    initialValue: data.defaultPrecision,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`smdm.currencyOrg.model.currency.defaultPrecision`)
                            .d('精度'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber precision={0} min={0} max={2147483647} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`smdm.currencyOrg.model.currency.currencySymbol`).d('货币符号')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('currencySymbol', {
                    initialValue: data.currencySymbol,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                  {form.getFieldDecorator('enabledFlag', {
                    initialValue: data.enabledFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        <Modal
          visible={this.state.intlVisible}
          closable={false}
          onOk={this.handleClose}
          onCancel={this.handleClose}
        >
          <ChProForm columns={1}>
            {this.state.intlData.map(item => (
              <TextField value={item?.value ?? ''} label={item?.name ?? ''} disabled />
            ))}
          </ChProForm>
        </Modal>
      </React.Fragment>
    );
  }
}
