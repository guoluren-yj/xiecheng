import React, { useMemo, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBar from '_components/SearchBarTable/SearchBar';
import { prepaymentAddDS as prepaymentAddDs } from '../../../stores/SupplySettleDS';
import { addPrepayment } from '@/services/settlePoolServices';
import { decimalPointAccuracy } from '@/routes/utils';

const PrepaymentAddModal = (props) => {
  const {
    settleHeaderId,
    isLine,
    topRecord,
    headerCurrent,
    customizeTable,
    modal,
    prepaymentDs,
  } = props;

  const [loading, setLoading] = useState(false);

  const prepaymentAddDS = useMemo(() => {
    return new DataSet({
      ...prepaymentAddDs(),
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
    prepaymentAddDS.queryDataSet.addEventListener('update', queryDsEvtUpdateHandle);
  }, []);

  useEffect(() => {
    if (isLine) {
      prepaymentAddDS.setQueryParameter('settleLineId', topRecord.get('settleLineId'));
      prepaymentAddDS.setQueryParameter('summaryFlag', 0);
    } else {
      prepaymentAddDS.setQueryParameter('settleHeaderId', topRecord.get('settleHeaderId'));
      prepaymentAddDS.setQueryParameter('summaryFlag', 1);
    }
    prepaymentAddDS.setQueryParameter('currencyCode', headerCurrent.get('currencyCode'));
    prepaymentAddDS.setQueryParameter('companyId', headerCurrent.get('companyId'));
    prepaymentAddDS.setQueryParameter('supplierId', headerCurrent.get('supplierId'));
    prepaymentAddDS.setQueryParameter('ouId', headerCurrent.get('ouId'));
    prepaymentAddDS.setQueryParameter('supplierCompanyId', headerCurrent.get('supplierCompanyId'));
    prepaymentAddDS.setQueryParameter('originSettleHeaderId', headerCurrent.get('settleHeaderId'));
    prepaymentAddDS.setQueryParameter('supplierSiteId', headerCurrent.get('supplierSiteId'));
    prepaymentAddDS.isLine = isLine;
    setLoading(true);
    prepaymentAddDS.query();
    setLoading(false);
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
    const selectData = prepaymentAddDS.selected.map((item) => item.toData());
    const inputApplyList = prepaymentDs.toData();
    if (selectData.length) {
      const body = selectData.map((item) => ({
        ...item,
        applyAmount: 0,
        paymentAmountByHeader: topRecord.get('paymentAmount'),
        inputApplyList,
      }));
      setLoading(async () => {
        const res = getResponse(
          await addPrepayment({
            body,
            settleHeaderId,
            isLine,
            settleLineId: topRecord.get('settleLineId'),
          })
        );
        if (res) {
          notification.success();
          const addPaymentApply = [];
          res.forEach((item) => {
            if (item.addFlag === 1) {
              addPaymentApply.push(item);
            }
          });
          prepaymentDs.appendData(addPaymentApply);
          prepaymentDs.totalCount += addPaymentApply.length;
          modal.close();
        }
        return true;
      });
    } else {
      notification.warning({
        message: intl
          .get('ssta.supplySettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  return (
    <>
      <SearchBar
        expandable={false}
        closeFilterSelector
        dataSet={[prepaymentAddDS]}
        searchCode="SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD"
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
          code: 'SSTA.SUPPLY_SETTLE_DETAIL.BOX.ADD.LIST',
        },
        <Table
          columns={columns}
          dataSet={prepaymentAddDS}
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
          loading={loading}
          disabled={prepaymentAddDS.selected.length === 0}
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
    unitCode: ['SSTA.SUPPLY_SETTLE_DETAIL.BOX.ADD.LIST'],
  }),
  observer
)(PrepaymentAddModal);
