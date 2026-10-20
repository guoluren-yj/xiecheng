/* eslint-disable no-param-reassign */
/**
 * index.js - 供应商进行投标
 * @date: 2019-05-20
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Row,
  Col,
  Collapse,
  InputNumber,
  DatePicker,
  Input,
  Spin,
  Icon,
  Tooltip,
  Modal,
  Popover,
  Tabs,
  Tag,
} from 'hzero-ui';
import { Modal as c7nModal, ModalProvider } from 'choerodon-ui/pro';
// import { math } from 'choerodon-ui/dataset';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty, isNumber, sum, map } from 'lodash';
import uuidv4 from 'uuid/v4';
import querystring from 'querystring';
import classNames from 'classnames';

import { yesOrNoRender, enableRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import Upload from 'srm-front-boot/lib/components/Upload';
import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';
import {
  FORM_COL_3_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  DATETIME_MIN,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getDateFormat, getEditTableData } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { numberSeparatorRender } from '@/utils/renderer';
import CommonImportNew from 'hzero-front/lib/components/Import';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import * as routerRedux from 'react-router-redux';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import common from '@/routes/sbid/common.less';
import QuotationDetailModal from '@/routes/components/QuotationDetailNew/Supplier';
import ExcelExports from '@/routes/components/ExcelExport';
import CommonImport from '@/routes/himp/CommonImportNew';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import QuotationDetailImport from '@/routes/components/QuotationDetailImport';
import { queryEnableDoubleUnit } from '@/services/commonService';
import {
  isText,
  amountCalcType,
  fetchCurrentPrecision,
  getUomName,
  getQtyName,
} from '@/utils/utils';
import Iconfont from '../../components/Icons';
import CountDown from '../../components/CountDown';
import InquiryHeader from './Header';
import NormalSection from './NormalSection';
import SectionHeader from './SectionHeader';
import SectionHeaderUpdate from './SectionHeaderUpdate';
import SectionFormInfo from './SectionFormInfo';
import ItemForm from './ItemForm';

import QuoteAttachment from './QuoteAttachment';
import style from './Header.less';

const remarkFormLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const { Panel } = Collapse;
const { TextArea } = Input;
const FormItem = Form.Item;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const promptCode = 'ssrc.supplierBid';
class InquiryPrice extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { subjectMatterRule } = querystring.parse(search.substring(1)); //  区分标段
    this.state = {
      inquiryTableReadOnly: true, // 默认只读列表为true
      inquiryDetail: false, // 默认关闭详情页信息
      giveUpVisible: false, // 放弃
      defaultNode: {}, // 默认节点
      // expand: {}, // 展开行
      // expandChildren: {},
      // expandParentId: {},
      // showChildren: false, // 展开行是否包含子节点
      collapseKeys: ['sectionInfoView'], // 打开的折叠面板key
      collapseKeys1: ['sectionInfoUpdate'], // 标段打开的折叠面板key
      collapseKeys2: ['quotationInfo'], // 分标段物品明细打开的折叠面板key
      activeKey: null,
      sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
      editFlag: false,
      itemLineEditoringId: '', // record的唯一id
      attachmentVisible: false, // 头附件 Modal 显示状态
      submitLoading: false, // 提交按钮loading
      saveLoading: false, // 保存按钮loading
      doubleUnitFlag: false, // 双精度标志
      caclRule: null, // 业务规则定义-金额计算方式
      currencyPrecision: null, // 手动查询的币种精度，单价不补零
      financialPrecision: null, // 手动查询的财务精度
    };
    this.sectionForm = {};
  }

  /**
   *  componentDidMount-componentWillUnmount==>生命周期阶段==>初始化数据查寻投标头,投标列表==>销毁
   */
  componentDidMount() {
    const { dispatch } = this.props;
    // 查询招标头
    this.queryQuotationHeader();
    this.queryQuotationLines({}, true);
    const lovCodes = {
      supplierExploration: 'SSRC.SUPPLIER_EXPLORATION_STATUS', // 供应商踏勘状态
    };
    dispatch({
      type: 'supplierBid/batchCode',
      payload: { lovCodes },
    });
    this.queryDoubleUnit();
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  onDataChange(record, changeValues) {
    if (!isEmpty(changeValues)) {
      this.setState({
        editFlag: true,
      });
    }
  }

  // 组件卸载清空数据
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierBid/updateState',
      payload: {
        quotationHeader: {},
        quotationLines: [],
        bidQuoPagination: {},
        biddingQuotationLine: {},
      },
    });
  }

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------API方法调用-----------------------------start
   */
  /**
   * 查询投标头信息
   */
  @Bind()
  async queryQuotationHeader() {
    const { dispatch, match, organizationId } = this.props;
    const { quotationHeaderId } = match.params || {};

    await dispatch({
      type: 'supplierBid/queryQuotationHeader',
      payload: {
        quotationHeaderId,
        customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.HEADER',
      },
    }).then((res) => {
      this.setState({
        saveLoading: false,
      });
      if (!res || res?.failed) {
        return;
      }
      const { currencyCode, tenantId } = res || {};
      this.fetchCurrencyPrecision(currencyCode, tenantId);
      this.initCalcType({ purTenantId: tenantId, organizationId, supplierFlag: 1 });
    });
  }

  // 业务规则定义，价格计算方式
  initCalcType = async (data) => {
    const result = (await amountCalcType(data)) || [];
    this.setState({ caclRule: result?.[0] });
  };

  // 根据币种查询精度
  @Bind()
  async fetchCurrencyPrecision(currencyCode, tenantId) {
    if (!currencyCode) {
      return;
    }

    const Precisions = await fetchCurrentPrecision({
      currencyCodes: currencyCode,
      purTenantId: tenantId,
    });
    if (!Precisions) {
      return;
    }
    const { currency, financial } = Precisions || {};
    // 设置币种精度
    this.setState({ currencyPrecision: currency });
    this.setState({ financialPrecision: financial });
  }

  /**
   * 查询投标行信息
   * @param {Object} page - 分页对象
   * @param {boolean} isInit - 是否初始化
   */
  @Bind()
  queryQuotationLines(page = {}, isInit) {
    const { dispatch, match } = this.props;
    const { sectionFlag } = this.state;
    const { quotationHeaderId } = match.params;
    dispatch({
      type: 'supplierBid/queryQuotationLines',
      payload: {
        page,
        quotationHeaderId,
        customizeUnitCode: sectionFlag
          ? 'SSRC.TENDER_HALL_UPDATE.ITEM_LINE'
          : 'SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE',
      },
    }).then((res) => {
      if (res) {
        this.setState(
          Object.assign(
            {
              sectionFlag: res.sectionFlag,
            },
            res.sectionFlag &&
              isInit && {
                activeKey: res.bidQuotationLineDTOS[0].quotationLineId, // 查寻招标行,初始化需默认锁定标段的key，并记录
                activeChildrenKey: res.bidQuotationLineDTOS[0].children[0].quotationLineId,
              }
          )
        );
      }
    });
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  /**
   * 放弃或撤销放弃时 查询 父节点标段信息
   */
  @Bind()
  queryParentByUpRevoke() {
    const {
      dispatch,
      supplierBid: { biddingQuotationLine = {} },
    } = this.props;
    dispatch({
      type: 'supplierBid/queryBiddingQuotationParentLine',
      payload: {
        quotationLineId: biddingQuotationLine.quotationLineParentId,
      },
    });
  }

  /**
   * 放弃或撤销放弃或提交时 查询 物料行信息
   * @description 无关标段区分(即此方法可获取标段下的物料行，也可正常获取非标段下的物料行)
   */
  @Bind()
  queryNormalLine() {
    const {
      dispatch,
      supplierBid: { biddingQuotationLine = {} },
    } = this.props;
    dispatch({
      type: 'supplierBid/queryBiddingQuotationLine',
      payload: {
        quotationLineId: biddingQuotationLine.quotationLineId,
      },
    }).then((response) => {
      if (response) {
        this.setChildFormFields(response);
      }
    });
  }

  /**
   * 确认放弃？
   */
  @Bind()
  @Debounce(300)
  onConfirmWaiver() {
    const { form } = this.props;
    form.validateFields((err) => {
      if (!err) {
        this.onConfirm();
      }
    });
  }

  /**
   * 确认
   */
  @Bind()
  onConfirm() {
    const filter = this.props.form.getFieldsValue();
    const { appendRemark } = filter;
    const {
      dispatch,
      organizationId,
      supplierBid: { quotationHeader },
    } = this.props;
    const {
      bidHeaderId, // 招标头id
      bidStatus, // 招标状态
      versionNumber, // 版本号
      bidRoundNumber, // 轮次
      tenantId, // 租户id
      supplierCompanyId, // 供应商id
      quotationEndDate, // 投标截止时间
    } = quotationHeader;
    const bidHeader = {
      bidHeaderId, // 招标头id
      bidStatus, // 招标状态
      versionNumber, // 版本号
      roundNumber: bidRoundNumber, // 轮次
      tenantId, // 租户id
      supplierCompanyId, // 供应商id
      quotationEndDate, // 投标截止时间
      appendRemark,
    };
    dispatch({
      type: 'supplierBid/fatchAbandon',
      payload: {
        organizationId,
        bidHeader,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/supplier-bid-hall/list`,
          })
        );
      } else {
        this.setState({
          giveUpVisible: false,
        });
      }
    });
  }

  /**
   * 放弃所有投标
   */
  @Bind()
  onAbandon() {
    this.setState({
      giveUpVisible: true,
    });
  }

  /**
   * 关闭放弃弹框
   */
  @Bind()
  handleConfirmWaiver() {
    this.setState({
      giveUpVisible: false,
    });
  }

  /**
   * 是否放弃动作
   */
  @Bind()
  changeAbonedFlag(item) {
    const { form } = this.props;
    if (item === 1) {
      form.setFieldsValue({ abandonedFlag: 0 });
    } else {
      form.setFieldsValue({ abandonedFlag: 1 });
    }
  }

  /**
   * Table下标段是否放弃动作
   */
  @Bind()
  changeTableAbonedFlag(item) {
    const { form } = this.props;
    const { activeKey } = this.state;
    if (item === 1) {
      form.setFieldsValue({
        [`${activeKey}#abandonedFlag`]: 0,
      });
    } else {
      form.setFieldsValue({
        [`${activeKey}#abandonedFlag`]: 1,
      });
    }
  }

  /**
   * 标段放弃-某标段
   * @param item
   */
  @Bind()
  giveUpList() {
    const {
      form,
      dispatch,
      supplierBid: { biddingQuotationLine = {}, bidQuoPagination = {} },
      organizationId,
    } = this.props;
    form.setFieldsValue({
      currentQuotationPrice: null, // 单价
      currentQuotationQuantity: null, // 可供数量
      currentDeliveryCycle: null, // 供货周期
      currentPromisedDate: null, // 承诺交付日期
      taxRate: null, // 修改税率
      taxId: null, // 修改税率Id
      taxAmount: null, // 税额
      netPrice: null, // 不含税单价
      netAmount: null, // 不含税总金额
      totalAmount: null, // 总金额
      currentQuotationRemark: null, // 备注
      currentAttachmentUuid: null, // 标段/包投标文件
      sectionAmount: null, // 标段总金额
      quotationExpiryDateFrom: null, // 报价有效日期从
      quotationExpiryDateTo: null, // 报价有效日期至
    });
    dispatch({
      type: 'supplierBid/abandonQuotationLine',
      payload: {
        organizationId,
        quotationLineId: biddingQuotationLine.quotationLineParentId
          ? biddingQuotationLine.quotationLineParentId
          : biddingQuotationLine.quotationLineId,
      },
    }).then((res) => {
      if (res) {
        // 查询物料行，无关标段区分(即此方法可获取标段下的物料行，也可正常获取非标段下的物料行)
        this.queryNormalLine();
        // 存在父ID时查询父标段行
        if (biddingQuotationLine.quotationLineParentId) {
          this.queryParentByUpRevoke();
        }
        // 查询所有投标行
        this.queryQuotationLines(bidQuoPagination);
      }
    });
  }

  /**
   * 标段放弃-Table下某标段放弃
   * @param item
   */
  @Bind()
  giveUpTableList() {
    const {
      dispatch,
      supplierBid: { bidQuoPagination = {} },
      organizationId,
    } = this.props;
    const { activeKey } = this.state;
    dispatch({
      type: 'supplierBid/abandonQuotationLine',
      payload: {
        organizationId,
        quotationLineId: activeKey,
      },
    }).then((res) => {
      if (res) {
        // 查询所有投标行
        this.queryQuotationLines(bidQuoPagination);
      }
    });
  }

  /**
   * 标段撤销放弃-某标段
   * @param item
   */
  @Bind()
  revokeUpList() {
    const {
      dispatch,
      supplierBid: { biddingQuotationLine = {}, bidQuoPagination = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'supplierBid/abandonRevokeQuotationLine',
      payload: {
        organizationId,
        quotationLineId: biddingQuotationLine.quotationLineParentId
          ? biddingQuotationLine.quotationLineParentId
          : biddingQuotationLine.quotationLineId,
      },
    }).then((res) => {
      if (res) {
        // 查询物料行，无关标段区分(即此方法可获取标段下的物料行，也可正常获取非标段下的物料行)
        this.queryNormalLine();
        // 存在父ID时查询父标段行
        if (biddingQuotationLine.quotationLineParentId) {
          this.queryParentByUpRevoke();
        }
        // 查询所有投标行
        this.queryQuotationLines(bidQuoPagination);
      }
    });
  }

  /**
   * 标段撤销放弃-Table下某标段撤销放弃
   * @param item
   */
  @Bind()
  revokeUpTableList() {
    const {
      dispatch,
      supplierBid: { bidQuoPagination = {} },
      organizationId,
    } = this.props;
    const { activeKey } = this.state;
    dispatch({
      type: 'supplierBid/abandonRevokeQuotationLine',
      payload: {
        organizationId,
        quotationLineId: activeKey,
      },
    }).then((res) => {
      if (res) {
        // 查询所有投标行
        this.queryQuotationLines(bidQuoPagination);
      }
    });
  }

  /**
   * 行放弃-某标段
   * @param item
   */
  @Bind()
  giveUp(item) {
    const {
      supplierBid: { biddingQuotationLine = {} },
    } = this.props;
    // flag===1 已放弃
    if (item === 1) {
      Modal.confirm({
        title: intl.get('ssrc.supplierBid.view.message.title.abandon').d('放弃'),
        content: biddingQuotationLine.quotationLineParentId
          ? intl
              .get(`${promptCode}.model.supplierBid.SelectGiveUpAllBidConfirm`)
              .d('选择放弃将放弃该整个标段的投标，并且同时清空该标段的投标信息，是否确认放弃？')
          : intl
              .get(`${promptCode}.model.supplierBid.ClearAllProduction`)
              .d('选择放弃将放弃该物品行的投标，并且同时清空该物品的投标信息，是否确认放弃？'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => this.giveUpList(),
        onCancel: () => this.changeAbonedFlag(item),
      });
    }
    // flag===0 撤销放弃
    else {
      Modal.confirm({
        title: intl.get(`${promptCode}.model.supplierBid.undoGiveUp`).d('撤销放弃'),
        content: intl
          .get(`${promptCode}.model.supplierBid.confirmUndoGiveUp`)
          .d('是否确认撤销放弃？'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => this.revokeUpList(),
        onCancel: () => this.changeAbonedFlag(item),
      });
    }
  }

  /**
   * 行放弃-某标段，在Table下的放弃
   * @param item
   */
  @Bind()
  giveUpTo(item) {
    // flag===1 已放弃
    if (item === 1) {
      Modal.confirm({
        title: intl.get('ssrc.supplierBid.view.message.title.abandon').d('放弃'),
        content: intl
          .get(`${promptCode}.model.supplierBid.SelectGiveUpAllBidConfirm`)
          .d('选择放弃将放弃该整个标段的投标，并且同时清空该标段的投标信息，是否确认放弃？'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => this.giveUpTableList(),
        onCancel: () => this.changeTableAbonedFlag(item),
      });
    }
    // flag===0 撤销放弃
    else {
      Modal.confirm({
        title: intl.get(`${promptCode}.model.supplierBid.undoGiveUp`).d('撤销放弃'),
        content: intl
          .get(`${promptCode}.model.supplierBid.confirmUndoGiveUp`)
          .d('是否确认撤销放弃？'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => this.revokeUpTableList(),
        onCancel: () => this.changeTableAbonedFlag(item),
      });
    }
  }

  /**
   * 放弃文字描述提示
   */
  abandonedForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 寻源方式
      case 'abandonedFlag':
        defaultTitle = `${intl.get(`${promptCode}.model.supplierBid.giveUp`).d('放弃')}`;
        title = `${intl
          .get(`${promptCode}.model.supplierBid.AllBidAndClearBidInfo`)
          .d('选择放弃将放弃整个标段的投标，并且同时清空该标段内的投标信息！')}`;
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="right">
        {defaultTitle}
      </Tooltip>
    );
  };

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------保存,提交-----------------------------start
   */
  /**
   * 保存投标单详情页面行列表，不含头信息
   */
  @Bind()
  saveBiddingOffer() {
    const {
      dispatch,
      form,
      supplierBid: {
        biddingQuotationLine = {},
        biddingQuotationParentLine = {},
        bidQuoPagination = {},
        quotationHeader = {},
      },
    } = this.props;
    const { sectionFlag } = this.state;
    // 标段保存
    if (sectionFlag) {
      form.validateFields(async (err, values) => {
        const {
          sectionAmount, // 标段总金额: 父标段
          currentAttachmentUuid, // 标段附件: 父标段
          abandonedFlag, // 标段放弃: 父标段
          currentPromisedDate, // 承诺交付日期
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
          freightIncludedFlag, // 运费标识
          freightAmount, // 运费
          quotationExpiryDateFrom,
          quotationExpiryDateTo,
        } = values;

        // 父标段值
        const {
          sectionNum, // 标段编号
          sectionName, // 标段名称
          demandDate, // 需求日期
        } = biddingQuotationParentLine;
        // 父标段dto
        const sectionHeaderDTO = {
          sectionNum,
          sectionFlag,
          sectionName,
          demandDate,
          sectionAmount,
          currentAttachmentUuid,
          abandonedFlag,
        };
        // 标段子物料行
        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          sectionAmount, // 标段总金额: 父标段
          currentAttachmentUuid, // 标段附件: 父标段
          abandonedFlag, // 标段放弃: 父标段
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined,
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined,
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
          freightIncludedFlag,
          freightAmount,
        };
        if (!err) {
          await dispatch({
            type: 'supplierBid/saveQuotationLines',
            payload: {
              sectionHeaderDTO,
              // ...bidQuotationLineDTO,
              // sectionFlag,
              bidQuotationLineDTO,
              customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TNDER.FORM.INFO',
              bidQuotationHeaderDTO: {
                ...quotationHeader,
                ...values,
                supplierExplorationDate: values.supplierExplorationDate
                  ? values.supplierExplorationDate.format(DATETIME_MIN)
                  : undefined,
              },
            },
          }).then((res) => {
            if (res) {
              notification.success();
              // 查询所有投标行
              this.queryQuotationLines(bidQuoPagination);
              // 查询标段子投标行 回调作form表单渲染标段子物料行控制
              dispatch({
                type: 'supplierBid/queryBiddingQuotationLine',
                payload: {
                  quotationLineId: biddingQuotationLine.quotationLineId,
                  customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TNDER.FORM.INFO',
                },
              }).then((response) => {
                if (response) {
                  this.setChildFormFields(response);
                }
              });
              // 保存后,查询父标段行,回调作form表单渲染父标段控制
              dispatch({
                type: 'supplierBid/queryBiddingQuotationParentLine',
                payload: {
                  quotationLineId: biddingQuotationLine.quotationLineParentId,
                },
              }).then((parentResponse) => {
                if (parentResponse) {
                  // 设置form表单元素
                  this.parentFormFields(parentResponse);
                }
              });
            }
          });
        }
      });
    }
    // 正常保存
    else {
      form.validateFields((err, values) => {
        const {
          abandonedFlag, // 父标段
          currentPromisedDate, // 承诺交付日期
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
          freightIncludedFlag,
          freightAmount,
          quotationExpiryDateFrom,
          quotationExpiryDateTo,
        } = values;

        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          abandonedFlag, // 放弃
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined,
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined,
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
          freightIncludedFlag,
          freightAmount,
        };
        if (!err) {
          dispatch({
            type: 'supplierBid/saveQuotationLines',
            payload: {
              bidQuotationLineDTO,
              customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              // 查询所有投标行
              this.queryQuotationLines(bidQuoPagination);
              // 无标段查询物料行 回调作form表单渲染物料行控制
              dispatch({
                type: 'supplierBid/queryBiddingQuotationLine',
                payload: {
                  quotationLineId: biddingQuotationLine.quotationLineId,
                  customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
                },
              }).then((response) => {
                if (response) {
                  // 设置form表单元素
                  this.setChildFormFields(response);
                }
              });
            }
          });
        }
      });
    }
  }

  /**
   * 保存所有: 头信息，物料行整单保存
   */
  @Bind()
  @Debounce(300)
  saveBiddingAll() {
    const {
      form,
      dispatch,
      supplierBid: {
        quotationHeader = {},
        bidQuoPagination = {},
        biddingQuotationLine = {},
        biddingQuotationParentLine = {},
        quotationLines = [],
      },
    } = this.props;
    const { sectionFlag, inquiryTableReadOnly } = this.state;
    let newQuotationLines = {};
    if (inquiryTableReadOnly) {
      if (sectionFlag === 0) {
        newQuotationLines = quotationLines.map((val) => {
          const { $form } = val;
          const values = $form.getFieldsValue();
          return {
            ...val,
            ...values,
            currentPromisedDate: values.currentPromisedDate
              ? values.currentPromisedDate.format(DATETIME_MIN)
              : undefined, // 承诺交付日期
            quotationExpiryDateFrom: values.quotationExpiryDateFrom
              ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
              : undefined, // 报价有效期从
            quotationExpiryDateTo: values.quotationExpiryDateTo
              ? values.quotationExpiryDateTo.format(DATETIME_MIN)
              : undefined, // 报价有效期至
          };
        });
      } else {
        newQuotationLines = quotationLines.map((item) => {
          return {
            ...item,
            sectionAmount: form.getFieldValue(`${item.quotationLineId}#sectionAmount`),
            currentAttachmentUuid: form.getFieldValue(
              `${item.quotationLineId}#currentAttachmentUuid`
            ),
            abandonedFlag: form.getFieldValue(`${item.quotationLineId}#abandonedFlag`),
            children: item.children.map((val) => {
              const { $form } = val;
              const values = $form.getFieldsValue();
              return {
                ...val,
                ...values,
                currentPromisedDate: values.currentPromisedDate
                  ? values.currentPromisedDate.format(DATETIME_MIN)
                  : undefined, // 承诺交付日期
                quotationExpiryDateFrom: values.quotationExpiryDateFrom
                  ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
                  : undefined, // 报价有效期从
                quotationExpiryDateTo: values.quotationExpiryDateTo
                  ? values.quotationExpiryDateTo.format(DATETIME_MIN)
                  : undefined, // 报价有效期至
              };
            }),
          };
        });
      }
    }
    // const newData = getEditTableData(quotationLines, ['quotationLineId', '_status']);
    form.validateFields((err, values) => {
      // 获取头部信息字段, 其余form表单字段不进行处理
      const {
        sectionAmount, // 标段总金额: 父标段
        currentAttachmentUuid, // 标段附件: 父标段
        abandonedFlag, // 标段放弃: 父标段
        currentPromisedDate, // 承诺交付日期
        currentQuotationQuantity, // 可供数量
        currentQuotationPrice, // 单价
        currentDeliveryCycle, // 供货周期
        taxRate, // 税率值
        taxId, // 税率id
        currentQuotationRemark, // 备注
        quotationExpiryDateFrom, // 报价有效日期从
        quotationExpiryDateTo, // 报价有效日期至
      } = values;

      if (sectionFlag) {
        const {
          sectionNum, // 标段编号
          sectionName, // 标段名称
          demandDate, // 需求日期
        } = biddingQuotationParentLine;
        // 父标段dto
        const sectionHeaderDTO = {
          sectionNum,
          sectionFlag,
          sectionName,
          demandDate,
          sectionAmount,
          currentAttachmentUuid,
          abandonedFlag,
        };
        // 标段子物料行
        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          sectionAmount, // 标段总金额: 父标段
          currentAttachmentUuid, // 标段附件: 父标段
          abandonedFlag, // 标段放弃: 父标段
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined, // 报价有效期从
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined, // 报价有效期至
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
        };

        if (!err) {
          // 列表页只传头部数据
          // if (!isEmpty(newData)) {
          this.setState(
            {
              saveLoading: true,
            },
            () => {
              if (inquiryTableReadOnly) {
                dispatch({
                  type: 'supplierBid/saveAllBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTOS: newQuotationLines,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.queryQuotationLines(bidQuoPagination);
                    // 查寻投标单头
                    this.setState({
                      editFlag: false,
                    });
                    this.queryQuotationHeader();
                  } else {
                    this.setState({
                      saveLoading: false,
                    });
                  }
                });
              } else {
                dispatch({
                  type: 'supplierBid/saveQuotationLines',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    sectionHeaderDTO,
                    bidQuotationLineDTO,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.queryQuotationLines(bidQuoPagination);
                    // 查寻投标单头
                    this.queryQuotationHeader();
                    // 查询标段子投标行 回调作form表单渲染标段子物料行控制
                    dispatch({
                      type: 'supplierBid/queryBiddingQuotationLine',
                      payload: {
                        quotationLineId: biddingQuotationLine.quotationLineId,
                      },
                    }).then((response) => {
                      if (response) {
                        this.setChildFormFields(response);
                      }
                    });
                    // 保存后,查询父标段行,回调作form表单渲染父标段控制
                    dispatch({
                      type: 'supplierBid/queryBiddingQuotationParentLine',
                      payload: {
                        quotationLineId: biddingQuotationLine.quotationLineParentId,
                      },
                    }).then((parentResponse) => {
                      if (parentResponse) {
                        // 设置form表单元素
                        this.parentFormFields(parentResponse);
                      }
                    });
                  } else {
                    this.setState({
                      saveLoading: false,
                    });
                  }
                });
              }
            }
          );
          // }
        }
      } else {
        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          abandonedFlag, // 放弃
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined, // 报价有效期从
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined, // 报价有效期至
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
        };
        if (!err) {
          // if (!isEmpty(newData)) {
          this.setState(
            {
              saveLoading: true,
            },
            () => {
              if (inquiryTableReadOnly) {
                // 获取头部信息数据
                dispatch({
                  type: 'supplierBid/saveAllBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTOS: newQuotationLines,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.queryQuotationLines(bidQuoPagination);
                    // 查寻投标单头
                    this.queryQuotationHeader();
                    this.setState({ editFlag: false });
                    // 无标段查询物料行 回调作form表单渲染物料行控制
                    // dispatch({
                    //   type: 'supplierBid/queryBiddingQuotationLine',
                    //   payload: {
                    //     quotationLineId: biddingQuotationLine.quotationLineId,
                    //   },
                    // }).then(response => {
                    //   if (response) {
                    //     // 设置form表单元素
                    //     this.setChildFormFields(response);
                    //   }
                    // });
                  } else {
                    this.setState({
                      saveLoading: false,
                    });
                  }
                });
              } else {
                dispatch({
                  type: 'supplierBid/saveQuotationLines',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTO,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.queryQuotationLines(bidQuoPagination);
                    // 查寻投标单头
                    this.queryQuotationHeader();
                    // 无标段查询物料行 回调作form表单渲染物料行控制
                    dispatch({
                      type: 'supplierBid/queryBiddingQuotationLine',
                      payload: {
                        quotationLineId: biddingQuotationLine.quotationLineId,
                      },
                    }).then((response) => {
                      if (response) {
                        // 设置form表单元素
                        this.setChildFormFields(response);
                      }
                    });
                  } else {
                    this.setState({
                      saveLoading: false,
                    });
                  }
                });
              }
            }
          );
          // }
        }
      }
    });
  }

  /**
   * 提交  物料行整单提交
   */
  @Bind()
  @Debounce(300)
  submitAllBiddingOffer() {
    const {
      form,
      dispatch,
      supplierBid: {
        quotationHeader = {},
        biddingQuotationLine = {},
        biddingQuotationParentLine = {},
        quotationLines = [],
      },
    } = this.props;
    const { sectionFlag, inquiryTableReadOnly, activeKey } = this.state;
    let newQuotationLines = {};
    let validateFieldsFlag = true;
    let nowActiveKey = activeKey;
    let nowName = '';
    if (inquiryTableReadOnly) {
      if (sectionFlag === 0) {
        newQuotationLines = quotationLines.map((val) => {
          const { $form } = val;
          const values = $form.getFieldsValue();
          return {
            ...val,
            ...values,
            currentPromisedDate: values.currentPromisedDate
              ? values.currentPromisedDate.format(DATETIME_MIN)
              : undefined, // 承诺交付日期
            quotationExpiryDateFrom: values.quotationExpiryDateFrom
              ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
              : undefined, // 报价有效期从
            quotationExpiryDateTo: values.quotationExpiryDateTo
              ? values.quotationExpiryDateTo.format(DATETIME_MIN)
              : undefined, // 报价有效期至
          };
        });
      } else {
        for (let i = 0; i < quotationLines.length; i++) {
          if (
            getEditTableData(quotationLines[i].children).length === 0 &&
            quotationLines[i].children.length > 0
          ) {
            validateFieldsFlag = false;
            nowActiveKey = quotationLines[i].quotationLineId;
            nowName = quotationLines[i].sectionName;
            break;
          }
        }
        if (!validateFieldsFlag) {
          this.setState({
            activeKey: `${nowActiveKey}`,
          });
          notification.warning({
            description: `${nowName}${intl
              .get(`${promptCode}.view.message.notnullsection`)
              .d('标段下有数据未通过校验')}`,
          });
          return;
        }

        newQuotationLines = quotationLines.map((item) => {
          return {
            ...item,
            sectionAmount: form.getFieldValue(`${item.quotationLineId}#sectionAmount`),
            currentAttachmentUuid: form.getFieldValue(
              `${item.quotationLineId}#currentAttachmentUuid`
            ),
            abandonedFlag: form.getFieldValue(`${item.quotationLineId}#abandonedFlag`),
            children: item.children.map((val) => {
              const { $form } = val;
              const values = $form.getFieldsValue();
              return {
                ...val,
                ...values,
                currentPromisedDate: values.currentPromisedDate
                  ? values.currentPromisedDate.format(DATETIME_MIN)
                  : undefined, // 承诺交付日期
                quotationExpiryDateFrom: values.quotationExpiryDateFrom
                  ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
                  : undefined, // 报价有效期从
                quotationExpiryDateTo: values.quotationExpiryDateTo
                  ? values.quotationExpiryDateTo.format(DATETIME_MIN)
                  : undefined, // 报价有效期至
              };
            }),
          };
        });
      }
    }
    form.validateFields((err, values) => {
      // 获取头部信息字段, 其余form表单字段不进行处理
      const {
        sectionAmount, // 标段总金额: 父标段
        currentAttachmentUuid, // 标段附件: 父标段
        abandonedFlag, // 标段放弃: 父标段
        currentPromisedDate, // 承诺交付日期
        currentQuotationQuantity, // 可供数量
        currentQuotationPrice, // 单价
        currentDeliveryCycle, // 供货周期
        taxRate, // 税率值
        taxId, // 税率id
        currentQuotationRemark, // 备注
        quotationExpiryDateFrom, // 报价有效日期从
        quotationExpiryDateTo, // 报价有效日期至
      } = values;

      // const newData = getEditTableData(quotationLines, ['quotationLineId', '_status']);
      if (sectionFlag) {
        const {
          sectionNum, // 标段编号
          sectionName, // 标段名称
          demandDate, // 需求日期
        } = biddingQuotationParentLine;
        // 父标段dto
        const sectionHeaderDTO = {
          sectionNum,
          sectionFlag,
          sectionName,
          demandDate,
          sectionAmount,
          currentAttachmentUuid,
          abandonedFlag,
        };
        // 标段子物料行
        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          sectionAmount, // 标段总金额: 父标段
          currentAttachmentUuid, // 标段附件: 父标段
          abandonedFlag, // 标段放弃: 父标段
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined, // 报价有效期从
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined, // 报价有效期至
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
        };
        if (!err) {
          // 列表页只传头部数据
          // if (!isEmpty(newData)) {
          this.setState(
            {
              submitLoading: true,
            },
            () => {
              if (inquiryTableReadOnly) {
                dispatch({
                  type: 'supplierBid/submitLinesBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTOS: newQuotationLines,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.setState({
                      submitLoading: false,
                    });
                    dispatch(
                      routerRedux.push({
                        pathname: `/ssrc/supplier-bid-hall/list`,
                      })
                    );
                  } else {
                    this.setState({
                      submitLoading: false,
                    });
                  }
                });
              } else {
                dispatch({
                  type: 'supplierBid/submitAllBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    sectionHeaderDTO,
                    bidQuotationLineDTO,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.setState({
                      submitLoading: false,
                    });
                    dispatch(
                      routerRedux.push({
                        pathname: `/ssrc/supplier-bid-hall/list`,
                      })
                    );
                  } else {
                    this.setState({
                      submitLoading: false,
                    });
                  }
                });
              }
            }
          );
          // }
        }
      } else {
        const bidQuotationLineDTO = {
          ...biddingQuotationLine,
          abandonedFlag, // 放弃
          currentPromisedDate: currentPromisedDate
            ? currentPromisedDate.format(DATETIME_MIN)
            : undefined, // 承诺交付日期
          quotationExpiryDateFrom: quotationExpiryDateFrom
            ? quotationExpiryDateFrom.format(DATETIME_MIN)
            : undefined, // 报价有效期从
          quotationExpiryDateTo: quotationExpiryDateTo
            ? quotationExpiryDateTo.format(DATETIME_MIN)
            : undefined, // 报价有效期至
          currentQuotationQuantity, // 可供数量
          currentQuotationPrice, // 单价
          currentDeliveryCycle, // 供货周期
          taxRate, // 税率值
          taxId, // 税率id
          currentQuotationRemark, // 备注
        };
        if (!err) {
          // if (!isEmpty(newData)) {
          this.setState(
            {
              submitLoading: true,
            },
            () => {
              if (inquiryTableReadOnly) {
                dispatch({
                  type: 'supplierBid/submitLinesBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTOS: newQuotationLines,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.setState({
                      submitLoading: false,
                    });
                    dispatch(
                      routerRedux.push({
                        pathname: `/ssrc/supplier-bid-hall/list`,
                      })
                    );
                  } else {
                    this.setState({
                      submitLoading: false,
                    });
                  }
                });
              } else {
                // 获取头部信息数据
                dispatch({
                  type: 'supplierBid/submitAllBid',
                  payload: {
                    bidQuotationHeaderDTO: {
                      ...quotationHeader,
                      ...values,
                      supplierExplorationDate: values.supplierExplorationDate
                        ? values.supplierExplorationDate.format(DATETIME_MIN)
                        : undefined,
                    },
                    bidQuotationLineDTO,
                    sectionFlag,
                    customizeUnitCode:
                      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE,SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE,SSRC.TENDER_HALL_UPDATE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.setState({
                      submitLoading: false,
                    });
                    dispatch(
                      routerRedux.push({
                        pathname: `/ssrc/supplier-bid-hall/list`,
                      })
                    );
                  } else {
                    this.setState({
                      submitLoading: false,
                    });
                  }
                });
              }
            }
          );
          // }
        }
      }
    });
  }

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------关于页面逻辑渲染-----------------------------start
   */

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * onCollapseChange1 - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange1(collapseKeys1) {
    this.setState({
      collapseKeys1,
    });
  }

  /**
   * onCollapseChange1 - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange2(collapseKeys2) {
    this.setState({
      collapseKeys2,
    });
  }

  /**
   * 设置默认form 字段属性值
   * 区分子节点和默认节点（无标段父级）
   */
  @Bind()
  setChildFormFields(item) {
    const { form } = this.props;
    // 判断是否存在父级,存在父级
    if (item.quotationLineParentId) {
      form.setFieldsValue({
        currentQuotationPrice: item.currentQuotationPrice, // 单价
        currentQuotationQuantity: item.currentQuotationQuantity, // 可供数量
        currentDeliveryCycle: item.currentDeliveryCycle, // 供货周期
        currentPromisedDate: item.currentPromisedDate && moment(item.currentPromisedDate), // 承诺交付日期
        taxRate: item.taxRate, // 修改税率
        taxId: item.taxId, // 修改税率Id
        taxAmount: item.taxAmount, // 税额
        netPrice: item.netPrice, // 不含税单价
        netAmount: item.netAmount, // 不含税总金额
        totalAmount: item.totalAmount, // 总金额
        currentQuotationRemark: item.currentQuotationRemark, // 备注
        quotationExpiryDateFrom:
          item.quotationExpiryDateFrom && moment(item.quotationExpiryDateFrom), // 报价有效日期从
        quotationExpiryDateTo: item.quotationExpiryDateTo && moment(item.quotationExpiryDateTo), // 报价有效日期至
      });
    } else {
      form.setFieldsValue({
        currentQuotationPrice: item.currentQuotationPrice, // 单价
        currentQuotationQuantity: item.currentQuotationQuantity, // 可供数量
        currentDeliveryCycle: item.currentDeliveryCycle, // 供货周期
        currentPromisedDate: item.currentPromisedDate && moment(item.currentPromisedDate), // 承诺交付日期
        taxRate: item.taxRate, // 修改税率
        taxId: item.taxId, // 修改税率Id
        taxAmount: item.taxAmount, // 税额
        netPrice: item.netPrice, // 不含税单价
        netAmount: item.netAmount, // 不含税总金额
        totalAmount: item.totalAmount, // 总金额
        currentQuotationRemark: item.currentQuotationRemark, // 备注
        abandonedFlag: item.abandonedFlag, // 放弃标识
        quotationExpiryDateFrom:
          item.quotationExpiryDateFrom && moment(item.quotationExpiryDateFrom), // 报价有效日期从
        quotationExpiryDateTo: item.quotationExpiryDateTo && moment(item.quotationExpiryDateTo), // 报价有效日期至
      });
    }
  }

  /**
   * 设置父节点字段属性值
   */
  @Bind()
  parentFormFields(item) {
    const { form } = this.props;
    form.setFieldsValue({
      sectionAmount: item.sectionAmount, // 标段/包总金额
      abandonedFlag: item.abandonedFlag, // 放弃标识
      currentAttachmentUuid: item.currentAttachmentUuid, // 标段/包投标文件
    });
  }

  // 可供数量
  handleChangeQuotationQuantity = (val, record) => {
    this.props.form.setFieldsValue({
      currentQuotationQuantity: val,
    });

    this.dynamicChangePrice(record);
  };

  // 可供数量-表格
  onChangeQuotationQuantityTable = (val, record) => {
    const Forms = record.$form;
    if (!Forms) {
      return;
    }
    Forms.setFieldsValue({
      currentQuotationQuantity: val,
    });

    this.dynamicChangePrice(record);
  };

  /**
   * 改变税率-获取税率显示值
   */
  @Bind()
  changeTaxId(_, dataList, record) {
    const { taxRate, taxId } = dataList || {};
    // const taxRate = dataList.taxRate || 0;
    // const isUnTaxPriceFlag = quotationHeader && quotationHeader.priceTypeCode === 'NET_PRICE';
    // if (isUnTaxPriceFlag) {
    //   // const netPrice = this.props.form.getFieldValue('netPrice');
    //   // const isExit = netPrice !== '' && netPrice !== undefined && netPrice !== null;
    //   // const currentQuotationPrice = this.props.form.getFieldValue('taxIncludedFlag')
    //   //   ? Number((this.props.form.getFieldValue('netPrice') * (1 + taxRate / 100)).toFixed(10))
    //   //   : this.props.form.getFieldValue('netPrice');
    //   this.props.form.setFieldsValue({
    //     taxRate,
    //     taxId,
    //     // currentQuotationPrice: isExit ? currentQuotationPrice : null,
    //   });
    // } else {
    //   const currentQuotationPrice = this.props.form.getFieldValue('currentQuotationPrice');
    //   const isExit =
    //     currentQuotationPrice !== '' &&
    //     currentQuotationPrice !== undefined &&
    //     currentQuotationPrice !== null;
    //   const netPrice = this.props.form.getFieldValue('taxIncludedFlag')
    //     ? Number(
    //         (this.props.form.getFieldValue('currentQuotationPrice') / (1 + taxRate / 100)).toFixed(
    //           10
    //         )
    //       )
    //     : this.props.form.getFieldValue('currentQuotationPrice');
    //   this.props.form.setFieldsValue({
    //     netPrice: isExit ? netPrice : null,
    //     taxRate,
    //     taxId,
    //   });
    // }

    this.props.form.setFieldsValue({
      taxRate,
      taxId,
      // currentQuotationPrice: isExit ? currentQuotationPrice : null,
    });
    this.dynamicChangePrice(record);
  }

  /**
   * Table改变税率-将改变后的税率传给后端
   */
  @Bind()
  handleChangeTaxId(_, dataList, record = {}) {
    const {
      supplierBid: { quotationHeader = {} },
    } = this.props;
    const form = record.$form;
    // const taxRate = dataList.taxRate || 0;
    const { taxRate, taxId } = dataList || {};
    const isUnTaxPriceFlag = quotationHeader && quotationHeader.priceTypeCode === 'NET_PRICE';

    const tax = { taxId, taxRate };

    if (isUnTaxPriceFlag) {
      // const isExit = netPrice !== '' && netPrice !== undefined && netPrice !== null;
      // const currentQuotationPrice = form.getFieldValue('taxIncludedFlag')
      //   ? Number((form.getFieldValue('netPrice') * (1 + taxRate / 100)).toFixed(10))
      //   : form.getFieldValue('netPrice');
      form.setFieldsValue(tax);
    } else {
      // const isExit =
      //   currentQuotationPrice !== '' &&
      //   currentQuotationPrice !== undefined &&
      //   currentQuotationPrice !== null;
      // const netPrice = form.getFieldValue('taxIncludedFlag')
      //   ? Number((form.getFieldValue('currentQuotationPrice') / (1 + taxRate / 100)).toFixed(10))
      //   : form.getFieldValue('currentQuotationPrice');
      form.setFieldsValue(tax);
    }

    this.dynamicChangePrice(record);
  }

  /**
   * 获取最新的供应商行附件id
   */
  @Bind()
  attachmentMethod(record) {
    let attachmentUuid = null;
    if (record.currentAttachmentUuid) {
      attachmentUuid = record.currentAttachmentUuid;
    }
    if (this.props.form.getFieldValue('currentAttachmentUuid')) {
      attachmentUuid = this.props.form.getFieldValue('currentAttachmentUuid');
    } else {
      attachmentUuid = uuidv4();
    }
    return attachmentUuid;
  }

  /**
   * Table视图下获取最新的供应商行附件id
   */
  @Bind()
  attachmentTableMethod(record) {
    let attachmentUuid = null;
    if (record.currentAttachmentUuid) {
      attachmentUuid = record.currentAttachmentUuid;
    }
    if (this.props.form.getFieldValue(`${record.quotationLineId}#currentAttachmentUuid`)) {
      attachmentUuid = this.props.form.getFieldValue(
        `${record.quotationLineId}#currentAttachmentUuid`
      );
    } else {
      attachmentUuid = uuidv4();
    }
    return attachmentUuid;
  }

  @Bind
  afterOpenUploadModal(attachmentUUID) {
    if (attachmentUUID) {
      this.setState({ editFlag: true });
    }
  }

  /**
   * 分标段时标段下的标段总金额手动修改调用
   *
   */
  @Bind()
  setValue(e, val) {
    if (e !== val) {
      this.setState({ editFlag: true });
    }
  }

  /**
   * 按钮操作
   * @returns {*}
   */
  @Bind()
  onOperation(text, record) {
    const { sectionFlag } = this.state;
    if (sectionFlag) {
      if (text) {
        return (
          <span>
            <a onClick={() => this.onBidDone(record)}>
              {intl.get(`${promptCode}.view.message.button.switchViewBid`).d('切换视图')}
            </a>{' '}
          </span>
        );
      } else {
        return '';
      }
    } else {
      return (
        <span>
          <a onClick={() => this.onBidDone(record)}>
            {intl.get(`${promptCode}.view.message.button.switchViewBid`).d('切换视图')}
          </a>{' '}
        </span>
      );
    }
  }

  /**
   * 不分标段-切换投标视图时保存行信息
   */
  @Bind()
  switchSaveItemLine(record) {
    const {
      form,
      dispatch,
      supplierBid: { quotationHeader = {}, bidQuoPagination = {}, quotationLines = [] },
    } = this.props;
    const { sectionFlag, inquiryTableReadOnly } = this.state;
    let newQuotationLines = {};
    if (inquiryTableReadOnly) {
      if (sectionFlag === 0) {
        newQuotationLines = quotationLines.map((val) => {
          const { $form } = val;
          const values = $form.getFieldsValue();
          return {
            ...val,
            ...values,
            currentPromisedDate: values.currentPromisedDate
              ? values.currentPromisedDate.format(DATETIME_MIN)
              : undefined, // 承诺交付日期
            quotationExpiryDateFrom: values.quotationExpiryDateFrom
              ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
              : undefined, // 报价有效期从
            quotationExpiryDateTo: values.quotationExpiryDateTo
              ? values.quotationExpiryDateTo.format(DATETIME_MIN)
              : undefined, // 报价有效期至
          };
        });
      }
    }
    form.validateFields((err, values) => {
      if (!err) {
        if (inquiryTableReadOnly) {
          // 获取头部信息数据
          dispatch({
            type: 'supplierBid/saveAllBid',
            payload: {
              bidQuotationHeaderDTO: {
                ...quotationHeader,
                ...values,
                supplierExplorationDate: values.supplierExplorationDate
                  ? values.supplierExplorationDate.format(DATETIME_MIN)
                  : undefined,
              },
              bidQuotationLineDTOS: newQuotationLines,
              sectionFlag,
              customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.queryQuotationLines(bidQuoPagination);
              // 查寻投标单头
              this.queryQuotationHeader();
              this.setState({
                expandDefaultList: record,
                expand: record.quotationLineId,
                inquiryTableReadOnly: false,
                inquiryDetail: true,
                editFlag: false,
              });
              dispatch({
                type: 'supplierBid/queryBiddingQuotationLine',
                payload: {
                  quotationLineId: record.quotationLineId,
                },
              });
            }
          });
        }
      }
    });
  }

  /**
   * 分标段-切换投标视图时保存标段填写的信息
   */
  @Bind()
  switchSaveSectionLine() {
    const {
      form,
      dispatch,
      supplierBid: { quotationHeader = {}, bidQuoPagination = {}, quotationLines = [] },
    } = this.props;
    const {
      sectionFlag,
      inquiryTableReadOnly,
      inquiryDetail,
      activeKey,
      activeChildrenKey,
    } = this.state;
    let newQuotationLines = {};
    if (inquiryTableReadOnly) {
      if (sectionFlag === 1) {
        newQuotationLines = quotationLines.map((item) => {
          return {
            ...item,
            sectionAmount: form.getFieldValue(`${item.quotationLineId}#sectionAmount`),
            currentAttachmentUuid: form.getFieldValue(
              `${item.quotationLineId}#currentAttachmentUuid`
            ),
            abandonedFlag: form.getFieldValue(`${item.quotationLineId}#abandonedFlag`),
            children: item.children.map((val) => {
              const { $form } = val;
              const values = $form.getFieldsValue();
              return {
                ...val,
                ...values,
                currentPromisedDate: values.currentPromisedDate
                  ? values.currentPromisedDate.format(DATETIME_MIN)
                  : undefined, // 承诺交付日期
                quotationExpiryDateFrom: values.quotationExpiryDateFrom
                  ? values.quotationExpiryDateFrom.format(DATETIME_MIN)
                  : undefined, // 报价有效期从
                quotationExpiryDateTo: values.quotationExpiryDateTo
                  ? values.quotationExpiryDateTo.format(DATETIME_MIN)
                  : undefined, // 报价有效期至
              };
            }),
          };
        });
      }
    }
    form.validateFields((err, values) => {
      if (sectionFlag) {
        if (!err) {
          // 列表页只传头部数据
          if (inquiryTableReadOnly) {
            dispatch({
              type: 'supplierBid/saveAllBid',
              payload: {
                bidQuotationHeaderDTO: {
                  ...quotationHeader,
                  ...values,
                  supplierExplorationDate: values.supplierExplorationDate
                    ? values.supplierExplorationDate.format(DATETIME_MIN)
                    : undefined,
                },
                bidQuotationLineDTOS: newQuotationLines,
                sectionFlag,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.queryQuotationLines(bidQuoPagination);
                // 查寻投标单头
                this.queryQuotationHeader();

                const index = quotationLines.findIndex(
                  (item) => item.quotationLineId === activeKey
                );
                this.setState({
                  inquiryTableReadOnly: !inquiryTableReadOnly,
                  inquiryDetail: !inquiryDetail,
                  editFlag: false,
                  // expandDefaultList: quotationLines[index].children[0],
                  defaultNode: {
                    [quotationLines[index].children[0].quotationLineId]: [
                      quotationLines[index].children[0].quotationLineId,
                    ],
                  },
                });
                // 标段条件下
                if (sectionFlag) {
                  // 查询父节点，树形组件内做form渲染控制
                  dispatch({
                    type: 'supplierBid/queryBiddingQuotationParentLine',
                    payload: {
                      quotationLineId: activeKey,
                    },
                  }).then((result) => {
                    if (result) {
                      this.parentFormFields(result);
                      if (activeChildrenKey) {
                        // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
                        dispatch({
                          type: 'supplierBid/queryBiddingQuotationLine',
                          payload: {
                            quotationLineId: activeChildrenKey,
                          },
                        });
                      } else {
                        // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
                        dispatch({
                          type: 'supplierBid/queryBiddingQuotationLine',
                          payload: {
                            quotationLineId: result.children[0].quotationLineId,
                          },
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }
    });
  }

  /**
   * action-onBidDone:投标打开列表行
   */
  /**
   * 点击当前投标单行时，触发查询  展开详情信息
   * @param {Object} record - 当前点击的行信息
   */
  @Bind()
  onBidDone(record) {
    const { dispatch } = this.props;
    const { sectionFlag, editFlag } = this.state;
    const { $form } = record;
    // 不分标段的情况下，点击物料行“投标”询问是否需要保存当前所填写的投标信息？点击取消按钮，不保存数据进入投标界面；点击确定按钮，保存全部修改的数据进入投标界面
    if (sectionFlag === 0) {
      if (editFlag) {
        Modal.confirm({
          title: intl
            .get(`${promptCode}.model.supplierBid.beforeBidDoneWarning`)
            .d('是否需要保存当前所填写的投标信息？'),
          onOk: () => {
            this.switchSaveItemLine(record);
          },
          onCancel: () => {
            $form.resetFields();
            this.dynamicChangePrice(record);
            this.setState({
              expandDefaultList: record,
              expand: record.quotationLineId,
              inquiryTableReadOnly: false,
              inquiryDetail: true,
            });
            dispatch({
              type: 'supplierBid/queryBiddingQuotationLine',
              payload: {
                quotationLineId: record.quotationLineId,
                customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
              },
            });
          },
        });
      } else {
        this.setState({
          expandDefaultList: record,
          expand: record.quotationLineId,
          inquiryTableReadOnly: false,
          inquiryDetail: true,
        });
        dispatch({
          type: 'supplierBid/queryBiddingQuotationLine',
          payload: {
            quotationLineId: record.quotationLineId,
            customizeUnitCode: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
          },
        });
      }
    }
  }

  /**
   *  分割end---------------------------------------------------------分割end
   *  start---------------------关于页面渲染-----------------------------start
   */
  /**
   *  hideItemDetail -  切换视图-隐藏物料详情
   *  @description 查询切换只读视图所有投标行数据
   */
  @Bind()
  hideItemDetail() {
    const { inquiryTableReadOnly, inquiryDetail } = this.state;
    const {
      dispatch,
      supplierBid: { quotationLines = [] },
    } = this.props;
    this.setState({
      inquiryTableReadOnly: !inquiryTableReadOnly,
      inquiryDetail: !inquiryDetail,
      expandDefaultList: quotationLines[0],
      expand: quotationLines[0].quotationLineId,
    });
    // 查询所有投标行
    // this.queryQuotationLines();
    dispatch({
      type: 'supplierBid/queryBiddingQuotationLine',
      payload: {
        quotationLineId: quotationLines[0].quotationLineId,
      },
    });
  }

  /**
   * 设置form 字段属性值
   */
  @Bind()
  setFormFields(item) {
    const { form } = this.props;
    form.setFieldsValue({
      currentQuotationPrice: item.currentQuotationPrice, // 单价
      currentQuotationQuantity: item.currentQuotationQuantity, // 可供数量
      currentDeliveryCycle: item.currentDeliveryCycle, // 供货周期
      currentPromisedDate: item.currentPromisedDate && moment(item.currentPromisedDate), // 承诺交付日期
      taxRate: item.taxRate, // 修改税率
      taxId: item.taxId, // 修改税率Id
      taxAmount: item.taxAmount, // 税额
      netPrice: item.netPrice, // 不含税单价
      netAmount: item.netAmount, // 不含税总金额
      totalAmount: item.totalAmount, // 总金额
      currentQuotationRemark: item.currentQuotationRemark, // 备注
      quotationExpiryDateFrom: item.quotationExpiryDateFrom && moment(item.quotationExpiryDateFrom), // 报价有效日期从
      quotationExpiryDateTo: item.quotationExpiryDateTo && moment(item.quotationExpiryDateTo), // 报价有效日期至
      // sectionAmount: item.sectionAmount, // 标段/包总金额
      // abandonedFlag: item.abandonedFlag, // 放弃标识
      // currentAttachmentUuid: item.currentAttachmentUuid, // 标段/包投标文件
    });
  }

  /**
   * render-投标状态
   */
  /**
   *  quotationLineStatusTablcColor - 列表行状态颜色变化
   *  NEW-新建，SUBMITTED-已报价， ABANDONED-放弃, TAKENBACK-收回，BARGAINED-已还价
   */
  @Bind()
  quotationLineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    switch (item.quotationLineStatus) {
      case 'NEW':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'SUBMITTED':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'ABANDONED':
        color = 'red';
        backGround = 'pink';
        break;
      default:
        color = '#5867dd';
        backGround = '#5867dd';
    }
    return (
      <Tag
        style={{
          width: '52px',
          textAlign: 'center',
          backgroundColor: backGround,
          color,
          border: 0,
        }}
      >
        {item.quotationLineStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  handleClickTree = (item) => {
    const { dispatch } = this.props;
    this.setState({
      defaultNode: {
        [item.quotationLineId]: [item.quotationLineId],
      },
    });
    // 设置form表单元素
    this.setFormFields(item);
    dispatch({
      type: 'supplierBid/queryBiddingQuotationLine',
      payload: {
        quotationLineId: item.quotationLineId,
      },
    });
  };

  @Bind()
  renderTableInfo(item) {
    const { defaultNode } = this.state;
    return (
      <div
        className={defaultNode[item.quotationLineId] ? style.leftHover : style.leftDefault}
        onClick={() => this.handleClickTree(item)}
      >
        <div className={style.translation}>
          <div className={style.listTop}>
            <div className={style.rfxLineItemNumLeft}>
              {intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号')}:{item.bidLineItemNum}
            </div>
            <div className={style.tagRight}>{this.quotationLineStatusTableColor(item)}</div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className={style.listBottom}>
            <div
              className={style.itemCodeStyle}
              // style={{ color: defaultNode[item.quotationLineId] ? '#20B0BF' : null }}
            >
              {/* 标段编号*标段名称 */}
              {item.itemCode ? `${item.itemCode}-` : null}
              {item.itemName ? item.itemName : null}
            </div>
          </div>
          <div className={style.listBottom}>
            <div className={style.carLeft}>
              <span>
                {item.freightIncludedFlag === 1 ? (
                  <img src={require('@/assets/freight.svg')} alt="" />
                ) : null}
              </span>
              <span style={{ marginLeft: '5px' }}>
                {item.totalAmount ? <img src={require('@/assets/money.svg')} alt="" /> : null}
              </span>
              <span style={{ color: '#FF913C', marginLeft: '5px' }}>{item.totalAmount}</span>
            </div>
            <div className={style.taxRateRight}>
              {item.taxRate
                ? `${intl.get(`${promptCode}.model.supplierBid.taxRate`).d('税率')}:${
                    item.taxRate
                  }%`
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * leftTableView -  左边物料列表页
   * @description sectionFlag 0 不分标段 1 分标段
   * 代码优化
   */
  @Bind()
  leftTableView(lineDataSource) {
    const { form, dispatch } = this.props;
    const { expand, expandDefaultList, sectionFlag } = this.state;
    if (sectionFlag) {
      return (
        <div className={style.detailLeft}>
          <div className={style.leftList}>
            <div>
              {map(lineDataSource, (item) => {
                return this.renderTableInfo(item);
              })}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={style.detailLeft}>
          <div className={style.leftList}>
            <NormalSection
              dispatch={dispatch}
              normalData={lineDataSource}
              expandDefaultList={expandDefaultList}
              expand={expand}
              form={form}
            />
          </div>
        </div>
      );
    }
  }

  /**
   * rightDetailView -  右边物料行详情页
   */
  @Bind()
  rightDetailView() {
    const {
      supplierBid: { biddingQuotationLine = {} },
    } = this.props;
    const biddingLine = biddingQuotationLine;
    const {
      saveBiddingLineLoading, // 保存投标行loading
      // switchViewLoading, // 切换视图loading
    } = this.props;
    return (
      <div className={style.detailRight}>
        {this.renderFormInfo(biddingLine)}
        <div className={style.footerBottom}>
          {biddingLine.abandonedFlag === 0 ? (
            <Button
              loading={saveBiddingLineLoading}
              type="primary"
              onClick={() => this.saveBiddingOffer()}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  /**
   * rightSectionDetailView -  分标段右边物料行详情页
   */
  @Bind()
  rightSectionDetailView() {
    const {
      supplierBid: { quotationHeader = {}, biddingQuotationLine = {} },
      form = {},
      customizeForm,
    } = this.props;
    const biddingLine = biddingQuotationLine;
    const {
      saveBiddingLineLoading, // 保存投标行loading
      // switchViewLoading, // 切换视图loading
    } = this.props;
    const { doubleUnitFlag } = this.state;
    const itemLineProps = {
      form,
      customizeForm,
      quotationHeader,
      onChangeFreightFlag: this.handleChangeFreightFlag,
      changeTaxId: this.changeTaxId,
      doubleUnitFlag,
    };
    return (
      <div className={style.detailRight}>
        {<SectionFormInfo {...itemLineProps} biddingLine={biddingLine} />}
        <div className={style.footerBottom}>
          {biddingLine.abandonedFlag === 0 ? (
            <Button
              loading={saveBiddingLineLoading}
              type="primary"
              onClick={() => this.saveBiddingOffer()}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  /**
   * 校验单价输入格式是否正确
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  priceValidator(_, value, callback) {
    const arr = String(value).split('.');
    if (arr[0] && arr[1]) {
      if (arr[1].length > 10) {
        callback(intl.get(`ssrc.supplierQuotation.model.supQuo.price`).d('不能超过十位小数'));
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  // 可供数量
  changeQuantity = (value, record) => {
    const form = record.$form;
    if (form) {
      form.setFieldsValue({
        currentQuotationQuantity: value,
      });
    } else {
      const Forms = this.props.form;
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        currentQuotationQuantity: value,
      });
    }

    this.changeQuotationPriceCalc(record);
  };

  // 按照基准价动态计算价格
  dynamicChangePrice = (record = {}) => {
    const {
      supplierBid: { quotationHeader },
    } = this.props;

    const { priceTypeCode } = quotationHeader || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';

    if (!isUnTaxPriceFlag) {
      this.changeQuotationPriceCalc(record);
    } else {
      this.changeNetPriceCalc(record);
    }
  };

  /**
   * 监听单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeUnitPrice(value, record) {
    const form = record.$form;
    if (form) {
      form.setFieldsValue({
        currentQuotationPrice: value,
      });
    } else {
      const Forms = this.props.form;
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        currentQuotationPrice: value,
      });
    }

    this.changeQuotationPriceCalc(record);
  }

  // 改变含税价格计算
  changeQuotationPriceCalc = (record) => {
    const {
      supplierBid: { quotationHeader },
    } = this.props;
    const { caclRule, financialPrecision, currencyPrecision, expandDefaultList } = this.state;

    const { priceTypeCode } = quotationHeader || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
    const { taxRateType } = record || {};

    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      caclRule,
      financialPrecision,
      defaultPrecision: currencyPrecision,
      taxRateType,
    };

    const form = record.$form;
    if (form) {
      // table
      const taxRate = record.taxChangeFlag
        ? form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : 0
        : record?.taxRate || 0;
      const quotationPrice = form.getFieldValue('currentQuotationPrice');
      const currentQuotationQuantity = form.getFieldValue('currentQuotationQuantity');
      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.taxUnitPrice = quotationPrice;
      COMMONS.each = form?.priceBatchQuantity;
      // 数量不存在，修改计算场景
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcNetUnitPrice, calcTaxAmount, calcNetAmount, calcTaxQuota } =
        amountCalculation(COMMONS) || {};

      // form.registerField('totalAmount');
      // form.registerField('netAmount');
      record.netAmount = calcNetAmount;
      record.totalAmount = calcTaxAmount;
      record.taxAmount = calcTaxQuota;
      form.setFieldsValue({
        netPrice: calcNetUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
        taxAmount: calcTaxQuota,
      });
    } else {
      const Forms = this.props.form;
      if (!Forms) {
        return;
      }

      // form
      const taxRate = Forms.getFieldValue('taxRate') || 0;
      const quotationPrice = Forms.getFieldValue('currentQuotationPrice');
      const currentQuotationQuantity = Forms.getFieldValue('currentQuotationQuantity');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.taxUnitPrice = quotationPrice;
      COMMONS.each = Forms?.priceBatchQuantity;
      // 数量不存在，修改计算场景
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }

      const { calcNetUnitPrice, calcTaxAmount, calcNetAmount, calcTaxQuota } =
        amountCalculation(COMMONS) || {};

      record.netAmount = calcNetAmount;
      record.totalAmount = calcTaxAmount;
      record.taxAmount = calcTaxQuota;
      Forms.setFieldsValue({
        netPrice: calcNetUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
        taxAmount: calcTaxQuota,
      });

      expandDefaultList.netAmount = calcNetAmount;
      expandDefaultList.totalAmount = calcTaxAmount;
    }
  };

  // 改变未税价格计算
  changeNetPriceCalc = (record) => {
    const {
      supplierBid: { quotationHeader },
    } = this.props;
    const { caclRule, currencyPrecision, financialPrecision, expandDefaultList = {} } = this.state;

    const { priceTypeCode } = quotationHeader || {};
    const { taxRateType } = record || {};
    const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';

    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      caclRule,
      defaultPrecision: currencyPrecision,
      financialPrecision,
      taxRateType,
    };

    const form = record.$form;
    // const isExit = value !== '' && value !== undefined && value !== null;
    if (form) {
      const quotationNetPrice = form.getFieldValue('netPrice');
      const taxRate = record.taxChangeFlag
        ? form.getFieldValue('taxIncludedFlag')
          ? form.getFieldValue('taxRate') || 0
          : 0
        : record?.taxRate || 0;
      const currentQuotationQuantity = form.getFieldValue('currentQuotationQuantity');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.netUnitPrice = quotationNetPrice;
      COMMONS.each = form?.priceBatchQuantity;
      // 数量不存在，修改计算场景
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount, calcTaxQuota } =
        amountCalculation(COMMONS) || {};

      record.netAmount = calcNetAmount;
      record.totalAmount = calcTaxAmount;
      record.taxAmount = calcTaxQuota;
      form.setFieldsValue({
        currentQuotationPrice: calcTaxUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });
    } else {
      const Forms = this.props.form;
      if (!Forms) {
        return;
      }

      // form
      const quotationNetPrice = Forms.getFieldValue('netPrice');
      const taxRate = Forms.getFieldValue('taxRate') || 0;
      const currentQuotationQuantity = Forms.getFieldValue('currentQuotationQuantity');

      COMMONS.quantity = currentQuotationQuantity;
      COMMONS.taxRate = taxRate ?? 0;
      COMMONS.netUnitPrice = quotationNetPrice;
      COMMONS.each = Forms?.priceBatchQuantity;
      // 数量不存在，修改计算场景
      if (!currentQuotationQuantity) {
        COMMONS.stageRule = 'noQuantity';
      }
      const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount, calcTaxQuota } =
        amountCalculation(COMMONS) || {};

      record.netAmount = calcNetAmount;
      record.totalAmount = calcTaxAmount;
      record.taxAmount = calcTaxQuota;
      Forms.setFieldsValue({
        currentQuotationPrice: calcTaxUnitPrice,
        totalAmount: calcTaxAmount,
        netAmount: calcNetAmount,
      });

      expandDefaultList.netAmount = calcNetAmount;
      expandDefaultList.totalAmount = calcTaxAmount;
    }
  };

  /**
   * 监听未税单价改变 - 增加防抖
   * @param: {number} value - 输入框输入值
   * @param: {Object} record - 行记录
   */
  @Bind()
  handleChangeNetPrice(value, record) {
    const form = record.$form;
    if (form) {
      form.setFieldsValue({
        netPrice: value,
      });
    } else {
      const Forms = this.props.form;
      if (!Forms) {
        return;
      }
      Forms.setFieldsValue({
        netPrice: value,
      });
    }

    this.changeNetPriceCalc(record);
  }

  /**
   * 修改含运费标识
   * @param {Object|Event} e - 事件源
   * @param {Object} form - 行表单
   */
  @Bind()
  handleChangeFreightFlag(e, form) {
    const { setFieldsValue } = form;
    if (e.target.checked === 1) {
      // 含运费
      setFieldsValue({
        freightAmount: null,
      });
    }
  }

  /**
   *  物料明细可编辑行信息加逻辑
   */
  @Bind()
  renderFormInfo() {
    const { form = {}, customizeForm } = this.props;
    const { collapseKeys2, sectionFlag, doubleUnitFlag } = this.state;
    const {
      supplierBid: { biddingQuotationLine = {}, quotationHeader },
    } = this.props;
    const { tenantId } = quotationHeader || {};

    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';
    const biddingLine = biddingQuotationLine || {}; // 子标段
    const { getFieldDecorator = (e) => e } = form;

    const ItemFormProps = {
      biddingLine,
      sectionFlag,
      doubleUnitFlag,
    };

    return (
      <div>
        <Collapse
          style={{ marginTop: '16px' }}
          className="form-collapse"
          defaultActiveKey={collapseKeys2}
          onChange={this.onCollapseChange2}
        >
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>{intl.get(`${promptCode}.view.message.panel.itemLineInfo`).d('物品行信息')}</h3>
                <a>
                  {collapseKeys2.includes('quotationInfo')
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon type={collapseKeys2.includes('quotationInfo') ? 'up' : 'down'} />
              </Fragment>
            }
            key="quotationInfo"
          >
            <ItemForm {...ItemFormProps} />
          </Panel>
        </Collapse>
        <Row style={{ fontSize: '15px', marginLeft: '13px' }}>
          <span className={style.labelCol}>
            {intl.get(`${promptCode}.model.supplierBid.quoteInformation`).d('投标信息')}
          </span>
        </Row>
        <div className={style['padding-16']}>
          {customizeForm(
            {
              code: 'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
              form: this.props.form,
              dataSource: biddingLine,
            },
            <Form>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentQuotationPrice', {
                      initialValue: biddingLine.currentQuotationPrice,
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1 && !isUnTaxPriceFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价'),
                          }),
                        },
                        {
                          validator: this.priceValidator,
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={biddingLine.quotationCurrencyCode}
                        onChange={(val) => this.handleChangeUnitPrice(val, biddingLine)}
                        disabled={form.getFieldValue('abandonedFlag') === 1 || isUnTaxPriceFlag}
                        min="0"
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('netPrice', {
                      initialValue: biddingLine.netPrice,
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1 && isUnTaxPriceFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.netPrice`)
                              .d('单价(不含税)'),
                          }),
                        },
                        {
                          validator: this.priceValidator,
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={biddingLine.quotationCurrencyCode}
                        onChange={(val) => this.handleChangeNetPrice(val, biddingLine)}
                        disabled={form.getFieldValue('abandonedFlag') === 1 || !isUnTaxPriceFlag}
                        min="0"
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.supplierBid.model.supplierBid.quotationDetails`)
                      .d('报价明细')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationDetailFlag')(
                      <QuotationDetailModal
                        rowData={biddingLine}
                        sourceFrom="BID"
                        detailFrom="SUP_QUOTATION"
                        quotationStatus={quotationHeader.quotationStatus}
                        disabled={form.getFieldValue('abandonedFlag')}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.deliveryDay`)
                      .d('供货周期(天)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentDeliveryCycle', {
                      initialValue: biddingLine.currentDeliveryCycle,
                      // rules: [
                      //   {
                      //     max: 100,
                      //     message: intl.get('hzero.common.validation.max', {
                      //       max: 100,
                      //     }),
                      //   },
                      // ],
                    })(
                      <InputNumber
                        disabled={form.getFieldValue('abandonedFlag') === 1}
                        precision={0}
                        min={0}
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.promisedDeliveryDate`)
                      .d('承诺交付日期')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentPromisedDate', {
                      initialValue:
                        biddingLine.currentPromisedDate &&
                        moment(biddingLine.currentPromisedDate, getDateFormat()),
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.promisedDeliveryTime`)
                              .d('承诺交货日期'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                        disabled={form.getFieldValue('abandonedFlag') === 1}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                      .d('可供数量')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentQuotationQuantity', {
                      initialValue: biddingLine.currentQuotationQuantity,
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.quantityChangeFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                              .d('可供数量'),
                          }),
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        uom={biddingLine.uomId}
                        disabled={
                          form.getFieldValue('abandonedFlag') === 1 ||
                          biddingLine.quantityChangeFlag === 0
                        }
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        onChange={(val) => this.handleChangeQuotationQuantity(val, biddingLine)}
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.modifyTheRate`).d('税率(%)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('taxId', {
                      initialValue: biddingLine.taxId,
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.taxChangeFlag &&
                            biddingLine.taxIncludedFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.modifyTheRate`)
                              .d('税率(%)'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SMDM.TAX"
                        style={{ width: '98%' }}
                        textValue={biddingLine.taxRate}
                        disabled={
                          biddingLine.taxChangeFlag === 0 ||
                          biddingLine.taxIncludedFlag === 0 ||
                          form.getFieldValue('abandonedFlag') === 1
                        }
                        onChange={(value, dataList) =>
                          this.changeTaxId(value, dataList, biddingLine)
                        }
                      />
                    )}
                    {getFieldDecorator('taxRate', { initialValue: biddingLine.taxRate })}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('netAmount', {
                      initialValue: biddingLine.netAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('taxAmount', {
                      initialValue: biddingLine.taxAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('totalAmount', {
                      initialValue: biddingLine.totalAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.freightIncludedFlag`)
                      .d('是否含运费')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('freightIncludedFlag', {
                      initialValue: biddingLine.freightIncludedFlag,
                    })(
                      <Checkbox
                        disabled={quotationHeader.freightUpdatableFlag === 0}
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={(value) => this.handleChangeFreightFlag(value, form)}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`${promptCode}.model.supplierBid.freightAmount`).d('运费')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator(`freightAmount`, {
                      initialValue: biddingLine.freightAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        disabled={form.getFieldValue('freightIncludedFlag') === 1}
                        style={{ width: '100%' }}
                        min="0"
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row
                gutter={48}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col {...FORM_COL_2_3_LAYOUT}>
                  <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...remarkFormLayout}>
                    {getFieldDecorator('currentQuotationRemark', {
                      initialValue: biddingLine.currentQuotationRemark,
                    })(<TextArea rows={2} disabled={form.getFieldValue('abandonedFlag') === 1} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
                      .d('报价有效日期从')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationExpiryDateFrom', {
                      initialValue:
                        biddingLine.quotationExpiryDateFrom &&
                        moment(biddingLine.quotationExpiryDateFrom, getDateFormat()),
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
                      .d('报价有效日期至')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationExpiryDateTo', {
                      initialValue:
                        biddingLine.quotationExpiryDateTo &&
                        moment(biddingLine.quotationExpiryDateTo, getDateFormat()),
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={48}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col {...FORM_COL_2_3_LAYOUT}>
                  <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={this.abandonedForm('abandonedFlag')}>
                    {getFieldDecorator('abandonedFlag', {
                      initialValue: biddingLine.abandonedFlag,
                    })(<Switch onChange={(item) => this.giveUp(item)} />)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </div>
    );
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  tooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 渲染标段只读头信息
   * sectionHeader
   */
  @Bind()
  renderSectionHeader(item) {
    const { collapseKeys } = this.state;
    const { organizationId } = this.props;
    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={collapseKeys}
        onChange={this.onCollapseChange}
      >
        <Panel
          showArrow={false}
          header={
            <Fragment>
              <h3>{intl.get(`${promptCode}.view.message.panel.sectionInfoView`).d('标段信息')}</h3>
              <a>
                {collapseKeys.includes('sectionInfoView')
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon type={collapseKeys.includes('sectionInfoView') ? 'up' : 'down'} />
            </Fragment>
          }
          key="sectionInfoView"
        >
          <Form>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionNum`).d('标段/包编号')}
                  value={item.sectionNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionName`).d('标段/包名称')}
                  value={item.sectionName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期')}
                  value={item.demandDate && moment(item.demandDate).format(DEFAULT_DATE_FORMAT)}
                />
              </Col>
            </Row>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.sectionAmount`)
                    .d('标段/包总金额')}
                  value={item.sectionAmount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.supplierLineAttachment`)
                    .d('标段/包投标文件')}
                  value={
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={item.currentAttachmentUuid}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  }
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.abandonedFlag`).d('是否放弃')}
                  value={yesOrNoRender(item.abandonedFlag)}
                />
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  }

  /**
   * 渲染标段头信息可修改
   * sectionHeaderUpdate const {
      supplierBid: { biddingQuotationLine = {}, quotationHeader },
    } = this.props;
    const { tenantId, } = quotationHeader || {};
   */
  @Bind()
  renderSectionHeaderUpdate(item) {
    const { collapseKeys1 } = this.state;
    const {
      organizationId,
      form = {},
      supplierBid: { quotationHeader },
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { tenantId } = quotationHeader || {};

    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={collapseKeys1}
        onChange={this.onCollapseChange1}
      >
        <Panel
          showArrow={false}
          header={
            <Fragment>
              <h3>{intl.get(`${promptCode}.view.message.panel.sectionInfoView`).d('标段信息')}</h3>
              <a>
                {collapseKeys1.includes('sectionInfoUpdate')
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon type={collapseKeys1.includes('sectionInfoUpdate') ? 'up' : 'down'} />
            </Fragment>
          }
          key="sectionInfoUpdate"
        >
          <Form>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionNum`).d('标段/包编号')}
                  value={item.sectionNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.sectionName`).d('标段/包名称')}
                  value={item.sectionName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期')}
                  value={item.demandDate && moment(item.demandDate).format(DEFAULT_DATE_FORMAT)}
                />
              </Col>
            </Row>
            <Row gutter={48} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBid.sectionAmount`)
                    .d('标段/包总金额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sectionAmount', {
                    initialValue: item.sectionAmount,
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      financial={item.quotationCurrencyCode}
                      min="0"
                      disabled={form.getFieldValue('abandonedFlag') === 1}
                      style={{ width: '100%' }}
                      max="99999999999999999999"
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.supplierLineAttachment`)
                    .d('标段/包投标文件')}
                >
                  {getFieldDecorator('currentAttachmentUuid', {
                    initialValue: item.currentAttachmentUuid,
                  })(
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={this.attachmentMethod(item)}
                      tenantId={organizationId}
                      fileSize={FIlESIZE}
                      afterOpenUploadModal={this.afterOpenUploadModal}
                      {...ChunkUploadProps}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={this.abandonedForm('abandonedFlag')}>
                  {getFieldDecorator('abandonedFlag', {
                    initialValue: item.abandonedFlag,
                  })(<Switch onChange={(type) => this.giveUp(type)} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  }

  /**
   * 渲染标段只读行信息
   * sectionItemLine
   */
  @Bind()
  renderSectionItemLine(quotationLineId, children = []) {
    const {
      fetchBiddingLineLoading,
      supplierBid: { quotationHeader = {} },
      form = {},
      customizeTable = () => {},
    } = this.props;
    const { doubleUnitFlag } = this.state;
    const { quotationStatus = '', tenantId } = quotationHeader;
    if (quotationStatus === 'ABANDONED') {
      children.forEach((item) => {
        if (item._status) {
          delete item._status; // eslint-disable-line
        }
      });
    } else {
      children.forEach((item) => {
        item._status = 'update'; // eslint-disable-line
      });
    }

    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';

    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.freightIncludedFlag`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={quotationHeader.freightUpdatableFlag === 0}
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(value) => this.handleChangeFreightFlag(value, record.$form)}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`freightAmount`, {
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    financial={record.quotationCurrencyCode}
                    disabled={record.$form.getFieldValue('freightIncludedFlag') === 1}
                    style={{ width: '100%' }}
                    min="0"
                    max="99999999999999999999"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`quotationExpiryDateFrom`, {
                  initialValue: val && moment(val, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`quotationExpiryDateTo`, {
                  initialValue: val && moment(val, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationDetails`).d('报价明细'),
        dataIndex: 'priceDetail',
        width: 100,
        render: (val, record) => (
          <QuotationDetailModal
            rowData={record}
            sourceFrom="BID"
            detailFrom="SUP_QUOTATION"
            quotationStatus={quotationHeader.quotationStatus}
            disabled={form.getFieldValue(`${quotationLineId}#abandonedFlag`)}
          />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierBid.model.supplierBid.bidQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierBid.model.supplierBid.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.validQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentQuotationQuantity`, {
                  initialValue: val || '',
                  rules: [
                    {
                      required:
                        form.getFieldValue(`${quotationLineId}#abandonedFlag`) !== 1 &&
                        record.quantityChangeFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                          .d('可供数量'),
                      }),
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    uom={record.uomId}
                    disabled={
                      form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                      record.abandonedFlag === 1 ||
                      record.quantityChangeFlag === 0
                    }
                    style={{ width: '100%' }}
                    max="99999999999999999999"
                    onChange={(value) => this.changeQuantity(value, record)}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        align: 'right',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentQuotationPrice`, {
                  initialValue: val || '',
                  rules: [
                    {
                      required:
                        form.getFieldValue(`${quotationLineId}#abandonedFlag`) !== 1 &&
                        !isUnTaxPriceFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.taxIncludedPrice`)
                          .d('单价(含税)'),
                      }),
                    },
                    {
                      validator: this.priceValidator,
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    currency={record.quotationCurrencyCode}
                    onChange={(value) => this.handleChangeUnitPrice(value, record)}
                    disabled={
                      form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                      record.abandonedFlag === 1 ||
                      isUnTaxPriceFlag
                    }
                    min="0"
                    style={{ width: '100%' }}
                    max="99999999999999999999"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 150,
        align: 'right',
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <FormItem>
                  {getFieldDecorator(`netPrice`, {
                    initialValue: val || '',
                    rules: [
                      {
                        required:
                          form.getFieldValue(`${quotationLineId}#abandonedFlag`) !== 1 &&
                          isUnTaxPriceFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.supplierBid.netPrice`)
                            .d('单价(不含税)'),
                        }),
                      },
                      {
                        validator: this.priceValidator,
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      currency={record.quotationCurrencyCode}
                      onChange={(value) => this.handleChangeNetPrice(value, record)}
                      disabled={
                        form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                        record.abandonedFlag === 1 ||
                        !isUnTaxPriceFlag
                      }
                      min="0"
                      style={{ width: '100%' }}
                      max="99999999999999999999"
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </FormItem>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentDeliveryCycle`, {
                  initialValue: val || '',
                  // rules: [
                  //   {
                  //     max: 100,
                  //     message: intl.get('hzero.common.validation.max', {
                  //       max: 100,
                  //     }),
                  //   },
                  // ],
                })(
                  <InputNumber
                    disabled={
                      form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                      record.abandonedFlag === 1
                    }
                    precision={0}
                    min={0}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentPromisedDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('currentPromisedDate', {
                  initialValue: val && moment(val, getDateFormat()),
                  rules: [
                    {
                      required: form.getFieldValue(`${quotationLineId}#abandonedFlag`) !== 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.currentPromisedDate`)
                          .d('承诺交付日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabled={
                      form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                      record.abandonedFlag === 1
                    }
                  />
                )}
              </FormItem>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        // render: yesOrNoRender,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(<Checkbox disabled />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`taxId`, {
                  initialValue: val || null,
                  rules: [
                    {
                      required:
                        form.getFieldValue(`${quotationLineId}#abandonedFlag`) !== 1 &&
                        record.taxChangeFlag &&
                        record.taxIncludedFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.modifyTheRate`)
                          .d('税率(%)'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.TAX"
                    style={{ width: '98%' }}
                    textValue={record.taxRate}
                    disabled={
                      record.taxChangeFlag === 0 ||
                      record.taxIncludedFlag === 0 ||
                      form.getFieldValue(`${quotationLineId}#abandonedFlag`) === 1 ||
                      record.abandonedFlag === 1
                    }
                    onChange={(value, lovRecord) =>
                      this.handleChangeTaxId(value, lovRecord, record)
                    }
                  />
                )}
                {getFieldDecorator('taxRate', { initialValue: record.taxRate })}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 180,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentQuotationRemark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value, record) => {
          if (value) {
            return (
              <React.Fragment>
                <Popover placement="topLeft" content={value}>
                  {value}
                </Popover>
                {record.$form.getFieldDecorator(`quotationLineParentId`, {
                  initialValue: record.quotationLineParentId || '',
                })}
              </React.Fragment>
            );
          } else {
            return null;
          }
        },
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_UPDATE.ITEM_LINE', // 单元编码，必传
            cacheKey: quotationLineId,
          },
          <EditTable
            bordered
            loading={fetchBiddingLineLoading}
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={children}
            onDataChange={this.onDataChange}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 渲染标段操作
   * @description: 我要投标/切换视图
   */
  @Bind()
  renderOperations() {
    return intl.get('ssrc.supplierBid.view.message.title.supplierBid').d('我要投标');
  }

  /**
   * 投标视图切换
   * renderBidDone
   * @description: 我要投标/切换视图
   */
  @Bind()
  renderBidDone() {
    const {
      dispatch,
      supplierBid: { quotationLines = [] },
    } = this.props;
    const {
      inquiryTableReadOnly,
      inquiryDetail,
      sectionFlag,
      activeKey,
      activeChildrenKey,
      editFlag,
    } = this.state;
    // 匹配key索引,转换为number类型

    if (editFlag && inquiryTableReadOnly) {
      Modal.confirm({
        title: intl
          .get(`${promptCode}.model.expertScoring.ifSave`)
          .d('是否需要保存当前视图所填写的投标信息？'),
        onOk: () => {
          this.switchSaveSectionLine();
        },
        onCancel: () => {
          const index = quotationLines.findIndex((item) => item.quotationLineId === activeKey);
          this.setState({
            inquiryTableReadOnly: !inquiryTableReadOnly,
            inquiryDetail: !inquiryDetail,
            editFlag: false,
            // expandDefaultList: quotationLines[index].children[0],
            defaultNode: {
              [quotationLines[index].children[0].quotationLineId]: [
                quotationLines[index].children[0].quotationLineId,
              ],
            },
          });
          // 标段条件下
          if (sectionFlag) {
            // 查询父节点，树形组件内做form渲染控制
            dispatch({
              type: 'supplierBid/queryBiddingQuotationParentLine',
              payload: {
                quotationLineId: activeKey,
              },
            }).then((res) => {
              if (res) {
                this.parentFormFields(res);
                if (activeChildrenKey) {
                  // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
                  dispatch({
                    type: 'supplierBid/queryBiddingQuotationLine',
                    payload: {
                      quotationLineId: activeChildrenKey,
                    },
                  });
                } else {
                  // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
                  dispatch({
                    type: 'supplierBid/queryBiddingQuotationLine',
                    payload: {
                      quotationLineId: res.children[0].quotationLineId,
                    },
                  });
                }
              }
            });
          }
        },
      });
    } else {
      const index = quotationLines.findIndex((item) => item.quotationLineId === activeKey);
      this.setState({
        inquiryTableReadOnly: !inquiryTableReadOnly,
        inquiryDetail: !inquiryDetail,
        // expandDefaultList: quotationLines[index].children[0],
        defaultNode: {
          [quotationLines[index].children[0].quotationLineId]: [
            quotationLines[index].children[0].quotationLineId,
          ],
        },
      });
      // 标段条件下
      if (sectionFlag) {
        // 查询父节点，树形组件内做form渲染控制
        dispatch({
          type: 'supplierBid/queryBiddingQuotationParentLine',
          payload: {
            quotationLineId: activeKey,
          },
        }).then((res) => {
          if (res) {
            this.parentFormFields(res);
            if (activeChildrenKey) {
              // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
              dispatch({
                type: 'supplierBid/queryBiddingQuotationLine',
                payload: {
                  quotationLineId: activeChildrenKey,
                },
              });
            } else {
              // 查询子节点,默认:第一个标段下父节点的子节点的第一个key,后面激活新key
              dispatch({
                type: 'supplierBid/queryBiddingQuotationLine',
                payload: {
                  quotationLineId: res.children[0].quotationLineId,
                },
              });
            }
          }
        });
      }
    }
  }

  /**
   * 切换tabs，记录激活的key
   */
  @Bind()
  async changeTabs(key) {
    const { inquiryDetail } = this.state;
    const { dispatch } = this.props;
    this.setState({
      activeKey: key,
      activeChildrenKey: null,
    });
    // 详情页切换面板查询物料行api
    if (inquiryDetail) {
      await this.saveBiddingOffer();
      await this.queryQuotationHeader();
      await dispatch({
        type: 'supplierBid/queryBiddingQuotationParentLine',
        payload: {
          quotationLineId: key,
        },
      }).then((res) => {
        if (res) {
          // 注入父类form元素
          this.parentFormFields(res);
          // 注入父类默认选中的0下标数据
          this.setState({
            defaultNode: { [res.children[0].quotationLineId]: [res.children[0].quotationLineId] },
          });
          dispatch({
            type: 'supplierBid/queryBiddingQuotationLine',
            payload: {
              quotationLineId: res.children[0].quotationLineId,
            },
          }).then((response) => {
            if (response) {
              this.setFormFields(response);
            }
          });
        }
      });
    }
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs(activeKey) {
    // const {sectionFlag} =this.state;
    const {
      inquiryTableReadOnly, // 列表只读列
      inquiryDetail, // 详情
    } = this.state;
    const renderOperations = (
      <a
        style={{ fontSize: '14px', lineHeight: '47px', marginRight: '16px' }}
        onClick={() => this.renderBidDone()}
      >
        {intl.get(`${promptCode}.model.supplierBid.switchTheview`).d('切换视图')}
      </a>
    );
    const {
      supplierBid: { quotationLines = [] },
      fetchBiddingLineLoading,
      fetchSectionLoading,
      queryQuotationHeaderLoading,
      organizationId,
      form = {},
    } = this.props;
    const itemLineProps = {
      form,
      attachmentMethod: this.attachmentMethod,
      attachmentTableMethod: this.attachmentTableMethod,
      afterOpenUploadModal: this.afterOpenUploadModal,
      setValue: this.setValue,
      abandonedForm: this.abandonedForm,
      giveUp: this.giveUp,
      giveUpTo: this.giveUpTo,
      onRef: (key, node) => {
        this.sectionForm[key] = node;
      },
    };
    return (
      <Spin
        spinning={
          inquiryDetail &&
          (fetchBiddingLineLoading || fetchSectionLoading || queryQuotationHeaderLoading)
        }
        wrapperClassName={classNames('ued-detail-wrapper')}
      >
        <Tabs
          tabBarExtraContent={renderOperations}
          onChange={this.changeTabs}
          animated={false}
          activeKey={`${activeKey}`}
        >
          {/* 循环标段数据,渲染tabs标段 */}
          {map(quotationLines, (item) => {
            return (
              <Tabs.TabPane tab={this.tooTipTabs(item)} key={[item.quotationLineId]} forceRender>
                {/* 渲染标段头只读信息 */}
                {inquiryTableReadOnly && (
                  <SectionHeader
                    {...itemLineProps}
                    item={item}
                    quotationLineId={item.quotationLineId}
                    organizationId={organizationId}
                  />
                )}
                {/* 渲染标段物料行只读信息 */}
                {inquiryTableReadOnly && (
                  <div>{this.renderSectionItemLine(item.quotationLineId, item.children)}</div>
                )}
                {inquiryDetail && (
                  <>
                    {
                      <SectionHeaderUpdate
                        {...itemLineProps}
                        item={item}
                        organizationId={organizationId}
                      />
                    }
                    <div className={style.biddingDetail}>
                      {this.leftTableView(item.children)}
                      {this.rightSectionDetailView()}
                      <div style={{ clear: 'both' }} />
                    </div>
                  </>
                )}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Spin>
    );
  }

  /**
   * 渲染不区分标段tabs
   */
  @Bind()
  renderNormalTabs() {
    const {
      supplierBid: { quotationLines = [] },
      fetchBiddingLineLoading,
      fetchSectionLoading,
    } = this.props;
    const {
      inquiryTableReadOnly, // 列表只读列
      inquiryDetail, // 详情
    } = this.state;
    const renderOperations = (
      <a
        style={{ fontSize: '14px', lineHeight: '47px', marginRight: '16px' }}
        onClick={() => this.hideItemDetail()}
      >
        {inquiryTableReadOnly
          ? null
          : intl.get(`${promptCode}.view.message.button.switchView`).d('切换视图')}
      </a>
    );
    return (
      <div>
        <Tabs
          defaultActiveKey="quotationLine"
          animated={false}
          tabBarExtraContent={renderOperations}
        >
          <Tabs.TabPane
            tab={intl.get(`${promptCode}.view.message.tab.bidByProduction`).d('按物品投标')}
            key="quotationLine"
            forceRender
          >
            {inquiryTableReadOnly && <div>{this.categoryTable()}</div>}
            {inquiryDetail && (
              <Spin spinning={fetchBiddingLineLoading || fetchSectionLoading}>
                <div className={style.biddingDetail}>
                  {this.leftTableView(quotationLines)}
                  {this.rightDetailView()}
                  <div style={{ clear: 'both' }} />
                </div>
              </Spin>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }

  /**
   * 只读物料行不分标段表格渲染
   * @returns {*}
   */
  @Bind()
  categoryTable() {
    const {
      fetchBiddingLineLoading,
      supplierBid: { quotationLines = [], quotationHeader = {}, bidQuoPagination = {} },
      customizeTable = () => {},
    } = this.props;
    const { doubleUnitFlag } = this.state;
    const { tenantId } = quotationHeader || {};
    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';
    const { quotationStatus = '' } = quotationHeader;
    if (quotationStatus === 'ABANDONED') {
      quotationLines.forEach((item) => {
        if (item._status) {
          delete item._status; // eslint-disable-line
        }
      });
    } else {
      quotationLines.forEach((item) => {
        item._status = 'update'; // eslint-disable-line
      });
    }

    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.freightIncludedFlag`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('freightIncludedFlag', {
                initialValue: val,
              })(
                <Checkbox
                  disabled={quotationHeader.freightUpdatableFlag === 0}
                  checkedValue={1}
                  unCheckedValue={0}
                  onChange={(value) => this.handleChangeFreightFlag(value, record.$form)}
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.freightAmount`).d('运费'),
        dataIndex: 'freightAmount',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`freightAmount`, {
                  initialValue: val,
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    financial={record.quotationCurrencyCode}
                    disabled={record.$form.getFieldValue('freightIncludedFlag') === 1}
                    style={{ width: '100%' }}
                    min="0"
                    max="99999999999999999999"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`quotationExpiryDateFrom`, {
                  initialValue: val && moment(val, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`quotationExpiryDateTo`, {
                  initialValue: val && moment(val, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.abandoned`).d('放弃'),
        dataIndex: 'abandonedFlag',
        width: 60,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('abandonedFlag', {
                initialValue: value,
              })(<Checkbox />)}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationDetails`).d('报价明细'),
        dataIndex: 'priceDetail',
        width: 100,
        render: (val, record) => (
          <QuotationDetailModal
            rowData={record}
            sourceFrom="BID"
            detailFrom="SUP_QUOTATION"
            quotationStatus={quotationHeader.quotationStatus}
            disabled={record.$form?.getFieldValue('abandonedFlag')}
          />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierBid.model.supplierBid.bidQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.supplierBid.model.supplierBid.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.currentQuotationQuantity`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentQuotationQuantity`, {
                  initialValue: val || '',
                  rules: [
                    {
                      required:
                        record.$form.getFieldValue('abandonedFlag') !== 1 &&
                        record.quantityChangeFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                          .d('可供数量'),
                      }),
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    uom={record.uomId}
                    disabled={
                      record.$form.getFieldValue('abandonedFlag') === 1 ||
                      record.quantityChangeFlag === 0
                    }
                    style={{ width: '100%' }}
                    max="99999999999999999999"
                    onChange={(n) => this.onChangeQuotationQuantityTable(n, record)}
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 150,
        align: 'right',
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentQuotationPrice`, {
                  initialValue: val || '',
                  rules: [
                    {
                      required:
                        record.$form.getFieldValue('abandonedFlag') !== 1 && !isUnTaxPriceFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.taxIncludedPrice`)
                          .d('单价(含税)'),
                      }),
                    },
                    {
                      validator: this.priceValidator,
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    currency={record.quotationCurrencyCode}
                    onChange={(value) => this.handleChangeUnitPrice(value, record)}
                    disabled={record.$form.getFieldValue('abandonedFlag') === 1 || isUnTaxPriceFlag}
                    min="0"
                    style={{ width: '100%' }}
                    max="99999999999999999999"
                    queryPrecisionParams={{
                      purTenantId: tenantId,
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 150,
        align: 'right',
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <React.Fragment>
                <FormItem>
                  {getFieldDecorator(`netPrice`, {
                    initialValue: val || '',
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('abandonedFlag') !== 1 && isUnTaxPriceFlag,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.model.supplierBid.netPrice`)
                            .d('单价(不含税)'),
                        }),
                      },
                      {
                        validator: this.priceValidator,
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      currency={record.quotationCurrencyCode}
                      onChange={(value) => this.handleChangeNetPrice(value, record)}
                      disabled={
                        record.$form.getFieldValue('abandonedFlag') === 1 || !isUnTaxPriceFlag
                      }
                      min="0"
                      style={{ width: '100%' }}
                      max="99999999999999999999"
                      queryPrecisionParams={{
                        purTenantId: tenantId,
                      }}
                    />
                  )}
                </FormItem>
              </React.Fragment>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`currentDeliveryCycle`, {
                  initialValue: val || '',
                  // rules: [
                  //   {
                  //     max: 100,
                  //     message: intl.get('hzero.common.validation.max', {
                  //       max: 100,
                  //     }),
                  //   },
                  // ],
                })(
                  <InputNumber
                    disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                    precision={0}
                    min={0}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.proPayDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator('currentPromisedDate', {
                  initialValue: val && moment(val, getDateFormat()),
                  rules: [
                    {
                      required: getFieldValue('abandonedFlag') !== 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.currentPromisedDate`)
                          .d('承诺交付日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format={getDateFormat()}
                    placeholder={null}
                    disabled={record.$form.getFieldValue('abandonedFlag') === 1}
                  />
                )}
              </FormItem>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        // render: yesOrNoRender,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(<Checkbox disabled />)}
            </Form.Item>
          ) : (
            enableRender(val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxRate(%)`).d('税率（%）'),
        dataIndex: 'taxId',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem>
                {getFieldDecorator(`taxId`, {
                  initialValue: val || null,
                  rules: [
                    {
                      required:
                        record.$form.getFieldValue('abandonedFlag') !== 1 &&
                        record.taxChangeFlag &&
                        record.taxIncludedFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.modifyTheRate`)
                          .d('税率(%)'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SMDM.TAX"
                    style={{ width: '98%' }}
                    textValue={record.taxRate}
                    disabled={
                      record.taxChangeFlag === 0 ||
                      record.taxIncludedFlag === 0 ||
                      record.$form.getFieldValue('abandonedFlag') === 1
                    }
                    onChange={(value, lovRecord) =>
                      this.handleChangeTaxId(value, lovRecord, record)
                    }
                  />
                )}
                {getFieldDecorator('taxRate', { initialValue: record.taxRate })}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 150,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBid.operation`).d('操作'),
        dataIndex: 'sectionFlag',
        width: 100,
        fixed: 'right',
        render: (text, record) => this.onOperation(text, record),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE', // 单元编码，必传
          },
          <EditTable
            bordered
            loading={fetchBiddingLineLoading}
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={quotationLines}
            pagination={bidQuoPagination}
            onDataChange={this.onDataChange}
            onChange={(page) => this.queryQuotationLines(page)}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 保存报价单头附件
   * @param {Object} params - 包含报价单技术附件和商务附件 uuid
   */
  @Bind()
  handleBindOnRef(ref = {}) {
    this.attachmentRef = ref;
  }

  @Bind()
  initUpload(params) {
    const {
      match,
      dispatch,
      supplierBid: { quotationHeader = {} },
    } = this.props;
    const { quotationHeaderId } = match.params;
    dispatch({
      type: 'supplierBid/saveHeaderAttachment',
      payload: {
        objectVersionNumber: quotationHeader.objectVersionNumber,
        quotationHeaderId: quotationHeader.quotationHeaderId,
        currentBusinessAttachmentUuid: params.businessAttachmentUuid,
        currentTechAttachmentUuid: params.techAttachmentUuid,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        // 查询报价单头
        dispatch({
          type: 'supplierBid/queryQuotationHeader',
          payload: {
            quotationHeaderId,
          },
        });
      }
    });
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal() {
    this.setState({
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
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    const {
      match: {
        params: { quotationHeaderId },
      },
      organizationId,
    } = this.props;
    const { sectionFlag } = this.state;
    if (!quotationHeaderId || quotationHeaderId === 'null') {
      return;
    }

    const code = sectionFlag ? 'SSRC_BID_TENDER_LINE_SECTION' : 'SSRC_BID_TENDER_LINE_NONE';

    const props = {
      code,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        quotationHeaderId,
        templateCode: code,
        tenantId: organizationId,
      }),
      backPath: undefined,
      action: 'hzero.common.title.batchImport',
      downloadTemplateFlag: false,
    };

    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: c7nModal.key(),
      title: intl.get(`${promptCode}.view.message.title.supplierTender`).d('供应商投标'),
      children: <CommonImport {...props} />,
      style: { width: '80%' },
      onOk: this.handleBatchImpOk,
    });
  }

  // 批量导入OK
  @Bind
  handleBatchImpOk() {
    const {
      supplierBid: { bidQuoPagination = {} },
    } = this.props;
    this.queryQuotationLines(bidQuoPagination);
  }

  /**
   * 提取附件上传按钮方法，以便二开使用
   * @returns button
   * @protected （凯撒易食二开）禁止修改、删除此方法名
   */
  uploadFileBtn = (btnProps = {}) => {
    return (
      <Button icon="upload" onClick={this.showUploadModal} {...btnProps}>
        {intl.get(`ssrc.supplierQuotation.view.message.button.uploadFile`).d('附件上传')}
      </Button>
    );
  };

  render() {
    const {
      form,
      form: { getFieldDecorator },
      customizeForm,
      match: { params },
      supplierBid: {
        quotationHeader = {},
        quotationLines = [], // 供应商投标行信息
        code = {},
      }, // 供应商投标行查询分页信息},
      organizationId,
      queryQuotationHeaderLoading, // 查询头loading
      // saveBiddingHeadingLoading, // 保存头loading
      // submitBiddingHeadingLoading, // 提交头loading
      abandonedAllLoading, // 放弃所有投标loading
      // fetchBiddingLineLoading, // 查询投标行loading
      // fetchSectionLoading, // 查询标段行 loading
      customizeBtnGroup,
    } = this.props;
    const {
      // inquiryTableReadOnly, // 列表只读列
      // inquiryDetail, // 详情
      collapseKeys,
      sectionFlag,
      giveUpVisible, // 放弃整段Modal
      activeKey,
      submitLoading,
      saveLoading,
      attachmentVisible,
    } = this.state;
    const previewModalStyle = {
      maxWidth: '50vw',
      maxHeight: '50vh',
    };
    // 报价单头附件列表
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      initUpload: this.initUpload,
      viewOnly: false,
      businessUuid: quotationHeader.currentBusinessAttachmentUuid,
      techUuid: quotationHeader.currentTechAttachmentUuid,
      onRef: this.handleBindOnRef,
      fileSize: FIlESIZE,
      ...(ChunkUploadProps || {}),
    };
    const time = quotationHeader.quotationEndDate ? quotationHeader.quotationEndDate : null;
    const now = quotationHeader.nowDate ? quotationHeader.nowDate : null;
    const { quotationHeaderId } = params;
    const requestUrl = `${SRM_SSRC}/v1/${organizationId}/bid/quotation/line/${quotationHeaderId}/export/${
      sectionFlag ? 'section' : 'none'
    }`;

    const importProps = {
      businessObjectTemplateCode: sectionFlag
        ? 'SSRC_BID_TENDER_LINE_SECTION'
        : 'SSRC_BID_TENDER_LINE_NONE',
      prefixPatch: SRM_SSRC,
      args: {
        quotationHeaderId,
        templateCode: sectionFlag ? 'SSRC_BID_TENDER_LINE_SECTION' : 'SSRC_BID_TENDER_LINE_NONE',
        tenantId: organizationId,
      },
      buttonText: intl
        .get(`ssrc.supplierQuotation.view.message.button.importQuotation`)
        .d('Excel导入'),
      buttonProps: {
        permissionList: [
          {
            code: `ssrc.supplier-bid-hall.biddone.button.excel-import-new`,
            type: 'button',
            meaning:
              intl.get(`${promptCode}.view.message.title.supplierTender`).d('供应商投标') -
              intl.get('ssrc.inquiryHall.view.button.allCreateNew').d('(新)Excel导入'),
          },
        ],
      },
      tenantId: organizationId,
      icon: 'archive',
      successCallBack: this.handleBatchImpOk,
      name: 'excelImportNew',
    };

    return (
      <ModalProvider>
        <Header
          backPath="/ssrc/supplier-bid-hall/list"
          title={intl.get(`${promptCode}.view.message.title.supplierTender`).d('供应商投标')}
        >
          {customizeBtnGroup({ code: 'SSRC.TENDER_HALL_UPDATE.HEADER_BUTTON' }, [
            <Button
              type="primary"
              icon="check"
              onClick={this.submitAllBiddingOffer}
              loading={submitLoading}
              name="submit"
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
            <Button icon="save" onClick={this.saveBiddingAll} loading={saveLoading} name="save">
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>,
            <Button onClick={this.onAbandon} loading={abandonedAllLoading} name="giveUpBid">
              <Iconfont type="main-delete" style={{ marginRight: '8px' }} />
              {intl.get(`${promptCode}.view.message.button.giveUpBid`).d('放弃投标')}
            </Button>,
            <Button onClick={this.handleBatchImport} name="importQuotation">
              <Iconfont type="main-import" size={16} />
              {intl
                .get(`ssrc.supplierQuotation.view.message.button.importQuotation`)
                .d('Excel导入')}
            </Button>,
            <CommonImportNew {...importProps} />,
            <ExcelExports
              buttonText={intl
                .get(`${promptCode}.view.message.button.downloadImportTemplate`)
                .d('下载导入模板')}
              requestUrl={requestUrl}
              otherButtonProps={{ className: 'label-btn', type: 'default' }}
              name="downloadImportTemplate"
            />,
            quotationLines?.[0]?.quotationTemplateFlag === 1 && (
              <QuotationDetailImport
                quotationHeaderId={quotationHeaderId}
                // templateCode="SSRC.PROJECT_QUO_DETAIL"
                sourceFrom="BID"
                isH0Btn
                onOk={this.queryQuotationLines}
                onClose={this.queryQuotationLines}
                name="quotationDetailImport"
              />
            ),
            this.uploadFileBtn({ name: 'upload' }),
          ])}
        </Header>
        <Content>
          <Spin
            spinning={queryQuotationHeaderLoading}
            wrapperClassName={classNames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfos']}
              onChange={this.onCollapseChange}
            >
              <Panel
                style={{ position: 'relative' }}
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {quotationHeader.bidNum && quotationHeader.bidTitle
                        ? `${quotationHeader.bidNum}-${quotationHeader.bidTitle}`
                        : ''}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                    <span style={{ position: 'absolute', right: 0 }}>
                      <img src={require('@/assets/time.svg')} alt="" />
                      <span style={{ marginLeft: '10px', marginRight: '20px' }}>
                        <CountDown sysNow={now} endTime={time} type="day" />
                      </span>
                    </span>
                  </Fragment>
                }
                key="baseInfos"
              >
                <InquiryHeader
                  headerInfo={quotationHeader}
                  tenantId={organizationId}
                  code={code}
                  showUploadModal={this.showUploadModal}
                  form={form}
                  customizeForm={customizeForm}
                />
              </Panel>
            </Collapse>
            <div>{sectionFlag ? this.renderTabs(activeKey) : this.renderNormalTabs()}</div>
          </Spin>
        </Content>
        <Modal
          visible={giveUpVisible}
          title={intl.get(`${promptCode}.view.message.title.waiverOfBidding`).d('放弃投标')}
          footer={null}
          onCancel={this.handleConfirmWaiver}
          style={previewModalStyle}
        >
          <Fragment>
            <Form>
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBid.giveUpReason`).d('放弃理由')}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {getFieldDecorator('appendRemark', {
                  initialValue: intl.get('ssrc.supplierBid.model.supplierBid.abandoned').d('放弃'),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.supplierBid.giveUpReason`)
                          .d('放弃理由'),
                      }),
                    },
                  ],
                })(<TextArea style={{ height: 65 }} />)}
              </FormItem>
            </Form>
            <Button
              icon="save"
              type="primary"
              style={{ marginLeft: 394, marginTop: 0 }}
              onClick={this.onConfirmWaiver}
              // loading={abandonLoading}
            >
              {intl.get(`${promptCode}.view.message.button.confirm`).d('确认')}
            </Button>
          </Fragment>
        </Modal>
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <QuoteAttachment {...AttachmentsProps} />
        </Modal>
      </ModalProvider>
    );
  }
}

const hocInquiryPrice = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.TENDER_HALL_UPDATE.HEADER',
      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE',
      'SSRC.TENDER_HALL_UPDATE.ITEM_LINE_NONE',
      'SSRC.TENDER_HALL_UPDATE.TENDER.EXCHANGE.VIEW',
      'SSRC.TENDER_HALL_UPDATE.TNDER.FORM.INFO',
      'SSRC.TENDER_HALL_UPDATE.HEADER_BUTTON',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.bidHall',
        'ssrc.supplierBid',
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
      ],
    })(
      Form.create({ fieldNameProp: null })(
        connect(({ supplierBid, supplierQuotation, quotationTemplate, loading }) => ({
          supplierBid,
          supplierQuotation,
          quotationTemplate,
          queryQuotationHeaderLoading: loading.effects['supplierBid/queryQuotationHeader'], // 查询投标头loading
          saveBiddingHeadingLoading: loading.effects['supplierBid/saveAllBid'], // 保存投标头loading
          submitBiddingHeadingLoading: loading.effects['supplierBid/submitAllBid'], // 提交投标头loading
          abandonedAllLoading: loading.effects['supplierBid/fatchAbandon'], // 放弃所有投标loading
          saveBiddingLineLoading: loading.effects['supplierBid/saveQuotationLines'], // 保存投标行loading
          switchViewLoading: loading.effects['supplierBid/queryQuotationLines'], // 切换视图loading
          fetchBiddingLineLoading: loading.effects['supplierBid/queryQuotationLines'], // 查询投标行loading
          // abandonedSectionLoading: loading.effects['supplierBid/fatchAbandon'], // 放弃某标段loading
          fetchListLoading: loading.effects['supplierBid/queryQuotationLines'], // 投标所有行loading
          fetchSectionLoading: loading.effects['supplierBid/queryBiddingQuotationLine'], // 投标标段行loading
          organizationId: getCurrentOrganizationId(),
        }))(Com)
      )
    )
  );
};

const HOCComponent = hocInquiryPrice(InquiryPrice);

export { InquiryPrice, hocInquiryPrice };
export default HOCComponent;
