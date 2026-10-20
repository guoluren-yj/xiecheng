import React from 'react';
import { Modal, Form, Col, Row, InputNumber, Input, Popover, Button, Spin, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import Switch from 'components/Switch';
// import { getQuotationName } from '@/utils/globalVariable';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import common from '@/routes/sbid/common.less';
import { PRIVATE_BUCKET } from '_utils/config';

const { TextArea } = Input;
const promptCode = `ssrc.expertScoring`;

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class ExpertDetailModal extends React.Component {
  state = {
    attachmentUuid: null, // 头附件
  };

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  handleAfterOpenModal(attachmentUuid) {
    this.setState({
      attachmentUuid,
    });
  }

  feedScoreIndicForm() {
    const {
      scoringRightDeatilHeader,
      form,
      // bidFlag,
      tenantId,
      scoreFlag = false,
      subjectMatterRule,
      sourceFrom,
      customizeForm,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return customizeForm(
      {
        form,
        code: scoreFlag
          ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_BID'
          : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_BID',
        dataSource: scoringRightDeatilHeader,
      },
      <Form>
        <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.sourceNumber`).d('寻源编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceNum', {
                initialValue: scoringRightDeatilHeader.sourceNum,
              })(<span>{scoringRightDeatilHeader.sourceNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.sourceEveitem`).d('寻源事项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceTitle', {
                initialValue: scoringRightDeatilHeader.sourceTitle,
              })(<span>{scoringRightDeatilHeader.sourceTitle}</span>)}
            </FormItem>
          </Col>
          {subjectMatterRule === 'PACK' && (
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.model.expertScoring.sectionNum`).d('标段/包编号')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sectionNum', {
                  initialValue: scoringRightDeatilHeader.sectionNum,
                })(<span>{scoringRightDeatilHeader.sectionNum}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.companyNum`).d('供应商编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyNum', {
                initialValue: scoringRightDeatilHeader.companyNum,
              })(<span>{scoringRightDeatilHeader.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.supplierCompany`).d('供应商名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', {
                initialValue: scoringRightDeatilHeader.companyName,
              })(<span>{scoringRightDeatilHeader.companyName}</span>)}
            </FormItem>
          </Col>
          {subjectMatterRule === 'PACK' && (
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.model.expertScoring.sectionName`).d('标段/包名称')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('sectionName', {
                  initialValue: scoringRightDeatilHeader.sectionName,
                })(<span>{scoringRightDeatilHeader.sectionName}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        {scoreFlag && (
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.expertScoring.suggestInvalid`)
                  .d('是否无效投标')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('suggestInvalidFlag', {
                  initialValue: scoringRightDeatilHeader.suggestInvalidFlag,
                })(<span>{yesOrNoRender(scoringRightDeatilHeader.suggestInvalidFlag)}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.expertScoring.supplierAttachment`)
                  .d('评标附件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('attachmentUuid', {
                  initialValue: scoringRightDeatilHeader.attachmentUuid,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-expert-header"
                    attachmentUUID={scoringRightDeatilHeader.attachmentUuid}
                    tenantId={tenantId}
                    viewOnly
                    filePreview
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {scoreFlag === false && (
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={
                  sourceFrom === 'RFX'
                    ? intl.get(`${promptCode}.model.expertScoring.SugInvalid`).d('建议无效')
                    : intl
                        .get(`${promptCode}.model.expertScoring.sugInvalidTender`)
                        .d('建议无效投标')
                }
              >
                {getFieldDecorator('suggestInvalidFlag', {
                  initialValue: scoringRightDeatilHeader.suggestInvalidFlag,
                })(<Switch />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={
                  sourceFrom === 'RFX'
                    ? intl
                        .get(`${promptCode}.model.expertScoring.ScoreAttachmentUuid`)
                        .d('评分附件')
                    : intl.get(`${promptCode}.model.expertScoring.supplierAttachment`).d('评标附件')
                }
              >
                {getFieldDecorator('attachmentUuid', {
                  initialValue: scoringRightDeatilHeader.attachmentUuid,
                })(
                  <Upload
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-expert-header"
                    attachmentUUID={
                      scoringRightDeatilHeader.attachmentUuid || this.state.attachmentUuid
                    }
                    fileSize={FIlESIZE}
                    tenantId={tenantId}
                    afterOpenUploadModal={this.handleAfterOpenModal}
                    {...ChunkUploadProps}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {scoreFlag === false && (
          <Row gutter={48} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`${promptCode}.model.expertScoring.expertSuggestion`).d('评审意见')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_2}
              >
                {getFieldDecorator('expertSuggestion', {
                  initialValue: scoringRightDeatilHeader.expertSuggestion,
                })(<TextArea style={{ marginLeft: -12 }} rows={2} />)}
              </FormItem>
            </Col>
          </Row>
        )}
        {scoreFlag && (
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.model.expertScoring.expertSuggestion`).d('评审意见')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('expertSuggestion', {
                  initialValue: scoringRightDeatilHeader.expertSuggestion,
                })(<span>{scoringRightDeatilHeader.expertSuggestion}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  // 当前供应商分类表格
  fetchScoreIndic() {
    const {
      scoringRightDeatilLine,
      scoreFlag,
      queryScoringIndicLoading,
      customizeTable,
      code: { detailApprovedStatus = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expertScoring.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 90,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.indicateType`).d('要素类型'),
        dataIndex: 'indicateTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.detail`).d('评分细则'),
        dataIndex: 'detail',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.weight`).d('权重'),
        dataIndex: 'weight',
        width: 80,
        render: (val, record) => (record.weight ? `${record.weight}%` : ''),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.scoreRange`).d('打分区间'),
        dataIndex: 'scoreRange',
        width: 100,
        render: (val, record) =>
          record.indicateType === 'SCORE' ? `[${record.minScore},${record.maxScore}]` : '',
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.teamMeaning`).d('所属组别'),
        dataIndex: 'teamMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.indicScore`).d('得分'),
        dataIndex: 'indicScore',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('indicScore', {
                initialValue: val,
                rules: [
                  {
                    required: record.indicateType !== 'PASS',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expertScoring.indicScore`).d('得分'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={
                    scoreFlag || record.indicateType === 'PASS' || record.calculateType === 'AUTO'
                  }
                  min={record.minScore || 0}
                  max={record.maxScore || 9999999999}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.passStatus`).d('是否通过'),
        dataIndex: 'passStatus',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('passStatus', {
                initialValue: val,
                rules: [
                  {
                    required: record.indicateType !== 'SCORE',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.modal.bidHall.score`).d('是否通过'),
                    }),
                  },
                ],
              })(
                <Select
                  disabled={scoreFlag || record.indicateType === 'SCORE'}
                  allowClear
                  style={{ width: '104px' }}
                >
                  {detailApprovedStatus.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.expertScoring.remark`).d('专家意见'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(<Input disabled={scoreFlag} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return customizeTable(
      {
        code: scoreFlag
          ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_BID'
          : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_BID',
      },
      <EditTable
        bordered
        scroll={{ x: scrollWidth }}
        rowKey="quotationLineId"
        columns={columns}
        dataSource={scoringRightDeatilLine}
        pagination={false}
        loading={queryScoringIndicLoading}
      />
    );
  }

  render() {
    const { save, back, scoreFlag, queryScoringHeaderLoading, saveScoreingLoading } = this.props;
    const anchor = 'right';
    return (
      <Modal
        visible
        width={1020}
        maskClosable
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        onCancel={() => back()}
        footer={[
          <Button key="back" onClick={() => back()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          scoreFlag === false && (
            <Button
              key="submit"
              type="primary"
              loading={saveScoreingLoading}
              onClick={() => save()}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ),
        ]}
        title={intl.get(`${promptCode}.view.message.title.expertScore`).d('专家评分')}
      >
        <Spin spinning={queryScoringHeaderLoading}>
          {this.feedScoreIndicForm()}
          {this.fetchScoreIndic()}
        </Spin>
      </Modal>
    );
  }
}
