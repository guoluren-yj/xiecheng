import React, { PureComponent } from 'react';
import { Tag, Pagination, Spin, Form, Modal, Icon, Switch, Tooltip, Popover } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isFunction, noop, isNil } from 'lodash';
import { connect } from 'dva';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import Iconfont from '_components/Icons';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { openTab } from 'utils/menuTab';
import EmbedPage from '_components/EmbedPage';

import { INQUIRY, INQUIRY_HALL_LOWERCASE } from '@/utils/globalVariable';
import Attachment from '@/routes/ssrc/components/Attachment';
import LadderLevel from '@/routes/ssrc/components/LadderLevelDoubleUnit';
import BidLadderLevel from '@/routes/ssrc/components/LadderLevelDoubleUnit/BidIndex';
import CombineComponent from '@/routes/components/CombineComponent';
import { numberSeparatorRender } from '@/utils/renderer';
import { calculateBasicQty } from '@/utils/utils';
import SVGIcon from '@/routes/components/SvgIcon';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import SupplierLineTable from './SupplierLineTable';

import styles from './index.less';
import ListRender from './ListRender';
import PackageRecommendationModel from '../components/PackageRecommendationModel';

const modelNameVar = INQUIRY_HALL_LOWERCASE;
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
const supplierBanQuotationSvg = require('@/assets/biddingHall/supplier-ban-quotation.svg');
const supplierNoSupplementPriceSvg = require('@/assets/biddingHall/supplier-no-supplement-price.svg');

class SupplierLineList extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'supplierLineList');
    }
    this.state = {
      loadingObj: {},
      isShow: {}, // 数据是否查询显示
      updateState: false,
      attachmentVisible: false,
      AttachmentsProps: {},
      rfxLineSupplierId: undefined, // 最后一次展开的行id
      suggesedResonModelVisible: false, // 分配比例弹框是否可见
      WholePackageRfxLineSupplierId: undefined, // 最后一次点击到的行
      wholePackageLoading: false, // 整包推荐loading
    };
    this.supplierLineTable = {}; // 存放ds map
  }

  // // 在元素被渲染并写入 DOM 之前调用
  // getSnapshotBeforeUpdate(preProps) {
  //   const {
  //     inquiryHall: { supplierQuoteLine },
  //   } = this.props;
  //   const {
  //     inquiryHall: { supplierQuoteLine: preLine },
  //   } = preProps;
  //   if (supplierQuoteLine !== preLine) {
  //     return true;
  //   }
  //   return null;
  // }

  // componentDidUpdate(preProps, preState, snap) {
  //   const {
  //     inquiryHall: { supplierQuoteLine },
  //     // form,
  //   } = this.props;
  //   const { rfxLineSupplierId } = this.state;
  //   if (snap !== null) {
  //     let wholePackageList = {};
  //     if (!isEmpty(supplierQuoteLine)) {
  //       const selectedSupplierQuoteLine = supplierQuoteLine.filter(
  //         // eslint-disable-next-line
  //         (val) => val.rfxLineSupplierId == rfxLineSupplierId
  //       );
  //       // 根据对应的rfxLineSupplierId的整包推荐值，设置必填项
  //       // if (form.getFieldValue(`value#${rfxLineSupplierId}`)) {
  //       //   selectedSupplierQuoteLine.forEach(
  //       //     item => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
  //       //   );
  //       // }
  //       selectedSupplierQuoteLine.forEach((item) => {
  //         wholePackageList = {
  //           ...wholePackageList,
  //           [`${item.quotationLineId}#${item.rfxLineSupplierId}`]:
  //             item.$form && item.$form.getFieldValue('suggestedFlag'),
  //         };
  //       });
  //       if (this.supplierLineTable[rfxLineSupplierId]) {
  //         this.supplierLineTable[rfxLineSupplierId].setState({
  //           suggestedFlagValue: {
  //             ...this.supplierLineTable[rfxLineSupplierId].state.suggestedFlagValue,
  //             ...wholePackageList,
  //           },
  //         });
  //       }
  //     }
  //   }
  // }

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
    roundTechAttachmentUuid,
    item
  ) {
    const { modelName = 'inquiryHall' } = this.props;
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
        modelName,
        item,
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
      modelName = 'inquiryHall',
      [modelName]: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: `${modelName}/updateState`,
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
    const {
      dispatch,
      organizationId,
      rfxHeaderId,
      sourceKey = INQUIRY,
      modelName = 'inquiryHall',
    } = this.props;
    const loadingObj = {
      [rfxLineSupplierId]: { fetchItemQuoteLineLoading: true },
    };
    this.setState({ loadingObj });
    dispatch({
      type: `${modelName}/fetchSupplierQuoteLine`,
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
   * 供应商-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineSupplierId) {
    const {
      dispatch,
      modelName = 'inquiryHall',
      [modelName]: { supplierQuoteLine, supplierQuoteLinePagination = {} },
    } = this.props;
    const { updateState } = this.state;
    // 改变分页，先把对应得rfxLineSupplierId得数据清空，再重新查询
    const newSupplierQuoteLine = supplierQuoteLine.filter(
      (item) => +item.rfxLineSupplierId !== rfxLineSupplierId
    );
    delete supplierQuoteLinePagination[rfxLineSupplierId];
    dispatch({
      type: `${modelName}/updateState`,
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
  async changeWholePackage(e, rfxLineSupplierId, quotationHeaderId) {
    const {
      checkWay,
      dispatch,
      headerList,
      organizationId,
      fetchQuoteLine,
      fetchSupplierLine,
      fetchItemLine,
      modelName = 'inquiryHall',
      [modelName]: {
        supplierLinePagination = {},
        quoteLinePagination = {},
        itemLinePagination = {},
      },
      fetchHeaderInfo = noop,
      handleSave = noop,
      checkPriceUpdate = noop,
      remote,
      clearAllTable,
      refreshAttachmentListTable = noop,
    } = this.props;

    const quotationLine =
      headerList && headerList.filter((item) => item.rfxLineSupplierId === rfxLineSupplierId);

    if (isEmpty(quotationLine)) return;

    this.setState({
      wholePackageLoading: true,
    });

    // 先保存
    const res = await handleSave('', 0);
    if (!res) {
      // 保存失败/校验失败
      const name = `value#${rfxLineSupplierId}`;
      this.props.form.setFieldsValue({ [name]: Number(!e) });
      this.setState({
        wholePackageLoading: false,
      });
      checkPriceUpdate();
      return;
    }

    refreshAttachmentListTable();
    // 先查询数据
    const response = await fetchSupplierLine(supplierLinePagination);
    const supplierList = response?.content;
    if (isEmpty(supplierList)) {
      this.setState({
        wholePackageLoading: false,
      });
      checkPriceUpdate();
      return;
    }

    // 取出对应ds
    const records = this.supplierLineTable?.[rfxLineSupplierId]?.records || [];

    if (!isEmpty(records)) {
      // 勾选了整包推荐，对应的供应商行数据，勾选为1，否则为0
      if (e === 1) {
        records.forEach((record) => {
          const {
            eliminateRoundNumber,
            validQuotationQuantity,
            validQuotationSecQuantity,
          } = record.get([
            'eliminateRoundNumber',
            'validQuotationQuantity',
            'validQuotationSecQuantity',
          ]);
          if (!eliminateRoundNumber) {
            record.set('suggestedFlag', 1);
            record.set('allottedSecondaryQuantity', validQuotationSecQuantity);
            record.set('allottedQuantity', validQuotationQuantity);
          }
        });
      } else {
        records.forEach((record) => {
          record.set('suggestedFlag', 0);
          record.set('allottedQuantity', null);
          record.set('allottedSecondaryQuantity', null);
        });
      }
      let wholePackageList = {};
      records.forEach((record) => {
        const {
          suggestedFlag,
          quotationLineId,
          rfxLineSupplierId: itemRfxLineSupplierId,
        } = record.get(['suggestedFlag', 'quotationLineId', 'rfxLineSupplierId']);
        wholePackageList = {
          ...wholePackageList,
          [`${quotationLineId}#${itemRfxLineSupplierId}`]: suggestedFlag,
        };
      });
      // 根据整包推荐的勾选，设置表格中对应字段的必填项
      if (this.supplierLineTable[rfxLineSupplierId]) {
        // eslint-disable-next-line no-unused-expressions
        this.supplierLineTable[rfxLineSupplierId]?.setState('suggestedFlagValue', {
          ...this.supplierLineTable[rfxLineSupplierId]?.getState('suggestedFlagValue'),
          ...wholePackageList,
        });
      }
    }

    const modelList =
      supplierList?.filter((item) => item.rfxLineSupplierId === rfxLineSupplierId) || [];

    const currentSupplier = modelList[0];

    if (currentSupplier) {
      dispatch({
        type: `${modelName}/saveSuggestedRemark`,
        payload: {
          organizationId,
          rfxLineSupplierId: currentSupplier.rfxLineSupplierId,
          rfxLineItemId: currentSupplier.rfxLineItemId,
          rfxHeaderId: currentSupplier.rfxHeaderId,
          quotationHeaderId,
          objectVersionNumber: currentSupplier.objectVersionNumber,
          supplierTenantId: currentSupplier.supplierTenantId,
          allSelectFlag: e,
        },
      }).then(async (singleRes) => {
        const suggesedResonModelVisible = remote
          ? remote.process(
              'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_SUGGESED_RESON_MODEL_VISIBLE',
              singleRes && !!e && checkWay === 'ratio',
              { singleRes, e }
            )
          : singleRes && !!e && checkWay === 'ratio';

        await Promise.all([
          ...Object.values(this.supplierLineTable).map((ds) => ds?.query()),
          fetchHeaderInfo(),
          fetchSupplierLine(supplierLinePagination),
        ]);
        // 不要放在await前面 不然会存在父组件先刷新，然后这个组件才setstate，父组件loading会一直为true
        fetchQuoteLine(quoteLinePagination);
        fetchItemLine(itemLinePagination);
        this.setState({
          wholePackageLoading: false,
          suggesedResonModelVisible,
          WholePackageRfxLineSupplierId: rfxLineSupplierId,
        });
        if (!singleRes) {
          const name = `value#${rfxLineSupplierId}`;
          this.props.form.setFieldsValue({ [name]: Number(!e) });
        }
      });
    }
    clearAllTable();
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
  // eslint-disable-next-line no-unused-vars
  hidePackgeModel(e, rfxLineSupplierId, quotationHeaderId) {
    this.rfxLineTag(e);
    this.setState({
      suggesedResonModelVisible: false,
    });
    // this.props.form.setFieldsValue({
    //   [`value#${this.state.WholePackageRfxLineSupplierId}`]: false,
    // });
    // this.changeWholePackage(0, rfxLineSupplierId, quotationHeaderId);
  }

  /**
   * 保存选用理由
   * @param {*} e
   * @param {*} item
   */
  @Bind()
  @Throttle(1000)
  saveSuggestedRemark(e, item) {
    this.rfxLineTag(e);
    const {
      dispatch,
      organizationId,
      fetchQuoteLine,
      fetchSupplierLine,
      modelName = 'inquiryHall',
      [modelName]: { supplierLinePagination = {}, quoteLinePagination = {} },
      fetchHeaderInfo = noop,
      handleSave = noop,
      sourceKey,
      checkPriceUpdate = noop,
      clearAllTable = noop,
      refreshAttachmentListTable = noop,
    } = this.props;
    this.setState({
      wholePackageLoading: true,
    });
    this.suggestedRemarkRef.validateFields(async (err, values) => {
      if (!err) {
        // 先保存
        const res = await handleSave('', 0);
        if (!res) {
          // 保存失败/校验失败
          this.setState({
            suggesedResonModelVisible: false,
            wholePackageLoading: false,
          });
          checkPriceUpdate();
          return;
        }
        dispatch({
          type: `${modelName}/saveSuggestedRemark`,
          payload: {
            organizationId,
            rfxLineSupplierId: item.rfxLineSupplierId,
            rfxLineItemId: item.rfxLineItemId,
            rfxHeaderId: item.rfxHeaderId,
            quotationHeaderId: item.quotationHeaderId,
            objectVersionNumber: item.objectVersionNumber,
            supplierTenantId: item.supplierTenantId,
            ...values,
            queryParams: {
              customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.DISTRIBUTE_RATE`,
            },
          },
        }).then(async () => {
          this.setState({
            wholePackageLoading: false,
            suggesedResonModelVisible: false,
          });
          clearAllTable();
          fetchQuoteLine(quoteLinePagination);

          await Promise.all([
            ...Object.values(this.supplierLineTable).map((ds) => ds?.query()),
            fetchHeaderInfo(),
            fetchSupplierLine(supplierLinePagination),
          ]);
          refreshAttachmentListTable();
        });
      } else {
        this.setState({
          wholePackageLoading: false,
        });
      }
    });
  }

  @Bind()
  onSuggestedRemarkRef(ref) {
    this.suggestedRemarkRef = ref.props.form || {};
  }

  @Bind()
  handleJumpToSupplierLifecycle(item, e) {
    e.stopPropagation();
    const { sslmLifeCycleFlag } = this.props;
    const { tenantId, companyId, partnerTenantId, supplierCompanyId } = item;
    const searchObj = {
      tenantId,
      partnerTenantId,
      companyId,
      supplierCompanyId,
    };
    const newSupplierDetailPath = sslmLifeCycleFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';
    openTab({
      key: newSupplierDetailPath,
      path: newSupplierDetailPath,
      title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
      search: querystring.stringify(searchObj),
      closable: true,
    });
  }

  suggestedRemarkRef;

  @Bind()
  renderHeaderInfo(item, scrollTo) {
    const {
      checkWay,
      settings,
      onRiskScan,
      basicInfoDs,
      form: { getFieldDecorator },
      supplierLifecyclePermission,
      RISK_SCAN,
      remote,
      expand = {},
      clickCollapseChange = () => {},
      bidFlag,
      customizeBtnGroup,
      sourceKey = INQUIRY,
      current = {},
      useNewRateFlag = 0,
      japOrDutchBiddingTotalPrice = () => {},
      japanBiddingTotalPrice = () => {},
    } = this.props;
    const { expertScoreType, bidRuleType } =
      basicInfoDs?.current?.get(['expertScoreType', 'bidRuleType', 'newQuotationFlag']) || {};
    const {
      supplierCompanyId,
      biddingRoundSupplierStatus,
      biddingRoundSupplierStatusMeaning,
      biddingAcceptCount,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      priceTypeCode,
      acceptQtnNetAmount,
      acceptQtnTotalAmount,
      allEliminate,
      biddingSupplierAcceptNumber,
    } = item || {};

    const taxIncluded = priceTypeCode === 'TAX_INCLUDED_PRICE';

    const japanDutchTotalBidding = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();
    const japanTotalBidding = japanBiddingTotalPrice && japanBiddingTotalPrice();

    // 在外层调用跳到指定位置
    this.scrollTo = scrollTo;

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
    const companyName = item.supplierCompanyNum
      ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
      : item.supplierCompanyName;

    const getCuxStyle = (fieldName) => {
      return (
        (remote
          ? remote.process('SSRC_CHECK_PRICE_SUPPLIER_LINE_FIELD_CUX_STYLE', {}, { fieldName })
          : {}) || {}
      );
    };

    const suppliersupplierTotalAmountTagTitle = taxIncluded
      ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)')
      : intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierTotalAmountNotTax`).d('总价(不含税)');

    const supplierTotalAmountTag = [
      item.supplierTotalAmount && !japanDutchTotalBidding ? (
        <Tag className={styles.supplierTotalAmount} style={getCuxStyle('supplierTotalAmount')}>
          {suppliersupplierTotalAmountTagTitle}：
          <Tooltip
            title={
              <PrecisionInputNumber
                financial={item.localCurrencyCode}
                type="hzero"
                readOnly
                value={item.supplierTotalAmount}
              />
            }
            placement="topLeft"
          >
            <span>
              <PrecisionInputNumber
                financial={item.localCurrencyCode}
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

    // 接受价格 - 日/荷兰竞价大厅
    const japanDutchAcceptAmountValue = taxIncluded ? acceptQtnTotalAmount : acceptQtnNetAmount;
    const japanDutchAcceptAmountFormatted = numberSeparatorRender(japanDutchAcceptAmountValue);
    const acceptPriceAndRound = `${japanDutchAcceptAmountFormatted} / ${
      biddingSupplierAcceptNumber || '-'
    }`;
    const japanDutchAcceptAmount =
      japanDutchTotalBidding && !isNil(japanDutchAcceptAmountValue)
        ? [
          <Tag className={styles.supplierTotalAmount}>
            {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.accepttedPriceAndRound`)
                .d('接受价格/轮次')}
              ：<Tooltip title={acceptPriceAndRound}>{acceptPriceAndRound}</Tooltip>
          </Tag>,
          ]
        : '';

    const supplementAmountPrice = taxIncluded ? supplementQtnTotalAmount : supplementQtnNetAmount;
    const supplementAmountPriceFormatted = numberSeparatorRender(supplementAmountPrice);
    //  补充单价汇总金额
    const supplementAmount =
      japanDutchTotalBidding && !isNil(supplementAmountPrice)
        ? [
          <Tag className={styles.supplierTotalAmount}>
            {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplementSummaryAmount`)
                .d('补充单价汇总金额')}
              ：
            <Tooltip title={supplementAmountPriceFormatted}>
              {supplementAmountPriceFormatted}
            </Tooltip>
          </Tag>,
          ]
        : '';

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

    // 整包推荐-禁用情况 【淘汰】、【供应商状态为禁止报价】、【供应商状态为未补充单价】
    const wholePackageDisabled = allEliminate || item.supplierStatus === 'PROHIBIT_QUOTATION';

    const WholePackageFormItemStyle = { display: 'flex', margin: '0 4px' };
    const WholePackage = (
      <Switch
        disabled={
          remote
            ? remote.process(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_WHOLEPACKAGE_SWITCH_DISABLED',
                wholePackageDisabled,
                { basicInfoDs, item, bidFlag }
              )
            : wholePackageDisabled
        }
        checkedValue={1}
        unCheckedValue={0}
        onChange={(e) => {
          if (item.quotationHeaderId) {
            this.changeWholePackage(e, item.rfxLineSupplierId, item.quotationHeaderId);
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

    const suggesedRemarkVisible = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_SUGGESED_REMARK_VISIBLE',
          item.wholeSuggestFlag && checkWay === 'ratio',
          { wholeSuggestFlag: item.wholeSuggestFlag }
        )
      : item.wholeSuggestFlag && checkWay === 'ratio';

    const stdAllottedRatioRender = `${intl
      .get(`ssrc.inquiryHall.model.inquiryHall.distributionRatio`)
      .d('分配比例')}：${item.allottedRatio || ''}%`;

    const allottedRatioRender = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_ALLOTTED_RATIO',
          stdAllottedRatioRender,
          { item, checkWay }
        )
      : stdAllottedRatioRender;

    // 不同情况显示前面不同的图标
    const getDisplayIcon = () => {
      const imgStyle = { width: 44, height: 44 };

      if (allEliminate) {
        // 全部淘汰
        return <img src={eliminateIcon} style={imgStyle} alt="icon" />;
      }

      // 新竞价会有报价禁止报价状态
      if (item.supplierStatus === 'PROHIBIT_QUOTATION') {
        return <img src={supplierBanQuotationSvg} style={imgStyle} alt="icon" />;
      } else if (item.supplierStatus === 'UN_SUPPLEMENT_PRICE') {
        // 未补充单价
        return <img src={supplierNoSupplementPriceSvg} style={imgStyle} alt="icon" />;
      } else if (item.quotedCount === 0) {
        return (
          <img
            src={!item.onLineFlag ? inValidSupplierImg : supplierGreyImg}
            alt=""
            style={imgStyle}
          />
        );
      } else {
        return headerImg;
      }
    };
    const quotationRankFlag = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_QUOTATIONRANK_FLAG',
          item.quotationRank,
          { basicInfoDs }
        )
      : item.quotationRank;

    let rankDom = quotationRankFlag ? (
      <Tag className={styles.rank}>
        {item.expertScoreType === 'ONLINE' || japanDutchTotalBidding
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreAndRank`).d('得分排名')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRank`).d('报价排名')}
        ：{item.quotationRank}
      </Tag>
    ) : (
      ''
    );
    rankDom = remote
      ? remote.process('SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_QUOTATIONRANK_DOM', rankDom, {
          quotationRankFlag,
          item,
          japanDutchTotalBidding,
          that: this,
          styles,
          basicInfoDs,
        })
      : rankDom;

    return (
      <div className={styles.container} onClick={(e) => clickCollapseChange(e, item, scrollTo)}>
        <div className={styles.leftBox}>
          {getDisplayIcon()}
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
              <span>
                <Tooltip title={companyName} placement="topLeft">
                  <div className={styles.leftBoxTitle}>
                    {supplierLifecyclePermission &&
                    item.tenantId &&
                    item.partnerTenantId &&
                    (item.partnerCompanyId || item.spfmSupplierCompanyId) ? (
                      <a onClick={(e) => this.handleJumpToSupplierLifecycle(item, e)}>
                        {companyName}
                      </a>
                    ) : (
                      companyName
                    )}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: '#1D2129', margin: '0 4px' }}
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
              {this.renderQuotationLineTag(item)}
              {remote
                ? remote.render('SSRC_CHECK_PRICE_SUPPLIER_HEADER_INFO_RENDER_OTHERS', null, {
                    item,
                    bidFlag,
                    current,
                  })
                : null}
            </div>
          </span>
        </div>
        <div className={styles.middleBox}>
          {!japanDutchTotalBidding ? (
            <Tag
              className={
                item?.feedbackStatus === 'ABANDONED' || item.quotedCount === 0
                  ? styles.feedbackStatusAbandoned
                  : styles.feedbackStatus
              }
            >
              {item.feedbackStatusMeaning}
              <Tooltip title={item.abandonRemark} theme="light">
                {item?.feedbackStatus === 'ABANDONED' ? (
                  <Icon
                    className={styles.icons}
                    type="question-circle"
                    style={{ marginLeft: '2px' }}
                  />
                ) : (
                  ''
                )}
              </Tooltip>
            </Tag>
          ) : (
            ''
          )}

          {/* 日式/荷兰 轮次状态 tag className 使用上面的 feedbackStatus */}
          {japanDutchTotalBidding && biddingRoundSupplierStatus ? (
            <Tag
              className={
                biddingRoundSupplierStatus !== 'ACCEPTED'
                  ? styles.feedbackStatusAbandoned
                  : styles.feedbackStatus
              }
            >
              {biddingRoundSupplierStatusMeaning || '-'}
            </Tag>
          ) : (
            ''
          )}

          {!item?.quotationNumber?.match(/\/0$/g) && !japanDutchTotalBidding ? (
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
          ) : (
            ''
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
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_TECHNOLAGY_SCORE_TAG',
                technologyScoreTag,
                {
                  bidFlag,
                }
              )
            : technologyScoreTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_BUSINESS_SCORE_TAG',
                businessScoreTag,
                {
                  bidFlag,
                }
              )
            : businessScoreTag}
          {rankDom}
          {!isNil(biddingAcceptCount) && japanTotalBidding ? (
            <Tag className={styles.rank}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingAcceptCount`).d('接受次数')}：
              {biddingAcceptCount}
            </Tag>
          ) : (
            ''
          )}
          {japanDutchAcceptAmount}
          {supplementAmount}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_TOTAL_AMOUNT_TAG',
                supplierTotalAmountTag,
                {
                  item,
                  className: styles.supplierTotalAmount,
                  basicInfoDs,
                }
              )
            : supplierTotalAmountTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_WINED_AMOUNT_TAG',
                winedAmountTag,
                {
                  item,
                  className: styles.winedAmount,
                  basicInfoDs,
                  bidFlag,
                }
              )
            : winedAmountTag}
          {remote
            ? remote.process(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_CUX_LASTED_TAG',
                '',
                {
                  item,
                  basicInfoDs,
                  className: styles.winedAmount,
                  that: this,
                }
              )
            : ''}
        </div>

        <div className={styles.rightBox} style={{ flexWrap: 'wrap' }}>
          {remote
            ? remote.render('SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_RENDER_RIGHT_BOX', null, {
                item,
                current,
                that: this,
              })
            : null}
          {item.quotationLineNumber * 1 >= 1 && (
            <span onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                label={intl.get(`ssrc.inquiryHall.model.inquiryHall.wholePackage`).d('整包推荐')}
                style={
                  remote?.process
                    ? remote.process(
                        'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_RENDER_WHOLEPACKAGE_FORMITEM_STYLE',
                        WholePackageFormItemStyle,
                        { bidFlag: this.props.bidFlag, basicInfoDs, that: this }
                      )
                    : WholePackageFormItemStyle
                }
              >
                {getFieldDecorator(`value#${item.rfxLineSupplierId}`, {
                  initialValue: item.wholeSuggestFlag,
                })(
                  remote
                    ? remote.render(
                        'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_RENDER_WHOLEPACKAGE_SWITCH',
                        WholePackage,
                        { basicInfoDs }
                      )
                    : WholePackage
                )}
              </Form.Item>
            </span>
          )}
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
          {suggesedRemarkVisible ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'end',
              }}
            >
              <Tooltip placement="topLeft" title={item.suggestedRemark}>
                <div className={styles.suggestedRemark}>
                  {`${intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由')}：${
                    item.suggestedRemark || ''
                  }`}
                </div>
              </Tooltip>
              <div className={styles.rate}>{allottedRatioRender}</div>
              <Iconfont
                className={styles.icons}
                style={{
                  fontSize: '20px',
                  marginRight: 0,
                }}
                type="edit"
                onClick={(e) => this.openPackgeModel(e, item.rfxLineSupplierId)}
              />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }

  /**
   * 渲染Tag - [路特斯] 二开重写, 谨慎修改!!!
   * @protected
   */
  renderQuotationLineTag(item = {}) {
    const { basicInfoDs, remote, bidFlag = false } = this.props;
    const { current } = basicInfoDs;
    const { newQuotationFlag = 0 } = current
      ? current?.get(['expertScoreType', 'bidRuleType', 'newQuotationFlag'])
      : {};

    return [
      !newQuotationFlag ? (
        <a
          onClick={() =>
            this.showUploadModal(
              item.businessAttachmentUuid,
              item.techAttachmentUuid,
              item.bargainBusinessAttachmentUuid,
              item.bargainTechAttachmentUuid,
              item.roundBusinessAttachmentUuid,
              item.roundTechAttachmentUuid,
              item
            )
          }
          style={
            remote
              ? remote.process(
                  'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_ATTACHMENT_STYLE',
                  {},
                  { bidFlag }
                )
              : {}
          }
        >
          <SVGIcon path={imgUr} />
          <span style={{ marginLeft: '7px' }}>
            {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
            <RenderFileTotalCount record={item} uiType="h0" />
          </span>
        </a>
      ) : (
        <FileGroup record={item} uiType="h0" fileType="HEADER" />
      ),
    ];
  }

  @Bind()
  renderInvalidHeaderInfo(item) {
    const {
      basicInfoDs,
      expand = {},
      clickCollapseChange = () => {},
      remote,
      settings,
      bidFlag = false,
      current: that,
      useNewRateFlag = 0,
    } = this.props;
    const { current } = basicInfoDs;
    const { newQuotationFlag = 0, expertScoreType, bidRuleType } = current
      ? current?.get(['expertScoreType', 'bidRuleType', 'newQuotationFlag'])
      : {};
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
      <div className={styles.container} onClick={(e) => clickCollapseChange(e, item)}>
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
                style={{ color: '#1D2129', margin: '0 4px' }}
                type={!expand[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
              />
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
              <p className={styles.itemListDes}>
                {!newQuotationFlag ? (
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
                      <SVGIcon path={imgUr} />
                      <span style={{ marginLeft: '7px' }}>
                        {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                        <RenderFileTotalCount record={item} uiType="h0" />
                      </span>
                    </a>
                  </span>
                ) : (
                  <FileGroup record={item} uiType="h0" fileType="HEADER" invalidFlag={1} />
                )}
              </p>
              {remote
                ? remote.render('SSRC_CHECK_PRICE_SUPPLIER_HEADER_INFO_RENDER_OTHERS', null, {
                    item,
                    bidFlag,
                    current: that,
                  })
                : null}
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
          {bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
            <Tag className={styles['sumScore-invalid']}>
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
          )}
          {bidRuleType === 'DIFF' && expertScoreType === 'ONLINE' ? (
            <Tag className={styles['sumScore-invalid']}>
              {item?.businessPassStatus
                ? `${intl
                    .get(`ssrc.inquiryHall.view.message.tab.businessGroup`)
                    .d('商务组')}${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.summaryScore')
                    .d('汇总')}`
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
              ：{item?.businessPassStatus || item.businessScore}
            </Tag>
          ) : (
            ''
          )}
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

  /**
   * 绑定ref
   * @param {*} callKey - 外层列表key
   * @param {*} ds - dataSet
   */
  @Bind()
  handleRef(calKey, ds) {
    this.supplierLineTable[calKey] = ds;
  }

  @Bind()
  renderSupplierLineTable(tableProps, rfxLineSupplierId) {
    const { remote, } = this.props;
    return (
      <SupplierLineTable {...tableProps} rfxLineSupplierId={rfxLineSupplierId} remote={remote} />
    );
  }

  /**
   * 渲染供应商列表 - [番缆服务] 二开, 谨慎修改!!!
   * @protected
   */
  renderPagination(props) {
    return <Pagination {...props} />;
  }

  // 可供数量
  handleQuantityChange = (val, record) => {
    const { doubleUnitFlag = false } = this.props;
    const { itemId, quotationLineId, uomId, secondaryUomId } = record.get([
      'itemId',
      'quotationLineId',
      'uomId',
      'secondaryUomId',
    ]);
    if (val) {
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: val,
          itemId,
          businessKey: quotationLineId || record.id,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.set('allottedQuantity', res ?? '');
        });
      } else {
        record.set('allottedQuantity', val);
      }
    } else if (val === 0) {
      record.set('allottedQuantity', val);
    }
  };

  // 展示风险提示
  renderRiskRelation = () => {
    const { basicInfoDs, organizationId, _timestamp = '', remote } = this.props;
    const { current } = basicInfoDs || {};

    let dom = '';
    if (current) {
      const { rfxNum, secondarySourceCategory } = current?.get([
        'rfxNum',
        'secondarySourceCategory',
      ]);
      dom = (
        <EmbedPage
          href="/public/sdat/relation-troubleshoot"
          location={{
            search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}&_timestamp=${_timestamp}`,
          }}
        />
      );
    }

    dom = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_PROCESS_SUPPLIER_RENDERRISKRELATIONN_DOM',
          dom,
          {
            that: this,
            basicInfoDs,
          }
        )
      : dom;

    return dom || null;
  };

  render() {
    const {
      checkWay,
      rfxHeaderId,
      basicInfoDs,
      headerList = [],
      organizationId,
      loading,
      modelName = 'inquiryHall',
      [modelName]: {
        supplierQuoteLine = [],
        supplierQuoteLinePagination = {},
        supplierLinePagination,
      },
      onChangePagination,
      sourceKey = INQUIRY,
      form,
      hideModal,
      takePrice = noop,
      customizeTable,
      viewLadderLevel,
      doubleUnitFlag = false,
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
      customizeFormH0,
      remote,
      onComparePriceHistory,
      bidFlag,
      activePanel = [],
      changeCollapse = () => {},
      fixedFlag,
      supplierLinePageSize,
      expandAllFlag,
      batchSearchData,
      batchSearchDataKeys,
      priceDataObj,
      openExpandAllFlag,
      getContainerRef,
      searchPriceLoading,
      clickAllFlag,
      queryLadderQuotation,
      getAllTabTableCommonColumns,
      getExtranceInstance,
    } = this.props;
    const {
      loadingObj,
      AttachmentsProps,
      attachmentVisible,
      suggesedResonModelVisible,
      WholePackageRfxLineSupplierId,
      wholePackageLoading,
    } = this.state;
    const tableProps = {
      checkWay,
      sourceKey,
      basicInfoDs,
      rfxHeaderId,
      organizationId,
      form,
      loadingObj,
      takePrice,
      doubleUnitFlag,
      customizeTable,
      viewLadderLevel,
      renderValidQuotationQuantity,
      dataSource: supplierQuoteLine,
      pagination: supplierQuoteLinePagination,
      onRef: this.handleRef,
      onChange: this.changePagination,
      allottedQuantityChange: this.handleQuantityChange,
      onChangeTableData: this.changeTableData,
      onSetWholePackageFlag: this.setWholePackageFlag,
      onSetWholePackageFlagFalse: this.setWholePackageFlagFalse,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
      changeSupplierLineTableSelection,
      onComparePriceHistory,
      headerList,
      bidFlag,
      remote,
      expandAllFlag,
      supplierLineTable: this.supplierLineTable,
      priceDataObj,
      searchPriceLoading,
      clickAllFlag,
      getAllTabTableCommonColumns,
      getExtranceInstance,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      doubleUnitFlag,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      queryLadderQuotation,
      bidFlag,
      remote,
      remotePrefix: 'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_LADDER_QUOTATION_H0',
    };

    const modelList = headerList.filter(
      (item) => item.rfxLineSupplierId === WholePackageRfxLineSupplierId
    );
    const packageModelProps = {
      basicInfoDs,
      visible: suggesedResonModelVisible,
      hideModal: this.hidePackgeModel,
      loadloading: fetchSupplierLineCheckPriceLoading,
      // saveSuggestedRemark: this.saveSuggestedRemark,
      confirmLoading: saveSuggestedRemarkLoading,
      onRef: this.onSuggestedRemarkRef,
      customizeFlag: true,
      sourceKey,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.DISTRIBUTE_RATE`,
      customizeFormH0,
      buttonLoading: wholePackageLoading,
      checkWay,
    };

    const { status } = basicInfoDs || {};
    const headerLoading = status === 'loading';
    const { total = 0 } = supplierLinePagination || {};
    return (
      <React.Fragment>
        <Spin spinning={loading || wholePackageLoading || headerLoading}>
          {this.renderRiskRelation()}
          <ListRender
            {...{
              headerList,
              renderHeaderInfo: this.renderHeaderInfo,
              renderInvalidHeaderInfo: this.renderInvalidHeaderInfo,
              styles,
              tableProps,
              form,
              remote,
              activePanel,
              lineKey: 'rfxLineSupplierId',
              changeCollapse,
              renderLineTable: this.renderSupplierLineTable,
              pagesize: supplierLinePageSize,
              batchSearchData,
              batchSearchDataKeys,
              expandAllFlag,
              tableMap: this.supplierLineTable,
              openExpandAllFlag,
              getContainerRef,
            }}
          />
          {total > 10 &&
            this.renderPagination({
              className: fixedFlag ? styles.fixedPagination : styles.pagination,
              onChange: (page, pageSize) => onChangePagination(page, pageSize),
              onShowSizeChange: (current, size) => onChangePagination(current, size),
              ...supplierLinePagination,
            })}
          <Modal
            destroyOnClose
            visible={attachmentVisible}
            footer={null}
            onCancel={this.hideAttachmentsProps}
            width={800}
          >
            {remote ? (
              remote.render(
                'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST_RENDER_ATTACHMENT',
                <Attachment {...AttachmentsProps} />,
                {
                  ...AttachmentsProps,
                }
              )
            ) : (
              <Attachment {...AttachmentsProps} />
            )}
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
        </Spin>
      </React.Fragment>
    );
  }
}

const withStandardCompEnhancer = (Comp) => {
  return CombineComponent({
    modelName: modelNameVar,
  })(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
      saveSuggestedRemarkLoading: loading.effects[`${modelNameVar}/saveSuggestedRemark`],
      fetchSupplierLineCheckPriceLoading:
        loading.effects[`${modelNameVar}/fetchSupplierLineCheckPrice`],
    }))(
      Form.create({ fieldNameProp: null })(
        remoteHoc({
          code: 'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST',
        })(observer(Comp))
      )
    )
  );
};

export { withStandardCompEnhancer, SupplierLineList };
export default withStandardCompEnhancer(SupplierLineList);
