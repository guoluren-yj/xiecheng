import React from 'react';

import { DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil, isFunction } from 'lodash';
import notification from 'utils/notification';
import SupplierModalForm from './SupplierModalForm';
import { headDs, lineDs } from '../../Execution/executionDs/supplierDs';

const ReferPrice = ({ currentRecord, sourceType, ...props }) => {
  const openModal = () => {
    const referLineDs = new DataSet(lineDs({ currentData: currentRecord?.toData() }));
    const headerDs = new DataSet(headDs({ currentData: currentRecord?.toData() }));
    headerDs.loadData([currentRecord?.toData()]);
    referLineDs.setQueryParameter(
      'queryPriceAddressId',
      currentRecord.get('defaultOrderingAddressId')
    );

    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl
        .get(`sprm.common.model.common.chooseSupplierPrice`)
        .d('选择收货地址、推荐供应商及价格'),
      children: (
        <SupplierModalForm
          headerDs={headerDs}
          referLineDs={referLineDs}
          currentRecord={currentRecord}
          {...props}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      cancelText: intl.get('hzero.common.status.back').d('返回'),
      onOk: async () => {
        if (referLineDs?.selected?.length) {
          const [selectedRow] = referLineDs?.selected;
          const { updateSupplierCb = undefined, remote = undefined, prLineId = undefined } = props;
          const {
            addressId: defaultOrderingAddressId,
            fullAddress: defaultOrderingAddress,
            mobile: defaultContactPhone,
            contactName: defaultContactPerson,
          } = headerDs?.current?.get('defaultOrderingAddressId') || {};
          const selectedData = selectedRow.toData() || {};
          const {
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            netPrice,
            priceLibId,
            priceLibraryId,
            taxIncludedPrice,
            taxIncludedUnitPrice,
            enteredTaxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            supplierCompanyId: selectSupplierCompanyId,
            supplierCompanyNum: selectSupplierCode,
            supplierCompanyName: selectSupplierCompanyName,
            supplierId: selectLocalSupplierId,
            supplierCode: selectLocalSupplierCode,
            supplierName: selectLocalSupplierName,
            prReferencePriceLibraryVO,
            marketPrice,
            productEcSourceFrom,
            ecLimitQuantity,
            skuId,
            prPriceSource,
            prPriceSourceMeaning,
            priceLibraryStatus,
            priceBatchQuantity,
            taxPrice,
          } = selectedData;
          const difTabParams =
            sourceType === 'order'
              ? {
                  supplierLov: {
                    priceLibraryId,
                    supplierCompanyId: selectSupplierCompanyId,
                    supplierCompanyNum: selectSupplierCode,
                    supplierCompanyName: selectSupplierCompanyName,
                    displaySupplierCompanyName:
                      selectSupplierCompanyName || selectLocalSupplierName,
                    selectLocalSupplierId,
                    displaySupplierCompanyId: selectLocalSupplierId,
                    displaySupplierCompanyNum: selectLocalSupplierCode,
                    selectLocalSupplierName,
                    netPrice,
                  },
                  platformSupplierId: selectSupplierCompanyId,
                  uomId,
                  taxIncludedUnitPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                  uomName,
                  uomCodeAndName,
                  currencyCode,
                  taxId,
                  taxRate,
                  noUnitPrice: netPrice,
                  unitPrice: netPrice,
                  priceLibraryId,
                  priceLibId,
                  taxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                  unitPriceBatch: priceBatchQuantity || unitPriceBatch,
                  holdPcHeaderId,
                  holdPcLineId,
                  contractNum,
                  benchmarkPriceType,
                  ladderPriceLibId,
                  ladderQuotationFlag,
                  originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
                  enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                }
              : {
                  orderSupplierLov: {
                    priceLibraryId,
                    supplierCompanyId: selectSupplierCompanyId,
                    supplierCompanyNum: selectSupplierCode,
                    supplierCompanyName: selectSupplierCompanyName,
                    displaySupplierCompanyName:
                      selectSupplierCompanyName || selectLocalSupplierName,
                    selectLocalSupplierId,
                    displaySupplierCompanyId: selectLocalSupplierId,
                    displaySupplierCompanyNum: selectLocalSupplierCode,
                    selectLocalSupplierName,
                    netPrice,
                  },
                  platformSupplierId: selectSupplierCompanyId,
                  prReferencePriceLibraryVO: {
                    uomId,
                    changeUpdateFlag: 1,
                    uomCode,
                    uomName,
                    uomCodeAndName,
                    currencyCode,
                    taxId,
                    taxRate,
                    noUnitPrice: netPrice,
                    unitPrice: netPrice,
                    priceLibId,
                    priceLibraryId: priceLibId === null ? null : priceLibraryId,
                    skuId,
                    taxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                    priceLibraryStatus,
                    unitPriceBatch: priceBatchQuantity || unitPriceBatch,
                    holdPcHeaderId,
                    holdPcLineId,
                    taxIncludedUnitPrice,
                    contractNum,
                    benchmarkPriceType,
                    ladderPriceLibId,
                    ladderQuotationFlag,
                    originUnitPrice:
                      benchmarkPriceType === 'NET_PRICE'
                        ? netPrice
                        : enteredTaxIncludedPrice || taxIncludedPrice,
                    enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
                    selectLocalSupplierCode: isNil(selectLocalSupplierId)
                      ? null
                      : selectSupplierCode,
                    selectLocalSupplierId: isNil(selectLocalSupplierId)
                      ? null
                      : selectLocalSupplierId,
                    selectLocalSupplierName: isNil(selectLocalSupplierId)
                      ? null
                      : selectLocalSupplierName,
                  },
                  priceLibraryStatus,
                  priceLibId,
                  skuId,
                  priceLibraryId: priceLibId === null ? null : priceLibraryId,
                };
          currentRecord.set({
            marketPrice,
            skuId,
            productEcSourceFrom,
            noUnitPrice: netPrice,
            priceSource:
              prPriceSource === 'MANUALLY_E-COMMERCE_PRODUCT'
                ? 'E-COMMERCE_PRODUCT'
                : prPriceSource,
            priceSourceMeaning: prPriceSourceMeaning,
            priceProductId: skuId,
            priceEcPlatformCode: productEcSourceFrom,
            ecLimitQuantity,
            orderSupplierBtnFlag: 1,
            defaultOrderingAddressId,
            defaultOrderingAddress,
            defaultContactPhone,
            defaultContactPerson,
            priceLibraryStatus: prReferencePriceLibraryVO?.priceLibraryStatus || 'VALID',
            ...difTabParams,
            selectSupplierCompanyId,
            selectSupplierCode,
            selectSupplierCompanyName,
            selectLocalSupplierId,
            selectLocalSupplierCode,
            selectLocalSupplierName,
          });
          if (remote) {
            const beforeUpdateSupplierCb = await remote.event.fireEvent('beforeUpdateSupplierCb', {
              platformSupplierId: selectSupplierCompanyId,
              prLineId,
              taxPrice,
              selectedData,
            });
            if (beforeUpdateSupplierCb === false) {
              return false;
            }
          }
          if (updateSupplierCb && isFunction(updateSupplierCb)) {
            updateSupplierCb(currentRecord, selectedData, 'allSingleGetSupplier');
          }
        } else {
          notification.error({
            message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
          });
          return false;
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
    });
  };

  const flag =
    currentRecord &&
    currentRecord.get('itemCode') &&
    currentRecord.get('prSourcePlatform') !== 'CATALOGUE';

  return flag ? (
    <a onClick={openModal}>
      {intl.get('sodr.workspace.model.common.recommendedSupplier').d('推荐供应商')}
    </a>
  ) : null;
};

export default ReferPrice;

// export default withCustomize({
//   unitCode: ['SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL'],
// })(ReferPrice);
