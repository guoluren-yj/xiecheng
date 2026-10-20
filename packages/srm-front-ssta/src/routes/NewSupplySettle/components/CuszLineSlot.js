import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useDataSet } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SSTA } from '_utils/config';

import { Store } from '../Detail/StoreProvider';
import { cuszLineDS } from '@/stores/NewSupplySettleDS';

const tenantId = getCurrentOrganizationId();
const prefix = `${SRM_SSTA}/v1/${tenantId}`;

export default observer(() => {
  const {
    settleType,
    updateFlag,
    remoteProps,
    documentType,
    readOnlyFlag,
    customizeTable,
    settleHeaderId,
    settleHeaderDs,
    permissionMap,
  } = useContext(Store);

  const shortType = documentType === 'INVOICE' ? 'INV' : 'PAY';
  const cuszLineDs = useDataSet(() => cuszLineDS(documentType, settleHeaderId), [
    documentType,
    settleHeaderId,
  ]);
  const { selected } = cuszLineDs;

  React.useEffect(() => {
    cuszLineDs.selection = updateFlag ? 'multiple' : false;
    cuszLineDs.bind(settleHeaderDs, 'attributeList');
  }, [updateFlag, cuszLineDs, settleHeaderDs]);

  const exportParams = useMemo(() => {
    const queryData = cuszLineDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject(queryData);
  }, [cuszLineDs]);

  const exportUrl = useMemo(() => {
    const customizeUnitCode = [
      `SSTA.SUPPLY_SETTLE_DETAIL.${shortType}_CUSZ_LINE`,
      `SSTA.SUPPLY_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BAR`,
    ].join();
    return `${prefix}/settle-expand-lines/supplier/export?documentType=${documentType}&documentId=${settleHeaderId}&customizeUnitCode=${customizeUnitCode}`;
  }, [shortType, documentType, settleHeaderId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      permissionMap.get('custLineExport') && (
        <ExcelExportPro
          name="newLineExport"
          templateCode="SSTA_SETTLE_EXPAND_LINE"
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
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.CUSZ_LINE_BTNS', normalBtns, {
          selected,
          cuszLineDs,
          settleType,
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
    remoteProps,
    exportParams,
    permissionMap,
    settleHeaderId,
    settleHeaderDs,
  ]);

  return customizeTable(
    {
      code: `SSTA.SUPPLY_SETTLE_DETAIL.${shortType}_CUSZ_LINE`,
      readOnly: readOnlyFlag,
      buttonCode: `SSTA.SUPPLY_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BTNS`,
    },
    <SearchBarTable
      virtual
      searchCode={`SSTA.SUPPLY_SETTLE_DETAIL.${shortType}_CUSZ_LINE_BAR`}
      dataSet={cuszLineDs}
      buttons={buttons}
      columns={[]}
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
