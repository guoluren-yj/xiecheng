/**
 * MaintainIndex -非寄销开票申请维护查询界面 -form 表单查询
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Row, Col, Input, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { getUserOrganizationId, getCurrentUserId } from 'utils/utils';

import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import CacheComponent from 'components/CacheComponent';
import LovMulti from '@/routes/components/MultipleLov';

const { Option } = Select;

@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/bill-maintain/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  componentDidMount() {
    // 删除后，根据条件筛选一次
    this.fetchData();
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  @Bind()
  fetchData() {
    const { form, onFetchConsigBill } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchConsigBill({
          ...values,
        });
      }
    });
  }

  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, registerField, setFieldsValue },
      format,
      BillStatus,
      organizationId,
      code,
      customizeFilterForm,
    } = this.props;

    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    return (
      <div className="table-list-search">
        <Fragment>
          {customizeFilterForm(
            {
              code,
              form,
              expand: !expand,
            },
            <Form layout="inline" className="more-fields-form">
              <Row gutter={12}>
                <Col span={18}>
                  <Row>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                        {...formlayout}
                      >
                        {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                        {...formlayout}
                      >
                        {getFieldDecorator('creationDateFrom')(
                          <DatePicker
                            disabledDate={(currentDate) =>
                              getFieldValue('creationDateTo') &&
                              moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                            }
                            format={format}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`hzero.common.date.creation.to`).d('创建时间至')}
                        {...formlayout}
                      >
                        {getFieldDecorator('creationDateTo')(
                          <DatePicker
                            disabledDate={(currentDate) =>
                              getFieldValue('creationDateFrom') &&
                              moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                            }
                            format={format}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{ display: expand ? 'none' : 'block' }}>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sfin.payableInvoice.model.payableInvoice`).d('物料')}
                        {...formlayout}
                      >
                        {getFieldDecorator('itemName')(<Input />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.purAgentName`)
                          .d('采购员')}
                        {...formlayout}
                      >
                        {getFieldDecorator('purchaseAgentIds')(
                          <LovMulti
                            code="SPUC.PURCHASE_AGENT_NOUSER"
                            queryParams={{ tenantId: organizationId }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.purchaseOrgName`)
                          .d('采购组织')}
                        {...formlayout}
                      >
                        {getFieldDecorator('purOrganizationIds')(
                          <LovMulti
                            code="HPFM.PURCHASE_ORGANIZATION"
                            queryParams={{ tenantId: organizationId }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{ display: expand ? 'none' : 'block' }}>
                    <Col span={8}>
                      <Form.Item
                        label={intl
                          .get('sfin.invoiceBill.model.invoiceBill.supplierCompanyId')
                          .d('供应商')}
                        {...formlayout}
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
                                supplierCompanyId: isNil(supplierCompanyId)
                                  ? ''
                                  : supplierCompanyId,
                              });
                            }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sfin.invoiceBill.model.invoiceBill.ouName`).d('业务实体')}
                        {...formlayout}
                      >
                        {getFieldDecorator('ouId')(
                          <Lov
                            code="HPFM.OU"
                            textField="ouName"
                            queryParams={{
                              organizationId,
                            }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label={intl.get(`hzero.common.status`).d('状态')} {...formlayout}>
                        {getFieldDecorator('billStatus')(
                          <Select allowClear>
                            {BillStatus.filter(
                              (item) =>
                                item.value === 'INFORM_NEW' || item.value === 'INFORM_REJECTED'
                            ).map((n) => (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formlayout}
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.businessType`)
                          .d('业务类别')}
                      >
                        {getFieldDecorator('businessType')(
                          <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formlayout}
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.filter.specifications`)
                          .d('规格')}
                      >
                        {getFieldDecorator('specifications')(<Input />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formlayout}
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.filter.model`)
                          .d('型号')}
                      >
                        {getFieldDecorator('model')(<Input />)}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={6} className="search-btn-more">
                  <Form.Item>
                    <Button onClick={this.toggle}>
                      {expand
                        ? intl.get('hzero.common.button.viewMore').d('更多查询')
                        : intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                    <Button data-code="reset" onClick={this.handleReset}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      data-code="search"
                      type="primary"
                      htmlType="submit"
                      onClick={this.fetchData}
                    >
                      {intl.get('hzero.common.button.search').d('查询')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </Fragment>
      </div>
    );
  }
}
