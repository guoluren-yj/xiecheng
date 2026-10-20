import React, { useMemo, useCallback, useEffect } from 'react';
import { isNil, omit } from 'lodash';
import { observer } from 'mobx-react';
import { Modal, DataSet, Button, Table } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { TableMode } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import notification from 'utils/notification';

import { relatedLineDS } from './storeDS';
import { LineDetailCuszCode } from '../../utils/type';
import RelatedLineBatchEdit from './RelatedLineBatchEdit';
import styles from '../../../../common.less';
import styleLess from '../../Detail/index.less';
import { copyRecord, getSelectedNegActConfirmMsg } from '../../../../utils/utils';

interface RelatedLineProps {
  editFlag?: boolean,
  topRecord: DSRecord,
  lineDetailDs?: DataSet,
  customizeForm: Function,
  customizeTable: Function,
}

const RelatedLine = observer((props: RelatedLineProps) => {
  const { lineDetailDs, editFlag, topRecord, customizeForm, customizeTable } = props;

  const listSourceFlag = isNil(lineDetailDs);
  const prepViewType = topRecord?.get('prepViewType');
  const lineDs = useMemo(() => new DataSet(relatedLineDS(topRecord)), [topRecord]);
  const { selected } = lineDs;

  useEffect(() => {
    if (!isNil(lineDetailDs)) lineDs.bind(lineDetailDs, 'balanceRelationList');
    else lineDs.query();
  }, [lineDs, lineDetailDs]);

  const handleUpdateLine = useCallback(({ record, name, value }) => {
    const { financialPrecision } = record?.get(['financialPrecision']) || {};
    if (name === 'balPayAmount' && !isNil(financialPrecision)) {
      record.set('balPayAmount', math.toFixed(value, financialPrecision));
    } else if (name === 'balApplyAmount' && !isNil(financialPrecision)) {
      record.set('balApplyAmount', math.toFixed(value, financialPrecision));
    }
  }, []);

  useEffect(() => {
    if (!isNil(lineDetailDs)) lineDetailDs.addEventListener('update', handleUpdateLine);
    return () => {
      if (!isNil(lineDetailDs)) lineDetailDs.removeEventListener('update', handleUpdateLine);
    };
  }, [lineDetailDs, handleUpdateLine]);

  const handleBatchEdit = useCallback(() => {
    Modal.open({
      drawer: true,
      className: styles['sbsm-small-modal'],
      title: intl.get('sbsm.fundPlan.view.button.batchEdit').d('批量编辑'),
      children: <RelatedLineBatchEdit lineDs={lineDs} topRecord={topRecord} customizeForm={customizeForm} />,
    });
  }, [lineDs, topRecord, customizeForm]);

  // 点击调整明细行
  const handleSplitLine = useCallback((record) => {
    const newRecord: any = copyRecord(record, record.index + 1, true)?.toData();
    // eslint-disable-next-line no-param-reassign
    record.isExpanded = true;
    lineDs.appendData([omit({...newRecord, _status: 'create', parentFlag: 0}, ['children', 'balRelationId', 'balPaymentDate', 'remark', 'objectVersionNumber'])], record);
    lineDs.map((item) => {
      if (item.get('_status') === 'create') item.status = RecordStatus.add;
    });
  }, [lineDs]);

  // 点击删除
  const handleDeleteLine = useCallback(async() => {
    const flag = selected?.some((item) => Number(item?.get('parentFlag')) === 1);
    if (flag) {
      notification.error({
        description: intl.get('sbsm.common.view.message.deleteRelationTips').d('请勿删除主行，仅子行支持删除，主行若无需编制，请维护编制金额为0'),
      });
      return;
    }
    const deleteRes = await lineDs.delete(selected, getSelectedNegActConfirmMsg('delete', lineDs));
    if (!deleteRes) return;
    lineDs.query(undefined, undefined, true);
    const parentLineDs = topRecord.dataSet;
    const headerDs = parentLineDs?.parent;
    if (headerDs) headerDs.query(undefined, undefined, true);
    const content = deleteRes?.content[0];
    const { objectVersionNumber } = content || {};
    if (lineDetailDs && lineDetailDs.current) lineDetailDs.current.set('objectVersionNumber', objectVersionNumber);
    topRecord.set('objectVersionNumber', objectVersionNumber);
  }, [selected, lineDs, topRecord, lineDetailDs]);

  const handleColumnsRender = useCallback(({ record, text }) => {
    return record?.get('parentFlag') !== 0 ? text : null;
  }, []);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      (prepViewType === 'STAGE' && { name: 'prepSourceMeaning', width: 150, renderer: handleColumnsRender }) as ColumnProps,
      {
        name: 'documentNumAndLineNum',
        width: 150,
        renderer: ({ value, record }) => {
          if (record?.get('parentFlag') === 0) return null;
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      { name: 'prepSourceLineAmount', width: 150, renderer: handleColumnsRender },
      ...(prepViewType !== 'STAGE' ? [
        {
          name: 'termSourceNumAndLine',
          width: 150,
          renderer: ({ value, record }) => {
            if (record?.get('parentFlag') === 0) return null;
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        { name: 'stageNum', width: 150, renderer: handleColumnsRender },
        { name: 'stageDesc', width: 150, renderer: handleColumnsRender },
      ] : []) as ColumnProps[],
      { name: 'balPayAmount', width: 150, editor: editFlag },
      { name: 'balApplyAmount', width: 150, editor: editFlag },
      { name: 'balPaymentDate', width: 150, editor: editFlag },
      { name: 'remark', width: 150, editor: editFlag },
      (editFlag && {
        name: 'operation',
        width: 150,
        renderer: ({ record }) => Number(record?.get('parentFlag')) === 1 && (
          <Button funcType={FuncType.link} onClick={() => handleSplitLine(record)}>
            {intl.get('sbsm.fundPlan.view.button.splitLine').d('拆分')}
          </Button>
        ),
      }) as ColumnProps,
      { name: 'prepPayAmount', width: 150, renderer: handleColumnsRender },
      { name: 'balOccupyPayAmount', width: 150, renderer: handleColumnsRender },
      { name: 'balEnablePayAmount', width: 150, renderer: handleColumnsRender },
      { name: 'prepApplyAmount', width: 150, renderer: handleColumnsRender },
      { name: 'balOccupyApplyAmount', width: 150, renderer: handleColumnsRender },
      { name: 'balEnableApplyAmount', width: 150, renderer: handleColumnsRender },
      { name: 'prepPaymentDate', width: 150, renderer: handleColumnsRender },
    ];
  }, [editFlag, prepViewType, handleSplitLine, handleColumnsRender]);

  const buttons = useMemo(() => {
    return editFlag ? [
      <Button icon='mode_edit' onClick={handleBatchEdit}>
        {intl.get('sbsm.fundPlan.view.button.batchEdit').d('批量编辑')}
      </Button>,
      [TableButtonType.delete, { onClick: handleDeleteLine, name: 'delete', children: intl.get(`hzero.common.button.batchdelete`).d('批量删除'), icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
    ] : [];
  }, [editFlag, handleBatchEdit, handleDeleteLine]);

  const style = useMemo(() => {
    return listSourceFlag ? { maxHeight: 'calc(100vh - 150px)' } : { maxHeight: 430 };
  }, [listSourceFlag]);

  return (
    <div>
      {customizeTable(
        { code: LineDetailCuszCode.RelatedGrid, readOnly: !editFlag },
        <Table
          style={style}
          dataSet={lineDs}
          buttons={buttons}
          columns={columns}
          selectionMode={!editFlag ? SelectionMode.none : SelectionMode.rowbox}
          mode={TableMode.tree}
          defaultRowExpanded
          className={`${styleLess.children_table} ${!editFlag && styleLess.children_table_td}`}
        />
      )}
    </div>
  );
});


export default RelatedLine;
