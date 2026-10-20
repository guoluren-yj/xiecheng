import React, { Component } from 'react';
import { Form, Row, Col, Modal, DatePicker, Input } from 'hzero-ui';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import classnames from 'classnames';
import moment from 'moment';
import common from '@/routes/sbid/common.less';
import { INQUIRY, BID } from '@/utils/globalVariable';

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
      remoteFunc,
      customizeForm,
      startNewQuotationVisible = false,
      onCreateNewQuottion,
      cancelNewQuotation,
      startNewQuoBtnLoading,
      bidFlag,
    } = this.props;
    return (
      <Modal
        visible={startNewQuotationVisible}
        title={intl.get(`ssrc.bidHall.view.model.title.quotationEndTime`).d('报价截止时间')}
        onOk={onCreateNewQuottion}
        onCancel={cancelNewQuotation}
        className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
        confirmLoading={startNewQuoBtnLoading}
        okButtonProps={{ style: { marginLeft: '8px' } }}
      >
        {customizeForm(
          {
            code: `SSRC.${bidFlag ? BID : INQUIRY}_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM`,
            form,
          },
          <Form className="writable-row-custom">
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.bidHall.model.bidHall.roundQuotationEndDate`)
                    .d('当前轮次报价截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundQuotationEndDate', {
                    initialValue: remoteFunc
                      ? remoteFunc.process(
                          'SSRC_EVALUATION_PROC_MANAGE_ROUND_QUOTATION_NEW_QUOTATION_MODAL_END_DATE',
                          null
                        )
                      : null,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.bidHall.model.bidHall.roundQuotationEndDate`)
                            .d('当前轮次报价截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
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
                    rules: [],
                  })(<Input.TextArea />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
