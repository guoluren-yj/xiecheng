import React from 'react';
import { Dropdown, Icon, Menu, Tooltip } from 'hzero-ui';
import { isArray } from 'lodash';
import intl from 'utils/intl';

function defaultCloneAction(action, record, options = {}) {
  const { len = 2, title = null, key, ele, noTooltip, placement = 'top' } = action;
  const { type } = options;
  const itemProps = { key };
  console.log(len);
  if (type === 'button') {
    // const actionClassName = `action-link-item-${len > 10 ? 10 : len}`;
    // itemProps.className =
    //   ele.props && ele.props.className
    //     ? `${ele.props.className} ${actionClassName}`
    //     : actionClassName;
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
  const sliceIndex = limit > 0 ? limit - 1 : 0;
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

// 树形数据转成数组
export const transformTreeToArr = (
  treeData = [], // 树形数据
  valueField, // 树形值字段
  childrenFieldName = 'children', // 树形数据子节点字段
  idKeyName = 'id', // 数组主键字段
  parentKeyName = 'parentId' // 数组关联的父级数据字段
) => {
  if (!treeData.length) {
    return [];
  }
  const arr = [];
  const _transformTreeToArr = (data, parentValue) => {
    data.forEach((item) => {
      arr.push({
        ...item,
        [idKeyName]: item[valueField],
        [parentKeyName]: parentValue,
      });
      const children = item[childrenFieldName];
      if (isArray(children) && children.length > 0) {
        _transformTreeToArr(children, item[valueField]);
      }
    });
  };
  _transformTreeToArr(treeData);
  return arr;
};
