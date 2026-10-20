import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { isEmpty } from 'lodash';

const modelPrompt = 'sodr.writeOff.model.common';

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sodr/receiveWriteOff' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      collapse: false,
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 折叠或展开查询表单
   */
  @Bind()
  handleToggle() {
    this.setState((state) => ({
      collapse: !state.collapse,
    }));
  }

  // @Bind()
  // handleChangeCompany(value, record) {
  //   const { form } = this.props;
  //   const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
  //   const { supplierId } = record;
  //   if (!value || getFieldValue('displaySupplierName') !== value) {
  //     resetFields(['supplierSiteCode', 'supplierSiteName']);
  //   }
  //   registerField('supplierId');
  //   setFieldsValue({ supplierId });
  // }
  @Bind()
  handleChangeCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['invOrganizationId', 'inventoryId']);
  }

  @Bind()
  handleChangeOrganization() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['inventoryId']);
  }

  /**
   * 改变供应商Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record;
    if (!rowKey || getFieldValue(['supplierCompanyId']) !== rowKey) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  render() {
    const { form, tenantId, asnTypeCode, flagCode, customizeFilterForm } = this.props;
    const { collapse } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const params = getFieldValue('companyId') ? { companyId: getFieldValue('companyId') } : {};
    const paramsInventory = getFieldValue('invOrganizationId')
      ? { organizationId: getFieldValue('invOrganizationId') }
      : {};
    const receiveOrderType = getFieldValue('receiveOrderType');
    return customizeFilterForm(
      {
        form,
        expand: collapse,
        code: 'SODR.WRITE_OFF.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.writeReceiveOrderType`).d('冲销来源')}
                  {...formLayout}
                >
                  {getFieldDecorator('receiveOrderType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sinv.common.model.common.receiveOrderType`).d('冲销来源'),
                        }),
                      },
                    ],
                    initialValue: isEmpty(flagCode) ? undefined : 'ASN',
                  })(
                    <Select onChange={this.handleFormReset}>
                      {flagCode.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              {receiveOrderType === 'ASN' ? (
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.asnNum`).d('送货单号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('asnNum')(
                      <Input trim inputChinese={false} typeCase="upper" />
                    )}
                  </Form.Item>
                </Col>
              ) : (
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('displayPoNum')(
                      <Input trim inputChinese={false} typeCase="upper" />
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item label={intl.get(`entity.supplier.tag`).d('供应商')} {...formLayout}>
                  {getFieldDecorator('tempkeys')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      textValue={getFieldValue('supplierNum')}
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: collapse ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              {receiveOrderType !== 'ORDER' && (
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sinv.purchaseReception.view.message.asnTypeCode`)
                      .d('送货单类型')}
                    {...formLayout}
                  >
                    {getFieldDecorator('asnTypeCode')(
                      <Select>
                        {asnTypeCode.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}
                  {...formLayout}
                >
                  {getFieldDecorator('agentId')(
                    <Lov
                      textField="agentName"
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      queryParams={{ tenantId }}
                      textValue={getFieldValue('purchaseAgentName')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formLayout}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      textField="companyName"
                      textValue={getFieldValue('companyId')}
                      onChange={this.handleChangeCompany}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'companyId', displayField: 'companyName' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`${modelPrompt}.acceptor`).d('验收人')} {...formLayout}>
                  {getFieldDecorator('receivedBy')(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sodr.docMergeRulesModal.model.common.mergeItemFlag`).d('物料')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemId')(
                    <Lov
                      code="SODR.PO_ITEM"
                      textField="itemName"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'itemId', displayField: 'itemName' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.organization.class.receiving`).d('收货组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SODR.COMPANY_INVORGNIZATION"
                      onChange={this.handleChangeOrganization}
                      queryParams={{ ...params }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.inventoryName`).d('收货库房')}
                  {...formLayout}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      queryParams={{ tenantId, ...params, ...paramsInventory }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${modelPrompt}.acceptorOperate`).d('验收操作人')}
                  {...formLayout}
                >
                  {getFieldDecorator('createdBy')(
                    <Lov code="SPFM.ACCEPT.USER" queryParams={{ organizationId: tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              {!collapse ? (
                <Button onClick={this.handleToggle}>
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
              ) : (
                <Button onClick={this.handleToggle}>
                  {intl.get(`hzero.common.button.collected`).d('收起查询')}
                </Button>
              )}
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
