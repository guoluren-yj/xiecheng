/**
 * inquiryHall - 寻源服务/寻源大厅-核价查看
 * @date: 2024-09-01
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { Collapse, Icon, Tag as TagH0 } from 'hzero-ui';
import { Modal as c7nModal, DataSet } from 'choerodon-ui/pro';
import { Spin, Tooltip } from 'choerodon-ui';
import { isArray, isEmpty, noop } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { queryBidFileTemplateConfig } from '@/utils/utils';
import { fetchInquiryHeaderDetail } from '@/services/inquiryHallService';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import LadderLevelCheckPrice from '@/routes/ssrc/components/LadderLevel/CheckPriceLadder';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import { querySetting } from '@/services/bidHallService';
import { ReactComponent as NoData } from '@/assets/Illustrate_none_medium.svg';

import CheckPriceTabs from './CheckPriceTabs';
import { HocComponent } from './standardCompEnhancerCreator';

import { basicInfoDataSet } from './store/basicInfoDataSet';

import BasicInfoForm from './Header/BasicInfoForm';
import CostRemarkForm from './Header/CostRemarkForm';

const { Panel } = Collapse;

class CheckPriceNewDetail extends PureComponent {
  constructor(props) {
    super(props);

    const { rfx, remote } = props || {};
    const { bidFlag } = rfx || {};

    this.attachmentTableRef = {};

    this.ladderLevelModalKey = c7nModal.key();
    this.applicationScopeModalKey = c7nModal.key();

    // SSRC_DETAIL_CHECK_PRICE_NEW
    const headerInfoDsProp = basicInfoDataSet({ bidFlag });

    this.basicInfoDS = new DataSet(
      remote
        ? remote.process('SSRC_DETAIL_CHECK_PRICE_NEW_PROCESS_HEADER_DS', headerInfoDsProp, {
            bidFlag,
            that: this,
          })
        : headerInfoDsProp
    );

    this.state = {
      header: {},
      pageLoading: false,
      CheckPriceCollapseKeys: ['basicInfo', 'costComment', 'details', 'cuxTab'],
      settings: {},
      fileTemplateManageFlag: 0, // 招标文件tab
    };
  }

  fetchIntelligentResult = () => {
    const { fetchIntelligentPreReview } = this.props;

    if (fetchIntelligentPreReview) {
      fetchIntelligentPreReview({
        categoryCode: 'RFX_CHECK',
        newFlag: 1,
      });
    }
  };

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchRfxDetail();
      this.fetchIntelligentResult();
    }
  }

  componentDidMount() {
    this.initPage();
  }

  togglePageLoading(pageLoading = false) {
    this.setState({
      pageLoading,
    });
  }

  getCurrentPageSymbol = () => {
    const { pubRouterAddParams = noop } = this.props;

    const routers = pubRouterAddParams() || {};

    const data = {
      currentPageType: 'INQUIRY_HALL_NEW_DETAIL_CHECK_PRICE_DETAIL_NODE_NEW',
      ...routers,
    };

    return data;
  };

  initPage = () => {
    this.fetchRfxDetail();
    this.querySettings();
    this.queryFileTemplateManageSheetConfig();
    this.fetchIntelligentResult();
  };

  // 查询招标文件模板管理配置
  queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    this.setState({
      fileTemplateManageFlag: flag,
    });
  };

  querySettings = async () => {
    try {
      let result = await querySetting({
        '011107': '011107', // ip校验
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.setState({ settings: result });
    } catch (e) {
      throw e;
    }
  };

  fetchRfxDetail = async () => {
    const { path, organizationId, rfxHeaderId, routerParam, onFormLoaded } = this.props;

    idValidation(rfxHeaderId);

    const permanentParams = this.getCurrentPageSymbol() || {}; // 固定参数

    try {
      let res = await fetchInquiryHeaderDetail({
        routerParam,
        organizationId,
        rfxHeaderId,
        path,
        customizeUnitCode: this.getCustomizeUnitCode(['basicForm', 'costForm', 'attachments']),
        ...permanentParams,
      });
      res = getResponse(res);
      if (!res) {
        return;
      }
      res = res || {};
      this.setState({
        header: res,
      });

      this.basicInfoDS.loadData([res]);
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    }
  };

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  // 阶梯报价
  @Throttle(1000)
  viewLadderLevelQuota = (data) => {
    const { bidFlag, doubleUnitFlag } = this.props;
    const { record } = data || {};

    if (!record) {
      return;
    }

    const Props = {
      bidFlag,
      doubleUnitFlag,
      record,
      uiType: 'c7n',
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: this.ladderLevelModalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
      style: {
        width: 742,
      },
      children: <LadderLevelCheckPrice {...Props} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const { organizationId } = this.props;
    const { header = {} } = this.state;
    const { queryParams = {} } = param || {};
    const { rfxHeaderId, applicationScopeFlag } = header || {};

    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag,
        ...(queryParams || {}),
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: this.applicationScopeModalKey,
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1090px' },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  rfxTitleForm() {
    const { customizeForm = () => {}, rfx = {}, remote } = this.props;

    const formProps = {
      remote,
      basicInfoDS: this.basicInfoDS,
      customizeForm,
      unitCode: this.getCustomizeUnitCode('basicForm'),
      ...rfx,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
    };

    return <BasicInfoForm {...formProps} />;
  }

  renderHeaderTitle = () => {
    const { header = {} } = this.state;
    const { rfxNum, rfxTitle, quotationRoundNumber } = header || {};

    const numTitle =
      rfxNum && rfxTitle ? `${header.rfxNum}-${header.rfxTitle}` : rfxTitle || rfxNum || '';

    const children = (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            // float: 'left',
            paddingLeft: '8px',
          }}
        >
          {rfxNum}
          <Tooltip title={numTitle}>{rfxTitle ? `-${rfxTitle}` : ''}</Tooltip>
        </span>
        <TagH0 style={{ marginLeft: '15px', width: '65px' }}>
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：
            {quotationRoundNumber || 1}
          </span>
        </TagH0>
      </div>
    );

    return children;
  };

  getBiddingFieldsFromHeader = () => {
    const { current } = this.basicInfoDS || {};

    const biddingData = current
      ? current.get(['biddingMode', 'biddingTarget', 'biddingFlag', 'sourceCategory'])
      : {};

    return biddingData || {};
  };

  getBiddingHall = () => {
    const { biddingFlag, sourceCategory } = this.getBiddingFieldsFromHeader();

    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    return newBiddingFlag;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const { biddingMode } = this.getBiddingFieldsFromHeader();
    const flag =
      biddingMode === 'DUTCH_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  getTotalPriceFlag = () => {
    const { biddingTarget } = this.getBiddingFieldsFromHeader();

    const flag = biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.japanBiddingTotalPrice() || this.dutchBiddingTotalPrice();

    return flag;
  };

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const { customizeForm = () => {}, isSection, rfx = {} } = this.props;
    const formProps = {
      basicInfoDS: this.basicInfoDS,
      customizeForm,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      ...rfx,
      isSection,
    };

    return <CostRemarkForm {...formProps} />;
  }

  renderCheckPriceTabs = () => {
    const {
      organizationId,
      customizeTable = () => {},
      customizeTabPane,
      showQuotationDetail,
      rfxHeaderId,
      checkWay,
      rfx = {},
      rfx: { bidFlag = false },
      currentStep = '',
      getHocInstance,
      doubleUnitFlag = false,
      pubRouterAddParams = () => {},
      history,
      newQuotationFlag = false,
      sslmLifeCycleFlag = true,
      remote,
    } = this.props;
    const { header = {}, settings = {}, fileTemplateManageFlag } = this.state;
    const { unitCodeSymbol } = rfx || {};

    const CheckPriceTabsProps = {
      ...this.props,
      header,
      doubleUnitFlag,
      currentStep,
      rfxHeaderId,
      checkWay,
      customizeTable,
      customizeTabPane,
      organizationId,
      showQuotationDetail,
      rfx,
      viewLadderLevel: this.viewLadderLevelQuota,
      bidFlag,
      unitCodeSymbol,
      getHocInstance,
      settings,
      pubRouterAddParams,
      history,
      newQuotationFlag,
      sslmLifeCycleFlag,
      remote,
      basicInfoDS: this.basicInfoDS,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      getCurrentPageSymbol: this.getCurrentPageSymbol,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
      fileTemplateManageFlag,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
    };

    return <CheckPriceTabs {...CheckPriceTabsProps} />;
  };

  renderPanelArrawSymbol = (data) => {
    const { CheckPriceCollapseKeys = [] } = this.state;
    const { currentKey } = data || {};

    const opened = CheckPriceCollapseKeys.includes(currentKey);

    return (
      <>
        <a>
          {opened
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={opened ? 'up' : 'down'} />
      </>
    );
  };

  getTabPaneArray() {
    const { rfx, isTechExpertFlag = false } = this.props;
    const { checkPriceName } = rfx || {};

    const panels = [
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            {this.renderHeaderTitle()}
            {this.renderPanelArrawSymbol({ currentKey: 'basicInfo' })}
          </React.Fragment>
        }
        key="basicInfo"
      >
        {this.rfxTitleForm()}
      </Panel>,
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}</h3>
            {this.renderPanelArrawSymbol({ currentKey: 'costComment' })}
          </React.Fragment>
        }
        key="costComment"
      >
        {this.rfxCostRemarkForm()}
      </Panel>,
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {intl
                .get('ssrc.inquiryHall.view.title.checkPriceDetailRfxBid', { checkPriceName })
                .d('{checkPriceName}详情')}
            </h3>
            {this.renderPanelArrawSymbol({ currentKey: 'details' })}
          </React.Fragment>
        }
        key="details"
      >
        {isTechExpertFlag ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <NoData />
            <div style={{ marginTop: '16px', color: '#868d9c' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.temporarilyNoData`).d('暂无数据')}
            </div>
          </div>
        ) : (
          this.renderCheckPriceTabs()
        )}
      </Panel>,
    ];

    return panels;
  }

  /**
   * 获取对应的个性化编码
   * @param type null | string | string[]
   * @return null | string
   *  */
  getCustomizeUnitCode = (type = null) => {
    const { rfx = {} } = this.props;
    const { bidFlag } = rfx || {};

    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['collapse', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_HEADER_COLLAPSE'],
      ['tabs', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_DETAIL_TABS'],
      ['basicForm', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_HEADER'],
      ['costForm', 'SSRC.INQUIRY_HALL_DETAIL.COST.REMARK'],
      ['supplierTable', 'SSRC.INQUIRY_HALL_DETAIL.SUPPLIER_DETAIL'],
      ['itemTable', 'SSRC.INQUIRY_HALL_DETAIL.ITEM_DETAIL'],
      ['allQuotationTable', 'SSRC.INQUIRY_HALL_DETAIL.ALL_QUOTATION'],
      ['attachments', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.ATTACHMENT'],
      ['winBid', 'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.WIN_BID_DETAIL'],
    ]);

    const BidCodeMap = new Map([
      ['collapse', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_HEADER_COLLAPSE'],
      ['tabs', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_DETAIL_TABS'],
      ['basicForm', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_HEADER'],
      ['costForm', 'SSRC.INQUIRY_BID_DETAIL.COST.REMARK'],
      ['supplierTable', 'SSRC.INQUIRY_BID_DETAIL.SUPPLIER_DETAIL'],
      ['itemTable', 'SSRC.INQUIRY_BID_DETAIL.ITEM_DETAIL'],
      ['allQuotationTable', 'SSRC.INQUIRY_BID_DETAIL.ALL_QUOTATION'],
      ['attachments', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE.ATTACHMENT'],
      ['winBid', 'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE.WIN_BID_DETAIL'],
    ]);

    const CodeDataMap = !bidFlag ? RfxCodeMap : BidCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  render() {
    const { customizeCollapse, custLoading } = this.props;
    const { CheckPriceCollapseKeys = [], pageLoading = false } = this.state;

    return (
      <div id="ssrc-new-inquiry-hall-detail-check-price-new-wrapper">
        <Spin spinning={pageLoading}>
          {customizeCollapse(
            {
              code: this.getCustomizeUnitCode('collapse'),
            },
            <Collapse
              onChange={(keys) => this.setCollapseByKey('CheckPriceCollapseKeys', keys)}
              className="form-collapse"
              custLoading={custLoading}
              defaultActiveKey={CheckPriceCollapseKeys}
            >
              {this.getTabPaneArray() || []}
            </Collapse>
          )}
        </Spin>
      </div>
    );
  }
}

export { HocComponent, CheckPriceNewDetail };
export default HocComponent(CheckPriceNewDetail);
