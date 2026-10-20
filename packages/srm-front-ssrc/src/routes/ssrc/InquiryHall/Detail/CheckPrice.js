/**
 * inquiryHall - 寻源服务/寻源大厅-核价查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Spin, Collapse, Icon, Tag, Tooltip } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { Modal as c7nModal, Attachment } from 'choerodon-ui/pro';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { isNil, isFunction } from 'lodash';

import CPopover from '@/routes/components/CPopover/';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { queryBidFileTemplateConfig } from '@/utils/utils';

import { fetchInquiryHeaderDetail } from '@/services/inquiryHallService';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { ReactComponent as NoData } from '@/assets/Illustrate_none_medium.svg';
import CheckPriceTabs from './CheckPriceTabs';

import styles from './index.less';

const { Panel } = Collapse;

class CheckPrice extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      header: {},
      // pageLoading: true,
      CheckPriceCollapseKeys: ['basicInfo', 'costComment', 'details'],
      fileTemplateManageFlag: 0, // 招标文件tab
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  fetchIntelligentResult = () => {
    const { fetchIntelligentPreReview } = this.props;

    if (fetchIntelligentPreReview) {
      fetchIntelligentPreReview({
        categoryCode: 'RFX_CHECK',
      });
    }
  };

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchRfxDetail();
      this.fetchIntelligentResult();
    }
  }

  componentDidMount() {
    this.fetchRfxDetail();
    this.fetchIntelligentResult();
    this.queryFileTemplateManageSheetConfig();
  }

  togglePageLoading(pageLoading = false) {
    this.setState({
      pageLoading,
    });
  }

  // 查询招标文件模板管理配置
  queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    this.setState({
      fileTemplateManageFlag: flag,
    });
  };

  /**
   * @protect 卫龙二开
   */
  async fetchRfxDetail() {
    const {
      path,
      organizationId,
      rfxHeaderId,
      routerParam,
      rfx = {},
      dispatch,
      onFormLoaded,
      modelName = 'inquiryHall',
      pubRouterAddParams = () => {},
    } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let res = await fetchInquiryHeaderDetail({
        routerParam,
        organizationId,
        rfxHeaderId,
        path,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_HEADER,SSRC.${unitCodeSymbol}_DETAIL.COST.REMARK,SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE.ATTACHMENT`,
        ...pubRouterAddParams(),
      });
      res = getResponse(res);
      if (!res) {
        return;
      }
      this.setState({
        header: res,
      });
      dispatch({
        type: `${modelName}/querySetting`,
        payload: {
          '011107': '011107', // ip校验
        },
      });
      /**
       * 数据更新到model中, 规避个性化按钮组配置fx, 用到此数据源, 未刷新按钮bug ps: 建议此数据源放置在model中
       */
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          checkPriceHeader: res,
        },
      });
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  applicationScopeRef = {};

  // 查看适用范围
  @Throttle(1500)
  viewApplicationOrgModal = (param = {}) => {
    const handleViewApplicationModal = (params = {}) => {
      const { organizationId, rfxHeaderId, applicationScopeFlag, queryParams = {} } = params || {};
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

      const modalKey = c7nModal.key();
      c7nModal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        bodyStyle: {
          padding: 0,
        },
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '1090px' },
        footer: null,
      });
    };
    const {
      organizationId,
      remote,
      rfx: { bidFlag = false },
    } = this.props;
    const { header = {} } = this.state;
    const { rfxHeaderId, applicationScopeFlag } = header || {};

    const props = {
      rfxHeaderId,
      organizationId,
      applicationScopeFlag,
      bidFlag,
      queryParams: { ...(param || {}) },
      handleViewApplicationModal,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteCheckPriceViewApplicationModalEvent', props);
    } else {
      handleViewApplicationModal(props);
    }
  };

  /**
   * @protect 卫龙二开
   */
  getRows() {
    const {
      organizationId,
      // header = {},
      form = {},
      FormItem,
      rfx = {},
      remote,
      rfx: { bidFlag = false },
    } = this.props;
    const { header = {} } = this.state;
    const { getFieldDecorator = () => {} } = form;
    const { checkPriceName } = rfx;
    const rowFields = [
      <Row type="flex" justify="start" gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
            {getFieldDecorator('companyName', {
              initialValue: header.companyName,
            })(<CPopover>{header.companyName}</CPopover>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceCategory', {
              initialValue: header.sourceCategory,
            })(
              <span>{header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning}</span>
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceMethod', {
              initialValue: header.sourceMethod,
            })(<span>{header.sourceMethodMeaning}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingAmount`).d('节支金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('savingAmount', { initialValue: header.savingAmount })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingRatio`).d('节支率')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('savingRatio', {
              initialValue: header.savingRatio,
            })(<span>{!isNil(header.savingRatio) ? `${header.savingRatio}` : ''}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`)
              .d('最高金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('maxSuggestedAmount', { initialValue: header.maxSuggestedAmount })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`)
              .d('最低金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('minSuggestedAmount', { initialValue: header.minSuggestedAmount })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`).d('初审附件')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('pretrialUuid', {
              initialValue: header.pretrialUuid,
            })(
              <Upload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-pretrial"
                attachmentUUID={header.pretrialUuid ? header.pretrialUuid : undefined}
                tenantId={organizationId}
                filePreview
                viewOnly
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, { checkPriceName })
              .d('{checkPriceName}附件')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('checkAttachmentUuid', {
              initialValue: header.checkAttachmentUuid ? header.checkAttachmentUuid : undefined,
            })(
              // <Upload
              //   bucketName={PRIVATE_BUCKET}
              //   bucketDirectory="ssrc-rfx-pretrial"
              //   attachmentUUID={header.checkAttachmentUuid ? header.checkAttachmentUuid : undefined}
              //   tenantId={organizationId}
              //   filePreview
              //   viewOnly
              // />
              <Attachment
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-pretrial"
                value={header.checkAttachmentUuid ? header.checkAttachmentUuid : undefined}
                tenantId={organizationId}
                readOnly
                viewMode="popup"
                color="default"
                className={styles['ssrc-check-detail-attachment']}
              />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('applicationScopeFlag', {
              initialValue: header.applicationScopeFlag,
            })(
              <a
                disabled={!header.applicationScopeFlag}
                onClick={() => this.viewApplicationOrgModal()}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxRemark', {
              initialValue: header.rfxRemark,
            })(
              <CPopover content={header.rfxRemark}>
                <span style={{ whiteSpace: 'pre-line' }}>{header.rfxRemark}</span>
              </CPopover>
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('internalRemark', {
              initialValue: header.internalRemark,
            })(
              <CPopover content={header.internalRemark}>
                <span style={{ whiteSpace: 'pre-line' }}>{header.internalRemark}</span>
              </CPopover>
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('pretrailRemark', {
              initialValue: header.pretrailRemark,
            })(
              <CPopover content={header.pretrailRemark}>
                <span style={{ whiteSpace: 'pre-line' }}>{header.pretrailRemark}</span>
              </CPopover>
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.checkRemarkRfxBid`, { checkPriceName })
              .d('{checkPriceName}备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('checkRemark', {
              initialValue: header.checkRemark,
            })(
              <CPopover content={header.checkRemark}>
                <span style={{ whiteSpace: 'pre-line' }}>{header.checkRemark}</span>
              </CPopover>
            )}
          </FormItem>
        </Col>
      </Row>,
    ];
    const otherProps = {
      bidFlag,
      that: this,
      checkPriceName,
      header,
      getFieldDecorator,
    };
    return remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_CHECK_PRICE_HEADER_INFO',
          rowFields,
          otherProps
        )
      : rowFields;
  }

  rfxTitleForm() {
    const {
      // header = {},
      form = {},
      customizeForm = () => {},
      rfx = {},
    } = this.props;
    const { header = {} } = this.state;
    const { unitCodeSymbol } = rfx;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_HEADER`,
        form,
        dataSource: header,
        readOnly: true,
      },
      <Form className="read-row-custom">{this.getRows()}</Form>
    );
  }

  renderHeaderTitle(header = {}) {
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
          }}
        >
          {header.rfxNum}-
          <Tooltip
            title={`${header.rfxNum}-${header.rfxTitle}`}
            overlayStyle={{ minWidth: '300px' }}
          >
            {header.rfxTitle}
          </Tooltip>
        </span>
        <Tag style={{ marginLeft: '15px', width: '65px' }}>
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}：
            {header.quotationRoundNumber ? header.quotationRoundNumber : 1}
          </span>
        </Tag>
      </div>
    );

    return children;
  }

  /**
   * 渲染成本备注折叠
   */
  rfxCostRemarkForm() {
    const {
      form = {},
      customizeForm = () => {},
      FormItem,
      isSection,
      projectTotalPrice,
      rfx = {},
      remote,
    } = this.props;
    const { header = {} } = this.state;
    const { getFieldDecorator } = form;
    const { checkPriceName, unitCodeSymbol } = rfx;

    const preFormFields = [
      <Row type="flex" justify="start" gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('totalCost', { initialValue: header.totalCost })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
        {isSection ? (
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`)
                .d('寻源项目总金额')}
              {...FORM_COL_3_LAYOUT}
            >
              {getFieldDecorator('projectTotalPrice', {
                initialValue: projectTotalPrice,
              })(<span> {projectTotalPrice || '-'} </span>)}
            </FormItem>
          </Col>
        ) : null}
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.totalPriceRfxBid`, { checkPriceName })
              .d('{checkPriceName}总金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('totalPrice', { initialValue: header.totalPrice })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostFlag', {
              initialValue: header.overCostFlag,
            })(<span>{yesOrNoRender(header.overCostFlag)}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostPrice', { initialValue: header.overCostPrice })(
              <PrecisionInputNumber financial={header.currencyCode} type="hzero" readOnly />
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('overCostScale', {
              initialValue: header.overCostScale,
            })(<span>{header.overCostScale}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('costRemark', {
              initialValue: header.costRemark,
            })(<span style={{ whiteSpace: 'pre-line' }}>{header.costRemark}</span>)}
          </FormItem>
        </Col>
      </Row>,
    ];

    const formFields = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_CHECK_PRICE_COST_REMARK_FORM_FIELDS',
          preFormFields,
          { that: this, header, rfx }
        )
      : preFormFields;

    return customizeForm(
      {
        code: `SSRC.${unitCodeSymbol}_DETAIL.COST.REMARK`,
        form,
        dataSource: header,
      },
      <Form className="read-row-custom">{formFields}</Form>
    );
  }

  /**
   * @protected 三生制药，鸿合, 九坤, 海亮（开标节点下面增加了三个页签，如果有属性改动，需要在标准开标节点埋点出改动）二开
   * @param {*} CheckPriceTabsProps 核价参数
   * @returns VNode
   */
  renderCheckPriceTabs(CheckPriceTabsProps) {
    return <CheckPriceTabs {...CheckPriceTabsProps} />;
  }

  getTabPaneArray() {
    const {
      organizationId,
      customizeTable = () => {},
      customizeTabPane,
      // viewLadderLevel,
      viewLadderLevelQuota,
      showQuotationDetail,
      rfxHeaderId,
      checkWay,
      rfx = {},
      rfx: { bidFlag = false },
      currentStep = '',
      getHocInstance,
      doubleUnitFlag = false,
      settings,
      pubRouterAddParams = () => {},
      history,
      newQuotationFlag = false,
      sslmLifeCycleFlag = true,
      useNewRateFlag = 0,
      isTechExpertFlag = false,
      location,
    } = this.props;
    const { header = {}, CheckPriceCollapseKeys = [], fileTemplateManageFlag } = this.state;
    const { checkPriceName, unitCodeSymbol } = rfx || {};

    const CheckPriceTabsProps = {
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
      viewLadderLevel: viewLadderLevelQuota,
      bidFlag,
      unitCodeSymbol,
      getHocInstance,
      settings,
      pubRouterAddParams,
      history,
      newQuotationFlag,
      sslmLifeCycleFlag,
      fileTemplateManageFlag,
      useNewRateFlag,
      location,
    };

    return [
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            {this.renderHeaderTitle(header)}
            <a>
              {CheckPriceCollapseKeys.includes('basicInfo')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={CheckPriceCollapseKeys.includes('basicInfo') ? 'up' : 'down'} />
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
            <a>
              {CheckPriceCollapseKeys.includes('costComment')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={CheckPriceCollapseKeys.includes('costComment') ? 'up' : 'down'} />
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
                .get('ssrc.inquiryHall.view.title.checkPriceDetailRfxBid', {
                  checkPriceName,
                })
                .d('{checkPriceName}详情')}
            </h3>
            <a>
              {CheckPriceCollapseKeys.includes('details')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={CheckPriceCollapseKeys.includes('details') ? 'up' : 'down'} />
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
          this.renderCheckPriceTabs(CheckPriceTabsProps)
        )}
      </Panel>,
    ];
  }

  render() {
    const { rfx = {}, customizeCollapse, custLoading, remote = {} } = this.props;
    const { CheckPriceCollapseKeys = [], pageLoading = false, header } = this.state;
    const { unitCodeSymbol } = rfx;
    const { handleTopTips = undefined } = remote?.props?.process || {};

    return (
      <div>
        <Spin spinning={pageLoading}>
          {isFunction(handleTopTips) ? handleTopTips(header, { rfx }) : <></>}
          {customizeCollapse(
            {
              code: `SSRC.${unitCodeSymbol}_DETAIL.CHECK_PRICE_HEADER_COLLAPSE`,
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

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(Comp);
};

export { HOCComponent, CheckPrice };
export default HOCComponent(CheckPrice);
