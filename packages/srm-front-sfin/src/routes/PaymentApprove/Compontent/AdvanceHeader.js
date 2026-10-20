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
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import styles from './../index.less';
import {
  thousandBitSeparator,
  // precisionParams,
  // precisionNum,
} from '@/routes/utils';

const FormItem = Form.Item;
const { TextArea } = Input;
@Form.create({ fieldNameProp: null })
@connect(({ loading, acceptanceSheetCreate }) => ({
  fetchHeaderLoading: loading.effects['acceptanceSheetCreate/fetchHeader'],
  acceptanceSheetCreate,
}))
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.PAY_APPROVE_DETAIL.ADVANCE_HEADER'],
})
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
        <Spin spinning={loading} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          {customizeForm(
            {
              code: 'SFIN.PAY_APPROVE_DETAIL.ADVANCE_HEADER',
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
                    {getFieldDecorator('companyName')(<span>{headerInfo.companyName}</span>)}
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
                    label={intl.get(`sfin.payment.common.paymentSourceTypeCode`).d('付款类型')}
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
                  <Form.Item label={intl.get(`sfin.payment.common.creationDate`).d('创建日期')}>
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
                {/* <Col span={8}>
                <DisplayFormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.acceptListNum`).d('开票主体')}
                  value={headerInfo.invoiceBodyName}
                />
              </Col> */}
              </Row>
            </Form>
          )}
        </Spin>
      </React.Fragment>
    );
  }
}
