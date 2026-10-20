import React, { Component } from 'react';
import {
  Collapse,
  Tag,
  Pagination,
  Spin,
  Form,
  Modal,
  Icon,
  Switch,
  Tooltip,
  Popover,
} from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isFunction, compose } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SVGIcon from '@/routes/components/SvgIcon';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';
import SupplierLineTable from './SupplierLineTable';
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevel';

const { Panel } = Collapse;
const imgUrl = require('@/assets/candidate.svg');
const imgUr = require('@/assets/d-attachment.svg');
const validSupplierImg = require('@/assets/supplier-inline-valid.svg');
const inValidSupplierImg = require('@/assets/supplier-inline-invalid.svg');
const supplierImg = require('@/assets/supplier-icon.svg');
const supplierGreyImg = require('@/assets/supplier-icon-grey.svg');
const attachGrey = require('@/assets/attachment-grey.svg');
const companyIpRateRed = require('@/assets/companyIpRate-red.svg');
const companyIpRateGrey = require('@/assets/companyIpRate-grey.svg');
const processAddInvalid = require('@/assets/supplier-processAddInvalid.svg');
const processAdd = require('@/assets/supplier-processAdd.svg');

class SupplierLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      loadingObj: {},
      expand: {}, // 展开数据
      isShow: {}, // 数据是否查询显示
      updateState: false,
      attachmentVisible: false,
      AttachmentsProps: {},
      rfxLineSupplierId: undefined, // 最后一次展开的行id
    };
    this.supplierLineTable = {}; // 初始化this.supplierLineTable为对象
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { supplierQuoteLine },
    } = this.props;
    const {
      inquiryHall: { supplierQuoteLine: preLine },
    } = preProps;
    if (supplierQuoteLine !== preLine) {
      return true;
    }
    return null;
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(
    businessAttachmentUuid,
    techAttachmentUuid,
    bargainBusinessAttachmentUuid,
    bargainTechAttachmentUuid,
    roundBusinessAttachmentUuid,
    roundTechAttachmentUuid
  ) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
        bargainBusUuid: bargainBusinessAttachmentUuid,
        bargainTechUuid: bargainTechAttachmentUuid,
        roundBusUuid: roundBusinessAttachmentUuid,
        roundTechUuid: roundTechAttachmentUuid,
      },
      attachmentVisible: true,
    });
  }

  /**
   * hideAttachmentsProps -  关闭头附件上传弹窗
   */
  @Bind()
  hideAttachmentsProps() {
    this.setState({ attachmentVisible: false });
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   *
   * @param {string[]} openKeys - 新打开的 Pane
   */
  @Bind()
  handleCollapseChange(e, item) {
    const { expand, isShow } = this.state;
    if (!isShow[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.fetchSupplierLineTableList({}, item.rfxLineSupplierId);
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineSupplierId]: !expand[item.rfxLineSupplierId],
      },
      isShow: {
        ...isShow,
        [item.rfxLineSupplierId]: true,
      },
    });
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      inquiryHall: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 获取表格数据
   */
  @Bind()
  fetchSupplierLineTableList(page = {}, rfxLineSupplierId) {
    const { dispatch, organizationId, header = {}, sourceKey = INQUIRY } = this.props;
    const loadingObj = {
      [rfxLineSupplierId]: { fetchItemQuoteLineLoading: true },
    };
    const { rfxHeaderId = null } = header;
    this.setState({ loadingObj });

    dispatch({
      type: 'inquiryHall/fetchSupplierQuoteLine',
      payload: {
        page,
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
        checkApproveFlag: 1,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          loadingObj: { [rfxLineSupplierId]: { fetchItemQuoteLineLoading: false } },
        });
      }
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickCollapseChange(e, item) {
    const { expand, isShow } = this.state;
    if (!isShow[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.fetchSupplierLineTableList({}, item.rfxLineSupplierId);
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineSupplierId]: !expand[item.rfxLineSupplierId],
      },
      isShow: {
        ...isShow,
        [item.rfxLineSupplierId]: true,
      },
    });
  }

  /**
   * 供应商-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineSupplierId) {
    const {
      dispatch,
      inquiryHall: { supplierQuoteLine, supplierQuoteLinePagination = {} },
    } = this.props;
    const { updateState } = this.state;
    // 改变分页，先把对应得rfxLineSupplierId得数据清空，再重新查询
    const newSupplierQuoteLine = supplierQuoteLine.filter(
      (item) => +item.rfxLineSupplierId !== rfxLineSupplierId
    );
    delete supplierQuoteLinePagination[rfxLineSupplierId];
    dispatch({
      type: 'inquiryHall/updateState',
      payload: { supplierQuoteLine: newSupplierQuoteLine, supplierQuoteLinePagination },
    });
    this.setState({ updateState: true }, () => {
      this.fetchSupplierLineTableList(page, rfxLineSupplierId, updateState);
    });
  }

  /**
   * 设置整包推荐的值，为1
   */
  @Bind()
  setWholePackageFlag(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 1 });
  }

  /**
   * 设置整包推荐的值，为0
   */
  @Bind()
  setWholePackageFlagFalse(rfxLineSupplierId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${rfxLineSupplierId}`]: 0 });
  }

  /**
   * [三生制药] 二开
   * @protected
   */
  @Bind()
  renderHeaderInfo(item) {
    const {
      form: { getFieldDecorator },
      onRiskScan,
      settings,
      header,
      RISK_SCAN = 0,
      remote,
      customizeBtnGroup,
      sourceKey = INQUIRY,
      useNewRateFlag = 0,
    } = this.props;
    const { expand } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag = 0 } = header;
    const headerImg = item.appendFlag ? (
      <Popover
        content={
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.addReson').d('添加理由')}:
            {item.appendRemark}
          </span>
        }
        style={{ maxWidth: '300px' }}
        trigger="hover"
      >
        <img src={processAdd} alt="" style={{ width: 44, height: 44 }} />
      </Popover>
    ) : (
      <img
        src={!item.onLineFlag ? validSupplierImg : supplierImg}
        alt=""
        style={{ width: 44, height: 44 }}
      />
    );
    const { supplierCompanyId } = item || {};
    const supplierTotalAmountTag = [
      item.supplierTotalAmount ? (
        <Tag className={styles.supplierTotalAmount}>
          {item.priceTypeCode === 'TAX_INCLUDED_PRICE'
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)')
            : intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`)
                .d('总价(不含税)')}
          ：
          <Tooltip
            title={
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.supplierTotalAmount}
              />
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.supplierTotalAmount}
              />
            </span>
          </Tooltip>
        </Tag>
      ) : (
        ''
      ),
    ];

    const winedAmountTag = item.winedAmount ? (
      <Tag className={styles.winedAmount}>
        {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
        {`(${
          item.priceTypeCode === 'TAX_INCLUDED_PRICE'
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
        })`}
        ：
        <Tooltip
          title={
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.winedAmount}
              />
              {item.currencyCode}
            </span>
          }
          placement="topLeft"
        >
          <span>
            <PrecisionInputNumber
              financial={item.currencyCode}
              type="hzero"
              readOnly
              value={item.winedAmount}
            />
            {item.currencyCode}
          </span>
        </Tooltip>
      </Tag>
    ) : (
      ''
    );

    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles.sumScore}>
          {item?.technologyPassStatus
            ? `${intl
                .get(`ssrc.inquiryHall.view.message.tab.technicalGroup`)
                .d('技术组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
          ：{item?.technologyPassStatus || item.technologyScore}
        </Tag>
      ) : (
        ''
      );

    const businessScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles.sumScore}>
          {item?.businessPassStatus
            ? `${intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
          ：{item?.businessPassStatus || item.businessScore}
        </Tag>
      ) : (
        ''
      );

    return (
      <div className={styles.container} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div className={styles.leftBox}>
          {headerImg}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
              <span>
                <Tooltip
                  title={
                    item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName
                  }
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle}>
                    {item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: 'rgba(41, 190, 206, 1)', margin: '0 4px' }}
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
              />
              <span style={{ margin: '0 6px' }}>
                {item.candidateFlag === 1 && (
                  <span>
                    <img src={imgUrl} alt="" />
                    <span className={styles.candidate}>
                      {intl.get(`ssrc.inquiryHall.model.inquiryHall.candidate`).d('候选人')}
                    </span>
                  </span>
                )}
              </span>
              {useNewRateFlag ? (
                item.whetherIpCoincide ? (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.yes`).d('是')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateRed} alt="" />
                    </Tooltip>
                  </span>
                ) : (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                        .d('IP是否重合')}：${intl.get(`hzero.common.model.no`).d('否')}`}
                      placement="topRight"
                    >
                      <img src={companyIpRateGrey} alt="" />
                    </Tooltip>
                  </span>
                )
              ) : settings['011107'] &&
                +settings['011107'].settingValue &&
                item.companyIpRate >= 60 ? (
                item.companyIpRate >= 80 ? (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                        .d('重合率')}：${item.companyIpRate}%`}
                      placement="topRight"
                    >
                      <img src={companyIpRateRed} alt="" />
                    </Tooltip>
                  </span>
                ) : (
                  <span>
                    <Tooltip
                      title={`${intl
                        .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                        .d('重合率')}：${item.companyIpRate}%`}
                      placement="topRight"
                    >
                      <img src={companyIpRateGrey} alt="" />
                    </Tooltip>
                  </span>
                )
              ) : (
                ''
              )}
            </div>
            <div onClick={(e) => this.rfxLineTag(e)} style={{ display: 'flex' }}>
              {!newQuotationFlag ? (
                <span>
                  <a
                    onClick={() =>
                      this.showUploadModal(
                        item.businessAttachmentUuid,
                        item.techAttachmentUuid,
                        item.bargainBusinessAttachmentUuid,
                        item.bargainTechAttachmentUuid,
                        item.roundBusinessAttachmentUuid,
                        item.roundTechAttachmentUuid
                      )
                    }
                  >
                    <span>
                      <SVGIcon path={imgUr} style={{ verticalAlign: 'middle' }} />
                    </span>
                    <span style={{ marginLeft: '7px' }}>
                      {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                      <RenderFileTotalCount record={item} uiType="h0" />
                    </span>
                  </a>
                </span>
              ) : (
                <FileGroup record={item} uiType="h0" fileType="HEADER" />
              )}
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          <Tag className={styles.feedbackStatus}>{item.feedbackStatusMeaning}</Tag>
          {!item?.quotationNumber?.match(/\/0$/g) && (
            <Tag className={styles.lineNumber}>
              <Tooltip
                title={`${intl
                  .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
                  .d('[选用行数]指选用行数/报价行数，物料行数为：')}${item.totalItemCount}`}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
                {item.quotationNumber}
              </Tooltip>
            </Tag>
          )}
          {expertScoreType === 'ONLINE' ? (
            <Tag className={styles.sumScore}>
              {item?.sumPassStatus
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
              ：{item.sumPassStatus || item.score}
            </Tag>
          ) : (
            ''
          )}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag
              )
            : businessScoreTag}
          {item.quotationRank ? (
            <Tag className={styles.rank}>
              {item.expertScoreType === 'ONLINE'
                ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreAndRank`).d('得分排名')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRank`).d('报价排名')}
              ：{item.quotationRank}
            </Tag>
          ) : (
            ''
          )}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_SUPPLIER_LINE_LIST_TOTAL_AMOUNT_TAG',
                supplierTotalAmountTag,
                {
                  item,
                  className: styles.supplierTotalAmount,
                }
              )
            : supplierTotalAmountTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_SUPPLIER_LINE_LIST_WINED_AMOUNT_TAG',
                winedAmountTag,
                {
                  item,
                  className: styles.winedAmount,
                }
              )
            : winedAmountTag}
        </div>
        <div className={styles.rightBox}>
          {item.quotationLineNumber * 1 >= 1 && (
            <span onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.wholePackage`).d('整包推荐')}
                style={{ display: 'flex', margin: '0 4px' }}
              >
                {getFieldDecorator(`value#${item.rfxLineSupplierId}`, {
                  initialValue: item.wholeSuggestFlag,
                })(<Switch disabled checkedValue={1} unCheckedValue={0} />)}
              </Form.Item>
            </span>
          )}
          <span>
            {customizeBtnGroup(
              {
                code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS`,
              },
              [
                RISK_SCAN && supplierCompanyId && (
                  <Button name="riskScan" funcType="link" onClick={(e) => onRiskScan(item, e)}>
                    {intl.get('hzero.common.button.riskScan').d('风险扫描')}
                  </Button>
                ),
              ].filter(Boolean)
            )}
          </span>
        </div>
      </div>
    );
  }

  @Bind()
  renderInvalidHeaderInfo(item) {
    const { header, remote } = this.props;
    const { expand } = this.state;
    const { expertScoreType, bidRuleType, newQuotationFlag = 0 } = header;
    const technologyScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles.sumScore}>
          {item?.technologyPassStatus
            ? `${intl
                .get(`ssrc.inquiryHall.view.message.tab.technicalGroup`)
                .d('技术组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
          ：{item?.technologyPassStatus || item.technologyScore}
        </Tag>
      ) : (
        ''
      );

    const businessScoreTag =
      bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
        <Tag className={styles.sumScore}>
          {item?.businessPassStatus
            ? `${intl.get(`ssrc.inquiryHall.view.message.tab.businessGroup`).d('商务组')}${intl
                .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                .d('汇总')}`
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
          ：{item?.businessPassStatus || item.businessScore}
        </Tag>
      ) : (
        ''
      );
    const headerImg = item.appendFlag ? (
      <Popover
        content={
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.addReson').d('添加理由')}:
            {item.appendRemark}
          </span>
        }
        style={{ maxWidth: '300px' }}
        trigger="hover"
      >
        <img src={processAddInvalid} alt="" style={{ width: 44, height: 44 }} />
      </Popover>
    ) : (
      <img
        src={!item.onLineFlag ? inValidSupplierImg : supplierGreyImg}
        alt=""
        style={{ width: 44, height: 44 }}
      />
    );
    return (
      <div className={styles.container} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div className={styles.leftBox}>
          {headerImg}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
              <span>
                <Tooltip
                  title={
                    item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName
                  }
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle}>
                    {item.supplierCompanyNum
                      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                      : item.supplierCompanyName}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: 'rgba(41, 190, 206, 1)', margin: '0 4px' }}
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
              />
            </div>
            <div onClick={(e) => this.rfxLineTag(e)} style={{ display: 'flex' }}>
              <p className={styles.itemListDes}>
                {!newQuotationFlag ? (
                  <span className={styles['itemListDesItem-invalid']}>
                    <img src={attachGrey} alt="" />
                    <span style={{ marginLeft: '7px' }}>
                      {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                      <RenderFileTotalCount record={item} uiType="h0" />
                    </span>
                  </span>
                ) : (
                  <FileGroup record={item} uiType="h0" fileType="HEADER" invalidFlag={1} />
                )}
              </p>
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          <Tag className={styles['feedbackStatus-invalid']}>
            {item.summaryReviewResult === 'NO_APPROVED'
              ? intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')
              : intl.get('ssrc.common.view.status.invalid').d('无效')}
            {/* {item.feedbackStatusMeaning} */}
          </Tag>
          {!item?.quotationNumber?.match(/\/0$/g) && (
            <Tag className={styles['lineNumber-invalid']}>
              <Tooltip
                title={`${intl
                  .get('ssrc.inquiryHall.view.tooltip.selectedNumberTooltip')
                  .d('[选用行数]指选用行数/报价行数，物料行数为：')}${item.totalItemCount}`}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedNumber`).d('选用行数')}：
                {item.quotationNumber}
              </Tooltip>
            </Tag>
          )}
          {expertScoreType === 'ONLINE' ? (
            <Tag className={styles['sumScore-invalid']}>
              {item?.sumPassStatus
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}
              ：{item?.sumPassStatus || item.score}
            </Tag>
          ) : (
            ''
          )}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_APPROVAL_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag
              )
            : businessScoreTag}
          {item.supplierTotalAmount ? (
            <Tag className={styles['supplierTotalAmount-invalid']}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}：
              <Tooltip title={numberSeparatorRender(item.supplierTotalAmount)} placement="topLeft">
                {numberSeparatorRender(item.supplierTotalAmount)}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}
        </div>
        <div className={styles.rightBox} />
      </div>
    );
  }

  @Bind()
  renderTable(tableProps, rfxLineSupplierId) {
    return <SupplierLineTable {...tableProps} rfxLineSupplierId={rfxLineSupplierId} />;
  }

  render() {
    const {
      headerList = [],
      organizationId,
      loading,
      inquiryHall: {
        supplierQuoteLine = [],
        supplierQuoteLinePagination = {},
        header = {},
        supplierLinePagination,
      },
      onChangePagination,
      form,
      hideModal,
      customizeTable,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      sourceKey = INQUIRY,
      fetchLadderLevelTableLoading,
      onComparePriceHistory,
      remote,
    } = this.props;
    const { loadingObj, AttachmentsProps, attachmentVisible } = this.state;
    const tableProps = {
      header,
      organizationId,
      form,
      sourceKey,
      loadingObj,
      customizeTable,
      viewLadderLevel,
      dataSource: supplierQuoteLine,
      pagination: supplierQuoteLinePagination,
      onRef: (calKey, node) => {
        this.supplierLineTable[calKey] = node; // 对应的[rfxLineSupplierId]的supplierLineTable
      },
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      onSetWholePackageFlag: this.setWholePackageFlag,
      onSetWholePackageFlagFalse: this.setWholePackageFlagFalse,
      onComparePriceHistory,
      remote,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };
    const { total = 0 } = supplierLinePagination || {};
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse bordered={false}>
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={
                    item.invalidFlag
                      ? this.renderInvalidHeaderInfo(item)
                      : this.renderHeaderInfo(item)
                  }
                  key={item.rfxLineSupplierId}
                  className={styles.arrowStyle}
                  showArrow={false}
                  disabled={item.invalidFlag}
                >
                  {this.renderTable(tableProps, item.rfxLineSupplierId)}
                </Panel>
              ))}
          </Collapse>
        </Spin>
        {total > 10 && (
          <Pagination
            className={styles.pagination}
            {...supplierLinePagination}
            onChange={(page, pageSize) => onChangePagination(page, pageSize)}
            onShowSizeChange={(current, size) => onChangePagination(current, size)}
          />
        )}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}

const HOCSupplierLineList = (Comp) =>
  compose(
    connect(({ inquiryHall }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Comp);

export default HOCSupplierLineList(SupplierLineList);

export { HOCSupplierLineList, SupplierLineList };
