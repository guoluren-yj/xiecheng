/**
 * LineCreation - 扣款单列表
 * @date: 2019-02-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  filterNullValueObject,
  // getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';

const FormItem = Form.Item;
const commonPrompt = 'sfin.supplierChargeEntry.model';

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // organizationId: getUserOrganizationId(),
      tenantId: getCurrentOrganizationId(),
    };
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchDetailList = (e) => e,
      form: { getFieldsValue = (e) => e },
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
      form: { resetFields = (e) => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {} } = this.props;
    const { tenantId } = this.state;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${commonPrompt}.deductionsNum`).d('扣款单号')}>
          {getFieldDecorator('deductionsNum')(<Input typeCase="upper" />)}
        </FormItem>
        <FormItem label={intl.get(`${commonPrompt}.accountSubjectId`).d('总账科目')}>
          {getFieldDecorator('accountSubjectId')(
            <Lov
              code="SPRM.ACCOUNT_SUBJECT"
              textField="accountSubjectName"
              queryParams={{ tenantId }}
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
