// 编制来源单据行匹配阶段明细
import React, { useMemo, useContext, useCallback, useEffect } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Button, useModal, Table } from 'choerodon-ui/pro';
// import SearchBarTable from '_components/SearchBarTable';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { TableMode } from 'choerodon-ui/pro/lib/table/interface';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { isNil, omit } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import notification from 'utils/notification';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';
import styles from '../../../../common.less';
import style from '../index.less';
import BatchModifyModal from './BatchModify';
import { copyRecord, getSelectedNegActConfirmMsg } from '../../../../utils/utils';

interface LineProps {
    preStageLineDs: DataSet,
    lineRecordData: any,
    setLineRecordData: (data) => void,
    preStageInfoDs: DataSet,
    handleAfterSave: any,
}

const Line = (props: LineProps) => {
  const { preLineDs } = useContext(Store);
  const { preStageLineDs, lineRecordData, setLineRecordData, preStageInfoDs, handleAfterSave } = props;
  const {
    customizeTable,
    editFlag,
    headerDs,
  } = useContext<StoreValueType>(Store);
  const modal = useModal();
  const { prepViewType } = headerDs.current?.get(['prepViewType']) || {};
  const { selected } = preStageLineDs;

  const handleUpdateLine = useCallback(({ record, name, value }) => {
    const { financialPrecision } = record?.get(['financialPrecision']) || {};
    if (name === 'prepPayAmount' && !isNil(financialPrecision)) {
      record.set('prepPayAmount', math.toFixed(value, financialPrecision));
    } else if (name === 'prepApplyAmount' && !isNil(financialPrecision)) {
      record.set('prepApplyAmount', math.toFixed(value, financialPrecision));
    }
  }, []);

  useEffect(() => {
    preStageLineDs.addEventListener('update', handleUpdateLine);
    return () => {
      preStageLineDs.removeEventListener('update', handleUpdateLine);
    };
  }, [preStageLineDs, handleUpdateLine]);


  const handleBatchSuccess = useCallback((result) => {
    preStageLineDs.query();
    preLineDs.query();
    if (setLineRecordData) setLineRecordData(result);
    if (preStageInfoDs) preStageInfoDs.loadData([result]);
  }, [preStageLineDs, preLineDs, preStageInfoDs, setLineRecordData]);

  const handleBatchUpdate = useCallback(() => {
    modal.open({
      drawer: true,
      className: styles['sbsm-middle-modal'],
      title: intl.get('sbsm.fundPlan.model.fundPlan.batchUpdate').d('批量编辑'),
      children: <BatchModifyModal batchEditType='relationsLine' onSuccess={handleBatchSuccess} recordData={lineRecordData} lineDs={preStageLineDs} />,
      style: { width: 380 },
    });
  }, [preStageLineDs, modal, lineRecordData, handleBatchSuccess]);

  // 点击调整明细行
  const handleSplitLine = useCallback((record) => {
    const newRecord: any = copyRecord(record, record.index + 1, true)?.toData();
    // eslint-disable-next-line no-param-reassign
    record.isExpanded = true;
    preStageLineDs.appendData([omit({...newRecord, _status: 'create', parentFlag: 0}, ['children', 'prepRelationId', 'prepPaymentDate', 'remark', 'objectVersionNumber'])], record);
    preStageLineDs.map((item) => {
      if (item.get('_status') === 'create') item.status = RecordStatus.add;
    });
  }, [preStageLineDs]);

  // 点击删除
  const handleDeleteLine = useCallback(async() => {
    const flag = selected?.some((item) => Number(item?.get('parentFlag')) === 1);
    if (flag) {
      notification.error({
        description: intl.get('sbsm.common.view.message.deleteRelationTips').d('请勿删除主行，仅子行支持删除，主行若无需编制，请维护编制金额为0'),
      });
      return;
    }
    const deleteRes = await preStageLineDs.setState('lineRecordData', lineRecordData).delete(selected, getSelectedNegActConfirmMsg('delete', preStageLineDs));
    if (!deleteRes) return;
    preStageLineDs.query(undefined, undefined, true);
    const content = deleteRes?.content[0];
    if(handleAfterSave) handleAfterSave(content, true);
  }, [selected, preStageLineDs, lineRecordData, handleAfterSave]);

  const handleColumnsRender = useCallback(({ text, record }) => {
    return record?.get('parentFlag') === 1 ? text : null;
  }, []);

  const columns: any = useMemo(() => {
    return [
      prepViewType === 'STAGE' && {
        name: 'prepSource',
        width: 80,
        renderer: handleColumnsRender,
      },
      {
        name: 'documentNum',
        width: 120,
        renderer: ({ value, record }) => {
          if (record?.get('parentFlag') === 0) return null;
          const { displaySourceDocNum = '', displaySourceDocLineNum = '', documentLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum', 'documentLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : `${value}${documentLineNum && '-'}${documentLineNum}`;
        },
      },
      {
        name: 'prepSourceAmount',
        width: 120,
        renderer: handleColumnsRender,
      },
      ...(
        prepViewType === 'SOURCE_DOCUMENT' ? [
          {
            name: 'termSourceDocumentNum',
            width: 160,
            renderer: ({ value, record }) => {
              if (record?.get('parentFlag') === 0) return null;
              const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
              if (displaySourceDocNum) return `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}`;
              const termSourceDocumentLineNum = record?.get('termSourceDocumentLineNum');
              if (!termSourceDocumentLineNum) return value;
              return `${value}-${termSourceDocumentLineNum}`;
            },
          },
          {
            name: 'stageNum',
            width: 140,
            renderer: handleColumnsRender,
          },
          {
            name: 'stageDesc',
            width: 140,
            renderer: handleColumnsRender,
          },
        ] : []
      ),
      {
        name: 'prepPayAmount',
        width: 160,
        editor: editFlag,
      },
      {
        name: 'prepApplyAmount',
        width: 130,
        editor: editFlag,
      },
      {
        name: 'prepPaymentDate',
        width: 120,
        editor: editFlag,
      },
      {
        name: 'remark',
        width: 120,
        editor: editFlag,
      },
      editFlag && {
        name: 'operate',
        width: 90,
        lock: 'right',
        renderer: ({ record }) => Number(record?.get('parentFlag')) === 1 && (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleSplitLine(record)}
          >
            {intl.get('sbsm.fundPlan.model.fundPlan.splitLine').d('拆分')}
          </Button>
        ),
      },
      {
        name: 'prefabPayAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'displayPrepOccupyPayAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'displayPrepEnablePayAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'prefabApplyAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'displayPrepOccupyApplyAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'displayPrepEnableApplyAmount',
        width: 140,
        renderer: handleColumnsRender,
      },
      {
        name: 'prefabPaymentDate',
        width: 140,
        renderer: handleColumnsRender,
      },
    ];
  }, [handleSplitLine, editFlag, prepViewType, handleColumnsRender]);

  const buttons = useMemo(() => {
    return editFlag ? [
      <Button
        onClick={handleBatchUpdate}
        color={ButtonColor.primary}
        icon='mode_edit'
      >
        {intl.get('sbsm.fundPlan.model.fundPlan.batchUpdate').d('批量编辑')}
      </Button>,
      [TableButtonType.delete, { onClick: handleDeleteLine, name: 'delete', children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
    ] : [];
  }, [handleBatchUpdate, editFlag, handleDeleteLine]);

  return (
    <div>
      {customizeTable(
        { code: DetailCustomizeCode.PreStageLineCode, readOnly: !editFlag },
        <Table
          customizable
          buttons={buttons}
          dataSet={preStageLineDs}
          columns={columns}
          selectionMode={(!editFlag) ? SelectionMode.none : SelectionMode.rowbox}
          mode={TableMode.tree}
          defaultRowExpanded
          className={`${style.children_table} ${!editFlag && style.children_table_td}`}
        />
      )}
    </div>
  );
};


export default observer(Line);
