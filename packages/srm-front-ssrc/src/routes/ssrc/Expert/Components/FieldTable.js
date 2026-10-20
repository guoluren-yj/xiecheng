/**
 * FieldTable - 专业领域
 * @date: 2019-01-22
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Button, Modal, Transfer, message } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import styles from './index.less';

const promptCode = 'ssrc.expert';

class AttributeTable extends PureComponent {
  constructor(props) {
    super(props);
    const { isReq = true, expertReqId, expertId } = props;
    const fieldListName = isReq ? 'fieldReqList' : 'fieldList';
    const rowKey = isReq ? 'expertFieldReqId' : 'expertFieldId';
    const rowKeyValue = isReq ? expertReqId : expertId;
    const selectFieldName = isReq ? 'selectFieldReqs' : 'selectFields';
    this.state = {
      rowKey,
      rowKeyValue,
      fieldListName,
      selectFieldName,
      drawerVisible: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
    this.count = 0;
  }

  componentDidMount() {
    this.remoteHandleInit();
  }

  remoteHandleInit = () => {
    const { remote } = this.props;

    if (remote?.event) {
      remote.event.fireEvent('handleInitFieldCux', { that: this });
    }
  };

  remoteAfterHandleField = () => {
    const { remote } = this.props;

    if (remote?.event) {
      remote.event.fireEvent('handleRefreshFieldAfterOperateFieldCux', { that: this });
    }
  };

  // 获取专业领域穿梭框数据
  @Bind()
  queryTransfer() {
    const { dispatch, modelName = 'expert' } = this.props;
    dispatch({
      type: `${modelName}/queryTransfer`,
      payload: {
        tenantId: getCurrentOrganizationId(),
      },
    });
  }

  // 确定添加专业领域
  @Bind()
  onOk() {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, fieldListName, selectFieldName, rowKeyValue } = this.state;
    // 获取选中的专业领域
    if (
      expert[rowKeyValue] &&
      expert[rowKeyValue][selectFieldName] &&
      expert[rowKeyValue][selectFieldName].length > 0
    ) {
      const fieldList = [];
      const fieldKeys = [];
      const rowKeys = this.state.selectedRowKeys;
      const lastFieldList = expert[rowKeyValue][fieldListName] || [];
      let isfirstFieldFlag = 0;
      for (let i = 0; i < lastFieldList.length; i += 1) {
        if (lastFieldList[i].firstFieldFlag === 1) {
          isfirstFieldFlag = 1;
        }
      }
      expert[rowKeyValue][selectFieldName].map((item) => {
        const keys = item.split('#');
        let index = -1;
        for (let i = 0; i < lastFieldList.length; i += 1) {
          if (lastFieldList[i].fieldCode === keys[0]) {
            index = i;
          }
        }
        if (index === -1) {
          if (isfirstFieldFlag === 1) {
            fieldList.push({
              key: this.count,
              fieldCode: keys[0],
              fieldCodeMeaning: keys[1],
              firstFieldFlag: 0,
              [rowKey]: uuidv4(),
              _status: 'create', // 新建标记位
              tenantId: getCurrentOrganizationId(),
              isDisabled: true,
            });
          } else {
            fieldList.push({
              key: this.count,
              fieldCode: keys[0],
              fieldCodeMeaning: keys[1],
              firstFieldFlag: 0,
              [rowKey]: uuidv4(),
              _status: 'create', // 新建标记位
              tenantId: getCurrentOrganizationId(),
            });
          }
          fieldKeys.push(this.count);
          this.count += 1;
        } else {
          fieldList.push(lastFieldList[index]);
          if (rowKeys.indexOf(lastFieldList[index].key) >= 0) {
            fieldKeys.push(lastFieldList[index].key);
          }
        }
        return fieldList;
      });
      this.setState({ drawerVisible: false, selectedRowKeys: fieldKeys });
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          [rowKeyValue]: {
            ...expert[rowKeyValue],
            [fieldListName]: fieldList,
          },
        },
      });
    } else {
      message.warning(
        intl.get(`${promptCode}.view.message.confirm.selected.field`).d('请选择专业领域！')
      );
    }
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRowKeys 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  // 打开Modal框
  openModal = () => {
    this.queryTransfer();
    this.setState({
      drawerVisible: true,
    });
  };

  // 关闭Modal框
  hideModal = () => {
    this.setState({
      drawerVisible: false,
    });
  };

  // 穿梭框专业领域选中时触发的事件
  handleChange = (targetKeys) => {
    const { rowKeyValue, selectFieldName } = this.state;
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: { [rowKeyValue]: { ...expert[rowKeyValue], [selectFieldName]: targetKeys } },
    });
  };

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, fieldListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][fieldListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [fieldListName]: newDataList,
        },
      },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, fieldListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][fieldListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [fieldListName]: newDataList,
        },
      },
    });
  }

  // 清除行
  @Bind()
  deleteRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { selectedRowKeys, fieldListName, rowKeyValue, selectFieldName } = this.state;
    let newDataList = null;
    for (let i = 0; i <= expert[rowKeyValue][fieldListName].length; i += 1) {
      if (expert[rowKeyValue][fieldListName][i].key === record.key) {
        if (expert[rowKeyValue][fieldListName][i].isDisabled === false) {
          newDataList = expert[rowKeyValue][fieldListName].map((item) => ({
            ...item,
            isDisabled: false,
          }));
          newDataList.splice(i, 1);
        } else {
          expert[rowKeyValue][fieldListName].splice(i, 1);
          newDataList = expert[rowKeyValue][fieldListName];
        }
        break;
      }
    }
    let index = selectedRowKeys.indexOf(record.key);
    if (index >= 0) {
      selectedRowKeys.splice(index, 1);
    }
    index = expert[rowKeyValue][selectFieldName].indexOf(
      `${record.fieldCode}#${record.fieldCodeMeaning}`
    );
    if (index >= 0) {
      expert[rowKeyValue][selectFieldName].splice(index, 1);
    }
    this.setState({ selectedRowKeys });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [fieldListName]: newDataList,
        },
      },
    });

    this.remoteAfterHandleField();
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch, onReload, isReq = true, modelName = 'expert' } = this.props;
    const { selectedRows, rowKey } = this.state;
    const idList = selectedRows.map((o) => o[rowKey]);
    dispatch({
      type: `${modelName}/tableDelete`,
      payload: {
        isReq,
        idList,
        functionName: 'field',
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
        this.setState({ selectedRows: [] });

        this.remoteAfterHandleField();
      }
    });
  }

  // 首要专选只能选一个
  @Bind()
  handleCheckbox(e, record) {
    const { value } = e.target;
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, fieldListName, rowKeyValue } = this.state;
    if (value === 1) {
      const newDataList = expert[rowKeyValue][fieldListName].map((item) => ({
        ...item,
        isDisabled: false,
      }));
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          [rowKeyValue]: {
            ...expert[rowKeyValue],
            [fieldListName]: newDataList,
          },
        },
      });
    } else if (value === 0) {
      const newDataList = expert[rowKeyValue][fieldListName].map((item) =>
        item[rowKey] === record[rowKey] ? item : { ...item, isDisabled: true }
      );
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          [rowKeyValue]: {
            ...expert[rowKeyValue],
            [fieldListName]: newDataList,
          },
        },
      });
    }
  }

  render() {
    const { drawerVisible, selectedRows, fieldListName, selectFieldName, rowKeyValue } = this.state;
    const {
      modelName = 'expert',
      fieldTableCode = '',
      customizeTable = noop,
      remote,
      remotePrefixCode,
    } = this.props;
    const {
      deleting,
      isEdit = true,
      [modelName]: { allField = [] },
      [modelName]: expert = {},
    } = this.props;
    const dataListIdMap = expert[rowKeyValue] || {};
    const dataList = dataListIdMap[fieldListName] || [];
    const selectFieldList = dataListIdMap[selectFieldName] || [];
    const columns = [
      {
        title: intl.get(`${promptCode}.view.message.tab.fieldTable`).d('专业领域'),
        dataIndex: 'fieldCode',
      },
      {
        title: intl.get(`${promptCode}.model.expert.fieldCodeMeaning`).d('领域名称'),
        dataIndex: 'fieldCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.expert.firstFieldFlag`).d('首要专精'),
        dataIndex: 'firstFieldFlag',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('firstFieldFlag', {
                  initialValue: record.firstFieldFlag,
                })(
                  <Checkbox
                    disabled={record.isDisabled}
                    onChange={(e) => this.handleCheckbox(e, record)}
                  />
                )}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val);
          }
        },
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.deleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      });
    }
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };

    let buttons = [
      <Button name="add" type="primary" style={{ marginRight: 8 }} onClick={this.openModal}>
        {intl.get(`${promptCode}.view.message.toolTip.field.create`).d('新增领域')}
      </Button>,
      <Button
        name="delete"
        loading={deleting}
        disabled={isEmpty(selectedRows)}
        onClick={this.handleDelete}
      >
        {intl.get(`${promptCode}.view.message.toolTip.field.delete`).d('删除领域')}
      </Button>,
    ];

    buttons =
      remote && remotePrefixCode
        ? remote.process(`${remotePrefixCode}_HEADER_BUTTONS`, buttons, {
            that: this,
          })
        : buttons;

    return (
      <React.Fragment>
        {isEdit && (
          <div className={styles['item-list-search']}>
            <Form layout="inline">{buttons}</Form>
          </div>
        )}
        {customizeTable(
          {
            code: fieldTableCode,
          },
          <EditTable
            rowKey={(record) => record.key}
            dataSource={dataList}
            columns={columns}
            bordered
            pagination={false}
            rowSelection={isEdit ? rowSelection : null}
          />
        )}
        <Modal
          title={intl.get(`${promptCode}.view.message.toolTip.field.switch`).d('专业领域选择')}
          visible={drawerVisible}
          onOk={this.onOk}
          onCancel={this.hideModal}
          width="900px"
        >
          <Transfer
            listStyle={{
              width: 400,
              height: 400,
            }}
            dataSource={allField}
            showSearch
            targetKeys={selectFieldList}
            onChange={this.handleChange}
            render={(item) => `${item.meaning}`}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return connect(({ expert, loading }) => ({
    expert,
    modelName: 'expert',
    deleting: loading.effects['expert/tableDelete'],
  }))(Comp);
};

export default HOCComponent(AttributeTable);

export { HOCComponent, AttributeTable };
