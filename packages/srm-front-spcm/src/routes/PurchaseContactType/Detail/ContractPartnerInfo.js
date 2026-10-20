/**
 * PurchaseLineInfo - 伙伴类型定义维护
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isEqual } from 'lodash';
import { Form, Input, Button, Select, Tooltip, Icon } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
// const partnerRowKey = 'partnerTypeId';
const partnerRowKey = 'partnerTypeId';
const commonPrompt = 'spcm.purchaseContractType.model';
const defaultMethod = 'DEFAULT';

export default class ContractPartnerInfo extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      onHandleRecord,
      editContractType = false,
      dataSource,
      newEnumMap = {},
      remote,
    } = this.props;
    const { purchaseOrSupplier = [], contactMethod = [] } = newEnumMap;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.porTemplateType`).d('协议伙伴编码'),
        dataIndex: 'partnerTypeCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.capitalLettersOrNumbersr`)
                      .d('协议伙伴编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.porTemplateType`).d('协议伙伴编码'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeCode,
              })(<Input typeCase="upper" disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.partnerTypeName`).d('协议伙伴名称'),
        dataIndex: 'partnerTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`partnerTypeName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.partnerTypeName`).d('协议伙伴名称'),
                    }),
                  },
                ],
                initialValue: record.partnerTypeName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.signKeyword`).d('签署关键字'),
        dataIndex: 'signKeyword',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`signKeyword`, {
                rules: [
                  {
                    // required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.signKeyword`).d('签署关键字'),
                    }),
                  },
                ],
                initialValue: record.signKeyword,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.protocolRemark`).d('协议伙伴说明'),
        dataIndex: 'remark',
        // width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`remark`, {
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.protocolRemark`).d('协议伙伴说明'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(
                <TextArea
                  rows={1}
                  disabled={editContractType}
                  // style={{ height: '20px' }}
                  onChange={() => onHandleRecord(record)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag === 0 ? 0 : 1,
              })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ),
      },
      {
        title: (
          <>
            {intl.get('spcm.purchaseContractType.defaultRoleFlag').d('采购方/供应方')}
            <Tooltip
              placement="top"
              title={intl
                .get('spcm.purchaseContractType.tips.defaultRoleFlag')
                .d(
                  '协议创建时，根据采购方-公司和供应商-供应商标识，带出协议头公司和供应商对应的伙伴行。根据采购方标识，可选择非协议头公司的其他协议采购方伙伴。同理，根据供应商标识，可选择非协议头供应商的其他协议供应商伙伴。注意：修改伙伴行编码，不会清空伙伴行信息'
                )}
            >
              <Icon type="question-circle-o" style={{ verticalAlign: 'unset', marginLeft: 2 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'defaultRoleFlag',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`defaultRoleFlag`, {
                rules: [
                  {
                    validator: (_, value, callback) => {
                      // 校验当前列只存在唯一的采购方和唯一的供应方
                      const arr = dataSource
                        .map((item) => item.$form.getFieldValue('defaultRoleFlag'))
                        .filter((i) => i && i === value && !['2', '3'].includes(value));
                      if (arr.length > 1) {
                        callback(
                          intl
                            .get('spcm.purchaseContractType.check.defaultRoleFlag')
                            .d('不允许勾选重复数据')
                        );
                      }
                      callback();
                    },
                  },
                ],
                initialValue: record.defaultRoleFlag,
              })(
                <Select
                  style={{ width: '100%' }}
                  allowClear
                  disabled={editContractType}
                  onChange={(val) => {
                    setTimeout(() => {
                      dataSource.map((item) =>
                        item.$form.validateFields(['defaultRoleFlag'], { force: true })
                      );
                    }, 0);
                    if (val !== '1') {
                      // 为供应商时或空时，联系信息取值方式：按默认取值方式
                      record.$form.setFieldsValue({ contactMethodCode: defaultMethod });
                    }
                    onHandleRecord(record);
                  }}
                >
                  {purchaseOrSupplier.map((n) => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ),
      },
      {
        title: (
          <>
            {intl.get('spcm.purchaseContractType.model.contactMethodCode').d('联系信息取值方式')}
            <Tooltip
              placement="top"
              title={intl.get('spcm.purchaseContractType.tips.contactMethodCode')
                .d(`说明：供应商伙伴联系信息取自供应商主数据联系人信息；
              当采购方/ 供应商=采购方时，可选伙伴行联系信息（联系人、联系方式、传真、邮箱）取值方式；
              按默认取值方式：协议头采购员为空时，取自公司主数据联系信息，采购员不为空时，取自采购员主数据联系信息；
              按创建人子账户：取联系人子账户名称、手机号码、邮箱；
              按创建人所属员工：取创建人所属员工姓名、手机号、邮箱；`)}
            >
              <Icon type="question-circle-o" style={{ verticalAlign: 'unset', marginLeft: 2 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'contactMethodCode',
        width: 160,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`contactMethodCode`, {
                initialValue: record.contactMethodCode || defaultMethod,
              })(
                <Select
                  style={{ width: '100%' }}
                  // 当采购方/供应商=供应商，或空值时，不可编辑，默认：按默认取值方式
                  disabled={record.$form.getFieldValue('defaultRoleFlag') !== '1'}
                  onChange={() => {
                    onHandleRecord(record);
                  }}
                >
                  {contactMethod.map((n) => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ),
      },
    ];
    return remote
      ? remote.process('SPCM_CONTRACT_TYPE_DETAIL_PARTNER_COLUMNS', columnArray, {
          current: this,
        })
      : columnArray;
  }

  render() {
    const {
      loading,
      onSelectionChange = (e) => e,
      deletingLines,
      onAdd,
      onDelete,
      dataSource = [],
      selectedRows = [],
      editContractType = false,
      quoteFlag = 1,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item[partnerRowKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'partnerType'),
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record[partnerRowKey] && isEqual(quoteFlag, 1), // Column configuration not to be checked
      }),
    };
    const tableProps = {
      pagination: false,
      loading,
      columns,
      dataSource,
      rowSelection,
      rowKey: partnerRowKey,
      bordered: true,
    };
    return (
      <Fragment>
        <Form layout="inline" className={styles['btn-wrapper']}>
          <Button type="primary" onClick={onAdd} disabled={editContractType}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>

          <Button
            onClick={onDelete}
            loading={deletingLines}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
        </Form>
        <EditTable {...tableProps} />
      </Fragment>
    );
  }
}
