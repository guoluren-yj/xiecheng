/**
 * index.js - 供应商扣款录入搜索
 * @date: 2019-05-13
 * @author: zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, Select } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'sfin.supplierChargeEntry.model';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/purchase-contract-type/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    // if (isFunction(props.wrappedComponentRef)) {
    //   props.wrappedComponentRef(this);
    // }
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

  @Bind()
  handleSupplier(_, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    registerField('supplierCompanyIdStash');
    registerField('supplierId');
    // const textField = record.erpSupplierId ? record.erpSupplierName : record.supplierCompanyName;
    setFieldsValue({
      supplierCompanyName: record.supplierCompanyName,
      supplierCompanyIdStash: record.supplierCompanyId,
      supplierId: record.supplierId,
    });
  }

  render() {
    const { form, enumMap = {}, customizeFilterForm } = this.props;
    const { type = [] } = enumMap;
    const { expandForm, tenantId } = this.state;
    const { getFieldDecorator } = form;
    return customizeFilterForm(
      { form, code: 'SFIN.SUPPLIER_CHARGE_ENTRY.FILTER_FORM', expand: expandForm },
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.deductionsNum`).d('扣款单号')}
                >
                  {getFieldDecorator('deductionsNum')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`11111111111`).d('总账科目')}>
                  {getFieldDecorator('accountSubjectName')(<Input />)}
                </Form.Item>
              </Col> */}
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.accountSubjectId`).d('总账科目')}
                >
                  {getFieldDecorator('accountSubjectId')(
                    <Lov
                      code="SPRM.ACCOUNT_SUBJECT"
                      textField="accountSubjectName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.supplierId`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SQAM.CLAIM_SUPPLIER_COMPANY"
                      textField="supplierCompanyName"
                      lovOptions={{ valueField: 'rowNumId' }}
                      onChange={(val, record) => this.handleSupplier(val, record)}
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.billNum`).d('关联对账单号')}
                >
                  {getFieldDecorator('billNum')(<Input typeCase="upper" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.invoiceNum`).d('关联网上发票号')}
                >
                  {getFieldDecorator('invoiceNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.statusCode`).d('状态')}
                >
                  {getFieldDecorator('statusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {type.map((n) => {
                        if (
                          n.value === 'PENDING' ||
                          n.value === 'REJECTED' ||
                          n.value === 'RETURNED' ||
                          n.value === 'RETURN'
                        ) {
                          return (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          );
                        } else {
                          return false;
                        }
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.useFlag`).d('是否引用')}
                >
                  {getFieldDecorator('useFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      <Option value="1">{intl.get('hzero.common.yes').d('是')}</Option>
                      <Option value="0">{intl.get('hzero.common.no').d('否')}</Option>
                    </Select>
                  )}
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
