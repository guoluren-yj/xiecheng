import React, { useMemo, useContext, useCallback, useEffect } from 'react';
import { Button, useModal, Modal } from 'choerodon-ui/pro';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import SearchBarTable from '_components/SearchBarTable';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import { isNil, isEmpty } from 'lodash';
import ExcelExportPro from 'components/ExcelExportPro';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';
import styles from '../../../../common.less';
import AdjustDetail from './AdjustDetail';
import BatchModifyModal from './BatchModify';
import AddLine from './AddLine';
import Execute from '../../../FundPlanPrefabrication/Detail/index';

export default observer(() => {
  const {
    preLineDs,
    customizeTable,
    editFlag,
    remote,
    headerDs,
    prepResultDs,
    permissionMap,
  } = useContext<StoreValueType>(Store);
  const { prepViewType, prepHeaderId, prepMode, prepReportStatus } = headerDs.current?.get(['prepViewType', 'prepHeaderId', 'prepMode', 'prepReportStatus']) || {};
  const modal = useModal();
  const { selected } = preLineDs;

  const handleUpdateLine = useCallback(({ record, name, value }) => {
    const { financialPrecision } = record?.get(['financialPrecision']) || {};
    if (name === 'prepPayAmount' && !isNil(financialPrecision)) {
      record.set('prepPayAmount', math.toFixed(value, financialPrecision));
    } else if (name === 'prepApplyAmount' && !isNil(financialPrecision)) {
      record.set('prepApplyAmount', math.toFixed(value, financialPrecision));
    }
  }, []);

  useEffect(() => {
    preLineDs.addEventListener('update', handleUpdateLine);
    return () => {
      preLineDs.removeEventListener('update', handleUpdateLine);
    };
  }, [preLineDs, handleUpdateLine]);

  // 新增行
  const handleAddLine = useCallback(() => {
    modal.open({
      drawer: true,
      className: styles['sbsm-large-modal'],
      title: intl.get('sbsm.fundPlan.model.fundPlan.add').d('新增'),
      children: <AddLine />,
      style: { width: 1090 },
    });
  }, [modal]);

  const handleDeleteLine = useCallback(async() => {
    const deleteRes = await preLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', preLineDs));
    if (!deleteRes) return;
    prepResultDs.query();
    headerDs.query(undefined, undefined, true);
  }, [prepResultDs, selected, headerDs, preLineDs]);

  const handleUpdatePrepInfo = useCallback(async() => {
    const res = await headerDs.setState('submitType', 'updateLine').forceSubmit();
    if (!res) return false;
    // 调用成功后 更新行，不更新行上的可编辑字段
    headerDs.query(undefined, undefined, true);
  }, [headerDs]);

  const handleBatchSuccess = useCallback(() => {
    headerDs.query();
    prepResultDs.query();
  }, [headerDs, prepResultDs]);

  const handleBatchUpdate = useCallback(() => {
    modal.open({
      drawer: true,
      className: styles['sbsm-middle-modal'],
      title: intl.get('sbsm.fundPlan.model.fundPlan.batchUpdate').d('批量编辑'),
      children: <BatchModifyModal batchEditType='line' recordData={headerDs.current?.toData()} lineDs={preLineDs} onSuccess={handleBatchSuccess} />,
      style: { width: 380 },
    });
  }, [preLineDs, modal, handleBatchSuccess, headerDs]);

  // 点击调整明细行
  const handleAdjustDetailLine = useCallback((record) => {
    modal.open({
      drawer: true,
      className: styles['sbsm-large-modal'],
      title: editFlag ? intl.get('sbsm.fundPlan.model.fundPlan.adjustDetailLineDetail').d('调整编制单行明细') : intl.get('sbsm.fundPlan.model.fundPlan.viewtDetailLineDetail').d('查看编制单行明细'),
      children: <AdjustDetail lineRecordDs={record} />,
      style: { width: 1090 },
    });
  }, [modal, editFlag]);

  const handleClickExecute = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <Execute recordInfo={record} viewType={prepViewType} />,
      cancelButton: false,
    });
  }, [prepViewType]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'lineNum',
        width: 60,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      ...(
        prepViewType === 'STAGE' ? [
          {
            name: 'termSourceDocNum',
            width: 120,
            renderer: ({ value, record }) => {
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
            },
          },
          {
            name: 'stageNum',
            width: 120,
          },
          {
            name: 'stageDesc',
            width: 130,
          },
          {
            name: 'stageAmount',
            width: 120,
          },
        ] : [
          {
            name: 'prepSource',
            width: 120,
          },
          {
            name: 'documentNum',
            width: 160,
            renderer: ({ value, record }) => {
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
            },
          },
          {
            name: 'documentAmount',
            width: 120,
          },
        ]
      ),
      {
        name: 'prepPayAmount',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'prepApplyAmount',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'prepPaymentDate',
        width: 170,
      },
      {
        name: 'prepPaymentDateLast',
        width: 170,
      },
      {
        name: 'lineRemark',
        width: 120,
        editor: editFlag,
      },
      // 当编制模式=仅编制行，状态=新建/已退回时，编辑&查询页面，编制单行「操作-调整/查看行明细」隐藏
      !(prepMode === 'ONLY_LINE' && ['NEW', 'RETURN'].includes(prepReportStatus)) && {
        name: 'operate',
        width: 90,
        lock: 'right',
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleAdjustDetailLine(record)}
          >
            {editFlag ? intl.get('sbsm.fundPlan.model.fundPlan.adjustDetailLineInfo').d('调整行明细') : intl.get('sbsm.fundPlan.model.fundPlan.viewEtailLineInfo').d('查看行明细')}
          </Button>
        ),
      },
      {
        name: 'prefabPayAmount',
        width: 120,
      },
      {
        name: 'prepOccupyPayAmount',
        width: 140,
      },
      {
        name: 'prepEnablePayAmount',
        width: 140,
      },
      {
        name: 'prefabApplyAmount',
        width: 140,
      },
      {
        name: 'prepOccupyApplyAmount',
        width: 140,
      },
      {
        name: 'prepEnableApplyAmount',
        width: 140,
      },
      {
        name: 'prefabPaymentDate',
        width: 140,
      },
      {
        name: 'prefabPaymentDateLast',
        width: 140,
      },
      {
        name: 'execute',
        width: 140,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickExecute(record)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
    ];
  }, [handleAdjustDetailLine, editFlag, prepViewType, handleClickExecute, prepMode, prepReportStatus]);

  const exportParams = useMemo(() => {
    const prepLineIdList = selected.map((item) => item.get('prepLineId'));
    const queryData = preLineDs.queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ prepLineIdList });
    } else {
      return filterNullValueObject(queryData);
    }
  }, [preLineDs, selected]);

  const buttons: any = useMemo(() => {
    const btns = editFlag ? [
      [TableButtonType.add, { onClick: handleAddLine, name: 'add' }] as [TableButtonType, TableButtonProps],
      [TableButtonType.delete, { onClick: handleDeleteLine, name: 'delete', children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
      <Button
        onClick={handleBatchUpdate}
        color={ButtonColor.primary}
        icon='mode_edit'
        name='batchEdit'
      >
        {intl.get('sbsm.fundPlan.model.fundPlan.batchUpdate').d('批量编辑')}
      </Button>,
      <Button
        onClick={handleUpdatePrepInfo}
        color={ButtonColor.primary}
        name='updatePrepInfo'
        icon='autorenew'
      >
        {intl.get('sbsm.fundPlan.model.fundPlan.updatePrepInfo').d('更新可编制信息')}
      </Button>,
    ] : [];
    const lineBtns = [
      ...btns,
      permissionMap?.get(`lineExport`) && (
        <ExcelExportPro
          // @ts-ignore
          name="exportLine"
          templateCode='SBSM_FP_PREP_LINE_EXPORT'
          method="POST"
          allBody
          requestUrl={`/sbdm/v1/${getCurrentOrganizationId()}/prep-lines/export/${prepHeaderId}?customizeUnitCode=${[DetailCustomizeCode.LineSearchTableCode, DetailCustomizeCode.LineTableCode].join()}`}
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
    return remote ? remote.process('SBSM.FUND_PLAN_PREPARATION_DETAIL_CUX.LINE_BTNS', lineBtns, {
      preLineDs,
      headerDs,
      editFlag,
    })
  : lineBtns;
  }, [handleAddLine, handleDeleteLine, handleBatchUpdate, handleUpdatePrepInfo, editFlag, headerDs, preLineDs, remote, selected, exportParams, prepHeaderId, permissionMap]);

  return (
    <div>
      {customizeTable(
        { code: DetailCustomizeCode.LineTableCode, buttonCode: DetailCustomizeCode.LineTableBtn, readOnly: !editFlag },
        <SearchBarTable
          virtual
          customizable
          buttons={buttons}
          dataSet={preLineDs}
          columns={columns}
          searchCode={DetailCustomizeCode.LineSearchTableCode}
          style={{ maxHeight: 430 }}
          searchBarConfig={{
            closeFilterSelector: true,
          }}
        />
      )}
    </div>
  );
});


// export default Line;
