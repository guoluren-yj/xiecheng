/*
 * Search - 订单查找表单
 * @date: 2018/09/17 14:48:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Row, Col, Select } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import LovModal from '../../components/MultipleLov';

/**
 * 订单查找表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;

const modelPrompt = 'sodr.sendOrder.model.common';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sodr/send-order/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    const { docSource = [] } = props.enumMap;
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      expandForm: false,
      docSourceList: docSource,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { handleSearch } = this.props;
    if (handleSearch) {
      handleSearch();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      handleReset,
      form: { resetFields },
    } = this.props;
    resetFields();
    handleReset();
  }

  /**
   * 改变滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    this.setState({ [field]: !!flag });
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
   *  来源系统下拉回调
   */
  @Bind()
  handleSelectOnChange(value) {
    const { enumMap = {}, form = {} } = this.props;
    const { docSource = [] } = enumMap;
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

  /**
   * 改变Lov时清空供应商地点
   * @param {String} value
   */
  @Bind()
  onChangeSupplierId(value, record = []) {
    const supplierIds = [];
    const supplierCompanyIds = [];
    const displaySupplierNameArray = [];
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;

    for (let i = 0; i < record.length; i++) {
      if (record[i]) {
        const { supplierId, supplierCompanyId, displaySupplierName } = record[i];
        if (supplierId) {
          supplierIds.push(supplierId);
        }
        if (supplierCompanyId) {
          supplierCompanyIds.push(supplierCompanyId);
        }
        if (displaySupplierName) {
          displaySupplierNameArray.push(displaySupplierName);
        }
      }
    }
    if (!value || getFieldValue('displaySupplierName') !== displaySupplierNameArray.join(',')) {
      resetFields(['supplierSiteCode', 'supplierSiteName', 'supplierSiteId']);
    }
    registerField('supplierIds');
    registerField('supplierCompanyIds');
    setFieldsValue({
      supplierIds: supplierIds.join(','),
      supplierCompanyIds: supplierCompanyIds.join(','),
    });
  }

  render() {
    const { form, enumMap, customizeFilterForm } = this.props;
    const { flag = [], orderSource = [], docSource = [], signStatus = [] } = enumMap;
    const { expandForm, tenantId, organizationId, docSourceList } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SODR.SEND_ORDER_LIST.FILTER_LINE',
      },

      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18} style={{ paddingRight: 5 }}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.srmPoNum`).d('SRM订单号')}
                >
                  {getFieldDecorator('poNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('tempKeys')(
                    <LovModal
                      code="SODR.AUTH_SUPPLIER"
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
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.release.from`).d('发布日期从')}
                >
                  {getFieldDecorator('releaseDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateEnd') &&
                        moment(getFieldValue('releaseDateEnd')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('releaseDateEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('releaseDateStart') &&
                        moment(getFieldValue('releaseDateStart')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      placeholder={null}
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
                  label={intl.get(`sodr.common.model.common.purchaseOrgId`).d('采购组织')}
                >
                  {getFieldDecorator('purchaseOrgIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURORG"
                      queryParams={{ organizationId }}
                      lovOptions={{ displayField: 'organizationName' }}
                      textField="purOrganizationName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}
                >
                  {getFieldDecorator('agentIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      queryParams={{ organizationId }}
                      textField="agentName"
                    />
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}
                >
                  {getFieldDecorator('releaseNum')(<Input />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('erpCreationDateStart', {
                    initialValue: moment().subtract(3, 'months'),
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
                  label={intl.get(`${modelPrompt}.supplierSites`).d('供应商地点')}
                >
                  {getFieldDecorator('supplierSiteId')(
                    <Lov
                      disabled={!getFieldValue('supplierIds')}
                      code="SSLM.SUPPLIER_SITE_BY_IDS"
                      queryParams={{
                        supplierIds: getFieldValue('supplierIds'),
                        tenantId,
                      }}
                      textField="supplierSiteName"
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
                  label={intl.get(`${modelPrompt}.useFlag`).d('是否超期')}
                >
                  {getFieldDecorator('beyondFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      <Option value="1">{intl.get(`hzero.common.yes`).d('是')}</Option>
                      <Option value="0">{intl.get(`hzero.common.no`).d('否')}</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`entity.order.type`).d('订单类型')}>
                  {getFieldDecorator('poTypeId')(
                    <Lov
                      code="SPUC_ORDER_TYPE"
                      queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                      textField="orderTypeCode"
                    />
                  )}
                </FormItem>
              </Col> */}
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.erpStatus`).d('ERP状态')}
                >
                  {getFieldDecorator('erpStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {erpStatus.map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('poSourcePlatform')(
                    <Select allowClear onChange={this.handleSelectOnChange}>
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
                <Form.Item
                  label={intl.get(`${modelPrompt}.sourceDoc`).d('单据来源')}
                  {...formItemLayout}
                >
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
                <FormItem
                  label={intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标识')}
                  {...formItemLayout}
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
                  {...formItemLayout}
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
              <Col span={8}>
                <FormItem
                  label={intl.get(`sodr.common.model.common.popcNum`).d('订单协议单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('pcNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
              {this.props.remote.process('listFilterExtraForm', {
                form,
              })}
            </Row>
          </Col>

          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm} style={{ marginRight: 8 }}>
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
