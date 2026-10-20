/*
 * SAPTableList - 价格信息导入SAP表格
 * @date: 2020-3-10
 * @author: LZJ <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Popover } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
// import EditTable from 'components/EditTable';
import EditTable from '_components/EditTable';
import { numberRender, yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';

import Lov from 'components/Lov';

const promptCode = 'ssrc.searchResultImport';

export default class EBSTable extends Component {
  render() {
    const {
      resultsList,
      pagination,
      Loading,
      resultImportRowSelection,
      handleSearch,
      scrollWidth,
      changeOuId,
      organizationId,
      changeInvOrganization,
      onDetail,
      viewLadderLevelModal,
      changeSupplierLocation,
      customizeTable,
      changeSupplierId,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.searchResImt.syncStatus`).d('导入状态'),
        dataIndex: 'syncStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.externalSystemNumber`).d('外部系统编号'),
        dataIndex: 'externalSystemNumber',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.syncResponseMsg`).d('反馈信息'),
        dataIndex: 'syncResponseMsg',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.purchaseAgentName`).d('采购员'),
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
        title: intl.get(`${promptCode}.model.searchResImt.company`).d('公司'),
        dataIndex: 'companyName',
        width: 120,
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
            return (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('supplierId', {
                    initialValue: record.supplierId,
                  })(
                    <Lov
                      code="SSRC.COMPANY_SUPPLIER"
                      textValue={record.supplierName}
                      queryParams={{
                        tenantId: organizationId,
                        companyId: record.supplierCompanyId,
                        sourceCode: 'EBS',
                      }}
                      onChange={(value, dataList) => changeSupplierId(value, dataList, record)}
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
        title: intl.get(`${promptCode}.model.searchResImt.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.unitPrice`).d('单价'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.taxCode`).d('税码'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.taxRate(%)`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.exchangeRate`).d('汇率'),
        dataIndex: 'rate',
        width: 80,
        render: val => numberRender(val, 8, false),
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.quoExpDateFrom`).d('报价有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
        render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.quoExpDateTo`).d('报价有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
        render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
        title: intl.get(`${promptCode}.model.searchResImt.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.specs`).d('规格'),
        dataIndex: 'specs',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.inquiryHall.minPackageQuantity`).d('最小包装量'),
        dataIndex: 'minPackageQuantity',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.minPurchaseQuantity`).d('最小采购量'),
        dataIndex: 'minPurchaseQuantity',
        width: 120,
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
        title: intl.get(`${promptCode}.model.searchResImt.Manufacturer`).d('制造商'),
        dataIndex: 'manufacturer',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.supplierLocation`).d('供应商地点'),
        dataIndex: 'supplierSiteId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierSiteId', {
                initialValue: record.supplierSiteId,
              })(
                <Lov
                  code="SSLM.SUPPLIER_SITE"
                  textValue={record.supplierSiteName}
                  lovOptions={{
                    displayField: 'supplierSiteName',
                  }}
                  queryParams={{
                    organizationId,
                    supplierId: record.$form.getFieldValue('supplierId'),
                  }}
                  onChange={(value, dataList) => changeSupplierLocation(value, dataList, record)}
                  disabled={!record.$form.getFieldValue('supplierId')}
                />
              )}
              {record.$form.getFieldDecorator('supplierSiteName', {
                initialValue: record.supplierSiteName,
              })}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.reasonsForSelection`).d('选用理由'),
        dataIndex: 'suggestedRemark',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.remark`).d('备注'),
        dataIndex: 'remark',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.syncStatus !== 'SYNCHRONIZING' &&
          record.syncStatus !== 'SYNCHRONIZED' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: record.sourceResultExtend && record.sourceResultExtend.remark,
              })(<Input.TextArea rows={1} />)}
            </Form.Item>
          ) : (
            <Popover content={record.sourceResultExtend && record.sourceResultExtend.remark}>
              {record.sourceResultExtend && record.sourceResultExtend.remark}
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
        render: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.sourceCategory`).d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.searchResImt.copyData`).d('复制数据'),
        dataIndex: 'copyFlag',
        width: 100,
        render: value => yesOrNoRender(value ? 1 : 0), // 因为之前数据没有刷, 导致返回为null, 所以二次处理一下为1/0
      },
    ];
    const SAPScrollWidth = scrollWidth(columns, 0);
    return customizeTable(
      {
        code: 'SSRC.PRICE_LIB_INFO.EBSTABLE_LINE',
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
        onChange={page => handleSearch(page)}
      />
    );
  }
}
