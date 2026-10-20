import React from 'react';
import { connect } from 'dva';
import lodash, { isNil, isEmpty, isUndefined } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { Button, Drawer, Form, Input, Row, Col, Icon, Checkbox, Tooltip, Switch } from 'hzero-ui';
import Table from '@/components/VirtualTable';

import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import Lov from 'components/Lov';
import { Button as ButtonPermission } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { queryAuthorityUnit } from '@/services/authorityManagementService';

import styles from './index.less';

const AuthorityViewModal = Form.create({ fieldNameProp: null })((props) => {
  const { viewModalVisible, closeModal, form, userId } = props;

  const { getFieldDecorator } = form;

  const [loading, setLoading] = React.useState(false);
  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    if (viewModalVisible) {
      queryValue();
    }
  }, [viewModalVisible]);

  const columns = React.useMemo(() => {
    return [
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
        dataIndex: 'dataName',
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
        dataIndex: 'dataCode',
        width: 200,
        resizable: true,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
          .d('组织'),
        dataIndex: 'unitCompanyName',
        width: 300,
        resizable: true,
      },
    ];
  }, []);

  const queryValue = (payload = {}) => {
    setLoading(true);
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    queryAuthorityUnit({
      userId,
      page: isEmpty(payload) ? {} : payload,
      variant: 'CREATED_MAIN_UNIT',
      ...filterValues,
    })
      .then((res) => {
        if (getResponse(res)) {
          setDataSource(res);
          // setPagination(createPagination(res));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFormReset = () => {
    form.resetFields();
  };

  return (
    <Drawer
      title={intl
        .get('hiam.authority.model.authorityManagement.authorityViewUnit')
        .d('查询已分配的部门权限')}
      visible={viewModalVisible}
      destroyOnClose
      onClose={closeModal}
      width={900}
    >
      <Form layout="inline">
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码')}
        >
          {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
            .d('组织')}
        >
          {getFieldDecorator('unitCompanyId')(
            <Lov code="HPFM.UNIT.COMPANY" queryParams={{ tenantId: getCurrentOrganizationId() }} />
          )}
        </FormItem>
        <FormItem>
          <Button style={{ marginRight: 8 }} onClick={handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={() => queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>

      <Table
        // isTree
        bordered
        rowKey="dataId"
        pagination={false}
        loading={loading}
        data={dataSource}
        expandedRowKeys={[]}
        columns={columns}
        height={600}
        onExpandChange={() => {}}
      />
      <div className={styles['modal-button']}>
        <Button
          style={{
            marginRight: 8,
          }}
          type="primary"
          onClick={closeModal}
        >
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </div>
    </Drawer>
  );
});

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

@connect(({ authorityMainUnit, loading }) => ({
  authorityMainUnit,
  updateLoading: loading.effects['authorityMainUnit/updateAuthorityUnit'],
  fetchLoading: loading.effects['authorityMainUnit/fetchAuthorityUnitAndExpand'],
  fetchHeaderLoading: loading.effects['authorityMainUnit/fetchHeader'],
  updateFlagLoading: loading.effects['authorityMainUnit/addAuthorityUnit'],
  refreshLoading: loading.effects['authorityMainUnit/fetchAuthorityUnit'],
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
      viewModalVisible: false,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (this.preAuthRoleId !== authRoleId && activeKey === 'CREATED_MAIN_UNIT' && !isNil(userId)) {
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
    if (this.preAuthRoleId !== authRoleId && activeKey === 'CREATED_MAIN_UNIT' && !isNil(userId)) {
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

    const staticData = {
      userId,
      authorityTypeCode: 'CREATED_MAIN_UNIT',
      variant: 'CREATED_MAIN_UNIT',
    };

    const { queryParams } = this.state;

    dispatch({
      type: 'authorityMainUnit/fetchAuthorityUnit',
      payload: {
        authRoleId,
        ...queryParams,
        ...staticData,
      },
    }).then(() => {
      const {
        authorityMainUnit: { checkList = [] },
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
      authorityMainUnit: { initCheckList = [], checkList = [], originList = [] },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { queryParams } = this.state;
    let allCheckList = [];
    if (queryParams.dataCode || queryParams.dataName || queryParams.unitCompanyId) {
      const allDataKey = originList.map((e) => e.dataId);
      allCheckList = initCheckList
        .filter((item) => !allDataKey.includes(item.dataId))
        .concat(checkList);
    } else {
      allCheckList = checkList;
    }
    dispatch({
      type: 'authorityMainUnit/updateAuthorityUnit',
      payload: {
        checkList: allCheckList,
        userId,
        authRoleId,
        variant: 'CREATED_MAIN_UNIT',
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
          type: 'authorityMainUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'CREATED_MAIN_UNIT',
            userId,
          },
        });
        dispatch({
          type: 'authorityMainUnit/fetchAuthorityUnitAndExpand',
          payload: {
            ...fieldsValue,
            userId,
            authRoleId,
            variant: 'CREATED_MAIN_UNIT',
          },
        }).then(() => {
          const {
            authorityMainUnit: { checkList = [] },
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
      type: 'authorityMainUnit/updateCheckList',
      payload: { checkList: lodash.uniqBy(rows, 'dataId') },
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
      authorityMainUnit: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'authorityMainUnit/updateExpanded',
      payload: expanded
        ? expandedRowKeys.concat(record.dataId)
        : expandedRowKeys.filter((o) => o !== record.dataId),
    });
  }

  /**
   *全部展开和收起
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      authorityMainUnit: { originList = [] },
    } = this.props;
    const { expanded } = this.state;
    dispatch({
      type: 'authorityMainUnit/updateExpanded',
      payload: expanded ? originList.map((list) => list.dataId) : [],
    });
    this.setState({
      expanded: !expanded,
    });
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
      authorityMainUnit: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityMainUnit/addAuthorityUnit',
      payload: {
        authorityTypeCode: 'CREATED_MAIN_UNIT',
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
          type: 'authorityMainUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'CREATED_MAIN_UNIT',
            userId,
          },
        });
        notification.success();
      }
    });
  }

  /**
   *点击包含空值后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeNullFlag(e) {
    const { checked } = e.target;
    const {
      dispatch,
      queryParams: { userId },
      authorityMainUnit: { header = {} },
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityMainUnit/addAuthorityUnit',
      payload: {
        authorityTypeCode: 'CREATED_MAIN_UNIT',
        userId,
        userAuthority: {
          ...header,
          includeNullFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
      },
    }).then((response) => {
      if (response) {
        dispatch({
          type: 'authorityMainUnit/fetchHeader',
          payload: {
            authorityTypeCode: 'CREATED_MAIN_UNIT',
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
      authorityMainUnit,
    } = this.props;
    const { header = {} } = authorityMainUnit || {};
    const { expanded } = this.state;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem
          label={intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码')}
        >
          {getFieldDecorator('dataCode')(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
            .d('组织')}
        >
          {getFieldDecorator('unitCompanyId')(
            <Lov code="HPFM.UNIT.COMPANY" queryParams={{ tenantId: getCurrentOrganizationId() }} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <Row>
          <Col>
            <FormItem className={styles['right-btn-group']}>
              <div style={{ display: 'inline-block', margin: '0 24px 16px 0' }}>
                <Tooltip
                  title={intl
                    .get('hiam.authority.view.message.nullValue.tooltip')
                    .d('勾选后，单据中该维度字段为空该用户可查询到')}
                >
                  <span style={{ marginRight: '8px' }}>
                    {intl.get('hiam.authority.view.message.nullValue').d('包含空值')}
                    <Icon type="question-circle" style={{ margin: '0 4px' }} />:
                  </span>
                  <Checkbox
                    onChange={this.includeNullFlag}
                    checked={(header || {}).includeNullFlag || 0}
                  />
                </Tooltip>
              </div>
              <Button onClick={() => this.handleExpand()}>
                {expanded
                  ? intl.get('hzero.common.button.expand').d('展开')
                  : intl.get('hzero.common.button.up').d('收起')}
              </Button>
              {!header.includeAllFlag && (
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
              )}
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

  @Bind()
  handleChangeViewModalVisible(viewModalVisible) {
    this.setState({ viewModalVisible });
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
      authorityMainUnit: { data = [], checkList = [], expandedRowKeys = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitName').d('部门名称'),
        dataIndex: 'dataName',
        flexGrow: 1,
      },
      {
        title: intl.get('hiam.authorityManagement.model.authorityUnit.unitNum').d('部门编码'),
        dataIndex: 'dataCode',
        width: 300,
        resizable: true,
      },
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityCustomer.unitCompanyName')
          .d('组织'),
        dataIndex: 'unitCompanyName',
        width: 400,
        resizable: true,
      },
    ];
    const { viewModalVisible } = this.state;
    const rowSelection = {
      selectedRowKeys: checkList.map((n) => n.dataId),
      onChange: this.handleSelectRows,
      onSelect: () => {},
    };
    const authorityViewModalProps = {
      viewModalVisible,
      closeModal: () => this.handleChangeViewModalVisible(false),
      userId,
    };

    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <a style={{ marginBottom: '8px' }} onClick={() => this.handleChangeViewModalVisible(true)}>
          {intl.get('hiam.authority.model.authorityManagement.authorityView').d('查询已分配权限')}
        </a>
        <Table
          isTree
          bordered
          rowKey="dataId"
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
          //   checkList.find(list => list.dataId === record.dataId) ? 'row-active' : 'row-noactive'
          // }
          onExpandChange={this.onExpand}
        />
        <AuthorityViewModal {...authorityViewModalProps} />
      </div>
    );
  }
}
