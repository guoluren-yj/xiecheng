/**
 * Detail - 现场考察结果查询详情
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import querystring from 'querystring';
import { Tabs, Tag, Spin, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { SRM_SSLM } from '_utils/config';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';

import H0ApproveRecord from '@/routes/components/H0ApproveRecord';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import BasicInfo from '../common/BasicInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';
import ScoreInfo from './ScoreInfo';
import InspectResults from '../common/InspectResults';
import QualityRectification from '../common/QualityRectification';
import '@/routes/index.less';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BASICINFO',
  'SSLM_SITEINVESTIGATE_RESULT_DETAIL.CATEGORY',
  'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
  'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
  'SSLM_SITEINVESTIGATE_RESULT_DETAIL.INSPECTRESULTS',
];

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BASICINFO',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.CATEGORY',
    'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.INSPECTRESULTS',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCOREINFO',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_FILTER',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BTN_GROUP',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.DETAIL_TABPANE',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_STATUS',
    'SSLM_SITEINVESTIGATE_RESULT_DETAIL.QUALITY',
  ],
})
@formatterCollections({
  code: ['sslm.siteInvestigateReport', 'sslm.common', 'sslm.operatingRecord', 'hwfp.common'],
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
    queryBasicLoading: loading.effects['siteInvestigateReport/queryBasicInfo'],
    allLoading:
      loading.effects['siteInvestigateReport/handlePrint'] ||
      loading.effects['siteInvestigateReport/queryScoreInfo'] ||
      loading.effects['siteInvestigateReport/queryBasicInfo'],
    queryScoreStatusLoading: loading.effects['siteInvestigateReport/queryScoreStatus'],
    ...themeConfig,
  };
})
@remotes({
  code: 'SSLM_SITE_INVESTIGATE_REPORT_RESULT_DETAIL',
  name: 'remote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const isPub = this.props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    const { state: locationParam = {}, search } = props.location;
    const routerParams = querystring.parse(search.substr(1));
    const { openTab } = routerParams;
    this.state = {
      isPub,
      basicInfo: {},
      historyBack: locationParam.historyBack,
      indicatorTypeList: [],
      scoreInfoExpand: false, // 评分信息展开/收起标识
      qualityVisible: true,
      evalStatus: null, // 单据头状态
      tableList: [], // 用于配置表
      openTab: !!Number(openTab),
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params: { evalHeaderId: prevEvalHeaderId } = {} },
    } = prevProps;
    const {
      match: { params: { evalHeaderId } = {} },
    } = this.props;
    const prevRouterParams = querystring.parse(prevProps.location.search.substr(1));
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    return (
      evalHeaderId !== prevEvalHeaderId ||
      routerParams.evalHeaderId !== prevRouterParams.evalHeaderId
    );
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryBasicInfo();
    }
  }

  componentDidMount() {
    this.resultInit();
    this.queryBasicInfo();
  }

  /**
   * 值集查询
   */
  @Bind()
  resultInit() {
    const { dispatch } = this.props;
    const lovCodes = {
      indicatorTypeList: 'SSLM.KPI_INDICATOR_TYPE',
      tenantId,
    };

    dispatch({
      type: 'siteInvestigateReport/resultInit',
      payload: lovCodes,
    }).then(res => {
      if (res) {
        this.setState({ indicatorTypeList: res.indicatorTypeList });
      }
    });
  }

  /**
   * 查询基本信息
   */
  @Bind()
  queryBasicInfo() {
    const {
      location,
      dispatch,
      match: { params = {} },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const evalHeaderId = routerParams.evalHeaderId || params.evalHeaderId;
    dispatch({
      type: 'siteInvestigateReport/queryBasicInfo',
      payload: {
        evalHeaderId,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_RESULT_DETAIL.INSPECTRESULTS',
      },
    }).then(res => {
      if (res) {
        const { evalStatus: newEvalStatus } = res;
        this.setState({ basicInfo: res, evalStatus: newEvalStatus });
      }
    });
    if (evalHeaderId) {
      // 查询配置表
      queryRelTableConfig('sslm_site_eval_query', evalHeaderId).then(res => {
        this.setState({
          tableList: res,
        });
      });
    }
  }

  /**
   * 打印
   */
  @Bind()
  handlePrint() {
    const {
      dispatch,
      location,
      match: { params = {} },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const evalHeaderId = routerParams.evalHeaderId || params.evalHeaderId;
    dispatch({
      type: 'siteInvestigateReport/handlePrint',
      payload: {
        evalHeaderId,
        customizeUnitCode: customizeUnitCode.join(),
      },
    }).then(res => {
      if (res) {
        if (res.type.indexOf('application/json') > -1) {
          notification.warning({
            description: intl
              .get(`sslm.common.view.printwarning.noTemplate`)
              .d('未设置打印模板，不可打印'),
          });
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 操作记录弹框
   */
  @Bind()
  handleOperationRecord() {
    const {
      location,
      match: { params = {} },
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const evalHeaderId = routerParams.evalHeaderId || params.evalHeaderId;
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
    const {
      basicInfo,
      basicInfo: { supplierCompanyId: partnerCompanyId },
    } = this.state;
    // 判断平台供应商不为空
    if (!isNil(partnerCompanyId)) {
      handleSupplierDetail(basicInfo);
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
   * 质量整改是否隐藏
   */
  @Bind()
  setQualityVisible(visible) {
    this.setState({ qualityVisible: visible });
  }

  render() {
    const {
      remote,
      location,
      queryBasicLoading,
      custLoading,
      allLoading,
      customizeForm,
      customizeTable,
      customizeFilterForm,
      match: { params = {} },
      siteInvestigateReport: { scoreStatusList } = {},
      customizeBtnGroup,
      queryScoreStatusLoading,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
    } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const evalHeaderId = routerParams.evalHeaderId || params.evalHeaderId;
    const evalType = routerParams.evalType || params.evalType;
    const {
      basicInfo,
      isPub,
      openTab,
      evalStatus,
      historyBack,
      indicatorTypeList = [],
      scoreInfoExpand,
      qualityVisible,
      tableList,
    } = this.state;

    const { fileNum = 0 } = basicInfo;
    const viweQualityFlag = evalStatus === 'APPROVED' || evalStatus === 'PUBLISHED';

    // 基本信息
    const basicInfoProp = {
      basicInfo,
      custLoading,
      evalHeaderId,
      customizeForm,
      queryBasicLoading,
      customizeCode: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BASICINFO',
      isView: true,
      siteInvestigateReportRemote: remote,
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.CATEGORY',
    };

    // 考察小组
    const inspectTeamProps = {
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    };

    // 附件信息
    const attachmentInfoProps = {
      remote,
      basicInfo,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    };

    // 考察结果
    const inspectResultsProps = {
      evalHeaderId,
      evalStatus,
      evalType,
      isView: true,
      customizeForm,
      custLoading,
      siteReportRemote: remote,
      customizeCode: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.INSPECTRESULTS',
      customizeUnitCode:
        'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_RESULT_DETAIL.INSPECTRESULTS',
    };

    // 评分信息
    const scoreInfoProps = {
      evalStatus,
      evalHeaderId,
      customizeTable,
      customizeFilterForm,
      indicatorTypeList,
      scoreStatusList,
      queryScoreStatusLoading,
      customizeUnitCode:
        'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCOREINFO,SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_FILTER',
      onRef: node => {
        this.scoreInfo = node;
      },
      linkColor,
    };

    // 质量整改
    const qualityProps = {
      evalHeaderId,
      custLoading,
      customizeTable,
      customizeTableCode: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.QUALITY',
      setQualityVisible: this.setQualityVisible,
    };

    // 模型
    const modelTableProps = {
      tableList,
      relationId: evalHeaderId,
      parentRef: this,
    };

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.siteInvestigateReport.view.filled.detailTitle')
            .d('现场考察报告明细')}
          backPath={
            openTab ? '' : isPub ? historyBack : '/sslm/site-investigate-report/result/list'
          }
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.BTN_GROUP',
            },
            [
              <Button
                data-name="print"
                icon="printer"
                loading={allLoading}
                type="primary"
                permissionList={[
                  {
                    code: `srm.partner.site-investigate-report.result.ps.print`,
                    type: 'button',
                    meaning: '现场考察结果查询-打印',
                  },
                ]}
                onClick={this.handlePrint}
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </Button>,
              <PrintProButton
                data-name="new-print"
                buttonText={intl.get('sslm.common.button.newPrint').d('(新)打印')}
                buttonProps={{
                  icon: 'print',
                  permissionList: [
                    {
                      code: 'srm.partner.site-investigate-report.result.button.detail.export.new',
                      type: 'c7n-pro',
                      meaning: '现场考察报告查询-明细-新打印',
                    },
                  ],
                }}
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/site-eval-headers/${evalHeaderId}/print-new`}
                method="GET"
                params={{ customizeUnitCode: customizeUnitCode.join() }}
              />,
              <ExcelExportPro
                data-name="export"
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/site-eval-headers/siteEvalDetailExport/${evalHeaderId}`}
                templateCode="SRM_C_SRM_SSLM_SITE_EVAL_HEADER_DETAIL_EXPORT"
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.partner.site-investigate-report.result.api.detail.export',
                      type: 'button',
                      meaning: '现场考察报告查询-新导出',
                    },
                  ],
                }}
              />,
              <Button
                icon="file"
                data-name="viewSupplier"
                loading={allLoading}
                onClick={() => this.handleViewSupplier()}
                permissionList={[
                  {
                    code: `srm.partner.site-investigate-report.result.button.supplier.info`,
                    type: 'button',
                    meaning: '现场考察报告查询-供应商360度查询',
                  },
                ]}
              >
                {intl.get('hzero.common.view.message.360QueryDetail').d('供应商360度查询')}
              </Button>,
              <Button
                data-name="operationRecord"
                loading={allLoading}
                icon="clock-circle-o"
                onClick={this.handleOperationRecord}
              >
                {intl.get('sslm.siteInvestigateReport.view.button.operationRecord').d('操作记录')}
              </Button>,
              <Button
                data-name="expand"
                loading={allLoading}
                icon={scoreInfoExpand ? 'up' : 'down'}
                onClick={this.expandScore}
              >
                {scoreInfoExpand
                  ? intl.get('hzero.common.button.collapseAll').d('全部收起')
                  : intl.get('hzero.common.button.expandAll').d('全部展开')}
              </Button>,
            ]
          )}
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            {customizeTabPane(
              { code: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.DETAIL_TABPANE' },
              <Tabs defaultActiveKey="basicInform" animated={false}>
                <TabPane
                  tab={intl.get('sslm.siteInvestigateReport.view.tabs.basicInfo').d('基本信息')}
                  key="basicInform"
                >
                  <BasicInfo {...basicInfoProp} />
                </TabPane>
                <TabPane
                  tab={intl
                    .get('sslm.siteInvestigateReport.view.tabs.reviewMaterialCategory')
                    .d('考察物料/品类')}
                  key="reviewMaterialCategory"
                >
                  <ReviewMaterialCategory {...reviewMaterialCategoryProps} />
                </TabPane>
                <TabPane
                  tab={intl.get('sslm.siteInvestigateReport.view.tabs.inspectTeam').d('考察小组')}
                  key="inspectTeam"
                >
                  <InspectTeam {...inspectTeamProps} />
                </TabPane>
                {viweQualityFlag && qualityVisible && (
                  <TabPane
                    forceRender
                    tab={intl
                      .get('sslm.siteInvestigateReport.view.tabs.qectificationDoc')
                      .d('关联整改单据')}
                    key="qualityRectification"
                  >
                    <QualityRectification {...qualityProps} />
                  </TabPane>
                )}
                <TabPane
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
                        {fileNum}
                      </Tag>
                    </span>
                  }
                  key="attachmentInfo"
                >
                  <AttachmentInfo {...attachmentInfoProps} />
                </TabPane>
                {getDynamicTable(modelTableProps)}
              </Tabs>
            )}
            {evalType === 'ONLINE' && (
              <Fragment>
                <h3 style={{ margin: '16px 0' }}>
                  {intl.get('sslm.siteInvestigateReport.view.title.scoreInfo').d('评分信息')}
                </h3>
                <ScoreInfo {...scoreInfoProps} />
              </Fragment>
            )}
            <h3 style={{ margin: '16px 0' }}>
              {intl.get('sslm.siteInvestigateReport.view.title.inspectResults').d('考察结果')}
            </h3>
            <InspectResults {...inspectResultsProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
