import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Icon } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import queryString from 'querystring';
import { getCurrentUserId, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';
import {
  fetchBeforeQueryData,
  fetchAfterQueryData,
  fetchPreviewData,
  // fetchConfigSheet,
  // createBeforeDirectController,
  // validateBeforeDirectController,
} from '@/services/inquiryHallNewService';

import { fetchBiddingHallConfigResult, getJumpRoutePrefixUrl } from '@/utils/utils';

import WrapContent from './WrapContent';
import WrapBidContent from './WrapBidContent';
import SectionPanel from '../SectionPanel';
import Style from './index.less';

@formatterCollections({
  code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.biddingHall'],
})
export default class index extends Component {
  constructor(props) {
    super(props);
    const { match: { params } = {}, location: { search = '' } = {} } = this.props;
    const { adjustRecordIds = '' } = queryString.parse(search?.substr(1));
    const isSection = adjustRecordIds?.split(',')?.length > 1;
    const routerParams = queryString.parse(this.props?.location?.search?.substr(1));
    this.state = {
      header: {},
      sectionLoading: false,
      routerParams,
      historyHeader: {},
      currentType: params.type,
      wrapContentClassName: '', // 主内容容器样式名
      campareView: false, // 变更对比视图
      userId: getCurrentUserId(),
      organizationId: getCurrentOrganizationId(),
      isSection,
      biddingHallFlag: false, // 是否开启竞价大厅
    };
  }

  custKey =
    getActiveTabKey() === '/ssrc/new-bid-hall' || this.props?.match?.url?.indexOf?.('NEW_BID') > -1
      ? 'BID_'
      : '';

  componentDidMount() {
    this.fetchControllerData();
    this.fetchBiddingHallConfig();
  }

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    const { organizationId } = this.state;
    let biddingHallFlag = null;

    try {
      biddingHallFlag = await fetchBiddingHallConfigResult({
        organizationId,
        groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
        adjustRecordId: rfxId,
        roleOmitFlag: 1,
      });
      if (biddingHallFlag === null) {
        return;
      }
      this.setState({ biddingHallFlag: !!biddingHallFlag });
    } catch (e) {
      throw e;
    }
  };

  @Bind()
  queryMain() {
    this.fetchControllerData();
    if (this.SupplierRef?.supplierListTableDS) {
      this.SupplierRef.initSupplierDS();
      this.SupplierRef.supplierListTableDS.query();
    }
    if (this.itemLineRef?.ItemLineTableDS) {
      this.itemLineRef.initPageQuery();
    }
  }

  async fetchControllerData(changeSectionFlag) {
    const { organizationId } = this.state;
    const {
      onFormLoaded,
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params || {};
    try {
      const result = getResponse(
        await fetchAfterQueryData({
          organizationId,
          adjustRecordId: rfxId,
          customizeUnitCode: `SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_READ,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.PRE_ONLYREAD,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.BASE_INFO_READONLY,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ITEMLINE_ONLYRED,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READO_NLY,${this.getRfxControllerCustomizeCodes()}`,
        })
      );
      if (result) {
        this.setState({
          header: result,
        });
        if (changeSectionFlag) {
          if (this.wrap.initData) {
            this.wrap.initData(result);
          }
          if (this.currentWrap.initData) {
            this.currentWrap.initData(result);
          }
          if (this.historyWrap.initData) {
            this.historyWrap.initData(result);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async fetchHistoryControllerData() {
    const { organizationId } = this.state;
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    try {
      const result = getResponse(
        await fetchBeforeQueryData({
          organizationId,
          adjustRecordId: rfxId,
          customizeUnitCode: `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.SUPPLIER_HIS,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_HIS,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.BASE_INFO_HIS,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ITEMLINE_HIS,SSRC.${
            this.custKey
          }QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READONLY_HIS,${this.getRfxControllerCustomizeCodes()}`,
        })
      );
      if (result) {
        this.setState({
          historyHeader: result,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // 整合明细页面个性化编码
  @Bind()
  getRfxControllerCustomizeCodes() {
    return [
      `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_READONLY`, // 当前-竞价规则
      `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_HISTORY`, // 历史-竞价规则
    ].join(',');
  }

  async preview(props) {
    const { organizationId } = this.state;
    const {
      match: { params = {} },
    } = this.props;
    const { rfxId = null } = params;
    const header = getResponse(
      await fetchPreviewData({
        organizationId,
        adjustRecordId: rfxId,
        customizeUnitCode: `SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_READ,SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.PRE_ONLYREAD,SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.BASE_INFO_READONLY,SSRC.${this.custKey}QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READO_NLY`,
      })
    );
    const WrapContentProps = {
      ...props,
      header,
    };
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      style: { width: '80%' },
      title: intl.get('hzero.common.button.preview').d('预览'),
      children: <WrapContent {...WrapContentProps} />,
      footer: null,
      drawer: true,
    });
  }

  changeCompare() {
    this.fetchHistoryControllerData();
    this.setState({
      campareView: !this.state.campareView,
      wrapContentClassName: this.state.wrapContentClassName ? '' : 'halfWrapper',
    });
  }

  renderParent() {
    const {
      match: { path },
      location = {},
    } = this.props;
    const { backPath } = location.state || {};

    const isPub = path && path.includes('/pub');
    const url = `${getActiveTabKey()}/list`;
    if (isPub) {
      return null;
    } else if (backPath) {
      return backPath;
    }
    return url;
  }

  currentWrap = {};

  historyWrap = {};

  wrap = {};

  @Bind()
  beforeOpenSection() {
    this.setState({
      sectionLoading: true,
    });
    return true;
  }

  @Bind()
  getSection(ref) {
    this.SectionInfo = ref || {};
  }

  SectionInfo = {};

  @Bind
  async afterOpenSection(sourceHeaderId, saveFlag, adjustRecordId) {
    const { dispatch, match, location } = this.props;
    const { routerParams } = this.state;
    const search = queryString.stringify({
      ...routerParams,
    });
    const { openedFlag } = this.SectionInfo.state;
    sessionStorage.setItem('openedFlag', openedFlag);
    const activeTabKey = getJumpRoutePrefixUrl(location?.pathname);

    if (activeTabKey && (!match?.params?.type || !adjustRecordId)) return;

    let url = `/pub${activeTabKey}/new-rfx-detail-controller-detail/${match.params.type}/${adjustRecordId}`;

    const pathArr = location?.pathname?.split('/') || [];
    if (['RFQ', 'NEW_BID'].includes(pathArr[pathArr.length - 1])) {
      url = `${url}/${pathArr[pathArr.length - 1]}`;
    }

    try {
      await dispatch(
        routerRedux.replace({
          pathname: url,
          search,
        })
      );
      this.queryMain();
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        sectionLoading: false,
      });
    }
  }

  render() {
    const {
      match,
      history,
      onFormLoaded,
      match: {
        url,
        params: { rfxId = null },
      },
    } = this.props;

    const {
      header = {},
      userId,
      organizationId,
      campareView,
      wrapContentClassName,
      currentType,
      historyHeader,
      isSection,
      sectionLoading,
      biddingHallFlag,
      // previewHeader,
    } = this.state;

    const WrapContentProps = {
      match,
      header,
      userId,
      onFormLoaded,
      organizationId,
      history,
      rfxId,
      isSection,
      currentType,
      wrapContentClassName,
      biddingHallFlag,
      onRef: (ref) => {
        this.wrap = ref;
      },
    };

    const CurrentWrapContentProps = {
      match,
      header,
      userId,
      onFormLoaded,
      organizationId,
      history,
      rfxId,
      isSection,
      currentType,
      wrapContentClassName,
      currentMode: 'current',
      biddingHallFlag,
      disWrap: () => this.historyWrap, // 与之对应的wrap
      onRef: (ref) => {
        this.currentWrap = ref;
      },
    };

    const HistoryContentProps = {
      match,
      header: historyHeader,
      userId,
      organizationId,
      history,
      rfxId,
      isSection,
      currentType,
      onFormLoaded,
      wrapContentClassName,
      currentMode: 'history',
      disWrap: this.currentWrap,
      biddingHallFlag,
      onRef: (ref) => {
        this.historyWrap = ref;
      },
    };

    // const PreViewContentProps = {
    //   match,
    //   // header: previewHeader,
    //   userId,
    //   organizationId,
    //   history,
    //   rfxId,
    //   currentType: 'detail',
    //   currentMode: 'preview',
    //   wrapContentClassName,
    // };

    const SectionPanelProps = {
      isSection,
      sectionLoading,
      onRef: this.getSection,
      parentPage: {
        queryParams: {
          type: 'approval',
          adjustRecordId: rfxId,
        },
      },
      beforeOpenSection: this.beforeOpenSection,
      afterOpenSection: this.afterOpenSection,
      switchNotification: intl
        .get('ssrc.inquiryHall.model.inquiryHall.requiredItemsNotFilledIn')
        .d('有必填项未填，无法保存当前页面信息，是否确认切换页面?'),
    };

    const bidFlag = getActiveTabKey() === '/ssrc/new-bid-hall' || url.indexOf('NEW_BID') > -1;

    const controllerTitle = bidFlag
      ? intl.get('ssrc.common.title.BID').d('招投标')
      : intl.get('ssrc.common.title.RFX').d('询报价');

    return (
      <div className={Style.controllerDetailContainer}>
        <Header
          backPath={this.renderParent()}
          title={`${intl
            .get('ssrc.quoController.view.message.panel.commonRFxControl', { controllerTitle })
            .d('{controllerTitle}控制')}-${header?.rfxHeaderBaseInfoAdjustDTO?.rfxNum || ''}`}
        >
          {!campareView ? (
            <Button onClick={() => this.changeCompare()} style={{ border: 0, color: 'black' }}>
              <Icon type="compare" style={{ fontSize: '14px', marginRight: '5px' }} />
              {intl.get('ssrc.inquiryHall.model.inquiryHall.changeCompare').d('变更对比')}
            </Button>
          ) : (
            <Button onClick={() => this.changeCompare()} style={{ border: 0, color: 'black' }}>
              <Icon
                type="cancel"
                style={{ fontSize: '14px', marginRight: '5px', marginBottom: '2px' }}
              />
              {intl.get('ssrc.inquiryHall.model.inquiryHall.closeCompare').d('关闭对比')}
            </Button>
          )}
          {/* {currentType === 'approval' && (  // 预览功能还没根据需求去开发，这里新招标改造先不做处理，改造的时候要加上新招标
            <Button onClick={() => this.preview(PreViewContentProps)}>
              <Icon type="find_in_page" /> {intl.get('hzero.common.button.preview').d('预览')}
            </Button>
          )} */}
        </Header>
        <div className={Style['controller-approval-wrapper']}>
          <SectionPanel {...SectionPanelProps}>
            <Content style={{ margin: '8px', padding: '0px' }}>
              <div className={Style['quotation-controller-approval-content']}>
                {campareView ? (
                  <div className="compare">
                    {bidFlag ? (
                      <WrapBidContent {...CurrentWrapContentProps} />
                    ) : (
                      <WrapContent {...CurrentWrapContentProps} />
                    )}
                    <div className="divide" />
                    {!isEmpty(historyHeader) &&
                      (bidFlag ? (
                        <WrapBidContent {...HistoryContentProps} />
                      ) : (
                        <WrapContent {...HistoryContentProps} />
                      ))}
                  </div>
                ) : (
                  !isEmpty(header) &&
                  (bidFlag ? (
                    <WrapBidContent {...WrapContentProps} />
                  ) : (
                    <WrapContent {...WrapContentProps} />
                  ))
                )}
              </div>
            </Content>
          </SectionPanel>
        </div>
      </div>
    );
  }
}
