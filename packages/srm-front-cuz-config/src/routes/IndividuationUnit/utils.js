import React from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;

export const formsLayouts = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export const formsLayoutsLong = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

export const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...formsLayouts}>
      {value}
    </FormItem>
  );
};

export function getIntlMapping(key) {
  switch (key) {
    case 'R':
      return intl.get('hpfm.individuationUnit.view.message.rightFixed').d('右固定');
    case 'L':
      return intl.get('hpfm.individuationUnit.view.message.leftFixed').d('左固定');
    case 'FORM':
      return intl.get('hpfm.individuationUnit.view.message.form').d('表单');
    case 'GRID':
      return intl.get('hpfm.individuationUnit.view.message.grid').d('表格');
    case 'QUERYFORM':
      return intl.get('hpfm.individuationUnit.view.message.filter').d('表单-查询');
    case 'FILTER':
      return intl.get('hpfm.individuationUnit.view.message.filter').d('查询');
    case 'TABPANE':
      return intl.get('hpfm.individuationUnit.view.message.tabPane').d('标签');
    case 'WIDGET':
      return intl.get('hpfm.individuationUnit.view.message.widget').d('编辑组件');
    case 'TEXT':
      return intl.get('hpfm.individuationUnit.view.message.text').d('文本显示');
    case 'SEARCHBAR':
      return intl.get('hpfm.individuationUnit.view.message.searchBar').d('筛选器');
    case 'SECTION':
      return intl.get('hpfm.customize.common.section').d('标题卡片');
    case 'COMMON':
      return intl.get('hpfm.customize.common.common').d('审批表单组件');
    case 'COLLAPSE':
      return intl.get('hpfm.customize.common.collapse').d('折叠面板');
    case 'BTNGROUP':
      return intl.get('hpfm.customize.common.btnGroup').d('按钮组');
    case 'WORKFLOW':
      return intl.get('hpfm.customize.common.WORKFLOW').d('工作流审批表单');
    default:
  }
}
