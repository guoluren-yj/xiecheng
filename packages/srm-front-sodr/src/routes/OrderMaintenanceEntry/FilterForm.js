/*
 * 订单维护入口 - index.js
 * @date: 2019-04-22
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, getUserOrganizationId, getDateTimeFormat } from 'utils/utils';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const prefix = 'sodr.orderMaintenanceEntry.model.common';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/purchase-order-maintain/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      docSourceList: props.docSource,
      requestVisible: false,
      moreFieldsVisible: false,
      supplierAddressVisible: false,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 更多条件查询滑窗显示
   * @param {boolean} [flag = false] - 显示标记
   */
  @Bind()
  handleMoreFields(flag = false) {
    this.setState({ moreFieldsVisible: flag });
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
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 申请单号发生改变回调
   */
  @Bind()
  onChangeRequestNum(e) {
    if (!e.target.value) {
      this.props.form.resetFields(['displayPrLineNum']);
    }
  }

  /**
   *  来源系统下拉回调
   */
  @Bind()
  handleSelectOnChange(value) {
    const { docSource = [], form = {} } = this.props;
    const { setFieldsValue } = form;
    setFieldsValue({ sourceBillTypeCode: null });
    if (value === 'SRM' || value === undefined) {
      this.setState({
        docSourceList: docSource,
      });
    } else {
      this.setState({
        docSourceList: docSource.filter((item) => item.value === 'PURCHASE_REQUEST'),
      });
    }
  }

  render() {
    const { form, sourcePlatform, docSource, customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      requestVisible,
      moreFieldsVisible,
      supplierAddressVisible,
      tenantId,
      organizationId,
      docSourceList,
    } = this.state;
    return customizeFilterForm(
      {
        form,
        expand: moreFieldsVisible,
        code: 'SODR.ORDER_CREATE_LINE_LIST.LIST.HEADER_BY_REQUEST',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item label={intl.get(`${prefix}.orderNumber`).d('订单号')} {...formLayout}>
                  {getFieldDecorator('displayPoNum')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
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
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formLayout}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row
              {...SEARCH_FORM_ROW_LAYOUT}
              style={{ display: moreFieldsVisible ? 'block' : 'none' }}
            >
              <Col span={8}>
                <Form.Item label={intl.get(`entity.business.tag`).d('业务实体')} {...formLayout}>
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="HPFM.OU"
                      textField="ouName"
                      queryParams={{ organizationId, tenantId, enabledFlag: 1 }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseOrgId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURORG_CODE"
                      textField="organizationName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`${prefix}.purchaseAgent`).d('采购员')} {...formLayout}>
                  {getFieldDecorator('agentId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      textField="purchaseAgentName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`${prefix}.releaseNum`).d('发放号')} {...formLayout}>
                  {getFieldDecorator('displayReleaseNum')(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.creation.from`).d('创建时间从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      placeholder={null}
                      showTime={{
                        defaultValue: moment('00:00:00', 'HH:mm:ss'),
                      }}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.creation.to').d('创建时间至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      placeholder={null}
                      showTime={{
                        defaultValue: moment('23:59:59', 'HH:mm:ss'),
                      }}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.vendorLocations`).d('供应商地点')}
                  {...formLayout}
                >
                  {getFieldDecorator('supplierSiteId')(
                    <Lov
                      code="SODR.SUPPLIER_SITE"
                      disabled={!getFieldValue('supplierId')}
                      textField="supplierSiteName"
                      queryParams={{ tenantId, supplierId: getFieldValue('supplierId') }}
                      onMouseEnter={() => this.handleToolTipVisible('supplierAddressVisible', true)}
                      onMouseLeave={() =>
                        this.handleToolTipVisible('supplierAddressVisible', false)
                      }
                    />
                  )}
                  <Tooltip
                    title={intl.get(`${prefix}.tipSupplier`).d('请先选择供应商')}
                    visible={supplierAddressVisible && !getFieldValue('supplierId')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.order.type`).d('订单类型')} {...formLayout}>
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SPUC_ORDER_TYPE"
                      textField="orderTypeName"
                      queryParams={{ tenantId, enabledFlag: 1 }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.sourcePlatform`).d('来源平台')}
                  {...formLayout}
                >
                  {getFieldDecorator('poSourcePlatform')(
                    <Select allowClear onChange={this.handleSelectOnChange}>
                      {sourcePlatform.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`${prefix}.sourceDoc`).d('单据来源')} {...formLayout}>
                  {getFieldDecorator('sourceBillTypeCode')(
                    <Select allowClear>
                      {(docSourceList.length > 0 ? docSourceList : docSource).map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`${prefix}.displayPrNum`).d('申请单号')} {...formLayout}>
                  {getFieldDecorator('displayPrNum')(
                    <Input trim inputChinese={false} onChange={this.onChangeRequestNum} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${prefix}.displayPrLineNum`).d('申请行号')}
                  {...formLayout}
                >
                  {getFieldDecorator('displayPrLineNum')(
                    <Input
                      trim
                      inputChinese={false}
                      disabled={!getFieldValue('displayPrNum')}
                      onMouseEnter={() => this.handleToolTipVisible('requestVisible', true)}
                      onMouseLeave={() => this.handleToolTipVisible('requestVisible', false)}
                    />
                  )}
                  <Tooltip
                    title={intl.get(`${prefix}.tipRequest`).d('请先输入申请单号')}
                    visible={requestVisible && !getFieldValue('displayPrNum')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              {moreFieldsVisible ? (
                <Button onClick={() => this.handleMoreFields(false)}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              ) : (
                <Button onClick={() => this.handleMoreFields(true)}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
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
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
