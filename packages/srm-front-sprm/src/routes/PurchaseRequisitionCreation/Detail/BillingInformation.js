/*
 * BillingInformation - 开票信息
 * @date: 2019-01-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import {
  fetchInvoiceLov,
  fetchInvoiceTitleLov,
  fetchInvoiceDetailLov,
} from '@/services/purchaseRequisitionCreationService';

// import DisplayFormItem from '../../components/DisplayFormItem';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
const FormItem = Form.Item;

const commonPrompt = 'sprm.common.model.common';

/**
 * BillingInformation - 开票信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class BillingInformation extends PureComponent {
  constructor(props) {
    super(props);
    const {
      headerRef: { getInfo = (e) => e },
      onRef,
    } = this.props;
    if (onRef) {
      props.onRef(this);
    }
    const { invoiceTypeCode = '' } = getInfo();
    this.state = {
      invoiceDisabled: invoiceTypeCode === 'VAT_SPECIAL_INVOICE' || false,
    };
  }

  componentDidMount() {
    const lovCode = 'SMAL.EC_CLIENT_VALUES';
    const {
      headerRef: { getInfo = (e) => e },
    } = this.props;
    const { companyId, tenantId, platformCode } = getInfo();
    Promise.all([
      fetchInvoiceLov({
        lovCode: 'SMAL.EC_INVOICE_METHOD_TYPE_VAL',
        companyId,
        tenantId,
        valueType: 'INVOICE_TYPE',
        platformCode,
      }),
      fetchInvoiceTitleLov({
        lovCode,
        companyId,
        tenantId,
        valueType: 'INVOICE_TITLE',
        platformCode,
      }),
      fetchInvoiceDetailLov({
        lovCode,
        companyId,
        tenantId,
        valueType: 'INVOICE_DETAIL',
        platformCode,
      }),
      fetchInvoiceLov({
        lovCode: 'SMAL.EC_INVOICE_METHOD_TYPE_VAL',
        companyId,
        tenantId,
        valueType: 'INVOICE_METHOD',
        platformCode,
      }),
    ]).then((res) => {
      if (res) {
        this.setState({
          invoiceTitleType: res[0] ? res[0] : [],
          invoiceType: res[1] ? res[1].content : [],
          invoiceDetail: res[2] ? res[2].content : [],
          invoiceMethod: res[3] ? res[3] : [],
        });
      }
    });
  }

  getData = () => {
    const { form } = this.props;
    const lineErrs = Object.values(form.getFieldsError()).filter((item) => isArray(item));
    if (lineErrs.length > 0) {
      return { error: 1, lineErrs };
    } else {
      return form.getFieldsValue();
    }
  };

  /**
   * 发票形式
   * @param value
   */
  @Bind()
  handleChangeInvoiceType(value) {
    const {
      form: { setFieldsValue, registerField },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    const { invoiceType, invoiceDetail } = this.state;
    //  const { invoiceDetailType = [] } = detailEnumMap;
    // 取出唯一code判断是否为增专发票Code为2默认详情为1
    // const invoiceTypeCode = value
    //   ? invoiceType.find(item => item.valueId === value).valueCode
    //   : '';
    const invoiceTitleTypeName = value
      ? invoiceType.find((item) => item.valueCode === value).valueName
      : '';
    registerField('invoiceTitleTypeName');
    setFieldsValue({ invoiceTitleTypeName, invoiceTitleTypeCode: value });
    if (value === '2') {
      headerRef.setState({
        headerInfo: {
          ...dataSource,
          invoiceDetailTypeCode: '1',
          invoiceDetailTypeName: invoiceDetail.find((item) => item.valueCode === '1').valueName,
        },
      });
      this.setState({ invoiceDisabled: true });
    } else {
      headerRef.setState({
        headerInfo: {
          ...dataSource,
          invoiceDetailTypeCode: undefined,
          invoiceDetailTypeName: undefined,
        },
      });
      setFieldsValue({ invoiceDetailTypeCode: undefined, invoiceTitleTypeCode: undefined });
      this.setState({ invoiceDisabled: false });
    }
  }

  /**
   * 发票抬头类型
   * @param value
   */
  @Bind()
  handleChangeInvoiceTitle(value) {
    const {
      form: { registerField, setFieldsValue },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    const { invoiceTitleType = [] } = this.state;
    const invoiceTypeName = value
      ? invoiceTitleType.find((item) => item.valueCode === value).valueName
      : '';
    registerField('invoiceTypeName');
    setFieldsValue({ invoiceTypeName, invoiceTypeCode: value });
    headerRef.setState({
      headerInfo: { ...dataSource, invoiceTypeName, invoiceTypeCode: value },
    });
  }

  /**
   * 开票方式
   * @param value
   */
  @Bind()
  handleChangeInvoiceMethod(value) {
    const {
      form: { registerField, setFieldsValue },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    const { invoiceMethod = [], invoiceDisabled } = this.state;
    const invoiceMethodName = value
      ? invoiceMethod.find((item) => item?.valueCode === value)?.valueName
      : '';
    registerField('invoiceMethodName');
    setFieldsValue({ invoiceMethodName, invoiceMethodCode: value });
    headerRef.setState({
      headerInfo: { ...dataSource, invoiceMethodName, invoiceMethodCode: value },
    });
    this.setState({ invoiceDisabled: !!invoiceDisabled });
  }

  /**
   * 发票明细
   * @param value
   */
  @Bind()
  handleChangeInvoiceDetail(value) {
    const {
      form: { registerField, setFieldsValue },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    const { invoiceDetail = [] } = this.state;
    const invoiceDetailTypeName = value
      ? invoiceDetail.find((item) => item.valueCode === value).valueName
      : '';
    registerField('invoiceDetailTypeName');
    setFieldsValue({ invoiceDetailTypeName, invoiceDetailTypeCode: value });
    headerRef.setState({
      headerInfo: { ...dataSource, invoiceDetailTypeName, invoiceDetailTypeCode: value },
    });
  }

  render() {
    const { invoiceDisabled } = this.state;
    const { EComAndRejectDisabled, headerRef = {}, form } = this.props;
    const {
      invoiceType = [],
      invoiceTitleType = [],
      invoiceDetail = [],
      invoiceMethod = [],
    } = this.state;
    const dataSource = headerRef.getInfo();
    const { getFieldDecorator = (e) => e } = form;
    const {
      invoiceTitle,
      taxRegisterNum,
      taxRegisterAddress,
      taxRegisterBank,
      taxRegisterBankAccount,
      taxRegisterTel,
      invoiceDetailTypeName,
      invoiceTitleTypeName,
      invoiceTypeName,
      invoiceMethodName,
      invoiceTypeCode,
      invoiceMethodCode,
      invoiceDetailTypeCode,
      invoiceTitleTypeCode,
      prStatusCode,
    } = dataSource;
    const renderFlag = !['PENDING', 'REJECTED', 'SEND_BACK'].includes(prStatusCode);
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceTitle`).d('发票抬头')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceTitle', { initialValue: invoiceTitle })(
                <span> {invoiceTitle}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号')}
            >
              {getFieldDecorator('taxRegisterNum', { initialValue: taxRegisterNum })(
                <span> {taxRegisterNum}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址')}
            >
              {getFieldDecorator('taxRegisterAddress', { initialValue: taxRegisterAddress })(
                <span>{taxRegisterAddress}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.taxRegisterTel`).d('公司电话')}
            >
              {getFieldDecorator('taxRegisterTel', { initialValue: taxRegisterTel })(
                <span>{taxRegisterTel}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行')}
            >
              {getFieldDecorator('taxRegisterBank', { initialValue: taxRegisterBank })(
                <span> {taxRegisterBank}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号')}
            >
              {getFieldDecorator('taxRegisterBankAccount', {
                initialValue: taxRegisterBankAccount,
              })(<span> {taxRegisterBankAccount}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row
          className={EComAndRejectDisabled ? 'read-row' : 'writable-row'}
          {...EDIT_FORM_ROW_LAYOUT}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            {
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式')}
              >
                {getFieldDecorator('invoiceMethodCode', {
                  initialValue: invoiceMethodCode,
                  rules: [
                    {
                      required: !EComAndRejectDisabled,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式'),
                      }),
                    },
                  ],
                })(
                  EComAndRejectDisabled || renderFlag ? (
                    <span> {invoiceMethodName}</span>
                  ) : (
                    <Select
                      showSearch
                      allowClear
                      disabled={EComAndRejectDisabled}
                      onChange={(val) => this.handleChangeInvoiceMethod(val)}
                    >
                      {invoiceMethod?.map((item) => (
                        <Select.Option key={item.valueCode} value={item.valueCode}>
                          {item.valueName}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                )}
              </FormItem>
            }
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式')}
            >
              {getFieldDecorator('invoiceTitleTypeCode', {
                initialValue: invoiceTitleTypeCode,
                rules: [
                  {
                    required: !EComAndRejectDisabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式'),
                    }),
                  },
                ],
              })(
                EComAndRejectDisabled || renderFlag ? (
                  <span> {invoiceTitleTypeName}</span>
                ) : (
                  <Select
                    showSearch
                    allowClear
                    disabled={EComAndRejectDisabled}
                    onChange={this.handleChangeInvoiceType}
                  >
                    {invoiceType?.map((item) => (
                      <Select.Option key={item.valueCode} value={item.valueCode}>
                        {item.valueName}
                      </Select.Option>
                    ))}
                  </Select>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.invoiceType`).d('发票类型')}
            >
              {getFieldDecorator('invoiceTypeCode', {
                initialValue: invoiceTypeCode,
                rules: [
                  {
                    required: !EComAndRejectDisabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
                    }),
                  },
                ],
              })(
                EComAndRejectDisabled || renderFlag ? (
                  <span>{invoiceTypeName}</span>
                ) : (
                  <Select
                    showSearch
                    allowClear
                    disabled={EComAndRejectDisabled}
                    onChange={this.handleChangeInvoiceTitle}
                  >
                    {invoiceTitleType?.map((item) => (
                      <Select.Option key={item.valueCode} value={item.valueCode}>
                        {item.valueName}
                      </Select.Option>
                    ))}
                  </Select>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row
          className={classnames(
            'last-form-item',
            EComAndRejectDisabled || invoiceDisabled ? 'read-row' : 'writable-row'
          )}
          {...EDIT_FORM_ROW_LAYOUT}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            {
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细')}
                className="last-form-item"
              >
                {getFieldDecorator('invoiceDetailTypeCode', {
                  initialValue: invoiceDetailTypeCode,
                  rules: [
                    {
                      required: !EComAndRejectDisabled,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
                      }),
                    },
                  ],
                })(
                  EComAndRejectDisabled || invoiceDisabled || renderFlag ? (
                    <span>{invoiceDetailTypeName}</span>
                  ) : (
                    <Select
                      showSearch
                      allowClear
                      disabled={EComAndRejectDisabled || invoiceDisabled}
                      onChange={this.handleChangeInvoiceDetail}
                    >
                      {invoiceDetail?.map((item) => (
                        <Select.Option key={item.valueCode} value={item.valueCode}>
                          {item.valueName}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                )}
              </FormItem>
            }
          </Col>
        </Row>
      </Form>
    );
  }
}
