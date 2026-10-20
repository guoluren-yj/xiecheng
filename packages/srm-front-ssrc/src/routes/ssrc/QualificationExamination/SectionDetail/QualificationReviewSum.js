/**
 * QualificationReviewSum - 资格预审汇总
 * @date: 2019-07-31
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Select, Button, Popover, Input, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';

import style from './index.less';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class QualificationReviewSum extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  // componentDidMount() {
  //   this.fetchQualificationSum();
  // }

  /**
   * 资格审查汇总-查询资格审查汇总数据
   */
  @Bind()
  fetchQualificationSum() {
    const {
      dispatch,
      prequalGroupHeaderId,
      organizationId,
      modelName = 'qualificationExamination',
      qualificationExamination: { qualificationHeader = {} },
    } = this.props;
    dispatch({
      type: `${modelName}/fetchQualificationSectionSum`,
      payload: {
        organizationId,
        prequalGroupHeaderId,
        sourceFrom: qualificationHeader.prequalCategory,
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
      prequalGroupHeaderId,
      form = {},
    } = this.props;
    const { selectedRows = [] } = this.state;
    let data = null;

    data = !isEmpty(selectedRows) ? selectedRows : qualificationSum;
    data = data.map((item = {}) => {
      const { supplierCompanyId = null, editEnabled = 0 } = item;
      if (!editEnabled) {
        return;
      }
      return {
        ...item,
        prequalGroupHeaderId,
        currentPreApproveStatus: form.getFieldValue(`${supplierCompanyId}`),
        preRemark: form.getFieldValue(`${supplierCompanyId}#preRemark`),
      };
    });
    return data.filter(Boolean);
  };

  /**
   * 资格审查汇总-保存和提交
   * @param {Number} doFlag 保存0 提交1
   */
  @Bind()
  @Debounce(1200)
  saveSubmitQualificationSectionSum(doFlag) {
    const {
      dispatch,
      modelName = 'qualificationExamination',
      qualificationExamination: { qualificationHeader = {} },
      organizationId,
    } = this.props;

    const preGroupSummaryDTOList = this.generatorOperateData();
    if (isEmpty(preGroupSummaryDTOList)) {
      return;
    }

    dispatch({
      type: `${modelName}/saveSubmitQualificationSectionSum`,
      payload: {
        doFlag,
        organizationId,
        preGroupSummaryDTOList,
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
   * 渲染动态列数据源
   */
  renderDataSource() {
    const {
      qualificationExamination: { qualificationSum = [] },
    } = this.props;
    const sumDataSource =
      qualificationSum &&
      qualificationSum.map((item) => {
        let elementValue = {};
        const { preGroupSummaryDTOList = [], ...otherItem } = item;
        preGroupSummaryDTOList.forEach((elementItem) => {
          elementValue = {
            ...elementValue,
            [elementItem.userId]: item.flagSummary
              ? elementItem.lineApprovedStatusMeaning
              : elementItem.approvalFlagMeaning,
            [`${elementItem.userId}approvedRemark`]: elementItem.approvedRemark,
          };
        });
        return {
          ...otherItem,
          ...elementValue,
        };
      });
    return sumDataSource;
  }

  /**
   * 渲染资格审查汇总页面动态列
   */
  renderColumns() {
    const {
      qualificationExamination: {
        qualificationSum = [],
        code: { approvedStatus = [] },
      },
    } = this.props;
    const columns = [];
    if (!isEmpty(qualificationSum)) {
      let expertColumns = [];
      expertColumns = qualificationSum[0]?.preGroupSummaryDTOList?.map((item) => {
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
          width: 150,
          render: (val) => <Popover content={val}>{val}</Popover>,
        },
        {
          dataIndex: 'currentPreApproveStatus',
          title: intl
            .get(`ssrc.qualiExam.model.qualiExam.qualificationReviewSum`)
            .d('资格审查结果'),
          width: 150,
          render: (val, record) => (
            <React.Fragment>
              <Form.Item className={style['editable-form-height']}>
                {this.props.form.getFieldDecorator(`${record.supplierCompanyId}`, {
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
            </React.Fragment>
          ),
        },
        {
          title: intl.get(`hzero.common.remark`).d('备注'),
          dataIndex: 'preRemark',
          render: (val, record) => (
            <Form.Item className={style['editable-form-height']}>
              {this.props.form.getFieldDecorator(`${record.supplierCompanyId}#preRemark`, {
                initialValue: val,
                rules: [
                  {
                    required:
                      record.currentPreApproveStatus !==
                      this.props.form.getFieldValue(`${record.supplierCompanyId}`),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.remark`).d('备注'),
                    }),
                  },
                ],
              })(!record?.editEnabled ? <span>{val}</span> : <Input />)}
            </Form.Item>
          ),
        },
        ...expertColumns,
      ];
    } else {
      return columns;
    }
  }

  render() {
    const {
      saveLodaing,
      fetchQualificationSumLoading,
      qualificationExamination: { qualificationSum = [] },
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
              onClick={() => this.saveSubmitQualificationSectionSum(0)}
              loading={saveLodaing}
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
              loading={saveLodaing}
              onClick={() => this.saveSubmitQualificationSectionSum(1)}
            >
              {intl.get('ssrc.qualiExam.view.button.saveAndSubmit').d('确认并提交')}
            </Button>
          )}
        </div>
        <Table
          bordered
          loading={fetchQualificationSumLoading}
          columns={this.renderColumns()}
          rowKey="supplierCompanyId"
          dataSource={this.renderDataSource()}
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
      </React.Fragment>
    );
  }
}
