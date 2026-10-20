import React, { Component } from 'react';
import { Form, Row, Col, Modal, DatePicker, Input } from 'hzero-ui';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import classnames from 'classnames';
import moment from 'moment';
import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class NewQuotationModel extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  render() {
    const {
      form,
      form: { getFieldDecorator },
      createNewRoundQuotationLoading,
      batchCreateNewRoundQuotationLoading,
      remoteFunc,
      customizeForm,
      startNewQuotationVisible = false,
      onCreateNewQuottion,
      cancelNewQuotation,
      quotationName,
      sourceKey,
    } = this.props;
    return (
      <Modal
        visible={startNewQuotationVisible}
        title={intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDeadline`, {
            quotationName,
          })
          .d('{quotationName}截止时间')}
        onOk={onCreateNewQuottion}
        onCancel={cancelNewQuotation}
        className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
        confirmLoading={createNewRoundQuotationLoading || batchCreateNewRoundQuotationLoading}
      >
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM`,
            form,
          },
          <Form className="writable-row-custom">
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get('ssrc.quoController.model.quoController.roundQuotationEndDate')
                    .d('当前轮次截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundQuotationEndDate', {
                    initialValue: remoteFunc
                      ? remoteFunc.process(
                          'SSRC_ROUND_QUOTATION_PROCESS_NEW_QUOTATION_MODAL_END_DATE',
                          null
                        )
                      : null,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('ssrc.quoController.model.quoController.roundQuotationEndDate')
                            .d('当前轮次截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      showTime
                      placeholder=""
                      format={getDateTimeFormat()}
                      disabledDate={(current) => moment().isAfter(current, 'day')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.bidHall.model.bidHall.startingReason').d('发起原因')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('startingReason', {
                    initialValue: null,
                    rules: [],
                  })(<Input.TextArea style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
