/*
 * RoundQuotation - 多轮报价
 * @date: 2019-11-27
 * @author: YYM <yongming.yang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Row, Col, Spin, Icon } from 'hzero-ui';
import { isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import { getActiveTabKey } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';

import CPopover from '@/routes/components/CPopover';

import RoundQuotationAllTable from '@/routes/share/RoundQuotationAllTable/';
import BidRoundQuotationAllTable from '@/routes/share/RoundQuotationAllTable/BidIndex';
import SectionPanel from '@/routes/ssrc/InquiryHall/SectionPanel';
import OperateSectionPromptModal from '@/routes/ssrc/InquiryHall/SectionPanel/OperateSectionPromptModal';
import BatchEmptySelectedModal from '@/routes/ssrc/InquiryHall/SectionPanel/BatchEmptySelectedModal';
import common from '@/routes/ssrc/common.less';
import moneyBook from '@/assets/money-book.svg';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  BID,
  getDocumentTypeName,
  getCategoryCode,
  INQUIRY,
  getQuotationName,
  getSourceName,
} from '@/utils/globalVariable';
import EliminateInquiry from '../EliminateInquiry';
import NewQuotationModel from './newQuotationModel';

const FormItem = Form.Item;

class RoundQuotation extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(this.props.location.search.substr(1)) || {};
    this.state = {
      startNewQuotationVisible: false, // 发起新一轮报价modal
      eliminateVisible: false, // 淘汰单据
      chooseSection: false, // 是否选择标段
      routerParams, // 路由查询参数
      batchEmptySelectedModalVisible: false,
      currentButton: '',
      newRoundQuotationConfig: {}, // 发起新一轮报价的config
      endRoundQuotationConfig: {}, // 确定终轮报价的config
      sectionMessageVisible: false, // 校验信息弹框
      operateSectionPromptProps: {},
      chooseSectionBtnShowFlag: false, // 选择标段按钮是否显示标识
    };
    this.bidFlag = props.sourceKey === BID;
    this.sourceKey = props.sourceKey || INQUIRY;
    this.documentTypeName = getDocumentTypeName(this.bidFlag);
    this.quotationName = getQuotationName(this.bidFlag);
    this.categoryCode = getCategoryCode(this.bidFlag);
    this.sourceName = getSourceName(this.bidFlag);
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        header: {},
        quotationAllList: [],
      },
    });
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { routerParams } = this.state;
    const { projectLineSectionId } = routerParams;
    this.getUserConfig();
    if (projectLineSectionId) {
      return;
    }
    this.queryMain();
    this.fetchRemoteCuxData();
  }

  @Bind()
  getUserConfig() {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'sectionNewRoundQuotation',
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      const { configKey, configValue = '' } = res;
      if (configKey !== 'sectionNewRoundQuotation' || !configValue) {
        return;
      }
      this.setState({
        newRoundQuotationConfig: res,
      });
    });
    dispatch({
      type: `${modelName}/fetchRfxDetailLayout`,
      payload: {
        organizationId,
        configKey: 'sectionEndRoundQuotation',
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      const { configKey, configValue = '' } = res;
      if (configKey !== 'sectionEndRoundQuotation' || !configValue) {
        return;
      }
      this.setState({
        endRoundQuotationConfig: res,
      });
    });
  }

  @Bind()
  queryMain(update) {
    this.fetchRoundQuotationHeader();
    // this.fetchRoundQuotationList();
    if (update && !isEmpty(this.roundQuotationAllTable)) {
      this.roundQuotationAllTable.initData();
    }
  }

  /**
   * 二开需要在组件挂载时处理数据的方法
   * @protected
   */
  @Bind()
  fetchRemoteCuxData() {
    const {
      remote: remoteFunc,
      match: { params },
    } = this.props;
    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('handleFetchRemoteData', {
        that: this,
        params,
      });
    }
  }

  // share 更新所有页面数据
  initAllRoundQuotationTabData = () => {
    const { initData } = this.roundQuotationAllTable || {};
    if (initData) {
      initData();
    }
  };

  /**
   * 多轮报价 - 头信息查询
   */
  @Bind()
  async fetchRoundQuotationHeader() {
    const {
      match: { params, path = null },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
      remote: remoteFunc,
    } = this.props;
    const headerInfo = await dispatch({
      type: `${modelName}/fetchInquiryHeaderDetail`,
      payload: {
        rfxHeaderId: params.rfxId,
        organizationId,
        path,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL_ROUND_QUOTATION.HEADER_FROM`,
      },
    });

    if (remoteFunc?.event) {
      const eventProps = {
        headerInfo,
        current: this,
        bidFlag: this.bidFlag,
      };
      remoteFunc.event.fireEvent('afterQueryHeaderInfoFunc', eventProps);
    }
  }

  /**
   * 获取多轮报价所有供应商报价数据
   */
  fetchRoundQuotationList() {
    // const {
    //   dispatch,
    //   modelName = 'inquiryHall',
    //   organizationId,
    //   match: { params },
    // } = this.props;
    // dispatch({
    //   type: `${modelName}/fetchAllRoundQuotationData`,
    //   payload: {
    //     sourceFrom: 'RFX',
    //     sourceHeaderId: params.rfxId,
    //     organizationId,
    //   },
    // });
  }

  /**
   * 跳转到核价详情
   */
  directToCheckPrice() {
    const {
      inquiryHall: { header = {} },
      dispatch,
    } = this.props;
    const { routerParams } = this.state;

    const {
      roundQuotationRule,
      evaluateLeaderFlag,
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      sourcePage,
      projectLineSectionId,
    } = routerParams;
    let pathname;
    const activeTabKey = getActiveTabKey();
    if (
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      activeTabKey !== '/ssrc/inquiry-hall'
    ) {
      pathname = `${activeTabKey}/rfx-evaluation-proc-manage/${header.rfxHeaderId}`;
    } else {
      pathname = `${activeTabKey}/check-price/${header.rfxHeaderId}`;
    }
    const search = querystring.stringify({
      roundQuotationRule,
      evaluateLeaderFlag,
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      sourcePage,
      projectLineSectionId,
    });

    dispatch(
      routerRedux.push({
        pathname,
        search,
      })
    );
  }

  /**
   * 打开多轮报价弹窗
   */
  @Bind()
  handleCreateNewQuotationModal() {
    const { newRoundQuotationConfig } = this.state;
    const sectionFlag =
      this.sectionInfo.isSectionListEmpty && !this.sectionInfo.isSectionListEmpty();
    if (
      sectionFlag &&
      this.sectionInfo.getCheckedSectionList().length < 1 &&
      newRoundQuotationConfig.configValue !== 'hide'
    ) {
      this.setState({
        batchEmptySelectedModalVisible: true,
        currentButton: 'newRoundQuotation',
      });
    } else {
      this.setState({
        startNewQuotationVisible: true,
      });
    }
  }

  /**
   * 发起新一轮报价 确认
   * @memberof BidEvaluationProcManage
   */
  @Bind()
  onCreateNewQuottion() {
    const {
      dispatch,
      organizationId,
      remote: remoteFunc,
      modelName = 'inquiryHall',
      match: { params },
    } = this.props;
    this.renderNewQuotationModelRef.props.form.validateFields((err, values) => {
      if (!err) {
        const time = values.roundQuotationEndDate
          ? values.roundQuotationEndDate.format(DEFAULT_DATETIME_FORMAT)
          : undefined;

        const rendRoundQuotation = () => {
          dispatch({
            type: `${modelName}/createNewRoundQuotation`,
            payload: {
              ...values,
              roundQuotationEndDate: time,
              sourceFrom: 'RFX',
              sourceHeaderId: params.rfxId,
              organizationId,
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM`,
            },
          }).then((res) => {
            if (!res) {
              return;
            }
            notification.success();
            this.handleCreatedCallBack();
          });
        };

        if (
          this.sectionInfo.getCheckedSectionList &&
          this.sectionInfo.getCheckedSectionList().length
        ) {
          dispatch({
            type: `${modelName}/batchCreateNewRoundQuotation`,
            payload: {
              ...values,
              roundQuotationEndDate: time,
              sourceFrom: 'RFX',
              sourceHeaderId: params.rfxId,
              organizationId,
              projectLineSections: this.sectionInfo.getCheckedSectionList(),
              customizeUnitCode: `SSRC.${this.sourceKey}_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM`,
            },
          }).then((res) => {
            if (res && res.length) {
              this.setState({
                sectionMessageVisible: true,
                operateSectionPromptProps: {
                  visible: true,
                  handleCancel: () => {
                    this.setState({
                      sectionMessageVisible: false,
                    });
                  },
                  handleOk: () => {
                    this.onCreateNewQuottion(1);
                    this.setState({
                      sectionMessageVisible: false,
                    });
                  },
                  dataList: res,
                },
              });
            } else if (res) {
              if (this.sectionInfo?.resetItemChecked?.()) {
                this.sectionInfo.resetItemChecked();
              }
              if (this.sectionInfo.refreshSectionList) {
                this.sectionInfo.refreshSectionList();
              }
              notification.success();
              this.cancelNewQuotation();
              this.fetchRoundQuotationHeader();
              // this.fetchRoundQuotationList();
              this.initAllRoundQuotationTabData();
            }
          });
        } else if (remoteFunc?.event) {
          remoteFunc.event.fireEvent('rendRoundQuotation', {
            rendRoundQuotation,
            values,
            time,
            bidFlag: this.bidFlag,
            modelName,
            dispatch,
            organizationId,
            sourceHeaderId: params.rfxId,
            activeTabKey: getActiveTabKey(),
            handleCreatedCallBack: this.handleCreatedCallBack,
          });
        } else {
          rendRoundQuotation(values, time);
        }
      }
    });
  }

  /**
   * 不分标段-发起后成功回调
   * @protected: 此方法被永祥二开重写, 严禁删除
   */
  @Bind()
  handleCreatedCallBack() {
    if (this.sectionInfo.refreshSectionList) {
      const { refreshSectionList = null } = this.sectionInfo;
      if (refreshSectionList && typeof refreshSectionList === 'function') {
        refreshSectionList();
      }
    }

    this.cancelNewQuotation();
    this.fetchRoundQuotationHeader();
    // this.fetchRoundQuotationList();
  }

  /**
   * 发起新一轮报价 取消
   */
  @Bind()
  cancelNewQuotation() {
    const { form } = this.props;

    this.setState({
      startNewQuotationVisible: false,
    });
    form.resetFields();
  }

  /**
   * 淘汰单据
   */
  @Bind()
  handleEliminate() {
    this.setState({
      eliminateVisible: true,
    });
  }

  @Bind()
  cancelEliminate() {
    this.setState({
      eliminateVisible: false,
    });
  }

  // 淘汰完成后更新多轮报价数据
  @Bind()
  onUpdateData() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationAllList: [], // 多轮报价全部Tab报价明细
        quotationSupplierList: [], // 多轮报价供应商Tab列表信息
        quotationItemList: [], // 多轮报价物料Tab物料信息
      },
    });
    this.setState({
      eliminateVisible: false,
    });
    this.roundQuotationAllTable.initData();
  }

  renderNewQuotationModelRef = {};

  @Bind()
  renderNewQuotationModel() {
    const {
      createNewRoundQuotationLoading,
      batchCreateNewRoundQuotationLoading,
      remote: remoteFunc,
      customizeForm,
    } = this.props;
    const { startNewQuotationVisible = false } = this.state;

    const quotationProps = {
      customizeForm,
      createNewRoundQuotationLoading,
      batchCreateNewRoundQuotationLoading,
      remoteFunc,
      startNewQuotationVisible,
      onCreateNewQuottion: this.onCreateNewQuottion,
      cancelNewQuotation: this.cancelNewQuotation,
      quotationName: this.quotationName,
      sourceKey: this.sourceKey,
      onRef: (ref) => {
        this.renderNewQuotationModelRef = ref;
      },
    };

    return <NewQuotationModel {...quotationProps} />;
  }

  /**
   * 比较报价截止时间和当前时间
   */
  enableRoundQuotationOperate(date = '') {
    let result = true;
    if (!date) {
      return result;
    }

    const formatRoundQuotation = moment(date).format(DEFAULT_DATETIME_FORMAT);
    const now = moment().format(DEFAULT_DATETIME_FORMAT);
    result = formatRoundQuotation < now;
    return result;
  }

  @Bind()
  triggerChooseSection() {
    const { chooseSection } = this.state;
    this.setState(
      {
        chooseSection: !chooseSection,
      },
      () => {
        if (this.state.chooseSection) {
          this.sectionInfo.setState({
            openedFlag: 1,
          });
        } else {
          this.sectionInfo.setState({
            checkedList: [],
          });
        }
      }
    );
  }

  @Bind()
  async afterOpenSection(rfxHeaderId) {
    const { dispatch } = this.props;
    const { routerParams } = this.state;

    const search = querystring.stringify(routerParams);
    const activeTabKey = getActiveTabKey();
    await dispatch(
      routerRedux.replace({
        pathname: `${activeTabKey}/round-quotation/${rfxHeaderId}`,
        search,
      })
    );
    this.queryMain(true);
  }

  @Bind()
  batchOperateSectionsCancel() {
    this.setState({
      batchEmptySelectedModalVisible: false,
    });
  }

  @Bind()
  batchOperateSections() {
    if (!this.BatchEmptySectionRef) {
      return;
    }
    const { currentButton, newRoundQuotationConfig, endRoundQuotationConfig } = this.state;
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    if (currentButton === 'newRoundQuotation') {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        ...newRoundQuotationConfig,
        configKey: 'sectionNewRoundQuotation',
        configDesc: 'sectionNewRoundQuotation',
      }).then(() => {
        dispatch({
          type: `${modelName}/fetchRfxDetailLayout`,
          payload: {
            organizationId,
            configKey: 'sectionNewRoundQuotation',
          },
        }).then((res) => {
          if (!res) {
            return;
          }
          const { configKey, configValue = '' } = res;
          if (configKey !== 'sectionNewRoundQuotation' || !configValue) {
            return;
          }
          this.setState({
            newRoundQuotationConfig: res,
          });
        });
      });
      this.setState({
        startNewQuotationVisible: true,
      });
    } else {
      this.BatchEmptySectionRef.saveUserConfigBatch({
        ...endRoundQuotationConfig,
        configKey: 'sectionEndRoundQuotation',
        configDesc: 'sectionEndRoundQuotation',
      });
    }
    this.setState({
      batchEmptySelectedModalVisible: false,
    });
  }

  sectionInfo = {};

  @Bind()
  goback() {
    const {
      match: { params },
      location,
      remote: remoteFunc,
      inquiryHall: { header = {} } = {},
    } = this.props;
    const { routerParams } = this.state;
    const {
      roundQuotationRule,
      evaluateLeaderFlag,
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      sourceStatus,
      sourcePage,
      directForm,
      // showArrowFlag = 'show',
      projectLineSectionId,
    } = routerParams || {};

    let pathname;
    // if (showArrowFlag === 'hidden') return null; // 特殊场景隐藏标识
    const activeTabKey = getActiveTabKey();
    if (
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') &&
      activeTabKey !== '/ssrc/inquiry-hall'
    ) {
      pathname = `${activeTabKey}/rfx-evaluation-proc-manage/${params.rfxId}?evaluateLeaderFlag=${evaluateLeaderFlag}&cachTabKey=${cachTabKey}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&sourceStatus=${sourceStatus}&sourcePage=${sourcePage}&projectLineSectionId=${projectLineSectionId}`;
    } else if (directForm === 'RFX') {
      pathname = `${activeTabKey}/list`;
    } else {
      pathname = `${activeTabKey}/check-price/${params.rfxId}?projectLineSectionId=${projectLineSectionId}&directForm=RFX`;
    }

    const getBackPath = (param = {}) => {
      const { _pathname } = param;
      pathname = _pathname;
    };
    const eventProps = {
      location,
      _pathname: pathname,
      routerParams,
      sourceHeaderId: sourceHeaderId || params?.rfxId,
      activeTabKey,
      bidFlag: this.bidFlag,
      getBackPath,
      projectLineSectionId,
      header,
    };
    if (remoteFunc?.event) {
      remoteFunc.event.fireEvent('handleGetBackPath', eventProps);
    } else {
      getBackPath(eventProps);
    }

    return pathname;
  }

  /**
   * 淘汰
   * @protected: 此方法被二开重写, 严禁删除
   */
  @Bind()
  renderEliminate() {
    const {
      match,
      dispatch,
      inquiryHall: { header = {} },
    } = this.props;
    const { eliminateVisible = false } = this.state;

    // 核价中心弹窗model props
    const eliminateInquiryProps = {
      match,
      dispatch,
      eliminateVisible,
      cancelEliminate: this.cancelEliminate,
      onUpdateData: this.onUpdateData,
      header,
      priceTypeCode: header.priceTypeCode,
      bidFlag: this.bidFlag,
    };
    return eliminateVisible && <EliminateInquiry {...eliminateInquiryProps} />;
  }

  roundQuotationAllTable = {};

  /**
   * 判断选择标段是否显示回调方法
   */
  @Bind()
  judgeChooseSectionButton(showFlag) {
    this.setState({
      chooseSectionBtnShowFlag: showFlag,
    });
  }

  /**
   * 路特斯二开
   * @param {*} RoundQuotationAllTableProps props
   * @returns VNode RoundQuotationAllTable
   */
  renderRoundQuotationAllTable(RoundQuotationAllTableProps) {
    return this.bidFlag ? (
      <BidRoundQuotationAllTable {...RoundQuotationAllTableProps} />
    ) : (
      <RoundQuotationAllTable {...RoundQuotationAllTableProps} />
    );
  }

  @Bind()
  renderHeaderButtons() {
    const {
      createNewRoundQuotationLoading = false,
      inquiryHall: { header = {} },
      eliminateRoundQuotationLoading = false,
      remote: remoteFunc,
      dispatch,
      modelName = 'inquiryHall',
      match: { params },
      location,
      organizationId,
      history,
    } = this.props;
    const { chooseSection, routerParams = {}, chooseSectionBtnShowFlag } = this.state;
    const { roundQuotationEndDate = '' } = header;
    // judge new
    const enableRoundQuotationOperate = this.enableRoundQuotationOperate(roundQuotationEndDate);
    const { sectionList } = this.sectionInfo?.state || {};

    const buttons = [
      <Button
        type="default"
        disabled={!header.quotationRoundNumber || !enableRoundQuotationOperate}
        onClick={this.handleCreateNewQuotationModal}
        loading={createNewRoundQuotationLoading}
      >
        <div>
          <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
          <span
            title={
              this.bidFlag
                ? intl.get(`ssrc.bidHall.view.button.startNewBidRoundQuotation`).d('发起新一轮投标')
                : intl.get(`ssrc.bidHall.view.button.startNerRoundQuotation`).d('发起新一轮报价')
            }
            placement="bottom"
          >
            {this.bidFlag
              ? intl.get(`ssrc.bidHall.view.button.startNewBidRoundQuotation`).d('发起新一轮投标')
              : intl.get(`ssrc.bidHall.view.button.startNerRoundQuotation`).d('发起新一轮报价')}
          </span>
        </div>
      </Button>,
      remoteFunc ? (
        remoteFunc.render(
          'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE_RENDER_ELIMINATE_BTN',
          <Button
            type="default"
            disabled={!header.quotationRoundNumber || !enableRoundQuotationOperate}
            style={{
              display: header.openEliminateFlag ? 'block' : 'none',
            }}
            onClick={this.handleEliminate}
            loading={eliminateRoundQuotationLoading}
          >
            <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
            {intl.get(`ssrc.bidHall.view.button.eliminate`).d('淘汰')}
          </Button>,
          {
            header,
          }
        )
      ) : (
        <Button
          type="default"
          disabled={!header.quotationRoundNumber || !enableRoundQuotationOperate}
          style={{
            display: header.openEliminateFlag ? 'block' : 'none',
          }}
          onClick={this.handleEliminate}
          loading={eliminateRoundQuotationLoading}
        >
          <img src={moneyBook} style={{ marginRight: '4px' }} alt="icon" />
          {intl.get(`ssrc.bidHall.view.button.eliminate`).d('淘汰')}
        </Button>
      ),
      this.bidFlag
        ? remoteFunc
          ? remoteFunc.render('RENDER_CODE_HEADER_BUTTON_CUX', '', {
              header,
              organizationId,
              history,
              location,
              documentTypeName: this.documentTypeName,
              sourceName: this.sourceName,
            })
          : null
        : '',
      chooseSectionBtnShowFlag && !isEmpty(sectionList) ? (
        chooseSection ? (
          <Button
            type="default"
            onClick={this.triggerChooseSection}
            disabled={!enableRoundQuotationOperate}
          >
            <Icon type="close-circle-o" />
            {intl.get(`ssrc.inquiryHall.view.message.button.cancelChoose`).d('取消选择')}
          </Button>
        ) : (
          <Button
            type="default"
            onClick={this.triggerChooseSection}
            disabled={!enableRoundQuotationOperate}
          >
            <Icon type="check-square-o" />
            {intl.get(`ssrc.inquiryHall.view.message.button.chooseSection`).d('选择标段')}
          </Button>
        )
      ) : null,
    ].filter(Boolean);

    const remoteProps = {
      dispatch,
      modelName,
      location,
      routerParams,
      header,
      current: this,
      sourceHeaderId: params.rfxId,
      sourceFrom: 'RFX',
      bidFlag: this.bidFlag,
      activeTabKey: getActiveTabKey(),
      queryMain: this.queryMain,
      history,
    };

    if (remoteFunc) {
      return remoteFunc.process('SSRC_ROUNDQUOTATION_PROCESS_HEADER_BUTTONS', buttons, remoteProps);
    }
    return buttons;
  }

  render() {
    const {
      match,
      dispatch,
      inquiryHall,
      modelName,
      match: { params },
      // createNewRoundQuotationLoading = false,
      fetchInquiryHeaderDetailLoading = false,
      inquiryHall: { header = {} },
      // eliminateRoundQuotationLoading = false,
      customizeForm,
      organizationId,
      fetchAllLoading,
      customizeTabPane,
      fetchSupplierLoading,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      form: { getFieldDecorator },
    } = this.props;
    const {
      chooseSection,
      routerParams = {},
      batchEmptySelectedModalVisible,
      currentButton,
      sectionMessageVisible,
      operateSectionPromptProps,
      startNewQuotationVisible,
    } = this.state;
    const { currencyCodeMeaning = '', quotationRoundNumber, roundQuotationEndDate = '' } = header;
    // 多轮报价明细 props
    const RoundQuotationAllTableProps = {
      currencyCodeMeaning,
      round: quotationRoundNumber || 1,
      roundQuotationEndDate,
      match,
      dispatch,
      modelName,
      inquiryHall,
      organizationId,
      fetchAllLoading,
      fetchSupplierLoading,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      customizeTabPane,
      onRef: (ref) => {
        this.roundQuotationAllTable = ref;
      },
      header,
    };

    const SectionPanelProps = {
      isSection: routerParams.projectLineSectionId,
      isBatchMaintainSection: chooseSection,
      queryMain: this.queryMain,
      parentPage: {
        name: 'roundQuotation',
        queryParams: {
          rfxHeaderId: params.rfxId,
        },
      },
      onRef: (ref) => {
        this.sectionInfo = ref;
      },
      afterOpenSection: this.afterOpenSection,
      beforeOpenSection: () => {
        return true;
      },
      judgeChooseSectionButton: this.judgeChooseSectionButton,
    };

    const batchEmptySelectedModalProps = {
      visible: batchEmptySelectedModalVisible,
      parentPage: {
        name: currentButton !== 'sureRoundQuotation' ? 'newRoundQuotation' : 'sureRoundQuotation',
      },
      handleOk: this.batchOperateSections,
      handleCancel: this.batchOperateSectionsCancel,
      onRef: (ref) => {
        this.BatchEmptySectionRef = ref;
      },
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`ssrc.inquiryHall.view.message.title.roundQuotation`).d('多轮报价')}
          backPath={this.goback()}
        >
          {this.renderHeaderButtons()}
        </Header>

        <SectionPanel {...SectionPanelProps}>
          <Content
            className={classnames(
              common['page-content-custom'],
              common['zero-margin-bottom'],
              'ued-detail-wrapper'
            )}
          >
            <Spin spinning={fetchInquiryHeaderDetailLoading}>
              {customizeForm(
                {
                  code: `SSRC.${this.sourceKey}_HALL_ROUND_QUOTATION.HEADER_FROM`,
                  form: this.props.form,
                  dataSource: header,
                },
                <Form className="read-row-custom">
                  <Row gutter={48}>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.commonRFXNo.`, {
                            categoryCode: this.categoryCode,
                          })
                          .d('{categoryCode}单号')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('rfxNum', {
                          initialValue: header.rfxNum,
                        })(<span>{header.rfxNum}</span>)}
                      </FormItem>
                    </Col>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, {
                            documentTypeName: this.documentTypeName,
                          })
                          .d('{documentTypeName}标题')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('rfxTitle', {
                          initialValue: header.rfxTitle,
                        })(<CPopover content={header.rfxTitle}>{header.rfxTitle}</CPopover>)}
                      </FormItem>
                    </Col>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.commonCurQuoRound`, {
                            quotationName: this.quotationName,
                          })
                          .d('当前{quotationName}轮次')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('quotationRoundNumber', {
                          initialValue: header.quotationRoundNumber,
                        })(<span>{header.quotationRoundNumber}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={48}>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.quoController.model.quoController.roundQuotationEndDate`)
                          .d('当前轮次截止时间')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('roundQuotationEndDate', {
                          initialValue: header.roundQuotationEndDate,
                        })(<span>{dateTimeRender(header.roundQuotationEndDate)}</span>)}
                      </FormItem>
                    </Col>
                    <Col {...FORM_COL_3_LAYOUT}>
                      <FormItem
                        label={intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.docStatus`)
                          .d('单据状态')}
                        {...SEARCH_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('rfxStatusMeaning', {
                          initialValue: header.rfxStatusMeaning,
                        })(<span>{header.rfxStatusMeaning}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    {header.startingReason ? (
                      <Row gutter={48}>
                        <Col span={24}>
                          <FormItem
                            label={intl
                              .get('ssrc.supplierQuotation.model.supQuo.startingReasonCurRound')
                              .d('发起本轮报价原因')}
                            {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                          >
                            {getFieldDecorator('startingReason', {
                              initialValue: header.startingReason,
                            })(<span>{header.startingReason}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    ) : null}
                  </Row>
                </Form>
              )}
              {this.renderRoundQuotationAllTable(RoundQuotationAllTableProps)}
            </Spin>
          </Content>
        </SectionPanel>
        {startNewQuotationVisible && this.renderNewQuotationModel()}
        {batchEmptySelectedModalVisible && (
          <BatchEmptySelectedModal {...batchEmptySelectedModalProps} />
        )}
        {/* 分标段校验信息提醒modal */}
        {sectionMessageVisible && <OperateSectionPromptModal {...operateSectionPromptProps} />}
        {this.renderEliminate()}
      </Fragment>
    );
  }
}

const HOCComponent = (Comp = null) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.HEADER_FROM',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
      ],
    })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        createNewRoundQuotationLoading: loading.effects['inquiryHall/createNewRoundQuotation'],
        sureRoundQuotationEndLoading: loading.effects['inquiryHall/sureRoundQuotationEnd'],
        fetchInquiryHeaderDetailLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
        eliminateRoundQuotationLoading: loading.effects['inquiryHall/createNewRoundQuotation'],
        fetchAllLoading: loading.effects['inquiryHall/fetchAllRoundQuotationList'],
        fetchSupplierLoading: loading.effects['inquiryHall/fetchSupplierRoundQuotationList'],
        fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLineRoundQuotationList'],
        fetchScoreDetailLoading: loading.effects['inquiryHall/fetchScoreDetail'],
        batchCreateNewRoundQuotationLoading:
          loading.effects['inquiryHall/batchCreateNewRoundQuotation'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: [
            'ssrc.bidHall',
            'ssrc.inquiryHall',
            'ssrc.quoController',
            'ssrc.supplierQuotation',
            'ssrc.common',
          ],
        })(
          remote(
            {
              code: 'SSRC_ROUNDQUOTATION',
              name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
            },
            {
              events: {
                // 多轮报价单标段发起
                rendRoundQuotation(eventProps) {
                  const { rendRoundQuotation } = eventProps;
                  rendRoundQuotation();
                },
                handleGetBackPath(props = {}) {
                  const { getBackPath = noop, ...otherParams } = props || {};
                  getBackPath(otherParams);
                },
                // 处理挂载组件时需要用到的二开数据
                handleFetchRemoteData() {},
              },
            }
          )(Comp)
        )
      )
    )
  );
};

export default HOCComponent(RoundQuotation);
export { RoundQuotation, HOCComponent };
