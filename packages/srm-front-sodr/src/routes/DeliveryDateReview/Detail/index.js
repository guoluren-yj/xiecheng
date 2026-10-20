/**
 * index - 我发出的订单明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Badge } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getFileList } from '@/services/orderReleaseService';

import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';
import { formatAumont, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { Button } from 'components/Permission';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import arrow from '@/assets/connect.svg';
import Attachment from './Attachment';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import List from './List';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import AssociatedInvoice from './AssociatedInvoice';
import styles from './index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;

// 设置sodr国际化前缀 - button
const viewButtonPrompt = 'sodr.deliveryDateReview.view.button';
// 设置sodr国际化前缀 - message
const viewMessagePrompt = 'sodr.deliveryDateReview.view.message';
// 设置通用国际化前缀
// const commonPrompt = 'hzero.common';

/**
 * 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} saveDetailLoading - 保存明细
 * @reactProps {!boolean} queryPoItemBOMLoading - 查询BOM
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} sendMessageLoading - 发送留言
 * @reactProps {!boolean} queryMessageLoading - 查询留言
 * @reactProps {!boolean} queryPartnersLoading - 查询合作伙伴
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, deliveryDateReview }) => ({
  agreeLoading: loading.effects['deliveryDateReview/agree'],
  rejectLoading: loading.effects['deliveryDateReview/reject'],
  queryPoItemBOMLoading: loading.effects['deliveryDateReview/queryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['deliveryDateReview/queryDetailHeader'],
  sendMessageLoading: loading.effects['deliveryDateReview/sendMessage'],
  queryMessageLoading: loading.effects['deliveryDateReview/queryMessage'],
  queryPartnersLoading: loading.effects['deliveryDateReview/queryPartners'],
  queryDetailListLoading: loading.effects['deliveryDateReview/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['deliveryDateReview/fetchOperationRecordList'],
  fetchApproveListLoading: loading.effects['sendOrder/fetchApproveRecordList'],
  queryFileListOrgLoading: loading.effects['deliveryDateReview/queryFileListOrg'],
  asnLinesLoading: loading.effects['deliveryDateReview/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['deliveryDateReview/fetchRcvRecords'],
  billLinesLoading: loading.effects['deliveryDateReview/fetchBillLines'],
  oldBillLinesLoading: loading.effects['deliveryDateReview/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['deliveryDateReview/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['deliveryDateReview/fetchOldInvoiceLines'],
  printLoading: loading.effects['deliveryDateReview/print'],
  deliveryDateReview,
}))
@formatterCollections({
  code: [
    'sodr.deliveryDateReview',
    'sodr.quotePurchaseRequisition',
    'sodr.quotePurchase',
    'sprm.common',
    'sodr.common',
    'sodr.sendOrder',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'entity.item',
    'spcm.common',
    'sodr.confirmOrder',
    'sprm.purchaseReqCreation',
    'component.docFlow',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_LINE',
    'SODR.ORDER_DELIVERY_LINE_LIST.HEADER',
    'SODR.ORDER_DELIVERY_LINE_LIST.OTHER',
    'SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_CATA',
    'SODR.ORDER_DELIVERY_LINE_LIST.TAB',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [], // 基本信息/其他信息数据源
      listCommonPagination: {}, // 基本信息/其他信息分页
      listPartnersDataSource: [], // 合作伙伴数据源
      listPartnersPagination: {}, // 合作伙伴分页
      messageBoardVisible: false,
      wrapperBOMModalVisible: false,
      actionListRowData: {},
      organizationId: getCurrentOrganizationId(),
      attachmentUUID: '',
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      unreadCount: 0,
      associatedConfigFlag: true, // 新旧结算判断flag
      fileList: [],
      doubleUnitEnabled: 0,
    };

    // 方法注册
    [
      'fetchDetailHeader',
      'fetchDetailList',
      'fetchPartners',
      'fetchAsnLines',
      'fetchRcvRecords',
      'fetchBillLines',
      'fetchOldBillLines',
      'fetchInvoiceLines',
      'fetchOldInvoiceLines',
      'onRadioGroupChange',
      'setActionListCommonRow',
      'attchmentAendMessage',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    this.fetchEnum();
    this.queryDoubleUomConfig();
    if (isNumber(Number(params.id))) {
      this.fetchDetailHeader();
      // this.fetchDetailList();
      this.fetchPartners();
      this.fetchAssociatedConfigFlag();
    }
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        // this.fetchDetailList();
        this.fetchPartners();
      }
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
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'deliveryDateReview/init' });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'deliveryDateReview/queryDetailHeader',
      payload: {
        customizeUnitCode:
          'SODR.ORDER_DELIVERY_LINE_LIST.HEADER,SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_CATA',
        poHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            orderHeaderFormDataSource: res,
            attachmentUUID: res.attachmentUuid,
            unreadCount: res.unreadCount,
          },
          () => this.fetchDetailList()
        );
        if (res.electricSignUrl) {
          getFileList([res.electricSignUrl]).then((v) => {
            if (getResponse(v)) {
              this.setState({
                fileList: v,
              });
            }
          });
        }
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  fetchDetailList(queryParams = {}) {
    const { orderHeaderFormDataSource = {} } = this.state;
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    const lineDisplay =
      orderHeaderFormDataSource.collByLineFlag && this.list
        ? this.list.props.form.getFieldValue('lineDisplay')
        : null;
    dispatch({
      type: 'deliveryDateReview/queryDetailList',
      payload: {
        poHeaderId: params.id,
        lineDisplay: lineDisplay === 1 ? 0 : 1,
        poEntryPoint: 'OERDER_FEEDBACK',
        customizeUnitCode:
          'SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_LINE,SODR.ORDER_DELIVERY_LINE_LIST.OTHER',
        ...queryParams,
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination = {} } = res;
        const listCommonDataSource =
          dataSource?.map((n) => ({
            ...n,
            key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
            _status: 'update',
          })) || [];
        this.setState({
          listCommonDataSource: listCommonDataSource || [],
          listCommonPagination: pagination || {},
          actionListCommonRow: listCommonDataSource[0] || {},
        });
      }
    });
  }

  /**
   * fetchPartners - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  fetchPartners(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'deliveryDateReview/queryPartners',
      poHeaderId: params.id,
      params: queryParams,
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        this.setState({
          listPartnersDataSource: dataSource.map((n) => ({
            ...n,
            key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          })),
          listPartnersPagination: pagination,
        });
      }
    });
  }

  /**
   * fetchMessage - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId, poLineLocationId } = actionListRowData;
    dispatch({
      type: 'deliveryDateReview/queryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        poLineLocationId,
        page: 0,
        size: 10,
        ...params,
        customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  save() {
    const { dispatch } = this.props;
    const { validateFields = (e) => e } = this.orderHeaderForm;
    const {
      orderHeaderFormDataSource,
      basicInfoListDataSource,
      otherInfoListDataSource,
      attachmentUUID,
    } = this.state;
    validateFields((err) => {
      if (isEmpty(err)) {
        const data = {
          poHeaderDetailDTO: {
            ...orderHeaderFormDataSource,
            attachmentUuid: attachmentUUID,
          },
          poLineOtherDetailDTOs: otherInfoListDataSource,
          poLineBasicDetailDTOs: basicInfoListDataSource,
        };
        dispatch({
          type: 'deliveryDateReview/saveDetail',
          data,
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchDetailHeader();
            // this.fetchDetailList();
          }
        });
      }
    });
  }

  /**
   * agree - 交期审核同意
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  agree() {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource,
      // basicInfoListDataSource,
      attachmentUUID,
    } = this.state;
    const selected = this.list ? this.list.state.selectedRows : [];
    const byLine = orderHeaderFormDataSource.collByLineFlag && !isEmpty(selected);
    const { validateFields = (e) => e } = this.orderHeaderForm;
    const lines = getEditTableData(byLine ? selected : listCommonDataSource, ['_status']);
    validateFields((err, values) => {
      if (isEmpty(err)) {
        const data = {
          ...orderHeaderFormDataSource,
          ...values,
          attachmentUuid: attachmentUUID,
          checkFlag: byLine ? 1 : 0,
          poLineLocationList: lines.map((n) => {
            const {
              // poLineId,
              // poLineLocationId,
              locationVersionNumber,
              // remark: newRemark,
              // _token,
            } = n;
            return {
              ...n,
              // poLineId,
              // poLineLocationId,
              objectVersionNumber: locationVersionNumber,
              // remark: newRemark,
              // _token,
            };
          }),
        };
        Modal.confirm({
          title: intl
            .get(`sodr.deliveryDateReview.view.message.confirmAgree`)
            .d('是否确认同意交期'),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: () => {
            dispatch({
              type: 'deliveryDateReview/agree',
              payload: {
                data: [data],
                customizeUnitCode:
                  'SODR.ORDER_DELIVERY_LINE_LIST.HEADER,SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_LINE',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: '/sodr/delivery-date-review/list',
                  })
                );
              }
            });
          },
        });
      }
    });
  }

  /**
   * agree - 交期审核拒绝
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  reject() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource, listCommonDataSource = [], attachmentUUID } = this.state;
    const { validateFields = (e) => e } = this.orderHeaderForm;
    const byLine = orderHeaderFormDataSource.collByLineFlag && !isEmpty(selected);
    const selected = this.list ? this.list.state.selectedRows : [];
    const lines = getEditTableData(byLine ? selected : listCommonDataSource, ['_status']);
    validateFields((err, values) => {
      if (isEmpty(err)) {
        const data = {
          ...orderHeaderFormDataSource,
          ...values,
          attachmentUuid: attachmentUUID,
          checkFlag: byLine ? 1 : 0,
          poLineLocationList: lines.map((n) => ({
            ...n,
            objectVersionNumber: n.locationVersionNumber,
            deliveryDateRejectFlag: 1,
          })),
        };
        Modal.confirm({
          title: intl
            .get(`sodr.deliveryDateReview.view.message.confirmReject`)
            .d('是否确认审核拒绝交期'),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          onOk: () => {
            dispatch({
              type: 'deliveryDateReview/reject',
              payload: {
                data: [data],
                customizeUnitCode:
                  'SODR.ORDER_DELIVERY_LINE_LIST.HEADER,SODR.ORDER_DELIVERY_LINE_LIST.DELIVERY_LINE',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: '/sodr/delivery-date-review/list',
                  })
                );
              }
            });
          },
        });
      }
    });
  }

  /**
   * 获取UUID  并将获得的uuid存入数据库
   */
  fetchUUID() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'deliveryDateReview/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'deliveryDateReview/saveAttachmentUUID',
          payload: { poHeaderId: params.id, uuid: res.content, uuidType: 1 },
        }).then((result) => {
          const { orderHeaderFormDataSource } = this.state;
          this.setState({
            attachmentUUID: res.content,
            orderHeaderFormDataSource: {
              ...orderHeaderFormDataSource,
              objectVersionNumber: result || orderHeaderFormDataSource.objectVersionNumber,
              attachmentUuid: res.content,
            },
          });
        });
      }
    });
  }

  /**
   * fetchMessage - 查询留言板数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  fetchMessage(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'deliveryDateReview/queryMessage',
      params: {
        poHeaderId: match.params.id,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * sendMessage - 发送留言
   * @param {string} message - 留言数据
   * @param {function} success - 操作成功回调函数
   */
  sendMessage(message, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'deliveryDateReview/sendMessage',
      data: {
        poHeaderId: match.params.id,
        message,
        userCampCode: 'PURCHASE',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * attchmentAendMessage - 发送附件
   * @param {string} message - 附件名
   * @param {string} url - 附件url
   * @param {function} success - 操作成功回调函数
   */
  attchmentAendMessage(message, url, uuid, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'deliveryDateReview/sendMessage',
      data: {
        message,
        poHeaderId: match.params.id,
        attachmentName: message,
        attachmentUrl: url,
        attachmentUuid: uuid,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'deliveryDateReview/fetchAsnLines',
      deliveryStrategyId: actionListCommonRow.deliveryStrategyId,
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchAsnLines - 查询收货记录数据
   */
  fetchRcvRecords() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 收货记录
      type: 'deliveryDateReview/fetchRcvRecords',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchBillLines - 查询对账单数据
   */
  fetchBillLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'deliveryDateReview/fetchBillLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldBillLines - 查询老对账单数据
   */
  fetchOldBillLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'deliveryDateReview/fetchOldBillLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据
   */
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'deliveryDateReview/fetchInvoiceLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldInvoiceLines - 查询网上发票数据
   */
  fetchOldInvoiceLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'deliveryDateReview/fetchOldInvoiceLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  openOperationRecord() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
  }

  /**
   * openMessageBoard - 打开留言板 并获取数据
   */
  openMessageBoard() {
    this.setState(
      {
        messageBoardVisible: true,
        unreadCount: 0,
      },
      () => {
        if (isFunction(this.updateMessage)) {
          this.updateMessage({}, true);
        }
      }
    );
  }

  /**
   * closeMessageBoard - 关闭留言板
   */
  closeMessageBoard() {
    this.setState({
      messageBoardVisible: false,
    });
  }

  /**
   * assignListDataSource - 合并行数据至数据集合
   * @param {Array} [listCommonDataSource = []] - 数据集合
   */
  assignListDataSource(listCommonDataSource) {
    this.setState({
      listCommonDataSource,
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  openBOMModal(actionListRowData) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * onListChange - 列表分页切换
   * @param {string} actionType - tab切换标记
   * @param {object} page - 分页信息
   */
  onListChange(actionType, page) {
    const actionMap = new Map([
      ['common', () => this.fetchDetailList({ page })],
      ['partners', () => this.fetchPartners({ page })],
    ]);
    actionMap.get(actionType)();
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  setActionListCommonRow(actionListCommonRow) {
    this.setState({
      actionListCommonRow,
    });
  }

  // onSearchInvoiceInfo(item) {
  //   const { dispatch } = this.props;
  //   const { organizationId } = this.state;
  //   // debugger;
  //   dispatch({
  //     // 送货单
  //     type: 'deliveryDateReview/fetchAsnLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 收货记录
  //     type: 'deliveryDateReview/fetchRcvRecords',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 对账单
  //     type: 'deliveryDateReview/fetchBillLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  //   dispatch({
  //     // 网上发票
  //     type: 'deliveryDateReview/fetchInvoiceLines',
  //     payload: {
  //       organizationId,
  //       poLineLocationId: item.poLineLocationId,
  //     },
  //   });
  // }

  onRadioGroupChange(radioGroupValue) {
    this.setState({
      radioGroupValue,
    });
  }

  /**
   * fetchUuidBindHeader - 首次加载附件组件时判断该头是否有Uuid，没有就去请求一个并绑定
   */
  @Bind()
  fetchUuidBindHeader() {
    const {
      orderHeaderFormDataSource: { attachmentUuid = undefined },
    } = this.state;
    if (!attachmentUuid) {
      // 后台传过来的attachmentUuid不存在 则 新获取 uuid
      this.fetchUUID();
    }
  }

  /**
   * 查询采购方附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchPurchaserAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryDateReview/queryFileListOrg',
      payload,
    });
  }

  /**
   * 查询供应商附件列表
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @returns Promise
   */
  @Bind()
  fetchSupplierAttachmentList(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryDateReview/queryFileListOrg',
      payload,
    });
  }

  /**
   * 删除附件
   * @param {Object} payload
   * @param {String} payload.attachmentUUID 附件uuid
   * @param {string} payload.bucketName 桶名
   * @param {string} payload.urls 要删除附件的url
   * @returns Promise
   */
  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'deliveryDateReview/removeFile',
      payload,
    });
  }

  /**
   * 打印功能
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handlePrint() {
    const { dispatch, match = {} } = this.props;
    const { params = {} } = match;
    dispatch({
      type: 'deliveryDateReview/print',
      poHeaderId: params.id,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow && printWindow.print) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 调整金额精度
   * @param {string} priceShieldFlag
   * @param {number} amount
   * @param {number} financialPrecision
   */
  @Bind()
  amountFinancialPrecision(
    priceShieldFlag,
    amount,
    financialPrecision,
    poSourcePlatform,
    sourceOfTransferOrder
  ) {
    if (priceShieldFlag === 1) {
      return '******';
    } else if (
      poSourcePlatform === 'ERP' ||
      ((poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') &&
        sourceOfTransferOrder === 'AUTOTRANSFER')
    ) {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * 调整单价精度
   * @param {string} priceShieldFlag
   * @param {number} unitPrice
   * @param {number} defaultPrecision
   */
  @Bind()
  unitPriceDefaultPrecision(priceShieldFlag, text, defaultPrecision, poSourcePlatform) {
    if (priceShieldFlag === 1) {
      return '******';
    } else if (poSourcePlatform === 'ERP') {
      return formatAumont(text);
    } else {
      const precision = isNumber(defaultPrecision) ? Number(defaultPrecision) : defaultPrecision;
      return formatAumont(text, precision);
    }
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliveryDateReview/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  render() {
    const {
      deliveryDateReview,
      dispatch,
      match,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      fetchApproveListLoading,
      queryFileListOrgLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      sendMessageLoading,
      queryMessageLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      agreeLoading,
      rejectLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      printLoading,
    } = this.props;
    const {
      orderHeaderFormDataSource = {},
      operationRecordModalVisible,
      listCommonDataSource,
      listCommonPagination,
      listPartnersDataSource,
      listPartnersPagination,
      messageBoardVisible,
      wrapperBOMModalVisible,
      actionListRowData,
      organizationId,
      attachmentUUID,
      collapseKeys = [],
      radioGroupValue,
      actionListCommonRow,
      unreadCount,
      doubleUnitEnabled,
      associatedConfigFlag,
      fileList,
    } = this.state;
    const { poSourcePlatform, electricSignFlag } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
      enumMap,
    } = deliveryDateReview;
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const deliveryAndBillProps = {
      customizeForm,
      dataSource: orderHeaderFormDataSource,
    };
    const orderHeaderFormProps = {
      customizeForm,
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: orderHeaderFormDataSource,
      amountFinancialPrecision: this.amountFinancialPrecision,
      unitPriceDefaultPrecision: this.unitPriceDefaultPrecision,
    };
    const operationRecordProps = {
      dispatch,
      match,
      organizationId,
      detailOperationQuery,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      approveLoading: fetchApproveListLoading,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const listProps = {
      enumMap,
      onRef: (ref) => {
        this.list = ref;
      },
      customizeTable,
      customizeTabPane,
      fetchDetailList: this.fetchDetailList,
      orderHeaderFormDataSource,
      processing: { queryDetailListLoading, queryPartnersLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource.bind(this),
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      doubleUnitEnabled,
      actionListCommonRow,
      poSourcePlatform,
      setActionListCommonRow: this.setActionListCommonRow,
      amountFinancialPrecision: this.amountFinancialPrecision,
      unitPriceDefaultPrecision: this.unitPriceDefaultPrecision,
    };
    const messageProps = {
      visible: messageBoardVisible,
      attchmentAendMessage: this.attchmentAendMessage.bind(this),
      onCancel: this.closeMessageBoard.bind(this),
      fetchMessage: this.fetchMessage.bind(this),
      sendMessage: this.sendMessage.bind(this),
      onRef: (node) => {
        this.updateMessage = node;
      },
      processing: { queryMessageLoading, sendMessageLoading },
    };
    const { supplierAttachmentUuid, filesNumber } = orderHeaderFormDataSource;
    const attachmentProps = {
      filesNumber,
      attachmentUUID, // 采购方uuid
      supplierAttachmentId: supplierAttachmentUuid, // 供应商uuid
      bucketName: BUCKET_NAME,
      // bucketDirectory: 'sodr-order',
      showFilesNumber: true,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal.bind(this),
      fetchBOM: this.fetchBOM.bind(this),
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };
    const associatedInvoiceProps = {
      fetchAsnLines: this.fetchAsnLines,
      fetchRcvRecords: this.fetchRcvRecords,
      fetchInvoiceLines: associatedConfigFlag ? this.fetchInvoiceLines : this.fetchOldInvoiceLines,
      fetchBillLines: associatedConfigFlag ? this.fetchBillLines : this.fetchOldBillLines,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      processing: {
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      actionListCommonRow,
      associatedConfigFlag,
    };

    const previewModalProps = {
      fileList,
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      btnProps: {
        icon: 'paper-clip',
      },
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.detail`).d('订单明细')}
          backPath="/sodr/delivery-date-review/list"
        >
          <Button
            loading={agreeLoading || queryDetailHeaderLoading || queryDetailListLoading}
            disabled={rejectLoading}
            type="primary"
            onClick={this.agree.bind(this)}
            icon="check"
          >
            {intl.get(`${viewButtonPrompt}.agree`).d('同意')}
          </Button>
          <Button
            loading={rejectLoading || queryDetailHeaderLoading || queryDetailListLoading}
            disabled={agreeLoading}
            onClick={this.reject.bind(this)}
            icon="close"
          >
            {intl.get(`${viewButtonPrompt}.sendBack`).d('退回')}
          </Button>
          <Attachment {...attachmentProps} />
          <Button icon="clock-circle-o" onClick={this.openOperationRecord.bind(this)}>
            {intl.get(`${viewButtonPrompt}.operationRecord`).d('操作记录')}
          </Button>
          <Badge count={unreadCount || 0} overflowCount={99}>
            <Button icon="message" onClick={this.openMessageBoard.bind(this)}>
              {intl.get(`${viewButtonPrompt}.messageBoard`).d('留言板')}
            </Button>
          </Badge>
          <Button
            style={{ marginRight: 8 }}
            icon="printer"
            onClick={this.handlePrint}
            loading={printLoading}
            permissionList={[
              {
                code: `srm.po-admin.po.delivery-date-review.ps.button.deliverydatereviewprint`,
                type: 'button',
                meaning: '订单反馈审核-订单详情打印',
              },
            ]}
          >
            {intl.get(`${viewButtonPrompt}.print`).d('打印')}
          </Button>
          {!queryDetailHeaderLoading && electricSignFlag === 1 && (
            <PreviewModal {...previewModalProps} />
          )}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || false}
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME, styles['delivery-detail'])}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange.bind(this)}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${viewMessagePrompt}.title.orderHeaderInfo`).d('订单头信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <OrderHeaderForm {...orderHeaderFormProps} />
              </Panel>
              {(poSourcePlatform === 'E-COMMERCE' || poSourcePlatform === 'CATALOGUE') && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`${viewMessagePrompt}.receivingInformation`).d('收货/收单信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('deliveryInformationHeader')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.includes('deliveryInformationHeader') ? 'up' : 'down'}
                      />
                    </Fragment>
                  }
                  key="deliveryInformationHeader"
                >
                  <DeliveryInformationHeader {...deliveryAndBillProps} />
                </Panel>
              )}
              {poSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${viewMessagePrompt}.billingInformation`).d('开票信息')}</h3>
                      <a>
                        {collapseKeys.includes('billingInformation')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('billingInformation') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="billingInformation"
                >
                  <BillingInformation {...deliveryAndBillProps} />
                </Panel>
              )}
            </Collapse>
            <div style={{ display: 'flex' }}>
              <div style={{ width: radioGroupValue === 'invoice' ? '41.66%' : '100%' }}>
                <List {...listProps} />
              </div>
              {radioGroupValue === 'invoice' && (
                <div className="right-table">
                  <img src={arrow} alt="" className="arrow" />
                  <div>
                    <AssociatedInvoice {...associatedInvoiceProps} />
                  </div>
                </div>
              )}
            </div>
          </Spin>
        </Content>
        <Message {...messageProps} />
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
      </Fragment>
    );
  }
}
