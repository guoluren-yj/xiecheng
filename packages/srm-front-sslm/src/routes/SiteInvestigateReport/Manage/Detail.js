/**
 * Detail - 现场考察报告管理详情
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { isEmpty, isUndefined, unionBy, isNumber, concat, isFunction, isNil } from 'lodash';
import qs from 'querystring';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Tabs, Modal, Spin, Tag } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PerButton } from 'components/Permission';
import { Modal as C7nModal, Form, TextArea, DataSet } from 'choerodon-ui/pro';

import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'utils/remote';

import H0ApproveRecord from '@/routes/components/H0ApproveRecord';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { backScoreSave } from '@/routes/SiteInvestigateReport/Manage/utils';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import BasicInfo from '../common/BasicInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';
import ScoreInfo from './ScoreInfo';
import InspectResults from '../common/InspectResults';
import QualityRectification from '../common/QualityRectification';
import BackScore from './BackScore';

import '@/routes/index.less';

const tenantId = getCurrentOrganizationId();
const entrance = 'manage'; // 定义入口
const { TabPane } = Tabs;

const customizeUnitCode = [
  'SSLM_SITEINVESTIGATEREPORT.BASICINFO',
  'SSLM_SITEINVESTIGATEREPORT.REVIEWMATERIALCATEGORY',
  'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
  'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
  'SSLM_SITEINVESTIGATEREPORT.INSPECTRESULTS',
  'SSLM_SITEINVESTIGATEREPORT.QUALITY',
  'SSLM_SITEINVESTIGATEREPORT.SCOREINFO',
].join();

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATEREPORT.BASICINFO',
    'SSLM_SITEINVESTIGATEREPORT.REVIEWMATERIALCATEGORY',
    'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    'SSLM_SITEINVESTIGATEREPORT.INSPECTRESULTS',
    'SSLM_SITEINVESTIGATEREPORT.SCOREINFO',
    'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_FILTER',
    'SSLM_SITEINVESTIGATEREPORT.HEADER_BTNGROUP',
    'SSLM_SITEINVESTIGATEREPORT.DETAIL_TABPANE',
    'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_STATUS',
    'SSLM_SITEINVESTIGATEREPORT.SCORER_INFO',
    'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_BTNGROUP',
    'SSLM_SITEINVESTIGATEREPORT.QUALITY',
    'SSLM_SITEINVESTIGATEREPORT.INSPECT_TEAM_BTNGROUP',
    'SSLM_SITEINVESTIGATEREPORT.MATERIAL_CATEGORY_BTNGROUP',
    'SSLM_SITEINVESTIGATEREPORT.ATT_INFO_BTNS',
  ],
})
@remote(
  {
    code: 'SSLM_SITE_INVESTIGATE_REPORT_DEFINITION',
    name: 'siteInvestigateReportRemote',
  },
  {
    events: {
      cuxFeedbackCb: () => {}, // 提交反馈回调
      cuxSubmitCb: () => {}, // 提交回调
      cuxHandleSave: () => {}, // 二开保存逻辑
      cuxHandleSubmit: () => {}, // 二开提交逻辑
    },
  }
)
@formatterCollections({
  code: [
    'sslm.supplierDocManage',
    'sslm.siteInvestigateReport',
    'sslm.common',
    'sslm.commonApplication',
    'sslm.operatingRecord',
    'hwfp.common',
  ],
})
@connect(({ siteInvestigateReport, loading, user = {} }) => {
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
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    siteInvestigateReport,
    backScoreLoading: loading.effects['siteInvestigateReport/handleBackScore'],
    workbenchLoading: loading.effects['siteInvestigateReport/querySupplierInfo'],
    optionLoading:
      loading.effects['siteInvestigateReport/saveAll'] ||
      loading.effects['siteInvestigateReport/submitFeedback'] ||
      loading.effects['siteInvestigateReport/performScore'] ||
      loading.effects['siteInvestigateReport/summaryStatistics'] ||
      loading.effects['siteInvestigateReport/submitApproval'] ||
      loading.effects['siteInvestigateReport/publishReport'] ||
      loading.effects['siteInvestigateReport/detailInvalid'] ||
      loading.effects['siteInvestigateReport/queryBasicInfo'] ||
      loading.effects['siteInvestigateReport/queryQualityRectification'] ||
      loading.effects['siteInvestigateReport/handleBackScore'] ||
      loading.effects['siteInvestigateReport/detailDelete'] ||
      loading.effects['siteInvestigateReport/handleBack'] ||
      loading.effects['siteInvestigateReport/queryProblemHeader'] ||
      loading.effects['siteInvestigateReport/queryScoreInfo'],
    queryQualityLoading: loading.effects['siteInvestigateReport/queryProblemHeader'],
    backLoading: loading.effects['siteInvestigateReport/handleBack'],
    ...themeConfig,
  };
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { location, match: { params: { evalHeaderId, evalType } = {} } = {} } = props;
    const isPub = location.pathname.match('/pub/');
    const isView = location.pathname.match('detail-view');
    const routerParams = qs.parse(props.location.search.substr(1));
    const {
      companyId,
      supplierCompanyId,
      sourceType,
      riskEventNum,
      riskProcessUuid,
    } = routerParams;
    const { state: locationParam = {} } = props.location; // 这个参数是使用 history.push(pathname,state) 传递后获取的参数
    this.state = {
      isPub,
      isView,
      sourceType,
      riskEventNum,
      riskProcessUuid,
      evalHeaderId, // 头id
      evalType, // 评分方式
      evalStatus: undefined, // 申请单状态
      needFeedbackFlag: null,
      callSuppliersFlag: null,
      basicInfo: {}, // 基本信息
      historyBack: locationParam.historyBack, // historyBack 这个参数用来保存前一个页面的路径
      allFileNum: undefined,
      scoreInfoExpand: true, // 评分信息展开/收起标识
      qualityVisible: true, // 质量整改显示隐藏标识
      companyId,
      supplierCompanyId,
      visableScoreInfoFlag: true,
      tableList: [], // 用于配置表
      basicFormHidden: false, // 按照个性化要求解决dataSoure更新，form绑定值不更新问题
      isAmktClient: sourceType === 'AMKT_CLIENT', // 单据来源为应用商店
    };
  }

  reviewMaterialCategory = {};

  inspectTeam = {};

  attachmentInfo = {};

  // 退回原因
  formDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'backReason',
        type: 'string',
        label: intl.get('sslm.siteInvestigateReport.view.title.backReason').d('退回原因'),
        required: false,
      },
    ],
  });

  componentDidMount() {
    const { evalHeaderId, companyId, supplierCompanyId } = this.state;
    this.init();
    if (evalHeaderId) this.queryBasicInfo();
    if (companyId || supplierCompanyId) {
      this.querySupplierInfo();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const { match: { params: { evalHeaderId } = {} } = {} } = nextProps;
    const routerParams = qs.parse(nextProps.location.search.substr(1));
    const { companyId, supplierCompanyId } = routerParams;
    if (evalHeaderId !== prevState.evalHeaderId) {
      nextState.evalHeaderId = evalHeaderId;
    }
    if (companyId !== prevState.companyId) {
      nextState.companyId = companyId;
    }
    if (supplierCompanyId !== prevState.supplierCompanyId) {
      nextState.supplierCompanyId = supplierCompanyId;
    }
    return nextState;
  }

  // 解决从合格申请单进入该页面时数据不刷新问题
  getSnapshotBeforeUpdate(prevProps) {
    const { match: { params: { evalHeaderId } = {} } = {} } = this.props;
    const thisParams = qs.parse(this.props.location.search.substr(1));
    const prevParams = qs.parse(prevProps.location.search.substr(1));
    const { companyId, supplierCompanyId } = thisParams;
    const { companyId: prevCompanyId, supplierCompanyId: prevSupplierCompanyId } = prevParams;
    let _UPDATE = 'NO';
    if (evalHeaderId !== prevProps?.match?.params?.evalHeaderId) {
      _UPDATE = 'MATCH';
    }
    if (companyId !== prevCompanyId || supplierCompanyId !== prevSupplierCompanyId) {
      _UPDATE = 'LOCATION';
    }
    return _UPDATE;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot === 'MATCH') {
      this.onRefresh();
    }
    if (snapshot === 'LOCATION') {
      this.querySupplierInfo();
    }
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const lovCodes = {
      gradeMethod: 'SSLM.SITE_EVAL_TYPE',
      supplierType: 'SSLM.SUPPLIER_TYPE',
      investigationType: 'SSLM.INVESTIGATION_TYPE',
      indicatorTypeList: 'SSLM.KPI_INDICATOR_TYPE',
      resultsList: 'SSLM.INVESTIGATION.RESULTS',
      evalScopeList: 'SSLM_SITE_EVAL_SCOPE',
      tenantId,
    };

    dispatch({
      type: 'siteInvestigateReport/init',
      payload: lovCodes,
    });
  }

  /**
   * 查询基本信息
   */
  @Bind()
  queryBasicInfo(newEvalHeaderId) {
    const { dispatch } = this.props;
    const { evalHeaderId } = this.state;
    this.setState({
      basicFormHidden: true,
    });
    dispatch({
      type: 'siteInvestigateReport/queryBasicInfo',
      payload: {
        evalHeaderId: newEvalHeaderId || evalHeaderId,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATEREPORT.BASICINFO,SSLM_SITEINVESTIGATEREPORT.INSPECTRESULTS',
      },
    }).then(res => {
      if (res) {
        const { evalStatus, needFeedbackFlag, callSuppliersFlag, evalType } = res;
        this.setState({
          basicInfo: res,
          evalStatus,
          needFeedbackFlag,
          callSuppliersFlag,
          evalType,
          basicFormHidden: false,
        });
      }
    });
    if (newEvalHeaderId || evalHeaderId) {
      const headerId = newEvalHeaderId || evalHeaderId;
      // 查询配置表
      queryRelTableConfig('sslm_site_eval_manage', headerId).then(res => {
        this.setState({
          tableList: res,
        });
      });
    }
  }

  /**
   *  供应商自评范围 更改时 控制 供应商自评指标
   * @param {Array} dataSource 评分信息行数据
   * @param {String} evalScope 供应商自评范围
   * @param {Boolean} isInitial 是否为初始化的标识
   * @returns
   */
  @Bind()
  handleCheckedSupplierEvalFlag(dataSource, evalScope) {
    // 处理头信息的供应商自评范围改为 所有指标
    function resetSupplierEvalFlagALL(data) {
      data.forEach(i => {
        const { setFieldsValue } = i.$form;
        if (i.children) {
          resetSupplierEvalFlagALL(i.children);
        }
        setFieldsValue({
          supplierEvalFlag: 1,
        });
      });
    }

    // 处理头信息的供应商自评范围改为 父级指标或者非子级指标
    function resetSupplierEvalFlag(data, evalScopeFlag) {
      data.forEach(i => {
        const { setFieldsValue } = i.$form;
        // 最顶级指标
        if (i.children) {
          resetSupplierEvalFlag(i.children, evalScopeFlag);
          if (evalScopeFlag === 'PARENT') {
            setFieldsValue({
              supplierEvalFlag: 0,
            });
          } else {
            setFieldsValue({
              supplierEvalFlag: 1,
            });
          }
        } else {
          setFieldsValue({
            supplierEvalFlag: 0,
          });
        }
      });
    }

    // 处理头信息的供应商自评范围改为 仅底层指标
    function resetSupplierEvalFlagLeaf(data, evalScopeFlag) {
      data.forEach(i => {
        const { setFieldsValue } = i.$form;
        // 最顶级指标
        if (i.children) {
          resetSupplierEvalFlagLeaf(i.children, evalScopeFlag);
          setFieldsValue({
            supplierEvalFlag: 0,
          });
        } else {
          setFieldsValue({
            supplierEvalFlag: 1,
          });
        }
      });
    }

    if (evalScope === 'NULL' || isEmpty(evalScope)) {
      this.handleClearSupplierEvalFlag(dataSource);
    } else if (evalScope === 'LEAF') {
      dataSource.forEach(o => {
        const { setFieldsValue } = o.$form;

        if (o.children) {
          resetSupplierEvalFlagLeaf(o.children, evalScope);
          setFieldsValue({
            supplierEvalFlag: 0,
          });
        } else {
          setFieldsValue({
            supplierEvalFlag: 1,
          });
        }
      });
    } else {
      dataSource.forEach(o => {
        const { setFieldsValue } = o.$form;
        setFieldsValue({
          supplierEvalFlag: 1,
        });
        if (o.children) {
          if (evalScope === 'ALL') {
            resetSupplierEvalFlagALL(o.children, evalScope);
          } else {
            resetSupplierEvalFlag(o.children, evalScope);
          }
        }
      });
    }
  }

  /**
   *  需要供应商反馈 信息勾选框 取消勾选 清空 行信息的供应商自评指标
   * @param {Array} dataSource 评分信息行数据
   * @returns
   */
  @Bind()
  handleClearSupplierEvalFlag(dataSource) {
    // 处理头信息的供应商自评范围改为 所有指标
    function resetSupplierEvalFlagALL(data) {
      data.forEach(i => {
        const { setFieldsValue } = i.$form;
        if (i.children) {
          resetSupplierEvalFlagALL(i.children);
        }
        setFieldsValue({
          supplierEvalFlag: 0,
        });
      });
    }

    dataSource.forEach(o => {
      const { setFieldsValue } = o.$form;
      setFieldsValue({
        supplierEvalFlag: 0,
      });
      if (o.children) {
        resetSupplierEvalFlagALL(o.children);
      }
    });
  }

  /**
   * 查询工作台带出的供应商信息
   */
  @Bind()
  querySupplierInfo() {
    const { companyId, supplierCompanyId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'siteInvestigateReport/querySupplierInfo',
      payload: { companyId, supplierCompanyId },
    }).then(res => {
      const newBasicInfo = {
        ...res,
        supplierName: res.supplierCompanyName,
        supplierCompanyId: res.partnerCompanyId,
        supplierTenantId: res.partnerTenantId,
        supplierContactor: res.partnerContactor,
        supplierContactMail: res.partnerContactMail,
        supplierRegisteredAddress: res.addressDetail,
        supplierContactPhone: res.partnerContactPhone,
      };
      this.setState({ basicInfo: newBasicInfo });
    });
  }

  /**
   * 按钮状态变更
   * @param {string} btn - 指示是哪个按钮
   */
  @Bind()
  getButtonStatus(btn = '') {
    const { evalStatus } = this.state;
    const obj = {
      save: {
        NEW: false,
        undefined: false,
        APPROVED: false,
        FINAL_COLLECTED: false,
        REJECTED: false,
        FEEDBACK: false,
        FEEDBACK_APPROVALED: false,
        NEW_APPROVALED: false,
      },
      score: {
        NEW: false,
        NEW_APPROVALED: false,
      },
      sum: {
        MANUAL_COMPLETE: false,
        SYSTEM_COMPLETE: false,
      },
      destroy: {
        NEW: false,
        NEW_APPROVALED: false,
        SYSTEM_PROCESSING: false,
        SYSTEM_COMPLETE: false,
        SYSTEM_FAIL: false,
        MANUAL_EVALUATING: false,
        MANUAL_COMPLETE: false,
        FINAL_COLLECTED: false,
        REJECTED: false,
        APPROVED: false,
        WAITINGREJECTED: false,
        FEEDBACK: false,
        FEEDBACK_APPROVALED: false,
      },
      results: {
        FINAL_COLLECTED: false,
        APPROVALING: false,
        APPROVED: false,
        REJECTED: false,
        PUBLISHED: false,
      },
      back: {
        FEEDBACK: false,
      },
    };
    return isUndefined(obj[btn][evalStatus]);
  }

  /**
   * 刷新数据
   */
  @Bind()
  onRefresh() {
    const { evalHeaderId, tableList } = this.state;
    this.queryBasicInfo(evalHeaderId);
    if (this.reviewMaterialCategory && this.reviewMaterialCategory.queryMaterialCategory) {
      this.reviewMaterialCategory.queryMaterialCategory();
    }
    if (this.inspectTeam && this.inspectTeam.queryTeam) {
      this.inspectTeam.queryTeam();
    }
    if (this.attachmentInfo && this.attachmentInfo.queryAttachment) {
      this.attachmentInfo.queryAttachment();
    }
    if (this.scoreInfo && this.scoreInfo.queryScoreInfo) {
      this.scoreInfo.queryScoreInfo();
    }
    if (this.inspectResults && this.inspectResults.queryResults) {
      this.inspectResults.queryResults();
      this.inspectResults.handleReset();
    }
    if (this.quality && this.quality.queryQuality) {
      this.quality.queryQuality();
    }
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable();
      }
    });
  }

  // 保存回调
  @Bind()
  handleSave(payload) {
    const { modal, dispatch, history } = this.props;
    const { evalHeaderId, isAmktClient } = this.state;
    dispatch({
      type: 'siteInvestigateReport/saveAll',
      payload,
    }).then(res => {
      if (res) {
        const { evalHeaderId: newEvalHeaderId, evalType: newEvalType } = res;
        notification.success();
        if (isAmktClient && modal) {
          modal.close();
        } else {
          if (evalHeaderId) {
            this.onRefresh();
            this.handleChangeEvalTpl(true);
          }
          history.push({
            pathname: `/sslm/site-investigate-report/manage/detail/${newEvalHeaderId}/${newEvalType}`,
          });
        }
      }
    });
  }

  // 提交
  @Bind()
  handleSubmit(payload) {
    const { dispatch, siteInvestigateReportRemote } = this.props;
    const { evalType } = this.state;
    dispatch({
      type: 'siteInvestigateReport/submitApproval',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.onRefresh();
        if (evalType === 'ONLINE') {
          this.handleChangeEvalTpl(true);
        }
        siteInvestigateReportRemote.event.fireEvent('cuxSubmitCb', { _this: this });
      }
    });
  }

  /**
   * 保存／执行评分 / 提交反馈
   */
  @Bind()
  handleSaveAndExecute(name) {
    const { dispatch, custConfig, siteInvestigateReportRemote } = this.props;
    const { basicInfo, tableList, sourceType, riskEventNum, riskProcessUuid } = this.state;
    const { validateFieldsAndScroll = e => e } = this.basicForm || {};
    validateFieldsAndScroll({ force: true }, async (err, fieldsValue) => {
      if (!err) {
        let validateFlag = true;
        let resultsValues = {};
        if (this.inspectResults && isFunction(this.inspectResults.checkData)) {
          resultsValues = await this.inspectResults.checkData();
          validateFlag = !!resultsValues;
        }
        if (validateFlag) {
          const evalDateFrom =
            fieldsValue.evalDateFrom && moment(fieldsValue.evalDateFrom).format(DATETIME_MIN);
          const evalDateTo =
            fieldsValue.evalDateTo && moment(fieldsValue.evalDateTo).format(DATETIME_MAX);
          const { evalDateFrom: newEvalDateFrom, evalDateTo: newEvalDateTo } = basicInfo;
          // 考察物料/品类
          const itemCatesData =
            (this.reviewMaterialCategory &&
              this.reviewMaterialCategory.state &&
              this.reviewMaterialCategory.state.dataSource) ||
            [];
          const siteEvalItemCates = getEditTableData(itemCatesData, ['evalItemCateId', '_status']);
          // 考察小组
          const inspectTeamData =
            (this.inspectTeam.state && this.inspectTeam.state.dataSource) || [];
          const siteEvalGroups = getEditTableData(inspectTeamData, ['evalGroupId', '_status']);
          // 附件信息
          const attachmentData = this.attachmentInfo.state && this.attachmentInfo.state.dataSource;

          // 评分信息
          const scoreInfoData = (this.scoreInfo?.state && this.scoreInfo.state.dataSource) || [];
          const siteEvalLineList = getEditTableData(scoreInfoData);

          const siteEvalAttLns = getEditTableData(attachmentData, ['attId', '_status']);

          // 判断物料／小组是否校验通过
          const checkItemCates = itemCatesData.length === siteEvalItemCates.length;
          const checkGroups = inspectTeamData.length === siteEvalGroups.length;

          // 校验模型表数据
          let checkModelTableFlag = true;
          let modelDatas = [];
          tableList.forEach(n => {
            if (this[n.tableCode]) {
              const tableData = this[n.tableCode].checkData();
              if (checkModelTableFlag) {
                checkModelTableFlag = tableData;
              }
              if (tableData) {
                modelDatas = concat(modelDatas, tableData);
              }
            }
          });
          const payload = {
            ...basicInfo,
            ...fieldsValue,
            ...resultsValues,
            sourceType,
            riskEventNum,
            riskProcessUuid,
            evalDateFrom: evalDateFrom || newEvalDateFrom,
            evalDateTo: evalDateTo || newEvalDateTo,
            siteEvalItemCates,
            siteEvalGroups,
            siteEvalAttLns,
            siteEvalLineList,
            informUserIds:
              this.inspectResults &&
              this.inspectResults.state &&
              unionBy(this.inspectResults.state.selectedRows, 'userId')
                .map(n => n.userId)
                .toString(),
            customizeUnitCode,
            modelDatas,
          };
          if (checkItemCates && checkGroups && checkModelTableFlag) {
            if (name === 'save') {
              const res = await siteInvestigateReportRemote.event.fireEvent('cuxHandleSave', {
                payload,
                custConfig,
                onSave: this.handleSave,
                onRefresh: this.onRefresh,
              });
              if (!res) {
                return;
              }
              this.handleSave(payload);
            } else if (name === 'execute') {
              dispatch({
                type: 'siteInvestigateReport/performScore',
                payload,
              }).then(res => {
                if (res) {
                  notification.success();
                  this.onRefresh();
                  this.handleChangeEvalTpl(true);
                }
              });
            } else if (name === 'submitFeedback') {
              dispatch({
                type: 'siteInvestigateReport/submitFeedback',
                payload,
              }).then(res => {
                if (res) {
                  notification.success();
                  this.onRefresh();
                  this.handleChangeEvalTpl(true);
                  const eventProps = {
                    _this: this,
                  };
                  siteInvestigateReportRemote.event.fireEvent('cuxFeedbackCb', eventProps);
                }
              });
            } else if (name === 'publish') {
              dispatch({
                type: 'siteInvestigateReport/publishReport',
                payload,
              }).then(res => {
                if (res) {
                  notification.success();
                  this.onRefresh();
                }
              });
            } else if (name === 'back') {
              // 添加退回原因
              const backReasonData = this.formDs.toData();
              const backReason =
                backReasonData && backReasonData[0] && backReasonData[0].backReason
                  ? backReasonData[0].backReason
                  : '';
              const newPayload = { ...payload, backReason };
              dispatch({
                type: 'siteInvestigateReport/handleBack',
                payload: newPayload,
              }).then(res => {
                if (res) {
                  notification.success();
                  this.onRefresh();
                }
              });
            } else if (name === 'submit') {
              const res = await siteInvestigateReportRemote.event.fireEvent('cuxHandleSubmit', {
                payload,
                custConfig,
                onSubmit: this.handleSubmit,
                onRefresh: this.onRefresh,
              });
              if (!res) {
                return;
              }
              this.handleSubmit(payload);
            }
          } else {
            notification.warning({
              message: intl
                .get('sslm.siteInvestigateReport.view.message.perfectInfo')
                .d('请完善信息'),
            });
          }
        }
      }
    });
  }

  /**
   * 汇总统计
   */
  @Bind()
  handleSum() {
    const { dispatch } = this.props;
    const { evalHeaderId, basicInfo } = this.state;
    const { hasCancelFlag = false } = basicInfo;
    if (hasCancelFlag) {
      Modal.confirm({
        title: intl
          .get('sslm.siteInvestigateReport.view.message.handleSumConfirm')
          .d('存在评分人放弃评分，请确认是否继续汇总？'),
        onOk: () => {
          dispatch({
            type: 'siteInvestigateReport/summaryStatistics',
            payload: { evalHeaderId },
          }).then(res => {
            if (res) {
              notification.success();
              this.onRefresh();
            }
          });
        },
      });
    } else {
      dispatch({
        type: 'siteInvestigateReport/summaryStatistics',
        payload: { evalHeaderId },
      }).then(res => {
        if (res) {
          notification.success();
          this.onRefresh();
        }
      });
    }
  }

  /**
   * 作废
   */
  @Bind()
  handleInvalid() {
    const { evalHeaderId } = this.state;
    const { dispatch, history } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.destroyConfirm').d('确认作废？'),
      onOk: () => {
        dispatch({
          type: 'siteInvestigateReport/detailInvalid',
          payload: { evalHeaderId },
        }).then(res => {
          if (res) {
            notification.success();
            history.push('/sslm/site-investigate-report/manage/list');
          }
        });
      },
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { evalHeaderId } = this.state;
    const { dispatch, history } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        dispatch({
          type: 'siteInvestigateReport/detailDelete',
          payload: { evalHeaderId },
        }).then(res => {
          if (res) {
            notification.success();
            history.push('/sslm/site-investigate-report/manage/list');
          }
        });
      },
    });
  }

  /**
   * 查询操作记录
   */
  @Bind()
  queryOperationRecord(page = {}) {
    const { dispatch } = this.props;
    const { evalHeaderId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryOperationRecord',
      payload: { evalHeaderId, page },
    });
  }

  /**
   * 操作记录弹框
   */
  @Bind()
  handleOperationRecord() {
    const { evalHeaderId } = this.state;
    C7nModal.open({
      // drawer: true,
      okCancel: false,
      key: C7nModal.key(),
      style: { width: 800 },
      bodyStyle: { paddingTop: 0 },
      // okText: intl.get('hzero.common.button.close').d('关闭'),
      // title: intl.get('hzero.common.button.operating').d('操作记录'),
      closable: true,
      footer: null,
      children: <H0ApproveRecord documentId={evalHeaderId} />,
    });
  }

  /**
   * 跳转360详情菜单
   */
  @Bind()
  handleViewSupplier() {
    const { basicInfo, sourceType } = this.state;
    const partnerCompanyId = this.basicForm && this.basicForm.getFieldValue('supplierCompanyId');
    const partnerTenantId = this.basicForm && this.basicForm.getFieldValue('supplierTenantId');
    // 判断平台供应商不为空
    if (!isNil(partnerCompanyId)) {
      handleSupplierDetail({
        ...basicInfo,
        sourceType,
        partnerCompanyId,
        partnerTenantId,
        supplierTenantId: partnerTenantId,
        supplierCompanyId: partnerCompanyId,
      });
    } else {
      Modal.warning({
        title: intl
          .get('sslm.siteInvestigateReport.view.message.handleViewSupplier')
          .d('需选择考察平台供应商才可查看供应商360度信息'),
      });
      return false;
    }
  }

  /**
   * 更新needFeedbackFlag/callSuppliersFlag/evalScope到state
   * @param field {object}
   */
  @Bind()
  setFieldToState(field) {
    this.setState(field);
  }

  /**
   * 更新附件数量
   * @param field {object}
   */
  @Bind()
  updateFileNum(allFileNum) {
    this.setState({ allFileNum });
  }

  /**
   * 质量整改是否隐藏
   */
  @Bind()
  setQualityVisible(visible) {
    this.setState({ qualityVisible: visible });
  }

  /**
   * 修改考察模板-清空评分信息页签
   * @param field {object}
   */
  @Bind()
  handleChangeEvalTpl(flag) {
    this.setState({
      visableScoreInfoFlag: flag,
    });
  }

  /**
   * 修改评分方式
   */
  @Bind()
  handleChangeEvalType(value) {
    this.setState({
      evalType: value,
    });
  }

  /**
   * 退回评分回调
   * (弃用)
   */
  @Bind()
  handleBackScore() {
    const { dispatch } = this.props;
    const { evalHeaderId } = this.state;
    const { scoreInfoSelectedRowKeys = [] } = this.scoreInfo.state;
    if (isEmpty(scoreInfoSelectedRowKeys)) {
      notification.warning({
        message: intl
          .get('sslm.siteInvestigateReport.view.message.chooseAtLeastOne')
          .d('请至少选择一条评分信息'),
      });
    } else {
      dispatch({
        type: 'siteInvestigateReport/handleBackScore',
        payload: {
          evalHeaderId,
          body: scoreInfoSelectedRowKeys,
        },
      }).then(res => {
        if (res) {
          this.scoreInfo.state.scoreInfoSelectedRowKeys = [];
          notification.success();
          this.onRefresh();
        }
      });
    }
  }

  /**
   * 评分信息展开/收起
   */
  @Bind()
  expandScore() {
    const { scoreInfoExpand } = this.state;
    if (this.scoreInfo) {
      if (scoreInfoExpand) {
        this.scoreInfo.collapseAll();
      } else {
        this.scoreInfo.expandAll();
      }
    }
    this.setState({
      scoreInfoExpand: !scoreInfoExpand,
    });
  }

  /**
   * 跳转质量整改单页面
   */
  @Bind()
  goToQualityRectification() {
    const { evalHeaderId } = this.state;
    const { dispatch, history } = this.props;
    dispatch({
      type: 'siteInvestigateReport/queryProblemHeader',
      payload: {
        body: [evalHeaderId],
      },
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        const { problemHeaderId, problemStatus } = res;
        if (problemStatus === 'NEW') {
          history.push(`/sqam/create8D/detail/${problemHeaderId}`);
        } else {
          history.push(`/sqam/initiated8D/detail/${problemHeaderId}`);
        }
      }
    });
  }

  // 退回评分确认回调
  @Bind()
  handleBackScoreOk(params) {
    const { dispatch } = this.props;
    if (!isUndefined(this.backScore)) {
      return backScoreSave({
        dispatch,
        dataSet: this.backScore.dataSet,
        onRefresh: this.onRefresh,
        ...params,
      });
    }
  }

  // 退回评分弹框
  @Bind()
  backScoreModal() {
    const { match: { params: { evalHeaderId } } = {} } = this.props;
    const { basicInfo } = this.state;

    const { evalTplId } = basicInfo;

    C7nModal.open({
      closable: true,
      drawer: true,
      key: C7nModal.key(),
      style: { width: 900 },
      onOk: () => this.handleBackScoreOk({ headerId: evalHeaderId, evalTplId }),
      title: intl.get('sslm.common.view.button.backScore').d('退回评分'),

      children: (
        <BackScore
          evalTplId={evalTplId}
          headerId={evalHeaderId}
          onRef={node => {
            this.backScore = node;
          }}
        />
      ),
    });
  }

  // 退回弹框
  @Bind()
  backModal() {
    C7nModal.open({
      key: C7nModal.key(),
      width: 450,
      onOk: () => this.handleSaveAndExecute('back'),
      title: intl.get('sslm.siteInvestigateReport.view.title.backReason').d('退回原因'),
      children: (
        <Form dataSet={this.formDs} labelLayout="float">
          <TextArea name="backReason" />
        </Form>
      ),
    });
  }

  // 获取提交审批按钮是否展示逻辑
  @Bind()
  getSubmitReviewVisibleFlag() {
    const {
      basicInfo: { approvalMethod },
      evalStatus,
      evalType,
      needFeedbackFlag,
    } = this.state;
    const isOnLine = evalType === 'ONLINE';
    if (isOnLine) {
      return (
        evalStatus === 'FINAL_COLLECTED' || // 汇总完成
        evalStatus === 'REJECTED' || // 审批拒绝
        (evalStatus === 'FEEDBACK' && approvalMethod !== 'SELF') || // 已反馈并且审批方式不为“无需审批”
        (evalStatus === 'NEW' && approvalMethod !== 'SELF') // 新建并且审批方式不为“无需审批”
      );
    } else {
      return (
        evalStatus === 'FINAL_COLLECTED' ||
        evalStatus === 'REJECTED' ||
        (needFeedbackFlag ? evalStatus === 'FEEDBACK' : evalStatus === 'NEW')
      );
    }
  }

  render() {
    const {
      siteInvestigateReport: {
        code: {
          gradeMethod = [],
          supplierType = [],
          investigationType = [],
          indicatorTypeList = [],
          resultsList = [],
          evalScopeList = [],
        } = {},
      } = {},
      customizeForm,
      customizeTable,
      customizeFilterForm,
      custLoading,
      optionLoading,
      workbenchLoading,
      queryQualityLoading,
      backLoading,
      customizeBtnGroup,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
      siteInvestigateReportRemote,
    } = this.props;
    const {
      isPub,
      isView,
      evalType,
      basicInfo,
      evalStatus,
      historyBack,
      evalHeaderId,
      needFeedbackFlag,
      callSuppliersFlag,
      allFileNum,
      scoreInfoExpand,
      qualityVisible,
      visableScoreInfoFlag,
      basicFormHidden,
      tableList,
      isAmktClient,
    } = this.state;

    const { fileNum = 0, approvalMethod, supplierSource, averageFlag } = basicInfo;

    const isOnLine = evalType === 'ONLINE';

    // 汇总完成状态允许点击提交审批,线下打分，勾选需要供应商反馈，状态为已反馈允许提交审批,线下打分,不勾选需要供应商反馈,状态为新建允许提交审批
    const isSubmitReview = this.getSubmitReviewVisibleFlag();

    // 新建状态并且勾选需要供应商反馈信息，提交反馈按钮可点击
    const submitFeedbackFlag = isOnLine
      ? !(
          needFeedbackFlag &&
          ((evalStatus === 'NEW' && approvalMethod === 'SELF') || evalStatus === 'NEW_APPROVALED')
        )
      : !(evalStatus === 'NEW' && needFeedbackFlag);

    // 首先判断是否是线上打分，其次判断是否需供应商反馈，如果勾选，状态必须是已反馈，如果不勾选，状态必须是新建
    const executeFlag =
      isOnLine &&
      (needFeedbackFlag
        ? (evalStatus === 'FEEDBACK' && approvalMethod === 'SELF') ||
          evalStatus === 'FEEDBACK_APPROVALED'
        : (evalStatus === 'NEW' && approvalMethod === 'SELF') || evalStatus === 'NEW_APPROVALED') &&
      visableScoreInfoFlag;

    const publishFlag = evalStatus === 'APPROVED' && callSuppliersFlag;

    const viweQualityFlag = (() => {
      const normalFlag =
        (evalStatus === 'APPROVED' || evalStatus === 'PUBLISHED') && supplierSource === 'plate';
      return siteInvestigateReportRemote
        ? siteInvestigateReportRemote.process(
            'SSLM_SITE_INVESTIGATE_REPORT_DEFINITION_VIEW_QUALITY_FLAG',
            normalFlag,
            { evalStatus, supplierSource }
          )
        : normalFlag;
    })();

    // 基本信息
    const basicInfoProps = {
      isView,
      isPub,
      isAmktClient,
      custLoading,
      customizeForm,
      basicInfo,
      gradeMethod,
      evalHeaderId,
      supplierType,
      investigationType,
      evalScopeList,
      entrance,
      siteInvestigateReportRemote,
      setFieldToState: this.setFieldToState,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.BASICINFO',
      handleChangeEvalTpl: this.handleChangeEvalTpl,
      handleChangeEvalType: this.handleChangeEvalType,
      handleCheckedSupplierEvalFlag: this.handleCheckedSupplierEvalFlag,
      handleClearSupplierEvalFlag: this.handleClearSupplierEvalFlag,
      scoreInfoData: this.scoreInfo,
      onRef: node => {
        this.basicForm = node;
      },
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      isPub,
      isView,
      evalStatus,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeBtnGroup,
      onRef: node => {
        this.reviewMaterialCategory = node;
      },
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.REVIEWMATERIALCATEGORY',
    };

    // 考察小组
    const inspectTeamProps = {
      isPub,
      isView,
      evalStatus,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeBtnGroup,
      onRefresh: this.onRefresh,
      onRef: node => {
        this.inspectTeam = node;
      },
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    };

    // 质量整改
    const qualityProps = {
      evalHeaderId,
      custLoading,
      customizeTable,
      customizeTableCode: 'SSLM_SITEINVESTIGATEREPORT.QUALITY',
      onRef: node => {
        this.quality = node;
      },
      setQualityVisible: this.setQualityVisible,
    };

    // 附件信息
    const attachmentInfoProps = {
      isPub,
      isView,
      basicInfo,
      evalStatus,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeBtnGroup,
      onRef: node => {
        this.attachmentInfo = node;
      },
      updateFileNum: this.updateFileNum,
      remote: siteInvestigateReportRemote,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
      customizeBtnGroupCode: 'SSLM_SITEINVESTIGATEREPORT.ATT_INFO_BTNS',
    };

    // 评分信息
    const scoreInfoProps = {
      isPub,
      isView,
      evalStatus,
      evalHeaderId,
      onRefresh: this.onRefresh,
      onRef: node => {
        this.scoreInfo = node;
      },
      customizeTable,
      customizeUnitCode:
        'SSLM_SITEINVESTIGATEREPORT.SCOREINFO,SSLM_SITEINVESTIGATEREPORT.SCOREINFO_FILTER',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_BTNGROUP',
      indicatorTypeList,
      customizeFilterForm,
      needFeedbackFlag,
      averageFlag,
      linkColor,
      basicInfo,
      siteInvestigateReportRemote,
      // handleCheckedSupplierEvalFlag: this.handleCheckedSupplierEvalFlag,
    };

    // 考察结果
    const inspectResultsProps = {
      isPub,
      isView,
      evalType,
      evalStatus,
      custLoading,
      evalHeaderId,
      customizeForm,
      resultsList,
      headerForm: this.basicForm,
      onRef: node => {
        this.inspectResults = node;
      },
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.INSPECTRESULTS',
      customizeUnitCode:
        'SSLM_SITEINVESTIGATEREPORT.BASICINFO,SSLM_SITEINVESTIGATEREPORT.INSPECTRESULTS',
      siteReportRemote: siteInvestigateReportRemote,
    };

    // 模型
    const modelTableProps = {
      tableList,
      relationId: evalHeaderId,
      readOnly: isView || isPub,
      parentRef: this,
    };

    const commonDisplayFlag = !isPub && !isView;
    const scoreInfoDisplayFlag = isOnLine && visableScoreInfoFlag;
    const saveFlag = !this.getButtonStatus('save') && commonDisplayFlag;
    const showSaveFlag = siteInvestigateReportRemote
      ? siteInvestigateReportRemote.process(
          'SSLM_SITE_INVESTIGATE_REPORT_DEFINITION_SAVE_BTN_FLAG',
          saveFlag,
          { evalStatus }
        )
      : saveFlag;
    // 【考察结果】页签显示逻辑
    const resultsFlag = !this.getButtonStatus('results') || (evalHeaderId && evalType !== 'ONLINE');
    const remoteResultsFlag = siteInvestigateReportRemote.process(
      'SSLM_SITE_INVESTIGATE_REPORT_DEFINITION_RESULTS_FLAG',
      resultsFlag,
      {
        basicInfo,
        evalStatus,
        _this: this,
      }
    );

    const buttons = [
      {
        name: 'save',
        btnProps: {
          icon: 'save',
          type: 'primary',
          loading: optionLoading,
          onClick: () => this.handleSaveAndExecute('save'),
          style: { display: showSaveFlag ? 'block' : 'none' },
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'qualityRectification',
        btnComp: PerButton,
        hidden: !(viweQualityFlag && commonDisplayFlag) || isAmktClient,
        btnProps: {
          permissionList: [
            {
              code:
                'srm.partner.site-investigate-report.manage.ps.botton.initiate.quality.rectification',
              type: 'button',
              meaning: '现场考察报告管理--详情页发起质量整改按钮',
            },
          ],
          icon: 'link',
          loading: optionLoading || queryQualityLoading,
          onClick: () => this.goToQualityRectification(),
          // style: { display: viweQualityFlag && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl
          .get('sslm.siteInvestigateReport.view.button.qualityRectification')
          .d('发起质量整改'),
      },
      {
        name: 'submitFeedback',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.feedback.submit',
              type: 'button',
              meaning: '现场考察报告管理--详情页执行反馈',
            },
          ],
          icon: 'check',
          loading: optionLoading,
          onClick: () => this.handleSaveAndExecute('submitFeedback'),
          style: { display: !submitFeedbackFlag && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.submitFeedback').d('提交反馈'),
      },
      {
        name: 'execute',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.perform.score',
              type: 'button',
              meaning: '现场考察报告管理--详情页执行评分按钮',
            },
          ],
          icon: 'check',
          loading: optionLoading || backLoading,
          onClick: () => this.handleSaveAndExecute('execute'),
          style: { display: executeFlag && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.execute').d('执行评分'),
      },
      {
        name: 'sum',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.summary.statistics',
              type: 'button',
              meaning: '现场考察报告管理--详情页汇总统计按钮',
            },
          ],
          icon: 'bar-chart',
          loading: optionLoading,
          onClick: this.handleSum,
          style: {
            display:
              this.getButtonStatus('sum') || !isOnLine || !commonDisplayFlag ? 'none' : 'block',
          },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.sum').d('汇总统计'),
      },
      {
        name: 'submitReview',
        btnProps: {
          icon: 'check',
          loading: optionLoading || backLoading,
          onClick: () => this.handleSaveAndExecute('submit'),
          style: { display: isSubmitReview && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.submitReview').d('提交审批'),
      },
      {
        name: 'publish',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.release',
              type: 'button',
              meaning: '现场考察报告管理--详情页发布按钮',
            },
          ],
          icon: 'rocket',
          onClick: () => this.handleSaveAndExecute('publish'),
          loading: optionLoading,
          style: { display: publishFlag && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl.get('hzero.common.button.publish').d('发布'),
      },
      {
        name: 'destroy',
        btnComp: PerButton,
        hidden: isAmktClient,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.delete',
              type: 'button',
              meaning: '现场考察报告管理-作废',
            },
          ],
          icon: 'close',
          loading: optionLoading,
          onClick: this.handleInvalid,
          style: {
            display: !this.getButtonStatus('destroy') && commonDisplayFlag ? 'block' : 'none',
          },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.invalid').d('作废'),
      },
      {
        name: 'backScore',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.return.score',
              type: 'button',
              meaning: '现场考察报告管理--详情页退回评分',
            },
          ],
          icon: 'arrow-left',
          loading: optionLoading,
          onClick: this.backScoreModal,
          style: {
            display:
              ['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'FINAL_COLLECTED', 'REJECTED'].includes(
                evalStatus
              ) &&
              evalType === 'ONLINE' &&
              commonDisplayFlag
                ? 'block'
                : 'none',
          },
        },
        child: intl.get(`sslm.siteInvestigateReport.view.button.backScore`).d('退回评分'),
      },
      {
        name: 'back',
        btnComp: PerButton,
        btnProps: {
          type: 'c7n-pro',
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.return',
              type: 'button',
              meaning: '现场考察报告管理--详情页退回按钮',
            },
          ],
          icon: 'reply',
          loading: backLoading || optionLoading,
          onClick: this.backModal,
          style: {
            display:
              !this.getButtonStatus('back') && needFeedbackFlag === 1 && commonDisplayFlag
                ? 'block'
                : 'none',
          },
        },
        child: intl.get(`hzero.common.button.return`).d('退回'),
      },
      {
        name: 'delete',
        btnComp: PerButton,
        hidden: isAmktClient,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.button.new.delete',
              type: 'button',
              meaning: '删除',
            },
          ],
          icon: 'delete',
          loading: optionLoading,
          onClick: this.handleDelete,
          style: { display: ['NEW'].includes(evalStatus) && commonDisplayFlag ? 'block' : 'none' },
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        name: 'exportPro',
        hidden: isAmktClient,
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/site-eval-headers/${evalHeaderId}/export`,
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          otherButtonProps: {
            hidden: !evalHeaderId,
            permissionList: [
              {
                code: 'srm.partner.site-investigate-report.manage.button.ps.detail.export',
                type: 'button',
                meaning: '现场考察报告管理-明细-导出',
              },
            ],
          },
          templateCode: 'SRM_C_SRM_SSLM_SITE_EVAL_MANAGE_DETAIL_EXPORT',
        },
      },
      {
        name: 'viewSupplier',
        btnComp: PerButton,
        hidden: isAmktClient,
        btnProps: {
          icon: 'file',
          loading: optionLoading,
          onClick: this.handleViewSupplier,
          style: { display: !isNil(evalStatus) ? 'block' : 'none' },
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.button.supplier.info',
              type: 'button',
              meaning: '现场考察报告管理-供应商360度查询',
            },
          ],
        },
        child: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360度查询'),
      },
      {
        name: 'operationRecord',
        btnProps: {
          icon: 'clock-circle-o',
          loading: optionLoading,
          onClick: this.handleOperationRecord,
          style: { display: evalHeaderId ? 'block' : 'none' },
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.operationRecord').d('操作记录'),
      },
      {
        name: 'collapseAll',
        btnProps: {
          loading: optionLoading,
          icon: scoreInfoExpand ? 'up' : 'down',
          onClick: this.expandScore,
          style: { display: scoreInfoDisplayFlag ? 'block' : 'none' },
        },
        child: scoreInfoExpand
          ? intl.get('hzero.common.button.collapseAll').d('全部收起')
          : intl.get('hzero.common.button.expandAll').d('全部展开'),
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.siteInvestigateReport.view.maintain.title').d('现场考察报告维护')}
          backPath={
            isAmktClient
              ? ''
              : !isPub
              ? '/sslm/site-investigate-report/manage/list'
              : historyBack || ''
          }
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATEREPORT.HEADER_BTNGROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} custLoading={custLoading} />
          )}
        </Header>
        <Content>
          <Spin spinning={optionLoading || workbenchLoading || false}>
            {customizeTabPane(
              {
                code: 'SSLM_SITEINVESTIGATEREPORT.DETAIL_TABPANE',
              },
              <Tabs defaultActiveKey="basicInform" animated={false}>
                <TabPane
                  tab={intl.get('sslm.siteInvestigateReport.view.tabs.basicInfo').d('基本信息')}
                  key="basicInform"
                >
                  {!basicFormHidden && <BasicInfo {...basicInfoProps} />}
                </TabPane>
                {evalHeaderId && (
                  <TabPane
                    forceRender
                    tab={intl
                      .get('sslm.siteInvestigateReport.view.tabs.reviewMaterialCategory')
                      .d('考察物料/品类')}
                    key="reviewMaterialCategory"
                  >
                    <ReviewMaterialCategory {...reviewMaterialCategoryProps} />
                  </TabPane>
                )}
                {evalHeaderId && (
                  <TabPane
                    forceRender
                    tab={intl.get('sslm.siteInvestigateReport.view.tabs.inspectTeam').d('考察小组')}
                    key="inspectTeam"
                  >
                    <InspectTeam {...inspectTeamProps} />
                  </TabPane>
                )}
                {evalHeaderId && (
                  <TabPane
                    forceRender
                    tab={intl
                      .get('sslm.siteInvestigateReport.view.tabs.qectificationDoc')
                      .d('关联整改单据')}
                    key="qualityRectification"
                    hidden={!(viweQualityFlag && qualityVisible)}
                  >
                    <QualityRectification {...qualityProps} />
                  </TabPane>
                )}
                {evalHeaderId && (
                  <TabPane
                    forceRender
                    tab={
                      <span>
                        {intl
                          .get('sslm.siteInvestigateReport.view.tabs.attachmentInfo')
                          .d('附件信息')}
                        <Tag
                          color={tabsPrimaryColor || '#108ee9'}
                          style={{
                            height: 'auto',
                            lineHeight: '15px',
                            marginLeft: '4px',
                          }}
                        >
                          {isNumber(allFileNum) ? allFileNum : fileNum}
                        </Tag>
                      </span>
                    }
                    key="attachmentInfo"
                  >
                    <AttachmentInfo {...attachmentInfoProps} />
                  </TabPane>
                )}
                {getDynamicTable(modelTableProps)}
              </Tabs>
            )}
            {evalHeaderId && isOnLine && visableScoreInfoFlag && (
              <Fragment>
                <h3 style={{ margin: '16px 0' }}>
                  {intl.get('sslm.siteInvestigateReport.view.title.scoreInfo').d('评分信息')}
                </h3>
                <ScoreInfo {...scoreInfoProps} />
              </Fragment>
            )}
            {remoteResultsFlag && (
              <Fragment>
                <h3 style={{ margin: '16px 0' }}>
                  {intl.get('sslm.siteInvestigateReport.view.title.inspectResults').d('考察结果')}
                </h3>
                <InspectResults {...inspectResultsProps} />
              </Fragment>
            )}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
