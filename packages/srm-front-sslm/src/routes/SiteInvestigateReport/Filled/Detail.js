/**
 * Detail - 已填制现场考察报告详情
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { Tabs, Form, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import queryString from 'querystring';
import DynamicButtons from '_components/DynamicButtons';
import { Button as PerButton } from 'components/Permission';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination } from 'utils/utils';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import H0ApproveRecord from '@/routes/components/H0ApproveRecord';

import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import ScoreInfo from './ScoreInfo';
import BasicInfo from '../common/BasicInfo';
import ScorerInfo from '../common/ScorerInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';

import '@/routes/index.less';

const { TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.BASICINFO',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.CATEGORY',
    'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCOREINFO',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCORE_FILTER',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCORER_INFO',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.BTN_GROUP',
    'SSLM_SITEINVESTIGATE_FILLED_DETAIL.DETAIL_TABPANE',
  ],
})
@formatterCollections({
  code: ['sslm.siteInvestigateReport', 'sslm.common', 'sslm.operatingRecord', 'hwfp.common'],
})
@Form.create({ fieldNameProp: null })
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
      loading.effects['siteInvestigateReport/queryScoreInfo'] ||
      loading.effects['siteInvestigateReport/queryBasicInfo'],
    queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryFillingScoreInfo'],
    ...themeConfig,
  };
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const isPub = this.props.match.path.includes('/pub/');
    const {
      match: { params: { evalHeaderId } = {} },
    } = props;
    this.state = {
      isPub,
      submitUserId: routerParam.submitUserId,
      sourceType: routerParam.sourceType,
      evalHeaderId,
      basicInfo: {},
      scorerInfo: {},
      dataSource: [], // 评分信息列表
      pagination: {}, // 评分信息分页参数
      tableList: [], // 用于配置表
    };
  }

  componentDidMount() {
    this.queryBasicInfo();
    this.queryScoreInfo();
    this.handleScorerInfo();
    // 查询配置表
    queryRelTableConfig('sslm_site_eval_filled').then(res => {
      this.setState({
        tableList: res,
      });
    });
  }

  /**
   * 查询基本信息
   */
  @Bind()
  queryBasicInfo() {
    const { dispatch } = this.props;
    const { evalHeaderId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryBasicInfo',
      payload: { evalHeaderId, customizeUnitCode: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.BASICINFO' },
    }).then(res => {
      if (res) {
        this.setState({ basicInfo: res });
      }
    });
  }

  // 评分人汇总信息
  @Bind()
  handleScorerInfo() {
    const { dispatch } = this.props;
    const { evalHeaderId, isPub, submitUserId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryScorerInfo',
      payload: {
        evalHeaderId,
        customizeUnitCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORER_INFO',
        submitUserId: isPub ? submitUserId : '',
      },
    }).then(res => {
      if (res) {
        this.setState({ scorerInfo: res });
      }
    });
  }

  /**
   * 评分信息查询
   */
  @Bind()
  queryScoreInfo(page = {}, param = {}) {
    const { dispatch } = this.props;
    const { evalHeaderId, isPub, submitUserId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryFillingScoreInfo',
      payload: {
        evalHeaderId,
        ...param,
        page,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCOREINFO,SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCORE_FILTER',
        code: 'COMPLETED', // 用于后端区分入口是已填制还是填制(已填制传值)
        submitUserId: isPub ? submitUserId : '',
      },
    }).then(res => {
      if (res) {
        const { content = [] } = res;
        this.setState({
          dataSource: content,
          pagination: createPagination(res),
        });
      }
    });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 操作记录弹框
   */
  @Bind()
  handleOperationRecord() {
    const { evalHeaderId, isPub, submitUserId } = this.state;
    const params = {
      sourceCode: 'FILLING',
      documentType: 'SITE_EVAL_SUBMIT',
      submitUserId: isPub ? submitUserId : '',
    };
    C7nModal.open({
      okCancel: false,
      key: C7nModal.key(),
      style: { width: 800 },
      bodyStyle: { paddingTop: 0 },
      closable: true,
      footer: null,
      children: <H0ApproveRecord documentId={evalHeaderId} params={params} />,
    });
  }

  render() {
    const {
      form,
      queryBasicLoading,
      custLoading,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      queryScoreInfoLoading,
      allLoading,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
    } = this.props;
    const {
      isPub,
      sourceType,
      submitUserId,
      evalHeaderId,
      basicInfo,
      dataSource,
      pagination,
      scorerInfo,
      tableList,
    } = this.state;

    const { fileNum = 0 } = basicInfo;

    // 基本信息
    const basicInfoProp = {
      form,
      basicInfo,
      custLoading,
      customizeForm,
      queryBasicLoading,
      evalHeaderId,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.BASICINFO',
      isView: true,
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.CATEGORY',
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
      basicInfo,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    };

    // 评分信息
    const scoreInfoProps = {
      isPub,
      submitUserId,
      dataSource,
      loading: queryScoreInfoLoading,
      pagination,
      customizeTable,
      customizeFilterForm,
      onChange: this.queryScoreInfo,
      queryScoreInfo: this.queryScoreInfo,
      linkColor,
    };

    // 评分人汇总信息
    const scorerInfoProps = {
      custLoading,
      customizeForm,
      dataSource: scorerInfo,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCORER_INFO',
      onRef: node => {
        this.scorerForm = node;
      },
      linkColor,
    };

    // 模型
    const modelTableProps = {
      tableList,
      relationId: evalHeaderId,
      readOnly: isPub,
      parentRef: this,
    };
    const buttons = [
      {
        name: 'operationRecord',
        btnProps: {
          icon: 'clock-circle-o',
          loading: allLoading,
          onClick: () => this.handleOperationRecord(),
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.operationRecord').d('操作记录'),
      },
      {
        name: 'viewSupplier',
        btnComp: PerButton,
        child: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360度查询'),
        btnProps: {
          permissionList: [
            {
              code: `srm.partner.site-investigate-report.filled.button.supplier.info`,
              type: 'button',
              meaning: '已填制现场考察报告-供应商360度查询',
            },
          ],
          icon: 'file',
          loading: allLoading,
          onClick: () => handleSupplierDetail({ ...basicInfo, sourceType }),
        },
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.siteInvestigateReport.view.filled.detailTitle')
            .d('现场考察报告明细')}
          backPath="/sslm/site-investigate-report/filled/list"
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} maxNum={5} />
          )}
        </Header>
        <Content>
          {customizeTabPane(
            {
              code: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.DETAIL_TABPANE',
            },
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
              <TabPane
                tab={
                  <span>
                    {intl.get('sslm.siteInvestigateReport.view.tabs.attachmentInfo').d('附件信息')}
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
          <h3 style={{ margin: '16px 0' }}>
            {intl.get('sslm.siteInvestigateReport.view.title.scorerInfo').d('评分人汇总信息')}
          </h3>
          <ScorerInfo {...scorerInfoProps} />
          <h3 style={{ margin: '16px 0' }}>
            {intl.get('sslm.siteInvestigateReport.view.title.scoreInfo').d('评分信息')}
          </h3>
          <ScoreInfo {...scoreInfoProps} />
        </Content>
      </Fragment>
    );
  }
}
