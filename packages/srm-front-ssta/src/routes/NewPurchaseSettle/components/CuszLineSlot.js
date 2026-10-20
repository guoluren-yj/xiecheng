import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useDataSet } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SSTA } from '_utils/config';
import { isEmpty } from 'lodash';

import { Store } from '../Detail/StoreProvider';
import { cuszLineDS } from '@/stores/NewPurchaseSettleDS';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${tenantId}`;
export default observer(() => {
  const {
    settleType,
    updateFlag,
    remoteProps,
    documentType,
    readOnlyFlag,
    settleHeaderId,
    customizeTable,
    settleHeaderDs,
    permissionMap,
    editableFlowFlag,
    notPub,
    isReadOnly,
  } = useContext(Store);

  const shortType = documentType === 'INVOICE' ? 'INV' : 'PAY';
  const cuszLineDs = useDataSet(() => cuszLineDS(documentType, settleHeaderId), [
    documentType,
    settleHeaderId,
  ]);
  const { selected } = cuszLineDs;

  React.useEffect(() => {
    cuszLineDs.selection = updateFlag || editableFlowFlag ? 'multiple' : false;
    cuszLineDs.bind(settleHeaderDs, 'attributeList');
  }, [updateFlag, cuszLineDs, settleHeaderDs]);

  const exportParams = useMemo(() => {
    const queryData = cuszLineDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryData);
  }, [cuszLineDs]);

  const exportUrl = useMemo(() => {
    const customizeUnitCode = [
      `SSTA.PURCHASE_SETTLE_DETAIL.${shortType}_CUSZ_LINE`,
      `SSTA.PURCHASE_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BAR`,
    ].join();
    return `${prefix}/settle-expand-lines/purchaser/export?documentType=${documentType}&documentId=${settleHeaderId}&customizeUnitCode=${customizeUnitCode}`;
  }, [shortType, documentType, settleHeaderId]);

  const handleDeleteLine = useCallback(async () => {
    const deleteRes = await cuszLineDs.delete(
      selected,
      getSelectedNegActConfirmMsg('delete', cuszLineDs)
    );
    if (!deleteRes) return;
    cuszLineDs.query();
  }, [cuszLineDs, selected]);

  const handleSaveLine = useCallback(async () => {
    const res = await cuszLineDs.submit();
    if (!res) return;
    cuszLineDs.query();
  }, [cuszLineDs, selected]);

  const handleAddLine = useCallback(() => {
    cuszLineDs.create({ documentId: settleHeaderId });
  }, [cuszLineDs, settleHeaderId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      (updateFlag || editableFlowFlag) &&
        documentType === 'INVOICE' && ['add', { onClick: handleAddLine, name: 'add' }],
      (updateFlag || editableFlowFlag) &&
        documentType === 'INVOICE' && [
          'delete',
          {
            disabled: isEmpty(selected),
            icon: 'delete_sweep',
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
            onClick: handleDeleteLine,
            name: 'delete',
          },
        ],
      (updateFlag || editableFlowFlag) &&
        documentType === 'INVOICE' && [
          'save',
          {
            icon: 'save',
            onClick: handleSaveLine,
            name: 'save',
          },
        ],
      permissionMap.get('custLineExport') && (
        <ExcelExportPro
          name="newLineExport"
          templateCode="SSTA_SETTLE_EXPAND_LINE_SUPPLIER"
          method="POST"
          allBody
          requestUrl={exportUrl}
          queryParams={exportParams}
          buttonText={intl.get('ssta.common.button.LineExport1').d('(新)行导出')}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          }}
        />
      ),
    ];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.CUSZ_LINE_BTNS', normalBtns, {
          selected,
          cuszLineDs,
          settleType,
          updateFlag,
          settleHeaderId,
          settleHeaderDs,
        })
      : normalBtns;
    return processBtns;
  }, [
    selected,
    exportUrl,
    cuszLineDs,
    settleType,
    updateFlag,
    remoteProps,
    exportParams,
    permissionMap,
    settleHeaderId,
    settleHeaderDs,
    handleDeleteLine,
    documentType,
    handleSaveLine,
    handleAddLine,
  ]);

  const columns = useMemo(() => {
    const normalColumns = [];
    const processColumns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.CUSZ_LINE_COLS', normalColumns, {})
      : normalColumns;
    return processColumns;
  }, [remoteProps]);

  const cuszReadonlyFlag = useMemo(() => {
    const flag = readOnlyFlag && !editableFlowFlag;
    return remoteProps
    ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_CUX_CUSZLINE_READONLY', flag, {
        notPub,
        isReadOnly,
        settleHeaderDs,
        readOnlyFlag,
        editableFlowFlag,
      })
    : flag;
  }, [readOnlyFlag, editableFlowFlag, notPub, isReadOnly, remoteProps]);

  return customizeTable(
    {
      code: `SSTA.PURCHASE_SETTLE_DETAIL.${shortType}_CUSZ_LINE`,
      readOnly: cuszReadonlyFlag,
      buttonCode: `SSTA.PURCHASE_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BTNS`,
    },
    <SearchBarTable
      virtual
      searchCode={`SSTA.PURCHASE_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BAR`}
      dataSet={cuszLineDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 430 }}
      maxPageSize={1000}
      pagination={{ pageSizeOptions: ['10', '50', '100', '500', '1000'] }}
      searchBarConfig={{
        autoQuery: false,
        closeFilterSelector: true,
      }}
    />
  );
});
