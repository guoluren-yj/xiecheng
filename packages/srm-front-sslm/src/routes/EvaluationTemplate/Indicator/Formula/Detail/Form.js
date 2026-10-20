/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Switch } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const FormItem = Form.Item;

@formatterCollections({ code: ['spfm.supplierKpiIndicator'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  render() {
    const {
      form: { getFieldDecorator = (e) => e },
      dataSource: { indicatorFmlId, remark, formulaUrl, enabledFlag = 1, serviceCode },
      status,
    } = this.props;
    const editable = indicatorFmlId && status === 'edit';
    return (
      <Form>
        <FormItem
          label={intl.get(`spfm.supplierKpiIndicator.model.supplier.fmlRemark`).d('公式说明')}
          {...formLayout}
        >
          {getFieldDecorator('remark', {
            initialValue: remark,
          })(<Input disabled={editable} />)}
        </FormItem>
        <FormItem
          label={intl.get(`spfm.supplierKpiIndicator.model.supplier.serviceName`).d('服务')}
          {...formLayout}
        >
          {getFieldDecorator('serviceCode', {
            initialValue: serviceCode,
            rules: [
              {
                required: true,
                message: intl.get(`hzero.common.validation.notNull`, {
                  name: intl.get(`spfm.supplierKpiIndicator.model.supplier.serviceName`).d('服务'),
                }),
              },
            ],
          })(<Lov code="HSGP.SERVICE" textValue={serviceCode} />)}
        </FormItem>
        <FormItem
          label={intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.formulaUrl`).d('URL')}
          {...formLayout}
        >
          {getFieldDecorator('formulaUrl', {
            initialValue: formulaUrl,
            rules: [
              {
                required: true,
                message: intl.get(`hzero.common.validation.notNull`, {
                  name: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.formulaUrl`).d('URL'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`hzero.common.status.enable`).d('启用')} {...formLayout}>
          {getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag === 1,
            valuePropName: 'checked',
          })(<Switch />)}
        </FormItem>
      </Form>
    );
  }
}
