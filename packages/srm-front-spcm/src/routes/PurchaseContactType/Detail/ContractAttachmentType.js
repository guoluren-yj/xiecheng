/**
 * ContractAttachmentType - 附件协议
 * @date: 2019-05-27
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isEqual } from 'lodash';
import { Form, Input, Button } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import styles from './index.less';

const commonPrompt = 'spcm.purchaseContractType.model';
const FormItem = Form.Item;
const { TextArea } = Input;
const attachmentKey = 'attachmentTypeId';
export default class ContractAttachmentType extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onHandleRecord, editContractType } = this.props;
    const columnArray = [
      {
        title: intl.get(`${commonPrompt}.attachmentTypeCode`).d('附件类型编码'),
        dataIndex: 'attachmentTypeCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentTypeCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`${commonPrompt}.OnlyCapitalLettersOrNumber`)
                      .d('附件类型编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.attachmentTypeCode`).d('附件类型编码'),
                    }),
                  },
                ],
                initialValue: record.attachmentTypeCode,
              })(<Input typeCase="upper" disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.attachmentTypeName`).d('附件类型名称'),
        dataIndex: 'attachmentTypeName',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`attachmentTypeName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.attachmentTypeName`).d('附件类型名称'),
                    }),
                  },
                ],
                initialValue: record.attachmentTypeName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${commonPrompt}.attachmentRemark`).d('附件类型说明'),
        dataIndex: 'remark',
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
                      name: intl.get(`${commonPrompt}.attachmentRemark`).d('附件类型说明'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(<TextArea rows={1} onChange={() => onHandleRecord(record)} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.attachmentNullableFlag`).d('是否必传'),
        dataIndex: 'nullableFlag',
        width: 100,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`nullableFlag`, {
              initialValue: record.nullableFlag === 0 ? 1 : 0,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.common.model.supAttachmentFlag`).d('供方附件'),
        dataIndex: 'supAttachmentFlag',
        width: 90,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`supAttachmentFlag`, {
              initialValue: record.supAttachmentFlag === 1 ? 1 : 0,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.status.enable`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
    ];
    return columnArray;
  }

  render() {
    const {
      loading,
      onSearch,
      deletingLines,
      onAdd,
      onDelete,
      pagination,
      onSelectionChange = (e) => e,
      dataSource = [],
      selectedRows = [],
      editContractType = false,
      quoteFlag = 1,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item[attachmentKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'attachmentType'),
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record[attachmentKey] && isEqual(quoteFlag, 1), // Column configuration not to be checked
      }),
    };
    const tableProps = {
      editContractType,
      rowKey: attachmentKey,
      loading,
      columns,
      pagination,
      dataSource,
      rowSelection,
      bordered: true,
      onChange: (page) => onSearch(page),
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
