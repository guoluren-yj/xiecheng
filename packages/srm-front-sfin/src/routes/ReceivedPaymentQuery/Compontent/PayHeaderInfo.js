import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { Row, Col, Form, DatePicker, Input, Spin, Checkbox } from 'hzero-ui';
// import Lov from 'components/Lov';
import moment from 'moment';
import { dateRender } from 'utils/renderer';
import classnames from 'classnames';
import { getDateFormat } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  // FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';
import styles from './../index.less';

import DisplayFormItem from '../../components/DisplayFormItem';

const FormItem = Form.Item;
const { TextArea } = Input;
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'entity.supplier',
    'sfin.invoiceBill',
    'sfin.paymentQuery',
  ],
})
export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    // this.state = {
    //   organizationId: getCurrentOrganizationId(),
    // };
  }

  render() {
    const { maintainEditable = true, form = {}, headerInfo = {} } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    // const { organizationId } = this.state;
    return (
      <React.Fragment>
        <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Form className={styles['header-form']}>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                {/* <FormItem
                  label={intl
                    .get(`sinv.acceptanceSheetCreate.model.acceptListType`)
                    .d('付款申请单号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {headerInfo.paymentNum}
                </FormItem> */}
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.receivedpayNo`).d('收款申请单号')}
                  value={headerInfo.paymentNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.clintConpany`).d('客户公司')}
                  value={headerInfo.companyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.ouName`).d('业务实体')}
                  value={headerInfo.ouName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`entity.company.tag`).d('公司')}
                  value={headerInfo.supplierCompanyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.bankName`).d('银行名称')}
                  value={headerInfo.bankName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.bankBranchName`).d('开户行名称')}
                  value={headerInfo.bankBranchName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.bankAccountName`).d('账户名称')}
                  value={headerInfo.bankAccountName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.acceptListTypeId`).d('银行账号')}
                  value={headerInfo.bankAccountNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`sfin.payment.common.receiveType`).d('收款方式')}
                  value={headerInfo.typeName}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`sfin.payment.common.receiveDate`).d('收款日期')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {maintainEditable
                    ? getFieldDecorator('paymentDate', {
                        initialValue: headerInfo.paymentDate
                          ? moment(headerInfo.paymentDate)
                          : null,
                        rules: [
                          {
                            required: maintainEditable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`sfin.payment.common.receiveDate`).d('收款日期'),
                            }),
                          },
                        ],
                      })(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={(currentDate) =>
                            currentDate && moment().isBefore(currentDate, 'day')
                          }
                          onChange={this.handleChangeFormItem}
                        />
                      )
                    : dateRender(headerInfo.paymentDate)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.receiveAmount`).d('收款金额')}
                  value={headerInfo.paymentAmount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.currencyCode`).d('币种')}
                  value={headerInfo.currencyCode}
                />
              </Col>
            </Row>

            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.createdByName`).d('申请人')}
                  value={headerInfo.createdByName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`sfin.payment.common.privatePaymentFlag`).d('对私支付')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('privatePaymentFlag', {
                    initialValue: headerInfo.privatePaymentFlag || 0,
                  })(
                    <Checkbox
                      // defaultValue={0}
                      disabled
                      checkedValue={1}
                      unCheckedValue={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.receiptPlace`).d('收单地点')}
                  value={headerInfo.receiptPlace}
                />
                {/* <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model..receiptPlace`).d('收单地点')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('receiptPlace', {
                    initialValue: headerInfo.receiptPlace,
                  })(<Input />)}
                </FormItem> */}
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.invoiceBodyName`).d('开票主体')}
                  value={headerInfo.invoiceTitle}
                />
              </Col>
            </Row>

            <Row
              {...EDIT_FORM_ROW_LAYOUT}
              className={classnames('last-form-item', 'read-half-row')}
            >
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
                  {maintainEditable
                    ? getFieldDecorator('remark', {
                        initialValue: headerInfo.remark,
                        rules: [
                          {
                            max: 480,
                            message: intl.get('hzero.common.validation.max', { max: 480 }),
                          },
                        ],
                      })(<TextArea onChange={this.handleChangeFormItem} rows={2} />)
                    : headerInfo.remark}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <DisplayFormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.acceptListNum`).d('开票主体')}
                  value={headerInfo.invoiceBodyName}
                />
              </Col> */}
            </Row>
          </Form>
        </Spin>
      </React.Fragment>
    );
  }
}
