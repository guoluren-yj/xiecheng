import type { ReactNode, ReactElement, MouseEventHandler } from 'react';
import React, { cloneElement } from 'react';
import classNames from 'classnames';
import { isObject, isEmpty } from 'lodash';
import type { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { Select, Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import styles from './index.less';

interface ColumnBtnProps {
  name: string,
  text?: ReactNode,
  wait?: number,
  group?: boolean,
  showFlag?: boolean, // 按钮展示逻辑
  mainFlag?: boolean, // 是否为主按钮，默认只有一个
  btnComp?: ReactElement,
  onClick?: MouseEventHandler<any>,
  children?: ReactNode,
  className?: string,
}

interface ColumnBtnGroupProps {
  limit?: number,
  buttons: ColumnBtnProps[],
}

const { SubMenu, Item: MenuItem } = Menu;


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
  const rows: ReactNode [] = [];
  let cells: ReactNode [] = [];
  const selectd = (field && record) ? field.getValue(record) : null;
  while(index <= maxIndex) {
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
    if(index === maxIndex || index % widthLength === 0) {
      rows.push(<tr key={num}>{cells}</tr>);
      cells = [];
    }
    num+= step;
    index+= 1;
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

export const formatColumnCommand = (props: ColumnBtnGroupProps): Commands[] => {
  const { limit = 3, buttons = [] } = props;
  const showBtnList: ColumnBtnProps[] = [];
  buttons.forEach(item => {
    if (item && isObject(item)) {
      const { mainFlag, showFlag = true } = item;
      if (showFlag) {
        if (mainFlag) {
          showBtnList.unshift(item);
        } else {
          showBtnList.push(item);
        }
      }
    }
  });
  const showBtnsCount = showBtnList.length;
  const btnList = showBtnList
    .splice(0, showBtnsCount > limit ? limit - 1 : limit)
    .map(item => {
      const { name, text, wait, group, children, onClick, btnComp, className } = item;
      if (btnComp) {
        return cloneElement(btnComp, { key: name });
      } else if (group) {
        return (
          <Dropdown key={name} overlay={children}>
            <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['sbsm-command-btn']}>
              {text}
              <Icon type="expand_more" />
            </Button>
          </Dropdown>
        );
      } else {
        return (
          <Button
            key={name}
            funcType={FuncType.link}
            color={ButtonColor.primary}
            wait={wait}
            onClick={onClick}
            className={classNames(styles['sbsm-command-btn'], className)}
          >
            {text}
          </Button>
        );
      }
    });
  // if (isEmpty(btnList)) return ['-'] as any;
  if (!isEmpty(showBtnList)) {
    btnList.push(
      <Dropdown
        overlay={() => (
          <Menu className={styles['sbsm-command-menu']}>
            {showBtnList.map(item => {
              const { name, text, group, children, onClick, btnComp } = item;
              if (group) {
                return (
                  <SubMenu key={name} title={<span style={{ paddingRight: 18 }}>{text}</span>}>
                    {children}
                  </SubMenu>
                );
              } else {
                return (
                  <MenuItem key={name} onClick={onClick}>{btnComp || text}</MenuItem>
                );
              }
            })}
          </Menu>
        )}
      >
        <Button funcType={FuncType.link} color={ButtonColor.primary} className={styles['sbsm-command-btn']}>
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" className={styles['sbsm-command-more-icon']} />
        </Button>
      </Dropdown>
    );
  }
  return btnList;
};
