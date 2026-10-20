import { isNumber, sum, isEqual, isNil, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Input, Form, Radio, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import EditTable from 'srm-front-boot/lib/components/EditTable';
import { yesOrNoRender } from 'utils/renderer';
import { getEditTableData, getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import InputNumberTip from '@/routes/SiteInvestigateReport/common/InputNumberTip';
import OptionsSelect from '@/routes/components/OptionsSelect';

const RadioGroup = Radio.Group;

const organizationId = getCurrentOrganizationId();
/**
 * 考评档案填制列表组件
 * @export
 * @class List
 * @extends {Component} - React.Component
 * @reactProps {object} dataSource - table数据源
 * @reactProps {boolean} loading - 加载状态
 * @reactProps {object} pagination - 分页器
 * @reactProps {boolean} visible - modal状态
 * @reactProps {Function} onOk - 关闭Modal的方法
 * @returns React.element
 */
export default class List extends Component {
  /**
   * 处理小数位数问题
   * @param {string} val - table中被选中的行的键组成的数组
   * @param {int} accurate - 精确得小数位数
   */
  @Bind()
  handlePointNumber(val, accurate = 2) {
    const strVal = String(val);
    const pointIndex = strVal.indexOf('.') + 1;
    if (isNaN(Number(val))) {
      return null;
    }
    return pointIndex > 0 ? strVal.slice(0, pointIndex + accurate) : val;
  }

  componentDidMount() {}

  /**
   * 翻页回调
   */
  @Bind()
  handleChange(page = {}) {
    const { onChange = () => {}, dataSource = [], handleScore = () => {} } = this.props;
    const tableValues = getEditTableData(dataSource);
    const newData = tableValues.map(n => {
      const { finalScore, isStandard, isVeto, remark } = n;
      // 填写以后在清除 会由null变为''
      return {
        finalScore,
        isStandard,
        isVeto,
        remark: remark === '' ? null : remark,
      };
    });
    const oldData = dataSource.map(m => {
      const { finalScore, isStandard, isVeto, remark } = m;
      return {
        finalScore,
        isStandard,
        isVeto,
        remark: remark === '' ? null : remark,
      };
    });
    const isChange = isEqual(newData, oldData);

    if (isChange) {
      // 没有变更，直接翻页查数据
      onChange(page);
    } else {
      // 有变更，保存成功传入回调进行翻页查询数据
      handleScore(true, () => onChange(page));
      // Modal.confirm({
      //   title: intl
      //     .get('sslm.common.view.message.continueConfirm')
      //     .d('有数据未保存，翻页会导致数据丢失，是否继续？'),
      //   onOk: () => {
      //     onChange(page);
      //   },
      // });
    }
  }

  @Bind()
  async handleVetoChange(e, recordForm, record) {
    const { fillingDetailRemote } = this.props;
    if (fillingDetailRemote && fillingDetailRemote.event) {
      const eventProps = { e, recordForm, record, finalScoreRef: this.childRef };
      const res = await fillingDetailRemote.event.fireEvent('cuxHandleVetoChange', eventProps);
      if (!res) {
        return false;
      }
    }
  }

  @Bind()
  async handleFinalScoreChange(e, recordForm) {
    const { fillingDetailRemote } = this.props;
    if (fillingDetailRemote && fillingDetailRemote.event) {
      const eventProps = { e, recordForm };
      const res = await fillingDetailRemote.event.fireEvent(
        'cuxHandleFinalScoreChange',
        eventProps
      );
      if (!res) {
        return false;
      }
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

  childRef = null;

  render() {
    const {
      customizeTable,
      dataSource,
      loading,
      evalGranularity,
      pagination,
      // standardChange,
      backReasonFlag,
      rowSelection,
      isEdit,
    } = this.props;

    const isSu = evalGranularity === 'SU';
    const completeColumns = [
      {
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
        fixed: 'left',
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
        fixed: 'left',
      },
      {
        title: intl.get(`sslm.common.view.erpSupplier.name`).d('erp供应商名称'),
        dataIndex: 'erpSupplierName',
        width: 200,
        fixed: 'left',
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreItem`).d('评分细项'),
        dataIndex: 'indicatorName',
        width: 120,
        fixed: 'left',
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreStandard`).d('评分标准'),
        dataIndex: 'evalStandard',
        width: 120,
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.completeFlag`).d('评分状态'),
        dataIndex: 'completeFlagMeaning',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.model.supplierKpiIndicator.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        key: 'indicatorTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.score`).d('得分'),
        dataIndex: 'finalScore',
        width: 200,
        render: (val, record) => {
          const { kpiEvalTplIndRemind, indicatorType } = record;
          const { remindDesc } = kpiEvalTplIndRemind || {};
          const showIcon = !isNil(val) && !isEmpty(kpiEvalTplIndRemind);
          return isEdit &&
            ['update', 'create'].includes(record._status) &&
            record.completeFlag !== 4 ? (
            <Form.Item style={{ width: '85%' }}>
              {record.$form.getFieldDecorator(`finalScore`, {
                initialValue: isNil(val) ? record.defaultScore : val,
                rules: [
                  {
                    validator: (_, value, cb) => {
                      const scoreMin = Number(record.scoreFrom);
                      const scoreMax = Number(record.scoreTo);
                      const score = Number(value);
                      // 打分项校验分数在区间内
                      const flag =
                        ['SCORE'].includes(indicatorType) &&
                        (isNil(value) || score > scoreMax || score < scoreMin);
                      if (flag) {
                        cb(
                          intl
                            .get('sslm.common.view.validation.finalScore')
                            .d('打分必须在分值从和分值至的区间内!')
                        );
                      }
                      cb();
                    },
                  },
                ],
              })(
                <InputNumberTip
                  isInput
                  value={val}
                  showIcon={showIcon}
                  tooltipFlag={!isEmpty(kpiEvalTplIndRemind)}
                  tooltipTitle={remindDesc}
                  onChange={e => this.handleFinalScoreChange(e, record.$form)}
                  step={0.01}
                  // min={(rec => rec && rec.scoreFrom)(record)}
                  // max={(rec => rec && rec.scoreTo)(record)}
                  precision={2}
                  disabled={record.indicatorType && record.indicatorType !== 'SCORE'}
                  style={
                    isEmpty(kpiEvalTplIndRemind)
                      ? { height: 29, padding: '0 1px' }
                      : { height: 29, padding: '0 1px', color: '#F05434' }
                  }
                  ref={ref => this.childRef = ref}
                />
              )}
            </Form.Item>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.indexWeight`).d('指标权重%'),
        dataIndex: 'evalWeight',
        width: 100,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreFrom`).d('分值从'),
        dataIndex: 'scoreFrom',
        width: 80,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.scoreTo`).d('分值至'),
        dataIndex: 'scoreTo',
        width: 80,
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.gradersWeight`).d('评分人权重%'),
        dataIndex: 'respWeight',
        width: 80,
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.isStandard`).d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: (val, record) => {
          return isEdit &&
            ['update', 'create'].includes(record._status) &&
            record.completeFlag !== 4 ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`isStandard`, {
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
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          );
        },
      },
      {
        title: intl.get('sslm.common.model.archiveFilled.isVeto').d('否决该项'),
        dataIndex: 'isVeto',
        width: 120,
        render: (val, record) => {
          return isEdit &&
            ['update', 'create'].includes(record._status) &&
            record.completeFlag !== 4 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('isVeto', {
                initialValue: val,
              })(
                <RadioGroup
                  disabled={record.indicatorType !== 'VETO'}
                  value={val}
                  onChange={e => this.handleVetoChange(e, record.$form, record)}
                >
                  <Radio key={1} value={record.indicatorType !== 'VETO' ? '' : 1}>
                    {intl.get('hzero.common.status.yes').d('是')}
                  </Radio>
                  <Radio key={0} value={record.indicatorType !== 'VETO' ? '' : 0}>
                    {intl.get('hzero.common.status.no').d('否')}
                  </Radio>
                </RadioGroup>
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          );
        },
      },
      {
        title: intl.get('sslm.common.model.archiveFilled.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 200,
        render: (val, record) => {
          if (
            isEdit &&
            ['update', 'create'].includes(record._status) &&
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
                      record.$form.setFieldsValue({ evalTplIndOptId: value, finalScore: score });
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
        title: intl.get(`sslm.common.model.archiveFilled.feedbackRemark`).d('反馈说明'),
        dataIndex: 'remark',
        width: 300,
        render: (val, record) => {
          return isEdit &&
            ['update', 'create'].includes(record._status) &&
            record.completeFlag !== 4 ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: val,
                rules: [
                  {
                    max: 600,
                    message: intl.get('hzero.common.validation.max', {
                      max: 600,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          );
        },
      },
      {
        title: intl.get(`sslm.supplierDocManage.model.docManage.transmitReason`).d('转交原因'),
        dataIndex: 'transformReason',
        width: 150,
        render: val => <Tooltip title={val}>{val}</Tooltip>,
      },
      {
        width: 120,
        dataIndex: 'scorerAttachmentUuid',
        title: intl.get('sslm.common.model.attachment.upload').d('附件上传'),
        render: (val, record) => {
          return isEdit &&
            ['update', 'create'].includes(record._status) &&
            record.completeFlag !== 4 ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`scorerAttachmentUuid`, {
                initialValue: val,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  attachmentUUID={val}
                  filePreview
                  bucketDirectory="sslm-evaluation"
                />
              )}
            </Form.Item>
          ) : (
            <Upload
              viewOnly
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={val}
              filePreview
              bucketDirectory="sslm-evaluation"
            />
          );
        },
      },
    ];
    if (backReasonFlag) {
      completeColumns.push({
        title: intl.get(`sslm.common.model.archiveFilled.backReason`).d('退回原因'),
        dataIndex: 'backReason',
        width: 120,
      });
    }
    if (evalGranularity === 'SU+CA') {
      completeColumns.splice(3, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.purchaseCategory`).d('采购品类'),
        dataIndex: 'categoryName',
        width: 120,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      });
    }
    if (evalGranularity === 'SU+IT') {
      completeColumns.splice(3, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.item`).d('物料'),
        dataIndex: 'itemName',
        width: 120,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      });
    }
    if (evalGranularity === 'RULE_SU') {
      completeColumns.splice(3, 0, {
        title: intl.get(`sslm.common.model.archiveFilled.suppilerRule`).d('供应商规则'),
        dataIndex: 'categoryName',
        width: 120,
        render: val => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      });
    }
    const columns = isSu
      ? completeColumns.filter(
          ({ dataIndex }) => dataIndex !== 'categoryName' || dataIndex !== 'itemName'
        )
      : completeColumns;
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.ARCHIVE_FILLING_DETAIL.LIST_NEW', // 单元编码，必传
      },
      <EditTable
        rowKey="evalDtlId"
        scroll={{ x: scrollX, y: 500 }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        bordered
        loading={loading}
        onChange={this.handleChange}
        rowSelection={rowSelection}
      />
    );
  }
}
