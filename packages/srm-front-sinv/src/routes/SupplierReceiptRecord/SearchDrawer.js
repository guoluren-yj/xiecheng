/*
 * SearchDrawer - 客户收货记录滑窗
 * @date: 2018-1-6
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Select, DatePicker, Drawer, Row, Col, InputNumber } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateFormat, getUserOrganizationId } from 'utils/utils';

/**
 * 客户收货记录
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
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
    const { onReset } = this.props;
    onReset();
  }

  @Bind()
  onChangeSupplierId(rowKey) {
    const { form } = this.props;
    if (!rowKey || form.getFieldsValue(['supplierId']) !== rowKey) {
      form.resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const { form, enumMap = {}, customizeForm = () => {} } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { rcvStockType = [] } = enumMap;
    const { organizationId } = this.state;
    return customizeForm(
      {
        form,
        code: 'SINV.SUPPLIER_RECEIPT_RECORD.FILTER',
      },
      <Form className="more-fields-form">
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displayTrxNum`).d('事务编号')}
            >
              {getFieldDecorator('displayTrxNum')(
                <Input trim typeCase="upper" inputChinese={false} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displaySourcePoNum`).d('来源订单号')}
            >
              {getFieldDecorator('displayPoNum')(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号')}
            >
              {getFieldDecorator('displayLineNum')(<InputNumber />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displayTrxLineNum`).d('事务行号')}
            >
              {getFieldDecorator('displayTrxLineNum')(<Input />)}
            </FormItem>
          </Col>
        </Row>

        <Row>
          <Col span={8}>
            <FormItem {...MODAL_FORM_ITEM_LAYOUT} label={intl.get(`entity.customer.tag`).d('客户')}>
              {getFieldDecorator('companyId')(
                <Lov code="SINV.ASN_CUSTOMER" queryParams={{ organizationId }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.trxDateFrom`).d('事务日期从')}
            >
              {getFieldDecorator('trxDateFrom')(
                <DatePicker
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('trxDateTo') &&
                    moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
                  }
                  format={getDateFormat()}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.trxDateTo`).d('事务日期至')}
            >
              {getFieldDecorator('trxDateTo')(
                <DatePicker
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('trxDateFrom') &&
                    moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                  }
                  format={getDateFormat()}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sinv.common.model.common.purchaseReceiveTransactionType`)
                .d('事务类型')}
            >
              {getFieldDecorator('rcvTrxTypeId')(
                <Lov
                  code="SINV.RECEIVE_TRX_TYPE"
                  queryParams={{
                    enabledFlag: 1,
                  }}
                  lovOptions={{
                    valueField: 'rcvTrxTypeId',
                    displayField: 'rcvTrxTypeCode',
                  }}
                  textField="rcvTrxTypeCode"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.sourceAsnNum`).d('来源送货单号')}
            >
              {getFieldDecorator('asnNum')(<Input trim typeCase="upper" inputChinese={false} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sinv.common.model.common.orderDisplayLineLocationNum`)
                .d('订单发运号')}
            >
              {getFieldDecorator('displayLineLocationNum')(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sinv.common.model.common.sourceDisplayReleaseNum`)
                .d('来源订单发放号')}
            >
              {getFieldDecorator('displayReleaseNum')(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...MODAL_FORM_ITEM_LAYOUT} label={intl.get(`entity.item.tag`).d('物料')}>
              {getFieldDecorator('itemCode')(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.stockType`).d('特殊库存')}
            >
              {getFieldDecorator('stockType')(
                <Select style={{ width: '100%' }} allowClear>
                  {rcvStockType.map((n) => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sinv.common.model.common.realityReceiveDateStart`)
                .d('实际接收日期从')}
            >
              {getFieldDecorator('realityReceiveDateStart')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('realityReceiveDateEnd') &&
                    moment(getFieldValue('realityReceiveDateEnd')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.realityReceiveDateEnd`).d('实际接收日期至')}
            >
              {getFieldDecorator('realityReceiveDateEnd')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('realityReceiveDateStart') &&
                    moment(getFieldValue('realityReceiveDateStart')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer } = this.props;
    const drawerProps = {
      visible,
      width: 520,
      mask: true,
      placement: 'right',
      // destroyOnClose: true,
      onClose: onHideDrawer,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      title: intl.get(`sinv.supplierDelivery.view.message.searchMore`).d('查询更多'),
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        // padding: 12,
      },
    };
    return (
      <Drawer {...drawerProps}>
        {this.renderForm()}
        <footer
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'right',
            padding: '12px 24px',
            borderTop: '1px solid #f5f5f5',
            backgroundColor: '#fff',
          }}
        >
          <Button onClick={this.handleFormReset} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </footer>
      </Drawer>
    );
  }
}
