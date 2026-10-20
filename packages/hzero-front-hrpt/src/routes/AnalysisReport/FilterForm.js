import React, { Component } from 'react';
import { Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
} from 'utils/constants';

const FormItem = Form.Item;
const { Option } = Select;
const modelPrompt = 'hrpt.analysisReport.model.analysisReport';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false, // 展示更多查询
      yearStatus: false, // 控制年选择组件
    };
    if (props.onRef) {
      props.onRef(props.form);
    }
  }

  // 展示更多查询
  @Bind()
  showMore() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  // 表单重置事件
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const { expandForm, yearStatus } = this.state;
    const {
      code = {},
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      handleSearch = e => e,
      getDropDownList = e => e,
      handleChangeSelect = e => e,
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.reportStatisticsDimension`).d('报表统计维度')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('reportType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.reportStatisticsDimension`).d('报表统计维度'),
                    }),
                  },
                ],
                initialValue: 'company',
              })(
                <Select onChange={handleChangeSelect}>
                  {(code.statisticalDimension || []).map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.sourceDimension`).d('来源维度')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('poSourcePlatform')(
                <Select>
                  {(code.orderSource || []).map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.timeStatisticsDimension`).d('时间统计维度')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('timeDimension', {
                initialValue: 'year',
              })(
                <Select
                  onChange={() =>
                    setFieldsValue({ year: undefined, season: undefined, month: undefined })
                  }
                >
                  {(code.timeStatistics || []).map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <FormItem>
              <Button onClick={this.showMore}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button style={{ marginRight: 8 }} onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.yearly`).d('年度')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('year', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.yearly`).d('年度'),
                    }),
                  },
                ],
                initialValue: moment(),
              })(
                <DatePicker
                  mode="year"
                  open={yearStatus}
                  placeholder=""
                  format="YYYY"
                  onFocus={() => this.setState({ yearStatus: true })}
                  onBlur={() => {
                    this.setState({ yearStatus: false });
                  }}
                  onPanelChange={e => {
                    setFieldsValue({ year: e });
                    this.setState({ yearStatus: false });
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.quarter`).d('季度')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('season', {
                rules: [
                  {
                    required: getFieldValue('timeDimension') === 'season',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.quarter`).d('季度'),
                    }),
                  },
                ],
              })(
                <Select disabled={getFieldValue('timeDimension') !== 'season'}>
                  {getDropDownList('season').map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_4_LAYOUT}>
            <FormItem
              label={intl.get(`${modelPrompt}.month`).d('月份')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('month', {
                rules: [
                  {
                    required: getFieldValue('timeDimension') === 'month',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.month`).d('月份'),
                    }),
                  },
                ],
              })(
                <Select disabled={getFieldValue('timeDimension') !== 'month'}>
                  {getDropDownList('month').map(item => (
                    <Option value={item.value}>{item.meaning}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
