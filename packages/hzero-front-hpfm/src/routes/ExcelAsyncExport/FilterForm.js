/**
 * FilterForm - Excel异步导出-查询条件表单
 * @date: 2019-8-7
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import { getDateFormat } from 'utils/utils';

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: true,
    };
  }

  /**
   * 提交查询表单
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
      typeList = [],
      defaultStartTime,
    } = this.props;
    const { expandForm } = this.state;
    const dateFormat = getDateFormat();
    const { creationDateFrom, creationDateTo } = getFieldsValue();
    const min = creationDateTo
      ? moment(creationDateTo.format('YYYY-MM-DD hh:mm:ss')).subtract(6, 'M')
      : undefined;
    const max = creationDateFrom
      ? moment(creationDateFrom.format('YYYY-MM-DD hh:mm:ss')).add(6, 'M')
      : undefined;
    return (
      <Form className="more-fields-search-form">
        <Row gutter={24} {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.templateName')
                    .d('导出模板名称')}
                >
                  {getFieldDecorator('templateName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.taskName')
                    .d('任务名称')}
                >
                  {getFieldDecorator('taskName')(<Input trim typeCase="lower" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.state')
                    .d('任务状态')}
                >
                  {getFieldDecorator('state')(
                    <Select allowClear>
                      {typeList.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.loginName')
                    .d('导出人账号')}
                >
                  {getFieldDecorator('loginName')(<Input allowClear />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.realName')
                    .d('导出人')}
                >
                  {getFieldDecorator('realName')(<Input allowClear />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.creationDateFrom')
                    .d('提交时间从')}
                >
                  {getFieldDecorator('creationDateFrom', {
                    initialValue: defaultStartTime,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.excelAsyncExport.model.excelAsyncExport.creationDateFrom').d('提交时间从'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={dateFormat}
                      style={{ width: '100%' }}
                      disabledDate={(currentDate) =>
                        (creationDateTo && moment(creationDateTo).isBefore(currentDate, 'second')) ||
                        (min && min.isAfter(currentDate))
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.excelAsyncExport.model.excelAsyncExport.creationDateTo')
                    .d('提交时间至')}
                >
                  {getFieldDecorator('creationDateTo', {
                  })(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={dateFormat}
                      style={{ width: '100%' }}
                      disabledDate={(currentDate) =>
                        (creationDateFrom && moment(creationDateFrom).isAfter(currentDate, 'second')) ||
                        (max && max.isBefore(currentDate))
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
                style={{ display: expandForm ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button
                style={{ display: expandForm ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={this.handleSearch} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
