import React, { Component } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { connect } from 'dva';
import { Row, Col, Form, Input, Spin, InputNumber } from 'hzero-ui';
// import withCustomize from 'srm-front-cuz/lib/h0Customize'
import classnames from 'classnames';
import { thousandBitSeparator } from '@/routes/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';

// import ValueList from 'components/ValueList';

// import ValueList from 'components/ValueList';
import {
  // FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  // FORM_COL_2_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import styles from './../index.less';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SFIN.PAY_QUERY_DETAIL.HEADER'],
// })
export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  render() {
    const {
      maintainEditable = true,
      form = {},
      headerInfo = {},
      loading,
      customizeForm,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <React.Fragment>
        <Spin spinning={loading || false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {customizeForm(
            {
              code: 'SFIN.PAY_QUERY_DETAIL.HEADER',
              form,
              dataSource: headerInfo,
            },
            <Form className={styles['header-form']}>
              <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号')}>
                    {getFieldDecorator('paymentNum')(<span>{headerInfo.paymentNum}</span>)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`entity.company.tag`).d('公司')}>
                    {getFieldDecorator('companyName')(
                      <span>{headerInfo.companyName || headerInfo.supplierName}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.ouName`).d('业务实体')}>
                    {getFieldDecorator('ouName')(<span>{headerInfo.ouName}</span>)}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`entity.supplier.tag`).d('供应商')}>
                    {getFieldDecorator('supplierCompanyName')(
                      <span>{headerInfo.supplierCompanyName || headerInfo.supplierName}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl
                      .get(`sfin.payment.common.paymentSourceTypeCodeMeaning`)
                      .d('付款类型')}
                  >
                    {getFieldDecorator('paymentSourceTypeCodeMeaning')(
                      <span>{headerInfo.paymentSourceTypeCodeMeaning}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.bankName`).d('银行名称')}>
                    {getFieldDecorator('bankName')(<span>{headerInfo.bankName}</span>)}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                {...EDIT_FORM_ROW_LAYOUT}
                className={classnames(maintainEditable ? 'writable-row' : 'read-row')}
              >
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.bankBranchName`).d('开户行名称')}>
                    {getFieldDecorator('bankBranchName')(<span>{headerInfo.bankBranchName}</span>)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.bankAccountName`).d('账户名称')}>
                    {getFieldDecorator('bankAccountName')(
                      <span>{headerInfo.bankAccountName}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.acceptListTypeId`).d('银行账号')}>
                    {getFieldDecorator('bankAccountNum')(<span>{headerInfo.bankAccountNum}</span>)}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.sourceCode`).d('付款方式')}>
                    {getFieldDecorator('typeName')(<span>{headerInfo.typeName}</span>)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.paymentDate`).d('付款日期')}>
                    {getFieldDecorator('paymentDate')(
                      <span>{dateRender(headerInfo.paymentDate)}</span>
                    )}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.payMoney`).d('付款金额')}>
                    {getFieldDecorator('paymentAmount')(
                      <span>
                        {thousandBitSeparator(headerInfo.paymentAmount, headerInfo.amountPrecision)}
                      </span>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.currencyCode`).d('币种')}>
                    {getFieldDecorator('currencyCode')(<span>{headerInfo.currencyCode}</span>)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.createdate`).d('创建日期')}>
                    {getFieldDecorator('creationDate')(
                      <span>{dateTimeRender(headerInfo.creationDate)}</span>
                    )}
                  </Form.Item>
                </Col>

                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item label={intl.get(`sfin.payment.common.createdByName`).d('申请人')}>
                    {getFieldDecorator('createdByName')(<span>{headerInfo.createdByName}</span>)}
                  </Form.Item>
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
                      : getFieldDecorator('remark')(<span>{headerInfo.remark}</span>)}
                  </FormItem>
                </Col>
                {/* <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sfin.payment.common.advanceRatio`).d('本次预付比例')}
                  // {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  >
                    {getFieldDecorator('advanceRatio', {
                      initialValue: headerInfo.advanceRatio,
                    })(
                      <InputNumber
                        precision={headerInfo.amountPrecision}
                        // precision={precisionNum(
                        //   form.getFieldValue('advanceRatio'),
                        //   {
                        //     $form: form,
                        //     headerInfo.amountPrecision,
                        //   },
                        //   'advanceRatio'
                        // )}
                        max={100}
                        min={0}
                        formatter={(value) => `${value}%`}
                        parser={(value) => value.replace('%', '')}
                        allowThousandth
                      // style={{ width: '50%' }}
                      />
                    )}
                  </FormItem>
                </Col> */}
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    label={intl.get(`sfin.payment.common.advanceRatio`).d('本次预付比例')}
                    {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  >
                    {getFieldDecorator('advanceRatio', {
                      initialValue: headerInfo.advanceRatio,
                    })(
                      <InputNumber
                        precision={5}
                        max={100}
                        min={0}
                        formatter={(value) => `${value}%`}
                        parser={(value) => value?.replace('%', '')}
                        allowThousandth
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </Spin>
      </React.Fragment>
    );
  }
}
