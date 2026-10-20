/**
 * PurchaseLineInfo - 协议阶段定义维护
 * @date: 2019-12-08
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isEqual } from 'lodash';
import { Form, Input, Button, Tooltip, Icon } from 'hzero-ui';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const stageRowKey = 'pcStageId';
export default class ContractStageInfo extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { onHandleRecord, editContractType = false, remote } = this.props;
    const columnArray = [
      {
        title: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
        dataIndex: 'stageCode',
        width: 165,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`stageCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl.get(`spcm.common.view.message.capitalLettersOrNumbersOnly`, {
                      fieldName: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
                    }),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.purchaseContractType.model.stageCode`).d('阶段编码'),
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
        title: intl.get(`spcm.purchaseContractType.model.stageName`).d('阶段名称'),
        dataIndex: 'stageName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`stageName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.purchaseContractType.model.stageName`).d('阶段名称'),
                    }),
                  },
                ],
                initialValue: record.stageName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
        dataIndex: 'prepaymentStage',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`prepaymentStage`, {
                initialValue: record.prepaymentStage,
              })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ),
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.stageRemark`).d('阶段说明'),
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
                      name: intl.get(`spcm.purchaseContractType.model.stageRemark`).d('阶段说明'),
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
            {intl.get('spcm.purchaseContractType.model.notDefaultFlag').d('备用阶段')}
            <Tooltip
              title={intl
                .get('spcm.common.view.message.notDefaultFlagTips')
                .d('控制协议新建时是否自动带出该阶段，勾选则不自动带出。')}
            >
              <Icon type="question-circle-o" style={{ verticalAlign: 'unset', marginLeft: 2 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'notDefaultFlag',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator('notDefaultFlag', {
                initialValue: record.notDefaultFlag === '1' ? 1 : 0,
              })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ),
      },
    ];
    return remote
      ? remote.process('SPCM_CONTRACT_TYPE_DETAIL_COLUMNS', columnArray, {
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
      onSearch,
      dataSource = [],
      selectedRows = [],
      editContractType = false,
      quoteFlag = 1,
      pagination,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item[stageRowKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'stageType'),
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record[stageRowKey] && isEqual(quoteFlag, 1), // Column configuration not to be checked
      }),
    };
    const tableProps = {
      pagination,
      loading,
      columns,
      dataSource,
      rowSelection,
      rowKey: stageRowKey,
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
