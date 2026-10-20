/**
 * BasicInfo - 基本信息表单
 * @date: 2019-11-4
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
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
//   unitCode: ['SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO'],
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
    // const { currentDate, dateFormat } = this.state;
    const { dataSource = {}, form, customizeForm, history, remoteProps } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
        form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}>
              {getFieldDecorator('feedbackDate')(
                <span>{dateTimeRender(dataSource.feedbackDate)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}
              value={dataSource.dataSourceCodeMeaning}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}>
              {getFieldDecorator('dataSourceCodeMeaning')(
                <span>{dataSource.dataSourceCodeMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.originNum`).d('来源单号')}
              value={dataSource.dataSourceNum}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.originNum`).d('来源单号')}>
              {getFieldDecorator('dataSourceNum')(
                <DataSourceNum detail={dataSource} camp="SUPPLIER" history={history} remoteProps={remoteProps} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}
              value={numberRender(dataSource.totalAmount, 2, false)}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}>
              {getFieldDecorator('totalAmount')(
                <span>
                  {thousandBitSeparator(dataSource.totalAmount, dataSource.amountPrecision)}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`sqam.common.model.MoneyType`).d('币种')}
              value={dataSource.currencyName}
            /> */}
            <Form.Item label={intl.get(`sqam.common.model.MoneyType`).d('币种')}>
              {getFieldDecorator('currencyCode')(<span>{dataSource.currencyName}</span>)}
            </Form.Item>
          </Col>
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
