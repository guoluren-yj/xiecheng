/**
 * ElectTaxInvoiceLine.js - 我的应付/应收发票税务发票行
 * @date: 2020-09-14
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import { getAttachmentUrlWithToken } from '../../../utils/utils';
import styles from './Line.less';

const promptCode = 'sfin.invoiceBill';
const organizationId = getCurrentOrganizationId();

const indexDs = (invoiceHeaderId) => {
  return {
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'invoiceCode',
        label: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
      },
      {
        name: 'invoiceNumber',
        label: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
      },
      // {
      //   name: 'billingDate',
      //   type: 'date',
      //   label: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`).d('开票日期'),
      // },
      {
        name: 'totalAmount',
        label: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
      },
      {
        name: 'taxAmount',
        label: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
      },
      {
        name: 'taxIncludedAmount',
        label: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),
      },
      // {
      //   name: 'checkCode',
      //   label: intl.get(`${promptCode}.model.invoiceBill.nextSix`).d('检验码后6位'),
      // },
      {
        name: 'noDepositInvoiceTypeMeaning',
        label: intl.get(`sfin.inputInvoice.model.taxType`).d('发票类型'),
      },
      {
        label: intl.get(`${promptCode}.model.invoiceBill.xmlSourceFileUrl`).d('数电票XML文件下载'),
        name: 'xmlSourceFileUrl',
      },
      {
        label: intl.get(`${promptCode}.model.invoiceBill.ofdFileUrl`).d('ofd文件下载'),
        name: 'ofdFileUrl',
      },

      {
        name: 'invoiceDownloadLink',
        label: intl.get(`${promptCode}.model.invoiceBill.invoiceDownloadLink`).d('发票下载'),
      },
    ],
    transport: {
      /**
       * 查询
       */
      read: () => ({
        url: `${SRM_FINANCE}/v1/${organizationId}/tax-invoice-lines/list/${invoiceHeaderId}`,
        method: 'GET',
      }),
    },
  };
};

const ElectTaxInvoiceLine = ({
  invoiceHeaderId,
  remoteProps,
  routeSource,
  remoteCode,
  remoteBtnCode,
  fetchHeader,
  headerInfo,
}) => {
  const tableDs = useMemo(() => new DataSet(indexDs(invoiceHeaderId)), []);

  const columns = useMemo(() => [
    {
      name: 'invoiceCode',
      width: 150,
    },
    {
      name: 'invoiceNumber',
      width: 180,
    },
    // {
    //   name: 'billingDate',
    //   width: 120,
    // },
    {
      name: 'totalAmount',
      width: 150,
    },
    {
      name: 'taxAmount',
      width: 150,
    },
    {
      name: 'taxIncludedAmount',
      width: 150,
    },
    // {
    //   name: 'checkCode',
    //   width: 140,
    // },
    {
      name: 'noDepositInvoiceTypeMeaning',
      width: 150,
    },
    {
      name: 'xmlSourceFileUrl',
      width: 140,
      renderer: ({ value }) => {
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {intl.get('hzero.common.button.download').d('下载')}
          </a>
        ) : null;
      },
    },
    {
      name: 'ofdFileUrl',
      width: 140,
      renderer: ({ value }) => {
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {intl.get('hzero.common.button.download').d('下载')}
          </a>
        ) : null;
      },
    },
    {
      name: 'invoiceDownloadLink',
      width: 100,
      renderer: ({ value }) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {intl.get(`${promptCode}.model.invoiceBill.invoiceDownloadLink`).d('发票下载')}
          </a>
        ) : null,
    },
  ]);

  const columnsArr = useMemo(() => {
    return remoteProps?.process && remoteCode
      ? remoteProps.process(remoteCode, columns, {
          invoiceHeaderId,
          routeSource,
        })
      : columns;
  }, [remoteProps, columns, invoiceHeaderId, routeSource, remoteCode]);

  return (
    <div className={styles['purchase-application']}>
      <Form layout="inline">
        {remoteBtnCode && remoteProps?.process
          ? remoteProps.process(remoteBtnCode, [], {
              tableDs,
              fetchHeader,
              headerInfo,
            })
          : ''}
      </Form>
      <Table columns={columnsArr} dataSet={tableDs} />
    </div>
  );
};

export default formatterCollections({
  code: ['sfin.invoiceBill', 'sfin.inputInvoice'],
})(ElectTaxInvoiceLine);
