/**
 * 专家详情modal - 初步评审_查看专家(暂不包含招投标)
 * @date: 2020-12-28
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Input, Popover, Button, Select, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { FORM_COL_2_LAYOUT } from 'utils/constants';

import common from '@/routes/sbid/common.less';

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
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  feedScoreIndicForm() {
    const {
      scoringRightDeatilHeader,
      form,
      scoreFlag = false,
      customizeForm,
      reviewScoredStatus,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return customizeForm(
      {
        form,
        code:
          reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_EDIT',
        dataSource: scoringRightDeatilHeader,
      },
      <Form layout="vertical">
        <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col span={12}>
            <FormItem label={intl.get(`${promptCode}.model.expertScoring.sourceNum`).d('寻源单号')}>
              {getFieldDecorator('sourceNum', {
                initialValue: scoringRightDeatilHeader.sourceNum,
              })(<span>{scoringRightDeatilHeader.sourceNum}</span>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.sourceEveitem`).d('寻源事项')}
            >
              {getFieldDecorator('sourceTitle', {
                initialValue: scoringRightDeatilHeader.sourceTitle,
              })(<span>{scoringRightDeatilHeader.sourceTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
          <Col span={12}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.companyNum`).d('供应商编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: scoringRightDeatilHeader.companyNum,
              })(<span>{scoringRightDeatilHeader.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.supplierCompany`).d('供应商名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: scoringRightDeatilHeader.companyName,
              })(<span>{scoringRightDeatilHeader.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        {!scoreFlag && (
          <Row gutter={48} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.expertScoring.approveSuggestion`)
                  .d('审批意见')}
              >
                {getFieldDecorator('reviewExpertSuggestion', {
                  initialValue: scoringRightDeatilHeader.reviewExpertSuggestion,
                })(<TextArea style={{ marginLeft: -12 }} rows={2} />)}
              </FormItem>
            </Col>
          </Row>
        )}
        {scoreFlag && (
          <Row gutter={64} className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
            <Col span={24}>
              <FormItem
                label={intl
                  .get(`${promptCode}.model.expertScoring.approveSuggestion`)
                  .d('审批意见')}
              >
                {getFieldDecorator('reviewExpertSuggestion', {
                  initialValue: scoringRightDeatilHeader.reviewExpertSuggestion,
                })(<span>{scoringRightDeatilHeader.reviewExpertSuggestion}</span>)}
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
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        indicScore: item.reviewResultMeaning,
        indicateName: intl.get('ssrc.expertScoring.view.message.reviewResult').d('评审结果'),
      };
      if (detailEnabledFlag) {
        // 二级要素 =》flag=1
        let subtotalDataSource = {};
        const elementItem = evaluateScoreLineDetailS.map((element) => {
          let elementDetail = {};
          const { remark: detail = '', ...other } = element;
          elementDetail = { detail, ...other };
          subtotalDataSource = {
            ...subtotalDataSource,
            indicateNameFlag: 1,
            indicScore: item.reviewResultMeaning,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
          };
          return elementDetail;
        });
        elementItem.unshift({
          indicateNameFlag: 0,
          indicateName: otherItem.indicateName,
        });
        elementItem.push(subtotalDataSource);
        return elementItem;
      } else {
        // 二级要素 =》flag=0
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
      code: { detailApprovedStatus = [] },
    } = this.props;
    const mean = (
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
    return ['update', 'create'].includes(record._status) ? (
      <Form.Item>
        {this.props.form.getFieldDecorator(
          record.bidLineItemId
            ? `indicScore#${record.evaluateIndicId}#${record.bidLineItemId}`
            : `indicScore#${record.evaluateIndicId}#${record.indicateId}`,
          {
            initialValue: record.passStatus,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`${promptCode}.model.expertScoring.supplierPassedFlag`)
                    .d('供应商是否通过'),
                }),
              },
            ],
          }
        )(mean)}
      </Form.Item>
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
          <Popover placement="topLeft" content={val}>
            {val}
          </Popover>
        );
        break;
      case 'supplierScore':
        mean =
          isUndefined(record.indicateNameFlag) && !record.indicateNameFlag ? (
            this.renderSupplierScore(record)
          ) : (
            <span style={{ fontWeight: 'bold', marginLeft: 8 }}>{record.indicScore}</span>
          );
        break;
      default:
        break;
    }
    if (!isUndefined(record.indicateNameFlag)) {
      if (record.indicateNameFlag) {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 2 : info === 'supplierScore' ? 1 : 0,
          },
        };
      } else {
        colSpan = {
          children: mean,
          props: {
            colSpan: info === 'indicateName' ? 3 : 0,
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

  // 当前供应商分类表格
  fetchScoreIndic() {
    const {
      scoringRightDeatilLine,
      queryScoringIndicLoading,
      customizeTable,
      reviewScoredStatus,
    } = this.props;
    const columns = [
      {
        dataIndex: 'indicateName',
        title: intl.get(`${promptCode}.model.expertScoring.elementsItems`).d('要素细项'),
        width: 150,
        render: (val, record) => this.handleColCalculate(val, record, 'indicateName'),
      },
      {
        dataIndex: 'detail',
        title: intl.get(`${promptCode}.model.expertScoring.detail`).d('评分细则'),
        width: 150,
        render: (val, record) => this.handleColCalculate(val, record, 'indicateRemark'),
      },
      {
        dataIndex: 'supplierScore',
        width: 120,
        title: intl.get(`${promptCode}.model.expertScoring.passedFlag`).d('是否通过'),
        render: (val, record) => this.handleColCalculate(val, record, 'supplierScore'),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return customizeTable(
      {
        code:
          reviewScoredStatus === 'SCORED'
            ? 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_DETAIL'
            : 'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_EDIT',
      },
      <EditTable
        bordered
        scroll={{ x: scrollWidth }}
        rowKey="quotationLineId"
        columns={columns}
        dataSource={this.renderDataSource(scoringRightDeatilLine) || []}
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
        width={750}
        maskClosable
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        onCancel={() => back()}
        footer={[
          <Button key="back" onClick={() => back()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          !scoreFlag && (
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
        title={intl.get(`${promptCode}.view.message.title.initialReview`).d('符合性检查')}
      >
        <Spin spinning={queryScoringHeaderLoading}>
          {this.feedScoreIndicForm()}
          {this.fetchScoreIndic()}
        </Spin>
      </Modal>
    );
  }
}
