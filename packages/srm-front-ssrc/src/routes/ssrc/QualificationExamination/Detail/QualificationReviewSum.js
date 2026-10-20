/**
 * QualificationReviewSum - 资格预审汇总
 * @date: 2019-07-31
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Select, Button, Popover, Input, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';

import style from './index.less';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
class QualificationReviewSum extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  /**
   * 资格审查汇总-查询资格审查汇总数据
   */
  @Bind()
  fetchQualificationSum() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      prequalHeaderId,
      organizationId,
      qualificationExamination: { qualificationHeader = {} },
    } = this.props;
    dispatch({
      type: `${modelName}/fetchQualificationSum`,
      payload: {
        organizationId,
        prequalHeaderId,
        sourceFrom: qualificationHeader.prequalCategory,
        customizeUnitCode: 'SSRC_PREQUAL.QUALIFICATION_REVIEWSUM',
      },
    });
  }

  /**
   * 修改勾选行
   */
  @Bind()
  handleChangeSelectedRows(selectedRowKeys = [], selectedRows = []) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  generatorOperateData = () => {
    const {
      qualificationExamination: { qualificationSum = [] },
    } = this.props;
    const { selectedRows = [] } = this.state;
    let data = null;

    if (!isEmpty(selectedRows)) {
      data = getEditTableData(selectedRows);
    } else {
      data = qualificationSum.filter((item = {}) => item?.editEnabled);
      data = getEditTableData(data);
    }
    return data.filter(Boolean);
  };

  /**
   * 资格审查汇总-保存和提交
   * @param {Number} doFlag 保存0 提交1
   */
  @Bind()
  @Debounce(1200)
  saveSubmitQualificationSum(doFlag) {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      qualificationExamination: { qualificationHeader = {} },
      organizationId,
    } = this.props;
    const preSummaryDTOList = this.generatorOperateData();
    if (isEmpty(preSummaryDTOList)) {
      return;
    }

    dispatch({
      type: `${modelName}/saveSubmitQualificationSum`,
      payload: {
        doFlag,
        preSummaryDTOList,
        organizationId,
        sourceFrom: qualificationHeader?.prequalCategory,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleChangeSelectedRows();
        this.fetchQualificationSum();
      }
    });
  }

  /**
   * 渲染资格审查汇总页面动态列
   */
  renderColumns() {
    const {
      qualificationExamination: {
        qualificationSum = [],
        code: { approvedStatus = [] },
        qualificationSumDTO,
      },
    } = this.props;
    const columns = [];

    if (!isEmpty(qualificationSum)) {
      let expertColumns = [];
      expertColumns = qualificationSumDTO.map((item) => {
        return {
          dataIndex: `${item.userId}`,
          title: `${item.realName}`,
          width: 150,
          render: (val, record) => {
            if (record.flagSummary && record[`${item.userId}approvedRemark`]) {
              return (
                <Popover content={record[`${item.userId}approvedRemark`]}>
                  {val}
                  <Icon type="info-circle-o" style={{ fontSize: 14, color: '#08c' }} />
                </Popover>
              );
            } else {
              return val;
            }
          },
        };
      });
      return [
        {
          dataIndex: 'supplierCompanyName',
          title: intl.get(`ssrc.qualiExam.model.qualiExam.supplierName`).d('供应商名称'),
          width: 200,
          fixed: 'left',
          render: (val) => <Popover content={val}>{val}</Popover>,
        },
        {
          dataIndex: 'currentPreApproveStatus',
          title: intl
            .get(`ssrc.qualiExam.model.qualiExam.qualificationReviewSum`)
            .d('资格审查结果'),
          width: 180,
          fixed: 'left',
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <Form.Item className={style['editable-form-height']}>
                {record.$form.getFieldDecorator('currentPreApproveStatus', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.qualiExam.model.qualiExam.qualificationReviewSum`)
                          .d('资格审查结果'),
                      }),
                    },
                  ],
                })(
                  !record?.editEnabled ? (
                    <span>{record.currentPreApproveStatusMeaning}</span>
                  ) : (
                    <Select style={{ width: '90%' }}>
                      {approvedStatus &&
                        approvedStatus.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )
                )}
              </Form.Item>
            ) : (
              <span>{record.currentPreApproveStatusMeaning}</span>
            ),
        },
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'preRemark',
          width: 150,
          fixed: 'left',
          render: (val, record) => {
            return ['update', 'create'].includes(record._status) ? (
              <Form.Item className={style['editable-form-height']}>
                {record.$form.getFieldDecorator('preRemark', {
                  initialValue: val,
                  rules: [
                    {
                      required:
                        record.currentPreApproveStatus !==
                          record.$form.getFieldValue('currentPreApproveStatus') &&
                        !record?.editEnabled,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.remark`).d('备注'),
                      }),
                    },
                  ],
                })(!record?.editEnabled ? <span>{val}</span> : <Input />)}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        ...expertColumns,
      ];
    } else {
      return columns;
    }
  }

  render() {
    const {
      fetchQualificationSumLoading,
      qualificationExamination: { qualificationSum = [] },
      customizeTable,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const disableEditorFlag =
      isEmpty(qualificationSum) || qualificationSum.every((item = {}) => item?.editEnabled !== 1);

    return (
      <React.Fragment>
        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
          {disableEditorFlag ? (
            ''
          ) : (
            <Button
              disabled={disableEditorFlag}
              onClick={() => this.saveSubmitQualificationSum(0)}
              style={{ marginRight: '8px' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}

          {disableEditorFlag ? (
            ''
          ) : (
            <Button
              disabled={disableEditorFlag}
              type="primary"
              onClick={() => this.saveSubmitQualificationSum(1)}
            >
              {intl.get('ssrc.qualiExam.view.button.saveAndSubmit').d('确认并提交')}
            </Button>
          )}
        </div>
        {customizeTable(
          {
            code: 'SSRC_PREQUAL.QUALIFICATION_REVIEWSUM',
          },
          <EditTable
            bordered
            loading={fetchQualificationSumLoading}
            columns={this.renderColumns()}
            rowKey="quotationHeaderId"
            dataSource={qualificationSum}
            pagination={false}
            rowSelection={
              disableEditorFlag
                ? false
                : {
                    selectedRowKeys,
                    onChange: this.handleChangeSelectedRows,
                    getCheckboxProps: (record = {}) => ({
                      disabled: !record?.editEnabled,
                    }),
                  }
            }
          />
        )}
      </React.Fragment>
    );
  }
}

export default QualificationReviewSum;
