/**
 * index.js - 对账单价修改规则
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Drawer, Tabs, Table, Row, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import uuid from 'uuid/v4';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import FilterForm from './FilterForm';
import styles from './index.less';

const { TabPane } = Tabs;

@connect(({ loading, billUpdateRule }) => ({
  billUpdateRule,
  tenantId: getCurrentOrganizationId(),
  loading: loading.effects['billUpdateRule/queryRuleLines'],
}))
@formatterCollections({
  code: ['sodr.billUpdateRule', 'entity.company', 'entity.supplier'],
})
export default class BillUpdateRule extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 查询表单引用对象
    this.state = {
      activeKey: '', // 当前激活的业务类型 Tab key 值
      selectedRows: [], // 选中的供应商明细行列表
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'billUpdateRule/queryRules',
    }).then((res) => {
      if (res && res[0].ruleId) {
        this.setState(
          {
            activeKey: res[0].ruleId,
          },
          () => {
            this.handleSearch();
          }
        );
      }
    });
  }

  /**
   * 查询对账单价修改规则头列表
   */
  @Bind()
  handleQueryRules() {
    const { dispatch } = this.props;
    dispatch({
      type: 'billUpdateRule/queryRules',
    });
  }

  /**
   * 查询对账单价修改规则明细供应商列表
   * @param {Object} page - 分页信息
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    const values = filterNullValueObject(this.filterForm.props.form.getFieldsValue());

    dispatch({
      type: 'billUpdateRule/queryRuleLines',
      payload: {
        page,
        ruleId: activeKey,
        ...values,
      },
    });
  }

  /**
   * 获得 FilterForm 的组件实例
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  /**
   * 根据 ruleId 即当前 Tab 页开票对账规则明细行数据
   * @param {String} activeKey - 查询业务类型的明细
   */
  @Bind()
  handleTabChange(activeKey) {
    const {
      billUpdateRule: { detailList },
    } = this.props;
    const content = detailList[activeKey] && detailList[activeKey].content;
    this.setState(
      {
        activeKey,
      },
      () => {
        if (isEmpty(content)) {
          this.handleSearch();
        }
      }
    );
  }

  /**
   * 当前 Tab 页是否启用滑动按钮回调
   * @param {Number} flag - 是否启用数值，启用为 1，禁用为 0
   */
  @Bind()
  enableOnChange(flag) {
    const { activeKey } = this.state;
    const {
      dispatch,
      billUpdateRule: { ruleList },
    } = this.props;

    const updateData = ruleList.map((item) => {
      console.log(activeKey, item.ruleId, flag);
      return item.ruleId.toString() === activeKey.toString()
        ? {
            ...item,
            enabledFlag: flag ? 1 : 0,
          }
        : item;
    });
    dispatch({
      type: 'billUpdateRule/updateRules',
      payload: updateData,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 当前 Tab 页是否加入全部滑动按钮回调
   * @param {Number} flag - 是否加入全部值，启用为 1，禁用为 0
   */
  @Bind()
  selectAllOnChange(flag) {
    const { activeKey } = this.state;
    const {
      dispatch,
      billUpdateRule: { ruleList },
    } = this.props;
    const updateData = ruleList.map((item) => {
      return item.ruleId.toString() === activeKey.toString()
        ? {
            ...item,
            includeAllFlag: flag ? 1 : 0,
          }
        : item;
    });

    dispatch({
      type: 'billUpdateRule/updateRules',
      payload: updateData,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 保存对账单价修改规则明细行数据
   */
  @Bind()
  handleSaveDetail() {
    const { activeKey } = this.state;
    const {
      dispatch,
      tenantId,
      billUpdateRule: { detailList },
    } = this.props;
    const saveData = detailList[activeKey].content
      .filter((item) => !item.objectVersionNumber)
      .map((item) => {
        const { supplierCompanyId, supplierTenantId } = item;
        return {
          ruleDetailId: null,
          ruleId: activeKey,
          supplierCompanyId,
          supplierTenantId,
          tenantId,
        };
      });
    if (!isEmpty(saveData)) {
      dispatch({
        type: 'billUpdateRule/saveRuleLines',
        payload: saveData,
      }).then((res) => {
        if (res) {
          this.handleSearch();
          notification.success();
        }
      });
    }
  }

  /**
   * 删除对账单价修改规则供应商明细行数据
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      billUpdateRule: { detailList, pagination },
    } = this.props;
    const { selectedRows, activeKey } = this.state;
    const deleteRowIds = selectedRows
      .filter((item) => !!item.objectVersionNumber)
      .map((item) => item.ruleDetailId);
    const sourceActiveData = detailList[activeKey].content;
    const sourceActivePage = pagination[activeKey];
    const newDetailList = {
      ...detailList,
      [activeKey]: {
        ...sourceActiveData,
        content: sourceActiveData.filter(
          (item) =>
            selectedRows.findIndex(
              (e) => e.supplierCompanyNumber === item.supplierCompanyNumber
            ) === -1
        ),
      },
    };
    const newPagination = {
      ...pagination,
      [activeKey]: {
        ...sourceActivePage,
        total: sourceActivePage.total - selectedRows.length,
        // pageSize: sourceActivePage.pageSize - selectedRows.length,
      },
    };

    if (!isEmpty(deleteRowIds)) {
      dispatch({
        type: 'billUpdateRule/deleteRuleLines',
        payload: {
          ruleId: activeKey,
          body: deleteRowIds,
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
    }

    dispatch({
      type: 'billUpdateRule/updateState',
      payload: {
        detailList: newDetailList,
        pagination: newPagination,
      },
    });
  }

  /**
   * 增加对账单价修改规则供应商明细行数据
   */
  @Bind()
  handleAdd(record) {
    const {
      dispatch,
      billUpdateRule: { detailList, pagination },
    } = this.props;
    const { activeKey } = this.state;
    const sourceActiveData = detailList[activeKey];
    const sourceActivePage = pagination[activeKey];
    const isNew =
      sourceActiveData.content.findIndex(
        (item) => item.supplierCompanyNumber === record.supplierCompanyCode
      ) === -1;

    if (isNew) {
      const newDetailList = {
        ...detailList,
        [activeKey]: {
          ...sourceActiveData,
          content: [
            {
              ...record,
              supplierCompanyNumber: record.supplierCompanyCode,
              ruleId: activeKey,
              ruleDetailId: uuid(),
            },
            ...sourceActiveData.content,
          ],
        },
      };
      const newPagination = {
        ...pagination,
        [activeKey]: {
          ...sourceActivePage,
          total: sourceActivePage.total + 1,
          // pageSize: sourceActivePage.pageSize + 1,
        },
      };

      dispatch({
        type: 'billUpdateRule/updateState',
        payload: {
          detailList: newDetailList,
          pagination: newPagination,
        },
      });
    }
  }

  /**
   * 列表勾选回调
   * @param {*} _
   * @param {Array} selectedRows - 选中的列表项
   */
  @Bind()
  handleSelectRows(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('billUpdateRuleVisible', false);
    }
  }

  render() {
    const {
      visible = false,
      loading,
      tenantId,
      billUpdateRule: { ruleList = [], detailList = {}, pagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.ruleDetailId),
      onChange: this.handleSelectRows,
    };

    const columns = [
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        width: 300,
        dataIndex: 'supplierCompanyNumber',
      },
    ];
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    return (
      <Drawer
        destroyOnClose
        placement="right"
        width={1000}
        // closable={false}
        onClose={this.hideModal}
        visible={visible}
        style={{ padding: 0 }}
      >
        <Tabs onChange={this.handleTabChange} animated={false} className={styles['ant-tab']}>
          {ruleList.map((item) => {
            const dataSource = (detailList[item.ruleId] && detailList[item.ruleId].content) || [];

            return (
              <TabPane tab={item.consignmentTypeMeaning} key={item.ruleId}>
                <div className="table-list-search">
                  <FilterForm {...filterProps} />
                  <Row style={{ marginTop: 16, lineHeight: '28px' }}>
                    <span style={{ marginRight: 16 }}>
                      {intl.get('sodr.billUpdateRule.view.option.enabledFlag').d('是否启用')}：
                      <Checkbox
                        unCheckedValue={0}
                        checkedValue={1}
                        defaultChecked={item.enabledFlag}
                        onChange={(e) => this.enableOnChange(e.target.checked)}
                      />
                    </span>
                    <span style={{ marginRight: 8 }}>
                      {intl.get('sodr.billUpdateRule.model.common.includeAllFlag').d('加入全部')}：
                      <Checkbox
                        unCheckedValue={0}
                        checkedValue={1}
                        defaultChecked={item.includeAllFlag}
                        onChange={(e) => this.selectAllOnChange(e.target.checked)}
                      />
                    </span>
                    <div style={{ float: 'right' }}>
                      <Button
                        style={{ marginRight: 8 }}
                        onClick={this.handleDelete}
                        disabled={selectedRows.length === 0}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </Button>
                      <Lov
                        isButton
                        code="SPFM.USER_AUTH.SUPPLIER"
                        onOk={this.handleAdd}
                        queryParams={{ tenantId }}
                      >
                        {intl.get('hzero.common.button.add').d('新增')}
                      </Lov>
                      <Button
                        style={{ marginLeft: 8 }}
                        type="primary"
                        onClick={this.handleSaveDetail}
                      >
                        {intl.get('hzero.common.button.save').d('保存')}
                      </Button>
                    </div>
                  </Row>
                </div>
                <Table
                  bordered
                  rowSelection={rowSelection}
                  loading={loading}
                  rowKey="ruleDetailId"
                  dataSource={dataSource}
                  columns={columns}
                  pagination={pagination[item.ruleId] || {}}
                  onChange={this.handleSearch}
                />
              </TabPane>
            );
          })}
        </Tabs>
        {/* <div
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
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={this.hideModal}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </div> */}
      </Drawer>
    );
  }
}
