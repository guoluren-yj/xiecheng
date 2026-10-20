import React, { Fragment, useMemo, useEffect, useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { useObserver } from 'mobx-react';
import queryString from 'querystring';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import PrepaymentModal from './PrepaymentModal';
import { dateRangeTransform, btnsFormat } from '@/utils/utils';
import { decimalPointAccuracy } from '@/routes/utils';
import { paymentInvoiceCreate } from '@/services/settlePoolServices';
import { paymentInvoiceDS as paymentInvoiceDs } from '@/stores/PurchaseSettleDS';
import Styles from '@/routes/common.less';

const tenantId = getCurrentOrganizationId();

const PaymentInvoice = (props) => {
  const { customizeTable, history, customizeBtnGroup } = props;
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
    // 给查询表单添加监控事件
    paymentInvoiceDS.setQueryParameter(
      'customizeUnitCode',
      'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_CREATE,SSTA.PURCHASE_SETTLE_LIST.SEARCH_BASE_INV'
    );
  }, []);

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
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
        name: 'prePaymentWriteOff',
        header: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        width: 120,
        renderer: ({ record }) =>
          record.get('taxIncludedAmount') > 0 ? (
            <a onClick={() => handlePrepayment(record)}>
              {intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销')}
            </a>
          ) : null,
      },
    ],
    []
  );

  const handleSavePre = (data, topRecord) => {
    const totalApplyAmount = data
      .map((item) => item.applyAmount)
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    topRecord.set('applyAmount', totalApplyAmount);
    topRecord.set('settleApplyLineList', data);
  };

  const handlePrepayment = (record) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: intl.get(`ssta.purchaseSettle.view.title.prePaymentWriteOff`).d('预付款核销'),
      children: <PrepaymentModal topRecord={record} onSavePre={handleSavePre} />,
      footer: null,
    });
  };

  const handleCreate = async () => {
    const flag = await paymentInvoiceDS.validate(true);
    if (flag) {
      const res = getResponse(await paymentInvoiceCreate(paymentInvoiceDS.toJSONData()));
      if (res) {
        notification.success();
        const list = res.map(({ settleHeaderId, settleNum }) => ({ settleHeaderId, settleNum }));
        history.push({
          pathname: '/ssta/purchase-settle/detail',
          search: queryString.stringify({
            source: 'create',
            type: 'UPDATE',
            documentType: 'PAYMENT',
            list: JSON.stringify(list),
            activityField: 'settleHeaderId',
          }),
        });
      }
    } else {
      notification.error({
        message: intl
          .get('ssta.purchaseSettle.view.notification.amountValidateError')
          .d('金额校验不通过'),
      });
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
        backPath="/ssta/purchase-settle/list"
        title={intl
          .get(`ssta.purchaseSettle.view.title.createPayBaseOnInvSettle`)
          .d('基于开票结算单新建付款单')}
      >
        {customizeBtnGroup(
          {
            code: 'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_HEADBTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtns()} />
        )}
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_CREATE',
          },
          <SearchBarTable
            searchCode="SSTA.PURCHASE_SETTLE_LIST.SEARCH_BASE_INV"
            dataSet={paymentInvoiceDS}
            columns={columns}
            queryBar="none"
            searchBarRef={(ref) => {
              searchBarRef.current = ref;
            }}
            searchBarConfig={{
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
    code: ['ssta.purchaseSettle', 'ssta.common', 'hzero.c7nProUI', 'hzero.c7nProU'],
  }),
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_CREATE',
      'SSTA.PURCHASE_SETTLE_LIST.BASE_INVOICE_HEADBTNS',
    ],
  })
)(PaymentInvoice);
