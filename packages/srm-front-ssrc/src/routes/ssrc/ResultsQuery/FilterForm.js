/*
 * FilterForm - 询价结果表单
 * @date: 2019/2/16 14:57:58
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import { isEmpty } from 'lodash';
import moment from 'moment';

const { Option } = Select;

const promptCode = 'ssrc.resultsQuery';
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/results-query/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
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

  // 筛选器-单据发布时间 默认值范围 approved_date
  getFilterCreateDataRangeDefaultValue = () => {
    const value = [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')];
    return value;
  };

  render() {
    const {
      form,
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue },
      code: { sourceTy = [], quotationType = [], importErpStatusList = [] },
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    const createFromValueSet = this.getFilterCreateDataRangeDefaultValue() || [];

    return customizeFilterForm(
      { code: 'SSRC.RESULTS_QUERY.FILTER', form, expand },
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.resultsQuery.itemCode`).d('物料编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemCode')(<Input maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.resultsQuery.itemName`).d('物品描述')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.resultsQuery.supplierCompanyName`)
                    .d('供应商名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'inline-block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.resultsQuery.ouId`).d('业务实体')}
                  {...formlayout}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" textField="ouName" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.resultsQuery.invOrganizationId`)
                    .d('库存组织')}
                  {...formlayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="HPFM.INV_ORG" textField="invOrganizationName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.resultsQuery.sourceNum`).d('寻源单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceNum')(
                    <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.resultsQuery.sourceType`).d('寻源类型')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceType')(
                    <Select allowClear>
                      {sourceTy.map((item) => (
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
                  label={intl.get(`${promptCode}.model.resultsQuery.quotationType`).d('报价方式')}
                  {...formlayout}
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
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.resultsQuery.creationDateFrom`)
                    .d('完成日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFrom', {
                    initialValue: createFromValueSet[0],
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
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
                  label={intl
                    .get(`${promptCode}.model.resultsQuery.creationDateTo`)
                    .d('完成日期至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateTo', {
                    initialValue: createFromValueSet[1],
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
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
                  label={intl
                    .get(`${promptCode}.model.resultsQuery.importOutSystermStatusMeaning`)
                    .d('导入外部系统状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('importErpStatus')(
                    <Select allowClear>
                      {importErpStatusList.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
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
