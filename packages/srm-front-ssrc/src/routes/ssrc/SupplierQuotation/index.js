/**
 * Recommend - 供应商报价-列表
 * @date: 2018-12-25
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { isUndefined, noop } from 'lodash';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import { Table, Popover, Badge, Tag, Tooltip } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { isPubPage, asyncPageFetchList, dateFormate } from '@/utils/utils';
import { getQuotationName } from '@/utils/globalVariable';

import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import ReadMatterDetail from '@/routes/components/MatterDetail/ReadMatterDetail';

import IconWarningCircle from '@/assets/icon-warning-circle.svg';

import FilterForm from './FilterForm';
import styles from './PretrialApplicationModal.less';
import PretrialApplicationModal from './PretrialApplicationModal';
import QualRequirementDetailsModal from './QualRequirementDetailsModal';
import PretrialApplicationGroupingModal from './PretrialApplicationGroupingModal';

class Supplierquotation extends Component {
  form;

  state = {
    preApplyModalVisible: false,
    prequalOnlyRead: false,
    prequalLineStatus: '', // 预审申请状态
    pretrialPanelVisible: false, // 预审小组弹框
    readMatterDetailVisible: false, // 寻源事项阅读
    currentOperateRow: {}, // 当前操作行
    prequalGroupingFlag: false, // 资格预审分组flag
    mergeType: null, // 合并分组方式
    originRfxNum: null, // 工作台跳转带的状态参数
  };

  componentDidMount() {
    this.querySupplier();
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const rfxNum = this.getRfxNum(this.props);
    const originRfxNum = this.getRfxNum(prevProps);

    return rfxNum !== originRfxNum;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.querySupplier();
    }
  }

  /**
   * 工作台跳转
   * 获取rfxNum from url
   */
  @Bind()
  getRfxNum(props = {}) {
    const {
      location: { search = {} },
    } = props;

    let { rfxNum = null } = querystring.parse(search.substr(1));
    rfxNum = rfxNum ? rfxNum.replace(/'/g, '') : null; // 工作台跳转带的状态参数
    return rfxNum;
  }

  /**
   * 供应商报价查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      supplierQuotation: { suppliereEntrancePagin = {} },
    } = this.props;
    const rfxNum = this.getRfxNum(this.props);
    this.setState({ originRfxNum: rfxNum }, () => {
      this.handleSearch(suppliereEntrancePagin, { rfxNum });
    });
    const lovCodes = {
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      inquiryMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      biddingDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      quotationHeaderStatusList: 'SSRC.RFX_QUOTATION.QUOTATION_HEADER_STATUS', // RFX报价状态
    };
    dispatch({
      type: 'supplierQuotation/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 跳转报价查询
   */
  @Bind()
  directQuotationQuery(record = {}) {
    const {
      dispatch,
      match: { path = null },
    } = this.props;
    const { rfxHeaderId, supplierCompanyId, quotationHeaderId } = record;
    if (!rfxHeaderId || !supplierCompanyId) {
      return;
    }

    const commonSearchObj = {
      switchUrl: 0,
      quotationHeaderId,
    };

    const search = querystring.stringify(commonSearchObj);
    dispatch(
      routerRedux.push({
        pathname: isPubPage(
          path,
          `/ssrc/query-quotation/detail/${rfxHeaderId}/${supplierCompanyId}`
        ),
        search,
      })
    );
  }

  /**
   * 点击报价跳转
   * @param {*} record
   */
  @Bind()
  onOperation(record) {
    const {
      dispatch,
      match: { path = null },
    } = this.props;
    const {
      rfxHeaderId, // 针对于伊戈尔二开增加参数
      supplierCompanyId, // 针对于伊戈尔二开增加参数
      quotationHeaderId,
      roundFlag,
      subjectMatterRule = null,
      projectLineSectionId = null,
      operationMeaning,
    } = record;
    const search = querystring.stringify({
      sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
      roundFlag,
      projectLineSectionId,
      rfxHeaderId,
      supplierCompanyId,
    });

    if (operationMeaning === 'QUOTATION') {
      if (record.prequalLineStatus === 'NEW') {
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.notSubmitPre')
            .d('预审申请未提交，不可报价'),
        });
      } else if (record.bidBondFlag) {
        notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.notPayDeposit')
            .d('请缴纳保证金后再报价！'),
        });
      } else {
        dispatch(
          routerRedux.push({
            pathname: isPubPage(
              path,
              `/ssrc/supplier-quotation/inquiry-price/${quotationHeaderId}`
            ),
            search,
          })
        );
      }
    }
    if (operationMeaning === 'BARGAIN_QUOTATION') {
      dispatch(
        routerRedux.push({
          pathname: isPubPage(path, `/ssrc/supplier-quotation/inquiry-price/${quotationHeaderId}`),
          search,
        })
      );
    }
    if (operationMeaning === 'BIDDING') {
      let searchBidding = querystring.stringify({
        rfxHeaderId, // 针对于伊戈尔二开增加参数
        supplierCompanyId, // 针对于伊戈尔二开增加参数
      });
      if (record.bidBondFlag) {
        return notification.warning({
          message: intl
            .get('ssrc.supplierQuotation.view.message.notPayBidding')
            .d('请缴纳保证金后再竞价！'),
        });
      }
      if (subjectMatterRule === 'PACK') {
        searchBidding = querystring.stringify({
          sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
          projectLineSectionId,
          rfxHeaderId,
          supplierCompanyId,
        });
      }
      dispatch(
        routerRedux.push({
          pathname: isPubPage(path, `/ssrc/supplier-quotation/bidding-offer/${quotationHeaderId}`),
          search: searchBidding,
        })
      );
      return;
    }
    if (operationMeaning === 'UNPARTICIPATED') {
      // 参与
      this.onBeforeParticipate(record);
    }
    if (operationMeaning === 'REPLY') {
      dispatch(
        routerRedux.push({
          pathname: isPubPage(
            path,
            `/ssrc/supplier-quotation/reply/${record.sourceCategory}/${record.rfHeaderId}`
          ),
          search: querystring.stringify({
            quotationHeaderId,
          }),
        })
      );
    }
    if (operationMeaning === 'ROUND_QUOTATION') {
      this.handleRoundQuotation(record, { search });
    }
  }

  // 操作列-多轮报价
  // CUX
  @Bind()
  handleRoundQuotation(record = {}, options = {}) {
    const { dispatch } = this.props;
    const { roundNumber = null, bidBondFlag = 0 } = record || {};
    const { search = null } = options || {};

    if (roundNumber === 1 && bidBondFlag) {
      notification.warning({
        message: intl
          .get('ssrc.supplierQuotation.view.message.notPayDeposit')
          .d('请缴纳保证金后再报价！'),
      });
      return;
    }

    dispatch(
      routerRedux.push({
        pathname: this.getInquiryPirceUrl(record),
        search,
      })
    );
  }

  // 报价页面路由
  getInquiryPirceUrl = (record = {}) => {
    const {
      match: { path = null },
    } = this.props;
    const { quotationHeaderId = null } = record;
    if (!quotationHeaderId) {
      return;
    }

    return isPubPage(path, `/ssrc/supplier-quotation/inquiry-price/${quotationHeaderId}`);
  };

  /**
   * 点击PFx跳转
   */
  @Bind()
  onrfxNum(record) {
    const type = 'view';
    const {
      dispatch,
      match: { path = null },
    } = this.props;
    const { rfxHeaderId, supplierCompanyId } = record;
    const search = querystring.stringify({
      quotationHeaderId: record.quotationHeaderId,
    });
    dispatch(
      routerRedux.push({
        pathname: isPubPage(
          path,
          `/ssrc/supplier-quotation/detail/${rfxHeaderId}/${supplierCompanyId}/${type}`
        ),
        search,
      })
    );
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, params = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      supplierQuotation: { suppliereEntranceOldTotalElements: oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    const { approvedDateFrom, approvedDateTo } = fieldValues || {};

    const commonPayload = {
      page,
      ...fieldValues,
      approvedDateFrom: approvedDateFrom
        ? dateFormate(approvedDateFrom, DEFAULT_DATETIME_FORMAT)
        : null,
      approvedDateTo: approvedDateTo ? dateFormate(approvedDateTo, DEFAULT_DATETIME_FORMAT) : null,
      ...params,
      organizationId,
      customizeUnitCode: 'SSRC.SUPPLIER_QUOTATION_LIST.QUOTATION_TABLE',
    };
    const fetchEntranceList = (payload) => {
      return dispatch({
        type: 'supplierQuotation/fetchEntranceList',
        payload,
      });
    };

    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchEntranceList,
    });
  }

  /**
   * 预审申请数据获取
   * @param {String} rfxHeaderId -询价单头id
   */
  @Bind()
  fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId, form) {
    const { organizationId, dispatch } = this.props;
    const { rfxHeaderId, prequalGroupingFlag } = this.state;
    return dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag ? 'querySupplierPrequalHeader' : 'fetchPretrialApplication'
      }`,
      payload: {
        organizationId,
        rfxHeaderId,
        supplierCompanyId,
        prequalGroupHeaderId,
        prequalCategory: 'RFX',
        customizeUnitCode: 'SSRC_SUPPLIER_PREQUAL.DATA',
      },
    }).then((res) => {
      if (res && form) {
        // 重置表单form
        form.resetFields();
      }
      return res;
    });
  }

  /**
   * 打开资格预审弹框
   * @param {obj} record - table的行记录
   */
  @Bind()
  openPretrialApplicationModal(record) {
    const { prequalLineStatus } = record;
    let prequalOnlyRead = false;
    if (
      prequalLineStatus === 'REFUSED' ||
      prequalLineStatus === 'APPROVED' ||
      prequalLineStatus === 'NO_APPROVED'
    ) {
      prequalOnlyRead = true;
    }
    const { mergeType, rfxHeaderId, supplierCompanyId, prequalGroupHeaderId } = record;
    this.setState(
      {
        mergeType,
        prequalOnlyRead,
        rfxHeaderId,
        supplierCompanyId: record.supplierCompanyId,
        preApplyModalVisible: true,
        prequalLineStatus: record.prequalLineStatus,
        quotationStartDate: record.quotationStartDate,
        sourceProjectId: record.sourceProjectId,
        prequalGroupHeaderId: record.prequalGroupHeaderId,
        prequalGroupingFlag: record.mergeType !== null, // 分组标识
      },
      () => this.fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId)
    );
  }

  /**
   * 资格预审申请保存回调
   * @param {Object} params - 保存接口所需参数
   */
  @Bind()
  async savePretrialApplicationData(params) {
    const { organizationId, dispatch } = this.props;
    const { prequalGroupingFlag } = this.state;
    const { supplierCompanyId, prequalGroupHeaderId } = params;
    return dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag ? 'saveSupplierPrequalHeader' : 'savePretrialApplication'
      }`,
      payload: {
        organizationId,
        prequalGroupHeaderId,
        supplierCompanyId: params.supplierCompanyId,
        supplierPrequalDTO: params.supplierPrequalDTO,
        customizeUnitCode: 'SSRC_SUPPLIER_PREQUAL.DATA',
      },
    }).then((res) => {
      if (res) {
        this.fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId);
      }
      return res;
    });
  }

  /**
   *  跳转到
   * @param {*} record 表格单条记录
   */
  @Bind()
  toReviewClarification(record) {
    const {
      history,
      location: { pathname = '', search = '' },
      match: { path = null },
    } = this.props;
    const {
      quotationHeaderId = 0,
      rfxHeaderId = 0,
      quotationEndFlag,
      supplierCompanyId,
      sourceCategory,
      rfHeaderId = 0,
      // rfxNum = '',
      // rfxTitle = '',
      // rfNum = '',
      // rfTitle = '',
      tenantId,
    } = record;
    const searchData = querystring.stringify({
      flag: '1',
      sourceFrom: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
      quotationHeaderId,
      supplierCompanyId,
      quotationEndFlag,
      sourceHeaderId: ['RFQ', 'RFA'].includes(sourceCategory) ? rfxHeaderId : rfHeaderId,
      backPath: `${pathname}?${search}`,
      tenantId,
      // title: ['RFQ', 'RFA'].includes(sourceCategory)
      //   ? `${rfxNum}-${rfxTitle}`
      //   : `${rfNum}-${rfTitle}`,
    });
    history.push({
      pathname: isPubPage(path, '/ssrc/supplier-quotation/review-clarification'),
      search: searchData,
    });
  }

  /**
   * 资格预审申请提交回调
   * @param {Object} params - 提交接口所需参数
   */
  @Bind()
  submitPretrialApplicationData(params) {
    const { organizationId, dispatch } = this.props;
    const { prequalGroupingFlag } = this.state;
    const { supplierCompanyId, supplierPrequalDTO, prequalGroupHeaderIds } = params || {};
    dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag ? 'submitSupplierPrequalHeader' : 'submitPretrialApplication'
      }`,
      payload: {
        organizationId,
        supplierCompanyId,
        supplierPrequalDTO,
        prequalGroupHeaderIds,
        customizeUnitCode: 'SSRC_SUPPLIER_PREQUAL.DATA',
      },
    }).then((res) => {
      if (res) {
        this.setState({ preApplyModalVisible: false });
        this.querySupplier();
      }
    });
  }

  /** 关闭模态框时清楚model中的数据 */
  @Bind()
  clearPretrialApplicationData() {
    this.setState({ preApplyModalVisible: false, prequalOnlyRead: false });
    this.props.dispatch({
      type: 'supplierQuotation/updateState',
      payload: {
        fetchPretrialApplicationData: {},
      },
    });
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible, rfxHeaderId) {
    const { dispatch, organizationId } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: 'supplierQuotation/fetchPretrialPanel',
        payload: {
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          organizationId,
        },
      });
    } else {
      dispatch({
        type: 'supplierQuotation/updateState',
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  // 展示资质要求细项
  /**
   * @param {?boolean} sectionFlag - 区分是否分标段
   */
  @Bind()
  handleShowQualRequirementsDetails(sectionFlag = false) {
    this.setState({
      qualRequirementDetailsVisible: true,
    });
    this.handleQueryIndicateData(sectionFlag);
  }

  /**
   * 查询资质要求细项-要素数据
   */
  @Bind()
  handleQueryIndicateData(sectionFlag) {
    const {
      dispatch,
      supplierQuotation: { fetchPretrialApplicationData = {} },
    } = this.props;
    // 判断是否分标段
    dispatch({
      type: `supplierQuotation/${
        sectionFlag ? 'fetchQuerySectionIndicateNewData' : 'fetchQueryIndicateData'
      }`,
      payload: {
        prequalHeaderId: sectionFlag
          ? fetchPretrialApplicationData.prequalGroupHeaderId
          : fetchPretrialApplicationData.prequalHeaderId,
      },
    });
  }

  // 关闭资质要求细项弹窗
  @Bind()
  handleCloseQulReqDetailModal() {
    this.setState({
      qualRequirementDetailsVisible: false,
    });
  }

  /**
   * 报价 判断寻源事项flag，0直接参与 1弹框确认
   * @param {Object} record - 当前操作行
   */
  @Bind()
  onBeforeParticipate(record = {}) {
    const oldTemplateShowFlag = record.systemVersion === 1 ? record.matterDetail : true;
    // 如果使用老寻源模版, matterDetail有值才会弹框
    if (record.showMatterFlag === 1 && oldTemplateShowFlag) {
      // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
      this.setState({
        currentOperateRow: record,
        readMatterDetailVisible: true,
      });
    } else {
      this.onParticipate(record);
    }
  }

  /**
   * 参与
   * @param {Object} record - 当前编辑行
   */
  @Bind()
  onParticipate(record = {}) {
    const {
      dispatch,
      match: { path = null },
      history,
      remote: { event } = {},
    } = this.props;

    /**
     * 标准参与逻辑
     * @param {*} onParticipateProps
     */
    const onParticipateEvent = () => {
      const {
        rfxHeaderId,
        supplierCompanyId,
        tenantId,
        subjectMatterRule = null,
        projectLineSectionId = null,
      } = record;
      const search = querystring.stringify({
        sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
        projectLineSectionId,
      });

      if (record.showMatterFlag === 1) {
        // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
        dispatch({
          type: 'supplierQuotation/fetchSaveConfirmMatter',
          payload: {
            tenantId,
            rfxHeaderId,
            supplierCompanyId,
          },
        }).then((res) => {
          if (res) {
            history.push({
              pathname: isPubPage(
                path,
                `/ssrc/supplier-quotation/detail/${rfxHeaderId}/${supplierCompanyId}/operation`
              ),
              search,
            });
          }
        });
      } else {
        history.push({
          pathname: isPubPage(
            path,
            `/ssrc/supplier-quotation/detail/${rfxHeaderId}/${supplierCompanyId}/operation`
          ),
          search,
        });
      }
    };

    /**
     * 需要传递的自定义事件属性
     * @protected 【中饮巴比】二开，请勿随意删除参数！！！
     */
    const onParticipateProps = {
      history,
      dispatch,
      path,
      record,
      onParticipateEvent,
    };
    if (event) {
      event.fireEvent('onParticipateClick', onParticipateProps);
    } else {
      onParticipateEvent();
    }
  }

  /**
   * 取消
   */
  @Bind()
  handleReadMatterCancel() {
    this.setState({
      readMatterDetailVisible: false,
    });
  }

  @Bind()
  signIn(record) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'supplierQuotation/signIn',
      payload: {
        quotationHeaderId: record.quotationHeaderId,
        organizationId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          [record.quotationHeaderId]: true,
        });
      }
    });
  }

  // 判断是否显示报价按钮
  quotationButtonVisible = ({ currentDate, quotationEndDate, status = null }) => {
    const CurrentDateTime = currentDate || moment();
    const curTime = moment(CurrentDateTime).format(DEFAULT_DATETIME_FORMAT);
    const quotationStatus = [
      'BIDDING',
      'QUOTATION',
      'ROUND_QUOTATION',
      'BARGAIN_QUOTATION',
      'UNPARTICIPATED',
      'REPLY',
    ].includes(status);

    const flag = (!quotationEndDate || quotationEndDate > curTime) && quotationStatus;
    return flag;
  };

  // 询价单编码
  renderRfxNum = (val, record) => {
    const { offLineFlag = 0, entryMethod, quotationHeaderStatus } = record || {};
    const offlineQuotation = offLineFlag === 1 || offLineFlag === '1' || entryMethod === 'OFFLINE';
    // const currentQuotation = this.quotationButtonVisible({
    //   currentDate,
    //   quotationEndDate,
    //   status: quotationHeaderStatus,
    // });
    const disabledLink = [
      'NOT_PARTICIPATED',
      'NOT_QUOTED',
      'QUOTED',
      'ROUND_QUOTATION',
      'BARGAINING',
      'BARGAINED',
      'BARGAINED_REPLIED',
    ].includes(quotationHeaderStatus);

    let offlineQuotationInfoNode = '';
    const offLineQuotationVisible = offlineQuotation;

    if (offLineQuotationVisible) {
      offlineQuotationInfoNode = (
        <Tooltip
          placement="topLeft"
          title={intl
            .get('ssrc.common.view.title.offlineQuotationWarningSuppliers')
            .d('已被采购方完成线下报价，如有疑问请联系采购员。')}
        >
          <img style={{ marginLeft: '4px' }} src={IconWarningCircle} alt="off-line-warning" />
        </Tooltip>
      );
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {disabledLink ? (
          val
        ) : (
          <a type="primary" onClick={() => this.onrfxNum(record)}>
            {val}
          </a>
        )}
        {offlineQuotationInfoNode}
      </span>
    );
  };

  render() {
    const {
      dispatch,
      Loading,
      organizationId,
      supplierQuotation,
      selectPreApplyLoading,
      selectPreApplyGroupLoading,
      savePreApplyLoading,
      savePreApplyGroupLoading,
      submitPreApplyLoading,
      submitPreApplyGroupLoading,
      fetchPretrialPanelLoading,
      queryIndicateDataLoading = false,
      saveConfirmMatterLoading = false,
      // customizeForm = () => {},
      supplierQuotation: {
        code,
        indicateDataSource = [],
        suppliereEntranceList = [],
        suppliereEntrancePagin = {},
        pretrialPanelList = [],
      },
      customizeTable,
    } = this.props;
    const {
      mergeType,
      preApplyModalVisible,
      supplierCompanyId,
      rfxHeaderId,
      prequalOnlyRead,
      prequalLineStatus = '',
      pretrialPanelVisible = false,
      qualRequirementDetailsVisible = false,
      readMatterDetailVisible = false,
      currentOperateRow = {},
      quotationStartDate,
      sourceProjectId,
      prequalGroupingFlag,
      prequalGroupHeaderId,
      originRfxNum,
    } = this.state;
    const pretrialApplicationModalProps = {
      onRef: this.handleRef,
      // customizeForm,
      rfxHeaderId,
      supplierCompanyId,
      sourceProjectId,
      prequalGroupHeaderId,
      organizationId,
      selectPreApplyLoading,
      savePreApplyLoading,
      submitPreApplyLoading,
      prequalLineStatus,
      quotationStartDate,
      visible: preApplyModalVisible,
      onlyRead: prequalOnlyRead,
      reviewMethodValues: code.reviewMethod,
      onSave: this.savePretrialApplicationData,
      onSubmit: this.submitPretrialApplicationData,
      // onClear: this.clearPretrialApplicationData,
      onClose: this.clearPretrialApplicationData,
      formData: supplierQuotation.fetchPretrialApplicationData,
      showPretrialPanel: this.showPretrialPanel,
      onShowQualRequirementsDetails: this.handleShowQualRequirementsDetails,
      fetchPretrialApplicationData: this.fetchPretrialApplicationData,
    };
    const pretrialApplicationGroupingModalProps = {
      mergeType,
      onRef: this.handleRef,
      // customizeForm,
      rfxHeaderId,
      supplierCompanyId,
      sourceProjectId,
      prequalGroupHeaderId,
      organizationId,
      selectPreApplyGroupLoading,
      savePreApplyGroupLoading,
      submitPreApplyGroupLoading,
      prequalLineStatus,
      quotationStartDate,
      visible: preApplyModalVisible,
      onlyRead: prequalOnlyRead,
      reviewMethodValues: code.reviewMethod,
      onSave: this.savePretrialApplicationData,
      onSubmit: this.submitPretrialApplicationData,
      // onClear: this.clearPretrialApplicationData,
      onClose: this.clearPretrialApplicationData,
      formData: supplierQuotation.fetchPretrialApplicationData,
      showPretrialPanel: this.showPretrialPanel,
      onShowQualRequirementsDetails: this.handleShowQualRequirementsDetails,
      fetchPretrialApplicationData: this.fetchPretrialApplicationData,
    };

    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.operation`).d('操作'),
        dataIndex: 'operation',
        fixed: 'left',
        width: 110,
        render: (text, record) => {
          const { currentDate, estimatedStartTime, supplierStatus, sourceCategory } = record || {};

          const emptyOperationFlag =
            (supplierStatus && supplierStatus === 'QUOTATION_INVALID') ||
            supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
            supplierStatus === 'ELIMINATE'; // 无效/符合性检查不通过
          if (emptyOperationFlag) {
            return '';
          }

          const wholeAbandonFlag =
            supplierStatus === 'QUOTATION_ABANDONED' || supplierStatus === 'ABANDONED'; // 报价-整单放弃标识
          const CurrentDateTime = currentDate || moment();
          const curTime = moment(CurrentDateTime).format(DEFAULT_DATETIME_FORMAT);

          // 整单放弃
          if (wholeAbandonFlag) {
            return (
              <a onClick={() => this.directQuotationQuery(record)}>
                {getQuotationName(sourceCategory === 'NEW_BID')}
                {intl.get('hzero.common.button.search').d('查询')}
              </a>
            );
          }

          if (record.fastBidding && record.operationMeaning === 'SIGN') {
            return record.signInFlag ||
              this.state[record.quotationHeaderId] ||
              !moment(currentDate).isAfter(estimatedStartTime) ? (
              ''
            ) : (
              <React.Fragment>
                <a onClick={() => this.signIn(record)}>
                  {intl.get(`ssrc.supplierQuotation.model.supQuo.signIn`).d('签到')}
                </a>
              </React.Fragment>
            );
          }
          if (
            [
              'BIDDING',
              'QUOTATION',
              'ROUND_QUOTATION',
              'BARGAIN_QUOTATION',
              'UNPARTICIPATED',
              'REPLY',
            ].includes(record.operationMeaning)
          ) {
            return (
              <React.Fragment>
                {record.quotationEndDate ? (
                  record.quotationEndDate > curTime ? (
                    <a onClick={() => this.onOperation(record)}>{text}</a>
                  ) : (
                    ''
                  )
                ) : (
                  <a onClick={() => this.onOperation(record)}>{text}</a>
                )}
              </React.Fragment>
            );
          } else if (record.operationMeaning === 'NOT_BIDDING') {
            return '';
          } else if (
            record.prequalLineStatus &&
            record.prequalLineStatus !== 'NO_APPROVED' &&
            record.prequalLineStatus !== 'APPROVED'
          ) {
            if (record.quotationStartDate < curTime) {
              return '';
            }

            if (record.prequalLineStatus === 'RETURN_PREQUAL') {
              return (
                <React.Fragment>
                  <Badge
                    status="error"
                    text={
                      <a onClick={() => this.openPretrialApplicationModal(record)}>
                        {intl
                          .get(`ssrc.supplierQuotation.model.supQuo.pretrialApplication`)
                          .d('预审申请')}
                      </a>
                    }
                  />
                </React.Fragment>
              );
            }
            return (
              <React.Fragment>
                <a onClick={() => this.openPretrialApplicationModal(record)}>
                  {intl
                    .get(`ssrc.supplierQuotation.model.supQuo.pretrialApplication`)
                    .d('预审申请')}
                </a>
              </React.Fragment>
            );
          } else if (record.operationMeaning === 'UNSTART') {
            return '';
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'quotationHeaderStatusMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxNum.`).d('RFX单号'),
        dataIndex: 'rfxNum',
        width: 170,
        fixed: 'left',
        render: this.renderRfxNum,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxTitle`).d('询价单标题'),
        dataIndex: 'rfxTitle',
        width: 200,
        fixed: 'left',
        render: (value) => {
          return value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          );
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswerList`).d('澄清答疑'),
        dataIndex: 'clearAnswerList',
        width: 90,
        fixed: 'left',
        render: (text, record) => {
          if (
            [
              'BARGAINING',
              'BIDDING',
              'QUOTATION',
              'UNSTART',
              'ROUND_QUOTATION',
              'PREQUAL',
              'BARGAIN_QUOTATION',
              'REPLY',
            ].includes(record.operationMeaning)
          ) {
            return (
              <Badge
                count={record.unreadClarifyCount}
                offset={[0, 10]}
                className={styles['badge-item']}
              >
                <a onClick={() => this.toReviewClarification(record)}>
                  {intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`).d('澄清答疑')}
                </a>
              </Badge>
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationStatus`).d('报价状态'),
        dataIndex: 'quotationShowStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationStartDate`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 180,
        render: (_, record) => {
          const { estimatedStartTime, quotationStartDate: currentQuotationStartDate } =
            record || {};
          if (estimatedStartTime) {
            return (
              <div className={styles.estimatedStartTime}>
                <div className="estimate">{dateTimeRender(estimatedStartTime)}</div>{' '}
                <Tag color="#CCCCCC">
                  {intl.get('ssrc.supplierQuotation.model.supQuo.estimate').d('预计')}
                </Tag>
              </div>
            );
          } else {
            return <span> {dateTimeRender(currentQuotationStartDate)}</span>;
          }
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationEndDate`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: (val) => {
          return dateTimeRender(val);
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
        dataIndex: 'companyName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.creater`).d('创建人'),
        dataIndex: 'realName',
        width: 150,
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    const filterProps = {
      originRfxNum,
      dispatch,
      code,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };
    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };
    const qualRequirementDetailsProps = {
      dataSource: indicateDataSource,
      loading: queryIndicateDataLoading,
      visible: qualRequirementDetailsVisible,
      onChange: this.handleQueryIndicateData,
      onCancel: this.handleCloseQulReqDetailModal,
    };
    const readMatterDetailProps = {
      currentOperateRow,
      modalType: 'RFX',
      loading: saveConfirmMatterLoading,
      matterDetail: currentOperateRow.matterDetail || '',
      onNext: this.onParticipate,
      handleReadMatterCancel: this.handleReadMatterCancel,
      readMatterDetailVisible,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`ssrc.supplierQuotation.view.message.title.supplierQuotation`)
            .d('供应商报价')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SSRC.SUPPLIER_QUOTATION_LIST.QUOTATION_TABLE' },
            <Table
              bordered
              rowKey="uniqueKey"
              loading={Loading}
              columns={columns}
              scroll={{ x: scrollWidth }}
              dataSource={suppliereEntranceList}
              pagination={suppliereEntrancePagin}
              onChange={(page) => this.handleSearch(page, {}, true)}
            />
          )}
          {!prequalGroupingFlag && preApplyModalVisible && (
            <PretrialApplicationModal {...pretrialApplicationModalProps} />
          )}
          {prequalGroupingFlag && preApplyModalVisible && (
            <PretrialApplicationGroupingModal {...pretrialApplicationGroupingModalProps} />
          )}
          <PretrialPanelModal {...pretrialPanelProps} />
          {qualRequirementDetailsVisible && (
            <QualRequirementDetailsModal {...qualRequirementDetailsProps} />
          )}
          {readMatterDetailVisible && <ReadMatterDetail {...readMatterDetailProps} />}
        </Content>
      </React.Fragment>
    );
  }
}

const hocSupplierquotation = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.SUPPLIER_QUOTATION_LIST.QUOTATION_TABLE', // 列表表格
    ],
  })(
    formatterCollections({
      code: ['ssrc.supplierQuotation', 'ssrc.common', 'sscux.ssrc'],
    })(
      connect(({ supplierQuotation, loading }) => ({
        supplierQuotation,
        Loading: loading.effects['supplierQuotation/fetchEntranceList'],
        selectPreApplyLoading: loading.effects['supplierQuotation/fetchPretrialApplication'],
        savePreApplyLoading: loading.effects['supplierQuotation/savePretrialApplication'],
        submitPreApplyLoading: loading.effects['supplierQuotation/submitPretrialApplication'],
        selectPreApplyGroupLoading: loading.effects['supplierQuotation/querySupplierPrequalHeader'],
        savePreApplyGroupLoading: loading.effects['supplierQuotation/saveSupplierPrequalHeader'],
        submitPreApplyGroupLoading:
          loading.effects['supplierQuotation/submitSupplierPrequalHeader'],
        fetchPretrialPanelLoading: loading.effects['supplierQuotation/fetchPretrialPanel'],
        queryIndicateDataLoading: loading.effects['supplierQuotation/fetchQueryIndicateData'],
        saveConfirmMatterLoading: loading.effects['supplierQuotation/fetchSaveConfirmMatter'],
        organizationId: getCurrentOrganizationId(),
      }))(
        remote(
          // 二开对应的标准改造
          {
            code: 'SSRC_SUPPLIERQUOTATION_LIST', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
            name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
          },
          // 默认Expose属性，当没有二开Expose时会走此逻辑
          {
            events: {
              /**
               * 标准参与逻辑
               * @param {*} onParticipateProps
               * @protected 此方法被【中饮巴比】项目二开，请勿修改方法名！！！
               */
              onParticipateClick(onParticipateProps = {}) {
                const { onParticipateEvent = noop } = onParticipateProps;
                onParticipateEvent();
              },
            },
          }
        )(Com)
      )
    )
  );
};

const HOCComponent = hocSupplierquotation(Supplierquotation);

export { Supplierquotation, hocSupplierquotation };
export default HOCComponent;
