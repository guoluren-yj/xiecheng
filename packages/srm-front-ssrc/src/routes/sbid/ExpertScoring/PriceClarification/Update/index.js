import React, { Component } from 'react';
import { Button, DataSet, Form, TextField, TextArea, DateTimePicker, Lov } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';
import { observer } from 'mobx-react';

import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { closeTab } from 'utils/menuTab';
import remote from 'hzero-front/lib/utils/remote';

import { INQUIRY, BID, getSourceCategoryName, getQuotationName } from '@/utils/globalVariable';
import {
  fetchPriceClarificationDetailCancel,
  fetchPriceClarificationDetailSave,
  fetchPriceClarificationDetailSubmit,
} from '@/services/expertScoringService';
import { fetchHeaderInfo } from '@/services/inquiryHallService';
import { queryEnableDoubleUnit } from '@/services/commonService';

import CommonStyles from '@/routes/share/styles/customPage.less';
import { isText } from '@/utils/utils';
import SupplierQuoteDetailTable from './SupplierQuoteDetailTable';
import { HeaderFormDS } from '../FormDS';
import styles from '../index.less';

class Update extends Component {
  constructor(props) {
    super(props);
    const { priceRemote, sourceKey } = props || {};

    this.organizationId = getCurrentOrganizationId();
    this.sourceKey = sourceKey || INQUIRY;
    this.bidFlag = this.sourceKey === BID;

    const headerForm = HeaderFormDS({ sourceKey: this.sourceKey });
    this.HeaderFormDS = new DataSet(
      priceRemote
        ? priceRemote.process(
            'SSRC_PRICE_CLARIFICATION_UPDATE_PROCESS_HEADER_FORM_DS',
            headerForm,
            {}
          )
        : headerForm
    );

    this.state = {
      pageLoading: false, // page loading
      doubleUnitFlag: false,
    };
  }

  SupplierQuoteTableRef = null;

  componentDidMount() {
    this.queryDoubleUnit();
    this.initPage();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      history: {
        location: { search },
      },
    } = prevProps || {};
    const PrevRouterParams = querystring.parse(search.substr(1)) || {};
    const {
      sourceHeaderId: prevSourceHeaderId = null,
      clarifyNotifyId: preClarifyNotifyId = null,
    } = PrevRouterParams;
    const sourceHeaderId = this.getLocationSearch('sourceHeaderId');
    const clarifyNotifyId = this.getLocationSearch('clarifyNotifyId');

    return (
      (sourceHeaderId && prevSourceHeaderId && sourceHeaderId !== prevSourceHeaderId) ||
      (clarifyNotifyId && clarifyNotifyId !== preClarifyNotifyId)
    );
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  async initPage() {
    const RouterParams = this.getLocationSearch();
    const { sourceHeaderId, sourceFrom, clarifyNotifyId = null } = RouterParams;

    this.togglePageLoading(true);

    if (!clarifyNotifyId || clarifyNotifyId === 'null') {
      let header = await fetchHeaderInfo({
        organizationId: this.organizationId,
        rfxHeaderId: sourceHeaderId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.FORM_CREATE_EDIT`,
      });
      header = getResponse(header);
      if (!header) {
        return;
      }
      header = {
        ...header,
        sourceNum: header.rfxNum || header.bidNum,
      };
      this.HeaderFormDS.loadData([header]);
      this.forceUpdate();
    } else {
      this.HeaderFormDS.setQueryParameter('commonProps', {
        clarifyNotifyId,
        sourceFrom,
        organizationId: this.organizationId,
      });
      this.HeaderFormDS.query();
    }

    this.togglePageLoading();
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
    const { customizeForm = () => {} } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.FORM_CREATE_EDIT`,
        dataSet: this.HeaderFormDS,
      },
      <Form labelLayout="float" columns={2} dataSet={this.HeaderFormDS}>
        <TextField name="clarifyNotifyTitle" />
        <Lov name="companyLov" />
        <TextField name="sourceNum" />
        <DateTimePicker name="replyEndDate" />
        <TextArea colSpan={2} rows={3} name="replyRequirement" resize />
        <TextArea colSpan={2} rows={3} name="initiationReason" resize />
      </Form>
    );
  }

  async validateSubmitData() {
    const { current } = this.HeaderFormDS;
    if (!current) {
      return false;
    }

    current.set('status', 'update');
    const FormValidate = await this.HeaderFormDS.validate();

    return FormValidate;
  }

  // collection form data to operate
  integrationHeaderFormData() {
    const { current } = this.HeaderFormDS;
    if (!current) {
      return null;
    }

    const header = current.toData();
    return header;
  }

  // supplier item table data
  integrationTableData() {
    const tableRef = this.SupplierQuoteTableRef.state || {};
    const { expandIds = {} } = tableRef;

    const currentPageQuotationLines = [];
    const quotationLines = [];
    if (isEmpty(expandIds)) {
      return quotationLines;
    }

    Object.keys(expandIds).forEach((key) => {
      const { ds = null } = expandIds[key];

      if (!ds || isEmpty(ds)) {
        return;
      }

      const tableData = ds.toData();
      currentPageQuotationLines.push(...tableData);
      const { selected } = ds;
      const selectData = selected.map((ele) => ele.toJSONData());
      quotationLines.push(...selectData);
      const unSelectList = ds.getState('unSelectList')?.toJSON() || [];
      const currentSelectList = [...selectData, ...unSelectList];
      currentPageQuotationLines.push(...currentSelectList);

      // ds.forEach((record) => {
      //   const isLineSelected = record.isSelected;
      //   if (!isLineSelected) {
      //     return;
      //   }

      //   const recordData = record.toData();
      //   quotationLines.push(recordData);
      // });
    });
    return {
      currentPageQuotationLines,
      quotationLines,
    };
  }

  // submit
  @Bind()
  @Throttle(1000)
  async handleSubmit() {
    const RouterParams = this.getLocationSearch();
    const { sourceFrom, sourceHeaderId = null } = RouterParams;

    const validateResult = await this.validateSubmitData();
    const clarifyIssue = this.integrationHeaderFormData();
    const { quotationLines = [], currentPageQuotationLines = [] } = this.integrationTableData();

    if (!validateResult) {
      return;
    }

    if (isEmpty(quotationLines)) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.pleaseSelectedQuestions')
          .d('请在供应商报价详情中选择需要提交的问题'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await fetchPriceClarificationDetailSubmit({
        ...clarifyIssue,
        sourceFrom,
        sourceHeaderId,
        clarifyNotifyType: 'PRICE',
        quotationLines,
        currentPageQuotationLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.FORM_CREATE_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_EDIT`,
      });
      result = getResponse(result);
      this.togglePageLoading();
      if (!result) {
        return;
      }

      this.directionPriceClarificationList();
    } catch (e) {
      throw e;
    }
  }

  // save
  @Bind()
  @Throttle(1000)
  async handleSave() {
    const { history = {} } = this.props;
    const {
      location: { pathname },
    } = history;
    const RouterParams = this.getLocationSearch();
    const { sourceFrom, sourceHeaderId = null } = RouterParams;

    const validateResult = await this.validateSubmitData();
    const clarifyIssue = this.integrationHeaderFormData();
    const { quotationLines = [], currentPageQuotationLines = [] } = this.integrationTableData();

    if (!validateResult) {
      return;
    }

    if (isEmpty(quotationLines)) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.pleaseSelectedQuestions')
          .d('请在供应商报价详情中选择需要提交的问题'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await fetchPriceClarificationDetailSave({
        ...clarifyIssue,
        sourceFrom,
        sourceHeaderId,
        clarifyNotifyType: 'PRICE',
        quotationLines,
        currentPageQuotationLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.FORM_CREATE_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_EDIT`,
      });
      result = getResponse(result);
      this.togglePageLoading();
      if (!result) {
        return;
      }

      const { clarifyNotifyId = null } = result || {};
      if (this.isNewPriceClarification()) {
        const newSearch = querystring.stringify({
          ...RouterParams,
          clarifyNotifyId,
        });
        history.push({
          pathname,
          search: newSearch,
        });
      }

      this.HeaderFormDS.setQueryParameter('commonProps', {
        clarifyNotifyId,
        sourceFrom,
        organizationId: this.organizationId,
      });
      this.HeaderFormDS.query();
      this.SupplierQuoteTableRef.fetchSupplierLine(
        {},
        {
          sourceFrom,
          sourceHeaderId,
          organizationId: this.organizationId,
        }
      );
    } catch (e) {
      throw e;
    }
  }

  // cancelled
  @Bind()
  async handleCancel() {
    const headerData = this.HeaderFormDS.current.toData() || {};
    const { clarifyNotifyId } = headerData;

    this.togglePageLoading(true);
    try {
      let result = await fetchPriceClarificationDetailCancel({
        organizationId: this.organizationId,
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

  isNewPriceClarification() {
    const clarifyNotifyId = this.getLocationSearch('clarifyNotifyId');
    return !clarifyNotifyId || clarifyNotifyId === 'null';
  }

  // 返回列表页
  directionPriceClarificationList() {
    const { history } = this.props;
    const path = this.getBackpath();
    history.push(path);
    closeTab(
      this.bidFlag
        ? '/ssrc/new-bid-hall/price-clarification-update'
        : '/ssrc/price-clarification/update'
    );
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
  };

  // get back path
  getBackpath() {
    const RouterParams = this.getLocationSearch();
    const { originBackPath = null, originBackPathList = null } = RouterParams;

    if (originBackPathList && originBackPathList !== 'null') {
      return originBackPathList;
    }
    if (originBackPath && originBackPath !== 'null') {
      return originBackPath;
    }
  }

  /**
   * [永祥] 重写二开, 谨慎修改!!!
   * @protected
   */
  renderSupplierQuoteDetailTable(SupplierProps) {
    return <SupplierQuoteDetailTable {...SupplierProps} />;
  }

  render() {
    const { history, customizeTable = () => {}, priceRemote } = this.props;
    const { pageLoading = false, doubleUnitFlag } = this.state;
    const RouterParams = this.getLocationSearch();
    const { clarifyNotifyId = null, sourceHeaderId, sourceFrom } = RouterParams;
    const isCreationFlag = clarifyNotifyId === 'null' || !clarifyNotifyId;

    const SupplierProps = {
      history,
      priceRemote,
      sourceKey: this.sourceKey,
      organizationId: this.organizationId,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyId,
      onTableRef: this.onTableRef,
      customizeTable,
      doubleUnitFlag,
      headerFormDS: this.HeaderFormDS,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
    };

    return (
      <>
        <Header
          title={
            isCreationFlag
              ? intl
                  .get('ssrc.expertScoring.view.title.priceClarificationCreation')
                  .d('价格澄清新建')
              : intl
                  .get('ssrc.expertScoring.view.title.priceClarificationMaintain')
                  .d('价格澄清维护')
          }
          backPath={this.getBackpath()}
        >
          <Button icon="check" onClick={this.handleSubmit} color="primary" loading={pageLoading}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {!isCreationFlag ? (
            <Button
              icon="highlight_off"
              onClick={this.handleCancel}
              wait={500}
              waitType="throttle"
              loading={pageLoading}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          ) : null}
        </Header>
        <Content
          className={classnames(
            CommonStyles['ssrc-common-container'],
            CommonStyles['ssrc-override-c7n-ui']
          )}
        >
          <div className={styles['ssrc-price-clarification-form']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonRfxBasicInfo', {
                  sourceCategoryName: getSourceCategoryName(this.bidFlag),
                })
                .d('{sourceCategoryName}基础信息')}
            </h3>
            {this.renderForm()}
          </div>

          <div className={CommonStyles['m-t-m']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonSupplierQuoteDetails', {
                  quotationName: getQuotationName(this.bidFlag),
                })
                .d('供应商{quotationName}详情')}
            </h3>
            {this.renderSupplierQuoteDetailTable(SupplierProps)}
          </div>
        </Content>
      </>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) =>
  compose(
    WithCustomizeC7N({
      unitCode: [
        `SSRC.${type}_HALL.CLARIFICATION.FORM_CREATE_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.QUOTATION_LADDER_LEVER_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_EDIT`,
      ],
    }),
    remote(
      {
        code: 'SSRC_PRICE_CLARIFICATION_UPDATE',
        name: 'priceRemote',
      },
      {
        events: {},
      }
    ),
    formatterCollections({
      code: ['ssrc.expertScoring', 'ssrc.inquiryHall', 'ssrc.common', 'sscux.ssrc'],
    })
  )(observer(Comp));

export default HOCComponent(Update);

export { HOCComponent, Update };
