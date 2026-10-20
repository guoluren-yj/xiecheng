import React, { isValidElement, useCallback, useContext, useEffect, useRef } from 'react';
import classNames from 'classnames';
import get from 'lodash/get';
import omit from 'lodash/omit';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import { hide, show } from 'choerodon-ui/pro/lib/tooltip/singleton';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';

function isInvalidRenderCellText(text) {
  return (
    text &&
    !isValidElement(text) &&
    Object.prototype.toString.call(text) === '[object Object]'
  );
}

export default function TableCell(props) {

  const {
    record,
    indentSize,
    prefixCls,
    indent,
    index,
    expandIcon,
    column,
    component: BodyCell,
    resizable,
  } = props;
  const { dataIndex, render, className = '', style, onCellClick } = column;
  let { tooltip } = column;
  const tooltipShownRef = useRef();
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  // We should return undefined if no dataIndex is specified, but in order to
  // be compatible with object-path's behavior, we return the record object instead.
  let text;
  if (typeof dataIndex === 'number') {
    text = get(record, dataIndex);
  } else if (!dataIndex || dataIndex.length === 0) {
    text = record;
  } else {
    text = get(record, dataIndex);
  }
  let tdProps = { tabIndex: -1 };
  let colSpan;
  let rowSpan;

  if (render) {
    text = render(text, record, index);
    if (isInvalidRenderCellText(text)) {
      tdProps = text.props || tdProps;
      colSpan = tdProps.colSpan;
      rowSpan = tdProps.rowSpan;
      text = text.children;
    }
  }

  if (column.onCell) {
    const onCellProps = column.onCell(record, column) || {};
    if ("tooltip" in onCellProps) tooltip = onCellProps.tooltip;
    tdProps = { ...tdProps, ...omit(onCellProps, ["tooltip"]) };
  }

  if (isInvalidRenderCellText(text)) {
    text = null;
  }

  const indentText = expandIcon ? (
    <span
      style={{ paddingLeft: `${indentSize * indent}px` }}
      className={`${prefixCls}-indent indent-level-${indent}`}
    />
  ) : null;
  const handleClick = useCallback((e) => {
    if (onCellClick) {
      onCellClick(record, e);
    }
  }, [record, onCellClick]);

  useEffect(() => () => {
    if (tooltipShownRef.current) {
      hide();
      tooltipShownRef.current = undefined;
    }
  }, []);

  if (rowSpan === 0 || colSpan === 0) {
    return null;
  }

  if (column.align) {
    tdProps.style = { ...tdProps.style, textAlign: column.align };
  }

  if (resizable && tooltip) {
    const { onMouseEnter, onMouseLeave } = tdProps;
    tdProps.onMouseEnter = (e) => {
      const element = e.currentTarget;
      if (isOverflow(element)) {
        tooltipShownRef.current = true;
        show(element, {
          title: element.textContent,
          placement: getTooltipPlacement('table-cell') || 'right',
          theme: getTooltipTheme('table-cell'),
        });
      }
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    };
    tdProps.onMouseLeave = (e) => {
      if (tooltipShownRef.current) {
        hide();
        tooltipShownRef.current = false;
      }
      if (onMouseLeave) {
        onMouseLeave(e);
      }
    };
  }

  return (
    <BodyCell
      onClick={handleClick}
      {...tdProps}
      style={{
        ...style,
        ...tdProps.style,
      }}
      className={classNames(className, tdProps.className)}
    >
      {indentText}
      {expandIcon}
      {text}
    </BodyCell>
  );
}
