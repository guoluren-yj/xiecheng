/*
 * @Description: file content
 * @Date: 2022-02-09 21:31:24
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useMemo, Fragment, useEffect, useContext, useCallback } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react';

import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../Detail/StoreProvider';
import { prePayWriteOffAddDS } from '@/stores/NewSupplySettleDS';

const PrePayWriteOffAddModal = (props) => {
  const { modal, topRecord, parentDs, source } = props;
  const { settleHeader = topRecord, customizeTable } = useContext(Store);
  const settleLineId = topRecord.get('settleLineId');
  const prepaymentLineIdList = parentDs.map((record) => record.get('prepaymentLineId')).join();
  const prePayWriteOffAddDs = useDataSet(
    () => prePayWriteOffAddDS(settleHeader, settleLineId, source, prepaymentLineIdList),
    [settleHeader, settleLineId, source, prepaymentLineIdList]
  );
  const { selected } = prePayWriteOffAddDs;

  useEffect(() => {
    modal.handleOk(handleSave);
    modal.update({ okProps: { disabled: isEmpty(selected) } });
  }, [modal, selected, handleSave]);

  const handleFieldChange = useCallback(({ name, record }) => {
    if (name === 'associateNum') {
      record.set('associateLineNum', undefined);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        width: 150,
        name: 'prepaymentRemainingAmount',
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
    ],
    []
  );

  const handleSave = useCallback(async () => {
    if (source === 'quoteInvoice') {
      parentDs.push(...prePayWriteOffAddDs.selected);
      return true;
    }
    const parentData = parentDs.toData();
    const paymentAmount = topRecord.get('paymentAmount');
    prePayWriteOffAddDs.selected.forEach((record) => {
      record.set({
        applyAmount: 0,
        inputApplyList: parentData,
        paymentAmountByHeader: paymentAmount,
      });
    });
    const res = await prePayWriteOffAddDs.submit();
    if (!res) return false;
    const resData = res.content || [];
    parentDs.query(undefined, undefined, true);
    if (!isEmpty(resData)) {
      const { lineObjectVersionNumber, headerObjectVersionNumber } = resData[0] || {};
      const objectVersionNumber = settleLineId
        ? lineObjectVersionNumber
        : headerObjectVersionNumber;
      if (!isNil(objectVersionNumber)) topRecord.set({ objectVersionNumber });
      // 行核销会更新头上【是否核销】扩展字段，更新头版本号
      if (settleLineId && !isNil(headerObjectVersionNumber)) {
        settleHeader.set('objectVersionNumber', headerObjectVersionNumber);
      }
    }
  }, [source, parentDs, topRecord, prePayWriteOffAddDs, settleLineId, settleHeader]);

  return (
    <Fragment>
      {customizeTable(
        {
          code: 'SSTA.SUPPLY_SETTLE_DETAIL.BOX.ADD.LIST',
        },
        <SearchBarTable
          queryBar="none"
          columns={columns}
          dataSet={prePayWriteOffAddDs}
          searchCode="SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_PRE_OFF_ADD"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          searchBarConfig={{
            expandable: false,
            closeFilterSelector: true,
            onFieldChange: handleFieldChange,
            fieldProps: {
              associateLineNum: {
                dynamicProps: {
                  disabled: ({ record }) => !record.get('associateNum'),
                },
              },
            },
          }}
        />
      )}
    </Fragment>
  );
};

export default observer(PrePayWriteOffAddModal);
