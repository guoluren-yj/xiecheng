import React, { Component } from 'react';
import { Form, Button, Row, Col, Select, Input } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';

import intl from 'utils/intl';

/**
 * 库存列表表单
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      expandForm: false,
    };
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
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  // 改变Lov时 供应商传参
  @Bind()
  onChangeSupplierId(rowKey, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    const { supplierId } = record || {};
    registerField('supplierId');
    setFieldsValue({ supplierId });
  }

  render() {
    const { expandForm } = this.state;
    const { form, tenantId, specialInventory, customizeFilterForm } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SINV.INVENTORY_INQUIRY.FILTER_BY_SEARCH',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('spfm.configServer.model.supplier.businessUnitFlag')
                    .d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SODR.USER_AUTH.OU"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orgName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.business.origationName`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SODR.COMPANY_INVORGNIZATION"
                      queryParams={{ tenantId }}
                      textField="organizationName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码')}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      allowClear
                      code="SODR.PO_ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'itemName', valueField: 'itemId' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.inventoryName`).d('库房')}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      textField="inventoryName"
                      originTenantId={tenantId}
                      queryParams={{
                        tenantId,
                        enabledFlag: 1,
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.locationName`).d('库位')}
                >
                  {getFieldDecorator('invLocationId')(
                    <Lov
                      code="SODR.LOCATION"
                      queryParams={{ tenantId, enabledFlag: 1 }}
                      textField="locationName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.stockType`).d('特殊库存')}
                >
                  {getFieldDecorator('specialStockType')(
                    <Select style={{ width: '100%' }} allowClear>
                      {specialInventory.map((n) =>
                        (n || {}).value ? (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ) : undefined
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SODR.AUTH_SUPPLIER"
                      queryParams={{
                        tenantId,
                      }}
                      onChange={this.onChangeSupplierId}
                      lovOptions={{
                        displayField: 'displaySupplierName',
                        valueField: 'supplierCompanyId',
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.supplierAddress`).d('供应商地点')}
                >
                  {getFieldDecorator('supplierSiteName')(<Input />)}
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
              <Button data-code="reset" style={{ marginRight: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
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
