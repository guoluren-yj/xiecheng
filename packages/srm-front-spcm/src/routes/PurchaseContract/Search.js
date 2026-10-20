/*
 * Search - 订单查找表单
 * @date: 2018/09/17 14:48:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { isFunction } from 'lodash';
import Lov from 'components/Lov';
import TransferLov from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import ValueList from 'components/ValueList';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch // 搜索
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-maintain/create-by-purchase' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      moreSearch: false,
      organizationId: getUserOrganizationId(),
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
      onGetLovValues,
    } = this.props;
    /**
     * 重置供应商
     */
    if (isFunction(onGetLovValues)) {
      onGetLovValues('', '');
    }
    resetFields();
  }

  /**
   * 改变该多查询框显示状态
   */
  toggleMoreSearch() {
    this.setState((state) => ({
      moreSearch: !state.moreSearch,
    }));
  }

  // @Bind()
  // handleSupplierChange(value, lovRecord) {
  //   const { onGetLovValues } = this.props;
  //   const { supplierCompanyId, supplierId } = lovRecord;
  //   if (isFunction(onGetLovValues)) {
  //     onGetLovValues(supplierCompanyId, supplierId);
  //   }
  // }

  /**
   * 供应商Lov改变时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record || {};
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyDeputyId: supplierCompanyId });
  }

  render() {
    const { form, enumMap, customizeFilterForm } = this.props;
    const { organizationId, moreSearch } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const { orderSources = [], executionStatus = [] } = enumMap;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return customizeFilterForm(
      {
        form,
        expand: moreSearch,
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PD.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.prNum`).d('申请编号')}
                >
                  {getFieldDecorator('prNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.lineNum`).d('行号')}
                >
                  {getFieldDecorator('displayLineNum')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.companyName`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: moreSearch ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('createdDateStart')(
                    <DatePicker
                      // showTime
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('createdDateEnd') &&
                        moment(getFieldValue('createdDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('createdDateEnd')(
                    <DatePicker
                      // showTime
                      format={DEFAULT_DATE_FORMAT}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('createdDateStart') &&
                        moment(getFieldValue('createdDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`spcm.common.model.ouName`).d('业务实体')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织')}
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
                  label={intl.get(`spcm.common.model.prRequestedNameQuery`).d('申请人（新）')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('prRequestedNameQuery')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.prRequestedName`).d('申请人')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('prRequestedName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`spcm.common.model.agentName`).d('采购员')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ organizationId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('prSourcePlatform')(
                    <Select allowClear>
                      {orderSources.map((orderSource) => (
                        <Option key={orderSource.value} value={orderSource.value}>
                          {orderSource.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.supplierCompanyId`).d('供应商')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ enabledFlag: 1, tenantId: getCurrentOrganizationId() }}
                      // onChange={(value, lovRecord) => {
                      //   this.handleSupplierChange(value, lovRecord);
                      // }}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyDeputyId')(<Input type="hidden" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.common.itemCode`).d('物料编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('itemCode')(
                    <Lov
                      code="SPRM.ITEM"
                      lovOptions={{ valueField: 'itemCode', displayField: 'itemCode' }}
                      queryParams={{ enabledFlag: 1 }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`spcm.common.model.productNum`).d('商品编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('productNum')(<Input typeCase="upper" inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.neededDateStart').d('需求日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('neededDateStart')(
                    <DatePicker
                      // showTime
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('neededDateEnd') &&
                        moment(getFieldValue('neededDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.neededDateEnd').d('需求日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('neededDateEnd')(
                    <DatePicker
                      // showTime
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('neededDateStart') &&
                        moment(getFieldValue('neededDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.urgentFlag`).d('是否加急')}
                >
                  {getFieldDecorator('urgentFlag')(
                    <ValueList
                      lovCode="HPFM.FLAG"
                      lazyLoad={false}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.executionStatusCode').d('执行状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('executionStatusCode')(
                    <Select allowClear>
                      {executionStatus.map((item) => (
                        <Option value={item.value}>{item.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('spcm.common.model.executorName').d('需求执行人')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('executorBys')(
                    <TransferLov
                      code="HIAM.USER_REAL_NAME"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginRight: 8 }} onClick={() => this.toggleMoreSearch()}>
                {moreSearch
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('spcm.common.view.button.viewMore').d('展开查询')}
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
