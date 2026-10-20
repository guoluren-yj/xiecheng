/**
 * 组件 - 汇率编辑 - 引用汇率主数据 - QuoteExchangeMainDateModalModal
 * @date: 20120-3-9
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, DatePicker } from 'hzero-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.expertScoring'] })
export default class QuoteExchangeMainDateModal extends Component {
  constructor(props) {
    super(props);
    props.onRef(this, 'exchangeRate');
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const {
      form: { getFieldDecorator },
      organizationId,
      exchangeEditContentModalVisible = false,
      quoteExchangeMainDataCancel,
      quoteExchangeMainDataOk,
    } = this.props;

    return (
      <Modal
        title={intl.get('ssrc.inquiryHall.view.button.quoExchangeData').d('引用汇率主数据')}
        visible={exchangeEditContentModalVisible}
        onCancel={quoteExchangeMainDataCancel}
        onOk={quoteExchangeMainDataOk}
      >
        <Form style={{ width: '50%', marginLeft: '25%' }}>
          <FormItem
            label={intl.get('ssrc.inquiryHall.model.inquiryHall.exchangeTypes').d('汇率类型')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rateTypeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('ssrc.inquiryHall.model.inquiryHall.exchangeTypes')
                      .d('汇率类型'),
                  }),
                },
              ],
            })(
              <Lov
                code="SMDM.EXCHANGE_RATE_TYPE"
                // textValue={header.templateName}
                textField="templateName"
                queryParams={{ organizationId, enabledFlag: 1 }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('ssrc.inquiryHall.model.inquiryHall.exchangeDate').d('兑换日期')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rateDate', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('ssrc.inquiryHall.model.inquiryHall.exchangeDate').d('兑换日期'),
                  }),
                },
              ],
            })(<DatePicker style={{ width: '100%' }} format={getDateFormat()} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
