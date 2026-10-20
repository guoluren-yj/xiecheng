import React, { PureComponent } from 'react';
import { Button, Drawer, Row, Col } from 'hzero-ui';
import { isString, uniqBy, isFunction, isEmpty, find } from 'lodash';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import List from './List';
// import styles from './index.less';

// 设置通用国际化前缀
const defaultTableRowKey = 'indicatorFmlId';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // formDataSource: {},
      dataSource: [],
      pagination: {},
      editableRows: [],
    };

    // 方法注册
    [
      'cancel',
      'add',
      'handleFetchFormulaList',
      'cancelEditing',
      'deleteNewRow',
      'setRowEditable',
      'save',
      'onTableChange',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, indicatorRowDataSource = {} } = this.props;
    const { indicatorId } = indicatorRowDataSource;
    return visible && indicatorId && indicatorId !== prevProps.indicatorRowDataSource.indicatorId;
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchFormulaList();
    }
  }

  /**
   * handleFetchFormulaList - 查询公式列表数据
   * @param {Object} [params={}] - 查询参数
   */
  handleFetchFormulaList(params = {}) {
    const { fetchFormulaList } = this.props;
    fetchFormulaList(params, (res) => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          editableRows: [],
          dataSource,
          pagination,
        });
      }
    });
  }

  /**
   * save - 保存公式
   */
  save() {
    const { saveIndicatorFmls = (e) => e, indicatorRowDataSource } = this.props;
    const { editableRows = [] } = this.state;
    const tableRowFormsCache = (this.list || {}).tableRowForms;
    if (!isEmpty(editableRows)) {
      Promise.all(
        editableRows.map((o) =>
          (() =>
            new Promise((resolve, reject) => {
              const item = find(tableRowFormsCache, (p) => p.key === o.key) || {};
              if (!isEmpty(item)) {
                const { validateFields } = ((item.row || {}).props || {}).form;
                if (isFunction(validateFields)) {
                  validateFields((error, values) => {
                    if (isEmpty(error)) {
                      resolve({
                        ...(o.defaultRowDataSource || {}),
                        ...values,
                        enabledFlag: values.enabledFlag ? 1 : 0,
                      });
                    } else {
                      reject(error);
                    }
                  });
                }
              }
            }))()
        )
      )
        .then((result) => {
          saveIndicatorFmls(indicatorRowDataSource.indicatorId, result, () => {
            this.handleFetchFormulaList();
          });
        })
        .catch((error) => {
          throw error;
        });
    }
  }

  /**
   * onTableChange - 查询公式列表数据
   * @param {Object} [page={}] - 分页参数
   */
  onTableChange(page) {
    // const { getFieldsValue = () => {} } = (this.search || {}).props;
    this.handleFetchFormulaList({ page });
  }

  /**
   * cancel - 关闭公式抽屉
   */
  cancel() {
    const { close = (e) => e } = this.props;
    // const { resetFields = e => e } = this.editorForm;
    // resetFields();
    this.setState({
      dataSource: [],
      pagination: {},
      editableRows: [],
    });
    close();
  }

  /**
   * add - 新增行
   */
  add() {
    const { editableRows = [], dataSource = [], pagination = {} } = this.state;
    const key = uuidv4();
    const item = {
      [defaultTableRowKey]: key,
      enabledFlag: 1,
    };
    const newDataSource = dataSource.concat(item);
    this.setState({
      editableRows: editableRows.concat({ key }),
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
  cancelEditing(key) {
    const { editableRows = [] } = this.state;
    this.setState({
      editableRows: editableRows.filter((o) => o.key !== key),
    });
  }

  /**
   * deleteNewRow - 删除新建行
   * @param {number} key - 行数据(主键)key
   */
  deleteNewRow(key) {
    const { dataSource = [], editableRows = [], pagination } = this.state;
    if (isString(key)) {
      const newPageSize = (pagination.pageSize || 10) - 1;
      this.setState({
        dataSource: dataSource.filter((o) => o[defaultTableRowKey] !== key),
        editableRows: editableRows.filter((o) => o.key !== key),
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
  setRowEditable(defaultRowDataSource) {
    const { editableRows = [] } = this.state;
    this.setState({
      editableRows: uniqBy(
        editableRows.concat({ key: defaultRowDataSource[defaultTableRowKey], defaultRowDataSource })
      ),
    });
  }

  render() {
    const { visible, processing = {}, indicatorRowDataSource = {} } = this.props;
    const { dataSource, pagination, editableRows } = this.state;

    const title = intl
      .get(`spfm.supplierKpiIndicator.view.title.formulaConfiguration`)
      .d('公式配置');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 750,
    };

    const { indicatorCode, indicatorName } = indicatorRowDataSource;

    const listProps = {
      ref: (node) => {
        this.list = node;
      },
      dataSource,
      pagination,
      openDetail: this.openDetail,
      loading: processing.queryFormulaListLoading,
      defaultTableRowKey,
      editableRows,
      setRowEditable: this.setRowEditable,
      cancelEditing: this.cancelEditing,
      deleteNewRow: this.deleteNewRow,
      onChange: this.onTableChange,
    };

    return (
      <Drawer {...drawerProps}>
        <div className="action">
          <Button type="primary" onClick={this.add}>
            {intl.get(`spfm.supplierKpiIndicator.view.button.add`).d('新增')}
          </Button>
        </div>
        <br />
        <Row>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl
                  .get(`spfm.supplierKpiIndicator.model.supplierKpiIndicator.code`)
                  .d('指标编码')}
                :
              </Col>

              <Col span={18}>{indicatorCode}</Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={6}>
                {intl
                  .get(`spfm.supplierKpiIndicator.model.supplierKpiIndicator.name`)
                  .d('指标名称')}
                :
              </Col>
              <Col span={18}>{indicatorName}</Col>
            </Row>
          </Col>
        </Row>
        <br />
        <List {...listProps} />
        <br />
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
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          {!isEmpty(editableRows) && (
            <Button
              type="primary"
              loading={processing.saveIndicatorFmlsLoading}
              onClick={this.save}
            >
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          )}
        </div>
      </Drawer>
    );
  }
}
