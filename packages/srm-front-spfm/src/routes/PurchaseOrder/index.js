/*
 * index - 采购订单类型定义
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { connect } from 'dva';
import intl from 'utils/intl';
import Search from './Search';
import List from './List';
import Drawer from './Drawer';
import ApplicationTypeTable from './ApplicationTypeTable';
import ApplicationTypeDrawer from './ApplicationTypeDrawer';
import ApplicationTypeForm from './ApplicationTypeForm';

const { TabPane } = Tabs;

@connect(({ loading, purchaseOrder }) => ({
  fetchListLoading: loading.effects['purchaseOrder/fetchList'],
  addOrderTypeLoading: loading.effects['purchaseOrder/addOrderType'],
  fetchApplicationTypeLoading: loading.effects['purchaseOrder/fetchApplicationType'],
  purchaseOrder,
}))
@formatterCollections({
  code: [
    'spfm.purchaseOrder',
    'hzero.common',
    'sodr.common',
    'sodr.orderType',
    'sodr.orderTypeOrg',
    'entity.order',
    'hzero.hexl',
  ],
})
export default class PurchaseOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      modalVisible: false,
      activeKey: 'applicationType',
    };
  }

  applicationTypeFilterForm;

  applicationTypeDrawerForm;

  componentDidMount() {
    this.handleFetchApplicationType();
    this.handleSearch();
  }

  purchaseOrderForm;

  @Bind()
  handleSearch(payload = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseOrder/fetchList',
      payload,
    });
  }

  /**
   * 新建模态框
   */
  @Bind()
  showModal() {
    this.setState({ modalVisible: true });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.setState({ data: {}, modalVisible: false });
    }
  }

  /**
   * 新增
   * @param {object} fields 新增的熔断规则表单内的内容
   */
  @Bind()
  handleAdd(fields) {
    const { dispatch } = this.props;
    const { data } = this.state;
    const item = {
      ...data,
      ...fields,
    };
    let dataFlag = false; // 判断表单的值有没有改变
    for (const key in fields) {
      if (fields[key] !== data[key]) {
        dataFlag = true;
        break;
      }
    }
    if (dataFlag) {
      dispatch({
        type: 'purchaseOrder/addOrderType',
        payload: [item],
      }).then((res) => {
        if (!isEmpty(res)) {
          if (res.failed) {
            notification.error({ description: res.message });
          } else {
            const {
              purchaseOrder: { query },
            } = this.props;
            this.hideModal();
            this.handleSearch(query);
            this.setState({ data: {} });
            notification.success();
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`spfm.purchaseOrder.view.message.noChange`).d('未修改数据'),
      });
    }
  }

  /**
   * 修改当前行信息
   */
  @Bind()
  editLine(record) {
    this.setState({ data: { ...record }, modalVisible: true });
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 查询采购类型定义列表
   * @param {Object} page
   */
  @Bind()
  handleFetchApplicationType(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.applicationTypeFilterForm)
      ? {}
      : filterNullValueObject(this.applicationTypeFilterForm.getFieldsValue());
    dispatch({
      type: 'purchaseOrder/fetchApplicationType',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 改变需求类型模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleApplicationTypeModalVisible(flag) {
    this.setState({
      modalApplicationTypeVisible: !!flag,
    });
  }

  /**
   * 新建需求类型维护
   */
  @Bind()
  handleApplicationTypeCreate(json) {
    this.setState(
      {
        editValue: json || {},
      },
      () => this.handleApplicationTypeModalVisible(true)
    );
  }

  @Bind()
  handleApplicationTypeAdd() {
    const { dispatch } = this.props;
    const { editValue = {} } = this.state;
    const fildValues = this.applicationTypeDrawerForm
      ? filterNullValueObject(this.applicationTypeDrawerForm.getFieldsValue())
      : {};
    dispatch({
      type: 'purchaseOrder/fetchAddApplicationType',
      payload: [{ ...editValue, ...fildValues }],
    }).then((res) => {
      if (!isEmpty(res)) {
        this.handleApplicationTypeModalVisible(false);
        this.handleFetchApplicationType();
        notification.success();
      }
    });
  }

  render() {
    const {
      dispatch,
      form,
      fetchListLoading,
      purchaseOrder: { dataList, applicationTypeList, applicationTypePagination },
    } = this.props;
    const {
      data,
      modalVisible,
      activeKey,
      fetchApplicationTypeLoading,
      modalApplicationTypeVisible,
      editValue = {},
    } = this.state;
    const purchaseOrderTableProps = {
      dispatch,
      form,
      fetchListLoading,
      dataList,
      editLine: this.editLine,
    };
    const drawerProps = {
      data,
      dataList,
      onOk: this.handleAdd,
      visible: modalVisible,
      onCancel: this.hideModal,
      title: data.orderTypeId
        ? intl.get(`spfm.purchaseOrder.view.title.editForm`).d('编辑值')
        : intl.get(`spfm.purchaseOrder.view.title.createForm`).d('创建值'),
    };

    // 申请类型
    const applicationTypeFilterProps = {
      onFilterChange: this.handleFetchApplicationType,
      onRef: (node) => {
        this.applicationTypeFilterForm = node.props.form;
      },
    };
    const applicationTypeListProps = {
      loading: fetchApplicationTypeLoading,
      dataSource: applicationTypeList,
      handleApplicationTypeCreate: this.handleApplicationTypeCreate,
      pagination: applicationTypePagination,
      onSearch: this.handleFetchApplicationType,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.purchaseOrder.view.message.title.purchaseType`).d('采购类型维护')}
        >
          {activeKey === 'applicationType' && (
            <Button icon="plus" type="primary" onClick={() => this.handleApplicationTypeCreate()}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
          {activeKey === 'ordermant' && (
            <Button icon="plus" type="primary" onClick={this.showModal}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
            <TabPane
              key="applicationType"
              tab={intl
                .get(`spfm.purchaseOrder.view.message.tab.applicationType`)
                .d('申请类型维护')}
            >
              <ApplicationTypeForm {...applicationTypeFilterProps} />
              <ApplicationTypeTable {...applicationTypeListProps} />
            </TabPane>
            <TabPane
              key="ordermant"
              tab={intl.get(`spfm.purchaseOrder.view.message.tab.ordermant`).d('订单类型维护')}
            >
              <div className="table-list-search">
                <Search onFilterChange={this.handleSearch} />
              </div>
              <List {...purchaseOrderTableProps} />
            </TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
          <ApplicationTypeDrawer
            anchor="right"
            title={
              editValue.prTypeId
                ? intl.get(`sodr.orderType.view.message.demandEdit`).d('需求类型编辑')
                : intl.get(`sodr.orderType.view.message.demandAdd`).d('需求类型创建')
            }
            onRef={(ref) => {
              this.applicationTypeDrawerForm = ref;
            }}
            editValue={editValue}
            onHandleAdd={this.handleApplicationTypeAdd}
            confirmLoading={false}
            visible={modalApplicationTypeVisible}
            onCancel={() => this.handleApplicationTypeModalVisible(false)}
            demandTypeList={applicationTypeList}
          />
        </Content>
      </React.Fragment>
    );
  }
}
