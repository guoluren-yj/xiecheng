import React, { cloneElement } from 'react';
import { isEmpty, isArray } from 'lodash';
import { coverConfig } from '../customizeTool';

export default function custCollapse(options = {}, collapse) {
  const { code } = options;
  const { custConfig: config, loading } = this.state;
  if (loading) return null;
  if (!code || isEmpty(config[code])) return collapse;
  const { fields = [] } = config[code];
  fields.sort((p, n) => (p.seq === undefined || n.seq === undefined ? -1 : p.seq - n.seq));
  const childrenMap = {};
  const newChildren = [];
  const refTabs = collapse;
  const newProps = {};
  const refChildren = refTabs.props.children;
  const tools = this.getToolFuns();
  if (isArray(refChildren)) {
    refChildren.forEach((i) => {
      // 适配部分使用JSX，另一部分使用数组的情况
      if (isArray(i)) {
        i.forEach((j) => {
          if (j && j.props && j.key !== undefined) {
            childrenMap[j.key] = j;
          }
        });
      } else if (i && i.props && i.key !== undefined) {
        childrenMap[i.key] = i;
      }
    });
  } else if (refChildren && refChildren.props && refChildren.key) {
    childrenMap[refChildren.key] = refChildren;
  }
  const defaultActive = [];
  const originDefaultActive = [...(refTabs.props.defaultActiveKey || [])];
  fields.forEach((field) => {
    if (
      field.defaultActive === 1 ||
      (field.defaultActive === -1 && originDefaultActive.includes(field.fieldCode))
    ) {
      defaultActive.push(field.fieldCode);
    }
  });
  newProps.defaultActiveKey = defaultActive;
  fields.forEach((i) => {
    const { fieldName, fieldCode, conditionHeaderDTOs } = i;
    const { visible } = {
      visible: i.visible,
      ...coverConfig(conditionHeaderDTOs, tools, ['required', 'editable']),
    };
    const targetPane = childrenMap[fieldCode];
    if (!targetPane) return;
    const paneProps = {};
    if (targetPane.props) {
      const oldHeader = targetPane.props.header;
      if (typeof oldHeader === 'function') {
        paneProps.header = oldHeader(fieldName);
      } else if (fieldName !== undefined) {
        paneProps.header = <h3>{fieldName}</h3>;
      }
    }
    if (visible !== 0) {
      newChildren.push(cloneElement(targetPane, paneProps));
    }
    delete childrenMap[fieldCode];
  });
  Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
  newProps.children = newChildren;
  return cloneElement(collapse, newProps);
}
