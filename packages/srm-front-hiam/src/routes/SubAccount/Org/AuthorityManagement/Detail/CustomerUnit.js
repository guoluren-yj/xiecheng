/**
 * CustomerUnit - 租户级权限维护tab页 - 客户业务实体
 * @date: 2018-7-31
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import lodash, { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Form, Input, Row, Col, Tooltip, Switch } from 'hzero-ui';
import Table from '@/components/VirtualTable';

import { Button as ButtonPermission } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 租户级权限管理 - 客户业务实体
 * @extends {Component} - React.Component
 * @reactProps {Object} authorityCompany - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ authorityCustomerUnitSrm, loading }) => ({
  authorityCustomerUnitSrm,
  updateLoading: loading.effects['authorityCustomerUnitSrm/updateAuthorityCustomerUnit'],
  fetchLoading: loading.effects['authorityCustomerUnitSrm/fetchAuthorityCustomerUnitAndExpand'],
  fetchHeaderLoading: loading.effects['authorityCustomerUnitSrm/fetchHeader'],
  updateFlagLoading: loading.effects['authorityPurorg/addAuthorityPurorg'],
  refreshLoading: loading.effects['authorityCustomerUnitSrm/fetchAuthorityCustomerUnit'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.authorityManagement', 'hiam.authority'] })
export default class CustomerUnit extends React.Component {
  /**
   *Creates an instance of CustomerUnit.
   * @param {Object} props 属性
   * @memberof CustomerUnit
   */
  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      queryParams: {},
      checkListState: [],
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const { authRoleId, activeKey } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'CUSTOMER') {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  componentDidUpdate() {
    const { authRoleId, activeKey } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'CUSTOMER') {
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
      type: 'authorityCustomerUnitSrm/fetchAuthorityCustomerUnit',
      payload: {
        userId,
        authRoleId,
        ...queryParams,
      },
    }).then(() => {
      const {
        authorityCustomerUnitSrm: { checkList = [] },
      } = this.props;
      this.setState({
        checkListState: checkList,
      });
    });
  }

  /**
   *保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      authRoleId,
      authorityCustomerUnitSrm: { checkList = [] },
      queryParams: { userId },
    } = this.props;
    const { checkListState } = this.state;
    const newCheckList = lodash.xorWith(
      checkList,
      checkListState,
      lodash.isEqualWith((cl, cls) => cl.id === cls.id)
    );
    const newList = newCheckList.map((e) => {
      if (checkList.find((v) => v.id === e.id)) {
        return {
          ...e,
          checkedFlag: 1,
        };
      }
      return {
        ...e,
        checkedFlag: 0,
      };
    });
    dispatch({
      type: 'authorityCustomerUnitSrm/updateAuthorityCustomerUnit',
      payload: {
        checkList: lodash.uniqBy(newList, 'id'),
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
          type: 'authorityCustomerUnitSrm/fetchHeader',
          payload: {
            authorityTypeCode: 'CUSTOMER',
            userId,
          },
        });
        dispatch({
          type: 'authorityCustomerUnitSrm/fetchAuthorityCustomerUnitAndExpand',
          payload: {
            ...fieldsValue,
            userId,
            authRoleId,
          },
        }).then(() => {
          const {
            authorityCustomerUnitSrm: { checkList = [] },
          } = this.props;
          this.setState({
            checkListState: checkList,
          });
        });
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
      type: 'authorityCustomerUnitSrm/updateCheckList',
      payload: lodash.uniqBy(rows, 'id'),
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
      authorityCustomerUnitSrm: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authorityCustomerUnitSrm/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.id)
        : expandedRowKeys.filter((o) => o !== record.id),
    });
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      authorityCustomerUnitSrm: { originList = [] },
    } = this.props;
    const { expanded } = this.state;
    dispatch({
      type: 'authorityCustomerUnitSrm/updateExpanded',
      payload: expanded ? originList.map((list) => list.id) : [],
    });
    this.setState({
      expanded: !expanded,
    });
  }

  /**
   * 获取子节点类型
   *
   * @param {*Object} parentType 父级类型
   * @returns
   */
  @Bind()
  findChildType(parentType) {
    let childType = null;
    if (parentType === 'CUSTOMER') {
      childType = 'CUSTOMER_OU';
    } else {
      childType = null;
    }
    return childType;
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
      authorityCustomerUnitSrm: { originList },
    } = this.props;
    const childType = this.findChildType(record.typeCode);
    let grandsonList = [];
    const childLists = originList.filter(
      (list) => list.parentId === record.dataId && list.typeCode && list.typeCode === childType
    );
    childLists.map((childList) => {
      const grandsonType = this.findChildType(childList.typeCode);
      grandsonList = lodash.unionWith(
        grandsonList,
        originList.filter(
          (list) =>
            list.parentId === childList.dataId && list.typeCode && list.typeCode === grandsonType
        )
      );
      return grandsonList;
    });
    const parentList = this.getParentList(
      record.parentId,
      this.findParentType(record.typeCode),
      originList
    );
    if (selected) {
      this.setSelectRows(
        lodash.unionWith(
          parentList,
          lodash.unionWith(lodash.unionWith(selectedRows, childLists), grandsonList)
        )
      );
    } else {
      this.setSelectRows(
        lodash.pullAllBy(lodash.pullAllBy(selectedRows, childLists, 'id'), grandsonList, 'id')
      );
    }
  }

  @Bind()
  getParentList(parentId, parentTypeCode, originList, oldList = []) {
    if (lodash.isNil(parentId)) {
      return oldList;
    }
    const obj = originList.find(
      (list) => parentId === list.dataId && list.typeCode && list.typeCode === parentTypeCode
    );
    let resArr = oldList;
    if (obj) {
      resArr = resArr.concat([lodash.omit(obj, 'children')]);
      const parentCode = this.findParentType(obj.typeCode);
      return this.getParentList(obj.parentId, parentCode, originList, resArr);
    }
    return oldList;
  }

  /**
   * 获取父节点类型
   *
   * @param {*Object} childType 子级类型
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  findParentType(childType) {
    let parentType = null;
    if (childType === 'CUSTOMER_OU') {
      parentType = 'CUSTOMER';
    } else {
      parentType = null;
    }
    return parentType;
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  includeAllFlag(checked) {
    const {
      dispatch,
      queryParams: { userId },
      authorityCustomerUnitSrm: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityPurorg/addAuthorityPurorg',
      payload: {
        authorityTypeCode: 'CUSTOMER',
        userId,
        userAuthority: {
          ...header,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityCustomerUnitSrm/fetchHeader',
          payload: {
            authorityTypeCode: 'CUSTOMER',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  /**
   *渲染查询结构
   *
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    const {
      updateLoading,
      fetchLoading,
      updateFlagLoading,
      fetchHeaderLoading,
      authorityCustomerUnitSrm,
    } = this.props;
    const { header = {} } = authorityCustomerUnitSrm || {};
    const { expanded } = this.state;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hiam.authority.model.customerUnit.name').d('客户企业名称')}>
          {getFieldDecorator('companyName')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('hiam.authority.model.customerUnit.dataCode').d('客户企业编码')}>
          {getFieldDecorator('companyNum')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityCustomer.customerTenantName')
            .d('所属租户')}
        >
          {getFieldDecorator('tenantName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <Row>
          <Col>
            <FormItem className={styles['right-btn-group']}>
              <Button onClick={() => this.handleExpand()}>
                {expanded
                  ? intl.get('hzero.common.button.expand').d('展开')
                  : intl.get('hzero.common.button.up').d('收起')}
              </Button>
              <ButtonPermission
                // permissionList={[
                //   {
                //     code: 'hiam.sub-account-org.authority-management.button.saveCompany',
                //     type: 'button',
                //     meaning: '权限维护-保存公司',
                //   },
                // ]}
                type="primary"
                loading={updateLoading}
                onClick={() => this.handleSave()}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </ButtonPermission>
              <div style={{ display: 'inline-block', margin: '0 8px 16px' }}>
                <span style={{ marginRight: '8px' }}>
                  {intl.get('hiam.authority.view.message.label').d('加入全部:')}
                </span>
                <Tooltip
                  title={intl
                    .get('hiam.authority.view.message.title.tooltip.includeAllCustomerUnit')
                    .d('“加入全部”即将所有客户权限自动添加至当前账户，无需再手工添加。')}
                  placement="right"
                >
                  <Switch
                    loading={
                      updateLoading || fetchLoading || updateFlagLoading || fetchHeaderLoading
                    }
                    checked={!!header.includeAllFlag}
                    disabled={updateFlagLoading}
                    onChange={this.includeAllFlag}
                  />
                </Tooltip>
              </div>
            </FormItem>
          </Col>
        </Row>
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
      authorityCustomerUnitSrm: { data = [], checkList = [], expandedRowKeys = [] },
    } = this.props;
    const columns = [
      {
        title: intl
          .get('hiam.authority.model.authorityCustomerUnit.dataName')
          .d('客户企业名称/业务实体'),
        dataIndex: 'dataName',
        flexGrow: 1,
      },
      {
        title: intl
          .get('hiam.authority.model.authorityCustomerUnit.dataCode')
          .d('客户企业编码/业务实体编码'),
        dataIndex: 'dataCode',
        width: 400,
        resizable: true,
      },
      {
        title: intl.get('hiam.authority.model.authorityCustomerUnit.tenantName').d('所属租户'),
        dataIndex: 'tenantName',
        width: 400,
        resizable: true,
      },
    ];
    const rowSelection = {
      selectedRowKeys: checkList.map((n) => n.id),
      onChange: this.handleSelectRows,
      onSelect: this.selectChilds,
    };
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          isTree
          bordered
          rowKey="id"
          pagination={false}
          loading={fetchLoading || refreshLoading}
          data={data}
          rowSelection={rowSelection}
          expandedRowKeys={expandedRowKeys}
          columns={columns}
          height={600}
          // autoHeight
          // scroll={{ x: tableScrollWidth(columns) }}
          // rowClassName={record =>
          //   checkList.find(list => list.id === record.id) ? 'row-active' : 'row-noactive'
          // }
          onExpandChange={this.onExpand}
        />
      </div>
    );
  }
}
