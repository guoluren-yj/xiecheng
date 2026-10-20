/* eslint-disable no-unused-expressions */
/**
 * Detail - 现场考察报告填制详情
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { isEmpty, isUndefined, isNumber, concat, head, isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Tabs, Tag, Spin, Modal } from 'hzero-ui';
import React, { Component, Fragment } from 'react';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import queryString from 'querystring';
import { Button as PerButton } from 'components/Permission';

import intl from 'utils/intl';
import notification from 'utils/notification';
// import Checkbox from 'components/Checkbox';
import { Header, Content } from 'components/Page';
import {
  getEditTableData,
  createPagination,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Modal as C7nModal } from 'choerodon-ui/pro';
import H0ApproveRecord from '@/routes/components/H0ApproveRecord';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryCustomize } from '@/services/supplierInformService';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import ScoreInfo from './ScoreInfo';
import BasicInfo from '../common/BasicInfo';
import ScorerInfo from '../common/ScorerInfo';
import ReviewMaterialCategory from '../common/ReviewMaterialCategory';
import InspectTeam from '../common/InspectTeam';
import AttachmentInfo from '../common/AttachmentInfo';

import '@/routes/index.less';

const { TabPane } = Tabs;
const entrance = 'filling';

const customizeUnitCode = [
  'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BASICINFO',
  'SSLM_SITEINVESTIGATE_FILLING_DETAIL.CATEGORY',
  'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
  'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
  'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO',
  'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORER_INFO',
];

@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BASICINFO',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.CATEGORY',
    'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORE_FILTER',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORER_INFO',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BTN_GROUP',
    'SSLM_SITEINVESTIGATE_FILLING_DETAIL.DETAIL_TABPANE',
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
    loading:
      loading.effects['siteInvestigateReport/saveFillingScore'] ||
      loading.effects['siteInvestigateReport/submitFillingScore'],
    queryBasicLoading: loading.effects['siteInvestigateReport/queryBasicInfo'],
    queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryFillingScoreInfo'],
    ...themeConfig,
  };
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { sourceType, submitUserId = '', pageReadOnly = 0 } = routerParam;
    const isPub = this.props.match.path.includes('/pub/');
    const {
      match: { params: { evalHeaderId } = {} },
    } = props;
    this.state = {
      sourceType,
      pageReadOnly: !!Number(pageReadOnly), // 角色工作台跳转,需要设置页面只读
      submitUserId,
      dataSource: [], // 评分信息列表
      pagination: {}, // 评分信息分页参数
      evalHeaderId,
      basicInfo: {},
      scorerInfo: {},
      allFileNum: undefined,
      isPub,
      tableList: [], // 用于配置表
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const {
      match: { params: { evalHeaderId } = {} },
    } = nextProps;
    if (evalHeaderId !== prevState.evalHeaderId) {
      nextState.evalHeaderId = evalHeaderId;
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params: { evalHeaderId } = {} },
    } = this.props;
    return evalHeaderId !== prevProps.match.params.evalHeaderId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.hanldeRefresh();
    }
  }

  componentDidMount() {
    this.hanldeRefresh();
    this.handleScoreConfig();
  }

  // 查询评分信息-得分字段个性化配置
  @Bind()
  handleScoreConfig() {
    queryCustomize({
      unitCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO',
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        const fields = (res['SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO'] || {}).fields || [];
        const scoreField = head(fields.filter(n => n.fieldCode === 'score')) || {};
        const { editable } = scoreField;
        // editable为-1时 走标准逻辑，否则走个性化配置
        this.setState({
          scoreEditable: editable,
        });
      }
    });
  }

  // 刷新
  @Bind()
  hanldeRefresh() {
    const { pagination } = this.state;
    this.queryBasicInfo();
    this.queryScoreInfo(pagination);
    this.handleScorerInfo();
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
      payload: { evalHeaderId, customizeUnitCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BASICINFO' },
    }).then(res => {
      if (res) {
        this.setState({ basicInfo: res });
      }
    });
    // 查询配置表
    queryRelTableConfig('sslm_site_eval_fill_in').then(res => {
      this.setState({
        tableList: res,
      });
    });
  }

  // 评分人汇总信息
  @Bind()
  handleScorerInfo() {
    const { dispatch } = this.props;
    const { evalHeaderId, isPub, submitUserId } = this.state;
    this.scorerForm?.resetFields();
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
  queryScoreInfo(page = {}, params = {}) {
    this.setState({ dataSource: [] });
    const { dispatch } = this.props;
    const { evalHeaderId, isPub, submitUserId } = this.state;
    dispatch({
      type: 'siteInvestigateReport/queryFillingScoreInfo',
      payload: {
        evalHeaderId,
        ...params,
        completeFlag: 0,
        page,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO,SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORE_FILTER',
        code: isPub ? 'COMPLETED' : 'UN_COMPLETE', // 用于后端区分入口是已填制还是填制(工作流页面是已填制状态)
        submitUserId: isPub ? submitUserId : '',
      },
    }).then(res => {
      if (res) {
        const { content } = res;
        const newDataSource = isArray(content)
          ? content.map(item => ({ ...item, _status: 'update' }))
          : [];
        this.setState({
          dataSource: newDataSource,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 保存/提交
   */
  @Bind()
  handleSaveAndSubmit(flag) {
    const { history, dispatch } = this.props;
    const { basicInfo, dataSource, scorerInfo, tableList } = this.state;
    const { validateFieldsAndScroll = e => e } = this.basicForm || {};
    const { validateFieldsAndScroll: scorerValidateFieldsAndScroll = e => e } =
      this.scorerForm || {};
    validateFieldsAndScroll((errs, fieldsValue) => {
      if (!errs) {
        scorerValidateFieldsAndScroll((scorerErrs, scorerFieldsValue) => {
          if (!scorerErrs) {
            // 个性化附件必填校验getEditTableData不支持，需改造
            if (!isEmpty(dataSource)) {
              Promise.all(
                dataSource.map(i =>
                  (() =>
                    new Promise((resolve, reject) => {
                      if (i.$form && i._status) {
                        i.$form.validateFieldsAndScroll(
                          { scroll: { allowHorizontalScroll: true }, force: true },
                          (err, recordData) => {
                            if (!err) {
                              const { $form, ...otherProps } = i;
                              resolve({ ...otherProps, ...recordData });
                            } else {
                              reject(err);
                            }
                          }
                        );
                      }
                    }))()
                )
              )
                .then(tableValues => {
                  // 处理数据
                  const attachmentData = isUndefined(this.attInfo)
                    ? []
                    : this.attInfo.state.dataSource;
                  // 附件信息
                  const siteEvalAttLns = getEditTableData(attachmentData, ['attId', '_status']);
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
                    ...filterNullValueObject(fieldsValue),
                    siteEvalLineResps: tableValues,
                    siteEvalAttLns,
                    siteEvalRespHeader: {
                      ...scorerInfo,
                      ...scorerFieldsValue,
                    },
                    modelDatas,
                    customizeUnitCode: customizeUnitCode.join(','),
                  };
                  if (!isEmpty(tableValues)) {
                    if (flag) {
                      dispatch({
                        type: 'siteInvestigateReport/saveFillingScore',
                        payload,
                      }).then(res => {
                        if (res) {
                          notification.success();
                          if (this.attInfo) {
                            this.attInfo.queryAttachment();
                          }
                          this.queryModelData();
                          this.hanldeRefresh();
                        }
                      });
                    } else {
                      dispatch({
                        type: 'siteInvestigateReport/submitFillingScore',
                        payload,
                      }).then(res => {
                        if (res) {
                          notification.success();
                          history.push('/sslm/site-investigate-report/filling');
                        }
                      });
                    }
                  }
                })
                .catch(() => {
                  // console.log(err);
                });
            }
          }
        });
      }
    });
  }

  // 评分信息切换分页时保存当前页数据
  @Bind()
  handleTableChange(page = {}, filterValue = {}) {
    const { dispatch } = this.props;
    const { dataSource, basicInfo } = this.state;

    // 个性化附件必填校验getEditTableData不支持，需改造
    if (!isEmpty(dataSource)) {
      Promise.all(
        dataSource.map(i =>
          (() =>
            new Promise((resolve, reject) => {
              if (i.$form && i._status) {
                i.$form.validateFieldsAndScroll(
                  { scroll: { allowHorizontalScroll: true }, force: true },
                  (err, recordData) => {
                    if (!err) {
                      const { $form, ...otherProps } = i;
                      resolve({ ...otherProps, ...recordData });
                    } else {
                      reject(err);
                    }
                  }
                );
              }
            }))()
        )
      )
        .then(tableValues => {
          dispatch({
            type: 'siteInvestigateReport/saveManageScoreInfo',
            payload: { ...basicInfo, siteEvalLineResps: tableValues },
          }).then(res => {
            if (res) {
              this.queryBasicInfo();
              this.queryScoreInfo(page, filterValue);
              this.handleScorerInfo();
            }
          });
        })
        .catch(() => {
          // console.log(err);
        });
    }
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
   * 更新附件数量
   * @param field {object}
   */
  @Bind()
  updateFileNum(allFileNum) {
    this.setState({ allFileNum });
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

  /**
   * 跳转360详情菜单
   */
  @Bind()
  handleViewSupplier() {
    const {
      basicInfo,
      sourceType,
      basicInfo: { supplierCompanyId: partnerCompanyId },
    } = this.state;
    // 判断平台供应商不为空
    if (!isNil(partnerCompanyId)) {
      handleSupplierDetail({
        ...basicInfo,
        sourceType,
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
   * 刷新模型表数据
   */
  @Bind()
  queryModelData() {
    const { tableList } = this.state;
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable();
      }
    });
  }

  render() {
    const {
      loading,
      queryBasicLoading,
      queryScoreInfoLoading,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      custLoading,
      history,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
    } = this.props;
    const {
      evalHeaderId,
      basicInfo,
      dataSource,
      pagination,
      allFileNum,
      isPub,
      scorerInfo,
      scoreEditable,
      pageReadOnly,
      submitUserId,
      tableList,
    } = this.state;

    const { fileNum = 0, backReasonFlag = 0, evalStatus, averageFlag } = basicInfo;
    const isEdit = ['MANUAL_EVALUATING'].includes(evalStatus) && !pageReadOnly;
    // 基本信息
    const basicInfoProp = {
      basicInfo,
      custLoading,
      customizeForm,
      queryBasicLoading,
      evalHeaderId,
      entrance,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BASICINFO',
      onRef: node => {
        this.basicForm = node;
      },
    };

    // 考察物料/品类
    const reviewMaterialCategoryProps = {
      isPub,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.CATEGORY',
    };

    // 考察小组
    const inspectTeamProps = {
      isPub,
      custLoading,
      evalHeaderId,
      customizeTable,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.INSPECTTEAM',
    };

    // 附件信息
    const attachmentInfoProps = {
      isPub,
      basicInfo,
      evalStatus,
      custLoading,
      evalHeaderId,
      customizeTable,
      entrance,
      customizeCode: 'SSLM_SITEINVESTIGATEREPORT.ATTACHMENTINFO',
      onRef: node => {
        this.attInfo = node;
      },
      updateFileNum: this.updateFileNum,
    };
    // 评分信息
    const scoreInfoProps = {
      isPub,
      isEdit,
      dataSource,
      basicInfo,
      submitUserId,
      evalHeaderId,
      loading: queryScoreInfoLoading,
      pagination,
      customizeTable,
      customizeFilterForm,
      backReasonFlag,
      onChange: this.handleTableChange,
      queryScoreInfo: this.queryScoreInfo,
      history,
      scoreEditable,
      averageFlag,
      linkColor,
    };
    // 评分人汇总信息
    const scorerInfoProps = {
      custLoading,
      customizeForm,
      dataSource: scorerInfo,
      customizeCode: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORER_INFO',
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

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.siteInvestigateReport.view.maintain.title').d('现场考察报告维护')}
          backPath="/sslm/site-investigate-report/filling"
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.BTN_GROUP',
            },
            [
              <Button
                icon="save"
                type="primary"
                loading={loading}
                data-name="save"
                onClick={() => this.handleSaveAndSubmit(true)}
                style={{ display: !isPub && isEdit ? 'inline-block' : 'none' }}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                icon="check"
                loading={loading}
                data-name="submit"
                onClick={() => this.handleSaveAndSubmit(false)}
                style={{ display: !isPub && isEdit ? 'inline-block' : 'none' }}
              >
                {intl.get(`hzero.common.button.submit`).d('提交')}
              </Button>,
              <PerButton
                icon="file"
                loading={loading}
                data-name="viewSupplier"
                onClick={() => this.handleViewSupplier()}
                permissionList={[
                  {
                    code: `srm.partner.site-investigate-report.filling.button.supplier.info`,
                    type: 'button',
                    meaning: '考评档案填制明细-供应商360度查询',
                  },
                ]}
              >
                {intl.get('hzero.common.view.message.360QueryDetail').d('供应商360度查询')}
              </PerButton>,
              <Button
                icon="clock-circle-o"
                loading={loading}
                data-name="operationRecord"
                onClick={() => this.handleOperationRecord()}
              >
                {intl.get(`sslm.siteInvestigateReport.view.button.operationRecord`).d('操作记录')}
              </Button>,
            ]
          )}
        </Header>
        <Content>
          <Spin spinning={loading || false}>
            {customizeTabPane(
              { code: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.DETAIL_TABPANE' },
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
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
