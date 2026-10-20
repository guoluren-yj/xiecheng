import React, { useMemo } from 'react';
import { DataSet, Table, Spin, Button, TextField, Icon } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {
  TableMode,
  TableColumnTooltip,
  TableQueryBarType,
  SelectionMode,
} from 'choerodon-ui/pro/lib/table/enum';

import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Modal from '@/components/LowcodeModal';
import ImgIcon from '@/utils/ImgIcon';

import IconRender from '../components/IconRender';

import styles from './index.less';

interface ISecondPartsTable {
  step?: number;
  level?: string;
  dataSet: DataSet;
  identification: string;
  loading: boolean;
  sourceDetailType?: string;
  leftParamsRef?: any;
  rightParamsRef?: any;
  handelOnChange?: (val: any[], type: string) => void;
  handleSearch?: (value: string, type: string) => void;
}
export default ({
  step,
  level,
  dataSet,
  identification,
  loading,
  sourceDetailType = 'edit',
  leftParamsRef,
  rightParamsRef,
  handelOnChange = () => {},
  handleSearch = () => {},
}: ISecondPartsTable) => {
  /**
   * 清空失效字段
   */
  const clearInvalidationFields = async () => {
    Modal.warning({
      title: (
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.647058823529412)',
            fontWeight: 700,
          }}
        >
          清空失效字段警告
        </span>
      ),
      children: (
        <div>
          <p>
            该操作将会删除无效的可用字段，使数据对象正常使用，
            <span style={{ color: '#1890FF' }}>您确定要继续删除吗？</span>
          </p>
        </div>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
    }).then(async (button) => {
      if (button === 'ok') {
        const newData = dataSet.toData().filter((item: any) => item.fieldName || item.fields);
        dataSet.loadData(newData);
      }
    });
  };

  const hasInvalidationField = (dataSet.toData() || []).some(
    (item: any) => !item.fieldName && !item.fields // fixme
  ); // 排除模型属性
  const buttonDom = (
    <Button
      color={ButtonColor.primary}
      disabled={!hasInvalidationField}
      onClick={clearInvalidationFields}
    >
      清空失效字段
    </Button>
  );
  const buttonsLeft =
    step === 2
      ? [
        <div className={styles['search-input-left']}>
          <TextField
            value={leftParamsRef?.current}
            className={styles['master-model-input']}
            placeholder="搜索字段名称"
            onChange={(val) => handelOnChange(val, 'left')}
            onInput={(e: any) => handleSearch(e.target.value, 'left')}
            suffix={<Icon className={styles['master-model-input-icon']} type="search" />}
          />
        </div>,
          ['expandAll', { color: 'primary' }],
          ['collapseAll', { color: 'primary' }],
        ]
      : [
          ['expandAll', { color: 'primary' }],
          ['collapseAll', { color: 'primary' }],
        ];
  const buttonsRight =
    step === 2
      ? [
        <div className={styles['search-input-right']}>
          <TextField
            value={rightParamsRef?.current}
            className={styles['master-model-input']}
            placeholder="搜索字段名称"
            onChange={(val) => handelOnChange(val, 'right')}
            onInput={(e: any) => handleSearch(e.target.value, 'right')}
            suffix={<Icon className={styles['master-model-input-icon']} type="search" />}
          />
        </div>,
          buttonDom,
          ['expandAll', { color: 'primary' }],
          ['collapseAll', { color: 'primary' }],
        ]
      : [
          ['expandAll', { color: 'primary' }],
          ['collapseAll', { color: 'primary' }],
        ];

  /**
   * 内置columns（useMemo）
   */
  const columns = useMemo(() => {
    const baseColumns = [
      {
        name: 'aliasName',
        editor: (record) => record.get('fieldName') && identification === 'right',
        renderer: IconRender,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'displayName',
        tooltip: TableColumnTooltip.overflow,
        editor: (record) => record.get('fieldName') && identification === 'right',
        renderer: (props) => {
          const virtualFlag = !!props.record.get('dataVirtualFieldId');
          return (
            <>
              {props.text}
              {virtualFlag && (
                <Tooltip
                  overlayStyle={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'keep-all',
                    maxHeight: '50vh',
                    maxWidth: 300,
                    overflowY: 'auto',
                  }}
                  title={props.record.get('formulaContent')}
                >
                  <ImgIcon name="expression.svg" size={14} style={{ marginLeft: 8 }} />
                </Tooltip>
              )}
            </>
          );
        },
      },
    ];
    return identification === 'right' || level === 'tenant'
      ? baseColumns
      : [
          ...baseColumns,
          {
            name: 'subCanAddFlag',
            tooltip: TableColumnTooltip.overflow,
            editor: (record) => !(record.get('modelFields')?.length > 0),
          },
        ];
  }, []);

  return (
    <Spin spinning={loading}>
      <Table
        className={`${styles['second-table']} ${globalStyles['table-style']} ${
          sourceDetailType === 'see' ? styles['second-table-see'] : styles['second-table-edit']
        }`}
        mode={TableMode.tree}
        dataSet={dataSet}
        expandIconColumnIndex={0}
        rowHeight={26}
        queryBar={TableQueryBarType.none} // 不加时默认dom结构和演示环境不一致
        buttons={(identification === 'left' ? buttonsLeft : buttonsRight) as any}
        columns={columns} // 内置columns,使用useMemo
        useMouseBatchChoose
        selectionMode={SelectionMode.rowbox}
      />
    </Spin>
  );
};
