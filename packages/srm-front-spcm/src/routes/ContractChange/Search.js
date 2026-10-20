/*
 * index.js - 协议变更
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-11-12
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { isFunction } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

const { Option } = Select;

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-change/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
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
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * cascadingEvent - 级联事件
   */
  @Bind()
  cascadingEventCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId', 'pcTemplateId']);
  }

  @Bind()
  cascadingEventName() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTemplateId']);
  }

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
    const {
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue },
      enumMap = {},
    } = this.props;
    const { tenantId, expandForm } = this.state;
    const paramsCompany = getFieldValue('companyId')
      ? { companyId: getFieldValue('companyId') }
      : {};
    const paramsName = getFieldValue('pcTypeId') ? { pcTypeId: getFieldValue('pcTypeId') } : {};
    const { flag = [], status = [] } = enumMap;
    return customizeFilterForm(
      {
        form: this.props.form,
        expand: expandForm,
        code: 'SPCM.CONTRACT.CHANGE.LIST.FILTER',
      },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`spcm.common.model.common.purchaseAgreementNum`)
                    .d('采购协议编号')}
                >
                  {getFieldDecorator('pcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.purchaseAgreementName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`hzero.common.status`).d('状态')}>
                  {getFieldDecorator('pcStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {flag
                        .filter((item) =>
                          ['EFFECTED', 'PUBLISHED', 'CONFIRMED', 'ARCHIVE', 'EXPIRED'].includes(
                            item.value
                          )
                        )
                        .map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId }}
                      onChange={this.cascadingEventCompany}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.agreementObject`).d('协议对象')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyDeputyId')(<Input type="hidden" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.pcKindCode`).d('协议性质')}
                >
                  {getFieldDecorator('pcKindCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {status.map((n) => (
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
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.pcType`).d('协议类型')}
                >
                  {getFieldDecorator('pcTypeId')(
                    <Lov
                      code="SPCM.PC_TYPE_ALL"
                      textField="pcTypeName"
                      queryParams={{ ...paramsCompany, tenantId }}
                      onChange={this.cascadingEventName}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.pcTemplateId`).d('协议模板')}
                >
                  {getFieldDecorator('pcTemplateId')(
                    <Lov
                      code="SPCM.PC_TEMPLATE"
                      textField="templateName"
                      queryParams={{ ...paramsName, tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
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
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.confirmedDateFrom').d('生效日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('confirmedDateFrom')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('confirmedDateTo') &&
                        moment(getFieldValue('confirmedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('spcm.common.model.confirmedDateTo').d('生效日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('confirmedDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('confirmedDateFrom') &&
                        moment(getFieldValue('confirmedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                >
                  {getFieldDecorator('archiveCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.version`).d('版本号')}
                >
                  {getFieldDecorator('version')(
                    <InputNumber
                      maxLength={18}
                      parser={(value) => (/^\d+$/.test(value) ? value : '')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.mainAgreementCode`).d('主协议编码')}
                >
                  {getFieldDecorator('mainPcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('createByRealName')(<Input />)}
                </Form.Item>
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
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
