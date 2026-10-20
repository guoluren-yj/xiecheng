/**
 * Detail - 采购方送货单明细
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Collapse, Spin, Icon, Tooltip, Tabs } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNumber, merge, isFunction, isNil, isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import qs from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
// import UploadModal from 'components/Upload';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import cuxRemote from 'hzero-front/lib/utils/remote';

import DeliveryHeader from './DeliveryHeader';
import BasicInfoList from './BasicInfoList';
// import LogisticsInfoList from './LogisticsInfoList';
import LogisticsDetail from '../../components/LogisticsDetail';
import OperationRecord from '../../components/DeliveryOeration';
import LogisticsInfoModal from './LogisticsInfoModal';
import styles from './index.less';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import BomModal from './BOMModal';
import ShipHeaderInfo from './ShipHeaderInfo';
import MessageBoard from './MessageBoard';
import { globalPrint } from '@/routes/components/utils';
import { fetchConfigSheet } from '@/services/commonService';

const { Panel } = Collapse;
const { TabPane } = Tabs;
/**
 * 采购方送货单明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} uom - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@cuxRemote(
  {
    code: 'SINV_PURCHASER_DELIVERY_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      cuxDetailHeaderBtn: undefined,
    },
  }
)
@withCustomize({
  unitCode: [
    'SINV.PURCHASER_DELIVERY.DETAIL.LINE_TABS',
    'SINV.PURCHASER_DELIVERY.DETAIL.HEADER',
    'SINV.PURCHASER_DELIVERY.DETAIL.BASIC',
    'SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
    'SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP',
    'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
    'SINV.PURCHASER_DELIVERY.DETAIL.BUTTONS.DETAIL_H0',
  ],
})
@formatterCollections({
  code: [
    'sinv.purchaserDelivery',
    'sinv.supplierDelivery',
    'sinv.common',
    'sinv.purchaseReception',
    'entity.item',
    'entity.supplier',
    'entity.customer',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'sinv.receiptExecution',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, purchaserDelivery }) => ({
  loadingHeader: loading.effects['purchaserDelivery/queryDetailHeader'],
  loadingLines: loading.effects['purchaserDelivery/queryDetailLines'],
  loadingLogistics: loading.effects['purchaserDelivery/addLogistics'],
  repLoading: loading.effects['purchaserDelivery/reImportERP'],
  saveLoading: loading.effects['purchaserDelivery/save'],
  printLoading: loading.effects['purchaserDelivery/print'],
  queryPoItemBOMLoading: loading.effects['purchaserDelivery/fetchBOM'],
  queryMessageLoading: loading.effects['supplierDelivery/queryMessage'],
  queryPartnersLoading: loading.effects['supplierDelivery/queryPartners'],
  loadingNewPrint: loading.effects['purchaserDelivery/newPrintList'],
  purchaserDelivery,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { origin } = qs.parse(search.substr(1));
    this.state = {
      headerInfo: {}, // 头信息
      dataSource: [], // 行数据
      pagination: {}, // 基本信息分页
      activeKey: 'basicInfo',
      collapseKeys: ['deliveryHeaderInfo', 'deliveryHeaderInfos'],
      visible: false,
      asnHeaderId: props.match.params.asnHeaderId, // 头ID
      tenantId: getCurrentOrganizationId(),
      _token: '',
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      wrapperBOMModalVisible: false,
      messageBoardVisible: false,
      operationRecordVisible: false,
      unReadCount: 0,
      logisticsBtnVisible: 0, // 物流补录按钮
      infoSupplementVisible: false, // 物流补录弹框
      origin, // 添加详情页来自查询还是明细查询列表
      configSheetFlag: false, // 查询配置表标识
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { asnHeaderId } = this.state;
    if (isNumber(Number(asnHeaderId))) {
      this.fetchConfig();
      this.fetchDetailHeader();
      this.fetchDetailLines();
      // this.fetchPartners();
      dispatch({
        type: 'purchaserDelivery/fetchEnum',
      });
    }
  }

  // 查询配置表逻辑
  fetchConfig = async () => {
    const res = await fetchConfigSheet({
      configCode: 'sinv_asn_logistics_information_phone_no_need',
    });
    if (getResponse(res)) {
      if (!isEmpty(res)) {
        this.setState({
          configSheetFlag: true,
        });
      }
    }
  };

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { asnHeaderId } = this.state;
    dispatch({
      type: 'purchaserDelivery/queryDetailHeader',
      asnHeaderId,
      userCampCode: 'PURCHASER',
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.HEADERSHIP',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          headerInfo: res,
          unReadCount: res.unReadCount,
        });
      }
      // logisticsBtnVisible显示逻辑：flag为null保持原有逻辑，1显示按钮，0不显示按钮
      if (!isNil(res?.logisticsEnabledFlag)) {
        this.setState({
          logisticsBtnVisible: res?.logisticsEnabledFlag || null,
        });
      }
    });
  }

  /**
   * fetchDetailLines - 查询行数据
   */
  @Bind()
  fetchDetailLines(page = {}, _, sorter) {
    const { dispatch } = this.props;
    const { asnHeaderId } = this.state;
    dispatch({
      type: 'purchaserDelivery/queryDetailLines',
      payload: {
        page,
        sort: sorter,
        asnHeaderId,
        customizeUnitCode:
          'SINV.PURCHASER_DELIVERY.DETAIL.BASIC,SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            dataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(res),
          },
          () => {
            this.state.dataSource.forEach((i) => {
              Promise.all(this.handleGetPicNums(i)).then((r) => {
                if (r.reduce((prev, cur) => prev + cur) === 0) {
                  return;
                }
                this.setState({
                  dataSource: this.state.dataSource.map((item) => {
                    if (item.asnLineId === i.asnLineId) {
                      return {
                        ...item,
                        picNums: r.reduce((prev, cur) => prev + cur),
                      };
                    }
                    return { ...item };
                  }),
                });
              });
            });
          }
        );
      }
    });
  }

  /**
   * 获取采购方附件
   */
  queryPurchaserAttachmentList = (val) => {
    return this.fetchPurchaserAttachmentList({
      attachmentUUID: val,
      bucketName: 'private-bucket',
    }).then((num) => num.length);
  };

  // 获取附件数量
  handleGetPicNums = (record = {}) => {
    let num1 = 0;
    let num2 = 0;
    let num3 = 0;
    if (record.approveAttachmentUuid) {
      num1 = this.queryPurchaserAttachmentList(record.approveAttachmentUuid);
    }
    if (record.reviewAttachmentUuid) {
      num2 = this.queryPurchaserAttachmentList(record.reviewAttachmentUuid);
    }
    if (record.otherAttachmentUuid) {
      num3 = this.queryPurchaserAttachmentList(record.otherAttachmentUuid);
    }
    return [num1, num2, num3];
  };

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  /**
   * 改变物流补录弹窗显隐
   * @param {Boolean} flag
   */
  @Bind()
  logisticsInfoVisibleChange(flag) {
    this.setState({ infoSupplementVisible: !!flag });
  }

  /**
   * 物流补录
   * @param {Object} logistics // 当前物流信息
   */
  @Bind()
  handleLogistics(logistics) {
    const { asnHeaderId, headerInfo } = this.state;
    const { objectVersionNumber, _token } = headerInfo;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaserDelivery/addLogistics',
      payload: {
        _token,
        asnHeaderId,
        objectVersionNumber,
        ...logistics,
      },
      customizeUnitCode: 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ headerInfo: { ...headerInfo, ...res } });
        // notification.success();
        this.logisticsInfoVisibleChange(false);
        this.fetchDetailHeader();
        this.fetchDetailLines();
        notification.success();
        if (this.logistics) {
          this.logistics.fetchLogistics();
        }
      }
    });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true }, () => {
      const {
        headerInfo: { otherAttachmentUuid },
      } = this.state;
      if (!otherAttachmentUuid) {
        this.getHeaderAttachmentUuid();
      }
    });
  }

  @Bind()
  lineHideAttachment() {
    this.setState({ lineVisible: false });
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
      type: 'purchaserDelivery/removeFile',
      payload,
    });
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
      type: 'purchaserDelivery/queryFileListOrg',
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
      type: 'purchaserDelivery/queryFileListOrg',
      payload,
    });
  }

  /**
   * reImportERP - 送货单重新导入ERP
   */
  @Bind()
  reImportERP() {
    const { dispatch } = this.props;
    const { headerInfo, dataSource } = this.state;
    const data = {
      ...headerInfo,
      asnLineList: dataSource,
    };
    dispatch({
      type: 'purchaserDelivery/reImportERP',
      data,
    }).then((result) => {
      if (getResponse(result)) {
        notification.success();
        this.fetchDetailHeader();
        this.fetchDetailLines();
      }
    });
  }

  // /**
  //  * onCollapseChange - 折叠面板onChange
  //  * @param {string} collapseKeys - Panels key
  //  */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  // @Bind()
  // onCollapseChange(arr, key) {
  //   const { collapseKeys } = this.state;
  //   this.setState({
  //     collapseKeys: {
  //       ...collapseKeys,
  //       [key]: arr,
  //     },
  //   });
  // }

  /**
   * tab切换
   * @param {String} activeKey
   */
  @Bind()
  handleTabChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid() {
    const { dispatch } = this.props;
    const { headerInfo = {} } = this.state;
    const {
      asnHeaderId,
      objectVersionNumber,
      _token,
      approveAttachmentUuid,
      supplierAttachmentUuid,
      reviewAttachmentUuid,
      supplierAttaUuid,
    } = headerInfo;
    const otherAttachmentUuid = uuid();
    dispatch({
      type: 'purchaserDelivery/getHeaderAttachmentUuid',
      data: {
        asnHeaderId,
        objectVersionNumber,
        _token,
        otherAttachmentUuid,
        approveAttachmentUuid,
        supplierAttachmentUuid,
        reviewAttachmentUuid,
        supplierAttaUuid,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { asnHeaderId, tenantId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaserDelivery/print',
      payload: { asnHeaderId, tenantId },
    }).then((res) => {
      globalPrint(res);
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState(
      {
        lineVisible: true,
        _token: record._token,
        asnLineId: record.asnLineId,
        attachmentUuid: record.attachmentUuid,
        objectVersionNumber: record.objectVersionNumber,
        otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
        reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
        approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
      },
      () => {
        const { otherAttachmentUuid } = this.state;
        if (!otherAttachmentUuid) {
          this.getLineAttachmentUuid();
        }
      }
    );
  }

  /**
   * getLineAttachmentUuid - 获取行附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  getLineAttachmentUuid() {
    const { dispatch } = this.props;
    const {
      asnLineId,
      objectVersionNumber,
      _token,
      attachmentUuid,
      approveAttachmentUuid,
      reviewAttachmentUuid,
    } = this.state;
    const otherAttachmentUuid = uuid();
    dispatch({
      type: 'purchaserDelivery/getLineAttachmentUuid',
      data: {
        asnLineId,
        objectVersionNumber,
        _token,
        attachmentUuid,
        approveAttachmentUuid,
        otherAttachmentUuid,
        reviewAttachmentUuid,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ otherAttachmentUuid });
        this.fetchDetailLines();
      }
    });
  }

  @Bind()
  save() {
    const { dispatch, form } = this.props;
    const { headerInfo, dataSource = [] } = this.state;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const list = getEditTableData(dataSource);
        if (isNil(headerInfo._token)) return;
        dispatch({
          type: 'purchaserDelivery/save',
          payload: {
            data: {
              ...merge(headerInfo, values),
              asnLineList: list,
            },
            customizeUnitCode:
              'SINV.PURCHASER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS,SINV.PURCHASER_DELIVERY.DETAIL.BASIC,SINV.PURCHASER_DELIVERY.DETAIL.OTHER',
          },
        }).then((res) => {
          if (getResponse(res)) {
            this.fetchDetailHeader();
            this.fetchDetailLines();
            notification.success();
          }
        });
      }
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(_, actionListRowData = {}) {
    this.setState({
      wrapperBOMModalVisible: true,
      actionListRowData,
    });
  }

  /**
   * closeBOMModal - 关闭BOM Modal 清空当前操作行数据
   */
  @Bind()
  closeBOMModal() {
    this.setState({
      wrapperBOMModalVisible: false,
      actionListRowData: {},
    });
  }

  /**
   * fetchBOM - 查询BOM数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { actionListRowData = {}, asnHeaderId } = this.state;
    const { asnLineId } = actionListRowData;
    dispatch({
      type: 'purchaserDelivery/fetchBOM',
      payload: {
        functionCode: null,
        poHeaderId: asnHeaderId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        ...params,
      },
    }).then((res) => {
      if (getResponse(res)) {
        success(res);
      }
    });
  }

  /**
   * openMessageBoard - 打开留言板 并获取数据
   */
  openMessageBoard() {
    this.setState(
      {
        messageBoardVisible: true,
        unReadCount: 0,
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
   * fetchMessage - 查询留言板数据
   * @param {object} params - 查询条件
   * @param {function} success - 操作成功回调函数
   */
  fetchMessage = (params, success = (e) => e) => {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'purchaserDelivery/queryMessage',
      params: {
        asnHeaderId: match.params.asnHeaderId,
        ...params,
      },
    }).then((res) => {
      if (getResponse(res)) {
        success(res);
      }
    });
  };

  /**
   * sendMessage - 发送留言
   * @param {string} message - 留言数据
   * @param {function} success - 操作成功回调函数
   */
  sendMessage = (message, success = (e) => e) => {
    const { dispatch = (e) => e, match = {} } = this.props;
    dispatch({
      type: 'purchaserDelivery/sendMessage',
      data: {
        asnHeaderId: match.params.asnHeaderId,
        message,
        userCampCode: 'SUPPLIER',
      },
    }).then((res) => {
      if (getResponse(res)) {
        success(res);
      }
    });
  };

  /**
   * attchmentAendMessage - 发送附件
   * @param {string} message - 附件名
   * @param {string} url - 附件url
   * @param {function} success - 操作成功回调函数
   */
  attchmentAendMessage = (message, url, _uuid, success = (e) => e) => {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'purchaserDelivery/sendMessage',
      data: {
        message,
        asnHeaderId: match.params.asnHeaderId,
        attachmentName: message,
        attachmentUrl: url,
        attachmentUuid: _uuid,
      },
    }).then((res) => {
      if (getResponse(res)) {
        success(res);
      }
    });
  };

  /**
   * 修改操作记录visible
   * @param {Boolean} flag //改变操作记录的显隐
   */
  @Bind()
  handleOperationVisible(flag) {
    this.setState({ operationRecordVisible: !!flag });
  }

  /**
   * 打印功能
   */
  @Bind()
  @Debounce(400)
  newHandlePrint() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    dispatch({
      type: 'purchaserDelivery/newPrintList',
      asnHeaderIdList: [headerInfo],
    }).then((res) => {
      globalPrint(res);
    });
  }

  render() {
    const {
      printLoading,
      saveLoading,
      loadingHeader,
      loadingLines,
      customizeForm,
      customizeTable,
      form,
      remote,
      repLoading,
      queryPoItemBOMLoading,
      queryMessageLoading,
      sendMessageLoading,
      loadingLogistics,
      purchaserDelivery,
      loadingNewPrint,
      customizeBtnGroup,
      customizeTabPane,
    } = this.props;
    const {
      visible,
      activeKey,
      headerInfo,
      dataSource,
      pagination,
      asnHeaderId,
      lineVisible,
      unReadCount,
      collapseKeys,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      wrapperBOMModalVisible,
      actionListRowData,
      messageBoardVisible,
      operationRecordVisible,
      logisticsBtnVisible,
      infoSupplementVisible,
      origin,
      configSheetFlag = false,
    } = this.state;
    const { enumMap = {} } = purchaserDelivery;
    const { phone = {} } = enumMap;
    const deliverHeaderProps = {
      form,
      dataSource: headerInfo,
      customizeForm,
    };
    const basicInfoListProps = {
      activeKey,
      pagination,
      dataSource,
      customizeTable,
      onChange: this.fetchDetailLines,
      attachmentUuidList: this.attachmentUuidList,
    };
    const otherInfoListProps = {
      activeKey,
      pagination,
      dataSource,
      customizeTable,
      onChange: this.fetchDetailLines,
      openBOMModal: this.openBOMModal,
    };
    const LogisticsDetailProps = {
      headerInfo,
      onRef: (node) => {
        this.logistics = node;
      },
      fetchDetailHeader: this.fetchDetailHeader,
    };
    const infoSupplementProps = {
      phone,
      enumMap,
      customizeForm,
      configSheetFlag,
      dataSource: headerInfo,
      loading: loadingLogistics,
      visible: infoSupplementVisible,
      onLogistics: this.handleLogistics,
      hideModal: () => this.logisticsInfoVisibleChange(false),
    };
    const lineAttachmentProps = {
      lineVisible,
      hideAttachment: this.lineHideAttachment,
      otherAttachmentUuid, // 采购方uuid查询
      reviewAttachmentUuid, // 采购方uuid复审
      approveAttachmentUuid, // 采购方uuid审批
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList, // 查询采购方附件
      bucketName: 'private-bucket',
      bucketDirectory: 'sodr-order',
      onRemoveAttachment: this.removeAttachment,
      onGetPicNums: this.fetchDetailLines,
    };

    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      supplierAttachmentUuid: headerInfo.supplierAttachmentUuid, // 采购方uuid
      otherAttachmentUuid: headerInfo.otherAttachmentUuid, // 供应商uuid
      reviewAttachmentUuid: headerInfo.reviewAttachmentUuid, // 供应商uuid
      approveAttachmentUuid: headerInfo.approveAttachmentUuid, // 供应商uuid
      supplierAttaUuid: headerInfo.supplierAttaUuid, // 供应商uuid
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // loading: queryFileListOrgLoading, // 加载状态
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-order',
      onRemoveAttachment: this.removeAttachment,
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
    };
    const { submitSyncStatus, asnStatus } = headerInfo;
    const synDisabled = !(
      ['SHIPPED', 'CANCELLED', 'CLOSED'].includes(asnStatus) && submitSyncStatus === 'FAIL'
    );
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData || {};
    const BomModalPops = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      loading: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };
    const messageBoardPops = {
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
    const operationRecordProps = {
      asnHeaderId,
      visible: operationRecordVisible,
      hideModal: () => this.handleOperationVisible(false),
    };
    const renderCount =
      unReadCount > 99 ? (
        <span style={{ color: 'red', marginLeft: '5px' }}>(99+)</span>
      ) : (
        <span style={{ color: 'red', marginLeft: '5px' }}>({unReadCount})</span>
      );
    const backPath =
      origin === 'detailSearch'
        ? '/sinv/purchaser-delivery/list?activeKey=detail'
        : '/sinv/purchaser-delivery/list';
    const loadingFlag =
      loadingHeader || loadingLines || saveLoading || loadingNewPrint || printLoading;
    const buttons = [
      <Button
        data-name="save"
        onClick={this.save}
        type="primary"
        icon="save"
        loading={loadingFlag}
        disabled={loadingFlag}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
      <Button
        onClick={this.openUploadModal}
        icon="paper-clip"
        data-name="attachment"
        loading={loadingFlag}
        disabled={loadingFlag}
      >
        {intl.get('sinv.common.attachment.upload').d('附件管理')}
      </Button>,
      <Button
        icon="printer"
        onClick={this.handlePrint}
        data-name="printer"
        loading={loadingFlag}
        disabled={loadingFlag}
      >
        {intl.get(`sinv.common.view.message.button.print`).d('打印')}
      </Button>,
      <Button
        icon="clock-circle-o"
        className="label-btn"
        onClick={() => this.handleOperationVisible(true)}
        data-name="operationRecord"
        loading={loadingFlag}
        disabled={loadingFlag}
      >
        {intl.get(`sinv.common.view.button.operationRecord`).d('操作记录')}
      </Button>,
      <Button
        icon="sync"
        onClick={this.reImportERP}
        data-name="sync"
        loading={loadingFlag || repLoading}
        disabled={loadingFlag || synDisabled}
      >
        {intl.get(`sinv.common.view.message.button.resync`).d('重新同步')}
      </Button>,
      <PermissionButton
        icon="message"
        data-name="message"
        loading={loadingFlag}
        disabled={loadingFlag}
        permissionList={[
          {
            code: `srm.logistics.ar.purchaser-delivery.ps.detail.button.messageboard`,
            type: 'button',
            meaning: '送货单查询-留言板',
          },
        ]}
        onClick={this.openMessageBoard.bind(this)}
      >
        {intl.get(`sinv.common.view.message.button.messageBoard`).d('留言板')}
        {unReadCount ? renderCount : null}
      </PermissionButton>,
      logisticsBtnVisible === 1 && (
        <Button
          data-name="addLogistics"
          icon="form"
          onClick={() => this.logisticsInfoVisibleChange(true)}
        >
          {intl.get(`sinv.supplierDelivery.view.message.addLogistics.title`).d('物流信息补录')}
        </Button>
      ),
      <Tooltip
        data-name="newPrint"
        style={{ marginLeft: 8 }}
        placement="bottomRight"
        title={intl
          .get('hzero.common.button.newQueryPrint')
          .d(
            '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
          )}
      >
        <Button
          data-name="newPrint"
          onClick={this.newHandlePrint}
          loading={loadingFlag}
          disabled={loadingFlag}
        >
          {intl.get('hzero.common.button.newPrint').d('打印（新）')}
          <Icon type="question-circle-o" />
        </Button>
      </Tooltip>,
    ];
    return (
      <div className={styles['purchase-delivery-detail']}>
        <Header
          title={intl.get(`sinv.purchaserDelivery.view.message.title.detail`).d('送货单明细')}
          backPath={backPath}
        >
          {customizeBtnGroup(
            { code: `SINV.PURCHASER_DELIVERY.DETAIL.BUTTONS.DETAIL_H0` },
            remote
              ? remote.process('SINV_PURCHASER_DELIVERY_REMOTE_PROCESS_HEADER_BTNS', buttons, {
                  headerInfo,
                  that: this,
                })
              : buttons
          )}
        </Header>
        <Content>
          <Spin spinning={loadingHeader || loadingLines} style={{ paddingTop: 0 }}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sinv.purchaserDelivery.view.message.title.orderHeaderShip`)
                        .d('发货信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('deliveryHeaderInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('deliveryHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="deliveryHeaderInfo"
              >
                <DeliveryHeader {...deliverHeaderProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sinv.purchaserDelivery.view.message.title.headerDispatched`)
                        .d('收货信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('deliveryHeaderInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('deliveryHeaderInfos') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="deliveryHeaderInfos"
              >
                <ShipHeaderInfo {...deliverHeaderProps} />
              </Panel>
            </Collapse>
            {customizeTabPane(
              {
                code: 'SINV.PURCHASER_DELIVERY.DETAIL.LINE_TABS',
              },
              <Tabs
                defaultActiveKey="basicInfo"
                animated={false}
                style={{ marginTop: '10px' }}
                onChange={this.handleTabChange}
              >
                <TabPane
                  tab={intl
                    .get(`sinv.purchaserDelivery.view.message.title.basicInfo`)
                    .d('基本信息')}
                  key="basicInfo"
                >
                  <BasicInfoList {...basicInfoListProps} />
                </TabPane>
                <TabPane
                  tab={intl
                    .get(`sinv.purchaserDelivery.view.message.title.otherInfo`)
                    .d('其他信息')}
                  key="otherInfo"
                >
                  <BasicInfoList {...otherInfoListProps} />
                </TabPane>
                <TabPane
                  tab={intl
                    .get(`sinv.purchaserDelivery.view.message.title.logistics`)
                    .d('物流信息')}
                  key="logistics"
                >
                  {/* <LogisticsInfoList {...logisticsInfoListProps} /> */}
                  <LogisticsDetail {...LogisticsDetailProps} />
                </TabPane>
              </Tabs>
            )}
            {infoSupplementVisible && <LogisticsInfoModal {...infoSupplementProps} />}
          </Spin>
          {visible && <UploadModal {...attachmentProps} />}
          {lineVisible && <LineItemModal {...lineAttachmentProps} />}
          {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
          {messageBoardVisible && <MessageBoard {...messageBoardPops} />}
          {operationRecordVisible && <OperationRecord {...operationRecordProps} />}
        </Content>
      </div>
    );
  }
}
