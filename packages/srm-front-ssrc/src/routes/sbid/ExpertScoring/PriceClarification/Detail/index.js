import React, { Component } from 'react';
import { Button, DataSet, Form, TextField, TextArea, DateTimePicker, } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import classnames from 'classnames';
import querystring from 'querystring';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { compose } from 'lodash';

import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { closeTab } from 'utils/menuTab';
import CountDown from '@/routes/ssrc/components/CountDown';

import { finishedPriceClarification } from '@/services/expertScoringService';

import ScoreDetailModal from '@/routes/share/RoundQuotationAllTable/ScoreDetailModal';
import CommonStyles from '@/routes/share/styles/customPage.less';
import { INQUIRY, BID, getSourceCategoryName, getQuotationName } from '@/utils/globalVariable';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText } from '@/utils/utils';
import SupplierQuoteDetailTable from './SupplierQuoteDetailTable';
import { HeaderFormDS } from './FormDS';
import styles from '../index.less';

class Detail extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      pageLoading: false, // page loading
      scoreDetailModalVisible: false, // 评分明细Modal
      doubleUnitFlag: false,
    };
  }

  SupplierQuoteTableRef = null;

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = (this.props.sourceKey || INQUIRY) === BID;

  HeaderFormDS = new DataSet(HeaderFormDS({ sourceKey: this.sourceKey }));

  componentDidMount() {
    this.queryDoubleUnit();
    this.initPage();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      location: { search },
    } = prevProps || {};
    const PrevRouterParams = querystring.parse(search.substr(1)) || {};
    const { clarifyNotifyId: prevClarifyNotifyId = null } = PrevRouterParams;
    const clarifyNotifyId = this.getLocationSearch('clarifyNotifyId');

    return clarifyNotifyId && clarifyNotifyId !== prevClarifyNotifyId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  async initPage() {
    const RouterParams = this.getLocationSearch();
    const { sourceFrom, clarifyNotifyId = null } = RouterParams;

    await this.HeaderFormDS.setQueryParameter('commonProps', {
      clarifyNotifyId,
      sourceFrom,
      organizationId: this.organizationId,
    });
    await this.HeaderFormDS.query();
    this.forceUpdate();
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  // table ref
  @Bind()
  onTableRef(ref) {
    this.SupplierQuoteTableRef = ref;
  }

  // toggle loadding
  togglePageLoading(pageLoading = false) {
    this.setState({
      pageLoading,
    });
  }

  // render form
  renderForm() {
    const { customizeForm } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_CREATE_DETAIL`,
        dataSet: this.HeaderFormDS,
      },
      <Form labelLayout="float" columns={2} dataSet={this.HeaderFormDS}>
        <TextField name="clarifyNotifyNum" />
        <TextField name="clarifyNotifyStatusMeaning" />
        <TextField name="clarifyNotifyTitle" />
        <TextField name="companyName" />
        <TextField name="sourceNum" />
        <DateTimePicker name="replyEndDate" />
        <TextField name="submittedByName" />
        <DateTimePicker name="submittedDate" />
        <TextArea colSpan={2} rows={3} name="replyRequirement" resize />
        <TextArea colSpan={2} rows={3} name="initiationReason" resize />
      </Form>
    );
  }

  // 返回列表页
  directionPriceClarificationList() {
    const { history } = this.props;

    const path = this.getBackpath();
    history.push(path);
    closeTab('/ssrc/price-clarification/detail');
  }

  // get location
  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  @Bind()
  async finishedPriceClarification() {
    const { current } = this.HeaderFormDS || {};
    if (!current) {
      return;
    }

    const headerData = current.toData() || {};
    const { clarifyNotifyId } = headerData;

    this.togglePageLoading(true);
    try {
      let result = await finishedPriceClarification({
        clarifyNotifyId,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      this.togglePageLoading();
      this.directionPriceClarificationList();
    } catch (e) {
      throw e;
    }
  }

  // get back path
  getBackpath() {
    const RouterParams = this.getLocationSearch();
    const { originBackPath = null, originBackPathList = null } = RouterParams;

    if (originBackPathList && originBackPathList !== 'null') {
      return originBackPathList;
    }
    if (originBackPath && originBackPath !== null) {
      return originBackPath;
    }
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'inquiryHall/fetchScoreDetail',
      payload: {
        organizationId: this.organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
      },
    });
  }

  @Bind()
  viewScoreDetail(e, data) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    this.setState({
      scoreDetailModalVisible: true,
    });

    this.fetchScoreDetil(data);
  }

  getBiddingFieldsFromHeader = () => {
    const { current } = this.HeaderFormDS || {};

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
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    this.setState({
      scoreDetailModalVisible: false,
    });
  }

  render() {
    const { pageLoading = false, scoreDetailModalVisible, doubleUnitFlag } = this.state;
    const {
      inquiryHall: { scoreDetailList = {} },
      fetchScoreDetailLoading,
      customizeTable = () => {},
    } = this.props;
    const RouterParams = this.getLocationSearch();
    const {
      clarifyNotifyId = null,
      sourceHeaderId,
      sourceFrom = null,
      viewOnlyPage = null,
      isReadOnly = 'N',
    } = RouterParams;

    const { replyEndDate, sysDate } =
      this.HeaderFormDS?.current?.get(['replyEndDate', 'sysDate']) || {};

    const SupplierProps = {
      organizationId: this.organizationId,
      sourceKey: this.sourceKey,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyId,
      onTableRef: this.onTableRef,
      viewScoreDetail: this.viewScoreDetail,
      customizeTable,
      quotationName: getQuotationName(this.bidFlag),
      doubleUnitFlag,
      headerFormDS: this.HeaderFormDS,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
    };

    const CurrentStatus = this.HeaderFormDS.current
      ? this.HeaderFormDS.current.get('clarifyNotifyStatus')
      : null;

    return (
      <>
        <Header
          title={intl.get('ssrc.expertScoring.view.title.clarifyDetail').d('澄清函详情')}
          backPath={this.getBackpath()}
        >
          {CurrentStatus &&
          !(
            ['FINISHED', 'DEADLINE', 'APPROVING', 'REJECTED', 'REVOKED', 'FAILED'].includes(
              CurrentStatus
            ) || viewOnlyPage === '1'
          ) &&
          isReadOnly !== 'Y' ? (
            <Button
              icon="publish_cancel"
              onClick={this.finishedPriceClarification}
              wait={500}
              color="primary"
              waitType="debounce"
              loading={pageLoading}
            >
              {intl.get('ssrc.inquiryHall.view.button.finishedPriceClarification').d('结束澄清')}
            </Button>
          ) : null}
        </Header>
        <Content
          className={classnames(
            CommonStyles['ssrc-common-container'],
            CommonStyles['ssrc-override-c7n-ui']
          )}
        >
          <div className={styles['ssrc-price-clarification-basicFormTitle']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonRfxBasicInfo', {
                  sourceCategoryName: getSourceCategoryName(this.bidFlag),
                })
                .d('{sourceCategoryName}基础信息')}
            </h3>
            {sysDate &&
              replyEndDate &&
              CurrentStatus &&
              !['APPROVING', 'REJECTED', 'REVOKED', 'FAILED'].includes(CurrentStatus) && (
                <div>
                  {intl
                    .get('ssrc.inquiryHall.view.PriceClarificationDeadLine')
                    .d('价格澄清截止时间')}
                  &nbsp;&nbsp;
                  <CountDown sysNow={sysDate} endTime={replyEndDate} />
                </div>
              )}
          </div>
          <div className={styles['ssrc-price-clarification-form']}>{this.renderForm()}</div>

          <div className={CommonStyles['m-t-m']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonSupplierQuoteDetails', {
                  quotationName: getQuotationName(this.bidFlag),
                })
                .d('供应商{quotationName}详情')}
            </h3>
            <SupplierQuoteDetailTable {...SupplierProps} />
          </div>
          {scoreDetailModalVisible && <ScoreDetailModal {...scoreDetailProps} />}
        </Content>
      </>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) =>
  compose(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      fetchScoreDetailLoading: loading.effects['inquiryHall/fetchScoreDetail'],
    })),
    formatterCollections({
      code: ['ssrc.expertScoring', 'ssrc.inquiryHall', 'ssrc.common'],
    }),
    WithCustomizeC7N({
      unitCode: [
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_CREATE_DETAIL`,
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_DETAIL`,
        `SSRC.${type}_HALL.CLARIFICATION.QUOTATION_LADDER_LEVER_DETAIL`,
      ],
    })
  )(Comp);

export default HOCComponent(Detail);

export { HOCComponent, Detail };
