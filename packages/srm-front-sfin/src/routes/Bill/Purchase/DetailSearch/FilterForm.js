/**
 * DetailSearch - FilterForm
 * @date: 2020-8-13
 * @author JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import LovMulti from '@/routes/components/MultipleLov';
import ValueList from 'components/ValueList';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

const { Option } = Select;

const organizationId = getCurrentOrganizationId();

const commonPrompt = 'hzero.common';
const promptCode = 'sfin.invoiceBill.model.invoiceBill';

@withCustomize({
  unitCode: ['SFIN.BILL_PURCHASE_LIST.DETAIL_FILTER'],
})
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this.props.form);
    }
    this.state = {
      display: false,
    };
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
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { onSearch, form, enumMap = {}, customizeFilterForm } = this.props;
    const { statusCodes = [], cancelFlags = [] } = enumMap;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const { display } = this.state;

    return customizeFilterForm(
      {
        code: 'SFIN.BILL_PURCHASE_LIST.DETAIL_FILTER',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.invoiceApplicationForm`).d('开票申请单')}
                >
                  {getFieldDecorator('displayBillNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: organizationId }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(
                    <Input inputChinese={false} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: display ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.item.tag`).d('物料')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov code="SMDM.CUSTOMER_ITEM" queryParams={{ organizationId }} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.displayTrxNum`).d('事务编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('displayTrxNum')(
                    <Input inputChinese={false} style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ organizationId }} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hzero.common.status').d('状态')}
                >
                  {getFieldDecorator('billStatus')(
                    <Select allowClear>
                      {statusCodes.length > 0 &&
                        statusCodes
                          .filter((item) => item.value.indexOf('INFORM_') === -1)
                          .map((code) => (
                            <Option key={code.value} value={code.value}>
                              {code.meaning}
                            </Option>
                          ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.purAgentName`).d('采购员')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`entity.business.tag`).d('业务实体')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.trxDateFrom`).d('事务日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('trxDateFrom', {
                    initialValue: moment().subtract(1, 'month'),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.trxDateFrom`).d('事务日期从'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateTo') &&
                        moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.trxDateTo`).d('事务日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('trxDateTo', {
                    initialValue: moment(),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.trxDateTo`).d('事务日期至'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('trxDateFrom') &&
                        moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.purchaseOrgName`).d('采购组织')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.wbsElement`).d('WBS元素')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('wbsCode')(
                    <Lov code="SMDM.PURCHASE_WBS" queryParams={{ tenantId: organizationId }} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.cancelledFlag`).d('是否取消')}
                >
                  {getFieldDecorator('cancelledFlag', {
                    initialValue: '0',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.cancelledFlag`).d('是否取消'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {cancelFlags.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.taxInvoiceNumber`).d('税务发票号')}
                >
                  {getFieldDecorator('taxInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.erpInvoiceNum`).d('ERP发票号')}
                >
                  {getFieldDecorator('erpInvoiceNums')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.filter.specifications`).d('规格')}
                >
                  {getFieldDecorator('specifications')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${promptCode}.model.invoiceBill.filter.model`).d('型号')}
                >
                  {getFieldDecorator('model')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.preciseSelectFlag')
                    .d('是否启用精准查询')}
                >
                  {getFieldDecorator('preciseSelectFlag')(
                    <ValueList lovCode="HPFM.FLAG" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => onSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
