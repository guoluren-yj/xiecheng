/*
 * PurchaseOrderTracking - 采购订单跟踪报表查询表单
 * @date: 2020/02/27 14:45:33
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Button, Input, DatePicker, Col, Row, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getDateTimeFormat } from 'utils/utils';
import Lov from 'components/Lov';
import LovModal from '../components/MultipleLov';

const FormItem = Form.Item;
const { Option } = Select;

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  /**
   * 重置表单点击事件
   */
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  // 更多查询条件
  @Bind()
  showMore() {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  render() {
    const { showMore } = this.state;
    const { form, tenantId, fetchList = (e) => e, enumMap = {}, customizeFilterForm } = this.props;
    const { type = [] } = enumMap;
    const { getFieldDecorator, getFieldValue } = form;
    return customizeFilterForm(
      {
        form,
        expand: showMore,
        code: 'SODR.ORDER_TRACKING_LIST.SEARCH',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.displayPrNum`).d('采购申请编号')}
                >
                  {getFieldDecorator('displayPrNum', {
                    rules: [
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input trim typeCase="upper" inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.displayPoNumr`).d('订单编号')}
                >
                  {getFieldDecorator('displayPoNum', {
                    rules: [
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input trim typeCase="upper" inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.companyName`).d('公司名称')}
                >
                  {getFieldDecorator('companyName')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'companyName' }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: showMore ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织')}
                >
                  {/* {getFieldDecorator('organizationName')(
                <Lov
                  code="SPFM.USER_AUTH.PURORG_CODE"
                  queryParams={{ tenantId }}
                  lovOptions={{ valueField: 'organizationName' }}
                />
              )} */}
                  {getFieldDecorator('purchaseOrgIds')(
                    <LovModal
                      code="SPFM.USER_AUTH.PURORG"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'organizationName' }}
                      textField="purOrganizationName"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('supplierName')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      onChange={(_, record) => {
                        const {
                          supplierId,
                          supplierCompanyId,
                          supplierNum,
                          supplierCompanyNum,
                        } = record;
                        form.setFieldsValue({
                          peSupplier:
                            (supplierId || supplierCompanyId) &&
                            `${supplierCompanyId || 'null'}-${supplierId || 'null'}`,
                          supplierCode: supplierId ? supplierNum : supplierCompanyNum,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyName, supplierName } = record;
                        form.setFieldsValue({
                          supplierName: supplierName || supplierCompanyName || ' ',
                        });
                      }}
                    />
                  )}
                  {getFieldDecorator('supplierCode')}
                  {getFieldDecorator('peSupplier')}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.poItemName`).d('订单物料名称')}
                >
                  {getFieldDecorator('poItemCode')(
                    <Lov
                      code="SODR.PO_ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'itemName' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.orderFrom`).d('下单时间从')}
                >
                  {getFieldDecorator('releasedDateStart')(
                    <DatePicker
                      showTime
                      format={getDateTimeFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateEnd') &&
                        moment(getFieldValue('releasedDateEnd')).isBefore(currentDate, 'second')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.orderTo`).d('下单时间至')}
                >
                  {getFieldDecorator('releasedDateEnd')(
                    <DatePicker
                      showTime={{
                        defaultValue: moment('23:59:59', 'HH:mm:ss'),
                      }}
                      format={getDateTimeFormat()}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('releasedDateStart') &&
                        moment(getFieldValue('releasedDateStart')).isAfter(currentDate, 'second')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.displayStatusCode`).d('订单状态')}
                >
                  {getFieldDecorator('statusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {type
                        .filter((item) =>
                          [
                            'PENDING',
                            'SUBMITTED',
                            'APPROVED',
                            'REJECTED',
                            'PUBLISHED',
                            'DELIVERY_DATE_REVIEW',
                            'DELIVERY_DATE_REJECT',
                            'CONFIRMED',
                            'PUBLISH_CANCEL',
                            'CLOSED',
                          ].includes(item.value)
                        )
                        .map((n) => (
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
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sodr.common.model.common.applicationType`).d('申请类型')}
                >
                  {getFieldDecorator('prTypeIds')(
                    <LovModal code="SPUC.PR_DEMAND_TYPE" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.showMore}>
                {showMore
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button onClick={fetchList} type="primary" htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
