import { isEmpty, isArray } from 'lodash';
import { cloneElement } from 'react';
import { coverConfig } from '../customizeTool';

export default function custTabPane(options = {}, tabs) {
  const { code } = options;
  const { custConfig: config, loading } = this.state;
  if (loading) return null;
  if (!code || isEmpty(config[code])) return tabs;
  const { fields = [] } = config[code];
  fields.sort((p, n) => (p.seq === undefined || n.seq === undefined ? -1 : p.seq - n.seq));
  const childrenMap = {};
  const newChildren = [];
  const refTabs = tabs;
  const refChildren = refTabs.props.children;
  const newProps = {};
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
  const defaultActive = fields.find((field) => field.defaultActive === 1);
  if (defaultActive) {
    newProps.defaultActiveKey = defaultActive.fieldCode;
  }
  fields.forEach((i) => {
    const { fieldName, fieldCode, conditionHeaderDTOs } = i;
    const { visible } = {
      visible: i.visible,
      ...coverConfig(conditionHeaderDTOs, tools, ['required', 'editable']),
    };
    const targetPane = childrenMap[fieldCode];
    if (!targetPane) return;
    const paneProps = {};
    if (fieldName !== undefined && targetPane && targetPane.props) {
      paneProps.tab = fieldName;
    }
    if (visible !== 0) {
      newChildren.push(cloneElement(targetPane, paneProps));
    }
    delete childrenMap[fieldCode];
  });
  Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
  newProps.children = newChildren;
  return cloneElement(tabs, newProps);
}
