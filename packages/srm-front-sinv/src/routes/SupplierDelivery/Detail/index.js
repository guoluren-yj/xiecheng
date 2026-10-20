/**
 * Detail - 供应商送货单明细
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Collapse, Spin, Tabs, Icon, Tooltip } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNumber, isFunction, isNil, isEmpty } from 'lodash';
import { connect } from 'dva';
import { refreshTab, openTab } from 'hzero-front/lib/utils/menuTab';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import uuid from 'uuid/v4';
import { Button as PermissionButton } from 'components/Permission';
import moment from 'moment';
import cuxRemote from 'hzero-front/lib/utils/remote';

import DeliveryHeader from './DeliveryHeader';
import BasicInfoList from './BasicInfoList';
// import LogisticsInfoList from './LogisticsInfoList';
import LogisticsDetail from '../../components/LogisticsDetail';
import LogisticsInfoModal from './LogisticsInfoModal';
import styles from './index.less';
// import OperationRecord from '../List/OperationRecord';
import OperationRecord from '../../components/SupplierDelivery';
import UploadModal from './UploadModal';
import LineItemModal from './LineItemModal';
import BomModal from './BOMModal';
import ShipHeaderInfo from './ShipHeaderInfo';
import MessageBoard from './MessageBoard';
import { globalPrint } from '@/routes/components/utils';
import { fetchConfigSheet } from '@/services/commonService';

const { Panel } = Collapse;
const { TabPane } = Tabs;
window.moment = moment;
/**
 * 供应商送货单明细
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
    code: 'SINV_SUPPLIER_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
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
    'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER',
    'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC',
    'SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
    'SINV.SUPPLIER_DELIVERY.DETAIL.LINE_TABS',
    'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
    'SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP',
    'SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.BTN',
  ],
})
@formatterCollections({
  code: [
    'sinv.supplierDelivery',
    'sinv.purchaserDelivery',
    'sinv.common',
    'entity.supplier',
    'entity.customer',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'sinv.receiptExecution',
  ],
})
@connect(({ loading, supplierDelivery }) => ({
  loadingHeader: loading.effects['supplierDelivery/queryDetailHeader'],
  loadingLines: loading.effects['supplierDelivery/queryDetailLines'],
  loadingLogistics: loading.effects['supplierDelivery/addLogistics'],
  loadingOperation: loading.effects['supplierDelivery/fetchOperationList'],
  printLoading: loading.effects['supplierDelivery/print'],
  saveLoading: loading.effects['supplierDelivery/save'],
  repLoading: loading.effects['supplierDelivery/reImportERP'],
  queryPoItemBOMLoading: loading.effects['supplierDelivery/fetchBOM'],
  queryMessageLoading: loading.effects['supplierDelivery/queryMessage'],
  queryPartnersLoading: loading.effects['supplierDelivery/queryPartners'],
  loadingNewPrint: loading.effects['supplierDelivery/newPrintList'],
  supplierDelivery,
}))
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      history: {
        location: { search },
      },
    } = this.props;
    const { origin } = querystring.parse(search.substr(1));
    this.state = {
      headerInfo: {}, // 头信息
      dataSource: [], // 行数据
      pagination: {}, // 基本信息分页
      actionListRowData: {},
      activeKey: 'basicInfo',
      infoSupplementVisible: false,
      collapseKeys: ['deliveryHeaderInfo', 'deliveryHeaderInfos'],
      asnHeaderId: props.match.params.asnHeaderId, // 头ID
      operationRecordVisible: false,
      visible: false,
      asnLineId: null,
      attachmentUuid: null,
      objectVersionNumber: null,
      otherAttachmentUuid: null,
      reviewAttachmentUuid: null,
      approveAttachmentUuid: null,
      lineVisible: false,
      dataSourceLoading: true,
      wrapperBOMModalVisible: false,
      messageBoardVisible: false,
      unReadCount: 0,
      logisticsBtnVisible: 0,
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
      dispatch({
        type: 'supplierDelivery/fetchEnum',
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
    if (isNil(asnHeaderId)) {
      return;
    }
    dispatch({
      type: 'supplierDelivery/queryDetailHeader',
      asnHeaderId,
      userCampCode: 'SUPPLIER',
      customizeUnitCode:
        'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP',
    }).then((res) => {
      if (res) {
        this.setState({
          dataSourceLoading: false,
          headerInfo: res,
          unReadCount: res.unReadCount,
        });
        // logisticsBtnVisible显示逻辑：flag为null保持原有逻辑，1显示按钮，0不显示按钮
        if (!isNil(res.logisticsEnabledFlag)) {
          this.setState({
            logisticsBtnVisible: res.logisticsEnabledFlag,
          });
        } else {
          this.setState({
            logisticsBtnVisible: 1,
          });
        }
      }
    });
  }

  /**
   * fetchDetailLines - 查询行数据
   * @param {Object} [page={}] //分页信息
   */
  @Bind()
  fetchDetailLines(page = {}, sorter) {
    const { dispatch } = this.props;
    const { asnHeaderId } = this.state;
    if (isNil(asnHeaderId)) {
      return;
    }
    dispatch({
      type: 'supplierDelivery/queryDetailLines',
      payload: {
        page,
        sort: sorter,
        asnHeaderId,
        customizeUnitCode:
          'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC,SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
      },
    }).then((res) => {
      if (res) {
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
   * 改变物流补录弹窗显隐
   * @param {Boolean} flag
   */
  @Bind()
  logisticsInfoVisibleChange(flag) {
    this.setState({ infoSupplementVisible: !!flag });
  }

  /**
   * 修改操作记录visible
   * @param {Boolean} flag //改变操作记录的显隐
   */
  @Bind()
  handleOperationVisible(flag) {
    this.setState({ operationRecordVisible: !!flag });
  }

  /**
   * 查询操作记录
   * @param {Object, Number} { page = {}, asnHeaderId } // 分页参数 头id
   * @returns Promise
   */
  @Bind()
  handleSearchOperation({ page = {}, asnHeaderId }) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierDelivery/fetchOperationList',
      payload: {
        page,
        asnHeaderId,
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * tab切换
   * @param {String} activeKey
   */
  @Bind()
  handleTabChange(activeKey) {
    this.setState({ activeKey });
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
      type: 'supplierDelivery/addLogistics',
      payload: {
        _token,
        asnHeaderId,
        objectVersionNumber,
        ...logistics,
      },
      customizeUnitCode: 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
    }).then((res) => {
      if (res) {
        this.setState({ headerInfo: { ...headerInfo, ...res } });
        notification.success();
        this.logisticsInfoVisibleChange(false);
        if (this.logistics) {
          this.logistics.fetchLogistics();
        }
      }
    });
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ visible: false });
  }

  @Bind()
  openUploadModal() {
    this.setState({ visible: true }, () => {
      const {
        headerInfo: { supplierAttaUuid },
      } = this.state;
      if (!supplierAttaUuid) {
        this.getHeaderAttachmentUuid();
      }
    });
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
      otherAttachmentUuid,
      approveAttachmentUuid,
      reviewAttachmentUuid,
      supplierAttachmentUuid,
    } = headerInfo;
    const supplierAttaUuid = uuid();
    dispatch({
      type: 'supplierDelivery/getHeaderAttachmentUuid',
      data: {
        asnHeaderId,
        objectVersionNumber,
        _token,
        otherAttachmentUuid,
        approveAttachmentUuid,
        supplierAttaUuid,
        reviewAttachmentUuid,
        supplierAttachmentUuid,
      },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
      }
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
      type: 'supplierDelivery/queryFileListOrg',
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
      type: 'supplierDelivery/queryFileListOrg',
      payload,
    });
  }

  // 打印
  @Bind()
  @Debounce(400)
  handlePrint() {
    const { dispatch } = this.props;
    const { asnHeaderId } = this.state;
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'supplierDelivery/print',
      payload: { asnHeaderId, tenantId },
    }).then((res) => {
      globalPrint(res);
    });
  }

  @Bind()
  attachmentUuidList(val, record) {
    this.setState({
      lineVisible: true,
      // _token: record._token,
      asnLineId: record.asnLineId,
      attachmentUuid: record.attachmentUuid,
      objectVersionNumber: record.objectVersionNumber,
      otherAttachmentUuid: record.otherAttachmentUuid, // 采购方uuid
      reviewAttachmentUuid: record.reviewAttachmentUuid, // 采购方uuid
      approveAttachmentUuid: record.approveAttachmentUuid, // 采购方uuid
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
      type: 'supplierDelivery/reImportERP',
      data,
    }).then((result) => {
      if (result) {
        notification.success();
        this.fetchDetailHeader();
        this.fetchDetailLines();
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

  @Bind()
  lineHideAttachment() {
    this.setState({ lineVisible: false });
  }

  @Bind()
  removeAttachment(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'supplierDelivery/removeFile',
      payload,
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
      type: 'supplierDelivery/fetchBOM',
      payload: {
        functionCode: null,
        poHeaderId: asnHeaderId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        poLineId: asnLineId, // 接口为订单接口 涉及接口复用，所以送货单id 使用订单id名称 有问题：找后端
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
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
      type: 'supplierDelivery/queryMessage',
      params: {
        asnHeaderId: match.params.asnHeaderId,
        ...params,
      },
    }).then((res) => {
      if (res) {
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
    // debugger;
    dispatch({
      type: 'supplierDelivery/sendMessage',
      data: {
        asnHeaderId: match.params.asnHeaderId,
        message,
        // userCampCode: 'SUPPLIER',
      },
    }).then((res) => {
      if (res) {
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
      type: 'supplierDelivery/sendMessage',
      data: {
        message,
        asnHeaderId: match.params.asnHeaderId,
        attachmentName: message,
        attachmentUrl: url,
        attachmentUuid: _uuid,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  };

  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { headerInfo, dataSource = [] } = this.state;
    const { validateFields = (e) => e } = this.headerInfoForm || {};
    const { validateFields: validateShipFields } = this.shipHeaderForm || {};
    validateFields((errs1, values) => {
      if (!errs1) {
        validateShipFields((errs2, shipValues) => {
          if (!errs2) {
            const list = getEditTableData(dataSource);
            if (!isNil(headerInfo._token) && Array.isArray(list) && list.length > 0) {
              dispatch({
                type: 'supplierDelivery/save',
                payload: {
                  data: {
                    ...headerInfo,
                    ...values,
                    ...shipValues,
                    asnLineList: list,
                  },
                  customizeUnitCode:
                    'SINV.SUPPLIER_DELIVERY.DETAIL.HEADER,SINV.SUPPLIER_DELIVERY.DETAIL.BASIC,SINV.SUPPLIER_DELIVERY.DETAIL.OTHER,SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS,SINV.SUPPLIER_DELIVERY.DETAIL.HEADERSHIP,SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.BTN',
                },
              }).then((res) => {
                if (res) {
                  this.fetchDetailHeader();
                  this.fetchDetailLines();
                  notification.success();
                }
              });
            }
          }
        });
      }
    });
  }

  @Bind()
  handleRouteJump() {
    const { headerInfo } = this.state;
    const { dispatch } = this.props;
    if (!headerInfo.asnNum) return false;
    dispatch({
      type: 'supplierDelivery/getLabelPermission',
      payload: {
        data: ['srm.logistics.delivery.box.label.creation.ps.default'],
      },
    }).then((res) => {
      if (res && res[0].approve) {
        openTab({
          key: `/sinv/box-label-creation`,
          title: '标签创建/查询',
          path: `/sinv/box-label-creation/list`,
          search: `?asnNum=${headerInfo.asnNum}`,
        });
        refreshTab('/sinv/box-label-creation');
      } else {
        notification.error({
          message: intl
            .get(`sinv.supplierDelivery.view.message.noPermission`)
            .d('当前角色没有【标签创建/查询】菜单的访问权限，请检查角色菜单后重试'),
        });
      }
    });
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
      type: 'supplierDelivery/newPrintList',
      asnHeaderIdList: [headerInfo],
    }).then((res) => {
      globalPrint(res);
    });
  }

  render() {
    const {
      remote,
      saveLoading,
      loadingHeader,
      loadingLines,
      loadingLogistics,
      loadingOperation,
      printLoading,
      repLoading,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
      queryPoItemBOMLoading,
      supplierDelivery,
      queryMessageLoading,
      sendMessageLoading,
      loadingNewPrint,
    } = this.props;
    const { enumMap = {} } = supplierDelivery;
    const { phone = {} } = enumMap;
    const {
      infoSupplementVisible,
      collapseKeys,
      activeKey,
      headerInfo,
      dataSource,
      pagination,
      asnHeaderId,
      operationRecordVisible,
      visible,
      lineVisible,
      otherAttachmentUuid,
      reviewAttachmentUuid,
      approveAttachmentUuid,
      dataSourceLoading,
      wrapperBOMModalVisible,
      actionListRowData,
      messageBoardVisible,
      unReadCount,
      logisticsBtnVisible,
      origin,
      configSheetFlag = false,
    } = this.state;
    const deliverHeaderProps = {
      dataSource: headerInfo,
      customizeForm,
      dataSourceLoading,
      ref: (node) => {
        this.headerInfoForm = node;
      },
    };
    const shipHeaderProps = {
      dataSource: headerInfo,
      customizeForm,
      dataSourceLoading,
      ref: (node) => {
        this.shipHeaderForm = node;
      },
    };
    const basicInfoListProps = {
      remote,
      activeKey,
      pagination,
      dataSource,
      headerInfo,
      customizeTable,
      onSearch: this.fetchDetailLines,
      attachmentUuidList: this.attachmentUuidList,
    };
    const otherInfoListProps = {
      customizeTable,
      activeKey,
      pagination,
      dataSource,
      headerInfo,
      onChange: this.fetchDetailLines,
      openBOMModal: this.openBOMModal,
    };
    // const logisticsInfoListProps = {
    //   dataSource: headerInfo,
    // };
    const logisticsDetailProps = {
      customizeForm,
      headerInfo,
      onRef: (node) => {
        this.logisticsForm = node;
      },
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
    const onFetchOperation = this.handleSearchOperation;
    const operationRecordProps = {
      asnHeaderId,
      onFetchOperation,
      loading: loadingOperation,
      visible: operationRecordVisible,
      hideModal: () => this.handleOperationVisible(false),
    };

    const attachmentProps = {
      hideAttachment: this.hideAttachment,
      supplierAttachmentUuid: headerInfo.supplierAttachmentUuid, // 采购方uuid
      otherAttachmentUuid: headerInfo.otherAttachmentUuid, // 供应商uuid
      reviewAttachmentUuid: headerInfo.reviewAttachmentUuid, // 供应商uuid
      approveAttachmentUuid: headerInfo.approveAttachmentUuid, // 供应商uuid
      supplierAttaUuid: headerInfo.supplierAttaUuid,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      // loading: queryFileListOrgLoading, // 加载状态
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-order',
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      onRemoveAttachment: this.removeAttachment,
    };
    const { submitSyncStatus, asnStatus } = headerInfo;
    const synDisabled = !(
      ['SHIPPED', 'CANCELLED', 'CLOSED'].includes(asnStatus) && submitSyncStatus === 'FAIL'
    );

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
    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
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

    const { cuxDetailHeaderBtn } = remote?.props?.process || {}; // 埋点

    const cuxLoading = printLoading || repLoading || loadingNewPrint || saveLoading;

    const cuxHeaderBtn =
      typeof cuxDetailHeaderBtn === 'function' &&
      cuxDetailHeaderBtn(
        headerInfo,
        dataSource,
        cuxLoading,
        this.headerInfoForm,
        this.shipHeaderForm,
        this.fetchDetailHeader,
        this.fetchDetailLines
      );

    const renderCount =
      unReadCount > 99 ? (
        <span style={{ color: 'red', marginLeft: '5px' }}>(99+)</span>
      ) : (
        <span style={{ color: 'red', marginLeft: '5px' }}>({unReadCount})</span>
      );
    const backPath =
      origin === 'detailSearch'
        ? '/sinv/supplier-delivery/list?activeKey=detail'
        : '/sinv/supplier-delivery/list';
    return (
      <Fragment>
        <Header
          title={intl.get(`sinv.common.model.common.deliveryDetail`).d('送货单明细')}
          backPath={backPath}
        >
          {customizeBtnGroup({ code: `SINV.SUPPLIER_DELIVERY.DETAIL.BUTTONS.BTN` }, [
            <Button data-name="labelPrint" onClick={this.handleRouteJump}>
              {intl.get(`sinv.common.view.message.button.labelPrint`).d('标签打印')}
            </Button>,
            logisticsBtnVisible === 1 && (
              <Button
                data-name="addLogistics"
                icon="form"
                type="primary"
                onClick={() => this.logisticsInfoVisibleChange(true)}
              >
                {intl
                  .get(`sinv.supplierDelivery.view.message.addLogistics.title`)
                  .d('物流信息补录')}
              </Button>
            ),
            <Button
              data-name="save"
              icon="save"
              onClick={() => this.handleSave()}
              disabled={loadingHeader || loadingLines}
              loading={printLoading || repLoading || loadingNewPrint || saveLoading}
            >
              {intl.get(`sinv.common.view.button.save`).d('保存')}
            </Button>,
            String(headerInfo?.printStatusFlag) === '1' && (
              <Button
                data-name="print"
                onClick={this.handlePrint}
                icon="printer"
                disabled={loadingHeader || loadingLines}
                loading={printLoading || repLoading || loadingNewPrint || saveLoading}
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </Button>
            ),
            <Button
              data-name="operating"
              icon="clock-circle-o"
              className="label-btn"
              onClick={() => this.handleOperationVisible(true)}
              disabled={loadingHeader || loadingLines}
              loading={printLoading || repLoading || loadingNewPrint || saveLoading}
            >
              {intl.get(`sinv.common.view.button.operationRecord`).d('操作记录')}
            </Button>,
            <Button
              data-name="attachment"
              onClick={this.openUploadModal}
              icon="paper-clip"
              disabled={loadingHeader || loadingLines}
              loading={printLoading || repLoading || loadingNewPrint || saveLoading}
            >
              {intl.get('sinv.common.attachment.upload').d('附件管理')}
            </Button>,
            <Button
              data-name="resync"
              icon="sync"
              onClick={this.reImportERP}
              loading={printLoading || repLoading || loadingNewPrint || saveLoading}
              disabled={synDisabled || loadingHeader || loadingLines}
            >
              {intl.get(`sinv.common.view.message.button.resync`).d('重新同步')}
            </Button>,
            <PermissionButton
              data-name="message"
              icon="message"
              onClick={this.openMessageBoard.bind(this)}
              disabled={loadingHeader || loadingLines}
              loading={printLoading || repLoading || loadingNewPrint || saveLoading}
              permissionList={[
                {
                  code: `srm.logistics.delivery.supplier-delivery.ps.detail.button.messageboard`,
                  type: 'button',
                  meaning: '我的送货单-留言板',
                },
              ]}
            >
              {intl.get(`sinv.common.view.message.button.messageBoard`).d('留言板')}
              {unReadCount ? renderCount : null}
            </PermissionButton>,
            <Tooltip
              data-name="newPrint"
              style={{ marginLeft: 8 }}
              placement="bottomRight"
              title={intl
                .get('sinv.supplierDelivery.view.message.newPrintMessage')
                .d(
                  '当点击打印出现【未能加载 PDF 文档】时，说明单据未取到对应的打印模板，请联系客户方检查配置后重试'
                )}
            >
              <Button
                onClick={this.newHandlePrint}
                disabled={loadingHeader || loadingLines}
                loading={printLoading || repLoading || loadingNewPrint || saveLoading}
              >
                {intl.get('hzero.common.button.newPrint').d('打印（新）')}
                <Icon type="question-circle-o" />
              </Button>
            </Tooltip>,
            cuxHeaderBtn, // 埋点
          ])}
        </Header>
        <Content className={styles.content}>
          <Spin
            spinning={loadingHeader || loadingLines}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            <Collapse
              defaultActiveKey={collapseKeys}
              className={styles['form-collapse']}
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
                <ShipHeaderInfo {...shipHeaderProps} />
              </Panel>
            </Collapse>
            {customizeTabPane(
              {
                code: 'SINV.SUPPLIER_DELIVERY.DETAIL.LINE_TABS',
              },
              <Tabs defaultActiveKey="basicInfo" animated={false} onChange={this.handleTabChange}>
                <TabPane
                  tab={intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
                  key="basicInfo"
                >
                  <BasicInfoList {...basicInfoListProps} />
                </TabPane>
                <TabPane
                  tab={intl.get(`sinv.common.view.message.title.otherInfo`).d('其它信息')}
                  key="otherInfo"
                >
                  <BasicInfoList {...otherInfoListProps} />
                </TabPane>
                <TabPane
                  tab={intl.get(`sinv.common.view.message.title.logistics`).d('物流信息')}
                  key="logistics"
                >
                  {/* <LogisticsInfoList {...logisticsInfoListProps} /> */}
                  <LogisticsDetail {...logisticsDetailProps} />
                </TabPane>
              </Tabs>
            )}
          </Spin>
          {infoSupplementVisible && <LogisticsInfoModal {...infoSupplementProps} />}
        </Content>
        {operationRecordVisible && <OperationRecord {...operationRecordProps} />}
        {visible && <UploadModal {...attachmentProps} />}
        {lineVisible && <LineItemModal {...lineAttachmentProps} />}
        {wrapperBOMModalVisible && <BomModal {...BomModalPops} />}
        {messageBoardVisible && <MessageBoard {...messageBoardPops} />}
      </Fragment>
    );
  }
}
