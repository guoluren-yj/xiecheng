import React, { PureComponent } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import PropTypes from 'prop-types';

import {
  DEFAULT_DATETIME_FORMAT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import { getDateTimeFormat, getCurrentOrganizationId, disabledTime } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
const tenantId = getCurrentOrganizationId();

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onQueryMessage - 查询
 * @reactProps {Function} onStoreFormValues - 存储表单值
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  state = {
    expandForm: true,
    selectMsgType: '',
  };

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  defaultStartTime = moment(moment().format("YYYY-MM-DD 00:00:00"));

  defaultEndTime = moment(moment().format("YYYY-MM-DD 23:59:59"));

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询表单-查询
   * @param {*} e
   */
  @Bind()
  handleSearch(e) {
    if(e) e.preventDefault();
    const { onSearch } = this.props;
    const { form, onStoreFormValues } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        let values = { ...fieldsValue };
        values = {
          startDate: fieldsValue.startDate
            ? fieldsValue.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: fieldsValue.endDate
            ? fieldsValue.endDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
        };
        onStoreFormValues({ ...fieldsValue, ...values });
        onSearch({ ...fieldsValue, ...values });
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
    this.setState({
      selectMsgType: '',
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 类型值改变时触发
   * @param {string} value
   */
  @Bind()
  selectMsgChange(value) {
    this.setState({
      selectMsgType: value,
    });
  }

  render() {
    const { getFieldDecorator, getFieldsValue } = this.props.form;
    const { statusList, messageTypeList, tenantRoleLevel } = this.props;
    const { expandForm, selectMsgType } = this.state;
    const { startDate, endDate } = getFieldsValue()
    const min = endDate ? moment(new Date(endDate.format("YYYY-MM-DD")).getTime() - 518400000) : undefined;
    const max = startDate ? moment(new Date(startDate.format("YYYY-MM-DD")).getTime() + 518400000) : undefined;
    return (
      <>
        <Form className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24} align="bottom">
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.common.view.type').d('类型')}
                {...formLayout}
              >
                {getFieldDecorator('messageTypeCode')(
                  <Select allowClear onChange={this.selectMsgChange}>
                    {messageTypeList &&
                      messageTypeList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hzero.common.status').d('状态')}
                {...formLayout}
              >
                {getFieldDecorator('trxStatusCode')(
                  <Select allowClear>
                    {statusList &&
                      statusList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.messageQuery.model.messageQuery.subject').d('主题')}
                {...formLayout}
              >
                {getFieldDecorator('subject')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row
            {...SEARCH_FORM_ROW_LAYOUT}
            style={{ display: expandForm ? '' : 'none' }}
            type="flex"
            gutter={24}
            align="bottom"
          >
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.messageQuery.model.messageQuery.serverCode').d('账号代码')}
              >
                {getFieldDecorator('serverCode')(
                  <Input trim typeCase="upper" inputChinese={false} />
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.messageQuery.model.messageQuery.receiver').d('接收人')}
                {...formLayout}
              >
                {getFieldDecorator('receiver')(
                  selectMsgType === 'WEB' ? (
                    <Lov
                      code="HMSG.SITE.USER"
                      queryParams={tenantRoleLevel ? { organizationId: tenantId } : {}}
                    />
                  ) : (
                    <Input />
                  )
                )}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.messageQuery.model.messageQuery.startDate').d('发送时间从')}
                {...formLayout}
              >
                {getFieldDecorator('startDate', {
                  initialValue: this.defaultStartTime,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.messageQuery.model.messageQuery.startDate').d('发送时间从'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder=""
                    format={getDateTimeFormat()}
                    disabledDate={(currentDate) =>
                      endDate &&
                      moment(endDate).isBefore(currentDate, 'day') || min && min.isAfter(currentDate)
                    }
                    disabledTime={disabledTime(endDate, "start")}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row
            {...SEARCH_FORM_ROW_LAYOUT}
            style={{ display: expandForm ? '' : 'none' }}
            type="flex"
            gutter={24}
            align="bottom"
          >
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hmsg.messageQuery.model.messageQuery.endDate').d('发送时间至')}
              >
                {getFieldDecorator('endDate', {
                  initialValue: this.defaultEndTime,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.messageQuery.model.messageQuery.endDate').d('发送时间至'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder=""
                    format={getDateTimeFormat()}
                    onChange={this.autoValidateDateRange}
                    disabledDate={(currentDate) =>
                      startDate &&
                      moment(startDate).isAfter(currentDate, 'day') || max && max.isBefore(currentDate)
                    }
                    disabledTime={disabledTime(startDate, "end")}
                  />
                )}
              </FormItem>
            </Col>
            {!tenantRoleLevel && (
              <Col {...FORM_COL_4_LAYOUT}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.tenant.tag').d('租户')}
                  {...formLayout}
                >
                  {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                </FormItem>
              </Col>
            )}
          </Row>
        </Form>
      </>
    );
  }
}
