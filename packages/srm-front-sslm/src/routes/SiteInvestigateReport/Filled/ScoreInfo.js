/**
 * ScoreInfo -评分信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Form, Input, Row, Col, Button, Icon, Tag, Checkbox } from 'hzero-ui';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentUser } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import AttachmentModal from '../common/AttachmentModal';

const { id } = getCurrentUser();
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class ScoreInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      attachmentVisible: false,
      evalLineId: null,
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
        code: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCORE_FILTER', // 单元编码，必传
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
  handleAttachmentModal({ evalLineId }) {
    const { attachmentVisible } = this.state;
    this.setState({ attachmentVisible: !attachmentVisible, evalLineId });
  }

  render() {
    const {
      loading,
      customizeTable = () => {},
      dataSource = [],
      onChange = () => {},
      pagination = {},
      linkColor,
      isPub,
      submitUserId,
    } = this.props;
    const { attachmentVisible, evalLineId } = this.state;

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
        width: 100,
        dataIndex: 'completeFlagMeaning',
        title: intl.get('sslm.siteInvestigateReport.modal.mange.scoreStatus').d('评分状态'),
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
        width: 120,
        dataIndex: 'score',
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
      {
        width: 100,
        dataIndex: 'indOptName',
        title: intl.get('sslm.siteInvestigateReport.model.mange.indOptName').d('评分选项'),
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
        render: (_, record) => (
          <a onClick={() => this.handleAttachmentModal(record)}>
            <Icon type="paper-clip" />
            {intl.get('hzero.common.upload.view').d('查看附件')}
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
        ),
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
    ];

    const scrollX = sum(scoreInfoColumns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        <Form layout="inline" className="more-fields-form" style={{ marginBottom: 10 }}>
          {this.getSearchForm()}
        </Form>
        {customizeTable(
          {
            code: 'SSLM_SITEINVESTIGATE_FILLED_DETAIL.SCOREINFO',
          },
          <EditTable
            bordered
            rowKey="evalLineId"
            dataSource={dataSource}
            columns={scoreInfoColumns}
            loading={loading}
            scroll={{ x: scrollX, y: 353.4 }}
            pagination={pagination}
            onChange={page => onChange(page)}
          />
        )}
        {attachmentVisible && (
          <AttachmentModal
            isPub={isPub}
            submitUserId={submitUserId}
            uploadUserId={id}
            evalLineId={evalLineId}
            visible={attachmentVisible}
            onCancel={this.handleAttachmentModal}
          />
        )}
      </Fragment>
    );
  }
}
