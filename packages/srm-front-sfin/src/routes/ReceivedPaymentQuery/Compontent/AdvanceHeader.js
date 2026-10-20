import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { Row, Col, Form, Input, Spin } from 'hzero-ui';
import classnames from 'classnames';
import { dateTimeRender, dateRender } from 'utils/renderer';
// import ValueList from 'components/ValueList';

// import ValueList from 'components/ValueList';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  // FORM_COL_2_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './../index.less';

import DisplayFormItem from '../../components/DisplayFormItem';
import { thousandBitSeparator } from '@/routes/utils';

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
    this.state = {};
  }

  render() {
    const { maintainEditable = true, form = {}, headerInfo = {}, loading } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <React.Fragment>
        <Spin spinning={loading || false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Form className={styles['header-form']}>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.ReceivedpayNo`).d('收款申请单号')}
                  value={headerInfo.paymentNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.clintConpany`).d('客户公司')}
                  value={headerInfo.companyName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                {/* <Form.Item label={intl.get(`sfin.payment.common.ouName`).d('业务实体')}>
                  {getFieldDecorator('ouName')(<span>{headerInfo.ouName}</span>)}
                </Form.Item> */}
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
                  value={headerInfo.supplierCompanyName || headerInfo.supplierName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.deceivedPayType`).d('收款类型')}
                  value={headerInfo.paymentSourceTypeCodeMeaning}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.bankName`).d('银行名称')}
                  value={headerInfo.bankName}
                />
              </Col>
            </Row>
            <Row
              {...EDIT_FORM_ROW_LAYOUT}
              className={classnames(maintainEditable ? 'writable-row' : 'read-row')}
            >
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.bankBranchName`).d('开户行名称')}
                  value={headerInfo.bankBranchName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.bankAccountName`).d('账户名称')}
                  value={headerInfo.bankAccountName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.acceptListTypeId`).d('银行账号')}
                  value={headerInfo.bankAccountNum}
                />
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.receivedPayType`).d('收款方式')}
                  value={headerInfo.typeName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.receivedPaymentDate`).d('收款日期')}
                  value={dateRender(headerInfo.paymentDate)}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.receivedPay`).d('收款金额')}
                  value={thousandBitSeparator(headerInfo.paymentAmount, headerInfo.amountPrecision)}
                />
              </Col>
            </Row>

            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.currencyCode`).d('币种')}
                  value={headerInfo.currencyCode}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.createdate`).d('创建日期')}
                  value={dateTimeRender(headerInfo.creationDate)}
                />
              </Col>

              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.payment.common.createdByName`).d('申请人')}
                  value={headerInfo.createdByName}
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
