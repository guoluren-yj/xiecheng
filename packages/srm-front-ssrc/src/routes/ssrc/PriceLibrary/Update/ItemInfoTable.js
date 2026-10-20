/**
 * Update - 价格库-手工创建&更新价格-物料价格信息维护table
 * @date: 2020-2-12
 * @author: zhijian.li@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Form, InputNumber, Input, DatePicker, Popover, Select } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';

import { getDateFormat } from 'utils/utils';
import Checkbox from 'components/Checkbox';
import Switch from 'components/Switch';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

export default class ItemInfoTable extends PureComponent {
  render() {
    const {
      organizationId,
      userId,
      pathFlag,
      scrollWidth,
      pubPriceList,
      itemPricePagination,
      Loading,
      handleSearch,
      changeCompanyId,
      changeOuId,
      changePurOrganizationId,
      changeItemId,
      changeItemCategory,
      changeSupplierCompanyNum,
      openLadder,
      changeTaxId,
      changeCurrencyCode,
      inquiryDetail,
      contractDetail,
      orderDetail,
      rowSelection,
      itemPriceList,
      statusIsApprovaling,
      onChangeOrganization,
      onDataChange,
      sourceTy = [],
      customizeTable = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'priceLibraryStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('companyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('ssrc.common.company').d('公司'),
                      }),
                    },
                  ],
                  initialValue: record.companyId,
                })(
                  <Lov
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    textValue={record.companyName}
                    onChange={(value, dataList) => {
                      return changeCompanyId(value, dataList, record);
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('companyName', {
                  initialValue: record.companyName,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.companyName
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ouName`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('ouId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.priceLibrary.model.priceLibrary.ouName`).d('业务实体'),
                      }),
                    },
                  ],
                  initialValue: record.ouId,
                })(
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={record.ouName}
                    onChange={(value, dataList) => changeOuId(value, dataList, record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('ouName', { initialValue: record.ouName })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.ouName
          ),
      },
      {
        title: intl
          .get(`ssrc.priceLibrary.model.priceLibrary.invOrganizationName`)
          .d('库存组织名称'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('invOrganizationId', {
                  rules: [
                    {
                      required: record.$form.getFieldValue('ouId'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.priceLibrary.model.priceLibrary.invOrganizationName`)
                          .d('库存组织名称'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    code="HPFM.INV_ORG"
                    textValue={record.invOrganizationName}
                    disabled={!record.$form.getFieldValue('ouId')}
                    onChange={(value, dataList) => changePurOrganizationId(value, dataList, record)}
                    queryParams={{
                      ouId: record.$form.getFieldValue('ouId'),
                      enabledFlag: 1,
                      organizationId,
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('invOrganizationName', {
                  initialValue: record.invOrganizationName,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.invOrganizationName
          ),
      },
      {
        title: intl
          .get('ssrc.priceLibrary.model.priceLibrary.purOrganizationCode')
          .d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purOrganizationId', {
                initialValue: record.purOrganizationId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURORG"
                  lovOptions={{
                    displayField: 'organizationCode',
                  }}
                  textValue={record.purOrganizationCode}
                  onChange={(value, dataList) => onChangeOrganization(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('purOrganizationCode', {
                initialValue: record.purOrganizationCode,
              })}
            </Form.Item>
          ) : (
            record.purOrganizationCode
          ),
      },
      {
        title: intl.get('ssrc.priceLibrary.model.library.purOrganizationName').d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('purOrganizationName', {
                initialValue: record.purOrganizationName,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            record.purOrganizationName
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.buyer`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
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
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('itemId', {
                  rules: [
                    {
                      required: record.$form.getFieldValue('invOrganizationId'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.priceLibrary.model.priceLibrary.itemCode`)
                          .d('物料编码'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Lov
                    code="SSRC.CUSTOMER_ITEM"
                    textValue={record.itemCode}
                    disabled={!record.$form.getFieldValue('invOrganizationId')}
                    onChange={(value, dataList) => changeItemId(value, dataList, record)}
                    queryParams={{
                      invOrganizationId: record.$form.getFieldValue('invOrganizationId'),
                      itemCategoryId: record.$form.getFieldValue('itemCategoryId'),
                    }}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('itemCode', { initialValue: record.itemCode })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.itemCode
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemName', {
                initialValue: val,
                rules: [
                  {
                    max: 300,
                    message: intl.get('hzero.common.validation.max', {
                      max: 300,
                    }),
                  },
                ],
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.itemCategoryName`).d('物料类别'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('itemCategoryId', {
                initialValue: val,
              })(
                <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={record.itemCategoryName}
                  queryParams={{
                    tenantId: organizationId,
                    itemId: record.$form.getFieldValue('itemId'),
                  }}
                  onChange={(value, dataList) => changeItemCategory(value, dataList, record)}
                />
              )}
            </Form.Item>
          ) : (
            record.itemCategoryName
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.priceLibrary.model.priceLibrary.supplierCompanyNum`)
                          .d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    code="SSRC.SUPPLIER"
                    onChange={(value, dataList) =>
                      changeSupplierCompanyNum(value, dataList, record)
                    }
                    queryParams={{
                      organizationId,
                      userId,
                      companyId: record.$form.getFieldValue('companyId'),
                    }}
                    textValue={record.supplierCompanyNum}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierCompanyNum', {})(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.supplierCompanyNum
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyName', {
                  initialValue: val,
                })(<Input disabled />)}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierTenantId', {
                  initialValue: record.supplierTenantId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.netPrice`)
                        .d('单价(不含税)'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  disabled={statusIsApprovaling(record)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      // {
      //   title: intl.get(`ssrc.priceLibrary.model.priceLibrary.eachPrice`).d('每一单价'),
      //   dataIndex: 'attributeDecimal2',
      //   width: 120,
      //   render: (val, record) =>
      //     ['update', 'create'].includes(record._status) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('attributeDecimal2', {
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl
      //                   .get(`ssrc.priceLibrary.model.priceLibrary.eachPrice`)
      //                   .d('每一单价'),
      //               }),
      //             },
      //           ],
      //           initialValue: val,
      //         })(
      //           <InputNumber
      //             min={0}
      //             max={9999999999}
      //             style={{ width: '100%' }}
      //             disabled={statusIsApprovaling(record)}
      //           />
      //         )}
      //       </Form.Item>
      //     ) : (
      //       val
      //     ),
      // },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.changepercent`).d('涨跌幅'),
        dataIndex: 'changePercent',
        width: 100,
        render: (val) => {
          if (val && Number(val.replace('%', '')) > 0) {
            return <span style={{ color: 'red' }}> {val} </span>;
          } else if (val && Number(val.replace('%', '')) < 0) {
            return <span style={{ color: 'green' }}> {val}</span>;
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderInquiryFlag`).d('启用阶梯价格'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderInquiryFlag', {
                initialValue: value,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={statusIsApprovaling(record)}
                />
              )}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderPrice`).d('阶梯价格'),
        dataIndex: 'ladderPrice',
        width: 100,
        render: (val, record) =>
          record.$form ? (
            record.$form.getFieldValue('ladderInquiryFlag') === 1 && !record.isNew ? (
              <a onClick={() => openLadder(record)}>
                {intl.get(`ssrc.priceLibrary.view.message.button.ladderLevel`).d('阶梯价格')}
              </a>
            ) : null
          ) : null,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.uomName`).d('单位'),
        dataIndex: 'uomId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('uomId', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.priceLibrary.model.priceLibrary.uomName`).d('单位'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SSRC.UOM"
                    textValue={record.uomName || record.$form.getFieldValue('uomName')}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('uomName', { initialValue: record.uomName })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.uomName
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.biUomId`).d('双单位'),
        dataIndex: 'biUomId',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('biUomId', {
                initialValue: value,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  queryParams={{ enabledFlag: 1 }}
                  textValue={record.biUomName || record.$form.getFieldValue('biUomName')}
                />
              )}
              {record.$form.getFieldDecorator('biUomName', { initialValue: record.biUomName })}
            </Form.Item>
          ) : (
            value
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.conversionRatio`).d('转换比例'),
        dataIndex: 'uomConversionRate',
        width: 120,
        render: (value, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('uomConversionRate', {
                initialValue: value,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(val) => `1:${val}`}
                  parser={(val) => val.replace('1:', '')}
                  min={0}
                  precision={2}
                />
              )}
            </Form.Item>
          ) : (
            <div> 1: {value}</div>
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.priceQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        align: 'right',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('priceBatchQuantity', {
                initialValue: val || val === 0 ? val : 1,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.priceLibrary.model.priceLibrary.priceQuantity`)
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
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.taxRate`).d('税率'),
        dataIndex: 'taxId',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('taxId', {
                  initialValue: val,
                })(
                  <Lov
                    code="SMDM.TAX"
                    textValue={record.taxRate}
                    onChange={(value, dataList) => changeTaxId(value, dataList, record)}
                    disabled={statusIsApprovaling(record)}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('taxRate', { initialValue: record.taxRate })(
                  <div />
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.taxRate
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('currencyCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.priceLibrary.currencyCode`).d('币种'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <Lov
                  code="SMDM.EXCHANGE_RATE.CURRENCY"
                  textValue={record.$form.getFieldValue('currencyCode')}
                  onChange={(value, dataList) => changeCurrencyCode(value, dataList, record)}
                  disabled={statusIsApprovaling(record)}
                />
              )}
            </Form.Item>
          ) : (
            record.currencyCode
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.exchangeRate`).d('汇率'),
        dataIndex: 'exchangeRate',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record, true) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('exchangeRate', {
                rules: [
                  {
                    required: record.$form.getFieldValue('currencyCode') !== 'CNY',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.priceLibrary.model.priceLibrary.exchangeRate`).d('汇率'),
                    }),
                  },
                ],
                initialValue: val,
              })(
                <InputNumber
                  disabled={
                    record.$form.getFieldValue('currencyCode') === 'CNY' ||
                    statusIsApprovaling(record)
                  }
                  style={{ width: '100%' }}
                  precision={8}
                  min={0}
                  max={999999999999999}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record, true) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('specifications', {
                initialValue: record.specs,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            record.specs
          ),
      },
      // {
      //   title: intl.get(`ssrc.priceLibrary.model.priceLibrary.qualityStandard`).d('质量标准'),
      //   dataIndex: 'attributeVarchar1',
      //   width: 150,
      //   render: (val, record) =>
      //     ['update', 'create'].includes(record._status) &&
      //     record.adaptableFlag === 1 &&
      //     !statusIsApprovaling(record, true) ? (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('attributeVarchar1', {
      //           initialValue: record.attributeVarchar1,
      //         })(<Input />)}
      //       </Form.Item>
      //     ) : (
      //       record.attributeVarchar1
      //     ),
      // },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPackageQuantity', {
                initialValue: val,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('minPurchaseQuantity', {
                initialValue: val,
              })(<InputNumber style={{ width: '100%' }} min={0} max="99999999999999999999" />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get(`ssrc.priceLibrary.model.priceLibrary.quotationExpiryDateFrom`)
          .d('有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationExpiryDateFrom', {
                initialValue: val && moment(val),
              })(
                <DatePicker
                  format={getDateFormat()}
                  placeholder={null}
                  style={{ width: '100%' }}
                  disabled={statusIsApprovaling(record)}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('quotationExpiryDateTo') &&
                    moment(record.$form.getFieldValue('quotationExpiryDateTo')).isBefore(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.quotationExpiryDateTo`).d('有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationExpiryDateTo', {
                initialValue: val && moment(val),
              })(
                <DatePicker
                  disabled={statusIsApprovaling(record)}
                  format={getDateFormat()}
                  placeholder={null}
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) =>
                    record.$form.getFieldValue('quotationExpiryDateFrom') &&
                    moment(record.$form.getFieldValue('quotationExpiryDateFrom')).isAfter(
                      currentDate,
                      'day'
                    )
                  }
                />
              )}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.centralPurchaseFlag`).d('集采价格'),
        dataIndex: 'centralPurchaseFlag',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('centralPurchaseFlag', {
                initialValue: val || 0,
              })(<Switch />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input.TextArea min={0} rows={1} maxLength={100} />)}
            </Form.Item>
          ) : (
            <Popover content={<div style={{ maxWidth: '300px' }}>{val}</div>}>
              <p>{val}</p>
            </Popover>
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.orderNum`).d('订单编号'),
        dataIndex: 'orderNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? <a onClick={() => orderDetail(record)}>{val}</a> : val,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.contractNum`).d('合同编号'),
        dataIndex: 'contractNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? <a onClick={() => contractDetail(record)}>{val}</a> : val,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val, record) =>
          pathFlag ? <a onClick={() => inquiryDetail(record)}>{val}</a> : val,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.priceSourceMeaning`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.priceLibrary.model.priceLibrary.infoType').d('信息类型'),
        dataIndex: 'infoType',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('infoType', {
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get('ssrc.common.company').d('公司'),
                  //     }),
                  //   },
                  // ],
                  initialValue: record.infoType,
                })(
                  <Select style={{ width: '100px' }}>
                    {sourceTy.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.infoTypeMeaning
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('creationDate', {
                initialValue: val && moment(val),
              })(
                <DatePicker
                  disabled
                  format={getDateFormat()}
                  placeholder=""
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            dateRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.realName`).d('创建人'),
        dataIndex: 'realName',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.adaptableFlag === 1 &&
          !statusIsApprovaling(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('realName', {
                initialValue: val,
                rules: [
                  {
                    max: 100,
                    message: intl.get('hzero.common.validation.max', {
                      max: 100,
                    }),
                  },
                ],
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollWidthX = scrollWidth(columns, 120);
    return customizeTable(
      { code: 'SSRC.PRICE_LIBRARY.EDIT' },
      <EditTable
        scroll={{ x: scrollWidthX }}
        dataSource={pathFlag ? itemPriceList : pubPriceList}
        pagination={itemPricePagination}
        rowKey="priceLibraryId"
        loading={Loading}
        columns={columns}
        bordered
        rowSelection={pathFlag ? rowSelection : null}
        onChange={(page) => handleSearch(page)}
        onDataChange={onDataChange}
      />
    );
  }
}
