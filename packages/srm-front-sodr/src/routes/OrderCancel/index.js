/**
 * 订单取消入口 - 头
 * @date: 2019-2-20
 * @author: lixiaolong <xiaolong.li02@hand-china>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Tabs } from 'hzero-ui';
import remotes from 'utils/remote';
import { Bind, Throttle } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { stringify } from 'querystring';
import { Button as PermissionButton } from 'components/Permission';
import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { SRM_SPUC } from '_utils/config';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import remoteConfig from './remote';
import SingleCancel from './SingleCancel';
import LineCancel from './LineCancel';
import CancelModal from './CancelCloseModal';

// sodr 国际化
const commonPrefix = 'sodr.orderCancel.view.message';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

/**
 * OrderCancel - 订单取消组件
 * @extends {Component} - React.Component
 * @reactProps {object} orderCancel - 数据源
 * @reactProps {boolean} cancelLoading - 取消订单请求状态
 * @reactProps {boolean} fetchSingleLoading - 查询订单请求状态
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @returns React.element
 */
@connect(({ orderCancel, loading }) => ({
  orderCancel,
  cancelLoading: loading.effects['orderCancel/cancelOrder'],
  lineLoading: loading.effects['orderCancel/cancelLine'],
  fetchLineLoading: loading.effects['orderCancel/fetchCancelList'],
  fetchSingleLoading: loading.effects['orderCancel/fetchSingleList'],
  closeOrderLoading: loading.effects['orderCancel/closeOrder'],
  closeLineLoading: loading.effects['orderCancel/closeLine'],
  cancelOrderLoading: loading.effects['orderCancel/cancelOrder'],
  cancelLineLoading: loading.effects['orderCancel/cancelLine'],
}))
@formatterCollections({
  code: [
    'entity.item',
    'sodr.orderCancel',
    'sodr.common',
    'sodr.sendOrder',
    'sodr.quotePurchase',
    'entity.supplier',
    'entity.company',
    'entity.purchaser',
    'entity.organization',
    'entity.business',
    'sodr.ordercancel',
    'sodr.quotePurchaseRequisition',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE',
    'SODR.ORDER_CANCEL_LIST.FILTER_BY_LINE',
    'SODR.ORDER_CANCEL_LIST.DELIVERY_LINE',
    'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE',
    'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE_CANCEL-MODEL',
    'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE_CANCEL_MODEL',
    'SODR.ORDER_CANCEL_LIST.DELIVERY_BTNS',
  ],
})
@remotes(...remoteConfig)
export default class OrderCancel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabActiveKey: 'orderCancel',
      cancelCloseModalVisible: false,
      buttonType: '',
      singleSelectedRows: [],
      cancelSelectedRows: [],
      personalizedCoding: '',
      doubleUnitEnabled: 0,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      location: { state: { _back } = {} },
      orderCancel: { pagination },
    } = this.props;
    this.queryDoubleUomConfig();
    if (_back !== -1) {
      dispatch({
        type: 'orderCancel/fetchValue',
      });
      dispatch({
        type: 'orderCancel/init',
      });
      this.singleCancelSearch();
    } else {
      this.singleCancelSearch(pagination);
    }
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig();
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  /**
   * tab 页改变
   */
  @Bind()
  tabChange(activeKey) {
    this.setState({
      tabActiveKey: activeKey,
    });
  }

  /**
   * 整单/按行关闭弹框
   */
  @Bind()
  handleClose() {
    this.setState({ cancelCloseModalVisible: true, buttonType: 'close' });
  }

  /**
   * 整单/按行取消弹框
   */
  @Bind()
  handleCancel() {
    const { tabActiveKey, singleSelectedRows } = this.state;
    if (
      tabActiveKey === 'orderCancel' &&
      singleSelectedRows.find((n) => n.orderStatus === 'DELIVERED')
    ) {
      notification.warning({
        message: intl.get(`${commonPrefix}.warningMessage`).d('无法取消已发货的订单'),
      });
    }
    this.setState({ cancelCloseModalVisible: true, buttonType: 'cancel' });
    this.personalizedCoding();
  }

  /**
   * 整单/按行编码
   */
  @Bind()
  personalizedCoding() {
    const { tabActiveKey } = this.state;
    if (tabActiveKey === 'lineCancel') {
      this.setState({ personalizedCoding: 'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE_CANCEL_MODEL' });
    } else {
      this.setState({ personalizedCoding: 'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE_CANCEL-MODEL' });
    }
  }

  /**
   * 整单关闭
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleOrderClose(singleSelectedRemarkRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderCancel/closeOrder',
      payload: singleSelectedRemarkRows,
    }).then((res) => {
      if (res) {
        if (res.errorNum === 0) {
          notification.success();
        } else if (res.errorNum > 0) {
          notification.warning({
            message: intl
              .get(`${commonPrefix}.cancelError`, {
                successNum: res.successNum,
                errorNum: res.errorNum,
              })
              .d(`成功了${res.successNum}条, 失败了${res.errorNum}条`),
          });
        }
        this.setState({
          singleSelectedRows: [],
          cancelCloseModalVisible: false,
        });
        this.singleCancelSearch();
      }
    });
  }

  /**
   * 整单取消
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleOrderCancel(singleSelectedRemarkRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderCancel/cancelOrder',
      payload: {
        singleSelectedRemarkRows,
        customizeUnitCode: 'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE_CANCEL-MODEL',
      },
    }).then((res) => {
      if (res) {
        if (res.errorNum === 0) {
          notification.success();
        } else if (res.errorNum > 0) {
          notification.warning({
            message: intl
              .get(`${commonPrefix}.cancelError`, {
                successNum: res.successNum,
                errorNum: res.errorNum,
              })
              .d(`成功了${res.successNum}条, 失败了${res.errorNum}条`),
          });
        }
        this.setState({
          singleSelectedRows: [],
          cancelCloseModalVisible: false,
        });
        this.singleCancelSearch();
      }
    });
  }

  /**
   * 按行关闭
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleLineClose(cancelSelectedRemarkRows) {
    const {
      dispatch,
      orderCancel: { linePagination },
    } = this.props;
    dispatch({
      type: 'orderCancel/closeLine',
      payload: cancelSelectedRemarkRows,
    }).then((res) => {
      if (res) {
        if (res.errorNum === 0) {
          notification.success();
        } else if (res.errorNum > 0) {
          notification.warning({
            message: intl
              .get(`${commonPrefix}.cancelError`, {
                successNum: res.successNum,
                errorNum: res.errorNum,
              })
              .d(`成功了${res.successNum}条, 失败了${res.errorNum}条`),
          });
        }
        this.setState({
          cancelSelectedRows: [],
          cancelCloseModalVisible: false,
        });
        this.LineCancelSearch(linePagination);
      }
    });
  }

  // cancelLine
  /**
   * 按行取消
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleLineCancel(cancelSelectedRemarkRows) {
    const {
      dispatch,
      orderCancel: { linePagination },
    } = this.props;
    dispatch({
      type: 'orderCancel/cancelLine',
      payload: {
        cancelSelectedRemarkRows,
        customizeUnitCode: 'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE_CANCEL_MODEL',
      },
    }).then((res) => {
      if (res) {
        if (res.errorNum === 0) {
          notification.success();
        } else if (res.errorNum > 0) {
          notification.warning({
            message: intl
              .get(`${commonPrefix}.cancelError`, {
                successNum: res.successNum,
                errorNum: res.errorNum,
              })
              .d(`成功了${res.successNum}条, 失败了${res.errorNum}条`),
          });
        }
        this.setState({
          cancelSelectedRows: [],
          cancelCloseModalVisible: false,
        });
        this.LineCancelSearch(linePagination);
      }
    });
  }

  /**
   * 绑定查询组件
   * @param {*} node -  查询组件
   */
  @Bind()
  bindSingleCancel(node) {
    this.singleSearchForm = node?.props?.form;
  }

  /**
   * 绑定查询组件
   * @param {*} node -  查询组件
   */
  @Bind()
  bindLineCancel(node) {
    this.lineSearchForm = node.props.form;
  }

  /**
   * 整单取消页查询
   * @param {object} page - 分页信息
   */
  @Bind()
  singleCancelSearch(page = {}, sorter, isChangePage = false) {
    const {
      dispatch,
      orderCancel: { pagination: total },
    } = this.props;
    const params = filterNullValueObject(this?.singleSearchForm?.getFieldsValue?.() || {});
    const transDate = {};
    const dateFields = ['creationDateStart', 'creationDateEnd'];
    const { creationDateStart, creationDateEnd } = params;
    if (
      creationDateStart &&
      creationDateEnd &&
      creationDateEnd.isBefore(creationDateStart, 'time')
    ) {
      notification.warning({
        message: intl
          .get('hzero.common.validation.date.after', {
            startDate: intl.get(`${commonPrefix}.createDateStart`).d('创建日期从'),
            endDate: intl.get(`${commonPrefix}.createDateEnd`).d('创建日期至'),
          })
          .d('创建日期从不能晚于创建日期至'),
      });
    } else {
      dateFields.forEach((n) => {
        if (params[n]) {
          transDate[n] = params[n].format(DATETIME_MIN);
        }
      });
      const payload = {
        page,
        ...params,
        ...transDate,
        customizeUnitCode:
          'SODR.ORDER_CANCEL_LIST.DELIVERY_BY_LINE,SODR.ORDER_CANCEL_LIST.DELIVERY_LINE',
        sort: sorter,
        asyncCountFlag: 'DEFAULT',
        ...(isChangePage ? { oldTotalElements: total } : null),
      };
      dispatch({
        type: 'orderCancel/fetchSingleList',
        payload,
      }).then((res) => {
        if (res && res.needCountFlag === 'Y') {
          dispatch({
            type: 'orderCancel/fetchSingleListPage',
            payload,
          });
        }
      });
      this.setState({
        singleSelectedRows: [],
      });
    }
  }

  @Bind()
  LineCancelSearch(page = {}, isChangePage = false) {
    const {
      dispatch,
      orderCancel: { linePagination: total },
    } = this.props;
    const params = filterNullValueObject(this?.lineSearchForm?.getFieldsValue?.() || {});
    const dealTime = {};
    const timeArray = [
      'releasedDateStart',
      'releasedDateEnd',
      'erpCreationDateStart',
      'erpCreationDateEnd',
      'feedbackDateStart',
      'feedbackDateEnd',
      'promiseDeliveryDateEnd',
      'promiseDeliveryDateStart',
      'urgentDateEnd',
      'urgentDateStart',
      'needByDateEnd',
      'needByDateStart',
    ];
    timeArray.forEach((item) => {
      dealTime[item] = params[item] ? params[item].format(DATETIME_MIN) : undefined;
    });
    const payload = {
      page,
      ...params,
      ...dealTime,
      tempKeys: undefined,
      customizeUnitCode:
        'SODR.ORDER_CANCEL_LIST.GRID_BY_LINE,SODR.ORDER_CANCEL_LIST.FILTER_BY_LINE',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderCancel/fetchCancelList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderCancel/fetchCancelListPage',
          payload,
        });
      }
    });
    this.setState({
      cancelSelectedRows: [],
    });
    // }
  }

  /**
   * 整单取消选择行变化
   * @param {object[]} selectedRows - 当前选择行
   */
  @Bind()
  singleSelectChange(_, selectedRows) {
    if (
      selectedRows.find(
        (n) => n.statusCode === 'CANCELED' || n.statusCode === 'CANCELTOBECOMFIRMED'
      )
    ) {
      notification.warning({
        message: intl.get(`${commonPrefix}.notCanceled`).d('不能勾选已取消的订单'),
      });
    } else {
      this.setState({
        singleSelectedRows: selectedRows,
      });
    }
  }

  /**
   * 整单取消选择行变化
   * @param {object[]} selectedRows - 当前选择行
   */
  @Bind()
  lineSelectChange(_, selectedRows) {
    this.setState({
      cancelSelectedRows: selectedRows,
    });
  }

  /**
   * 跳转到详情页面
   * @param {object} record - 行数据
   */
  @Bind()
  handleViewDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-cancel/detail/${record.poHeaderId}`,
        search: `&source=maintain`,
      })
    );
  }

  /**
   * 跳转到变更页面
   * @param {object} record - 行数据
   */
  @Bind()
  handleViewChange(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-cancel/order-change/${record.poHeaderId}`,
      })
    );
  }

  /**
   * 调整金额精度
   * @param {Object} record
   * @param {number} amount
   */
  @Bind()
  amountFinancialPrecision(record, amount) {
    const { priceSensitiveFlag, financialPrecision, poSourcePlatform } = record;
    if (priceSensitiveFlag === 1) {
      return '****';
    } else {
      return ['SRM', 'CATALOGUE', 'SHOP'].includes(poSourcePlatform)
        ? formatAumont(amount, financialPrecision, true)
        : amount;
    }
  }

  /**
   * 绑定取消弹出框
   * @param {*} node -  查询组件
   */
  @Bind()
  bindCancelModal(node) {
    this.cancelModalForm = node.props.form;
  }

  @Bind()
  hideCancelModal() {
    this.setState({ cancelCloseModalVisible: false });
  }

  @Bind()
  handleReasonConfirm(buttonType) {
    const { singleSelectedRows, cancelSelectedRows, tabActiveKey } = this.state;
    this.cancelModalForm.validateFields((err) => {
      if (!err) {
        const params = filterNullValueObject(this.cancelModalForm.getFieldsValue());
        // const { closeCancelRemark } = params;
        const singleSelectedRemarkRows = singleSelectedRows.map((n) => {
          return { ...n, ...params };
        });
        const cancelSelectedRemarkRows = cancelSelectedRows.map((n) => {
          return { ...n, ...params };
        });
        if (tabActiveKey === 'lineCancel') {
          if (buttonType === 'cancel') {
            // 按行取消
            this.handleLineCancel(cancelSelectedRemarkRows);
          } else {
            // 按行关闭
            this.handleLineClose(cancelSelectedRemarkRows);
          }
        } else if (buttonType === 'cancel') {
          // 整单取消
          this.handleOrderCancel(singleSelectedRemarkRows);
        } else {
          // 整单关闭
          this.handleOrderClose(singleSelectedRemarkRows);
        }
      }
    });
  }

  @Bind()
  handleReasonCancel() {
    this.setState({ cancelCloseModalVisible: false });
  }

  /**
   * EXCEL导入
   */
  @Bind()
  handleBatchChange() {
    const { history } = this.props;
    history.push({
      pathname: '/sodr/order-cancel/data-import/SPUC.PO_BULK_CHANGES_IMPORT',
      search: stringify({
        action: intl.get(`hzero.common.button.batchChange`).d('批量变更'),
        backPath: '/sodr/order-cancel/list',
        args: JSON.stringify({
          tenantId: organizationId,
          templateCode: 'SPUC.PO_BULK_CHANGES_IMPORT',
        }),
      }),
    });
  }

  render() {
    const {
      singleSelectedRows,
      cancelSelectedRows,
      cancelCloseModalVisible,
      buttonType,
      tabActiveKey,
      doubleUnitEnabled,
      personalizedCoding,
    } = this.state;
    const {
      remote,
      customizeTable,
      customizeFilterForm,
      fetchSingleLoading,
      closeOrderLoading,
      cancelOrderLoading,
      closeLineLoading,
      cancelLineLoading,
      customizeForm,
      fetchLineLoading = false,
      cancelLoading,
      customizeBtnGroup,
      lineLoading = false,
      orderCancel: { dataSource, pagination, orderSource, lineDataSource, linePagination, enumMap },
    } = this.props;
    const singleProps = {
      customizeTable,
      customizeFilterForm,
      loading: fetchSingleLoading || cancelLoading,
      rowSelection: {
        selectedRowKeys: singleSelectedRows.map((n) => n.poHeaderId),
        onChange: this.singleSelectChange,
      },
      onViewDetail: this.handleViewDetail,
      handleViewChange: this.handleViewChange,
      onSearch: this.singleCancelSearch,
      onRef: this.bindSingleCancel,
      dataSource,
      pagination,
      orderSource,
      enumMap,
    };
    const lineProps = {
      customizeTable,
      customizeFilterForm,
      loading: fetchLineLoading || lineLoading,
      rowSelection: {
        selectedRowKeys: cancelSelectedRows.map((n) => n.poLineLocationId),
        onChange: this.lineSelectChange,
      },
      onViewDetail: this.handleViewDetail,
      onSearch: this.LineCancelSearch,
      onRef: this.bindLineCancel,
      dataSource: lineDataSource,
      pagination: linePagination,
      orderSource,
      enumMap,
      doubleUnitEnabled,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };
    const cancelModalProps = {
      cancelCloseModalVisible,
      buttonType,
      hideCancelModal: this.hideCancelModal,
      handleReasonConfirm: this.handleReasonConfirm,
      handleReasonCancel: this.handleReasonCancel,
      onRef: this.bindCancelModal,
      closeOrderLoading,
      cancelOrderLoading,
      closeLineLoading,
      cancelLineLoading,
      customizeForm,
      personalizedCoding,
    };
    const disabledFlag =
      (tabActiveKey === 'orderCancel' && !singleSelectedRows.length) ||
      (tabActiveKey === 'lineCancel' && !cancelSelectedRows.length);
    const headerBtnsRender = [
      {
        name: 'rollback',
        child: intl.get(`hzero.common.button.cancel`).d('取消'),
        btnProps: {
          icon: 'rollback',
          type: 'primary',
          disabled: disabledFlag,
          onClick: this.handleCancel,
          loading: cancelOrderLoading || cancelLineLoading,
        },
      },

      {
        name: 'close',
        btnComp: PermissionButton,
        child: intl.get(`hzero.common.button.close`).d('关闭'),
        btnProps: {
          icon: 'close',
          type: 'primary',
          disabled: disabledFlag,
          onClick: this.handleClose,
          loading: closeOrderLoading || closeLineLoading,
          permissionList: [
            {
              code: `srm.po-admin.po.cancel-order.ps.button.close`,
              type: 'button',
              meaning: '订单过程控制关闭按钮',
            },
          ],
        },
      },
      {
        name: 'importPro',
        btnComp: CommonImport,
        childFor: 'buttonText',
        child: intl.get(`sodr.common.model.common.newBatchChange`).d('(新)批量变更'),
        btnProps: {
          refreshButton: true,
          prefixPatch: SRM_SPUC,
          args: { tenantId: organizationId },
          buttonProps: {
            permissionList: [
              {
                code: `srm.po-admin.po.cancel-order.ps.button.newimport`,
                type: 'button',
                meaning: '订单过程控制-新版导入按钮',
              },
            ],
          },
          successCallBack: () => this.singleCancelSearch(),
          businessObjectTemplateCode: 'SPUC.PO_BULK_CHANGES_IMPORT',
        },
      },
      {
        name: 'batchChange',
        btnComp: PermissionButton,
        child: intl.get(`hzero.common.button.batchChange`).d('批量变更'),
        btnProps: {
          onClick: this.handleBatchChange,
          permissionList: [
            {
              code: `srm.po-admin.po.cancel-order.ps.button.batchchange`,
              type: 'button',
              meaning: '订单过程控制批量变更按钮',
            },
          ],
        },
      },
    ];
    return (
      <Fragment>
        <Header title={intl.get(`${commonPrefix}.orderProcessControl`).d('订单过程控制')}>
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CANCEL_LIST.DELIVERY_BTNS', pro: true },
            <DynamicButtons
              buttons={remote?.process('processHeaderBtnsRender', headerBtnsRender, {
                tabActiveKey,
                fetchSingle: this.singleCancelSearch,
                fetchLine: this.LineCancelSearch,
              })}
            />
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs defaultActiveKey="orderCancel" onChange={this.tabChange}>
            <TabPane tab={intl.get(`${commonPrefix}.orderSearch`).d('整单查询')} key="orderCancel">
              <SingleCancel {...singleProps} />
            </TabPane>
            <TabPane tab={intl.get(`${commonPrefix}.lineSearch`).d('按行查询')} key="lineCancel">
              <LineCancel {...lineProps} />
            </TabPane>
          </Tabs>
        </Content>
        {cancelCloseModalVisible && <CancelModal {...cancelModalProps} />}
      </Fragment>
    );
  }
}
