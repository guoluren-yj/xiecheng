/**
 * ScoreInfo -评分信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Radio,
  Icon,
  Checkbox,
  Tooltip,
  Tag,
  Modal,
} from 'hzero-ui';
import { Button as ChoerodonButton } from 'choerodon-ui/pro';
import notification from 'utils/notification';

import intl from 'utils/intl';
import { isNumber, sum, isNull, isEmpty, isArray, difference, uniq, uniqBy, isNil } from 'lodash';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUser,
  getResponse,
} from 'utils/utils';
import { Header } from 'components/Page';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import OptionsSelect from '@/routes/components/OptionsSelect';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'components/Import';
import InputNumberTip from '../common/InputNumberTip';
import TransmitModal from './TransmitModal';

import AttachmentModal from '../common/AttachmentModal';

const organizationId = getCurrentOrganizationId();
const { id } = getCurrentUser();

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  transmitScorerLoading: loading.effects['siteInvestigateReport/transmitScorer'],
  batchCancelLoading: loading.effects['siteInvestigateReport/batchCancel'],
}))
export default class ScoreInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      selectedRows: [],
      selectedRowKeys: [],
      unChooseEvalLineRespIds: [],
      selectAllFlag: false,
      transmitVisible: false,
      weightSameFlag: true, // 判断权重是否一致
      lineRecord: {},
    };
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
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { queryScoreInfo = () => {} } = this.props;
    const { form = {} } = this.props;
    const filterValue = form.getFieldsValue() || {};
    queryScoreInfo({}, filterNullValueObject(filterValue));
  }

  /**
   * 处理表格切换分页
   */
  @Bind()
  handleTableChange(page = {}) {
    const { onChange = () => {} } = this.props;
    const { form = {} } = this.props;
    const filterValue = form.getFieldsValue() || {};
    onChange(page, filterNullValueObject(filterValue));
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
    } = this.props;
    const { expand } = this.state;
    return customizeFilterForm(
      {
        code: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCORE_FILTER', // 单元编码，必传
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
  handleAttachmentModal(record = {}) {
    const { evalLineId } = record || {};
    const { attachmentVisible } = this.state;
    this.setState({ attachmentVisible: !attachmentVisible, evalLineId, lineRecord: record });
  }

  /**
   * 更新行附件数量
   */
  @Bind()
  handleLineFileCount(totalElements) {
    const { lineRecord } = this.state;
    if (!isEmpty(lineRecord) && lineRecord.$form) {
      lineRecord.$form.setFieldsValue({ fileCount: totalElements });
    }
  }

  @Bind()
  getQueryParams() {
    const { form = {} } = this.props;
    const filterValue = form.getFieldsValue() || {};
    return filterNullValueObject(filterValue);
  }

  /**
   * handleSelectChange - 选择列表行
   * @param {object[]} selectedRows - 已选择的行
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    const { dataSource = [] } = this.props;
    const { unChooseEvalLineRespIds, selectAllFlag } = this.state;
    if (selectAllFlag) {
      const Data = dataSource;
      // 处理全选之后取消勾选之后再次勾选
      const filterUnChooseEvalLineRespIds = unChooseEvalLineRespIds.filter(
        item => !selectedRows.includes(item)
      );
      // 获取当前页取消勾选的数据
      const newUnChooseEvalLineRespIds = filterUnChooseEvalLineRespIds.concat(
        difference(Data, selectedRows)
      );
      this.setState({
        unChooseEvalLineRespIds: uniq(newUnChooseEvalLineRespIds),
      });
    }
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 全选按钮处理逻辑
   */
  @Bind()
  handleSelectAll() {
    const { dataSource = [] } = this.props;

    const rowKey = 'evalLineId';

    const { selectAllFlag, selectedRows, selectedRowKeys } = this.state;
    // todo: isArray(dataSource) 解决端侧报filter of undefined问题，未复现
    const newSelectedRows = !selectAllFlag
      ? selectedRows.concat(isArray(dataSource) ? dataSource.filter(i => i.completeFlag !== 4) : [])
      : [];
    const newSelectedRowKeys = !selectAllFlag
      ? selectedRowKeys.concat(newSelectedRows.map(record => record[rowKey]))
      : [];
    this.setState({
      selectAllFlag: !selectAllFlag,
      selectedRows: uniqBy(newSelectedRows, rowKey), // 去重
      selectedRowKeys: uniq(newSelectedRowKeys), // 去重
      unChooseEvalLineRespIds: [],
    });
  }

  // 转交
  @Bind()
  handleTransmit() {
    const { transmitVisible, selectAllFlag, selectedRows, unChooseEvalLineRespIds } = this.state;

    const { dispatch, basicInfo, form = {} } = this.props;
    const { evalHeaderId } = basicInfo;
    const filterValue = form.getFieldsValue() || {};

    if (!transmitVisible) {
      // 非权重式计算
      dispatch({
        type: 'siteInvestigateReport/weightSameJudge',
        payload: {
          evalHeaderId,
          selectAllFlag: selectAllFlag ? 1 : 0,
          evalLineRespIds: selectAllFlag ? [] : selectedRows.map(i => i.evalLineRespId),
          unChooseEvalLineRespIds: unChooseEvalLineRespIds.map(n => n.evalLineRespId),
          ...filterValue, // 查询条件
        },
      }).then(res => {
        if ([false, true].includes(res)) {
          this.setState({ weightSameFlag: res });
        }
      });
    }
    this.setState({ transmitVisible: !transmitVisible });
  }

  // 转交弹框确认回调
  @Bind()
  handleTransmitScorer(siteEvalLineResps) {
    const { selectAllFlag, selectedRows, unChooseEvalLineRespIds } = this.state;
    const { dispatch, basicInfo, form = {}, history } = this.props;
    const filterValue = form.getFieldsValue() || {};
    dispatch({
      type: 'siteInvestigateReport/transmitScorer',
      payload: {
        evalHeaderId: basicInfo.evalHeaderId,
        selectAllFlag: selectAllFlag ? 1 : 0,
        siteEvalLineResps,
        evalLineRespIds: selectAllFlag ? [] : selectedRows.map(i => i.evalLineRespId),
        unChooseEvalLineRespIds: unChooseEvalLineRespIds.map(n => n.evalLineRespId),
        ...filterValue, // 查询条件
      },
    }).then(res => {
      if (res === false) {
        this.handleSearch();
        this.setState({
          transmitVisible: false,
          selectedRows: [],
          selectedRowKeys: [],
          unChooseEvalLineRespIds: [],
          selectAllFlag: false,
          weightSameFlag: true,
        });
      } else if (res === true) {
        history.push('/sslm/site-investigate-report/filling');
        this.setState({
          transmitVisible: false,
          selectedRows: [],
          selectedRowKeys: [],
          unChooseEvalLineRespIds: [],
          selectAllFlag: false,
          weightSameFlag: true,
        });
      }
    });
  }

  /**
   * 放弃评分
   */
  @Bind()
  handleGiveUpScore() {
    Modal.confirm({
      title: intl
        .get('sslm.common.view.message.handleGiveUpScoreConfirm')
        .d('确认对勾选指标放弃评分？'),
      onOk: () => {
        const { selectAllFlag, selectedRows, unChooseEvalLineRespIds } = this.state;
        const { dispatch, basicInfo, form = {}, history } = this.props;
        const filterValue = form.getFieldsValue() || {};
        dispatch({
          type: 'siteInvestigateReport/batchCancel',
          payload: {
            evalHeaderId: basicInfo.evalHeaderId,
            selectAllFlag: selectAllFlag ? 1 : 0,
            evalLineRespIds: selectAllFlag ? [] : selectedRows.map(i => i.evalLineRespId),
            siteEvalLineResps: selectedRows,
            unChooseEvalLineRespIds: unChooseEvalLineRespIds.map(n => n.evalLineRespId),
            ...filterValue, // 查询条件
          },
        }).then(res => {
          const result = getResponse(res);
          if (result) {
            const { allCancelFlag } = result;
            if (allCancelFlag) {
              notification.success();
              this.setState({
                selectedRows: [],
                selectedRowKeys: [],
                unChooseEvalLineRespIds: [],
                selectAllFlag: false,
              });
              history.push('/sslm/site-investigate-report/filling');
            } else {
              notification.success();
              this.setState({
                selectedRows: [],
                selectedRowKeys: [],
                unChooseEvalLineRespIds: [],
                selectAllFlag: false,
              });
              this.handleSearch();
            }
          }
        });
      },
    });
  }

  render() {
    const {
      isPub,
      isEdit,
      loading,
      evalHeaderId,
      customizeTable = () => {},
      dataSource = [],
      pagination = {},
      backReasonFlag = 0,
      transmitScorerLoading,
      scoreEditable,
      averageFlag,
      linkColor,
      basicInfo,
      batchCancelLoading,
      submitUserId,
    } = this.props;
    const {
      evalLineId,
      attachmentVisible,
      selectedRows,
      selectAllFlag,
      selectedRowKeys,
      transmitVisible,
      weightSameFlag,
      lineRecord,
    } = this.state;

    const { abandonFlag = false } = basicInfo;
    const showAbandonFlag = Boolean(abandonFlag);

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
        width: 100,
        dataIndex: 'completeFlagMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.completeFlagMeaning').d('评分状态'),
      },
      {
        width: 150,
        dataIndex: 'evalStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreCriteria').d('评分标准'),
        onCell: this.onCell,
      },
      {
        width: 150,
        dataIndex: 'indicatorType',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.projectType').d('考察项目类型'),
        render: (val, record) => record.indicatorTypeMeaning,
      },
      {
        width: 120,
        dataIndex: 'supplierEvalFlag',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierEvalFlag')
          .d('供应商自评指标'),
        render: (val, record) => {
          const { getFieldDecorator } = record.$form;
          return isEdit && !isPub ? (
            <FormItem>
              {getFieldDecorator('supplierEvalFlag', {
                initialValue: record.supplierEvalFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
            </FormItem>
          ) : (
            val
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
        width: 120,
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
        width: 100,
        dataIndex: 'respWeight',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.weight').d('权重'),
      },
      {
        width: 200,
        dataIndex: 'score',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
        render: (val, record) => {
          const { kpiEvalTplIndRemind } = record;
          const { remindDesc } = kpiEvalTplIndRemind || {};
          const showIcon = !isNil(val) && !isEmpty(kpiEvalTplIndRemind);
          return ['create', 'update'].includes(record._status) &&
            isEdit &&
            !isPub &&
            record.completeFlag !== 4 ? (
            <FormItem style={{ width: '85%' }}>
              {record.$form.getFieldDecorator('score', {
                // rules: [
                //   {
                //     required: record.indicatorType === 'SCORE',
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
                //     }),
                //   },
                // ],
                initialValue: isNull(val) ? record.defaultScore : val,
              })(
                <InputNumberTip
                  isInput
                  value={val}
                  showIcon={showIcon}
                  tooltipFlag={!isEmpty(kpiEvalTplIndRemind)}
                  tooltipTitle={remindDesc}
                  precision={2}
                  min={(rec => rec && rec.scoreFrom)(record)}
                  max={(rec => rec && rec.scoreTo)(record)}
                  disabled={scoreEditable === -1 && record.indicatorType !== 'SCORE'}
                  style={isEmpty(kpiEvalTplIndRemind) ? {} : { color: '#F05434' }}
                />
              )}
            </FormItem>
          ) : (
            record.score
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
        width: 130,
        dataIndex: 'isStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isCriteria').d('符合评分标准'),
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          isEdit &&
          !isPub &&
          record.completeFlag !== 4 ? (
            <FormItem>
              {record.$form.getFieldDecorator('isStandard', {
                initialValue: val,
              })(
                <RadioGroup disabled={record.indicatorType !== 'TICK'} value={val}>
                  <Radio key={1} value={record.indicatorType !== 'TICK' ? '' : 1}>
                    {intl.get('hzero.common.status.yes').d('是')}
                  </Radio>
                  <Radio key={0} value={record.indicatorType !== 'TICK' ? '' : 0}>
                    {intl.get('hzero.common.status.no').d('否')}
                  </Radio>
                </RadioGroup>
              )}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        width: 130,
        dataIndex: 'isVeto',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isVeto').d('否决该项'),
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          isEdit &&
          !isPub &&
          record.completeFlag !== 4 ? (
            <FormItem>
              {record.$form.getFieldDecorator('isVeto', {
                initialValue: val,
              })(
                <RadioGroup disabled={record.indicatorType !== 'VETO'} value={val}>
                  <Radio key={1} value={record.indicatorType !== 'VETO' ? '' : 1}>
                    {intl.get('hzero.common.status.yes').d('是')}
                  </Radio>
                  <Radio key={0} value={record.indicatorType !== 'VETO' ? '' : 0}>
                    {intl.get('hzero.common.status.no').d('否')}
                  </Radio>
                </RadioGroup>
              )}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('sslm.siteInvestigateReport.model.archiveFilled.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 200,
        render: (val, record) => {
          if (
            ['update', 'create'].includes(record._status) &&
            isEdit &&
            !isPub &&
            record.completeFlag !== 4
          ) {
            record.$form.getFieldDecorator('evalTplIndOptId', {
              initialValue: record.evalTplIndOptId,
            });
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('indOptName', { initialValue: val })(
                  <OptionsSelect
                    record={record}
                    lovCode="SSLM.KPI.INDICATOR.OPT.CFG"
                    payload={{
                      evalTplIndId: record.indicatorId,
                      tenantId: organizationId,
                      page: 0,
                      size: 0,
                    }}
                    disabled={record.indicatorType !== 'OPT'}
                    onChange={(_, option = {}) => {
                      const { props: { optionRecord: { value = null, score } = {} } = {} } = option;
                      record.$form.setFieldsValue({ evalTplIndOptId: value, score });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        width: 120,
        dataIndex: 'transformReason',
        title: intl.get('sslm.siteInvestigateReport.modal.common.transformReason').d('转交原因'),
      },
      {
        width: 140,
        dataIndex: 'gradeAttachment',
        title: intl.get('sslm.siteInvestigateReport.modal.common.gradeAttachment').d('评分附件'),
        render: (_, record) => {
          if (
            ['update', 'create'].includes(record._status) &&
            isEdit &&
            !isPub &&
            record.completeFlag !== 4
          ) {
            record.$form.getFieldDecorator('fileCount', {
              initialValue: record.attCount,
            });
            return (
              <a onClick={() => this.handleAttachmentModal(record)}>
                <Icon type="upload" />
                {intl.get('hzero.common.upload.text').d('上传附件')}
                <Tag
                  color={linkColor || '#108ee9'}
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                >
                  {record.$form.getFieldValue('fileCount') || 0}
                </Tag>
              </a>
            );
          } else {
            return (
              <a onClick={() => this.handleAttachmentModal(record)}>
                <Icon
                  type={isEdit && !isPub && record.completeFlag !== 4 ? 'upload' : 'paper-clip'}
                />
                {isEdit && !isPub && record.completeFlag !== 4
                  ? intl.get('hzero.common.upload.text').d('上传附件')
                  : intl.get('hzero.common.upload.view').d('查看附件')}
                <Tag
                  color={linkColor || '#108ee9'}
                  style={{
                    height: 'auto',
                    lineHeight: '15px',
                    marginLeft: '4px',
                  }}
                >
                  {record.attCount || 0}
                </Tag>
              </a>
            );
          }
        },
      },
      {
        width: 150,
        dataIndex: 'respRemarks',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.respRemarks').d('反馈备注'),
        render: (val, record) =>
          ['create', 'update'].includes(record._status) &&
          isEdit &&
          !isPub &&
          record.completeFlag !== 4 ? (
            <FormItem>
              {record.$form.getFieldDecorator('respRemarks', {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
        onCell: this.onCell,
      },
    ];
    if (backReasonFlag) {
      scoreInfoColumns.push({
        title: intl.get(`sslm.siteInvestigateReport.modal.mange.backReason`).d('退回原因'),
        dataIndex: 'backReason',
        width: 120,
      });
    }

    const scrollX = sum(scoreInfoColumns.map(n => (isNumber(n.width) ? n.width : 150))) + 120;

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.handleSelectChange,
      getCheckboxProps: record => ({
        disabled: record.completeFlag === 4, // Column configuration not to be checked
        // name: record.completeFlag,
      }),
    };

    const transmitModalProps = {
      visible: transmitVisible,
      weightSameFlag, // 判断权重是否一致
      currentRespWeight: selectedRows.map(n => n.respWeight)[0], // 当前勾选行权重
      onClose: this.handleTransmit,
      onOk: this.handleTransmitScorer,
      onOkLoading: transmitScorerLoading,
      averageFlag,
    };

    return (
      <Fragment>
        {this.getSearchForm()}
        <Header>
          {isEdit && !isPub && (
            <Fragment>
              <ExcelExportPro
                templateCode="SRM_C_SRM_SSLM_SITE_EVAL_RESP"
                buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                requestUrl={`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${evalHeaderId}/evaluating/export`}
                queryParams={() => this.getQueryParams()}
                otherButtonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                  // permissionList: [
                  //   {
                  //     code: 'srm.mdm.enterprise.srm-org-info.ps.new.purchaseorg.list.export',
                  //     type: 'button',
                  //   },
                  // ],
                }}
              />
              <CommonImport
                data-name="commonImport"
                businessObjectTemplateCode="SSLM.BATCH_IMPORT_SITE_EV_L"
                prefixPatch={SRM_SSLM}
                refreshButton
                buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
                args={{ evalHeaderId }}
                successCallBack={() => {
                  this.handleSearch();
                }}
                buttonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                  // permissionList: [
                  //   {
                  //     code: 'srm.partner.my-partner.search-supplier.ps.invite.import.model',
                  //     type: 'button',
                  //     meaning: '发现供应商-批量邀约',
                  //   },
                  // ],
                }}
              />
              <Tooltip
                title={intl
                  .get('sslm.siteInvestigateReport.view.title.transmitMsg')
                  .d('转交后将无法再对所转交的数据做评分操作')}
              >
                <Button
                  icon="retweet"
                  // loading={allLoading}
                  disabled={isEmpty(selectedRows)}
                  onClick={this.handleTransmit}
                >
                  {intl.get('sslm.common.button.transmit').d('转交')}
                </Button>
              </Tooltip>
              {showAbandonFlag && (
                <Button
                  icon="arrow-left"
                  loading={batchCancelLoading}
                  disabled={isEmpty(selectedRows)}
                  onClick={this.handleGiveUpScore}
                >
                  {intl.get('sslm.common.view.button.giveUpScore').d('放弃评分')}
                </Button>
              )}
            </Fragment>
          )}
        </Header>
        <ChoerodonButton funcType="flat" color="primary" onClick={this.handleSelectAll}>
          {!selectAllFlag
            ? intl.get('hzero.common.button.selectAll').d('全选')
            : intl.get('hzero.common.button.unSelectAll').d('取消全选')}
        </ChoerodonButton>
        {customizeTable(
          {
            code: 'SSLM_SITEINVESTIGATE_FILLING_DETAIL.SCOREINFO',
          },
          <EditTable
            bordered
            rowKey="evalLineId"
            dataSource={dataSource}
            columns={scoreInfoColumns}
            loading={loading}
            scroll={{ x: scrollX, y: 350 }}
            pagination={pagination}
            onChange={page => this.handleTableChange(page)}
            rowSelection={rowSelection}
          />
        )}
        {attachmentVisible && (
          <AttachmentModal
            isPub={isPub}
            isEdit={isEdit && lineRecord.completeFlag !== 4}
            uploadUserId={id}
            submitUserId={submitUserId}
            evalLineId={evalLineId}
            evalHeaderId={evalHeaderId}
            visible={attachmentVisible}
            onCancel={() => this.handleAttachmentModal()}
            updateLineFileCount={this.handleLineFileCount}
          />
        )}
        {transmitVisible && <TransmitModal {...transmitModalProps} />}
      </Fragment>
    );
  }
}
