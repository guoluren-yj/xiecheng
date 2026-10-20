/**
 * InvoiceInfo - 开票
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, useCallback } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Content } from 'components/Page';

import FormField from '@/routes/components/FormField';

import styles from '../../index.less';

const InvoiceInfo = ({ dataSet, isEdit, changeReqId, invoiceInfo = {} }) => {
  const { remark, enableFieldList = [] } = invoiceInfo;

  useEffect(() => {
    handleQueryInvoice();
  }, [changeReqId]);

  const renderForm = () => {
    const dynamicDom = (
      <React.Fragment>
        {enableFieldList.map(item => {
          switch (item) {
            case 'receivePhone':
              return <FormField isEdit={isEdit} name="receivePhone" componentType="TEL" />;
            case 'bankAccountNum':
              return (
                <FormField
                  isEdit
                  border={isEdit}
                  readOnly={!isEdit}
                  displayOutput={!isEdit}
                  name="bankAccountNum"
                  componentType="SecretField"
                />
              );
            default:
              return <FormField isEdit={isEdit} name={item} />;
          }
        })}
      </React.Fragment>
    );
    return dynamicDom;
  };

  const handleQueryInvoice = useCallback(() => {
    if (changeReqId) {
      // 查询
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
  }, [changeReqId]);

  return (
    <Content>
      <div className={styles['certification-title']} id="spfm_company_invoice">
        {intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息')}
      </div>
      {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
      <Form
        dataSet={dataSet}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={classnames(styles['addon-before-style'], {
          'c7n-pro-vertical-form-display': !isEdit,
        })}
        style={{ width: '75%', maxWidth: 1172 }}
      >
        {renderForm()}
      </Form>
    </Content>
  );
};

export default InvoiceInfo;
