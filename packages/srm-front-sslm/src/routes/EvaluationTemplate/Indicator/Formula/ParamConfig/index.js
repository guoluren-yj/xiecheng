/**
 * index - 参数配置
 * @date: 2021-1-20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Drawer, Form, Select, InputNumber, Input, Tooltip, Icon } from 'hzero-ui';
import { isNumber, sum, isEmpty, pullAllBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import EditTable from 'components/EditTable';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import notification from 'utils/notification';

const FormItem = Form.Item;
const { Option } = Select;

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class ParamConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, currentRecord = {} } = this.props;
    const { evalTplIndFmlId = '' } = currentRecord;
    return (
      visible && evalTplIndFmlId && evalTplIndFmlId !== prevProps.currentRecord.evalTplIndFmlId
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.queryParamConfig();
    }
  }

  /**
   * 查询数据
   */
  @Bind()
  queryParamConfig() {
    const { fetchParamConfig = () => {}, currentRecord = {} } = this.props;
    const { evalTplIndFmlId = '' } = currentRecord;
    fetchParamConfig({ evalTplIndFmlId }, (res) => {
      if (res) {
        this.setState({
          dataSource: res,
        });
      }
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const { dataSource } = this.state;
    const newPlatformContactList = dataSource.filter(
      (n) => n.tplIndFmlConfigId !== record.tplIndFmlConfigId
    );
    this.setState({ dataSource: newPlatformContactList });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const { dataSource } = this.state;
    const newPlatformContactList = dataSource.map((item) => {
      if (item.tplIndFmlConfigId === record.tplIndFmlConfigId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    this.setState({ dataSource: newPlatformContactList });
  }

  /**
   * 新增
   */
  @Bind()
  handleAdd() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ _status: 'create', tplIndFmlConfigId: uuidv4() }, ...dataSource],
    });
  }

  /**
   * 接口删除
   */
  @Bind()
  deleteExistRows(selectedRows, newDataSource = []) {
    const { deleteParamConfig = () => {} } = this.props;
    deleteParamConfig(selectedRows, (res) => {
      if (res) {
        // 接口删除成功，前端过滤删除成功的数据
        const newList = pullAllBy(newDataSource, selectedRows, 'tplIndFmlConfigId');
        this.setState({ dataSource: newList, selectedRows: [] });
      } else {
        // 接口删除失败
        this.setState({ dataSource: newDataSource });
      }
    });
  }

  /**
   * 更新数据删除
   */
  @Bind()
  deleteRows(newDataSource) {
    this.setState({ dataSource: newDataSource, selectedRows: [] });
  }

  /**
   * 批量删除
   */
  @Bind()
  handleDelete() {
    const { dataSource, selectedRows } = this.state;
    if (!isEmpty(selectedRows)) {
      // 选中行的新建行
      const newRows = selectedRows.filter((n) => n._status === 'create');
      // 选中行的已有行
      const existRows = selectedRows.filter((n) => n._status !== 'create');

      const newExistRows = existRows.map((item) => {
        const { $form, ...others } = item;
        return others;
      });

      if (isEmpty(newRows)) {
        this.deleteExistRows(newExistRows, dataSource);
      } else if (isEmpty(newExistRows)) {
        const newList = pullAllBy(dataSource, newRows, 'tplIndFmlConfigId');
        this.deleteRows(newList);
        notification.success();
      } else {
        // 先删除勾选新建的数据
        const newList = pullAllBy(dataSource, newRows, 'tplIndFmlConfigId');
        // 接口删除已有数据
        this.deleteExistRows(newExistRows, newList);
      }
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { saveParamConfig = () => {}, currentRecord = {} } = this.props;
    const { dataSource } = this.state;
    const { evalTplIndFmlId = '' } = currentRecord;
    const tableValues = getEditTableData(dataSource, ['tplIndFmlConfigId']);
    const payload = {
      evalTplIndFmlId,
      tableValues,
    };
    if (Array.isArray(tableValues) && tableValues.length !== 0) {
      saveParamConfig(payload, (res) => {
        if (res) {
          this.queryParamConfig();
        }
      });
    }
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  render() {
    const {
      matchRuleList = [],
      onClose = () => {},
      visible,
      formulaDrawerStatus = 'edit',
      currentRecord: { evalTplIndFmlId = '' } = {},
      queryParamConfigLoading = false,
      deleteParamConfigLoading = false,
    } = this.props;
    const { dataSource, selectedRows } = this.state;
    const drawerProps = {
      title: intl.get(`sslm.common.model.formula.paramConfig`).d('参数配置'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose,
      width: 750,
    };

    const columns = [
      {
        title: intl.get('sslm.common.model.formula.param').d('参数'),
        dataIndex: 'tplIndFmlParamId',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('tplIndFmlParamId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.param').d('参数'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSLM_TPL_IND_PARAM"
                  queryParams={{ evalTplIndFmlId, tenantId }}
                  textValue={record.paramField}
                />
              )}
            </FormItem>
          ) : (
            record.paramField
          ),
      },
      {
        title: intl.get('sslm.common.model.formula.condition').d('条件'),
        dataIndex: 'matchRule',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('matchRule', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.condition').d('条件'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {matchRuleList.map((n) => (
                    <Option value={n.value} key={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            record.matchRuleMeaning
          ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get('sslm.common.model.formula.paramFormat')
              .d('参数值可维护固定值或区间，维护区间时请按格式(a,b]、[a,b)、(a,b)、[a,b]')}
          >
            {intl.get('sslm.common.model.formula.paramValue').d('参数值')}
            <Icon type="question-circle-o" style={{ marginLeft: 2 }} />
          </Tooltip>
        ),
        dataIndex: 'matchValue',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('matchValue', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.paramValue').d('参数值'),
                    }),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.common.model.formula.calculateScore').d('计算分值'),
        dataIndex: 'returnValue',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('returnValue', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.model.formula.calculateScore').d('计算分值'),
                    }),
                  },
                ],
              })(<InputNumber precision={2} step={0.01} style={{ width: '100%' }} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.priority').d('优先级'),
        dataIndex: 'orderSeq',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('orderSeq', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.priority').d('优先级'),
                    }),
                  },
                ],
              })(<InputNumber min={1} precision={0} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) => (
          <Fragment>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a
                disabled={formulaDrawerStatus !== 'edit'}
                onClick={() => this.handleEdit(true, record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.tplIndFmlConfigId),
      onChange: this.handleSelectChange,
    };

    return (
      <Drawer {...drawerProps}>
        <div
          style={{
            textAlign: 'right',
            margin: '16px 0',
            display: formulaDrawerStatus === 'edit' ? 'block' : 'none',
          }}
        >
          <Button disabled={isEmpty(selectedRows)} onClick={this.handleDelete}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleAdd}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="tplIndFmlConfigId"
          columns={columns}
          dataSource={dataSource}
          rowSelection={formulaDrawerStatus === 'edit' ? rowSelection : null}
          pagination={false}
          scroll={{ x: scrollX }}
          loading={queryParamConfigLoading || deleteParamConfigLoading}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
