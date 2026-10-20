/*
 * FilterForm - 账户分配类别维护查询表单
 * @date: 2020/04/10 14:48:29
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Col, Row } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
// import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 采购订单类型查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class AccountForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   * @param {*} e
   */
  @Bind()
  handleSearch(e) {
    e.preventDefault();
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      flags = [],
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sodr.orderType.model.orderType.accountAssignTypeCode`)
                .d('账户分配类别编码')}
            >
              {getFieldDecorator('accountAssignTypeCode')(<Input trim inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sodr.orderType.model.orderType.accountAssignTypeName`)
                .d('账户分配类别')}
            >
              {getFieldDecorator('accountAssignTypeName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sodr.orderTypeOrg.model.orderTypeOrg.enabledFlag`).d('是否启用')}
            >
              {getFieldDecorator('enabledFlag')(
                <Select allowClear>
                  {flags.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
