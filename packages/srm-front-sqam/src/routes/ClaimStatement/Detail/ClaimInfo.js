/**
 * BasicInfo - 基本信息表单
 * @date: 2019-11-4
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
// import { numberRender } from 'utils/renderer';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';
import DataSourceNum from '../../components/DataSourceNum';

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */

// @withCustomize({
//   unitCode: ['SQAM.CLAIM_STATEMENT_DEATIL.CLAIM_INFO'],
// })
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    // const { currentDate, dateFormat } = this.state;
    const {
      form,
      dataSource = {},
      customizeForm,
      ChangeItemReadOnly,
      payMentType = [],
      expenseProcessTypeDescriptionChange,
      checkedValues,
      history,
    } = this.props;
    const { getFieldDecorator, registerField, setFieldsValue } = form;
    const data = {
      ...dataSource,
      feedbackDate: dataSource.feedbackDate || undefined,
    };
    return customizeForm(
      {
        code: 'SQAM.CLAIM_STATEMENT_DEATIL.CLAIM_INFO',
        form,
        dataSource: data,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}>
              {getFieldDecorator('feedbackDate', {
                initialValue: dataSource.feedbackDate
                  ? moment(dataSource.feedbackDate).format('YYYY-MM-DD HH:mm:ss')
                  : null,
                rules: [
                  {
                    required: dataSource.autoConfirmFlag === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
                    }),
                  },
                ],
              })(
                ['NON_COMMUTED', 'COMMUTED_ITEM'].includes(checkedValues) ? (
                  <DatePicker
                    showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={(currentDate) => moment().isAfter(currentDate, 'day')}
                  />
                ) : (
                  <span>{dateTimeRender(dataSource.feedbackDate)}</span>
                )
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}>
              {getFieldDecorator('dataSourceCodeMeaning')(
                <span>{dataSource.dataSourceCodeMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.originNum`).d('来源单号')}>
              {getFieldDecorator('dataSourceNum', { initialValue: dataSource.dataSourceNum })(
                <DataSourceNum detail={dataSource} camp="PURCHASE" history={history} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}>
              {getFieldDecorator('totalAmount')(
                <span>
                  {/* {numberRender(dataSource.totalAmount, 2)} */}
                  {dataSource.totalAmount
                    ? thousandBitSeparator(dataSource.totalAmount, dataSource.amountPrecision)
                    : null}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.MoneyType`).d('币种')}>
              {getFieldDecorator('currencyName')(<span>{dataSource.currencyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.expenseProcessType`).d('费用处理方式')}>
              {!ChangeItemReadOnly
                ? getFieldDecorator('expenseProcessType', {
                    initialValue: dataSource.expenseProcessType,
                  })(
                    <Select
                      allowClear
                      onChange={(_, opt) => {
                        if (isUndefined(opt)) {
                          expenseProcessTypeDescriptionChange({
                            tag: null,
                          });
                          return;
                        }
                        registerField('expenseProcessTypeMeaning');
                        setFieldsValue({
                          expenseProcessTypeMeaning: opt.props.children,
                        });
                        const newPayMentType = payMentType.filter((item) => item.value === _);
                        expenseProcessTypeDescriptionChange(
                          _
                            ? {
                                description: newPayMentType[0]?.description,
                                tag: _ ? newPayMentType[0]?.tag : null,
                              }
                            : undefined
                        );
                      }}
                    >
                      {payMentType.map((item) => (
                        <Select.Option key={item.value}>{item.meaning}</Select.Option>
                      ))}
                    </Select>
                  )
                : getFieldDecorator('expenseProcessTypeMeaning')(
                  <span>{dataSource.expenseProcessTypeMeaning}</span>
                  )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.date.realFeedbackDate`).d('实际反馈日期')}>
              {getFieldDecorator('actualFeedbackDate')(
                <span>{dateTimeRender(dataSource.actualFeedbackDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
