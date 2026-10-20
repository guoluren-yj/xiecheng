import type { ReactNode } from 'react';
import React from 'react';
import { Select } from 'choerodon-ui/pro';
import styles from './renderer.less';

interface SyncNumberSelectValue {
  cellValue: number,
  setValue: Function,
  setPopup: Function,
};

function syncNumberSelectValue(props: SyncNumberSelectValue) {
  const { cellValue, setValue, setPopup } = props;
  setPopup(false);
  setValue(cellValue);
};

interface GetNumberSelectContent {
  min?: number,
  max?: number,
  step?: number,
  widthLength?: number,
};

// 数字选择框内容体
export function getNumberSelectContent(props: GetNumberSelectContent) {
  const { min = 1, max = 31, step = 1, widthLength = 7, ...c7nProps } = props;
  const { field, record, setValue, setPopup } = c7nProps as Record<string, any>;
  const maxIndex = (max - min + 1) / step;
  let num = min;
  let index = 1;
  const rows: ReactNode[] = [];
  let cells: ReactNode[] = [];
  const selectd = (field && record) ? field.getValue(record) : null;
  while (index <= maxIndex) {
    const cellValue = num;
    cells.push(
      <td key={index} className={styles['number-select-cell']}>
        <div
          className={`${styles['number-select-cell-inner']} ${selectd === num && styles['number-select-cell-selectd']}`}
          onClick={() => syncNumberSelectValue({ cellValue, setValue, setPopup })}
        >
          {num}
        </div>
      </td>
    );
    if (index === maxIndex || index % widthLength === 0) {
      rows.push(<tr key={num}>{cells}</tr>);
      cells = [];
    }
    num += step;
    index += 1;
  };
  return (
    <div className={styles['number-select-body']}>
      <table className={styles['number-select-panel']}>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}


// 适用阶段下拉框渲染
export function stageLineNumsEditor(record) {
  return (
    <Select
      optionsFilter={(optionRecord) => {
        const prepayFlag = Number(optionRecord.get('tag')) === 1;
        return record.get('settleType') === 'PREPAYMENT' ? prepayFlag : !prepayFlag;
      }}
    />
  );
};