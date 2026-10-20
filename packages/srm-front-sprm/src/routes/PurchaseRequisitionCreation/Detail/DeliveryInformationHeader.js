/**
 * DeliveryInformationHeader - 收货/收单信息
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

import LovModal from '../../components/Lov';
import styles from './index.less';
// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
const FormItem = Form.Item;
const commonPrompt = 'sprm.common.model.common';

/**
 * DeliveryInformationHeader - 收货/收单信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class DeliveryInformationHeader extends PureComponent {
  state = {
    dataSource: {},
  };

  componentDidMount = () => {
    const { headerRef = {} } = this.props;
    // const { getFieldDecorator = e => e } = headerForm;
    const dataSource = headerRef.getInfo();
    this.setState({ dataSource });
  };

  @Bind()
  handleChangeAddress(record, invoiceAddressName) {
    const {
      headerForm: { setFieldsValue = e => e, registerField = e => e },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    if (record) {
      const { contactName, mobile, email } = record[0];
      registerField('invoiceAddress');
      setFieldsValue({
        invoiceContactName: contactName,
        invoiceTelNum: mobile,
        invoiceAddress: invoiceAddressName,
        receiverEmailAddress: email,
      });
      headerRef.setState({
        ...dataSource,
        invoiceAddress: invoiceAddressName,
      });
    }
  }

  // 新商城
  @Bind()
  newMallchangeAddress(value, lovRecord) {
    const {
      headerForm: { setFieldsValue = e => e, registerField = e => e },
      headerRef,
    } = this.props;
    const dataSource = headerRef.getInfo();
    if (value) {
      const { contactName, mobile, email, fullAddress } = lovRecord;
      registerField('invoiceAddress');
      setFieldsValue({
        invoiceContactName: contactName,
        invoiceTelNum: mobile,
        invoiceAddress: fullAddress,
        receiverEmailAddress: email,
      });
      const newData = {
        ...dataSource,
        invoiceAddressName: fullAddress,
        invoiceContactName: contactName,
        invoiceTelNum: mobile,
        receiverEmailAddress: email,
      };

      headerRef.setState(
        {
          ...dataSource,
          invoiceAddressName: fullAddress,
        },
        () => {
          this.setState({ dataSource: newData });
        }
      );
    }
  }

  render() {
    const { headerForm = {}, EComAndRejectDisabled, customizeForm } = this.props;
    const { getFieldDecorator = e => e } = headerForm;
    const { dataSource } = this.state;
    const {
      receiverAddressName,
      receiverContactName,
      internationalTelCode,
      receiverTelNum,
      invoiceAddressId,
      invoiceContactName,
      invoiceTelNum,
      receiverEmailAddress,
      invoiceAddressName,
      companyId,
      newMallFlag = 0,
      purchaseUnitName,
      prStatusCode,
    } = dataSource;
    const renderFlag = !['PENDING', 'REJECTED', 'SEND_BACK'].includes(prStatusCode);

    return customizeForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CREATION.DELIVERYINFO',
        dataSource,
        form: headerForm,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverAddress`).d('收货方地址')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverAddressName', { initialValue: receiverAddressName })(
                <span> {receiverAddressName}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('receiverContactName', { initialValue: receiverContactName })(
                <span> {receiverContactName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverTelNum', { initialValue: receiverTelNum })(
                <span>
                  {receiverTelNum ? `${internationalTelCode || ''} ${receiverTelNum}` : ''}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(
            EComAndRejectDisabled ? 'read-half-row' : 'half-row',
            styles['invoice-address']
          )}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址')}>
              {getFieldDecorator('invoiceAddressId', {
                initialValue: invoiceAddressId,
                rules: [
                  {
                    required: !EComAndRejectDisabled,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址'),
                    }),
                  },
                ],
              })(
                EComAndRejectDisabled || renderFlag ? (
                  <span>{invoiceAddressName}</span>
                ) : newMallFlag ? (
                  <Lov
                    code="SMAL.INVOICE_ADDRESS_LIST"
                    queryParams={{
                      addressType: 'INVOICE',
                      companyId,
                      enabledFlag: 1,
                      belongType: 1,
                    }}
                    disabled={EComAndRejectDisabled}
                    textValue={invoiceAddressName}
                    onChange={(value, invoiceAddress) =>
                      this.newMallchangeAddress(value, invoiceAddress)
                    }
                  />
                ) : (
                  <LovModal
                    newMallFlag={newMallFlag}
                    disabled={EComAndRejectDisabled}
                    textValue={invoiceAddressName}
                    onChange={(value, invoiceAddress) =>
                      this.handleChangeAddress(value, invoiceAddress)
                    }
                    queryParams={{ companyId }}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceContactName', { initialValue: invoiceContactName })(
                <span> {invoiceContactName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceTelNum', { initialValue: invoiceTelNum })(
                <span>{invoiceTelNum || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.purchaseUnitName`).d('收货方组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseUnitName', { initialValue: purchaseUnitName })(
                <span>{purchaseUnitName}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-half-row', 'last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverEmailAddress', { initialValue: receiverEmailAddress })(
                <span>{receiverEmailAddress}</span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
