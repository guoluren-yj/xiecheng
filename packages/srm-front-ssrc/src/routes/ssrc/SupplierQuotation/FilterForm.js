/*
 * FilterForm - 供应商报价表单
 * @date: 2018/12/16 14:57:58
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import moment from 'moment';

import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const { Option } = Select;

@connect(({ supplierQuotation }) => ({
  supplierQuotation,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-quotation/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  // 条件查询
  @Bind()
  fetchInterfaceDef() {
    const { form, onConditional } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue = () => {} } = {},
      code: {
        biddingDirection = [],
        inquiryMethod = [],
        sourceCategory = [],
        quotationHeaderStatusList = [],
      },
      organizationId,
      originRfxNum = null,
    } = this.props;

    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const newSourceCategory =
      sourceCategory && sourceCategory.filter((item) => item.value !== 'BID');

    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.rfxNum.`).d('RFx单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxNum', {
                    initialValue: originRfxNum,
                  })(<Input typeCase="upper" trim inputChinese={false} maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="HPFM.PURCHASE_COMPANY"
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.supplierQuotation.model.supQuo.rfxTitle`).d('询价单标题')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxTitle')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.sourcingCategory`)
                    .d('寻源类别')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceCategory')(
                    <Select allowClear>
                      {newSourceCategory &&
                        newSourceCategory.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.sourcingApproach`)
                    .d('寻源方式')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceMethod')(
                    <Select allowClear>
                      {inquiryMethod &&
                        inquiryMethod.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formlayout}>
                  {getFieldDecorator('quotationHeaderStatus')(
                    <Select allowClear>
                      {quotationHeaderStatusList &&
                        quotationHeaderStatusList.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.biddingDirection`)
                    .d('报价方向')}
                  {...formlayout}
                >
                  {getFieldDecorator('auctionDirection')(
                    <Select allowClear>
                      {biddingDirection &&
                        biddingDirection.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.documentPublishTimeForm`)
                    .d('单据发布时间从')}
                  {...formlayout}
                >
                  {getFieldDecorator('approvedDateFrom', {
                    initialValue: moment().subtract(3, 'months').startOf('day'),
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      showTime
                      format={getDateTimeFormat()}
                      // disabledDate={(currentDate) =>
                      //   getFieldValue('approvedDateTo') &&
                      //   moment(getFieldValue('approvedDateTo')).isBefore(
                      //     currentDate,
                      //     'day'
                      //   )
                      // }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`ssrc.supplierQuotation.model.supQuo.documentPublishTimeTo`)
                    .d('单据发布时间至')}
                  {...formlayout}
                >
                  {getFieldDecorator('approvedDateTo', {
                    initialValue: moment().endOf('day'),
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      showTime
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('approvedDateFrom') &&
                        moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
