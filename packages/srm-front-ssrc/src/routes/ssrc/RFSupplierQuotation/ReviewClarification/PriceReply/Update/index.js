import React, { Component } from 'react';
import { Button, DataSet, Form, TextField, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';
import { compose } from 'lodash';

import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import Attachment from '@/routes/ssrc/components/Attachment';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { HeaderFormDS } from '../FormDS';
import SupplierQuoteDetailTable from './SupplierQuoteDetailTable';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';

import {
  priceReplySave,
  priceReplySubmit,
  fetchPriceClarificationFiles,
} from '@/services/supplierQutationService';

import CommonStyles from '@/routes/share/styles/customPage.less';
import styles from '../index.less';

class Update extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      pageLoading: false, // page loading
      bUuid: null,
      tUuid: null,
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
      history: {
        location: { search },
      },
    } = this.props;

    const RouterParams = querystring.parse(search.substr(1));
    if (!key) {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  initPage() {
    this.fetchHeaderInfo();
    this.fetchPriceClarificationFiles();
  }

  fetchHeaderInfo() {
    const routerParam = this.getRouterParams();
    const { clarifyNotifyId } = routerParam;

    this.HeaderFormDS.setQueryParameter('commonProps', {
      clarifyNotifyId,
      organizationId: this.organizationId,
    });
    this.HeaderFormDS.query();
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
    } catch (e) {
      throw e;
    }
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
        code: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
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
        <TextArea colSpan={2} rows={3} name="replyRequirement" resize />
      </Form>
    );
  }

  // 提交保存校验
  async validateSubmitData() {
    const SupplierDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS || {};
    SupplierDS.forEach((record) => {
      record.set('status', 'update');
    });

    const SupplierLineValidate = await SupplierDS.validate();

    return SupplierLineValidate;
  }

  // collection form data to operate
  integrationHeaderFormData() {
    const header = this.HeaderFormDS.current.toData();
    return header;
  }

  // supplier item table data
  integrationTableData() {
    const SupplierDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS || {};
    const data = SupplierDS.toData();
    return data;
  }

  // supplier file
  integrationSupplierFile() {
    let bUuid = null;
    let tUuid = null;

    if (this.attachmentRef) {
      const { businessAttachmentUuid: businessUuid, techAttachmentUuid: techUuid } =
        this.attachmentRef.state || {};
      if (businessUuid) {
        bUuid = businessUuid;
      }
      if (techUuid) {
        tUuid = techUuid;
      }
    }

    return {
      businessAttachmentUuid: bUuid,
      techAttachmentUuid: tUuid,
    };
  }

  // submit
  @Bind()
  async handleSubmit() {
    const { history } = this.props;
    const RouterParams = this.getLocationSearch();
    const { backPath = null, quotationHeaderId = null, clarifyNotifyId = null } = RouterParams;

    if (!clarifyNotifyId) {
      return;
    }

    const validateResult = await this.validateSubmitData();
    const clarifyNotify = this.integrationHeaderFormData();
    const priceClarifyIssueLines = this.integrationTableData();
    const files = this.integrationSupplierFile();

    if (!validateResult) {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await priceReplySubmit({
        clarifyNotifyId,
        organizationId: this.organizationId,
        quotationHeaderId,
        clarifyNotify,
        priceClarifyIssueLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
        ...files,
      });
      result = getResponse(result);
      this.togglePageLoading();
      if (!result) {
        return;
      }

      notification.success();
      history.push(backPath);
    } catch (e) {
      throw e;
    }
  }

  // save
  @Bind()
  async handleSave() {
    const RouterParams = this.getLocationSearch();
    const { clarifyNotifyId = null, quotationHeaderId = null } = RouterParams;

    const validateResult = await this.validateSubmitData();
    const clarifyNotify = this.integrationHeaderFormData();
    const priceClarifyIssueLines = this.integrationTableData();
    const files = this.integrationSupplierFile();

    if (!validateResult) {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return;
    }

    try {
      this.togglePageLoading(true);
      let result = await priceReplySave({
        clarifyNotifyId,
        organizationId: this.organizationId,
        quotationHeaderId,
        clarifyNotify,
        priceClarifyIssueLines,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT,SSRC.${this.sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
        ...files,
      });

      result = getResponse(result);
      this.togglePageLoading();
      if (!result) {
        return;
      }
      notification.success();
      this.initPage();
      const TableDS = this.SupplierQuoteTableRef.SupplierQuotationTableDS;
      TableDS.query();
    } catch (e) {
      throw e;
    }
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
    const { pageLoading = false, bUuid = null, tUuid = null } = this.state;
    const RouterParams = this.getLocationSearch();
    const { customizeTable = () => {}, custLoading } = this.props;

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
      custLoading,
    };

    const AttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: false,
      businessUuid: bUuid,
      techUuid: tUuid,
      fileSize: FIlESIZE,
      onRef: this.handleBindOnRef,
      techAttachmentVisible: false,
      ...(ChunkUploadProps || {}),
    };

    return (
      <>
        <Header
          title={intl.get(`ssrc.supplierQuotation.view.message.title.pNReply`).d('价格澄清回复')}
          backPath={this.getBackpath()}
        >
          <Button icon="check" onClick={this.handleSubmit} color="primary" loading={pageLoading}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={pageLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
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
        `SSRC.${type}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT`,
        `SSRC.${type}_HALL.CLARIFICATION.HEADER_FORM_REPLY_EDIT`,
      ],
    }),
    formatterCollections({
      code: ['ssrc.expertScoring', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'],
    })
  )(Comp);

export default HOCComponent(Update);

export { HOCComponent, Update };
