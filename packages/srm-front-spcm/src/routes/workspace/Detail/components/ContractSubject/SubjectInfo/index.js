/**
 * index - 新增标的
 * @date: 2020-2-05
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { flow } from 'lodash';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import FilterBarTable from '_components/FilterBarTable';

import { yesOrNoRender, numberRender } from 'utils/renderer';
import showLadderQuote from '@/routes/workspace/Component/Modal/LadderOfferModal';
import { renderStatus } from '@/utils/renderer';
import { QuotePurchaseDS, QuoteSourceDS, QuoteOrderDS } from './stores';

const SubjectInfo = (props = {}) => {
  const {
    remoteWorkDetail,
    supplierCompanyId,
    pcHeaderId,
    lineList,
    pcSourceKey,
    modal: { update },
    handleOk,
    doubleUnitEnabled,
    customizeTable,
  } = props;
  const { resultId = '', sourceLineNum = '', sourceCode = '' } = lineList[0] || {};
  // 采购申请单据
  const quotePurchaseDS = useMemo(
    () =>
      new DataSet({
        ...QuotePurchaseDS(doubleUnitEnabled),
        queryParameter: {
          pcHeaderId,
          supplierCompanyId,
          // workbenchFlag: '1',
          customizeUnitCode: 'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2',
        },
      }),
    []
  );
  // 寻源单据
  const quoteSourceDS = useMemo(
    () =>
      new DataSet({
        ...QuoteSourceDS(doubleUnitEnabled),
        queryParameter: {
          pcHeaderId,
          resultId,
          supplierCompanyId,
          customizeUnitCode: 'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS',
        },
      }),
    []
  );
  // 采购订单单据
  const quoteOrderDS = useMemo(() => {
    let quoteOrderProps = {
      ...QuoteOrderDS(doubleUnitEnabled),
      queryParameter: {
        resultId,
        supplierCompanyId,
        poNumNoLike: sourceCode,
        lineNumNoLike: sourceLineNum,
        customizeUnitCode: 'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
      },
    };
    if (remoteWorkDetail) {
      quoteOrderProps = remoteWorkDetail.process(
        'SPCM_WORKSPACE_DOCUMENT_SUBJECT_QUOTEORDER',
        quoteOrderProps,
        { props }
      );
    }
    return new DataSet(quoteOrderProps);
  }, []);

  const dataSetMap = {
    quoteSource: quoteSourceDS,
    quotePurchase: quotePurchaseDS,
    quoteOrder: quoteOrderDS,
    quoteSourceCode: 'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS',
    quotePurchaseCode: 'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2',
    quoteOrderCode: 'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
  };

  useEffect(() => {
    const prLineIds = [];
    if (pcSourceKey === 'quotePurchase') {
      lineList.forEach((item) => {
        if (!item.uuidFlag && item.prLineId) {
          prLineIds.push(item.prLineId);
        }
      });
      quotePurchaseDS.prLineIds = prLineIds;
    }
    dataSetMap[pcSourceKey].query();
    update({
      onOk: () => handleOk(dataSetMap[pcSourceKey]),
    });
  }, []);

  // 采购申请单据
  const createColumns = (key) => {
    switch (key) {
      // 寻源结果
      case 'quoteSource':
        return [
          {
            label: intl.get(`sodr.workspace.model.common.sourceNumAndLines`).d('寻源单号-行号'),
            name: 'sourceNum',
            width: 150,
            renderer: ({ record }) => {
              return `${record.get('sourceNum')}-${record.get('itemNum')}`;
            },
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          {
            label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
            name: 'itemNum',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
            name: 'companyNum',
            width: 150,
            renderer: ({ record }) => record.get('supplierCompanyNum'),
          },
          {
            label: intl.get('entity.company.name').d('公司名称'),
            name: 'supplierCompanyName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
            name: 'supplierNum',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
            name: 'supplierName',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.common.termId').d('付款条款'),
            name: 'termsName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
            name: 'organizationName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
            name: 'itemCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
            name: 'itemName',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
            name: 'categoryName',
            width: 170,
          },
          {
            label: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
            name: 'currencyCode',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomName',
            width: 120,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
            name: 'occupationQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
            name: 'availableQuantity',
            width: 120,
            align: 'right',
            renderer: ({ record }) =>
              doubleUnitEnabled
                ? record.get('secondaryAvailableQuantity')
                : record.get('availableQuantity'),
          },
          {
            label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
            name: 'taxRate',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.noTaxPrice2`).d('单价(不含税)'),
            name: 'unitPrice',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'secondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.noTaxAmount2`).d('金额(不含税)'),
            name: 'amountExcludingTax',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.TaxPrice2`).d('单价(含税)'),
            name: 'taxIncludedUnitPrice',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.TaxAmount2`).d('金额(含税)'),
            name: 'taxAmount',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
            name: 'validPromisedDate',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
            name: 'ladderOffer',
            width: 120,
            renderer: ({ record }) =>
              record.get('quotationLineId') ? (
                <a
                  onClick={() =>
                    showLadderQuote({
                      editable: false,
                      doubleUnitEnabled,
                      sourceInfo: record.toJSONData(),
                    })
                  }
                >
                  {intl.get(`spcm.common.model.ladderQuote`).d('阶梯价格')}
                </a>
              ) : (
                '-'
              ),
          },
          {
            label: intl.get(`entity.company.tag`).d('公司'),
            name: 'companyName',
            width: 120,
          },
          {
            label: intl.get(`entity.business.tag`).d('业务实体'),
            name: 'ouName',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
            name: 'purchaseOrganizatioName',
            width: 120,
          },
          // {
          //   label: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
          //   name: 'purchaseAgentName',
          //   width: 120,
          // },
          {
            label: intl.get(`entity.roles.creator`).d('创建人'),
            name: 'realName',
            width: 120,
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            name: 'creationDate',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
            name: 'prLineNum',
            width: 150,
            renderer: ({ record }) => {
              const prNum = record.get('prNum');
              const prLineNum = record.get('prLineNum');
              if (!prNum && !prLineNum) {
                return null;
              }
              return `${prNum || ''}-${prLineNum || ''}`;
            },
          },
          {
            label: intl
              .get(`spcm.common.model.common.displayPrNumLineNum`)
              .d('采购申请展示单号-行号'),
            name: 'prDisplayLineNum',
            width: 150,
            renderer: ({ record }) => {
              const { prDisplayNum, prDisplayLineNum } =
                record?.get(['prDisplayNum', 'prDisplayLineNum']) || {};
              if (!prDisplayNum && !prDisplayLineNum) {
                return null;
              }
              return `${prDisplayNum || ''}-${prDisplayLineNum || ''}`;
            },
          },
          {
            label: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
            name: 'rfxRoleMan',
            width: 120,
          },
          {
            label: intl.get(`hzero.common.remark`).d('备注'),
            name: 'itemRemark',
            width: 120,
          },
          {
            name: 'sourceItemRemark',
            width: 120,
          },
          {
            label: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
            name: 'contractPendingFlag',
            width: 100,
            renderer: ({ record }) => record.get('contractPendingFlagMeaning'),
          },
          {
            label: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
            name: 'resultStatus',
            width: 150,
            renderer: ({ record }) => record.get('resultStatusMeaning'),
          },
          {
            name: 'occupyStatus',
            width: 150,
          },
        ];
      // 采购申请
      case 'quotePurchase':
        return [
          {
            label: intl.get(`spcm.common.model.common.prNumAndLine`).d('采购申请编号-行号'),
            name: 'prNum',
            width: 160,
          },
          {
            name: 'displayLineNum',
            width: 80,
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          {
            label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
            name: 'itemCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
            name: 'itemName',
            width: 160,
          },
          // 推荐供应商
          {
            name: 'orderSupplierLov',
            width: 160,
            editor: true,
          },
          {
            label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
            name: 'categoryName',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
            name: 'taxIncludedUnitPrice',
            width: 160,
            align: 'right',
            renderer: ({ value }) => numberRender(value, 2),
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
            name: 'taxCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
            name: 'taxRate',
            width: 160,
            align: 'right',
            renderer: ({ value }) => numberRender(value, 2),
          },
          {
            label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
            name: 'currencyCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomName',
            width: 160,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            width: 120,
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 160,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
            name: 'availableQuantity',
            width: 160,
            align: 'right',
            renderer: ({ record }) =>
              doubleUnitEnabled
                ? record.get('secondaryAvailableQuantity')
                : record.get('availableQuantity'),
          },
          {
            label: intl.get(`spcm.common.model.executionStatusCode`).d('执行状态'),
            name: 'executionStatusCodeMeaning',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
            name: 'reqTypeCode',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
            name: 'supplierCode',
            width: 160,
            renderer: ({ record }) => (
              <span>{record.get('supplierCode') || record.get('supplierCompanyCode') || '-'}</span>
            ),
          },
          {
            label: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
            name: 'supplierName',
            width: 160,
            renderer: ({ record }) => (
              <span>{record.get('supplierName') || record.get('supplierCompanyName') || '-'}</span>
            ),
          },
          {
            label: intl.get(`spcm.common.model.companyName`).d('公司'),
            name: 'companyName',
            width: 160,
          },
          {
            name: 'ouName',
            width: 160,
          },
          {
            name: 'purchaseOrgName',
            width: 160,
          },
          {
            name: 'agentName',
            width: 160,
          },
          {
            name: 'invOrganizationName',
            width: 160,
          },
          {
            name: 'productNum',
            width: 160,
          },
          {
            name: 'productName',
            width: 160,
          },
          {
            name: 'catalogName',
            width: 160,
          },
          {
            name: 'prRequestedName',
            width: 160,
          },
          {
            name: 'contactTelNum',
            width: 160,
          },
          {
            name: 'invoiceAddress',
            width: 160,
          },
          {
            name: 'neededDate',
            width: 160,
          },
          {
            name: 'companyOrgName',
            width: 160,
          },
          {
            name: 'costAnchDepDesc',
            width: 160,
          },
          {
            name: 'expBearDep',
            width: 160,
          },
          {
            name: 'addressMeaning',
            width: 160,
          },
          {
            name: 'projectNum',
            width: 160,
          },
          {
            name: 'projectName',
            width: 160,
          },
          {
            name: 'prSourcePlatformMeaning',
            width: 160,
          },
          {
            name: 'executorName',
            width: 160,
          },
          {
            name: 'urgentDate',
          },
          {
            name: 'creationDate',
            width: 160,
          },
        ];
      // 采购订单
      default:
        return [
          {
            label: intl.get(`hzero.common.status`).d('状态'),
            name: 'displayStatusMeaning',
            width: 120,
            renderer: ({ record }) =>
              renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
          },
          {
            label: intl.get('ssta.purchaseSettle.common.poNums').d('采购订单编号-行号'),
            name: 'displayPoNum',
            width: 150,
            renderer: ({ value, record }) => `${value}-${record.get('displayLineNum')}`,
          },
          {
            name: 'projectTaskId',
            width: 150,
            renderer: ({ record }) => record.get('projectTaskName'),
          },
          {
            label: intl.get(`entity.supplier.code`).d('供应商编码'),
            name: 'supplierCode',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierCode') || record.get('supplierCompanyCode') || '-',
          },
          {
            label: intl.get(`entity.supplier.name`).d('供应商名称'),
            name: 'supplierName',
            fixed: 'left',
            width: 150,
            renderer: ({ record }) =>
              record.get('supplierName') || record.get('supplierCompanyName') || '-',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.version`).d('版本'),
            name: 'versionNum',
            width: 60,
          },
          {
            label: intl.get('spcm.common.model.common.termId').d('付款条款'),
            name: 'termsName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.releaseNum`).d('发放号'),
            name: 'releaseNum',
            width: 130,
          },
          // {
          //   label: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
          //   name: 'displayLineNum',
          //   width: 60,
          // },
          {
            label: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
            name: 'displayLineLocationNum',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
            name: 'itemCode',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
            name: 'itemName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
            name: 'categoryId',
            width: 150,
            renderer: ({ record }) => record.get('categoryName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.oldItemCodeNum`).d('旧物料号'),
            name: 'oldItemCode',
            width: 130,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.quantity`).d('数量'),
            name: 'quantity',
            width: 120,
            align: 'right',
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            name: 'secondaryQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.netReceivedQuantity`).d('净接收'),
            name: 'netReceivedQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.netDeliverQuantity`).d('净入库'),
            name: 'netDeliverQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
            name: 'notDeliverQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.invoicedQuantity`).d('已开票'),
            name: 'invoicedQuantity',
            width: 120,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.afterTaxunitPrice2`).d('单价(不含税)'),
            name: 'unitPrice',
            align: 'right',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
            name: 'enteredTaxIncludedPrice',
            align: 'right',
            width: 150,
          },
          doubleUnitEnabled && {
            name: 'secondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          doubleUnitEnabled && {
            name: 'taxIncludedSecondaryUnitPrice',
            width: 150,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.lineAmount`).d('行金额(不含税)'),
            name: 'lineAmount',
            align: 'right',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.common.taxIncludedLineAmount2`).d('行金额(含税)'),
            name: 'taxIncludedLineAmount',
            align: 'right',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
            name: 'unitPriceBatch',
            width: 40,
            align: 'right',
          },
          {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'uomId',
            width: 60,
            renderer: ({ record }) => record.get('uomCodeAndName'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            name: 'secondaryUomId',
            width: 120,
            renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
            name: 'taxCode',
            width: 60,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
            name: 'currencyCode',
            width: 60,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
            name: 'needByDate',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
            name: 'promiseDeliveryDate',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.specifications`).d('规格'),
            name: 'specifications',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.modelNum`).d('型号'),
            name: 'model',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.manufacturerName`).d('制造商'),
            name: 'manufacturerName',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.brand`).d('品牌'),
            name: 'brand',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.erpStatus`).d('ERP状态'),
            name: 'erpStatus',
            width: 130,
            renderer: ({ record }) => record.get('erpStatusMeaning'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.frozenStatus`).d('是否冻结'),
            name: 'frozenFlag',
            width: 130,
            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.consignedFlag`).d('是否寄售'),
            name: 'consignedFlag',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.projectCategory`).d('是否委外'),
            name: 'projectCategory',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.freeFlag`).d('是否免费'),
            name: 'freeFlag',
            width: 130,
            renderer: ({ record }) => record.get('freeMeaning'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.immedShippedFlag`).d('是否直发'),
            name: 'isImmedShippedFlag',
            width: 130,

            renderer: ({ value }) => {
              return value === 1
                ? intl.get(`hzero.common.status.yes`).d('是')
                : intl.get(`hzero.common.status.no`).d('否');
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.purchaserRemark`).d('采购方行备注'),
            name: 'remark',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.feedbackInfo`).d('反馈信息'),
            name: 'feedback',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.shipToThirdPartyName`).d('送达方'),
            name: 'shipToThirdPartyName',
            width: 150,
          },
          {
            label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('地点'),
            name: 'shipToThirdPartyAddress',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.contactPersonInfo`).d('联系人信息'),
            name: 'shipToThirdPartyContact',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.supplierSite`).d('供应商地点'),
            name: 'supplierSiteId',
            width: 150,
            renderer: ({ record }) => record.get('supplierSiteName'),
          },
          {
            label: intl.get(`entity.company.tag`).d('公司'),
            name: 'companyName',
            width: 150,
          },
          {
            label: intl.get('entity.business.tag').d('业务实体'),
            name: 'ouId',
            width: 150,
            renderer: ({ record }) => record.get('ouName'),
          },
          {
            label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
            name: 'purchaseOrgId',
            width: 180,
            renderer: ({ record }) => record.get('purOrganizationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
            name: 'purchaseAgentId',
            width: 120,
            renderer: ({ record }) => record.get('purchaseAgentName'),
          },
          {
            label: intl.get(`entity.organization.class.receiving`).d('收货组织'),
            name: 'invOrganizationId',
            width: 180,
            renderer: ({ record }) => record.get('invOrganizationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.inventoryName`).d('收货库房'),
            name: 'inventoryId',
            width: 180,
            renderer: ({ record }) => record.get('inventoryName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.locationName`).d('收货库位'),
            name: 'invLocationId',
            width: 120,
            renderer: ({ record }) => record.get('locationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.billToLocationName`).d('收单方'),
            name: 'billToLocationId',
            width: 180,
            renderer: ({ record }) => record.get('billToLocationName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
            name: 'erpCreationDate',
            width: 150,
          },
          {
            label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
            name: 'erpCreatedName',
            width: 120,
          },
          {
            label: intl.get(`sodr.common.model.common.department`).d('部门'),
            name: 'departmentId',
            width: 130,
            renderer: ({ record }) => record.get('departmentName'),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.releaseTime`).d('发布时间'),
            name: 'releasedDate',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.confirmedDate`).d('确认日期'),
            name: 'confirmedDate',
            width: 150,
          },
          {
            label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
            name: 'urgentFlag',
            width: 130,
            renderer: ({ value }) => yesOrNoRender(value),
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.urgentTime`).d('加急时间'),
            name: 'urgentDate',
            width: 150,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.contractNum`).d('合同编号'),
            name: 'erpContractNum',
            width: 160,
          },
          {
            label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
            name: 'displayPrNum',
            width: 150,
            renderer: ({ record }) => {
              const displayPrNum = record.get('displayPrNum');
              const displayPrLineNum = record.get('displayPrLineNum');
              if (!displayPrNum && !displayPrLineNum) {
                return null;
              }
              return `${displayPrNum || ''}-${displayPrLineNum || ''}`;
            },
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.productNum`).d('商品编码'),
            name: 'productNum',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.productName`).d('商品名称'),
            name: 'productName',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.commodityDirectory`).d('商品目录'),
            name: 'catalogName',
            width: 120,
          },
          {
            label: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
            name: 'poSourcePlatform',
            renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
          },
        ];
    }
  };

  const onFieldChange = async ({ name, value }) => {
    if (name === 'itemCodeLov') {
      const { itemId, itemCode } = value || {};
      dataSetMap[pcSourceKey].setQueryParameter('itemId', itemId);
      dataSetMap[pcSourceKey].setQueryParameter('itemCode', itemCode);
    }
  };

  return customizeTable(
    { code: dataSetMap[`${pcSourceKey}Code`] },
    <FilterBarTable
      dataSet={dataSetMap[pcSourceKey]}
      columns={createColumns(pcSourceKey)}
      style={{ maxHeight: 'calc(100% - 2px)' }}
      filterBarConfig={{
        onFieldChange,
      }}
    />
  );
};

export default flow(
  observer,
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS',
      'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2',
      'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
    ],
  })
)(SubjectInfo);
