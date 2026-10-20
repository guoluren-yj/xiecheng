/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  filterNullValueObject,
  getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getUserOrganizationId(),
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
    const { organizationId, tenantId } = this.state;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get(`sodr.quotePurchase.model.quotePurchase.applyPoNum`).d('申请编码')}
        >
          {getFieldDecorator('displayPrNum')(<Input typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号')}>
          {getFieldDecorator('displayPrLineNum')(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码')}>
          {getFieldDecorator('itemCode')(
            <Lov
              style={{ width: '156px' }}
              code="SPRM.ITEM"
              allowClear={false}
              queryPrams={{ organizationId, tenantId }}
              lovOptions={{ valueField: 'partnerItemId', displayField: 'itemCode' }}
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
