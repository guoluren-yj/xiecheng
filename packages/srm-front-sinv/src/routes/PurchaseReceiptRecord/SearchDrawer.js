/*
 *
 * @date: 2018-11-27 11:29:42
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Drawer, Select, Row, Col, InputNumber } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
// import { isFunction } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, getDateFormat, getUserOrganizationId } from 'utils/utils';
import LovModal from '../components/MultipleLov';
/**
 * 订单查找表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const { Option } = Select;
const FormItem = Form.Item;

/**
 * getPastHalfYear - 获取当前时间半年前时间
 * @param {!object} currentDate - 当前日期 - moment对象类型
 */
// function getPastHalfYear(currentDate = moment()) {
//   const currentDateTime = isFunction(currentDate.valueOf) ? currentDate.valueOf() : null;
//   if (!currentDateTime) {
//     return;
//   }
//   // 将半年的时间单位换算成毫秒
//   const halfYear = (currentDate.isLeapYear() ? 366 : 365) / 2 * 24 * 3600 * 1000;
//   const pastResult = currentDateTime - halfYear; // 半年前的时间（毫秒单位）
//   return moment(pastResult);
// }
export default class SearchDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // trxDateFrom: getPastHalfYear(),
      tenantId: getCurrentOrganizationId(),
      userOrganizationId: getUserOrganizationId(),
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          onSearch(values);
        }
      });
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { onReset } = this.props;
    onReset();
  }

  /**
   * 改变供应商Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId, supplierCompanyId } = record || {};
    if (!rowKey || getFieldValue(['supplierCompanyId']) !== rowKey) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  @Bind()
  handleChangeOuId(value, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue, getFieldValue, resetFields } = form;
    const { supplierId } = record;
    if (!value || getFieldValue('displaySupplierName') !== value) {
      resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
    registerField('supplierId');
    setFieldsValue({ supplierId });
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      handleChangeOuId,
      // onChangeSupplierId,
      form,
      specialInventory = [],
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { tenantId, userOrganizationId } = this.state;
    // const params = getFieldValue('purchaseOrgId')
    //   ? { purchaseOrgId: getFieldValue('purchaseOrgId') }
    //   : {};
    const paramsOuId = getFieldValue('ouId') ? { ouId: getFieldValue('ouId') } : {};
    const paramsInventoryId = getFieldValue('inventoryId')
      ? { inventoryId: getFieldValue('inventoryId') }
      : {};
    return customizeForm(
      {
        form,
        code: 'SINV.PURCHASE_RECEIPT_RECORD.FILTER',
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
              {getFieldDecorator('displayLineNum')(<InputNumber min={0} />)}
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
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.trxDateFrom`).d('事务日期从')}
            >
              {getFieldDecorator('trxDateFrom')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('trxDateTo') &&
                    moment(getFieldValue('trxDateTo')).isBefore(currentDate, 'day')
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
              label={intl.get(`sinv.common.model.common.trxDateTo`).d('事务日期至')}
            >
              {getFieldDecorator('trxDateTo')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('trxDateFrom') &&
                    moment(getFieldValue('trxDateFrom')).isAfter(currentDate, 'day')
                  }
                  format={getDateFormat()}
                  placeholder={null}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.supplier.tag`).d('供应商')}
            >
              {getFieldDecorator('tempkeys')(
                <Lov
                  code="SPRM.SUPPLIER"
                  queryParams={{ tenantId: userOrganizationId }}
                  onChange={this.onChangeSupplierId}
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
                    organizationId: tenantId,
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
              {getFieldDecorator('displayReleaseNum')(<Input inputChinese={false} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员')}
            >
              {/* {getFieldDecorator('purchaseAgentId')(
                <Lov
                  // disabled={!getFieldValue('purchaseOrgId')}
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  queryParams={{ tenantId }}
                  textField="purchaseAgentName"
                />
              )} */}
              {getFieldDecorator('agentIds')(
                <LovModal
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  queryParams={{ tenantId }}
                  textField="purchaseAgentName"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
            >
              {getFieldDecorator('invOrganizationId')(
                <Lov
                  // onChange={onChangeSupplierId}
                  code="SODR.COMPANY_INVORGNIZATION"
                  queryParams={{ tenantId }}
                  // textField="organizationName"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.business.tag`).d('业务实体')}
            >
              {getFieldDecorator('ouId')(
                <Lov
                  onChange={handleChangeOuId}
                  code="SODR.USER_AUTH.OU"
                  queryParams={{ organizationId: tenantId, enabledFlag: 1 }}
                  textField="ouName"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...MODAL_FORM_ITEM_LAYOUT} label={intl.get(`entity.item.tag`).d('物料')}>
              {getFieldDecorator('itemCode')(
                <Lov code="SODR.PO_ITEM" queryParams={{ tenantId }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.inventoryName`).d('库房')}
            >
              {getFieldDecorator('inventoryId')(
                <Lov
                  // disabled={!getFieldValue('ouId')}
                  code="SODR.INVENTORY"
                  queryParams={{ ...paramsOuId, tenantId }}
                  textField="inventoryName"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.locationName`).d('库位')}
            >
              {getFieldDecorator('locationId')(
                <Lov
                  // disabled={!getFieldValue('inventoryId')}
                  code="SODR.LOCATION"
                  queryParams={{ ...paramsInventoryId, tenantId, enabledFlag: 1 }}
                  textField="locationName"
                />
              )}
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
                  {specialInventory.map((n) =>
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
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.createdName`).d('单据创建人')}
            >
              {getFieldDecorator('createdName', {
                rules: [
                  {
                    pattern: /^.{1,100}$/,
                    message: intl
                      .get(`sinv.supplierDelivery.model.createdName.more`)
                      .d('长度不能超过100'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displayPrNum`).d('采购申请编号')}
            >
              {getFieldDecorator('displayPrNum')(<Input inputChinese={false} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.displayPrLineNum`).d('采购申请行号')}
            >
              {getFieldDecorator('displayPrLineNum')(<Input inputChinese={false} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.item.purchasingOrz`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgId')(
                <Lov code="HPFM.PURCHASE_ORGANIZATION" queryParams={{ tenantId }} />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...MODAL_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.item.orderType`).d('订单类型')}
            >
              {getFieldDecorator('orderTypeId')(
                <Lov code="SODR.ORDER_TYPE" queryParams={{ tenantId }} />
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
      title: intl.get(`sinv.supplierDelivery.view.message.searchMore`).d('查询更多'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      // destroyOnClose: true,
      onClose: onHideDrawer,
      width: 520,
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
          <Button type="primary" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </footer>
      </Drawer>
    );
  }
}
