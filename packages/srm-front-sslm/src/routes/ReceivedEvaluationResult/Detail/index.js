/**
 * Detail - 我收到的考评结果详情组件
 * @date: 2018-12-27
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty, uniqBy, now } from 'lodash';
import querystring from 'querystring';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import EditTable from 'srm-front-boot/lib/components/EditTable';
import ExcelExport from 'components/ExcelExport';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { Row, Col, Spin, Icon, Collapse, Form, Input, Button, Modal, Tooltip } from 'hzero-ui';
import { Button as PerButton } from 'components/Permission';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import {
  getEditTableData,
  filterNullValueObject,
  getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import QualityRectification from '@/routes/SiteInvestigateReport/common/QualityRectification';
import ParamValueModal from '@/routes/ParamValueModal';
import TooltipButton from '@/routes/EvaluationDocManage/Detail/TooltipButton';
import ScoreDetailModal from './ScoreDetailModal';

// 使用 Collapse.Panel 组件
const { Panel } = Collapse;
const FormItem = Form.Item;

/**
 * @class Detail
 * @extends {Component} - React.Component
 * @reactProps {Object} receivedEvaluationResult - 数据源
 * @reactProps {!Boolean} fetchDetailLoading - 查询详细页面数据
 * @reactProps {!Boolean} fetchScoreDetailLoading - 查询Modal数据
 * @reactProps {Function} [dispatch= e => e] -redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.common', 'sslm.receivedEvaluationResult', 'sslm.supplierDocManage'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  manualQuery: true,
  unitCode: [
    'SSLM.EVALUATION_RECEIVED_DETAIL.BTN_GROUP',
    'SSLM.EVALUATION_RECEIVED_DETAIL.BASIC_INFO',
    'SSLM.EVALUATION_RECEIVED_DETAIL.LIST',
    'SSLM.EVALUATION_RECEIVED_DETAIL.RATING_DETAILS',
    'SSLM.EVALUATION_RECEIVED_DETAIL.COLLAPSE', // 折叠面板
    'SSLM.EVALUATION_RECEIVED_DETAIL.PARAM_VALUE_LIST', // 评分状态model表格
  ],
})
@connect(({ receivedEvaluationResult, evaluationDocManage, loading }) => ({
  evaluationDocManage,
  receivedEvaluationResult,
  loading: loading.effects['receivedEvaluationResult/fetchDetailData'],
  scoreDetailLoading: loading.effects['receivedEvaluationResult/fetchScoreDetail'],
  operateLoading:
    loading.effects['receivedEvaluationResult/saveScoreDetail'] ||
    loading.effects['receivedEvaluationResult/submitComplaint'],
  tenantId: getCurrentOrganizationId(),
  supplierTenantId: getUserOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@remote({
  code: 'SSLM.RECEIVED_EVALUATION_RESULT_DETAIL', // 欧瑞康src-26776二开埋点
  name: 'receivedEvaluationRemote',
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const routerParams = querystring.parse(location.search.substr(1));
    const { evalGranularity } = routerParams;
    this.state = {
      scoreDetailVisible: false,
      evalGranularity: evalGranularity.replace(' ', '+'),
      collapsedKeys: ['queryDetailKey', 'gradInfo'],
      qualityButtonVisible: true, // 质量整改按钮显示隐藏标识
      qualityRectifyModalVisible: false, // 质量整改侧弹窗显示隐藏标识
      allowAppealFlag: false, // 是否允许供应商申诉
      supplierAppealFlag: false, // 供应商是否发起过申诉
      selectedRows: [],
      paramVauleVisible: false,
      scoreDetailCurrentRecord: {},
      allowPublishedFlag: false,
    };
    const { queryUnitConfig } = props;
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: routerParams.partnerTenantId || -1 });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedEvaluationResult/updateState',
      payload: {
        supplierListPagination: {},
        supplierList: [],
      },
    });
  }

  /**
   * 结果明细表格折叠和展开
   * @memberof Detail
   */
  @Bind()
  handleCollapse(value) {
    this.setState({ collapsedKeys: value });
  }

  /**
   * 请求页面数据
   * @param {Function} dispatch - redux dispatch 方法
   * @param {Object} match.params - location对象的属性,是从跳转页面传递来的值
   */
  componentDidMount() {
    this.handleSearch();
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
      receivedEvaluationResult: {
        detailData: { evalTplId },
      },
    } = this.props;
    const type = 'receivedEvaluationResult/fetchScoreDetail';
    dispatch({
      type,
      payload: {
        tenantId,
        evalTplId,
        evalLineId: record.evalLineId,
        customizeUnitCode: 'SSLM.EVALUATION_RECEIVED_DETAIL.RATING_DETAILS',
      },
    });
    this.setState({ scoreDetailVisible: true, granularityList: record });
  }

  /**
   * 请求复合查询条件的数据
   * @param {?string} fields - 表单数据
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      tenantId,
      supplierTenantId,
      match: { params = {} },
    } = this.props;
    const { evalGranularity } = this.state;
    const paramItem = {
      SU: 'SUPPLIER',
      'SU+CA': 'SCORE',
      'SU+IT': 'SCORE',
    };
    dispatch({
      type: 'receivedEvaluationResult/fetchDetailData',
      payload: {
        page,
        supFlag: 1,
        tenantId,
        supplierTenantId,
        evalHeaderId: params.id,
        selectOptional: paramItem[evalGranularity],
        customizeUnitCode: [
          'SSLM.EVALUATION_RECEIVED_DETAIL.BASIC_INFO',
          'SSLM.EVALUATION_RECEIVED_DETAIL.LIST',
        ].join(),
      },
    }).then(res => {
      if (res) {
        this.setState({
          selectedRows: [], // 保存时清空勾选项，处理之前勾选的数据不准确问题
          allowAppealFlag: !!res.allowAppealFlag,
          supplierAppealFlag: !!res.supplierAppealFlag,
          allowPublishedFlag: !!res.allowPublishedFlag,
        });
      }
    });
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

  // 评分状态弹窗
  @Bind()
  handleParamVauleModal(record = {}) {
    const { dispatch } = this.props;
    const { evalDtlId = '' } = record;
    const { paramVauleVisible } = this.state;
    if (!paramVauleVisible) {
      dispatch({
        type: 'evaluationDocManage/queryEvaluationStatus',
        payload: {
          evalDtlId,
          page: {},
          customizeUnitCode: 'SSLM.EVALUATION_RECEIVED_DETAIL.PARAM_VALUE_LIST',
        },
      });
    }
    this.setState({
      paramVauleVisible: !paramVauleVisible,
      scoreDetailCurrentRecord: paramVauleVisible ? {} : record,
    });
  }

  /**
   * 编辑
   */
  @Bind()
  onRowEdit(record, flag) {
    const {
      dispatch,
      receivedEvaluationResult: { supplierList = [] },
    } = this.props;
    const newList = supplierList.map(n =>
      n.evalLineId === record.evalLineId ? { ...n, _status: flag ? 'update' : '' } : n
    );
    dispatch({
      type: 'receivedEvaluationResult/updateState',
      payload: {
        supplierList: newList,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      supplierTenantId,
      form: { getFieldsValue, validateFields },
      receivedEvaluationResult: { supplierList = [], detailData = {} },
    } = this.props;
    const { kpiEvalDetailLineDTOPage, ...others } = detailData;
    const formValues = getFieldsValue();
    const tableValues = getEditTableData(supplierList);
    const isModify = !!supplierList.find(n => n._status === 'update' || n._status === 'create');
    if (isModify && isEmpty(tableValues)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.gradWarnMsg')
          .d('请维护【评分信息】'),
      });
      return;
    }
    validateFields({ force: true }, err => {
      if (err) return;
      dispatch({
        type: 'receivedEvaluationResult/saveScoreDetail',
        payload: {
          ...others,
          ...formValues,
          supplierTenantId,
          kpiEvalDetailLineDTOList: tableValues,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    });
  }

  /**
   * 获取导出查询参数
   */
  @Bind()
  handleParams() {
    const {
      tenantId,
      match: { params = {} },
      supplierTenantId,
    } = this.props;
    const filterForm = this.form;
    const { evalGranularity } = this.state;
    const paramItem = {
      SU: 'SUPPLIER',
      'SU+CA': 'SCORE', // 有品类
      'SU+IT': 'SCORE', // 有物料
    };
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return {
      ...filterValues,
      tenantId,
      supFlag: 1,
      supplierTenantId,
      evalHeaderId: params.id,
      selectOptional: paramItem[evalGranularity],
    };
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
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

  // 查看质量整改
  @Bind()
  handleQualityRectify(flag) {
    this.setState({
      qualityRectifyModalVisible: flag,
    });
  }

  /**
   * 质量整改按钮是否隐藏
   */
  @Bind()
  setQualityVisible(visible) {
    this.setState({ qualityButtonVisible: visible });
  }

  // 选择项发生改变时的回调
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  // 提交申诉
  @Bind()
  submitComplaint(finallyRows) {
    const {
      dispatch,
      receivedEvaluationResult: { supplierListPagination },
    } = this.props;
    dispatch({
      type: 'receivedEvaluationResult/submitComplaint',
      payload: finallyRows,
    }).then(res => {
      if (res) {
        this.handleSearch(supplierListPagination);
        this.setState({ selectedRows: [] });
        notification.success();
      }
    });
  }

  // 申诉回调
  @Bind()
  handleComplaint() {
    const { selectedRows } = this.state;
    const {
      receivedEvaluationResult: { supplierList = [] },
    } = this.props;
    // 获取变更数据
    const editRows = getEditTableData(supplierList, ['_status']).filter(n =>
      selectedRows.map(m => m.evalLineId).includes(n.evalLineId)
    );
    const finallyRows = uniqBy([...editRows, ...selectedRows], 'evalLineId');
    let appealRemarkFlag = false;
    finallyRows.forEach(row => {
      if (!row.appealRemark) {
        appealRemarkFlag = true;
        return false;
      }
    });
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.model.docManage.noCheckLines')
          .d('未勾选需要进行申诉的行数据，请检查'),
      });
    } else if (appealRemarkFlag) {
      Modal.confirm({
        title: intl
          .get('sslm.supplierDocManage.model.docManage.complaintSubmitMsg')
          .d('未填写申诉说明，请确认是否继续提交'),
        onOk: () => this.submitComplaint(finallyRows),
      });
    } else {
      this.submitComplaint(finallyRows);
    }
  }

  @Bind()
  handleConfirm() {
    const { selectedRows } = this.state;
    const {
      receivedEvaluationResult: { supplierList = [], detailData = {} },
      supplierTenantId,
      form: { getFieldsValue, validateFields },
      dispatch,
      history,
    } = this.props;
    // 获取变更数据
    const editRows = getEditTableData(supplierList, ['_status']).filter(n =>
      selectedRows.map(m => m.evalLineId).includes(n.evalLineId)
    );
    const { kpiEvalDetailLineDTOPage, ...others } = detailData;
    const formValues = getFieldsValue();
    const finallyRows = uniqBy([...editRows, ...selectedRows], 'evalLineId');
    // 校验必填
    const tableValues = getEditTableData(supplierList);
    const isModify = !!supplierList.find(n => n._status === 'update' || n._status === 'create');
    if (isModify && isEmpty(tableValues)) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.message.gradWarnMsg')
          .d('请维护【评分信息】'),
      });
      return;
    }
    validateFields({ force: true }, err => {
      if (err) return;
      dispatch({
        type: 'receivedEvaluationResult/handleConfirm',
        payload: {
          ...others,
          ...formValues,
          supplierTenantId,
          kpiEvalDetailLineDTOList: finallyRows,
        },
      }).then(res => {
        if (res) {
          notification.success();
          history.push({
            pathname: '/sslm/received-query/list',
          });
        }
      });
    });
  }

  render() {
    const {
      loading,
      scoreDetailLoading,
      tenantId,
      operateLoading,
      receivedEvaluationResult: {
        detailData,
        supplierList,
        supplierListPagination,
        scoreDetailList,
      },
      match: { params = {} },
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      customizeCollapse,
      custLoading,
      form,
      form: { getFieldDecorator },
      receivedEvaluationRemote,
    } = this.props;
    const {
      checkDetailFlag,
      checkCollectFlag,
      checkLevelFlag,
      evalStatus,
      weightedFlag,
    } = detailData;
    const {
      scoreDetailVisible,
      evalGranularity,
      granularityList,
      collapsedKeys,
      qualityButtonVisible,
      qualityRectifyModalVisible,
      allowAppealFlag,
      selectedRows,
      supplierAppealFlag,
      paramVauleVisible,
      scoreDetailCurrentRecord,
      allowPublishedFlag,
    } = this.state;
    const scoreDetailModalProps = {
      weightedFlag,
      checkDetailFlag,
      checkLevelFlag,
      evalGranularity,
      scoreDetailList,
      granularityList,
      customizeTable,
      custLoading,
      loading: scoreDetailLoading,
      visible: scoreDetailVisible,
      openParamVauleModal: this.handleParamVauleModal,
      closeModal: this.handleScoreDetailModal,
    };

    const isSu = evalGranularity === 'SU';
    const dynamicColName = {
      'SU+CA': intl.get(`sslm.common.model.archiveFilled.purchaseCategory`).d('采购品类'),
      'SU+IT': intl.get(`sslm.common.model.archiveFilled.item`).d('物料'),
    };

    // 质量整改按钮状态控制
    const qualityRectifyDisabled =
      evalStatus === 'FINAL_COLLECTED' ||
      evalStatus === 'APPROVING' ||
      evalStatus === 'COMPLETED' ||
      evalStatus === 'PUBLISHED';

    // 质量整改
    const qualityProps = {
      visible: qualityRectifyModalVisible,
      onClose: this.handleQualityRectify,
      evalHeaderId: params.id,
      orderSource: 'kpiEval',
      setQualityVisible: this.setQualityVisible,
      drawer: true,
      purchaserFlag: false,
    };

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
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: dynamicColName[evalGranularity],
        dataIndex: 'itemName',
        width: 120,
        render: (val, record) => {
          const name = evalGranularity === 'SU+CA' ? record.categoryName : record.itemName;
          return (
            <Tooltip title={name} placement="topLeft">
              {name}
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`sslm.common.model.score.detail`).d('评分明细'),
        dataIndex: 'scoreDetail',
        width: 120,
        render: (_, record) => (
          <a onClick={() => this.onScoreDetail(record)}>
            {intl.get(`sslm.common.model.score.detail`).d('评分明细')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.score`).d('得分'),
        dataIndex: 'lineScore',
        width: 100,
        render: (text, record) => {
          const val = receivedEvaluationRemote
            ? receivedEvaluationRemote.process(
                'SSLM.RECEIVED_EVALUATION_RESULT_DETAIL_SCORE',
                text,
                {
                  headerInfo: detailData,
                  record,
                }
              )
            : text;
          return typeof record.checkCollectScore === 'number' ? record.checkCollectScore : val;
        },
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.level`).d('等级'),
        dataIndex: 'levelCode',
        width: 60,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`sslm.common.model.appraisal.ranking`).d('考评排名'),
        dataIndex: 'rankNum',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.feedback.remark`).d('反馈说明'),
        dataIndex: 'lineRemark',
        width: 150,
        onCell: this.onCell,
      },
    ];
    const columns = isSu
      ? completeColumns.filter(({ dataIndex }) => dataIndex !== 'itemName')
      : completeColumns;
    if (checkCollectFlag) {
      columns.splice(columns.findIndex(item => item.dataIndex === 'lineScore'), 0, {
        dataIndex: 'checkCollectScore',
        title: intl.get('sslm.common.model.docManage.checkCollectScore').d('校准得分'),
        width: 170,
        render: (val, record) =>
          ['published', 'appealing', 'appealApprovaRejected', 'appealApprovaling'].includes(
            record.lineStatus
          )
            ? ''
            : val, // 校准得分不显示
      });
    }
    if (checkLevelFlag) {
      columns.splice(columns.findIndex(item => item.dataIndex === 'levelCode') + 1, 0, {
        title: intl.get(`sslm.supplierDocManage.model.docManage.checkLevelDesc`).d('校准等级'),
        dataIndex: 'checkLevelDesc',
        width: 100,
      });
    }
    if (allowAppealFlag || allowPublishedFlag) {
      if (allowAppealFlag) {
        columns.push({
          title: intl.get(`sslm.common.model.evaluation.supplierAttachment`).d('供方上传附件'),
          dataIndex: 'attachmentUuid',
          width: 130,
          render: (val, record) =>
            ['update'].includes(record._status) ? (
              <FormItem>
                {record.$form.getFieldDecorator('attachmentUuid', {
                  initialValue: val,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="sslm-evaluation"
                    attachmentUUID={val}
                  />
                )}
              </FormItem>
            ) : (
              <Upload
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sslm-evaluation"
                attachmentUUID={val}
              />
            ),
        });
      }
      columns.splice(columns.findIndex(item => item.dataIndex === 'lineRemark') + 1, 0, {
        title: intl.get(`sslm.common.model.feedback.appealRemark`).d('供应商回复说明'),
        dataIndex: 'appealRemark',
        width: 150,
        onCell: this.onCell,
        render: (val, record) =>
          ['update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('appealRemark', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      });

      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 80,
        render: (_, record) => {
          return (
            <Fragment>
              {record._status === 'update' && (
                <a onClick={() => this.onRowEdit(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              )}
              {record._status !== 'update' && (
                <a
                  onClick={() => this.onRowEdit(record, true)}
                  disabled={['appealing', 'appealApprovaRejected', 'appealApprovaling'].includes(
                    record.lineStatus
                  )}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
            </Fragment>
          );
        },
      });
    }
    // 有一行已发布则显示
    if (supplierAppealFlag) {
      columns.unshift({
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'lineStatusMeaning',
        width: 100,
      });
      columns.splice(
        columns.findIndex(item => item.dataIndex === 'attachmentUuid') + 1,
        0,
        {
          title: intl.get(`sslm.common.model.feedback.calibrationGrade`).d('校准分数'),
          dataIndex: 'appealCheckCollectScore',
          width: 100,
          render: (val, record) =>
            ['published', 'supplierConfirmed'].includes(record.lineStatus) ? val : '', // 已发布状态显示校准分数
        },
        {
          title: intl.get(`sslm.common.model.feedback.newRank`).d('新等级'),
          dataIndex: 'appealLevelCode',
          width: 100,
          render: (val, record) =>
            ['published', 'supplierConfirmed'].includes(record.lineStatus) ? val : '', // 已发布状态显示新等级
        },
        {
          title: intl.get(`sslm.common.model.feedback.newRanking`).d('新排名'),
          dataIndex: 'appealRankNum',
          width: 100,
          render: (val, record) =>
            ['published', 'supplierConfirmed'].includes(record.lineStatus) ? val : '', // 已发布状态显示新排名
        },
        {
          title: intl.get(`sslm.common.model.feedback.purchaserReply`).d('采购方回复'),
          dataIndex: 'appealReply',
          width: 150,
        }
      );
    }

    const exportUrls = {
      SU: `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/received/supplier`,
      'SU+CA': `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/received/cdata`,
      'SU+IT': `/sslm/v1/${tenantId}/eval-headers/result/${params.id}/received/export`,
    };

    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map(n => n.evalLineId),
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: ['appealing', 'appealApprovaRejected', 'appealApprovaling'].includes(
          record.lineStatus
        ),
      }),
    };
    const appealDeadlineTimeStamp =
      detailData.appealDeadlineTime && new Date(detailData.appealDeadlineTime.split('-')).getTime();
    const isExceed = appealDeadlineTimeStamp ? now() - appealDeadlineTimeStamp : null;
    const allLoading = loading || operateLoading || false;

    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };

    const paramProps = {
      visible: paramVauleVisible,
      currentRecord: scoreDetailCurrentRecord,
      closeModal: this.handleParamVauleModal,
      customizeTable,
      customizeTableCode: 'SSLM.EVALUATION_RECEIVED_DETAIL.PARAM_VALUE_LIST',
      custLoading,
    };
    return (
      <Spin spinning={allLoading}>
        <Header
          title={intl.get(`sslm.common.model.message.received.evaluation`).d('我收到的考评结果')}
          backPath="/sslm/received-query/list"
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.EVALUATION_RECEIVED_DETAIL.BTN_GROUP',
            },
            [
              <Button
                icon="save"
                type="primary"
                data-name="save"
                onClick={this.handleSave}
                loading={allLoading}
                style={{ display: allowAppealFlag || allowPublishedFlag ? 'inline-block' : 'none' }}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <TooltipButton
                data-name="complaint"
                icon="exception"
                loading={allLoading}
                onButtonClick={this.handleComplaint}
                style={{ display: allowAppealFlag ? 'inline-block' : 'none', marginLeft: 8 }}
                disabled={isExceed > 0 || detailData.fullUseFlag}
                buttonName={intl.get('sslm.supplierDocManage.view.button.complaint').d('申诉')}
                tooltip={
                  isExceed > 0 || detailData.fullUseFlag
                    ? intl
                        .get(`sslm.receivedEvaluationResult.view.message.appealExceeded`)
                        .d('已超过申诉时间/申诉次数')
                    : null
                }
              />,
              <PerButton
                data-name="confirm"
                permissionList={[
                  {
                    code: `srm.partner.evaluation-manage.received-result.button.confirm`,
                    type: 'button',
                    meaning: '我收到的考评结果-确认按钮',
                  },
                ]}
                icon="check"
                loading={allLoading}
                style={{ display: allowPublishedFlag ? 'inline-block' : 'none', marginLeft: 8 }}
                onClick={this.handleConfirm}
              >
                {intl.get('hzero.common.button.confirm').d('确认')}
              </PerButton>,
              <ExcelExport
                data-name="export"
                requestUrl={exportUrls[evalGranularity]}
                queryParams={this.handleParams()}
                otherButtonProps={{
                  type: 'c7n-pro',
                  icon: 'unarchive',
                }}
              />,
              <Button
                icon="profile"
                data-name="viewQualityRectify"
                onClick={() => this.handleQualityRectify(true)}
                style={{
                  display: qualityRectifyDisabled && qualityButtonVisible ? 'block' : 'none',
                }}
              >
                {intl
                  .get('sslm.supplierDocManage.view.button.viewQualityRectify')
                  .d('查看质量整改')}
              </Button>,
              <PrintProButton
                data-name="detailNewPrint"
                buttonText={intl.get('sslm.common.button.newPrint').d('(新)打印')}
                buttonProps={{
                  icon: 'print',
                }}
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-headers/detail-print-new/${params.id}`}
                method="GET"
                params={{
                  pageEntryPoint: 'CUSTOMER_OWNED',
                  customizeUnitCode:
                    'SSLM.EVALUATION_RECEIVED_DETAIL.BASIC_INFO,SSLM.EVALUATION_RECEIVED_DETAIL.LIST',
                }}
              />,
            ]
          )}
        </Header>
        <Content>
          <div className="ued-detail-wrapper">
            {customizeCollapse(
              {
                code: 'SSLM.EVALUATION_RECEIVED_DETAIL.COLLAPSE',
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={collapsedKeys}
                onChange={this.handleCollapse}
              >
                <Panel
                  key="queryDetailKey"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`sslm.receivedEvaluationResult.view.message.baseInfo`)
                          .d('基本信息')}
                      </h3>
                      <a>
                        {collapsedKeys.includes('queryDetailKey')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        {<Icon type={collapsedKeys.includes('queryDetailKey') ? 'up' : 'down'} />}
                      </a>
                    </Fragment>
                  }
                >
                  {customizeForm(
                    {
                      code: 'SSLM.EVALUATION_RECEIVED_DETAIL.BASIC_INFO',
                      form,
                      dataSource: detailData,
                    },
                    <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.num`).d('档案编码')}
                          >
                            {getFieldDecorator('evalNum', {
                              initialValue: detailData.evalNum,
                            })(<span>{detailData.evalNum}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.describe`).d('档案描述')}
                          >
                            {getFieldDecorator('evalName', {
                              initialValue: detailData.evalName,
                            })(<span>{detailData.evalName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.status`).d('档案状态')}
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
                            label={intl.get(`sslm.common.model.evaluation.template`).d('考评模板')}
                          >
                            {getFieldDecorator('evalTplName', {
                              initialValue: detailData.evalTplName,
                            })(<span>{detailData.evalTplName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.dimension`).d('考评维度')}
                          >
                            {getFieldDecorator('evalDimension', {
                              initialValue: detailData.evalDimension,
                            })(<span>{detailData.evalDimensionMeaning}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.dimension.value`).d('维度值')}
                          >
                            {getFieldDecorator('evalDimensionValue', {
                              initialValue: detailData.evalDimensionValue,
                            })(<span>{detailData.evalDimensionValueMeaning}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.cycle`).d('考评周期')}
                          >
                            {getFieldDecorator('evalCycle', {
                              initialValue: detailData.evalCycle,
                            })(<span>{detailData.evalCycleMeaning}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.charger`).d('考评负责人')}
                          >
                            {getFieldDecorator('processUserName', {
                              initialValue: detailData.processUserName,
                            })(<span>{detailData.processUserName}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.archive.create.time`).d('建档时间')}
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
                              .get(`sslm.common.model.evaluation.createdUserName`)
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
                              .get(`sslm.common.model.evaluation.date.after`)
                              .d('考评日期从')}
                          >
                            {getFieldDecorator('evalDateFrom', {
                              initialValue: detailData.evalDateFrom,
                            })(<span>{dateRender(detailData.evalDateFrom)}</span>)}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl
                              .get(`sslm.common.model.evaluation.date.before`)
                              .d('考评日期至')}
                          >
                            {getFieldDecorator('evalDateTo', {
                              initialValue: detailData.evalDateTo,
                            })(<span>{dateRender(detailData.evalDateTo)}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      {detailData.evalTplType === 'BDKPI_EVAL' && (
                        <Row className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.docType`)
                                .d('单据类型')}
                            >
                              {getFieldDecorator('docType', {
                                initialValue: detailData.docType,
                              })(<span>{detailData.docTypeMeaning}</span>)}
                            </FormItem>
                          </Col>
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
                        </Row>
                      )}
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.rule`).d('考评规则说明')}
                          >
                            {getFieldDecorator('evalRuleRemark', {
                              initialValue: detailData.evalRuleRemark,
                            })(<span>{detailData.evalRuleRemark}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      <Row className="writable-row">
                        <Col span={8}>
                          <FormItem
                            {...formItemLayout}
                            label={intl.get(`sslm.common.model.evaluation.remark`).d('考评说明')}
                          >
                            {getFieldDecorator('remark', {
                              initialValue: detailData.remark,
                            })(<span>{detailData.remark}</span>)}
                          </FormItem>
                        </Col>
                      </Row>
                      {/* 单据状态为: 汇总完成、审批中、已发布、已完成状态及流程表单中显示 */}
                      {['FINAL_COLLECTED', 'APPROVING', 'PUBLISHED', 'COMPLETED'].includes(
                        evalStatus
                      ) && (
                        <Row className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.evalResultRemark`)
                                .d('考评结果说明')}
                            >
                              {getFieldDecorator('evalResultRemark', {
                                initialValue: detailData.evalResultRemark,
                              })(<span>{detailData.evalResultRemark}</span>)}
                            </FormItem>
                          </Col>
                        </Row>
                      )}
                      {Boolean(detailData.allowAppealFlag) && (
                        <Row className="writable-row">
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
                                initialValue: detailData.appealDeadline,
                              })(<span>{detailData.appealDeadlineMeaning}</span>)}
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
                                initialValue: detailData.appealDeadlineTime,
                              })(<span>{dateTimeRender(detailData.appealDeadlineTime)}</span>)}
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
                                initialValue: detailData.appealLimit,
                              })(<span>{detailData.appealLimitMeaning}</span>)}
                            </FormItem>
                          </Col>
                        </Row>
                      )}
                      {Boolean(detailData.allowAppealFlag) && (
                        <Row className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(`sslm.supplierDocManage.model.evalDocManage.appealSum`)
                                .d('申诉次数')}
                            >
                              {getFieldDecorator('useTimes', {
                                initialValue: detailData.useTimes,
                              })(
                                <span>
                                  {detailData.useTimes}
                                  {(detailData.useTimes || detailData.useTimes === 0) &&
                                    intl
                                      .get(`sslm.supplierDocManage.model.evalDocManage.time`)
                                      .d('次')}
                                </span>
                              )}
                            </FormItem>
                          </Col>
                        </Row>
                      )}
                      {
                        <Row className="writable-row">
                          <Col span={8}>
                            <FormItem
                              {...formItemLayout}
                              label={intl
                                .get(
                                  `sslm.supplierDocManage.model.evalDocManage.confirmSupplierUuid`
                                )
                                .d('供应商确认附件上传')}
                            >
                              {getFieldDecorator('confirmSupplierUuid', {
                                initialValue: detailData.confirmSupplierUuid,
                              })(
                                <Upload
                                  bucketName={PRIVATE_BUCKET}
                                  bucketDirectory="sslm-evaluation"
                                  attachmentUUID={detailData.confirmSupplierUuid}
                                  viewOnly={!detailData.allowPublishedFlag}
                                />
                              )}
                            </FormItem>
                          </Col>
                        </Row>
                      }
                    </Form>
                  )}
                </Panel>
                <Panel
                  key="gradInfo"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get('sslm.common.view.message.gradInfo').d('评分信息')}</h3>
                      <a>
                        {collapsedKeys.includes('gradInfo')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        {<Icon type={collapsedKeys.includes('gradInfo') ? 'up' : 'down'} />}
                      </a>
                    </Fragment>
                  }
                >
                  {customizeTable(
                    {
                      code: 'SSLM.EVALUATION_RECEIVED_DETAIL.LIST',
                    },
                    <EditTable
                      bordered
                      columns={columns}
                      dataSource={supplierList}
                      rowKey="evalLineId"
                      onChange={this.handleSearch}
                      pagination={supplierListPagination}
                      custLoading={custLoading}
                      rowSelection={allowAppealFlag && rowSelection}
                    />
                  )}
                </Panel>
              </Collapse>
            )}
          </div>
        </Content>
        <ScoreDetailModal {...scoreDetailModalProps} />
        <QualityRectification {...qualityProps} />
        <ParamValueModal {...paramProps} />
      </Spin>
    );
  }
}
