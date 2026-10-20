/**
 * LineCreation - 扣款单列表
 * @date: 2019-02-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, DatePicker } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
// import Lov from 'components/Lov';
import { filterNullValueObject } from 'utils/utils';

const FormItem = Form.Item;
const commonPrompt = 'sfin.payment';

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // organizationId: getUserOrganizationId(),
      // tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchDetailList = e => e,
      form: { getFieldsValue = e => e },
      pagination = { pageSize: 10, current: 1 },
    } = this.props;
    const data = filterNullValueObject(getFieldsValue()) || {};
    fetchDetailList({
      ...data,
      size: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {} } = this.props;
    // const { tenantId } = this.state;
    const { getFieldDecorator = e => e, getFieldValue } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${commonPrompt}.invoiceNum`).d('SRM发票号')}>
          {getFieldDecorator('invoiceNum')(<Input typeCase="upper" />)}
        </FormItem>
        <FormItem label={intl.get(`${commonPrompt}.taxInvoiceDateIssuedFrom`).d('开票日期从')}>
          {getFieldDecorator('taxInvoiceDateIssuedFrom')(
            <DatePicker
              placeholder={null}
              disabledDate={currentDate =>
                getFieldValue('taxInvoiceDateIssuedTo') &&
                moment(getFieldValue('taxInvoiceDateIssuedTo')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem label={intl.get(`${commonPrompt}.taxInvoiceDateIssuedTo`).d('开票日期至')}>
          {getFieldDecorator('taxInvoiceDateIssuedTo')(
            <DatePicker
              placeholder={null}
              disabledDate={currentDate =>
                getFieldValue('taxInvoiceDateIssuedFrom') &&
                moment(getFieldValue('taxInvoiceDateIssuedFrom')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get(`hzero.common.button.reset`).d('重置')}
          </Button>
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
            {intl.get(`hzero.common.button.search`).d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
