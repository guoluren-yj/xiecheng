/**
 * ScoreInfo -评分信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Form, Input, Row, Col, Select, Button, Icon, Tag, Checkbox, Modal } from 'hzero-ui';
import { isArray, isEmpty, isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import ExcelExportPro from 'components/ExcelExportPro';
import AttachmentModal from '../common/AttachmentModal';

const { Option, OptGroup } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const tenantId = getCurrentOrganizationId();

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
      dataSource: [],
      expand: false,
      expandedRowKeys: [],
      allScoreRowKey: [],
      scoreStatusVisible: false,
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryScoreInfo();
    }
  }

  componentDidMount() {
    this.queryScoreInfo();
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
              return { ...items, _status: 'update' };
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

  @Bind()
  handleQueryParams() {
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
    return filterNullValueObject(value);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    this.queryScoreInfo(this.handleQueryParams());
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
      indicatorTypeList = [],
    } = this.props;
    const { expand } = this.state;
    return customizeFilterForm(
      {
        code: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_FILTER', // 单元编码，必传
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
          customizeUnitCode: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_STATUS',
        },
      });
    }
  }

  render() {
    const {
      queryScoreInfoLoading,
      customizeTable,
      evalStatus,
      scoreStatusList,
      queryScoreStatusLoading,
      evalHeaderId,
      linkColor,
    } = this.props;
    const {
      dataSource,
      expandedRowKeys,
      attachmentVisible,
      evalLineId,
      scoreStatusVisible,
    } = this.state;

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
        dataIndex: 'completeFlag',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreStatus').d('评分状态'),
        render: (value, record) => {
          if (evalStatus === 'NEW') {
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
        dataIndex: 'evalWeight',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.weight').d('权重'),
      },
      {
        width: 120,
        dataIndex: 'finalScore',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
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
        width: 120,
        dataIndex: 'isStandard',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isCriteria').d('符合评分标准'),
        render: val => yesOrNoRender(val),
      },
      {
        width: 100,
        dataIndex: 'isVeto',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.isVeto').d('否决该项'),
        render: val => yesOrNoRender(val),
      },
      // {
      //   width: 100,
      //   dataIndex: 'indOptName',
      //   title: intl.get('sslm.siteInvestigateReport.model.archiveFilled.indOptName').d('评分选项'),
      // },
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
            'BACK',
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
      {
        width: 120,
        dataIndex: 'supplierEvalFlag',
        title: intl
          .get('sslm.siteInvestigateReport.modal.mange.supplierEvalFlag')
          .d('供应商自评指标'),
        render: (_val, record) => {
          return (
            <Checkbox
              checkedValue={1}
              unCheckedValue={0}
              disabled
              value={record.supplierEvalFlag || 0}
            />
          );
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
        width: 100,
        title: intl.get('sslm.siteInvestigateReport.model.archiveFilled.indOptName').d('评分选项'),
      },
      {
        dataIndex: 'score',
        width: 80,
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.score').d('得分'),
      },
      {
        dataIndex: 'siteLocation',
        title: intl.get('sslm.siteInvestigateReport.modal.scorer.siteLocation').d('现场定位'),
      },
    ];

    const scrollX = sum(scoreInfoColumns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
          {this.getSearchForm()}
        </Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <ExcelExportPro
            requestUrl={`${SRM_SSLM}/v1/${tenantId}/site-eval-lines/rating-information/${evalHeaderId}/export`}
            queryParams={this.handleQueryParams()}
            templateCode="SRM_C_SRM_SSLM_SITE_EVAL_LINE_RATING_EXPORT"
            buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
            // otherButtonProps={{
            //   permissionList: [
            //     {
            //       code: 'srm.partner.evaluation-manage.result.ps.details.list.export.new',
            //       type: 'button',
            //       meaning: '考评结果明细查询-导出',
            //     },
            //   ],
            // }}
          />
        </div>
        {customizeTable(
          {
            code: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCOREINFO',
          },
          <EditTable
            rowKey="evalLineId"
            bordered
            dataSource={dataSource}
            columns={scoreInfoColumns}
            loading={queryScoreInfoLoading}
            pagination={false}
            scroll={{ x: scrollX, y: 353.4 }}
            onChange={this.queryScoreInfo}
            onExpand={this.onExpand}
            expandedRowKeys={expandedRowKeys}
          />
        )}
        {attachmentVisible && (
          <AttachmentModal
            evalLineId={evalLineId}
            visible={attachmentVisible}
            onCancel={this.handleAttachmentModal}
          />
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
                code: 'SSLM_SITEINVESTIGATE_RESULT_DETAIL.SCORE_STATUS',
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
      </Fragment>
    );
  }
}
