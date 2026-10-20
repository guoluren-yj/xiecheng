/**
 * ContractBusinessTerms - 业务条款
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
  Tooltip,
  Icon as H0Icon,
} from 'hzero-ui';
import Lov from 'components/Lov';
import { isArray, isEmpty, isEqual } from 'lodash';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const termTypeRowKey = 'termTypeId';
export default class ContractBusinessTerms extends Component {
  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      enumMap = {},
      onHandleRecord,
      enabledFlag = false,
      editContractType = false,
      onFetchTermTypeLovSelect = (e) => e,
    } = this.props;
    const { busTerFlag = [] } = enumMap;
    const columnArray = [
      {
        title: intl.get(`spcm.purchaseContractType.model.termTypeCode`).d('条款编码'),
        dataIndex: 'termTypeCode',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`termTypeCode`, {
                rules: [
                  {
                    pattern: /^[A-Z\d]+$/,
                    message: intl
                      .get(`spcm.purchaseContractType.model.onlyCapitalLettersOrNumber`)
                      .d('条款编码只能由大写字母或数字组成'),
                  },
                  {
                    max: 12,
                    message: intl.get('hzero.common.validation.max', { max: 12 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.purchaseContractType.model.termTypeCode`).d('条款编码'),
                    }),
                  },
                ],
                initialValue: record.termTypeCode,
              })(<Input typeCase="upper" />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.termTypeName`).d('条款名称'),
        dataIndex: 'termTypeName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`termTypeName`, {
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.purchaseContractType.model.termTypeName`).d('条款名称'),
                    }),
                  },
                ],
                initialValue: record.termTypeName,
              })(<Input onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.termType`).d('条款格式'),
        dataIndex: 'termType',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && (
            <FormItem>
              {record.$form.getFieldDecorator(`termType`, {
                rules: [
                  {
                    max: 40,
                    message: intl.get('hzero.common.validation.max', { max: 40 }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.purchaseContractType.model.termType`).d('条款格式'),
                    }),
                  },
                ],
                initialValue: record.termType,
              })(
                <Select
                  style={{ width: '100%' }}
                  allowClear
                  disabled={editContractType}
                  onChange={() => {
                    record.$form.setFieldsValue({
                      termTypeList: [],
                      termTypeLov: undefined,
                      termContentDefault: undefined,
                    });
                    onHandleRecord(record);
                  }}
                >
                  {busTerFlag.map((n) => (
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
        title: intl.get(`spcm.common.model.common.flexCode`).d('值集编码'),
        dataIndex: 'termTypeLov',
        width: 150,
        render: (val, record) => {
          return (
            ['create', 'update'].includes(record._status) && (
              <FormItem>
                {record.$form.getFieldDecorator(`termTypeLov`, {
                  initialValue: val,
                  rules: [
                    {
                      required: record.$form.getFieldValue('termType') === 'LOV',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.common.model.common.flexCode`).d('值集编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPCM.TERM_TYPE_LOV"
                    textValue={record.termTypeLovName}
                    onOk={(item) => {
                      onFetchTermTypeLovSelect(item.lovCode, record, true);
                      onHandleRecord(record);
                    }}
                    onClear={() =>
                      record.$form.setFieldsValue({
                        termTypeList: [],
                        termContentDefault: undefined,
                      })
                    }
                    disabled={record.$form.getFieldValue('termType') !== 'LOV'}
                    queryParams={{ enabledFlag: 1 }}
                  />
                )}
              </FormItem>
            )
          );
        },
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.termContentDefault`).d('业务条款内容默认'),
        dataIndex: 'termContentDefault',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            let Com;
            const businessTermsContentSelectDefaultValues =
              record.$form.getFieldValue('termTypeList') || record.termTypeList || [];
            switch (record.$form.getFieldValue('termType')) {
              case 'VARCAHR':
                Com = (
                  <TextArea
                    rows={1}
                    onChange={() => onHandleRecord(record)}
                    style={{ width: '100%' }}
                  />
                );
                break;
              case 'TEXT':
                Com = (
                  <TextArea
                    rows={1}
                    onChange={() => onHandleRecord(record)}
                    style={{ width: '100%' }}
                  />
                );
                break;
              case 'DECIMAL':
                Com = (
                  <InputNumber
                    style={{ width: '100%' }}
                    max={99999999999999}
                    disabled={editContractType}
                    onChange={() => onHandleRecord(record)}
                  />
                );
                break;
              case 'DATE':
                Com = (
                  <DatePicker
                    style={{ width: '100%' }}
                    onChange={() => onHandleRecord(record)}
                    format={DEFAULT_DATE_FORMAT}
                    disabled={editContractType}
                  />
                );
                break;
              case 'DATETIME':
                Com = (
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    onChange={() => onHandleRecord(record)}
                    placeholder={intl
                      .get(`spcm.common.view.message.timePlaceholder`)
                      .d('请输入时间')}
                    format={DEFAULT_DATETIME_FORMAT}
                    disabled={editContractType}
                  />
                );
                break;
              case 'LOV':
                Com = (
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    allowClear
                    onChange={() => {
                      onHandleRecord(record);
                    }}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {businessTermsContentSelectDefaultValues.length &&
                      businessTermsContentSelectDefaultValues.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                  </Select>
                );
                break;
              default:
                Com = <Input disabled={editContractType} />;
                break;
            }
            const rules = [
              {
                required: false,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get(`spcm.purchaseContractType.model.termContentDefault`)
                    .d('业务条款内容默认'),
                }),
              },
            ];
            if (record.$form.getFieldValue('termType') === 'VARCAHR') {
              rules.push({
                max: 480,
                message: intl.get('hzero.common.validation.max', { max: 480 }),
              });
            } else if (record.$form.getFieldValue('termType') === 'TEXT') {
              rules.push({
                max: 2000,
                message: intl.get('hzero.common.validation.max', { max: 2000 }),
              });
            }
            let initialValue;
            if (record.$form.getFieldValue('termType') === 'DATE') {
              initialValue = record.termContentDefault
                ? moment(record.termContentDefault, DEFAULT_DATE_FORMAT)
                : null;
            } else if (record.$form.getFieldValue('termType') === 'DATETIME') {
              initialValue = record.termContentDefault ? moment(record.termContentDefault) : null;
            } else {
              initialValue = record.termContentDefault;
            }
            return (
              <FormItem>
                {record.$form.getFieldDecorator(`termContentDefault`, {
                  rules,
                  initialValue,
                })(Com)}
              </FormItem>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spcm.purchaseContractType.model.termRemark`).d('条款说明'),
        dataIndex: 'remark',
        width: 150,
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
                      name: intl.get(`spcm.purchaseContractType.model.termRemark`).d('条款说明'),
                    }),
                  },
                ],
                initialValue: record.remark,
              })(
                <TextArea
                  rows={1}
                  onChange={() => onHandleRecord(record)}
                  disabled={editContractType}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.common.model.sortCode`).d('排序码'),
        dataIndex: 'sortCode',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`sortCode`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spcm.common.model.sortCode`).d('排序码'),
                  }),
                },
              ],
              initialValue: record.sortCode,
            })(
              <InputNumber
                step={1}
                precision={0}
                min={0}
                disabled={editContractType}
                onChange={() => onHandleRecord(record)}
              />
            )}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.common.model.nullableFlag`).d('是否必输'),
        dataIndex: 'nullableFlag',
        width: 90,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`nullableFlag`, {
              initialValue: record.nullableFlag === 0 ? 1 : 0,
            })(<Checkbox onChange={() => onHandleRecord(record)} disabled={editContractType} />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`spcm.common.model.reportFlag`).d('是否报表查询'),
        dataIndex: 'reportFlag',
        width: 120,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`reportFlag`, {
              initialValue: record.reportFlag === 1 ? 1 : 0,
            })(<Checkbox disabled={!enabledFlag} onChange={() => onHandleRecord(record)} />)}
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
      {
        title: (
          <>
            {intl.get(`spcm.common.model.importFlag`).d('导入时是否默认带出')}
            <Tooltip
              title={intl
                .get('spcm.common.view.message.contractBusinessTermsImport')
                .d(
                  '协议拟制导入自动带出业务条款行时不会进行必输校验，业务条款行自动带出成功后会在保存或提交时进行必输校验'
                )}
            >
              <H0Icon type="question-circle-o" style={{ verticalAlign: 'unset', marginLeft: 2 }} />
            </Tooltip>
          </>
        ),
        dataIndex: 'importFlag',
        width: 200,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`importFlag`, {
              initialValue: record.importFlag === 1 ? 1 : 0,
            })(<Checkbox disabled={editContractType} onChange={() => onHandleRecord(record)} />)}
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
    const selectedRowKeys = selectedRows.map((item) => item[termTypeRowKey]);
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: (rows, rowKeys) => onSelectionChange(rows, rowKeys, 'termType'),
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record[termTypeRowKey] && isEqual(quoteFlag, 1), // Column configuration not to be checked
      }),
    };
    const tableProps = {
      loading,
      columns,
      pagination,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: termTypeRowKey,
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
