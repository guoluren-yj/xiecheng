import React from 'react';
import { Modal, Form, Col, Row, InputNumber, Input, Popover, Button, Select, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getContentScrollHeight } from '@/utils/utils';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import Switch from 'components/Switch';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import { scoreIntervalRender } from '@/utils/renderer';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import common from '@/routes/sbid/common.less';
// import { getQuotationName } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import style from './index.less';

const { TextArea } = Input;
const promptCode = `ssrc.expertScoring`;

const FormItem = Form.Item;
// const UEDDisplayFormItem = (props) => {
//   const { label, value } = props;
//   return (
//     <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
//       {value}
//     </FormItem>
//   );
// };

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
        code:
          sourceFrom === 'RFI' || sourceFrom === 'RFP'
            ? scoreFlag
              ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI '
              : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI'
            : scoreFlag
            ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX'
            : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
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
                label={
                  sourceFrom === 'RFX'
                    ? intl.get(`${promptCode}.model.expertScoring.Invalid`).d('是否无效')
                    : intl.get(`${promptCode}.model.expertScoring.invalidAnswer`).d('是否无效回复')
                }
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
                  .get(`${promptCode}.model.expertScoring.scoreAttachmentUuid`)
                  .d('评分附件')}
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
                    : sourceFrom === 'BID'
                    ? intl
                        .get(`${promptCode}.model.expertScoring.sugInvalidTender`)
                        .d('建议无效投标')
                    : intl
                        .get(`${promptCode}.model.expertScoring.sugInvalidAnswer`)
                        .d('建议无效回复')
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
                  sourceFrom === 'RFX' || sourceFrom === 'RFI' || sourceFrom === 'RFP'
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
                {getFieldDecorator('expertSuggestion')(
                  <span>{scoringRightDeatilHeader.expertSuggestion}</span>
                )}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  /**
   * 渲染供应商表格数据源
   */
  @Bind()
  renderDataSource(dataSource = []) {
    const arrayItem = [];
    let totalDataSource = {};
    const supplierDataSource = dataSource.map((item) => {
      const { detailEnabledFlag, evaluateScoreLineDetailS = [], ...otherItem } = item;
      const totalContent =
        item.sumPassStatus === 'ALL_PASS'
          ? item.sumPassStatusMeaning || ''
          : item.sumPassStatusMeaning
          ? `${item.sumPassStatusMeaning}${item.approvedCount}/${item.allExpertCount}`
          : '';
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        redFlag: item.sumPassStatus === 'UN_PASS',
        indicScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
      };
      if (detailEnabledFlag) {
        let subtotalDataSource = {};
        const elementItem = evaluateScoreLineDetailS.map((element) => {
          let elementDetail = {};
          const { remark: detail = '', ...other } = element;
          elementDetail = { detail, ...other };
          subtotalDataSource = {
            ...subtotalDataSource,
            indicateNameFlag: 1,
            indicScore: item.indicScore,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
          };
          return elementDetail;
        });
        elementItem.unshift({
          ...otherItem,
          indicateNameFlag: 0,
          weight: otherItem.weight,
          indicateName: otherItem.indicateName,
        });
        elementItem.push(subtotalDataSource);
        return elementItem;
      } else {
        return item;
      }
    });
    supplierDataSource.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    arrayItem.push(totalDataSource);
    return arrayItem;
  }

  /**
   * 渲染供应商打分分数操作
   */
  @Bind()
  renderSupplierScore(record) {
    const {
      scoreFlag,
      scoringRightDeatilLine,
      code: { detailApprovedStatus = [] },
    } = this.props;
    let mean = '';
    const dataSource = this.renderDataSource(scoringRightDeatilLine);
    if (record.indicateType === 'SCORE') {
      mean = (
        <InputNumber
          disabled={scoreFlag || record.calculateType === 'AUTO'}
          min={record.minScore ? record.minScore : 0}
          max={record.maxScore ? record.maxScore : 9999999999}
          style={{ width: '100%' }}
        />
      );
    } else {
      mean = (
        <Select
          disabled={scoreFlag || record.calculateType === 'AUTO'}
          allowClear
          style={{ width: '100%' }}
        >
          {detailApprovedStatus.map((n) => (
            <Select.Option value={n.value} key={n.value}>
              {n.meaning}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return ['update', 'create'].includes(record._status) ? (
      <Form.Item>
        {this.props.form.getFieldDecorator(
          record.bidLineItemId
            ? `indicScore#${record.evaluateIndicId}#${record.bidLineItemId}`
            : `indicScore#${record.evaluateIndicId}#${record.indicateId}`,
          {
            initialValue: record.indicateType === 'SCORE' ? record.indicScore : record.passStatus,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: this.renderSupplierTitle(dataSource),
                }),
              },
            ],
          }
        )(mean)}
      </Form.Item>
    ) : record.indicateType === 'SCORE' ? (
      record.indicScore
    ) : (
      record.passStatus
    );
  }

  /**
   * 计算Table单元格缩进
   *
   * @param {*} val
   * @param {*} record
   * @param {*} info
   * @memberof ExpertDetailModal
   */
  @Bind()
  handleColCalculate(val, record, info) {
    let colSpan = {};
    let mean = '';
    switch (info) {
      case 'indicateName':
        mean =
          !isUndefined(record.indicateNameFlag) && record.indicateNameFlag ? (
            <span style={{ fontWeight: 'bold' }}>{val}</span>
          ) : (
            <span>
              {
                <Popover placement="topLeft" content={val}>
                  {val}
                </Popover>
              }
            </span>
          );
        break;
      case 'indicateRemark':
        mean = (
          <Popover
            placement="topLeft"
            content={val}
            overlayClassName={style['indicateRemark-popover']}
          >
            <span className={style['indicateRemark-span']}>{val}</span>
          </Popover>
        );
        break;
      case 'betweenScore':
        mean =
          record.indicateType === 'SCORE'
            ? scoreIntervalRender(record.minScore, record.maxScore)
            : '';
        break;
      case 'supplierScore':
        mean =
          isUndefined(record.indicateNameFlag) && !record.indicateNameFlag ? (
            this.renderSupplierScore(record)
          ) : (
            <span style={{ fontWeight: 'bold', marginLeft: 8, color: record.redFlag ? 'red' : '' }}>
              {record.indicScore}
            </span>
          );
        break;
      case 'weight':
        mean = record.weight ? `${record.weight}%` : '';
        break;
      default:
        break;
    }
    if (!isUndefined(record.indicateNameFlag)) {
      if (record.indicateNameFlag) {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 2 : info === 'betweenScore' ? 0 : 1,
          },
        };
      } else {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 4 : info === 'weight' ? 1 : 0,
          },
        };
      }
    } else {
      colSpan = {
        children: mean,
      };
    }
    return colSpan;
  }

  renderSupplierTitle = (list) => {
    if (!list || !list.length) {
      return intl.get(`${promptCode}.model.expertScoring.supplierScore`).d('供应商分数');
    }

    switch (list[0].supplierScoreTitle) {
      case 'SCORE':
        return intl.get(`${promptCode}.model.expertScoring.supplierScore`).d('供应商分数');
      case 'SCORE_PASS':
        return `${intl
          .get(`${promptCode}.model.expertScoring.supplierScore`)
          .d('供应商分数')}(${intl
          .get(`${promptCode}.model.expertScoring.passStatus`)
          .d('是否通过')})`;
      case 'PASS':
        return intl.get(`${promptCode}.model.expertScoring.passStatus`).d('是否通过');
      default:
        return intl.get(`${promptCode}.model.expertScoring.supplierScore`).d('供应商分数');
    }
  };

  // 当前供应商分类表格
  fetchScoreIndic() {
    const {
      scoringRightDeatilLine,
      queryScoringIndicLoading,
      customizeTable,
      scoreFlag,
    } = this.props;
    const dataSource = this.renderDataSource(scoringRightDeatilLine);
    const columns = [
      {
        dataIndex: 'indicateName',
        title: intl.get(`${promptCode}.model.expertScoring.elementsItems`).d('要素细项'),
        width: 100,
        render: (val, record) => this.handleColCalculate(val, record, 'indicateName'),
      },
      {
        dataIndex: 'detail',
        title: intl.get(`${promptCode}.model.expertScoring.detail`).d('评分细则'),
        width: 100,
        render: (val, record) => this.handleColCalculate(val, record, 'indicateRemark'),
      },
      {
        dataIndex: 'betweenScore',
        title: intl.get(`${promptCode}.model.expertScoring.betweenScore`).d('评分区间'),
        width: 80,
        render: (val, record) =>
          record.indicateType === 'PASS'
            ? ''
            : this.handleColCalculate(val, record, 'betweenScore'),
      },
      {
        dataIndex: 'supplierScore',
        title: this.renderSupplierTitle(dataSource),
        width: 120,
        render: (val, record) => this.handleColCalculate(val, record, 'supplierScore'),
      },
      {
        dataIndex: 'weight',
        title: intl.get(`${promptCode}.model.expertScoring.weight`).d('权重'),
        width: 80,
        render: (val, record) =>
          record.indicateType === 'PASS' ? '' : this.handleColCalculate(val, record, 'weight'),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return customizeTable(
      {
        code: scoreFlag
          ? 'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX'
          : 'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
      },
      <EditTable
        bordered
        scroll={{ x: scrollWidth, y: getContentScrollHeight() }}
        rowKey="quotationLineId"
        columns={columns}
        dataSource={dataSource || []}
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
