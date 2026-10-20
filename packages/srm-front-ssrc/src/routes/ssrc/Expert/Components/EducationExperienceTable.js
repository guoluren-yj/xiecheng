/**
 * EducationExperienceTable - 教育经历
 * @date: 2019-01-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Form, Button, Input, DatePicker } from 'hzero-ui';
import { isEmpty, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import styles from './index.less';

const promptCode = 'ssrc.expert';

/**
 * 教育经历
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class EducationExperienceTable extends PureComponent {
  constructor(props) {
    super(props);
    const { isReq = true, expertReqId, expertId } = props;
    const dataListName = isReq ? 'educationExperienceReqList' : 'educationExperienceList';
    const rowKey = isReq ? 'expertEducationReqId' : 'expertEducationId';
    const rowKeyValue = isReq ? expertReqId : expertId;
    this.state = {
      selectedRows: [],
      rowKey,
      rowKeyValue,
      dataListName,
    };
  }

  /**
   * 保存选中的行
   * @param {*} selectedRowKeys
   * @param {Array} selectedRows 行数据
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 新建行
   */
  @Bind()
  createRow() {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const oldData = expert[rowKeyValue] ? expert[rowKeyValue][dataListName] : [];
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: [
            {
              [rowKey]: uuidv4(),
              tenantId: getCurrentOrganizationId(),
              _status: 'create', // 新建标记位
            },
            ...oldData,
          ],
        },
      },
    });
  }

  /**
   * 删除新建行
   */
  @Bind()
  deleteRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].filter(
      (item) => item[rowKey] !== record[rowKey]
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 取消编辑行
   */
  @Bind()
  cancelRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) => {
      if (item[rowKey] === record[rowKey]) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 编辑行
   */
  @Bind()
  editRow(record) {
    const { modelName = 'expert' } = this.props;
    const { dispatch, [modelName]: expert = {} } = this.props;
    const { rowKey, dataListName, rowKeyValue } = this.state;
    const newDataList = expert[rowKeyValue][dataListName].map((item) =>
      record[rowKey] === item[rowKey] ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        [rowKeyValue]: {
          ...expert[rowKeyValue],
          [dataListName]: newDataList,
        },
      },
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch, onReload, isReq = true, modelName = 'expert' } = this.props;
    const { selectedRows, rowKey } = this.state;
    const idList = selectedRows.map((o) => o[rowKey]);
    dispatch({
      type: `${modelName}/tableDelete`,
      payload: {
        isReq,
        idList,
        functionName: 'educationExperience',
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
        this.setState({ selectedRows: [] });
      }
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 1;
  }

  render() {
    const { modelName = 'expert', customizeTable = noop, educationTableCode = '' } = this.props;
    const { deleting, isEdit = true, [modelName]: expert = {} } = this.props;
    const { selectedRows, rowKey, dataListName, rowKeyValue } = this.state;
    const dataListIdMap = expert[rowKeyValue] || {};
    const dataList = dataListIdMap[dataListName] || [];
    const dateFormat = getDateFormat();
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expert.startDate`).d('时间从'),
        dataIndex: 'startDate',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('startDate', {
                  initialValue: record.startDate && moment(record.startDate, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={dateFormat}
                    disabledDate={(currentDate) =>
                      getFieldValue('endDate') &&
                      moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.endDate`).d('时间至'),
        dataIndex: 'endDate',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('endDate', {
                  initialValue: record.endDate && moment(record.endDate, getDateFormat()),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={dateFormat}
                    disabledDate={(currentDate) =>
                      getFieldValue('startDate') &&
                      moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return dateRender(val);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.educationInstitution`).d('学校学院或其他机构'),
        dataIndex: 'educationInstitution',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('educationInstitution', {
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                  initialValue: record.educationInstitution,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.educationExperience`).d('教育经历'),
        dataIndex: 'educationExperience',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('educationExperience', {
                  rules: [
                    {
                      max: 100,
                      message: intl.get('hzero.common.validation.max', {
                        max: 100,
                      }),
                    },
                  ],
                  initialValue: record.educationExperience,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.degree`).d('学位'),
        dataIndex: 'degree',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('degree', {
                  rules: [
                    {
                      max: 40,
                      message: intl.get('hzero.common.validation.max', {
                        max: 40,
                      }),
                    },
                  ],
                  initialValue: record.degree,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.certificateLicense`).d('执照、许可或资格'),
        dataIndex: 'certificateLicense',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('certificateLicense', {
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                  initialValue: record.certificateLicense,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.certificateNum`).d('证书编号'),
        dataIndex: 'certificateNum',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('certificateNum', {
                  rules: [
                    {
                      max: 20,
                      message: intl.get('hzero.common.validation.max', {
                        max: 20,
                      }),
                    },
                  ],
                  initialValue: record.certificateNum,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.highestDegree`).d('最高学历'),
        dataIndex: 'highestDegree',
        width: 100,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('highestDegree', {
                  rules: [
                    {
                      max: 40,
                      message: intl.get('hzero.common.validation.max', {
                        max: 40,
                      }),
                    },
                  ],
                  initialValue: record.highestDegree,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
    ];
    if (isEdit) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 75,
        fixed: 'right',
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a
                onClick={() => {
                  this.deleteRow(record);
                }}
              >
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <a
                onClick={() => {
                  this.cancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                onClick={() => {
                  this.editRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      });
    }
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'create',
      }),
    };
    return (
      <React.Fragment>
        {isEdit && (
          <div className={styles['item-list-search']}>
            <Form layout="inline">
              <Button
                type="primary"
                icon="plus"
                style={{ marginRight: 8 }}
                onClick={this.createRow}
              >
                {intl
                  .get(`${promptCode}.view.message.toolTip.educationExperience.create`)
                  .d('新建经历')}
              </Button>
              <Button
                icon="delete"
                loading={deleting}
                style={{ marginRight: 8 }}
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
              >
                {intl
                  .get(`${promptCode}.view.message.toolTip.educationExperience.delete`)
                  .d('删除经历')}
              </Button>
            </Form>
          </div>
        )}
        {customizeTable(
          {
            code: educationTableCode,
          },
          <EditTable
            bordered
            rowKey={rowKey}
            dataSource={dataList}
            columns={columns}
            pagination={false}
            rowSelection={isEdit ? rowSelection : null}
            scroll={{ x: this.scrollWidth(columns, 0) }}
          />
        )}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return connect(({ expert, loading }) => ({
    expert,
    modelName: 'expert',
    deleting: loading.effects['expert/tableDelete'],
  }))(Comp);
};

export default HOCComponent(EducationExperienceTable);

export { HOCComponent, EducationExperienceTable };
