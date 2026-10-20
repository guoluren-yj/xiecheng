/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getDateTimeFormat } from 'utils/utils';

import intl from 'utils/intl';
import {
  DEFAULT_TIME_FORMAT,
  SEARCH_FORM_CLASSNAME,
  SEARCH_COL_CLASSNAME,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';

const dateTimeFormat = getDateTimeFormat();

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const {
      form,
      type,
      statusList = [],
      platformNoticeTypeList,
      companyNoticeTypeList,
    } = this.props;
    return (
      <Form className={SEARCH_FORM_CLASSNAME}>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          {['exportHistory'].includes(type) ? (
            <>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.creationData').d('提交时间')}
                >
                  {form.getFieldDecorator('creationDate')(
                    <DatePicker
                      placeholder=""
                      format={dateTimeFormat}
                      showTime={{ format: DEFAULT_TIME_FORMAT }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.state').d('状态')}
                >
                  {form.getFieldDecorator('state')(
                    <Select allowClear>
                      {statusList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.taskName').d('导出任务')}
                >
                  {form.getFieldDecorator('taskName')(<Input />)}
                </Form.Item>
              </Col>
            </>
          ) : ['importHistory'].includes(type) ? (
            <>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.fileName').d('文件')}
                >
                  {form.getFieldDecorator('fileName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.creationData').d('提交时间')}
                >
                  {form.getFieldDecorator('creationDate')(
                    <DatePicker
                      placeholder=""
                      format={dateTimeFormat}
                      showTime={{ format: DEFAULT_TIME_FORMAT }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.status').d('状态')}
                >
                  {form.getFieldDecorator('status')(
                    <Select allowClear>
                      {statusList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </>
          ) : ['platformNotice', 'companyNotice'].includes(type) ? (
            <>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.noticeTitle').d('公告标题')}
                >
                  {form.getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.noticeType').d('公告类型')}
                >
                  {form.getFieldDecorator('noticeTypeCode')(
                    <Select allowClear>
                      {type === 'platformNotice'
                        ? platformNoticeTypeList && platformNoticeTypeList.length
                          ? platformNoticeTypeList.map(i => (
                              <Select.Option value={i.value}>{i.meaning}</Select.Option>
                            ))
                          : null
                        : companyNoticeTypeList && companyNoticeTypeList.length
                        ? companyNoticeTypeList.map(i => (
                            <Select.Option value={i.value}>{i.meaning}</Select.Option>
                          ))
                        : null}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </>
          ) : (
            <>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.fromDate').d('创建时间从')}
                >
                  {form.getFieldDecorator('fromDate')(
                    <DatePicker
                      placeholder=""
                      format={dateTimeFormat}
                      showTime={{ format: DEFAULT_TIME_FORMAT }}
                      disabledDate={currentDate =>
                        form.getFieldValue('toDate') &&
                        moment(form.getFieldValue('toDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.toDate').d('创建时间至')}
                >
                  {form.getFieldDecorator('toDate')(
                    <DatePicker
                      placeholder=""
                      format={dateTimeFormat}
                      showTime={{ format: DEFAULT_TIME_FORMAT }}
                      disabledDate={currentDate =>
                        form.getFieldValue('fromDate') &&
                        moment(form.getFieldValue('fromDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.userMessage.model.userMessage.title').d('消息标题')}
                >
                  {form.getFieldDecorator('subject')(<Input />)}
                </Form.Item>
              </Col>
            </>
          )}

          <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
            <Form.Item>
              <Button onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button htmlType="submit" type="primary" onClick={this.handleSearchBtnClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        {type === 'message' && (window.$$env || {}).HMSG_MESSAGE_FILTER_CONTENT === "true" && (
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_4_LAYOUT} style={{ paddingLeft: '-6px', paddingRight: '-6px' }}>
              <Form.Item
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.userMessage.model.userMessage.content').d('内容')}
              >
                {form.getFieldDecorator('content')(<Input />)}
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}
