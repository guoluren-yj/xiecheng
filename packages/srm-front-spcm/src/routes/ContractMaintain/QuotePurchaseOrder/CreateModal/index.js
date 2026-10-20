import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, isNaN, isEmpty } from 'lodash';
import { checkCreatePo } from '@/services/contractMaintainService';
import { getDynamicLabel } from '@/utils/util';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth, getResponse } from 'utils/utils';
import { dateTimeRender, dateRender, numberRender } from 'utils/renderer';
import { DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import CreateModalForm from './CreateModalForm';

function countDecimals(val) {
  const strArray = `${val}`.split('.') || [];
  return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
    ? isEmpty((strArray[1] || '').match(/[^0]/g))
      ? 2
      : `${val}`.split('.')[1].length || 0
    : 0;
}

@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.ORDER'],
})
@connect(({ contractCommon, loading }) => ({
  contractCommon,
  loading: loading.effects['contractCommon/fetchAddPurchaseOrder'],
}))
@formatterCollections({
  code: [
    'entity.item',
    'sodr.sendOrder',
  ],
})
export default class CreateModal extends Component {
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    addLoading: false,
  };

  componentDidMount() {
    const {
      contractCommon: { addPoPagination = {} },
    } = this.props;
    this.handleSearchAddPurchaseOrder(addPoPagination);
  }

  @Bind()
  handleSearchAddPurchaseOrder(page = {}) {
    const { dispatch, resultId, supplierCompanyId, sourceLineNum, sourceCode } = this.props;
    const filterValues = this.filterForm ? this.filterForm.getFieldsValue() : {};
    const dateFormat = this.handleFormQuery(filterValues, [
      'erpCreationDateStart',
      'erpCreationDateEnd',
    ]);
    dispatch({
      type: 'contractCommon/fetchAddPurchaseOrder',
      payload: {
        page,
        resultId,
        supplierCompanyId,
        poNumNoLike: sourceCode,
        lineNumNoLike: sourceLineNum,
        ...dateFormat,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.ORDER',
      },
    });
  }

  /**
   * 格式化时间
   */
  @Bind()
  handleFormQuery(filterValues, timeArray) {
    const dealTime = {};
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render() {
    const {
      loading,
      visible,
      onCancel,
      onAddPurchaseOrder,
      dataSource,
      contractCommon: { addPoList = [], addPoPagination = {} },
      doubleUnitEnabled,
      customizeTable,
    } = this.props;
    const { selectedRowKeys, selectedRows, addLoading } = this.state;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'displayStatusMeaning',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        fixed: 'left',
        width: 150,
        render: (value, record) => record.supplierCode || record.supplierCompanyCode,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        fixed: 'left',
        width: 150,
        render: (value, record) => record.supplierName || record.supplierCompanyName,
      },
      {
        title: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        dataIndex: 'projectTaskId',
        width: 150,
        render: (_, record) => record.projectTaskName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.version`).d('版本'),
        dataIndex: 'versionNum',
        width: 60,
      },
      {
        title: intl.get('spcm.common.model.common.termId').d('付款条款'),
        dataIndex: 'termsName',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
        dataIndex: 'displayLineLocationNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
        dataIndex: 'categoryId',
        width: 150,
        render: (_, record) => record.categoryName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.oldItemCodeNum`).d('旧物料号'),
        dataIndex: 'oldItemCode',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.netReceivedQuantity`).d('净接收'),
        dataIndex: 'netReceivedQuantity',
        width: 80,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.netDeliverQuantity`).d('净入库'),
        dataIndex: 'netDeliverQuantity',
        width: 80,
      },
      {
        title: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
        dataIndex: 'notDeliverQuantity',
        width: 80,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.invoicedQuantity`).d('已开票'),
        dataIndex: 'invoicedQuantity',
        width: 80,
      },
      {
        // title: intl.get(`sodr.sendOrder.model.common.afterTaxunitPrice`).d('不含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 200,
        render: (val, record) => {
          const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : isNumber(val) && !isNaN(val)
            ? numberRender(val, count <= 2 ? 2 : count)
            : '';
        },
      },
      {
        // title: intl.get(`sodr.sendOrder.model.common.enteredTaxIncludedPrice`).d('原币含税单价'),
        title: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
        dataIndex: 'enteredTaxIncludedPrice',
        align: 'right',
        width: 200,
        render: (val, record) => {
          const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : isNumber(val) && !isNaN(val)
            ? numberRender(val, count <= 2 ? 2 : count)
            : '';
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.afterTaxlineAmount`).d('不含税行金额'),
        dataIndex: 'lineAmount',
        align: 'right',
        width: 200,
        render: (val, record) => {
          const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : isNumber(val) && !isNaN(val)
            ? numberRender(val, count <= 2 ? 2 : count)
            : '';
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.taxIncludedLineAmount`).d('含税行金额'),
        dataIndex: 'taxIncludedLineAmount',
        align: 'right',
        width: 200,
        render: (val, record) => {
          const count = countDecimals(val);
          return record.priceSensitiveFlag
            ? '****'
            : isNumber(val) && !isNaN(val)
            ? numberRender(val, count <= 2 ? 2 : count)
            : '';
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
        dataIndex: 'unitPriceBatch',
        width: 40,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled),
        dataIndex: 'uomId',
        width: 100,
        render: (_, record) => record.uomCodeAndName,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        width: 160,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
        dataIndex: 'taxCode',
        width: 60,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 60,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 80,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.modelNum`).d('型号'),
        dataIndex: 'model',
        width: 80,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.manufacturerName`).d('制造商'),
        dataIndex: 'manufacturerName',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.brand`).d('品牌'),
        dataIndex: 'brand',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.erpStatus`).d('ERP状态'),
        dataIndex: 'erpStatus',
        width: 90,
        render: (_, record) => record.erpStatusMeaning,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.frozenStatus`).d('是否冻结'),
        dataIndex: 'frozenFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.consignedFlag`).d('是否寄售'),
        dataIndex: 'consignedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.projectCategory`).d('是否委外'),
        dataIndex: 'projectCategory',
        width: 90,

        render: (val) => {
          return val === '1'
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.returnedFlag`).d('是否退回'),
        dataIndex: 'returnedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.freeFlag`).d('是否免费'),
        dataIndex: 'freeFlag',
        width: 90,
        render: (_, record) => record.freeMeaning,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.immedShippedFlag`).d('是否直发'),
        dataIndex: 'isImmedShippedFlag',
        width: 90,

        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.purchaserRemark`).d('采购方行备注'),
        dataIndex: 'remark',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.feedbackInfo`).d('反馈信息'),
        dataIndex: 'feedback',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.shipToThirdPartyName`).d('送达方'),
        dataIndex: 'shipToThirdPartyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('地点'),
        dataIndex: 'shipToThirdPartyAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.contactPersonInfo`).d('联系人信息'),
        dataIndex: 'shipToThirdPartyContact',
        width: 150,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.supplierSite`).d('供应商地点'),
        dataIndex: 'supplierSiteId',
        width: 150,
        render: (_, record) => record.supplierSiteName,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get('entity.business.tag').d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (_, record) => record.ouName,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purchaseOrgId',
        width: 150,
        render: (_, record) => record.purOrganizationName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
        dataIndex: 'purchaseAgentId',
        width: 100,
        render: (_, record) => record.purchaseAgentName,
      },
      {
        title: intl.get(`entity.organization.class.receiving`).d('收货组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (_, record) => record.invOrganizationName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.inventoryName`).d('收货库房'),
        dataIndex: 'inventoryId',
        width: 150,
        render: (_, record) => record.inventoryName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.locationName`).d('收货库位'),
        dataIndex: 'invLocationId',
        width: 100,
        render: (_, record) => record.locationName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.billToLocationName`).d('收单方'),
        dataIndex: 'billToLocationId',
        width: 150,
        render: (_, record) => record.billToLocationName,
      },
      // {
      //   title: intl.get(`sodr.sendOrder.model.common.priceUomName`).d('价格单位'),
      //   dataIndex: 'priceUomName',
      //   width: 90,
      // },
      {
        title: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
        dataIndex: 'erpCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
        dataIndex: 'erpCreatedName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.department`).d('部门'),
        dataIndex: 'departmentId',
        width: 130,
        render: (_, record) => record.departmentName,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.confirmedDate`).d('确认日期'),
        dataIndex: 'confirmedDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.urgentOrNot`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 90,
        render: (val) => {
          return val === 1
            ? intl.get(`hzero.common.status.yes`).d('是')
            : intl.get(`hzero.common.status.no`).d('否');
        },
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.urgentTime`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.contractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.purchaseReqNum`).d('采购申请号'),
        dataIndex: 'displayPrNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.purchaseReqLineNum`).d('采购申请行号'),
        dataIndex: 'displayPrLineNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 100,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.commodityDirectory`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 100,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
        dataIndex: 'poSourcePlatform',
        width: 100,
        render: (_, record) => record.poSourcePlatformMeaning,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 180,
        render: (_, record) => record.secondaryUomCodeAndName,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
        dataIndex: 'taxIncludedSecondaryUnitPrice',
        width: 150,
      },
      doubleUnitEnabled && {
        title: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
        dataIndex: 'secondaryUnitPrice',
        width: 150,
      },
    ].filter(Boolean);
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
    };
    const scrollX = tableScrollWidth(columns);

    const createModalForm = {
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.handleSearchAddPurchaseOrder,
    };
    return (
      <Modal
        destroyOnClose
        title={intl.get(`spcm.contractSubject.view.message.addSubjectLines`).d('新增标的行')}
        width={1100}
        visible={visible}
        onCancel={onCancel}
        footer={
          <Button
            type="primary"
            loading={addLoading}
            disabled={isEmpty(selectedRowKeys)}
            onClick={() => {
              this.setState({
                addLoading: true,
              });
              checkCreatePo(dataSource.concat(selectedRows))
                .then((res) => {
                  if (getResponse(res)) {
                    onAddPurchaseOrder(selectedRows);
                    onCancel();
                  }
                })
                .finally(() => {
                  this.setState({
                    addLoading: false,
                  });
                });
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        }
      >
        <CreateModalForm {...createModalForm} />
        {customizeTable(
          { code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.ORDER' },
          <Table
            bordered
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={addPoList}
            pagination={addPoPagination}
            scroll={{ x: scrollX }}
            rowSelection={rowSelection}
            onChange={this.handleSearchAddPurchaseOrder}
          />
        )}
      </Modal>
    );
  }
}
