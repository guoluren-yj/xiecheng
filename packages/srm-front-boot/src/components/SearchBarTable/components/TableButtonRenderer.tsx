/**
 * render table buttons
 */
import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React, { cloneElement, isValidElement, useMemo } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { getConfig } from 'choerodon-ui';
import type { DropDownProps } from 'choerodon-ui/lib/dropdown';
import { TableButtonType, TableMode } from 'choerodon-ui/pro/lib/table/enum';
import type { Buttons, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/interface';
import { Button } from 'choerodon-ui/pro';
import { ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { DataSetStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';

import { stylePrefix } from '../util';

interface ITableButtonRenderer {
  dataSet: DataSet;
  buttons: Buttons[];
  tableMode?: TableMode;
  tableRef?: any,
}

const TableButtonRenderer = observer(({
  dataSet,
  buttons = [],
  tableRef,
  tableMode = TableMode.list,
}: ITableButtonRenderer) => {

  const isTree = useMemo(() => tableMode === TableMode.tree, [tableMode]);

  const handleButtonCreate = () => {
    dataSet.create({}, 0);
  };

  const handleButtonSubmit = () => {
    dataSet.submit();
  };

  const handleButtonDelete = () => {
    dataSet.delete(dataSet.selected);
  };

  const handleButtonRemove = () => {
    dataSet.remove(dataSet.selected);
  };

  const handleButtonReset = () => {
    dataSet.reset();
  };

  const handleQuery = () => {
    dataSet.query();
  };

  const handleExpandAll = () => {
    if (tableRef && tableRef.tableStore) {
      tableRef.tableStore.expandAll();
    }
  };

  const handleCollapseAll = () => {
    if (tableRef && tableRef.tableStore) {
      tableRef.tableStore.collapseAll();
    }
  };

  const getButtonProps = (
    type: TableButtonType,
  ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode; } | undefined => {
    const disabled = dataSet.status !== DataSetStatus.ready;
    switch (type) {
      case TableButtonType.add:
        return {
          icon: 'playlist_add',
          onClick: handleButtonCreate,
          children: $l('Table', 'create_button'),
          disabled: disabled || (dataSet.parent ? !dataSet.parent.current : false),
        };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: handleButtonSubmit,
          children: $l('Table', 'save_button'),
          type: ButtonType.submit,
          disabled,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: handleButtonDelete,
          children: $l('Table', 'delete_button'),
          disabled: disabled || dataSet.selected.length === 0,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: handleButtonRemove,
          children: $l('Table', 'remove_button'),
          disabled: disabled || dataSet.selected.length === 0,
        };
      case TableButtonType.reset:
        return {
          icon: 'undo',
          onClick: handleButtonReset,
          children: $l('Table', 'reset_button'),
          type: ButtonType.reset,
        };
      case TableButtonType.query:
        return {
          icon: 'search',
          onClick: handleQuery,
          children: $l('Table', 'query_button'),
        };
      case TableButtonType.expandAll:
        return isTree ? {
          icon: 'add_box',
          onClick: handleExpandAll,
          children: $l('Table', 'expand_button'),
        } : undefined;
      case TableButtonType.collapseAll:
        return isTree
          ? {
            icon: 'short_text',
            onClick: handleCollapseAll,
            children: $l('Table', 'collapse_button'),
          }
          : undefined;
      default:
    }
  };

  const getButtons = (): ReactElement<ButtonProps>[] => {
    const children: ReactElement<ButtonProps | DropDownProps>[] = [];
    if (buttons) {
      const tableButtonProps = getConfig('tableButtonProps');
      const buttonsArr = buttons;
      buttonsArr.forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          // eslint-disable-next-line
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const { afterClick, ...buttonProps } = props;
          const defaultButtonProps = getButtonProps(button);
          if (defaultButtonProps) {
            if (afterClick) {
              const { onClick } = defaultButtonProps;
              defaultButtonProps.onClick = async e => {
                e.persist();
                try {
                  await onClick(e);
                } finally {
                  afterClick(e);
                }
              };
            }
            children.push(
              <Button
                key={button}
                {...tableButtonProps}
                {...defaultButtonProps}
                {...buttonProps}
              />,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(cloneElement(button, { ...tableButtonProps, ...button.props }));
        } else if (isObject(button)) {
          children.push(<Button {...tableButtonProps} {...button} />);
        }
      });
    }
    return children;
  };

  return (
    <div className={`${stylePrefix}-buttons`}>
      {getButtons()}
    </div>
  );
});

export default TableButtonRenderer;
