import React, { createElement } from 'react';
import { Dropdown, Menu, Tooltip, Output, TextField } from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import completed from '@/assets/completed.svg'; // 对账完成 开票完成
import noNeed from '@/assets/noNeed.svg'; // 无需对账
import processs from '@/assets/processs.svg'; //

export const tagColors = {
  success: { hex: '#47B881', rgba: 'rgba(71, 184, 129, 0.1)' },
  warn: { hex: '#F88D10', rgba: 'rgba(248, 141, 16, 0.1)' },
  error: { hex: '#F56349', rgba: 'rgba(245, 99, 73, 0.1)' },
  info: { hex: 'rgba(0, 0, 0, 0.65)', rgba: 'rgba(0, 0, 0, 0.1)' },
  green: { hex: '#3ab344', rgba: 'rgba(58,179,68,.1)' },
};

/**
 * @typedef CloneAction
 * @param {OperatorAction} action
 * @param {any} record
 * @param {Object} options - 配置
 * @param {'button'|'menu'} options.type - 该操作在 外面 还是 在 Dropdown 中
 * @return React.ReactElement
 */
function defaultCloneAction(action, record, options = {}) {
  const { len = 2, title = null, key, ele, noTooltip, placement = 'top' } = action;
  const { type } = options;
  const itemProps = { key };
  if (type === 'button') {
    const actionClassName = `action-link-item-${len > 10 ? 10 : len}`;
    itemProps.className =
      ele.props && ele.props.className
        ? `${ele.props.className} ${actionClassName}`
        : actionClassName;
  }
  const item = React.cloneElement(ele, itemProps);
  if (title === null || type === 'menu' || noTooltip) {
    return item;
  }
  return React.createElement(Tooltip, { title, key, placement }, item);
}

export function operatorRender(actions = [], record, options = {}) {
  const {
    cloneAction = defaultCloneAction,
    limit = 3,
    label = intl.get('hzero.common.button.action').d('操作'),
  } = options;
  const newActions = actions.filter(
    (action) =>
      // 过滤掉 没有的 action 与, ele 为 非 react 显示值 的元素
      action &&
      !(
        action.ele === undefined ||
        action.ele === null ||
        action.ele === false ||
        action.ele === true
      )
  );
  if (newActions.length <= limit) {
    return (
      <span className="action-link">
        {newActions.map((action) => cloneAction(action, record, { type: 'button' }))}
      </span>
    );
  }
  const sliceIndex = limit > 0 ? limit : 0;
  const opts = newActions.slice(0, sliceIndex);
  const moreOpts = newActions.slice(sliceIndex);

  const menu = (
    <Menu>
      {moreOpts.map((action) => {
        const { key } = action;
        return <Menu.Item key={key}>{cloneAction(action, record, { type: 'menu' })}</Menu.Item>;
      })}
    </Menu>
  );
  return (
    <span className="action-link">
      {opts.map((action) => cloneAction(action, record, { type: 'button' }))}
      <Dropdown overlay={menu}>
        <a className="action-link-operation">
          {label}
          <Icon type="down" />
        </a>
      </Dropdown>
    </span>
  );
}

export function oprListRender(buttons) {
  const oprList = [];
  buttons.forEach((item) => {
    const {
      type,
      title,
      show = false, // 按钮展示逻辑
      main = false, // 是否为主按钮，默认只有一个
      onClick,
    } = item;
    if (show) {
      const obj = {
        opr: (
          <a onClick={onClick} style={{ marginRight: '8px' }}>
            {title}
          </a>
        ),
        more: (
          <Menu.Item key={type} onClick={onClick}>
            {title}
          </Menu.Item>
        ),
      };
      if (main) {
        oprList.unshift(obj);
      } else {
        oprList.push(obj);
      }
    }
  });
  const outCom = oprList.shift().opr;
  const moreList = oprList.map((item) => item.more);
  return (
    <>
      {outCom}
      {moreList.length > 0 ? (
        <Dropdown overlay={<Menu>{moreList}</Menu>}>
          <a>
            {intl.get('hzero.common.button.more').d('更多')}
            <Icon type="expand_more" />
          </a>
        </Dropdown>
      ) : (
        ''
      )}
    </>
  );
}

/*
 * @param: hex { string}
 * @param: opacity  { string || number } 透明度
 * @return: { string } rgba格式
 */
export function hexToRgba(hex = '', opacity = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return hex && `rgba(${r},${g},${b},${opacity})`;
}

export function statusTagRender(value, color = 'info') {
  const { hex, rgba } = color.startsWith('#')
    ? { hex: color, rgba: hexToRgba(color, 0.1) }
    : tagColors[color] || {};
  return (
    <Tag color={rgba} style={{ fontWeight: 600, padding: '0 5px' }}>
      {' '}
      <span style={{ color: hex }}> {value}</span>
    </Tag>
  );
}
export function statusRender(value, color = 'info') {
  return (
    <span>
      <img
        src={color === 'success' ? processs : color === 'info' ? noNeed : completed}
        alt=""
        className="svg-img"
      />
      &nbsp;
      {value}
    </span>
  );
}

export function flagRender(flag) {
  return Number(flag) === 1
    ? intl.get('hzero.common.status.yes').d('是')
    : intl.get('hzero.common.status.no').d('否');
}

export function expandIconRender(panelProps) {
  const { isActive } = panelProps;
  const iconProps = { style: { height: '21.5px' } };
  return isActive ? (
    <Icon type="expand_more" {...iconProps} />
  ) : (
    <Icon type="navigate_next" {...iconProps} />
  );
}

export function formItemRender(props) {
  const { editor = TextField, editorable, editorDisabled, visible = true, ...otherProps } = props;

  if (!visible) return null;

  // 如果editorable没传的话，禁用的效果即为编辑且禁用
  const isEditor = isUndefined(editorable) ? editorDisabled : editorable;

  return isEditor
    ? createElement(editor, { ...otherProps, disabled: editorDisabled })
    : createElement(Output, otherProps);
}
