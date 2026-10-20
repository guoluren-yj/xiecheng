/**
 * index - 索赔单类型 - 列表页
 * @date: 2019-11-05
 * @author: wuting <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { sum } from 'lodash';
import React, { Fragment } from 'react';
import { Input, Form, InputNumber, Tooltip, Icon } from 'hzero-ui';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';
import EditTable from 'components/EditTable';
import { delItemToPagination } from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class ClaimTypeList extends React.Component {
  /**
   * 索赔项目定义点击事件
   * @param {*} record
   */
  @Bind()
  linkClick(record) {
    const { showModal, setId } = this.props;
    showModal();
    setId(record);
  }

  /**
   * 清除新建行
   * @param {*} record
   */
  @Bind()
  lineClear(record) {
    const { dispatch, dataSource, pagination } = this.props;
    const newDataSource = [];
    dataSource.forEach((item) => {
      if (item.claimTypeId !== record.claimTypeId) {
        newDataSource.push(item);
      }
    });
    dispatch({
      type: 'claimTypeDefinition/updateState',
      payload: {
        dataSource: newDataSource,
        pagination: delItemToPagination(dataSource.length, pagination),
      },
    });
  }

  /**
   * 渲染索赔项目定义列
   * @param {*} record
   */
  @Bind()
  renderTag(record) {
    return record._status === 'create' ? null : (
      <a onClick={() => this.linkClick(record)}>
        {intl.get(`sqam.common.view.title.claimTypeDef`).d('索赔项目定义')}
      </a>
    );
  }

  render() {
    const {
      loading,
      dataSource,
      selectedRowKeys,
      onRowSelectChange = (e) => e, // 勾选按钮
      changeDefaultFlag,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sqam.common.model.typeNum`).d('索赔类型编码'),
        dataIndex: 'typeNum',
        width: 90,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem record={record}>
              {record.$form.getFieldDecorator(`typeNum`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sqam.common.model.typeNum`).d('索赔类型编码'),
                    }),
                  },
                  {
                    pattern: /^[A-Z]/,
                    message: intl
                      .get(`sqam.common.view.message.startWithLetter`)
                      .d('请以大写英文字母开头'),
                  },
                ],
                initialValue: record.typeNum,
              })(
                <Input
                  typeCase="upper"
                  onChange={() => {
                    record.$form.validateFields(['typeNum'], {
                      force: true,
                    });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sqam.common.model.typeDesc`).d('索赔类型描述'),
        dataIndex: 'typeDesc',
        width: 150,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`typeDesc`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sqam.common.model.typeDesc`).d('索赔类型描述'),
                  }),
                },
              ],
              initialValue: record.typeDesc,
            })(
              <TLEditor
                label={intl.get(`sqam.common.model.typeDesc`).d('索赔类型描述')}
                field="typeDesc"
                token={record._token}
              />
              // <Input
              //   onChange={() => {
              //     record.$form.validateFields(['typeDesc'], {
              //       force: true,
              //     });
              //   }}
              // />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'typeRemark',
        width: 120,
        render: (val, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`typeRemark`, {
              initialValue: record.typeRemark,
            })(<Input />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.allowedStatementTimes`).d('允许申诉次数'),
        dataIndex: 'appealedCount',
        width: 100,
        render: (_, record) => (
          <FormItem record={record}>
            {record.$form.getFieldDecorator(`appealedCount`, {
              initialValue: record.appealedCount,
            })(<InputNumber min={0} allowThousandth />)}
          </FormItem>
        ),
      }, //
      {
        title: (
          <div>
            {intl.get(`sqam.common.model.overDateConfirm`).d('超期自动确认')}&nbsp;&nbsp;
            <Tooltip
              title={intl
                .get(`sqam.common.claimTypeDefinition.tooltip.overDateConfirm`)
                .d(
                  '启用后该类型的索赔单，「要求反馈日期」将变为必填，若到期供应商未进行确认，则系统将自动将单据置为确认状态'
                )}
              placement="rightTop"
            >
              <Icon type="question-circle" />
            </Tooltip>
          </div>
        ),
        dataIndex: 'autoConfirmFlag',
        width: 90,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`autoConfirmFlag`, {
              initialValue: record.autoConfirmFlag === 1 ? 1 : 0,
            })(
              <Tooltip placement="rightTop">
                <Switch
                  defaultChecked={val}
                  onChange={(value) => {
                    record.$form.setFieldsValue({ autoConfirmFlag: value });
                  }}
                />
              </Tooltip>
            )}
          </FormItem>
        ),
      },
      {
        title: (
          <div>
            {intl.get(`sqam.common.model.autoDateConfirm`).d('发布后自动确认')}&nbsp;&nbsp;
            <Tooltip
              title={intl
                .get(`sqam.common.claimTypeDefinition.tooltip.autoDateConfirmTips`)
                .d('索赔单将在发布供应商后对应配置天数自动确认。')}
              placement="rightTop"
            >
              <Icon type="question-circle" />
            </Tooltip>
          </div>
        ),
        dataIndex: 'autoConfirmDays',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`autoConfirmDays`, {
              initialValue: val,
            })(<InputNumber allowThousandth />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.model.defaultFlag`).d('默认'),
        dataIndex: 'defaultFlag',
        width: 55,
        render: (_, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`defaultFlag`, {
              initialValue: record.defaultFlag === 0 ? 0 : 1,
            })(
              <Switch
                disabled={record.$form.getFieldValue('enabledFlag') === 0}
                onChange={() => changeDefaultFlag(record, dataSource, 'claimTypeId')}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 55,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(
              <Switch
                onChange={(value) => {
                  if (value === 0 && record.$form.getFieldValue('defaultFlag') === 1) {
                    record.$form.setFieldsValue({ defaultFlag: 0 });
                  }
                }}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sqam.common.view.title.claimTypeDef`).d('索赔项目定义'),
        dataIndex: 'claimItemDefine',
        width: 90,
        render: (val, record) => this.renderTag(record),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update',
      }),
    };

    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination: false,
      rowSelection,
      bordered: true,
      rowKey: 'claimTypeId',
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 250 };
    return (
      <Fragment>
        <EditTable {...tableProps} />
      </Fragment>
    );
  }
}
