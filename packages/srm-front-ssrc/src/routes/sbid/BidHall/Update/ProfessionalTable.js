/**
 * create 创建招标
 * @date: 2019-05-28
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Button, Select } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

import { getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import styles from './index.less';

import { phoneRender } from '@/utils/renderer';

export default class ProfessionalTable extends PureComponent {
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
    const { header = {} } = this.props;
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
      userId,
    } = dataList;

    if (header.bidRuleType === 'NONE') {
      record.$form.setFieldsValue({
        expertName,
        expertId,
        objectVersionNumber,
        loginName,
        expertCategory,
        expertTypeMeaning,
        email,
        phone: mobilephone || telephone,
        expertUserId: userId,
        internationalTelCode: dataList.internationalTelCode,
        internationalTelCodeMeaning: dataList.internationalTelCodeMeaning,
      });
    } else {
      record.$form.setFieldsValue({
        expertName,
        expertId,
        objectVersionNumber,
        loginName,
        expertCategory,
        expertTypeMeaning,
        email,
        team: expertCategory,
        phone: mobilephone || telephone,
        expertUserId: userId,
        internationalTelCode: dataList.internationalTelCode,
        internationalTelCodeMeaning: dataList.internationalTelCodeMeaning,
      });
    }
  }

  /**
   * 选择专家组长 - 每个组只能有一个组长
   *
   * @param {*} e
   * @param {*} [record={}]
   * @param {*} [dataList=[]]
   * @returns
   * @memberof ProfessionalTable
   */
  @Bind()
  changeLeaderFlag(e, record = {}, dataList = []) {
    if (!e.target.checked || !dataList.length) {
      return;
    }

    dataList.forEach((item) => {
      if (item.$form) {
        item.$form.setFieldsValue({
          leaderFlag: 0,
        });
      }
    });

    record.$form.setFieldsValue({
      leaderFlag: e.target.checked,
    });
  }

  /**
   * 选择评标负责人 - 所有专家中只能有一个
   *
   * @param {*} e
   * @param {*} record
   * @param {*} [dataList=[]]
   * @param {string} [type='']
   * @returns
   * @memberof ProfessionalTable
   */
  @Bind()
  changeEvaluateLeaderFlag(e, record, dataList = [], type = '') {
    if (!e.target.checked || !dataList.length) {
      return;
    }

    const clearEvaluateLeaderFlagChecked = (data = []) => {
      if (!data.length) {
        return;
      }
      data.forEach((item) => {
        if (item.$form) {
          item.$form.setFieldsValue({
            evaluateLeaderFlag: 0,
          });
        }
      });
    };

    if (!type) {
      clearEvaluateLeaderFlagChecked(dataList);
    } else if (type === 'BUSINESS') {
      const { scoringTechnologyExpert = [] } = this.props;

      clearEvaluateLeaderFlagChecked(dataList);
      clearEvaluateLeaderFlagChecked(scoringTechnologyExpert);
    } else if (type === 'TECHNOLOGY') {
      const { scoringBusinessExpert = [] } = this.props;

      clearEvaluateLeaderFlagChecked(dataList);
      clearEvaluateLeaderFlagChecked(scoringBusinessExpert);
    } else {
      return;
    }

    record.$form.setFieldsValue({
      evaluateLeaderFlag: e.target.checked,
    });
  }

  /**
   * 渲染不同的table
   *
   * @param {string} [type=""]
   * @param {*} [dataList=[]]
   * @returns
   * @memberof ProfessionalTable
   */
  renderTableList(type = '', dataList = []) {
    const {
      customizeTable,
      loading,
      expertLineSelectedRows,
      saveLoading,
      expertSaveType,
      onSaveExpert,
      onCreateLine,
      onDeleteExpert,
      expertLineRowSelection,
      header,
      expertDuty = [],
      expertTeam = [],
      expertSource = '',
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 240,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              {header.expertSource === 'EXPERT_LIBRARY' ? (
                <div>
                  <Form.Item>
                    {record.$form.getFieldDecorator('loginName', {
                      initialValue: record.loginName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`ssrc.bidHall.model.bidHall.expertSubAccount`)
                              .d('专家子账户'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SSRC.ACCOUNT_EXPERT"
                        textValue={record.loginName}
                        queryParams={{
                          fuzzyQueryFlag: header.bidRuleType !== 'NONE' ? 1 : null,
                          enabledFlag: 1,
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
                    {record.$form.getFieldDecorator('expertUserId', {
                      initialValue: record.expertUserId,
                    })(<div />)}
                  </Form.Item>
                  <Form.Item style={{ display: 'none' }}>
                    {record.$form.getFieldDecorator('expertCategory', {
                      initialValue: record.expertCategory,
                    })(<div />)}
                  </Form.Item>
                </div>
              ) : (
                <div>
                  <Form.Item>
                    {record.$form.getFieldDecorator('loginName', {
                      initialValue: record.loginName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`ssrc.bidHall.model.bidHall.expertSubAccount`)
                              .d('专家子账户'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SSRC.EXPERT_SUB_ACCOUNT"
                        textValue={record.loginName}
                        lovOptions={{
                          displayField: 'loginName',
                          valueField: 'loginName',
                        }}
                        queryParams={{
                          tenantId: getCurrentTenant() && getCurrentTenant().tenantId,
                        }}
                        onChange={(_, lovRecord) => {
                          record.$form.setFieldsValue({
                            expertName: lovRecord.realName,
                            expertTypeMeaning: intl
                              .get(`ssrc.bidHall.model.bidHall.internalExpert`)
                              .d('内部专家'),
                            expertUserId: lovRecord.id,
                            phone: lovRecord.phone,
                            email: lovRecord.email,
                            internationalTelCode: lovRecord.internationalTelCode,
                            internationalTelCodeMeaning: lovRecord.internationalTelCodeMeaning,
                          });
                        }}
                      />
                    )}
                  </Form.Item>
                  <Form.Item style={{ display: 'none' }}>
                    {record.$form.getFieldDecorator('expertUserId', {
                      initialValue: record.expertUserId,
                    })(<div />)}
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
                </div>
              )}
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 200,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('expertName', {
                initialValue: record.expertName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.duty`).d('职责'),
        dataIndex: 'evaluateLeaderFlag',
        width: 240,
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
                        name: intl.get(`ssrc.bidHall.model.bidHall.duty`).d('职责'),
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
        title: intl.get(`ssrc.bidHall.model.bidHall.currentScoringType`).d('本次评分类别'),
        dataIndex: 'team',
        width: 240,
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
                          .get(`ssrc.bidHall.model.bidHall.currentScoringType`)
                          .d('本次评分类别'),
                      }),
                    },
                  ],
                })(
                  <Select style={{ width: '100%' }}>
                    {expertTeam &&
                      expertTeam.map((item) => (
                        <Select.Option
                          value={item.value}
                          key={item.value}
                          disabled={
                            record.$form.getFieldValue('expertCategory') !== item.value &&
                            record.$form.getFieldValue('expertCategory') !==
                              'BUSINESS_TECHNOLOGY' &&
                            expertSource !== 'SUB_ACCOUNT'
                          }
                        >
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
        title: intl.get(`ssrc.bidHall.model.bidHall.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('expertTypeMeaning', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.rfxPhone`).d('联系电话'),
        dataIndex: 'phone',
        width: 130,
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
        title: intl.get(`ssrc.bidHall.model.bidHall.rfxEmail`).d('电子邮箱'),
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
    if (header.bidRuleType === 'NONE') {
      columns.splice(3, 1);
    }

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <span />
          <Form layout="inline">
            <Button type="primary" onClick={() => onCreateLine(type)}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              onClick={() => onSaveExpert(type)}
              loading={expertSaveType === type ? saveLoading : ''}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              onClick={() => onDeleteExpert(type)}
              disabled={expertLineSelectedRows.length === 0}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Form>
        </div>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_EDIT.EXPERT_SCORE',
            dataSource: dataList,
          },
          <EditTable
            bordered
            rowKey="evaluateExpertId"
            loading={loading}
            columns={columns}
            rowSelection={expertLineRowSelection}
            scroll={{ x: scrollX }}
            dataSource={dataList}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { evaluateExpertList = [], header } = this.props;

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this.renderTableList('', evaluateExpertList)}
        {header.bidRuleType !== 'NONE' &&
          this.renderTableList('BUSINESS_TECHNOLOGY', evaluateExpertList)}
      </React.Fragment>
    );
  }
}
