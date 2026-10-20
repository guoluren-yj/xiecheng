import React, { useCallback, useMemo } from 'react';
import moment from 'moment';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import yanqiImg from '@/assets/yanqi.svg';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import rise from '@/assets/rise.svg';
import decline from '@/assets/decline.svg';
import { formatAumont } from '@/routes/components/utils';

const buttonPrompt = 'sodr.sendOrder.view.button';

function getDiffDay(date) {
  const toDay = new Date();
  return moment(toDay).diff(moment(date), 'days');
}

const getStatusRender = (record, radioGroupValue) => {
  const {
    displayStatusMeaning,
    deliverySyncStatus,
    deliverySyncResponseMsg,
    promiseDeliveryDate,
    beyondQuantity,
    urgentFlag,
  } = record.get([
    'displayStatusMeaning',
    'deliverySyncStatus',
    'deliverySyncResponseMsg',
    'promiseDeliveryDate',
    'beyondQuantity',
    'urgentFlag',
  ]);

  return (
    <>
      {radioGroupValue === 'basic' && beyondQuantity > 0 && (
        <Tooltip
          title={intl
            .get(`sodr.sendOrder.model.common.orderDelayDays`, {
              num: getDiffDay(promiseDeliveryDate),
            })
            .d(`订单超期${getDiffDay(promiseDeliveryDate)}天，请提醒供应商安排送货！`)}
        >
          <img src={yanqiImg} alt="img" />
        </Tooltip>
      )}
      {urgentFlag === 1 && (
        <img src={urgentImg} alt={intl.get(`${buttonPrompt}.detailUrgent`).d('加急')} />
      )}
      {deliverySyncStatus === 'FAIL' && (
        <Tooltip
          title={`${intl
            .get('sodr.common.view.message.orderFeedbackMsg')
            .d('ERP订单承诺交货日期同步失败：失败原因')}${deliverySyncResponseMsg || ''}`}
        >
          <img src={abnormal} alt="img" />
        </Tooltip>
      )}
      {displayStatusMeaning}
    </>
  );
};

export function useDefaultColumns(radioGroupValue) {
  return useMemo(
    () =>
      [
        {
          name: 'displayStatusMeaning',
          width: 100,
          className: 'status',
          renderer: ({ record }) => getStatusRender(record, radioGroupValue),
        },
        {
          name: 'displayLineNum',
          width: 60,
        },
        {
          name: 'displayLineLocationNum',
          width: 90,
        },
        {
          width: 100,
          name: 'projectCategoryMeaning',
        },
        {
          name: 'itemCode',
          width: 90,
        },
        {
          name: 'itemName',
          width: 150,
        },
      ].map((n) => (radioGroupValue === 'invoice' ? n : { ...n, lock: true })),
    [radioGroupValue]
  );
}

export function useAmountRenderer(precisionField, header) {
  return useCallback(
    ({ record, value }) => {
      if (record) {
        const priceShieldFlag = record.get('priceShieldFlag');
        if (priceShieldFlag === 1) {
          return '******';
        }
        const { poSourcePlatform, sourceOfTransferOrder } = (header || record).get([
          'poSourcePlatform',
          'sourceOfTransferOrder',
        ]);
        if (
          poSourcePlatform === 'ERP' ||
          ((poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
            sourceOfTransferOrder === 'AUTOTRANSFER')
        ) {
          return formatAumont(value);
        }
        return formatAumont(value, record.get(precisionField), true);
      }
    },
    [precisionField, header]
  );
}

export function useLineAmountRenderer(precisionField, header) {
  return useCallback(
    ({ record, value, name }) => {
      const { benchmarkPriceType } = record.get(['benchmarkPriceType']);
      const isNet = name === 'unitPrice' && benchmarkPriceType === 'NET_PRICE';
      const isTax =
        name === 'enteredTaxIncludedPrice' && benchmarkPriceType === 'TAX_INCLUDED_PRICE';
      return record.get('priceShieldFlag') === 1 ? (
        '******'
      ) : (
        <>
          {header.get('poSourcePlatform') === 'ERP'
            ? formatAumont(value)
            : formatAumont(value, record.get(precisionField))}
          {[-1, 1].includes(record.get('modifyPriceFlag')) && (isNet || isTax) && (
            <img src={record.get('modifyPriceFlag') === 1 ? rise : decline} alt="img" />
          )}
        </>
      );
    },
    [precisionField, header]
  );
}

export function useLineAmountByHeaderRenderer(precisionField, header) {
  return useCallback(
    ({ record, value }) => {
      return record.get('priceShieldFlag') === 1
        ? '******'
        : header.get('poSourcePlatform') === 'ERP'
        ? formatAumont(value)
        : formatAumont(value, header.get(precisionField));
    },
    [precisionField, header]
  );
}

const tableStyle = {
  maxHeight: 300,
};

export function useTable(dataSet, columns, props = {}) {
  const { code, customizeTable, ...others } = props;
  return customizeTable ? (
    customizeTable(
      { code },
      <Table
        dataSet={dataSet}
        columns={columns}
        selectionMode="none"
        style={tableStyle}
        {...others}
      />
    )
  ) : (
    <Table
      dataSet={dataSet}
      columns={columns}
      selectionMode="none"
      style={tableStyle}
      {...others}
    />
  );
}

export function booleanRenderer({ value }) {
  return intl
    .get(`hzero.common${value === 1 ? '.status.yes' : '.status.no'}`)
    .d(value === 1 ? '是' : '否');
}
