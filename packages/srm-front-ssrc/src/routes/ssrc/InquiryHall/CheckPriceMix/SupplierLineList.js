import React, { PureComponent } from 'react';
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
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction, noop } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import SVGIcon from '@/routes/components/SvgIcon';

import { INQUIRY } from '@/utils/globalVariable';
import Iconfont from 'srm-front-boot/lib/components/Icons';
import { abandonRemarkRender } from '@/utils/renderer';
import styles from './index.less';
import SupplierLineTable from './SupplierLineTable';
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevel';
import BidLadderLevel from '../../components/LadderLevel/BidIndex';
import PackageRecommendationModel from './PackageRecommendationModel';

const { Panel } = Collapse;
const imgUrl = require('@/assets/candidate.svg');
const imgUr = require('@/assets/d-attachment.svg');
const validSupplierImg = require('@/assets/supplier-inline-valid.svg');
const inValidSupplierImg = require('@/assets/supplier-inline-invalid.svg');
const processAdd = require('@/assets/supplier-processAdd.svg');
const processAddInvalid = require('@/assets/supplier-processAddInvalid.svg');
const supplierImg = require('@/assets/supplier-icon.svg');
const supplierGreyImg = require('@/assets/supplier-icon-grey.svg');
// const attachGrey = require('@/assets/attachment-grey.svg');
const companyIpRateRed = require('@/assets/companyIpRate-red.svg');
const companyIpRateGrey = require('@/assets/companyIpRate-grey.svg');
const eliminateIcon = require('@/assets/eliminate.svg');

class SupplierLineList extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'supplierLineList');
    }
    this.state = {
      loadingObj: {},
      expand: {}, // 展开数据
      isShow: {}, // 数据是否查询显示
      updateState: false,
      attachmentVisible: false,
      AttachmentsProps: {},
      rfxLineSupplierId: undefined, // 最后一次展开的行id
      suggesedResonModelVisible: false, // 分配比例弹框是否可见
      WholePackageRfxLineSupplierId: undefined, // 最后一次点击到的行
      activePanel: [], // 展开的panel
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

  componentDidUpdate(preProps, preState, snap) {
    const {
      inquiryHall: { supplierQuoteLine },
      // form,
    } = this.props;
    const { rfxLineSupplierId } = this.state;
    if (snap !== null) {
      let wholePackageList = {};
      if (!isEmpty(supplierQuoteLine)) {
        const selectedSupplierQuoteLine = supplierQuoteLine.filter(
          // eslint-disable-next-line
          (val) => val.rfxLineSupplierId == rfxLineSupplierId
        );
        // 根据对应的rfxLineSupplierId的整包推荐值，设置必填项
        // if (form.getFieldValue(`value#${rfxLineSupplierId}`)) {
        //   selectedSupplierQuoteLine.forEach(
        //     item => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
        //   );
        // }
        selectedSupplierQuoteLine.forEach((item) => {
          wholePackageList = {
            ...wholePackageList,
            [`${item.quotationLineId}#${item.rfxLineSupplierId}`]:
              item.$form && item.$form.getFieldValue('suggestedFlag'),
          };
        });
        if (this.supplierLineTable[rfxLineSupplierId]) {
          this.supplierLineTable[rfxLineSupplierId].setState({
            suggestedFlagValue: {
              ...this.supplierLineTable[rfxLineSupplierId].state.suggestedFlagValue,
              ...wholePackageList,
            },
          });
        }
      }
    }
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
        checkPriceFlag: 1,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
        bargainBusUuid: bargainBusinessAttachmentUuid, // 议价中商务附件
        bargainTechUuid: bargainTechAttachmentUuid, // 议价中技术附件
        roundBusUuid: roundBusinessAttachmentUuid, // 多轮报价商务附件
        roundTechUuid: roundTechAttachmentUuid, // 多轮报价技术附件
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
    const { dispatch, organizationId, rfxHeaderId, sourceKey = INQUIRY } = this.props;
    const loadingObj = {
      [rfxLineSupplierId]: { fetchItemQuoteLineLoading: true },
    };
    this.setState({ loadingObj });
    dispatch({
      type: 'inquiryHall/fetchSupplierQuoteLine',
      payload: {
        page,
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          loadingObj: { [rfxLineSupplierId]: { fetchItemQuoteLineLoading: false } },
        });
        // eslint-disable-next-line
        // const newDataSource = res.filter(r => r.rfxLineSupplierId == rfxLineSupplierId);
        // if (isArray(res)) {
        //   let wholePackageList = {};
        //   res.forEach(item => {
        //     wholePackageList = {
        //       ...wholePackageList,
        //       [`${item.quotationLineId}#${item.rfxLineSupplierId}`]: item.$form.getFieldValue(
        //         'suggestedFlag'
        //       ),
        //     };
        //   });
        //   this.supplierLineTable.setState({
        //     suggestedFlagValue: {
        //       ...this.supplierLineTable.state.suggestedFlagValue,
        //       ...wholePackageList,
        //     },
        //   });
        // }
      }
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickCollapseChange(e, item) {
    const { changeCurrentPaneActiveSelected } = this.props;
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
    changeCurrentPaneActiveSelected([], item.rfxLineSupplierId);
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
   * 改变整包推荐，设置选用的值
   */
  @Bind()
  changeWholePackage(e, rfxLineSupplierId, quotationHeaderId) {
    const {
      checkWay,
      dispatch,
      headerList,
      organizationId,
      fetchQuoteLine,
      fetchSupplierLine,
      fetchItemLine,
      sourceKey = INQUIRY,
      inquiryHall: {
        supplierQuoteLine = [],
        supplierLinePagination = {},
        quoteLinePagination = {},
        itemLinePagination = {},
      },
      match: { params, path = null },
    } = this.props;
    // 根据rfxLineSupplierId，在dataSource中找出对应的供应商行数据
    // eslint-disable-next-line
    const newDataSource = supplierQuoteLine.filter((r) => r.rfxLineSupplierId == rfxLineSupplierId);
    this.setState({
      suggesedResonModelVisible: !!e && checkWay === 'ratio',
      WholePackageRfxLineSupplierId: rfxLineSupplierId,
    });

    if (!isEmpty(newDataSource)) {
      // 勾选了整包推荐，对应的供应商行数据，勾选为1，否则为0
      if (e === 1) {
        newDataSource.forEach(
          (item) =>
            item.$form &&
            !item.eliminateRoundNumber &&
            item.$form.setFieldsValue({
              suggestedFlag: 1,
              allottedQuantity: item.validQuotationQuantity,
            })
        );
      } else {
        newDataSource.forEach(
          (item) =>
            item.$form && item.$form.setFieldsValue({ suggestedFlag: 0, allottedQuantity: null })
        );
      }
      let wholePackageList = {};
      newDataSource.forEach((item) => {
        wholePackageList = {
          ...wholePackageList,
          [`${item.quotationLineId}#${item.rfxLineSupplierId}`]:
            item.$form && item.$form.getFieldValue('suggestedFlag'),
        };
      });
      // 根据整包推荐的勾选，设置表格中对应字段的必填项
      if (this.supplierLineTable[rfxLineSupplierId]) {
        this.supplierLineTable[rfxLineSupplierId].setState({
          suggestedFlagValue: {
            ...this.supplierLineTable[rfxLineSupplierId].state.suggestedFlagValue,
            ...wholePackageList,
          },
        });
      }
    }

    const modelList =
      headerList && headerList.filter((item) => item.rfxLineSupplierId === rfxLineSupplierId);

    const newList = modelList[0];

    if (newList) {
      dispatch({
        type: 'inquiryHall/saveSuggestedRemark',
        payload: {
          organizationId,
          rfxLineSupplierId: newList.rfxLineSupplierId,
          rfxLineItemId: newList.rfxLineItemId,
          rfxHeaderId: newList.rfxHeaderId,
          quotationHeaderId,
          objectVersionNumber: newList.objectVersionNumber,
          supplierTenantId: newList.supplierTenantId,
          allSelectFlag: e,
        },
      }).then(() => {
        fetchSupplierLine(supplierLinePagination);
        fetchQuoteLine(quoteLinePagination);
        fetchItemLine(itemLinePagination);
        dispatch({
          type: 'inquiryHall/fetchSupplierQuoteLine',
          payload: {
            organizationId,
            rfxLineSupplierId: newList.rfxLineSupplierId,
            rfxHeaderId: newList.rfxHeaderId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
          },
        });
        dispatch({
          type: 'inquiryHall/fetchInquiryHeaderDetail',
          payload: {
            rfxHeaderId: params.rfxId,
            organizationId,
            path,
            customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
          },
        });
      });
    }
  }

  @Bind()
  openPackgeModel(e, rfxLineSupplierId) {
    this.rfxLineTag(e);
    this.setState({
      suggesedResonModelVisible: true,
      WholePackageRfxLineSupplierId: rfxLineSupplierId,
    });
  }

  @Bind()
  hidePackgeModel(e, rfxLineSupplierId, quotationHeaderId) {
    this.rfxLineTag(e);
    // this.setState({
    //   suggesedResonModelVisible: false,
    // });
    this.props.form.setFieldsValue({
      [`value#${this.state.WholePackageRfxLineSupplierId}`]: false,
    });
    this.changeWholePackage(0, rfxLineSupplierId, quotationHeaderId);
  }

  /**
   * 保存选用理由
   * @param {*} e
   * @param {*} item
   */
  @Bind()
  saveSuggestedRemark(e, item) {
    this.rfxLineTag(e);
    const {
      dispatch,
      organizationId,
      fetchQuoteLine,
      fetchSupplierLine,
      fetchItemLine,
      sourceKey = INQUIRY,
      inquiryHall: {
        supplierLinePagination = {},
        quoteLinePagination = {},
        itemLinePagination = {},
      },
      match: { params, path = null },
    } = this.props;
    this.suggestedRemarkRef.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'inquiryHall/saveSuggestedRemark',
          payload: {
            organizationId,
            rfxLineSupplierId: item.rfxLineSupplierId,
            rfxLineItemId: item.rfxLineItemId,
            rfxHeaderId: item.rfxHeaderId,
            quotationHeaderId: item.quotationHeaderId,
            objectVersionNumber: item.objectVersionNumber,
            supplierTenantId: item.supplierTenantId,
            ...values,
          },
        }).then(() => {
          this.setState({
            suggesedResonModelVisible: false,
          });
          fetchSupplierLine(supplierLinePagination);
          fetchQuoteLine(quoteLinePagination);
          fetchItemLine(itemLinePagination);
          dispatch({
            type: 'inquiryHall/fetchSupplierQuoteLine',
            payload: {
              organizationId,
              rfxLineSupplierId: item.rfxLineSupplierId,
              rfxHeaderId: item.rfxHeaderId,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_SUPPLIER`,
            },
          });
          dispatch({
            type: 'inquiryHall/fetchInquiryHeaderDetail',
            payload: {
              rfxHeaderId: params.rfxId,
              organizationId,
              path,
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
            },
          });
        });
      }
    });
  }

  @Bind()
  onSuggestedRemarkRef(ref) {
    this.suggestedRemarkRef = ref.props.form || {};
  }

  suggestedRemarkRef;

  /**
   * 渲染Tag - [lotus] 二开重写, 谨慎修改!!!
   * @protected
   */
  renderQuotationLineTag(item) {
    return [
      abandonRemarkRender({
        val: (
          <Tag
            className={
              item?.feedbackStatus === 'ABANDONED'
                ? styles.feedbackStatusAbandoned
                : styles.feedbackStatus
            }
          >
            {item.feedbackStatusMeaning}
            {item?.feedbackStatus === 'ABANDONED' ? (
              <Icon type="question-circle" style={{ marginLeft: '2px' }} />
            ) : (
              ''
            )}
          </Tag>
        ),
        record: item,
      }),
      <Tag className={styles.lineNumber}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationNumber`).d('报价行数')}：
        {item.quotationNumber}
      </Tag>,
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
        </span>
      </a>,
    ];
  }

  renderHeaderInfo(item) {
    const {
      checkWay,
      settings,
      inquiryHall: { header = {} },
      onRiskScan,
      form: { getFieldDecorator },
    } = this.props;
    const { expand } = this.state;
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
    return (
      <div className={styles.itemList} onClick={(e) => this.clickCollapseChange(e, item)}>
        {item.allEliminate ? (
          <img src={eliminateIcon} alt="icon" />
        ) : (
          <div className={styles.itemListImg}>{headerImg}</div>
        )}
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <div className={styles.itemListHeaderTop}>
              <div className={styles.itemListNum}>
                {item.supplierCompanyNum
                  ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                  : item.supplierCompanyName}
              </div>
              <div className={styles.itemListNumRight}>
                <Icon
                  style={{ color: 'rgba(41, 190, 206, 1)', margin: '0 4px' }}
                  type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
                  // onClick={e => this.handleCollapseChange(e, item)}
                />
              </div>
              <div>
                {item.candidateFlag === 1 && (
                  <Popover placement="topLeft" content={item.candidateSuggestion}>
                    <span className={styles.allcandidate}>
                      <img src={imgUrl} alt="" />
                      <span className={styles.candidate}>
                        {intl.get(`ssrc.inquiryHall.model.inquiryHall.candidate`).d('候选人')}
                      </span>
                    </span>
                  </Popover>
                )}
                {settings['011107'] &&
                +settings['011107'].settingValue &&
                item.companyIpRate >= 60 ? (
                  item.companyIpRate >= 80 ? (
                    <span className={styles.companyIpRate}>
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
                    <span className={styles.companyIpRate}>
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
            </div>
            <div className={styles.itemListHeaderBottom}>
              <span className={styles.itemListDesItem} onClick={(e) => this.rfxLineTag(e)}>
                <span>{this.renderQuotationLineTag(item)}</span>
              </span>
            </div>
          </div>
          <div className={styles.headerTag}>
            <div className={styles.lineTag}>
              {header.expertScoreType === 'ONLINE' ? (
                <Tag className={styles.sumScore}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}：{item.score}
                </Tag>
              ) : (
                ''
              )}
              {header.bidRuleType === 'DIFF' && header.expertScoreType === 'ONLINE' ? (
                <Tag className={styles.sumScore}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}：
                  {item.technologyScore}
                </Tag>
              ) : (
                ''
              )}
              {header.bidRuleType === 'DIFF' && header.expertScoreType === 'ONLINE' ? (
                <Tag className={styles.sumScore}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}：
                  {item.businessScore}
                </Tag>
              ) : (
                ''
              )}
              {item.supplierTotalAmount && (
                <Popover content={item.supplierTotalAmount || ''}>
                  <Tag className={styles.supplierTotalAmount}>
                    {item.priceTypeCode === 'TAX_INCLUDED_PRICE'
                      ? intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`)
                          .d('总价(含税)')
                      : intl
                          .get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`)
                          .d('总价(不含税)')}
                    ：{item.supplierTotalAmount}
                  </Tag>
                </Popover>
              )}
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
              {item.winedAmount ? (
                <Tag color="rgba(71,184,129,0.20)" style={{ color: '#47B881' }}>
                  {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
                  {`(${
                    item.priceTypeCode === 'TAX_INCLUDED_PRICE'
                      ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
                      : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
                  })`}
                  ：{`${item.winedAmount} ${item.currencyCode}`}
                </Tag>
              ) : (
                ''
              )}
            </div>

            <div className={styles.lineOption}>
              {item.isMonitor === 1 || item.isShowScan === 1 ? (
                <div className={styles.riskScan} onClick={(e) => this.rfxLineTag(e)}>
                  <span onClick={() => onRiskScan(item)}>
                    {intl.get('hzero.common.button.riskMonitoring').d('风险监控')}
                  </span>
                </div>
              ) : (
                <div onClick={(e) => this.rfxLineTag(e)}>
                  <span className={styles.riskScan} onClick={() => onRiskScan(item)}>
                    {intl.get('hzero.common.button.riskScan').d('风险扫描')}
                  </span>
                </div>
              )}
              <div className={styles.wholePackage} onClick={(e) => this.rfxLineTag(e)}>
                <Tag className={styles.wholePackagetag}>
                  <Form.Item
                    className={styles.wholePackageStyle}
                    label={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.wholePackage`)
                      .d('整包推荐')}
                  >
                    {getFieldDecorator(`value#${item.rfxLineSupplierId}`, {
                      initialValue: item.wholeSuggestFlag,
                    })(
                      <Switch
                        disabled={item.allEliminate || item.quotationLineNumber * 1 === 0}
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={(e) => {
                          if (item.quotationHeaderId) {
                            this.changeWholePackage(
                              e,
                              item.rfxLineSupplierId,
                              item.quotationHeaderId
                            );
                          } else {
                            setTimeout(() => {
                              const name = `value#${item.rfxLineSupplierId}`;
                              this.props.form.setFieldsValue({ [name]: 0 });
                            }, 0);
                            notification.error({
                              message: intl
                                .get(`ssrc.inquiryHall.view.message.abandonedWholePackage`)
                                .d('已放弃，无法整包推荐'),
                            });
                          }
                        }}
                      />
                    )}
                  </Form.Item>
                </Tag>
              </div>
              {this.props.form.getFieldValue(`value#${item.rfxLineSupplierId}`) &&
              checkWay === 'ratio' ? (
                <div className={styles.modelInfo}>
                  <Popover
                    content={<div style={{ maxWidth: '400px' }}>{item.suggestedRemark || ''}</div>}
                  >
                    <div className={styles.suggestedReason}>
                      {`${intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由')}：${
                        item.suggestedRemark || ''
                      }`}
                    </div>
                  </Popover>
                  <div className={styles.rate}>
                    {`${intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.distributionRatio`)
                      .d('分配比例')}：${item.allottedRatio || ''}%`}
                  </div>
                  <Iconfont
                    type="edit"
                    style={{ color: '#29bece', fontSize: '20px' }}
                    onClick={(e) => this.openPackgeModel(e, item.rfxLineSupplierId)}
                  />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 渲染无效供应商样式
   */
  @Bind()
  renderInvalidHeaderInfo(item) {
    const { expand } = this.state;
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
      <div className={styles.itemList} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div className={styles.itemListImg}>{headerImg}</div>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <div className={styles.itemListHeaderTop}>
              <div className={styles.itemListNum} style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                {item.supplierCompanyNum
                  ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                  : item.supplierCompanyName}
              </div>
              <div className={styles.itemListNumRight}>
                <Icon
                  style={{ color: 'rgba(0, 0, 0, 0.25)', margin: '0 4px' }}
                  type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
                />
              </div>
            </div>
            <div className={styles.itemListHeaderBottom}>
              <Tag className={styles['feedbackStatus-invalid']}>
                {item.summaryReviewResult === 'NO_APPROVED'
                  ? intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')
                  : intl.get('ssrc.common.view.status.invalid').d('无效')}
              </Tag>
              <Tag className={styles['lineNumber-invalid']}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationNumber`).d('报价行数')}：
                {item.quotationNumber}
              </Tag>
              <span
                className={styles['itemListDesItem-invalid']}
                onClick={(e) => this.rfxLineTag(e)}
              >
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
                  <SVGIcon path={imgUr} style={{ verticalAlign: 'middle' }} />
                  <span style={{ marginLeft: '7px' }}>
                    {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                  </span>
                </a>
              </span>
            </div>
          </div>
          <div className={styles.headerTag}>
            <div className={styles.lineTag}>
              {item?.score || item?.score === 0 ? (
                <Tag className={styles['sumScore-invalid']}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.score`).d('总分')}：{item.score}
                </Tag>
              ) : (
                ''
              )}
              {item.supplierTotalAmount && (
                <Tag className={styles['supplierTotalAmount-invalid']}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmount`).d('报价总价')}
                  ：{item.supplierTotalAmount}
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  @Bind()
  changeCollapse(active) {
    this.setState({
      activePanel: active,
    });
  }

  /**
   * 绑定ref
   */
  @Bind()
  handleRef(calKey, node) {
    this.supplierLineTable[calKey] = node; // 对应的[rfxLineSupplierId]的supplierLineTable
  }

  render() {
    const {
      checkWay,
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
      sourceKey = INQUIRY,
      form,
      hideModal,
      customizeTable,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      saveSuggestedRemarkLoading,
      changeCurrentPaneActiveSelected = () => {},
      changeSupplierLineTableSelection = () => {},
      currentPaneActiveSelected = {},
      renderValidQuotationQuantity = noop,
      supplierLineTableSelectedKeys = [],
      supplierLineTableSelectedRows = [],
      fetchSupplierLineCheckPriceLoading,
    } = this.props;
    const {
      loadingObj,
      AttachmentsProps,
      attachmentVisible,
      suggesedResonModelVisible,
      WholePackageRfxLineSupplierId,
      activePanel,
    } = this.state;
    const tableProps = {
      header,
      checkWay,
      sourceKey,
      organizationId,
      form,
      loadingObj,
      customizeTable,
      viewLadderLevel,
      renderValidQuotationQuantity,
      dataSource: supplierQuoteLine,
      pagination: supplierQuoteLinePagination,
      onRef: this.handleRef,
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      onSetWholePackageFlag: this.setWholePackageFlag,
      onSetWholePackageFlagFalse: this.setWholePackageFlagFalse,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
      changeSupplierLineTableSelection,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };

    const modelList = headerList.filter(
      (item) => item.rfxLineSupplierId === WholePackageRfxLineSupplierId
    );
    const packageModelProps = {
      header,
      visible: suggesedResonModelVisible,
      hideModal: this.hidePackgeModel,
      loadloading: fetchSupplierLineCheckPriceLoading,
      // saveSuggestedRemark: this.saveSuggestedRemark,
      confirmLoading: saveSuggestedRemarkLoading,
      onRef: this.onSuggestedRemarkRef,
    };

    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={
                    item.invalidFlag || item.summaryReviewResult === 'NO_APPROVED'
                      ? this.renderInvalidHeaderInfo(item)
                      : this.renderHeaderInfo(item)
                  }
                  key={item.rfxLineSupplierId}
                  className={styles.arrowStyle}
                  showArrow={false}
                  // disabled={item.invalidFlag}
                >
                  <SupplierLineTable {...tableProps} rfxLineSupplierId={item.rfxLineSupplierId} />
                </Panel>
              ))}
          </Collapse>
        </Spin>
        {headerList?.length > 0 ? (
          <Pagination
            className={styles.pagination}
            {...supplierLinePagination}
            onChange={(page, pageSize) => onChangePagination(page, pageSize)}
            onShowSizeChange={(current, size) => onChangePagination(current, size)}
          />
        ) : null}
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {viewLadderLevelVisible &&
          (sourceKey === INQUIRY ? (
            <LadderLevel {...ladderLevelModalProps} />
          ) : (
            <BidLadderLevel {...ladderLevelModalProps} />
          ))}
        <div onClick={(e) => this.rfxLineTag(e)}>
          {suggesedResonModelVisible && (
            <PackageRecommendationModel
              {...packageModelProps}
              item={modelList[0]}
              saveSuggestedRemark={(e) => this.saveSuggestedRemark(e, modelList[0])}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

const withStandardCompEnhancer = (Comp) => {
  return connect(({ inquiryHall, loading }) => ({
    inquiryHall,
    organizationId: getCurrentOrganizationId(),
    saveSuggestedRemarkLoading: loading.effects['inquiryHall/saveSuggestedRemark'],
    fetchSupplierLineCheckPriceLoading: loading.effects['inquiryHall/fetchSupplierLineCheckPrice'],
  }))(Form.create({ fieldNameProp: null })(Comp));
};

export { withStandardCompEnhancer, SupplierLineList };
export default withStandardCompEnhancer(SupplierLineList);
