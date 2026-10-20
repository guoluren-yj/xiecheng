/**
 * CreateDetail - 非寄销开票单维护
 * @date: 2018-11-27
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Tabs, Spin, Modal, Badge } from 'hzero-ui';
import { isEmpty, isArray, omit, isUndefined } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import qs from 'querystring';

import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  getEditTableData,
  getCurrentOrganizationId,
  createPagination,
  delItemsToPagination,
  // addItemToPagination,
  filterNullValueObject,
} from 'utils/utils';

import HeaderInfo from '../../Components/HeaderInfo';
import RowTable from '../../Components/RowTable';
import DetailTable from '../../Components/DetailTable';
import styles from '../../Components/index.less';
import GlaTable from '../../Components/GlaTable';
import Styles from './index.less';
import ItemInfo from './ItemInfo';
import CommonStyle from '../../../common.less';

const { TabPane } = Tabs;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';

/**
 * 非寄销开票单维护
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} CreateDetail - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, bill, user: { currentUser = {} } }) => ({
  bill,
  currentUser,
  organizationId: getCurrentOrganizationId(),
  loading:
    loading.effects['bill/fetchMaintainHeader'] ||
    loading.effects['bill/fetchMaintainRow'] ||
    loading.effects['bill/fetchDetail'],
  saving: loading.effects['bill/saveBill'],
  modalling: loading.effects['bill/fetchModalList'],
  saveing: loading.effects['bill/saveTotalBill'],
  deleteListing: loading.effects['bill/deleteList'],
  submitting: loading.effects['bill/submitBill'],
  deleting: loading.effects['bill/deleteBill'],
  cancelling: loading.effects['bill/cancelCreateBill'],
}))
@formatterCollections({
  code: [
    'entity.company',
    'entity.supplier',
    'entity.roles',
    'entity.item',
    'entity.business',
    'sfin.invoiceBill',
    'sodr.quotePurchase',
    'sfin.supplierChargeEntry',
  ],
})
export default class CreateDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { billHeaderId },
      },
      history: {
        location: { search = {} },
      },
    } = props;
    const routerParams = qs.parse(search.substr(1));
    let backPath;
    switch (routerParams.status) {
      case 'create':
        backPath = '/sfin/bill-create/list';
        break;
      case 'maintain':
        backPath = '/sfin/bill-maintain/list';
        break;
      case 'sales':
        backPath = '/sfin/sales-bill/list';
        break;
      default:
        backPath = '/sfin/bill-maintain/list';
        break;
    }
    this.state = {
      isCreator: true,
      billHeaderId,
      backPath,
      visible: false,
      infDataSource: [],
      infPagination: {},
      modalDataSource: [], // 扣款列表数据
      modalPagination: {}, // 扣款列表分页
      selectedModalRows: [],
      supLineDetailDTOList: [],
    };
  }

  componentDidMount() {
    const {
      history: {
        location: { search = {} },
      },
    } = this.props;
    this.handleSearchHeader();
    this.handleSearchRow();
    this.handleSearchDetail();
    this.handleSearchInf();

    const routerParams = qs.parse(search.substr(1));
    if (routerParams.activeTab) {
      this.tabChange(routerParams.activeTab);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { billHeaderId },
      },
    } = prevProps;
    if (this.props.match.params.billHeaderId !== billHeaderId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ billHeaderId }, () => {
        this.handleSearchHeader();
        this.handleSearchRow();
        this.handleSearchDetail();
      });
    }
  }

  /**
   * 修改横向滚动条位置
   */
  @Bind()
  handleScrollTo() {
    const {
      bill: { maintainHeaderInfo: { supplierUpdateShield, basePrice } = {} },
    } = this.props;
    if (supplierUpdateShield && basePrice) {
      const dom = this.rowDom.querySelector('.ant-table-body');
      dom.scrollTo(2000, 0);
    }
  }

  /**
   * 查询开票头信息
   */
  @Bind()
  handleSearchHeader() {
    const {
      dispatch,
      organizationId,
      currentUser: { id },
      history,
    } = this.props;
    const { billHeaderId, backPath } = this.state;
    dispatch({
      type: 'bill/fetchMaintainHeader',
      payload: {
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO',
      },
    }).then((data) => {
      if (data) {
        if (this.headerForm) this.headerForm.resetFields();
        const { createdBy, invOrganizationId: attributeBigint1 } = data;
        // eslint-disable-next-line eqeqeq
        if (createdBy != id) {
          this.setState({ isCreator: false });
        }
        this.setState({ attributeBigint1 });
      }
      if (JSON.stringify(data) === '{}') {
        history.push(backPath);
      }
    });
  }

  /**
   * 查询开票行Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchRow(params = {}) {
    const {
      dispatch,
      organizationId,
      bill: { maintainPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchMaintainRow',
      payload: {
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LINE',
        page: isEmpty(params) ? maintainPagination : params,
      },
    });
  }
  /**
   * 查询开票明细Table
   * @param {Object} params 分页信息
   */

  @Bind()
  handleSearchDetail(params = {}, _, sort = {}) {
    const {
      dispatch,
      organizationId,
      bill: { detailPagination },
    } = this.props;
    const { billHeaderId } = this.state;
    dispatch({
      type: 'bill/fetchDetail',
      payload: {
        sort,
        organizationId,
        billHeaderId,
        interfaceType: 'supplier',
        page: isEmpty(params) ? detailPagination : params,
        customizeUnitCode: 'SFIN.BILL_CREATE_DETAIL.DETAILED',
      },
    });
  }

  /**
   * 查询总账科目Table
   * @param {Object} params 分页信息
   */
  @Bind()
  handleSearchInf(params = {}) {
    const {
      dispatch,
      organizationId,
      // invoice: { infPagination },
    } = this.props;

    const { billHeaderId, infPagination } = this.state;
    dispatch({
      type: 'bill/fetchInf',
      payload: {
        organizationId,
        billHeaderId,
        page: isEmpty(params) ? infPagination : params,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          infDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          infPagination: createPagination(res),
        });
      }
    });
  }

  // func是用户传入需要防抖的函数
  @Bind()
  debounce(func, wait = 500) {
    // 缓存一个定时器id
    let timer = 0;
    return function time(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  /**
   * 保存数据
   */
  @Bind()
  @Throttle(1000)
  handleSave() {
    const {
      dispatch,
      organizationId,
      bill: {
        maintainRowData: { content = [] },
        maintainHeaderInfo = {},
      },
    } = this.props;
    const { infDataSource = [] } = this.state;

    const values = this.headerForm.getFieldsValue();
    // const tableData = getEditTableData(content, ['billLineId']);
    // const tableData = content;
    const tableData = isEmpty(getEditTableData(content, ['billLineId']))
      ? content
      : getEditTableData(content, ['billLineId']);
    // const contentList = infDataSource.filter(item => item.edited);
    // const tableDate = getEditTableData(contentList);
    // if (isEmpty(tableData)) {
    //   this.handleScrollTo();
    //   return;
    // }
    const modalData = getEditTableData(infDataSource);
    if (!isEmpty(infDataSource) && isEmpty(modalData)) {
      this.tabChange('inf');
      return;
    }
    this.headerForm.validateFieldsAndScroll((err) => {
      if (!err) {
        dispatch({
          type: 'bill/saveBill',
          payload: {
            organizationId,
            billHeader: { ...maintainHeaderInfo, ...values },
            billLineList: tableData,
            supLineList: modalData,
            customizeUnitCode:
              'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_CREATE_DETAIL.DETAILED',
          },
        }).then((res) => {
          if (res) {
            content.map((item) => {
              if (item.$form) item.$form.resetFields();
            });
            notification.success();
            this.handleSearchHeader();
            this.handleSearchRow();
            this.handleSearchDetail();
            this.handleSearchInf();
          }
        });
      }
    });
  }

  /**
   * 提交
   */
  @Bind()
  @Throttle(1000)
  handleSubmit() {
    const {
      dispatch,
      organizationId,
      bill: {
        maintainRowData: { content = [] },
        maintainHeaderInfo = {},
      },
      history,
    } = this.props;
    const { backPath, infDataSource = [] } = this.state;
    const values = this.headerForm.getFieldsValue();
    // const tableData = getEditTableData(content, ['billLineId']);
    // const tableData = content;
    const tableData = isEmpty(getEditTableData(content, ['billLineId']))
      ? content
      : getEditTableData(content, ['billLineId']);
    // const contentList = infDataSource.filter(item => item.edited);
    // const tableDate = getEditTableData(contentList);
    // if (isEmpty(tableData)) {
    //   this.handleScrollTo();
    //   return;
    // }
    const modalData = getEditTableData(infDataSource);
    if (!isEmpty(infDataSource) && isEmpty(modalData)) {
      this.tabChange('inf');
      return;
    }
    this.headerForm.validateFieldsAndScroll((err) => {
      if (!err) {
        confirm({
          title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交？'),
          onOk: () => {
            dispatch({
              type: 'bill/submitValidateBill',
              payload: {
                organizationId,
                billHeader: { ...maintainHeaderInfo, ...values },
                billLineList: tableData,
                customizeUnitCode:
                  'SFIN.BILL_MAINTAIN_DETAIL.BASIC_INFO,SFIN.BILL_MAINTAIN_DETAIL.LINE',
                supLineList: modalData,
              },
            }).then((response) => {
              if (response?.validatedCode === 'INFO') {
                confirm({
                  title: response.message,
                  // content: '',
                  onOk: () => {
                    dispatch({
                      type: 'bill/submitBill',
                      payload: {
                        organizationId,
                        billHeader: { ...maintainHeaderInfo, ...values },
                        billLineList: tableData,
                        supLineList: modalData,
                      },
                    }).then((res) => {
                      if (res) {
                        notification.success();
                        history.push(backPath);
                      }
                    });
                  },
                });
              }
              if (response?.validatedCode === 'SUCCESS') {
                dispatch({
                  type: 'bill/submitBill',
                  payload: {
                    organizationId,
                    billHeader: { ...maintainHeaderInfo, ...values },
                    billLineList: tableData,
                    supLineList: modalData,
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    history.push(backPath);
                  }
                });
              }
              if (response?.validatedCode === 'WIATING_CONFIRM') {
                confirm({
                  title: response.msg,
                  onOk: () => {
                    dispatch({
                      type: 'bill/submitBill',
                      payload: {
                        organizationId,
                        billHeader: { ...maintainHeaderInfo, ...values },
                        billLineList: tableData,
                        supLineList: modalData,
                      },
                    }).then((res) => {
                      if (res) {
                        notification.success();
                        history.push(backPath);
                      }
                    });
                  },
                });
              }
            });
          },
        });
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, organizationId, history } = this.props;
    const { billHeaderId, backPath } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'bill/deleteBill',
          payload: { organizationId, billHeaderId },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(backPath);
          }
        });
      },
    });
  }

  /**
   * closeItemInfoModal - 关闭弹窗
   */
  @Bind()
  closeItemInfoModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * fetchModalList - 查询模态框数据
   */
  @Bind()
  fetchModalList(page = {}) {
    const {
      dispatch,
      organizationId,
      bill: { maintainHeaderInfo = {} },
    } = this.props;
    const {
      supplierCompanyId,
      erpSupplierFlag,
      ouId,
      companyId,
      currencyCode,
      billHeaderId,
      supplierId,
    } = maintainHeaderInfo;
    const modalList = [];
    const { infDataSource = [], attributeBigint1 } = this.state;
    const filedValues = isUndefined(this.itemInfo.search)
      ? {}
      : filterNullValueObject(this.itemInfo.search.getFieldsValue());
    infDataSource.forEach((item) => {
      if (item.supplierDeductionsId) {
        modalList.push(item.supplierDeductionsId);
      }
    });
    dispatch({
      type: 'bill/fetchModalList',
      payload: {
        page,
        erpSupplierFlag,
        supplierCompanyId,
        organizationId,
        attributeBigint1,
        ticketDeductionFlag: 1,
        statusCodeList: ['CONFIRMED'],
        ouId,
        companyId,
        currencyCode,
        notInDeductionIds: modalList,
        customizeUnitCode: 'SFIN.BILL_MAINTAIN_DETAIL.LEDGER_ACCOUNT_ALERT',
        billHeaderId,
        supplierId,
        ...filedValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modalDataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          modalPagination: createPagination(res),
        });
      }
    });
  }

  @Bind()
  onItemInfoModalOk() {
    const { billHeaderId } = this.state;
    const { selectedListRows: modalList } = this.itemInfo.state;
    const { dispatch, organizationId } = this.props;
    // const contentList = infDataSource.filter(item => item.edited);

    const newDataSource = modalList.map((item) => {
      return {
        ...item,
        // supplierDeductionsId: uuid(),
        _status: 'create',
        edited: true,
      };
    });
    // this.setState({
    //   infDataSource: [...newDataSource, ...infDataSource],
    //   infPagination: addItemToPagination(
    //     this.itemInfo.state.selectedListRows.length,
    //     infDataSource.length,
    //     infPagination
    //   ),
    // });
    // 掉接口
    dispatch({
      type: 'bill/saveTotalBill',
      payload: {
        organizationId,
        billHeaderId,
        supLineList: newDataSource,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchInf();
        // 保存刷新开票头信息
        this.handleSearchHeader();
        this.closeItemInfoModal();
      }
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} selectedListRows
   * @param {Object} selectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedModalRows: selectedRows });
  }

  /**
   * 取消
   */
  @Bind()
  @Throttle(1000)
  handleCancel() {
    const { dispatch, organizationId, history } = this.props;
    const { billHeaderId, backPath } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.cancel').d('是否确认取消?'),
      onOk: () => {
        dispatch({
          type: 'bill/cancelCreateBill',
          payload: { organizationId, billHeaderId },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(backPath);
          }
        });
      },
    });
  }

  /**
   * deleteModalList - 删除总账科目数据
   */
  @Bind()
  deleteModalList() {
    const { dispatch, organizationId } = this.props;
    const { infDataSource, infPagination, selectedModalRows, billHeaderId } = this.state;
    const newDataSource = [];
    const oldDataSource = [];
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    infDataSource.forEach((item) => {
      if (!selectedRowKeys.includes(item.supplierDeductionsId)) {
        newDataSource.push(item);
      } else if (item._status !== 'create') {
        oldDataSource.push(omit(item, ['$form']));
      }
    });

    if (!isEmpty(oldDataSource)) {
      dispatch({
        type: 'bill/deleteList',
        payload: {
          billHeaderId,
          organizationId,
          body: oldDataSource,
        },
      }).then((res) => {
        if (res) {
          this.setState({ selectedModalRows: [] });
          notification.success();
          this.handleSearchInf(infPagination);
          // 删除条目时刷新开票头信息
          this.handleSearchHeader();
        }
      });
    } else {
      this.setState({
        infDataSource: newDataSource,
        selectedModalRows: [],
      });
      this.setState({
        infPagination: delItemsToPagination(
          selectedModalRows.length,
          infDataSource.length,
          infPagination
        ),
      });
    }
  }

  /**
   * 新建列表
   * @param {String} pcTemplateId
   */
  @Bind()
  project() {
    this.setState({ visible: true });
  }

  // 保存
  @Bind()
  save() {
    const { dispatch, organizationId } = this.props;
    const { infDataSource, billHeaderId } = this.state;
    // const contentList = infDataSource.filter(item => item.edited);
    const tableData = getEditTableData(infDataSource);
    if (isEmpty(tableData)) {
      return;
    }
    dispatch({
      type: 'bill/saveTotalBill',
      payload: {
        organizationId,
        billHeaderId,
        supLineList: tableData,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchInf();
        // 保存刷新开票头信息
        this.handleSearchHeader();
      }
    });
  }

  @Bind()
  tabChange(activeKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: {
        lastActiveTabKey: activeKey,
      },
    });
  }

  render() {
    const {
      loading,
      saving,
      saveing,
      submitting,
      deleting,
      cancelling,
      modalling,
      deleteListing,
      bill: {
        lastActiveTabKey,
        maintainHeaderInfo = {},
        maintainRowData = {},
        maintainPagination = {},
        detailDataSource = {},
        detailPagination = {},
      },
    } = this.props;
    // basePrice 基准价 true含税
    const { supplierUpdateShield, basePrice, billStatus } = maintainHeaderInfo;
    const {
      isCreator,
      backPath,
      visible,
      infDataSource = [],
      infPagination = {},
      selectedModalRows = [],
      modalDataSource = [],
      modalPagination = {},
    } = this.state;
    const selectedRowKeys = selectedModalRows.map((n) => n.supplierDeductionsId);
    const headerProps = {
      isShowOpinion: false,
      headerInfo: {
        ...maintainHeaderInfo,
        customPageFrom: 'billUpdateSuppier',
      },
      onRef: (ref) => {
        this.headerForm = ref.props.form;
      },
    };
    const rowProps = {
      rowDataSource: maintainRowData,
      rowPagination: maintainPagination,
      supplierUpdateShield,
      basePrice,
      onTableChange: this.handleSearchRow,
      nameKey: 'maintainRowData',
    };
    const detailProps = {
      detailDataSource,
      detailPagination,
      onTableChange: this.handleSearchDetail,
    };

    const glaProps = {
      // tenantId,
      dataSource: infDataSource,
      pagination: infPagination,
      onTableChange: this.handleSearchInf,
      updateState: this.updateState,
      selectedModalRows,
      modalRowSelectedChange: this.handleRowSelectedChange,
    };
    const itemInfoProps = {
      visible,
      modalling,
      modalDataSource,
      modalPagination,
      width: 900,
      onRef: (node) => {
        this.itemInfo = node;
      },
      fetchDetailList: this.fetchModalList,
    };
    const isLoading = submitting || saving || deleting || cancelling || loading;
    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`${promptCode}.view.message.title.billCreate.detail`).d('开票单维护')}
        >
          {isCreator && (
            <React.Fragment>
              <Button type="primary" icon="save" loading={isLoading} onClick={this.handleSave}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button icon="check" loading={isLoading} onClick={this.handleSubmit}>
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              {billStatus === 'NEW' && (
                <Button icon="delete" loading={isLoading} onClick={this.handleDelete}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
              {billStatus === 'REJECTED' && (
                <Button icon="rollback" loading={isLoading} onClick={this.handleCancel}>
                  {intl.get(`${promptCode}.view.button.maintain.cancel`).d('整单取消')}
                </Button>
              )}
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
            <HeaderInfo {...headerProps} />
            <Tabs
              onChange={this.tabChange}
              activeKey={lastActiveTabKey}
              animated={false}
              className={CommonStyle['tabpane-style']}
            >
              <TabPane tab={intl.get(`${promptCode}.view.message.title.tab.row`).d('行')} key="row">
                <div
                  ref={(ref) => {
                    this.rowDom = ref;
                  }}
                >
                  <RowTable {...rowProps} />
                </div>
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.tab.detail`).d('明细')}
                key="detail"
              >
                <DetailTable {...detailProps} />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    {intl.get(`${promptCode}.view.inf`).d('总账科目')}
                    <Badge
                      className={Styles['badge-tab']}
                      style={{
                        backgroundColor: '#fff',
                        color: lastActiveTabKey === 'inf' ? '#29BECE' : '#000',
                      }}
                      overflowCount={99}
                      offset={[6, 0]}
                      showZero
                      count={infPagination?.total || 0}
                    />
                  </span>
                }
                key="inf"
              >
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button
                    style={{ marginRight: 8 }}
                    loading={deleteListing}
                    icon="delete"
                    onClick={this.deleteModalList}
                    disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </Button>
                  <Button
                    style={{ marginRight: 8 }}
                    icon="save"
                    loading={saveing}
                    onClick={this.save}
                  >
                    {intl.get(`hzero.common.button.save`).d('保存')}
                  </Button>
                  <Button icon="plus" type="primary" onClick={this.project}>
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </Button>
                </div>

                <GlaTable {...glaProps} />
              </TabPane>
            </Tabs>
          </Spin>
        </Content>
        <Modal
          title={intl.get(`sodr.quotePurchase.view.message.addEductionBanks`).d('新增扣款行')}
          destroyOnClose
          width={900}
          visible={visible}
          onCancel={this.closeItemInfoModal}
          footer={
            <Button
              type="primary"
              // loading={validating}
              onClick={this.onItemInfoModalOk}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          }
        >
          <ItemInfo {...itemInfoProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
