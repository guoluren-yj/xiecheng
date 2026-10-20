/**
 * CalibrationManagementNot - 寻源服务/询价大厅-不分标段定标管理
 * @date: 2018-12-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Button,
  Form,
  Tabs,
  Collapse,
  Spin,
  Icon,
  Modal,
  Tag,
  Tooltip,
  Switch,
  Popover,
} from 'hzero-ui';
import classnames from 'classnames';
import { isEmpty, isUndefined, isNull, isArray } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
// import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getEditTableData, getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { downloadFile } from 'hzero-front/lib/services/api';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { phoneRender, numberSeparatorRender } from '@/utils/renderer';
import { isText } from '@/utils/utils';

import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { queryEnableDoubleUnit } from '@/services/commonService';
import BidInfoForm from './BidInfoForm';
import BidOtherForm from './BidOtherForm';
import BidMemberForm from './BidMemberForm';
import ItemLineTable from './ItemLineTable';
import ItemDimension from './ItemDimension';
import ScoreDetails from './ScoreDetails';
import SupplierLineTable from './SupplierLineTable';
import Attachment from '../../components/Attachment';
import ExchangeEditModal from './ExchangeEditModal';
import QuoteExchangeMainDateModal from './QuoteExchangeMainDateModal';
import PricingModal from '../../components/PricingModal';
import DownloadAttachments from '../../components/DownloadAttachments';
import IPCoincidenceRate from '../../../components/IPCoincidenceRate/index';
import styles from './index.less';

const { Panel } = Collapse;

// @withCustomize({
//   unitCode: [
//     'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
//     'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
//     'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ',
//     'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ',
//     'SSRC.BID_HALL_CHECK_PRICE.HEADER',
//     'SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO',
//     'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
//   ],
// })
// @Form.create({ fieldNameProp: null })
// @formatterCollections({ code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'] })
// @connect(({ bidHall, loading, user }) => ({
//   user,
//   bidHall,
//   allLoading: loading.global,
//   // releasebidHallLoading: loading.effects['bidHall/releasebidHall'],
//   fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
//   fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
//   fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
//   supplierRecordLoading: loading.effects['bidHall/supplierRecord'],
//   fetchScoreDetailing: loading.effects['bidHall/fetchScoreDetails'],
//   saveLoading: loading.effects['bidHall/saveCalibrationManagNot'],
//   submitLoading: loading.effects['bidHall/submitCalibrationManagNot'],
//   querySupplierExchangeEditLoading: loading.effects['bidHall/querySupplierExchangeEdit'],
//   saveExchangeEditLoading: loading.effects['bidHall/saveExchangeEdit'],
//   organizationId: getCurrentOrganizationId(),
//   userId: getCurrentUserId(),
// }))
class TargetMange extends Component {
  constructor(props) {
    super(props);
    this.ItemLineTable = {};

    this.state = {
      expand: {}, // 展开数据
      activeKey: 'supplierLine',
      collapseKeys: [], // 折叠面板
      collapseActiveKey: [],
      editBidMembersFlag: false, // 招标小组modal
      distributeModalVisible: false, // 物品明细分配供应商
      loadingObj: {},
      isShow: {},
      processVisible: false, // 过程附件下载模态框
      scoreDetailsVisble: false, // 评分明细模态框
      scoreDetailsHeaderData: {}, // 评分明细头部数据
      supplierCompanyId: undefined, // 最后一次展开的行id
      bidLineItemId: undefined, // 物料维度最后一次展开的行id
      attachmentVisible: false, // 查看附件模态框显示
      exchangeEditModalVisible: false, // 汇率编辑modal
      exchangeEditContentModalVisible: false, // 汇率编辑引用汇率主数据modal
      itemLineQuotationDetailModalVisible: false, // 报价明细 modal
      dicisionAttachmentUuid: '', // 初始化附件uuid
      pricingModalVisible: false, // 物料创建/补充弹窗
      createItemFlag: null, // 创建物料标识
      bidQuotationHeaderDetailDTO: [], // 提交接口的参数体
      supplerCustFields: [], // 个性化供应商fields
      itemCustFields: [], // 个性化物料fields
      hasSupplierMinPriceField: null, // 供应商tab - 是否配置最低价, 默认为null, 查询个性化接口后设置为 false/true
      hasSupplierNewPriceField: null, // 供应商tab - 是否配置最新价, 默认为null, 查询个性化接口后设置为 false/true
      hasItemMinPriceField: null, // 物料tab - 是否配置最新价, 默认为null, 查询个性化接口后设置为 false/true
      hasItemNewPriceField: null, // 物料tab - 是否配置最新价, 默认为null, 查询个性化接口后设置为 false/true
      updatingLoadingMap: {}, // 异步更新loading  map
      ipCoincidenceRateVisible: false, // ip重合率弹框
      doubleUnitFlag: false, // 双精度标志
    };
  }

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

  async componentDidMount() {
    await this.fetchQueryUnitCustConfig();
    this.fetchbidHallUpdate();
  }

  @Bind()
  setPath(pathName) {
    let pathname = '';
    // eslint-disable-next-line no-template-curly-in-string
    pathname = pathName.replace('${bidId}', ':bidId');
    return pathname || pathName;
  }

  // 查询个性化单元配置
  async fetchQueryUnitCustConfig() {
    const { dispatch, organizationId, match } = this.props;
    const isApprovedPage =
      this.setPath(match.path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    const unitCode = isApprovedPage
      ? ['SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ', 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ']
      : ['SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM', 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER'];
    const custUnitConfig = await dispatch({
      type: 'bidHall/fetchQueryUnitCustConfig',
      payload: {
        organizationId,
        unitCode,
      },
    });
    if (custUnitConfig) {
      this.setState({
        supplerCustFields:
          custUnitConfig[
            isApprovedPage
              ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
              : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER'
          ].fields,
        itemCustFields:
          custUnitConfig[
            isApprovedPage
              ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
              : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM'
          ].fields,
      });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        aloneSupplierItemLine: {}, // 评标管理--标段信息
        header: {},
        itemLine: [],
        supplierData: [],
        aloneItemLine: {},
        bidMembersList: [],
        scoreDetailsData: [],
        itemContentChange: {},
        itemLineChange: false,
        itemDimensionHeaderData: [],
        exchangeEditSupplierList: [],
        supplierDimensionHeaderList: [],
      },
    });
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      bidHall: { aloneSupplierItemLine, aloneItemLine },
    } = this.props;
    const {
      bidHall: { aloneSupplierItemLine: preLine, aloneItemLine: preItemLine },
    } = preProps;
    if (aloneSupplierItemLine !== preLine) {
      return true;
    }
    if (aloneItemLine !== preItemLine) {
      return true;
    }
    return null;
  }

  componentDidUpdate(preProps, preState, snap) {
    const {
      bidHall: { aloneSupplierItemLine = {}, aloneItemLine = {} },
      form,
    } = this.props;
    const { supplierCompanyId, bidLineItemId } = this.state;
    const testData =
      aloneSupplierItemLine[`${supplierCompanyId}`] &&
      aloneSupplierItemLine[`${supplierCompanyId}`].list;
    const testItemData =
      aloneItemLine[`${bidLineItemId}`] && aloneItemLine[`${bidLineItemId}`].list;
    if (snap !== null) {
      if (!isEmpty(testData)) {
        const selectedAloneSupplierItemLine = testData.filter(
          // eslint-disable-next-line
          (val) => val.supplierCompanyId == supplierCompanyId
        );
        // 根据对应的supplierCompanyId的整包中标值，设置必填项
        if (form.getFieldValue(`value#${supplierCompanyId}`)) {
          selectedAloneSupplierItemLine.forEach(
            (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
          );
        }
      }
      if (!isEmpty(testItemData)) {
        const selectedAloneItemLine = testItemData.filter(
          // eslint-disable-next-line
          (val) => val.bidLineItemId == bidLineItemId
        );
        // 根据对应的supplierCompanyId的整包中标值，设置必填项
        if (form.getFieldValue(`value#${bidLineItemId}`)) {
          selectedAloneItemLine.forEach(
            (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 1 })
          );
        }
      }
    }
  }

  /**
   * 查询维护页面信息
   */
  @Bind()
  fetchbidHallUpdate() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchBidHeaderDetail',
      payload: {
        organizationId,
        bidHeaderId: params.bidId,
        path: this.setPath(path),
        customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.HEADER,SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO,',
      },
    }).then((res) => {
      if (res && res.dicisionAttachmentUuid) {
        this.setState({
          dicisionAttachmentUuid: res.dicisionAttachmentUuid,
        });
      }
      // 由于异步查询需要header中参数, 所以必须同步请求以下接口
      this.fetchItemLine();
      this.fetchItemDimensionHeader();
      this.fetchSupplierDimensionHeader();
    });
    // 查询配置中心, ip重合率
    dispatch({
      type: `bidHall/querySetting`,
      payload: {
        '011107': '011107', // ip校验
      },
    });
    this.queryDoubleUnit();
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
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchItemLine',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
      },
    }).then((res) => {
      this.initItemLineExpandKeys(res);
    });
  }

  /**
   * 物品维度头 - 查询
   */
  @Bind()
  fetchItemDimensionHeader(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidHall/fetchItemDimensionHeader',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    }).then((res) => {
      this.initItemLineExpandKeys(res);
    });
  }

  /**
   * 物品明细 - 页面初始化展开
   *
   * @param {*} res
   * @param {*} [result=[]]
   * @memberof Update
   */
  initItemLineExpandKeys(res, result = []) {
    const { dispatch } = this.props;

    const keys = this.updateItemLineExpandedKeys(res, result);
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemLineExpandedKeys: keys,
      },
    });
  }

  // 获取uuid
  @Bind()
  handleAttachment(uuid) {
    this.setState({
      dicisionAttachmentUuid: uuid,
    });
  }

  /**
   * 物品明细 - 更新展开数据的行keys
   *
   * @param {*} [res=[]]
   * @param {*} [keys=[]]
   * @returns keys
   * @memberof Update
   */
  updateItemLineExpandedKeys(res = [], keys = []) {
    if (!res) {
      return;
    }

    if (res instanceof Array) {
      res.forEach((item) => {
        keys.push(item.bidLineItemId);
        this.updateItemLineExpandedKeys(item.children, keys);
      });
    } else if (res instanceof Object) {
      if (!res.bidLineItemId) {
        return;
      }
      keys.push(res.bidLineItemId);
      this.updateItemLineExpandedKeys(res.children, keys);
    } else {
      return [];
    }

    return [...new Set(keys)];
  }

  /**
   * 编辑招标小组
   *
   * @memberof Update
   */
  @Bind()
  editBidMembers() {
    this.fetchMembers();
    this.setState({
      editBidMembersFlag: true,
    });
  }

  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
    });
  }

  /**
   * 获取招标小组
   *
   * @memberof Update
   */
  fetchMembers() {
    const {
      dispatch,
      organizationId,
      match: { params = {}, path },
    } = this.props;

    dispatch({
      type: 'bidHall/fetchBidMembers',
      payload: { organizationId, bidHeaderId: params.bidId, path: this.setPath(path) },
    });
  }

  @Bind()
  scoreDetails(record = {}) {
    const { supplierCompanyName, sectionName, evaluateSummaryId } = record;
    this.setState({
      scoreDetailsVisble: true,
      scoreDetailsHeaderData: {
        supplierCompanyName,
        sectionName,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchScoreDetails',
      payload: { evaluateSummaryId, organizationId },
    });
  }

  @Bind()
  scoreDetailsCancel() {
    this.setState({
      scoreDetailsVisble: false,
    });
  }

  /**
   * 获取物品维度
   *
   * @memberof search
   */
  fetchSupplierDimensionHeader(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params = {} },
    } = this.props;

    dispatch({
      type: 'bidHall/fetchSupplierDimensionHeader',
      payload: { organizationId, bidHeaderId: params.bidId, page },
    }).then((res) => {
      const { form } = this.props;
      if (Array.isArray(res) && res.length > 0) {
        res.forEach((item) => {
          if (item.suggestedFlag === 1) {
            form.setFieldsValue({ [`value#${item.supplierCompanyId}`]: 1 });
          }
        });
      }
      if (!res) {
        return;
      }

      if (!Array.isArray(res) || !res.length) {
        return;
      }

      const defaultCollapseOpenedId = res[0].supplierCompanyId || '';
      if (!defaultCollapseOpenedId) {
        throw new TypeError('supplierCompanyId cannot be empty!');
      }

      this.expandSupplier(defaultCollapseOpenedId);
      this.setState({
        collapseActiveKey: [defaultCollapseOpenedId.toString()],
      });
    });
  }

  /**
   * 物品明细-点击查看按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId } = this.props;

    if (!record) {
      return;
    }

    dispatch({
      type: 'bidHall/supplierRecord',
      payload: {
        organizationId,
        bidHeaderId: record.bidHeaderId,
        bidLineItemId: record.bidLineItemId,
      },
    });

    this.setState({ distributeModalVisible: true });
  }

  /**
   * 明细关闭查看供应商,
   * void
   * @memberof Update
   */
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });

    const { dispatch } = this.props;

    dispatch({
      type: 'bidHall/updateState',
      payload: {
        supplierData: [],
      },
    });
  }

  /**
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(businessAttachmentUuid, techAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: businessAttachmentUuid,
        techUuid: techAttachmentUuid,
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
   *阻止供应商头部查看附件冒泡
   */
  @Bind()
  rfxSupplierTag(e) {
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
   * 供应商列表头部 - 改变分页
   */
  @Bind()
  changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const supplierContentChangeValue = Object.values(this.props.bidHall.supplierContentChange).find(
      (n) => n === true
    );
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    // 检测供应商头部或内容数据发生改变时
    if (this.props.bidHall.supplierLineChange && supplierContentChangeValue === true) {
      Modal.confirm({
        title: intl.get(`ssrc.bidHall.model.bidHall.giveUpTip`).d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.bidHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          this.props.dispatch({
            type: 'bidHall/updateState',
            payload: {
              supplierLineChange: false,
            },
          });
          this.fetchSupplierDimensionHeader(changedPagination);
        },
      });
    } else {
      this.fetchSupplierDimensionHeader(changedPagination);
    }
  }

  /**
   * 改变tabs
   */
  // @Bind()
  // changeTabs(key) {
  //   this.setState({
  //     activeKey: key,
  //   });
  // }

  /**
   * 改变tabs
   */
  @Bind()
  changeTabs(key) {
    const {
      dispatch,
      match: { path } = {},
      bidHall: { allLineChange, itemContentChange, supplierContentChange },
    } = this.props;
    const itemContentChangeValues =
      this.setPath(path) !== '/pub/ssrc/bid-hall/calibration-managementnot/:bidId' &&
      Object.values(itemContentChange).find((n) => n === true);
    const supplierContentChangeValue =
      this.setPath(path) !== '/pub/ssrc/bid-hall/calibration-managementnot/:bidId' &&
      Object.values(supplierContentChange).find((n) => n === true);
    // 物料行key变化
    if (itemContentChangeValues === true || supplierContentChangeValue === true || allLineChange) {
      if (itemContentChangeValues === true) {
        // 物料行
        Modal.confirm({
          title: intl
            .get(`ssrc.bidHall.view.message.confirm.itemDetailsData`)
            .d('请保存物料行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get(`ssrc.bidHall.view.message.button.continueToJump`).d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'itemLine' });
          },
          onCancel: () => {
            this.props.form.resetFields();
            this.itemLineList.props.form.resetFields();
            this.fetchSupplierDimensionHeader();
            this.setState({
              activeKey: key,
              expand: {},
              isShow: {},
              collapseActiveKey: [],
            });
            // 清空当前tab页物料行数据
            dispatch({
              type: 'bidHall/updateState',
              payload: {
                aloneItemLine: {},
                itemContentChange: {},
                itemLineChange: false,
              },
            });
          },
        });
      }
      if (supplierContentChangeValue === true) {
        // 供应商行
        Modal.confirm({
          title: intl
            .get(`ssrc.bidHall.view.message.confirm.supplierLineData`)
            .d('请保存供应商行页面数据'),
          okText: intl.get('hzero.common.button.ok').d('确定'),
          cancelText: intl.get(`ssrc.bidHall.view.message.button.continueToJump`).d('继续跳转'),
          onOk: () => {
            this.setState({ activeKey: 'supplierLine' });
          },
          onCancel: () => {
            this.props.form.resetFields();
            this.supplierLineList.props.form.resetFields();
            this.fetchItemDimensionHeader();
            this.setState({
              activeKey: key,
              expand: {},
              isShow: {},
              collapseActiveKey: [],
            });
            // 清空当前tab页供应商行数据
            dispatch({
              type: 'bidHall/updateState',
              payload: {
                aloneSupplierItemLine: {},
                supplierLineChange: false,
                supplierContentChange: {},
              },
            });
          },
        });
      }
    } else {
      this.setState({
        activeKey: key,
        collapseActiveKey: [],
        expand: {},
        isShow: {},
      });
    }
  }

  /**
   * 设置整包推荐的值，为1
   */
  @Bind()
  setWholePackageFlag(supplierCompanyId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${supplierCompanyId}`]: 1 });
  }

  @Bind()
  setWholeItemPackageFlag(bidLineItemId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${bidLineItemId}`]: 1 });
  }

  /**
   * 设置整包推荐的值，为0
   */
  @Bind()
  setWholePackageFlagFalse(supplierCompanyId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${supplierCompanyId}`]: 0 });
  }

  @Bind()
  setWholeItemPackageFlagFalse(bidLineItemId) {
    const { form } = this.props;
    form.setFieldsValue({ [`value#${bidLineItemId}`]: 0 });
  }

  /**
   * 改变整包推荐，设置选用的值
   */
  @Bind()
  changeWholePackage(e, supplierCompanyId, obj) {
    const {
      bidHall: { aloneSupplierItemLine = {} },
    } = this.props;
    const testData =
      aloneSupplierItemLine[`${supplierCompanyId}`] &&
      aloneSupplierItemLine[`${supplierCompanyId}`].list;
    // supplierCompanyId
    // eslint-disable-next-line
    const newDataSource =
      testData && testData.filter((r) => r.supplierCompanyId === supplierCompanyId);
    if (!isEmpty(newDataSource)) {
      // 勾选了整包推荐，对应的供应商行数据，勾选为1，否则为0
      if (e) {
        newDataSource.forEach(
          (item) =>
            item.$form &&
            item.$form.setFieldsValue({
              suggestedFlag: 1,
              allottedQuantity: item.validQuotationQuantity,
            })
        );
        const { form } = this.props;
        form.setFieldsValue({ [`value#${supplierCompanyId}`]: 1 });
        this.switchWholePackage(obj, 'supplier', 1);
      } else {
        newDataSource.forEach(
          (item) =>
            item.$form && item.$form.setFieldsValue({ suggestedFlag: 0, allottedQuantity: null })
        );
        const { form } = this.props;
        form.setFieldsValue({ [`value#${supplierCompanyId}`]: 0 });
        this.switchWholePackage(obj, 'supplier', 0);
      }
    }
  }

  @Bind()
  changeItemWholePackage(e, bidLineItemId, obj) {
    const {
      bidHall: { aloneItemLine = {} },
    } = this.props;
    const testData = aloneItemLine[`${bidLineItemId}`] && aloneItemLine[`${bidLineItemId}`].list;
    // supplierCompanyId
    // eslint-disable-next-line
    const newDataSource = testData && testData.filter((r) => r.bidLineItemId === bidLineItemId);
    if (!isEmpty(newDataSource)) {
      // 勾选了整包推荐，对应的供应商行数据，勾选为1，否则为0
      if (e) {
        newDataSource.forEach(
          (item) =>
            item.$form &&
            item.$form.setFieldsValue({
              suggestedFlag: 1,
              allottedQuantity: item.validQuotationQuantity,
            })
        );
        const { form } = this.props;
        form.setFieldsValue({ [`value#${bidLineItemId}`]: 1 });
        this.switchWholePackage(obj, 'item', 1);
      } else {
        newDataSource.forEach(
          (item) =>
            item.$form && item.$form.setFieldsValue({ suggestedFlag: 0, allottedQuantity: null })
        );
        const { form } = this.props;
        form.setFieldsValue({ [`value#${bidLineItemId}`]: 0 });
        this.switchWholePackage(obj, 'item', 0);
      }
    }
  }

  // 整包中标
  @Bind()
  switchWholePackage(item, type, allSelectFlag) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const { expand, isShow } = this.state;
    let param;
    if (type === 'supplier') {
      param = {
        allSelectFlag,
        organizationId,
        bidHeaderId: params.bidId,
        quotationHeaderId: item.quotationHeaderId,
        objectVersionNumber: item.objectVersionNumber,
        supplierTenantId: item.supplierTenantId,
        allottedRatio: item.allottedRatio,
      };
    } else {
      param = {
        allSelectFlag,
        organizationId,
        bidHeaderId: params.bidId,
        bidLineItemId: item.bidLineItemId,
        objectVersionNumber: item.objectVersionNumber,
        supplierTenantId: item.supplierTenantId,
        allottedRatio: item.allottedRatio,
      };
    }
    dispatch({
      type: 'bidHall/wholePackage',
      payload: {
        ...param,
      },
    }).then((res) => {
      if (res) {
        if (type === 'supplier') {
          dispatch({
            type: 'bidHall/fetchAloneSupplierItemLine',
            payload: {
              page: {},
              organizationId,
              bidHeaderId: params.bidId,
              supplierCompanyId: item.supplierCompanyId,
              customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
            },
          });
          this.setState({
            expand: {
              ...expand,
              [item.supplierCompanyId]: !expand[item.supplierCompanyId],
            },
            isShow: {
              ...isShow,
              [item.supplierCompanyId]: true,
            },
            supplierCompanyId: item.supplierCompanyId,
          });

          dispatch({
            type: 'bidHall/fetchSupplierDimensionHeader',
            payload: { organizationId, bidHeaderId: params.bidId },
          }).then((result) => {
            const { form } = this.props;
            if (Array.isArray(res) && res.length > 0) {
              result.forEach((ele) => {
                if (ele.suggestedFlag === 1) {
                  form.setFieldsValue({ [`value#${ele.supplierCompanyId}`]: 1 });
                }
              });
            }
            if (!result) {
              return;
            }

            if (!Array.isArray(result) || !result.length) {
              return;
            }

            const defaultCollapseOpenedId = result[0].supplierCompanyId || '';
            if (!defaultCollapseOpenedId) {
              throw new TypeError('supplierCompanyId cannot be empty!');
            }

            if (item.supplierCompanyId === defaultCollapseOpenedId) {
              this.setState({
                expand: {
                  ...expand,
                  [defaultCollapseOpenedId]: true,
                },
              });
            }

            this.setState({
              collapseActiveKey: [defaultCollapseOpenedId.toString()],
            });
          });
        } else {
          dispatch({
            type: 'bidHall/fetchAloneItemLine',
            payload: {
              page: {},
              organizationId,
              bidHeaderId: params.bidId,
              bidLineItemId: item.bidLineItemId,
              customizeUnitCode: 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
            },
          });
          this.fetchItemDimensionHeader();
        }
      }
    });
  }

  /**
   * 供应商头部明细
   */
  @Bind()
  renderSupplierHeaderInfo(item) {
    const {
      form: { getFieldDecorator },
      match: { path } = {},
    } = this.props;
    const { expand, updatingLoadingMap } = this.state;
    const scoreName = intl.get(`ssrc.bidHall.model.bidHall.scoreName`).d('总分');
    const sumPrice = intl.get(`ssrc.bidHall.model.bidHall.sumPrice`).d('投标总价');
    const candidate = intl.get(`ssrc.bidHall.model.bidHall.candidate`).d('候选人');

    // 审批页面
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';

    return (
      <div
        className={classnames(styles.itemList, {
          'invalid-item': !!item.invalidFlag,
        })}
        onClick={() => this.expandSupplier(item.supplierCompanyId)}
      >
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                {item.invalidFlag ? (
                  <img src={require('@/assets/supplier-gray.svg')} alt="" />
                ) : (
                  <img src={require('@/assets/supplier.svg')} alt="" />
                )}
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={`${item.supplierCompanyNum}-${item.supplierCompanyName}`}
                  placement="topLeft"
                >
                  {item.supplierCompanyNum ? `${item.supplierCompanyNum}-` : null}
                  {item.supplierCompanyName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{
                    marginTop: '10px',
                    color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : 'rgba(41, 190, 206, 1)',
                  }}
                  type={!expand[item.supplierCompanyId] ? 'down' : 'up'}
                  // onClick={e => this.expandSupplier(e, item.supplierCompanyId)}
                />
              </span>
            </span>
            {item.sumScore ? (
              <span style={{ width: '100px', display: 'inline-block' }}>
                <Tag
                  style={{
                    background: item.invalidFlag ? null : 'rgba(241, 49, 49, 0.2)',
                    border: '0',
                    color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : '#F13131',
                  }}
                >
                  {scoreName}
                  {item.sumScore}
                </Tag>
              </span>
            ) : (
              <span style={{ width: '100px', display: 'inline-block' }} />
            )}
            {item.sumPrice ? (
              <span style={{ display: 'inline-block' }}>
                <Tag
                  style={{
                    background: item.invalidFlag ? null : 'rgba(255, 188, 0, 0.2)',
                    border: '0',
                    color: item.invalidFlag ? 'rgba(0, 0, 0, 0.25)' : '#FFBC00',
                    'vertical-align': 'middle',
                  }}
                >
                  <div
                    style={{
                      'max-width': '130px',
                      'white-space': 'nowrap',
                      overflow: 'hidden',
                      'text-overflow': 'ellipsis',
                    }}
                  >
                    <Tooltip title={`${sumPrice}${numberSeparatorRender(item.sumPrice)}`}>
                      {sumPrice}
                      {numberSeparatorRender(item.sumPrice)}
                    </Tooltip>
                  </div>
                </Tag>
              </span>
            ) : (
              <span style={{ width: '130px', display: 'inline-block' }} />
            )}
            <span
              style={{
                width: '80px',
                display: 'inline-block',
                marginRight: '8px',
                height: '22px',
              }}
            >
              {item.candidateFlag === 1 ? (
                <Popover placement="topLeft" content={item.candidateSuggestion}>
                  <span>
                    <img src={require('@/assets/candidate.svg')} alt="" />
                    <span className={styles.allottedRatio}>{candidate}</span>
                  </span>
                </Popover>
              ) : (
                ''
              )}
              {item.invalidFlag ? (
                <span style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                  {intl.get('ssrc.common.view.status.invalid').d('无效')}
                </span>
              ) : null}
            </span>
            {item.contactName ? (
              <Tooltip title={`${item.contactName}`} placement="topLeft">
                <span className={styles.contactNameStyle}>{item.contactName}</span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMobilephone ? (
              <Tooltip
                title={phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                placement="topLeft"
              >
                <span className={styles.contactMobilephoneStyle}>
                  {phoneRender(item.internationalTelCodeMeaning, item.contactMobilephone)}
                </span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.contactMail ? (
              <Tooltip title={`${item.contactMail}`} placement="topLeft">
                <span className={styles.contactMailStyle}>{item.contactMail}</span>
              </Tooltip>
            ) : (
              <span style={{ marginRight: '5px' }} />
            )}
            {item.validBusinessAttachmentUuid || item.validTechAttachmentUuid ? (
              <span onClick={(e) => this.rfxLineTag(e)}>
                <a
                  onClick={() =>
                    this.showUploadModal(
                      item.validBusinessAttachmentUuid,
                      item.validTechAttachmentUuid
                    )
                  }
                >
                  <span>{intl.get('hzero.common.upload.modal.title').d('附件')}</span>
                  <span style={{ marginLeft: '7px' }}>
                    <img src={require('@/assets/file.svg')} alt="" />
                  </span>
                </a>
              </span>
            ) : (
              <span style={{ width: '40px', display: 'inline-block' }} />
            )}
            {updatingLoadingMap[item.supplierCompanyId] && (
              <Button
                icon="sync"
                style={{ marginLeft: '10px' }}
                loading={updatingLoadingMap[item.supplierCompanyId]}
              >
                {intl.get(`ssrc.bidHall.view.message.button.updating`).d('更新中')}
              </Button>
            )}
            <span className={styles.itemListTag} onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                className={styles.wholePackageStyle}
                label={intl.get(`ssrc.bidHall.model.bidHall.wholeWinBid`).d('整包中标')}
              >
                {getFieldDecorator(`value#${item.supplierCompanyId}`, {
                  initialValue: item.suggestedFlag,
                })(
                  <Switch
                    disabled={!expand[item.supplierCompanyId] || item.invalidFlag || approvedPage}
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.changeWholePackage(e, item.supplierCompanyId, item)}
                  />
                )}
              </Form.Item>
            </span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 物品头部明细
   */
  @Bind()
  renderHeaderInfo(item) {
    const {
      form: { getFieldDecorator },
      match: { path } = {},
    } = this.props;
    const { expand, updatingLoadingMap, doubleUnitFlag } = this.state;
    const lineNo = intl.get(`ssrc.bidHall.model.bidHall.lineNo`).d('行号');
    const taxRate = intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率');
    const needQuantity = intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量');

    // 审批页面
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';

    return (
      <div className={styles.itemList} onClick={() => this.expandItemLine(item.bidLineItemId)}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                <img src={require('@/assets/supplier.svg')} alt="" />
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip title={`${item.itemCode}--${item.itemName}`} placement="topLeft">
                  {item.itemCode ? `${item.itemCode}-` : null}
                  {item.itemName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{ marginTop: '10px', color: 'rgba(41, 190, 206, 1)' }}
                  type={!expand[item.bidLineItemId] ? 'down' : 'up'}
                  // onClick={e => this.expandItemLine(e, item.bidLineItemId)}
                />
              </span>
            </span>
            {item.bidLineItemNum ? (
              <span style={{ width: '80px', display: 'inline-block', marginRight: '16px' }}>
                {lineNo}
                {item.bidLineItemNum}
              </span>
            ) : (
              <span style={{ width: '80px', display: 'inline-block', marginRight: '16px' }}>
                {''}
              </span>
            )}
            {item.taxRate ? (
              <span style={{ width: '100px', display: 'inline-block' }}>
                {taxRate}
                {item.taxRate}
                {'%'}
              </span>
            ) : (
              <span style={{ width: '100px', display: 'inline-block' }} />
            )}
            {item.bidQuantity ? (
              <span style={{ display: 'inline-block' }}>
                <Tag
                  style={{
                    background: 'rgba(6, 135, 255, 0.2)',
                    border: '0',
                    color: '#0687FF',
                    'vertical-align': 'middle',
                  }}
                >
                  <div
                    style={{
                      'max-width': '150px',
                      'white-space': 'nowrap',
                      overflow: 'hidden',
                      'text-overflow': 'ellipsis',
                    }}
                  >
                    <Tooltip
                      title={`${needQuantity}${numberSeparatorRender(
                        doubleUnitFlag ? item.secondaryQuantity : item.bidQuantity
                      )}${doubleUnitFlag ? item.secondaryUomName : item.uomName}`}
                    >
                      {' '}
                      {needQuantity}
                      {numberSeparatorRender(
                        doubleUnitFlag ? item.secondaryQuantity : item.bidQuantity
                      )}
                      {doubleUnitFlag ? item.secondaryUomName : item.uomName}
                    </Tooltip>
                  </div>
                </Tag>
              </span>
            ) : (
              <span style={{ width: '150px', display: 'inline-block' }} />
            )}
            {item.itemCategoryName ? (
              <span style={{ width: '130px', display: 'inline-block' }}>
                <Tag
                  style={{ background: 'rgba(255, 188, 0, 0.2)', border: '0', color: '#FFBC00' }}
                >
                  {item.itemCategoryName}
                </Tag>
              </span>
            ) : (
              <span style={{ width: '130px', display: 'inline-block' }} />
            )}
            {updatingLoadingMap[item.bidLineItemId] && (
              <Button
                icon="sync"
                className={styles.itemListTag}
                loading={updatingLoadingMap[item.bidLineItemId]}
              >
                {intl.get(`ssrc.bidHall.view.message.button.updating`).d('更新中')}
              </Button>
            )}
            <span className={styles.itemListTag} onClick={(e) => this.rfxLineTag(e)}>
              <Form.Item
                className={styles.wholePackageStyle}
                label={intl.get(`ssrc.bidHall.model.bidHall.wholeWinBid`).d('整包中标')}
              >
                {getFieldDecorator(`value#${item.bidLineItemId}`, {
                  initialValue: item.suggestedFlag,
                })(
                  <Switch
                    disabled={!expand[item.bidLineItemId] || approvedPage}
                    checkedValue={1}
                    unCheckedValue={0}
                    onChange={(e) => this.changeItemWholePackage(e, item.bidLineItemId, item)}
                  />
                )}
              </Form.Item>
            </span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   *展开时重新调用单独查询物品明细列表数据
   */
  expandItemLine = (key) => {
    const { match: { path } = {} } = this.props;
    const bidLineItemId = key;
    const { itemContentChange } = this.props.bidHall;
    const { expand, isShow } = this.state;
    const currentStatus = isShow[bidLineItemId];
    // 审批页面
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    if (!currentStatus) {
      const loadingObj = {
        [bidLineItemId]: { fetchAloneItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params },
        dispatch,
        organizationId,
      } = this.props;
      dispatch({
        type: 'bidHall/fetchAloneItemLine',
        payload: {
          page: {},
          organizationId,
          bidHeaderId: params.bidId,
          bidLineItemId,
          customizeUnitCode: approvedPage
            ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
            : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
        },
      }).then((res) => {
        this.setState({ loadingObj: { [bidLineItemId]: { fetchAloneItemLineLoading: false } } });
        if (res) {
          // 查询物料行数据后, 异步查个性化配置的字段
          this.judgeFieldExistAndQuery('minPrice', {}, res, 'item', bidLineItemId);
          this.judgeFieldExistAndQuery('newPrice', {}, res, 'item', bidLineItemId);
        }
      });
    }
    // 有值改变时,关闭时,改变的数据设置为false
    if (this.props.bidHall.itemContentChange[bidLineItemId]) {
      this.props.dispatch({
        type: 'bidHall/updateState',
        payload: {
          // itemLineChange: true,
          itemContentChange: {
            ...itemContentChange,
            [bidLineItemId]: false,
          },
        },
      });
    } else {
      this.props.dispatch({
        type: 'bidHall/updateState',
        payload: {
          itemContentChange: {
            ...itemContentChange,
            [bidLineItemId]: false,
          },
        },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [bidLineItemId]: !expand[bidLineItemId],
      },
      isShow: {
        ...isShow,
        [bidLineItemId]: true,
      },
      bidLineItemId,
    });
  };

  onchangeSupplier = (key) => {
    this.setState({ collapseActiveKey: key });
  };

  /**
   *展开时重新调用单独查询供应商明细列表数据
   */
  expandSupplier = (key) => {
    // debugger
    const supplierCompanyId = key;
    const { expand, isShow, activeKey = '' } = this.state;
    const currentStatus = isShow[supplierCompanyId];
    if (!currentStatus) {
      const loadingObj = {
        [supplierCompanyId]: { fetchAloneSupplierItemLineLoading: true },
      };
      this.setState({ loadingObj });
      const {
        match: { params, path },
        dispatch,
        organizationId,
      } = this.props;
      // 审批页面
      const approvedPage =
        this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
      dispatch({
        type: 'bidHall/fetchAloneSupplierItemLine',
        payload: {
          page: {},
          organizationId,
          bidHeaderId: params.bidId,
          supplierCompanyId,
          customizeUnitCode: approvedPage
            ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
            : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
        },
      }).then((res) => {
        this.setState({
          loadingObj: { [supplierCompanyId]: { fetchAloneSupplierItemLineLoading: false } },
        });
        if (res) {
          // 查询物料行数据后, 异步查个性化配置的字段
          this.judgeFieldExistAndQuery('minPrice', {}, res, 'supplier', supplierCompanyId);
          this.judgeFieldExistAndQuery('newPrice', {}, res, 'supplier', supplierCompanyId);
        }
      });
    }
    if (activeKey === 'supplierLine') {
      this.setState({
        expand: {
          ...expand,
          [supplierCompanyId]: !expand[supplierCompanyId],
        },
        isShow: {
          ...isShow,
          [supplierCompanyId]: true,
        },
        supplierCompanyId,
      });
    }
  };

  /**
   * 判断个性化列是否配置
   * @param {string} fieldName - 列名
   * @param {Object} page - 分页对象
   * @param {Array} res - 接口返回数据源
   * @param {string} tabType - supplier/item
   * @param {string} parentId - Panel标签上对应的父id
   */
  async judgeFieldExistAndQuery(fieldName, page, res, tabType, parentId) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const pascalFieldName = fieldName.replace(
      fieldName.charAt(0),
      fieldName.charAt(0).toUpperCase()
    ); // Pascal命名法
    const pascalTabType = tabType.replace(tabType.charAt(0), tabType.charAt(0).toUpperCase()); // Pascal命名法
    const {
      updatingLoadingMap,
      [`${tabType}CustFields`]: custFields,
      [`has${pascalTabType}${pascalFieldName}Field`]: hasField,
    } = this.state;
    let serviceCode;
    switch (fieldName) {
      case 'minPrice':
        serviceCode = 'SSRC_MIN_PRICE';
        break;
      case 'newPrice':
        serviceCode = 'SSRC_NEW_PRICE';
        break;
      default:
        break;
    }
    if (hasField === false) return; // 未配置个性化列
    if (hasField) {
      this.setState({
        updatingLoadingMap: {
          ...updatingLoadingMap,
          [parentId]: true,
        },
      });
      await dispatch({
        type: `bidHall/fetchQueryPriceInfo`,
        payload: {
          page,
          parentId,
          fieldName,
          organizationId,
          queryType: tabType,
          quotationDetail: {
            serviceCode,
            sourceFrom: 'BID',
            templateVersion: null,
            templateCode: null,
            tenantId: organizationId,
            findRecFlag: null,
            sourceHeaderId: params.bidId,
            priceQueryParamsVOS: res.map((r) => ({
              // itemId: r.itemId,
              // supplierCompanyId: r.supplierCompanyId,
              // invOrganizationId: r.invOrganizationId,
              // quotationLineId: r.quotationLineId,
              // ouId: r.ouId, // -------------------------by `/bid/quotation/detail` 接口
              quotationLineId: r.quotationLineId,
            })),
          },
        },
      });
      this.setState((prevState) => ({
        updatingLoadingMap: {
          // 不可直接引用头行定义的updatingLoadingMap, 因为拿不到最新值
          ...prevState.updatingLoadingMap,
          [parentId]: false,
        },
      }));
    } else {
      // 第一次进入为 `null`
      const index =
        isArray(custFields) &&
        custFields.findIndex((item) => item.fieldCode === fieldName && item.visible === 1);
      if (index > -1) {
        this.setState({
          updatingLoadingMap: {
            ...updatingLoadingMap,
            [parentId]: true,
          },
        });
        await dispatch({
          type: `bidHall/fetchQueryPriceInfo`,
          payload: {
            page,
            parentId,
            fieldName,
            organizationId,
            queryType: tabType,
            quotationDetail: {
              serviceCode,
              sourceFrom: 'BID',
              templateVersion: null,
              templateCode: null,
              tenantId: organizationId,
              findRecFlag: null,
              sourceHeaderId: params.bidId,
              priceQueryParamsVOS: res.map((r) => ({
                quotationLineId: r.quotationLineId,
              })),
            },
          },
        });
        this.setState((prevState) => ({
          updatingLoadingMap: {
            // 不可直接引用头行定义的updatingLoadingMap, 因为拿不到最新值
            ...prevState.updatingLoadingMap,
            [parentId]: false,
          },
          [`has${pascalTabType}${pascalFieldName}Field`]: true,
        }));
      } else {
        this.setState({
          [`has${pascalTabType}${pascalFieldName}Field`]: false,
        });
      }
    }
  }

  /**
   * 物料明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeItemLinePage(page, bidLineItemId) {
    // 判断当前table是否改变
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    // 审批页面
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    if (this.props.bidHall.itemContentChange[bidLineItemId]) {
      Modal.confirm({
        title: intl.get(`ssrc.bidHall.model.bidHall.giveUpTip`).d('切换页面前请先保存数据！'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.bidHall.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          dispatch({
            type: 'bidHall/fetchAloneItemLine',
            payload: {
              page,
              organizationId,
              bidHeaderId: params.bidId,
              bidLineItemId,
              customizeUnitCode: approvedPage
                ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
                : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
            },
          }).then((res) => {
            if (res) {
              // 查询物料行数据后, 异步查个性化配置的字段
              this.judgeFieldExistAndQuery('minPrice', page, res, 'item', bidLineItemId);
              this.judgeFieldExistAndQuery('newPrice', page, res, 'item', bidLineItemId);
            }
          });
        },
      });
    } else {
      dispatch({
        type: 'bidHall/fetchAloneItemLine',
        payload: {
          page,
          organizationId,
          bidHeaderId: params.bidId,
          bidLineItemId,
          customizeUnitCode: approvedPage
            ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
            : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
        },
      }).then((res) => {
        if (res) {
          // 查询物料行数据后, 异步查个性化配置的字段
          this.judgeFieldExistAndQuery('minPrice', page, res, 'item', bidLineItemId);
          this.judgeFieldExistAndQuery('newPrice', page, res, 'item', bidLineItemId);
        }
      });
    }
  }

  /**
   * 获得uuid参数,此方法被二开
   */
  getUuidParam() {
    const { dicisionAttachmentUuid } = this.state;
    return { dicisionAttachmentUuid };
  }

  /**
   * 定标管理保存
   */
  @Bind()
  @Debounce(500)
  handleSave() {
    const {
      form,
      dispatch,
      organizationId,
      match: { params, path },
      bidHall: { aloneItemLine = {}, aloneSupplierItemLine = {} },
    } = this.props;
    // 保存时判断当前tabkey的位置
    const { activeKey, isShow } = this.state;
    // 审批页面
    const uuidParam = this.getUuidParam();
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    const bidEvaluationRemark = form.getFieldValue('bidEvaluationRemark');
    form.validateFieldsAndScroll((err, formData) => {
      if (!err) {
        let paramsData;
        if (activeKey === 'itemLine') {
          paramsData =
            aloneItemLine &&
            Object.values(aloneItemLine).reduce(
              (prev, current) => prev.concat(getEditTableData(current.list)),
              []
            );
          if (Object.keys(isShow).length === 0) {
            dispatch({
              type: 'bidHall/saveCalibrationManagNot',
              payload: {
                ...formData,
                bidEvaluationRemark,
                ...uuidParam,
                bidQuotationHeaderDetailDTO: paramsData,
                organizationId,
                bidHeaderId: params.bidId,
                customizeUnitCode: approvedPage
                  ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
                  : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM,SSRC.BID_HALL_CHECK_PRICE.HEADER',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'bidHall/updateState',
                  payload: {
                    itemContentChange: {},
                    supplierContentChange: {},
                    itemLineChange: false,
                    supplierLineChange: false,
                    allLineChange: false,
                    aloneItemLine: {},
                  },
                });
                this.fetchbidHallUpdate();
                this.setState({ isShow: {}, expand: {}, collapseActiveKey: [] });
              }
            });
          } else {
            this.itemLineList.props.form.validateFields((error) => {
              if (isEmpty(error)) {
                dispatch({
                  type: 'bidHall/saveCalibrationManagNot',
                  payload: {
                    ...formData,
                    bidEvaluationRemark,
                    ...uuidParam,
                    bidQuotationHeaderDetailDTO: paramsData,
                    organizationId,
                    bidHeaderId: params.bidId,
                    customizeUnitCode: approvedPage
                      ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ'
                      : 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM,SSRC.BID_HALL_CHECK_PRICE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    dispatch({
                      type: 'bidHall/updateState',
                      payload: {
                        itemContentChange: {},
                        supplierContentChange: {},
                        itemLineChange: false,
                        supplierLineChange: false,
                        allLineChange: false,
                        aloneItemLine: {},
                      },
                    });
                    this.fetchbidHallUpdate();
                    this.setState({ isShow: {}, expand: {}, collapseActiveKey: [] });
                  }
                });
              }
            });
          }
        } else if (activeKey === 'supplierLine') {
          paramsData =
            aloneSupplierItemLine &&
            Object.values(aloneSupplierItemLine).reduce(
              (prev, current) => prev.concat(getEditTableData(current.list)),
              []
            );
          if (Object.keys(isShow).length === 0) {
            dispatch({
              type: 'bidHall/saveCalibrationManagNot',
              payload: {
                ...formData,
                bidEvaluationRemark,
                ...uuidParam,
                bidQuotationHeaderDetailDTO: paramsData,
                organizationId,
                bidHeaderId: params.bidId,
                customizeUnitCode: approvedPage
                  ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
                  : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.BID_HALL_CHECK_PRICE.HEADER',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                dispatch({
                  type: 'bidHall/updateState',
                  payload: {
                    aloneSupplierItemLine: {},
                    itemContentChange: {},
                    supplierContentChange: {},
                    itemLineChange: false,
                    supplierLineChange: false,
                    allLineChange: false,
                  },
                });
                this.fetchbidHallUpdate();
                this.setState({ isShow: {}, expand: {}, collapseActiveKey: [] });
              }
            });
          } else {
            this.supplierLineList.props.form.validateFields((error) => {
              if (isEmpty(error)) {
                dispatch({
                  type: 'bidHall/saveCalibrationManagNot',
                  payload: {
                    ...formData,
                    bidEvaluationRemark,
                    ...uuidParam,
                    bidQuotationHeaderDetailDTO: paramsData,
                    organizationId,
                    bidHeaderId: params.bidId,
                    customizeUnitCode: approvedPage
                      ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
                      : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.BID_HALL_CHECK_PRICE.HEADER',
                  },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    this.fetchbidHallUpdate();
                    dispatch({
                      type: 'bidHall/updateState',
                      payload: {
                        aloneSupplierItemLine: {},
                        itemContentChange: {},
                        supplierContentChange: {},
                        itemLineChange: false,
                        supplierLineChange: false,
                        allLineChange: false,
                      },
                    });

                    this.setState({ isShow: {}, expand: {}, collapseActiveKey: [] });
                  }
                });
              }
            });
          }
        }
      }
    });
  }

  /**
   * 定标管理提交
   */
  @Bind()
  @Debounce(500)
  handleSubmit() {
    const {
      form,
      bidHall: { aloneItemLine = {}, aloneSupplierItemLine = {} },
    } = this.props;
    form.validateFieldsAndScroll((err, formData) => {
      if (!err) {
        // 保存时判断当前tabkey的位置
        const { activeKey, isShow } = this.state;
        let paramsData;
        if (activeKey === 'itemLine') {
          paramsData =
            aloneItemLine &&
            Object.values(aloneItemLine).reduce(
              (prev, current) => prev.concat(getEditTableData(current.list)),
              []
            );
          const newList = paramsData.filter((item) => item.suggestedFlag); // 基于是否中标过滤数据
          if (Object.keys(isShow).length === 0) {
            this.submitBid(
              {
                formData,
                bidQuotationHeaderDetailDTO: paramsData,
              },
              () => {
                this.setState({ newList });
              }
            );
          } else {
            this.itemLineList.props.form.validateFields((error) => {
              if (isEmpty(error)) {
                this.submitBid(
                  {
                    formData,
                    bidQuotationHeaderDetailDTO: paramsData,
                  },
                  () => {
                    this.setState({ newList });
                  }
                );
              }
            });
          }
        } else if (activeKey === 'supplierLine') {
          paramsData =
            aloneSupplierItemLine &&
            Object.values(aloneSupplierItemLine).reduce(
              (prev, current) => prev.concat(getEditTableData(current.list)),
              []
            );
          if (Object.keys(isShow).length === 0) {
            this.submitBid({
              formData,
              bidQuotationHeaderDetailDTO: paramsData,
            });
          } else {
            this.supplierLineList.props.form.validateFields((error) => {
              if (isEmpty(error)) {
                this.submitBid({
                  formData,
                  bidQuotationHeaderDetailDTO: paramsData,
                });
              }
            });
          }
        }
      }
    });
  }

  submitBid(data = {}, callback = () => {}) {
    const {
      form,
      dispatch,
      organizationId,
      match: { params },
      bidHall: { header = {} },
    } = this.props;
    const { totalBudget = null, budgetControlRule = null } = header;
    const { formData = {}, bidQuotationHeaderDetailDTO = null } = data;
    const { dicisionAttachmentUuid = null, activeKey } = this.state;
    const bidEvaluationRemark = form.getFieldValue('bidEvaluationRemark');

    const { allLineAmount = null, selected = 0 } =
      this.validateDateSource(bidQuotationHeaderDetailDTO) || {};

    const submit = () => {
      dispatch({
        type: 'bidHall/submitCalibrationManagNot',
        payload: {
          ...formData,
          dicisionAttachmentUuid,
          bidQuotationHeaderDetailDTO,
          organizationId,
          bidHeaderId: params.bidId,
          bidEvaluationRemark,
          customizeUnitCode:
            activeKey === 'itemLine'
              ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM,SSRC.BID_HALL_CHECK_PRICE.HEADER'
              : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER,SSRC.BID_HALL_CHECK_PRICE.HEADER',
        },
      }).then((res) => {
        if (res) {
          callback();
          this.setState({ expand: {}, bidQuotationHeaderDetailDTO });
          this.handleAfterSubmit(res); // add 校验物料规则
        }
      });
    };

    const validateBeforeSubmit = () => {
      dispatch({
        type: 'bidHall/validateBeforeSubmit',
        payload: {
          dicisionAttachmentUuid,
          bidQuotationHeaderDetailDTO,
          organizationId,
          bidHeaderId: params.bidId,
        },
      }).then((res) => {
        if (!res) {
          return;
        }
        const {
          supplierStageAllowSource = null,
          supplierStageAllowBidForce = null, // 强管控  配置中心-供应商生命周期管理
          supplierStageAllowBidSoft = null, // 弱管控
        } = res;

        if (supplierStageAllowSource) {
          Modal.confirm({
            content: `${intl
              .get('ssrc.inquiryHall.view.msg.lifeCycleStateInvalidateBid')
              .d('中标供应商存在非合格供应商，请确认是否提交定标?')}`,
            onOk: () => submit(),
            onCancel: () => {},
          });
        } else if (supplierStageAllowBidForce) {
          Modal.warning({
            content: supplierStageAllowBidForce,
            onCancel: () => {},
          });
        } else if (supplierStageAllowBidSoft) {
          Modal.confirm({
            content: supplierStageAllowBidSoft,
            onOk: () => submit(),
            onCancel: () => {},
          });
        } else {
          submit();
        }
      });
    };

    if (!selected) {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.message.pleaseSelectedBidSubmit')
          .d('请选择要中标的行'),
      });
      return;
    }

    const MoreThanBudgetAmout = totalBudget < allLineAmount;
    if (budgetControlRule === 'STRONG_CONTROL' && MoreThanBudgetAmout) {
      Modal.warning({
        content: intl
          .get('ssrc.bidHall.view.notification.amountTooMuchSubmit')
          .d('定标总金额超过了预算总金额，无法提交'),
        onCancel: () => {},
      });
    } else if (budgetControlRule === 'WEAK_CONTROL' && MoreThanBudgetAmout) {
      Modal.confirm({
        content: intl
          .get('ssrc.bidHall.view.notification.sureSumbitAsTooMuchAmount')
          .d('定标总金额超过了预算总金额，是否确认提交？'),
        onOk: () => validateBeforeSubmit(),
        onCancel: () => {},
      });
    } else {
      validateBeforeSubmit();
    }
  }

  /**
   * 提交前校验行数据
   * */
  validateDateSource(data = []) {
    if (isEmpty(data)) {
      return {
        selected: 0,
      };
    }

    let inValidateLifeCycle = false;
    let allLineAmount = null;
    let selected = 0;

    data.forEach((item) => {
      const {
        stageId = null,
        stageCode = null,
        suggestedFlag = 0,
        validQuotationPrice = null,
        allottedQuantity = null,
      } = item || {};
      if (stageId && stageCode !== 'QUALIFIED') {
        inValidateLifeCycle = true;
      }
      if (suggestedFlag && (validQuotationPrice || allottedQuantity)) {
        const QUANTITY =
          allottedQuantity === null || allottedQuantity === undefined
            ? 0
            : Number(allottedQuantity);
        const UnitPrice =
          validQuotationPrice === null || validQuotationPrice === undefined
            ? 0
            : Number(validQuotationPrice);
        const AMOUNT = QUANTITY * UnitPrice;
        allLineAmount += AMOUNT;
      }
      if (suggestedFlag) {
        selected++;
      }
    });

    return {
      inValidateLifeCycle,
      allLineAmount,
      selected,
    };
  }

  /**
   * 定标_不分标段提交通用处理程序
   * */
  handleAfterSubmit(res = {}) {
    const { dispatch } = this.props;
    const { createItemFlag = null } = res;

    switch (createItemFlag) {
      case 0: // 不可以创建/补充
        this.setState({
          createItemFlag,
          pricingModalVisible: false,
        });
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/bid-hall/list`,
          })
        );
        break;
      case 1: // 可创建物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      case 2: // 可补充物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      case 3: // 必须补充物料编码
        this.setState({
          createItemFlag,
          pricingModalVisible: true,
        });
        break;
      default:
        this.setState({
          createItemFlag,
          pricingModalVisible: false,
        });
        break;
    }
  }

  /**
   * 路由跳转招标大厅
   * */
  @Bind()
  directionBidHall() {
    const { dispatch } = this.props;

    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/list`,
      })
    );
  }

  /**
   * 定标管理转交
   */
  @Bind()
  transferCalibration(record) {
    const {
      dispatch,
      match: { params },
    } = this.props;
    Modal.confirm({
      title: intl
        .get('ssrc.bidHall.model.bidHall.transferCalibrationMsg', {
          name: record.realName,
        })
        .d(`是否将定标权限转交给${record.realName}?`),
      onOk: () => {
        dispatch({
          type: 'bidHall/transferCalibration',
          payload: {
            bidHeaderId: params.bidId,
            memberUserId: record.id,
            memberUserName: record.realName,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/bid-hall/list`,
              })
            );
            this.setState({ expand: {} });
          }
        });
      },
    });
  }

  /**
   * 汇率编辑/查询供应商信息
   *
   * @param {*} [page={}]
   * @memberof CheckPrice
   */
  querySupplierExchangeEdit(page = {}) {
    const {
      organizationId,
      dispatch,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidHall/querySupplierExchangeEdit',
      payload: {
        ...page,
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
      },
    });
  }

  /**
   * 汇率编辑
   *
   * @memberof CheckPrice
   */
  @Bind()
  exchangeEdit(page = {}) {
    this.querySupplierExchangeEdit(page);
    this.setState({
      exchangeEditModalVisible: true,
    });
  }

  /**
   * 汇率编辑 取消
   *
   * @memberof CheckPrice
   */
  @Bind()
  cancelExchangeEdit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        exchangeEditSupplierList: [],
      },
    });

    this.setState({
      exchangeEditModalVisible: false,
    });
  }

  /**
   * 汇率编辑 保存
   *
   * @memberof CheckPrice
   */
  @Bind()
  @Debounce(500)
  saveExchangeEdit() {
    const {
      dispatch,
      organizationId,
      bidHall: { exchangeEditSupplierList = [] },
    } = this.props;

    const newParams = getEditTableData(exchangeEditSupplierList, []);

    if (isEmpty(newParams)) {
      return;
    }

    dispatch({
      type: 'bidHall/saveExchangeEdit',
      payload: {
        organizationId,
        newParams,
      },
    }).then((res) => {
      if (!res) {
        return;
      }
      notification.success();
      this.cancelExchangeEdit();
      this.afterSaveExchangeEdit();
    });
  }

  // 汇率编辑保存后更新
  afterSaveExchangeEdit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        itemContentChange: {},
        supplierContentChange: {},
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
      },
    });
    this.fetchbidHallUpdate();
    this.setState({ isShow: {}, expand: {}, collapseActiveKey: [] });
  }

  /**
   * 引用汇率主数据
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainData() {
    this.setState({
      exchangeEditContentModalVisible: true,
    });
  }

  /**
   * 引用汇率主数据弹窗确定
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainDataOk() {
    const {
      bidHall: { exchangeEditSupplierList = [] },
    } = this.props;
    const {
      props: {
        form: { validateFields },
      },
    } = this.exchangeRate;

    validateFields((err, values = {}) => {
      if (err || isEmpty(exchangeEditSupplierList)) {
        return;
      }

      const rateDate = values.rateDate ? values.rateDate.format(DEFAULT_DATE_FORMAT) : null;
      this.querySupplierExchangeEdit({
        rateTypeCode: values.rateTypeCode,
        rateDate,
      });

      this.quoteExchangeMainDataCancel();
    });
  }

  /**
   * 引用汇率主数据
   *
   * @memberof CheckPrice
   */
  @Bind()
  quoteExchangeMainDataCancel() {
    this.setState({
      exchangeEditContentModalVisible: false,
    });
  }

  /**
   * 供应商明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeSupplierLinePage(page, supplierCompanyId) {
    // 判断当前table是否改变
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    // 审批页面
    const approvedPage =
      this.setPath(path) === '/pub/ssrc/bid-hall/calibration-managementnot/:bidId';
    dispatch({
      type: 'bidHall/fetchAloneSupplierItemLine',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
        supplierCompanyId,
        customizeUnitCode: approvedPage
          ? 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ'
          : 'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
      },
    }).then((res) => {
      if (res) {
        this.judgeFieldExistAndQuery('minPrice', page, res, 'supplier', supplierCompanyId);
        this.judgeFieldExistAndQuery('newPrice', page, res, 'supplier', supplierCompanyId);
      }
    });
  }

  /**
   * 隐藏中心弹窗
   */
  @Bind()
  handleHideModal() {
    this.setState({ pricingModalVisible: false });
  }

  @Bind()
  onCancel() {
    this.setState({ processVisible: false });
  }

  @Bind()
  openBidProcessAttachmentModal() {
    this.setState({ processVisible: true });
  }

  @Bind()
  downloadAll() {
    const {
      match: { params },
      organizationId,
    } = this.props;
    const bidHeaderId = params.bidId;
    const api = `${SRM_SSRC}/v1/${organizationId}/bid/download/attachments/${bidHeaderId}`;
    downloadFile({ requestUrl: api });
  }

  /*
   * IP重合率弹框-打开
   */
  @Bind()
  openIPCoincidenceRateModal() {
    const {
      dispatch,
      match: { params },
    } = this.props;
    this.setState({
      ipCoincidenceRateVisible: true,
    });
    dispatch({
      type: 'bidHall/fetchBidIPCoincidenceRate',
      payload: {
        bidHeaderId: params.bidId,
      },
    });
  }

  /**
   * IP重合率弹框- 关闭
   */
  @Bind()
  confirmIpCoincidenceRate() {
    this.setState({
      ipCoincidenceRateVisible: false,
    });
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        ipCoincidenceRate: [],
      },
    });
  }

  @Bind()
  getHeader() {
    const {
      match,
      allLoading,
      organizationId,
      bidHall: { header = {} },
    } = this.props;
    const { dicisionAttachmentUuid } = this.state;

    // 附件组件
    const uploadModalProps = {
      tenantId: organizationId,
      filePreview: true,
      btnProps: {
        icon: 'paper-clip',
      },
      btnText: intl.get(`ssrc.bidHall.view.message.title.attachment`).d('上传附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      attachmentUUID:
        isUndefined(header.dicisionAttachmentUuid) || isNull(header.dicisionAttachmentUuid)
          ? dicisionAttachmentUuid
          : header.dicisionAttachmentUuid,
      showFilesNumber: false,
      afterOpenUploadModal: this.handleAttachment,
      ...(ChunkUploadProps || {}),
      fileSize: FILE_SIZE,
    };

    return this.setPath(match.path) !== '/pub/ssrc/bid-hall/calibration-managementnot/:bidId' ? (
      <Header
        backPath="/ssrc/bid-hall/list"
        title={intl.get(`ssrc.bidHall.view.message.title.CalibrationManagement`).d('定标管理')}
      >
        <Button icon="rocket" type="primary" onClick={this.handleSubmit} loading={allLoading}>
          {intl.get('hzero.common.button.submit').d('提交')}
        </Button>
        <Button icon="save" onClick={this.handleSave} loading={allLoading}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button icon="download" onClick={this.openBidProcessAttachmentModal}>
          {intl.get('hzero.common.button.open').d('过程附件下载')}
        </Button>
        <UploadModal {...uploadModalProps} />

        <Lov
          isButton
          type="default"
          onOk={this.transferCalibration}
          queryParams={{
            organizationId,
          }}
          code="HIAM.TENANT.USER"
        >
          {intl.get(`ssrc.bidHall.view.button.transferCalibration`).d('转交')}
        </Lov>
        {header.multiCurrencyFlag === 1 && header.expertScoreType === 'NONE' ? (
          <Button icon="edit" onClick={() => this.exchangeEdit()}>
            {intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑')}
          </Button>
        ) : null}
      </Header>
    ) : (
      ''
    );
  }

  render() {
    const {
      form,
      match,
      dispatch,
      organizationId,
      fetchScoreDetailing,
      fetchItemLineLoading,
      supplierRecordLoading,
      fetchBidMembersLoading,
      fetchbidHallUpdateLoading,
      querySupplierExchangeEditLoading,
      saveExchangeEditLoading,
      fetchIPCoincidenceRateLoading,
      match: { params = {} },
      bidHall: {
        header = {},
        itemLine = [],
        supplierData = [],
        bidMembersList = [],
        scoreDetailsData = [],
        itemDimensionHeaderData = [],
        aloneItemLine = {},
        aloneSupplierItemLine = {},
        supplierDimensionHeaderList = [],
        // supplierLineQuotationDetail = [],
        // supplierDimensionHeaderPagination = {},
        code: { sourceMethods = [], quotationTypes = [], sourceStages = [] },
        exchangeEditSupplierList = [],
        settings = {},
        ipCoincidenceRate = [],
      },
      itemContentChange,
      supplierContentChange,
      customizeTable,
      customizeForm,
    } = this.props;
    const {
      activeKey,
      collapseKeys,
      editBidMembersFlag,
      distributeModalVisible,
      loadingObj,
      scoreDetailsVisble,
      scoreDetailsHeaderData,
      attachmentVisible,
      AttachmentsProps,
      collapseActiveKey = [],
      exchangeEditModalVisible = false,
      exchangeEditContentModalVisible = false,
      dicisionAttachmentUuid,
      pricingModalVisible = false,
      createItemFlag = null,
      newList = [],
      bidQuotationHeaderDetailDTO = [],
      processVisible = false,
      ipCoincidenceRateVisible,
      doubleUnitFlag,
    } = this.state;

    // 基本信息props
    const infoProps = {
      header,
      organizationId,
      form,
      match,
      sourceMethods,
      quotationTypes,
      sourceStages,
      customizeForm,
      setPath: this.setPath,
      editBidMembers: this.editBidMembers,
    };

    // other props
    const otherProps = {
      header,
      organizationId,
      form,
      customizeForm,
    };

    // 物品明细
    const ItemLineTableProps = {
      match,
      dispatch,
      organizationId,
      supplierRecordLoading,
      subjectMatterRule: header.subjectMatterRule,
      loading: fetchItemLineLoading,
      dataSource: itemLine,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
      customizeTable,
      doubleUnitFlag,
    };

    // bid member props
    const bidMemberProps = {
      form,
      header,
      organizationId,
      bidMembersList,
      editBidMembersFlag,
      fetchBidMembersLoading,
      onMembersCancel: this.handleMembersCancel,
    };

    // 评分明细
    const scoreDetailsProps = {
      scoreDetailsVisble,
      organizationId,
      scoreDetailsData,
      scoreDetailsHeaderData,
      fetchScoreDetailing,
      hideModal: this.scoreDetailsCancel,
    };

    // 物品维度
    const itemDimensionProps = {
      form,
      match,
      header,
      loadingObj,
      dispatch,
      customizeTable,
      organizationId,
      itemContentChange,
      dataSource: aloneItemLine,
      setPath: this.setPath,
      headerList: itemDimensionHeaderData,
      onSearch: this.changeItemLinePage,
      onSetWholePackageFlag: this.setWholeItemPackageFlag,
      onSetWholePackageFlagFalse: this.setWholeItemPackageFlagFalse,
      onScoreDetails: this.scoreDetails,
      onRef: (node) => {
        this.itemLineList = node;
      },
    };

    // 供应商
    const SupplierLineTableProps = {
      dataSource: aloneSupplierItemLine,
      dispatch,
      organizationId,
      supplierContentChange,
      match,
      header,
      customizeTable,
      onSearch: this.changeSupplierLinePage,
      onSetWholePackageFlag: this.setWholePackageFlag,
      onSetWholePackageFlagFalse: this.setWholePackageFlagFalse,
      loadingObj,
      setPath: this.setPath,
      onRef: (node) => {
        this.supplierLineList = node;
      },
      doubleUnitFlag,
    };

    // 物品行报价详情props
    // const QuotationDetailModalProps = {
    //   organizationId: getCurrentOrganizationId(),
    //   itemLineQuotationDetail: supplierLineQuotationDetail,
    //   cancelItemLineQutationDetail: this.cancelItemLineQutationDetail,
    //   sureItemLineQutationDetail: this.sureItemLineQutationDetail,
    //   itemLineQuotationDetailModalVisible,
    //   isAllQuotation: 1,
    // };

    // exchange edit props
    const ExchangeEditProps = {
      exchangeEditModalVisible,
      cancelExchangeEdit: this.cancelExchangeEdit,
      quoteExchangeMainData: this.quoteExchangeMainData,
      saveExchangeEdit: this.saveExchangeEdit,
      querySupplierExchangeEditLoading,
      exchangeEditSupplierList,
      saveExchangeEditLoading,
      querySupplierExchangeEdit: this.querySupplierExchangeEdit,
    };

    // 汇率编辑-引用汇率主数据弹窗
    const ExchangeQuoteProps = {
      form,
      organizationId,
      exchangeEditContentModalVisible,
      quoteExchangeMainDataOk: this.quoteExchangeMainDataOk,
      quoteExchangeMainDataCancel: this.quoteExchangeMainDataCancel,
      onRef: (node) => {
        this.exchangeRate = node;
      },
    };
    const DownloadAttachmentsProps = {
      bidHeaderId: params.bidId,
      processVisible,
      downloadAll: this.downloadAll,
      onCancel: this.onCancel,
      organizationId,
    };

    // 核价中心弹窗model props
    const PricingCenterModalProp = {
      header,
      createItemFlag,
      newList,
      activeKey,
      dicisionAttachmentUuid,
      bidQuotationHeaderDetailDTO,
      bidHeaderId: params.bidId,
      visible: pricingModalVisible,
      onCancel: this.handleHideModal,
      itemLineListNode: this.itemLineList,
      supplierLineListNode: this.supplierLineList,
      title:
        createItemFlag === 1
          ? intl.get('ssrc.bidHall.view.modalTitle.createMaterial').d('创建物料')
          : intl.get('ssrc.bidHall.view.modalTitle.updateMaterial').d('补充物料'),
    };

    const ipCoincidenceRateProps = {
      visible: ipCoincidenceRateVisible,
      sourceKey: header.secondarySourceCategory === 'NEW_BID' ? 'BID' : 'INQUIRY',
      dataSource: ipCoincidenceRate,
      loading: fetchIPCoincidenceRateLoading,
      onConfirmIpCoincidenceRate: this.confirmIpCoincidenceRate,
    };

    return (
      <React.Fragment>
        {this.getHeader()}

        <Content className={styles.contentInfo}>
          <Spin
            spinning={fetchbidHallUpdateLoading}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse className="form-collapse" onChange={this.onCollapseChange}>
              <Panel
                showArrow={false}
                header={
                  <>
                    <h3>
                      {header.bidNum}-{header.bidTitle}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </>
                }
                key="baseInfos"
                forceRender
              >
                <Tabs defaultActiveKey="baseInfos" animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.tab.baseInfos`).d('基本信息')}
                    key="baseInfos"
                    forceRender
                  >
                    <BidInfoForm {...infoProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.tab.otherInfos`).d('其他信息')}
                    key="otherInfos"
                    forceRender
                  >
                    <BidOtherForm {...otherProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidHall.view.message.tab.itemDetails`).d('物品明细')}
                    key="itemDetails"
                    forceRender
                  >
                    <ItemLineTable {...ItemLineTableProps} />
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
            </Collapse>
          </Spin>
          <Tabs
            defaultActiveKey="supplierLine"
            activeKey={activeKey}
            onChange={this.changeTabs}
            animated={false}
            className={styles.tabStyle}
            tabBarExtraContent={
              +settings['011107']?.settingValue && activeKey === 'supplierLine' ? (
                <a onClick={this.openIPCoincidenceRateModal}>
                  {intl.get('ssrc.bidHall.view.button.IPCoincidenceRate').d('IP重合率')}
                </a>
              ) : (
                ''
              )
            }
          >
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.message.tab.supplierDimension`).d('供应商维度')}
              key="supplierLine"
            >
              <Spin spinning={fetchbidHallUpdateLoading}>
                <Collapse
                  bordered={false}
                  onChange={this.onchangeSupplier}
                  activeKey={collapseActiveKey}
                >
                  {supplierDimensionHeaderList &&
                    supplierDimensionHeaderList.map((item) => (
                      <Panel
                        header={this.renderSupplierHeaderInfo(item)}
                        key={item.supplierCompanyId}
                        className={styles['header-info']}
                        showArrow={false}
                      >
                        <SupplierLineTable
                          {...SupplierLineTableProps}
                          itemHeaderData={item}
                          supplierCompanyId={item.supplierCompanyId}
                        />
                      </Panel>
                    ))}
                </Collapse>
              </Spin>
              {/* <Pagination
                className={styles.pagination}
                {...supplierDimensionHeaderPagination}
                onChange={(page, pageSize) => this.changeSupplierLinePagination(page, pageSize)}
                onShowSizeChange={(current, size) =>
                  this.changeSupplierLinePagination(current, size)
                }
              /> */}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.message.tab.itemDimension`).d('物品维度')}
              key="itemLine"
            >
              <Spin spinning={fetchbidHallUpdateLoading}>
                <Collapse
                  bordered={false}
                  onChange={this.onchangeSupplier}
                  activeKey={collapseActiveKey}
                >
                  {itemDimensionHeaderData &&
                    itemDimensionHeaderData.map((item) => (
                      <Panel
                        header={this.renderHeaderInfo(item)}
                        key={item.bidLineItemId}
                        className={styles['header-info']}
                        showArrow={false}
                      >
                        <ItemDimension {...itemDimensionProps} bidLineItemId={item.bidLineItemId} />
                      </Panel>
                    ))}
                </Collapse>
              </Spin>
            </Tabs.TabPane>
          </Tabs>
        </Content>
        <ScoreDetails {...scoreDetailsProps} />
        <BidMemberForm {...bidMemberProps} />
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        {pricingModalVisible && <PricingModal {...PricingCenterModalProp} />}
        {/** 汇率编辑modal */}
        {exchangeEditModalVisible && <ExchangeEditModal {...ExchangeEditProps} />}
        {/** 引用汇率编辑modal */}
        {exchangeEditContentModalVisible && <QuoteExchangeMainDateModal {...ExchangeQuoteProps} />}
        {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        {ipCoincidenceRateVisible && <IPCoincidenceRate {...ipCoincidenceRateProps} />}
      </React.Fragment>
    );
  }
}

const hocTargetMange = (Comp) => {
  return connect(({ bidHall, loading, user }) => ({
    user,
    bidHall,
    allLoading: loading.global,
    // releasebidHallLoading: loading.effects['bidHall/releasebidHall'],
    fetchbidHallUpdateLoading: loading.effects['bidHall/fetchBidHeaderDetail'],
    fetchBidMembersLoading: loading.effects['bidHall/fetchBidMembers'],
    fetchItemLineLoading: loading.effects['bidHall/fetchItemLine'],
    supplierRecordLoading: loading.effects['bidHall/supplierRecord'],
    fetchScoreDetailing: loading.effects['bidHall/fetchScoreDetails'],
    saveLoading: loading.effects['bidHall/saveCalibrationManagNot'],
    submitLoading: loading.effects['bidHall/submitCalibrationManagNot'],
    querySupplierExchangeEditLoading: loading.effects['bidHall/querySupplierExchangeEdit'],
    saveExchangeEditLoading: loading.effects['bidHall/saveExchangeEdit'],
    fetchIPCoincidenceRateLoading: loading.effects['bidHall/fetchBidIPCoincidenceRate'],
    organizationId: getCurrentOrganizationId(),
    userId: getCurrentUserId(),
  }))(
    formatterCollections({ code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'] })(
      Form.create({ fieldNameProp: null })(
        withCustomize({
          unitCode: [
            'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM',
            'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
            'SSRC.BID_HALL_CHECK_PRICE.TAB_SUPPLIER_READ',
            'SSRC.BID_HALL_CHECK_PRICE.TAB_ITEM_READ',
            'SSRC.BID_HALL_CHECK_PRICE.HEADER',
            'SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO',
            'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
          ],
        })(Comp)
      )
    )
  );
};
export default hocTargetMange(TargetMange);
export { TargetMange, hocTargetMange };
