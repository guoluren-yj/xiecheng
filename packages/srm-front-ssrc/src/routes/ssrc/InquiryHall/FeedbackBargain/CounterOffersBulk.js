import React, { PureComponent } from 'react';
import { Form, Modal, Input, InputNumber, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 12,
  },
};

/**
 * props
 *
 * modalData object
 *  - quotationCurrencyCode string 输入框，币种 - 原币
 */

@Form.create({ fieldNameProp: null })
export default class CounterOffersBulk extends PureComponent {
  /**
   * 保存
   */
  @Bind()
  save() {
    const { onSave, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onSave(values);
      }
    });
  }

  /**
   * 还价方式 - 改变
   */
  @Bind()
  changeBargainType() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      bargainPrice: undefined,
    });
  }

  renderBargainPriceLabel() {
    const {
      form: { getFieldValue },
    } = this.props;
    let label = intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainPrice`).d('还价单价');
    if (getFieldValue('bargainType') === 'DISCOUNT_RATE') {
      label = intl.get(`ssrc.inquiryHall.model.inquiryHall.discountRate`).d('折扣率');
    }
    if (getFieldValue('bargainType') === 'DEDUCTION_PRICE') {
      label = intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPriceDiscount`).d('单价折扣额');
    }
    return label;
  }

  /**
   * 折扣率校验-【0，1】
   */
  @Bind()
  validateBargainPrice(rule, value, callback) {
    if (value && value > 1) {
      callback(intl.get('ssrc.inquiryHall.view.validator.bargainPrice').d('折扣率在【0，1】之间'));
    }
    callback();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      visible,
      onCancel,
      bargainType = [],
      saveLoading,
      type = 'BARGAIN',
      modalData,
    } = this.props;
    const { quotationCurrencyCode } = modalData || {};

    return (
      <Modal
        destroyOnClose
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
        confirmLoading={saveLoading}
        title={intl.get('ssrc.inquiryHall.view.message.title.counterOffersBulk').d('批量填写还价')}
      >
        <Form className={styles['counterOffersBulk-label']}>
          <FormItem
            {...formLayout}
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainType`).d('还价方式')}
          >
            {getFieldDecorator(
              'bargainType',
              {}
            )(
              <Select allowClear onChange={this.changeBargainType}>
                {bargainType &&
                  bargainType.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formLayout} label={this.renderBargainPriceLabel()}>
            {getFieldDecorator('bargainPrice', {
              rules: [
                {
                  required: getFieldValue('bargainType'),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: this.renderBargainPriceLabel(),
                  }),
                },
                // {
                //   validator: getFieldValue('bargainType') === 'DISCOUNT_RATE' && this.validateBargainPrice,
                // },
              ],
            })(
              getFieldValue('bargainType') === 'DISCOUNT_RATE' ? (
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={1}
                  disabled={!getFieldValue('bargainType')}
                />
              ) : (
                <PrecisionInputNumber
                  type="hzero"
                  min={0}
                  max="99999999999999999999"
                  disabled={!getFieldValue('bargainType')}
                  currency={quotationCurrencyCode}
                  style={{ width: '100%' }}
                />
              )
            )}
          </FormItem>
          {type !== 'BARGAIN_OFFLINE' ? (
            <FormItem
              {...formLayout}
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainRemark`).d('还价理由')}
            >
              {getFieldDecorator('bargainRemark', {})(<Input />)}
            </FormItem>
          ) : (
            ''
          )}
        </Form>
      </Modal>
    );
  }
}
