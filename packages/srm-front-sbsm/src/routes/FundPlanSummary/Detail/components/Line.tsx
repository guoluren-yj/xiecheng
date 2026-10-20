import React, { useMemo, useContext, useCallback, useEffect } from 'react';
import { Button, useModal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableButtonType, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import { isNil, isEmpty } from 'lodash';
import ExcelExportPro from 'components/ExcelExportPro';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { Store } from '../stores';
import LineBatchEdit from './LineBatchEdit';
import { useModalOpen } from '../../../../hooks';
import LineDetail from '../../components/LineDetail';
import { DetailCustomizeCode } from '../../utils/type';
import QuoteAddLine from '../../components/Quote/AddLine';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';

const Line = () => {
  const {
    remote,
    lineDs,
    boolMap,
    headerDs,
    customizeTable,
    permissionMap,
  } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);
  const { selected } = lineDs;
  const { prepViewType, balHeaderId } = headerDs.current?.get(['prepViewType', 'balHeaderId']) || {};

  const handleUpdateLine = useCallback(({ record, name, value }) => {
    const { financialPrecision } = record?.get(['financialPrecision']) || {};
    if (name === 'balPayAmount' && !isNil(financialPrecision)) {
      record.set('balPayAmount', math.toFixed(value, financialPrecision));
    } else if (name === 'balApplyAmount' && !isNil(financialPrecision)) {
      record.set('balApplyAmount', math.toFixed(value, financialPrecision));
    }
  }, []);

  useEffect(() => {
    lineDs.addEventListener('update', handleUpdateLine);
    return () => {
      lineDs.removeEventListener('update', handleUpdateLine);
    };
  }, [lineDs, handleUpdateLine]);

  // 新增行
  const handleAddLine = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('sbsm.common.view.title.add').d('新增'),
      children: <QuoteAddLine />,
    });
  }, [modalOpen]);

  const handleDeleteLine = useCallback(async() => {
    if (remote) {
      const cuxEventRes = await remote.event.fireEvent('beforeDeleteLine', {
        lineDs,
        headerDs,
      });
      if (cuxEventRes === false) return false;
    }
    const deleteRes = await lineDs.delete(selected, getSelectedNegActConfirmMsg('delete', lineDs));
    if (!deleteRes) return;
    headerDs.query(undefined, undefined, true);
  }, [remote, lineDs, headerDs, selected]);

  const handleBatchUpdate = useCallback(() => {
    modalOpen({
      size: 'small',
      editFlag: true,
      title: intl.get('sbsm.common.view.button.batchUpdate').d('批量编辑'),
      children: <LineBatchEdit lineDs={lineDs} />,
    });
  }, [lineDs, modalOpen]);

  // 点击调整明细行
  const handleOpenLineDetail = useCallback((record) => {
    modalOpen({
      size: 'large',
      editFlag: boolMap.editFlag,
      title: boolMap.editFlag
        ? intl.get('sbsm.fundPlan.view.button.adjustSummaryLineDetail').d('调整汇总单行明细')
        : intl.get('sbsm.fundPlan.view.button.viewSummaryLineDetail').d('查看汇总单行明细'),
      children: <LineDetail topRecord={record} editFlag={boolMap.editFlag} />,
    });
  }, [boolMap, modalOpen]);

  const columns: any = useMemo(() => {
    const editor = boolMap.editFlag;
    return [
        { name: 'lineNum', width: 60 },
        { name: 'supplierCompanyNum', width: 150 },
        { name: 'supplierCompanyName', width: 200 },
        { name: 'currencyCode', width: 120 },
        ...(prepViewType === 'STAGE' ? [
          {
            name: 'termSourceNumAndLine',
            width: 150,
            renderer: ({ value, record }) => {
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
            },
          },
          { name: 'stageNum', width: 150 },
          { name: 'stageDesc', width: 150 },
          { name: 'stageAmount', width: 150 },
        ] : [
          { name: 'prepSourceMeaning', width: 150 },
          {
            name: 'documentNum',
            width: 160,
            renderer: ({ value, record }) => {
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
            },
          },
          { name: 'documentAmount', width: 150 },
        ]),
        { name: 'balPayAmount', width: 150, editor },
        { name: 'balApplyAmount', width: 150, editor },
        { name: 'balPaymentDate', width: 180 },
        { name: 'balPaymentDateLast', width: 180 },
        { name: 'remainAmountProcess', width: 150, editor },
        { name: 'lineRemark', width: 150, editor },
        {
          name: 'operation',
          width: 150,
          align: ColumnAlign.left,
          lock: 'right',
          command: ({ record }) => [
            <Button
              funcType={FuncType.link}
              onClick={() => handleOpenLineDetail(record)}
            >
              {boolMap.editFlag
                ? intl.get('sbsm.fundPlan.view.button.adjustLineDetail').d('调整行明细')
                : intl.get('sbsm.fundPlan.view.button.viewLineDetail').d('查看行明细') }
            </Button>,
          ],
         },
        { name: 'prepPayAmount', width: 150 },
        { name: 'balOccupyPayAmount', width: 150 },
        { name: 'balEnablePayAmount', width: 150 },
        { name: 'prepApplyAmount', width: 150 },
        { name: 'balOccupyApplyAmount', width: 150 },
        { name: 'balEnableApplyAmount', width: 150 },
        { name: 'prepPaymentDate', width: 200 },
        { name: 'prepPaymentDateLast', width: 200 },
    ];
  }, [boolMap, prepViewType, handleOpenLineDetail]);

  const exportParams = useMemo(() => {
    const balLineIdList = selected.map((item) => item.get('balLineId'));
    const queryData = lineDs.queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ balLineIdList });
    } else {
      return filterNullValueObject(queryData);
    }
  }, [lineDs, selected]);


  const buttons = useMemo<Buttons[]>(() => {
    const btns = boolMap.editFlag ? [
      [TableButtonType.add, { onClick: handleAddLine, name: 'add' }],
      [TableButtonType.delete, { onClick: handleDeleteLine, name: 'delete', children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'), icon: 'delete_sweep' }],
      <Button
        onClick={handleBatchUpdate}
        color={ButtonColor.primary}
        icon='mode_edit'
        name='batchEdit'
      >
        {intl.get('sbsm.common.view.button.batchUpdate').d('批量编辑')}
      </Button>,
    ] : [];
    const lineBtns = [
      ...btns,
      permissionMap?.get(`lineExport`) && (
        <ExcelExportPro
          // @ts-ignore
          name="exportLine"
          templateCode='SBSM_BALANCE_LINE_EXPORT'
          method="POST"
          allBody
          requestUrl={`/sbdm/v1/${getCurrentOrganizationId()}/balance-lines/export/${balHeaderId}?customizeUnitCode=${[DetailCustomizeCode.LineTableCode, DetailCustomizeCode.LineFilterCode].join()}`}
          queryParams={exportParams}
          buttonText={
            isEmpty(selected)
              ? intl.get('sbsm.common.button.LineExport1').d('行导出')
              : intl.get('sbsm.common.button.LineTickExport1').d('行勾选导出')
          }
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          }}
        />
      ),
    ];
    return remote ? remote.process('SBSM.FUND_PLAN_SUMMARY_DETAIL_CUX.LINE_BTNS', lineBtns, {
      lineDs,
      boolMap,
      headerDs,
      selected,
    })
  : lineBtns;
  }, [
    lineDs,
    remote,
    boolMap,
    headerDs,
    selected,
    handleAddLine,
    handleDeleteLine,
    handleBatchUpdate,
    balHeaderId,
    permissionMap,
    exportParams,
  ]);

  return (
    <div>
      {customizeTable(
        {
          code: DetailCustomizeCode.LineTableCode,
          buttonCode: DetailCustomizeCode.LineTableBtns,
          readOnly: !boolMap.editFlag,
        },
        <SearchBarTable
          customizable
          buttons={buttons}
          dataSet={lineDs}
          columns={columns}
          searchCode={DetailCustomizeCode.LineFilterCode}
          style={{ maxHeight: 430 }}
          searchBarConfig={{
            closeFilterSelector: true,
          }}
        />
      )}
    </div>
  );
};


export default observer(Line);
