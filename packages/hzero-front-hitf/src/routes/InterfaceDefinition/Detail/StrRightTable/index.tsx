import React, { useMemo, useCallback, useRef } from 'react';
import { TextField, Select, Modal, NumberField, TextArea, Button } from 'choerodon-ui/pro';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode, TableMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import ExpressionEngine from 'srm-front-boot/lib/components/ExpressionEngine';

import paramsIcon from '@/assets/paramsIcon.svg';
import RuleModal from './RuleModal';
import styles from './index.less';

const SreRightTable: React.FC<any> = ({ tableDs, defaultSelectId, handleSave, typeFlag }) => {
  const expressionEngineRef = useRef<typeof ExpressionEngine>();
  // 参数维护-反馈，参数维护-请求始终可编辑
  // 条件规则
  const openModal = useCallback((record) => {
    const recordData = record.toData();
    const ruleModalProps = {
      recordObj: recordData,
      record,
      defaultSelectId,
      expressionEngineRef,
    };
    const field: any = record.getField('leftValue');
    field.setLovPara('interfaceParamHeaderId', recordData.interfaceParamHeaderId);
    Modal.open({
      title: intl.get('hitf.common.view.card.conditionEngine').d('条件引擎'),
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      children: <RuleModal {...ruleModalProps} />,
      okText: intl.get('hzero.common.button.save').d('保存'),
      cancelText: intl.get('hzero.common.button.delete').d('删除'),
      onOk: () => {
        const ruleRef: any = expressionEngineRef.current;
        if (ruleRef.onSaveExpressionEngine) {
          ruleRef.onSaveExpressionEngine();
        }
      },
      onCancel: () => {
        const ruleRef: any = expressionEngineRef.current;
        if (ruleRef.onDeleteExpressionEngine) {
          ruleRef.onDeleteExpressionEngine();
        }
      },
      footer: (okBtn, cancelBtn, modal) => (
        <>
          {okBtn}
          {cancelBtn}
          <Button onClick={() => { modal.close(); }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  }, [tableDs, defaultSelectId]);

  // 字段名称值改变
  const handleChange = useCallback((value, record) => {
    const targetParamName = record.get('targetParamName');
    if (!targetParamName) {
      record.set('targetParamName', value);
    }
  }, []);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'paramName',
        width: 200,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ?
          <TextField restrict="A-Za-z0-9" onChange={(value) => handleChange(value, record)} /> : false,
        renderer: ({ value, record }) => {
          const { id, interfaceParamLineId } = record?.get(['id', 'interfaceParamLineId']);
          return (
            <span style={{ color: !id || interfaceParamLineId ? '' : 'rgba(0, 0, 0, 0.65)' }}>
              {!(!id || interfaceParamLineId) && <img src={paramsIcon} alt='' style={{ color: 'rgba(0, 0, 0, 0.5)', marginRight: '4px' }} />}
              {value}
            </span>
          );
        },
      },
      {
        name: 'paramDescribe',
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <TextField /> : false,
      },
      {
        name: 'paramType',
        width: typeFlag ? 120 : 80,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <Select /> : false,
      },
      {
        name: 'paramLength',
        width: typeFlag ? 120 : 80,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <NumberField /> : false,
      },
      {
        name: 'notNull',
        width: typeFlag ? 120 : 75,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <Select /> : false,
      },
      {
        name: 'conditionCode',
        width: 80,
        renderer: ({ value, record }) => {
          return value ? (
            <span className={styles['link-span']} onClick={() => openModal(record)}>
              {intl.get('hzero.common.conditionRule').d('条件规则')}
            </span>
          ) : null;
        },
      },
      {
        name: 'paramDisplayRule',
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <Select /> : false,
      },
      {
        name: 'targetParamName',
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <TextField /> : false,
      },
      {
        name: 'isResponse',
        width: 120,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <Select /> : false,
      },
      {
        name: 'successResult',
        width: 120,
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <Select /> : false,
      },
      {
        name: 'remark',
        editor: (record) => (!record.get('id') || record.get('interfaceParamLineId')) ? <TextArea /> : false,
      },
    ],
    [tableDs, defaultSelectId]
  );

  // 新增
  const handleAdd = useCallback(() => {
    tableDs.create({ interfaceParamHeaderId: defaultSelectId, paramDisplayRule: 'EXTERNAL_PARAM' }, 0);
  }, [tableDs, defaultSelectId]);

  if (typeFlag) {
    // 参数维护-反馈无需显示部分列
    columns.splice(5, 3);
  } else {
    columns.splice(8, 2);
  }

  const handleDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [tableDs]);

  return (
    <div className={styles['params-table']}>
      <SearchBarTable
        mode={TableMode.tree}
        selectionMode={SelectionMode.treebox}
        searchCode="HITF.INTERFACE.DEFINITION.PARAM.FILTER"
        columns={columns}
        dataSet={tableDs}
        searchBarConfig={{
          closeFilterSelector: true,
          autoQuery: false,
        }}
        buttons={[
          [TableButtonType.add, { onClick: handleAdd }],
          [TableButtonType.delete, { onClick: handleDelete }],
          [TableButtonType.save, { onClick: handleSave }],
        ]}
        defaultRowExpanded
        style={{ maxHeight: '580px' }}
      />
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(SreRightTable));

