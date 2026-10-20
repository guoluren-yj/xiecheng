/**
 * SearchDrawer - 送货单查找表单滑窗
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Row, Col, Form, Button, Input, Select, DatePicker, Drawer } from 'hzero-ui';
import moment from 'moment';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  getDateFormat,
  getUserOrganizationId,
  getDateTimeFormat,
  getCurrentTenant,
} from 'utils/utils';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';

/**
 * 送货单查找表单滑窗
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;

export default class SearchDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getUserOrganizationId(),
      tenantNum: getCurrentTenant().tenantNum,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (isFunction(onSearch)) {
      onSearch();
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

  render() {
    const { organizationId, tenantNum } = this.state;
    const { visible, onHideDrawer, customizeForm, form, enumMap = {} } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const {
      printStatus = [],
      type = [],
      status = [],
      importStatus = [],
      cancelStatus = [],
    } = enumMap;
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
        padding: 12,
      },
    };
    return (
      <Drawer {...drawerProps}>
        {customizeForm(
          {
            form,
            code: 'SINV.SUPPLIER_DELIVERY_LIST.FILTER',
          },
          <Form className="more-fields-form">
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get(`sinv.common.model.common.asnNum`).d('送货单号')}
                >
                  {getFieldDecorator('asnNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`sinv.supplierDelivery.model.supplierDelivery.printStatusFlag`)
                    .d('是否可打印')}
                >
                  {getFieldDecorator('printStatusFlag')(
                    <Select style={{ width: '100%' }} allowClear>
                      {printStatus.map((n) => (
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
                  label={intl.get('entity.customer.tag').d('客户')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SINV.ASN_CUSTOMER"
                      textField="companyName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.company.tag').d('公司')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ organizationId }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型')}
                >
                  {getFieldDecorator('asnTypeCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {type.map((n) => (
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
                    .get(`sinv.supplierDelivery.model.supplierDelivery.asnStatus`)
                    .d('送货单状态')}
                >
                  {getFieldDecorator('asnStatus')(
                    <Select style={{ width: `100%` }} allowClear>
                      {tenantNum === 'SRM-SQUIRRELS'
                        ? status.map((n) => {
                            return (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            );
                          })
                        : status.map((n) => {
                            if (n.value !== 'CONFIRMED') {
                              return (
                                <Option key={n.value} value={n.value}>
                                  {n.meaning}
                                </Option>
                              );
                            }
                            return false;
                          })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`sinv.supplierDelivery.model.supplierDelivery.submitStatus`)
                    .d('导入状态')}
                >
                  {getFieldDecorator('submitSyncStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {importStatus.map((n) => (
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
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
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
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
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
                  label={intl.get(`sinv.common.model.common.shipDateFrom`).d('发货日期从')}
                >
                  {getFieldDecorator('shipDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateTo') &&
                        moment(getFieldValue('shipDateTo')).isBefore(currentDate, 'day')
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
                  label={intl.get(`sinv.common.model.common.shipDateTo`).d('发货日期至')}
                >
                  {getFieldDecorator('shipDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('shipDateFrom') &&
                        moment(getFieldValue('shipDateFrom')).isAfter(currentDate, 'day')
                      }
                      format={getDateFormat()}
                      style={{ width: '100%' }}
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
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeFrom`)
                    .d('预计到货时间从')}
                >
                  {getFieldDecorator('expectedArriveDateFrom')(
                    <DatePicker
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateTo') &&
                        moment(getFieldValue('expectedArriveDateTo')).isBefore(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
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
                    .get(`sinv.common.model.common.expectedArriveTimeTo`)
                    .d('预计到货时间至')}
                >
                  {getFieldDecorator('expectedArriveDateTo')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('expectedArriveDateFrom') &&
                        moment(getFieldValue('expectedArriveDateFrom')).isAfter(currentDate, 'time')
                      }
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      format={getDateTimeFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...MODAL_FORM_ITEM_LAYOUT}
                  label={intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态')}
                >
                  {getFieldDecorator('cancelStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {cancelStatus.map((n) => (
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
                  label={intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态')}
                >
                  {getFieldDecorator('cancelStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {cancelStatus.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
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
