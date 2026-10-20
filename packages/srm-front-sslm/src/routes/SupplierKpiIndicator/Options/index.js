import React, { PureComponent } from 'react';
import { Button, Drawer, Row, Col, Form, Input, InputNumber } from 'hzero-ui';
import { isString, cloneDeep } from 'lodash';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';

const defaultTableRowKey = 'indicatorOptId';

const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;
@formatterCollections({
  code: ['spfm.supplierKpiIndicator'],
})
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, indicatorRowDataSource = {} } = this.props;
    const { indicatorId } = indicatorRowDataSource;
    return visible && indicatorId && indicatorId !== prevProps.indicatorRowDataSource.indicatorId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchOptionsList();
    }
  }

  /**
   * handleFetchOptionsList - 查询选项配置数据
   * @param {Object} [params={}] - 查询参数
   */
  @Bind()
  handleFetchOptionsList(params = {}) {
    const { fetchOptionsList } = this.props;
    fetchOptionsList(params, (res) => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          dataSource,
          pagination,
        });
      }
    });
  }

  /**
   * save - 保存选项配置
   */
  @Bind()
  save() {
    const {
      saveIndicatorOpls = (e) => e,
      indicatorRowDataSource: { indicatorId },
    } = this.props;
    const { dataSource } = this.state;
    const params = getEditTableData(dataSource, ['indicatorOptId']);
    if (Array.isArray(params) && params.length !== 0) {
      saveIndicatorOpls(indicatorId, params, () => {
        this.handleFetchOptionsList();
      });
    }
  }

  /**
   * onTableChange - 查询选项配置数据
   * @param {Object} [page={}] - 分页参数
   */
  @Bind()
  onTableChange(page) {
    this.handleFetchOptionsList({ page });
  }

  /**
   * cancel - 关闭选项配置抽屉
   */
  @Bind()
  cancel() {
    const { close = (e) => e } = this.props;
    this.setState({
      dataSource: [],
      pagination: {},
    });
    close();
  }

  /**
   * add - 新增行
   */
  @Bind()
  add() {
    const {
      indicatorRowDataSource: { indicatorId },
    } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    const key = uuidv4();
    const item = {
      [defaultTableRowKey]: key,
      enabledFlag: 1,
      tenantId,
      indicatorId,
      _status: 'create',
    };
    const newDataSource = dataSource.concat(item);
    this.setState({
      dataSource: newDataSource,
      pagination: {
        ...pagination,
        pageSize:
          newDataSource.length > (pagination.pageSize || 10)
            ? (pagination.pageSize || 10) + 1
            : pagination.pageSize,
      },
    });
  }

  /**
   * cancelEditing - 取消编辑
   * @param {number} key - 行数据(主键)key
   */
  cancelEditing(record, idx) {
    const { _status, ...others } = record;
    const newDataSource = cloneDeep(this.state.dataSource);
    newDataSource.splice(idx, 1, others);
    this.setState({
      dataSource: newDataSource,
    });
  }

  /**
   * deleteNewRow - 删除新建行
   * @param {number} key - 行数据(主键)key
   */
  @Bind()
  deleteNewRow(key) {
    const { dataSource = [], pagination } = this.state;
    if (isString(key)) {
      const newPageSize = (pagination.pageSize || 10) - 1;
      this.setState({
        dataSource: dataSource.filter((o) => o[defaultTableRowKey] !== key),
        pagination: {
          ...pagination,
          pageSize: newPageSize < 10 ? 10 : newPageSize,
        },
      });
    }
  }

  /**
   * setRowEditable - 设置行是否可编辑
   * @param {number} key - 行数据(主键)key
   */
  @Bind()
  setRowEditable(defaultRowDataSource, idx) {
    const { dataSource } = this.state;
    const newDataSource = [...dataSource];
    newDataSource[idx]._status = 'update';
    this.setState({
      dataSource: newDataSource,
    });
  }

  /**
   * operiationRender - 操作记录render方法
   * @param {String} text - 显示字段
   * @param {object} record - 当前行数据
   */
  @Bind()
  operiationRender(_text, record, idx) {
    const {
      deleteIndicatorOpls = (e) => e,
      processing: { saveIndicatorOplsLoading, deleteIndicatorOplsLoading },
    } = this.props;
    let result = (
      <React.Fragment>
        <a
          onClick={() => this.setRowEditable(record, idx)}
          disabled={deleteIndicatorOplsLoading || saveIndicatorOplsLoading}
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
        <a
          style={{
            color: deleteIndicatorOplsLoading || saveIndicatorOplsLoading ? '#ccc' : 'red',
            marginLeft: '15px',
          }}
          onClick={() => deleteIndicatorOpls(record, this.handleFetchOptionsList)}
          disabled={deleteIndicatorOplsLoading || saveIndicatorOplsLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      </React.Fragment>
    );
    if (['update', 'create'].includes(record._status)) {
      result =
        record._status === 'create' ? (
          <a
            onClick={() => this.deleteNewRow(record[defaultTableRowKey])}
            disabled={deleteIndicatorOplsLoading || saveIndicatorOplsLoading}
          >
            {intl.get('hzero.common.button.clear').d('清除')}
          </a>
        ) : (
          <a
            onClick={() => this.cancelEditing(record, idx)}
            disabled={deleteIndicatorOplsLoading || saveIndicatorOplsLoading}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </a>
        );
    }
    return result;
  }

  /**
   * getColumns - 组装columns
   */
  @Bind()
  getColumns() {
    return [
      {
        title: intl.get('spfm.supplierKpiIndicator.model.supplier.optName').d('选项名称'),
        dataIndex: 'optName',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('optName', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.supplierKpiIndicator.model.supplier.optName')
                          .d('选项名称'),
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.supplierKpiIndicator.model.supplier.score').d('分值'),
        dataIndex: 'score',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('score', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spfm.supplierKpiIndicator.model.supplier.score').d('分值'),
                      }),
                    },
                  ],
                })(<InputNumber />)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.sequence').d('排序号'),
        dataIndex: 'sequence',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('sequence', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('spfm.supplierKpiIndicator.model.suKpiIn.sequence')
                          .d('排序号'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    formatter={(value) => (value ? Math.floor(value) : value)}
                    parser={(value) => (value ? Math.floor(value) : value)}
                    min={0}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.table.column.options').d('操作'),
        width: 150,
        render: this.operiationRender,
      },
    ];
  }

  render() {
    const { visible, processing = {}, indicatorRowDataSource = {} } = this.props;
    const { dataSource, pagination } = this.state;

    const title = intl
      .get('spfm.supplierKpiIndicator.view.title.optionsConfiguration')
      .d('选项配置');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 800,
    };

    const { indicatorCode, indicatorName } = indicatorRowDataSource;

    const tableProps = {
      dataSource,
      onRow: this.onTableRow,
      columns: this.getColumns(),
      rowKey: defaultTableRowKey,
      bordered: true,
      pagination,
      loading: processing.queryOptionsListLoading,
      onChange: this.onTableChange,
    };

    return (
      <Drawer {...drawerProps}>
        <Row>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码')}:
              </Col>

              <Col span={18}>{indicatorCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称')}:
              </Col>
              <Col span={18}>{indicatorName}</Col>
            </Row>
          </Col>
        </Row>
        <div style={{ textAlign: 'right', margin: '16px 0' }}>
          <Button type="primary" onClick={this.add}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        <EditTable {...tableProps} />
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
          <Button onClick={this.cancel} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button type="primary" loading={processing.saveIndicatorOplsLoading} onClick={this.save}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
