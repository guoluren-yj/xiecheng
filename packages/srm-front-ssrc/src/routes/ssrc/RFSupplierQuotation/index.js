/**
 * Recommend - 供应商回复-列表
 * @date: 2021-7-16
 * @author: lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component, Fragment, createRef } from 'react';
import querystring from 'querystring';
import { connect } from 'dva';
import { throttle, isEmpty, isArray, noop } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { DataSet, Tabs, Button, Modal, Icon, Dropdown, Menu } from 'choerodon-ui/pro';
import { Badge, Tooltip, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { getActiveTabKey, openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
  getCurrentLanguage,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import {
  BID,
  getCategoryCode,
  getDocumentTypeName,
  getSourceCategoryName,
  // getQuotationName,
} from '@/utils/globalVariable';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import PretrialApplicationModal from '@/routes/ssrc/SupplierQuotation/PretrialApplicationModal';
import BidPretrialApplicationModal from '@/routes/ssrc/SupplierQuotation/BidPretrialApplicationModal';
import { getTableFixSelfAdaptStyle, isJSON, isText } from '@/utils/utils';
import useBidAnnouncementQueryModal from '@/routes/ssrc/components/BidAnnouncementQuery';
import {
  signIn,
  fetchRFContentConfig,
  fetchRFXCount,
  fetchRFCount,
  fetchQRCount,
} from '@/services/inquiryHallService';
import {
  saveConfirmMatter,
  fetchNewQuotationConfigSheet,
  quotationInsertExpens,
  quotationBatchInsertExpens,
} from '@/services/supplierQutationService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import ReadMatterDetail from '@/routes/components/MatterDetail/ReadMatterDetail';
import QualRequirementDetailsModal from '@/routes/ssrc/SupplierQuotation/QualRequirementDetailsModal';
import PretrialApplicationGroupingModal, {
  BidPretrialApplicationGroupingModal,
} from '@/routes/ssrc/SupplierQuotation/PretrialApplicationGroupingModal';
import { validateQRModal } from '@/routes/components/ConfirmModal';
import {
  supplierBiddingHallSignIn,
  // fetchSupplierBiddingHallConfig,
} from '@/services/biddingHallService';
import {
  qrBatchQuotationValidate,
  qrBatchQuotationSubmit,
  qrBatchAbandon,
} from '@/services/quickReplyService';

import IconWarningCircle from '@/assets/icon-warning-circle.svg';

import { queryEnableDoubleUnit } from '@/services/commonService';
import moment from 'moment';
import { renderStatusTag } from './util';

import { TableDS } from './RF/RFDS';
import { RFQTableDS } from './RFX/RFQDS';
import { quickReplyTableDS } from './QuickReply/store/mainDS';
import style from './index.less';
import AllContainer from './RF/AllContainer';
import RFXAllContainer from './RFX/RFXAllContainer';
import RFXCompletedContainer from './RFX/RFXCompletedContainer';
import RFXOnGoingContainer from './RFX/RFXOnGoingContainer';
import RFXParticipatoryContainer from './RFX/RFXParticipatoryContainer';
import PendingContainer from './RF/PendingContainer';
import CompletedContainer from './RF/CompletedContainer';
import ParticipatoryContainer from './RF/ParticipatoryContainer';
import QuickReplyTable from './QuickReply/index';
import {
  QRActivityMap,
  QRListCodes,
  QRListSearchBarCodes,
  QRQuotationHeaderCodes,
  QRQuotationHistoryCode,
  QRLadderHeaderCode,
  QRLadderLineCodes,
  QRQuotationModalButtonCode,
  QRHeaderButtonCode,
} from './QuickReply/store/enum';

const initStatus = {
  activeKey: 'onGoing',
  useRF: false,
};

const { TabPane, TabGroup } = Tabs;

const RFList = ['pending', 'participatory', 'completed', 'all'];

const QRList = ['processing', 'processed', 'qrAll'];

const organizationId = getCurrentOrganizationId();

const { openBidAnnouncementQueryModal } = useBidAnnouncementQueryModal();

class Supplierquotation extends Component {
  constructor(props) {
    super(props);

    this.rfCountNum = 0;
    this.rfxCountNum = 0;
    this.qrCountNum = 0;
    this.quickReplyRef = createRef();
    this.qrCountTimer = null;

    this.state = {
      prequalGroupingFlag: false, // 资格预审分组flag
      preApplyModalVisible: false,
      activeKey:
        getActiveTabKey() !== '/ssrc/bid-supplier-reply'
          ? initStatus.activeKey
          : [...RFList, ...QRList].includes(initStatus.activeKey)
          ? 'onGoing'
          : initStatus.activeKey,
      useRF: initStatus.useRF,
      useRFContent: 'ALL',
      dotShow: true,
      RFQNum: {},
      RFNum: {},
      currentOperateRow: null,
      clarifyAnswer: null,
      tab: null,
      serviceChargeFlag: false,
      biddingHallFlag: 0, // 竞价大厅标识
      doubleUnitFlag: false, // 双单位标识
      pageLoading: false, // 页面loading
      searchParams: {},
    };
    this.bidFlag = props.sourceKey === BID;
    this.custKey = this.bidFlag ? 'BID_' : '';
    this.sourceCategoryName = getSourceCategoryName(this.bidFlag);
    this.bidRouter = this.bidFlag ? 'bid-' : '';
    this.activeTabKey = getActiveTabKey();
    this.documentTypeName = getDocumentTypeName(this.bidFlag);
  }

  searchAllComponent;

  searchRfxAllComponent;

  rfxCountRef;

  clearQueryCountNum = () => {
    this.qrCountNum = 0;
    this.rfCountNum = 0;
    this.rfxCountNum = 0;
  };

  componentDidMount() {
    this.dealRouterParams(true);
    this.queryRFCount();
    // this.queryQRCount();
    this.queryRF();
    this.fetchServiceChargeConfig();
    // this.fetchSheetConfig();
    this.getDoubleUnitFlag();

    // this.rfxCountRef = setTimeout(this.queryRFXCount, 2000); // 需要等带筛选器渲染后，拿到数据查询count
    this.fetchCurrentTabGroupCount();
  }

  getRfFlag = () => {
    const { activeKey } = this.state;
    const flag =
      ['pending', 'participatory', 'completed', 'all'].includes(activeKey) && !this.bidFlag;

    return flag;
  };

  getRfxFlag = () => {
    const { activeKey } = this.state;
    const flag = ['notParticipate', 'onGoing', 'finished', 'rfxAll'].includes(activeKey);

    return flag;
  };

  getQRFlag = () => {
    const { activeKey } = this.state;
    const flag = ['processing', 'processed', 'qrAll'].includes(activeKey) && !this.bidFlag;

    return flag;
  };

  delayQueryRFXCount = () => {
    if (this.getRfxFlag()) {
      this.rfxCountRef = setTimeout(this.queryRFXCount, 2000); // 需要等带筛选器渲染后，拿到数据查询count
    }
  };

  fetchCurrentTabGroupCount = () => {
    this.delayQueryRFXCount();

    if (this.getQRFlag()) {
      this.queryQRTableAndCount();
    }
  };

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => {
    if (this.rfxCountRef) {
      clearTimeout(this.rfxCountRef);
    }
    if (this.qrCountTimer) {
      clearTimeout(this.qrCountTimer);
    }
  };

  // 隐藏快速回复全部内容
  getHiddenQuickReplayContent = () => {
    const { remoteHoc } = this.props;
    let flag = false;
    flag = remoteHoc
      ? remoteHoc.process('SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_PROCESS_HIDDEN_QR_COTENT', flag, {
          that: this,
        })
      : flag;

    return flag;
  };

  getSnapshotBeforeUpdate(prevProps) {
    const {
      location: { search },
    } = this.props;
    const { tab, dashboardStatus, rfNum, clarifyAnswer, rfxNum } = querystring.parse(
      search.substr(1)
    );
    const {
      tab: preTab,
      dashboardStatus: predashboardStatus,
      rfNum: preRfNum,
      clarifyAnswer: preClarifyAnswer,
      rfxNum: preRfxNum,
    } = querystring.parse(prevProps?.location?.search.substr(1));
    if (tab || dashboardStatus || rfNum || clarifyAnswer) {
      return (
        tab !== preTab ||
        dashboardStatus !== predashboardStatus ||
        rfNum !== preRfNum ||
        clarifyAnswer !== preClarifyAnswer ||
        rfxNum !== preRfxNum
      );
    }
    return false;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.dealRouterParams();
    }
  }

  @Bind()
  getDoubleUnitFlag() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  @Bind()
  dealRouterParams(mountFlag) {
    const { dashboardStatus, tab, rfNum, rfxNum, clarifyAnswer = '' } = querystring.parse(
      this.props.location.search.substr(1)
    );
    if (tab === 'all' && this.searchAllComponent && clarifyAnswer) {
      if (
        this.searchAllComponent?.state?.displayFields.filter((ele) => ele.name === 'clarifyAnswer')
          .length === 0
      ) {
        notification.warning({
          message: intl
            .get(`ssrc.common.view.message.filterMsg`)
            .d('需联系采购方将澄清未读配置为筛选条件后才能进行正常筛选'),
        });
      }
      this.searchAllComponent.setField('clarifyAnswer', clarifyAnswer);
    }
    if (tab === 'rfxAll' && this.searchRfxAllComponent && clarifyAnswer) {
      if (
        this.searchRfxAllComponent?.state?.displayFields.filter(
          (ele) => ele.name === 'clarifyAnswer'
        ).length === 0
      ) {
        notification.warning({
          message: intl
            .get(`ssrc.common.view.message.filterMsg`)
            .d('需联系采购方将澄清未读配置为筛选条件后才能进行正常筛选'),
        });
      }
      this.searchRfxAllComponent.setField('clarifyAnswer', clarifyAnswer);
    }
    const query = () => {
      let newTab = rfNum ? 'all' : tab;
      // search 如果带值rfxNum, 默认去全部tab下查询
      if (rfxNum) {
        newTab = 'rfxAll';
      }

      this.setState(
        {
          clarifyAnswer,
          tab,
          activeKey: newTab,
          searchParams: {
            multiRfxNumOrTitle: rfxNum,
          },
        },
        () => {
          if (dashboardStatus) {
            this.setQueryParams('dashboardStatus', dashboardStatus, mountFlag);
          }
          // if (rfxNum) {
          //   this.setQueryParams('rfxNum', rfxNum, mountFlag);
          //   this.setQueryParams('customMergeFilterField', 'rfxNum,rfxTitle', mountFlag);
          // }
        }
      );
    };
    if (mountFlag && !tab) {
      this.setState(
        {
          tab: rfxNum ? 'rfxAll' : tab,
          clarifyAnswer,
        },
        () => {
          if (rfxNum) {
            this.setState({
              activeKey: 'rfxAll',
              searchParams: {
                multiRfxNumOrTitle: rfxNum,
              },
            });
          }
          this.dealCust();
        }
      );
    } else {
      query();
    }
  }

  // 查询配置 竞价大厅已经由白切黑
  // fetchSheetConfig = () => {
  //   // this.fetchSupplierBiddingHall();  // todo
  // };

  // // 供应商-是否开始竞价大厅
  // fetchSupplierBiddingHall = async () => {
  //   const param = {
  //     organizationId,
  //     configTableCode: 'ssrc_rfa_tenant_config',
  //   };

  //   let result = null;
  //   try {
  //     result = await fetchSupplierBiddingHallConfig(param);
  //     if (result !== 1 && result !== 0) {
  //       result = getResponse(result);
  //       return '-1';
  //     }

  //     if (result === 1) {
  //       this.setState({
  //         biddingHallFlag: 1,
  //       });
  //     }
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet(record = {}) {
    let newQuotationFlag = false;
    const rfxHeaderId = record.get('rfxHeaderId');
    if (!rfxHeaderId) {
      return;
    }

    const param = {
      organizationId,
      rfxHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      if (result !== 1 && result !== 0) {
        result = getResponse(result);
        return '-1';
      }

      if (result === 1) {
        newQuotationFlag = true;
      }
    } catch (e) {
      throw e;
    }
    return newQuotationFlag;
  }

  @Bind()
  dealCust() {
    const tabsCode = this.bidFlag
      ? 'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.TABS'
      : 'SSRC.SUPPLIER_REPLY.RF_LIST.TABS';
    const activeConfig = this.props.custConfig[tabsCode]?.fields?.filter(
      (item) => item.defaultActive === 1
    );
    if (activeConfig?.length) {
      this.setState({
        activeKey: activeConfig[0].fieldCode,
      });
    }
  }

  async queryRFCount() {
    if (this.rfCountNum !== 0 || this.bidFlag) {
      return;
    }

    const res = getResponse(await fetchRFCount());
    this.rfCountNum = 1;
    if (res) {
      this.setState({
        RFNum: {
          pending: res.unParticipate,
          participatory: res.onGoing,
          completed: res.finished,
          all: res.total,
          participatoryAttention: res.processing,
          pendingAttention: res.unResponse,
        },
      });
    }
  }

  queryRFXCount = async () => {
    const searchBarParams = this.searchRfxAllComponent?.getQueryParameter() || {}; // 筛选器数据

    if (this.rfxCountNum !== 0) {
      return;
    }

    const res = getResponse(
      await fetchRFXCount({
        secondarySourceCategory: this.bidFlag ? 'NEW_BID' : '',
        ...searchBarParams,
      })
    );
    this.rfxCountNum = 1;
    if (res) {
      this.setState({
        RFQNum: {
          notParticipate: res.unParticipate,
          onGoing: res.onGoing,
          finished: res.finished,
          rfxAll: res.total,
          onGoingAttention: res.processing,
          notParticipateAttention: res.unResponse,
        },
      });
    }
  };

  /**
   * 快速回复tab数目
   */
  @Bind()
  async queryQRCount(options = {}) {
    const { qrDsMap } = this.props;
    const { data = {} } = options || {};
    if (this.qrCountNum !== 0) {
      return;
    }

    if (!this.bidFlag) {
      const res = getResponse(await fetchQRCount(data));
      this.qrCountNum = 1;
      if (res) {
        Object.keys(res).forEach((key) => {
          let type = key;
          if (key === 'ALL') type = 'QRALL';
          qrDsMap[type].setState('totalCount', Number(res[key]) > 99 ? '99+' : res[key] || 0);
        });
      }
    }
  }

  /**
   * 计算Tab的数量
   * @param {*} value 表格的计算出来的数量
   * @param {*} initValue 初始化查出来的数量
   * @returns BooLean
   */
  @Bind()
  judgeValue(value, initValue) {
    if (value === 0) {
      return 0;
    } else {
      return value || initValue || 0;
    }
  }

  async queryRF() {
    const res = await fetchRFContentConfig();
    if (!isJSON(res)) {
      if (res) {
        this.setState({
          useRF: true,
        });
        initStatus.useRF = true;
        if (res === 'RFI') {
          this.setState({
            useRFContent: 'RFI',
          });
        } else if (res === 'RFP') {
          this.setState({
            useRFContent: 'RFP',
          });
        } else {
          this.setState({
            useRFContent: 'ALL',
          });
        }
      } else {
        this.setState({
          useRF: false,
        });
        initStatus.useRFContent = false;
      }
    } else {
      getResponse(JSON.parse(res));
    }
  }

  // 查询配置表--是否展示标书下载节点
  fetchServiceChargeConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        this.setState({
          // 即接口返回空就展示标书下载节点，有值则不显示
          serviceChargeFlag: true,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 一旦进行前端计算，重置后端返回数据，采用前端计算数据
   * @param {*} type RF/RFX
   * @param {*} tab 页签数量
   * @param {*} attentionTab 页签关注数量
   */
  @Bind()
  resetState(type, tab, attentionTab) {
    if (this.state.RFNum[tab] && type === 'RF') {
      this.setState({
        RFNum: {
          ...this.state.RFNum,
          [tab]: '',
          [attentionTab]: '',
        },
      });
    } else if (this.state.RFQNum[tab] && type === 'RFQ') {
      this.setState({
        RFQNum: {
          ...this.state.RFQNum,
          [tab]: '',
          [attentionTab]: '',
        },
      });
    }
  }

  // 更多按钮
  renderMoreAction = (moreList, record) => {
    const { remoteHoc } = this.props;
    const { activeKey } = this.state;
    const menu = (
      <Menu>
        {moreList?.map((item) => (
          <Menu.Item>
            {item.operation === 'CLARIFY' ? (
              remoteHoc ? (
                remoteHoc.render(
                  'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_CLARIFY_BUTTON',
                  <Badge
                    count={record.get('unreadClarifyCount')}
                    size="small"
                    style={{ top: '-0.04rem' }}
                  >
                    <Button funcType="link" onClick={() => this.toReviewClarification(record)}>
                      {intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`).d('澄清答疑')}
                    </Button>
                  </Badge>,
                  {
                    bidFlag: this.bidFlag,
                    record,
                    that: this,
                  }
                )
              ) : (
                <Badge
                  count={record.get('unreadClarifyCount')}
                  size="small"
                  style={{ top: '-0.04rem' }}
                >
                  <Button funcType="link" onClick={() => this.toReviewClarification(record)}>
                    {intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`).d('澄清答疑')}
                  </Button>
                </Badge>
              )
            ) : remoteHoc ? (
              remoteHoc.render(
                'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_MAIN_OPERATION_NODE',
                <Button
                  funcType="link"
                  onClick={async () => {
                    if (!RFList.includes(activeKey)) {
                      await this.handleRFXOperation(record, item.operation);
                    } else {
                      await this.handleOperation(record, item.operation);
                    }
                  }}
                >
                  {item.operationMeaning}
                </Button>,
                {
                  record,
                  bidFlag: this.bidFlag,
                  operationItem: item,
                  handleChangeTab: this.handleChange,
                }
              )
            ) : (
              <Button
                funcType="link"
                onClick={() =>
                  !RFList.includes(activeKey)
                    ? this.handleRFXOperation(record, item.operation)
                    : this.handleOperation(record, item.operation)
                }
              >
                {item.operationMeaning}
              </Button>
            )}
          </Menu.Item>
        ))}
      </Menu>
    );
    return menu;
  };

  @Bind()
  renderOperat({ record }) {
    const { remoteHoc } = this.props;
    const { activeKey } = this.state;
    // const { roundFlag, quotationRoundNumber } = record.get(['roundFlag', 'quotationRoundNumber']);
    if (record.get('mainOperations')?.length <= 3) {
      return (
        <div className="actions">
          {record.get('mainOperations')?.length
            ? record.get('mainOperations').map((item) => {
                return (
                  <div className="action">
                    {item.operation === 'CLARIFY' ? (
                      remoteHoc ? (
                        remoteHoc.render(
                          'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_CLARIFY_BUTTON',
                          <Badge count={record.get('unreadClarifyCount')} size="small">
                            <Button
                              funcType="link"
                              onClick={() => this.toReviewClarification(record)}
                            >
                              {intl
                                .get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`)
                                .d('澄清答疑')}
                            </Button>
                          </Badge>,
                          {
                            bidFlag: this.bidFlag,
                            record,
                            that: this,
                          }
                        )
                      ) : (
                        <Badge count={record.get('unreadClarifyCount')} size="small">
                          <Button
                            funcType="link"
                            onClick={() => this.toReviewClarification(record)}
                          >
                            {intl
                              .get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`)
                              .d('澄清答疑')}
                          </Button>
                        </Badge>
                      )
                    ) : remoteHoc ? (
                      remoteHoc.render(
                        'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_MAIN_OPERATION_NODE',
                        <Button
                          funcType="link"
                          onClick={async () => {
                            if (!RFList.includes(activeKey)) {
                              await this.handleRFXOperation(record, item.operation);
                            } else {
                              await this.handleOperation(record, item.operation);
                            }
                          }}
                        >
                          {item.operationMeaning}
                        </Button>,
                        {
                          record,
                          bidFlag: this.bidFlag,
                          operationItem: item,
                          handleChangeTab: this.handleChange,
                        }
                      )
                    ) : (
                      <Button
                        funcType="link"
                        onClick={() =>
                          !RFList.includes(activeKey)
                            ? this.handleRFXOperation(record, item.operation)
                            : this.handleOperation(record, item.operation)
                        }
                      >
                        {item.operationMeaning}
                      </Button>
                    )}
                  </div>
                );
              })
            : null}
        </div>
      );
    }

    return (
      <div className="actions">
        {record.get('mainOperations')?.length
          ? record
              .get('mainOperations')
              ?.slice(0, 2)
              ?.map((item) => {
                return (
                  <div className="action">
                    {item.operation === 'CLARIFY' ? (
                      remoteHoc ? (
                        remoteHoc.render(
                          'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_CLARIFY_BUTTON',
                          <Badge count={record.get('unreadClarifyCount')} size="small">
                            <Button
                              funcType="link"
                              onClick={() => this.toReviewClarification(record)}
                            >
                              {intl
                                .get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`)
                                .d('澄清答疑')}
                            </Button>
                          </Badge>,
                          {
                            bidFlag: this.bidFlag,
                            record,
                            that: this,
                          }
                        )
                      ) : (
                        <Badge count={record.get('unreadClarifyCount')} size="small">
                          <Button
                            funcType="link"
                            onClick={() => this.toReviewClarification(record)}
                          >
                            {intl
                              .get(`ssrc.supplierQuotation.model.supQuo.clearAnswer`)
                              .d('澄清答疑')}
                          </Button>
                        </Badge>
                      )
                    ) : remoteHoc ? (
                      remoteHoc.render(
                        'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_RENDER_MAIN_OPERATION_NODE',
                        <Button
                          funcType="link"
                          onClick={async () => {
                            if (!RFList.includes(activeKey)) {
                              await this.handleRFXOperation(record, item.operation);
                            } else {
                              await this.handleOperation(record, item.operation);
                            }
                          }}
                        >
                          {item.operationMeaning}
                        </Button>,
                        {
                          record,
                          bidFlag: this.bidFlag,
                          operationItem: item,
                          handleChangeTab: this.handleChange,
                        }
                      )
                    ) : (
                      <Button
                        funcType="link"
                        onClick={() =>
                          !RFList.includes(activeKey)
                            ? this.handleRFXOperation(record, item.operation)
                            : this.handleOperation(record, item.operation)
                        }
                      >
                        {item.operationMeaning}
                      </Button>
                    )}
                  </div>
                );
              })
          : null}
        <Dropdown
          overlay={this.renderMoreAction(record.get('mainOperations')?.slice(2), record)}
          trigger={['click', 'hover']}
          placement="bottomLeft"
        >
          <a style={{ marginTop: '-1.5px' }}>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
            <Icon type="expand_more" style={{ marginTop: '-1px' }} />
          </a>
        </Dropdown>
      </div>
    );
  }

  /**
   * 询价打开报价查询
   * cux
   * */
  @Throttle(1200)
  @Bind()
  async rfxOpenTabToQuotationQuery(record = {}) {
    const { history } = this.props;
    const { rfxHeaderId, supplierCompanyId, quotationHeaderId } = record.get([
      'rfxHeaderId',
      'supplierCompanyId',
      'quotationHeaderId',
    ]);
    if (!rfxHeaderId || !supplierCompanyId || !quotationHeaderId) {
      return;
    }

    const newQuotationFlag = await this.newQuotationConfigSheet(record);
    if (newQuotationFlag === '-1') {
      return;
    }
    const title = this.bidFlag
      ? 'srm.common.tab.title.bidDetail'
      : 'srm.common.tab.title.quotationDetail';
    const action = this.bidFlag
      ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
      : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

    const CURRENTACTIVETABKEY = getActiveTabKey();
    if (newQuotationFlag) {
      const searchObj = {
        rfxHeaderId,
        // quotationHeaderId,
        // noBackFlag: 1, // openTab 不需要返回
        pageType: 'SUPPLIER_DETAIL_QUERY',
      };

      history.push({
        pathname: `${CURRENTACTIVETABKEY}/query/${quotationHeaderId}`,
        search: querystring.stringify(searchObj),
      });
      // openTab({
      //   key: currentPath,
      //   path: currentPath,
      //   title,
      //   action,
      //   search: querystring.stringify(searchObj),
      //   closable: true,
      // });
      return;
    }

    const OldQueryQuotationPath = `${CURRENTACTIVETABKEY}/query-quotation/detail/${rfxHeaderId}/${supplierCompanyId}`;

    openTab({
      key: OldQueryQuotationPath,
      title,
      action,
      path: OldQueryQuotationPath,
      search: querystring.stringify({
        switchUrl: 0,
        quotationHeaderId,
        noBackFlag: true,
      }),
      closable: true,
    });
  }

  @Bind()
  handleOperation(record, operation) {
    const { sourceCategory, rfHeaderId, quotationHeaderId, supplierCompanyId } = record.get([
      'sourceCategory',
      'rfHeaderId',
      'quotationHeaderId',
      'supplierCompanyId',
      'quotationHeaderVersionId',
      'rfQuotationFormVersionId',
    ]);
    const { history } = this.props;
    const CURRENTACTIVETABKEY = getActiveTabKey();

    switch (operation) {
      case 'UNPARTICIPATED':
        history.push({
          pathname: `${CURRENTACTIVETABKEY}/participate/${sourceCategory}/${rfHeaderId}`,
          search: querystring.stringify({
            supplierCompanyId,
          }),
        });
        break;
      case 'REPLY':
        history.push({
          pathname: `${CURRENTACTIVETABKEY}/reply/${sourceCategory}/${rfHeaderId}`,
          search: querystring.stringify({
            quotationHeaderId,
          }),
        });
        break;
      case 'VIEW':
        history.push({
          pathname: `${CURRENTACTIVETABKEY}/reply-detail/${sourceCategory}/${rfHeaderId}`,
          search: querystring.stringify({
            quotationHeaderId,
          }),
        });
        break;
      case 'CLARIFY':
        this.toReviewClarification(record);
        break;
      default:
        break;
    }
  }

  // 报价页面
  directionQuotation = throttle(async (record = {}, options = {}) => {
    const { history } = this.props;
    const { serviceChargeFlag = false } = this.state;
    const {
      quotationHeaderId,
      subjectMatterRule,
      projectLineSectionId,
      roundFlag,
      rfxHeaderId,
      supplierCompanyId,
      supplierTenantId,
    } = record.get([
      'quotationHeaderId',
      'subjectMatterRule',
      'projectLineSectionId',
      'rfxHeaderId',
      'roundFlag',
      'supplierCompanyId',
      'supplierTenantId',
    ]);
    const { quotationFlag = 1 } = options || {};
    if (!quotationHeaderId) {
      return;
    }
    const newQuotationFlag = await this.newQuotationConfigSheet(record);

    if (newQuotationFlag === '-1') {
      return;
    }
    const CURRENTACTIVETABKEY = getActiveTabKey();
    const search = {
      roundFlag,
    };
    const sectionFlag = subjectMatterRule === 'PACK' ? 1 : null;
    if (sectionFlag && projectLineSectionId) {
      search.sectionFlag = sectionFlag;
      search.projectLineSectionId = projectLineSectionId;
    }
    const strSearch = querystring.stringify(filterNullValueObject(search));

    if (newQuotationFlag) {
      if (serviceChargeFlag) {
        const params = [
          {
            sourceId: rfxHeaderId,
            expensesType: 'DEPOSIT',
            supplierTenantId,
            supplierCompanyId,
          },
        ];
        quotationInsertExpens(params).then((resp) => {
          if (getResponse(resp)) {
            history.push({
              pathname: `${CURRENTACTIVETABKEY}/quotation/${quotationHeaderId}`,
              search: strSearch,
            });
          }
        });
      } else {
        history.push({
          pathname: `${CURRENTACTIVETABKEY}/quotation/${quotationHeaderId}`,
          search: strSearch,
        });
      }
      return;
    }
    history.push({
      pathname: quotationFlag
        ? `${CURRENTACTIVETABKEY}/inquiry-price/${quotationHeaderId}`
        : `${CURRENTACTIVETABKEY}/bidding-offer/${quotationHeaderId}`,
      search: strSearch,
    });
  }, 1200);

  // 竞价大厅-签到
  @Throttle(3000)
  @Bind()
  async biddingHallOperation(record) {
    if (!record) {
      return;
    }

    const { rfxLineSupplierId, rfxHeaderId } = record.get(['rfxLineSupplierId', 'rfxHeaderId']);

    if (!rfxHeaderId || !rfxLineSupplierId) {
      return;
    }

    const data = {
      querys: {
        customizeUnitCode: 'SSRC.SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL',
      },
      organizationId,
      rfxLineSupplierId,
      rfxHeaderId,
    };

    try {
      let result = await supplierBiddingHallSignIn(data);
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }

      this.afterSignInOrValidation(result, record);
    } catch (e) {
      throw e;
    }
  }

  // 唱标查询
  @Throttle(1200)
  bidAnnouncement(record) {
    const { doubleUnitFlag } = this.state;
    const { rfxHeaderId, supplierCompanyId } = record.get(['rfxHeaderId', 'supplierCompanyId']);
    openBidAnnouncementQueryModal({
      doubleUnitFlag,
      bidFlag: this.bidFlag,
      rfxHeaderId,
      supplierCompanyId,
    });
  }

  // 竞价大厅签到或者签到校验
  afterSignInOrValidation = (result = {}, record) => {
    const {
      biddingSignInFlag,
      supplierNumberPlate, // 号牌
    } = result || {};

    if (!biddingSignInFlag && !supplierNumberPlate) {
      this.directionToBiddingHall(result, record); // 无签到，无号牌，直接进入
      return;
    }

    let confirmContent = '';
    if (biddingSignInFlag) {
      if (supplierNumberPlate) {
        confirmContent = (
          <span>
            {intl
              .get('ssrc.biddingHall.view.successSignInOpenSupplier', { supplierNumberPlate })
              .d('恭喜您签到成功, 您的牌号是{supplierNumberPlate}, 请点击确定按钮进入竞价大厅')}
          </span>
        );
      } else {
        confirmContent = intl
          .get('ssrc.biddingHall.view.title.successSignInHiddenPlat')
          .d('恭喜签到成功，请点击确定按钮进入竞价大厅');
      }
    }

    // 没有签到
    if (!biddingSignInFlag) {
      if (supplierNumberPlate) {
        confirmContent = intl
          .get('ssrc.biddingHall.view.title.tokenNumberHavedAndToBiddingHall', {
            supplierNumberPlate,
          })
          .d('您的牌号是{supplierNumberPlate}, 请点击确定按钮进入竞价大厅');
      }
    }

    Modal.confirm({
      title: intl
        .get('ssrc.biddingHall.view.modal.title.confirmEnterBiddingPlace')
        .d('确认进入竞价现场'),
      children: confirmContent,
      onOk: () => this.directionToBiddingHall(result, record),
      onCancel: this.queryRFXSupplierList,
    });
  };

  /**
   *  跳转到竞价大厅
   *  /ssrc/supplier-reply/bidding-hall/:rfxLineSupplierId/:biddingType
   * */
  @Throttle(2000)
  directionToBiddingHall = (result, record) => {
    if (isEmpty(result)) {
      return;
    }

    const { subjectMatterRule, projectLineSectionId } =
      record?.get(['subjectMatterRule', 'projectLineSectionId']) || {};
    const { history } = this.props;
    const { biddingTarget, rfxLineSupplierId } = result || {};

    if (!rfxLineSupplierId || !biddingTarget) {
      return;
    }

    const search = {};
    const sectionFlag = subjectMatterRule === 'PACK' ? 1 : null;
    if (sectionFlag && projectLineSectionId) {
      search.sectionFlag = sectionFlag;
      search.projectLineSectionId = projectLineSectionId;
    }
    const strSearch = querystring.stringify(filterNullValueObject(search));

    const CURRENTACTIVETABKEY = getActiveTabKey();
    history.push({
      pathname: `/pub${CURRENTACTIVETABKEY}/bidding-hall/${rfxLineSupplierId}/${biddingTarget}`,
      search: strSearch,
    });
  };

  @Bind()
  async handleRFXOperation(record, operation) {
    const {
      quotationHeaderId,
      roundFlag,
      projectLineSectionId,
      subjectMatterRule,
      quotationRoundNumber,
      bidBondFlag,
      // supplierCompanyId,
      // rfxHeaderId,
    } = record.get([
      'quotationHeaderId',
      'quotationHeaderVersionId',
      'rfQuotationFormVersionId',
      'roundFlag',
      'projectLineSectionId',
      'subjectMatterRule',
      'quotationRoundNumber',
      'bidBondFlag',
      // 'supplierCompanyId',
      // 'rfxHeaderId',
    ]);
    const { history, remoteHoc } = this.props;
    const { serviceChargeFlag = false } = this.state;

    const search = querystring.stringify({
      sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
      roundFlag,
      projectLineSectionId,
    });

    switch (operation) {
      case 'PARTICIPATE':
        this.onBeforeParticipate(record);
        break;
      // case 'SIGN':
      //   this.signIn(record);
      //   break;
      case 'PREQUAL_APPLY':
      case 'PREQUAL_VIEW':
        this.openPretrialApplicationModal(record);
        break;
      case 'QUOTATION':
        if (remoteHoc && remoteHoc.event) {
          const flag = await remoteHoc.event.fireEvent('remoteCuxQuotationValidate', {
            record,
            operation,
            onBeforeParticipate: this.onBeforeParticipate,
          });
          if (!flag) return false;
        }
        if (record.get('prequalLineStatus') === 'NEW') {
          notification.warning({
            message: intl
              .get('ssrc.supplierQuotation.view.message.notSubmitPre')
              .d('预审申请未提交，不可报价'),
          });
        } else if (record.get('bidBondFlag')) {
          notification.warning({
            message: serviceChargeFlag
              ? intl
                  .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcatUsers')
                  .d(
                    '报价失败，失败原因是未缴纳保证金费，请及时缴纳。若已缴纳，请联系采购方人员及时确认'
                  )
              : intl
                  .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcat')
                  .d('操作失败，失败原因是未缴纳保证金，请缴纳后联系采购方修改缴纳状态'),
          });
        } else {
          this.directionQuotation(record, { quotationFlag: 1 });
        }
        break;
      case 'ESTIMATED': {
        if (record.get('bidBondFlag')) {
          return notification.warning({
            message: serviceChargeFlag
              ? intl
                  .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcatUsers')
                  .d(
                    '报价失败，失败原因是未缴纳保证金费，请及时缴纳。若已缴纳，请联系采购方人员及时确认'
                  )
              : intl
                  .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcat')
                  .d('操作失败，失败原因是未缴纳保证金，请缴纳后联系采购方修改缴纳状态'),
          });
        }
        this.directionQuotation(record, { quotationFlag: 0 });
        break;
      }
      case 'QUOTATION_VIEW':
        this.rfxOpenTabToQuotationQuery(record);
        break;
      case 'NOT_START':
      case 'NOT_QUOTED':
      case 'QUOTED':
        if (quotationRoundNumber === 1 && bidBondFlag) {
          notification.warning({
            message: intl
              .get('ssrc.common.view.errorOperateForQuotationBidFilePleaseConcat')
              .d('操作失败，失败原因是未缴纳保证金，请缴纳后联系采购方修改缴纳状态'),
          });
        } else {
          const CURRENTACTIVETABKEY = getActiveTabKey();
          history.push({
            pathname: `${CURRENTACTIVETABKEY}/inquiry-price/${quotationHeaderId}`,
            search,
          });
        }
        break;
      case 'BIDDING_HALL': // 竞价大厅
        this.biddingHallOperation(record);
        break;
      case 'BIDDING_ANNOUNCEMENT':
        this.bidAnnouncement(record);
        break;
      default:
        /**
         * 二开埋点 - 【芭比馒头】
         * 新加其他二开操作
         */
        if (remoteHoc && remoteHoc.event) {
          return remoteHoc.event.fireEvent('remoteCuxOperate', {
            record,
            operation,
            onBeforeParticipate: this.onBeforeParticipate,
          });
        }
        break;
    }
  }

  @Bind()
  signIn(record) {
    const res = getResponse(
      signIn({ organizationId, quotationHeaderId: record.get('quotationHeaderId') })
    );
    if (res) {
      this.setState({
        [record.get('quotationHeaderId')]: true,
      });
    }
  }

  /**
   * 报价 判断寻源事项flag，0直接参与 1弹框确认
   * @param {Object} record - 当前操作行
   */
  @Bind()
  async onBeforeParticipate(record = {}) {
    const { remoteHoc } = this.props;

    let cuxFlag = true;
    if (remoteHoc?.event) {
      cuxFlag = await remoteHoc.event.fireEvent('handleCuxBeforeOnParticipate', {
        that: this,
        record,
      });
    }
    if (cuxFlag === false) {
      return false;
    }

    const oldTemplateShowFlag =
      record.get('systemVersion') === 1 ? record.get('matterDetail') : true;
    if (record.get('showMatterFlag') === 1 && oldTemplateShowFlag) {
      // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
      this.setState({
        currentOperateRow: record,
        readMatterDetailVisible: true,
      });
    } else {
      return this.onParticipate(record);
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

  /**
   * 跳转新参与
   * @param {*} record 行数据
   * @param {*} pageType 是参与还是单号进来的  ‘detail’-就是明细 不显示头部按钮；否则是参与
   */
  directApply(record = {}, pageType = '') {
    const { history } = this.props;
    const { serviceChargeFlag = false } = this.state;
    const {
      tenantId,
      rfxHeaderId,
      sourceMethod,
      supplierCompanyId,
      subjectMatterRule = null,
      projectLineSectionId = null,
      supplierTenantId = '',
    } = record.get([
      'rfxHeaderId',
      'sourceMethod',
      'supplierCompanyId',
      'showMatterFlag',
      'tenantId',
      'subjectMatterRule',
      'projectLineSectionId',
      'supplierTenantId',
    ]);
    const sectionFlag = subjectMatterRule === 'PACK' ? 1 : 0;
    const SearchParams = { pageType };
    if (sectionFlag) {
      SearchParams.sectionFlag = sectionFlag;
      SearchParams.projectLineSectionId = projectLineSectionId;
    }
    if (supplierTenantId) {
      SearchParams.supplierTenantId = supplierTenantId;
    }
    const search = querystring.stringify(SearchParams);
    const CURRENTACTIVETABKEY = getActiveTabKey();
    if (pageType !== 'detail' && serviceChargeFlag) {
      const params = sectionFlag
        ? {
            sourceId: rfxHeaderId,
            expensesType: 'TENDER_FEE',
            tenantId,
            supplierTenantId,
            supplierCompanyId,
          }
        : [
            {
              sourceId: rfxHeaderId,
              expensesType: 'TENDER_FEE',
              supplierTenantId,
              supplierCompanyId,
            },
          ];
      const insetExpense = sectionFlag ? quotationBatchInsertExpens : quotationInsertExpens;
      // 寻源方式 ≠ 邀请 需要调用接口，否则直接跳转
      if (sourceMethod !== 'INVITE') {
        insetExpense(params).then((res) => {
          if (getResponse(res)) {
            history.push({
              pathname: `${CURRENTACTIVETABKEY}/apply/${rfxHeaderId}/${supplierCompanyId}`,
              search,
            });
          }
        });
      } else {
        history.push({
          pathname: `${CURRENTACTIVETABKEY}/apply/${rfxHeaderId}/${supplierCompanyId}`,
          search,
        });
      }
    } else {
      history.push({
        pathname: `${CURRENTACTIVETABKEY}/apply/${rfxHeaderId}/${supplierCompanyId}`,
        search,
      });
    }
  }

  /**
   * 参与
   * @param {Object} record - 当前编辑行
   */
  @Bind()
  @Throttle(1200)
  async onParticipate(record = {}) {
    const {
      rfxHeaderId,
      supplierCompanyId,
      tenantId,
      showMatterFlag,
      subjectMatterRule = null,
      projectLineSectionId = null,
    } = record.get([
      'rfxHeaderId',
      'supplierCompanyId',
      'showMatterFlag',
      'tenantId',
      'subjectMatterRule',
      'projectLineSectionId',
    ]);
    const { history, remoteHoc } = this.props;
    const CommonParam = {
      sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
      projectLineSectionId,
    };
    const search = querystring.stringify({
      ...CommonParam,
    });

    const newQuotationFlag = await this.newQuotationConfigSheet(record);
    const CURRENTACTIVETABKEY = getActiveTabKey();
    if (newQuotationFlag === '-1') {
      return;
    }
    // 标准参与跳转逻辑
    const handleParticipate = () => {
      if (showMatterFlag === 1) {
        // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
        saveConfirmMatter({
          tenantId,
          rfxHeaderId,
          supplierCompanyId,
        }).then((res) => {
          if (res) {
            if (newQuotationFlag) {
              this.directApply(record);
              return;
            }

            history.push({
              pathname: `${CURRENTACTIVETABKEY}/detail/${rfxHeaderId}/${supplierCompanyId}/operation`,
              search,
            });
          }
        });
      } else {
        if (newQuotationFlag) {
          this.directApply(record);
          return;
        }

        history.push({
          pathname: `${CURRENTACTIVETABKEY}/detail/${rfxHeaderId}/${supplierCompanyId}/operation`,
          search,
        });
      }
    };

    if (remoteHoc && remoteHoc.event) {
      return remoteHoc.event
        .fireEvent('remoteParticipate', {
          record,
          history,
          organizationId,
          bidFlag: this.bidFlag,
          activeTabKey: CURRENTACTIVETABKEY,
          handleParticipate,
          showMatterFlag,
          saveConfirmMatter,
          handleChange: this.handleChange,
          handleReadMatterCancel: this.handleReadMatterCancel,
        })
        .then(() => {
          this.handleReadMatterCancel();
        })
        .catch(() => {
          this.handleReadMatterCancel();
        });
    } else {
      handleParticipate();
    }
    this.handleReadMatterCancel();
  }

  /**
   * 打开资格预审弹框
   * @protected yongxiang
   * @param {obj} record - table的行记录
   */
  openPretrialApplicationModal(record) {
    const prequalLineStatus = record.get('prequalLineStatus');
    let prequalOnlyRead = false;
    if (
      prequalLineStatus === 'REFUSED' ||
      prequalLineStatus === 'APPROVED' ||
      prequalLineStatus === 'NO_APPROVED'
    ) {
      prequalOnlyRead = true;
    }
    const {
      mergeType,
      rfxHeaderId,
      supplierCompanyId,
      prequalGroupHeaderId,
      quotationStartDate,
      sourceProjectId,
      projectLineSectionId,
      supplierCompanyName,
      quotationHeaderId,
    } = record.get([
      'mergeType',
      'rfxHeaderId',
      'supplierCompanyId',
      'prequalGroupHeaderId',
      'quotationStartDate',
      'sourceProjectId',
      'projectLineSectionId',
      'supplierCompanyName',
      'quotationHeaderId',
    ]);
    this.setState(
      {
        mergeType,
        prequalOnlyRead,
        rfxHeaderId,
        supplierCompanyId,
        preApplyModalVisible: true,
        prequalLineStatus,
        quotationStartDate,
        sourceProjectId,
        prequalGroupHeaderId,
        prequalGroupingFlag: !!projectLineSectionId && !!prequalGroupHeaderId, // HACK 早期通过projectLineSectionId是分标段是不准确的，现在临时增加prequalGroupHeaderId共同判断
        supplierCompanyName, // @protected yongxiang
        quotationHeaderId, // @protected yongxiang
      },
      () => this.fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId)
    );
  }

  /**
   * 资格预审申请提交回调
   * @param {Object} params - 提交接口所需参数
   */
  @Bind()
  submitPretrialApplicationData(params) {
    const { dispatch } = this.props;
    const { prequalGroupingFlag } = this.state;
    const { supplierCompanyId, supplierPrequalDTO, prequalGroupHeaderIds } = params || {};
    if (this.bidFlag) {
      Object.assign(supplierPrequalDTO, { secondarySourceCategory: 'NEW_BID' });
    }
    dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag ? 'submitSupplierPrequalHeader' : 'submitPretrialApplication'
      }`,
      payload: {
        organizationId,
        supplierCompanyId,
        supplierPrequalDTO,
        prequalGroupHeaderIds,
        customizeUnitCode: `SSRC_${this.custKey === '' ? '' : 'BID_'}SUPPLIER_PREQUAL.DATA`,
      },
    }).then((res) => {
      if (res) {
        this.setState({ preApplyModalVisible: false });
        dispatch({
          type: 'supplierQuotation/updateState',
          payload: {
            fetchPretrialApplicationData: {},
          },
        });
        this.queryRFXSupplierList();
      }
    });
  }

  // 依据配置 返回ds currentPage
  getDSCurrentPageWithOptions = (data) => {
    const { ds, cacheCurrentPageFlag = 0 } = data || {};
    let currentPage;

    if (cacheCurrentPageFlag) {
      currentPage = ds?.currentPage;
    }

    return currentPage;
  };

  @Bind()
  queryRFXSupplierList(options) {
    const { activeKey } = this.state;
    const {
      rfxAllDS,
      invitationDS,
      openInquiryDS,
      needDealDS,
      needAttentionDS,
      wonBidDS,
      notWonBidDS,
      notParDS,
      notResponseDS,
      canParticipateDS,
      onGoingDS,
      attentionDS,
      suggestedDS,
      unSuggestedDS,
      abandonedDS,
      allDS,
      // qrDsMap,
    } = this.props;
    const { cacheCurrentPageFlag = 0 } = options || {};

    this.delayQueryRFXCount();

    if (activeKey === 'rfxAll' && rfxAllDS.getState('queryStatus') === 'ready') {
      rfxAllDS.query(this.getDSCurrentPageWithOptions({ ds: rfxAllDS, cacheCurrentPageFlag }));
    }
    if (
      activeKey === 'notParticipate' &&
      invitationDS.getState('queryStatus') === 'ready' &&
      openInquiryDS.getState('queryStatus') === 'ready'
    ) {
      invitationDS.query(
        this.getDSCurrentPageWithOptions({ ds: invitationDS, cacheCurrentPageFlag })
      );
      openInquiryDS.query(
        this.getDSCurrentPageWithOptions({ ds: openInquiryDS, cacheCurrentPageFlag })
      );
    }
    if (
      activeKey === 'onGoing' &&
      needDealDS.getState('queryStatus') === 'ready' &&
      needAttentionDS.getState('queryStatus') === 'ready'
    ) {
      needDealDS.query(this.getDSCurrentPageWithOptions({ ds: needDealDS, cacheCurrentPageFlag }));
      needAttentionDS.query(
        this.getDSCurrentPageWithOptions({ ds: needAttentionDS, cacheCurrentPageFlag })
      );
    }
    if (
      activeKey === 'finished' &&
      wonBidDS.getState('queryStatus') === 'ready' &&
      notWonBidDS.getState('queryStatus') === 'ready' &&
      notParDS.getState('queryStatus') === 'ready'
    ) {
      wonBidDS.query(this.getDSCurrentPageWithOptions({ ds: wonBidDS, cacheCurrentPageFlag }));
      notWonBidDS.query(
        this.getDSCurrentPageWithOptions({ ds: notWonBidDS, cacheCurrentPageFlag })
      );
      notParDS.query(this.getDSCurrentPageWithOptions({ ds: notParDS, cacheCurrentPageFlag }));
    }
    if (
      activeKey === 'pending' &&
      notResponseDS.getState('queryStatus') === 'ready' &&
      canParticipateDS.getState('queryStatus') === 'ready'
    ) {
      notResponseDS.query(
        this.getDSCurrentPageWithOptions({ ds: notResponseDS, cacheCurrentPageFlag })
      );
      canParticipateDS.query(
        this.getDSCurrentPageWithOptions({ ds: canParticipateDS, cacheCurrentPageFlag })
      );
    }
    if (
      activeKey === 'participatory' &&
      onGoingDS.getState('queryStatus') === 'ready' &&
      attentionDS.getState('queryStatus') === 'ready'
    ) {
      onGoingDS.query(this.getDSCurrentPageWithOptions({ ds: onGoingDS, cacheCurrentPageFlag }));
      attentionDS.query(
        this.getDSCurrentPageWithOptions({ ds: attentionDS, cacheCurrentPageFlag })
      );
    }
    if (
      activeKey === 'completed' &&
      suggestedDS.getState('queryStatus') === 'ready' &&
      unSuggestedDS.getState('queryStatus') === 'ready' &&
      abandonedDS.getState('queryStatus') === 'ready'
    ) {
      suggestedDS.query(
        this.getDSCurrentPageWithOptions({ ds: suggestedDS, cacheCurrentPageFlag })
      );
      unSuggestedDS.query(
        this.getDSCurrentPageWithOptions({ ds: unSuggestedDS, cacheCurrentPageFlag })
      );
      abandonedDS.query(
        this.getDSCurrentPageWithOptions({ ds: abandonedDS, cacheCurrentPageFlag })
      );
    }
    if (activeKey === 'all' && allDS.getState('queryStatus') === 'ready') {
      allDS.query(this.getDSCurrentPageWithOptions({ ds: allDS, cacheCurrentPageFlag }));
    }

    if (Object.values(QRActivityMap).includes(activeKey)) {
      this.queryQRTableAndCount();
    }
  }

  queryQRTableAndCount = () => {
    const { qrDsMap } = this.props;
    const { activeKey } = this.state;
    const qrCurrentTableDs = qrDsMap[activeKey.toUpperCase()];

    this.qrCountTimer = setTimeout(() => {
      const { getCurrentSearchParams } = this.quickReplyRef || {};
      const params = getCurrentSearchParams ? getCurrentSearchParams() : null;
      const { filterParams = {} } = params || {};

      qrCurrentTableDs.setState('totalCount', null);
      qrCurrentTableDs.setQueryParameter('defaultParams', filterParams);
      qrCurrentTableDs.query(qrCurrentTableDs.currentPage);

      // 获取tab总数目 TODO
      this.queryQRCount({ data: filterParams });
    }, 500);
  };

  @Bind()
  setQueryParams(key, value, mountFlag) {
    const { activeKey } = this.state;
    const {
      rfxAllDS,
      invitationDS,
      openInquiryDS,
      needDealDS,
      needAttentionDS,
      wonBidDS,
      notParDS,
      notWonBidDS,
      notResponseDS,
      canParticipateDS,
      onGoingDS,
      attentionDS,
      suggestedDS,
      unSuggestedDS,
      abandonedDS,
      allDS,
    } = this.props;
    if (activeKey === 'rfxAll') {
      rfxAllDS.setQueryParameter(key, value);
    }
    if (activeKey === 'notParticipate') {
      invitationDS.setQueryParameter(key, value);
      openInquiryDS.setQueryParameter(key, value);
    }
    if (activeKey === 'onGoing') {
      needDealDS.setQueryParameter(key, value);
      needAttentionDS.setQueryParameter(key, value);
    }
    if (activeKey === 'finished') {
      wonBidDS.setQueryParameter(key, value);
      notParDS.setQueryParameter(key, value);
      notWonBidDS.setQueryParameter(key, value);
    }
    if (activeKey === 'pending') {
      notResponseDS.setQueryParameter(key, value);
      canParticipateDS.setQueryParameter(key, value);
    }
    if (activeKey === 'participatory') {
      onGoingDS.setQueryParameter(key, value);
      attentionDS.setQueryParameter(key, value);
    }
    if (activeKey === 'completed') {
      suggestedDS.setQueryParameter(key, value);
      unSuggestedDS.setQueryParameter(key, value);
      abandonedDS.setQueryParameter(key, value);
    }
    if (activeKey === 'all') {
      allDS.setQueryParameter(key, value);
    }
    if (!mountFlag) {
      this.queryRFXSupplierList();
    }
  }

  /**
   * 关闭模态框时清楚model中的数据
   * @protected yongxiang
   * */
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
   * 预审申请数据获取
   * @param {String} rfxHeaderId -询价单头id
   *
   */
  @Bind()
  fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId) {
    const { dispatch } = this.props;
    const { rfxHeaderId, prequalGroupingFlag } = this.state;
    return dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag && prequalGroupHeaderId
          ? 'querySupplierPrequalHeader'
          : 'fetchPretrialApplication'
      }`,
      payload: {
        organizationId,
        rfxHeaderId,
        supplierCompanyId,
        prequalGroupHeaderId,
        prequalCategory: 'RFX',
        customizeUnitCode: `SSRC_${this.custKey === '' ? '' : 'BID_'}SUPPLIER_PREQUAL.DATA`,
      },
    });
  }

  /**
   * 资格预审申请保存回调
   * @param {Object} params - 保存接口所需参数
   */
  @Bind()
  async savePretrialApplicationData(params) {
    const { dispatch } = this.props;
    const { prequalGroupingFlag } = this.state;
    const { supplierCompanyId, prequalGroupHeaderId } = params;
    const { supplierPrequalDTO } = params || {};
    if (this.bidFlag) {
      Object.assign(supplierPrequalDTO, { secondarySourceCategory: 'NEW_BID' });
    }
    return dispatch({
      type: `supplierQuotation/${
        prequalGroupingFlag && prequalGroupHeaderId
          ? 'saveSupplierPrequalHeader'
          : 'savePretrialApplication'
      }`,
      payload: {
        organizationId,
        prequalGroupHeaderId,
        supplierPrequalDTO,
        supplierCompanyId: params.supplierCompanyId,
        customizeUnitCode: `SSRC_${this.custKey === '' ? '' : 'BID_'}SUPPLIER_PREQUAL.DATA`,
      },
    }).then((res) => {
      if (res) {
        this.fetchPretrialApplicationData(supplierCompanyId, prequalGroupHeaderId);
      }
      return res;
    });
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible, rfxHeaderId) {
    const { dispatch } = this.props;
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
          ? fetchPretrialApplicationData?.prequalGroupHeaderId
          : fetchPretrialApplicationData?.prequalHeaderId,
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
   *  跳转到澄清答疑
   * @param {*} record 表格单条记录
   */
  @Bind()
  toReviewClarification(record) {
    const {
      history,
      location: { pathname = '', search = '' },
    } = this.props;
    const {
      quotationHeaderId = 0,
      rfxHeaderId = 0,
      quotationEndFlag,
      supplierCompanyId,
      sourceCategory,
      rfHeaderId = 0,
      tenantId,
      // rfxNum = '',
      // rfxTitle = '',
      // rfNum = '',
      // rfTitle = '',
    } = record.get([
      'quotationHeaderId',
      'rfxHeaderId',
      // 'rfxNum',
      // 'rfxTitle',
      'quotationEndFlag',
      'supplierCompanyId',
      'sourceCategory',
      'rfHeaderId',
      'tenantId',
      // 'rfNum',
      // 'rfTitle',
    ]);
    const searchData = querystring.stringify({
      flag: '1',
      sourceFrom: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
      quotationHeaderId,
      supplierCompanyId,
      quotationEndFlag,
      // title: ['RFQ', 'RFA'].includes(sourceCategory)
      //   ? `${rfxNum}-${rfxTitle}`
      //   : `${rfNum}-${rfTitle}`,
      sourceHeaderId: ['RFQ', 'RFA'].includes(sourceCategory) ? rfxHeaderId : rfHeaderId,
      backPath: `${pathname}?${search}`,
      tenantId,
    });
    const CURRENTACTIVETABKEY = getActiveTabKey();
    history.push({
      pathname: `${CURRENTACTIVETABKEY}/review-clarification`,
      search: searchData,
    });
  }

  @Bind()
  linktoDetail({ value, record }) {
    const { activeKey } = this.state;
    const CURRENTACTIVETABKEY = getActiveTabKey();
    const link = () => {
      this.props.history.push({
        pathname: `${CURRENTACTIVETABKEY}/participate-detail/${record.get(
          'sourceCategory'
        )}/${record.get('rfHeaderId')}`,
        search: querystring.stringify({
          quotationHeaderId: record.get('quotationHeaderId'),
        }),
      });
    };
    const { entryMethod } = record.get(['offLineFlag', 'entryMethod']);
    const offlineQuotation = entryMethod === 'OFFLINE';
    const showOfflineQuotationTab = activeKey === 'participatory' || activeKey === 'all';
    const offlineSymbolVisible = offlineQuotation && showOfflineQuotationTab;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <a onClick={link}> {value} </a>
        {offlineSymbolVisible ? (
          <Tooltip
            title={intl
              .get('ssrc.common.view.title.offlineQuotationWarningSuppliersReply')
              .d('征询书已被采购方完成线下回复，如有疑问请联系采购员。')}
          >
            <img style={{ marginLeft: '4px' }} src={IconWarningCircle} alt="off-line-warning" />
          </Tooltip>
        ) : (
          ''
        )}
      </span>
    );
  }

  @Bind()
  showStatusMeaning({ record, value }) {
    const {
      displayQuotationStatusMeaning,
      displayQuotationStatus,
      currentQuotationRound,
    } = record.get([
      'displayQuotationStatusMeaning',
      'displayQuotationStatus',
      'currentQuotationRound',
    ]);

    return (
      <span>
        {currentQuotationRound > 1 &&
        ['NOT_START', 'NOT_QUOTED', 'QUOTED'].includes(displayQuotationStatus)
          ? renderStatusTag({
              status: displayQuotationStatus,
              statusMeaning: intl
                .get('ssrc.inquiryHall.view.inquiryHall.theRound', {
                  number: currentQuotationRound,
                  value,
                })
                .d(`第{number}轮 {value}`),
            })
          : renderStatusTag({
              status: displayQuotationStatus,
              statusMeaning: displayQuotationStatusMeaning,
            })}
        {/* {` ${value}`} */}
      </span>
    );
  }

  /**
   * 点击PFx跳转
   */
  @Bind()
  async onrfxNum(record) {
    const type = 'view';
    const { history } = this.props;
    const { rfxHeaderId, supplierCompanyId, quotationHeaderId } = record.get([
      'rfxHeaderId',
      'supplierCompanyId',
      'quotationHeaderId',
    ]);

    if (!rfxHeaderId) {
      return;
    }

    const CURRENTACTIVETABKEY = getActiveTabKey();

    const newQuotationFlag = await this.newQuotationConfigSheet(record);
    if (newQuotationFlag === '-1') {
      return;
    }
    if (newQuotationFlag) {
      // 如果是新报价，则跳转新报价报价参与，和参与页面公用一套页面
      this.directApply(record, 'detail');
      return;
    }

    history.push({
      pathname: `${CURRENTACTIVETABKEY}/detail/${rfxHeaderId}/${supplierCompanyId}/${type}`,
      search: `quotationHeaderId=${quotationHeaderId}`,
    });
  }

  @Bind()
  getColumns(actionFlag = true) {
    const { activeKey } = this.state;
    const columns = [
      {
        name: 'displayQuotationStatusMeaning',
        width: ['pending', 'completed'].includes(activeKey) ? 100 : 120,
        renderer: ({ record }) => {
          const { displayQuotationStatusMeaning, displayQuotationStatus } = record.get([
            'displayQuotationStatusMeaning',
            'displayQuotationStatus',
          ]);

          return renderStatusTag({
            status: displayQuotationStatus,
            statusMeaning: displayQuotationStatusMeaning,
          });
        },
      },
      actionFlag
        ? {
            name: 'operationMeaning',
            width: ['pending', 'completed'].includes(activeKey) ? 100 : 160,
            renderer: this.renderOperat,
            tooltip: 'none',
          }
        : null,
      {
        name: 'rfNum',
        width: 160,
        renderer: this.linktoDetail,
      },
      {
        name: 'rfTitle',
        width: 150,
      },
      {
        name: 'sourceCategoryMeaning',
        width: 100,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'quotationStartDate',
        width: 140,
      },
      {
        name: 'quotationEndDate',
        width: 140,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'sourceMethodMeaning',
        width: 100,
      },
      {
        name: 'realName',
        width: 120,
      },
    ].filter(Boolean);
    return columns;
  }

  @Bind()
  getRFQColumns(actionFlag = true, detailFlag) {
    const { remoteHoc } = this.props;
    const { activeKey } = this.state;
    const columns = [
      {
        name: 'displayQuotationStatusMeaning',
        width: 120,
        renderer: this.showStatusMeaning,
        // lock: 'left',
      },
      actionFlag
        ? {
            name: 'operation',
            width: 200,
            // lock: 'left',
            renderer: this.renderOperat,
            tooltip: 'none',
          }
        : null,
      {
        name: 'rfxNum',
        width: 160,
        renderer: ({ record }) => {
          const { offLineFlag = 0, entryMethod } = record.get(['offLineFlag', 'entryMethod']);

          const offlineQuotation =
            offLineFlag === 1 || offLineFlag === '1' || entryMethod === 'OFFLINE';
          const showOfflineQuotationTab = activeKey === 'onGoing' || activeKey === 'rfxAll';
          const offlineSymbolVisible = offlineQuotation && showOfflineQuotationTab;

          return (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <a onClick={() => this.onrfxNum(record)}>{record.get('rfxNum')}</a>
              {offlineSymbolVisible ? (
                <Tooltip
                  title={intl
                    .get('ssrc.common.view.title.offlineQuotationWarningSuppliers')
                    .d('已被采购方完成线下报价，如有疑问请联系采购员。')}
                >
                  <img
                    style={{ marginLeft: '4px' }}
                    src={IconWarningCircle}
                    alt="off-line-warning"
                  />
                </Tooltip>
              ) : (
                ''
              )}
            </span>
          );
        },
      },
      detailFlag
        ? {
            name: 'rfxLineItemNum',
            width: 150,
            // lock: 'left',
          }
        : null,
      {
        name: 'rfxTitle',
        width: 200,
        // lock: 'left',
      },
      !this.bidFlag
        ? {
            name: 'sourceCategoryMeaning',
            width: 100,
          }
        : null,
      detailFlag
        ? {
            name: 'pretrialApplication',
            width: 100,
          }
        : null,
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'quotationStartDate',
        width: 140,
      },
      {
        name: 'quotationEndDate',
        width: 140,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'sourceMethodMeaning',
        width: 100,
      },
      {
        name: 'realName',
        width: 150,
      },
    ].filter(Boolean);
    if (!remoteHoc) return columns;
    return remoteHoc.process('SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_PROCESS_RFQ_COLUMNS', columns, {
      bidFlag: this.bidFlag,
      activeKey,
      queryRFXSupplierList: this.queryRFXSupplierList,
    });
  }

  @Bind()
  handleChange(key) {
    const RFFlag = RFList.includes(this.state.activeKey);
    const newRFFlag = RFList.includes(key);
    if ((RFFlag && !newRFFlag) || (!RFFlag && newRFFlag)) {
      this.setState({
        dotShow: false,
      });
    }
    this.setState(
      {
        activeKey: key,
        searchParams: {},
      },
      () => {
        this.queryRFXSupplierList({ cacheCurrentPageFlag: 1 });
      }
    );
    initStatus.activeKey = key;
  }

  /**
   * 预审申请弹窗
   * @protected yongxiang
   */
  renderPretrialApplicationModal(pretrialApplicationModalProps = {}) {
    const { prequalGroupingFlag, visible: preApplyModalVisible } =
      pretrialApplicationModalProps || {};

    return (
      <div>
        {!prequalGroupingFlag && preApplyModalVisible ? (
          this.custKey ? (
            <BidPretrialApplicationModal {...pretrialApplicationModalProps} />
          ) : (
            <PretrialApplicationModal {...pretrialApplicationModalProps} />
          )
        ) : null}
      </div>
    );
  }

  searchRef = (ref) => {
    this.searchAllComponent = ref;
  };

  /**
   * RFQ search bar ref bind
   */
  searchRfxRef = (ref) => {
    this.searchRfxAllComponent = ref;
  };

  /**
   * RFX 全部页签下的导出, 需要获取筛选器中的查询参数
   * */
  getExportNewButtonQueryParam = () => {
    const excelExportQueryParams = filterNullValueObject({
      ...(this.searchRfxAllComponent?.getQueryParameter() || {}),
      multiRfxNumOrTitle: this.searchRfxAllComponent?.customizeDs?.current
        ?.get('multiRfxNumOrTitle')
        ?.join(','),
      customizeSearchUnitCode: `SSRC.${this.custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER`,
      customizeUnitCode: `SSRC.${this.custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL`,
    });

    return excelExportQueryParams;
  };

  /**
   * export new button
   * RFQ 全部页显示
   * */
  exportNewButton = () => {
    const { match: { path } = {} } = this.props;
    const { activeKey } = this.state;

    const hiddenFlag = activeKey !== 'rfxAll' || RFList?.includes(activeKey) || this.bidFlag;
    if (hiddenFlag) {
      return;
    }

    return {
      name: 'exportNew',
      btnComp: ExcelExportPro,
      btnProps: {
        templateCode: 'SRM_C_SRM_SSRC_RFX_QUOTATION_REPLY_EXPORT',
        name: 'exportNew',
        requestUrl: `/ssrc/v2/${organizationId}/rfx/quotation/list/all/export-new`,
        buttonText: intl.get('hzero.common.button.export').d('导出'),
        // queryParams: {
        //   customizeSearchUnitCode: `SSRC.${this.custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER`,
        //   customizeUnitCode: `SSRC.${this.custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL`,
        // },
        queryParams: this.getExportNewButtonQueryParam,
        defaultSelectAll: true,
        otherButtonProps: {
          funcType: 'flat',
          permissionList: [
            {
              code: `${path}.button.exportnew`.toLowerCase(),
              type: 'button',
              meaning: `${
                intl
                  .get(`ssrc.supplierQuotation.view.message.title.supplierReply`)
                  .d('供应商回复') - intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
              }`,
            },
          ],
        },
      },
    };
  };

  renderTabTitle = (main = '', description = '') => {
    const currentLanguage = getCurrentLanguage();
    const cnLanguageFlag = currentLanguage === 'zh_CN';
    if (cnLanguageFlag) {
      return `${main}(${description})`;
    } else {
      return main;
    }
  };

  // 设置页面loading
  @Bind()
  setPageLoading(loading) {
    const { pageLoading } = this.state;
    this.setState({
      pageLoading: loading ?? !pageLoading,
    });
  }

  // 快速回复-批量报价
  @Bind()
  async QRBatchQuotation() {
    const { qrDsMap } = this.props;
    if (!qrDsMap?.PROCESSING && qrDsMap.PROCESSING.selected?.length) return;
    // 勾选id
    const rfqQuotationCurrentIds = qrDsMap.PROCESSING.selected.map((r) =>
      r.get('rfqQuotationCurrentId')
    );

    const params = {
      tenantId: getCurrentOrganizationId(),
      rfqQuotationCurrentIds,
    };

    try {
      this.setPageLoading(true);
      // 调用校验接口
      const vResult = getResponse(await qrBatchQuotationValidate(params));

      if (vResult) {
        // 校验成功回调
        const successCallBack = () => {
          notification.success();
          qrDsMap.PROCESSING.unSelectAll();
          qrDsMap.PROCESSING.clearCachedSelected();
          qrDsMap.PROCESSING.clearCachedRecords();
          qrDsMap.PROCESSING.query();
          this.setPageLoading(false);
        };

        // 若校验弹框提示
        const warningOk = () => {
          return qrBatchQuotationSubmit(params)
            .then((_res) => {
              const _result = getResponse(_res);
              this.setPageLoading(false);
              if (_result && !_result.failed) {
                successCallBack();
              }
            })
            .catch(() => {
              this.setPageLoading(false);
            });
        };

        // 调用校验弹框方法
        validateQRModal({
          response: vResult,
          successCallBack,
          warningOk,
          errorOk: () => this.setPageLoading(false),
          warningCancel: () => this.setPageLoading(false),
        });
      } else {
        this.setPageLoading(false);
      }
    } catch (e) {
      this.setPageLoading(false);
      throw e;
    }
  }

  // 快速回复-批量放弃
  @Bind()
  async qrBatchAbandon() {
    const { qrDsMap } = this.props;
    if (!qrDsMap?.PROCESSING && qrDsMap.PROCESSING.selected?.length) return;

    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('ssrc.quickInquiry.quickReply.view.message.abandonQuotation.tips')
        .d('放弃后报价行不可恢复，是否放弃报价？'),
      onOk: this.handleQrBatchAbandonOk,
    });
  }

  // 快速回复-批量放弃
  @Bind()
  handleQrBatchAbandonOk() {
    const { qrDsMap } = this.props;

    // 勾选id
    const rfqQuotationCurrentIds = qrDsMap.PROCESSING.selected.map((r) =>
      r.get('rfqQuotationCurrentId')
    );

    const params = {
      tenantId: getCurrentOrganizationId(),
      rfqQuotationCurrentIds,
    };
    this.setPageLoading(true);
    return qrBatchAbandon(params)
      .then((res) => {
        const result = getResponse(res);
        if (result) {
          // 刷新列表
          notification.success();
          qrDsMap.PROCESSING.unSelectAll();
          qrDsMap.PROCESSING.clearCachedSelected();
          qrDsMap.PROCESSING.clearCachedRecords();
          qrDsMap.PROCESSING.query(qrDsMap.PROCESSING.currentPage);
        }
      })
      .finally(() => this.setPageLoading(false));
  }

  /**
   * 快速回复-头部按钮组-个性化
   * 按单据类型区分头个性化
   */
  @Bind()
  qRHeaderButtons() {
    const { customizeBtnGroup, qrDsMap, remoteHoc } = this.props;
    const { activeKey, pageLoading } = this.state;

    const buttons = [
      {
        name: 'batchOperate',
        group: true,
        hidden: [QRActivityMap.PROCESSED, QRActivityMap.QRALL].includes(activeKey),
        child: (fieldName = '') => (
          <Button name="batchOperate" icon="checklist" funcType="flat">
            {fieldName || intl.get('ssrc.quickInquiry.view.button.batchOperate').d('批量操作')}
            <Icon type="expand_more" />
          </Button>
        ),
        children: [
          {
            name: 'qrBatchQuotation',
            btnType: 'c7n-pro',
            btnProps: {
              waitType: 'throttle',
              wait: 1200,
              loading: pageLoading,
              onClick: this.QRBatchQuotation,
              disabled: !qrDsMap?.PROCESSING?.selected?.length,
            },
            child: intl.get('ssrc.quickInquiry.quickReply.button.quotation').d('报价'),
          },
          {
            name: 'qrBatchAbandon',
            btnType: 'c7n-pro',
            btnProps: {
              waitType: 'throttle',
              wait: 1200,
              loading: pageLoading,
              onClick: this.qrBatchAbandon,
              disabled: !qrDsMap?.PROCESSING?.selected?.length,
            },
            child: intl.get(`ssrc.quickInquiry.view.button.abandon`).d('放弃'),
          },
        ],
      },
    ];

    const remoteButtons = remoteHoc
      ? remoteHoc.process(
          'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_PROCESS_QUICK_HEADER_BUTTONS',
          buttons,
          {
            activeKey,
            QRActivityMap,
            qrDsMap,
            bidFlag: this.bidFlag,
          }
        )
      : buttons;

    return customizeBtnGroup(
      {
        code: QRHeaderButtonCode,
        pro: true,
      },
      <DynamicButtons buttons={remoteButtons} />
    );
  }

  // 头动态按钮组件
  headerButtons = () => {
    const { remoteHoc } = this.props;
    const { activeKey } = this.state;

    // 快速回复-头部按钮组-个性化 按单据类型区分头个性化
    if (Object.values(QRActivityMap).includes(activeKey)) return this.qRHeaderButtons();

    let btnList = [this.exportNewButton()];

    btnList = remoteHoc
      ? remoteHoc.process(
          'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST_PROCESS_RFX_HEADER_BUTTONS',
          btnList,
          {
            activeKey,
            RFList,
            that: this,
          }
        )
      : btnList;

    btnList = (btnList || []).filter(Boolean);

    return <DynamicButtons buttons={btnList} />;
  };

  setQuickReplyContentRef = (node) => {
    this.quickReplyRef = node;
  };

  renderQuickReplyTable = (type) => {
    const { qrDsMap, customizeTable, customizeForm, remoteHoc, customizeBtnGroup } = this.props;
    const { handleQuotationButton } = remoteHoc.props.process || {};
    const { doubleUnitFlag, pageLoading } = this.state;
    const listProps = {
      type,
      qrDsMap,
      customizeForm,
      customizeTable,
      doubleUnitFlag,
      handleQuotationButton,
      customizeBtnGroup,
      getFilterCreateDataRangeDefaultValue: this.getFilterCreateDataRangeDefaultValue,
      qrContentRef: this.setQuickReplyContentRef,
    };
    return (
      <Spin spinning={pageLoading}>
        <QuickReplyTable {...listProps} />
      </Spin>
    );
  };

  /**
   * 快速回复 - TabPanes
   * @returns Array
   */

  quickReplayPaneList = () => {
    const { qrDsMap } = this.props;
    return [
      {
        key: QRActivityMap.PROCESSING,
        tab: intl.get('ssrc.quickInquiry.quickReply.view.message.title.todo').d('未处理'),
        content: this.renderQuickReplyTable(QRActivityMap.PROCESSING),
        count: () =>
          qrDsMap?.PROCESSING?.getState('totalCount') || qrDsMap?.PROCESSING?.totalCount || 0,
      },
      {
        key: QRActivityMap.PROCESSED,
        tab: intl.get('ssrc.quickInquiry.quickReply.view.message.title.processed').d('已处理'),
        content: this.renderQuickReplyTable(QRActivityMap.PROCESSED),
        count: qrDsMap?.PROCESSED?.getState('totalCount') || qrDsMap?.PROCESSED?.totalCount || 0,
      },
      {
        key: QRActivityMap.QRALL,
        tab: intl.get('ssrc.quickInquiry.quickReply.view.message.title.all').d('全部'),
        content: this.renderQuickReplyTable(QRActivityMap.QRALL),
        count: () => qrDsMap?.QRALL?.getState('totalCount') || qrDsMap?.QRALL?.totalCount || 0,
      },
    ];
  };

  // 筛选器-单据发布时间 默认值范围 approved_date
  getFilterCreateDataRangeDefaultValue = () => {
    const value = [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')];
    return value;
  };

  render() {
    const {
      tab,
      useRF,
      dotShow,
      mergeType,
      RFNum = {},
      RFQNum = {},
      activeKey,
      readMatterDetailVisible = false,
      currentOperateRow,
      preApplyModalVisible,
      prequalGroupingFlag,
      rfxHeaderId,
      supplierCompanyId,
      sourceProjectId,
      prequalGroupHeaderId,
      prequalLineStatus,
      quotationStartDate,
      prequalOnlyRead,
      pretrialPanelVisible,
      clarifyAnswer,
      qualRequirementDetailsVisible,
      supplierCompanyName,
      quotationHeaderId,
      useRFContent,
      biddingHallFlag = 0,
      searchParams = {},
    } = this.state;
    const {
      invitationDS = {},
      openInquiryDS = {},
      needDealDS = {},
      needAttentionDS = {},
      wonBidDS = {},
      notWonBidDS = {},
      notParDS = {},
      rfxAllDS = {},
      onGoingDS = {},
      attentionDS = {},
      notResponseDS = {},
      canParticipateDS = {},
      suggestedDS = {},
      unSuggestedDS = {},
      abandonedDS = {},
      allDS = {},
      custLoading,
      customizeTable,
      // customizeForm,
      customizeTabPane,
      saveConfirmMatterLoading,
      selectPreApplyLoading,
      savePreApplyLoading,
      submitPreApplyLoading,
      fetchPretrialPanelLoading,
      selectPreApplyGroupLoading,
      savePreApplyGroupLoading,
      submitPreApplyGroupLoading,
      supplierQuotation,
      queryIndicateDataLoading,
      supplierQuotation: { code, indicateDataSource = [], pretrialPanelList = [] },
    } = this.props;

    const hiddenQRContent = this.getHiddenQuickReplayContent();

    const commonProps = {
      clarifyAnswer,
      custLoading,
      tab,
      biddingHallFlag,
      customizeTable,
      getCategoryCode,
      bidFlag: this.bidFlag,
      custKey: this.custKey,
      resetState: this.resetState,
      getColumns: !RFList.includes(activeKey) ? this.getRFQColumns : this.getColumns,
      getFilterCreateDataRangeDefaultValue: this.getFilterCreateDataRangeDefaultValue,
      rfxSearchOnRef: this.searchRfxRef,
      searchParams,
    };
    const { rfNum: routeParamRfNum, rfxNum: routeParamRfxNum } = querystring.parse(
      this.props.location.search.substr(1)
    );
    const pendingContainerProps = {
      ...commonProps,
      canParticipateDS,
      notResponseDS,
    };
    const participatoryContainerProps = {
      ...commonProps,
      onGoingDS,
      attentionDS,
    };
    const completedContainerDS = {
      ...commonProps,
      abandonedDS,
      suggestedDS,
      unSuggestedDS,
    };
    const allContainerProps = {
      allDS,
      routeParamRfNum,
      onRef: this.searchRef,
      ...commonProps,
    };

    const RFXAllProps = {
      ...commonProps,
      onRef: this.searchRfxRef,
      rfxAllDS,
      routeParamRfxNum,
      // rfxDetailLineDS: rfxDetailLineDS,
    };

    const RFXOnGoingProps = {
      ...commonProps,
      needDealDS,
      needAttentionDS,
    };

    const RFXFinishedProps = {
      ...commonProps,
      notParDS,
      wonBidDS,
      notWonBidDS,
    };

    const RFXNotParticipateProps = {
      ...commonProps,
      invitationDS,
      openInquiryDS,
      sourceCategoryName: this.sourceCategoryName,
    };

    const readMatterDetailProps = {
      currentOperateRow,
      modalType: 'RFX',
      loading: saveConfirmMatterLoading,
      matterDetail: currentOperateRow?.get('matterDetail') || '',
      onNext: this.onParticipate,
      handleReadMatterCancel: this.handleReadMatterCancel,
      readMatterDetailVisible,
    };

    const pretrialApplicationModalProps = {
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
      prequalGroupingFlag,
      supplierCompanyName, // @protected yongxiang
      quotationHeaderId, // @protected yongxiang
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
    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };
    const pretrialApplicationGroupingModalProps = {
      mergeType,
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
    const qualRequirementDetailsProps = {
      dataSource: indicateDataSource,
      loading: queryIndicateDataLoading,
      visible: qualRequirementDetailsVisible,
      onChange: this.handleQueryIndicateData,
      onCancel: this.handleCloseQulReqDetailModal,
    };

    // activeKey === 'all' 或者 activeKey === 'rfxAll' 当前激活的tab是否是全部页签这样的单表页签
    const tableFixSelfAdaptStyle =
      getTableFixSelfAdaptStyle(activeKey === 'all' || activeKey === 'rfxAll') || {};

    return (
      <Fragment>
        <Header
          title={
            this.bidFlag
              ? intl.get('ssrc.supplierQuotation.view.message.title.supplierTender').d('投标工作台')
              : intl.get(`ssrc.supplierQuotation.view.message.title.supplierReply`).d('供应商回复')
          }
        >
          {this.headerButtons()}
        </Header>
        <Content>
          <div className={style.wrapper} style={tableFixSelfAdaptStyle.wrapperCalcHeight}>
            {customizeTabPane(
              {
                code: this.custKey
                  ? 'SSRC.BID_SUPPLIER_REPLY.RFX_LIST.TABS'
                  : `SSRC.SUPPLIER_REPLY.RF_LIST.TABS`,
                cascade: true,
              },
              <Tabs
                keyboard={false}
                defaultChangeable={false}
                // defaultActiveKey={initStatus.activeKey}
                activeKey={activeKey}
                customizable
                hideOnlyGroup
                customizedCode={`SSRC.${this.custKey}SUPPLIER_REPLY_LIST.TABS`}
                onChange={this.handleChange}
                {...tableFixSelfAdaptStyle.tabsProps}
              >
                {useRF && !this.bidFlag && (
                  <TabGroup
                    tab={this.renderTabTitle(
                      intl.get('ssrc.supplierQuotation.view.message.title.RFI').d('征询书'),
                      useRFContent === 'ALL' ? 'RFI/RFP' : useRFContent
                    )}
                    // tab={`${intl
                    //   .get('ssrc.supplierQuotation.view.message.title.RFI')
                    //   .d('征询书')}(${useRFContent === 'ALL' ? 'RFI/RFP' : useRFContent})`}
                    key="RF"
                    defaultActiveKey="participatory"
                    dot={
                      dotShow &&
                      !RFList.includes(activeKey) &&
                      this.judgeValue(
                        (needDealDS?.totalCount || 0) + (needAttentionDS?.totalCount || 0),
                        RFQNum.onGoingAttention
                      )
                    }
                  >
                    <TabPane
                      tab={
                        <span className={style.bargeContainer}>
                          {`${intl
                            .get('ssrc.inquiryHall.model.inquiryHall.noParticipation')
                            .d('未参与')}`}
                          <Badge
                            className="num-badge"
                            count={
                              (RFNum?.pendingAttention || notResponseDS?.totalCount) > 99
                                ? '99+'
                                : RFNum?.pendingAttention || notResponseDS?.totalCount || 0
                            }
                          />
                        </span>
                      }
                      key="pending"
                      count={() =>
                        RFNum?.pending ||
                        canParticipateDS?.totalCount + notResponseDS?.totalCount ||
                        0
                      }
                      onChange={this.handleTabRFChange}
                    >
                      <PendingContainer {...pendingContainerProps} />
                    </TabPane>
                    <TabPane
                      tab={
                        <span className={style.bargeContainer}>
                          {`${intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}`}
                          <Badge
                            className="num-badge"
                            count={
                              (RFNum?.participatoryAttention || onGoingDS?.totalCount) > 99
                                ? '99+'
                                : RFNum?.participatoryAttention || onGoingDS?.totalCount || 0
                            }
                          />
                        </span>
                      }
                      key="participatory"
                      count={() =>
                        RFNum.participatory || onGoingDS?.totalCount + attentionDS?.totalCount || 0
                      }
                      onChange={this.handleTabRFXChange}
                    >
                      <ParticipatoryContainer {...participatoryContainerProps} />
                    </TabPane>
                    <TabPane
                      tab={`${intl
                        .get('hzero.common.component.excelExport.hd.m.hd.state.done')
                        .d('已结束')}`}
                      key="completed"
                      count={() =>
                        RFNum?.completed ||
                        suggestedDS?.totalCount +
                          unSuggestedDS?.totalCount +
                          abandonedDS?.totalCount ||
                        0
                      }
                      showCount={false}
                    >
                      <CompletedContainer {...completedContainerDS} />
                    </TabPane>
                    <TabPane
                      tab={`${intl.get('ssrc.inquiryHall.button.all').d('全部')}`}
                      key="all"
                      count={RFNum?.all || allDS?.totalCount || 0}
                      showCount={false}
                    >
                      <AllContainer {...allContainerProps} />
                    </TabPane>
                  </TabGroup>
                )}
                <TabGroup
                  // tab={`${this.documentTypeName}${this.bidFlag ? '(BID)' : '(RFQ)'}`}
                  tab={this.renderTabTitle(this.documentTypeName, this.bidFlag ? 'BID' : 'RFQ')}
                  key="RFX"
                  defaultActiveKey="onGoing"
                  dot={
                    dotShow &&
                    RFList.includes(activeKey) &&
                    this.judgeValue(onGoingDS.totalCount, RFNum.participatoryAttention)
                  }
                >
                  <TabPane
                    tab={
                      <span className={style.bargeContainer}>
                        {`${intl
                          .get('ssrc.inquiryHall.model.inquiryHall.noParticipation')
                          .d('未参与')}`}
                        <Badge
                          className="num-badge"
                          count={
                            (RFQNum?.notParticipateAttention || invitationDS?.totalCount) > 99
                              ? '99+'
                              : RFQNum?.notParticipateAttention || invitationDS?.totalCount || 0
                          }
                        />
                      </span>
                    }
                    key="notParticipate"
                    count={() =>
                      RFQNum?.notParticipate ||
                      (invitationDS?.totalCount || 0) + (openInquiryDS?.totalCount || 0) ||
                      0
                    }
                  >
                    <RFXParticipatoryContainer {...RFXNotParticipateProps} />
                  </TabPane>
                  <TabPane
                    tab={
                      <span className={style.bargeContainer}>
                        {`${intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}`}
                        <Badge
                          className="num-badge"
                          count={
                            (RFQNum?.onGoingAttention || needDealDS?.totalCount) > 99
                              ? '99+'
                              : RFQNum?.onGoingAttention || needDealDS?.totalCount || 0
                          }
                        />
                      </span>
                    }
                    key="onGoing"
                    count={() =>
                      RFQNum?.onGoing || needDealDS?.totalCount + needAttentionDS?.totalCount || 0
                    }
                  >
                    <RFXOnGoingContainer {...RFXOnGoingProps} />
                  </TabPane>
                  <TabPane
                    tab={`${intl
                      .get('hzero.common.component.excelExport.hd.m.hd.state.done')
                      .d('已结束')}`}
                    key="finished"
                    count={() =>
                      RFQNum?.finished ||
                      notParDS?.totalCount + wonBidDS?.totalCount + notWonBidDS?.totalCount ||
                      0
                    }
                    showCount={false}
                  >
                    <RFXCompletedContainer {...RFXFinishedProps} />
                  </TabPane>
                  <TabPane
                    tab={`${intl.get('ssrc.inquiryHall.button.all').d('全部')}`}
                    key="rfxAll"
                    showCount={false}
                    count={() => RFQNum?.rfxAll || rfxAllDS?.totalCount || 0}
                  >
                    <RFXAllContainer {...RFXAllProps} />
                  </TabPane>
                </TabGroup>
                {!this.bidFlag && !hiddenQRContent ? (
                  <TabGroup
                    tab={intl
                      .get('ssrc.quickInquiry.quickReply.view.message.title.QuickReply')
                      .d('快速回复')}
                    key="QR"
                    defaultActiveKey={QRActivityMap.QRALL}
                  >
                    {this.quickReplayPaneList().map((quickPane) => {
                      const { content, ...otherProps } = quickPane;
                      return <TabPane {...otherProps}>{content}</TabPane>;
                    })}
                  </TabGroup>
                ) : (
                  ''
                )}
              </Tabs>
            )}
          </div>
          {readMatterDetailVisible && <ReadMatterDetail {...readMatterDetailProps} />}
          {/* 资格预审Modal */}
          {this.renderPretrialApplicationModal(pretrialApplicationModalProps)}
          {qualRequirementDetailsVisible && (
            <QualRequirementDetailsModal {...qualRequirementDetailsProps} />
          )}
          <PretrialPanelModal {...pretrialPanelProps} />
          {prequalGroupingFlag &&
            preApplyModalVisible &&
            (this.custKey ? (
              <BidPretrialApplicationGroupingModal {...pretrialApplicationGroupingModalProps} />
            ) : (
              <PretrialApplicationGroupingModal {...pretrialApplicationGroupingModalProps} />
            ))}
        </Content>
      </Fragment>
    );
  }
}

const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.SUPPLIER_REPLY.RF_LIST.ALL', // 全部
      'SSRC.SUPPLIER_REPLY.RF_LIST.DONE_SUGGESTED', // 已完成-已获选
      'SSRC.SUPPLIER_REPLY.RF_LIST.DONE_UN_SUGGESTED', // 已完成-未获选
      'SSRC.SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED', // 已完成-已放弃
      'SSRC.SUPPLIER_REPLY.RF_LIST.PARTAKE', // 可参与
      'SSRC.SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING', // 待处理-进行中
      'SSRC.SUPPLIER_REPLY.RF_LIST.PEND_UN_RESPONSE', // 待处理-未响应
      'SSRC.SUPPLIER_REPLY.RF_LIST.ATTENTION', // 需要关注
      'SSRC.SUPPLIER_REPLY.RF_LIST.TABS', // RF的TABS
      'SSRC.SUPPLIER_REPLY.RFX_LIST.TABS', // RFX的TABS
      'SSRC.SUPPLIER_REPLY.RFX_LIST.PARTICITION_INVITEME', // 未参与-邀请我的
      'SSRC.SUPPLIER_REPLY.RFX_LIST.PARTICITION_OPENINQUIRY', // 未参与-公开征询
      'SSRC.SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL', // 进行中-需要处理
      'SSRC.SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDATTENTION', // 进行中-需要关注
      'SSRC.SUPPLIER_REPLY.RFX_LIST.FINISH_NOTPAR', // 已结束-未参与
      'SSRC.SUPPLIER_REPLY.RFX_LIST.FINISH_NOTWONBID', // 已结束-未中标
      'SSRC.SUPPLIER_REPLY.RFX_LIST.FINISH_WONBID', // 已结束-已中标
      'SSRC.SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL', // 全部-整单
      'SSRC.SUPPLIER_REPLY.RFX_LIST.RFXALL_DETAIL', // 全部-明细
      ...Object.values(QRListCodes), // 快速回复列表
      ...Object.values(QRListSearchBarCodes), // 快速回复列表-筛选器
      ...Object.values(QRQuotationHeaderCodes), // 快速回复-报价-报价/查看报价-头信息
      QRQuotationHistoryCode, // 快速回复-报价-报价/查看报价-报价历史
      QRLadderHeaderCode, // 快速回复-报价-阶梯报价-头信息
      QRQuotationModalButtonCode, // 快速回复-报价-弹框底部操作按钮
      QRHeaderButtonCode, // 快速回复-头部操作按钮
      ...Object.values(QRLadderLineCodes), // 快速回复-阶梯报价查看/编辑行
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.rf',
        'ssrc.biddingHall',
        'ssrc.scux',
        'ssrc.quickInquiry',
        'hzero.common',
        'scux.ssrc',
      ],
    })(
      connect(({ supplierQuotation, loading }) => ({
        supplierQuotation,
        // Loading: loading.effects['supplierQuotation/fetchEntranceList'],
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
      }))(
        withProps(
          () => {
            const bidFlag = false;
            const custKey = '';
            // RFX
            // 邀请我的
            const invitationDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_INVITEME,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_FILTER`,
                currentTable: 'invite',
                // changeNum,
                custKey,
                bidFlag,
              })
            );
            // 公开征询
            const openInquiryDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_OPENINQUIRY,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.PARTICITION_FILTER`,
                // changeNum,
                currentTable: 'open',
                bidFlag,
              })
            );
            // 需要处理
            const needDealDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDDEAL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_FILTER`,
                // changeNum,
                currentTable: 'processing',
                bidFlag,
              })
            );
            // 需要关注
            const needAttentionDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_NEEDATTENTION,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ONGOING_FILTER`,
                // changeNum,
                currentTable: 'attention',
                bidFlag,
              })
            );
            // 已中标
            const wonBidDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_WONBID,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,
                // changeNum,
                currentTable: 'suggested',
                bidFlag,
              })
            );
            // 未中标
            const notWonBidDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTWONBID,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,
                // changeNum,
                currentTable: 'un-suggested',
                bidFlag,
              })
            );
            // 未参与
            const notParDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_NOTPAR,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.FINISH_FILTER`,
                // changeNum,
                currentTable: 'other',
                bidFlag,
              })
            );
            // 全部-整单
            const rfxAllDS = new DataSet(
              RFQTableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_ALL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER`,
                // changeNum,
                currentTable: 'all',
                bidFlag,
                pageSize: 20,
              })
            );
            // 全部-明细
            // rfxDetailLineDS = new DataSet(
            //   RFQTableDS({
            //     customizeUnitCode:
            //       'SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.RFXALL_DETAIL,SSRC.${custKey}SUPPLIER_REPLY.RFX_LIST.ALL_FILTER',
            //     // changeNum,
            //     currentTable: 'line',
            //   })
            // );

            // RF
            // 进行中-需要处理
            const onGoingDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'processing',
                // changeNum,
              })
            );
            // 进行中-需要关注
            const attentionDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_PROCESSING,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'attention',
                // changeNum,
              })
            );
            // 未参与-邀请我的
            const notResponseDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_UN_RESPONSE,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PEND_FILTER_BAR`,
                currentTable: 'un-response',
                // changeNum,
              })
            );
            // 未参与-公开征询
            const canParticipateDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.PARTAKE_FILTER_BAR`,
                currentTable: 'can-participate',
                // changeNum,
              })
            );
            // 已获选
            const suggestedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'suggested',
                // changeNum,
              })
            );
            // 未获选
            const unSuggestedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_UN_SUGGESTED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'un-suggested',
                // changeNum,
              })
            );
            // 已放弃
            const abandonedDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_ABANDONED,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.DONE_FILTER_BAR`,
                currentTable: 'abandoned',
                // changeNum,
              })
            );
            // 全部
            const allDS = new DataSet(
              TableDS({
                customizeUnitCode: `SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL,SSRC.${custKey}SUPPLIER_REPLY.RF_LIST.ALL_FILTER_BAR`,
                currentTable: 'all',
                // changeNum,
                pageSize: 20,
              })
            );

            // 快速回复 -ds 集合
            // 待处理
            const qrTodoDS = new DataSet(
              quickReplyTableDS({
                stageCode: QRActivityMap.PROCESSING.toUpperCase(),
                dsConfig: {
                  // ds配置
                  primaryKey: 'rfqQuotationId',
                  selection: 'multiple',
                  cacheSelection: true,
                },
              })
            );
            // 已处理
            const qrProcessedDS = new DataSet(
              quickReplyTableDS({ stageCode: QRActivityMap.PROCESSED.toUpperCase() })
            );
            // 全部
            const qrAllDS = new DataSet(quickReplyTableDS({ stageCode: 'ALL' }));

            return {
              invitationDS,
              openInquiryDS,
              needDealDS,
              needAttentionDS,
              wonBidDS,
              notWonBidDS,
              notParDS,
              rfxAllDS,
              onGoingDS,
              attentionDS,
              notResponseDS,
              canParticipateDS,
              suggestedDS,
              unSuggestedDS,
              abandonedDS,
              allDS,
              qrDsMap: { PROCESSING: qrTodoDS, PROCESSED: qrProcessedDS, QRALL: qrAllDS },
            };
          },
          {
            cacheState: true,
            keepOriginDataSet: true,
          }
        )(
          remote(
            {
              code: 'SSRC_RFSUPPLIER_QUOTATION_NEW_LIST',
              name: 'remoteHoc',
            },
            {
              events: {
                // 操作【报价】新增前置校验埋点
                remoteCuxQuotationValidate: () => true,
                // 操作按钮方法埋点
                remoteCuxOperate() {},
                // 单据参与方法埋点
                remoteParticipate(remoteProps = {}) {
                  const { handleParticipate = noop } = remoteProps || {};
                  handleParticipate();
                },
                handleCuxBeforeOnParticipate() {},
              },
              process: {
                handleQuotationButton: undefined,
              },
            }
          )(observer(NewComponent))
        )
      )
    )
  );
};

export default hocComponent(Supplierquotation);
export { Supplierquotation, hocComponent };
