/**
 * ApplyToInquiryNew - 申请转询价-c7n
 */

import React, { Component, createRef } from 'react';
import intl from 'utils/intl';
import { compose, throttle } from 'lodash';
import querystring from 'querystring';
import { Debounce } from 'lodash-decorators';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { queryEnableDoubleUnit } from '@/services/commonService';
import { newBatchValidatePurchase, createApplyToInquiry } from '@/services/inquiryHallService';
import { applyToNotification, isText, getTableFixSelfAdaptStyle } from '@/utils/utils';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import OfflineWholeModal from '@/routes/ssrc/InquiryHallNew/OfflineWholeModal.js';

import {
  INQUIRY,
  getSourceCategoryName,
  // INQUIRY_LOWERCASE,
  BID,
  // getCategoryCode,
  // getSourceName,
  // getCheckPriceName,
  getDocumentTypeName,
  // getQuotationName,
} from '@/utils/globalVariable';

import { offlineWholeDS } from '../indexDS';
import PurchaseRequestContent from '../Update/PurchaseRequestContent.js';
import PurchaseRequestDS from '../Update/PurchaseRequestDS.js';

class ApplyToInquiryNew extends Component {
  constructor(props) {
    super(props);
    if (props?.onRef) {
      props.onRef(this);
    }

    this.organizationId = getCurrentOrganizationId();

    const { sourceKey } = this.props;

    this.purchaseRequestDs = new DataSet(PurchaseRequestDS(sourceKey || 'INQUIRY'));

    this.selectTemplateDs = new DataSet(
      offlineWholeDS({
        secondarySourceCategory: sourceKey === 'BID' ? 'NEW_BID' : null,
      })
    );

    this.contentRef = createRef();

    this.pageLoading = false;

    this.state = {
      loading: false,
      doubleUnitFlag: false,
    };
  }

  bidFlag = this.props.sourceKey === BID;

  sourceCategoryName = getSourceCategoryName(this.bidFlag);

  documentTypeName = getDocumentTypeName(this.bidFlag);

  toggleLoading = (loading = false) => {
    this.pageLoading = loading;
    this.setState({
      loading,
    });
  };

  componentDidMount() {
    this.queryDoubleUnit();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.purchaseRequestDs.setState('doubleUnitFlag', !!Number(res));
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  getTableUnitCode = () => {
    const { sourceKey = 'INQUIRY' } = this.props;

    const code = `SSRC.${sourceKey}_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE`;
    return code;
  };

  clearDsSelect = () => {
    this.purchaseRequestDs.clearCachedSelected();
    this.purchaseRequestDs.unSelectAll();
  };

  setContentRef = (ref) => {
    this.contentRef = ref || {};
  };

  @Debounce(300)
  create = async (payload) => {
    const { sourceKey } = this.props;

    const {
      sourceRequest = 'ONLINE_SOURCING', // 来源于创建RFQ【ONLINE_SOURCING】还是整单线下【OFFLINE_ENTER】
    } = payload || {};
    const { selectedRowKeys } = this.getTableSelectedData();

    if (!selectedRowKeys?.length) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return;
    }

    const allData = {
      organizationId: this.organizationId,
      prLineIdList: selectedRowKeys,
      sourceFrom: 'DEMAND_POOL',
      sourceDocumentType: sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      customizeUnitCode: this.getTableUnitCode(),
      sourceRequest,
    };

    let res = null;
    this.toggleLoading(true);
    try {
      res = await newBatchValidatePurchase(allData);
      res = getResponse(res);
      this.toggleLoading();
      if (!res) {
        this.clearDsSelect();
        return;
      }

      const { returnDetail } = res || {};

      const validateCallBackRes = validatorConfirmModal({
        response: res,
        validatorType: 'highestValidatorType',
        validatorArrName: 'validateResults',
        onOk: throttle(async () => {
          // 校验不通过， 后端返回returnDetail对象
          if (returnDetail?.secondaryUomInconsistentFlag === 1) {
            applyToNotification(returnDetail?.secondaryUomInconsistentMes);
          }

          this.openSourceTemplateModal();
        }, 1200),
      });

      // 代表有错误内容，阻断弹窗关闭
      if (validateCallBackRes?.returnDetail) {
        return false;
      }

      if (!validateCallBackRes?.returnDetail) {
        // 校验不通过， 后端返回returnDetail对象
        if (res.secondaryUomInconsistentFlag === 1) {
          applyToNotification(res.secondaryUomInconsistentMes);
        }

        this.openSourceTemplateModal();
      }
    } catch (e) {
      this.toggleLoading();
      throw e;
    }
  };

  openSourceTemplateModal = () => {
    const modalProps = {
      sourceFrom: 'applyToInquiry',
      offlineWholeDs: this.selectTemplateDs,
    };

    Modal.open({
      key: Modal.key(),
      drawer: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.message.title.selectedSourceMethod').d('选择寻源方式'),
      children: <OfflineWholeModal {...modalProps} />,
      style: { width: '380px' },
      onOk: this.createModalInquiry,
      onCancel: this.closeCreateModal,
      onClose: this.closeCreateModal,
    });
  };

  getTableSelectedData = () => {
    const { selected } = this.purchaseRequestDs;
    const selectedRowKeys = [];
    const selectedRows = [];

    selected.forEach((item) => {
      if (!item) {
        return;
      }
      const data = item.toData();
      const { prLineId } = data || {};

      if (!prLineId) {
        return;
      }

      selectedRowKeys.push(prLineId);
      selectedRows.push(data);
    });

    return { selectedRowKeys, selectedRows };
  };

  @Debounce(300)
  createModalInquiry = async (params = {}) => {
    const { sourceKey, history } = this.props;

    const { current } = this.selectTemplateDs;

    if (!current) {
      return false;
    }

    this.selectTemplateDs.forEach((record) => {
      if (!record) {
        return;
      }

      record.set('status', 'update');
    });

    const { selectedRowKeys, selectedRows } = this.getTableSelectedData();

    const validateFlag = await this.selectTemplateDs.validate();
    const offlineData = this.selectTemplateDs.current.toData();
    const { templateLov } = offlineData || {};
    const { templateId } = templateLov || {};

    if (!templateId || !validateFlag) {
      return false;
    }

    const allParam = {
      organizationId: this.organizationId,
      prLineIdList: selectedRowKeys,
      prLineList: selectedRows,
      ...params,
      templateId,
      sourceFrom: 'DEMAND_POOL',
      sourceDocumentType: sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
      customizeUnitCode: this.getTableUnitCode(),
    };

    this.toggleLoading(true);
    const res = await createApplyToInquiry(allParam);

    this.toggleLoading();
    this.clearDsSelect();
    if (!res) {
      return false;
    }

    notification.success();

    const { rfxHeader } = res || {};
    const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } = rfxHeader || {};
    const searchParam = {
      expertScoreType,
      sourceCategory,
      preQualificationFlag,
      current,
    };
    const pathname = this.distinguishUpdatePageUrl({ rfxHeaderId });
    const searchProps = querystring.stringify(searchParam);

    if (!pathname) {
      return;
    }

    history.push({
      pathname,
      search: searchProps,
    });
  };

  // 区分 寻源维护 | 招标维护
  distinguishUpdatePageUrl = (params = {}) => {
    const { sourceKey } = this.props;
    const { rfxHeaderId = null } = params || {};

    if (!rfxHeaderId) {
      return;
    }

    let url = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
    if (sourceKey === 'BID') {
      url = `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`;
    }

    return url;
  };

  closeCreateModal = () => {
    this.selectTemplateDs.reset();
  };

  render() {
    const { sourceKey, customizeTable } = this.props;
    const { loading, doubleUnitFlag } = this.state;

    const Props = {
      organizationId: this.organizationId,
      PurchaseRequestDS: this.purchaseRequestDs,
      doubleUnitFlag,
      executionLinkFlag: 1,
      // tableStyle: {
      //   // maxHeight: 'auto',
      //   // height: '680px',
      // },
      customizeTable,
      onRef: this.setContentRef,
      sourceKey: sourceKey || 'INQUIRY',
    };

    const tableFixSelfAdaptStyle = getTableFixSelfAdaptStyle(true) || {};

    return (
      <React.Fragment>
        <Header
          backPath={null}
          title={intl
            .get(`ssrc.inquiryHall.view.message.button.commonApplyToInquiry`, {
              sourceCategoryName: this.sourceCategoryName,
            })
            .d(`申请转{sourceCategoryName}`)}
        >
          <Button color="primary" onClick={this.create} loading={loading}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div style={tableFixSelfAdaptStyle.wrapperStyle}>
            <PurchaseRequestContent {...Props} />
          </div>
        </Content>
      </React.Fragment>
    );
  }
}

const HocComponent = (NewComponent, pageName = INQUIRY) => {
  return compose(
    WithCustomizeC7N({
      unitCode: [
        `SSRC.${pageName}_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE`, // 申请转寻源-表格
        `SSRC.${pageName}_HALL.NEW_EDIT.PURCHASEREQUEST_FORM`,
      ],
    }),
    remoteHoc(
      {
        code: 'APPLY_TO_INQUIRY_NEW',
        name: 'remote',
      },
      {
        events: {},
      }
    ),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.projectSetup', 'scux.ssrc', 'sscux.ssrc'],
    })
  )(observer(NewComponent));
};

export { HocComponent, ApplyToInquiryNew };

export default HocComponent(ApplyToInquiryNew);
