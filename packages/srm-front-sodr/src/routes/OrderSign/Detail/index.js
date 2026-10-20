/**
 * index - 订单签署明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, throttle } from 'lodash';
import querystring from 'querystring';
import classnames from 'classnames';
import { THROTTLE_TIME, SAAS_SIGN } from '@/routes/components/utils/constant';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { Bind, Throttle } from 'lodash-decorators';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';

import { formatAumont } from '@/routes/components/utils';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import { getFileList, signRetry } from '@/services/orderReleaseService';
import SealModal from '@/routes/components/SealModal/SealModal';
import MessageVerification from '@/routes/components/MessageVerification';
import arrow from '@/assets/connect.svg';
import OrderHeaderForm from './OrderHeaderForm';
import OperationRecord from './OperationRecord';
import WrapperBOMModal from './BOMModal';
import List from './List';

import AssociatedInvoice from './AssociatedInvoice';
import styles from './index.less';

// 折叠面板组件初始化
const { Panel } = Collapse;
/**
 * Detail - 业务组件 - 订单发布
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [sendOrder={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {!boolean} queryPoItemBOMLoading - 查询BOM
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} sendMessageLoading - 发送留言
 * @reactProps {!boolean} queryMessageLoading - 查询留言
 * @reactProps {!boolean} queryPartnersLoading - 查询合作伙伴
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} queryFileListOrgLoading - 查询附件相关
 * @reactProps {!boolean} asnLinesLoading - 关联单据-送货单行查询
 * @reactProps {!boolean} rcvRecordsLoading - 关联单据-收货记录查询
 * @reactProps {!boolean} billLinesLoading - 关联单据-对账单查询
 * @reactProps {!boolean} invoiceLinesLoading - 关联单据-网上发票查询
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading, orderSign }) => ({
  queryPoItemBOMLoading: loading.effects['orderSign/newQueryPoItemBOM'],
  queryDetailHeaderLoading: loading.effects['orderSign/queryDetailHeader'],
  detailPublishLoading: loading.effects['orderSign/detailPublish'],
  queryPartnersLoading: loading.effects['orderSign/queryPartners'],
  queryDetailListLoading: loading.effects['orderSign/queryDetailList'],
  fetchOperationRecordListLoading: loading.effects['orderSign/fetchOperationRecordList'],
  asnLinesLoading: loading.effects['orderSign/fetchAsnLines'],
  rcvRecordsLoading: loading.effects['orderSign/fetchRcvRecords'],
  billLinesLoading: loading.effects['orderSign/fetchBillLines'],
  oldBillLinesLoading: loading.effects['orderSign/fetchOldBillLines'],
  invoiceLinesLoading: loading.effects['orderSign/fetchInvoiceLines'],
  oldInvoiceLinesLoading: loading.effects['orderSign/fetchOldInvoiceLines'],
  fetchSealPicturesLoading: loading.effects['orderSign/fetchSealPictures'],
  confirmChapterLoading: loading.effects['orderSign/confirmChapter'],
  confirmMobileChapterLoading: loading.effects['orderSign/confirmMobileChapter'],
  fetchVerifyPhoneNumLoading: loading.effects['orderSign/fetchVerifyPhoneNumLoading'],
  orderSign,
}))
@formatterCollections({
  code: [
    'sodr.orderRelease',
    'sodr.common',
    'sodr.sendOrder',
    'entity.company',
    'entity.item',
    'entity.attachment',
    'entity.order',
    'item.order',
    'sodr.quotePurchase',
    'sprm.common',
    'spcm.common',
    'sodr.quotePurchaseRequisition',
    'hzero.common',
    'spcm.contractChapter',
    'sprm.purchaseReqCreation',
    'component.docFlow',
  ],
})
@withCustomize({
  unitCode: [
    'SODR.ORDER_SIGN_DETAIL.BASIC',
    'SODR.ORDER_SIGN_DETAIL.HEADER',
    'SODR.ORDER_SIGN_DETAIL.OTHER',
    'SODR.ORDER_SIGN_DETAIL.TAB',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { libFlag = '' } = routerParams;
    const { match = {} } = this.props;
    const { params } = match;
    this.state = {
      orderHeaderFormDataSource: {},
      operationRecordModalVisible: false, // 操作记录模态框
      listCommonDataSource: [],
      listCommonPagination: {},
      listPartnersDataSource: [],
      listPartnersPagination: {},
      wrapperBOMModalVisible: false,
      actionListRowData: {},

      organizationId: getCurrentOrganizationId(),
      collapseKeys: ['orderHeaderInfo'],
      radioGroupValue: 'basic',
      actionListCommonRow: {},
      libFlag, // 页面跳转标识
      associatedConfigFlag: true, // 新旧结算判断flag

      poHeaderId: params.id,
      picDataSource: [], // 印章图片
      focusStatus: '', // 选中印章图片标识
      currentPic: 0, // 当前图片位置
      phoneNum: null, // 手机号码
      smsVerifyVisible: false, // 短信验证
      fileList: [], // 获取预览的文件列表信息
    };

    // 方法注册
    [
      'afterOpenHeaderUploadModal',
      'getHeaderAttachmentUuid',
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
      'onCollapseChange',
      'amountFinancialPrecision',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  async componentDidMount() {
    const { match = {} } = this.props;
    const { params } = match;
    if (isNumber(Number(params.id))) {
      this.refresh();
    }
  }

  /**
   * 查询列表值集
   */
  @Bind()
  refresh() {
    this.fetchDetailHeader();
    this.fetchDetailList();
    this.fetchPartners();
    this.fetchAssociatedConfigFlag();
    this.fetchEnum();
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'orderSign/init' });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  fetchDetailHeader() {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderSign/queryDetailHeader',
      payload: {
        customizeUnitCode: 'SODR.ORDER_SIGN_DETAIL.HEADER',
        poHeaderId: params.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: res,
          // attachmentUUID: res.supplierAttachmentUuid,
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
   * @param {object} params - 查询条件
   */
  fetchDetailList(queryParams = {}) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderSign/queryDetailList',
      payload: {
        poHeaderId: params.id,
        ...queryParams,
        customizeUnitCode: 'SODR.ORDER_SIGN_DETAIL.BASIC,SODR.ORDER_SIGN_DETAIL.OTHER',
      },
    }).then((res) => {
      if (res) {
        const { dataSource = [], pagination } = res;
        const listCommonDataSource = dataSource.map((n) => ({
          ...n,
          key: `poHeaderId-${n.poHeaderId}-poLineId-${n.poLineId}-poLineLocationId-${n.poLineLocationId}`,
          _status: 'update',
        }));
        this.setState({
          listCommonDataSource,
          listCommonPagination: pagination,
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
      type: 'orderSign/queryPartners',
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
    const { poLineId } = actionListRowData;
    dispatch({
      type: 'orderSign/newQueryPoItemBOM',
      params: {
        poHeaderId: match.params.id,
        poLineId,
        page: 0,
        size: 10,
        ...params,
      },
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  openOperationRecord() {
    this.setState({ operationRecordModalVisible: true });
  }

  /**
   * fetchAsnLines - 查询送货单数据
   */
  fetchAsnLines() {
    const { dispatch } = this.props;
    const { actionListCommonRow = {} } = this.state;
    return dispatch({
      // 送货单
      type: 'orderSign/fetchAsnLines',
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
      type: 'orderSign/fetchRcvRecords',
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
      type: 'orderSign/fetchBillLines',
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
      type: 'orderSign/fetchOldBillLines',
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
      type: 'orderSign/fetchInvoiceLines',
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
      type: 'orderSign/fetchOldInvoiceLines',
      poLineLocationId: actionListCommonRow.poLineLocationId,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
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
   * @param {Array<string>} collapseKeys - Panels key
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

  onRadioGroupChange(radioGroupValue) {
    this.setState({
      radioGroupValue,
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.attachmentUuid)) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'orderSign/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
      }
    });
  }

  /**
   * 调整金额精度
   * @param {string} priceShieldFlag
   * @param {number} amount
   * @param {number} financialPrecision
   */
  amountFinancialPrecision(priceShieldFlag, amount, financialPrecision, poSourcePlatform) {
    if (priceShieldFlag === 1) {
      return '******';
    } else if (poSourcePlatform === 'ERP') {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  }

  /**
   * 获取业务规则定义-【是否启用新结算平台】设置值
   */
  fetchAssociatedConfigFlag() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderSign/fetchAssociatedConfigFlag',
    }).then((res) => {
      if (res === 1) {
        this.setState({ associatedConfigFlag: true });
      } else {
        this.setState({ associatedConfigFlag: false });
      }
    });
  }

  /**
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures(header) {
    const { dispatch } = this.props;
    const { companyId, authType, supplierCompanyId } = header;
    const _companyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
    dispatch({
      type: 'orderSign/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId: _companyId,
        tenantId: getUserOrganizationId(),
        sealType: authType,
      },
    }).then((res) => {
      if (res) {
        const picDataSource = (res || []).filter((item) => {
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
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
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

  // 判断是否为供应商
  isSupplier = () => {
    return getUserOrganizationId() !== getCurrentOrganizationId();
  };

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
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleClickSeal() {
    const { dispatch } = this.props;
    const {
      sealId,
      sealPictureUrl,
      orderHeaderFormDataSource: {
        supplierCompanyId,
        mobileVerifyFlag,
        authType,
        companyId,
        pcHeaderId,
        poHeaderId,
        certificateResId,
      },
    } = this.state;
    const _companyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
    const _supplierCompanyId =
      getUserOrganizationId() === getCurrentOrganizationId() ? supplierCompanyId : companyId;
    if (mobileVerifyFlag && authType !== 'FDD' && !SAAS_SIGN.test(authType)) {
      if (!sealId) {
        notification.warning({
          message: intl.get('sodr.common.button.selectedSignTip').d('请选择印章'),
        });
        return false;
      }
      return dispatch({
        type: 'orderSign/fetchVerifyPhoneNum',
        payload: {
          authType,
          companyId: _companyId,
          supplierCompanyId: _supplierCompanyId,
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
          companyId: _companyId,
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
          companyId: _companyId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          if (res.silentSealFlag === 1) {
            dispatch(
              routerRedux.push({
                pathname: `/sodr/order-sign/list`,
              })
            );
          } else if (!res.silentSealFlag && res.signUrl) {
            window.open(res.signUrl);
          }
        }
        return res;
      });
    } else {
      if (!sealId) {
        notification.warning({
          message: intl.get('sodr.common.button.selectedSignTip').d('请选择印章'),
        });
        return false;
      }
      return dispatch({
        type: 'orderSign/confirmChapter',
        payload: {
          authType,
          companyId: _companyId,
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
          // 供应商跳到确认页面，采购方跳往签署页面
          const _path = this.isSupplier()
            ? `/sodr/confirm-order/detail/${poHeaderId}`
            : `/sodr/order-sign/list`;
          dispatch(
            routerRedux.push({
              pathname: _path,
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
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { certificateResId, pcHeaderId, companyId },
    } = this.state;
    const phoneNum = this.smsVerifyForm.getFieldValue('phoneNum');
    this.smsVerifyForm.validateFields(['phoneNum'], (err) => {
      if (!err) {
        dispatch({
          type: 'orderSign/getVerifyCode',
          payload: {
            companyId,
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
          poHeaderId,
          certificateResId,
          supplierCompanyId,
        },
      } = this.state;
      const _companyId =
        getUserOrganizationId() === getCurrentOrganizationId() ? companyId : supplierCompanyId;
      validateFields((err) => {
        if (isEmpty(err)) {
          // 获取当前用户手机号 带验证码签章 调用签章接口
          const { phoneNum, verifyCode } = smsVerifyData;
          dispatch({
            type: 'orderSign/confirmMobileChapter',
            payload: {
              authType,
              companyId: _companyId,
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
              // 供应商跳到确认页面，采购方跳往签署页面
              const _path = this.isSupplier()
                ? `/sodr/confirm-order/detail/${poHeaderId}`
                : `/sodr/order-sign/list`;
              dispatch(
                routerRedux.push({
                  pathname: _path,
                })
              );
            }
          });
        }
      });
    },
    THROTTLE_TIME,
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

  render() {
    const {
      form,
      dispatch,
      match,
      orderSign,
      customizeForm,
      customizeTable,
      customizeTabPane,
      fetchOperationRecordListLoading,
      queryDetailListLoading,
      queryPartnersLoading,
      detailPublishLoading,
      queryPoItemBOMLoading,
      queryDetailHeaderLoading,
      asnLinesLoading,
      rcvRecordsLoading,
      billLinesLoading,
      oldBillLinesLoading,
      invoiceLinesLoading,
      oldInvoiceLinesLoading,
      fetchSealPicturesLoading,
      confirmChapterLoading,
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
      // messageBoardVisible,
      wrapperBOMModalVisible,
      actionListRowData,
      organizationId,
      collapseKeys,
      radioGroupValue,
      actionListCommonRow,
      libFlag,
      associatedConfigFlag,

      currentPic,
      focusStatus,
      picDataSource,
      phoneNum,
      smsVerifyVisible,
      fileList,
      poHeaderId,
    } = this.state;
    const { poSourcePlatform, electricSignFlag, authType } = orderHeaderFormDataSource;
    const {
      operationRecordPagination,
      operationRecordList,
      detailOperationQuery,
      enumMap,
    } = orderSign;
    const { itemCode, itemName, key } = actionListRowData;

    const orderHeaderFormProps = {
      customizeForm,
      ref: (node) => {
        this.orderHeaderForm = node;
      },
      dataSource: orderHeaderFormDataSource,
      amountFinancialPrecision: this.amountFinancialPrecision,
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
      hideModal: this.hideOperationRecord.bind(this),
    };
    const listProps = {
      onRef: (ref) => {
        this.list = ref;
      },
      form,
      enumMap,
      headerInfo: orderHeaderFormDataSource,
      customizeTable,
      customizeTabPane,
      processing: { queryDetailListLoading, queryPartnersLoading, detailPublishLoading },
      dataSource: { common: listCommonDataSource, partners: listPartnersDataSource },
      pagination: { common: listCommonPagination, partners: listPartnersPagination },
      assignDataSource: this.assignListDataSource.bind(this),
      openBOMModal: this.openBOMModal.bind(this),
      onChange: this.onListChange.bind(this),
      // onSearch: this.onSearchInvoiceInfo.bind(this),
      onRadioGroupChange: this.onRadioGroupChange,
      radioGroupValue,
      actionListCommonRow,
      poSourcePlatform,
      setActionListCommonRow: this.setActionListCommonRow,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };

    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.closeBOMModal.bind(this),
      fetchBOM: this.fetchBOM.bind(this),
      actionkey: key,
      processing: queryPoItemBOMLoading,
      itemCode,
      itemName,
    };

    const associatedInvoiceProps = {
      fetchAsnLines: this.fetchAsnLines,
      fetchRcvRecords: this.fetchRcvRecords,
      fetchInvoiceLines: associatedConfigFlag ? this.fetchInvoiceLines : this.fetchOldInvoiceLines,
      fetchBillLines: associatedConfigFlag ? this.fetchBillLines : this.fetchOldBillLines,
      processing: {
        asnLinesLoading,
        rcvRecordsLoading,
        billLinesLoading: associatedConfigFlag ? billLinesLoading : oldBillLinesLoading,
        invoiceLinesLoading: associatedConfigFlag ? invoiceLinesLoading : oldInvoiceLinesLoading,
      },
      actionListCommonRow,
      associatedConfigFlag,
    };
    // const { attachmentUuid } = orderHeaderFormDataSource;

    const previewModalProps = {
      fileList,
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      btnProps: {
        icon: 'paper-clip',
        disabled: !poHeaderId,
      },
    };
    const headerBtnLoading =
      confirmChapterLoading || queryDetailHeaderLoading || queryDetailListLoading;
    const sealModalProps = {
      currentPic,
      focusStatus,
      picDataSource,
      sealMenuFlag: false,
      confirmChapterLoading,
      fetchVerifyPhoneNumLoading,
      // chapterFlag: false,
      onRef: (node) => {
        this.sealModalRef = node;
      },
      btnProps: { type: 'primary', icon: 'authorize', loading: headerBtnLoading },
      onModalOk: this.handleClickSeal,
      headerInfo: orderHeaderFormDataSource,
      onSkipToSealManage: this.skipToSealManage,
      onHandleClickImg: this.handleClickImg,
      onGoToPictureSign: this.goToPictureSign,
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
    return (
      <div className={styles['sodr-order-release-detail']}>
        <Header
          title={intl.get(`sodr.common.view.message.title.detail`).d('订单明细')}
          backPath={libFlag === 'priceLib' ? '' : '/sodr/order-sign/list'}
        >
          {!(fetchSealPicturesLoading || queryDetailHeaderLoading) &&
          (authType === 'FDD' || SAAS_SIGN.test(authType)) ? (
            <Button
              icon="authorize"
              type="primary"
              loading={headerBtnLoading}
              onClick={this.handleClickSeal}
            >
              {intl.get(`hzero.common.button.sign`).d('签章')}
            </Button>
          ) : (
            <SealModal {...sealModalProps}>
              {intl.get(`hzero.common.button.sign`).d('签章')}
            </SealModal>
          )}
          {!queryDetailHeaderLoading && electricSignFlag === 1 && (
            <PreviewModal {...previewModalProps} />
          )}
          <Button icon="clock-circle-o" onClick={this.openOperationRecord.bind(this)}>
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || detailPublishLoading || false}
            wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME, styles['association-list'])}
          >
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
                      {intl.get(`sodr.common.view.message.title.orderHeaderInfo`).d('订单头信息')}
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
        {/* {changedHistoryModalVisible && <ChangedHistory {...changedHistoryProps} />} */}
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
        <WrapperBOMModal {...wrapperBOMModalProps} />
        <MessageVerification {...messageVerifyProps} />
      </div>
    );
  }
}
