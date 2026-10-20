import React from 'react';
import { Form, Input, InputNumber, Popconfirm, Switch } from 'hzero-ui';
import { map } from 'lodash';
import { Bind } from 'lodash-decorators';

import EditTable from 'components/EditTable';

import { operatorRender, TagRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const FormItem = Form.Item;

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
        dataSource: map(dataSource, record => {
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
        prevDataSource: dataSource,
      };
    }
    return null;
  }

  @Bind()
  edit(editableKey) {
    const { dataSource = [] } = this.state;
    this.setState({
      editableKey,
      dataSource: dataSource.map(rd =>
        // eslint-disable-next-line no-nested-ternary
        rd._id === editableKey
          ? { ...rd, _status: 'update' }
          : rd._status
          ? { ...rd, _status: '' }
          : rd
      ),
    });
  }

  @Bind()
  cancel() {
    const { dataSource = [] } = this.state;
    this.setState({
      editableKey: null,
      dataSource: dataSource.map(rd => (rd._status ? { ...rd, _status: '' } : rd)),
    });
  }

  @Bind()
  handleSave(form, _id) {
    const { save = e => e } = this.props;
    save(form, _id, this.cancel);
  }

  @Bind()
  handleRemove(_id) {
    const { onRemove } = this.props;
    onRemove(_id, this.cancel);
  }

  @Bind()
  editRender(text, record) {
    const { editableKey } = this.state;
    const operators = [];
    if (editableKey === record._id && record._status) {
      const { $form: form } = record;
      operators.push({
        key: 'save',
        ele: (
          <a onClick={() => this.handleSave(form, record._id)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </a>
        ),
        len: 2,
        title: intl.get('hzero.common.button.save').d('保存'),
      });
      operators.push({
        key: 'cancel',
        ele: (
          <Popconfirm
            title={intl.get(`himp.comment.view.message.title.sureToCancel`).d('确定取消编辑？')}
            onConfirm={() => this.cancel()}
          >
            <a>{intl.get('hzero.common.button.cancel').d('取消')}</a>
          </Popconfirm>
        ),
        len: 2,
        title: intl.get('hzero.common.button.cancel').d('取消'),
      });
    } else if (!record.imported) {
      operators.push({
        key: 'edit',
        ele: (
          <a onClick={() => this.edit(record._id)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
        len: 2,
        title: intl.get('hzero.common.button.edit').d('编辑'),
      });
    }
    return operatorRender(operators, record);
  }

  @Bind()
  getDynamicColumns() {
    const { dynamicColumns = [] } = this.props;
    const { editableKey, dataSource = [] } = this.state;
    return dynamicColumns.map(n => ({
      title: n.title,
      dataIndex: n.dataIndex,
      width: dataSource.some(o => o._id === editableKey) || !n.width ? 180 : n.width,
      render: (text, record) => {
        const { $form: form } = record;
        // when editableKey is equal record._id, it can edit, but, check _status to decide it can edit
        return editableKey === record._id && record._status ? (
          <FormItem style={{ margin: 0 }}>
            {form.getFieldDecorator(n.dataIndex, {
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
    const dynamicColumns = this.getDynamicColumns();
    const beforeColumns = [
      {
        title: intl.get('himp.comment.model.comment.dataStatus').d('数据状态'),
        dataIndex: '_dataStatus',
        width: 120,
        fixed: 'left',
        render: _dataStatus => {
          const { importStatus = [] } = this.props;
          const statusList = [
            { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
            { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
            { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
            { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
            { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
            { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
          ];
          return (
            <div>
              {TagRender(
                _dataStatus,
                importStatus.map(item => {
                  const tagItem = statusList.find(t => t.status === item.value) || {};
                  return {
                    status: item.value,
                    text: item.meaning,
                    color: tagItem.color,
                  };
                })
              )}
            </div>
          );
        },
      },
      {
        title: intl.get('himp.comment.model.comment.message').d('信息'),
        dataIndex: '_info',
      },
    ];
    const afterColumns = [
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        key: '_operator',
        render: this.editRender,
        fixed: 'right',
      },
    ];
    const tableColumns = [...beforeColumns, ...dynamicColumns, ...afterColumns];
    const tableProps = {
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
    return <EditTable {...tableProps} />;
  }
}
