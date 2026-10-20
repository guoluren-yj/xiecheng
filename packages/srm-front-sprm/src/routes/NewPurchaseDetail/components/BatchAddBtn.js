import React, { useContext } from 'react';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { isFunction, isArray, isNumber } from 'lodash';
import { Modal, NumberField, DatePicker, Lov, Form } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
import uuid from 'uuid/v4';

import { Button } from 'components/Permission';
import { filterNullValueObject } from 'utils/utils';
import {
  fetchOtherInfo,
  fetchAutoGetCompany,
  fetchCnySelect,
  getItemInfo,
  getBatchCategories,
} from '@/services/purchaseRequisitionCreationService';

import { getResponse } from 'hzero-front/lib/utils/utils';
import { Store } from '../stores';

const BatchEidtBtn = function BatchEidtBtn({ internationalTelCodeList, addType }) {
  const {
    headerDs,
    batchAddDs,
    customizeForm,
    listDs,
    addLineDs,
    uomControl,
    uomCodeAndNameRule,
    handleCuxParaAdd,
    handleCuxRequest,
    handleCuxRequestPara,
    remote,
  } = useContext(Store) || {};

  const handleBatchCreate = async () => {
    const { current } = headerDs || {};
    const headerInfo = { ...(current?.toData() || {}), prLineList: undefined };
    const cuxParaInit = isFunction(handleCuxParaAdd)
      ? handleCuxParaAdd({ headerInfo, headerDs }) || {}
      : {};
    const initLineData =
      current?.get([
        'purchaseAgentId',
        'purchaseAgentName',
        'requestedBy',
        'prRequestedNum',
        'prRequestedName',
        'originalCurrency',
        'defaultPrecision',
        'financialPrecision',
        'localFinancialPrecision',
        'localDefaultPrecision',
        'companyId',
        'ouId',
        'prTypeId',
      ]) || {};
    const { originalCurrency: currencyCode } = initLineData;

    const internationalTelCode = internationalTelCodeList
      ? internationalTelCodeList[0]?.value
      : null;

    return Promise.all([
      fetchOtherInfo(headerInfo),
      fetchAutoGetCompany({ ouId: current?.get('ouId') }),
      fetchCnySelect({ currencyCode }),
      typeof handleCuxRequest === 'function' ? handleCuxRequest({ headerInfo }) : Promise.resolve(),
    ]).then(([res1, res2, res3, ...cuxRes]) => {
      if (res1 && res2 && res3) {
        const { unitCode, unitId, unitName, userId, userName, ...otherInfo } = res1;
        const {
          organizationId: invOrganizationId,
          organizationName: invOrganizationName,
          address: receiveAddress,
          inventoryId,
          ...otherRes
        } = res2;

        const cnyPrecisionList = res3?.content || [];

        const { defaultPrecision, financialPrecision } = cnyPrecisionList[0]
          ? cnyPrecisionList[0]
          : {};

        const newList = {
          currencyCode: initLineData.originalCurrency,
          ...initLineData,
          agentName: initLineData.purchaseAgentName,
          _status: 'create',
          defaultPrecision:
            cnyPrecisionList?.length === 1 && currencyCode
              ? defaultPrecision
              : initLineData.defaultPrecision,
          financialPrecision:
            cnyPrecisionList?.length === 1 && currencyCode
              ? financialPrecision
              : initLineData.financialPrecision,
          invOrganizationId,
          prSourcePlatform: 'SRM',
          invOrganizationName,
          attachmentUuId: uuid(),
          receiveAddress,
          ...filterNullValueObject(otherRes),
          ...filterNullValueObject(otherInfo),
          expBearDep: unitName,
          expBearDepId: unitId,
          expBearDepCode: unitCode,
          expBearDepMeaning: unitName,
          accepterUserName: userName,
          accepterUserId: userId,
          internationalTelCode,
          prRequestedNumAndName: initLineData.prRequestedNum
            ? `${initLineData.prRequestedNum}-${initLineData.prRequestedName}`
            : null,
          accepterUserIdMeaning: userName,
          ...cuxParaInit,
        };
        if (typeof handleCuxRequestPara === 'function') {
          Object.assign(newList, { ...handleCuxRequestPara({ res: cuxRes, headerInfo }) });
        }
        console.log(newList);
        batchAddDs.create(newList, 0);
        Modal.open({
          style: { width: 380 },
          title: intl.get('sprm.common.common.title.batchAdd').d('批量新增'),
          closable: true,
          drawer: true,
          key: Modal.key(),
          children: customizeForm(
            {
              code: 'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_ADD',
              dataSet: batchAddDs,
            },
            <Form dataSet={batchAddDs} columns={1} labelLayout="float" useColon={false}>
              <Lov name="invOrganizationId" />
              <Lov
                name="categoryId"
                editor
                dataSet={batchAddDs}
                tableProps={{
                  mode: 'tree',
                  onRow: row => {
                    const handleSelect = ({ dataSet, record: _record }) => {
                      if (dataSet && _record) {
                        dataSet.select(_record);
                      }
                    };
                    return {
                      onClick: () => handleSelect(row),
                      onDoubleClick: () => {
                        if (row?.record?.selectable) {
                          handleSelect(row);
                        }
                      },
                    };
                  },
                  selectionMode: 'rowbox',
                  virtual: true,
                  style: { maxHeight: '500px' },
                }}
              />
              <Lov name="itemCode" />
              <NumberField name="quantity" />
              <DatePicker name="neededDate" />
            </Form>
          ),
          onOk: async () => {
            const validateFlag = await batchAddDs.validate();
            if (validateFlag) {
              const [data] = batchAddDs.toJSONData();
              const { quantity, categoryId, itemId, itemCode, ...others } = data || {};
              if (uomControl) {
                const itemCategorys = categoryId
                  ? null
                  : getResponse(
                      await getBatchCategories({
                        defaultFlag: '1',
                        enabledFlag: '1',
                        itemIds: itemId,
                      })
                    );
                const itemCategorysObj = {};
                if (itemCategorys && isArray(itemCategorys)) {
                  itemCategorys.forEach(item => {
                    const {
                      itemId: currentItemId,
                      categoryId: itemCategoryId,
                      categoryName,
                      categoryCode,
                    } = item;
                    itemCategorysObj[currentItemId] = {
                      categoryId: itemCategoryId,
                      categoryName,
                      categoryCode,
                    };
                  });
                }
                const res = getResponse(await getItemInfo({ itemId, quantity }));
                if (res && isArray(res)) {
                  const activedDs = addType === 'createAdd' ? listDs : addLineDs;
                  res.forEach(e => {
                    const itemValues = itemCode?.find(i => i?.itemId === e?.itemId);
                    activedDs.create(
                      {
                        ...others,
                        quantity: e?.primaryQuantity,
                        secondaryQuantity: quantity,
                        ...(itemCategorysObj[(e?.itemId)] || { categoryId }),
                        itemModel: itemValues?.model,
                        itemSpecs: itemValues?.specifications,
                        brand: itemValues?.brand,
                        ...e,
                      },
                      0
                    );
                  });
                } else {
                  return false;
                }
              } else {
                // 获取物料分类逻辑，当未选择物料分类时，由物料编码查询带出。为减少多层遍历，将结构[]打平为 itemId:{categoryId,categoryName,categoryCode}
                const itemCategorys = categoryId
                  ? null
                  : getResponse(
                      await getBatchCategories({
                        defaultFlag: '1',
                        enabledFlag: '1',
                        itemIds: itemId,
                      })
                    );
                const itemCategorysObj = {};
                if (itemCategorys && isArray(itemCategorys)) {
                  itemCategorys.forEach(item => {
                    const {
                      itemId: currentItemId,
                      categoryId: itemCategoryId,
                      categoryName,
                      categoryCode,
                    } = item || {};
                    itemCategorysObj[currentItemId] = {
                      categoryId: itemCategoryId,
                      categoryName,
                      categoryCode,
                    };
                  });
                }
                // 赋值逻辑
                const activedDs = addType === 'createAdd' ? listDs : addLineDs;
                itemCode.forEach(e => {
                  const {
                    uomId,
                    uomName,
                    uomCode,
                    uomPrecision,
                    brand,
                    specifications,
                    model,
                    uomCodeAndName,
                    itemName,
                    itemId: eItemId,
                  } = e || {};
                  const cuxFieldsData = remote.process(
                    'SPRM_PRDETAIL_REMOTE_BATCHADD_CUXFIELDSDATA',
                    {},
                    { item: e }
                  );
                  activedDs.create(
                    {
                      ...(itemCategorysObj[eItemId] || { categoryId }),
                      ...others,
                      itemId: e?.itemId,
                      itemCode: e?.itemCode,
                      itemName,
                      quantity: isNumber(uomPrecision)
                        ? math.toFixed(quantity, uomPrecision)
                        : quantity,
                      itemModel: model,
                      itemSpecs: specifications,
                      uomId,
                      uomName,
                      uomCode,
                      uomPrecision,
                      brand,
                      specifications,
                      uomCodeAndName:
                        uomCodeAndNameRule || !uomCodeAndName
                          ? `${uomCode}/${uomName}`
                          : uomCodeAndName || uomName,
                      ...cuxFieldsData,
                    },
                    0
                  );
                });
              }
            } else {
              return false;
            }
          },
          onCancel: () => {
            batchAddDs.reset();
          },
        });
      }
    });
  };

  return (
    <Button
      funcType="flat"
      icon="playlist_add"
      color="primary"
      onClick={handleBatchCreate}
      type="c7n-pro"
      permissionList={[
        {
          code: `hzero.srm.requirement.prm.pr-platform.button.batchAdd`,
          type: 'button',
        },
      ]}
    >
      {intl.get('sprm.common.common.title.batchAdd').d('批量新增')}
    </Button>
  );
};

export default BatchEidtBtn;
