import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal, Tooltip, Switch, Table, Checkbox, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from 'lodash';

import notification from 'utils/notification';
// import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import AddDataModal from './AddDataModal';

const FormItem = Form.Item;

@connect(({ authorityQualityRectification, loading }) => ({
  authorityQualityRectification,
  addLoading: loading.effects['authorityQualityRectification/addAuthorityQuality'],
  fetchLoading: loading.effects['authorityQualityRectification/fetchAuthorityQuality'],
  fetchModalLoading: loading.effects['authorityQualityRectification/fetchModalData'],
}))
@Form.create({ fieldNameProp: null })
export default class purchaseRequisitionType extends PureComponent {
  purchaseRequisitionTypeRef;

  constructor(props) {
    super(props);
    this.state = {
      selectRows: [],
      switchLoading: false,
      addModalVisible: false,
    };
    this.preAuthRoleId = '';
  }

  componentDidMount() {
    const {
      authRoleId,
      activeKey,
      queryParams: { userId },
    } = this.props;
    if (!isNil(userId) && this.preAuthRoleId !== authRoleId && activeKey === 'PROBLEM_TYPE') {
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
    if (!isNil(userId) && this.preAuthRoleId !== authRoleId && activeKey === 'PROBLEM_TYPE') {
      this.preAuthRoleId = authRoleId;
      this.queryValue();
    }
  }

  /**
   *查询数据
   *
   * @param {Object} pageData
   */
  @Bind()
  fetchData(pageData = {}) {
    const {
      form,
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const staticData = {
      userId,
      authorityTypeCode: 'PROBLEM_TYPE',
    };
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'authorityQualityRectification/fetchAuthorityQuality',
          payload: {
            authRoleId,
            ...fieldsValue,
            ...staticData,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 添加数据
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  addPrType(addRows) {
    const {
      dispatch,
      authorityQualityRectification: { head = {} },
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityQualityRectification/addAuthorityQuality',
      payload: {
        authorityTypeCode: 'PROBLEM_TYPE',
        userId,
        authRoleId,
        userAuthority: head,
        userAuthorityLineList: addRows,
      },
    }).then((response) => {
      if (response) {
        this.onHideAddModal();
        notification.success();
        this.purchaseRequisitionTypeRef.state.addRows = [];
        this.refresh();
      }
    });
  }

  /**
   *删除方法
   */
  @Bind()
  @Debounce(500)
  remove() {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    const { selectRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'authorityQualityRectification/deleteAuthorityQuality',
        payload: {
          userId,
          deleteRows: selectRows,
          authRoleId,
        },
      }).then((response) => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   *刷新
   */
  @Bind()
  refresh() {
    this.fetchData();
    this.setState({
      selectRows: [],
    });
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectRows: selectedRows });
  }

  /**
   * 查询弹出框数据
   * @param {Object} queryData 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const {
      dispatch,
      queryParams: { userId },
      authRoleId,
    } = this.props;
    dispatch({
      type: 'authorityQualityRectification/fetchModalData',
      payload: {
        userId,
        authRoleId,
        lovCode: 'SQAM.ED_PROBLEM_TYPE',
        ...queryData,
      },
    });
  }

  /**
   * 展示弹出框
   */
  @Bind()
  onShowAddModal() {
    this.fetchModalData();
    this.setState({
      addModalVisible: true,
    });
  }

  /**
   * 隐藏弹出框
   */
  @Bind()
  onHideAddModal() {
    this.purchaseRequisitionTypeRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   *点击查询按钮事件
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    this.fetchData({
      page: pagination,
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
      authorityQualityRectification: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityQualityRectification/addAuthorityQuality',
      payload: {
        authorityTypeCode: 'PROBLEM_TYPE',
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
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
      }
    });
  }

  /**
   *点击加入全部后触发事件
   *
   * @param {Boolean} checked switch的value值
   */
  @Bind()
  @Debounce(500)
  includeAllFlag(checked) {
    const {
      dispatch,
      queryParams: { userId },
      authorityQualityRectification: { head = {} },
      authRoleId,
    } = this.props;
    this.setState({
      switchLoading: true,
    });
    dispatch({
      type: 'authorityQualityRectification/addAuthorityQuality',
      payload: {
        authorityTypeCode: 'PROBLEM_TYPE',
        userId,
        userAuthority: {
          ...head,
          includeAllFlag: checked ? 1 : 0,
        },
        userAuthorityLineList: [],
        authRoleId,
      },
    }).then((response) => {
      if (response) {
        this.refresh();
        notification.success();
        this.setState({
          switchLoading: false,
        });
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
    return (
      <Form layout="inline">
        <FormItem
          label={intl
            .get('hiam.authorityManagement.model.authorityQualityRectification.dataName')
            .d('质量整改问题类型名称')}
        >
          {getFieldDecorator('dataName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button style={{ marginRight: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.purchaseRequisitionTypeRef = ref;
  }

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
      authorityQualityRectification: {
        list = [],
        head = {},
        pagination = {},
        purReqTypeDataSource = [],
        purReqTypePagination = {},
      },
      addLoading,
      fetchLoading,
      fetchModalLoading,
    } = this.props;
    const { switchLoading, addModalVisible, selectRows } = this.state;
    const columns = [
      {
        title: intl
          .get('hiam.authorityManagement.model.authorityQualityRectification.dataName')
          .d('质量整改问题类型名称'),
        dataIndex: 'dataName',
        // width: 150,
      },
    ];
    const addModalOptions = {
      columns,
      loading: fetchModalLoading,
      confirmLoading: addLoading,
      title: intl.get('hiam.authority.model.title.selectAuthorityQualityType').d('选择质量整改类型'),
      rowKey: 'dataId',
      renderForm: () => {return [];},
      dataSource: purReqTypeDataSource,
      pagination: purReqTypePagination,
      modalVisible: addModalVisible,
      addData: this.addPrType,
      onHideAddModal: this.onHideAddModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectRows.map((n) => n.authorityLineId),
    };
    return (
      <>
        <div className="table-list-search">{this.renderForm()}</div>
        <div style={{ textAlign: 'right' }}>
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
              <Checkbox onChange={this.includeNullFlag} checked={head.includeNullFlag || 0} />
            </Tooltip>
          </div>
          {!head?.includeAllFlag && (
            <React.Fragment>
              <Button style={{ margin: '0 8px 16px 0' }} onClick={() => this.onShowAddModal()}>
                {intl
                  .get('hiam.authorityManagement.view.button.table.create.authorityQualityRectification')
                  .d('新建质量整改问题类型权限')}
              </Button>
              <Button
                style={{ margin: '0 8px 16px 0' }}
                disabled={selectRows.length <= 0}
                onClick={() => this.remove()}
              >
                {intl
                  .get('hiam.authorityManagement.view.button.table.delete.authorityQualityRectification')
                  .d('删除质量整改问题类型权限')}
              </Button>
            </React.Fragment>
          )}
          <div style={{ display: 'inline-block', margin: '0 8px 16px 0' }}>
            <span style={{ marginRight: '8px' }}>
              {intl.get('hiam.authorityManagement.view.message.label').d('加入全部:')}
            </span>
            <Tooltip
              title={intl
                .get('hiam.authorityManagement.view.message.title.tooltip.authorityQualityRectification')
                .d('“加入全部”即将所有申请类型权限自动添加至当前账户，无需再手工添加。')}
              placement="right"
            >
              <Switch
                switchLoading={switchLoading}
                checked={!!head?.includeAllFlag}
                onChange={this.includeAllFlag}
              />
            </Tooltip>
          </div>
        </div>
        <Table
          bordered
          rowKey="authorityLineId"
          loading={fetchLoading}
          dataSource={list}
          columns={columns}
          rowSelection={rowSelection}
          pagination={pagination}
          // scroll={{ x: tableScrollWidth(columns) }}
          onChange={this.handleTableChange}
        />
        <AddDataModal {...addModalOptions} />
      </>
    );
  }
}
