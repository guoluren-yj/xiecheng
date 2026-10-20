/**
 * BidEventQuery - 招标事件查询详细界面
 * @date: 2019-7-11
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Tabs, Collapse, Spin, Icon, Row, Col, Tag, Modal, Tooltip, Table } from 'hzero-ui';
import { map, difference, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import querystring from 'querystring';

import formatterCollections from 'utils/intl/formatterCollections';
import { numberRender } from 'utils/renderer';
import Upload from 'components/Upload';
import Checkbox from 'components/Checkbox';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import ItemNoneDetailsList from './ItemNoneDetailsList';
import ItemPackLineTable from './ItemPackLineTable';
import ItemLineTable from './ItemLineTable';
import ProfessionalTable from '../../components/Detail/ProfessionalTable';
import ScoringElementsTable from '../../components/Detail/ScoringElementsTable';
import SupplierLineTable from '../../components/Detail/SupplierLineTable';
import ScoringElementModal from '../../components/Detail/ScoringElementModal';
import Attachment from '../../components/Attachment';
import { BUCKET_NAME } from '@/routes/components/utils/constant';
import styles from './index.less';

const { Panel } = Collapse;

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidEventQuery', 'ssrc.bidHall', 'ssrc.common'] })
@connect(({ bidEventQuery, loading, user }) => ({
  user,
  bidEventQuery,
  fetchBasicInfoLoading: loading.effects['bidEventQuery/fetchBasicInfoDetail'], // 基本信息 + 其他信息 + 资格预审
  fetchExpertsInfoLoading: loading.effects['bidEventQuery/fetchExpertsInfo'], // 专家
  fetchScorElementsLoading: loading.effects['bidEventQuery/fetchScorElementsData'], // 评分要素
  fetchEvaluateIndicAssignLoading: loading.effects['bidEventQuery/fetchEvaluateIndicAssign'], // 评分要素-查看专家分配
  fetchSupplierListLoading: loading.effects['bidEventQuery/fetchSupplierListData'], // 供应商列表
  fetchItemDetailLoading: loading.effects['bidEventQuery/fetchItemLine'], // 物品明细
  supplierRecordLoading: loading.effects['bidEventQuery/supplierRecord'], // 物品明细行-查看供应商
  fetchLineNoneDetailLoading: loading.effects['bidEventQuery/fetchLineNoneDetail'], // 行信息-不分标段
  fetchLinePackDetailLoading: loading.effects['bidEventQuery/fetchLinePackDetail'], // 行信息-分标段
  fetchAloneItemLineLoading: loading.effects['bidEventQuery/fetchAloneItemLine'], // 行信息-物料行单独查询
  fetchBidMembersLoading: loading.effects['bidEventQuery/fetchBidMembers'], // 招标小组数据查询
  queryCalibrationLoading: loading.effects['bidEventQuery/fetchCalibrationQuotation'], // 供应商行点击查询物料行
  fetchScoringElementLoading: loading.effects['bidEventQuery/fetchCalibrationQuotation'], // 评分细项查看
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapseKeys: ['baseInfos'], // 折叠面板
      distributeModalVisible: false, // 物品明细分配供应商
      evaluateAssignModalVisible: false, // 评分要素分配专家modal
      expand: {}, // 展开数据
      loadingObj: {}, // 展开时重新调用单独查询投标物料行列表数据loading
      editBidMembersFlag: false, // 招标小组
      attachmentVisible: false, // 附件组件显示标识
    };
  }

  componentDidMount() {
    this.fetchbidEventQueryDetail();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidEventQuery/updateState',
      payload: {
        header: {}, // 招标事件查询明细页面头
        scoringNoneExpert: [], // 专家不区分数据
        scoringBusinessExpert: [], // 专家商务组数据
        scoringTechnologyExpert: [], // 专家技术组数据
        scoringNoneTempelate: [], // 评分要素不区分数据
        scoringBusinessTempelate: [], // 评分要素商务组数据
        scoringTechnologyTempelate: [], // 评分要素技术组数据
        supplierLine: [], // 供应商列表数据
        supplierLinePagination: {}, // 供应商列表数据分页
        itemLine: [], // 物品明细数据
        itemLinePagination: {},
        LinePackList: [], // 行信息-分标段数据
        LinePackListPagination: {}, // 行信息-分标段分页
        LineNoneList: [], // 行信息-不分标段数据
        LineNoneListPagination: {}, // 行信息-不分标段分页
        aloneItemLine: {}, // 招标事件查询：根据物料头id获取物料明细列表
        itemLineChange: false, // 物料行是否发生改变
        itemContentChange: {}, // 物料行table是否发生改变
        scoringElementVisible: false, // 招标评分细项modal
      },
    });
  }

  /**
   * 招标事件查询页面信息
   */
  @Bind()
  fetchbidEventQueryDetail() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
      location: { search },
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    dispatch({
      type: 'bidEventQuery/fetchBasicInfoDetail',
      payload: { organizationId, bidHeaderId: params.bidId, path },
    }).then((res = {}) => {
      const { expertScoreType = '' } = res;
      if (expertScoreType && expertScoreType === 'ONLINE') {
        this.fetchExpert(); // 专家
        this.fetchScoring(); // 评分要素
      }
    });
    this.fetchSupplier(); // 供应商列表
    this.fetchItemLine(); // 物品明细
    if (source === 'PACK') {
      this.fetchItemPackLine(); // 行信息-分标段
    } else {
      this.fetchItemNoneLine(); // 行信息-不分标段
    }

    const lovCodes = {
      quotationTypes: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethods: 'SSRC.SOURCE_METHOD', // 寻源方式
      subjectMatterRules: 'SSRC.SUBJECT_MATTER_RULE', // 标的规则
      reviewMethods: 'SSRC.REVIEW_METHOD', // 审查方式
      bidRoles: 'SSRC.BID_MEMBER_ROLE', // 招标角色
      sourceStages: 'SSRC.SOURCE_STAGE', // 招标阶段
      indicateTypes: 'SSRC.INDICATE_TYPE', // 要素类型
    };
    dispatch({
      type: 'bidEventQuery/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 获取供应商
   *
   * @memberof Query
   */
  fetchSupplier(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchSupplierListData',
      payload: { page, organizationId, bidHeaderId: params.bidId },
    });
  }

  /**
   * 获取物品明细
   *
   * @memberof Query
   */
  fetchItemLine(page = {}) {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchItemLine',
      payload: { page, organizationId, bidHeaderId: params.bidId, path },
    });
  }

  /**
   * 获取专家数据
   *
   * @memberof Detail
   */
  fetchExpert() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchExpertsInfo',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        expertStatus: 'SUBMITTED',
      },
    });
  }

  /**
   * 获取招标事件查询评分要素数据
   *
   * @memberof Query
   */
  fetchScoring() {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchScorElementsData',
      payload: {
        organizationId,
        sourceHeaderId: params.bidId,
        sourceFrom: 'BID',
        indicStatus: 'SUBMITTED',
      },
    });
  }

  /**
   * 行信息不分标段 - 查询
   */
  @Bind()
  fetchItemNoneLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchLineNoneDetail',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
  }

  /**
   * 行信息分标段 - 查询
   */
  @Bind()
  fetchItemPackLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchLinePackDetail',
      payload: {
        page,
        organizationId,
        bidHeaderId: params.bidId,
      },
    });
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

  /**
   * 物品明细-点击查看供应商按钮
   */
  @Bind()
  onDistributeSupplierForItemLine(record) {
    const { dispatch, organizationId } = this.props;
    if (record) {
      dispatch({
        type: 'bidEventQuery/supplierRecord',
        payload: {
          organizationId,
          bidHeaderId: record.bidHeaderId,
          bidLineItemId: record.bidLineItemId,
        },
      });
    }

    this.setState({ distributeModalVisible: true });
  }

  // 物品明细查看供应商窗口关闭
  @Bind()
  cancelDistribute() {
    this.setState({ distributeModalVisible: false });
  }

  // 评分要素-专家分配 打开modal
  @Bind()
  openAssignExpertModal(record) {
    const { dispatch, organizationId } = this.props;

    this.setState({
      evaluateAssignModalVisible: true,
    });

    dispatch({
      type: 'bidEventQuery/fetchEvaluateIndicAssign',
      payload: {
        organizationId,
        evaluateIndicId: record.evaluateIndicId || '',
        evaluateIndicCategory: record.team || '',
      },
    });
  }

  // 评分要素-专家分配 关闭modal
  @Bind()
  cancelAssignExpert() {
    this.setState({
      evaluateAssignModalVisible: false,
    });
  }

  // 基本信息-招标小组 打开modal
  @Bind()
  showBidMembers() {
    this.setState({
      editBidMembersFlag: true,
    });
    this.fetchBidMembers();
  }

  /**
   * 查询-招标小组数据
   */
  @Bind()
  fetchBidMembers() {
    const {
      match: { params, path },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchBidMembers',
      payload: { organizationId, bidHeaderId: params.bidId, path },
    });
  }

  // 基本信息-招标小组查看窗口关闭
  @Bind()
  handleMembersCancel() {
    this.setState({
      editBidMembersFlag: false,
    });
  }

  /**
   * 查看-打开评分要素定义模态框
   */
  @Bind()
  showScoringElement() {
    this.setState({
      scoringElementVisible: true,
    });
    this.fetchScoringElementData();
  }

  /**
   * 查询-评分要素定义数据
   */
  @Bind()
  fetchScoringElementData() {
    const {
      dispatch,
      bidEventQuery: { header = {} },
      organizationId,
    } = this.props;
    dispatch({
      type: 'bidEventQuery/fetchScoringElementData',
      payload: { prequalHeaderId: header.prequalHeaderId, organizationId },
    });
  }

  /**
   * 关闭-评分要素定义模态框
   */
  @Bind()
  handleCancelScoringElement() {
    this.props.dispatch({
      type: 'bidEventQuery/updateState',
      payload: {
        scoringElement: [],
      },
    });
    this.setState({
      scoringElementVisible: false,
    });
  }

  /**
   *展开时重新调用单独查询物品明细列表数据
   */
  expandItemLine = (e, bidLineItemId) => {
    e.stopPropagation();
    const { itemContentChange } = this.props.bidEventQuery;
    const { expand } = this.state;
    const currentStatus = expand[bidLineItemId];
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
        type: 'bidEventQuery/fetchAloneItemLine',
        payload: {
          page: {},
          organizationId,
          bidHeaderId: params.bidId,
          bidLineItemId,
        },
      }).then(() => {
        this.setState({ loadingObj: { [bidLineItemId]: { fetchAloneItemLineLoading: false } } });
      });
    } else {
      const {
        bidEventQuery: { aloneItemLine = {} },
      } = this.props;
      const dataSource = aloneItemLine[`${bidLineItemId}`].list;
      // 获取接口数据中的行ID作为rowKeys
      const quotationLineIdMap = dataSource.map((item) => {
        return item.quotationLineId;
      });
      const differenceKeys = difference(this.state.itemLineSelectedRowKeys, quotationLineIdMap);
      this.setState({ itemLineSelectedRowKeys: differenceKeys });
    }

    // 有值改变时,关闭时,改变的数据设置为false
    if (this.props.bidEventQuery.itemContentChange[bidLineItemId]) {
      this.props.dispatch({
        type: 'bidEventQuery/updateState',
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
        type: 'bidEventQuery/updateState',
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
    });
  };

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
   * showUploadModal - 打开头附件上传弹窗
   */
  @Bind()
  showUploadModal(validBusinessAttachmentUuid, validTechAttachmentUuid) {
    this.setState({
      AttachmentsProps: {
        bucketName: BUCKET_NAME,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        viewOnly: true,
        businessUuid: validBusinessAttachmentUuid,
        techUuid: validTechAttachmentUuid,
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
   * 供应商头部明细
   */
  @Bind()
  renderSupplierHeaderInfo(item) {
    const { expand } = this.state;
    return (
      <div className={styles.itemList1}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader} style={{ width: '102%' }}>
            <span className={styles.itemListNum}>
              <span>
                <img src={require('@/assets/supplier.svg')} alt="" />
              </span>
              <span className={styles.itemListNumLeft}>
                <Tooltip
                  title={`${item.supplierCompanyNum}--${item.supplierCompanyName}`}
                  placement="topLeft"
                >
                  {item.supplierCompanyNum ? `${item.supplierCompanyNum}-` : null}
                  {item.supplierCompanyName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{ marginTop: '10px', color: 'rgba(41, 190, 206, 1)' }}
                  type={!expand[`${item.bidLineItemId}#${item.quotationHeaderId}`] ? 'down' : 'up'}
                  onClick={(e) => this.expandSupplierItemLine(e, item.quotationHeaderId, item)}
                />
              </span>
            </span>
            {item.sumScore ? (
              <Tag className={styles.sumScore}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.sumScore`).d('总分')}：{item.sumScore}
              </Tag>
            ) : (
              <span style={{ width: '80px', display: 'inline-block' }} />
            )}
            {item.sumPrice ? (
              <Tag className={styles.sumPrice}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.sumPrice`).d('报价总价')}：
                {item.sumPrice}
              </Tag>
            ) : (
              <span style={{ width: '100px', display: 'inline-block' }} />
            )}
            <span style={{ marginLeft: 50 }}>{item.contactName}</span>
            <span style={{ marginLeft: 15 }}>{item.contactMobilephone}</span>
            <span style={{ marginLeft: 15 }}>{item.contactMail}</span>
            <span onClick={(e) => this.rfxLineTag(e)} style={{ float: 'right' }}>
              <a
                onClick={() =>
                  this.showUploadModal(
                    item.validBusinessAttachmentUuid,
                    item.validTechAttachmentUuid
                  )
                }
              >
                {' '}
                <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.attachment`).d('附件')}</span>
                <span style={{ marinLeft: '7px' }}>
                  <img src={require('@/assets/file.svg')} alt="" />
                </span>
              </a>
            </span>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   *展开时重新调用单独查询投标物料行列表数据
   */
  expandSupplierItemLine = (e, quotationHeaderId, item) => {
    const { dispatch, organizationId } = this.props;
    e.stopPropagation();
    const { expand } = this.state;
    const currentStatus = expand[`${item.bidLineItemId}#${quotationHeaderId}`];
    if (!currentStatus) {
      const loadingObj = {
        [quotationHeaderId]: { queryCalibrationLoading: true },
      };
      this.setState({ loadingObj });
      // 查询供应商投标物料行
      dispatch({
        type: 'bidEventQuery/fetchCalibrationQuotation',
        payload: {
          page: {},
          organizationId,
          sectionId: item.bidLineItemId,
          supplierCompanyId: item.supplierCompanyId,
          subjectMatterRule: item.subjectMatterRule,
          quotationHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } },
          });
        }
      });
    }
    this.setState({
      expand: {
        ...expand,
        [`${item.bidLineItemId}#${item.quotationHeaderId}`]: !expand[
          `${item.bidLineItemId}#${item.quotationHeaderId}`
        ],
      },
    });
  };

  /**
   * 浮动文字tabs
   */
  @Bind()
  renderTooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {item.sectionName}
      </Tooltip>
    );
  };

  /**
   * 获取分页物品维度
   *
   * @memberof search
   */
  @Bind()
  changePage(page = {}, quotationHeaderId, item) {
    const { dispatch, organizationId } = this.props;
    // 查询供应商投标物料行
    dispatch({
      type: 'bidEventQuery/fetchCalibrationQuotation',
      payload: {
        page,
        organizationId,
        quotationHeaderId,
        sectionId: item.bidLineItemId,
        supplierCompanyId: item.supplierCompanyId,
        subjectMatterRule: item.subjectMatterRule,
      },
    }).then((res) => {
      if (res) {
        this.setState({ loadingObj: { [quotationHeaderId]: { queryCalibrationLoading: false } } });
      }
    });
  }

  /**
   * 渲染供应商维度
   *
   */
  @Bind()
  renderSupplier(supplier) {
    const { expand, loadingObj = {} } = this.state;
    const {
      bidEventQuery: { calibQuotationList = [] },
    } = this.props;
    const itemLineBidTableProps = {
      calibQuotationList,
      loadingObj,
      onSearch: this.changePage,
    };
    return (
      <div>
        {map(supplier.lineSupplierDTOS, (item) => {
          return (
            <div>
              <div
                onClick={(e) => this.expandSupplierItemLine(e, item.quotationHeaderId, item)}
                className={styles.arrowStyle}
              >
                {this.renderSupplierHeaderInfo(item)}
              </div>
              <div>
                {expand[`${item.bidLineItemId}#${item.quotationHeaderId}`] && (
                  <ItemPackLineTable
                    {...itemLineBidTableProps}
                    item
                    quotationHeaderId={item.quotationHeaderId}
                    sectionId={item.bidLineItemId}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      bidEventQuery: { LinePackList = [] },
    } = this.props;
    return (
      <div>
        <Tabs animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(LinePackList, (item) => {
            return (
              <Tabs.TabPane tab={this.renderTooTipTabs(item)} key={[item.sectionId]}>
                {this.renderSupplier(item)}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 物料头部明细
   */
  @Bind()
  renderHeaderInfo(item) {
    const { expand } = this.state;
    return (
      <div className={styles.itemList}>
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
                  onClick={(e) => this.expandItemLine(e, item.bidLineItemId)}
                />
              </span>
            </span>
            <span>
              {intl.get(`ssrc.bidEventQuery.model.bidHall.bidLineItemNum`).d('行号')}
              {item.bidLineItemNum}
            </span>
            {item.taxRate ? (
              <span className={styles.taxRate}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率')}
                {item.taxRate}%
              </span>
            ) : (
              <span style={{ width: '68px', display: 'inline-block' }} />
            )}
            {item.bidQuantity ? (
              <Tag className={styles.bidQuantity}>
                {intl.get(`ssrc.bidEventQuery.model.bidHall.bidQuantity(uomName)`).d('需求数量')}
                {item.bidQuantity}
                {item.uomName}
              </Tag>
            ) : (
              <span style={{ width: '104px', display: 'inline-block' }} />
            )}
            {item.itemCategoryName && (
              <Tag className={styles.categoryName}>{item.itemCategoryName}</Tag>
            )}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </div>
    );
  }

  /**
   * 物料明细列表content切换分页时，先保存数据
   */
  @Bind()
  changeItemLinePage(page, bidLineItemId) {
    // 判断当前table是否改变
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    if (this.props.bidEventQuery.itemContentChange[bidLineItemId]) {
      Modal.confirm({
        title: intl
          .get(`ssrc.bidEventQuery.model.bidHall.saveBeforeChangeTabs`)
          .d('切换页面前请先保存数据'),
        okText: intl.get('hzero.common.button.ok').d('确定'),
        cancelText: intl.get(`ssrc.bidEventQuery.view.message.button.continueToJump`).d('继续跳转'),
        onOk: () => {},
        onCancel: () => {
          dispatch({
            type: 'bidEventQuery/fetchAloneItemLine',
            payload: {
              page,
              organizationId,
              bidHeaderId: params.bidId,
              bidLineItemId,
            },
          });
        },
      });
    } else {
      dispatch({
        type: 'bidEventQuery/fetchAloneItemLine',
        payload: {
          page,
          organizationId,
          bidHeaderId: params.bidId,
          bidLineItemId,
        },
      });
    }
  }

  /**
   * 表单头
   */
  renderHeaderForm() {
    const {
      organizationId,
      bidEventQuery: { header = {} },
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

    return (
      <Form>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidNum`).d('招标编号')}
              value={header.bidNum}
            />
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              <span style={{ marginLeft: '6%' }}>{header.bidTitle}</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.sourcingTemplate`).d('寻源模板')}
              value={header.templateName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.quotationType`).d('报价方式')}
              value={header.quotationTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.purceOrgName`).d('采购组织名称')}
              value={header.purOrganizationName}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={header.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidType`).d('招标类别')}
              value={header.bidType}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.sourceMethod`).d('寻源方式')}
              value={header.sourceMethodMeaning}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.subjectMatterRule`).d('标的规则')}
              value={header.subjectMatterRuleMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.sourceStage`).d('招标阶段')}
              value={header.sourceStageMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.maxBidNumber`).d('最大中标数')}
              value={header.maxBidNumber}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.bidEventQuery.model.bidHall.quotationStartDate`)
                .d('投标开始时间')}
              value={header.quotationStartDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.bidEventQuery.model.bidHall.quotationEndDate`)
                .d('投标截止时间')}
              value={header.quotationEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidOpenDate`).d('开标时间')}
              value={header.bidOpenDate}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={this.showBidMembers}>
                {intl.get(`ssrc.bidEventQuery.view.message.button.view`).d('查看')}
              </a>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidFile`).d('招标文件')}
              value={
                <Upload
                  bucketName={BUCKET_NAME}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={header.techAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              }
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   */
  renderOtherInfosForm() {
    const {
      bidEventQuery: { header = {} },
    } = this.props;

    return (
      <Form>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidPlanName`).d('寻源计划')}
              value={header.bidPlanLineName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.projectCode`).d('项目编码')}
              value={header.projectNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.projectName`).d('项目名称')}
              value={header.projectName}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidLocation`).d('项目地点')}
              value={header.bidLocation}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.currencyType`).d('币种')}
              value={header.currencyCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.exchangeRate`).d('汇率')}
              value={numberRender(header.exchangeRate, 8, false)}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.round`).d('轮次')}
              value={header.roundNumber}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.versionNumber`).d('版本')}
              value={header.versionNumber}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.creationDate`).d('创建时间')}
              value={header.creationDate}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidFileExpense`).d('招标文件费')}
              value={header.bidFileExpense}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidBond`).d('保证金')}
              value={header.bidBond}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.paymentType`).d('付款方式')}
              value={header.paymentTypeName}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.paymentTerm`).d('付款条款')}
              value={header.paymentTerm}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.bidOpenLocation`).d('开标地点')}
              value={header.bidOpenLocation}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderQualificationForm() {
    const {
      organizationId,
      bidEventQuery: { header = {} },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.prequalEndDate`).d('预审截止时间')}
              value={header.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.reviewMethod`).d('审查方式')}
              value={header.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.qualifiedLimit`).d('合格上限')}
              value={header.qualifiedLimit}
            />
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.bidEventQuery.model.bidHall.prequalFileExpense`)
                .d('预审文件费')}
              value={header.prequalFileExpense}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.prequalLocation`).d('申请提交地点')}
              value={header.prequalLocation}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.enableScoreFlag`).d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={this.showScoringElement}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={styles.headerInfo}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.prequalFile`).d('资格预审文件')}
              value={
                <Upload
                  bucketName={BUCKET_NAME}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={header.prequalAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.prequalRemark`).d('资格预审备注')}
              value={header.prequalRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - BulkAddSupplier组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      form,
      dispatch,
      match,
      location: { search },
      organizationId,
      userId,
      fetchBasicInfoLoading,
      fetchItemDetailLoading,
      supplierRecordLoading,
      fetchExpertsInfoLoading,
      fetchSupplierListLoading,
      fetchScorElementsLoading,
      fetchEvaluateIndicAssignLoading,
      fetchBidMembersLoading,
      fetchScoringElementLoading,
      bidEventQuery: {
        header = {},
        itemLine = [],
        itemLinePagination = {},
        supplierLine = [],
        supplierData = [],
        scoringNoneExpert = [],
        scoringBusinessExpert = [],
        scoringTechnologyExpert = [],
        scoringNoneTempelate = [],
        scoringBusinessTempelate = [],
        scoringTechnologyTempelate = [],
        currentScoringExperts = [],
        LineNoneList = [],
        aloneItemLine = {},
        bidMembersList = [],
        scoringElement = [],
      },
      itemContentChange,
    } = this.props;
    const { source, openFrom } = querystring.parse(search.substr(1));

    const {
      collapseKeys,
      distributeModalVisible,
      evaluateAssignModalVisible,
      expand,
      loadingObj,
      editBidMembersFlag,
      AttachmentsProps,
      attachmentVisible,
      scoringElementVisible,
    } = this.state;

    // 专家
    const ProfessionalTableProps = {
      header,
      scoringNoneExpert,
      scoringBusinessExpert,
      scoringTechnologyExpert,
      dispatch,
      organizationId,
      match,
      fetchExpertAllocationDataLoading: fetchExpertsInfoLoading,
    };

    // 评分要素
    const scoringElementsTableProps = {
      loading: fetchScorElementsLoading,
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      dispatch,
      evaluateAssignModalVisible,
      organizationId,
      match,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
      openAssignExpertModal: this.openAssignExpertModal,
      cancelAssignExpert: this.cancelAssignExpert,
    };

    // 供应商
    const supplierLineTableProps = {
      dispatch,
      organizationId,
      userId,
      companyId: header.companyId,
      match,
      fetchbidHallUpdateLoading: fetchBasicInfoLoading,
      loading: fetchSupplierListLoading,
      dataSource: supplierLine,
      sourceMethod: header.sourceMethod,
    };
    // 物品明细
    const itemLineTableProps = {
      match,
      dispatch,
      organizationId,
      supplierRecordLoading,
      subjectMatterRule: source,
      loading: fetchItemDetailLoading,
      dataSource: itemLine,
      pagination: itemLinePagination,
      onDistributeSupplierForItemLine: this.onDistributeSupplierForItemLine,
      cancelDistribute: this.cancelDistribute,
      distributeModalVisible,
      supplierData,
    };

    // 物品维度-行信息不分标段
    const itemDimensionProps = {
      form,
      loadingObj,
      organizationId,
      itemContentChange,
      dataSource: aloneItemLine,
      headerList: LineNoneList,
      onSearch: this.changeItemLinePage,
      onRef: (node) => {
        this.itemLineList = node;
      },
    };

    // 招标细项props
    const scoringElementProps = {
      header,
      loading: fetchScoringElementLoading,
      visible: scoringElementVisible,
      dataSource: scoringElement,
      onCancel: this.handleCancelScoringElement,
    };

    const { getFieldDecorator } = form;

    // 招标小组
    const columnsBidMember = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRoleMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.designation`).d('名称'),
        dataIndex: 'userName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.email`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val) => val,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.contactMobilephone`).d('电话'),
        dataIndex: 'phone',
        width: 120,
        render: (val) => val,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.openedFlag`).d('启用开标密码'),
        dataIndex: 'openFlag',
        width: 120,
        render: (val) => (
          <Form.Item style={{ marginBottom: 0 }}>
            {getFieldDecorator('openFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
          </Form.Item>
        ),
      },
    ];

    const scrollX = sum(columnsBidMember.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <Header
          backPath={
            openFrom !== 'modal'
              ? '/sodr/purchase-order-maintain/source-from-requisition/list'
              : null
          }
          title={intl
            .get(`ssrc.bidEventQuery.view.message.title.bideventQueryDetail`)
            .d('招标事件查询')}
        />
        <Content>
          <Spin
            spinning={fetchBasicInfoLoading}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              defaultActiveKey={['baseInfos']}
            >
              <Panel
                showArrow={false}
                header={
                  <>
                    <h3>
                      {header.bidNum} —{header.bidTitle}
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
              >
                <Tabs defaultActiveKey="baseInfos" animated={false}>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidEventQuery.view.message.tab.baseInfos`).d('基本信息')}
                    key="baseInfos"
                  >
                    {this.renderHeaderForm()}
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidEventQuery.view.message.tab.otherInfos`).d('其他信息')}
                    key="otherInfos"
                    forceRender
                  >
                    {this.renderOtherInfosForm()}
                  </Tabs.TabPane>
                  {['PRE', 'PRE_POST'].includes(header.qualificationType) ? (
                    <Tabs.TabPane
                      tab={intl
                        .get(`ssrc.bidEventQuery.view.message.tab.preQualification`)
                        .d('资格预审')}
                      key="preQualification"
                      forceRender
                    >
                      {this.renderQualificationForm()}
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl.get(`ssrc.bidEventQuery.view.message.tab.professional`).d('专家')}
                      key="professional"
                      forceRender
                    >
                      <ProfessionalTable {...ProfessionalTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  {header.expertScoreType && header.expertScoreType === 'ONLINE' ? (
                    <Tabs.TabPane
                      tab={intl
                        .get(`ssrc.bidEventQuery.view.message.tab.scoringElements`)
                        .d('评分要素')}
                      key="scoringElements"
                      forceRender
                    >
                      <ScoringElementsTable {...scoringElementsTableProps} />
                    </Tabs.TabPane>
                  ) : (
                    ''
                  )}
                  <Tabs.TabPane
                    tab={intl
                      .get(`ssrc.bidEventQuery.view.message.tab.supplierList`)
                      .d('供应商列表')}
                    key="supplierList"
                    forceRender
                  >
                    <SupplierLineTable {...supplierLineTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get(`ssrc.bidEventQuery.view.message.tab.itemDetails`).d('物品明细')}
                    key="itemDetails"
                  >
                    <ItemLineTable {...itemLineTableProps} />
                  </Tabs.TabPane>
                </Tabs>
              </Panel>
            </Collapse>
          </Spin>
          {source === 'NONE' &&
            map(LineNoneList, (item) => {
              return (
                <div>
                  <div
                    onClick={(e) => this.expandItemLine(e, item.bidLineItemId)}
                    className={styles.arrowStyle}
                  >
                    {this.renderHeaderInfo(item)}
                  </div>
                  <div>
                    {expand[item.bidLineItemId] && (
                      <ItemNoneDetailsList
                        bidLineItemId={item.bidLineItemId}
                        {...itemDimensionProps}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          {source === 'PACK' && <div style={{ marginTop: '24px' }}>{this.renderTabs()}</div>}
        </Content>
        <Modal
          visible={editBidMembersFlag}
          width={780}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.bidTeams`).d('招标小组')}</span>
            </div>
          }
          footer={null}
          onCancel={this.handleMembersCancel}
        >
          <Table
            bordered
            rowKey="bidMemberId"
            loading={fetchBidMembersLoading}
            columns={columnsBidMember}
            scroll={{ x: scrollX }}
            pagination={false}
            dataSource={bidMembersList}
          />
        </Modal>
        <Modal
          destroyOnClose
          visible={attachmentVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          <Attachment {...AttachmentsProps} />
        </Modal>
        <ScoringElementModal {...scoringElementProps} />
      </React.Fragment>
    );
  }
}
