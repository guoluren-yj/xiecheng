import React, { Fragment, useMemo, useEffect, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import queryString from 'querystring';
import { compose, isEmpty } from 'lodash';
import { useObserver } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import PrepaymentModal from './PrepaymentModal';
import { dateRangeTransform, btnsFormat } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import { paymentInvoiceDS as paymentInvoiceDs } from '@/stores/SupplySettleDS';
import { paymentInvoiceSupplyCreate } from '@/services/settlePoolServices';
import Styles from '@/routes/common.less';

const tenantId = getCurrentOrganizationId();

const PaymentInvoice = (props) => {
  const { customizeTable, history, customizeBtnGroup } = props;
  let modal;
  const searchBarRef = useRef({});
  const paymentInvoiceDS = useMemo(
    () =>
      new DataSet({
        ...paymentInvoiceDs(),
        events: {
          update: ({ value, record, name }) => {
            if (name === 'paymentAmount' && (value || value === 0)) {
              record.set(
                'paymentAmount',
                math.toFixed(value, Number(record.get('amountPrecision')))
              );
            }
          },
        },
      }),
    []
  );

  useEffect(() => {
    paymentInvoiceDS.setQueryParameter(
      'customizeUnitCode',
      'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_CREATE,SSTA.SUPPLY_SETTLE_LIST.SEARCH_BASE_INV'
    );
  }, []);

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = ({ params }) => {
    const reParams = paymentInvoiceDS.reParams || {};
    paymentInvoiceDS.queryDataSet.loadData([{ ...params, ...reParams }]);
    paymentInvoiceDS.query();
  };

  const columns = useMemo(
    () => [
      {
        name: 'settleNum',
        width: 180,
      },
      {
        width: 120,
        name: 'settleTypeMeaning',
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'netAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxIncludedAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'paidAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'remainingPaymentAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        width: 120,
        name: 'paymentAmount',
        editor: true,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        width: 150,
        name: 'applyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'campMeaning',
        width: 120,
      },
      {
        name: 'preCollectionWriteOff',
        header: intl.get(`ssta.supplySettle.button.preCollectionWriteOff`).d('预收款核销'),
        width: 120,
        renderer: ({ record }) =>
          record.get('taxIncludedAmount') < 0 ? null : (
            <a onClick={() => handlePrepayment(record)}>
              {intl.get(`ssta.supplySettle.button.preCollectionWriteOff`).d('预收款核销')}
            </a>
          ),
      },
    ],
    []
  );

  const handleSavePre = (data, topRecord) => {
    const totalApplyAmount = data
      .map((item) => item.applyAmount)
      .reduce((a = 0, b = 0) => a + b, 0);
    topRecord.set('applyAmount', totalApplyAmount);
    topRecord.set('settleApplyLineList', data);
    modal.close();
  };

  const handlePrepayment = (record) => {
    modal = Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: intl.get(`ssta.purchaseSettle.view.title.preCollectionWriteOff`).d('预收款核销'),
      children: <PrepaymentModal topRecord={record} onSavePre={handleSavePre} />,
      footer: null,
    });
  };

  const handleCreate = async () => {
    const flag = await paymentInvoiceDS.validate();
    if (flag) {
      const res = getResponse(await paymentInvoiceSupplyCreate(paymentInvoiceDS.toJSONData()));
      if (res) {
        notification.success();
        const list = res.map(({ settleHeaderId, settleNum }) => ({ settleHeaderId, settleNum }));
        history.push({
          pathname: '/ssta/supply-settle/detail',
          search: queryString.stringify({
            source: 'create',
            type: 'UPDATE',
            documentType: 'PAYMENT',
            list: JSON.stringify(list),
            activityField: 'settleHeaderId',
          }),
        });
      }
    }
  };

  const headerBtns = () => {
    const allBtns = useObserver(() => [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          icon: 'add',
          onClick: handleCreate,
          disabled: isEmpty(paymentInvoiceDS.selected),
        },
      },
    ]);
    return btnsFormat(allBtns);
  };

  return (
    <Fragment>
      <Header
        backPath="/ssta/supply-settle/list"
        title={intl
          .get(`ssta.supplySettle.view.title.createColBaseOnInvSettle`)
          .d('基于开票结算单新建收款单')}
      >
        {customizeBtnGroup(
          {
            code: 'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_HEADBTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtns()} />
        )}
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_CREATE',
          },
          <SearchBarTable
            searchCode="SSTA.SUPPLY_SETTLE_LIST.SEARCH_BASE_INV"
            dataSet={paymentInvoiceDS}
            columns={columns}
            queryBar="none"
            searchBarRef={(ref) => {
              searchBarRef.current = ref;
            }}
            searchBarConfig={{
              onQuery: handleQuery,
              onFieldChange: handleFieldChange,
              fieldProps: {
                supplierCompanyId: { lovPara: { tenantId } },
                currencyCode: { lovPara: { tenantId } },
                settleConfigNum: { lovPara: { tenantId } },
                creationDate: {
                  defaultValue: ({ record }) =>
                    dateRangeTransform(record.get('creationDateRange'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('creationDateRange') &&
                      record.get('creationDateRange') !== 'ALL TIME',
                  },
                },
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.purchaseSettle',
      'ssta.supplySettle',
      'ssta.common',
      'hzero.c7nProUI',
      'hzero.c7nProU',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_CREATE',
      'SSTA.SUPPLY_SETTLE_LIST.BASE_INVOICE_HEADBTNS',
    ],
  })
)(PaymentInvoice);
