/**
 * Detail - 我收到的现场考察报告详情页
 * @date: 2020/11/24
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import { connect } from 'dva';
import { Tabs, Tag, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import remotes from 'utils/remote';
import { TopSection, SecondSection } from '_components/Section';

import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import BasicInfo from '../common/BasicInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';
import ScoreInfo from '../common/ScoreInfo';
import InspectResults from '../common/InspectResults';
import QualityRectification from '../common/QualityRectification';
import '@/routes/index.less';

const { TabPane } = Tabs;
const entrance = 'receive';

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BASICINFO',
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.CATEGORY',
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.RATING_INFO',
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BTN_GROUP',
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.DETAIL_TABPANE',
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.RESULTS', // 考察结果
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.CARD', // 卡片
    'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.QUALITY',
  ],
})
@formatterCollections({
  code: ['sslm.siteInvestigateReport', 'sslm.common'],
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
    queryBasicLoading: loading.effects['siteInvestigateReport/queryReceivedBasicInfo'],
    optionLoading: loading.effects['siteInvestigateReport/queryReceivedBasicInfo'],
    printLoading: loading.effects['siteInvestigateReport/handlePrint'],
    queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryScoreInfo'],
    ...themeConfig,
  };
})
@remotes({
  code: 'SSLM_SUPPLIER_SITE_REPORT_DETAIL',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params: { evalHeaderId, evalType, evalStatus } = {} },
    } = props;
    this.state = {
      evalHeaderId,
      evalType,
      evalStatus,
      basicInfo: {},
      qualityVisible: true,
      tableList: [], // 用于配置表
      scoreInfoExpand: true, // 评分信息展开/收起标识
    };
  }

  componentDidMount() {
    this.queryBasicInfo();
  }

  /**
   * 查询基本信息
   */
  @Bind()
  queryBasicInfo() {
    const { dispatch } = this.props;
    const { evalHeaderId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryReceivedBasicInfo',
      payload: {
        evalHeaderId,
        customizeUnitCode: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BASICINFO',
      },
    }).then(res => {
      if (res) {
        const { evalStatus } = res;
        this.setState({ basicInfo: res, evalStatus });
      }
    });
    if (evalHeaderId) {
      // 查询配置表
      queryRelTableConfig('sslm_site_eval_received', evalHeaderId).then(res => {
        this.setState({
          tableList: res,
        });
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

  /**
   * 打印
   */
  @Bind()
  handlePrint() {
    const {
      dispatch,
      match: { params: { evalHeaderId } = {} },
    } = this.props;
    dispatch({
      type: 'siteInvestigateReport/handlePrint',
      payload: {
        evalHeaderId,
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

  render() {
    const {
      remote,
      queryBasicLoading,
      customizeForm,
      customizeTable,
      custLoading,
      optionLoading,
      printLoading,
      customizeBtnGroup,
      queryScoreInfoLoading,
      customizeTabPane,
      tabsPrimaryColor,
      getHocInstance = () => {},
    } = this.props;
    const {
      evalHeaderId,
      evalStatus,
      evalType,
      basicInfo,
      qualityVisible,
      scoreInfoExpand,
      tableList,
    } = this.state;
    const { fileNum = 0 } = basicInfo;
    const viweQualityFlag = evalStatus === 'APPROVED' || evalStatus === 'PUBLISHED';

    // 基本信息
    const basicInfoProp = {
      basicInfo,
      isView: true,
      evalHeaderId,
      queryBasicLoading,
      custLoading,
      customizeForm,
      customizeCode: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BASICINFO',
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      evalHeaderId,
      entrance,
      custLoading,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.CATEGORY',
    };

    // 考察小组
    const inspectTeamProps = {
      remote,
      evalHeaderId,
    };

    // 附件信息
    const attachmentInfoProps = {
      remote,
      evalHeaderId,
      basicInfo,
      entrance,
    };

    // 考察结果
    const inspectResultsProps = {
      entrance,
      evalHeaderId,
      evalStatus,
      evalType,
      custLoading,
      customizeForm,
      customizeCode: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.RESULTS',
      customizeUnitCode:
        'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.RESULTS',
    };

    // 质量整改
    const qualityProps = {
      evalHeaderId,
      purchaserFlag: false,
      custLoading,
      customizeTable,
      customizeTableCode: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.QUALITY',
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
            .get('sslm.siteInvestigateReport.view.receive.detailTitle')
            .d('我收到的现场考察报告明细')}
          backPath="/sslm/site-investigate-report/received/list"
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.BTN_GROUP',
            },
            [
              <Button
                data-name="print"
                icon="printer"
                loading={printLoading}
                type="primary"
                permissionList={[
                  {
                    code: `srm.partner.site-investigate-report.received-inspection.ps.print`,
                    type: 'button',
                    meaning: '我收到的现场考察报告-打印',
                  },
                ]}
                onClick={this.handlePrint}
              >
                {intl.get('hzero.common.button.print').d('打印')}
              </Button>,
              <Button
                data-name="expand"
                loading={queryScoreInfoLoading}
                icon={scoreInfoExpand ? 'up' : 'down'}
                onClick={this.expandScore}
                style={{ display: evalType === 'ONLINE' ? 'block' : 'none' }}
              >
                {scoreInfoExpand
                  ? intl.get('hzero.common.button.collapseAll').d('全部收起')
                  : intl.get('hzero.common.button.expandAll').d('全部展开')}
              </Button>,
            ]
          )}
        </Header>
        <Content>
          <Spin spinning={optionLoading || false}>
            {customizeTabPane(
              { code: 'SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.DETAIL_TABPANE' },
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
            <TopSection
              custLoading={custLoading}
              getHocInstance={getHocInstance}
              code="SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.CARD"
            >
              {evalType === 'ONLINE' && (
                <SecondSection
                  code="scoreInfo"
                  title={intl.get('sslm.siteInvestigateReport.view.title.scoreInfo').d('评分信息')}
                >
                  <div style={{ marginBottom: 16 }}>
                    <ScoreInfo
                      evalHeaderId={evalHeaderId}
                      customizeTable={customizeTable}
                      customizeUnitCode="SSLM_SITEINVESTIGATE_RECEIVED_DETAIL.RATING_INFO"
                      custLoading={custLoading}
                      onRef={node => {
                        this.scoreInfo = node;
                      }}
                    />
                  </div>
                </SecondSection>
              )}
              <SecondSection
                code="inspectResults"
                title={intl
                  .get('sslm.siteInvestigateReport.view.title.inspectResults')
                  .d('考察结果')}
              >
                <InspectResults {...inspectResultsProps} />
              </SecondSection>
            </TopSection>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
