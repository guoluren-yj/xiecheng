/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Switch } from 'hzero-ui';
import intl from 'utils/intl';

// // 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'spfm.supplierKpiIndicator.view.title';
// // 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'spfm.supplierKpiIndicator.view.button';
// 设置sinv国际化前缀 - common - message

// 设置通用国际化前缀
// const commonPrompt = 'hzero.common';

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

const FormItem = Form.Item;

/**
 *
 *
 * @export
 * @class Search
 * @extends {PureComponent}
 */
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
      dataSource: {
        // detailCode,
        description,
        enabledFlag = 1,
        // editable,
      },
    } = this.props;
    return (
      <Form>
        {/* <FormItem
          label={intl.get(`hpfm.flexRule.model.flexRule.detailCode`).d('规则编码')}
          {...formLayout}
        >
          {getFieldDecorator('detailCode', {
            initialValue: detailCode,
            rules: [
              {
                required: true,
                message: intl
                  .get(`${commonPrompt}.validation.notNull`, {
                    name: intl.get(`hpfm.flexRule.model.flexRule.ruleCode`).d('规则编码'),
                  })
                  .d(`${intl.get(`hpfm.flexRule.model.flexRule.ruleCode`).d('规则编码')}不能为空`),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input inputChinese={false} disabled={editable} typeCase="upper" />)}
        </FormItem> */}
        <FormItem
          label={intl.get(`hpfm.flexRule.model.flexRule.description`).d('规则描述')}
          {...formLayout}
        >
          {getFieldDecorator('description', {
            initialValue: description,
          })(<Input />)}
        </FormItem>
        <Form.Item {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
          {getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag === 1,
          })(<Switch />)}
        </Form.Item>
      </Form>
    );
  }
}
