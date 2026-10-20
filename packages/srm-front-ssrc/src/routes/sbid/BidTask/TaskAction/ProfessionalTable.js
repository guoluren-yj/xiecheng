import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { isFunction, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentTenant } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import styles from './index.less';

import { phoneRender } from '@/utils/renderer';

@Form.create({ fieldNameProp: null })
export default class ProfessionalTable extends PureComponent {
  constructor(props) {
    super(props);
    this.rowKey = 'evaluateExpertId';
    this.state = {};
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * updateState
   * 保存以改变的行
   */
  @Bind()
  changeDataSoruce(record, data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        itemLine: data,
      },
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  /**
   * 选择专家
   *
   * @param {*} val
   * @param {*} dataList
   * @param {*} record
   * @memberof ProfessionalTable
   */
  @Bind()
  changeExpert(val, dataList, record) {
    const {
      expertSource,
      match: {
        params: { bidRuleType },
      },
    } = this.props;
    const {
      expertName,
      expertId,
      objectVersionNumber,
      loginName,
      expertCategory,
      expertTypeMeaning,
      mobilephone,
      telephone,
      email,
      realName,
      internationalTelCode,
      internationalTelCodeMeaning,
    } = dataList;

    let expertUserId;

    if (expertSource === 'EXPERT_LIBRARY') {
      const { userId } = dataList;
      expertUserId = userId;
    } else {
      const { id } = dataList;
      expertUserId = id;
    }

    if (bidRuleType === 'NONE') {
      record.$form.setFieldsValue({
        expertName: expertName || realName,
        expertId,
        objectVersionNumber,
        loginName,
        expertCategory,
        expertTypeMeaning,
        email,
        phone: mobilephone || telephone,
        expertUserId,
        internationalTelCode,
        internationalTelCodeMeaning,
      });
    } else {
      record.$form.setFieldsValue({
        expertName: expertName || realName,
        expertId,
        objectVersionNumber,
        loginName,
        expertCategory,
        expertTypeMeaning,
        email,
        team: expertCategory,
        phone: mobilephone || telephone,
        expertUserId,
        internationalTelCode,
        internationalTelCodeMeaning,
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeTable,
      loading,
      saveLoading,
      deleteLoading,
      match: {
        params: { bidRuleType },
      },
      ProfElement,
      ProfRowSelection,
      ProfRowKeys = [],
      onCreateLine,
      onSaveLine,
      onDeleteLine,
      expertDuty = [],
      expertTeam = [],
      expertSource = '', // 专家来源
      // organizationId,
    } = this.props;
    // const { itemViewModalVisible, itemIds } = this.state;
    // 若所选寻源模板中评标步制（即之前的开标步制）为【同时评标】（即之前的同时开标），为columns
    const columns = [
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.loginName`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('loginName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidTask.model.bidTask.loginName`).d('专家子账户'),
                      }),
                    },
                  ],
                  initialValue: record.loginName,
                })(
                  <Lov
                    code={
                      expertSource === 'EXPERT_LIBRARY'
                        ? 'SSRC.ACCOUNT_EXPERT'
                        : 'SSRC.EXPERT_SUB_ACCOUNT'
                    }
                    textValue={record.loginName}
                    queryParams={
                      expertSource === 'EXPERT_LIBRARY'
                        ? {
                            fuzzyQueryFlag: bidRuleType !== 'NONE' ? 1 : null,
                          }
                        : { tenantId: getCurrentTenant() && getCurrentTenant().tenantId }
                    }
                    lovOptions={{
                      displayField: 'loginName',
                      valueField: 'loginName',
                    }}
                    onChange={(value, data) => this.changeExpert(value, data, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('expertId', {
                  initialValue: record.expertId,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('expertCategory', {
                  initialValue: record.expertCategory,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('expertUserId', {
                  initialValue: record.expertUserId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.loginName
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('expertName', {
                initialValue: record.expertName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            record.expertName
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.duty`).d('职责'),
        dataIndex: 'evaluateLeaderFlag',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('evaluateLeaderFlag', {
                  initialValue: val.toString(),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidTask.model.bidTask.duty`).d('职责'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {expertDuty &&
                      expertDuty.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.currentScoringType`).d('本次评分类别'),
        dataIndex: 'team',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('team', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.bidTask.model.bidTask.currentScoringType`)
                          .d('本次评分类别'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {expertTeam &&
                      expertTeam.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('expertTypeMeaning', {
                initialValue: record.expertTypeMeaning,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            record.expertTypeMeaning
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.rfxPhone`).d('联系电话'),
        dataIndex: 'phone',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('phone', {
                  initialValue: record.phone,
                })(
                  <div>
                    {phoneRender(
                      record.$form.getFieldValue('internationalTelCodeMeaning'),
                      record.$form.getFieldValue('phone')
                    )}
                  </div>
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCode', {
                  initialValue: record.internationalTelCode,
                })(<div />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCodeMeaning', {
                  initialValue: record.internationalTelCodeMeaning,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.rfxEmail`).d('电子邮箱'),
        dataIndex: 'email',
        width: 165,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('email', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    if (bidRuleType === 'NONE') {
      columns.splice(3, 1);
    }
    return (
      <React.Fragment>
        {/* 组 */}
        <div className={styles['item-list-search']}>
          <Form layout="inline">
            <Button type="primary" onClick={onCreateLine}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              onClick={onSaveLine}
              disabled={ProfElement ? isEmpty(ProfElement.evaluateExpertList) : true}
              loading={saveLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={onDeleteLine}
              disabled={ProfRowKeys.length === 0}
              loading={deleteLoading}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
            dataSource: ProfElement?.evaluateExpertList,
          },
          <EditTable
            bordered
            rowKey="evaluateExpertId"
            loading={loading}
            columns={columns}
            rowSelection={ProfRowSelection}
            dataSource={ProfElement ? ProfElement.evaluateExpertList : []}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }
}
