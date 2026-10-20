/**
 * index.js - 协议拟制-搜索
 * @date: 2019-05-15
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import Checkbox from 'components/Checkbox';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-maintain/quoteSource' })
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
      onFetchList('search');
    }
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onTransferChecked(checked) {
    const { onTransferAll } = this.props;
    if (isFunction(onTransferAll)) {
      onTransferAll(checked);
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
    const { form, customizeFilterForm, enumObj = {}, remote } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { tenantId, expandForm } = this.state;
    const { flag = [], resultStatusSet = [], occupyStatusSet = [] } = enumObj;
    // const { no } = dataSource;
    return customizeFilterForm(
      {
        form,
        expand: expandForm,
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.QS.FILTER',
      },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号')}
                >
                  {getFieldDecorator('sourceNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SPCM.USER_AUTH.COMPANY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPCM.AUTH_SUPPLIER_LIFE_CYCLE"
                      textField="displaySupplierName"
                      onChange={this.onChangeSupplierId}
                      queryParams={{ tenantId }}
                    />
                  )}
                  {getFieldDecorator('supplierCompanyDeputyId')(<Input type="hidden" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`spcm.common.model.common.stockOrg`).d('库存组织')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="SPRM.INV_ORG" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.purchaser`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('realName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('createDateFrom', {
                    initialValue: moment().subtract(3, 'M'),
                  })(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(current) =>
                        getFieldValue('createDateTo') &&
                        moment(getFieldValue('createDateTo')).isBefore(current, 'day')
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
                  {getFieldDecorator('createDateTo', {
                    initialValue: moment(),
                  })(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(current) =>
                        getFieldValue('createDateFrom') &&
                        moment(getFieldValue('createDateFrom')).isAfter(current, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.goods`).d('物品')}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员')}
                >
                  {getFieldDecorator('rfxRoleMan')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.allTransferFlag`).d('是否整单转协议')}
                >
                  {getFieldDecorator('allTransferFlag')(
                    <Checkbox onChange={(value) => this.onTransferChecked(value.target.checked)} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂')}
                >
                  {getFieldDecorator('contractPendingFlag', {
                    initialValue: '0',
                  })(
                    <Select defaultValue="0" style={{ width: '100%' }}>
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
                  label={intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态')}
                >
                  {getFieldDecorator('resultStatusSet', {
                    initialValue: ['WAITING_VALID', 'VALID'],
                  })(
                    <Select mode="multiple" style={{ width: '100%' }}>
                      {resultStatusSet.map((n) => (
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
                  label={intl.get(`spcm.common.model.common.occupyStatus`).d('占用状态')}
                >
                  {getFieldDecorator('occupyStatusSet')(
                    <Select mode="multiple" style={{ width: '100%' }}>
                      {occupyStatusSet.map((n) => (
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
                  label={intl.get(`spcm.common.model.common.prDisplayNum`).d('采购申请展示单号')}
                >
                  {getFieldDecorator('prDisplayNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.prDisplayLineNum`).d('采购申请展示行号')}
                >
                  {getFieldDecorator('prDisplayLineNum')(<Input />)}
                </FormItem>
              </Col>
              {remote ? remote.process('SPCM_CONTRACT_MAINTAIN_QUOTESOURCE_RESULT_OTHER_FORM', null, {
                form,
                formItemLayout,
                current: this,
              }) : null}
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
