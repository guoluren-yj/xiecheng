/**
 * FilterForm - 寻源结果管理/供应商报价汇总查询
 * @date: 2019-12-17
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const { Option } = Select;

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-quotation-summary-query/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: false,
  };

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      customizeFilterForm,
      form,
      form: { getFieldDecorator, getFieldValue },
      sourceMethod = [],
      sourceCategory = [],
      quotationType = [],
    } = this.props;
    const { display } = this.state;

    return (
      <React.Fragment>
        {customizeFilterForm(
          { code: 'SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER', form, expand: display },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCode`)
                        .d('物料编码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemIds')(<LovMulti code="SSRC.CUSTOMER_ITEM" />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemRemark`)
                        .d('物料名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemName')(<Input trim maxLength={40} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyName`)
                        .d('供应商名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierCompanyName')(<Input trim maxLength={40} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: !display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxNum`)
                        .d('RFX单号')}
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxNum')(
                        <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxTitle`)
                        .d('询价单标题')}
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxTitle')(<Input maxLength={40} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourcingTemplate`)
                        .d('寻源模板')}
                      {...formLayout}
                    >
                      {getFieldDecorator('templateId')(
                        <Lov
                          code="SSRC.TEMPLATE_NAME_ALL"
                          textField="templateName"
                          queryParams={{ sourceCategory: 'RFX' }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourceMethod`)
                        .d('寻源方式')}
                      {...formLayout}
                    >
                      {getFieldDecorator('sourceMethod')(
                        <Select allowClear>
                          {sourceMethod &&
                            sourceMethod.map((item) => (
                              <Option key={item.meaning} value={item.value}>
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
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCategoryName`)
                        .d('物料类别')}
                      {...formLayout}
                    >
                      {getFieldDecorator('itemCategoryIds')(
                        <LovMulti code="SMDM.TREE_ITEM_CATEGORY" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ouName`)
                        .d('业务实体')}
                      {...formLayout}
                    >
                      {getFieldDecorator('ouId')(
                        <Lov code="SPFM.USER_AUTH.OU" textField="ouName" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.organizationName`)
                        .d('库存组织')}
                      {...formLayout}
                    >
                      {getFieldDecorator('invOrganizationId')(
                        <Lov code="HPFM.INV_ORG" textField="organizationName" />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourceType`)
                        .d('寻源类型')}
                      {...formLayout}
                    >
                      {getFieldDecorator('secondarySourceCategory')(
                        <Select allowClear>
                          {sourceCategory &&
                            sourceCategory.map((item) => (
                              <Option key={item.meaning} value={item.value}>
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
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.quotationType`)
                        .d('报价方式')}
                      {...formLayout}
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
                      label={intl.get(`ssrc.common.model.common.createdByName`).d('创建人')}
                      {...formLayout}
                    >
                      {getFieldDecorator('createByName')(<Input trim maxLength={40} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.finishDateFrom`)
                        .d('完成日期从')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishDateFrom')(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          disabledDate={(currentDate) =>
                            getFieldValue('finishDateTo') &&
                            moment(getFieldValue('finishDateTo')).isBefore(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.finishDateTo`)
                        .d('完成日期至')}
                      {...formLayout}
                    >
                      {getFieldDecorator('finishDateTo')(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          disabledDate={(currentDate) =>
                            getFieldValue('finishDateFrom') &&
                            moment(getFieldValue('finishDateFrom')).isAfter(currentDate, 'day')
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  {/* <Button
                    style={{ display: display ? 'inline-block' : 'none' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button
                    style={{ display: display ? 'none' : 'inline-block' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button> */}
                  <Button onClick={this.toggleForm}>
                    {display
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
