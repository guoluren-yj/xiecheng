/*
 * Search - 订单查询签署表单
 * @date: 2018/11/19 18:56:39
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { SEARCH_FORM_ITEM_LAYOUT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 订单签署表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/order-sign/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
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
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record;
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteId', 'supplierSiteName']);
    }
    registerField('supplierCompanyId');
    registerField('supplierId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const { form, enumMap = {}, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { expandForm, tenantId, organizationId } = this.state;
    const { orderSource = [], erpStatus = [], flag = [], signStatus = [] } = enumMap;
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SODR.ORDER_SIGN.LIST.HEADER_BY_REQUEST',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                >
                  {getFieldDecorator('tempKey')(
                    <Lov
                      code="SPRM.SUPPLIER"
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
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.order.type`).d('订单类型')}
                >
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SPUC_ORDER_TYPE"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orderTypeCode"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ organizationId }}
                      textField="companyName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.business.tag`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                      textField="ouName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURORG"
                      queryParams={{ organizationId }}
                      textField="purOrganizationName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.supplierSite`).d('供应商地点')}
                >
                  {getFieldDecorator('supplierSiteId')(
                    <Lov
                      disabled={!getFieldValue('supplierId')}
                      code="SODR.SUPPLIER_SITE"
                      queryParams={{
                        organizationId: tenantId,
                        supplierId: getFieldValue('supplierId'),
                      }}
                      textField="supplierSiteName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.agentId`).d('采购员')}
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
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('erpCreationDateStart')(
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
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('erpCreationDateEnd')(
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
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.erpStatus`).d('ERP状态')}
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
                <FormItem
                  label={intl.get(`sodr.common.model.common.source.platform`).d('来源平台')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
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
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标识')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('electricSignFlag')(
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
                  label={intl.get(`sodr.common.model.common.electricSignStatus`).d('电签状态')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('electricSignStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {signStatus.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
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

  render() {
    return this.renderForm();
  }
}
