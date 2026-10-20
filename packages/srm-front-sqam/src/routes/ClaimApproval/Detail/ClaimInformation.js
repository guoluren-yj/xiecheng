import React, { Component } from 'react';
import { Form, Row, Col, Tooltip, Select, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import { connect } from 'dva';
import moment from 'moment';
// import { isNumber } from 'lodash';
// import { numberRender } from 'utils/renderer';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';
import Lov from 'components/Lov';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import DataSourceNum from '../../components/DataSourceNum';

// function numberFormat (val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals (val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

@connect(({ claimApproval }) => ({
  claimApproval,
}))
export default class ClaimInformation extends Component {
  render() {
    const {
      form,
      headerData,
      claimApproval,
      customizeForm,
      onSetExpenseProcess,
      history,
      editFlag,
    } = this.props;
    const { enumMap = {} } = claimApproval;
    const { payMentType = [] } = enumMap;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_INFO',
        form,
        dataSource: headerData,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {editFlag ? (
              <Form.Item
                label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('feedbackDate', {
                  initialValue: headerData.feedbackDate ? moment(headerData.feedbackDate) : null,
                  rules: [
                    {
                      required: headerData.autoConfirmFlag, // 处理dev环境索赔类型带出问题
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    placeholder=""
                    showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                    format="YYYY-MM-DD HH:mm:ss"
                    disabledDate={(currentDate) => moment().isAfter(currentDate, 'day')}
                  />
                )}
              </Form.Item>
            ) : (
              <Form.Item label={intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期')}>
                {getFieldDecorator('feedbackDate')(
                  <span>{dateTimeRender(headerData.feedbackDate)}</span>
                )}
              </Form.Item>
            )}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimOrigin`).d('索赔来源')}
              // value={headerData.dataSourceCodeMeaning}
            >
              {getFieldDecorator('dataSourceCodeMeaning')(
                <span>{headerData.dataSourceCodeMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.originNum`).d('来源单号')}
              // value={headerData.dataSourceNum}
            >
              {getFieldDecorator('dataSourceNum', { initialValue: headerData.dataSourceNum })(
                <DataSourceNum detail={headerData} camp="PURCHASE" history={history} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.claimSum`).d('索赔总额')}
              //   value={headerData.totalAmount ? numberFormat(headerData.totalAmount) : null}
            >
              {getFieldDecorator('totalAmount')(
                <span>
                  {headerData.totalAmount
                    ? thousandBitSeparator(headerData.totalAmount, headerData.amountPrecision)
                    : null}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.MoneyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
              //   value={headerData.currencyName}
            >
              {headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE'
                ? getFieldDecorator('currencyCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sqam.common.model.MoneyType`).d('币种'),
                        }),
                      },
                    ],
                    initialValue: headerData.currencyCode,
                  })(
                    <Lov
                      code="SPRM.EXCHANGE_RATE.CURRENCY"
                      lovOptions={{ displayField: 'currencyName' }}
                      textValue={headerData.currencyName}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )
                : getFieldDecorator('currencyCode', {
                    initialValue: headerData.currencyCode,
                  })(<div>{headerData.currencyName}</div>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.expenseProcessType`).d('费用处理方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {headerData.approvalMethod === 'FUC_AND_EXTERNAL_APPROVE' || editFlag
                ? getFieldDecorator('expenseProcessType', {
                    initialValue: headerData.expenseProcessType,
                  })(
                    <Tooltip
                      title={intl
                        .get('sqam.common.model.expenseProcessTypeNotice')
                        .d('供应商对索赔单进行确认时，可修改费用处理方式')}
                    >
                      <Select
                        allowClear
                        value={headerData.expenseProcessTypeMeaning}
                        onChange={onSetExpenseProcess}
                      >
                        {payMentType.map((item) => (
                          <Select.Option key={item.value}>{item.meaning}</Select.Option>
                        ))}
                      </Select>
                    </Tooltip>
                  )
                : getFieldDecorator('expenseProcessTypeMeaning', {
                    initialValue: headerData.expenseProcessTypeMeaning,
                  })(<div>{headerData.expenseProcessTypeMeaning}</div>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
