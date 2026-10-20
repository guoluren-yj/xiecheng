/**
 * 企业信息 - 开票信息
 * @date: 2018-7-15
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Spin, Col } from 'hzero-ui';
import { DataSet, Form, TextField, Row, Select } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import InvoiceDS from '../store/InvoiceDS';

const isTeant = isTenantRoleLevel();

@connect(({ invoiceInfo, loading }) => ({
  invoiceInfo,
  fetchLoading:
    loading.effects['invoiceInfo/fetchInvoiceInfo'] ||
    loading.effects['invoiceInfo/queryCompanyInvoice'],
}))
export default class InvoiceList extends PureComponent {
  state = {};

  InvoiceDS = new DataSet({
    ...InvoiceDS(this.props.company.companyName, this.props.company.unifiedSocialCode),
    autoQuery: false,
    fields: [
      {
        name: 'invoiceHeader',
        defaultValue: this.props.company.companyName,
        type: 'string',
        label: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
      },
      {
        name: 'taxRegistrationNumber',
        defaultValue: this.props.company.unifiedSocialCode,
        type: 'string',
        label: intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号'),
      },
      {
        name: 'depositBank',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        label: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
      },
      {
        name: 'bankAccountNum',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        label: intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号'),
      },
      {
        name: 'taxRegistrationAddress',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        label: intl.get('spfm.enterprise.model.invoice.taxRegistrationAddress').d('税务登记地址'),
      },
      {
        name: 'taxRegistrationPhone',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        label: intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话'),
      },
      {
        name: 'receiver',
        label: intl.get('spfm.enterprise.model.invoice.receiver').d('收票人'),
      },
      {
        name: 'receiveMail',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        pattern: EMAIL,
        label: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
      },
      {
        name: 'objectVersionNumber',
        type: 'string',
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        name: 'receivePhone',
        type: 'string',
        // required: !isTeant && this.props.company.domesticForeignRelation === 1,
        dynamicProps: ({ record }) => {
          return {
            pattern:
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
          };
        },
        label: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
      },
      {
        name: 'receiveAddress',
        label: intl.get('spfm.enterprise.model.invoice.receiveAddress').d('收票地址'),
      },
    ],
  });

  /**
   * 挂载后执行方法
   */
  componentWillMount() {
    const { dispatch, companyId, company, onRef } = this.props;
    const {
      companyBasicId,
      companyName,
      unifiedSocialCode,
      addressDetail,
      businessRegistrationNumber,
      domesticForeignRelation,
    } = company;
    const { init } = this.state;
    if (companyBasicId && companyId && companyId !== 'undefined') {
      if (onRef) onRef(this);
      const payload = {
        companyId,
      };
      if (isTeant) {
        dispatch({
          type: 'invoiceInfo/queryCompanyInvoice',
          payload,
        }).then((res) => {
          if (res) {
            const { bankAccountNum, scbaBankAccountNum, scbadepositBank, depositBank } = res;
            this.InvoiceDS.loadData([]);
            const newTaxRegistrationNumber = domesticForeignRelation
              ? unifiedSocialCode
              : businessRegistrationNumber;
            this.InvoiceDS.create({
              ...res,
              invoiceHeader: res.invoiceHeader || companyName,
              taxRegistrationNumber: res.taxRegistrationNumber || newTaxRegistrationNumber,
              taxRegistrationAddress: res.taxRegistrationAddress || addressDetail,
              receiveAddress: res.receiveAddress || addressDetail,
              depositBank: depositBank || scbadepositBank,
              bankAccountNum: bankAccountNum || scbaBankAccountNum,
            });
            this.setState({
              init: !init,
            });
          }
        });
      } else {
        dispatch({
          type: 'invoiceInfo/fetchInvoiceInfo',
          payload: {
            ...payload,
            companyBasicId,
          },
        }).then((res1) => {
          const { bankAccountNum, scbaBankAccountNum, scbadepositBank, depositBank } = res1;
          this.InvoiceDS.loadData([]);
          this.InvoiceDS.create({
            ...res1,
            invoiceHeader: res1.invoiceHeader || companyName,
            taxRegistrationNumber: res1.taxRegistrationNumber || unifiedSocialCode,
          });
          this.setState({
            init: !init,
          });
          if (scbaBankAccountNum || scbadepositBank) {
            if (bankAccountNum !== scbaBankAccountNum || depositBank !== scbadepositBank) {
              notification.info({
                message: intl
                  .get('spfm.enterprise.model.invoice.validateBankInfo')
                  .d('您的银行主账户信息已变更，请注意是否修改开票信息的银行账户信息！'),
              });
            }
          }
        });
      }
    }
  }

  /**
   * 进行下一步时保存当前页面数据
   */
  @Bind()
  async saveAndNext() {
    const { companyId, dispatch, callback, invoiceInfo = {} } = this.props;
    const { companyInvoiceId } = invoiceInfo;
    const flag = await this.InvoiceDS.current.validate(true);
    const record = this.InvoiceDS.current;
    if (flag) {
      const fieldsValue = record.toData();
      const payload = {
        ...invoiceInfo,
        companyId,
        internationalTelCode: fieldsValue.internationalTelCode,
        invoiceHeader: fieldsValue.invoiceHeader,
        taxRegistrationNumber: fieldsValue.taxRegistrationNumber,
        depositBank: fieldsValue.depositBank,
        bankAccountNum: fieldsValue.bankAccountNum,
        taxRegistrationAddress: fieldsValue.taxRegistrationAddress,
        taxRegistrationPhone: fieldsValue.taxRegistrationPhone,
        receiver: fieldsValue.receiver,
        receiveMail: fieldsValue.receiveMail,
        receivePhone: fieldsValue.receivePhone,
        receiveAddress: fieldsValue.receiveAddress,
        objectVersionNumber: fieldsValue.objectVersionNumber,
      };
      dispatch({
        type: companyInvoiceId ? 'invoiceInfo/updateInvoiceInfo' : 'invoiceInfo/createInvoiceInfo',
        payload,
      }).then((res) => {
        if (res) {
          if (callback) {
            callback(res);
          }
        }
      });
    }
  }

  /**
   * 返回上一步
   */
  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      updating,
      saving,
      fetchLoading = false,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
      previousCallback,
      company,
    } = this.props;
    const { domesticForeignRelation } = company;
    const record = this.InvoiceDS.current;
    return (
      <Spin spinning={fetchLoading}>
        <Form record={record} labelLayout="float">
          <Row>
            <TextField name="invoiceHeader" style={{ width: '400px' }} disabled />
          </Row>
          <Row>
            <TextField
              name="taxRegistrationNumber"
              style={{ width: '400px' }}
              disabled={domesticForeignRelation === 1}
            />
          </Row>
          <Row>
            <TextField name="depositBank" style={{ width: '400px' }} />
          </Row>
          <Row>
            <TextField name="bankAccountNum" style={{ width: '400px' }} />
          </Row>
          <Row>
            <TextField name="taxRegistrationAddress" style={{ width: '400px' }} />
          </Row>
          <Row>
            <TextField name="taxRegistrationPhone" style={{ width: '400px' }} />
          </Row>
          <Row>
            <TextField name="receiver" style={{ width: '400px' }} />
          </Row>
          <Row>
            <TextField name="receiveMail" style={{ width: '400px' }} />
          </Row>
          <Row>
            <Select clearButton={false} name="internationalTelCode" style={{ width: '150px' }} />
            <TextField name="receivePhone" style={{ width: '250px' }} />
          </Row>
          <Row>
            <TextField name="receiveAddress" style={{ width: '400px' }} />
          </Row>
          <Row style={{ marginTop: 40, textAlign: 'right' }}>
            <Col span={8}>
              {previousCallback && (
                <Button
                  type="primary"
                  ghost
                  onClick={this.handlePrevious}
                  style={{ marginRight: 16 }}
                >
                  {backBtnText}
                </Button>
              )}
              <Button type="primary" onClick={this.saveAndNext} loading={updating || saving}>
                {buttonText}
              </Button>
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  }
}
