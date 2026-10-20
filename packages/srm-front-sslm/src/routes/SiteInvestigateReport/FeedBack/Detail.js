/**
 * Detail - 现场考察报告反馈详情页
 * @date: 2020/11/20
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { Fragment, Component } from 'react';
import { Tabs, Button, Tag } from 'hzero-ui';
import { DataSet } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { isNumber, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/mixCustomize';
import { connect } from 'dva';

import { saveFeedBackInfo, submitFeedBack } from '@/services/siteInvestigateReportService';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import FeedBackBasicInfo from '../common/FeedBackBasicInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';
import ScoreInfo from '../common/ScoreInfo';
import basicDS from './store/basicDS';
import '@/routes/index.less';

const { TabPane } = Tabs;
const entrance = 'feedBack';
const organizationId = getCurrentOrganizationId();

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.BASICINFO',
    'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.CATEGORY',
    'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.RATING_INFO',
    'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.DETAIL_TABPANE',
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
    queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryScoreInfo'],
    ...themeConfig,
  };
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params: { evalHeaderId, evalType } = {} },
    } = props;
    const routerParam = querystring.parse(props.location?.search?.substr(1));
    const { tabPaneKey } = routerParam;
    this.state = {
      tabPaneKey,
      evalHeaderId,
      evalType,
      evalStatus: null,
      allFileNum: undefined,
      saveOrSubmitLoading: false,
      evalLineIdList: [], // 评分信息所有非父级节点id
      scoreInfoExpand: true, // 评分信息展开/收起标识
    };

    this.basicInfoDataSet = new DataSet({
      ...basicDS(),
      queryParameter: {
        evalHeaderId,
        tabPaneKey,
      },
    });
  }

  componentDidMount() {
    this.basicInfoDataSet.query().then(res => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          evalStatus: result.evalStatus,
        });
      }
    });
  }

  /**
   * 保存按钮处理逻辑
   */
  handleSave = async () => {
    if (!(await this.basicInfoDataSet.validate())) {
      notification.error({
        message: intl.get('hzero.common.notification.invalid').d('校验不通过'),
      });
      return false;
    }
    // 考察物料/品类
    const itemCatesData =
      (this.reviewMaterialCategory &&
        this.reviewMaterialCategory.state &&
        this.reviewMaterialCategory.state.dataSource) ||
      [];
    const siteEvalItemCates = getEditTableData(itemCatesData, ['evalItemCateId', '_status']);
    // 考察小组
    const inspectTeamData =
      (this.inspectTeam && this.inspectTeam.state && this.inspectTeam.state.dataSource) || [];
    const siteEvalGroups = getEditTableData(inspectTeamData, ['evalGroupId', '_status']);
    // 附件信息
    const attachmentData =
      this.attachmentInfo && this.attachmentInfo.state && this.attachmentInfo.state.dataSource;
    const siteEvalAttLns = getEditTableData(attachmentData, ['attId', '_status']);

    // 判断物料／小组是否校验通过
    const checkItemCates = itemCatesData.length === siteEvalItemCates.length;
    const checkGroups = inspectTeamData.length === siteEvalGroups.length;
    if (!(checkItemCates && checkGroups)) {
      notification.warning({
        message: intl.get('sslm.siteInvestigateReport.view.message.perfectInfo').d('请完善信息'),
      });
      return false;
    }
    const basicData =
      (this.basicInfoDataSet.current && this.basicInfoDataSet.current.toData()) || {};
    const scoreInfoData =
      (this.scoreInfo && this.scoreInfo.state && this.scoreInfo.state.dataSource) || [];
    const siteEvalLines = getEditTableData(scoreInfoData, ['_status']);
    const scoreInfoEdit = scoreInfoData.filter(n => ['create', 'update'].includes(n._status));
    if (isEmpty(siteEvalLines) && !isEmpty(scoreInfoEdit)) {
      notification.warning({
        message: intl
          .get('sslm.siteInvestigateReport.view.message.maintainScoreInfo')
          .d('请维护评分信息'),
      });
      return false;
    }
    const data = {
      ...basicData,
      siteEvalItemCates,
      siteEvalGroups,
      siteEvalAttLns,
      siteEvalLines,
      customizeUnitCode:
        'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.CATEGORY,SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.RATING_INFO',
    };
    this.setState({
      saveOrSubmitLoading: true,
    });
    saveFeedBackInfo(data)
      .then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
        }
        this.onRefresh();
      })
      .finally(() => {
        this.setState({
          saveOrSubmitLoading: false,
        });
      });
  };

  /**
   * 刷新数据
   */
  onRefresh = () => {
    this.basicInfoDataSet.query();
    if (this.reviewMaterialCategory) this.reviewMaterialCategory.queryMaterialCategory();
    if (this.inspectTeam) this.inspectTeam.queryTeam();
    if (this.attachmentInfo) this.attachmentInfo.queryAttachment();
    if (this.scoreInfo) this.scoreInfo.queryScoreInfo();
  };

  /**
   * 提交按钮处理逻辑
   */
  handleSubmit = async () => {
    if (!(await this.basicInfoDataSet.validate())) {
      notification.error({
        message: intl.get('hzero.common.notification.invalid').d('校验不通过'),
      });
      return false;
    }
    // 考察物料/品类
    const itemCatesData =
      (this.reviewMaterialCategory &&
        this.reviewMaterialCategory.state &&
        this.reviewMaterialCategory.state.dataSource) ||
      [];
    const siteEvalItemCates = getEditTableData(itemCatesData, ['evalItemCateId', '_status']);
    // 考察小组
    const inspectTeamData =
      (this.inspectTeam && this.inspectTeam.state && this.inspectTeam.state.dataSource) || [];
    const siteEvalGroups = getEditTableData(inspectTeamData, ['evalGroupId', '_status']);
    // 附件信息
    const attachmentData =
      this.attachmentInfo && this.attachmentInfo.state && this.attachmentInfo.state.dataSource;
    const siteEvalAttLns = getEditTableData(attachmentData, ['attId', '_status']);

    // 判断物料／小组是否校验通过
    const checkItemCates = itemCatesData.length === siteEvalItemCates.length;
    const checkGroups = inspectTeamData.length === siteEvalGroups.length;
    if (!(checkItemCates && checkGroups)) {
      notification.warning({
        message: intl.get('sslm.siteInvestigateReport.view.message.perfectInfo').d('请完善信息'),
      });
      return false;
    }
    const basicData =
      (this.basicInfoDataSet.current && this.basicInfoDataSet.current.toData()) || {};
    const scoreInfoData =
      (this.scoreInfo && this.scoreInfo.state && this.scoreInfo.state.dataSource) || [];
    const siteEvalLines = getEditTableData(scoreInfoData, ['_status']);
    const scoreInfoEdit = scoreInfoData.filter(n => ['create', 'update'].includes(n._status));
    if (isEmpty(siteEvalLines) && !isEmpty(scoreInfoEdit)) {
      notification.warning({
        message: intl
          .get('sslm.siteInvestigateReport.view.message.maintainScoreInfo')
          .d('请维护评分信息'),
      });
      return false;
    }
    const data = {
      ...basicData,
      siteEvalItemCates,
      siteEvalGroups,
      siteEvalAttLns,
      siteEvalLines,
      customizeUnitCode:
        'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.BASICINFO,SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.CATEGORY',
    };
    this.setState({
      saveOrSubmitLoading: true,
    });
    submitFeedBack(data)
      .then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          const { dispatch } = this.props;
          dispatch(
            routerRedux.push({
              pathname: '/sslm/site-investigate-report/feed-back/list',
            })
          );
        }
        this.onRefresh();
      })
      .finally(() => {
        this.setState({
          saveOrSubmitLoading: false,
        });
      });
  };

  /**
   * 更新附件数量
   * @param field {object}
   */
  @Bind()
  updateFileNum(allFileNum) {
    this.setState({ allFileNum });
  }

  @Bind()
  setEvalLineIdList(val) {
    this.setState({ evalLineIdList: val });
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
      evalHeaderId,
      evalType,
      evalStatus,
      allFileNum,
      saveOrSubmitLoading,
      evalLineIdList,
      scoreInfoExpand,
      tabPaneKey,
    } = this.state;
    const {
      c7n: { customizeForm } = {},
      h0: { customizeTable, customizeTabPane } = {},
      custLoading,
      siteInvestigateReport: { scoreInfo },
      queryScoreInfoLoading,
      tabsPrimaryColor,
      linkColor,
    } = this.props;

    const basicInfo =
      (this.basicInfoDataSet.current && this.basicInfoDataSet.current.toData()) || {};
    const { fileNum = 0 } = basicInfo;

    const isAlreadyFeedback = tabPaneKey === 'alreadyFeedback'; // 是否已反馈单据
    const isView = (evalStatus !== 'WAITINGREJECTED' && evalStatus !== 'BACK') || isAlreadyFeedback;

    // 基本信息
    const basicInfoProp = {
      isView,
      dataSet: this.basicInfoDataSet,
      customizeForm,
      custLoading,
      customizeCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.BASICINFO',
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      isAlreadyFeedback,
      isView,
      evalHeaderId,
      entrance,
      onRef: node => {
        this.reviewMaterialCategory = node;
      },
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.CATEGORY',
    };

    // 考察小组
    const inspectTeamProps = {
      isAlreadyFeedback,
      isView,
      evalHeaderId,
      onRef: node => {
        this.inspectTeam = node;
      },
    };

    // 附件信息
    const attachmentInfoProps = {
      isAlreadyFeedback,
      isView,
      basicInfo,
      evalHeaderId,
      entrance,
      onRef: node => {
        this.attachmentInfo = node;
      },
      updateFileNum: this.updateFileNum,
    };

    const scoreInfoProp = {
      isAlreadyFeedback,
      isView,
      evalHeaderId,
      entrance,
      customizeTable,
      customizeUnitCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.RATING_INFO',
      custLoading,
      setEvalLineIdList: this.setEvalLineIdList,
      onRef: node => {
        this.scoreInfo = node;
      },
      supplierEvalFlag: 1,
      linkColor,
    };

    const isShowScoreInfo = !isEmpty(scoreInfo);

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.siteInvestigateReport.view.feedBack.detailTitle')
            .d('现场考察报告反馈明细')}
          backPath="/sslm/site-investigate-report/feed-back/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            disabled={isView}
            loading={saveOrSubmitLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="check"
            onClick={this.handleSubmit}
            disabled={isView}
            loading={saveOrSubmitLoading}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button
            loading={queryScoreInfoLoading}
            icon={scoreInfoExpand ? 'up' : 'down'}
            onClick={this.expandScore}
            style={{ display: evalType === 'ONLINE' ? 'block' : 'none' }}
          >
            {scoreInfoExpand
              ? intl.get('hzero.common.button.collapseAll').d('全部收起')
              : intl.get('hzero.common.button.expandAll').d('全部展开')}
          </Button>
        </Header>
        <Content>
          {customizeTabPane(
            { code: 'SSLM_SITEINVESTIGATE_FEEDBACK_DETAIL.DETAIL_TABPANE' },
            <Tabs defaultActiveKey="basicInform" animated={false}>
              <TabPane
                tab={intl.get('sslm.siteInvestigateReport.view.tabs.basicInfo').d('基本信息')}
                key="basicInform"
              >
                <FeedBackBasicInfo {...basicInfoProp} />
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
                forceRender
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
                      {isNumber(allFileNum) ? allFileNum : fileNum}
                    </Tag>
                  </span>
                }
                key="attachmentInfo"
              >
                <AttachmentInfo {...attachmentInfoProps} />
              </TabPane>
            </Tabs>
          )}
          {evalType === 'ONLINE' && (
            <div style={{ display: isShowScoreInfo ? 'block' : 'none' }}>
              <h3 style={{ margin: '16px 0' }}>
                {intl.get('sslm.siteInvestigateReport.view.title.scoreInfo').d('评分信息')}
              </h3>
              <div
                style={{
                  display: isView ? 'none' : 'flex',
                  // display: 'flex',
                  justifyContent: 'flex-start',
                  flexDirection: 'row-reverse',
                }}
              >
                <CommonImport
                  data-name="scoreInfoImport"
                  businessObjectTemplateCode="SSLM.BATCH_IMPORT_SELF_SITE_EVAL_LINE"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
                  successCallBack={() => {
                    this.scoreInfo.queryScoreInfo();
                  }}
                  buttonProps={{
                    funcType: 'flat',
                  }}
                  args={{ evalHeaderId, tenantId: organizationId }}
                />
                <ExcelExportPro
                  data-name="scoreInfoExportPro"
                  allBody
                  method="POST"
                  buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                  templateCode="SRM_C_SRM_SSLM_SELF_SITE_EVAL_LINE"
                  queryParams={{
                    evalLineIdList,
                  }}
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${evalHeaderId}/self-export-post`}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                  }}
                />
              </div>
              <ScoreInfo {...scoreInfoProp} />
            </div>
          )}
        </Content>
      </Fragment>
    );
  }
}
