import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
const promptCode = 'sqam.incomingInspectionQuery';
const { Option } = Select;

export default class FilterForm extends PureComponent {
  state = {
    display: false,
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form);
  }

  /**
   * 收起打开
   */
  @Bind()
  toggleForm() {
    this.setState((prevState) => ({
      display: !prevState.display,
    }));
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { handleSearch, form, customizeFilterForm } = this.props;
    const { getFieldDecorator, registerField, setFieldsValue } = form || {};
    const { display } = this.state;
    return customizeFilterForm(
      { code: 'SQAM.INCOMING_UNINSPECTION.FILTER', form, expand: display },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemCode')(
                    <Lov
                      code="SQAM.ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'itemCode', displayField: 'itemName' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      textField="erpSupplierName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(_, lovRecord) => {
                        registerField('supplierId');
                        registerField('supplierCompanyIdStash');
                        setFieldsValue({
                          supplierId: lovRecord.supplierId,
                          supplierCompanyIdStash: lovRecord.supplierCompanyId,
                          erpSupplierName: lovRecord.erpSupplierName
                            ? lovRecord.erpSupplierName
                            : lovRecord.supplierCompanyName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.view.message.model.incomingInspectionQuery.asnNum`)
                    .d('送货单号')}
                  {...formLayout}
                >
                  {form.getFieldDecorator(
                    'asnNum',
                    {}
                  )(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(<Lov code="SPFM.USER_AUTH.INVORG" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.incomingInspectionQuery.poNum`)
                    .d('采购订单号')}
                >
                  {getFieldDecorator('displayPoNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.view.message.model.incomingInspectionQuery.displayTrxNum`)
                    .d('事务编码')}
                  {...formLayout}
                >
                  {form.getFieldDecorator(
                    'displayTrxNum',
                    {}
                  )(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.filter.displayReverseFlag`)
                    .d('显示冲销数据')}
                >
                  {getFieldDecorator('displayReverseFlag', {
                    initialValue: '0',
                  })(
                    <Select allowClear>
                      <Option key="1" value="1">
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key="0" value="0">
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => handleSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
