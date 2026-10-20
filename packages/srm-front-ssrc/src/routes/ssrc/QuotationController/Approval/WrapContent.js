import React, { Component } from 'react';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Spin } from 'choerodon-ui';
import classNames from 'classnames';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';
import {
  BID,
  getOmitName,
  getSourceCategoryName,
  getDocumentTypeName,
  getQuotationName,
  getCheckPriceName,
} from '@/utils/globalVariable';

import RfxDemandForm from './RfxDemandForm';
import Supplier from './Supplier';
import BaseInfo from './BaseInfo';
import OrganizationAndStaffForm from './OrganizationAndStaffForm';
import ItemLineTable from './ItemLineTable';
import AttachmentForm from './AttachmentForm';
import Style from './index.less';

class WrapContent extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.state = {
      userId: getCurrentUserId(),
      organizationId: getCurrentOrganizationId(),
    };
  }

  bidFlag = this.props.sourceKey === BID;

  custKey = this.bidFlag ? 'BID_' : '';

  omitName = getOmitName(this.bidFlag);

  sourceCategoryName = getSourceCategoryName(this.bidFlag);

  documentTypeName = getDocumentTypeName(this.bidFlag);

  quotationName = getQuotationName(this.bidFlag);

  checkPriceName = getCheckPriceName(this.bidFlag);

  timeControllerRef = {};

  @Bind()
  getTimeControllerRef(ref) {
    this.timeControllerRef = ref;
  }

  SupplierRef = {};

  @Bind()
  getSupplierRef(ref) {
    this.SupplierRef = ref || {};
  }

  preQualificationRef = {};

  @Bind()
  getPreQualificationRef(ref) {
    this.preQualificationRef = ref || {};
  }

  BaseInfoRef = {};

  @Bind
  getBaseRef(ref) {
    this.BaseInfoRef = ref || {};
  }

  // 采购组织及人员
  OrganizationAndStaffFormRef = {};

  @Bind
  getOrganizationRef(ref) {
    this.OrganizationAndStaffFormRef = ref || {};
  }

  AttachmentFormRef = {};

  @Bind
  getAttachmentFormRef(ref) {
    this.AttachmentFormRef = ref || {};
  }

  @Bind()
  initData(result) {
    if (this.BaseInfoRef.FormDS) {
      this.BaseInfoRef.FormDS.loadData([result.rfxHeaderBaseInfoAdjustDTO]);
    }
    // 初始化表单数据
    if (this.OrganizationAndStaffFormRef.initDSFields) {
      this.OrganizationAndStaffFormRef.initDSFields([result.memberAndPurAdjustInfoDTO]);
    }
    if (this.timeControllerRef.initDSFields) {
      this.timeControllerRef.initDSFields(result.rfxRequireQuotationAdjustDTO);
    }
    if (this.preQualificationRef.initDSFields) {
      this.preQualificationRef.initDSFields(result.rfxRequireQuotationAdjustDTO);
    }
    if (this.SupplierRef?.supplierListTableDS) {
      this.SupplierRef.initSupplierDS();
      this.SupplierRef.supplierListTableDS.query();
    }
  }

  // 判断是否是竞价大厅-竞价单
  @Bind()
  judgeNewBiddingFlag() {
    const { biddingHallFlag, header = {} } = this.props;

    const { rfxHeaderBaseInfoAdjustDTO } = header || {};
    // const { rfxHeaderBaseInfoDTO } = rfxHeaderBaseInfoAdjustDTO || {};
    const { secondarySourceCategory, biddingFlag } = rfxHeaderBaseInfoAdjustDTO || {};
    // 竞价大厅标识 sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
    return (
      biddingHallFlag &&
      secondarySourceCategory === 'RFA' &&
      (biddingFlag === 1 || biddingFlag === '1')
    );
  }

  render() {
    const {
      match,
      header,
      onFormLoaded,
      custLoading,
      customizeTable,
      customizeForm,
      currentMode,
      currentType,
      disWrap,
      wrapContentClassName,
      match: {
        params: { rfxId = null },
      },
      isSection,
      remote,
      biddingHallFlag,
    } = this.props;
    const { userId, organizationId } = this.state;

    const SupplierProps = {
      header,
      custLoading,
      customizeTable,
      rfxId,
      organizationId,
      currentMode,
      disWrap,
      custKey: this.custKey,
      onRef: this.getSupplierRef,
    };
    const { adjustTypeList = [] } = header;
    const RfxDemandProps = {
      header,
      match,
      organizationId,
      userId,
      custLoading,
      rfxId,
      customizeForm,
      currentType,
      currentMode,
      adjustTypeList,
      getTimeController: this.getTimeControllerRef,
      getPreQualification: this.getPreQualificationRef,
      customizeTable,
      custKey: this.custKey,
      quotationName: this.quotationName,
      isSection,
      remote,
      bidFlag: this.bidFlag,
      biddingHallFlag,
      judgeNewBiddingFlag: this.judgeNewBiddingFlag,
    };
    const BaseInfoProps = {
      header,
      organizationId,
      onFormLoaded,
      customizeForm,
      custLoading,
      currentMode,
      onRef: this.getBaseRef,
      custKey: this.custKey,
      documentTypeName: this.documentTypeName,
    };

    const OrganizationAndStaffFormProps = {
      header,
      organizationId,
      customizeForm,
      custLoading,
      currentMode,
      match,
      custKey: this.custKey,
      bidFlag: this.bidFlag,
      checkPriceName: this.checkPriceName,
      onRef: node => this.getOrganizationRef(node),
      sourceCategoryName: this.sourceCategoryName,
    };

    const itemLineTableProps = {
      rfxId,
      history,
      userId,
      header,
      custLoading,
      organizationId,
      currentMode,
      customizeTable,
      custKey: this.custKey,
      quotationName: this.quotationName,
      biddingHallFlag,
      onRef: ref => {
        this.itemLineRef = ref;
      },
      judgeNewBiddingFlag: this.judgeNewBiddingFlag,
    };

    const AttachmentProps = {
      onRef: this.getAttachmentFormRef,
      customizeForm,
      currentMode,
      custKey: this.custKey,
      header,
    };

    const newBiddingFlag = this.judgeNewBiddingFlag();
    return (
      <div
        className={classNames(
          wrapContentClassName,
          { [Style['current-wrap']]: !wrapContentClassName },
          { [Style['half-wrap']]: wrapContentClassName }
        )}
      >
        <Spin spinning={isEmpty(header) || !header}>
          {header && (
            <div>
              {wrapContentClassName ? (
                currentMode === 'current' ? (
                  <div className="currentContainer">
                    <div className="currentMode">
                      <span>
                        {intl.get('ssrc.inquiryHall.view.inquiryHall.currentMode').d('当前版本')}
                      </span>
                    </div>
                    <div>
                      {intl
                        .getHTML('ssrc.inquiryHall.view.inquiryHall.currentChangeNumber', {
                          number: header.adjustNumber,
                        })
                        .d(
                          <span>
                            <span className="green">{header.adjustNumber}</span>
                            {intl
                              .get('ssrc.inquiryHall.view.message.changeInformation')
                              .d('处信息更改')}
                          </span>
                        )}
                    </div>
                  </div>
                ) : currentMode === 'history' ? (
                  <div className="historyContainer">
                    <div className="historyMode">
                      <span>
                        {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
                      </span>
                    </div>
                  </div>
                ) : (
                  ''
                )
              ) : (
                ''
              )}
            </div>
          )}
          <Content>
            <h3
              id="rfxBasicInfo"
              className={Style.contentTitle}
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              {intl
                .get('ssrc.inquiryHall.view.inquiryHall.commonRfxBasicInfo', {
                  sourceCategoryName: this.omitName,
                })
                .d('{sourceCategoryName}基础信息')}
            </h3>
            <BaseInfo {...BaseInfoProps} />
          </Content>
          <div className={Style['custom-page-content']} />
          {(adjustTypeList?.includes('PURCHASE') || currentType === 'detail') && (
            <div>
              <Content>
                <h3
                  id="rfxBasicInfo"
                  className={Style.organizationTitle}
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  {intl
                    .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
                    .d('采购组织及人员')}
                </h3>
                <OrganizationAndStaffForm {...OrganizationAndStaffFormProps} />
              </Content>
              <div className={Style['custom-page-content']} />
            </div>
          )}
          {(adjustTypeList?.includes('RFX_ITEM') || currentType === 'detail') && (
            <div className={Style['quotation-controller-itemLine']}>
              <Content>
                <h3 id="rfxItemLines" style={{ fontSize: '16px', fontWeight: 600 }}>
                  {intl
                    .get('ssrc.inquiryHall.view.inquiryHall.commonRfxItemLines', {
                      sourceCategoryName: this.omitName,
                    })
                    .d('{sourceCategoryName}标的物')}
                </h3>
                <ItemLineTable {...itemLineTableProps} />
              </Content>
              <div className={Style['custom-page-content']} />
            </div>
          )}
          {header.rfxHeaderBaseInfoAdjustDTO?.sourceMethod === 'INVITE' &&
            (adjustTypeList?.includes('SUPPLIER_REQUIRE') || currentType === 'detail') && (
              <div>
                <Content>
                  <h3
                    id="supplierWithRequest"
                    style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}
                  >
                    {intl
                      .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
                      .d('对供应商要求')}
                  </h3>
                  <Supplier {...SupplierProps} />
                </Content>
                <div className={Style['custom-page-content']} />
              </div>
            )}
          {(adjustTypeList?.some(
            item =>
              item === 'RFX_QUOTATION' || item === 'RFX_PREQUAL' || item === 'RFX_EXPERT_SCORE'
          ) ||
            currentType === 'detail') && (
            <div>
              <Content>
                <h3
                  id="rfxDeamnd"
                  style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}
                >
                  {!newBiddingFlag
                    ? intl
                        .get('ssrc.inquiryHall.view.inquiryHall.commonRfxDeamnd', {
                          sourceCategoryName: this.sourceCategoryName,
                        })
                        .d('{sourceCategoryName}要求')
                    : intl.get('ssrc.common.view.biddingRequest').d('竞价要求')}
                </h3>
                <RfxDemandForm {...RfxDemandProps} />
              </Content>
            </div>
          )}
          <div className={Style['custom-page-content']} />
          <Content>
            <h3 id="attachment" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              {intl.get('ssrc.common.model.common.attachment').d('附件')}
            </h3>
            <AttachmentForm {...AttachmentProps} />
          </Content>
        </Spin>
      </div>
    );
  }
}

// 引用类型函数
const hocComponent = Com => {
  return WithCustomizeC7N({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ONLYRED', // 当前-供应商
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_HIS', // 历史-供应商
      'SSRC.QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_READ', // 当前-时间调整
      'SSRC.QUOTATION_CONTROLLER_DETAIL.TIMEADJUST_HIS', // 历史-时间调整
      'SSRC.QUOTATION_CONTROLLER_DETAIL.PRE_ONLYREAD', // 当前-资格预审
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BASE_INFO_READONLY', // 当前-基础信息
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BASE_INFO_HIS', // 历史-基础信息
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READO_NLY', // 当前-采购组织与人员
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READONLY_HIS', // 历史-采购组织与人员
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEMLINE_ONLYRED', // 当前标的物
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEMLINE_HIS', // 历史-标的物
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_READ', // 专家不区分商务技术
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_READ', // 专家区分
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_HIS', // 专家不区分商务技术历史
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_HIS', // 专家区分历史
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_READ', // 评分要素-商务或者不区分商务技术
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_READ', // 评分要素技术
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_HIS', // 评分要素-商务或者不区分商务技术-历史
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_HIS', // 评分要素技术历史
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_READ', // 评分要素分配专家
      'SSRC.QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_HIS', //  评分要素分配专家-历史
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_READ', // 当前-附件表单
      'SSRC.QUOTATION_CONTROLLER_DETAIL.ATTACHMENT_FORM_HIS', // 历史-附件表单
      'SSRC.QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_READ', // 当前-符合性检查
      'SSRC.QUOTATION_CONTROLLER_DETAIL.INTIALREVIEW_TABLE_HIS', // 历史-符合性检查
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_READONLY', // 当前-竞价规则
      'SSRC.QUOTATION_CONTROLLER_DETAIL.BIDDING_RULE_HISTORY', // 历史-竞价规则
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_READ', // 对供应商要求-分配物料
      'SSRC.QUOTATION_CONTROLLER_DETAIL.SUPPLIER_ALLOT_ITEM_HIS', // 对供应商要求-分配物料-历史
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.quoController',
        'ssrc.inquiryHall',
        'ssrc.common',
        'scux.ssrc',
        'ssrc.biddingHall',
      ],
    })(
      remoteHoc(
        {
          code: 'SSRC_QUOTATION_CONTROLLER_APPROVAL',
          name: 'remote',
        },
        {
          events: {
            // 组件卸载清空埋点事件
            remoteClearDSEvent() {},
            // load Business Data
            remoteLoadBusinessData(props) {
              const { loadBusinessData = noop } = props || {};
              loadBusinessData(props);
            },
            // 初始化ds event
            remoteInitDSEvent() {},
          },
        }
      )(Com)
    )
  );
};

export default hocComponent(WrapContent);
export { WrapContent };
