/**
 * 寻源执行结果
 * @date: 2021-06-21
 */
import React, { PureComponent } from 'react';
import { Radio, Form, Col, Row } from 'hzero-ui';
import { map, toString, isFunction, isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui';
import { DataSet, Tooltip } from 'choerodon-ui/pro';
import remote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import { queryMapIdpValue } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { INQUIRY, getQuotationName, getDocumentTypeName } from '@/utils/globalVariable';
import closeRFX from './CloseRfxModal';
import { querySectionList, submitSectionSourcingResult, checkPermission } from './service';
import SectionPanel from './SectionPanel';
import SupplierQuotationTable, { BidSupplierQuotationTable } from './SupplierQuotationTable';
import { renderSubTitle } from './renderer';
import tableDS from './tableDS';
import styles from './index.less';

const RadioGroup = Radio.Group;
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
const promptCode = 'ssrc.common';
const organizationId = getCurrentOrganizationId();

/**
 * @description 若要增加传参或者修改请关注下PubPagesEntry/RFQFeedBackLack/SectionIndex文件
 */
class SourcingResult extends PureComponent {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-unused-expressions
    isFunction(props.onRef) && props.onRef(this);

    /** ********* 【三宁化工】二开拓展节点-勿动!!! *********** */
    this.expandNodeRef = null;

    const {
      rfxHeaderId,
      nextRfxStatus,
      projectLineSectionId,
      pretrialFlag,
      expertScoreType,
      rfxStatus,
    } = props;
    this.state = {
      rfxHeaderId,
      nextRfxStatus,
      pretrialFlag,
      expertScoreType,
      sourceResultList: [],
      activateSectionKey: projectLineSectionId,
      sourcingResultMap: {}, // 寻源结果值集转map, 加快访问速度
      sourcingResultShortMap: {},
      projectLineSectionList: [],
      onlySingleProjectLineSection: {}, // 适配多标段, 但只返回单标段场景
      sectionTagMap: {}, // 标段映射tag的map
      permissionBtnMap: {},
      querySourcingResultLoading: false,
    };
    this.tableDs = new DataSet(
      tableDS({
        customizeUnitCode:
          rfxStatus === 'LACK_QUOTED'
            ? `SSRC.${props.bidFlag ? 'BID' : 'INQUIRY'}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`
            : `SSRC.${
                props.bidFlag ? 'BID' : 'INQUIRY'
              }_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`,
      })
    );
  }

  supplierQuoTableRef = null;

  async componentDidMount() {
    const { rfxHeaderId } = this.state;
    this.querySectionList();
    this.tableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
    this.setState({
      querySourcingResultLoading: true,
    });
    this.tableDs.query();
  }

  // 查询按钮权限
  async fetchCheckPermission() {
    const { bidFlag } = this.props;
    const prefix = !bidFlag ? 'ssrc.new-inquiry-hall.list.button.' : 'ssrc.new-bid-hall.button.';
    const params = [
      `${prefix}timeadjustment`, // 时间调整
      `${prefix}closed`, // 关闭询价单
    ];
    const result = getResponse(await checkPermission(params));
    if (isArray(result)) {
      const permissions = [];
      result.forEach((r) => {
        if (r.controllerType === 'hidden' && !r.approve) {
          // 隐藏
          permissions[r.code] = 'hidden';
        } else if (!r.approve) {
          // 禁用
          permissions[r.code] = 'disabled';
        } else {
          permissions[r.code] = 'default';
        }
      });
      this.setState(
        {
          permissionBtnMap: {
            ADJUST_TIME: permissions[params[0]],
            CLOSED: permissions[params[1]],
          },
        },
        () => {
          this.querySourcingResultList(); // 查询值集, 需要先等权限接口返回
        }
      );
    }
  }

  // 查询寻源执行结果列表
  async querySourcingResultList() {
    const { bidFlag } = this.props;
    this.setState({
      querySourcingResultLoading: true,
    });
    const { sourcingResults = [], sourcingResultShorts = [] } =
      getResponse(
        await queryMapIdpValue({
          sourcingResults: bidFlag
            ? 'SSRC.NEW_BID_SECTION_PROCESS_RESULT'
            : 'SSRC.RFX_SECTION_PROCESS_RESULT',
          sourcingResultShorts: bidFlag
            ? 'SSRC.NEW_BID_SECTION_PROCESS_RESULT_SHORT'
            : 'SSRC.RFX_SECTION_PROCESS_RESULT_SHORT',
        })
      ) || {};
    const sourcingResultMap = {};
    const sourcingResultShortMap = {};
    // eslint-disable-next-line no-unused-expressions
    sourcingResults?.forEach((r) => {
      sourcingResultMap[r.value] = r.meaning;
    });
    // eslint-disable-next-line no-unused-expressions
    sourcingResultShorts?.forEach((r) => {
      sourcingResultShortMap[r.value] = r.meaning;
    });
    this.setState(
      {
        sourcingResultMap,
        sourcingResultShortMap,
        querySourcingResultLoading: false,
      },
      () => this.setSourcingResultList()
    );
  }

  // 查询左侧标段列表
  async querySectionList() {
    const { rfxStatus, rfxHeaderId, sourcingResultRemote } = this.props;
    const params = {
      rfxStatus,
      rfxHeaderId,
      organizationId,
    };

    const remoteParams = sourcingResultRemote
      ? sourcingResultRemote.process(
          'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_QUERY_SECTION_PARAMS',
          params
        )
      : params;

    const result = getResponse(await querySectionList(remoteParams));
    if (result) {
      const { projectLineSectionList = [], onlySingleProjectLineSection = {} } = result;
      const checkKeysMap = {};
      if (isArray(projectLineSectionList) && projectLineSectionList[0]) {
        projectLineSectionList.forEach((r) =>
          Object.assign(checkKeysMap, {
            [r.prequalGroupHeaderId]: false,
          })
        );
      }
      this.setState(
        {
          projectLineSectionList,
          onlySingleProjectLineSection,
        },
        () => {
          // FIXED 异步顺序, 需要基于projectList返回
          this.fetchCheckPermission();
        }
      );
    }
  }

  /**
   * 批量应用至全部
   * 只有当前标段的 `nextRfxStatus` 和 其他标段是否一致, 只有一致才会更新
   * @param {string} value - 执行结果
   */
  @Bind()
  handleBatchMaintain(value) {
    const { rfxStatus } = this.props;
    const {
      activateSectionKey,
      sectionTagMap = {},
      projectLineSectionList = [],
      onlySingleProjectLineSection = {},
    } = this.state;
    if (rfxStatus === 'OPENED') {
      return this.handleBatchMaintainByOpenedBid(value); // 校验方式不同
    }
    const newMap = {};
    /**
     * FIXED 适配分标段, 但只返回单个标段场景下, 原本projectLineSectionList返回空数组,
     * 现从onlySingleProjectLineSection中取值, 其余场景从projectLineSectionList中获取
     */
    const activateSection =
      projectLineSectionList?.find((r) => r.projectLineSectionId === activateSectionKey) ||
      onlySingleProjectLineSection ||
      {};
    // eslint-disable-next-line no-unused-expressions
    projectLineSectionList?.forEach((r) => {
      if (
        (activateSection.nextRfxStatus === r.nextRfxStatus && r.quotationLineNumber) ||
        value === 'ADJUST_TIME' ||
        (value === 'CLOSED' && r.closeRecordFlag !== 1)
      ) {
        // 关闭/时间调整默认都有, 其余根据nextStatus判断
        Object.assign(newMap, {
          [r.projectLineSectionId]: value,
        });
      }
    });
    this.setState({
      sectionTagMap: {
        ...sectionTagMap,
        ...newMap,
      },
    });
  }

  /**
   * 只有当前标段的校验 和 其他标段是否一致, 只有一致才会更新
   * @param {string} value - 执行结果
   */
  @Bind()
  handleBatchMaintainByOpenedBid(value) {
    const { sectionTagMap = {}, projectLineSectionList = [] } = this.state;
    const newMap = {};
    // eslint-disable-next-line no-unused-expressions
    projectLineSectionList?.forEach((r) => {
      if (this.judgeIsSameValidation(r, value) || value === 'CLOSED') {
        // 关闭询价单默认都有或者根据judgeFunc返回true
        // 一致
        Object.assign(newMap, {
          [r.projectLineSectionId]: value,
        });
      }
    });
    this.setState({
      sectionTagMap: {
        ...sectionTagMap,
        ...newMap,
      },
    });
  }

  /**
   * 判断校验逻辑是否一致
   * @param {*} section - 循环遍历的section
   * @param {*} processResult - 执行结果
   */
  judgeIsSameValidation(section, processResult) {
    // 控制按钮显隐
    switch (processResult) {
      case 'SCORING_PENDING':
        return section.expertScoreType === 'ONLINE' && Number(section.quotationLineNumber) > 0;
      case 'PRETRIAL_PENDING':
        return section.expertScoreType !== 'ONLINE' && section.pretrialFlag === 1;
      case 'CHECK_PENDING':
        return (
          section.expertScoreType !== 'ONLINE' &&
          section.pretrialFlag !== 1 &&
          Number(section.quotationLineNumber) > 0
        );
      default:
        return false;
    }
  }

  /**
   * 切换标段
   */
  @Bind()
  handleChangeSection(section) {
    const {
      nextRfxStatus,
      projectLineSectionId,
      sourceHeaderId: rfxHeaderId,
      pretrialFlag,
      expertScoreType,
    } = section;
    // 重新查找供应商报价列表
    this.setState(
      {
        rfxHeaderId,
        nextRfxStatus,
        pretrialFlag,
        expertScoreType,
        activateSectionKey: projectLineSectionId,
      },
      async () => {
        this.tableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
        this.setState({
          querySourcingResultLoading: true,
        });
        await this.tableDs.query();
        this.setSourcingResultList();
        this.setState({
          querySourcingResultLoading: false,
        });
      }
    );
  }

  // 获取执行结果
  @Bind()
  setSourcingResultList() {
    const { permissionBtnMap = {}, sourcingResultMap = {} } = this.state;
    const { rfxStatus, sourcingResultRemote } = this.props;
    let list = [];
    switch (rfxStatus) {
      case 'LACK_QUOTED':
        list = this.filterSourcingResultByQuoLack();
        break;
      case 'OPENED':
        list = this.filterSourcingResultByOpenedBid();
        break;
      default:
        list = sourcingResultRemote
          ? sourcingResultRemote.process(
              'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_DEFAULT_SOURCE_RESULT_LIST',
              list,
              { permissionBtnMap, sourcingResultMap }
            )
          : list;
        break;
    }
    this.setState({
      sourceResultList: list,
    });
  }

  /**
   * 过滤执行结果
   * 当没有供应商报价时, 只有关闭询价单和时间调整, 中间那项就没有
   * 下一个操作专家评分显示执行操作：关闭询价单、下发专家评分、时间调整，
   * 下一个操作开标显示执行操作：关闭询价单、开始开标、时间调整
   * 下一个操作初审显示执行操作：关闭询价单、开始初审、时间调整
   * 下一个操作核价显示执行操作：关闭询价单、开始核价、时间调整
   * 在开始开标、开始初审、开始核价、专家评分、点击“应用至全部”，只标记有对应操作的标段
   */
  filterSourcingResultByQuoLack() {
    const {
      newBiddingFlag = false,
      sourcingResultRemote,
      sourceCategory = 'RFQ',
      record,
    } = this.props;
    const {
      activateSectionKey,
      nextRfxStatus,
      sourcingResultMap = {},
      permissionBtnMap = {},
      projectLineSectionList,
      onlySingleProjectLineSection = {},
    } = this.state;
    const {
      biddingTarget,
      quotationOrderType,
      biddingAllowAdjustTimeFlag,
      biddingAllowAdjustTimeType,
    } = record || {};
    const defaultStatus = ['CLOSED', 'ADJUST_TIME']; // 默认都有的状态

    if (newBiddingFlag) {
      /**
       * 1.竞价单：竞价对象=单价+报价次序=并行 / 竞价对象=总价
       * 2.寻源模板：是否允许调整时间=是+调整时间节点包含【响应不足】
       *
       */
      const biddingPreviewRuleVisible =
        (biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'PARALLEL') ||
        biddingTarget === 'TOTAL_PRICE';
      const allowAdjustRule =
        biddingAllowAdjustTimeFlag === 1 &&
        biddingAllowAdjustTimeType &&
        biddingAllowAdjustTimeType.includes('LACK_QUOTED');

      // 竞价大厅展示时间调整
      const biddingHallAdjustTime = biddingPreviewRuleVisible && allowAdjustRule;

      if (!biddingHallAdjustTime) {
        const adjustTimeIndex = defaultStatus.findIndex((item) => item === 'ADJUST_TIME');
        if (adjustTimeIndex !== -1) {
          defaultStatus.splice(adjustTimeIndex, 1); // 竞价大厅多标段，不需要时间调整
        }
      }
    }

    // 需要额外处理权限按钮状态
    const newStatus = [];
    defaultStatus.forEach((r) => {
      // eslint-disable-next-line no-unused-expressions
      permissionBtnMap[r] !== 'hidden' && newStatus.push(r); // 判断每一项权限按钮
    });

    const activateSection =
      projectLineSectionList?.find((r) => r.projectLineSectionId === activateSectionKey) ||
      onlySingleProjectLineSection ||
      {};
    // const data = this.tableDs.toData();
    // const isQuotationPending = data?.every((item) => item.quotationStatus === 'NEW'); // 所有供应商都未报价

    // quotationLineNumber 为0，则没有供应商报价
    if (!activateSection.quotationLineNumber) {
      return map(newStatus, (value) => ({
        value,
        meaning: sourcingResultMap[value],
      }));
    }
    switch (nextRfxStatus) {
      case 'SCORING': // 下发专家评分
        newStatus.splice(1, 0, 'SCORING_PENDING');
        break;
      case 'OPEN_BID_PENDING': // 开标
        newStatus.splice(1, 0, 'OPEN_BID_PENDING');
        break;
      case 'PRETRIAL_PENDING': // 初审
        newStatus.splice(1, 0, 'PRETRIAL_PENDING');
        break;
      case 'CHECK_PENDING': // 核价
        newStatus.splice(1, 0, 'CHECK_PENDING');
        break;
      default:
        break;
    }
    return map(
      sourcingResultRemote
        ? sourcingResultRemote.process(
            'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_QUOTATION_LACK_DOUBLE',
            newStatus,
            {
              sourceCategory,
            }
          )
        : newStatus,
      (value) => ({
        value,
        meaning: sourcingResultMap[value],
      })
    );
  }

  /**
   * 已开标
   * 有专家评分的显示执行操作：关闭询价单、专家评分
   * 无专家评分核价的显示执行操作：关闭询价单、开始核价
   * 开始初审的显示执行操作：关闭询价单、开始初审
   * 在开始初审、开始核价、专家评分、点击“应用至全部”，只标记有对应操作的标段
   */
  filterSourcingResultByOpenedBid() {
    const {
      pretrialFlag,
      expertScoreType,
      sourcingResultMap = {},
      permissionBtnMap = {},
      activateSectionKey,
      projectLineSectionList,
      onlySingleProjectLineSection = {},
    } = this.state;
    const defaultStatus = ['CLOSED']; // 默认都有的状态
    // 需要额外处理权限按钮状态
    const newStatus = [];
    defaultStatus.forEach((r) => {
      // eslint-disable-next-line no-unused-expressions
      permissionBtnMap[r] !== 'hidden' && newStatus.push(r); // 判断每一项权限按钮
    });

    /**
     * FIXED 适配分标段, 但只返回单个标段场景下, 原本projectLineSectionList返回空数组,
     * 现从onlySingleProjectLineSection中取值, 其余场景从projectLineSectionList中获取
     */
    const activateSection =
      projectLineSectionList?.find((r) => r.projectLineSectionId === activateSectionKey) ||
      onlySingleProjectLineSection ||
      {}; // activateSection.quotationLineNumber === 0 所有供应商都未报价

    // const data = this.tableDs.toData();
    // const isQuotationPending = data?.every((item) => item.quotationStatus === 'NEW'); // 所有供应商都未报价

    // 控制按钮显隐
    if (expertScoreType === 'ONLINE' && activateSection.quotationLineNumber) {
      // 下发专家评分
      newStatus.push('SCORING_PENDING');
    } else if (expertScoreType !== 'ONLINE' && pretrialFlag === 1) {
      // 初审
      newStatus.push('PRETRIAL_PENDING');
    } else if (
      expertScoreType !== 'ONLINE' &&
      pretrialFlag !== 1 &&
      activateSection.quotationLineNumber
    ) {
      // 核价
      newStatus.push('CHECK_PENDING');
    }
    return map(newStatus, (value) => ({
      value,
      meaning: sourcingResultMap[value],
    }));
  }

  /**
   * 切换单选框
   * @param {*} e - 事件源
   */
  @Bind()
  handleChange(e) {
    const { onChange, sourcingResultRemote } = this.props;
    const { activateSectionKey, sectionTagMap } = this.state;
    const newSectionTagMap = {
      ...sectionTagMap,
      [activateSectionKey]: e.target.value,
    };
    this.setState({
      sectionTagMap: sourcingResultRemote
        ? sourcingResultRemote.process(
            'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_SECTION_TAG_MAP',
            newSectionTagMap,
            {
              sectionTagMap,
              value: e.target.value,
              activateSectionKey,
            }
          )
        : newSectionTagMap,
    });
    // eslint-disable-next-line no-unused-expressions
    isFunction(onChange) && onChange(); // 触发回调, 渲染item上的Tag
    this.handleSource(e.target.value);
  }

  /**
   * Action 主要分为以下:
   * - 关闭询价单: 弹窗
   * - 关闭询价单 + 其他: 弹窗
   * - 关闭询价单 + 时间调整: 弹窗 + 跳转页面
   * - 时间调整: 跳转页面
   * - 其他: 关闭弹窗
   */
  @Bind()
  async handleSubmit() {
    const { bidFlag = false, sourcingResultRemote } = this.props;
    const { rfxHeaderId, sectionTagMap = {}, projectLineSectionList = [] } = this.state;
    if (!Object.keys(sectionTagMap).length) {
      notification.error({
        message: intl
          .get(`${promptCode}.view.validation.sectionSelectedNotEmpty`)
          .d('请至少选择一条标段的执行结果'),
      });
      return Promise.reject();
    }
    // 优先判断是否包含关闭询价单如果包含, 需要先弹出中心弹窗
    const hasCloseRfx = Object.values(sectionTagMap).some((v) => v === 'CLOSED');
    const adjustTimeKey = Object.keys(sectionTagMap).find(
      (key) => sectionTagMap[key] === 'ADJUST_TIME'
    );
    // 同时找到对应的rfxHeaderId
    let adjustTimeMappingRfxHeaderId = null;
    if (!isNil(adjustTimeKey)) {
      if (isNil(projectLineSectionList) || !projectLineSectionList?.length) {
        // 不分标段
        adjustTimeMappingRfxHeaderId = rfxHeaderId;
      } else {
        adjustTimeMappingRfxHeaderId = projectLineSectionList?.find(
          (r) => toString(r.projectLineSectionId) === adjustTimeKey
        )?.sourceHeaderId;
      }
    }

    if (hasCloseRfx) {
      // 优先弹窗
      return new Promise((resolve, reject) => {
        closeRFX(
          ({ remark, closeAttachmentUuid, otherParams = {} }) =>
            this.submitCallBack(
              adjustTimeMappingRfxHeaderId,
              resolve,
              reject,
              remark,
              closeAttachmentUuid,
              otherParams
            ),
          getDocumentTypeName(bidFlag),
          sourcingResultRemote
        );
      });
    }
    return this.submitCallBack(adjustTimeMappingRfxHeaderId);
  }

  /**
   * 提交后的cb func
   * @param {?Function} resolveFunc - 关闭询价单才会传递
   * @param {?string} remark - 关闭理由
   */
  @Bind()
  async submitCallBack(
    adjustTimeMappingRfxHeaderId,
    resolveFunc,
    rejectFunc,
    remark,
    closeAttachmentUuid,
    otherParams = {}
  ) {
    const {
      rfxHeaderId,
      activateSectionKey,
      sectionTagMap = {},
      projectLineSectionList = [],
    } = this.state;
    const { sourcingResultRemote, bidFlag } = this.props;
    const newSectionList = map(projectLineSectionList, (r) => ({
      // 单标段时为 `[]`
      ...r,
      processResult: sectionTagMap[r.projectLineSectionId],
    }));
    const params = {
      organizationId,
      remark,
      closeAttachmentUuid,
      projectLineSectionList: newSectionList?.length
        ? newSectionList
        : [
            {
              sourceHeaderId: rfxHeaderId,
              processResult: sectionTagMap[activateSectionKey],
            },
          ],
      ...otherParams,
    };
    const newParams = sourcingResultRemote
      ? sourcingResultRemote?.process(
          'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_SECTION_EXPERT_SCORE_PARAMS',
          params,
          {
            bidFlag,
            expandNodeRef: this.expandNodeRef,
          }
        )
      : params;
    return new Promise(async (resolve, reject) => {
      const newResolve = resolveFunc || resolve;
      const newReject = rejectFunc || reject;
      try {
        const res = getResponse(await submitSectionSourcingResult(newParams));
        if (res) {
          return newResolve(adjustTimeMappingRfxHeaderId);
        }
        return newReject(null);
      } catch {
        newReject(null);
      }
    });
  }

  /**
   * 处理结果集中的value，使其与个性化中的字段相对应 例如将ADJUST_TIME转换成adjustTime
   * @param {*} value - 原始value
   */
  @Bind()
  transferUppercase(value) {
    const splitString = value?.split('_');
    const dealResult = splitString.reduce((prev, cur, index) => {
      if (index === 0) {
        return prev + cur.toLowerCase();
      } else {
        return prev + this.firstToUpper(cur);
      }
    }, '');
    return dealResult;
  }

  /**
   * 正则 转换首字母大写
   * @param {*} str
   */
  @Bind()
  firstToUpper(str) {
    return str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
      return $1.toUpperCase() + $2.toLowerCase();
    });
  }

  // 为了安琪二开点击标段结果直接作用在所有标段上
  @Bind()
  handleSource(value) {
    const { projectLineSectionList = [] } = this.state;
    const { sourcingResultRemote, rfxStatus } = this.props;
    if (sourcingResultRemote?.event) {
      sourcingResultRemote.event.fireEvent('handleClickRadio', {
        value,
        rfxStatus,
        projectLineSectionList,
        handleBatchMaintain: this.handleBatchMaintain,
      });
    }
  }

  @Bind()
  handleBindOnRef(ref = {}) {
    /** ********* 【三宁化工】二开节点-勿动!!! *********** */
    this.expandNodeRef = ref;
  }

  render() {
    const {
      custClass,
      rfxHeaderId,
      customizeTable,
      customizeForm,
      form,
      bidFlag = false,
      rfxStatus,
      sourcingResultRemote,
      newBiddingFlag = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      activateSectionKey = null,
      sectionTagMap = {},
      sourceResultList = [],
      projectLineSectionList = [],
      sourcingResultShortMap = {},
      permissionBtnMap = {},
      querySourcingResultLoading = false,
      onlySingleProjectLineSection = {},
      rfxHeaderId: sourceHeaderId, // 最新的rfxHeaderId
    } = this.state;

    const tableProps = {
      rfxHeaderId,
      tableDs: this.tableDs,
      customizeTable,
      bidFlag,
      rfxStatus,
    };
    const panelProps = {
      activateSectionKey,
      sectionTagMap,
      sourcingResultShortMap,
      projectLineSectionList,
      onChangeSection: this.handleChangeSection,
    };
    /**
     * FIXED 适配分标段, 但只返回单个标段场景下, 原本projectLineSectionList返回空数组,
     * 现从onlySingleProjectLineSection中取值, 其余场景从projectLineSectionList中获取
     */
    const activateSection =
      projectLineSectionList?.find((r) => r.projectLineSectionId === activateSectionKey) ||
      onlySingleProjectLineSection ||
      {};

    // 区分是报价响应不足个性化按钮还是开标个性化按钮
    const btnCustomizeCode =
      rfxStatus === 'LACK_QUOTED'
        ? `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.LACK_QUOTED.SOURCING_RESULT`
        : `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.OPERATION_OPEN_BID.SOURCING_RESULT`;

    return (
      <div className={classNames(styles.container, custClass)}>
        {!!projectLineSectionList?.length && (
          <div className={styles['left-panel-list']}>
            {/* 左侧标段列表 */}
            <SectionPanel {...panelProps} />
          </div>
        )}
        <div className={styles['right-panel-content']}>
          {/* 右侧上方供应商报价列表 */}
          <div>
            {renderSubTitle(
              intl
                .get(`${promptCode}.view.title.commonSupplierQuotationInfo`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('供应商{quotationName}情况')
            )}
            {/* 二开埋点 eppen */}
            {sourcingResultRemote &&
              sourcingResultRemote.render(
                'SSRC_OPERATE_SOURCING_RESULT_DRAWER_RENDER_CUSTOMER_BUTTONS',
                <></>,
                {
                  rfxHeaderId: sourceHeaderId,
                  bidFlag,
                }
              )}
            {bidFlag ? (
              <BidSupplierQuotationTable ref={this.supplierQuoTableRef} {...tableProps} />
            ) : (
              <SupplierQuotationTable ref={this.supplierQuoTableRef} {...tableProps} />
            )}
          </div>
          {/* 右侧下方执行结果列表 */}
          <Spin spinning={querySourcingResultLoading}>
            <div>
              {renderSubTitle(intl.get(`${promptCode}.view.title.sourcingResult`).d('执行结果'))}
              <RadioGroup onChange={this.handleChange} value={sectionTagMap[activateSectionKey]}>
                {customizeForm(
                  {
                    code: btnCustomizeCode,
                    form,
                    dataSource: {},
                    readOnly: true,
                  },
                  <Form layout="vertical">
                    {map(sourceResultList, (item) => (
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item labelCol={{ span: 0, offset: 0 }} style={{ marginBottom: 0 }}>
                            {getFieldDecorator(this.transferUppercase(item.value))(
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {
                                  // 如果关闭询价单处于审批流当中，则特殊处理气泡提示并禁用
                                  item.value === 'CLOSED' &&
                                  activateSection.closeRecordFlag === 1 ? (
                                    <Tooltip
                                      placement="right"
                                      title={intl
                                        .get(
                                          'ssrc.inquiryHall.view.message.button.closeInquiryList.commonPlaceholder',
                                          { documentTypeName: getDocumentTypeName(bidFlag) }
                                        )
                                        .d('{documentTypeName}正在进行关闭审批，请勿重复操作')}
                                    >
                                      <Radio
                                        disabled={
                                          permissionBtnMap[item.value] === 'disabled' ||
                                          activateSection.closeRecordFlag === 1
                                        }
                                        style={radioStyle}
                                        value={item.value}
                                      >
                                        {item.meaning}
                                      </Radio>
                                    </Tooltip>
                                  ) : (
                                    <Radio
                                      disabled={permissionBtnMap[item.value] === 'disabled'}
                                      style={radioStyle}
                                      value={item.value}
                                    >
                                      {item.meaning}
                                    </Radio>
                                  )
                                }
                                {(sourcingResultRemote
                                  ? sourcingResultRemote.process(
                                      'SSRC_OPERATE_SOURCING_RESULT_DRAWER_PROCESS_APPLY_TO_ALL',
                                      true,
                                      {
                                        rfxStatus,
                                        item,
                                      }
                                    )
                                  : true) &&
                                  !!projectLineSectionList?.length &&
                                  sectionTagMap[activateSectionKey] === toString(item.value) &&
                                  !newBiddingFlag && (
                                    <a
                                      onClick={() => this.handleBatchMaintain(item.value)}
                                      style={{ width: '200px' }}
                                    >
                                      {intl
                                        .get('ssrc.common.view.message.applyToAll')
                                        .d('应用至全部')}
                                    </a>
                                  )}
                              </div>
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                  </Form>
                )}
              </RadioGroup>
              {sourcingResultRemote
                ? sourcingResultRemote.render(
                    'SSRC_OPERATE_SOURCING_RESULT_DRAWER_RENDER_SECTION_EXPAND_EXTRA_NODES',
                    null,
                    {
                      bidFlag,
                      rfxHeaderId: sourceHeaderId,
                      currentSelStatus: sectionTagMap[activateSectionKey],
                      onRef: this.handleBindOnRef,
                    }
                  )
                : null}
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return Form.create({ fieldNameProp: null })(
    formatterCollections({
      code: ['ssrc.common'],
    })(
      withCustomize({
        unitCode: [
          `SSRC.${type}_HALL.LACK_QUOTED.SOURCING_RESULT`,
          `SSRC.${type}_HALL.OPERATION_OPEN_BID.SOURCING_RESULT`,
        ],
      })(
        remote(
          {
            code: 'SSRC_OPERATE_SOURCING_RESULT_DRAWER',
            name: 'sourcingResultRemote',
          },
          {
            events: {
              handleClickRadio() {},
              closeSectionRfxOnOk(eventProps) {
                const { handleClose } = eventProps || {};
                if (handleClose) {
                  return handleClose();
                }
              },
            },
          }
        )(Comp)
      )
    )
  );
};

export default HOCComponent(SourcingResult, INQUIRY);

export { HOCComponent, SourcingResult };
