/*
 * SAPTableList - 价格信息导入SAP表格
 * @date: 2020-3-10
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, InputNumber, Input, Select, DatePicker, Popover } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import Lov from 'components/Lov';
// import EditTable from 'components/EditTable';
import EditTable from '_components/EditTable';
import { isUndefined } from 'lodash';
import { Button } from 'components/Permission';
import { numberRender, dateRender, yesOrNoRender } from 'utils/renderer';
import { getDateFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';

// import Style from './index.less';

const { Option } = Select;
const promptCode = 'ssrc.searchResultImport';
const { TextArea } = Input;

export default class SAPTable extends Component {
  render() {
    const {
      code,
      resultsList,
      pagination,
      Loading,
      resultImportRowSelection,
      handleSearch,
      scrollWidth,
      organizationId,
      changeOuId,
      changeInvOrganization,
      onDetail,
      viewLadderLevelModal,
      customizeTable,
      editRow,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.searchResImt.syncStatus`).d('导入状态'),
        dataIndex: 'syncStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.erpNumber`).d('采购信息记录编号'),
        dataIndex: 'erpNumber',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.syncResponseMsg`).d('反馈信息'),
        dataIndex: 'syncResponseMsg',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentNameGroup`).d('采购组'),
        dataIndex: 'purchaseAgentName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' &&
          !val ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaseAgentId', {
                initialValue: record.purchaseAgentId,
              })(<Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" textValue={record.purchaseAgentName} />)}
            </Form.Item>
          ) : (
            record.purchaseAgentName
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.purOrgCode`).d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 140,
        render: (val, record) => {
          if (
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED' &&
            !val
          ) {
            const form = record.$form;
            // 供应商改变，给相应的来源外部系统赋值
            const onChangePurOrganizationCode = (_, value) => {
              form.setFieldsValue({
                purOrganizationName: value.organizationName,
                purOrganizationId: value.purchaseOrgId,
                purchaseOrgId: value.purchaseOrgId,
              });
            };
            return (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('purchaseOrgId', {
                    initialValue: record.purchaseOrgId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_ORG"
                      onChange={onChangePurOrganizationCode}
                      textValue={record.purOrganizationCode}
                    />
                  )}
                  {record.$form.getFieldDecorator('purOrganizationId', {
                    initialValue: record.purOrganizationId,
                  })}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return record.purOrganizationCode;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.purOrgName`).d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purOrganizationName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ouId', {
                initialValue: record.ouId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.OU"
                  textField="ouName"
                  onChange={(value, dataList) => changeOuId(value, dataList, record)}
                  disabled={val}
                />
              )}
              {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })}
              {record.$form.getFieldDecorator('ouCode', { initialValue: record.ouCode })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.invOrgs`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('invOrganizationName', {
                initialValue: record.invOrganizationName,
              })(
                <Lov
                  code="HPFM.INV_ORG"
                  textValue={record.invOrganizationName}
                  queryParams={{
                    ouId: record.$form.getFieldValue('ouId'),
                    enabledFlag: 1,
                    organizationId,
                  }}
                  onChange={(value, dataList) => changeInvOrganization(value, dataList, record)}
                  disabled={val}
                />
              )}
              {record.$form.getFieldDecorator('invOrganizationId', {
                initialValue: record.invOrganizationId,
              })}
            </Form.Item>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.ERPsupplierName`).d('ERP供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        render: (val, record) => {
          if (
            ['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED'
          ) {
            const form = record.$form;
            // 供应商改变，给相应的来源外部系统赋值
            const onChange = (_, value) => {
              form.setFieldsValue({
                externalSystemCode: value.externalSystemCode,
              });
            };
            return (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('supplierId', {
                    initialValue: record.supplierId,
                  })(
                    <Lov
                      code="SSRC.COMPANY_SUPPLIER"
                      onChange={onChange}
                      textValue={record.supplierName}
                      queryParams={{
                        tenantId: organizationId,
                        companyId: record.supplierCompanyId,
                        sourceCode: 'SAP',
                      }}
                    />
                  )}
                </Form.Item>
              </React.Fragment>
            );
          } else {
            return record.supplierName;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.extSystemCode`).d('来源外部系统'),
        dataIndex: 'externalSystemCode',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('externalSystemCode', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.SRMSupplierName`).d('SRM供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 140,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.infoType`).d('信息类别'),
        dataIndex: 'infoTypeMeaning',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('infoType', {
                initialValue: record.infoType,
              })(
                <Select style={{ width: '100%' }}>
                  {code.infoType &&
                    code.infoType.map((index) => (
                      <Option key={index.value} value={index.value}>
                        {index.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.categoryName`).d('物料类别'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.itemDescroption`).d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        align: 'right',
        width: 120,
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 120,
        render: (val) => numberSeparatorRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.priceUomName`).d('价格单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.baseUomName`).d('基本单位'),
        dataIndex: 'primaryUomName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.orderUomName`).d('订单单位'),
        dataIndex: 'orderUomName',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.searchResImt.biUomId`).d('双单位'),
      //   dataIndex: 'biUomName',
      //   width: 100,
      // },
      {
        title: intl
          .get(`${promptCode}.model.searchResImt.baseConversionRatio`)
          .d('转换比例(基本-订单单位)'),
        dataIndex: 'baseUomConversionRate',
        width: 170,
        render: (value, record) => {
          if (record.itemCode) {
            const baseUomConversionRate = `${
              (record.sourceResultExtend && record.sourceResultExtend.baseOrderRateSub) || ''
            }:${(record.sourceResultExtend && record.sourceResultExtend.baseOrderRatePar) || ''}`;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('baseUomConversionRate', {
                  initialValue: baseUomConversionRate,
                  rules: [
                    {
                      pattern: /^([0-9]+(\.[0-9]{1,2})?:[0-9]+(\.[0-9]{1,2})?)$|^:$/,
                      message: intl
                        .get(`${promptCode}.view.conversion.format`)
                        .d('只能输入*: *格式的内容'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return '';
          }
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.searchResImt.priceConversionRatio`)
          .d('转换比例(价格-订单单位)'),
        dataIndex: 'priceUomConversionRate',
        width: 180,
        render: (value, record) => {
          if (record.itemCode) {
            const priceUomConversionRate = `${
              (record.sourceResultExtend && record.sourceResultExtend.priceOrderRateSub) || ''
            }:${(record.sourceResultExtend && record.sourceResultExtend.priceOrderRatePar) || ''}`;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('priceUomConversionRate', {
                  initialValue: priceUomConversionRate,
                  rules: [
                    {
                      pattern: /^([0-9]+(\.[0-9]{1,2})?:[0-9]+(\.[0-9]{1,2})?)$|^:$/,
                      message: intl
                        .get(`${promptCode}.view.conversion.format`)
                        .d('只能输入*: *格式的内容'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return '';
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.priceQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceBatchQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.searchResImt.priceQuantity`)
                        .d('价格批量'),
                    }),
                  },
                ],
              })(<InputNumber min={0} max="99999999999999999999" style={{ width: '100%' }} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get(`${promptCode}.model.searchResImt.batchPrice`).d('批量价格'),
      //   dataIndex: 'batchQuantityPrice',
      //   align: 'right',
      //   width: 100,
      // },
      {
        title: intl.get(`${promptCode}.model.searchResImt.taxCode`).d('税码'),
        dataIndex: 'taxCode',
        width: 80,
        render: (val, record) =>
          record.rewriteFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxCode', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.taxRate(%)`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 120,
        render: (val, record) =>
          record.rewriteFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxId', {
                initialValue: record.taxId,
              })(
                <Lov
                  code="SMDM.TAX"
                  style={{ width: '98%' }}
                  textValue={record.taxRate}
                  onChange={(value, dataList) => {
                    record.$form.getFieldDecorator('taxId');
                    record.$form.getFieldDecorator('taxRate');
                    record.$form.setFieldsValue({
                      taxRate: dataList.taxRate,
                      taxCode: dataList.taxCode,
                      taxId: dataList.taxId,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.exchangeRate`).d('汇率'),
        dataIndex: 'rate',
        width: 120,
        render: (val, record) =>
          record.rewriteFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('rate', {
                initialValue: val,
              })(<InputNumber style={{ width: '100%' }} min={0} max={999999999999999} />)}
            </Form.Item>
          ) : (
            numberRender(val, 8, false)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.quoExpDateFrom`).d('报价有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
        render: (val, record) => {
          if (record.rewriteFlag === 1) {
            const form = record.$form;
            const { getFieldValue } = form;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateFrom', {
                  initialValue: val && moment(val),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                      getFieldValue('quotationExpiryDateTo') &&
                      moment(getFieldValue('quotationExpiryDateTo')).isBefore(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.quoExpDateTo`).d('报价有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
        render: (val, record) => {
          if (record.rewriteFlag === 1) {
            const form = record.$form;
            const { getFieldValue } = form;
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('quotationExpiryDateTo', {
                  initialValue: val && moment(val),
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder=""
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                      getFieldValue('quotationExpiryDateFrom') &&
                      moment(getFieldValue('quotationExpiryDateFrom')).isAfter(currentDate, 'day')
                    }
                  />
                )}
              </Form.Item>
            );
          } else {
            return val && moment(val).format(DEFAULT_DATE_FORMAT);
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.sourceType`).d('寻源类型'),
        dataIndex: 'sourceTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.priceCategory`).d('价格类型'),
        dataIndex: 'priceCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.sourceFromNumber`).d('来源单号'),
        dataIndex: 'sourceNum',
        width: 160,
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.lineNo`).d('行号'),
        dataIndex: 'itemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        dataIndex: 'specs',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.itemRemarks`).d('物品说明'),
        dataIndex: 'itemRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemRemark', {
                initialValue: val,
                rules: [
                  {
                    max: 200,
                    message: intl.get('hzero.common.validation.max', {
                      max: 200,
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.inquiryHall.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPackageQuantity', {
                initialValue: record.minPackageQuantity,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: record.minPurchaseQuantity,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          val === 1 ? (
            <a onClick={() => viewLadderLevelModal(record)}>
              {intl.get(`${promptCode}.model.searchResImt.ladderInquiry`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.promisedDeliveryDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('validPromisedDate', {
                initialValue: val && moment(val),
              })(
                <DatePicker format={getDateFormat()} placeholder={null} style={{ width: '100%' }} />
              )}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.supplyCycleDay`).d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('validDeliveryCycle', {
                initialValue: record.validDeliveryCycle,
              })(<InputNumber min={1} />)}
            </Form.Item>
          ) : (
            record.validDeliveryCycle
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.firstReminder`).d('第一封催询单'),
        dataIndex: 'firstReminder',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('firstReminder', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.firstReminder,
                rules: [
                  {
                    pattern: /^[0-9]*$/,
                    message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            record.sourceResultExtend && record.sourceResultExtend.firstReminder
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.secondReminder`).d('第二封催询单'),
        dataIndex: 'secondReminder',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('secondReminder', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.secondReminder,
                rules: [
                  {
                    pattern: /^[0-9]*$/,
                    message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            record.sourceResultExtend && record.sourceResultExtend.secondReminder
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.thirdReminder`).d('第三封催询单'),
        dataIndex: 'thirdReminder',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('thirdReminder', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.thirdReminder,
                rules: [
                  {
                    pattern: /^[0-9]*$/,
                    message: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          ) : (
            record.sourceResultExtend && record.sourceResultExtend.thirdReminder
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.limitNonDelivery`).d('极限不发货'),
        dataIndex: 'nonDelivery',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('nonDelivery', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.nonDelivery,
              })(
                <InputNumber
                  min={0}
                  max={99.9}
                  step={0.1}
                  precision={1}
                  formatter={(value) => `${value}%`}
                  parser={(value) => (value && value.replace ? value.replace('%', '') : value)}
                />
              )}
            </Form.Item>
          ) : (
            record.sourceResultExtend && record.sourceResultExtend.nonDelivery
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.extremeOverDelivery`).d('极限过度发货'),
        dataIndex: 'excessiveDelivery',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('excessiveDelivery', {
                initialValue:
                  record.sourceResultExtend && record.sourceResultExtend.excessiveDelivery,
              })(
                <InputNumber
                  min={0}
                  max={99.9}
                  step={0.1}
                  precision={1}
                  formatter={(value) => `${value}%`}
                  parser={(value) => (value && value.replace ? value.replace('%', '') : value)}
                />
              )}
            </Form.Item>
          ) : (
            record.sourceResultExtend && record.sourceResultExtend.excessiveDelivery
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.purchaseOrderRemark`).d('采购订单文本'),
        dataIndex: 'purchaseOrderRemark',
        width: 120,
        render: (val, record) =>
          (['update', 'create'].includes(record._status) &&
            record.syncStatus !== 'SYNCHRONIZING' &&
            record.syncStatus !== 'SYNCHRONIZED') ||
          record.rewriteFlag === 1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purchaseOrderRemark', {
                initialValue:
                  record.sourceResultExtend && record.sourceResultExtend.purchaseOrderRemark,
              })(<TextArea trim rows={1} />)}
            </Form.Item>
          ) : (
            <Popover
              content={
                <div style={{ maxWidth: '300px' }}>
                  {record.sourceResultExtend && record.sourceResultExtend.purchaseOrderRemark}
                </div>
              }
            >
              <p>{record.sourceResultExtend && record.sourceResultExtend.purchaseOrderRemark}</p>
            </Popover>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.noteRecordInformation`).d('附注记录信息'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.remark,
              })(<TextArea trim rows={1} maxLength={160} />)}
            </Form.Item>
          ) : (
            <Popover
              content={
                <div style={{ maxWidth: '300px' }}>
                  {record.sourceResultExtend && record.sourceResultExtend.remark}
                </div>
              }
            >
              <p>{record.sourceResultExtend && record.sourceResultExtend.remark}</p>
            </Popover>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.rfxCreated`).d('创建人'),
        dataIndex: 'rfxCreated',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.finishDate`).d('完成时间'),
        dataIndex: 'finishDate',
        width: 140,
        render: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.copyData`).d('复制数据'),
        dataIndex: 'copyFlag',
        width: 100,
        render: (value) => yesOrNoRender(value ? 1 : 0), // 因为之前数据没有刷, 导致返回为null, 所以二次处理一下为1/0
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        dataIndex: 'action',
        render: (val, record) => (
          <span className="action-link">
            {record.syncStatus === 'SYNCHRONIZED' && record.rewriteFlag === 1 && (
              <Button
                type="text"
                permissionList={[
                  {
                    code: `srm.source.result.srm.search-result-import.ps.editbutton`,
                    type: 'button',
                    meaning: '寻源结果导入-编辑按钮权限',
                  },
                ]}
                onClick={() => editRow(record, false)}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            )}
            {record.syncStatus === 'SYNCHRONIZED' &&
              (record.rewriteFlag === 0 || isUndefined(record.rewriteFlag)) && (
                <React.Fragment>
                  <Button
                    type="text"
                    permissionList={[
                      {
                        code: `srm.source.result.srm.search-result-import.ps.editbutton`,
                        type: 'button',
                        meaning: '寻源结果导入-编辑按钮权限',
                      },
                    ]}
                    onClick={() => editRow(record, true)}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Button>
                </React.Fragment>
              )}
          </span>
        ),
      },
    ];
    const SAPScrollWidth = scrollWidth(columns, 0);
    return customizeTable(
      {
        code: 'SSRC.PRICE_LIB_INFO.SAPTABLE_LINE',
      },
      <EditTable
        scroll={{ x: SAPScrollWidth }}
        dataSource={resultsList}
        pagination={pagination}
        rowKey="resultId"
        loading={Loading}
        columns={columns}
        bordered
        rowSelection={resultImportRowSelection}
        onChange={(page) => handleSearch(page)}
      />
    );
  }
}
