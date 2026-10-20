/*
 * Search - 订单按明细查找表单
 * @date: 2018-11-26 16:04:49
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
// import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 订单查找表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelPrompt = 'sodr.sendOrder.model.common';
const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-maintain/quotePurchaseOrder' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form, handleReset } = this.props;
    form.resetFields();
    if (handleReset) {
      handleReset();
    }
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId, supplierTenantId } = record || {};
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName', 'supplierSiteId']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    registerField('supplierTenantId');
    setFieldsValue({ supplierId, supplierCompanyId, supplierTenantId });
  }

  /**
   * 公司Lov改变清空供应商和地点
   * @param {*} value
   */
  @Bind()
  handleChangeCompanyLov(value) {
    const {
      form: { getFieldValue, resetFields },
    } = this.props;
    if (!value || getFieldValue('companyId') !== value) {
      resetFields([
        'displaySupplierName',
        'supplierId',
        'supplierCompanyId',
        'supplierTenantId',
        'supplierSiteCode',
        'supplierSiteName',
        'tempKey',
        'supplierSiteId',
      ]);
    }
  }

  render() {
    const { form, code = {}, customizeFilterForm } = this.props;
    const { expandForm, tenantId, organizationId } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const { erpStatus = [], flag = [], orderSource = [] } = code;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PO.FILTER',
      },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.lineNum`).d('行号')}>
                  {getFieldDecorator('displayLineNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.shipmentNum`).d('发运号')}
                >
                  {getFieldDecorator('displayLineLocationNum')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
                >
                  {getFieldDecorator('releasedDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateEnd') &&
                        moment(getFieldValue('releasedDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.to`).d('发布日期至')}
                >
                  {getFieldDecorator('releasedDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateStart') &&
                        moment(getFieldValue('releasedDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SODR.ORDER_TYPE"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orderTypeCode"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ organizationId }}
                      textField="companyName"
                      onChange={this.handleChangeCompanyLov}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.business.tag`).d('业务实体')}>
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                      textField="orgName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURORG"
                      queryParams={{ organizationId }}
                      textField="purOrganizationName"
                      lovOptions={{ displayField: 'organizationName' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}
                >
                  {getFieldDecorator('agentId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      queryParams={{ organizationId }}
                      textField="agentName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.erpStatus`).d('ERP状态')}
                >
                  {getFieldDecorator('erpStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {erpStatus.map((n) =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : undefined
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('tempKey')(
                    <Lov
                      code="SPCM.AUTH_SUPPLIER_LIFE_CYCLE"
                      // lovOptions={{ displayField: 'displaySupplierName' }}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.supplierSite`).d('供应商地点')}
                >
                  {getFieldDecorator('supplierSiteId')(
                    <Lov
                      disabled={!getFieldValue('supplierId')}
                      code="SODR.SUPPLIER_SITE"
                      queryParams={{
                        supplierId: getFieldValue('supplierId'),
                        organizationId: tenantId,
                      }}
                      textField="supplierSiteName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.item.code`).d('物料编码')}>
                  {getFieldDecorator('itemCode')(
                    <Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('erpCreationDateStart', {
                    initialValue: moment().subtract(6, 'M'),
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateEnd') &&
                        moment(getFieldValue('erpCreationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('erpCreationDateEnd', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('erpCreationDateStart') &&
                        moment(getFieldValue('erpCreationDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentOrNot`).d('是否加急')}
                >
                  {getFieldDecorator('urgentFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentDateStart`).d('加急时间从')}
                >
                  {getFieldDecorator('urgentDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('urgentDateEnd') &&
                        moment(getFieldValue('urgentDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.urgentDateEnd`).d('加急时间至')}
                >
                  {getFieldDecorator('urgentDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('urgentDateStart') &&
                        moment(getFieldValue('urgentDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.freeFlag`).d('是否免费')}
                >
                  {getFieldDecorator('freeFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag
                        .filter((item) => item.value !== 'NEW')
                        .map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.needDateStart`).d('需求日期从')}
                >
                  {getFieldDecorator('needByDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateEnd') &&
                        moment(getFieldValue('needByDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.needDateEnd`).d('需求日期至')}
                >
                  {getFieldDecorator('needByDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('needByDateStart') &&
                        moment(getFieldValue('needByDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.promisedDateFrom`).d('承诺日期从')}
                >
                  {getFieldDecorator('promiseDeliveryDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateEnd') &&
                        moment(getFieldValue('promiseDeliveryDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.promisedDateTo`).d('承诺日期至')}
                >
                  {getFieldDecorator('promiseDeliveryDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('promiseDeliveryDateStart') &&
                        moment(getFieldValue('promiseDeliveryDateStart')).isAfter(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('poSourcePlatform')(
                    <Select allowClear>
                      {orderSource.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.statusCode`).d('订单状态')}
                >
                  {getFieldDecorator('statusCodes')(
                    <ValueList
                      lovCode="SPCM.PO_STATUS"
                      lazyLoad={false}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  )}
                </FormItem>
              </Col> */}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
