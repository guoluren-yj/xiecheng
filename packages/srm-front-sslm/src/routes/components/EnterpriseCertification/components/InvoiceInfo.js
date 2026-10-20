/**
 * InvoiceInfo - 开票
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment, useMemo } from 'react';
import { Form } from 'choerodon-ui/pro';
import classnames from 'classnames';

import FormField from '@/routes/components/FormField';
import styles from '../index.less';

const InvoiceInfo = ({ dataSet, invoiceInfo = {}, sourceKey }) => {
  const { enableFieldList = [] } = invoiceInfo;
  const isEdit = useMemo(() => sourceKey !== 'platformApprove', [sourceKey]);

  const renderForm = () => {
    const dynamicDom = (
      <React.Fragment>
        {enableFieldList.map(item => {
          switch (item) {
            case 'receivePhone':
              return <FormField isEdit={false} name="receivePhone" componentType="TEL" />;
            case 'bankAccountNum':
              return (
                <FormField
                  readOnly
                  displayOutput
                  border={false}
                  name="bankAccountNum"
                  isEdit={isEdit}
                  componentType="SecretField"
                />
              );
            default:
              return <FormField isEdit={false} name={item} />;
          }
        })}
      </React.Fragment>
    );
    return dynamicDom;
  };

  return (
    <Fragment>
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout="vertical"
        className={classnames(styles['addon-before-style'], {
          'c7n-pro-vertical-form-display': true,
        })}
        style={{ width: '75%', maxWidth: 1172 }}
      >
        {renderForm()}
      </Form>
    </Fragment>
  );
};

export default InvoiceInfo;
