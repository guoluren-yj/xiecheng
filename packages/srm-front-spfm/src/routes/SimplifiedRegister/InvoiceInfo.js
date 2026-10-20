/**
 * InvoiceInfo - 开票
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, TextField, Select, Output, notification, SecretField } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { formatInternationalTel } from './utils';

import { fetchInvoiceInfo } from '@/services/invoiceInfoService';
import { fetchEnterpriseInfo } from '@/services/enterpriseService';

import styles from './index.less';

export default class InvoiceInfo extends Component {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleQueryInvoice();
  }

  @Bind()
  handleQueryInvoice(flag = true) {
    const { companyId, dataSet, isEdit, userInfo, domesticFlag, personalFlag } = this.props;
    if (companyId) {
      fetchEnterpriseInfo({ companyId }).then((res) => {
        if (getResponse(res)) {
          const {
            basic: {
              companyBasicId,
              companyName,
              unifiedSocialCode,
              addressDetail,
              businessRegistrationNumber,
              idNum,
            } = {},
          } = res;
          if (companyBasicId) {
            fetchInvoiceInfo({ companyId, companyBasicId }).then((invoiceResp) => {
              if (getResponse(invoiceResp)) {
                const { companyInvoiceId } = invoiceResp || {};
                if (companyInvoiceId) {
                  if (dataSet.current) {
                    dataSet.current.set({ ...invoiceResp });
                  } else {
                    dataSet.create({ ...invoiceResp });
                  }
                } else {
                  const { realName, phone, email, internationalTelCode } = userInfo || {};
                  const newData = {
                    invoiceHeader: companyName,
                    receivePhone: phone,
                    receiver: realName,
                    receiveMail: email,
                    internationalTelCode,
                    taxRegistrationAddress: addressDetail,
                    receiveAddress: addressDetail,
                  };
                  if (!domesticFlag) {
                    // 境外
                    newData.taxRegistrationNumber = businessRegistrationNumber;
                  } else if (!personalFlag && domesticFlag) {
                    // 境内
                    newData.taxRegistrationNumber = unifiedSocialCode;
                  } else if (personalFlag) {
                    // 个人
                    newData.taxRegistrationNumber = idNum;
                  }
                  if (dataSet.current) {
                    dataSet.current.set(newData);
                  } else {
                    dataSet.create(newData);
                  }
                }
                // 是否境内
                dataSet.setState('domesticFlag', !personalFlag && domesticFlag);
                if (!flag && isEdit) {
                  const {
                    bankAccountNum,
                    scbaBankAccountNum,
                    depositBank,
                    scbadepositBank,
                  } = invoiceResp;
                  if (scbaBankAccountNum || scbadepositBank) {
                    if (bankAccountNum !== scbaBankAccountNum || depositBank !== scbadepositBank) {
                      notification.info({
                        placement: 'bottomRight',
                        message: intl
                          .get('spfm.enterprise.model.invoice.validateBankInfo')
                          .d('您的银行主账户信息已变更，请注意是否修改开票信息的银行账户信息！'),
                      });
                    }
                  }
                }
              }
            });
          }
        }
      });
    }
  }

  render() {
    const { dataSet, isEdit } = this.props;

    return (
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={classnames(styles['addon-before-style'], {
          'c7n-pro-vertical-form-display': !isEdit,
        })}
        style={{ width: '75%', maxWidth: 1172 }}
      >
        {isEdit ? <TextField name="invoiceHeader" /> : <Output name="invoiceHeader" />}
        {isEdit ? (
          <TextField
            name="taxRegistrationNumber"
            // disabled={domesticFlag && !personalFlag}
          />
        ) : (
          <Output name="taxRegistrationNumber" />
        )}
        {isEdit ? <TextField name="depositBank" /> : <Output name="depositBank" />}
        <SecretField
          border={isEdit}
          readOnly={!isEdit}
          name="bankAccountNum"
          displayOutput={!isEdit}
        />
        {isEdit ? (
          <TextField name="taxRegistrationAddress" />
        ) : (
          <Output name="taxRegistrationAddress" />
        )}
        {isEdit ? (
          <TextField name="taxRegistrationPhone" />
        ) : (
          <Output name="taxRegistrationPhone" />
        )}
        {isEdit ? <TextField name="receiver" /> : <Output name="receiver" />}
        {isEdit ? <TextField name="receiveMail" /> : <Output name="receiveMail" />}
        {isEdit ? (
          <TextField
            addonBefore={<Select name="internationalTelCode" clearButton={false} />}
            name="receivePhone"
          />
        ) : (
          <Output
            name="receivePhone"
            renderer={({ record = {}, value }) => {
              const { data: { internationalTelMeaning } = {} } = record;
              return formatInternationalTel(internationalTelMeaning, value);
            }}
          />
        )}
        {isEdit ? <TextField name="receiveAddress" /> : <Output name="receiveAddress" />}
      </Form>
    );
  }
}
