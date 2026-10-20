import React, { useMemo, useCallback } from 'react';
import classnames from 'classnames';
import { DataSet, Button, NumberField } from 'choerodon-ui/pro';
import { Popover, Icon } from 'choerodon-ui';
import InsertColRowSvg from '@/assets/sheet/insertColRow.svg';

import intl from 'utils/intl';

import styles from '../../index.less';

const clsPrefix = 'sheet-toolbar-insert-col-row';

export default function TextInsertColRow({ item, sheetRef, disabled }) {
  const { title } = item;
  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        { name: 'insertAbove', type: 'number', defaultValue: 1 },
        { name: 'insertBelow', type: 'number', defaultValue: 1 },
        { name: 'insertLeft', type: 'number', defaultValue: 1 },
        { name: 'insertRight', type: 'number', defaultValue: 1 },
      ],
    });
  }, []);

  const content = useMemo(
    () => (
      <div className={styles[`${clsPrefix}-menu`]}>
        <div
          key="insertAboveRow"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClick('insertAbove')}
        >
          {intl.get('hrpt.reportDesign.view.button.insertAbove').d('在上方插入')}
          <NumberField
            onClick={(e) => {
              e.stopPropagation();
            }}
            dataSet={formDs}
            name="insertAbove"
          />
          {intl.get('hrpt.reportDesign.view.title.row').d('行')}
        </div>
        <div
          key="insertBelowRow"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClick('insertBelow')}
        >
          {intl.get('hrpt.reportDesign.view.button.insertBelow').d('在下方插入')}
          <NumberField
            onClick={(e) => {
              e.stopPropagation();
            }}
            dataSet={formDs}
            name="insertBelow"
          />
          {intl.get('hrpt.reportDesign.view.title.row').d('行')}
        </div>
        <div
          key="insertLeftCol"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClick('insertLeft')}
        >
          {intl.get('hrpt.reportDesign.view.button.insertLeft').d('在左测插入')}
          <NumberField
            onClick={(e) => {
              e.stopPropagation();
            }}
            dataSet={formDs}
            name="insertLeft"
          />
          {intl.get('hrpt.reportDesign.view.title.column').d('列')}
        </div>
        <div
          key="insertRightRight"
          className={styles[`${clsPrefix}-menu-item`]}
          onClick={() => handleClick('insertRight')}
        >
          {intl.get('hrpt.reportDesign.view.button.insertRight').d('在右侧插入')}

          <NumberField
            onClick={(e) => {
              e.stopPropagation();
            }}
            dataSet={formDs}
            name="insertRight"
          />

          {intl.get('hrpt.reportDesign.view.title.column').d('列')}
        </div>
      </div>
    ),
    [handleClick, formDs]
  );

  const handleClick = useCallback(
    (key) => {
      const value = formDs.current.get(key);
      const selectedCell = sheetRef.current.getluckysheet_select_save();
      if (selectedCell && selectedCell[0]) {
        let id = '';
        let type = '';
        switch (key) {
          case 'insertLeft':
            id = '#luckysheet-top-left-add-selected';
            type = 'column';
            break;
          case 'insertAbove':
            id = '#luckysheet-top-left-add-selected';
            type = 'row';
            break;
          case 'insertRight':
            id = 'luckysheet-bottom-right-add-selected';
            type = 'column';
            break;
          case 'insertBelow':
            id = 'luckysheet-bottom-right-add-selected';
            type = 'row';
            break;
          default:
            break;
        }
        const input = id ? window.$(id).find("input") : null;
        if (id && input) {
          input.val(value);
          window.luckysheet.setLuckysheetRightHeadClickIs(type);
          window.$(id).click();
        }
      }
    },
    [formDs]
  );

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      content={content}
      disabled={disabled}
      overlayClassName={styles[`${clsPrefix}-overlay`]}
    >
      <Button
        funcType="flat"
        className={classnames(styles[clsPrefix], { [styles['sheet-toolbar-diabled']]: disabled })}
        disabled={disabled}
      >
        <img src={InsertColRowSvg} />
        <span className={styles[`${clsPrefix}-text`]}>{title}</span>
        <Icon type="arrow_drop_down" />
      </Button>
    </Popover>
  );
}
