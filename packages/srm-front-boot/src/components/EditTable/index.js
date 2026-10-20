import React from 'react';
import { Form } from 'hzero-ui';
import EditTable from 'hzero-front/lib/components/EditTable';
import Table from '../Table';
import styles from './index.less';

const { TableRowContext } = Table;

const EditableRow = ({ form, fixed, record, ...props }) => {
  if (!fixed && (record._status === 'create' || record._status === 'update')) {
    // eslint-disable-next-line
    record.$form = form;
    return (
      <TableRowContext.Provider value={form}>
        <tr {...props} />
      </TableRowContext.Provider>
    );
  } else {
    return <tr {...props} />;
  }
};

const EditableFormRow = Form.create({
  fieldNameProp: null,
  // 表单值 改变 出发 onDataChange
  onValuesChange: (props, changeValues, allValues) => {
    const { onDataChange, record } = props;
    if (onDataChange) {
      onDataChange(record, changeValues, allValues);
    }
  },
  // 将 onDataChange 解构出来, 不应该传到 Form 下
  mapProps: (props) => {
    const { onDataChange, ...passProps } = props || {};
    return passProps;
  },
})(EditableRow);

export default class AutoHeightEditTable extends EditTable {
  render() {
    // antd table property
    const { onRow, ...otherProps } = this.props;
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const editTableProps = {
      components,
      rowClassName: styles['hzero-edit-table'],
      onRow: this.onRow,
      ...otherProps,
    };
    return <Table {...editTableProps} />;
  }
}
