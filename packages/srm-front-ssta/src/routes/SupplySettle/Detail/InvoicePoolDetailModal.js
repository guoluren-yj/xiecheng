/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useEffect, useMemo } from 'react';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import CollapseForm from '_components/CollapseForm';
import { decimalPointAccuracy } from '@/routes/utils';
// eslint-disable-next-line
import { DataSet, Table, Form, Output } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import intl from 'utils/intl';
import { Content } from 'components/Page';

import { formDs, tableDs } from './mainDS';

// import { taxLineDS as taxLineDs } from ;

const InvoicePoolDetailModal = (props) => {
  const { invoiceHeaderId } = props;

  const tableDS = useMemo(() => new DataSet(tableDs()), []);
  const formDS = useMemo(() => new DataSet(formDs()), []);

  // const taxLineDS = useMemo(() => {
  //   return new DataSet(taxLineDs());
  // }, []);
  const [Loading, setLoading] = React.useState(true);

  useEffect(() => {
    tableDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    formDS.setQueryParameter('invoiceHeaderId', invoiceHeaderId);
    tableDS.query();
    // formDS.query();
    formDS.query().then((res) => {
      // eslint-disable-next-line
      for (const item in res) {
        // eslint-disable-next-line
        formDS.current?.set(`${item}`, res[item] || '-');
      }
    });
    setLoading(false);
  }, []);

  const listColumns = [
    {
      name: 'lineNum',
      width: 150,
    },
    {
      name: 'itemName',
      width: 240,
    },
    {
      name: 'netAmount',
      width: 150,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'quantity',
      width: 150,
    },

    {
      name: 'taxRate',
      width: 150,
    },

    {
      name: 'taxAmount',
      width: 150,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'taxIncludedPrice',
      width: 150,
    },
    {
      name: 'taxIncludedAmount;',
      width: 150,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'netPrice',
      width: 150,
    },

    {
      name: 'spec',
      width: 150,
    },

    {
      name: 'uom',
      width: 150,
    },
    // {
    //   name: 'expenseItem',
    //   width: 150,
    // },
    {
      name: 'plateNo',
      width: 150,
    },
    {
      name: 'trafficType',
      width: 150,
    },
    {
      name: 'trafficDateStart',
      width: 150,
    },
    {
      name: 'trafficDateEnd',
      width: 150,
    },
  ];

  return (
    <>
      <Content>
        <Spin spinning={Loading}>
          <h3>{intl.get(`ssta.costSheet.view.message.panel.baseInfoss`).d('发票头信息')}</h3>
          {/* {customizeForm(
              { code: 'SSTA.COST_SHEET_DETAIL.BASIC', readOnly: !editFlag }, */}
          <Form
            dataSet={formDS}
            useColon={false}
            columns={3}
            labelAlign="left"
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="invoiceCode" />
            <Output name="invoiceNum" />
            <Output name="invoicingDate" />
            <Output name="invoiceTypeMeaning" />
            <Output name="sumCheckTimes" />
            <Output name="checkTimes" />
            <Output name="checkCode" />
            <Output name="supplierCompanyName" />
            <Output name="supUnifiedSocialCode" />
            <Output name="supAccount" />
            <Output name="supAddrAndTel" />
          </Form>

          <CollapseForm
            wrapperClassName="ssta-pool-detail"
            labelLayout="vertical"
            useColon={false}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
            dataSet={formDS}
            showLines={0}
            columns={3}
            unExpandTExt={intl.get(`ssta.costSheet.view.message.panel.expend`).d('更多')}
          >
            <Output name="machineNum" disabled />
            <Output name="companyName" disabled />
            <Output name="purUnifiedSocialCode" clearButton={false} disabled />
            <Output name="purAccount" disabled />
            <Output name="purAddrAndTel" clearButton={false} disabled />
            <Output name="netAmount" disabled />
            <Output name="taxAmount" disabled />
            <Output name="taxIncludedAmount" disabled />
            <Output name="zeroTaxRateFlag" disabled />
            <Output name="tollFlag" disabled />
            <Output name="invalidFlagMeaning" disabled />
            <Output name="drawer" disabled />
            <Output name="payee" disabled />
            <Output name="reviewer" disabled />
            <Output name="blueInvoiceNum" disabled />
            <Output name="blueInvoiceCode" disabled />
            <Output name="fileUrl" disabled />
            <Output name="remark" disabled />
          </CollapseForm>

          <h3 style={{ marginTop: '20px' }}>
            {intl.get(`ssta.invoiceSheet.view.message.panel.transactiossnDetails`).d('发票行信息')}
          </h3>
          <Table columns={listColumns} dataSet={tableDS} selectionMode="none" />
        </Spin>
        {/* <SstaAnchor linkList={linkList} /> */}
      </Content>
    </>
  );
  // return <Table columns={listColumns} dataSet={tableDs} />;
};

export default compose(
  formatterCollections({
    code: [
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.settlePool',
      'sbud.budgeting',
      'hzero.common',
    ],
  })
)(InvoicePoolDetailModal);
