/**
 * SupplierAnnualDetail - 考评结果查询详情
 * @date: 2018-12-29
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { isUndefined, isEmpty, isNumber, sum } from 'lodash';
import querystring from 'querystring';
import { Col, Row, Table, Spin, Collapse, Icon, Form, Tooltip } from 'hzero-ui';
import { Button } from 'components/Permission';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import Upload from 'components/Upload';
import uuidv4 from 'uuid/v4';
import remotes from 'utils/remote';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { valueMapMeaning, dateRender, dateTimeRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ParamValueModal from '@/routes/ParamValueModal';
import AttachmentModal from '@/routes/EvaluationArchivesFilling/Detail/AttachmentModal';
import QualityRectification from '@/routes/SiteInvestigateReport/common/QualityRectification';
import styles from './index.less';
import Search from './Search.js';
import OperationRecModal from './OperationRecModal';
import ScoreDetailModal from './ScoreDetailModal';
import ScorePartDetailModal from './ScorePartDetailModal';
import LevelChart from './LevelChart';

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;

const FormItem = Form.Item;

/**
 * @export
 * @class Detail 考评结果查询 详情组件
 * @extends {Component} - React.Component
 * @reactProps {Object} evaluationQuery - 数据源
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @return React.element
 */
@remotes({
  code: 'SSLM_EVALUATION_QUERY_LIST',
})
@formatterCollections({
  code: ['sslm.evaluationQuery', 'sslm.supplierDocManage', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_LINE_TABLE',
    'SSLM.EVALUATION_QUERY_ARCHIVES.BASIC_INFO',
    'SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_BTN_GROUP',
    'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
  ],
})
@connect(({ evaluationQuery, evaluationDocManage, loading, user = {} }) => {
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
    evaluationQuery,
    evaluationDocManage,
    loading: {
      detail: loading.effects['evaluationQuery/fetchDetailData'],
      operationRecs: loading.effects['evaluationQuery/fetchOperationRecs'],
      scoreDetailLoading: loading.effects['evaluationQuery/fetchScoreDetail'],
      evaluationDocManageLoading: loading.effects['evaluationDocManage/fetchEvaluationStatus'],
    },
    tenantId: getCurrentOrganizationId(),
    ...themeConfig,
  };
})
export default class Detail extends React.Component {
  form;

  constructor(props) {
    super(props);
    const { location } = props;
    const routerParams = querystring.parse(location.search.substr(1));
    // 生命周期申请单pub页跳转过来
    const { state: { historyBack } = {} } = location;
    this.state = {
      historyBack,
      visible: false,
      scoreDetailVisible: false,
      scorePartDetailVisible: false,
      routerParams,
      collapsed: true,
      levelChartVisible: false,
      levelList: [], // 等级分布列表
      paramVauleVisible: false,
      lineCurrentRecord: {},
      modalVisible: false,
      qualityRectifyModalVisible: false, // 质量整改侧弹窗显示隐藏标识
      qualityButtonVisible: true, // 质量整改按钮显示隐藏标识
      newAttachmentUuid: uuidv4(),
    };
  }

  getSnapshotBeforeUpdate(nextProps) {
    const {
      match: { params: { id: newId } = {} },
    } = nextProps;
    const { match: { params: { id } } = {} } = this.props;
    return newId !== id;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleSearch();
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'evaluationQuery/fetchLov',
    });
  }

  /**
   * 组件卸载时触发
   */
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationQuery/updateState',
      payload: {
        detailData: {},
      },
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 年度考评结果明细表格折叠和展开
   * @memberof Detail
   */
  @Bind()
  handleCollapse() {
    this.setState(state => ({
      collapsed: !state.collapsed,
    }));
  }

  /**
   * 请求复合查询条件的数据
   * @param {?string} fields - 表单数据
   */
  @Bind()
  handleSearch(fields = {}) {
    const {
      dispatch,
      tenantId,
      match: { params = {} },
    } = this.props;
    const { routerParams } = this.state;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      filterValues = filterNullValueObject(formValue);
    }
    const paramItem = {
      SU: 'SUPPLIER',
      'SU+CA': 'SCORE',
      'SU+IT': 'SCORE',
    };
    dispatch({
      type: 'evaluationQuery/fetchDetailData',
      payload: {
        ...filterValues,
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
        evalHeaderId: params.id,
        selectOptional: paramItem[routerParams.evalGranularity],
        customizeUnitCode:
          'SSLM.EVALUATION_QUERY_ARCHIVES.BASIC_INFO,SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_LINE_TABLE',
      },
    });
  }

  /**
   * 查看评分明细
   *@param {Object} record - 被点击查看评分详情条目的数据
   */
  @Bind()
  onScoreDetail(record = {}) {
    const {
      dispatch,
      tenantId,
      evaluationQuery: {
        detailData: { evalTplId },
      },
    } = this.props;
    const type = 'evaluationQuery/fetchScoreDetail';
    dispatch({
      type,
      payload: {
        tenantId,
        evalTplId,
        evalLineId: record.evalLineId,
        customizeUnitCode: 'SSLM.EVALUATION_QUERY_DETAIL.RATING_DETAILS',
      },
    });
    this.setState({ scoreDetailVisible: true, granularityList: record });
  }

  /**
   * 查看评分不同指标明细
   *@param {Object} record - 被点击查看评分详情条目的数据
   */
  @Bind()
  onScorePartDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'evaluationDocManage/fetchEvaluationStatus',
      payload: { evalDtlId: record.evalDtlId },
    });
    this.setState({ scorePartDetailVisible: true, lineCurrentRecord: record });
  }

  /**
   * 获取导出查询参数
   */
  @Bind()
  handleParams() {
    const {
      tenantId,
      match: { params = {} },
    } = this.props;
    const filterForm = this.form;
    const { routerParams } = this.state;
    const paramItem = {
      SU: 'SUPPLIER',
      'SU+CA': 'SCORE',
      'SU+IT': 'SCORE',
    };
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return {
      ...filterValues,
      tenantId,
      evalHeaderId: params.id,
      selectOptional: paramItem[routerParams.evalGranularity],
    };
  }

  /**
   * 控制操作记录弹框
   * @param {boolean} [visible=true]
   * @memberof Detail
   */
  @Bind()
  handleModal(visible = true) {
    if (visible === true) {
      this.handleModalChange();
    }
    this.setState({ visible });
  }

  /**
   * 控制评分明细弹框
   * @param {boolean} [visible=true] - 是否显示
   * @memberof Detail
   */
  @Bind()
  handleScoreDetailModal(visible = true) {
    this.setState({ scoreDetailVisible: visible });
  }

  /**
   * 控制评分不同指标明细弹框
   * @param {boolean} [visible=true] - 是否显示
   * @memberof Detail
   */
  @Bind()
  handlePartScoreDetailModal(visible = true) {
    this.setState({ scorePartDetailVisible: visible, lineCurrentRecord: {} });
  }

  /**
   * 操作记录弹出框数据请求
   * @param {object} fields - 分页信息
   * @memberof Detail
   */
  @Bind()
  handleModalChange(fields = {}) {
    const {
      dispatch,
      tenantId,
      match: { params = {} },
    } = this.props;
    const type = 'evaluationQuery/fetchOperationRecs';
    dispatch({
      type,
      payload: {
        tenantId,
        evalHeaderId: params.id,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_OWNED',
      },
    });
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 200,
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

  // 等级发布图表显示／隐藏
  @Bind()
  handleLevelChart() {
    const { levelChartVisible } = this.state;
    if (!levelChartVisible) {
      this.handleLevelList();
    }
    this.setState({ levelChartVisible: false });
  }

  // 查询等级分布
  @Bind()
  handleLevelList() {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    dispatch({
      type: 'evaluationQuery/handleLevel',
      payload: { evalHeaderId: params.id },
    }).then(res => {
      if (res) {
        this.setState({ levelList: res, levelChartVisible: true });
      }
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
        customizeUnitCode: 'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
      },
    });
    this.setState({
      paramVauleVisible: true,
      lineCurrentRecord: record,
    });
  }

  // 查看质量整改
  @Bind()
  handleQualityRectify(flag) {
    this.setState({
      qualityRectifyModalVisible: flag,
    });
  }

  /**
   * 关闭 modal
   */
  @Bind()
  closeParamVauleModal() {
    this.setState({
      paramVauleVisible: false,
      lineCurrentRecord: {},
    });
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttachmentModal() {
    const { modalVisible } = this.state;
    this.setState({ modalVisible: !modalVisible });
  }

  /**
   * 质量整改按钮是否隐藏
   */
  @Bind()
  setQualityVisible(visible) {
    this.setState({ qualityButtonVisible: visible });
  }

  render() {
    const {
      remote,
      loading,
      tenantId,
      evaluationQuery: {
        operationRecs,
        detailData,
        detailData: {
          kpiEvalDetailLineDTOPage,
          checkDetailFlag,
          checkCollectFlag,
          weightedFlag,
          evalStatus,
          checkLevelFlag,
          evalHeaderId,
        },
        operationRecsPage,
        scoreDetailList,
        detailLinePage,
        methodValue = [],
      },
      evaluationDocManage: { modalData = [], modalPagination = {} } = {},
      match: { params = {} },
      customizeTable,
      custLoading,
      customizeForm,
      customizeBtnGroup,
      form,
      form: { getFieldDecorator },
      linkColor,
    } = this.props;
    const lineList = (kpiEvalDetailLineDTOPage && kpiEvalDetailLineDTOPage.content) || [];
    const {
      visible,
      scoreDetailVisible,
      scorePartDetailVisible,
      routerParams,
      granularityList,
      collapsed,
      levelChartVisible,
      levelList,
      paramVauleVisible,
      lineCurrentRecord,
      modalVisible,
      historyBack,
      qualityRectifyModalVisible,
      qualityButtonVisible,
      newAttachmentUuid,
    } = this.state;

    const modalProps = {
      visible,
      loading: loading.operationRecs,
      dataSource: operationRecs,
      pagination: operationRecsPage,
      closeModal: this.handleModal,
      onChange: this.handleModalChange,
    };
    const scoreDetailModalProps = {
      docStatus: evalStatus,
      weightedFlag,
      checkDetailFlag,
      evalGranularity: routerParams.evalGranularity,
      granularityList,
      scoreDetailList,
      loading: loading.scoreDetailLoading,
      visible: scoreDetailVisible,
      closeModal: this.handleScoreDetailModal,
      onScorePartDetail: this.onScorePartDetail,
      openParamVauleModal: this.openParamVauleModal,
    };
    const scorePartDetailModalProps = {
      modalData,
      lineCurrentRecord,
      modalPagination,
      docStatus: evalStatus,
      loading: loading.evaluationDocManageLoading,
      visible: scorePartDetailVisible,
      closeModal: this.handlePartScoreDetailModal,
    };
    const isSu = detailData.evalGranularity === 'SU';
    const completeColumns = [
      {
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`sslm.common.view.erpSupplier.code`).d('erp供应商编码'),
        dataIndex: 'erpSupplierNum',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.erpSupplier.name`).d('erp供应商名称'),
        dataIndex: 'erpSupplierName',
        width: 200,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细'),
        dataIndex: 'scoreDetail',
        width: 100,
        render: (_, record) => (
          <a onClick={() => this.onScoreDetail(record)}>
            {intl.get(`sslm.evaluationQuery.model.score.detail`).d('评分明细')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.get.score`).d('得分'),
        dataIndex: 'lineScore',
        width: 80,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.docManage.suggestedStrategy`).d('建议策略'),
        width: 170,
        dataIndex: 'suggestStrategiesMeaning',
        render: val =>
          (detailData.evalStatus !== 'MANUAL_EVALUATING' && (
            <Tooltip title={val} placement="topLeft">
              {' '}
              {val}{' '}
            </Tooltip>
          )) ||
          null,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.item.level`).d('等级'),
        dataIndex: 'levelCode',
        width: 80,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.ranking`).d('考评排名'),
        dataIndex: 'rankNum',
        width: 100,
        render: val => (detailData.evalStatus !== 'MANUAL_EVALUATING' && val) || null,
      },
      {
        title: intl.get(`sslm.evaluationQuery.model.feedback.remark`).d('反馈说明'),
        dataIndex: 'lineRemark',
        width: 200,
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.common.model.evaluation.supplierAttachment`).d('供方上传附件'),
        dataIndex: 'attachmentUuid',
        width: 130,
        render: val => (
          <Upload
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-evaluation"
            attachmentUUID={val}
          />
        ),
      },
      {
        title: intl
          .get(`sslm.evaluationQuery.model.docManage.confirmSupplierUuidView`)
          .d('供应商附件查看'),
        dataIndex: 'confirmSupplierUuid',
        width: 100,
        render: (_val, record) => {
          return (
            <Upload
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sslm-evaluation"
              attachmentUUID={record.confirmSupplierUuid}
              viewOnly
            />
          );
        },
      },
    ];
    const levelChartProps = {
      levelList,
      visible: levelChartVisible,
      onClose: this.handleLevelChart,
    };
    // 质量整改
    const qualityProps = {
      visible: qualityRectifyModalVisible,
      onClose: this.handleQualityRectify,
      evalHeaderId: params.id,
      orderSource: 'kpiEval',
      setQualityVisible: this.setQualityVisible,
      drawer: true,
    };
    // 等级分布按钮状态控制
    const levelChartDisable =
      evalStatus === 'FINAL_COLLECTED' ||
      evalStatus === 'APPROVING' ||
      evalStatus === 'PUBLISHED' ||
      evalStatus === 'COMPLETED';

    // 质量整改按钮状态控制
    const qualityRectifyDisabled =
      evalStatus === 'FINAL_COLLECTED' ||
      evalStatus === 'APPROVING' ||
      evalStatus === 'COMPLETED' ||
      evalStatus === 'PUBLISHED';

    if (detailData.evalGranularity === 'SU+CA') {
      completeColumns.splice(2, 0, {
        title: intl.get(`sslm.evaluationQuery.model.purchase.category`).d('采购品类'),
        dataIndex: 'categoryName',
        width: 200,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      });
    }
    if (detailData.evalGranularity === 'SU+IT') {
      completeColumns.splice(2, 0, {
        title: intl.get(`sslm.evaluationQuery.model.item.materiel`).d('物料'),
        dataIndex: 'itemName',
        width: 200,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      });
    }
    const searchProps = {
      tenantId,
      evalHeaderId: params.id,
      evalGranularity: detailData.evalGranularity,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const columns = isSu
      ? completeColumns.filter(
          ({ dataIndex }) => dataIndex !== 'categoryName' || dataIndex !== 'itemName'
        )
      : completeColumns;
    if (checkCollectFlag) {
      columns.splice(
        4,
        0,
        {
          title: intl.get(`sslm.evaluationQuery.model.purchase.checkCollectScore`).d('校准得分'),
          dataIndex: 'checkCollectScore',
          width: 100,
        },
        {
          title: intl.get(`sslm.evaluationQuery.model.purchase.lineEntityRemark`).d('说明'),
          dataIndex: 'lineEntityRemark',
          width: 150,
          render: val => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
        }
      );
    }
    if (checkLevelFlag) {
      columns.splice(columns.findIndex(item => item.dataIndex === 'levelCode') + 1, 0, {
        title: intl.get(`sslm.supplierDocManage.model.docManage.checkLevelDesc`).d('校准等级'),
        dataIndex: 'checkLevelDesc',
        width: 100,
      });
    }
    const exportUrls = {
      SU: `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/supplier`,
      'SU+CA': `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/cdata`,
      'SU+IT': `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/export`,
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    const paramProps = {
      visible: paramVauleVisible,
      currentRecord: lineCurrentRecord,
      closeModal: this.closeParamVauleModal,
      customizeTable,
      customizeTableCode: 'SSLM.EVALUATION_QUERY_DETAIL.PARAM_VALUE_LIST',
      custLoading,
    };

    const attachmentModalProps = {
      evalHeaderId,
      viewOnly: true,
      isVisible: modalVisible,
      onCancel: this.handleAttachmentModal,
      handleRefresh: () => this.handleSearch(),
    };

    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };

    const currentTrxLineFlag =
      (detailData.trxLineFlags || detailData.trxLineFlag?.toString() || '')?.split(',') || [];
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.evaluationQuery.model.result.query`).d('考评结果查询')}
          backPath={
            Number(routerParams.openTab) ? '' : historyBack || `/sslm/evaluation-query/list`
          }
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_BTN_GROUP',
            },
            [
              <Button
                type="primary"
                icon="clock-circle-o"
                data-name="operationRecord"
                onClick={() => this.handleModal(true)}
              >
                {intl.get(`sslm.evaluationQuery.model.operation.record`).d('操作记录')}
              </Button>,
              <ExcelExport
                data-name="excelExport"
                requestUrl={exportUrls[routerParams.evalGranularity]}
                queryParams={this.handleParams()}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                }}
              />,
              <Button
                icon="area-chart"
                data-name="viewChart"
                disabled={!levelChartDisable}
                onClick={this.handleLevelChart}
              >
                {intl.get('sslm.evaluationQuery.view.button.viewChart').d('查看等级分布图表')}
              </Button>,
              <Button
                icon="profile"
                data-name="viewQualityRectify"
                onClick={() => this.handleQualityRectify(true)}
                style={{
                  display: qualityRectifyDisabled && qualityButtonVisible ? 'block' : 'none',
                }}
                permissionList={[
                  {
                    code: 'srm.partner.evaluation-manage.result.ps.quality',
                    type: 'button',
                    meaning: '考评结果查询-查看质量整改',
                  },
                ]}
              >
                {intl
                  .get('sslm.supplierDocManage.view.button.viewQualityRectify')
                  .d('查看质量整改')}
              </Button>,
              <PrintProButton
                data-name="print"
                buttonText={intl.get('sslm.common.button.newPrint').d('(新)打印')}
                buttonProps={{
                  icon: 'print',
                  permissionList: [
                    {
                      code: 'srm.partner.evaluation-manage.result.button.detail.print.new',
                      type: 'c7n-pro',
                      meaning: '考评结果查询-明细-新打印',
                    },
                  ],
                }}
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-headers/detail-print-new/${evalHeaderId}`}
                method="GET"
                params={{
                  pageEntryPoint: 'CUSTOMER_OWNED',
                  customizeUnitCode:
                    'SSLM.EVALUATION_QUERY_ARCHIVES.BASIC_INFO,SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_LINE_TABLE',
                }}
              />,
              remote.process('SSLM_EVALUATION_QUERY_LIST_HEADER_BTNS', null, { evalHeaderId }),
            ].filter(Boolean)
          )}
        </Header>
        <Content className={styles['detail-form']}>
          <Spin spinning={loading.detail || false}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['queryDetailKey']}
              onChange={this.handleCollapse}
            >
              <Panel
                key="queryDetailKey"
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`sslm.evaluationQuery.view.information`).d('基本信息')}</h3>
                    <a>
                      {collapsed
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapsed ? 'up' : 'down'} />}
                    </a>
                  </React.Fragment>
                }
              >
                {customizeForm(
                  {
                    code: 'SSLM.EVALUATION_QUERY_ARCHIVES.BASIC_INFO',
                    form,
                    dataSource: detailData,
                  },
                  <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.evaluationQuery.model.archive.num`).d('档案编码')}
                        >
                          {getFieldDecorator('evalNum', {
                            initialValue: detailData.evalNum,
                          })(<span>{detailData.evalNum}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.archive.describe`)
                            .d('档案描述')}
                        >
                          {getFieldDecorator('evalName', {
                            initialValue: detailData.evalName,
                          })(<span>{detailData.evalName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.archive.status`)
                            .d('档案状态')}
                        >
                          {getFieldDecorator('evalStatus', {
                            initialValue: detailData.evalStatus,
                          })(<span>{detailData.evalStatusMeaning}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.template`)
                            .d('考评模板')}
                        >
                          {getFieldDecorator('evalTplName', {
                            initialValue: detailData.evalTplName,
                          })(<span>{detailData.evalTplName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.dimension`)
                            .d('考评维度')}
                        >
                          {getFieldDecorator('evalDimensionMeaning', {
                            initialValue: detailData.evalDimensionMeaning,
                          })(<span>{detailData.evalDimensionMeaning}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.evaluationQuery.model.dimension.value`).d('维度值')}
                        >
                          {getFieldDecorator('evalDimensionValueMeaning', {
                            initialValue: detailData.evalDimensionValueMeaning,
                          })(<span>{detailData.evalDimensionValueMeaning}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.cycle`)
                            .d('考评周期')}
                        >
                          {getFieldDecorator('evalCycleMeaning', {
                            initialValue: detailData.evalCycleMeaning,
                          })(<span>{detailData.evalCycleMeaning}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.charger`)
                            .d('考评负责人')}
                        >
                          {getFieldDecorator('processUserName', {
                            initialValue: detailData.processUserName,
                          })(<span>{detailData.processUserName}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.archive.create.time`)
                            .d('建档时间')}
                        >
                          {getFieldDecorator('creationDate', {
                            initialValue: detailData.creationDate,
                          })(<span>{dateTimeRender(detailData.creationDate)}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.createdUserName`)
                            .d('创建人')}
                        >
                          {getFieldDecorator('createdUserName', {
                            initialValue: detailData.createdUserName,
                          })(<span>{detailData.createdUserName}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.startDate`)
                            .d('考评日期从')}
                        >
                          {getFieldDecorator('evalDateFrom', {
                            initialValue: moment(detailData.evalDateFrom).format(
                              DEFAULT_DATE_FORMAT
                            ),
                          })(<span>{dateRender(detailData.evalDateFrom)}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.endDate`)
                            .d('考评日期至')}
                        >
                          {getFieldDecorator('evalDateTo', {
                            initialValue: moment(detailData.evalDateTo).format(DEFAULT_DATE_FORMAT),
                          })(<span>{dateRender(detailData.evalDateTo)}</span>)}
                        </FormItem>
                      </Col>
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl.get(`sslm.evaluationQuery.model.exam.method`).d('考评方式')}
                        >
                          {getFieldDecorator('kpiMethod', {
                            initialValue: isEmpty(detailData)
                              ? ''
                              : valueMapMeaning(methodValue, detailData.kpiMethod),
                          })(
                            <span>
                              {isEmpty(detailData)
                                ? ''
                                : valueMapMeaning(methodValue, detailData.kpiMethod)}
                            </span>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={8}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.supplierDocManage.model.evalDocManage.evaluateScope`)
                            .d('选择参评供应商范围')}
                        >
                          {getFieldDecorator('trxLineFlagMeaning', {
                            initialValue: detailData.trxLineFlags
                              ? detailData.trxLineFlagsMeaning
                              : detailData.trxLineFlagMeaning,
                          })(
                            <span>
                              {detailData.trxLineFlags
                                ? detailData.trxLineFlagsMeaning
                                : detailData.trxLineFlagMeaning}
                            </span>
                          )}
                        </FormItem>
                      </Col>
                      {detailData.evalTplType === 'BDKPI_EVAL' && (
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                              .d('单据类型')}
                          >
                            {getFieldDecorator('docTypeMeaning', {
                              initialValue: detailData.docTypeMeaning,
                            })(<span>{detailData.docTypeMeaning}</span>)}
                          </FormItem>
                        </Col>
                      )}
                      {detailData.evalTplType === 'BDKPI_EVAL' && (
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.docNum`)
                              .d('单据')}
                          >
                            {getFieldDecorator('docNum', {
                              initialValue: detailData.docNum,
                            })(
                              <LovMulti
                                code={
                                  detailData.docType === 'YS'
                                    ? 'SSLM.KPI_EVAL.RCV_TRX_HEADER'
                                    : 'SSLM.KPI_EVAL.CONTRACT_HEAD_SUBJECT'
                                }
                                value={detailData.docNum}
                                viewOnly
                              />
                            )}
                          </FormItem>
                        </Col>
                      )}
                    </Row>
                    {currentTrxLineFlag.includes('2') && (
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.cooperationDay`)
                              .d('合作天数')}
                          >
                            {getFieldDecorator('cooperationDays', {
                              initialValue: detailData.cooperationDays,
                            })(<span>{detailData.cooperationDays}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {currentTrxLineFlag.includes('1') && (
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.inventoryTimes`)
                              .d('接收入库次数（≥）')}
                          >
                            {getFieldDecorator('inventoryTimes', {
                              initialValue: detailData.inventoryTimes,
                            })(<span>{detailData.inventoryTimes}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {currentTrxLineFlag.includes('3') && (
                      <Row className="writable-row">
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
                              initialValue: detailData.categoryDescriptions,
                            })(<span>{detailData.categoryDescriptions}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {currentTrxLineFlag.includes('4') && (
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.supplierProduct`)
                              .d('供货品类')}
                          >
                            {getFieldDecorator('itemCategoryNames', {
                              initialValue: detailData.itemCategoryNames,
                            })(<span>{detailData.itemCategoryNames}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {currentTrxLineFlag.includes('5') && (
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.lifeCycle`)
                              .d('生命周期')}
                          >
                            {getFieldDecorator('stageIds', {
                              initialValue: detailData.stageIds,
                            })(<span>{detailData.stageDescriptions}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    {currentTrxLineFlag.includes('6') && (
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.deliveryTimes`)
                              .d('送货单次数（≥）')}
                          >
                            {getFieldDecorator('deliveryTimes', {
                              initialValue: detailData.deliveryTimes,
                            })(<span>{detailData.deliveryTimes}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                    )}
                    <Row className="writable-row">
                      <Col span={24}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.rule`)
                            .d('考评规则说明')}
                        >
                          {getFieldDecorator('evalRuleRemark', {
                            initialValue: detailData.evalRuleRemark,
                          })(<span>{detailData.evalRuleRemark}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={24}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.evaluationQuery.model.evaluation.remark`)
                            .d('考评说明')}
                        >
                          {getFieldDecorator('remark', {
                            initialValue: detailData.remark,
                          })(<span>{detailData.remark}</span>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row className="writable-row">
                      <Col span={24}>
                        <FormItem
                          {...formItemLayout}
                          label={intl
                            .get(`sslm.common.view.archiveFilled.appraisalAttachment`)
                            .d('考评附件')}
                        >
                          {getFieldDecorator('totalAttachment', {
                            initialValue: detailData.totalAttachment,
                          })(
                            <>
                              <a onClick={() => this.handleAttachmentModal()}>
                                <Icon type="paper-clip" />
                                {intl.get('hzero.common.upload.view').d('查看附件')}
                              </a>
                              {detailData.totalAttachment ? (
                                <span
                                  style={{
                                    backgroundColor: linkColor || '#108ee9',
                                    height: 'auto',
                                    lineHeight: '15px',
                                    marginLeft: '4px',
                                    padding: '0 7px',
                                    fontSize: '12px',
                                    color: '#fff',
                                  }}
                                >
                                  {detailData.totalAttachment}
                                </span>
                              ) : null}
                            </>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    {/* 单据状态为: 汇总完成、审批中、已发布、已完成状态及流程表单中显示 */}
                    {['FINAL_COLLECTED', 'APPROVING', 'PUBLISHED', 'COMPLETED'].includes(
                      evalStatus
                    ) && (
                      <Row className="writable-row">
                        <Col span={24}>
                          <Form.Item
                            label={intl
                              .get(`sslm.supplierDocManage.model.evalDocManage.evalResultRemark`)
                              .d('考评结果说明')}
                          >
                            {getFieldDecorator('evalResultRemark', {
                              initialValue: detailData.evalResultRemark,
                            })(<span>{detailData.evalResultRemark}</span>)}
                          </Form.Item>
                        </Col>
                      </Row>
                    )}
                    {['FINAL_COLLECTED', 'APPROVING', 'PUBLISHED', 'COMPLETED'].includes(
                      evalStatus
                    ) && (
                      <Row className="writable-row">
                        <Col span={24}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get('sslm.supplierDocManage.model.evalDocManage.evalAttUuid')
                              .d('考评结果附件')}
                          >
                            {getFieldDecorator('evalAttUuid', {
                              initialValue: detailData.evalAttUuid || newAttachmentUuid,
                            })(
                              <Upload
                                attachmentUUID={detailData.evalAttUuid || newAttachmentUuid}
                                filePreview
                                bucketName={PRIVATE_BUCKET}
                                bucketDirectory="sslm-evaluation"
                                viewOnly
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
            <Search {...searchProps} />
            {customizeTable(
              {
                code: 'SSLM.EVALUATION_QUERY_ARCHIVES.DETAIL_LINE_TABLE',
              },
              <Table
                bordered
                dataSource={lineList}
                columns={columns}
                rowKey="evalLineId"
                pagination={detailLinePage}
                onChange={this.handleSearch}
                scroll={{ x: scrollX, y: 350 }}
                custLoading={custLoading}
              />
            )}
            <OperationRecModal {...modalProps} />
            <ScoreDetailModal {...scoreDetailModalProps} />
            <ScorePartDetailModal {...scorePartDetailModalProps} />
          </Spin>
        </Content>
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
        <LevelChart {...levelChartProps} />
        <ParamValueModal {...paramProps} />
        <QualityRectification {...qualityProps} />
      </React.Fragment>
    );
  }
}
