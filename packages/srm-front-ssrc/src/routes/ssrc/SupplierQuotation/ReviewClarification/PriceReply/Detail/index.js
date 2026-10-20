import React, { Component } from 'react';
import { DataSet, Form, TextField, TextArea, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';
import { compose } from 'lodash';
import { observer } from 'mobx-react';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { isText } from '@/utils/utils';

import { fetchPriceClarificationFiles } from '@/services/supplierQutationService';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import { queryEnableDoubleUnit } from '@/services/commonService';

import CommonStyles from '@/routes/share/styles/customPage.less';
import SupplierQuoteDetailTable from './SupplierQuoteDetailTable';
import { HeaderFormDS } from './FormDS';
import Attachment from './Attachments';
import styles from '../index.less';

@observer
class Update extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      bUuid: null,
      tUuid: null,
      doubleUnitFlag: false,
    };

    this.HeaderFormDS = new DataSet(HeaderFormDS({ sourceKey: this.props.sourceKey || INQUIRY }));
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  bidFlag = (this.props.sourceKey || INQUIRY) === BID;

  SupplierQuoteTableRef = null;

  componentDidMount() {
    this.initPage();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      history: {
        location: { search },
      },
    } = prevProps || {};
    const PrevRouterParams = querystring.parse(search.substr(1)) || {};
    const { clarifyNotifyId: preClarifyNotifyId = null } = PrevRouterParams;
    const clarifyNotifyId = this.getLocationSearch('clarifyNotifyId');

    return clarifyNotifyId && clarifyNotifyId !== preClarifyNotifyId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  getRouterParams(key = null) {
    const {
      location: { search },
    } = this.props;

    const RouterParams = querystring.parse(search.substr(1));
    if (!key) {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  initPage() {
    this.fetchHeaderInfo();
  }

  fetchHeaderInfo() {
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId, quotationHeaderId = '' } = routerParam;

    this.HeaderFormDS.setQueryParameter('commonProps', {
      clarifyNotifyId,
      quotationHeaderId,
      organizationId: this.organizationId,
    });
    this.HeaderFormDS.query().then((res) => {
      if (getResponse(res)) {
        this.queryDoubleUnit(res?.tenantId);
        this.fetchPriceClarificationFiles();
      }
    });
  }

  // fetch quotation file
  async fetchPriceClarificationFiles() {
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId, quotationHeaderId } = routerParam;

    try {
      let result = await fetchPriceClarificationFiles({
        organizationId: this.organizationId,
        clarifyNotifyId,
        quotationHeaderId,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }

      const { businessAttachmentUuid, techAttachmentUuid } = result;

      this.setState({
        bUuid: businessAttachmentUuid,
        tUuid: techAttachmentUuid,
      });

      const { current } = this.HeaderFormDS || {};
      if (!current) {
        return;
      }

      current.set({
        businessAttachmentUuid,
        techAttachmentUuid,
      });
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  queryDoubleUnit(tenantId) {
    queryEnableDoubleUnit({ businessModule: 'RFX', tenantId }).then((res) => {
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

  // render form
  renderForm() {
    const { customizeForm } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_DETAIL`,
        dataSet: this.HeaderFormDS,
      },
      <Form labelLayout="float" columns={2} dataSet={this.HeaderFormDS}>
        <TextField name="clarifyNotifyNum" />
        <TextField name="clarifyNotifyStatusMeaning" />
        <TextField name="clarifyNotifyTitle" />
        <TextField name="companyName" />
        <TextField name="sourceNum" />
        <TextField name="replyEndDate" />
        <TextField name="submittedByName" />
        <TextField name="submittedDate" />
        <Lov name="paymentTypeLov" />
        <Lov name="paymentTermLov" />
        <Lov name="currencyLov" />
        <TextArea newLine colSpan={2} rows={3} name="replyRequirement" resize />
      </Form>
    );
  }

  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
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

  // get back path
  getBackpath() {
    const backPath = this.getLocationSearch('backPath');
    const activeKey = this.getLocationSearch('activeKey');
    return `${backPath}&activeKey=${activeKey}`;
  }

  render() {
    const { bUuid = null, tUuid = null, doubleUnitFlag } = this.state;
    const RouterParams = this.getLocationSearch();

    const { customizeTable = () => {}, customizeCollapseForm, custLoading } = this.props;

    const {
      clarifyNotifyId = null,
      quotationHeaderId,
      sourceFrom,
      supplierCompanyId,
      supplierTenantId,
    } = RouterParams;

    const SupplierProps = {
      sourceKey: this.sourceKey,
      headerInfoDS: this.HeaderFormDS,
      organizationId: this.organizationId,
      quotationHeaderId,
      sourceFrom,
      supplierCompanyId,
      supplierTenantId,
      clarifyNotifyId,
      onTableRef: this.onTableRef,
      getRouterParams: (key) => this.getRouterParams(key),
      customizeTable,
      doubleUnitFlag,
    };

    const AttachmentProps = {
      sourceKey: this.sourceKey,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      businessUuid: bUuid,
      techUuid: tUuid,
      onRef: this.handleBindOnRef,
      techAttachmentVisible: false,
      customizeCollapseForm,
      custLoading,
      headerInfoDS: this.HeaderFormDS,
    };

    return (
      <>
        <Header
          title={intl.get(`ssrc.supplierQuotation.view.message.title.pNReply`).d('价格澄清回复')}
          backPath={this.getBackpath()}
        />
        <Content
          className={classnames(
            CommonStyles['ssrc-common-container'],
            CommonStyles['ssrc-override-c7n-ui']
          )}
        >
          <div className={styles['ssrc-price-clarification-form']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.basicInfomations').d('基础信息')}
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
            <SupplierQuoteDetailTable {...SupplierProps} />
          </div>

          <div className={CommonStyles['m-t-m']}>
            <h3 className={CommonStyles['ssrc-custom-item-title']}>
              <div className={CommonStyles['ssrc-custom-item-title-line']} />
              {intl.get('hzero.common.upload.modal.title').d('附件')}
            </h3>
            <Attachment {...AttachmentProps} />
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
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIER_REPLY_DETAIL`,
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_REPLY_DETAIL`,
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIER_REPLY_LADDER_LEVEL_DETAIL`,
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_REPLY_DETAIL_ATTACHMENTS`,
      ],
    }),
    formatterCollections({
      code: ['ssrc.expertScoring', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'],
    })
  )(Comp);

export default HOCComponent(Update);

export { HOCComponent, Update };
