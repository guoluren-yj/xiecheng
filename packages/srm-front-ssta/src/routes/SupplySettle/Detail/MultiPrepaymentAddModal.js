import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import SearchBar from '_components/SearchBarTable/SearchBar';
import { decimalPointAccuracy } from '@/routes/utils';
import { multiPrepaymentAddDS as multiPrepaymentAddDs } from '../../../stores/SupplySettleDS';

const MultiPrepaymentAddModal = (props) => {
  const {
    queryPrepayment,
    prepaymentLineIdList,
    headerCurrent,
    topRecord,
    customizeTable,
    modal,
    multiDimensionDs,
    applyTotalAmount,
  } = props;

  const multiPrepaymentAddDS = useMemo(() => {
    return new DataSet({
      ...multiPrepaymentAddDs(multiDimensionDs),
      events: {
        load: ({ dataSet }) => {
          for (const record of dataSet.records) {
            if (math.lte(record.get('prepaymentRemainingAmount'), 0)) {
              record.selectable = false;
            }
          }
        },
      },
    });
  }, []);

  // 查询表单-监控事件-处理方法
  const queryDsEvtUpdateHandle = ({ name, record }) => {
    if (name === 'associateNum') {
      record.set('associateLineNum', '');
    }
  };

  React.useEffect(() => {
    // 给查询表单添加监控事件
    multiPrepaymentAddDS.queryDataSet.addEventListener('update', queryDsEvtUpdateHandle);
  }, []);

  useEffect(() => {
    multiPrepaymentAddDS.setQueryParameter('prepaymentLineIdList', prepaymentLineIdList);
    multiPrepaymentAddDS.setQueryParameter('currencyCode', headerCurrent.get('currencyCode'));
    multiPrepaymentAddDS.setQueryParameter('companyId', headerCurrent.get('companyId'));
    multiPrepaymentAddDS.setQueryParameter('supplierId', headerCurrent.get('supplierId'));
    multiPrepaymentAddDS.setQueryParameter('ouId', headerCurrent.get('ouId'));
    multiPrepaymentAddDS.setQueryParameter(
      'supplierCompanyId',
      headerCurrent.get('supplierCompanyId')
    );
    multiPrepaymentAddDS.setQueryParameter(
      'originSettleHeaderId',
      headerCurrent.get('settleHeaderId')
    );
    multiPrepaymentAddDS.setQueryParameter('writeOffCode', 'DIMENSION');
    multiPrepaymentAddDS.setQueryParameter('documentNum', topRecord.get('documentNum'));
    multiPrepaymentAddDS.setQueryParameter('supplierSiteId', headerCurrent.get('supplierSiteId'));
    multiPrepaymentAddDS.query();
  }, []);

  const columns = [
    {
      width: 150,
      name: 'prepaymentRemainingAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 250,
      name: 'prepaymentTitle',
    },
    {
      width: 150,
      name: 'prepaymentTypeMeaning',
    },
    {
      width: 150,
      name: 'associateNum',
    },
    {
      width: 150,
      name: 'prepaymentCreatedBy',
    },
    {
      width: 150,
      name: 'prepaymentCreationDate',
    },
    {
      width: 150,
      name: 'associateLineNum',
    },
  ];

  const handleSave = () => {
    const selectData = multiPrepaymentAddDS.selected;
    const paymentAmountInitList = topRecord.get('paymentAmountInitList');
    const { defaultMode } =
      paymentAmountInitList?.find((item) => item.initType === 'PRE_PAYMENT_AMOUNT') || {};
    if (defaultMode === 'LINKAGE') {
      selectData.sort(
        (a, b) =>
          moment(a.get('prepaymentCreationDate')).valueOf() -
          moment(b.get('prepaymentCreationDate')).valueOf()
      );
      let applyAmountTotal = applyTotalAmount || 0;
      selectData.forEach((item) => {
        const preApplyAmount =
          topRecord.get('remainingPaymentAmount') -
          topRecord.get('paymentAmount') -
          applyAmountTotal;
        const remainApplyAmount = item.get('prepaymentRemainingAmount');
        const inputApplyAmount = math.lt(preApplyAmount, remainApplyAmount)
          ? math.lt(preApplyAmount, 0)
            ? 0
            : preApplyAmount
          : math.lt(remainApplyAmount, 0)
          ? 0
          : remainApplyAmount;
        applyAmountTotal = math.plus(applyAmountTotal, inputApplyAmount);
        item.set('applyAmount', inputApplyAmount);
      });
    }
    if (selectData.length) {
      notification.success();
      queryPrepayment(selectData);
    } else {
      notification.warning({
        message: intl
          .get('ssta.purchaseSettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  return (
    <>
      <SearchBar
        expandable={false}
        closeFilterSelector
        dataSet={[multiPrepaymentAddDS]}
        searchCode="SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD"
        fieldProps={{
          associateLineNum: {
            dynamicProps: {
              disabled: ({ record }) => !record.get('associateNum'),
            },
          },
        }}
      />
      {customizeTable(
        {
          code: 'SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX_ADD.LIST',
        },
        <Table
          columns={columns}
          dataSet={multiPrepaymentAddDS}
          queryBar="none"
          // queryBar="advancedBar"
          // queryFieldsLimit="4"
          // className="ssta-advancedBarLimit-five"
          // queryFields={{
          //   creationDate: {
          //     placeholder: [
          //       intl.get(`ssta.supplySettle.model.supplySettle.creationDateFrom`).d('创建日期从'),
          //       intl.get(`ssta.supplySettle.model.supplySettle.creationDateTo`).d('创建日期至'),
          //     ],
          //   },
          //   associateLineNum: {
          //     className: 'ssta-suffix-warpper',
          //   },
          // }}
        />
      )}
      <div className="ssta-body-footer">
        <Button
          onClick={handleSave}
          color="primary"
          disabled={multiPrepaymentAddDS.selected.length === 0}
        >
          {intl.get('hzero.common.button.confirm').d('确认')}
        </Button>
        <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX_ADD.LIST'],
  }),
  observer
)(MultiPrepaymentAddModal);
