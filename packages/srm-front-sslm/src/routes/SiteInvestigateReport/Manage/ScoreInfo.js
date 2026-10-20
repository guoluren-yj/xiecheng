/**
 * ScoreInfo -评分信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { isEmpty, isArray, isNumber, sum, uniqBy, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  Spin,
  Row,
  Col,
  Select,
  Icon,
  Tag,
  Checkbox,
  Tooltip,
} from 'hzero-ui';

import { Modal as ChoerodonModal } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, filterNullValueObject } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import LovMultiple from '@/routes/components/LovMultiple';
import AttachmentModal from '../common/AttachmentModal';
import IndicatorMaintain from './IndicatorMaintain';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

const tenantId = getCurrentOrganizationId();

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
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
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    siteInvestigateReport,
    queryScoreInfoLoading: loading.effects['siteInvestigateReport/queryScoreInfo'],
    scorerLoading:
      loading.effects['siteInvestigateReport/queryScorer'] ||
      loading.effects['siteInvestigateReport/saveScorer'] ||
      loading.effects['siteInvestigateReport/batchSaveGrader'] ||
      loading.effects['siteInvestigateReport/deleteScorer'],
    queryScoreStatusLoading: loading.effects['siteInvestigateReport/queryScoreStatus'],
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
export default class ScoreInfo extends Component {
  constructor(props) {
    super(props);
    const { onRef = e => e } = this.props;
    onRef(this);
    this.state = {
      scorerVisible: false,
      scoreStatusVisible: false,
      selectedRows: [], // 评分人选中行
      evalLineId: undefined, // 评分信息行id
      scoreInfoSelectedRowKeys: [], // 评分信息选中项的集合
      scoreInfoSelectedRows: [],
      dataSource: [],
      batchFlag: false, // 区分是否为批量操作
      expand: false,
      expandedRowKeys: [],
      allScoreRowKey: [],
      attachmentVisible: false,
    };
  }

  componentDidMount() {
    this.queryScoreInfo();
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 评分信息选择/取消选择单列的回调
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  @Bind()
  onTableRowSelect(record, selected) {
    const { scoreInfoSelectedRows = [] } = this.state;
    let newSelectedRows = [...scoreInfoSelectedRows];
    function assignNewSelectedRow(rowData) {
      if (selected) {
        newSelectedRows.push(rowData);
      } else {
        newSelectedRows = newSelectedRows.filter(o => o.evalLineId !== rowData.evalLineId);
      }
    }
    function batchAssignNewSelectedRows(collection = []) {
      collection.forEach(n => {
        assignNewSelectedRow(n);
        if (!isEmpty(n.children)) {
          batchAssignNewSelectedRows(n.children);
        }
      });
    }
    assignNewSelectedRow(record);
    if (!isEmpty(record.children)) {
      batchAssignNewSelectedRows(record.children);
    }
    // 过滤重复数据
    const uniqueSelectRows = uniqBy(newSelectedRows, 'evalLineId');
    const newSelectedRowKeys = uniqueSelectRows.map(item => item.evalLineId);
    this.setState({
      scoreInfoSelectedRowKeys: newSelectedRowKeys,
      scoreInfoSelectedRows: uniqueSelectRows,
    });
  }

  /**
   * 评分信息选择/取消选择所有列的回调
   * @param {boolean} selected - 是否选中
   * @param {object} selectedRows - 选中的行
   * @param {object} changeRows - 变化的行
   */
  @Bind()
  onTableRowSelectAll(selected, selectedRows) {
    let newSelectedRows = [];
    if (selected) {
      newSelectedRows = selectedRows;
    }
    const newSelectedRowKeys = newSelectedRows.map(item => item.evalLineId);
    this.setState({
      scoreInfoSelectedRowKeys: newSelectedRowKeys,
      scoreInfoSelectedRows: newSelectedRows,
    });
  }

  /**
   * 评分信息查询
   */
  @Bind()
  queryScoreInfo(value = {}) {
    const { dispatch, evalHeaderId, customizeUnitCode = '' } = this.props;
    dispatch({
      type: 'siteInvestigateReport/queryScoreInfo',
      payload: {
        evalHeaderId,
        customizeUnitCode,
        ...value,
      },
    }).then(res => {
      if (res) {
        const addUpdateToChildren = arr => {
          if (Array.isArray(arr)) {
            return arr.map(item => {
              const items = item;
              if (Array.isArray(item.children)) {
                items.children = addUpdateToChildren(item.children);
              }
              return {
                ...items,
                _status: 'update',
              };
            });
          } else {
            return arr;
          }
        };
        const result = addUpdateToChildren(res);
        // 获取所有评分行id
        const allScoreRowKey = [];
        const flatKeys = scoreInfo => {
          if (isArray(scoreInfo.children) && !isEmpty(scoreInfo.children)) {
            allScoreRowKey.push(scoreInfo.evalLineId);
            scoreInfo.children.forEach(item => flatKeys(item));
          } else {
            allScoreRowKey.push(scoreInfo.evalLineId);
          }
        };
        res.forEach(item => {
          flatKeys(item);
        });

        this.setState({
          dataSource: result,
          allScoreRowKey,
          expandedRowKeys: allScoreRowKey,
        });
      }
    });
  }

  /**
   * 评分人查询
   */
  @Bind()
  queryScorer() {
    const { dispatch } = this.props;
    const { evalLineId } = this.state;

    dispatch({
      type: 'siteInvestigateReport/queryScorer',
      payload: {
        evalLineId,
      },
    });
  }

  /**
   * 评分人弹框
   */
  @Bind()
  openScorer(record) {
    const { scorerVisible } = this.state;
    const { dispatch } = this.props;
    const { evalLineId } = record;
    this.setState({ scorerVisible: !scorerVisible, evalLineId, batchFlag: false });
    if (evalLineId) {
      dispatch({
        type: 'siteInvestigateReport/queryScorer',
        payload: {
          evalLineId,
          customizeUnitCode: 'SSLM_SITEINVESTIGATEREPORT.SCORER_INFO',
        },
      });
    }
  }

  /**
   * 新建评分人
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      evalHeaderId,
      siteInvestigateReport: { scorerList },
    } = this.props;
    const { evalLineId } = this.state;
    const newScorerList = [
      { evalLineId, evalHeaderId, evalLineRespId: uuidv4(), _status: 'create' },
      ...scorerList,
    ];
    dispatch({
      type: 'siteInvestigateReport/updateState',
      payload: {
        scorerList: newScorerList,
      },
    });
  }

  /**
   * 新建评分人（改为支持多选带出）
   */
  @Bind()
  handleMultipleAdd = lovRecords => {
    const {
      dispatch,
      evalHeaderId,
      siteInvestigateReport: { scorerList },
    } = this.props;
    const { evalLineId } = this.state;
    const newData = lovRecords.map(({ loginName, userId, userName, unitName }) => ({
      evalLineId,
      evalHeaderId,
      loginName,
      realName: userName,
      respUserId: userId,
      respWeight: '',
      userDepartment: unitName,
      evalLineRespId: uuidv4(),
      _status: 'create',
    }));
    const newScorerList = [...newData, ...scorerList];
    dispatch({
      type: 'siteInvestigateReport/updateState',
      payload: {
        scorerList: newScorerList,
      },
    });
  };

  /**
   * 保存评分人
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      siteInvestigateReport: { scorerList },
      onRefresh,
    } = this.props;
    const { evalLineId, batchFlag, scoreInfoSelectedRows = [] } = this.state;
    const tableValues = getEditTableData(scorerList, ['evalLineRespId', '_status']);
    const childrenSelectedRows = scoreInfoSelectedRows.filter(item => !item.childrenCount);
    const scoreInfoSelectedRowKeys = childrenSelectedRows.map(item => item.evalLineId);
    const type = batchFlag
      ? 'siteInvestigateReport/batchSaveGrader'
      : 'siteInvestigateReport/saveScorer';
    const payload = batchFlag
      ? {
          evalLineIds: scoreInfoSelectedRowKeys,
          siteEvalLineResps: tableValues,
        }
      : {
          evalLineId,
          tableValues,
        };
    if (!isEmpty(tableValues)) {
      dispatch({
        type,
        payload,
      }).then(res => {
        if (res) {
          notification.success();
          // 重新拉取最新数据
          this.queryScoreInfo();
          if (!batchFlag) {
            this.queryScorer();
            onRefresh();
          } else {
            this.setState({
              scorerVisible: false,
              scoreInfoSelectedRowKeys: [],
              scoreInfoSelectedRows: [],
            });
            onRefresh();
          }
        }
      });
    }
  }

  /**
   * 删除评分人
   */
  @Bind()
  handleDelete() {
    const { evalLineId, selectedRows } = this.state;
    const {
      dispatch,
      siteInvestigateReport: { scorerList },
    } = this.props;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        if (!isEmpty(selectedRows)) {
          const createRows = selectedRows.filter(n => n._status === 'create');
          const updateRows = selectedRows.filter(n => n._status === 'update');

          if (!isEmpty(createRows)) {
            const newScorerList = scorerList.filter(n => createRows.indexOf(n) > -1 === false);
            dispatch({
              type: 'siteInvestigateReport/updateState',
              payload: {
                scorerList: newScorerList,
              },
            });
          }
          if (!isEmpty(updateRows)) {
            dispatch({
              type: 'siteInvestigateReport/deleteScorer',
              payload: {
                evalLineId,
                selectedRows: updateRows,
              },
            }).then(res => {
              if (res) {
                notification.success();
                // 重新拉取最新数据
                this.queryScoreInfo();
                this.queryScorer();
              }
            });
          }
        }
        this.setState({ selectedRows: [] });
      },
    });
  }

  /**
   * 评分状态弹框
   */
  @Bind()
  handleStatus(record) {
    const { scoreStatusVisible } = this.state;
    const { dispatch } = this.props;
    const { evalLineId } = record;
    this.setState({ scoreStatusVisible: !scoreStatusVisible });

    if (evalLineId) {
      dispatch({
        type: 'siteInvestigateReport/queryScoreStatus',
        payload: {
          evalLineId,
          customizeUnitCode: 'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_STATUS',
        },
      });
    }
  }

  /**
   * 批量操作评分人
   */
  @Bind()
  handleBatchGrader() {
    const { dispatch } = this.props;
    const { scorerVisible } = this.state;
    dispatch({
      type: 'siteInvestigateReport/updateState',
      payload: {
        scorerList: [],
      },
    });
    this.setState({ scorerVisible: !scorerVisible, batchFlag: true });
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
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 展开全部评分信息
   */
  @Bind()
  expandAll() {
    const { allScoreRowKey } = this.state;
    this.setState({
      expandedRowKeys: allScoreRowKey,
    });
  }

  /**
   * 收起全部评分信息
   */
  @Bind()
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * 树形结构点击展开收起时的回调
   */
  @Bind()
  onExpand(expanded, record) {
    const { evalLineId } = record;
    const { expandedRowKeys } = this.state;

    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, evalLineId],
      });
    } else {
      const newExpandRowKeys = expandedRowKeys.filter(item => item !== evalLineId);
      this.setState({
        expandedRowKeys: newExpandRowKeys,
      });
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { indicatorTypeList = [] } = this.props;
    const { form = {} } = this.props;
    const filterValue = form.getFieldsValue() || {};
    const value = filterValue;
    const { indicatorType } = value;
    //  当选择系统评分的数据时需要修改字段名为processStatus
    if (indicatorTypeList.find(i => i.value === indicatorType)) {
      value.scoreType = 'MANUAL';
    } else if (indicatorType === 'SYSTEM') {
      value.scoreType = 'SYSTEM';
      value.indicatorType = null;
    }
    this.queryScoreInfo(filterNullValueObject(value));
  }

  /**
   * 查询表单组件
   * @returns React.element
   */
  @Bind()
  getSearchForm() {
    const {
      form,
      form: { getFieldDecorator },
      loading,
      customizeFilterForm = () => {},
      // organizationId,
      indicatorTypeList = [],
    } = this.props;
    const { expand } = this.state;
    return customizeFilterForm(
      {
        code: 'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_FILTER', // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.siteInvestigateReport.modal.mange.projectCode`)
                    .d('考察项目编码')}
                >
                  {getFieldDecorator('indicatorCode')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.siteInvestigateReport.modal.mange.projectName`)
                    .d('考察项目名称')}
                >
                  {getFieldDecorator('indicatorName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.siteInvestigateReport.modal.mange.projectType`)
                    .d('考察项目类型')}
                >
                  {getFieldDecorator('indicatorType')(
                    <Select allowClear>
                      <OptGroup
                        label={intl
                          .get(`sslm.siteInvestigateReport.modal.mange.systemRate`)
                          .d('系统评分')}
                      >
                        <Option value="SYSTEM" key="SYSTEM">
                          {intl
                            .get(`sslm.siteInvestigateReport.model.mange.systemCalculate`)
                            .d('系统计算')}
                        </Option>
                      </OptGroup>
                      <OptGroup
                        label={intl
                          .get(`sslm.siteInvestigateReport.model.mange.manualScoring`)
                          .d('手工评分')}
                      >
                        {indicatorTypeList.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </OptGroup>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24} style={{ display: expand ? 'block' : 'none' }} />
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get(`hzero.common.button.collected`).d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
                loading={loading}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleAttachmentModal({ evalLineId }) {
    const { attachmentVisible } = this.state;
    this.setState({ attachmentVisible: !attachmentVisible, evalLineId });
  }

  // 获取导出参数
  @Bind()
  handleParams() {
    const { form = {} } = this.props;
    const filterValue = filterNullValueObject(form.getFieldsValue()) || {};
    return {
      ...filterValue,
    };
  }

  // 供应商自评指标改变触发
  @Bind()
  handleSupplierEvalFlagChange(e, record) {
    const { dataSource } = this.state;
    const { checked } = e.target;
    const {
      $form: { setFieldsValue: setCurrentFieldsValue },
      parentId,
    } = record;
    // 向子级兼容，同时勾选和取消勾选
    function handleChildrenChecked(data, checkedFlag) {
      data.forEach(i => {
        const { setFieldsValue } = i.$form;
        setFieldsValue({ supplierEvalFlag: checkedFlag });
        if (i.children) {
          handleChildrenChecked(i.children, checkedFlag);
        }
      });
    }
    setCurrentFieldsValue({ supplierEvalFlag: checked });
    if (record.children) {
      handleChildrenChecked(record.children, checked);
    }

    let checkedParentRecord = [];

    // 向上兼容
    function handleParentChecked(data, parentIndicatorId, parentIndicatorRecord = []) {
      const newParentIndicatorRecord = [...parentIndicatorRecord];
      for (const val of data) {
        const { indicatorId: currentIndicatorId } = val;
        if (currentIndicatorId === parentIndicatorId) {
          checkedParentRecord = [...newParentIndicatorRecord, val];
          break;
        }
        if (val.children) {
          newParentIndicatorRecord.push(val);
          handleParentChecked(val.children, parentIndicatorId, newParentIndicatorRecord);
        }
      }
    }

    // 向上兼容勾选祖先级
    if (checked) {
      handleParentChecked(dataSource, parentId);
      checkedParentRecord.forEach(o => {
        const { setFieldsValue } = o.$form;
        setFieldsValue({ supplierEvalFlag: checked });
      });
    }
  }

  /**
   * 指标维护
   * */
  @Bind()
  handleIndicatorMaintain() {
    const { evalHeaderId, onRefresh } = this.props;
    this.indicatorModal = ChoerodonModal.open({
      key: ChoerodonModal.key(),
      title: intl.get('sslm.siteInvestigateReport.view.button.indicatorMaintain').d('指标维护'),
      style: { width: 900 },
      closable: true,
      destroyOnClose: true,
      drawer: true,
      footer: null,
      afterClose: () => {
        this.handleSearch();
        onRefresh();
      },
      children: (
        <IndicatorMaintain
          onRef={ref => {
            this.indicatorMaintain = ref;
          }}
          evalHeaderId={evalHeaderId}
          modal={this.indicatorModal}
        />
      ),
    });
  }

  render() {
    const {
      siteInvestigateReport: { scorerList, scoreStatusList },
      queryScoreInfoLoading,
      scorerLoading,
      queryScoreStatusLoading,
      evalStatus = '',
      isView = false,
      isPub = false,
      customizeTable = () => {},
      needFeedbackFlag,
      averageFlag,
      evalHeaderId,
      linkColor,
      customizeBtnGroup = () => {},
      customizeBtnGroupCode,
      basicInfo,
      siteInvestigateReportRemote,
    } = this.props;
    const {
      evalLineId,
      scorerVisible,
      scoreStatusVisible,
      selectedRows,
      dataSource,
      scoreInfoSelectedRowKeys,
      expandedRowKeys,
      attachmentVisible,
    } = this.state;
    const isEdit =
      ['NEW', 'FEEDBACK', 'FEEDBACK_APPROVALED', 'NEW_APPROVALED'].includes(evalStatus) &&
      !isView &&
      !isPub;

    let loginNameLovParams = {};
    // 中熔电器二开埋点
    if (siteInvestigateReportRemote) {
      const remoteParams = {
        basicInfo,
      };
      const resRemoteParams =
        (siteInvestigateReportRemote &&
          siteInvestigateReportRemote.process(
            'SSLM_SITE_INVESTIGATE_REPORT_CUZ_PARAMS',
            '',
            remoteParams
          )) ||
        [];
      loginNameLovParams = { tenantId, ...resRemoteParams };
    } else {
      loginNameLovParams = { tenantId };
    }

    // 评分信息columns
    const scoreInfoColumns = [
      {
        width: 150,
        dataIndex: 'indicatorCode',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectCode').d('考察项目编码'),
      },
      {
        width: 200,
        dataIndex: 'indicatorName',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectName').d('考察项目名称'),
        onCell: this.onCell,
      },
      {
        width: 100,
        dataIndex: 'scoreTypeMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreWay').d('评分方式'),
      },
      {
        width: 150,
        dataIndex: 'evalStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreCriteria').d('评分标准'),
        onCell: this.onCell,
      },
      {
        width: 150,
        dataIndex: 'indicatorTypeMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectType').d('考察项目类型'),
      },
      {
        width: 120,
        dataIndex: 'supplierEvalFlag',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierEvalFlag')
          .d('供应商自评指标'),
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <FormItem>
              {getFieldDecorator('supplierEvalFlag', {
                initialValue: Number(record.supplierEvalFlag),
              })(
                <Checkbox
                  onChange={e => this.handleSupplierEvalFlagChange(e, record)}
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={
                    !needFeedbackFlag || ![undefined, 'NEW', 'NEW_APPROVALED'].includes(evalStatus)
                  }
                />
              )}
            </FormItem>
          );
        },
      },
      {
        width: 120,
        dataIndex: 'supplierScore',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.supplierScore').d('供应商自评得分'),
      },
      {
        width: 120,
        dataIndex: 'supplierRemarks',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierRemarks')
          .d('供应商自评意见'),
        onCell: this.onCell,
      },
      {
        width: 140,
        dataIndex: 'attachmentUuid',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierAttachement')
          .d('供应商反馈附件'),
        render: val => (
          <Upload
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-report-score"
            attachmentUUID={val}
            filePreview
          />
        ),
      },
      {
        width: 120,
        dataIndex: 'scorer',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人'),
        render: (_, record) => {
          if (record.scoreType !== 'SYSTEM') {
            // 手工评分
            if (!record.childrenCount) {
              // 最下级指标
              if (averageFlag) {
                // 平均式计算
                return record.respUserNameCollect ? (
                  <a onClick={() => this.openScorer(record)}>
                    {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
                  </a>
                ) : (
                  <Tooltip
                    title={intl
                      .get('sslm.siteInvestigateReport.model.tooltip.averageScorer')
                      .d('评分人信息有误，请维护评分人')}
                  >
                    <a onClick={() => this.openScorer(record)} style={{ color: '#F56349' }}>
                      {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
                    </a>
                  </Tooltip>
                );
              } else {
                // 非平均式计算
                return record.respUserNameCollect && record.errorWeightFlag ? (
                  <a onClick={() => this.openScorer(record)}>
                    {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
                  </a>
                ) : (
                  <Tooltip
                    title={intl
                      .get('sslm.siteInvestigateReport.model.tooltip.scorer')
                      .d('评分人信息有误，请维护评分人且评分权重之和为100')}
                  >
                    <a onClick={() => this.openScorer(record)} style={{ color: '#F56349' }}>
                      {intl.get('sslm.siteInvestigateReport.modal.mange.scorer').d('评分人')}
                    </a>
                  </Tooltip>
                );
              }
            } else {
              return null;
            }
          } else {
            // 系统评分
            return intl.get('sslm.siteInvestigateReport.modal.mange.systemRate').d('系统评分');
          }
        },
      },
      {
        width: 120,
        dataIndex: 'completeFlag',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreStatus').d('评分状态'),
        render: (value, record) => {
          if (
            evalStatus === 'NEW' ||
            evalStatus === 'NEW_APPROVALED' ||
            evalStatus === 'NEW_APPROVALING'
          ) {
            return intl.get('sslm.siteInvestigateReport.modal.mange.unScore').d('尚未进行评分');
          }
          if (record.scoreType === 'SYSTEM') {
            return record.processStatusMeaning;
          } else {
            return record.childrenCount ? (
              value ? (
                intl.get('sslm.siteInvestigateReport.modal.mange.completed').d('已完成')
              ) : (
                intl.get('sslm.siteInvestigateReport.modal.mange.unfinished').d('未完成')
              )
            ) : (
              <a onClick={() => this.handleStatus(record)}>
                {value === 1
                  ? intl.get('sslm.siteInvestigateReport.modal.mange.completed').d('已完成')
                  : value === 2
                  ? intl.get(`sslm.siteInvestigateReport.model.mange.back`).d('退回')
                  : intl.get('sslm.siteInvestigateReport.modal.mange.unfinished').d('未完成')}
              </a>
            );
          }
        },
      },
      {
        width: 100,
        dataIndex: 'evalWeight',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.weight').d('权重'),
      },
      {
        width: 120,
        dataIndex: 'finalScore',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
        render: (val, record) => {
          const { kpiEvalTplIndRemind } = record;
          const { remindDesc } = kpiEvalTplIndRemind || {};
          const showIcon = !isNil(val) && !isEmpty(kpiEvalTplIndRemind);
          return (
            <Tooltip title={isEmpty(kpiEvalTplIndRemind) ? '' : remindDesc}>
              <span style={isEmpty(kpiEvalTplIndRemind) ? {} : { color: '#F05434' }}>{val}</span>
              {showIcon && (
                <Icon style={{ margin: '10px 5px', color: '#F05434' }} type="exclamation-circle" />
              )}
            </Tooltip>
          );
        },
      },
      {
        width: 100,
        dataIndex: 'scoreFrom',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreFrom').d('分值从'),
      },
      {
        width: 100,
        dataIndex: 'scoreTo',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreTo').d('分值至'),
      },
      {
        width: 100,
        dataIndex: 'defaultScore',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.defaultScore').d('缺省分值'),
      },
      {
        width: 140,
        dataIndex: 'gradeAttachment',
        title: intl.get('sslm.siteInvestigateReport.modal.common.gradeAttachment').d('评分附件'),
        render: (_, record) => {
          const disabled = [
            'NEW',
            'SYSTEM_PROCESSING',
            'SYSTEM_COMPLETE',
            'SYSTEM_FAIL',
            'MANUAL_EVALUATING',
            'WAITINGREJECTED',
            'FEEDBACK',
            'FEEDBACK_APPROVALED',
            'BACK',
            'NEW_APPROVALED',
            'NEW_APPROVALING',
            'FEEDBACK_APPROVALING',
          ].includes(evalStatus);
          return (
            <a onClick={() => this.handleAttachmentModal(record)} disabled={disabled}>
              <Icon type="paper-clip" />
              {intl.get('hzero.common.upload.view').d('查看附件')}
              {!disabled && (
                <Tag
                  color={linkColor || '#108ee9'}
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                >
                  {record.attCount}
                </Tag>
              )}
            </a>
          );
        },
      },
      {
        width: 150,
        dataIndex: 'respRemarks',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.respRemarks').d('反馈备注'),
        onCell: this.onCell,
      },
    ].filter(Boolean);

    // 评分人columns
    const scorerColumns = [
      {
        dataIndex: 'loginName',
        width: 150,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.scoreUser').d('评分用户'),
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('respUserId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.siteInvestigateReport.modal.scorer.scoreUser')
                        .d('评分用户'),
                    }),
                  },
                ],
                initialValue: record.respUserId,
              })(
                <Lov
                  code="SSLM.KPI_CHOOSE_USER"
                  queryParams={loginNameLovParams}
                  textValue={record.loginName}
                  lovOptions={{
                    displayField: 'loginName',
                    valueField: 'userId',
                  }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({
                      realName: lovRecord.userName,
                      userDepartment: lovRecord.unitName,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        dataIndex: 'realName',
        width: 150,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.userDescribe').d('评分用户描述'),
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('realName', {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      !averageFlag && {
        dataIndex: 'respWeight',
        width: 150,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.weight').d('权重（%）'),
        render: (val, record) =>
          isEdit && ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('respWeight', {
                rules: [
                  {
                    required: !averageFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.siteInvestigateReport.modal.scorer.weight')
                        .d('权重（%）'),
                    }),
                  },
                ],
                initialValue: val,
              })(<InputNumber min={0} disabled={averageFlag} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.siteInvestigateReport.model.docManage.department`).d('部门'),
        dataIndex: 'userDepartment',
        width: 100,
        render: (val, record) => {
          if (!isPub && (record._status === 'update' || record._status === 'create')) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`userDepartment`, {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
    ].filter(Boolean);

    // 评分状态columns
    const scoreStatusColumns = [
      {
        dataIndex: 'loginName',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.account').d('评分人账户'),
      },
      {
        dataIndex: 'realName',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.describe').d('评分人描述'),
      },
      {
        dataIndex: 'respWeight',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.weight').d('权重（%）'),
      },
      {
        dataIndex: 'completeFlag',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.mange.completeFlagMeaning').d('评分状态'),
        render: (_, record) => record.completeFlagMeaning,
      },
      {
        dataIndex: 'defaultScore',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.defaultScore').d('缺省分值'),
      },
      {
        dataIndex: 'isStandard',
        width: 120,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isCriteria').d('符合评分标准'),
        render: yesOrNoRender,
      },
      {
        dataIndex: 'isVeto',
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isVeto').d('否决该项'),
        render: yesOrNoRender,
      },
      {
        dataIndex: 'indOptName',
        title: intl.get('sslm.siteInvestigateReport.model.archiveFilled.indOptName').d('评分选项'),
      },
      {
        dataIndex: 'score',
        width: 80,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.score').d('得分'),
      },
      {
        dataIndex: 'siteLocation',
        width: 200,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.siteLocation').d('现场定位'),
      },
    ];

    // 评分人rowSelection
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.evalLineRespId),
      onChange: this.handleRowSelectChange,
    };

    // 评分信息rowSelection
    const scoreInfoRowSelection = {
      getCheckboxProps: record => ({
        disabled: record.scoreType === 'SYSTEM',
      }),
      selectedRowKeys: scoreInfoSelectedRowKeys,
      onSelect: this.onTableRowSelect,
      onSelectAll: this.onTableRowSelectAll,
    };

    const scrollX = sum(scoreInfoColumns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
          {this.getSearchForm()}
        </Form>
        {isEdit && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            {customizeBtnGroup(
              {
                code: customizeBtnGroupCode,
              },
              [
                <ExcelExportPro
                  data-name="scoreInfoExport"
                  allBody
                  method="POST"
                  buttonText={intl
                    .get('sslm.siteInvestigateReport.view.action.evaluationPersonExport')
                    .d('(新)评分人导出')}
                  templateCode="SRM_C_SRM_SSLM_SITE_EVAL_LINE_RESP_EXPORT"
                  queryParams={this.handleParams()}
                  requestUrl={`${SRM_SSLM}/v1/${tenantId}/site-eval-line-resps/${evalHeaderId}/export`}
                  otherButtonProps={{
                    style: { marginRight: 8 },
                    type: 'h0',
                    funcType: 'flat',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.site-investigate-report.manage.button.newEvalUserExport',
                        type: 'button',
                        meaning: '现场考察报告管理-(新)评分人导出',
                      },
                    ],
                  }}
                />,
                <CommonImport
                  data-name="scoreInfoImport"
                  businessObjectTemplateCode="SSLM.BATCH_IMPORT_SITE_EVAL_LINE_RESP"
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonText={intl
                    .get('sslm.siteInvestigateReport.view.action.newEvaluationPersonImport')
                    .d('(新)评分人导入')}
                  buttonProps={{
                    style: { marginRight: 8 },
                    icon: '',
                    type: 'h0',
                    permissionList: [
                      {
                        code: 'srm.partner.site-investigate-report.manage.button.newEvalUserImport',
                        type: 'button',
                        meaning: '现场考察报告管理-(新)评分人导入',
                      },
                    ],
                  }}
                  args={{ evalHeaderId, tenantId }}
                  successCallBack={() => {
                    this.handleSearch();
                  }}
                />,
                <Button
                  data-name="indicatorMaintain"
                  onClick={this.handleIndicatorMaintain}
                  style={{ marginRight: 8 }}
                >
                  {intl
                    .get('sslm.siteInvestigateReport.view.button.indicatorMaintain')
                    .d('指标维护')}
                </Button>,
                <Button
                  data-name="batchMaintenGrader"
                  disabled={isEmpty(scoreInfoSelectedRowKeys)}
                  onClick={this.handleBatchGrader}
                >
                  {intl
                    .get('sslm.siteInvestigateReport.view.button.batchMaintenGrader')
                    .d('批量维护评分人')}
                </Button>,
              ]
            )}
          </div>
        )}
        {customizeTable(
          {
            code: 'SSLM_SITEINVESTIGATEREPORT.SCOREINFO',
          },
          <EditTable
            bordered
            rowKey="evalLineId"
            dataSource={dataSource}
            columns={scoreInfoColumns}
            loading={queryScoreInfoLoading}
            pagination={false}
            rowSelection={isEdit ? scoreInfoRowSelection : null}
            onChange={this.queryScoreInfo}
            scroll={{ x: scrollX, y: 450 }}
            onExpand={this.onExpand}
            expandedRowKeys={expandedRowKeys}
          />
        )}
        {scorerVisible && (
          <Modal
            title={intl
              .get('sslm.siteInvestigateReport.modal.mange.maintainScoreInfo')
              .d('维护评分人信息')}
            width={700}
            footer={null}
            destroyOnClose
            visible={scorerVisible}
            onCancel={this.openScorer}
          >
            <Spin spinning={scorerLoading || false}>
              {isEdit && (
                <div className="table-list-search" style={{ textAlign: 'right' }}>
                  <Button
                    loading={scorerLoading}
                    disabled={isEmpty(selectedRows)}
                    onClick={this.handleDelete}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                  <Button
                    loading={scorerLoading}
                    onClick={this.handleSave}
                    style={{ margin: '0 8px' }}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  {/* <Button type="primary" onClick={this.handleAdd} loading={scorerLoading}>
                    {intl.get(`hzero.common.button.create`).d('新建')}
                  </Button> */}
                  <LovMultiple
                    isButton
                    type="primary"
                    loading={scorerLoading}
                    code="SSLM.KPI_CHOOSE_USER"
                    changeSelectRows={lovRecords => this.handleMultipleAdd(lovRecords)}
                    originTenantId={tenantId}
                    queryParams={loginNameLovParams}
                    // lovOptions={{ valueField: 'loginName', displayField: 'loginName' }}
                    buttonText={intl.get(`hzero.common.button.create`).d('新建')}
                  />
                </div>
              )}
              {customizeTable(
                {
                  code: 'SSLM_SITEINVESTIGATEREPORT.SCORER_INFO',
                },
                <EditTable
                  bordered
                  rowKey="evalLineRespId"
                  columns={scorerColumns}
                  dataSource={scorerList}
                  pagination={false}
                  rowSelection={isEdit ? rowSelection : null}
                />
              )}
            </Spin>
          </Modal>
        )}
        {scoreStatusVisible && (
          <Modal
            width={800}
            destroyOnClose
            title={intl.get('sslm.siteInvestigateReport.modal.mange.performance').d('评分完成情况')}
            visible={scoreStatusVisible}
            onCancel={this.handleStatus}
            footer={null}
          >
            {customizeTable(
              {
                code: 'SSLM_SITEINVESTIGATEREPORT.SCOREINFO_STATUS',
              },
              <EditTable
                bordered
                pagination={false}
                dataSource={scoreStatusList}
                columns={scoreStatusColumns}
                loading={queryScoreStatusLoading}
              />
            )}
          </Modal>
        )}
        {attachmentVisible && (
          <AttachmentModal
            evalLineId={evalLineId}
            visible={attachmentVisible}
            onCancel={this.handleAttachmentModal}
          />
        )}
      </Fragment>
    );
  }
}
