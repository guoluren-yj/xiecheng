/**
 * DocManageCreate - 考评档案详细
 * @date: 2019-1-10
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  Collapse,
  Col,
  Row,
  Icon,
  Form,
  Input,
  Select,
  DatePicker,
  Tabs,
  Spin,
  Modal,
  Radio,
} from 'hzero-ui';
import queryString from 'querystring';
import { Button } from 'components/Permission';
import Checkbox from 'components/Checkbox';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isUndefined, isArray, isFunction, isNil, isNaN } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import moment from 'moment';
import { Header, Content } from 'components/Page';
// import cacheComponent from 'components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';
import { filterNullValueObject, getCurrentTenant, getEditTableData } from 'utils/utils';
import { valueMapMeaning, yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import remote from 'hzero-front/lib/utils/remote';
import Lov from 'components/Lov';
import LovMultiple from '@/routes/components/LovMultiple';
// import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATE_FORMAT,
  DATETIME_MIN,
  DATETIME_MAX,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import uuidv4 from 'uuid/v4';
import { PRIVATE_BUCKET } from '_utils/config';
import ParamValueModal from '@/routes/ParamValueModal';
import AttachmentModal from '@/routes/EvaluationArchivesFilling/Detail/AttachmentModal';
import { backScoreSave } from '@/routes/EvaluationDocManage/utils';
import QualityRectification from '@/routes/SiteInvestigateReport/common/QualityRectification';
import LovMulti from './LovMulti/index';
import BackScore from './BackScore';
import HeaderBtns from './HeaderBtns';
import ComplaintSituation from './ComplaintSituation';
import Modals from './Modals.js';
import TabContent from './TabContent.js';
import GraderTransfer from './GraderTransfer';
import '@/routes/index.less';

const { confirm } = Modal;

// 文本域
const { TextArea } = Input;

// 使用 Tabs.TabPane 组件
const { TabPane } = Tabs;

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 考评档案详细页面
 * @extends {Component} -React.element
 * @reactProps {object} evaluationDocManage - 数据源
 * @reactProps {boolean} initialLoading - 加载基本数据
 * @reactProps {boolean} scoreSumLoading - 加载评分汇总 tab 中 table 数据
 * @reactProps {boolean} scoreVendorLoading - 加载参评供应商 tab 中 table 数据
 * @reactProps {boolean} evaluationPersonLoading - 加载评分人信息 modal 中 table 数据
 * @reactProps {boolean} evaluationStatusLoading - 加载评分状态 modal 中 table 数据
 * @reactProps {boolean} detailScoreLoading - 加载汇总得分 modal 中 table 数据
 * @reactProps {boolean} productDetailLoading - 加载采购品类名称 modal 中 table 数据
 * @reactProps {boolean} activityLogLoading - 加载操作记录 modal 中 table 数据
 * @returns React.element
 */
@connect(({ evaluationDocManage, loading, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    evaluationDocManage,
    initialLoading: loading.effects['evaluationDocManage/initial'],
    scoreSumLoading: loading.effects['evaluationDocManage/fetchScoreSum'],
    scoreVendorLoading: loading.effects['evaluationDocManage/fetchScoreVendor'],
    evaluationPersonLoading: loading.effects['evaluationDocManage/fetchEvaluationPerson'],
    evaluationStatusLoading: loading.effects['evaluationDocManage/fetchEvaluationStatus'],
    detailScoreLoading: loading.effects['evaluationDocManage/fetchModalScoreDetail'],
    productDetailLoading: loading.effects['evaluationDocManage/fetchProductDetail'],
    activityLogLoading: loading.effects['evaluationDocManage/fetchActivityLog'],
    saveLoading: loading.effects['evaluationDocManage/saveInfo'],
    evaluationPersonSaveLoading: loading.effects['evaluationDocManage/addEvaluationPerson'],
    executeLoading: loading.effects['evaluationDocManage/executeScore'],
    recalculateLoading: loading.effects['evaluationDocManage/recalculate'],
    sumLoading: loading.effects['evaluationDocManage/sumStatistics'],
    publishLoading: loading.effects['evaluationDocManage/publish'],
    backScoreLoading: loading.effects['evaluationDocManage/handleBackScore'],
    submitLoading: loading.effects['evaluationDocManage/handleSubmit'],
    submitNewLoading: loading.effects['evaluationDocManage/submitNewApproval'],
    qualityRectifyLoading: loading.effects['evaluationDocManage/queryProblemHeader'],
    destroyLoading: loading.effects['evaluationDocManage/deleteRecords'],
    complaintSituationLoading:
      loading.effects['evaluationDocManage/queryComplaintSituation'] ||
      loading.effects['evaluationDocManage/publishComplaint'] ||
      loading.effects['evaluationDocManage/saveComplaint'],
    lineSaveLoading:
      loading.effects['evaluationDocManage/saveScoreSum'] ||
      loading.effects['evaluationDocManage/saveCoreDetail'] ||
      loading.effects['evaluationDocManage/saveEvalTplScopeSupplierList'],
    ...themeConfig,
  };
})
@formatterCollections({
  code: [
    'sslm.supplierDocManage',
    'sslm.commonApplication',
    'sslm.common',
    'sslm.evaluationTemplate',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_ADDMODAL',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_FILTER',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE_SEARCH',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SUMSCORE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTS_SUMSCORE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SEARCH',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER_BTNGROUP',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.TAB_PAN', // 标签页
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORING_COMPLETION',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.PARAM_VALUE_LIST', // 评分状态model表格
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDORLINE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
    'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDOR_BTN',
  ],
})
@remote(
  {
    code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL', // 欧瑞康src-26776二开埋点
    name: 'docManageRemote',
  },
  {
    events: {
      cuxHandleExecute() { }, // 二开执行评分按钮逻辑
      cuxHandleSubmit() { }, // 二开提交审批按钮逻辑
      cuxUpdateTableData() { }, // 二开处理表格数据更新
      cuxSaveValiate() { }, // 二开保存校验逻辑
    },
  }
)
export default class DocManageDetail extends Component {
  constructor(props) {
    super(props);
    const isPub = props.match.path.includes('/pub/');
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { evalLineIDS = '', pageReadOnly = 0 } = routerParam;
    this.state = {
      companyId: null,
      collapsed: true,
      visible: false,
      modalCode: null,
      popType: null,
      selectValue: null,
      tabRecord: {},
      tabKey: 'scoreDetail',
      evalTplId: props.match.params.tplId || null,
      evalTplName: null,
      isPub,
      evalTplType: '',
      paramVauleVisible: false,
      scoreDetailCurrentRecord: {},
      submitModalVisible: false,
      AttachmentModalVisible: false,
      userInfo: {},
      qualityVisible: !!props.match.params.headerId, // 质量整改显示隐藏标识
      headerId: props.match.params.headerId || null,
      finalCollectIdentificationValue: '1',
      supplierAppealFlag: false, // 供应商是否发起过申诉
      newAttachmentUuid: uuidv4(),
      scoreSumSelected: false, // 判断评分汇总tab是否勾选数据
      evalLineIDS,
      pageReadOnly: !!Number(pageReadOnly), // 角色工作台跳转,需要设置页面只读
      copySelectedRows: [], // 抄送人集合
      cuxLoading: false, // 二开按钮loading
    };
  }

  queryCuzData = []; // 缓存个性化页签查询方法

  // 存储tab页的this
  tabContent = {};

  /**
   * render 之后获取数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { headerId } = this.state;
    if (headerId) {
      this.handleRefresh();
    } else {
      // 新建默认带出主岗部门
      this.getUserDefaultMsg();
    }
    dispatch({
      type: 'evaluationDocManage/fetchValue',
    });
    // 获取当考评维度为“集团”的时候的维度值
    dispatch({
      type: 'evaluationDocManage/fetchGroupDimensionValue',
    });
    // 工作流审批通过回调
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
  }

  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/updateState',
      payload: {
        basicInfo: {},
        scoreDetail: [],
        scoreDetailPagination: {},
        scoreSum: [],
        scoreSumPagination: {},
        scoreVendor: [],
        scoreVendorPagination: {},
      },
    });
  }

  // 工作流审批回调
  @Bind()
  workflowSubmit(approveResult) {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        this.handleSave(true, resolve, reject);
      } else {
        resolve();
      }
    });
  }

  @Bind()
  async getUserDefaultMsg() {
    const { dispatch, docManageRemote } = this.props;
    dispatch({
      type: 'evaluationDocManage/getUserDefaultMsg',
    }).then(res => {
      if (res) {
        this.setState({
          userInfo: res,
        });
      }
    });
    // 埋点 修改后的初始化ds方法
    if (docManageRemote.event) {
      const eventProps = {
        that: this,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      await docManageRemote.event.fireEvent('cuxInitData', eventProps);
    }
  }

  // 处理埋点二开的按钮loading问题
  @Bind()
  handleCuxLoading(loading) {
    this.setState({ cuxLoading: loading });
  }

  /**
   * 组件更新时触发
   */
  componentDidUpdate(preProps, preState) {
    const { selectValue } = this.state;
    const {
      form: { setFieldsValue, getFieldDecorator = e => e, getFieldValue = e => e },
      evaluationDocManage: { groupDimensionValueObj },
    } = this.props;
    if (preState.selectValue !== selectValue) {
      const value =
        selectValue === 'GROUP'
          ? groupDimensionValueObj.groupId
          : getFieldValue('evalDimensionValue');
      getFieldDecorator('evalDimensionValue');
      getFieldDecorator('groupName');
      setFieldsValue({ evalDimensionValue: value, groupName: groupDimensionValueObj.groupName });
    }
    const newEvalDimension = getFieldValue('evalDimension');
    if (newEvalDimension || preState.selectValue) {
      if (newEvalDimension !== preState.selectValue) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          selectValue: newEvalDimension,
        });
      }
    }
  }

  /**
   * handleRefresh - 更新档案状态
   */
  @Bind()
  handleRefresh() {
    const {
      dispatch,
      match: { params },
      evaluationDocManage: {
        processValue = [], // 系统评分值集
        dtlValue = [], // 手工评分值集
        scoreDetailPagination,
      },
      form,
    } = this.props;
    // 处理导入成功后，查询接口分页参数为NaN问题
    const { current, pageSize } = scoreDetailPagination || {};
    const disPageFlag = isNaN(current) && isNaN(pageSize);
    if (this.tabContent && this.tabContent.props && this.tabContent.props.form) {
      const formValue = this.tabContent.props.form.getFieldsValue();
      const { completeFlag, indicatorIds } = formValue;

      //  当选择系统评分的数据时需要修改字段名为processStatus
      if (processValue.find(i => i.value === completeFlag)) {
        formValue.scoreType = 'SYSTEM';
        formValue.processStatus = completeFlag;
        formValue.completeFlag = null;
      } else if (dtlValue.find(i => i.value === completeFlag)) {
        formValue.scoreType = 'MANUAL';
        formValue.processStatus = null;
      }
      Object.assign(params, {
        ...formValue,
        indicatorIds: indicatorIds ? indicatorIds.split(',') : null,
        supplierIdList: isArray(formValue.supplierIdList)
          ? formValue.supplierIdList
          : formValue.supplierIdList
            ? formValue.supplierIdList.split(',')
            : formValue.supplierIdList,
      });
    }
    dispatch({
      type: 'evaluationDocManage/initial',
      payload: {
        ...params,
        page: disPageFlag ? {} : scoreDetailPagination,
      },
    }).then(res => {
      if (res) {
        if (this.tabContent && this.tabContent.setState) {
          this.tabContent.setState({
            selectedRowKeys: [],
            selectedRows: [],
            selectAllFlag: 0,
            unChooseEvalDtlIds: [],
            activeRows: {},
          });
        }
        this.setState(
          {
            selectValue: null,
            supplierAppealFlag: !!res.supplierAppealFlag,
            copySelectedRows: res.userNames,
          },
          () => {
            // 查询完数据重置表单值，解决调用集团集维度用setFieldsValue后，值不干净问题
            form.resetFields();
          }
        );
        this.handleSearch({}, 'scoreSum');
        this.handleSearch({}, 'scoreVendor');
        if (this.quality) this.quality.queryQuality();
      }
    });
    this.queryComplaintSituation();
  }

  /**
   * 保存已填写的档案信息
   */
  @Bind()
  async handleSave(flag, resolve = () => { }, reject = () => { }) {
    const { isPub, evalTplId, companyId, headerId } = this.state;
    const {
      dispatch,
      docManageRemote,
      form: { getFieldsValue, validateFields },
      evaluationDocManage: { basicInfo = {}, scoreVendor, granularity, scoreSum, scoreDetail },
    } = this.props;
    const { checkDetailFlag, checkLevelFlag, evalStatus } = basicInfo;
    const kpiEvalLineList = getEditTableData(scoreVendor);
    const collectKpiEvalLines = getEditTableData(scoreSum);
    const kpiEvalDetailLines = [];
    const errMessage = [];
    getEditTableData(scoreDetail).forEach(record => {
      const { dtlObjectVersionNumber, objectVersionNumber, ...others } = record;
      kpiEvalDetailLines.push({
        ...others,
        objectVersionNumber: dtlObjectVersionNumber,
      });
    });
    const showSaveDetailButton =
      ((checkDetailFlag || checkLevelFlag) && evalStatus === 'FINAL_COLLECTED') ||
      evalStatus === 'SYSTEM_FAIL';
    const showCollectButton = docManageRemote.process(
      'SSLM.EVALUATION_DOC_MANAGE_DETAIL_SAVE_SHOW_COLLECT_BUTTON',
      evalStatus === 'FINAL_COLLECTED',
      { _this: this }
    );
    let validateFlag = true;
    if (granularity !== 'SU') {
      for (const key in kpiEvalLineList) {
        if (Object.prototype.hasOwnProperty.call(kpiEvalLineList, key)) {
          const { categoryVOS, itemVOS } = kpiEvalLineList[key];
          const Data = granularity === 'SU+CA' ? categoryVOS : itemVOS;
          if (granularity === 'SU+CA') {
            if (!(Array.isArray(Data) && Data.length)) {
              errMessage.push(kpiEvalLineList[key].supplierName);
              validateFlag = false;
              break;
            }
          } else if (!(Array.isArray(Data) && !isEmpty(Data.filter(item => item.insertFlag)))) {
            errMessage.push(kpiEvalLineList[key].supplierName);
            validateFlag = false;
            break;
          }
        }
      }
    }
    if (!validateFlag) {
      const errMsg = `[${errMessage.join(',')}]`;
      notification.error({
        message:
          granularity === 'SU+CA'
            ? errMsg +
            intl.get('sslm.supplierDocManage.view.message.noCategoryVos').d('参评品类不能为空！')
            : errMsg +
            intl.get('sslm.supplierDocManage.view.message.noItemVos').d('参评物料不能为空！'),
      });
      return false;
    }
    const data = getFieldsValue();
    const { evalDateFrom, evalDateTo, trxLineFlag, appealDeadlineTime, ...others } = data;
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const cuxRes = await docManageRemote.event.fireEvent('cuxSaveValiate', {
      isPub,
      collectKpiEvalLines,
      resolve,
      reject,
      _this: this,
    });
    if (!cuxRes) {
      return;
    }
    return new Promise((saveResolve, saveReject) => {
      validateFields(err => {
        if (!err) {
          dispatch({
            type: 'evaluationDocManage/saveInfo',
            payload: {
              evalTplId,
              evalHeaderId: headerId,
              ...filterNullValueObject({
                ...basicInfo,
                companyId,
              }),
              ...others,
              kpiEvalLineList,
              collectKpiEvalLines: showCollectButton ? collectKpiEvalLines : null,
              kpiEvalDetailLines: showSaveDetailButton ? kpiEvalDetailLines : null,
              evalDateFrom: evalDateFrom ? evalDateFrom.format(DATETIME_MIN) : null,
              evalDateTo: evalDateTo ? evalDateTo.format(DATETIME_MAX) : null,
              appealDeadlineTime: appealDeadlineTime
                ? appealDeadlineTime.format(DEFAULT_DATETIME_FORMAT)
                : null,
              customizeUnitCode:
                'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREVENDORLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
            },
          }).then(res => {
            if (res) {
              if (flag) {
                notification.success();
                if (headerId) {
                  this.handleRefresh();
                  resolve();
                } else {
                  dispatch(
                    routerRedux.push({
                      pathname: `/sslm/evaluation-doc-manage/detail/${evalTplId}/${res.evalHeaderId}`,
                    })
                  );
                }
              } else {
                // 执行评分
                this.handleExecutionScore(res.evalHeaderId);
              }
            } else {
              reject(new Error(res));
              saveReject();
            }
          });
        } else {
          saveReject();
        }
      });
    });
  }

  /**
   * 执行评分
   */
  @Bind()
  handleScore() {
    this.handleSave(false);
  }

  /**
   * 提交新建审批
   */
  @Bind()
  submitNewApproval() {
    const { evalTplId, companyId, headerId } = this.state;
    const {
      dispatch,
      form: { getFieldsValue, validateFields },
      evaluationDocManage: { basicInfo = {}, scoreVendor, granularity, scoreSum, scoreDetail },
    } = this.props;
    const { checkDetailFlag, checkLevelFlag, evalStatus } = basicInfo;
    const kpiEvalLineList = getEditTableData(scoreVendor);
    const collectKpiEvalLines = getEditTableData(scoreSum);
    const kpiEvalDetailLines = [];
    const errMessage = [];
    getEditTableData(scoreDetail).forEach(record => {
      const { dtlObjectVersionNumber, objectVersionNumber, ...others } = record;
      kpiEvalDetailLines.push({
        ...others,
        objectVersionNumber: dtlObjectVersionNumber,
      });
    });
    const showSaveDetailButton =
      (checkDetailFlag || checkLevelFlag) && evalStatus === 'FINAL_COLLECTED';
    const showCollectButton = evalStatus === 'FINAL_COLLECTED';
    let validateFlag = true;
    if (granularity !== 'SU') {
      for (const key in kpiEvalLineList) {
        if (Object.prototype.hasOwnProperty.call(kpiEvalLineList, key)) {
          const { categoryVOS, itemVOS } = kpiEvalLineList[key];
          const Data = granularity === 'SU+CA' ? categoryVOS : itemVOS;
          if (granularity === 'SU+CA') {
            if (!(Array.isArray(Data) && Data.length)) {
              errMessage.push(kpiEvalLineList[key].supplierName);
              validateFlag = false;
              break;
            }
          } else if (!(Array.isArray(Data) && !isEmpty(Data.filter(item => item.insertFlag)))) {
            errMessage.push(kpiEvalLineList[key].supplierName);
            validateFlag = false;
            break;
          }
        }
      }
    }
    if (!validateFlag) {
      const errMsg = `[${errMessage.join(',')}]`;
      notification.error({
        message:
          granularity === 'SU+CA'
            ? errMsg +
            intl.get('sslm.supplierDocManage.view.message.noCategoryVos').d('参评品类不能为空！')
            : errMsg +
            intl.get('sslm.supplierDocManage.view.message.noItemVos').d('参评物料不能为空！'),
      });
      return false;
    }
    const data = getFieldsValue();
    const { evalDateFrom, evalDateTo, trxLineFlag, appealDeadlineTime, ...others } = data;
    validateFields(err => {
      if (!err) {
        dispatch({
          type: 'evaluationDocManage/submitNewApproval',
          payload: {
            evalTplId,
            evalHeaderId: headerId,
            ...filterNullValueObject({
              ...basicInfo,
              companyId,
            }),
            ...others,
            kpiEvalLineList,
            collectKpiEvalLines: showCollectButton ? collectKpiEvalLines : null,
            kpiEvalDetailLines: showSaveDetailButton ? kpiEvalDetailLines : null,
            evalDateFrom: evalDateFrom ? evalDateFrom.format(DATETIME_MIN) : null,
            evalDateTo: evalDateTo ? evalDateTo.format(DATETIME_MAX) : null,
            appealDeadlineTime: appealDeadlineTime
              ? appealDeadlineTime.format(DEFAULT_DATETIME_FORMAT)
              : null,
            customizeUnitCode:
              'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleRefresh();
          }
        });
      }
    });
  }

  @Bind()
  async handleExecutionScore(evalHeaderId) {
    const {
      form,
      dispatch,
      docManageRemote,
      evaluationDocManage: { basicInfo },
    } = this.props;

    if (docManageRemote?.event) {
      const eventProps = {
        form,
        basicInfo,
        evalHeaderId,
        onRefresh: this.handleRefresh,
        setLoading: this.handleCuxLoading,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await docManageRemote.event.fireEvent('cuxHandleExecute', eventProps);
      if (!res) {
        return;
      }
    }
    dispatch({
      type: 'evaluationDocManage/executeScore',
      payload: {
        evalHeaderId,
      },
    }).then(res => {
      if (res) {
        notification.success();
      }
      this.handleRefresh();
    });
  }

  /**
   * 汇总统计check
   */
  @Bind()
  handleSumCheck() {
    const {
      dispatch,
      evaluationDocManage: { basicInfo = {} },
    } = this.props;
    const obj = { evalHeaderId: basicInfo.evalHeaderId };
    dispatch({
      type: 'evaluationDocManage/sumStatisticsCheck',
      payload: obj,
    }).then(res => {
      if (res) {
        const { cherkErrorMessage } = res;
        if (cherkErrorMessage) {
          // 弹窗
          Modal.confirm({
            title: intl
              .get('sslm.common.view.message.scoreSumConfirmCheck', {
                name: cherkErrorMessage,
              })
              .d(`指标【${cherkErrorMessage}】汇总后的分数超出指标定义中维护的区间范围`),
            content: (
              <RadioGroup
                defaultValue="1"
                onChange={e => this.setState({ finalCollectIdentificationValue: e.target.value })}
              >
                <Radio value="1">
                  {intl.get('sslm.common.view.message.scoreSection').d('取指标区间最大值/最小值')}
                </Radio>
                <Radio value="0">
                  {intl.get('sslm.common.view.message.scoreRetain').d('保留计算分数')}
                </Radio>
              </RadioGroup>
            ),
            onOk: () => {
              this.handleSum(this.state.finalCollectIdentificationValue);
            },
          });
        } else {
          this.handleSum();
        }
      }
    });
  }

  /**
   * 汇总统计
   */
  @Bind()
  handleSum(param) {
    const {
      dispatch,
      evaluationDocManage: { basicInfo = {} },
    } = this.props;
    if (basicInfo.abandonedFlag) {
      Modal.confirm({
        title: intl
          .get('sslm.common.view.message.scoreSumConfirm')
          .d('存在评分人放弃评分，请确认是否继续汇总？'),
        onOk: () => {
          dispatch({
            type: 'evaluationDocManage/sumStatistics',
            payload: {
              evalHeaderId: basicInfo.evalHeaderId,
              finalCollectIdentification: param ? this.state.finalCollectIdentificationValue : null,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleRefresh();
            }
          });
        },
      });
    } else {
      dispatch({
        type: 'evaluationDocManage/sumStatistics',
        payload: {
          evalHeaderId: basicInfo.evalHeaderId,
          finalCollectIdentification: param ? this.state.finalCollectIdentificationValue : null,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleRefresh();
          this.queryCuzTabData();
        }
      });
    }
  }

  // 申诉 发布
  @Bind()
  publishComplaint(selectedRows, callback) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/publishComplaint',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        callback();
        notification.success();
        this.queryComplaintSituation();
      }
    });
  }

  // '供应商申诉情况'发布按钮回调
  @Bind()
  handlePublishComplaint(selectedRows, callback) {
    const editData = getEditTableData(selectedRows);
    // 判断【申诉说明】，【采购方回复】是否填写
    let isMaintain = false;
    editData.forEach(n => {
      if (!n.appealCheckCollectScore || !n.appealReply) {
        isMaintain = true;
        return false;
      }
    });
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.modal.notSelectRows')
          .d('未勾选需要发布的行数据，请检查'),
      });
    } else if (isMaintain) {
      Modal.confirm({
        title: intl
          .get('sslm.supplierDocManage.view.title.complaintPublishMsg')
          .d('未修改分数或未给出采购方回复意见，请确认是否继续发布'),
        onOk: () => this.publishComplaint(editData, callback),
      });
    } else {
      this.publishComplaint(editData, callback);
    }
  }

  // '供应商申诉情况'保存按钮回调
  @Bind()
  savePublishComplaint(callback) {
    const {
      dispatch,
      evaluationDocManage: { complaintDataSource, complaintPagination },
    } = this.props;
    dispatch({
      type: 'evaluationDocManage/saveComplaint',
      payload: getEditTableData(complaintDataSource),
    }).then(res => {
      if (res) {
        callback();
        notification.success();
        this.queryComplaintSituation(complaintPagination);
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePublish() {
    const {
      dispatch,
      form: { getFieldsValue },
      evaluationDocManage: {
        basicInfo: { kpiEvalDetailLineDTOList, kpiEvalDetailLineDTOPage, ...rest } = {},
      },
    } = this.props;
    const { scoreSumSelected } = this.state;
    confirm({
      title: intl.get(`sslm.supplierDocManage.view.modal.confirmRelease`).d('确认发布'),
      content: intl
        .get('sslm.supplierDocManage.view.modal.confirmReleaseContent')
        .d('发布后分数将分别公布至参评供应商查看，确定发布吗？'),
      onOk: () => {
        const scoreSumSelectRows = this.scoreSumTab?.state?.selectedRows || [];
        const notOperateList = scoreSumSelectRows.filter(n =>
          [
            'published',
            'appealing',
            'appealApprovaling',
            'appealApprovaRejected',
            'supplierConfirmed',
          ].includes(n.lineStatus)
        );
        if (!isEmpty(notOperateList)) {
          notification.warning({
            message: intl
              .get('sslm.supplierDocManage.view.message.notPublished')
              .d('存在行数据结果申诉审批中、申诉审批拒绝、已发布或正在申诉中，请勿重复操作'),
          });
        } else {
          const data = getFieldsValue();
          const { appealDeadline, appealDeadlineTime, appealLimit } = data;
          dispatch({
            type: 'evaluationDocManage/publish',
            payload: {
              ...rest,
              kpiEvalLineList: scoreSumSelected ? scoreSumSelectRows : [],
              appealDeadline: appealDeadline || null,
              appealDeadlineTime: appealDeadlineTime
                ? appealDeadlineTime.format(DEFAULT_DATETIME_FORMAT)
                : null,
              appealLimit: appealLimit || null,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleScoreSumSelected(false);
              this.handleRefresh();
            }
          });
        }
      },
    });
  }

  /**
   * 重新计算
   */
  @Bind()
  handleRecalculate() {
    const {
      dispatch,
      evaluationDocManage: { basicInfo: { evalHeaderId } = {} },
    } = this.props;
    confirm({
      title: intl.get(`sslm.supplierDocManage.view.modal.confirmRecalculate`).d('确认重新计算'),
      content: intl
        .get('sslm.supplierDocManage.view.modal.confirmRecalculateContent')
        .d('将重新计算所有系统计算指标的得分，请确认'),
      onOk: () => {
        dispatch({
          type: 'evaluationDocManage/recalculate',
          payload: {
            evalHeaderId,
          },
        }).then(res => {
          if (res) {
            notification.success();
          }
          this.handleRefresh();
        });
      },
    });
  }

  /**
   * 提交审批
   */
  @Bind()
  async handleSubmitReview() {
    // 校验评分汇总数据，可能个性化配置必填
    const {
      form,
      docManageRemote,
      evaluationDocManage: { scoreSum, basicInfo },
    } = this.props;
    const data = getEditTableData(scoreSum);
    // 判断是否显示评分汇总页签，页签隐藏时不校验
    const existFormFlag = !!scoreSum.find(d => d.$form);
    const eventProps = {
      form,
      basicInfo,
      onSubmit: this.handleSubmit,
      collectKpiEvalLines: data,
    };

    const isEditing = !!scoreSum.find(d => d._status === 'create' || d._status === 'update');
    if (isEditing && existFormFlag) {
      if (Array.isArray(data) && data.length !== 0) {
        if (docManageRemote && docManageRemote.event) {
          // 默认返回true,当返回false时走二开逻辑不走标准逻辑
          const res = await docManageRemote.event.fireEvent('cuxHandleSubmit', eventProps);
          if (!res) {
            return;
          }
        }
        this.setState({
          submitModalVisible: true,
        });
      } else {
        notification.warning({
          message: intl.get('sslm.common.notification.message.required').d('存在必填字段未填写！'),
        });
      }
    } else {
      if (docManageRemote && docManageRemote.event) {
        // 默认返回true,当返回false时走二开逻辑不走标准逻辑
        const res = await docManageRemote.event.fireEvent('cuxHandleSubmit', eventProps);
        if (!res) {
          return;
        }
      }
      this.setState({
        submitModalVisible: true,
      });
    }
  }

  @Bind()
  hideSubmitModal() {
    this.setState({ submitModalVisible: false });
  }

  // 处理提交审批
  @Bind()
  handleSubmit(radioValue) {
    const {
      form: { validateFields },
      dispatch,
      evaluationDocManage: { basicInfo = {}, scoreSum = [], scoreDetail },
    } = this.props;
    const { kpiEvalDetailLineDTOList, kpiEvalDetailLineDTOPage, ...others } = basicInfo;
    const collectKpiEvalLines = getEditTableData(scoreSum);
    const kpiEvalDetailLines = [];
    getEditTableData(scoreDetail).forEach(record => {
      const { dtlObjectVersionNumber, objectVersionNumber, ...othersRecord } = record;
      kpiEvalDetailLines.push({
        ...othersRecord,
        objectVersionNumber: dtlObjectVersionNumber,
      });
    });
    const showSaveDetailButton =
      (basicInfo.checkDetailFlag || basicInfo.checkLevelFlag) &&
      basicInfo.evalStatus === 'FINAL_COLLECTED';
    const showCollectButton = basicInfo.evalStatus === 'FINAL_COLLECTED';
    validateFields((error, values) => {
      if (!error) {
        const { trxLineFlag, ...otherValues } = values;
        dispatch({
          type: 'evaluationDocManage/handleSubmit',
          payload: {
            ...others,
            ...filterNullValueObject(otherValues),
            autoPushVendorFlag: radioValue,
            customizeUnitCode:
              'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUMLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE,SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
            collectKpiEvalLines: showCollectButton ? collectKpiEvalLines : null,
            kpiEvalDetailLines: showSaveDetailButton ? kpiEvalDetailLines : null,
          },
        }).then(res => {
          if (res) {
            this.setState({ submitModalVisible: false });
            notification.success();
            this.handleRefresh();
          }
        });
      }
    });
  }

  /**
   * 作废
   */
  @Bind()
  handleDestroy() {
    const {
      dispatch,
      evaluationDocManage: { basicInfo = {} },
    } = this.props; // 页面/档案的 id 在 basicInfo 对象中
    Modal.confirm({
      title: intl
        .get(`sslm.supplierDocManage.model.evalDocManage.destroyConfirm`)
        .d('确认作废档案'),
      onOk: () => {
        if (basicInfo.evalHeaderId) {
          // 作废已存在的档案
          dispatch({
            type: 'evaluationDocManage/deleteRecords',
            payload: [basicInfo],
          }).then(res => {
            if (res) {
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/evaluation-doc-manage/list`,
                })
              );
            }
          });
        } else {
          // 作废不存在的档案，即在汇总页面点击新建跳转到详情页面后没有保存档案
          dispatch(
            routerRedux.push({
              pathname: `/sslm/evaluation-doc-manage/list`,
            })
          );
        }
      },
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleViewLog() {
    this.setState({
      visible: true,
      modalCode: 'viewLog',
    });
  }

  /**
   * 打开评分人 modal || 评分状态 modal || 汇总评分 modal || 采购品类明细 modal
   * @param {string} index - 点击的列
   * @param {object} record - 行数据
   * @param {object} popType - 弹窗类型
   */
  @Bind()
  handleOpenModal(index = '', record = {}, popType = '') {
    this.setState({
      visible: true,
      modalCode: index,
      tabRecord: record,
      popType,
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  closeParamVauleModal() {
    this.setState({
      paramVauleVisible: false,
      scoreDetailCurrentRecord: {},
    });
  }

  /**
   * 打开 modal
   */
  @Bind()
  openParamVauleModal(record) {
    const { dispatch } = this.props;
    const { evalDtlId = '' } = record;
    dispatch({
      type: 'evaluationDocManage/queryEvaluationStatus',
      payload: {
        evalDtlId,
        page: {},
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.PARAM_VALUE_LIST',
      },
    });
    this.setState({
      paramVauleVisible: true,
      scoreDetailCurrentRecord: record,
    });
  }

  /**
   * 加载 modal 数据
   * @param {string} code - 加载的 modal 标识
   * @param {?object} page - modal 的分页信息
   * @returns {object} [promise] - dispatch 之后得到的 promise 对象
   */
  @Bind()
  handleLoadModal(code = '', page = {}) {
    const { tabRecord, popType } = this.state;
    const { evalDtlId, evalLineId, supplierId } = tabRecord;
    const {
      dispatch,
      evaluationDocManage: { basicInfo = {} },
    } = this.props;
    const typeObj = {
      evaluationPerson: 'evaluationDocManage/fetchEvaluationPerson',
      evaluationStatus: 'evaluationDocManage/fetchEvaluationStatus',
      sumScore: 'evaluationDocManage/fetchModalScoreDetail',
      productName: 'evaluationDocManage/fetchProductDetail',
      viewLog: 'evaluationDocManage/fetchActivityLog',
    };
    const dataObj = {
      evaluationPerson: {
        evalDtlId,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON',
      },
      evaluationStatus: {
        evalDtlId,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORING_COMPLETION',
      },
      sumScore: {
        evalLineId,
        customizeUnitCode:
          popType === 'complaints'
            ? 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTS_SUMSCORE'
            : 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SUMSCORE',
      },
      productName: { headerId: basicInfo.evalHeaderId, supplierId, evalLineId },
      viewLog: { headerId: basicInfo.evalHeaderId },
    };
    if (code === 'productName') {
      dispatch({
        type: 'evaluationDocManage/updateState',
        payload: {
          productInfo: {
            productCode: tabRecord.categoryCode,
            productName: tabRecord.categoryName,
          },
        },
      });
    }
    return dispatch({
      type: typeObj[code],
      payload: {
        page,
        ...dataObj[code],
      },
    });
  }

  /**
   *保存评分人详细 modal 数据
   *
   * @param {object[]} [addDataList=[]] - 需要添加的评分人详细数据列表
   * @memberof DocManageDetail
   * @return promise
   */
  @Bind()
  handleSaveEvaluationPerson(addDataList = []) {
    const { tabRecord } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'evaluationDocManage/addEvaluationPerson',
      payload: {
        evalDtlId: tabRecord.evalDtlId,
        addDataList,
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.EVALUATIONPERSON',
      },
    });
  }

  /**
   * 按钮状态变更
   * @param {string} btn - 指示是哪个按钮
   */
  @Bind()
  getButtonStatus(btn = '') {
    const {
      evaluationDocManage: {
        basicInfo: { evalStatus },
      },
    } = this.props;
    const obj = {
      score: {
        NEW: false,
        SYSTEM_FAIL: false,
      },
      sum: {
        MANUAL_COMPLETE: false,
      },
      publish: {
        PARTIAL_PUBLISHED: false,
        APPEALING: false,
      },
      submit: {
        FINAL_COLLECTED: false,
        REJECTED: false,
      },
      // 除了已发布，已完成，评分中，其余状态都允许作废
      destroy: {
        NEW: false,
        SYSTEM_PROCESSING: false,
        SYSTEM_COMPLETE: false,
        SYSTEM_FAIL: false,
        BACK_SCORE: false,
        MANUAL_EVALUATING: false,
        MANUAL_COMPLETE: false,
        FINAL_COLLECTED: false,
        REJECTED: false,
        NEW_APPROVED: false,
        NEW_REJECTED: false,
      },
      qualityRectify: {
        FINAL_COLLECTED: false,
        APPROVING: false,
        COMPLETED: false,
        PUBLISHED: false,
        REJECTED: false,
        SUPPLIER_CONFIRMED: false,
      },
    };
    return isUndefined(obj[btn][evalStatus]);
  }

  /**
   * 切换 tab 并请求数据
   * @param {string} activeKey - 当前 tab 的key
   */
  @Bind()
  handleTabChange(activeKey = '') {
    this.setState({
      tabKey: activeKey,
    });
    // this.handleSearch({}, activeKey);
  }

  /**
   *查询 table 数据
   * @param {object} fields - 查询的字段
   * @param {string} tabKey - 所在tab页
   * @memberof DocManageDetail
   */
  @Bind()
  handleSearch(fields = {}, tabKey = '') {
    const { dispatch, docManageRemote } = this.props;
    const { headerId } = this.state;
    const data = filterNullValueObject(fields);
    const keyObj = {
      scoreDetail: 'evaluationDocManage/initial',
      scoreSum: 'evaluationDocManage/fetchScoreSum',
      scoreVendor: 'evaluationDocManage/fetchScoreVendor',
    };
    const sortOrder = data.sortOrder ? { sortOrder: data.sortOrder } : {}; // 只在tab评分汇总有排序功能
    const params = { ...data, headerId, ...sortOrder };
    const payload = docManageRemote.process(
      'SSLM.EVALUATION_DOC_MANAGE_DETAIL_LINES_INIT_QUERY_PARAMS',
      params,
      { tabKey, _this: this }
    );
    return dispatch({
      type: keyObj[tabKey],
      payload,
    }).then(res => {
      if (res) {
        docManageRemote.event.fireEvent('cuxUpdateTableData', { res, tabKey, _this: this });
      }
    });
  }

  /**
   * collapse 的折叠与展开
   */
  @Bind()
  handleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  /**
   * handleSelectChange - 考评维度下拉框改变时触发
   * @param {string} value - 当前选择的值
   */
  @Bind()
  handleSelectChange(value) {
    const {
      form: { setFieldsValue = e => e, getFieldDecorator = e => e, getFieldValue = () => { } },
    } = this.props;
    getFieldDecorator('evalDimensionValue');
    this.setState({
      selectValue: value,
    });
    if (getFieldValue('docType') === 'XY') {
      setFieldsValue({ docNum: undefined });
    }
    setFieldsValue({ evalDimensionValue: undefined });
  }

  /**
   * getDimensionValue - 每次 render 时得到维度值 lov
   */
  @Bind()
  getDimensionValue(evalDisabled) {
    const { tenantId } = getCurrentTenant();
    const { selectValue, evalTplId, evalDimensionValueMeaning } = this.state;
    const {
      form: { getFieldDecorator },
      evaluationDocManage: { basicInfo = {}, groupDimensionValueObj = {} },
      docManageRemote,
    } = this.props;

    // 埋点返回值集编码
    const remoteLovParams = {
      selectValue,
    };
    const remoteLovCode =
      (docManageRemote &&
        docManageRemote.process &&
        docManageRemote.process(
          'SSLM.EVALUATION_DOC_MANAGE_DETAIL_HEADER_LOV_CODE',
          {},
          remoteLovParams
        )) ||
      {};
    const companyLovCode =
      !isEmpty(remoteLovCode) && remoteLovCode.COMPANY
        ? remoteLovCode.COMPANY
        : 'SSLM.KPI_EVAL_DIM_COMPANY';
    const obj = {
      GROUP: {
        textValue: groupDimensionValueObj.groupName,
        code: 'SSLM.KPI_EVAL_DIM_GROUP',
        queryParams: { tenantId },
        textField: 'groupName',
      },
      COMPANY: {
        textValue: evalDimensionValueMeaning || basicInfo.evalDimensionValueMeaning,
        code: companyLovCode,
        queryParams: { evalTplId, tenantId },
      },
      PU: {
        textValue: evalDimensionValueMeaning || basicInfo.evalDimensionValueMeaning,
        code: 'SSLM.KPI_EVAL_DIM_PURORG',
        queryParams: { tenantId },
      },
      IU: {
        textValue: evalDimensionValueMeaning || basicInfo.evalDimensionValueMeaning,
        code: 'SSLM.KPI_EVAL_DIM_INVORG',
        queryParams: { tenantId, evalTplId },
      },
    };
    return obj[selectValue] && !evalDisabled ? (
      <Form.Item
        {...formItemLayout}
        label={intl.get(`sslm.supplierDocManage.model.evalDocManage.levelValue`).d('维度值')}
      >
        {getFieldDecorator('evalDimensionValue', {
          initialValue: isEmpty(basicInfo) ? undefined : basicInfo.evalDimensionValue,
          rules: [
            {
              required: true,
              message: intl.get(`hzero.common.validation.notNull`, {
                name: intl.get(`sslm.supplierDocManage.model.evalDocManage.levelValue`).d('维度值'),
              }),
            },
          ],
        })(<Lov {...obj[selectValue]} onChange={this.handleDimValueChange} />)}
      </Form.Item>
    ) : (
      <Form.Item
        {...formItemLayout}
        label={intl.get('sslm.supplierDocManage.model.evalDocManage.levelValue').d('维度值')}
      >
        {getFieldDecorator('evalDimensionValue', {
          initialValue: isEmpty(basicInfo) ? undefined : basicInfo.evalDimensionValue,
        })(<div>{basicInfo.evalDimensionValueMeaning}</div>)}
      </Form.Item>
    );
  }

  // 自动考评查询
  @Bind()
  fetchEvaluationAuto(evalTplId) {
    const { dispatch, form } = this.props;
    return dispatch({
      type: 'evaluationDocManage/queryEvaluationAuto',
      evalTplId,
    }).then(res => {
      if (!isEmpty(res)) {
        // 自动考评有返回值，手动204无返回
        form.setFieldsValue({
          evalCycle: res.evalCycle,
          evalDateFrom: res.evalDateFrom ? moment(res.evalDateFrom, DEFAULT_DATE_FORMAT) : null,
          evalDateTo: res.evalDateTo ? moment(res.evalDateTo, DEFAULT_DATE_FORMAT) : null,
          evalRuleRemark: res.evalRuleRemark,
          remark: res.evalRemark,
          evalName: `${res.evalName}${moment(res.evalTgrExecuteDate).format(DEFAULT_DATE_FORMAT)}`,
        });
      }
    });
  }

  /**
   * handleLovChange - 当考评模板 lov 改变时触发
   * @param {string} val - 选择的lov值
   * @param {object} lovRecord - 选择的lov行数据
   */
  @Bind()
  async handleLovChange(val, lovRecord = {}) {
    const { form, docManageRemote } = this.props;
    // 埋点 修改后的初始化ds方法
    if (docManageRemote.event) {
      const eventProps = {
        that: this,
        val,
        lovRecord,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await docManageRemote.event.fireEvent('cuxHandleLovChange', eventProps);
      if (!res) {
        return;
      }
    }
    this.setState({
      evalTplId: lovRecord.evalTplId,
      evalTplName: lovRecord.evalTplName,
      selectValue: lovRecord.evalDimension,
      evalTplType: lovRecord.evalTplType,
      evalDimensionValueMeaning: lovRecord.evalDimensionValueMeaning,
    });
    this.fetchEvaluationAuto(lovRecord.evalTplId);
    form.setFieldsValue({
      evalDimension: lovRecord.evalDimension,
      docType: null,
      docNum: null,
      evalDimensionValue: lovRecord.evalDimensionValue,
    });
  }

  /**
   * handleDimValueChange - 当维度值lov改变时触发
   * @param {string} val - 选择的lov值
   * @param {object} lovRecord - 选择的lov行数据
   */
  @Bind()
  handleDimValueChange(val, lovRecord) {
    const { selectValue } = this.state;
    const { form } = this.props;
    if (selectValue === 'COMPANY' || selectValue === 'IU') {
      this.setState({
        companyId: lovRecord.companyId,
      });
    } else {
      this.setState({
        companyId: null,
      });
    }
    if (selectValue === 'COMPANY' && form.getFieldValue('docType') === 'XY') {
      form.setFieldsValue({ docNum: undefined });
    }
    form.setFieldsValue({ evalDimensionValue: val });
  }

  /**
   * 退回评分回调
   * （弃用）
   */
  @Bind()
  handleBackScore() {
    const {
      dispatch,
      evaluationDocManage: {
        basicInfo = {},
        processValue = [], // 系统评分值集
        dtlValue = [], // 手工评分值集
      },
    } = this.props;
    const { selectedRowKeys = [], selectAllFlag, unChooseEvalDtlIds = [] } = this.tabContent.state;
    const { getFieldsValue } = this.tabContent.props.form || {};
    // 退回评分全选是需要根据查询条件来退回
    const params = getFieldsValue();
    const { completeFlag } = params;
    //  当选择系统评分的数据时需要修改字段名为processStatus
    if (processValue.find(i => i.value === completeFlag)) {
      params.scoreType = 'SYSTEM';
      params.processStatus = completeFlag;
      params.completeFlag = null;
    } else if (dtlValue.find(i => i.value === completeFlag)) {
      params.scoreType = 'MANUAL';
      params.processStatus = null;
    }
    if (isEmpty(selectedRowKeys)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.chooseAtLeastOne')
          .d('请至少选择一条评分明细'),
      });
    } else {
      dispatch({
        type: 'evaluationDocManage/handleBackScore',
        payload: {
          evalHeaderId: basicInfo.evalHeaderId,
          body: {
            kpiEvalDtlIdList: selectedRowKeys,
            selectAllFlag,
            unChooseEvalDtlIds,
            ...filterNullValueObject(params),
          },
        },
      }).then(res => {
        if (res) {
          this.tabContent.state.selectedRowKeys = [];
          notification.success();
          this.handleRefresh();
        }
      });
    }
  }

  // 退回评分确认回调
  @Bind()
  handleBackScoreOk(params) {
    const { dispatch } = this.props;
    if (!isUndefined(this.backScore)) {
      return backScoreSave({
        dispatch,
        dataSet: this.backScore.dataSet,
        onRefresh: this.handleRefresh,
        ...params,
      });
    }
  }

  // 退回评分弹框
  @Bind()
  backScoreModal() {
    const {
      match: {
        params: { headerId },
      },
      evaluationDocManage: { basicInfo = {}, granularity },
    } = this.props;
    const { evalTplId } = basicInfo;

    C7nModal.open({
      closable: true,
      drawer: true,
      key: C7nModal.key(),
      style: { width: 900 },
      onOk: () => this.handleBackScoreOk({ headerId, evalTplId }),
      title: intl.get('sslm.common.view.button.backScore').d('退回评分'),

      children: (
        <BackScore
          evalTplId={evalTplId}
          headerId={headerId}
          granularity={granularity}
          onRef={node => {
            this.backScore = node;
          }}
        />
      ),
    });
  }

  /*
   *开始日期,考评周期决定日期至
   */
  @Bind()
  dateGet(dateFrom, newEvalCycle) {
    const DateFrom = dateFrom || this.props.form.getFieldValue('evalDateFrom');
    const evalCycle = newEvalCycle || this.props.form.getFieldValue('evalCycle');
    if (!isEmpty(DateFrom)) {
      if (evalCycle === 'MONTH') {
        const DateTo = moment(DateFrom)
          .add(1, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'QUARTER') {
        const DateTo = moment(DateFrom)
          .add(3, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'HALF-YEAR') {
        const DateTo = moment(DateFrom)
          .add(6, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'YEAR') {
        const DateTo = moment(DateFrom)
          .add(12, 'months')
          .subtract(1, 'days');
        return DateTo;
      }
    }
  }

  /*
   * 考评周期从默认值
   */
  @Bind()
  handleEvalDateFrom(evalCycle) {
    const { form } = this.props;
    if (evalCycle === 'MONTH') {
      const evalDateFrom = moment().startOf('month');
      form.setFieldsValue({ evalDateFrom });
    } else if (evalCycle === 'QUARTER') {
      const evalDateFrom = moment().startOf('quarter');
      form.setFieldsValue({ evalDateFrom });
    } else if (evalCycle === 'HALF-YEAR') {
      const currentMonth = moment().month();
      const evalDateFrom =
        currentMonth > 5
          ? moment()
            .startOf('year')
            .add(6, 'months')
          : moment().startOf('year');
      form.setFieldsValue({ evalDateFrom });
    } else if (evalCycle === 'YEAR') {
      const evalDateFrom = moment().startOf('year');
      form.setFieldsValue({ evalDateFrom });
    }
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttachmentModal() {
    const { AttachmentModalVisible } = this.state;
    this.setState({ AttachmentModalVisible: !AttachmentModalVisible });
  }

  /**
   * 跳转质量整改单页面
   */
  @Bind()
  goToQualityRectification() {
    const { dispatch, history } = this.props;
    const { headerId } = this.state;
    const { selectedRows = [] } = (this.scoreSumTab && this.scoreSumTab.state) || {};
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.scoreSumAtLeastOne')
          .d('请至少选择一条评分汇总'),
      });
    } else {
      dispatch({
        type: 'evaluationDocManage/queryProblemHeader',
        payload: {
          evalHeaderId: headerId,
          body: selectedRows.map(i => i.evalLineId),
        },
      }).then(res => {
        if (res) {
          // 清空评分汇总勾选值
          if (this.scoreSumTab) {
            this.scoreSumTab.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
          }
          const { problemHeaderId, problemStatus } = res;
          if (problemStatus === 'NEW') {
            history.push(`/sqam/create8D/detail/${problemHeaderId}`);
          } else {
            history.push(`/sqam/initiated8D/detail/${problemHeaderId}`);
          }
        }
      });
    }
  }

  /**
   * 质量整改是否隐藏
   */
  @Bind()
  setQualityVisible(visible) {
    this.setState({ qualityVisible: visible });
  }

  // 查询'供应商申诉情况'
  @Bind()
  queryComplaintSituation(page) {
    const { dispatch } = this.props;
    const { headerId, evalLineIDS, isPub } = this.state;
    dispatch({
      type: 'evaluationDocManage/queryComplaintSituation',
      payload: {
        page,
        evalHeaderId: headerId,
        evalLineIDS: isPub ? evalLineIDS : '',
        customizeUnitCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE',
      },
    });
  }

  // 判断评分汇总是否勾选行
  @Bind()
  handleScoreSumSelected(flag) {
    this.setState({ scoreSumSelected: flag });
  }

  // 判断考评周期是否包含自定义
  @Bind()
  isEvalTplType(evalTplType, recordEvalTplType) {
    const curEvalTplType = evalTplType || recordEvalTplType;
    // 模板类型为“供应商自动考评”时,过滤掉“自定义”
    return curEvalTplType === 'GYSKP_AUTO';
  }

  // 评分人转交
  @Bind()
  handleGraderTransfer() {
    const {
      evaluationDocManage: { basicInfo: { averageFlag, evalHeaderId } = {}, granularity },
    } = this.props;
    C7nModal.open({
      drawer: true,
      footer: null,
      closable: true,
      style: { width: 800 },
      key: C7nModal.key(),
      title: intl.get('sslm.supplierDocManage.view.button.graderTransfer').d('评分人转交'),
      children: (
        <GraderTransfer
          granularity={granularity}
          averageFlag={averageFlag}
          evalHeaderId={evalHeaderId}
          onSearch={this.handleSearch}
        />
      ),
    });
  }

  /**
   * 查询个性化页签数据
   */
  @Bind()
  queryCuzTabData(param = {}) {
    if (!isEmpty(this.queryCuzData)) {
      this.queryCuzData.forEach(queryData => {
        if (isFunction(queryData)) {
          queryData(param);
        }
      });
    }
  }

  @Bind()
  handleQueryCuzData(queryData) {
    this.queryCuzData.push(queryData);
  }

  // 考评周期回调方法
  @Bind()
  handleEvalCycle(evalCycle, form) {
    // 考评周期为自定义时考评日期手动维护
    if (evalCycle !== 'CUSTOM') {
      // 考评日期从赋值默认值
      if (!form.getFieldValue('evalDateFrom')) {
        this.handleEvalDateFrom(evalCycle);
      }
      const evalDateTo = this.dateGet(undefined, evalCycle);
      form.setFieldsValue({ evalDateTo });
    }
  }

  @Bind()
  handleCustDefaultActive(key) {
    const {
      evaluationDocManage: { basicInfo = {} },
    } = this.props;
    const { evalStatus } = basicInfo;
    if (key) {
      this.handleTabChange(key);
    } else {
      const activeKey = [
        'FINAL_COLLECTED',
        'APPROVING',
        'REJECTED',
        'COMPLETED',
        'PARTIAL_PUBLISHED',
        'PUBLISHED',
        'APPEALING',
        'SUPPLIER_CONFIRMED',
      ].includes(evalStatus)
        ? 'scoreSum'
        : 'scoreDetail';
      this.handleTabChange(activeKey);
    }
  }

  /**
   * @returns React.element
   * @memberof DocManageDetail
   */
  render() {
    const {
      collapsed,
      visible,
      modalCode,
      popType,
      tabRecord,
      isPub,
      evalTplType,
      paramVauleVisible,
      scoreDetailCurrentRecord,
      submitModalVisible,
      AttachmentModalVisible,
      userInfo = {},
      qualityVisible,
      headerId,
      supplierAppealFlag,
      newAttachmentUuid,
      scoreSumSelected,
      pageReadOnly,
      copySelectedRows,
      cuxLoading,
      tabKey,
      evalTplName,
    } = this.state;
    const {
      evaluationDocManage: {
        cycleValue = [],
        appealDeadline = [],
        appealLimit = [],
        levelValue = [],
        methodValue = [],
        docTypeList = [],
        basicInfo = {},
        scoreDetail,
        scoreDetailPagination,
        scoreSum,
        scoreSumPagination,
        scoreVendor,
        scoreVendorPagination,
        granularity,
        modalData,
        modalPagination,
        productInfo,
        complaintDataSource,
        complaintPagination,
      },
      location,
      initialLoading,
      saveLoading,
      scoreSumLoading,
      scoreVendorLoading,
      evaluationPersonLoading,
      evaluationStatusLoading,
      detailScoreLoading,
      productDetailLoading,
      activityLogLoading,
      evaluationPersonSaveLoading,
      executeLoading,
      recalculateLoading,
      sumLoading,
      publishLoading,
      backScoreLoading,
      submitLoading,
      submitNewLoading,
      lineSaveLoading,
      form: { getFieldDecorator, getFieldValue },
      form,
      customizeForm,
      customizeTable,
      customizeFilterForm = () => { },
      customizeTabPane,
      custLoading,
      clearProperties,
      qualityRectifyLoading,
      destroyLoading,
      complaintSituationLoading,
      customizeBtnGroup,
      linkColor,
      docManageRemote,
    } = this.props;
    const isEdit = !pageReadOnly;
    // 单据字段是否传companyId
    const queryParamFlag =
      getFieldValue('evalDimension') === 'COMPANY' && getFieldValue('docType') === 'XY';
    // 单据类型
    const docType = getFieldValue('docType');
    const {
      evalStatus,
      evalHeaderId,
      allowedCalculateFlag,
      evalTplId,
      // approveConfigFlag,
      autoPushVendorFlag,
      averageFlag,
      newApproveConfigFlag, // 考评档案新建审批业务规则【无需审批：SELF】
      systemFlag,
    } = basicInfo;
    // 重新计算按钮显示逻辑(单据头状态 =【计算完成、评分中、评分完成】且【档案中包含系统自动类的指标】)
    const recalculateFlag =
      ['SYSTEM_COMPLETE', 'MANUAL_EVALUATING', 'MANUAL_COMPLETE'].includes(evalStatus) &&
      systemFlag;

    // 提交新建按钮是否显示flag
    const showSubmitNewflag =
      ['WFL', 'EXT'].includes(newApproveConfigFlag) && ['NEW', 'NEW_REJECTED'].includes(evalStatus);
    // 执行评分按钮显示flag
    const showExecuteFlag =
      ['WFL', 'EXT'].includes(newApproveConfigFlag) && ['NEW_REJECTED', 'NEW'].includes(evalStatus)
        ? false
        : allowedCalculateFlag;
    const tableData = {
      scoreDetail,
      scoreSum,
      scoreVendor,
    };
    const paginationData = {
      scoreDetail: scoreDetailPagination,
      scoreSum: scoreSumPagination,
      scoreVendor: scoreVendorPagination,
    };
    const allLodaing =
      initialLoading ||
      saveLoading ||
      executeLoading ||
      sumLoading ||
      publishLoading ||
      backScoreLoading ||
      submitLoading ||
      submitNewLoading ||
      qualityRectifyLoading ||
      destroyLoading ||
      complaintSituationLoading ||
      lineSaveLoading ||
      scoreSumLoading ||
      scoreVendorLoading ||
      recalculateLoading ||
      cuxLoading ||
      false;
    const contentProps = {
      isPub,
      isEdit,
      basicInfo,
      evalTplId,
      evalHeaderId,
      granularity,
      docStatus: evalStatus,
      loading: allLodaing,
      customizeBtnGroup,
      openModal: this.handleOpenModal,
      onSearch: this.handleSearch,
      handleRefresh: this.handleRefresh,
      scoreDetailCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCOREDETAILLINE_SEARCH',
      scoreSumCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.SCORESUM_SEARCH',
      customizeFilterForm,
      custLoading,
      clearProperties,
      averageFlag,
      docType,
      docManageRemote,
      parentLocation: location,
    };
    const fieldsStatus =
      (Boolean(evalStatus) && !['NEW', 'NEW_REJECTED'].includes(evalStatus)) || isPub || !isEdit;
    // saveBtnDisabled隐藏按钮标识
    // 工作流、角色工作台跳转单据、['NEW', 'FINAL_COLLECTED', 'REJECTED', 'NEW_APPROVED', 'NEW_REJECTED']状态之外的单据隐藏保存按钮
    const saveBtnDisabled =
      (Boolean(evalStatus) &&
        !['NEW', 'FINAL_COLLECTED', 'REJECTED', 'NEW_APPROVED', 'NEW_REJECTED'].includes(
          evalStatus
        ) &&
        !isPub) ||
      !isEdit ||
      isPub;
    // const saveBtnDisabled = Boolean(evalStatus) && evalStatus !== 'NEW' && !isPub;

    const evalDisabled =
      basicInfo.evalTplType === 'BDKPI_EVAL' ? Boolean(evalStatus) : fieldsStatus;

    const publishBtn = this.getButtonStatus('publish');
    const publishBtnDisabled =
      !publishBtn || (evalStatus === 'COMPLETED' && autoPushVendorFlag === 0);
    const qualityRectifyDisabled = this.getButtonStatus('qualityRectify');
    const sumDisabled = this.getButtonStatus('sum');
    const submitDisabled = this.getButtonStatus('submit');
    const backScoreDisabled =
      evalStatus !== 'MANUAL_COMPLETE' &&
      evalStatus !== 'MANUAL_EVALUATING' &&
      evalStatus !== 'FINAL_COLLECTED' &&
      evalStatus !== 'REJECTED';
    const appealLimitDisabled =
      evalStatus &&
      evalStatus !== 'NEW' &&
      evalStatus !== 'FINAL_COLLECTED' &&
      evalStatus !== 'REJECTED' &&
      evalStatus !== 'COMPLETED';
    // 是否展示’供应商申诉情况‘页签
    const showComplaint = ['APPEALING'].includes(evalStatus) || supplierAppealFlag;

    const modalProps = {
      isPub,
      granularity,
      granularityList: tabRecord,
      docStatus: evalStatus,
      visible,
      popType,
      modalCode,
      modalData,
      modalPagination,
      productInfo,
      basicInfo,
      handleRefresh: this.handleRefresh,
      onLoad: this.handleLoadModal,
      onClose: this.handleCloseModal,
      onSaveEvaluationPerson: this.handleSaveEvaluationPerson,
      loading:
        evaluationPersonLoading ||
        evaluationStatusLoading ||
        detailScoreLoading ||
        productDetailLoading ||
        activityLogLoading ||
        evaluationPersonSaveLoading,
      customizeTable,
      openParamVauleModal: this.openParamVauleModal,
      averageFlag,
      docManageRemote,
    };

    const paramProps = {
      visible: paramVauleVisible,
      currentRecord: scoreDetailCurrentRecord,
      closeModal: this.closeParamVauleModal,
      customizeTable,
      customizeTableCode: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.PARAM_VALUE_LIST',
      custLoading,
    };

    const attachmentModalProps = {
      evalHeaderId,
      viewOnly: true,
      isVisible: AttachmentModalVisible,
      onCancel: this.handleAttachmentModal,
      handleRefresh: () => this.handleRefresh(),
    };
    // 质量整改
    const qualityProps = {
      evalHeaderId: headerId,
      orderSource: 'kpiEval',
      custLoading,
      customizeTable,
      customizeTableCode: '',
      onRef: node => {
        this.quality = node;
      },
      setQualityVisible: this.setQualityVisible,
    };
    // 考评模板类型判断 判断是否是 业务单据考评类型
    const isBdkpiEval = this.state.evalTplType
      ? this.state.evalTplType === 'BDKPI_EVAL'
      : basicInfo.evalTplType && basicInfo.evalTplType === 'BDKPI_EVAL';

    const currentTrxLineFlag =
      (basicInfo.trxLineFlags || basicInfo.trxLineFlag?.toString() || '')?.split(',') || [];
    const graderTransferFlag = ['MANUAL_EVALUATING'].includes(evalStatus);
    // 废弃按钮显隐
    const invalidFlag = !this.getButtonStatus('destroy');

    // 头信息btn埋点参数
    const headerBtnProps = {
      basicInfo,
      onRefresh: this.handleRefresh,
    };

    // 埋点实现考评周期onchange方法
    const remoteMethod =
      docManageRemote &&
      docManageRemote.process('SSLM.EVALUATION_DOC_MANAGE_DETAIL_HEADER_ROW', {}, {});

    // 如果有埋点，优先取埋点返回的方法
    const handleOnChange =
      typeof remoteMethod === 'function' && !isNil(remoteMethod)
        ? remoteMethod
        : this.handleEvalCycle;

    // 头columns埋点参数
    const headerRowRenderProps = {
      form,
      getFieldDecorator,
      basicInfo,
      that: this,
    };

    // 如果有埋点，表格增加卖点返回字段
    const rowColumns = docManageRemote ? (
      docManageRemote.process(
        'SSLM.EVALUATION_DOC_MANAGE_DETAIL_HEADER_ROW_RENDER',
        <></>,
        headerRowRenderProps
      )
    ) : (
      <></>
    );

    const newEdit = !isPub && evalHeaderId && isEdit;

    return (
      <Fragment>
        <Header
          title={intl.get(`sslm.supplierDocManage.view.title.filesMaintain`).d('考评档案维护')}
          backPath={isPub ? '' : '/sslm/evaluation-doc-manage/list'}
        >
          <HeaderBtns
            isPub={isPub}
            isEdit={newEdit}
            loading={allLodaing}
            onSave={this.handleSave}
            invalidFlag={invalidFlag}
            sumDisabled={sumDisabled}
            onScore={this.handleScore}
            onPublish={this.handlePublish}
            onDestroy={this.handleDestroy}
            onViewLog={this.handleViewLog}
            submitDisabled={submitDisabled}
            onSumCheck={this.handleSumCheck}
            recalculateFlag={recalculateFlag}
            onBackScore={this.backScoreModal}
            showExecuteFlag={showExecuteFlag}
            saveBtnDisabled={saveBtnDisabled}
            scoreSumSelected={scoreSumSelected}
            backScoreDisabled={backScoreDisabled}
            showSubmitNewflag={showSubmitNewflag}
            customizeBtnGroup={customizeBtnGroup}
            onRecalculate={this.handleRecalculate}
            publishBtnDisabled={publishBtnDisabled}
            graderTransferFlag={graderTransferFlag}
            onSubmitReview={this.handleSubmitReview}
            onGraderTransfer={this.handleGraderTransfer}
            onSubmitNewApproval={this.submitNewApproval}
            qualityRectifyDisabled={qualityRectifyDisabled}
            onQualityRectification={this.goToQualityRectification}
          />
          {/* 欧瑞康src-26776二开埋点 */}
          {docManageRemote &&
            docManageRemote.render(
              'SSLM.EVALUATION_DOC_MANAGE_DETAIL_HEARD_IMPORT_BUTTON',
              null,
              headerBtnProps
            )}
        </Header>
        <Content>
          <Spin spinning={allLodaing}>
            <div className="ued-detail-wrapper">
              <Collapse defaultActiveKey={['docManageDetailKey']} onChange={this.handleCollapse}>
                <Panel
                  key="docManageDetailKey"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`sslm.supplierDocManage.model.evaluationDocManage.baseInfo`)
                          .d('基本信息')}
                      </h3>
                      <a>
                        {collapsed
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        {<Icon type={collapsed ? 'up' : 'down'} />}
                      </a>
                    </Fragment>
                  }
                >
                  {customizeForm(
                    {
                      code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER',
                      form,
                      dataSource: basicInfo,
                    },
                    <Form className="ued-edit-form form-wrap">
                      {rowColumns}
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evaluationDocManage.docCode')
                              .d('档案编码')}
                          >
                            {getFieldDecorator('evalNum', {
                              initialValue: basicInfo.evalNum,
                            })(<span>{basicInfo.evalNum}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evalDocManage.docDescription')
                              .d('档案描述')}
                          >
                            {getFieldDecorator('evalName', {
                              initialValue: basicInfo.evalName,
                              rules: [
                                {
                                  required: true,
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(
                                        `sslm.supplierDocManage.model.evalDocManage.docDescription`
                                      )
                                      .d('档案描述'),
                                  }),
                                },
                                {
                                  max: 100,
                                  message: intl.get('hzero.common.validation.max', {
                                    max: 100,
                                  }),
                                },
                              ],
                            })(<Input disabled={fieldsStatus} />)}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evaluationDocManage.docStatus')
                              .d('档案状态')}
                          >
                            {getFieldDecorator('evalStatus', {
                              initialValue: basicInfo.evalStatus,
                            })(<span>{basicInfo.evalStatusMeaning}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evalDocManage.evalModel')
                              .d('考评模板')}
                          >
                            {getFieldDecorator('evalTplId', {
                              initialValue: basicInfo.evalTplId,
                              rules: [
                                {
                                  required: true,
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(`sslm.supplierDocManage.model.evalDocManage.evalModel`)
                                      .d('考评模板'),
                                  }),
                                },
                              ],
                            })(
                              <Lov
                                textValue={evalTplName || basicInfo.evalTplName}
                                code="SSLM.KPI_EVAL_TPL"
                                disabled={Boolean(evalStatus)}
                                onChange={(lovValue, lovRecord) =>
                                  this.handleLovChange(lovValue, lovRecord)
                                }
                                queryParams={{
                                  tenantId: getCurrentTenant().tenantId,
                                  evalFlag: 1,
                                }}
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evalDocManage.evalLevel')
                              .d('考评维度')}
                          >
                            {getFieldDecorator('evalDimension', {
                              initialValue: isEmpty(basicInfo) ? '' : basicInfo.evalDimension,
                              rules: [
                                {
                                  required: true,
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(`sslm.supplierDocManage.model.evalDocManage.evalLevel`)
                                      .d('考评维度'),
                                  }),
                                },
                              ],
                            })(
                              <Select
                                allowClear
                                disabled={evalDisabled}
                                onChange={this.handleSelectChange}
                              >
                                {levelValue.map(item => (
                                  <Select.Option value={item.value} key={item.value}>
                                    {item.meaning}
                                  </Select.Option>
                                ))}
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>{this.getDimensionValue(evalDisabled)}</Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evaluationDocManage.evalCycle`)
                              .d('考评周期')}
                          >
                            {getFieldDecorator('evalCycle', {
                              initialValue: isEmpty(basicInfo) ? '' : basicInfo.evalCycle,
                              rules: [
                                {
                                  required: !isBdkpiEval,
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(
                                        `sslm.supplierDocManage.model.evaluationDocManage.evalCycle`
                                      )
                                      .d('考评周期'),
                                  }),
                                },
                              ],
                              onChange: evalCycle => handleOnChange(evalCycle, form),
                            })(
                              <Select allowClear disabled={fieldsStatus}>
                                {this.isEvalTplType(evalTplType, basicInfo.evalTplType)
                                  ? cycleValue
                                    .filter(item => item.value !== 'CUSTOM')
                                    .map(item => (
                                      <Select.Option value={item.value} key={item.value}>
                                        {item.meaning}
                                      </Select.Option>
                                    ))
                                  : cycleValue.map(item => (
                                    <Select.Option value={item.value} key={item.value}>
                                      {item.meaning}
                                    </Select.Option>
                                  ))}
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evaluationDocManage.PIC`)
                              .d('考评负责人')}
                          >
                            {getFieldDecorator('processUserName')(
                              <span>{basicInfo.processUserName}</span>
                            )}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.createTime`)
                              .d('建档时间')}
                          >
                            {getFieldDecorator('creationDate')(
                              <span>{dateTimeRender(basicInfo.creationDate)}</span>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(
                                `sslm.supplierDocManage.model.evaluationDocManage.createdUserName`
                              )
                              .d('创建人')}
                          >
                            {getFieldDecorator('createdUserName')(
                              <span>{basicInfo.createdUserName}</span>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.evalDateFrom`)
                              .d('考评日期从')}
                          >
                            {getFieldDecorator('evalDateFrom', {
                              initialValue: basicInfo.evalDateFrom
                                ? moment(basicInfo.evalDateFrom, DEFAULT_DATE_FORMAT)
                                : null,
                              rules: [
                                {
                                  required: !isBdkpiEval || getFieldValue('evalDateTo'),
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(
                                        `sslm.supplierDocManage.model.evalDocManage.evalDateFrom`
                                      )
                                      .d('考评日期从'),
                                  }),
                                },
                              ],
                              onChange: date => {
                                if (
                                  getFieldValue('evalCycle') &&
                                  getFieldValue('evalCycle') !== 'CUSTOM'
                                ) {
                                  const evalDateTo = this.dateGet(date);
                                  form.setFieldsValue({ evalDateTo });
                                }
                              },
                            })(
                              <DatePicker
                                format={DEFAULT_DATE_FORMAT}
                                placeholder={null}
                                style={{ width: '100%' }}
                                disabled={fieldsStatus}
                                disabledDate={currentDate =>
                                  form.getFieldValue('evalDateTo') &&
                                  moment(form.getFieldValue('evalDateTo')).isBefore(
                                    currentDate,
                                    'day'
                                  )
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.evalDateTo`)
                              .d('考评日期至')}
                          >
                            {getFieldDecorator('evalDateTo', {
                              initialValue: basicInfo.evalNum
                                ? basicInfo.evalDateTo
                                  ? moment(basicInfo.evalDateTo, DEFAULT_DATE_FORMAT)
                                  : null
                                : this.dateGet(),
                              rules: [
                                {
                                  required: getFieldValue('evalDateFrom'),
                                  message: intl.get(`hzero.common.validation.notNull`, {
                                    name: intl
                                      .get(`sslm.supplierDocManage.model.evalDocManage.evalDateTo`)
                                      .d('考评日期至'),
                                  }),
                                },
                              ],
                            })(
                              <DatePicker
                                format={DEFAULT_DATE_FORMAT}
                                placeholder={null}
                                style={{ width: '100%' }}
                                disabled={
                                  (getFieldValue('evalCycle') &&
                                    getFieldValue('evalCycle') !== 'CUSTOM') ||
                                  fieldsStatus
                                }
                                disabledDate={currentDate =>
                                  getFieldValue('evalDateFrom') &&
                                  moment(getFieldValue('evalDateFrom')).isAfter(currentDate, 'day')
                                }
                              />
                            )}
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evaluationDocManage.kpiMethod`)
                              .d('考评方式')}
                          >
                            {getFieldDecorator('kpiMethod')(
                              <span>
                                {isEmpty(basicInfo)
                                  ? ''
                                  : valueMapMeaning(methodValue, basicInfo.kpiMethod)}
                              </span>
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.evaluateScope`)
                              .d('选择参评供应商范围')}
                          >
                            {getFieldDecorator('trxLineFlag', {
                              initialValue: basicInfo.trxLineFlags
                                ? basicInfo.trxLineFlags
                                : basicInfo.trxLineFlag,
                            })(
                              <span>
                                {basicInfo.trxLineFlags
                                  ? basicInfo.trxLineFlagsMeaning
                                  : basicInfo.trxLineFlagMeaning}
                              </span>
                            )}
                          </FormItem>
                        </Col>
                        {(evalTplType === 'BDKPI_EVAL' ||
                          basicInfo.evalTplType === 'BDKPI_EVAL') && (
                            <Col span={8}>
                              <FormItem
                                {...formItemLayout}
                                label={intl
                                  .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                                  .d('单据类型')}
                              >
                                {getFieldDecorator('docType', {
                                  initialValue: basicInfo.docType,
                                  rules: [
                                    {
                                      required: true,
                                      message: intl.get(`hzero.common.validation.notNull`, {
                                        name: intl
                                          .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                                          .d('单据类型'),
                                      }),
                                    },
                                  ],
                                })(
                                  <Select
                                    allowClear
                                    disabled={Boolean(evalStatus)}
                                    onChange={() => {
                                      form.setFieldsValue({ docNum: null });
                                    }}
                                  >
                                    {docTypeList.map(item => (
                                      <Select.Option value={item.value} key={item.value}>
                                        {item.meaning}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                )}
                              </FormItem>
                            </Col>
                          )}
                        {(evalTplType === 'BDKPI_EVAL' ||
                          basicInfo.evalTplType === 'BDKPI_EVAL') && (
                            <Col span={8}>
                              <FormItem
                                {...formItemLayout}
                                label={intl
                                  .get(`sslm.supplierDocManage.model.evalDocManage.docNum`)
                                  .d('单据')}
                              >
                                {getFieldDecorator('docNum', {
                                  initialValue: basicInfo.docNum,
                                  rules: [
                                    {
                                      required: true,
                                      message: intl.get(`hzero.common.validation.notNull`, {
                                        name: intl
                                          .get(`sslm.supplierDocManage.model.evalDocManage.docNum`)
                                          .d('单据'),
                                      }),
                                    },
                                  ],
                                })(
                                  <LovMulti
                                    code={
                                      getFieldValue('docType') === 'YS'
                                        ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
                                        : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT'
                                    }
                                    queryParams={{
                                      tenantId: getCurrentTenant().tenantId,
                                      companyId: queryParamFlag
                                        ? getFieldValue('evalDimensionValue')
                                        : undefined,
                                    }}
                                    viewOnly={Boolean(evalStatus)}
                                    disabled={!getFieldValue('docType')}
                                  />
                                )}
                              </FormItem>
                            </Col>
                          )}
                      </Row>
                      <Row gutter={48} className="writable-row">
                        {currentTrxLineFlag.includes('2') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.cooperationDay`)
                                .d('合作天数')}
                            >
                              {getFieldDecorator('cooperationDays', {
                                initialValue: basicInfo.cooperationDays,
                              })(<span>{basicInfo.cooperationDays}</span>)}
                            </FormItem>
                          </Col>
                        )}
                        {(evalStatus === 'APPROVING' ||
                          evalStatus === 'PUBLISHED' ||
                          evalStatus === 'COMPLETED') && (
                            <Col span={8}>
                              <FormItem
                                {...formItemLayout}
                                label={intl
                                  .get(`sslm.supplierDocManage.model.evalDocManage.publishToSupplier`)
                                  .d('审批后自动发布至供应商')}
                              >
                                {getFieldDecorator('autoPushVendorFlag', {
                                  initialValue: basicInfo.autoPushVendorFlag,
                                })(
                                  isPub && evalStatus === 'APPROVING' ? (
                                    <Checkbox />
                                  ) : (
                                    <span>{yesOrNoRender(basicInfo.autoPushVendorFlag)}</span>
                                  )
                                )}
                              </FormItem>
                            </Col>
                          )}
                      </Row>
                      <Row gutter={48} className="writable-row">
                        {currentTrxLineFlag.includes('3') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(
                                  `sslm.supplierDocManage.model.evalDocManage.categoryDescriptions`
                                )
                                .d('供应商分类')}
                            >
                              {getFieldDecorator('categoryDescriptions', {
                                initialValue: basicInfo.categoryDescriptions,
                              })(<span>{basicInfo.categoryDescriptions}</span>)}
                            </FormItem>
                          </Col>
                        )}
                        {currentTrxLineFlag.includes('4') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.supplierProduct`)
                                .d('供货品类')}
                            >
                              {getFieldDecorator('itemCategoryNames', {
                                initialValue: basicInfo.itemCategoryNames,
                              })(<span>{basicInfo.itemCategoryNames}</span>)}
                            </FormItem>
                          </Col>
                        )}
                        {currentTrxLineFlag.includes('5') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.lifeCycle`)
                                .d('生命周期')}
                            >
                              {getFieldDecorator('stageIds', {
                                initialValue: basicInfo.stageIds,
                              })(<span>{basicInfo.stageDescriptions}</span>)}
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                      <Row gutter={48} className="writable-row">
                        {currentTrxLineFlag.includes('1') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.inventoryTimes`)
                                .d('接收入库次数（≥）')}
                            >
                              {getFieldDecorator('inventoryTimes', {
                                initialValue: basicInfo.inventoryTimes,
                              })(<span>{basicInfo.inventoryTimes}</span>)}
                            </FormItem>
                          </Col>
                        )}
                        {currentTrxLineFlag.includes('6') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.deliveryTimes`)
                                .d('送货单次数（≥）')}
                            >
                              {getFieldDecorator('deliveryTimes', {
                                initialValue: basicInfo.deliveryTimes,
                              })(<span>{basicInfo.deliveryTimes}</span>)}
                            </FormItem>
                          </Col>
                        )}
                        {currentTrxLineFlag.includes('7') && (
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl.get(`sslm.common.model.buyer`).d('采购员')}
                            >
                              {getFieldDecorator('purchaseAgentIds', {
                                initialValue: basicInfo.purchaseAgentIds,
                              })(
                                <span>
                                  {basicInfo.purchaseAgentNames &&
                                    basicInfo.purchaseAgentNames
                                      .map(i => i.purchaseAgentName)
                                      .join()}
                                </span>
                              )}
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                      <Row gutter={48} className="half-row">
                        <Col span={12}>
                          <Form.Item
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.ruleDesc`)
                              .d('考评规则说明')}
                          >
                            {getFieldDecorator('evalRuleRemark', {
                              initialValue: isEmpty(basicInfo) ? '' : basicInfo.evalRuleRemark,
                              rules: [
                                {
                                  max: 1000,
                                  message: intl.get('hzero.common.validation.max', {
                                    max: 1000,
                                  }),
                                },
                              ],
                            })(
                              <TextArea
                                autosize={{ minRows: 2 }}
                                disabled={fieldsStatus}
                                style={{ resize: 'none' }}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={48} className="half-row">
                        <Col span={12}>
                          <Form.Item
                            label={intl
                              .get(`sslm.supplierDocManage.model.evaluationDocManage.description`)
                              .d('考评说明')}
                          >
                            {getFieldDecorator('remark', {
                              initialValue: isEmpty(basicInfo) ? '' : basicInfo.remark,
                              rules: [
                                {
                                  max: 1000,
                                  message: intl.get('hzero.common.validation.max', {
                                    max: 1000,
                                  }),
                                },
                              ],
                            })(
                              <TextArea
                                autosize={{ minRows: 2 }}
                                disabled={fieldsStatus}
                                style={{ resize: 'none' }}
                              />
                            )}
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={48} className="writable-row">
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.docManage.appraisalAttachment`)
                              .d('考评附件')}
                          >
                            {getFieldDecorator('appraisalAttachment', {
                              // initialValue: isEmpty(basicInfo) ? '' : basicInfo.evalHeaderId,
                            })(
                              <Fragment>
                                <a
                                  onClick={() => this.handleAttachmentModal()}
                                  disabled={isEmpty(basicInfo) || !basicInfo.evalHeaderId}
                                >
                                  <Icon type="paper-clip" />
                                  {intl.get('hzero.common.upload.view').d('查看附件')}
                                </a>
                                {basicInfo.totalAttachment && basicInfo.totalAttachment > 0 ? (
                                  <div
                                    style={{
                                      backgroundColor: linkColor || '#108ee9',
                                      height: 'auto',
                                      lineHeight: '15px',
                                      marginLeft: '4px',
                                      padding: '0 7px',
                                      fontSize: '12px',
                                      color: '#fff',
                                      display: 'inline-block',
                                    }}
                                  >
                                    {basicInfo.totalAttachment}
                                  </div>
                                ) : null}
                              </Fragment>
                            )}
                          </Form.Item>
                        </Col>
                        {[
                          'FINAL_COLLECTED',
                          'APPROVING',
                          'REJECTED',
                          'PUBLISHED',
                          'COMPLETED',
                          'PARTIAL_PUBLISHED',
                          'SUPPLIER_CONFIRMED',
                          'APPEALING',
                        ].includes(evalStatus) && (
                        <Col span={8}>
                          <Form.Item
                            {...formItemLayout}
                            label={intl
                                  .get(`sslm.supplierDocManage.model.docManage.evaluationCopy`)
                                  .d('抄送（发布考评）')}
                          >
                            {getFieldDecorator('informUserIds', {
                                  initialValue: basicInfo.informUserIds,
                                })(
                                  <LovMultiple
                                    code="SSLM.KPI_CHOOSE_USER"
                                    textField="userName"
                                    selectedRows={copySelectedRows}
                                    textValue={basicInfo.userName}
                                    lovOptions={{ displayField: 'userName' }}
                                    disabled={!['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus)}
                                    queryParams={{ tenantId: getCurrentTenant().tenantId }}
                                    changeSelectRows={selectedRows => {
                                      this.setState({ copySelectedRows: selectedRows });
                                    }}
                                  />
                                )}
                          </Form.Item>
                        </Col>
                          )}
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.evaluationDepart`)
                              .d('考评负责人部门')}
                          >
                            {getFieldDecorator('processUnitId', {
                              initialValue: basicInfo.processUnitId || userInfo.unitId,
                            })(
                              <Lov
                                textValue={basicInfo.processUnitName || userInfo.unitName}
                                code="SPRM.USER_UNIT"
                                disabled={fieldsStatus}
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                      {basicInfo.allowAppealFlag && (
                        <Row gutter={48} className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(
                                  `sslm.supplierDocManage.model.evalDocManage.appealDeadlineMeaning`
                                )
                                .d('申诉期限')}
                            >
                              {getFieldDecorator('appealDeadline', {
                                initialValue: basicInfo.appealDeadline || 'unlimited',
                              })(
                                <Select
                                  allowClear
                                  disabled={appealLimitDisabled}
                                  onChange={() => {
                                    form.setFieldsValue({ appealDeadlineTime: null });
                                    setTimeout(() => {
                                      form.validateFields(['appealDeadlineTime'], { force: true });
                                    }, 200);
                                  }}
                                >
                                  {appealDeadline.map(item => (
                                    <Select.Option value={item.value} key={item.value}>
                                      {item.meaning}
                                    </Select.Option>
                                  ))}
                                </Select>
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(
                                  `sslm.supplierDocManage.model.evalDocManage.appealDeadlineTime`
                                )
                                .d('申诉截止时间')}
                            >
                              {getFieldDecorator('appealDeadlineTime', {
                                initialValue: basicInfo.appealDeadlineTime
                                  ? moment(basicInfo.appealDeadlineTime, DEFAULT_DATETIME_FORMAT)
                                  : null,
                                rules: [
                                  {
                                    required: form.getFieldValue('appealDeadline') === 'other',
                                    message: intl.get('hzero.common.validation.notNull', {
                                      name: intl
                                        .get(
                                          'sslm.supplierDocManage.model.evalDocManage.appealDeadlineTime'
                                        )
                                        .d('申诉截止时间'),
                                    }),
                                  },
                                ],
                              })(
                                <DatePicker
                                  showTime
                                  format={DEFAULT_DATETIME_FORMAT}
                                  placeholder={null}
                                  style={{ width: '100%' }}
                                  disabled={
                                    appealLimitDisabled ||
                                    form.getFieldValue('appealDeadline') !== 'other'
                                  }
                                  onChange={() => {
                                    setTimeout(() => {
                                      form.validateFields(['appealDeadlineTime'], { force: true });
                                    }, 200);
                                  }}
                                />
                              )}
                            </FormItem>
                          </Col>
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(
                                  `sslm.supplierDocManage.model.evalDocManage.appealLimitMeaning`
                                )
                                .d('申诉次数限制')}
                            >
                              {getFieldDecorator('appealLimit', {
                                initialValue: basicInfo.appealLimit || 'unlimited',
                              })(
                                <Select allowClear disabled={appealLimitDisabled}>
                                  {appealLimit.map(item => (
                                    <Select.Option value={item.value} key={item.value}>
                                      {item.meaning}
                                    </Select.Option>
                                  ))}
                                </Select>
                              )}
                            </FormItem>
                          </Col>
                        </Row>
                      )}
                      {/* 单据状态为: 汇总完成、审批中、已发布、已完成状态及流程表单中显示 */}
                      {[
                        'FINAL_COLLECTED',
                        'APPROVING',
                        'PUBLISHED',
                        'COMPLETED',
                        'REJECTED',
                      ].includes(evalStatus) && (
                      <Row gutter={48} className="half-row">
                        <Col span={12}>
                          <Form.Item
                            label={intl
                                  .get(`sslm.supplierDocManage.model.evalDocManage.evalResultRemark`)
                                  .d('考评结果说明')}
                          >
                            {getFieldDecorator('evalResultRemark', {
                                  initialValue: isEmpty(basicInfo) ? '' : basicInfo.evalResultRemark,
                                  rules: [
                                    {
                                      max: 1000,
                                      message: intl.get('hzero.common.validation.max', {
                                        max: 1000,
                                      }),
                                    },
                                  ],
                                })(
                                  <TextArea
                                    autosize={{ minRows: 2 }}
                                    style={{ resize: 'none' }}
                                    disabled={!['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus)}
                                  />
                                )}
                          </Form.Item>
                        </Col>
                      </Row>
                        )}
                      {[
                        'FINAL_COLLECTED',
                        'APPROVING',
                        'PUBLISHED',
                        'COMPLETED',
                        'REJECTED',
                      ].includes(evalStatus) && (
                      <Row gutter={48} className="half-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                                  .get('sslm.supplierDocManage.model.evalDocManage.evalAttUuid')
                                  .d('考评结果附件')}
                          >
                            {getFieldDecorator('evalAttUuid', {
                                  initialValue: basicInfo.evalAttUuid || newAttachmentUuid,
                                })(
                                  <Upload
                                    attachmentUUID={basicInfo.evalAttUuid || newAttachmentUuid}
                                    filePreview
                                    bucketName={PRIVATE_BUCKET}
                                    bucketDirectory="sslm-evaluation"
                                    viewOnly={!['FINAL_COLLECTED', 'REJECTED'].includes(evalStatus)}
                                  />
                                )}
                          </FormItem>
                        </Col>
                      </Row>
                        )}
                    </Form>
                  )}
                </Panel>
              </Collapse>
              {/* 获取个性化页签数据 */}
              <ExternalCustomizeContext.Provider
                value={{
                  queryCuzData: this.handleQueryCuzData,
                }}
              >
                {/* 解决个性化页签，无法取头个性化信息问题，等基本信息加载完成再渲染标准页签 */}
                {!isEmpty(basicInfo) &&
                  customizeTabPane(
                    {
                      code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.TAB_PAN',
                      custDefaultActive: this.handleCustDefaultActive,
                    },
                    <Tabs
                      animated={false}
                      activeKey={tabKey}
                      custLoading={custLoading}
                      onChange={this.handleTabChange}
                      style={{
                        display: !isEmpty(evalStatus) ? 'block' : 'none',
                      }}
                    >
                      <TabPane
                        tab={intl
                          .get(`sslm.supplierDocManage.model.evalDocManage.scoreDetail`)
                          .d('评分明细')}
                        key="scoreDetail"
                      >
                        <TabContent
                          {...contentProps}
                          tableData={tableData.scoreDetail}
                          indicatorVisableFlag={!isEmpty(tableData.scoreVendor)}
                          pagination={paginationData.scoreDetail}
                          tabKey="scoreDetail"
                          rowKey="evalDtlId"
                          customizeTable={customizeTable}
                          onRef={node => {
                            this.tabContent = node;
                          }}
                          openParamVauleModal={this.openParamVauleModal}
                          isBdkpiEvalFlag={isBdkpiEval}
                        />
                      </TabPane>
                      <TabPane
                        forceRender
                        tab={intl
                          .get(`sslm.supplierDocManage.model.evalDocManage.scoreSum`)
                          .d('评分汇总')}
                        key="scoreSum"
                      >
                        <TabContent
                          {...contentProps}
                          tableData={tableData.scoreSum}
                          pagination={paginationData.scoreSum}
                          tabKey="scoreSum"
                          rowKey="scoreSumId"
                          customizeTable={customizeTable}
                          handleScoreSumSelected={this.handleScoreSumSelected}
                          onRef={node => {
                            this.scoreSumTab = node;
                          }}
                        />
                      </TabPane>
                      <TabPane
                        tab={intl
                          .get(`sslm.supplierDocManage.model.evalDocManage.scoreVendor`)
                          .d('参评供应商')}
                        key="scoreVendor"
                      >
                        <TabContent
                          {...contentProps}
                          basicForm={form}
                          tableData={tableData.scoreVendor}
                          pagination={paginationData.scoreVendor}
                          tabKey="scoreVendor"
                          rowKey="scoreVendorId"
                          customizeTable={customizeTable}
                          customizeFilterForm={customizeFilterForm}
                          custLoading={custLoading}
                          isBdkpiEvalFlag={isBdkpiEval}
                          docManageRemote={docManageRemote}
                        />
                      </TabPane>
                      {showComplaint && (
                        <TabPane
                          tab={intl
                            .get(`sslm.supplierDocManage.model.evalDocManage.complaintStatus`)
                            .d('供应商申诉情况')}
                          key="complaintSituation"
                        >
                          <ComplaintSituation
                            customizeCode="SSLM.EVALUATION_DOC_MANAGE_DETAIL.COMPLAINTETAILLINE"
                            customizeTable={customizeTable}
                            granularity={granularity}
                            evalHeaderId={evalHeaderId}
                            dataSource={complaintDataSource}
                            pagination={complaintPagination}
                            allLodaing={allLodaing}
                            openModal={this.handleOpenModal}
                            onQuery={this.queryComplaintSituation}
                            onPublish={this.handlePublishComplaint}
                            onSave={this.savePublishComplaint}
                            isPub={isPub}
                            isEdit={isEdit}
                          />
                        </TabPane>
                      )}
                      {!qualityRectifyDisabled && qualityVisible && (
                        <TabPane
                          forceRender
                          tab={intl.get('sslm.common.view.tabs.qectificationDoc').d('关联整改单据')}
                          key="qualityRectification"
                        >
                          <QualityRectification {...qualityProps} />
                        </TabPane>
                      )}
                    </Tabs>
                  )}
              </ExternalCustomizeContext.Provider>

              <Modals {...modalProps} />
            </div>
          </Spin>
          <ParamValueModal {...paramProps} />
          <Modal
            width={450}
            destroyOnClose
            title={intl.get('sslm.common.view.title.prompt').d('提示')}
            visible={submitModalVisible}
            confirmLoading={submitLoading}
            onCancel={this.hideSubmitModal}
            footer={
              <Fragment>
                <Button
                  type="primary"
                  onClick={() => {
                    this.handleSubmit(0);
                  }}
                >
                  {intl
                    .get('sslm.supplierDocManage.view.button.notSendAutomatically')
                    .d('不自动发送')}
                </Button>
                <Button
                  onClick={() => {
                    this.handleSubmit(1);
                  }}
                >
                  {intl.get('sslm.supplierDocManage.view.button.sendAutomatically').d('自动发送')}
                </Button>
                <Button onClick={this.hideSubmitModal}>
                  {intl.get('sslm.supplierDocManage.view.button.thinkAgain').d('我再想想')}
                </Button>
              </Fragment>
            }
          >
            <Row style={{ marginBottom: 24 }}>
              {intl
                .get(`sslm.supplierDocManage.view.modal.submitMessage`)
                .d('审批通过后，是否自动将考评结果自动发布至供应商？')}
            </Row>
          </Modal>
        </Content>
        {AttachmentModalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
