/**
 * SupplierType - 租户级权限维护tab页 - 公司
 * @date: 2018-7-31
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import lodash, { isNil, isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';

import { Button, Form, Input, Tooltip, Checkbox, Icon } from 'hzero-ui';
import Table from '@/components/VirtualTable';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 供应商分类
 * @extends {Component} - React.Component
 * @reactProps {Object} authoritySupplierType - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authoritySupplierType, loading }) => ({
  authoritySupplierType,
  updateLoading: loading.effects['authoritySupplierType/updateSupplierCategory'],
  fetchLoading: loading.effects['authoritySupplierType/querySupplierCategoryAndExpand'],
  refreshLoading: loading.effects['authoritySupplierType/querySupplierCategory'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['hiam.authorityManagement', 'hiam.authority', 'sslm.enterpriseInform'],
})
export default class SupplierType extends PureComponent {
  /**
   *Creates an instance of Company.
   * @param {Object} props 属性
   * @memberof Company
   */
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      queryParams: {},
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'SUPPLIER_CATEGORY' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  componentDidUpdate() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'SUPPLIER_CATEGORY' && !isNil(userId)) {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *刷新数据
   */
  @Bind()
  refreshValue() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { queryParams } = this.state;
    dispatch({
      type: 'authoritySupplierType/querySupplierCategory',
      payload: {
        userId,
        authRoleId,
        ...queryParams,
      },
    });
  }

  /**
   *保存
   */
  @Bind()
  campanySave() {
    const {
      dispatch,
      authoritySupplierType: { checkList = [] },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authoritySupplierType/updateSupplierCategory',
      payload: {
        checkList,
        userId,
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refreshValue();
        notification.success();
      }
    });
  }

  /**
   *查询数据
   */
  @Bind()
  queryValue() {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          queryParams: fieldsValue,
          expanded: false,
        });
        dispatch({
          type: 'authoritySupplierType/querySupplierCategoryAndExpand',
          payload: {
            ...fieldsValue,
            userId,
            authRoleId,
          },
        });
      }
    });
  }

  /**
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked check的value值
   */

  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authoritySupplierType: { head = {} },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authoritySupplierType/addAuthoritySupplierType',
      payload: {
        authorityTypeCode: 'SUPPLIER_CATEGORY',
        userId,
        userAuthority: {
          ...head,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refreshValue();
        notification.success();
      }
    });
  }

  /**
   *设置选中
   *
   * @param {*Array} rows 选中的行
   */
  @Bind()
  setSelectRows(rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'authoritySupplierType/updateCheckList',
      payload: lodash.uniqBy(rows, 'dataId'),
    });
  }

  /**
   *表格选中事件
   *
   * @param {*} _ 占位
   * @param {*Array} rows 选中行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setSelectRows(rows);
  }

  /**
   *点击展开节点触发方法
   *
   * @param {*Boolean} expanded 展开收起标志
   * @param {*Object} record 行记录
   */
  @Bind()
  onExpand(expanded, record = {}) {
    const {
      dispatch,
      authoritySupplierType: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authoritySupplierType/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.dataId)
        : expandedRowKeys.filter((o) => o !== record.dataId),
    });
  }

  /**
   * 处理树形数据子级部分勾选，展示中间状态
   */
  @Bind()
  handleIndeterminate(record) {
    const {
      authoritySupplierType: {
        checkList = [], // 已勾选数据行
        originList = [],
      },
    } = this.props;
    const { dataId } = record;
    // 已选择的行
    const grandCheckedSonList = checkList.filter((list) => {
      return list.levelPath && list.levelPath.split('.').includes(String(dataId));
    });
    // 获取当前分类所有下级分类数量
    const grandAllSonList = originList.filter(
      (list) => list.levelPath && list.levelPath.split('.').includes(String(record.dataId))
    );
    let allSonLength = 0;
    grandAllSonList.forEach((i) => {
      const { childrenCount } = i;
      allSonLength += childrenCount || 0;
    });
    // 获取没勾选子级的数据，（只勾选父级，没有勾选子级的历史数据先不管）
    const noCheckedSonList = grandCheckedSonList.filter((i) => !i.childrenCount);
    // 有下级分类，并且下级分部分勾选父级分类才展示部分勾选状态
    if (allSonLength && grandCheckedSonList.length && !isEmpty(noCheckedSonList)) {
      const allLength = allSonLength + 1; // 加上当前行分类数量
      return allLength !== grandCheckedSonList.length;
    }
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      authoritySupplierType: { originList = [] },
    } = this.props;
    const { expanded } = this.state;
    dispatch({
      type: 'authoritySupplierType/updateExpanded',
      payload: expanded ? originList.map((list) => list.dataId) : [],
    });
    this.setState({
      expanded: !expanded,
    });
  }

  /**
   *选中父级后同时选中子集
   *
   * @param {*Object} record 当前操作的行
   * @param {*boolean} selected 选中标记
   * @param {*Array} selectedRows 已经选中行数据
   */
  @Bind()
  selectChilds(record = {}, selected, selectedRows) {
    const {
      authoritySupplierType: { originList },
    } = this.props;
    const { parentId } = record;
    const grandsonList = originList.filter(
      (list) => list.levelPath && list.levelPath.split('.').includes(String(record.dataId))
    );
    if (selected) {
      // 当前勾选的数据
      let filterSelectedRows = lodash.unionBy(selectedRows, grandsonList, 'dataId');
      // 子级全部勾选，把父级也勾选上
      const handleParentNode = (newparentId) => {
        if (newparentId) {
          // 获取父级分类
          const getParentNode = originList.filter((list) => list.dataId === newparentId);
          // 获取勾选数据中当前分类的同级和上级分类数据
          const grandCheckedPeerList = filterSelectedRows.filter((list) => {
            return list.levelPath && list.levelPath.split('.').includes(String(newparentId));
          });
          // 获取所有数据中当前分类的同级和上级分类数据
          const grandAllPeerList = originList.filter(
            (list) => list.levelPath && list.levelPath.split('.').includes(String(newparentId))
          );
          if (!isEmpty(grandCheckedPeerList) && !isEmpty(grandAllPeerList)) {
            const flag = grandCheckedPeerList.length === grandAllPeerList.length - 1;
            if (flag) {
              filterSelectedRows = lodash.unionBy(filterSelectedRows, getParentNode, 'dataId');
              const { parentId: currentParentId } = getParentNode[0];
              handleParentNode(currentParentId);
            }
          }
        }
      };
      handleParentNode(parentId);
      this.setSelectRows(filterSelectedRows);
    } else {
      // 当前勾选的数据
      let filterSelectedRows = lodash.pullAllBy(selectedRows, grandsonList, 'dataId');
      // 子级取消勾选，父级也取消勾选
      const handleParentNode = (newparentId) => {
        if (newparentId) {
          // 获取勾选数据中当前分类的同级和上级分类数据
          const grandCheckedPeerList = filterSelectedRows.filter((list) => {
            return list.levelPath && list.levelPath.split('.').includes(String(newparentId));
          });
          // 获取所有数据中当前分类的同级和上级分类数据
          const grandAllPeerList = originList.filter(
            (list) => list.levelPath && list.levelPath.split('.').includes(String(newparentId))
          );
          // 当子级部分或者全部取消勾选时，父级也取消勾选
          if (grandAllPeerList.length !== grandCheckedPeerList.length) {
            // 获取当前取消分类的上级分类
            const filterParentList = grandCheckedPeerList.filter(
              (list) => list.dataId === newparentId
            );
            filterSelectedRows = lodash.pullAllBy(filterSelectedRows, filterParentList, 'dataId');
            if (!isEmpty(filterParentList)) {
              const { parentId: currentParentId } = filterParentList[0];
              handleParentNode(currentParentId);
            }
          }
        }
      };
      handleParentNode(parentId);
      this.setSelectRows(filterSelectedRows);
    }
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const { updateLoading } = this.props;
    const { expanded } = this.state;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityCompany.name').d('名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityCompany.dataCode').d('代码')}
        >
          {getFieldDecorator('dataCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem className={styles['right-btn-group']}>
          <Button onClick={() => this.handleExpand()}>
            {expanded
              ? intl.get('hzero.common.button.expand').d('展开')
              : intl.get('hzero.common.button.up').d('收起')}
          </Button>
          <Button type="primary" loading={updateLoading} onClick={() => this.campanySave()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *渲染方法
   *
   * @returns
   */
  render() {
    const {
      queryParams: { userId },
    } = this.props;
    if (isNil(userId)) {
      return (
        <h3 style={{ color: 'gray', marginTop: '10%', textAlign: 'center' }}>
          {intl
            .get('hiam.authorityManagement.model.authorityManagement.noSupport')
            .d('此功能不适用')}
        </h3>
      );
    }
    const {
      fetchLoading = false,
      refreshLoading = false,
      authoritySupplierType: { head = {}, data = [], checkList = [], expandedRowKeys = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.model.supplierClassify.code').d('供应商分类代码'),
        dataIndex: 'dataCode',
        flexGrow: 1,
      },
      {
        title: intl
          .get('sslm.enterpriseInform.model.supplierClassify.describe')
          .d('供应商分类描述'),
        dataIndex: 'dataName',
        width: 400,
        resizable: true,
      },
    ];
    const rowSelection = {
      selectedRowKeys: checkList.map((n) => n.dataId),
      onChange: this.handleSelectRows,
      onSelect: this.selectChilds,
    };
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ display: 'flex', flexDirection: 'row-reverse', margin: '0 24px 16px 0' }}>
          <Tooltip
            title={intl
              .get('hiam.authority.view.message.nullValue.tooltip')
              .d('勾选后，单据中该维度字段为空该用户可查询到')}
          >
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authority.view.message.nullValue').d('包含空值')}
              <Icon type="question-circle" style={{ margin: '0 4px' }} />:
            </span>
            <Checkbox onChange={this.includeNullFlag} checked={head.includeNullFlag || 0} />
          </Tooltip>
        </div>
        <Table
          isTree
          bordered
          rowKey="dataId"
          pagination={false}
          loading={fetchLoading || refreshLoading}
          data={data}
          // autoHeight
          height={600}
          rowSelection={rowSelection}
          expandedRowKeys={expandedRowKeys}
          columns={columns}
          // scroll={{ x: tableScrollWidth(columns) }}
          // rowClassName={record =>
          //   checkList.find(list => list.dataId === record.dataId) ? 'row-active' : 'row-noactive'
          // }
          onExpandChange={this.onExpand}
          handleIndeterminate={this.handleIndeterminate}
        />
      </div>
    );
  }
}
