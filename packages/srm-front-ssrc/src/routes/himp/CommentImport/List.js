import React from 'react';
import { Form, Input, InputNumber, Popconfirm, Switch, Table } from 'hzero-ui';
import { map } from 'lodash';
import { Bind } from 'lodash-decorators';

import { TagRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const EditableContext = React.createContext();
const FormItem = Form.Item;

const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create()(EditableRow);

function getInput(type) {
  switch (type) {
    case 'String':
      return <Input />;
    case 'Decimal':
      return <InputNumber />;
    case 'Long':
      return <InputNumber />;
    case 'Boolean':
      return <Switch checkedValue unCheckedValue={false} />;
    // case 'Date':
    //   return <Switch />;
    default:
      return <Input />;
  }
}

export default class List extends React.Component {
  state = {
    editableKey: null,
    prevDataSource: [],
    dataSource: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { dataSource } = nextProps;
    if (dataSource !== prevState.prevDataSource) {
      return {
        dataSource: map(dataSource, (record) => {
          const { _data, ...rest } = record;
          let rData;
          try {
            rData = JSON.parse(_data);
          } catch (e) {
            rData = {};
          }
          return {
            ...rData,
            ...rest,
          };
        }),
      };
    }
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  @Bind()
  edit(editableKey) {
    this.setState({
      editableKey,
    });
  }

  @Bind()
  cancel() {
    this.setState({
      editableKey: null,
    });
  }

  @Bind()
  handleSave(form, _id) {
    const { save = (e) => e } = this.props;
    save(form, _id, this.cancel);
  }

  @Bind()
  editRender(text, record) {
    const { editableKey } = this.state;
    return (
      <span className="action-link">
        {editableKey === record._id ? (
          <React.Fragment>
            <EditableContext.Consumer>
              {(form) => (
                <a onClick={() => this.handleSave(form, record._id)}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </a>
              )}
            </EditableContext.Consumer>
            <Popconfirm
              title={intl.get(`himp.comment.view.message.title.sureToCancel`).d('确定取消编辑？')}
              onConfirm={() => this.cancel()}
            >
              <a>{intl.get('hzero.common.button.cancel').d('取消')}</a>
            </Popconfirm>
          </React.Fragment>
        ) : (
          !record.imported && (
            <a onClick={() => this.edit(record._id)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          )
        )}
      </span>
    );
  }

  @Bind()
  getDynamicColumns() {
    const { dynamicColumns = [] } = this.props;
    const { editableKey, dataSource = [] } = this.state;
    return dynamicColumns.map((n) => ({
      title: n.title,
      dataIndex: n.dataIndex,
      width: dataSource.some((o) => o._id === editableKey) || !n.width ? 180 : n.width,
      render: (text, record) => {
        return (
          <EditableContext.Consumer>
            {(form) => {
              const { getFieldDecorator } = form;
              return editableKey === record._id ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(n.dataIndex, {
                    rules: [
                      {
                        required: n.required,
                        message: intl.get('hzero.common.validation.notNull', { name: n.title }),
                      },
                    ],
                    initialValue: this.setInitValue(record[n.dataIndex]),
                  })(getInput(n.columnType))}
                </FormItem>
              ) : (
                text
              );
            }}
          </EditableContext.Consumer>
        );
      },
    }));
  }

  setInitValue(value) {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    } else {
      return value;
    }
  }

  render() {
    const { processing = {}, pagination, onChange } = this.props;
    const { dataSource = [] } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const dynamicColumns = this.getDynamicColumns();
    const defaultColumns = [
      {
        title: intl.get('himp.comment.model.comment.dataStatus').d('数据状态'),
        dataIndex: '_dataStatus',
        width: 200,
        render: (_dataStatus) => {
          const { importStatus = [] } = this.props;
          const statusList = [
            { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
            { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
            { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
            { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
            { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
            { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
          ];
          return TagRender(
            _dataStatus,
            importStatus.map((item) => {
              const tagItem = statusList.find((t) => t.status === item.value) || {};
              return {
                status: item.value,
                text: item.meaning,
                color: tagItem.color,
              };
            })
          );
        },
      },
      {
        title: intl.get('himp.comment.model.comment.errorMsg').d('错误信息'),
        dataIndex: '_info',
        onCell: this.onCell,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        key: '_operator',
        render: this.editRender,
      },
    ];
    const tableColumns = defaultColumns.concat(dynamicColumns);
    const tableProps = {
      components,
      dataSource,
      pagination,
      onChange,
      rowKey: '_id',
      bordered: true,
      loading: processing.loading || processing.queryColumns,
      columns: tableColumns,
      scroll: {
        x: tableScrollWidth(tableColumns),
      },
    };
    return <Table {...tableProps} />;
  }
}
