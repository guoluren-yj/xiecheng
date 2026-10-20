// 索赔信息
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';
import DataSourceNum from '../../components/DataSourceNum';

// import { getDateTimeFormat, getDateFormat } from 'utils/utils';

const prefix = `sqam.common`;

// @withCustomize({
//   unitCode: ['SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO'],
// })
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // currentDate: moment(),
      // icaDate: moment().add(1, 'd'),
      // pcaDate: moment().add(14, 'd'),
      // dateFormat: getDateFormat(),
      // timeFormat: getDateTimeFormat(),
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      detail,
      customizeForm,
      // supplierCompanyName, // 供应商名字
      totalAmount, // 索赔总额
      amountPrecision,
      currencyName, // 币种
      feedbackDate, // 要求反馈日期
      actualFeedbackDate, // 实际反馈日期
      // appealedSum, // 申诉次数
      // appealedDate, // 申诉日期
      // appealHandledDate, // 申诉处理日期
      dataSourceCodeMeaning, // 索赔来源
      // dataSourceNum, // 来源单号
      history,
      remoteProps,
    } = this.props;
    const { getFieldDecorator } = form;

    return customizeForm(
      {
        code: 'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO',
        form,
        dataSource: detail,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.date.requireFeedbackDate`).d('要求反馈日期')}>
              {getFieldDecorator('feedbackDate')(<span>{dateTimeRender(feedbackDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}>
              {getFieldDecorator('dataSourceCodeMeaning')(<span>{dataSourceCodeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.originNum`).d('来源单号')}>
              {getFieldDecorator('dataSourceNum')(
                <DataSourceNum detail={detail} camp="SUPPLIER" history={history} remoteProps={remoteProps} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.common.claimAmount`).d('索赔金额')}>
              {getFieldDecorator('totalAmount')(
                <span>{thousandBitSeparator(totalAmount, amountPrecision)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.MoneyType`).d('币种')}>
              {getFieldDecorator('currencyCode')(<span>{currencyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.date.realFeedbackDate`).d('实际反馈日期')}>
              {getFieldDecorator('actualFeedbackDate')(
                <span>{dateTimeRender(actualFeedbackDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
