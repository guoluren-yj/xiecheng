/**
 * List - 供应商关联业务单据列表
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { compose, forIn, isFunction, isEmpty } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import React, { Fragment, useEffect, useCallback, useState, useMemo } from 'react';
import { DataSet, Table, Tabs, Modal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { openTab } from 'utils/menuTab';

import { tabModelTable } from 'srm-front-sslm/lib/routes/components/C7nDynamicTable';
import { queryRelTableConfig } from 'srm-front-sslm/lib/routes/components/DynamicTable/utils/service';
import { queryMenuPermissions } from 'srm-front-sslm/lib/services/workbenchService';
import { handleGetSteps } from 'srm-front-sslm/lib/services/purchaserEvaluationWorkbenchServices';

import { investigateDS, investigateColumns } from './stores/investigateDS';
import { sampleDS, sampleColumns } from './stores/sampleDS';
import { siteInspectionDS, siteInspectionColumns } from './stores/siteInspectionDS';
import { evaluationDS, evaluationColumns } from './stores/evaluationDS';
import { materialDS, materialColumns } from './stores/materialDS';
import { supplierEvaluationDS, getColumns } from './stores/supplierEvaluationDS';
import { evalEventDS, evalEventColumns } from './stores/evalEventDS';
import { ppapDocumentDS, ppapDocumentColumns } from './stores/ppapDocumentDS';
import {
  agreementDS,
  agreementStageDS,
  acceptDocumentDS,
  optionRecordDS,
} from './stores/agreementDS';
import { inquiryDS, inquiryColumns } from './stores/inquiryDS.js';
import { bidDS, bidColumns } from './stores/bidDS';
import {
  rectifyDS,
  rectifyColumns,
  rectifyReportDS,
  rectifyReportColumns,
} from './stores/rectifyDS.js';
import AgreementList from './AgreementList';
import { unitCode, jumpDetail, formatterCode, getTabPaneList } from './utils';

const { TabPane } = Tabs;
const tableMaxHeight = { maxHeight: `calc(100vh - 250px)` };
let searchBarRef; // 筛选器ref

// 菜单编码，顺序不可调整
const menuCode = [
  'srm.partner.purchaser-investigation-workbench', // 采购方调查表工作台
  'srm.pc-admin.pc-purchaser.workspace2', // 协议工作台
];

const List = props => {
  const [tableList, handleTableList] = useState([]);
  const [reQueryFlag, handleReQueryFlag] = useState(false);
  const [progressList, setProgressList] = useState([]); // 评估进度-进度条
  const [menuPermissions, setMenuPermissions] = useState({
    purchaserInvestig: false,
    contractWorkspace: false,
  }); // 判断当前用户是否有菜单权限

  const {
    investigateDs,
    sampleDs,
    siteInspectionDs,
    agreementDs,
    agreementStageDs,
    acceptDocumentDs,
    optionRecordDs,
    evaluationDs,
    inquiryDs,
    bidDs,
    rectifyDs,
    materialDs,
    supplierEvaluationDs,
    evalEventDs,
    rectifyReportDs,
    customizeTabPane,
    customizeTable,
    href,
    pageData,
    dispatch,
    location,
    supplierRelateDocRemote,
    ppapDocumentDs,
  } = props;
  const { sourceType, tabsUnitCode } = querystring.parse(href?.split('?')[1]);
  const collapseFlag = sourceType === 'COLLAPSE'; // 二开项目 折叠面板嵌入的关联单据(src-31794)
  const isPub = location?.pathname?.includes('/pub/');
  const routerParam = querystring.parse(location?.search?.substr(1));
  const { defaultActiveKey } = routerParam || {}; // 链接上获取自动激活页签
  const [autoQueryTab, setAutoQueryTab] = useState(); // 链接上参数作为默认筛选，自动查询页签
  const [activeKey, setActiveKey] = useState(defaultActiveKey || 'investigate'); // 默认激活页签
  // 已查询过的tab，解决多次跳转数据不刷新问题
  const [loadTab, setLoadTab] = useState({ [defaultActiveKey || 'investigate']: true });
  // 从个性化缓存中获取的单据头信息
  const custBaseInfo = pageData?.cache[
    'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO'
  ]?.dataSet?.current?.toData();
  const {
    companyId,
    supplierCompanyId,
    customizeUnitCode,
    sourceTarget,
    toStageId,
    requisitionId,
    // 生命周期详细页参数
    tenantId,
    spfmCompanyId,
    spfmPartnerCompanyId,
    partnerTenantId,
    changeReqId,
    // 判断是从360还是其他页面点击关联单据按钮
    isLifeCyclesSummaryFlag = 0,
    partnerId,
    // 管控维度（公司级：COMPANY|集团集：GROUP）
    dimensionCode,
    sourceKey, // 跳转来源
  } = custBaseInfo || routerParam;

  // tab的个性化编码，个性化折叠面板配置出来的关联单据需手动指定个性化单元
  const tabsCustomizeCode = tabsUnitCode || customizeUnitCode;

  const tabPaneList = useMemo(() => getTabPaneList({ sourceKey }), [sourceKey]);

  useEffect(() => {
    // 查询配置表
    queryRelTableConfig('sslm_relation_req').then(res => {
      handleTableList(res);
      handleReQueryFlag(!reQueryFlag);
    });
    // 查询用户是否有新调查表菜单权限
    handleMenuPermissions();
    // 查询供应商评估进度步骤条
    getStepList();
    handleCustomizeQuery();
  }, []);

  useEffect(() => {
    handleQuery();
  }, [companyId, supplierCompanyId, isLifeCyclesSummaryFlag, dimensionCode, sourceKey]);

  const handleQuery = () => {
    const supRelateDocParams = {
      routerParam,
    };
    // 博威尔特如果有埋点，将埋点参数传入相应页签进行数据过滤
    const remoteData = supplierRelateDocRemote
      ? supplierRelateDocRemote.process('SSLM_SUPPLIER_RELATE_DOC_PARAMS', {}, supRelateDocParams)
      : {};
    const {
      material: remoteMaterial = {},
      evaluation: remoteEvaluation = {},
      investigate: remoteInvestigate = {},
      siteInspection: remoteSiteInspection = {},
    } = remoteData;
    const prefix =
      sourceKey === 'NEW360QUERY'
        ? 'SSLM.SUPPLIER_360_PAGE_RELATED_DOC'
        : sourceKey === 'LIFE_CYCLE'
        ? 'SSLM.LIFE_CYCLE.RELATED_DOC'
        : 'SSLM.SUPPLIER_RELATED_DOC';
    investigateDs.setQueryParameter('params', {
      partnerCompanyId: supplierCompanyId,
      isLifeCyclesSummaryFlag,
      queryCompanyAndGroup: 1,
      customizeUnitCode: `${prefix}.SURVEY,${prefix}.SURVEY_SEARCH_BAR`,
      ...remoteInvestigate,
    });
    sampleDs.setQueryParameter('params', {
      supplierId: supplierCompanyId,
      isLifeCyclesSummaryFlag,
      customizeUnitCode: `${prefix}.SAMPLE,${prefix}.SAMPLE_SEARCH_BAR`,
    });
    siteInspectionDs.setQueryParameter('params', {
      supplierCompanyId,
      isLifeCyclesSummaryFlag: 1, // src-21084 现场考察单据展示要个360汇总查询一致
      customizeUnitCode: `${prefix}.SITE_INSPECTION,${prefix}.SITE_INSPECTION_SEARCH_BAR`,
      ...remoteSiteInspection,
    });
    evaluationDs.setQueryParameter('params', {
      isLifeCyclesSummaryFlag,
      pageEntryPoint: 'CUSTOMER_OWNED',
      supplierId: supplierCompanyId,
      customizeUnitCode: `${prefix}.EVALUATION,${prefix}.EVALUATION_SEARCH_BAR`,
      ...remoteEvaluation,
    });
    agreementDs.setQueryParameter('params', {
      supplierCompanyId,
      customizeUnitCode: `${prefix}.AGREEMENT_LIST,${prefix}.AGREEMENT_SEARCH_BAR`,
    });
    inquiryDs.setQueryParameter('params', {
      supplierCompanyId,
      customizeUnitCode: `${prefix}.INQUIRY_LIST,${prefix}.INQUIRY_SEARCH_BAR`,
    });
    bidDs.setQueryParameter('params', {
      supplierCompanyId,
      secondarySourceCategory: 'NEW_BID',
      customizeUnitCode: `${prefix}.BID_LIST,${prefix}.BID_SEARCH_BAR`,
    });
    rectifyDs.setQueryParameter('params', {
      supplierCompanyId,
      pageEntryPoint: 'CUSTOMER_OWNED',
      customizeUnitCode: `${prefix}.RECTIFY_LIST,${prefix}.RECTIFY_SEARCH_BAR`,
    });
    materialDs.setQueryParameter('params', {
      supplierCompanyId,
      isReturnEmptyCompanyFlag: dimensionCode === 'GROUP' ? undefined : 1,
      customizeUnitCode: `${prefix}.MATERIAL_LIST,${prefix}.MATERIAL_SEARCH_BAR`,
      ...remoteMaterial,
    });
    evalEventDs.setQueryParameter('params', {
      dimensionCode,
      supplierCompanyId,
      customizeUnitCode: `${prefix}.EVAL_EVENT,${prefix}.EVAL_EVENT_SEARCH_BAR`,
    });
    supplierEvaluationDs.setQueryParameter('params', {
      supplierCompanyId,
      isLifeCyclesSummaryFlag: 1,
      customizeUnitCode: `${prefix}.EVALUATION_REPORT,${prefix}.EVALUATION_REPORT_SEARCH_BAR`,
    });
    ppapDocumentDs.setQueryParameter('params', {
      supplierCompanyId,
      action: 'ALL',
      customizeUnitCode: `${prefix}.PPAP_DOCUMENT,${prefix}.PPAP_SEARCH_BAR`,
    });
    for (const key in loadTab) {
      if (Object.prototype.hasOwnProperty.call(loadTab, key)) {
        if (loadTab[key] && dataSetObj[key]) {
          dataSetObj[key].query();
        }
      }
    }
  };

  // 查询角色菜单权限
  const handleMenuPermissions = useCallback(() => {
    queryMenuPermissions({
      code: menuCode.join(','),
    }).then(res => {
      if (getResponse(res)) {
        setMenuPermissions({
          purchaserInvestig: res[menuCode[0]],
          contractWorkspace: res[menuCode[1]],
        });
      }
    });
  }, []);

  const getStepList = useCallback(() => {
    handleGetSteps().then(response => {
      const res = getResponse(response);
      if (res) {
        setProgressList(res);
      }
    });
  }, []);

  // 处理页面返回按钮
  const handleBackPath = useCallback(() => {
    const { state: { historyBack = '' } = {} } = location || {};
    let backPath = historyBack;

    const queryParams = {
      toStageId,
      requisitionId,
      tenantId,
      companyId,
      spfmCompanyId,
      supplierCompanyId,
      spfmPartnerCompanyId,
      partnerTenantId,
      changeReqId,
    };
    switch (sourceTarget) {
      case 'Recommend':
        backPath = '/pub/sslm/supplier-life-manage/recommend-view';
        break;
      case 'Qualified':
        backPath = '/pub/sslm/supplier-life-manage/qualified-view';
        break;
      case 'Prepare':
        backPath = '/pub/sslm/supplier-life-manage/prepare-view';
        break;
      case 'Potential':
        backPath = '/pub/sslm/supplier-life-manage/potential-view';
        break;
      case 'Eliminate':
        backPath = '/pub/sslm/supplier-life-manage/eliminate-view';
        break;
      case 'lifeCycleSummary':
        backPath = '/pub/sslm/supplier-life-manage/supplier-detail';
        break;
      default:
        break;
    }
    return backPath ? `${backPath}?${querystring.stringify(queryParams)}` : '';
  }, [sourceTarget]);

  // 跳转回关联单据
  const relatedHistoryBack = `/pub/sslm/supplier-related-doc/list?${querystring.stringify(
    routerParam
  )}`;

  // 调查表详情跳转
  const jumpInvestigate = params => {
    const { investgHeaderId, investigateTemplateId, openTabFlag } = params;
    const { purchaserInvestig } = menuPermissions;
    if (openTabFlag || isPub) {
      const oldRouter = '/sslm/include/sslm/investigation-send/detail';
      const newRouter = `/sslm/include/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`;
      const pubPath = purchaserInvestig ? newRouter : oldRouter;
      openTab({
        key: pubPath,
        title: intl.get('sslm.common.view.title.view.investigateDetail').d('查看调查表明细'),
        search: purchaserInvestig ? '' : querystring.stringify(params),
        state: { historyBack: relatedHistoryBack },
      });
    } else {
      const oldRouter = '/sslm/investigation-send/detail';
      const newRouter = `/sslm/purchaser-investigation/all-investigation/detail/${investgHeaderId}/${investigateTemplateId}`;
      // 通过权限区分跳转
      const path = purchaserInvestig ? newRouter : oldRouter;
      dispatch(
        routerRedux.push({
          pathname: path,
          search: purchaserInvestig ? '' : querystring.stringify(params),
          state: { historyBack: relatedHistoryBack },
        })
      );
    }
  };

  /**
   * 送样详情跳转
   * @param {*} sampleSource 来源， related表示关联单据
   */
  const jumpSample = params => {
    const { reqId, reqStatus, openTabFlag } = params;
    const queryParams = {
      companyId,
      supplierCompanyId,
      sourceTarget,
      toStageId,
      requisitionId,
      sampleSource: 'related',
    };
    const title = intl.get('sslm.sample.view.title.sampleApplyCheck').d('送样申请单查看');
    const state = isPub ? { historyBack: relatedHistoryBack } : {};
    const pathname = openTabFlag
      ? `/sslm/include/buyer-apply-query/detail/${reqId}/${reqStatus}`
      : isPub
      ? `/pub/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}?${querystring.stringify(
          queryParams
        )}`
      : `/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}`;
    jumpDetail({
      state,
      title,
      dispatch,
      pathname,
      openTabFlag,
    });
  };

  // 现场考察详情跳转
  const jumpSiteInspection = params => {
    const { evalHeaderId, evalType, evalStatus, openTabFlag } = params;
    if (openTabFlag) {
      openTab({
        key: '/sslm/include/site-investigate-report/result/detail',
        title: intl.get('sslm.siteInvestigateReport.view.filled.detailTitle').d('现场考察报告明细'),
        search: querystring.stringify({
          evalType,
          evalHeaderId,
          openTab: 1,
        }),
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: isPub
            ? `/pub/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`
            : `/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`,
          state: { historyBack: relatedHistoryBack },
        })
      );
    }
  };

  // 绩效考评档案跳转
  const jumpEvaluation = (record, openTabFlag) => {
    const { evalHeaderId, evalGranularity, createPage, evalTplId } = record.get([
      'evalHeaderId',
      'evalGranularity',
      'createPage',
      'evalTplId',
    ]);
    const newPage = createPage === 'ASSESS'; // 新菜单
    const search = newPage ? {} : { evalGranularity };
    const state = isPub ? { historyBack: relatedHistoryBack } : {};
    let title = intl.get(`sslm.evaluationQuery.model.result.query`).d('考评结果查询');
    let pathname = openTabFlag
      ? `/sslm/include/evaluation-query/detail/${evalHeaderId}`
      : isPub
      ? `/pub/sslm/evaluation-query/detail/${evalHeaderId}`
      : `/sslm/evaluation-query/detail/${evalHeaderId}`;
    if (newPage) {
      title = intl.get('sslm.evaluationQuery.model.title.viewEvaluation').d(`查看考评档案`);
      pathname = openTabFlag
        ? `/sslm/include/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/read`
        : isPub
        ? `/pub/sslm/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/read`
        : `/sslm/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/read`;
    }
    jumpDetail({
      state,
      title,
      search,
      dispatch,
      pathname,
      openTabFlag,
    });
  };

  // 询价单跳转详情
  const inquiryDetail = useCallback(record => {
    const { rfxHeaderId, projectLineSectionId, offlineWholeFlag } = record.get([
      'rfxHeaderId',
      'projectLineSectionId',
      'offlineWholeFlag',
    ]);
    if (!rfxHeaderId) {
      return;
    }
    const title = intl.get('ssrc.inquiryHall.view.message.title.rfxDetail').d('询价单明细');
    // 线下整单录入：跳整单详情
    if (Number(offlineWholeFlag) === 1) {
      openTab({
        key: `/ssrc/new-inquiry-hall/whole-detail/${rfxHeaderId}`,
        title,
      });
      return;
    }
    // 线上询价单：走单据流 doc-link
    const innerLink = `/ssrc/new-inquiry-hall/rfx-detail/${rfxHeaderId}?current=newInquiryHall&docLinkFlag=1${
      projectLineSectionId ? `&projectLineSectionId=${projectLineSectionId}` : ''
    }`;
    openTab({
      key: '/spfm/doc-link',
      title,
      search: querystring.stringify({
        link: innerLink,
        rfxId: rfxHeaderId,
        linkCheckFlag: 1,
      }),
    });
  }, []);

  // 招投标跳转详情
  const bidDetail = useCallback(record => {
    const { data: { rfxHeaderId, projectLineSectionId, sourceCategory } = {} } = record || {};
    const search = querystring.stringify({
      projectLineSectionId,
      rfxHeaderId,
      sourceCategory,
    });
    if (rfxHeaderId) {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`,
          search,
        })
      );
    }
  }, []);

  /**
   * ppap单据页面跳转处理函数
   * @param {object} record
   */
  const jumpPpapDocument = useCallback(record => {
    const { projectHeaderId, projectType } = record?.get(['projectHeaderId', 'projectType']) || {};
    if (projectHeaderId) {
      dispatch(
        routerRedux.push({
          pathname: `/sqam/PPAPWorkbench/detail/${projectHeaderId}`,
          search: querystring.stringify({
            operate: 'view',
            type: 'project-all',
            projectType,
          }),
        })
      );
    }
  }, []);

  // 物料认证跳转详情
  const jumpMaterial = useCallback(record => {
    const { authReqStatusCode, itemAuthReqHeaderId, nodeCode } = record.get([
      'authReqStatusCode',
      'itemAuthReqHeaderId',
      'nodeCode',
    ]);
    const pathname = `/smdm/material-certification-pool/read/${itemAuthReqHeaderId}`;
    const search = querystring.stringify(
      filterNullValueObject({
        node: nodeCode,
        source: ['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(authReqStatusCode)
          ? 'certified'
          : '',
      })
    );
    dispatch(
      routerRedux.push({
        pathname,
        search,
      })
    );
  }, []);

  /**
   * 考评事件页面跳转处理函数
   * @param {object} record
   */
  const jumpEvalEvent = useCallback((record, openTabFlag) => {
    const { evalEventHeaderId } = record.get(['evalEventHeaderId']);
    if (openTabFlag) {
      openTab({
        key: `/sslm/include/event-record/detail/${evalEventHeaderId}`,
        title: intl.get('sslm.eventRecord.view.title.checkEventRecord').d('查看考评事件'),
        search: querystring.stringify({
          isView: 1,
          openTab: 1,
        }),
      });
    } else {
      const pathname = `/sslm/event-record/detail/${evalEventHeaderId}?isView=1`;
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }, []);

  // 整改单 关联整改报告
  const rectifyReport = problemHeaderId => {
    rectifyReportDs.setQueryParameter('problemHeaderId', problemHeaderId);
    rectifyReportDs.query();
    Modal.open({
      key: Modal.key(),
      style: { width: 650 },
      footer: null,
      closable: true,
      title: intl
        .get('sqam.common.model.qualityRectification.relatedRectification')
        .d('关联整改报告'),
      children: <Table dataSet={rectifyReportDs} columns={rectifyReportColumns({ isPub })} />,
    });
  };

  const modelTableProps = {
    isPub,
    queryParams: {
      supplierCompanyId,
      relationId: isLifeCyclesSummaryFlag ? partnerId : requisitionId,
    },
    reQueryFlag,
    tableList,
  };

  // ds集合
  const dataSetObj = {
    investigate: investigateDs,
    sample: sampleDs,
    siteInspection: siteInspectionDs,
    evaluation: evaluationDs,
    agreement: agreementDs,
    inquiry: inquiryDs,
    bid: bidDs,
    rectify: rectifyDs,
    material: materialDs,
    evalEvent: evalEventDs,
    supplierEvaluationReport: supplierEvaluationDs,
    ppapDocument: ppapDocumentDs,
  };

  // columns集合
  const columnsObj = {
    investigate: investigateColumns({ jumpInvestigate }),
    sample: sampleColumns({ jumpSample }),
    siteInspection: siteInspectionColumns({ jumpSiteInspection }),
    evaluation: evaluationColumns({ jumpEvaluation }),
    inquiry: inquiryColumns({ inquiryDetail, isPub }),
    bid: bidColumns({ bidDetail, isPub }),
    rectify: rectifyColumns({ rectifyReport, isPub }),
    material: materialColumns({ jumpMaterial, isPub }),
    evalEvent: evalEventColumns({ jumpEvalEvent, isPub }),
    supplierEvaluationReport: getColumns({ dispatch, progressList }),
    ppapDocument: ppapDocumentColumns({ jumpPpapDocument }),
  };

  // 处理筛选器字段ds属性
  const getFieldProps = () => {
    const { evalNum, investgNumber, ...rest } = routerParam;
    const fieldProps = {};
    const { evalNum: evalNumOld } = dataSetObj[activeKey]?.queryDataSet?.current?.toData() || {};
    // 切换档案编码重新查询数据
    if (evalNumOld && evalNum && evalNum !== evalNumOld) {
      if (searchBarRef) {
        searchBarRef.queryDs.current.set({ evalNum });
      }
      return fieldProps;
    } else {
      // 档案编码
      fieldProps.evalNum = {
        defaultValue: () => evalNum,
      };
    }
    forIn(fieldProps, (value, key) => {
      const { defaultValue } = value || {};
      if (defaultValue && isFunction(defaultValue)) {
        // 只处理默认值是对象的，如果是其他的类型标准会失效
        const filterNullDefaultValue = filterNullValueObject(defaultValue());
        if (isEmpty(filterNullDefaultValue) && fieldProps[key]) {
          delete fieldProps[key].defaultValue;
        }
      }
    });
    // 兼容个性化字段
    forIn(rest, (value, key) => {
      fieldProps[key] = {
        defaultValue: () => value,
      };
    });
    return fieldProps;
  };

  const handleTabsChange = useCallback(key => {
    setActiveKey(key);
    setLoadTab(prev => ({ ...prev, [key]: true }));
  }, []);

  const handleCustomizeQuery = () => {
    const { evalNum, investgNumber } = routerParam;
    const queryTab = [];
    if (evalNum) {
      queryTab.push('evaluation');
    }
    if (investgNumber) {
      queryTab.push('investigate');
    }
    setAutoQueryTab(queryTab);
  };

  const remoteTabPaneParams = {
    ...routerParam,
    TabPane,
    dispatch,
  };

  const CommonDom = customizeTabPane(
    {
      code: tabsCustomizeCode,
      custDefaultActive: key => handleTabsChange(key || activeKey),
    },
    <Tabs animated={false} activeKey={activeKey} onChange={handleTabsChange}>
      {tabPaneList.map(tabPane => (
        <TabPane key={tabPane.key} tab={tabPane.tab}>
          {tabPane.key === 'agreement' ? (
            <AgreementList
              isPub={isPub}
              style={tableMaxHeight}
              customizeTable={customizeTable}
              agreementDs={dataSetObj[tabPane.key]}
              agreementStageDs={agreementStageDs}
              acceptDocumentDs={acceptDocumentDs}
              optionRecordDs={optionRecordDs}
              searchCode={tabPane.searchCode}
              customizeCode={tabPane.customizeCode}
              contractWorkspace={menuPermissions.contractWorkspace}
            />
          ) : (
            customizeTable(
              {
                code: tabPane.customizeCode,
              },
              <SearchBarTable
                style={tableMaxHeight}
                key={tabPane.customizeCode}
                dataSet={dataSetObj[tabPane.key]}
                columns={columnsObj[tabPane.key]}
                searchCode={tabPane.searchCode}
                searchBarRef={ref => {
                  searchBarRef = ref;
                }}
                searchBarConfig={{
                  autoQuery: true,
                  // 去掉筛选器默认带出的公司ID，避免作为查询条件传给接口
                  beforeQuery: ({ params }) => {
                    if (params) {
                      delete params.companyId;
                    }
                    return true;
                  },
                  fieldProps: autoQueryTab?.includes(tabPane.key) ? getFieldProps() : null,
                }}
              />
            )
          )}
        </TabPane>
      ))}
      {tabModelTable(modelTableProps)}
      {supplierRelateDocRemote.process(
        'SSLM_SUPPLIER_RELATE_DOC_DEFINITION_TAB_PANE',
        null,
        remoteTabPaneParams
      )}
    </Tabs>
  );

  return (
    <Fragment>
      {!collapseFlag && (
        <Header
          backPath={handleBackPath()}
          title={intl.get('sslm.common.view.title.supplierRelatedDoc').d('供应商关联业务单据')}
        />
      )}
      {collapseFlag ? (
        CommonDom
      ) : (
        <Content>
          {supplierRelateDocRemote.render('SSLM_SUPPLIER_RELATE_DOC_DEFINITION_EXTRA_NODE', null, {
            location,
            handleTabsChange,
          })}
          {CommonDom}
        </Content>
      )}
    </Fragment>
  );
};

export default compose(
  formatterCollections({ code: formatterCode }),
  withCustomize({ unitCode }),
  withProps(
    () => {
      const dsObj = {
        investigateDs: new DataSet(investigateDS()),
        sampleDs: new DataSet(sampleDS()),
        siteInspectionDs: new DataSet(siteInspectionDS()),
        agreementDs: new DataSet(agreementDS()),
        agreementStageDs: new DataSet(agreementStageDS()),
        acceptDocumentDs: new DataSet(acceptDocumentDS()),
        optionRecordDs: new DataSet(optionRecordDS()),
        evaluationDs: new DataSet(evaluationDS()),
        inquiryDs: new DataSet(inquiryDS()),
        bidDs: new DataSet(bidDS()),
        rectifyDs: new DataSet(rectifyDS()),
        materialDs: new DataSet(materialDS()),
        evalEventDs: new DataSet(evalEventDS()),
        rectifyReportDs: new DataSet(rectifyReportDS()),
        supplierEvaluationDs: new DataSet(supplierEvaluationDS()),
        ppapDocumentDs: new DataSet(ppapDocumentDS()),
      };
      return dsObj;
    },
    { cacheState: true }
  ),
  remote({
    code: 'SSLM_SUPPLIER_RELATE_DOC_DEFINITION',
    name: 'supplierRelateDocRemote',
  })
)(List);
