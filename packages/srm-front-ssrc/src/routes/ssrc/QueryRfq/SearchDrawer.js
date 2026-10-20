/*
 * SearchDrawer - 我收到的订单查找表单滑窗
 * @date: 2018-11-27
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
import { getDateFormat } from 'utils/utils';

/**
 * 我收到的订单查找表单滑窗
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @return React.element
 */
const promptCode = 'ssrc.queryRfq';
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
export default class SearchDrawer extends Component {
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
    const { onReset } = this.props;
    onReset();
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      getFieldValue,
      getFieldDecorator,
      sourceMethod = [],
      rfxStatus = [],
      auctionDirection = [],
      quotationType = [],
      organizationId,
      customizeForm,
      form,
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.RFX_EVENT.FILTER_NEW',
        form,
        dataSource: {},
      },
      <Form className="more-fields-form">
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
            >
              {getFieldDecorator('rfxNum')(<Input inputChinese={false} maxLength={40} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.inquiryTitle`).d('询价单标题')}
            >
              {getFieldDecorator('rfxTitle')(<Input maxLength={40} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.sourcingApproach`).d('寻源方式')}
            >
              {getFieldDecorator('sourceMethod')(
                <Select style={{ width: '100%' }} allowClear>
                  {sourceMethod.map((n) => (
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
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.inquiryHall.quotationType`).d('报价方式')}
            >
              {getFieldDecorator('quotationType')(
                <Select allowClear>
                  {quotationType &&
                    quotationType.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('rfxStatus')(
                <Select allowClear>
                  {rfxStatus &&
                    rfxStatus.map((item) => (
                      <Option key={item.meaning} value={item.value}>
                        {item.meaning}
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
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.purchOrg`).d('采购组织')}
            >
              {getFieldDecorator('purOrganizationId')(
                <Lov code="SPFM.USER_AUTH.PURORG" textField="organizationName" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.businessUnit`).d('业务实体')}
            >
              {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" textField="ouName" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.createdUnitName`).d('创建人部门')}
            >
              {getFieldDecorator('createdUnitName')(<Input maxLength={40} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.currency`).d('币种')}
            >
              {getFieldDecorator('currencyCode')(
                <Lov code="SMDM.EXCHANGE_RATE.CURRENCY" textField="currencyCode" />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.sealedQuotation`).d('密封报价')}
            >
              {getFieldDecorator('sealedQuotationFlag')(
                <Select allowClear>
                  <Option value={1}>{intl.get('hzero.common.status.yes').d('是')}</Option>
                  <Option value={0}>{intl.get('hzero.common.status.no').d('否')}</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.biddingDirection`).d('报价方向')}
            >
              {getFieldDecorator('auctionDirection')(
                <Select allowClear>
                  {auctionDirection &&
                    auctionDirection.map((item) => (
                      <Option key={item.meaning} value={item.value}>
                        {item.meaning}
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
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.creater`).d('创建人')}
            >
              {getFieldDecorator('createdBy')(
                <Lov
                  code="HIAM.TENANT.USER"
                  textField="realName"
                  queryParams={{ organizationId }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`${promptCode}.model.queryRfq.supplierName`).d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName')(<Input maxLength={40} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
              {...formItemLayout}
            >
              {getFieldDecorator('creationDateFrom')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('endDate') &&
                    moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryRfq.startTime`).d('开始日期从')}
              {...formItemLayout}
            >
              {getFieldDecorator('quotationStartDateFrom')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('endDate') &&
                    moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryRfq.startlineTo`).d('开始日期止')}
              {...formItemLayout}
            >
              {getFieldDecorator('quotationStartDateTo')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('endDate') &&
                    moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryRfq.deadlineFrom`).d('截止日期从')}
              {...formItemLayout}
            >
              {getFieldDecorator('quotationEndDateFrom')(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  disabledDate={(currentDate) =>
                    getFieldValue('quotationEndDateTo') &&
                    moment(getFieldValue('quotationEndDateTo')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`hzero.common.time.creation.to`).d('创建日期至')}
              {...formItemLayout}
            >
              {getFieldDecorator('creationDateTo')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('startDate') &&
                    moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
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
              label={intl.get(`${promptCode}.model.queryRfq.deadlineTo`).d('截止日期止')}
              {...formItemLayout}
            >
              {getFieldDecorator('quotationEndDateTo')(
                <DatePicker
                  disabledDate={(currentDate) =>
                    getFieldValue('startDate') &&
                    moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
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
              label={intl.get(`${promptCode}.model.queryRfq.prNum`).d('采购申请号')}
              {...formItemLayout}
            >
              {getFieldDecorator('prNum')(<Input maxLength={40} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryRfq.prLineNum`).d('采购申请行号')}
              {...formItemLayout}
            >
              {getFieldDecorator('prLineNum')(<InputNumber min={0} step={1} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.resultsQuery.purchaserName`).d('采购员')}
              {...formItemLayout}
            >
              {getFieldDecorator('purchaserId')(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textField="purchaserName"
                  queryParams={{ organizationId }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer } = this.props;
    const drawerProps = {
      title: intl.get('hzero.common.button.viewMore').d('更多查询'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      // destroyOnClose: true,
      onClose: onHideDrawer,
      width: 450,
      style: {
        height: 'calc(100% - 103px)',
        overflow: 'auto',
        padding: 12,
      },
      maskClosable: false,
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
          <Button
            htmlType="submit"
            type="primary"
            onClick={this.handleSearch}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </footer>
      </Drawer>
    );
  }
}
