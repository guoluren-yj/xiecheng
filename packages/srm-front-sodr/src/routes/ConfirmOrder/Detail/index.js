/**
 * index - 订单确认明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Form, Tag } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isFunction, isEmpty, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getEditTableData,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remotes from 'utils/remote';

import { BUCKET_NAME, THROTTLE_TIME, SAAS_SIGN } from '@/routes/components/utils/constant';
import {
  formatAumont,
  queryCalcRuleConfig,
  queryCommonDoubleUomConfig,
} from '@/routes/components/utils';
import { getFileList, signRetry } from '@/services/orderReleaseService';
import { Button } from 'components/Permission';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import SealModal from '@/routes/components/SealModal/SealModal';
import MessageVerification from '@/routes/components/MessageVerification';
import arrow from '@/assets/connect.svg';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import OrderHeaderForm from './OrderHeaderForm';
import remoteConfig from './remote';
import Attachment from './Attachment';
import OperationRecord from './OperationRecord';
import Message from './Message';
import WrapperBOMModal from './BOMModal';
import OperateBtn from './OperateBtn';
import List from './List';
import AssociatedInvoice from './AssociatedInvoice';
import styles from './index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;

// 设置sodr国际化前缀 - button
const viewButtonPrompt = 'sodr.common.view.button';
// 设置sodr国际化前缀 - message
const viewMessagePrompt = 'sodr.common.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';
// 设置确认提示国际化前缀
const messagePrompt = 'sodr.confirmOrder.view.message';

const isSupplier = getUserOrganizationId() !== getCurrentOrganizationId();
/**
 * Detail - 业务组件 - 订单确认
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
@connect(({ loading, confirmOrder }) => ({
  confirmDetailLoading: loading.effects['confirmOrder/confirmDetail'],
  feedbackDetailLoading: loading.effects['confirmOrder/feedbackDetail'],
  saveDetailLoading: loading.effects['confirmOrder/saveDetail'],
  queryPoItemBOMLoading: loading.effects['confirmOrder/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['confirmOrder/queryDetailHeader'],
  sendMessageLoading: loading.effects['confirmOrder/sendMessage'],
  queryMessageLoading: loading.effects['confirmOrder/queryMessage'],
  queryPartnersLoading: loading.effects['confirmOrder/queryPartners'],
  queryDetailListLoading: loading.effects['confirmOrder/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['confirmOrder/fetchOperationRecordList'],
  queryFileListOrgLoading: loading.effects['confirmOrder/queryFileListOrg'],
  asnLinesLoading: loading.effects['confirmOrder/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['confirmOrder/fetchRcvRecords'],
  billLinesLoading: loading.effects['confirmOrder/fetchBillLines'],
  oldBillLinesLoading: loading.effects['confirmOrder/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['confirmOrder/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['confirmOrder/fetchOldInvoiceLines'],
  fetchSealPicturesLoading: loading.effects['orderSign/fetchSealPictures'],
  confirmChapterLoading: loading.effects['orderSign/confirmChapter'],
  confirmMobileChapterLoading: loading.effects['orderSign/confirmMobileChapter'],
  fetchVerifyPhoneNumLoading: loading.effects['orderSign/fetchVerifyPhoneNumLoading'],
  calculateDoubleUomLoading: loading.effects['quotePurchaseRequisition/calculateDoubleUom'],
  printLoading: loading.effects['confirmOrder/print'],
  getFeedbackVerificationLoading: loading.effects['confirmOrder/getFeedbackVerificationDetail'],
  confirmOrder,
}))
@formatterCollections({
  code: [
    'sodr.confirmOrder',
    'sodr.common',
    'entity.item',
    'entity.company',
    'entity.attachment',
    'entity.order',
    'item.order',
    'sodr.quotePurchase',
    'sprm.common',
    'sodr.quotePurchaseRequisition',
    'spcm.contractChapter',
    'sprm.purchaseReqCreation',
    'spcm.common',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.CONFIRM_ORDER_DETAIL.BASIC',
    'SODR.CONFIRM_ORDER_DETAIL.OTHER',
    'SODR.CONFIRM_ORDER_DETAIL.HEADER',
    'SODR.CONFIRM_ORDER_DETAIL.DELIVERY_CATA',
    'SODR.CONFIRM_ORDER_DETAIL.TAB',
    'SODR.CONFIRM_ORDER_DETAIL.BUTTONS',
  ],
})
@remotes(...remoteConfig)
@Form.create({ fieldNameProp: null })
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
      messageBoardVisible: false, // 留言板状态
      wrapperBOMModalVisible: false, // BOM状态
      actionListRowData: {},
      attachmentVisible: false,
      selectedListRows: [],
      organizationId: getCurrentOrganizationId(),
      supplierAttachmentUuid: '',
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      orderField: 'promiseDeliveryDate',
      setting: '0',
      dateEditFlag: 0,
      // setest: '0',
      // feedbackApproveFlag: 0,
      confirmRuleSetting: {
        editFlag: 0,
        requiredFlag: 0,
        deliveryDateEditFlag: 0,
        deliveryDateRequiredFlag: 0,
        unreadCount: 0,
      },
      associatedConfigFlag: true, // 新旧结算判断flag

      picDataSource: [], // 印章图片
      focusStatus: '', // 选中印章图片标识
      currentPic: 0, // 当前图片位置
      phoneNum: null, // 手机号码
      smsVerifyVisible: false, // 短信验证
      fileList: [], // 获取预览的文件列表信息
      lineDisplay: 0,
      doubleUnitEnabled: 0,
      amountCalcRule: 'Amount',
    };

    // 方法注册
    // [
    //   'fetchDetailHeader',
    //   'fetchDetailList',
    //   'fetchPartners',
    //   'fetchAsnLines',
    //   'fetchRcvRecords',
    //   'fetchBillLines',
    //   'fetchInvoiceLines',
    //   'onRadioGroupChange',
    //   'setActionListCommonRow',
    //   'fetchSettings',
    //   'attchmentAendMessage',
    //   'handleChangeList',
    // ].forEach(method => {
    //   this[method] = this[method].bind(this);
    // });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    if (isNumber(Number(params.id))) {
      this.refresh();
    }
  }

  componentDidUpdate(prevProps) {
    const { match = {} } = this.props;
    const { params } = match;
    if (prevProps.match.params.id !== params.id) {
      if (isNumber(Number(params.id))) {
        this.fetchDetailHeader();
        this.fetchDetailList();
        this.fetchPartners();
      }
    }
  }

  // /**
  //    * 查询列表值集
  //    */
  //  @Bind()
  //  fetchEnum () {
  //    const { dispatch } = this.props;
  //    dispatch({ type: 'confirmOrder/init' });
  //  }

  @Bind()
  refresh() {
    const { dispatch } = this.props;
    this.fetchDetailHeader();
    this.fetchDetailList();
    this.fetchPartners();
    this.fetchSettings();
    this.fetchCalcRuleConfig();
    this.queryDoubleUomConfig();
    this.fetchConfirmRuleSetting();
    this.fetchAssociatedConfigFlag();
    dispatch({
      type: 'confirmOrder/init',
    });
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'confirmOrder/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['010219'],
          // setest: res['010210'],
        });
      }
    });
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

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.setState({
      amountCalcRule: result,
    });
  }

  // 查询配置中心-订单-订单确认、反馈审核及回传ERP规则-数量
  @Bind()
  fetchConfirmRuleSetting = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'confirmOrder/fetchConfirmRuleSetting',
    }).then((res) => {
      if (res) {
        const quantityItem = (res || []).find((item) => ['QUANTITY'].includes(item.fieldName));
        const DeliveryDateItem = (res || []).find((item) =>
          ['COMMITTED_DELIVERY_DATE'].includes(item.fieldName)
        );
        const { editFlag, requiredFlag } = quantityItem;
        const {
          editFlag: deliveryDateEditFlag,
          requiredFlag: deliveryDateRequiredFlag,
          // feedbackApproveFlag,
        } = DeliveryDateItem;
        this.setState({
          confirmRuleSetting: {
            editFlag,
            requiredFlag,
            deliveryDateEditFlag,
            deliveryDateRequiredFlag,
          },
          // feedbackApproveFlag,
        });
      }
    });
  };

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(updateSupplierUuid = true) {
    const { dispatch, match = {}, form } = this.props;
    const { params } = match;
    dispatch({
      type: 'confirmOrder/queryDetailHeader',
      payload: {
        poHeaderId: params.id,
        customizeUnitCode:
          'SODR.CONFIRM_ORDER_DETAIL.HEADER,SODR.CONFIRM_ORDER_DETAIL.DELIVERY_CATA',
      },
    }).then((res) => {
      if (res) {
        const { unreadCount, supplierAttachmentUuid } = res;
        const _state = {
          unreadCount,
          orderHeaderFormDataSource: res,
        };
        const state = updateSupplierUuid ? { ..._state, supplierAttachmentUuid } : { ..._state };
        this.setState(state, () => {
          form.resetFields(['objectVersionNumber']);
          setTimeout(() => this.forceUpdate(), 600);
        });
        if (res.authType) {
          this.fetchSealPictures(res);
        }
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
   * @param {object} queryParams - 查询条件
   */
  @Bind()
  fetchDetailList(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { lineDisplay } = this.state;
    const { params } = match;
    dispatch({
      type: 'confirmOrder/queryDetailList',
      payload: {
        poHeaderId: params.id,
        lineDisplay,
        ...queryParams,
        customizeUnitCode: 'SODR.CONFIRM_ORDER_DETAIL.BASIC,SODR.CONFIRM_ORDER_DETAIL.OTHER',
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        const listCommonDataSource = dataSource.map((n) => ({
          ...n,
          _status: 'update',
          key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          keyId: uuidv4(),
        }));
        // 业务规则定义 deliveryDateEditFlag 取行上第一条数据
        const { deliveryDateEditFlag = 0 } = dataSource.length ? dataSource[0] : {};
        this.setState({
          dateEditFlag: deliveryDateEditFlag,
          listCommonDataSource,
          listCommonPagination: pagination,
          actionListCommonRow: listCommonDataSource[0] || {},
        });
      }
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
      type: 'confirmOrder/print',
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
   * fetchPartners - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchPartners(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'confirmOrder/queryPartners',
      poHeaderId: params.id,
      params: queryParams,
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        this.setState({
          listPartnersDataSource: dataSource.map((n) => ({
            ...n,
            _status: 'update',
            key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
            keyId: uuidv4(),
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
  @Bind()
  fetchBOM(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { actionListRowData = {} } = this.state;
    const { poLineId, quantity } = actionListRowData;
    dispatch({
      type: 'confirmOrder/newQueryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        splQuantity: quantity,
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
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  save() {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource = {},
      supplierAttachmentUuid,
      orderField,
    } = this.state;
    const tableData = getEditTableData(listCommonDataSource);
    if (isEmpty(tableData)) {
      return;
    }
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const data = {
          poHeaderDetailDTO: {
            ...orderHeaderFormDataSource,
            ...values,
            supplierAttachmentUuid,
            _token: orderHeaderFormDataSource._token,
            poHeaderId: orderHeaderFormDataSource.poHeaderId,
            // objectVersionNumber: orderHeaderFormDataSource.objectVersionNumber,
          },
          poLineDetailDTOs: tableData.map((n) => {
            const {
              _token,
              poHeaderId,
              poLineId,
              poLineLocationId,
              objectVersionNumber,
              lineVersionNumber,
              locationVersionNumber,
              feedback,
              promiseDeliveryDate,
              promisedDate,
              quantity,
            } = n;
            return {
              ...n,
              _token,
              poHeaderId,
              poLineId,
              poLineLocationId,
              objectVersionNumber,
              lineVersionNumber,
              locationVersionNumber,
              feedback,
              quantity,
              [orderField]: n[orderField] && moment(n[orderField]).format(DATETIME_MIN),
              promiseDeliveryDate: promiseDeliveryDate
                ? moment(promiseDeliveryDate).format(DATETIME_MIN)
                : null,
              promisedDate,
            };
          }),
        };
        dispatch({
          type: 'confirmOrder/saveDetail',
          params: {
            data,
            customizeUnitCode:
              'SODR.CONFIRM_ORDER_DETAIL.HEADER,SODR.CONFIRM_ORDER_DETAIL.BASIC,SODR.CONFIRM_ORDER_DETAIL.OTHER',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchDetailHeader();
            this.fetchDetailList();
          }
        });
      }
    });
  }

  /**
   * 获取UUID  并将获得的uuid存入数据库
   */
  @Bind()
  fetchUUID() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'confirmOrder/getAttachmentuuid',
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'confirmOrder/saveAttachmentUUID',
          payload: { poHeaderId: params.id, uuid: res.content, uuidType: 2 },
        }).then((result) => {
          const { orderHeaderFormDataSource } = this.state;
          this.setState({
            supplierAttachmentUuid: res.content,
            orderHeaderFormDataSource: {
              ...orderHeaderFormDataSource,
              objectVersionNumber: result || orderHeaderFormDataSource.objectVersionNumber,
              supplierAttachmentUuid: res.content,
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
  @Bind()
  fetchMessage(params, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'confirmOrder/queryMessage',
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
  @Throttle(1500, { trailing: false })
  @Bind()
  sendMessage(message, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'confirmOrder/sendMessage',
      data: {
        poHeaderId: match.params.id,
        message,
        userCampCode: 'SUPPLIER',
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * confirm - 订单确认/反馈
   */
  @Throttle(1500, { trailing: false })
  @Bind()
  confirm() {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource = {},
      listCommonDataSource = {},
      setting,
      orderField,
      supplierAttachmentUuid,
    } = this.state;
    const { displayPoNum } = orderHeaderFormDataSource;
    const linesData = getEditTableData(listCommonDataSource) || [];
    if (isEmpty(linesData)) {
      return;
    }
    const uuid = {
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      attachmentUUID: supplierAttachmentUuid,
    };
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const formFiled = filterNullValueObject(values);
      const data = {
        poHeaderDetailDTO: {
          ...orderHeaderFormDataSource,
          ...formFiled,
          _token: orderHeaderFormDataSource._token,
          poHeaderId: orderHeaderFormDataSource.poHeaderId,
          promiseDeliveryDate:
            formFiled.promiseDeliveryDate &&
            moment(formFiled.promiseDeliveryDate).format(DATETIME_MIN),
          // objectVersionNumber: orderHeaderFormDataSource.objectVersionNumber,
        },
        poLineDetailDTOs: linesData
          // .filter(n => n.edited)
          .map((n) => {
            const {
              _token,
              poHeaderId,
              poLineId,
              poLineLocationId,
              objectVersionNumber,
              lineVersionNumber,
              locationVersionNumber,
              feedback,
              promiseDeliveryDate,
              quantity,
            } = n;
            return {
              ...n,
              _token,
              poHeaderId,
              poLineId,
              poLineLocationId,
              objectVersionNumber,
              lineVersionNumber,
              locationVersionNumber,
              feedback,
              quantity,
              [orderField]: n[orderField] && moment(n[orderField]).format(DATETIME_MIN),
              promiseDeliveryDate: promiseDeliveryDate
                ? moment(promiseDeliveryDate).format(DATETIME_MIN)
                : null,
            };
          }),
      };
      const handleComfirm = throttle(
        () => {
          this.fetchSupplierAttachmentList(uuid).then((rec) => {
            if (!rec) return;
            if ((rec.length === 0 || !uuid.attachmentUUID) && setting === '1') {
              notification.warning({
                message: intl
                  .get(`sodr.common.view.message.accessoryNotNull1`, { poNum: displayPoNum })
                  .d('订单:[{poNum}]附件不能为空'),
              });
            } else {
              dispatch({
                type: 'confirmOrder/confirmDetail',
                payload: {
                  data: [data],
                  customizeUnitCode:
                    'SODR.CONFIRM_ORDER_DETAIL.BASIC,SODR.CONFIRM_ORDER_DETAIL.HEADER',
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: '/sodr/confirm-order/list',
                    })
                  );
                }
              });
            }
          });
        },
        1500,
        { trailing: false }
      );
      // const confirm = linesData.some(
      //   item =>
      //     item.quantity !== item.originalQuantity || item.needByDate !== item.promiseDeliveryDate
      // );
      // if (confirm) {
      //   notification.warning({
      //     message: intl.get(`sodr.common.view.message.notEqual`).d('数量与原需求数量不相等'),
      //   });
      // } else {
      dispatch({
        type: 'confirmOrder/getFeedbackVerificationDetail',
        payload: { poHeader: orderHeaderFormDataSource },
      }).then((res) => {
        if (!isEmpty(res)) {
          const newArray = res.split(',');
          const messageNumber = newArray.join(', ');
          Modal.confirm({
            title: intl.get(`${messagePrompt}.backConfirmOrder`).d('是否反馈/确认订单'),
            content: (
              // <Fragment>
              //   <div>{`${resultArray[0]}？`}</div>
              //   {resultArray.length > 1 ? <div>{resultArray[1]}</div> : <Fragment />}
              // </Fragment>
              // <div>
              <div>
                {intl
                  .getHTML('sodr.common.model.common.feedbackForDetail', {
                    poLines: messageNumber,
                    canceltobecomfirmed: intl
                      .get('sodr.common.model.common.canceltobecomfirmed')
                      .d('取消待确认'),
                    closetobecomfirmed: intl
                      .get('sodr.common.model.common.closetobecomfirmed')
                      .d('关闭待确认'),
                  })
                  .d(
                    <span>
                      订单行<span style={{ fontWeight: 900 }}>[{messageNumber}]</span>状态为
                      <span style={{ fontWeight: 900 }}>取消待确认</span>或者
                      <span style={{ fontWeight: 900 }}>关闭待确认</span>，确认反馈会将
                      <span style={{ fontWeight: 900 }}>取消待确认</span>或者
                      <span style={{ fontWeight: 900 }}>关闭待确认</span>
                      的订单行同时进行确认，请确定是否继续确认反馈？
                    </span>
                  )}
              </div>
              // </div>
            ),
            width: 560,
            onOk: handleComfirm,
          });
        } else {
          handleComfirm();
        }
      });
      // }
    });
  }

  /**
   * confirm - 订单反馈
   */
  // feedback() {
  //   const { dispatch } = this.props;
  //   const {
  //     orderHeaderFormDataSource = {},
  //     listCommonDataSource = {},
  //     setting,
  //     supplierAttachmentUuid,
  //     // setest,
  //     feedbackApproveFlag,
  //   } = this.state;
  //   const linesData = getEditTableData(listCommonDataSource);
  //   if (isEmpty(linesData)) {
  //     return;
  //   }
  //   const uuid = {
  //     bucketName: 'private-bucket',
  //     bucketDirectory: 'sodr-order',
  //     attachmentUUID: supplierAttachmentUuid,
  //   };
  //   const data = {
  //     poHeaderDetailDTO: {
  //       _token: orderHeaderFormDataSource._token,
  //       poHeaderId: orderHeaderFormDataSource.poHeaderId,
  //       objectVersionNumber: orderHeaderFormDataSource.objectVersionNumber,
  //     },
  //     poLineDetailDTOs: linesData
  //       // .filter(n => n.edited)
  //       .map(n => {
  //         const {
  //           _token,
  //           poHeaderId,
  //           poLineId,
  //           poLineLocationId,
  //           objectVersionNumber,
  //           lineVersionNumber,
  //           locationVersionNumber,
  //           feedback,
  //           promiseDeliveryDate,
  //           returnedFlag,
  //           needByDate,
  //           quantity,
  //         } = n;
  //         return {
  //           ...n,
  //           _token,
  //           poHeaderId,
  //           poLineId,
  //           poLineLocationId,
  //           objectVersionNumber,
  //           lineVersionNumber,
  //           locationVersionNumber,
  //           feedback,
  //           quantity,
  //           promiseDeliveryDate:
  //             returnedFlag === 1
  //               ? needByDate
  //               : promiseDeliveryDate
  //               ? moment(promiseDeliveryDate).format(DEFAULT_DATETIME_FORMAT)
  //               : null,
  //         };
  //       }),
  //   };
  //   Modal.confirm({
  //     title: intl.get(`${messagePrompt}.sureToConfirm`).d('是否确认反馈'),
  //     onOk: () => {
  //       this.fetchSupplierAttachmentList(uuid).then(rec => {
  //         if (rec.length === 0 && setting === '1' && feedbackApproveFlag === 1) {
  //           notification.warning({
  //             message: intl.get(`sodr.common.view.message.accessoryNotNull`).d('附件不能为空'),
  //           });
  //         } else {
  //           dispatch({
  //             type: 'confirmOrder/feedbackDetail',
  //             payload: {
  //               data: [data],
  //               customizeUnitCode: 'SODR.CONFIRM_ORDER_DETAIL.BASIC',
  //             },
  //           }).then(res => {
  //             if (res) {
  //               notification.success();
  //               dispatch(
  //                 routerRedux.push({
  //                   pathname: '/sodr/confirm-order/list',
  //                 })
  //               );
  //             }
  //           });
  //         }
  //       });
  //     },
  //   });
  // }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  @Bind()
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'confirmOrder/fetchAsnLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchAsnLines - 查询收货记录数据
   */
  @Bind()
  fetchRcvRecords() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 收货记录
      type: 'confirmOrder/fetchRcvRecords',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchBillLines - 查询对账单数据
   */
  @Bind()
  fetchBillLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'confirmOrder/fetchBillLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldBillLines - 查询老对账单数据
   */
  @Bind()
  fetchOldBillLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'confirmOrder/fetchOldBillLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * fetchInvoiceLines - 查询网上发票数据
   */
  @Bind()
  fetchInvoiceLines() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource = {}, actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'confirmOrder/fetchInvoiceLines',
      payload: {
        poNumEquals: orderHeaderFormDataSource.displayPoNum,
        poLineNum: actionListCommonRow.displayLineNum,
      },
    });
  }

  /**
   * fetchOldInvoiceLines - 查询网上发票数据
   */
  @Bind()
  fetchOldInvoiceLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      type: 'confirmOrder/fetchOldInvoiceLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
  }

  /**
   * openMessageBoard - 打开留言板 并获取数据
   */
  @Bind()
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
  @Bind()
  closeMessageBoard() {
    this.setState({
      messageBoardVisible: false,
    });
  }

  /**
   * assignListDataSource - 合并行数据至数据集合
   * @param {Array} [listCommonDataSource = []] - 数据集合
   */
  @Bind()
  assignListDataSource(listCommonDataSource = []) {
    this.setState({
      listCommonDataSource,
    });
  }

  /**
   * openBOMModal - 打开BOM Modal
   * @param {object} [actionListRowData = {}] - 当前操作行数据
   */
  @Bind()
  openBOMModal(actionListRowData = {}) {
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
   * onListChange - 列表分页切换
   * @param {string} actionType - tab切换标记
   * @param {object} page - 分页信息
   */
  @Bind()
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
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  setActionListCommonRow(actionListCommonRow) {
    this.setState({
      actionListCommonRow,
    });
  }

  @Bind()
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
    const { supplierAttachmentUuid = undefined } = this.state;
    console.log(supplierAttachmentUuid);
    if (!supplierAttachmentUuid) {
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
      type: 'confirmOrder/queryFileListOrg',
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
      type: 'confirmOrder/queryFileListOrg',
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
      type: 'confirmOrder/removeFile',
      payload,
    });
  }

  /**
   * 打开模态框
   * @param attachmentVisible
   */
  @Bind()
  handleAttachment() {
    this.setState({ attachmentVisible: true });
  }

  /**
   * hideAttachment - 关闭附件弹窗
   */
  @Bind()
  hideAttachment() {
    this.setState({ attachmentVisible: false });
  }

  // 改变state
  @Bind()
  handleChangeHeaderState = (data) => {
    const { orderHeaderFormDataSource } = this.state;
    const headerData = {
      ...orderHeaderFormDataSource,
      ...data,
    };
    this.setState({
      orderHeaderFormDataSource: headerData,
    });
  };

  // 改变行中的数量时，改变头上的含税价格和不含税价格
  @Bind()
  handleChangeLineState = (lineObj = {}, callBack) => {
    const { listCommonDataSource = [] } = this.state;
    const { keyId, lineAmount, taxIncludedLineAmount } = lineObj;
    const listData = listCommonDataSource.map((item) => {
      if (item.keyId === keyId) {
        return {
          ...item,
          lineAmount,
          taxIncludedLineAmount,
        };
      }
      return item;
    });
    this.setState(
      {
        listCommonDataSource: listData,
      },
      callBack
    );
  };

  /**
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(selectedRowKeys, selectedRows) {
    const { listCommonDataSource } = this.state;
    const cuzList = listCommonDataSource.map((i) => ({
      ...i,
      cuz_selected: selectedRowKeys.includes(i.keyId),
    }));
    if (cuzList.length) {
      this.setState({ listCommonDataSource: cuzList });
    }
    this.setState({ selectedListRows: selectedRows });
  }

  /**
   * attchmentAendMessage - 发送附件
   * @param {string} message - 附件名
   * @param {string} url - 附件url
   * @param {function} success - 操作成功回调函数
   */
  @Bind()
  attchmentAendMessage(message, url, uuid, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'confirmOrder/sendMessage',
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

  @Bind()
  handleChangeOrderField(orderField) {
    this.setState({ orderField });
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  @Bind()
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'confirmOrder/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  // 签章

  /**
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures(header) {
    const { dispatch } = this.props;
    const { companyId, authType, supplierCompanyId, electricSignStatus } = header;
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    dispatch({
      type: 'orderSign/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId: __companyId,
        tenantId: getUserOrganizationId(),
        sealType: authType,
      },
    }).then((res) => {
      if (res) {
        const picDataSource = res.filter((item) => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({
          picDataSource,
        });
        // if (pcKindCode !== 'ATTACHMENT' && picDataSource.length > 0) {
        //   const eachPicDom = document.getElementsByClassName('eachPic')[0];
        //   // console.log('eachPicDom.clientWidth', eachPicDom.clientWidth);
        //   if (eachPicDom) {
        //     const imgHeight = eachPicDom.clientWidth;
        //     this.setState({ imgHeight });
        //   }
        // }
      }
    });
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    // openTab({
    //   key: '/spfm/seal-mange',
    //   title: 'srm.bg.manager.seal.manage',
    // });
  }

  /**
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      sealPictureUrl: picDataSource[index].sealPictureUrl,
      sealId: picDataSource[index].sealId,
      // signatureId: picDataSource[index].signatureId,
    });
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
    });
  }

  /**
   * FDD签章重试确认
   */
  async handleRetryConfirmModal(data) {
    await Modal.confirm({
      width: 600,
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      content: (
        <>
          <p>
            {intl
              .get('sodr.common.modal.sign.retry.tip')
              .d('当前订单已在法大大签署完成，本次签章仅更新SRM订单签署状态')}
          </p>
          <p>{intl.get('sodr.common.modal.sign.retry.confirm').d('是否确认签章？')}</p>
        </>
      ),
      onOk: async () => {
        const ras = getResponse(await signRetry(JSON.parse(data.compensationData || null)));
        if (!ras) return Promise.reject();
        if (ras) {
          notification.success();
          this.fetchDetailHeader();
          this.fetchDetailList();
        }
      },
    });
  }

  /**
   * authType FDD来源直接跳转
   * handleClickSeal 无手机验证签章
   */
  @Throttle(1500, { trailing: false })
  @Bind()
  handleClickSeal() {
    const { dispatch } = this.props;
    const {
      sealId,
      sealPictureUrl,
      // signatureId,
      orderHeaderFormDataSource: {
        supplierCompanyId,
        mobileVerifyFlag,
        authType,
        companyId,
        pcHeaderId,
        certificateResId,
        electricSignStatus,
      },
    } = this.state;
    // 后端要求参数整改
    const isSupplierSign =
      electricSignStatus &&
      !SAAS_SIGN.test(authType) &&
      electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const _supplierCompanyId = !isSupplier ? supplierCompanyId : companyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    const __supplierCompanyId = isSupplierSign ? companyId : _supplierCompanyId;
    if (mobileVerifyFlag && authType !== 'FDD' && !SAAS_SIGN.test(authType)) {
      return dispatch({
        type: 'orderSign/fetchVerifyPhoneNum',
        payload: {
          authType,
          companyId: __companyId,
          supplierCompanyId: __supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            smsVerifyVisible: true,
            phoneNum: res.phone,
          });
        }
        return res;
      });
    } else if (authType === 'FDD') {
      return dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          certificateResId,
          companyId: __companyId,
        },
      }).then((res) => {
        if (res) {
          if (res.compensationFlag === 1) {
            this.handleRetryConfirmModal(res);
          } else {
            notification.success();
            window.open(res.signUrl);
          }
        }
        return res;
      });
    } else if (SAAS_SIGN.test(authType)) {
      return dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          pcHeaderId,
          companyId: __companyId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          window.open(res.signUrl);
        }
        return res;
      });
    } else {
      return dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          companyId: __companyId,
          pcHeaderId,
          sealId,
          sealPictureUrl,
          // signatureId,
          certificateResId,
          // verifyCode,
          // mobile: phoneNum,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sodr/confirm-order/list',
            })
          );
        }
        return res;
      });
    }
  }

  /**
   * 获取手机验证码
   */
  @Throttle(1500, { trailing: false })
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: {
        certificateResId,
        pcHeaderId,
        companyId,
        supplierCompanyId,
        electricSignStatus,
      },
    } = this.state;
    const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
    const _companyId = !isSupplier ? companyId : supplierCompanyId;
    const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
    const phoneNum = this.smsVerifyForm.getFieldValue('phoneNum');
    this.smsVerifyForm.validateFields(['phoneNum'], (err) => {
      if (!err) {
        dispatch({
          type: 'orderSign/getVerifyCode',
          payload: {
            companyId: __companyId,
            mobile: phoneNum,
            certificateResId,
            pcHeaderId,
          },
        });
      }
    });
  }

  /**
   * handleSmsVerifyOk - 手机验证签章
   */

  handleSmsVerifyOk = throttle(
    () => {
      const { validateFields, getFieldsValue } = this.smsVerifyForm;
      const { dispatch } = this.props;
      const smsVerifyData = getFieldsValue();
      const {
        sealId,
        sealPictureUrl,
        orderHeaderFormDataSource: {
          authType,
          companyId,
          pcHeaderId,
          certificateResId,
          supplierCompanyId,
          electricSignStatus,
        },
      } = this.state;
      const isSupplierSign = electricSignStatus && electricSignStatus === 'SUPPLIER_SIGN_CONTRACT';
      const _companyId = !isSupplier ? companyId : supplierCompanyId;
      const __companyId = isSupplierSign ? supplierCompanyId : _companyId;
      validateFields((err) => {
        if (isEmpty(err)) {
          // 获取当前用户手机号 带验证码签章 调用签章接口
          const { phoneNum, verifyCode } = smsVerifyData;
          dispatch({
            type: 'orderSign/confirmMobileChapter',
            payload: {
              authType,
              companyId: __companyId,
              pcHeaderId,
              sealId,
              sealPictureUrl,
              certificateResId,
              verifiCode: verifyCode,
              mobile: phoneNum,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSmsVerifyCancel();
              dispatch(
                routerRedux.push({
                  pathname: '/sodr/confirm-order/list',
                })
              );
            }
          });
        }
      });
    },
    1500,
    { trailing: false }
  );

  /**
   * handleSmsVerifyCancel - 短信验证取消
   */
  handleSmsVerifyCancel = () => {
    this.setState({ smsVerifyVisible: false });
    if (this.smsVerifyForm) {
      this.smsVerifyForm.resetFields();
    }
  };

  @Bind()
  handleChangeLineDisplay(lineDisplay) {
    this.setState({ lineDisplay: lineDisplay === 0 ? 1 : 0 }, () => {
      this.fetchDetailList();
    });
  }

  render() {
    const {
      dispatch,
      match,
      form,
      remote,
      confirmOrder,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      queryFileListOrgLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      sendMessageLoading,
      queryMessageLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      saveDetailLoading,
      confirmDetailLoading,
      feedbackDetailLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      printLoading,
      customizeBtnGroup,
      custLoading = true,
      fetchSealPicturesLoading,
      confirmChapterLoading,
      calculateDoubleUomLoading,
      fetchVerifyPhoneNumLoading,
      confirmMobileChapterLoading,
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
      supplierAttachmentUuid,
      collapseKeys = [],
      radioGroupValue,
      actionListCommonRow,
      attachmentVisible,
      confirmRuleSetting,
      unreadCount,
      selectedListRows,
      associatedConfigFlag,
      currentPic,
      focusStatus,
      picDataSource,
      phoneNum,
      smsVerifyVisible,
      doubleUnitEnabled,
      amountCalcRule,
      fileList,
      dateEditFlag,
    } = this.state;
    const {
      operationRecordPagination,
      operationRecordList = [],
      detailOperationQuery,
      enumMap: { orderFields, purchaseLineType },
    } = confirmOrder;
    const { poSourcePlatform, filesNumber } = orderHeaderFormDataSource;

    const { itemCode, itemName, key, poHeaderId, poLineId } = actionListRowData;
    const querying = queryDetailHeaderLoading || queryDetailListLoading;
    const orderHeaderFormProps = {
      form,
      customizeForm,
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: orderHeaderFormDataSource,
      amountFinancialPrecision: this.amountFinancialPrecision,
      remote,
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
      hideModal: this.hideOperationRecord,
    };
    const listProps = {
      purchaseLineType,
      onRef: (ref) => {
        this.list = ref;
      },
      form,
      dispatch,
      customizeTable,
      customizeTabPane,
      confirmRuleSetting,
      selectedListRows,
      orderFields,
      doubleUnitEnabled,
      amountCalcRule,
      dateEditFlag,
      handleChangeOrderField: this.handleChangeOrderField,
      processing: { queryDetailListLoading, queryPartnersLoading, calculateDoubleUomLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource,
      openBOMModal: this.openBOMModal,
      onChange: this.onListChange,
      onChangeListData: this.handleChangeList,
      promiseDeliveryDateNotNullFlag: orderHeaderFormDataSource.promiseDeliveryDateNotNullFlag,
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      actionListCommonRow,
      setActionListCommonRow: this.setActionListCommonRow,
      poSourcePlatform: orderHeaderFormDataSource.poSourcePlatform,
      onHeaderSetState: this.handleChangeHeaderState,
      onLineSetState: this.handleChangeLineState,
      handleRowSelectedChange: this.handleRowSelectedChange,
      amountFinancialPrecision: this.amountFinancialPrecision,
      headerInfo: orderHeaderFormDataSource,
      handleChangeLineDisplay: this.handleChangeLineDisplay,
    };

    const messageProps = {
      visible: messageBoardVisible,
      onCancel: this.closeMessageBoard,
      fetchMessage: this.fetchMessage,
      sendMessage: this.sendMessage,
      attchmentAendMessage: this.attchmentAendMessage,
      onRef: (node) => {
        this.updateMessage = node;
      },
      processing: { queryMessageLoading, sendMessageLoading },
    };

    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal,
      fetchBOM: this.fetchBOM,
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
      poHeaderId,
      poLineId,
    };

    const {
      attachmentUuid,
      electricSignFlag,
      confirmedFlag,
      statusCode,
      authType,
    } = orderHeaderFormDataSource;
    const attachmentProps = {
      remote,
      visible: attachmentVisible,
      bucketName: BUCKET_NAME,
      // bucketDirectory: 'sprm-pr',
      supplierAttachmentUuid, // 供应商uuid
      attachmentUUID: attachmentUuid, // 采购方uuid
      hideAttachment: this.hideAttachment,
      onFetchPurchaserAttachmentList: this.fetchPurchaserAttachmentList,
      onFetchSupplierAttachmentList: this.fetchSupplierAttachmentList,
      onRemoveAttachment: this.removeAttachment,
      loading: queryFileListOrgLoading, // 加载状态
      onBindUuidToHeader: this.fetchUuidBindHeader, // 绑定uuid到头
      detailHeader: this.fetchDetailHeader,
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

    const deliveryAndBillProps = {
      customizeForm,
      dataSource: orderHeaderFormDataSource,
    };

    // const operateBtnProps = {
    //   unreadCount,
    //   viewButtonPrompt,
    //   openMessageBoard: this.openMessageBoard,
    // };

    const previewModalProps = {
      fileList,
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      btnProps: {
        icon: 'paper-clip',
        // disabled: !poHeaderId,
      },
    };
    const headerBtnLoading =
      querying ||
      saveDetailLoading ||
      confirmDetailLoading ||
      feedbackDetailLoading ||
      printLoading ||
      confirmChapterLoading;

    const sealModalProps = {
      currentPic,
      focusStatus,
      picDataSource,
      sealMenuFlag: false,
      confirmChapterLoading,
      disableBtn: electricSignFlag === 1 && confirmedFlag !== 1,
      fetchVerifyPhoneNumLoading,
      // chapterFlag: false,
      onRef: (node) => {
        this.sealModalRef = node;
      },
      onModalOk: this.handleClickSeal,
      headerInfo: orderHeaderFormDataSource,
      onSkipToSealManage: this.skipToSealManage,
      onHandleClickImg: this.handleClickImg,
      onGoToPictureSign: this.goToPictureSign,
      btnProps: {
        loading: headerBtnLoading,
      },
    };

    const messageVerifyProps = {
      phoneNum,
      smsVerifyVisible,
      confirmMobileChapterLoading,
      handleOk: this.handleSmsVerifyOk,
      getVerifyCode: this.getVerifyCode,
      handleCancel: this.handleSmsVerifyCancel,
      headerInfo: orderHeaderFormDataSource,
      ref: (node) => {
        this.smsVerifyForm = node;
      },
    };
    const buttons = [
      // <OperateBtn data-name="messageboard" {...operateBtnProps} />,
      {
        name: 'messageboard',
        btnComp: OperateBtn,
        btnProps: {
          unreadCount,
          viewButtonPrompt,
          openMessageBoard: this.openMessageBoard,
        },
      },
      {
        name: 'save',
        child: intl.get(`${commonPrompt}.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          loading: headerBtnLoading,
          onClick: this.save,
        },
      },
      {
        name: 'printer',
        btnComp: Button,
        child: intl.get(`sodr.confirmOrder.view.button.print`).d('打印'),
        btnProps: {
          icon: 'printer',
          onClick: this.handlePrint,
          loading: headerBtnLoading,
          permissionList: [
            {
              code: `srm.po-admin.so.confirm-order.ps.button.confirmorderprint`,
              type: 'button',
              meaning: '订单确认-订单详情打印',
            },
          ],
        },
      },
      {
        name: 'attachment',
        group: true,
        child: (
          // <Fragment>
          <Button icon="paper-clip" onClick={this.handleAttachment} loading={headerBtnLoading}>
            {intl.get('entity.attachment.tag').d('附件')}
            {!!filesNumber && parseInt(filesNumber, 10) !== 0 && (
              <Tag
                color="#108ee9"
                style={{
                  height: 'auto',
                  lineHeight: '15px',
                  marginLeft: '4px',
                }}
              >
                {filesNumber}
              </Tag>
            )}
          </Button>
          // </Fragment>
        ),
      },
      {
        name: 'operation',
        child: intl.get(`${viewButtonPrompt}.operationRecord`).d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          disabled: querying,
          onClick: this.openOperationRecord,
          loading: headerBtnLoading,
        },
      },
    ];
    const feedBackBtn = {
      name: 'check',
      child: intl.get(`sodr.common.model.view.button.backConfirm`).d('反馈/确认'),
      btnProps: {
        loading: headerBtnLoading,
        icon: 'check',
        type: 'primary',
        disabled: querying || saveDetailLoading || confirmDetailLoading || feedbackDetailLoading,
        onClick: this.confirm,
      },
    };
    let signBtn = {};
    const disabledBtn = electricSignFlag === 1 && confirmedFlag !== 1;
    if (authType === 'FDD' || SAAS_SIGN.test(authType)) {
      signBtn = {
        name: 'sign',
        child: intl.get(`hzero.common.button.sign`).d('签章'),
        btnProps: {
          loading: headerBtnLoading,
          disabled: disabledBtn,
          onClick: this.handleClickSeal,
        },
      };
    } else {
      signBtn = {
        name: 'sign',
        btnComp: SealModal,
        child: intl.get(`hzero.common.button.sign`).d('签章'),
        btnProps: {
          ...sealModalProps,
        },
      };
    }

    const eSignAttachmentBtn = {
      name: 'eSignAttachmentBtn',
      btnComp: PreviewModal,
      btnProps: {
        ...previewModalProps,
      },
    };
    if (!(fetchSealPicturesLoading || queryDetailHeaderLoading) && electricSignFlag === 1) {
      buttons.unshift(signBtn);
    }
    if (!queryDetailHeaderLoading && !(electricSignFlag === 1 && statusCode === 'CONFIRMED')) {
      buttons.unshift(feedBackBtn);
    }
    if (!queryDetailHeaderLoading && !fetchSealPicturesLoading && electricSignFlag === 1) {
      buttons.unshift(eSignAttachmentBtn);
    }

    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.detail`).d('订单明细')}
          backPath="/sodr/confirm-order/list"
        >
          {!custLoading &&
            // !queryDetailHeaderLoading &&
            customizeBtnGroup(
              { code: 'SODR.CONFIRM_ORDER_DETAIL.BUTTONS', pro: true },
              <DynamicButtons buttons={buttons} />
            )}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || false}
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME, styles['comfirm-order'])}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderHeaderInfo']}
              onChange={this.onCollapseChange}
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
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <OrderHeaderForm {...orderHeaderFormProps} />
              </Panel>
              {poSourcePlatform === 'CATALOGUE' && (
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
        {remote.process(
          'externalAttachments',
          attachmentVisible && <Attachment {...attachmentProps} />,
          {
            visible: attachmentVisible,
            Comp: Attachment,
            props: { ...attachmentProps },
            orderHeaderFormDataSource,
          }
        )}
        <MessageVerification {...messageVerifyProps} />
      </Fragment>
    );
  }
}
