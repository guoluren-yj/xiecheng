import React, { useContext, useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';

import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { SRM_SPRM } from '_utils/config';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { useModal } from 'components/Import';
import { filterNullValueObject, getResponse } from 'utils/utils';

// import CommonImport from 'hzero-front/lib/components/Import';
import { Button as PermissionButton } from 'components/Permission';
import CommentImport from 'hzero-front-himp/lib/components/CommonImport';
import { Modal, Button, Lov } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';

import { queryMapIdpValue } from 'services/api';
// import MobilePhone from '../../components/MoblePhone';
import { PriceModal } from '@/routes/components/priceModal';
import {
  deleteLines,
  fetchOtherInfo,
  fetchAutoGetCompany,
  fetchCnySelect,
  getImportTemplate,
} from '@/services/purchaseRequisitionCreationService';
import BatchEidtBtn from './BatchEidtBtn';
import BatchAdd from '../components/BatchAddBtn';
import PriceList from '../components/PriceList';
import { ItemCustom } from '../components/ItemCustomC7N';
import ReferencePrice from '../components/ReferencePrice';
import OutsourcingBom from '../components/OutsourcingBom';
import CustomSpecsModal from '../components/CustomSpecsModal';
import ViewPrimaryUrl from '@/routes/ProductImage.js';
import ProductSpecsModal from '../components/ProductSpecsModal';

import { renderAmount, colorRender } from '../hook';
import { Store } from '../stores';
import { AutoFillForm } from './AutoFillFormProvider';
import '../tag.less';
// import Icon from 'choerodon-ui/lib/icon/Icon';

const { openModal } = useModal();

const PurchaseLineInfo = function PurchaseLineInfo() {
  const {
    headerDs,
    listDs,
    prSourcePlatform,
    customizeTable,
    prHeaderId,
    organizationId,
    commonUpdate,
    uomControl,
    renderCreateLineColumns,
    handleCuxParaAdd,
    handleCuxRequest,
    handleCuxRequestPara,
    handleDefaultRowExpanded,
    remote,
    location,
    cuxLineRef,
  } = useContext(Store);
  const { renderAutoFillTip } = useContext(AutoFillForm);
  const [internationalTelCodeList, setTelCodeList] = useState([]); // 电话号码列表

  const tableRef = useRef(null);

  //  行新建
  const handleCreate = () => {
    const { current } = headerDs;
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
      ]) || {};
    const { originalCurrency: currencyCode } = initLineData;

    const internationalTelCode = internationalTelCodeList[0]?.value;

    Promise.all([
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
          ? cnyPrecisionList[0] || {}
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
        listDs.create(newList, 0);
      }
    });
  };

  // 行删除
  const handleLineDelete = async () => {
    const { selected } = listDs;
    const deleUpdateArr = selected.filter((ele) => ele.get('prLineStatusCode'));
    if (deleUpdateArr.length > 0) {
      // UI: 删除前增加提示
      const confirmPro = await new Promise((resolve) => {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm').d('提示'),
          children: (
            <p>{intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？')}</p>
          ),
          onOk: () => {
            resolve(true);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
      if (!confirmPro) return;
      const deleteLine = deleUpdateArr?.map((ele) => ele.toJSONData());
      deleteLines({ prHeaderId, prLines: deleteLine }).then((res) => {
        const data = getResponse(res);
        if (data) {
          listDs.remove(selected);
          commonUpdate(true);
          notification.success();
        }
      });
    } else {
      listDs.remove(selected);
    }
  };

  // 行导入
  const handleImport = () => {
    const templateCode = 'SPRM.PR_PLATFORM_LINE';
    const importProps = {
      code: templateCode,
      sync: false,
      auto: false,
      refreshButton: 'true',
      historyButton: 'true',
      prefixPatch: undefined,
      args: JSON.stringify({
        tenantId: organizationId,
        templateCode,
        prHeaderId,
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId: organizationId, // 租户的传
      action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      key: `/sprm/purchase-requisition-creation/data-import/${templateCode}`,
    };
    const cuxImportProps = remote.process(
      'SPRM_PURCHASE_PLAFORM_CREATE.PURCHASELINE_IMPORTPROPS',
      importProps,
      { headerDs }
    );
    Modal.open({
      key: Modal.key(),
      children: <CommentImport {...cuxImportProps} />,
      closable: false,
      movable: false,
      destroyOnClose: true,
      onCancel: () => {},
      style: { width: '1200px', marginTop: '-30px' },
      onOk: () => {
        commonUpdate();
      },
      footer: (okBtn) => <div>{okBtn}</div>,
    });
  };

  // 行导入新
  const handleImportNew = async () => {
    const [headerData] = await headerDs?.toJSONData();
    const data = await getImportTemplate(headerData);
    const { workbenchLineImportTplCode = 'SPRM.PR_PLATFORM_LINE' } = data || {};
    openModal({
      refreshButton: true,
      prefixPatch: SRM_SPRM,
      args: {
        tenantId: organizationId,
        templateCode: workbenchLineImportTplCode || 'SPRM.PR_PLATFORM_LINE',
        prHeaderId,
      },
      businessObjectTemplateCode: workbenchLineImportTplCode || 'SPRM.PR_PLATFORM_LINE',
      successCallBack: () => {
        notification.success();
        commonUpdate();
      },
    });
  };

  useEffect(() => {
    // 查询批量维护字段;
    queryMapIdpValue({
      telCodeList: 'HPFM.IDD',
    }).then((res) => {
      if (res) {
        const { telCodeList = [] } = res;
        setTelCodeList(telCodeList);
      }
    });
  }, []);

  const DeleteBtn = observer(() => {
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        name="deleteItems"
        onClick={() => handleLineDelete()}
        disabled={listDs.selected.length === 0}
      >
        {intl.get('hzero.common.button.batchDelete').d('删除')}
      </Button>
    );
  });

  const TableButton = useMemo(() => {
    const btns = [];
    if (prSourcePlatform === 'SRM') {
      btns.push(
        <Button
          key="create"
          funcType="flat"
          icon="playlist_add"
          color="primary"
          name="addItems"
          onClick={() => handleCreate()}
        >
          {intl.get('hzero.common.btn.add').d('新增')}
        </Button>,
        <DeleteBtn name="deleteItems" />,
        <PermissionButton
          key="import"
          funcType="flat"
          icon="archive"
          type="c7n-pro"
          color="primary"
          name="importOld"
          onClick={() => handleImport()}
          disabled={!prHeaderId}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.pr-line.import`,
              type: 'button',
              meaning: '申请行导入',
            },
          ]}
        >
          {intl.get('sprm.purchaseReqCreation.view.button.lineImport').d('申请行导入')}
        </PermissionButton>,
        <PermissionButton
          key="importNew"
          funcType="flat"
          icon="archive"
          type="c7n-pro"
          color="primary"
          name="importNew"
          onClick={() => handleImportNew()}
          disabled={!prHeaderId}
          permissionList={[
            {
              code: `hzero.srm.requirement.prm.pr-platform.ps.new.pr-line.import`,
              type: 'button',
              meaning: '申请行导入',
            },
          ]}
        >
          {intl.get('sprm.purchaseReqCreation.view.button.lineImport').d('申请行导入')}
          <span className="srm-common-import-button-tag">NEW</span>
        </PermissionButton>,
        <BatchAdd
          name="batchAdd"
          internationalTelCodeList={internationalTelCodeList}
          addType="createAdd"
        />
        // <CommonImport
        //   prefixPatch={`${SRM_SPRM}`}
        //   name="importNew"
        //   buttonProps={{
        //     disabled: !prHeaderId,
        //     funcType: 'flat',
        //     color: 'primary',
        //     permissionList: [
        //       {
        //         code: `hzero.srm.requirement.prm.pr-platform.ps.new.pr-line.import`,
        //         type: 'button',
        //         meaning: '申请行导入-新',
        //       },
        //     ],
        //   }}
        //   args={{
        //     tenantId: organizationId,
        //     templateCode: 'SPRM.PR_PLATFORM_LINE',
        //     prHeaderId,
        //   }}
        //   businessObjectTemplateCode="SPRM.PR_PLATFORM_LINE"
        //   buttonText={intl
        //     .get('sprm.purchaseReqCreation.view.button.lineImport.new')
        //     .d('申请行导入')}
        //   successCallBack={() => {
        //     notification.success();
        //     commonUpdate();
        //   }}
        // />
      );
    }
    btns.push(<BatchEidtBtn name="editBatch" />);
    return btns;
  }, [prSourcePlatform, prHeaderId]);

  const allowEdit = (record) => {
    if (record && record.get('linePriceHiddenFlag') === 1) {
      return false;
    }
    return true;
  };

  const viewPrimaryUrl = ({ record }) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      children: <ViewPrimaryUrl currentPrLineId={record?.get('prLineId')} />,
    });
  };

  const lineColumns = useMemo(() => {
    let allCols = [
      {
        name: 'displayLineNum',
        width: 100,
      },
      {
        name: 'prLineStatusCodeMeaning',
        width: 100,
        renderer: ({ value, record }) => {
          return colorRender(record.get('prLineStatusCode'), value);
        },
      },
      {
        name: 'invOrganizationIdLov',
        width: 220,
        editor: true,
      },
      {
        name: 'productNum',
        width: 100,
      },
      {
        name: 'productName',
        width: 200,
      },
      {
        name: 'primaryUrl',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => viewPrimaryUrl({ record })}>
            {intl.get('sprm.common.model.view.primaryUrl').d('查看主图')}
          </a>
        ),
      },
      { name: 'thirdSkuCode', width: 100 },
      { name: 'thirdSkuName', width: 100 },
      { name: 'productBrand', width: 100 },
      { name: 'productModel', width: 100 },
      { name: 'packingList', width: 100 },
      {
        name: 'itemCodeLov',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 200,
        editor: true,
      },
      {
        name: 'itemModel',
        width: 100,
        editor: true,
      },
      {
        name: 'itemSpecs',
        width: 100,
        editor: true,
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customMadeFlag',
        width: 100,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customAttributeList',
        width: 100,
        renderer: ({ record }) =>
          record.get('customMadeFlag') === 1 ? <ItemCustom record={record} /> : null,
      },
      {
        name: 'categoryLov',
        width: 140,
        // editor: true,
        editor: (record) => (
          <Lov
            editor
            dataSet={listDs}
            name="categoryLov"
            tableProps={{
              mode: 'tree',
              defaultRowExpanded: handleDefaultRowExpanded,
              onRow: (row) => {
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
                      record.set({
                        categoryLov: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
          />
        ),
      },
      {
        name: 'catalogName',
        width: 100,
      },
      {
        name: 'neededDate',
        width: 150,
        editor: true,
      },
      {
        name: 'outsourcingBomFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'outsourcingBom',
        width: 150,
        renderer: ({ record }) =>
          record?.get('outsourcingBomFlag') ? (
            <OutsourcingBom
              record={record}
              headerDs={headerDs}
              customizeTable={customizeTable}
              custCode="SPRM.PURCHASE_PLAFORM_CREATE.OUTSOURCINGBOM"
            />
          ) : null,
      },
      {
        name: 'secondaryUomId',
        width: 100,
        editor: true,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
        editor: true,
      },
      {
        name: 'quantity',
        width: 100,
        editor: () => uomControl !== 1,
        type: 'number',
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 100,
        editor: (record) => allowEdit(record) && headerDs.getState('basePriceFlag'),
        renderer: renderAmount,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 100,
        editor: (record) =>
          uomControl === 1 ? false : allowEdit(record) && headerDs.getState('basePriceFlag'),
        renderer: renderAmount,
      },
      {
        name: 'uomLov',
        width: 100,
        editor: () => uomControl !== 1,
      },
      {
        name: 'taxLov',
        width: 100,
        editor: true,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'currencyLov',
        width: 100,
        editor: true,
      },

      {
        name: 'lastPurPrice',
        width: 100,
        renderer: ({ record }) => (
          <PriceModal
            {...{
              item: record.get(['lastPurchasePrice', 'poLineId']),
            }}
          />
        ),
      },
      {
        name: 'unitPriceBatch',
        width: 100,
        editor: true,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 100,
        align: 'right',
        editor: allowEdit,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxSum',
        editor: allowEdit,
        width: 100,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxUnit',
        width: 100,
        align: 'right',
        editor: allowEdit,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxSum',
        editor: allowEdit,
        align: 'right',
        width: 100,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxUnit',
        editor: allowEdit,
        align: 'right',
        width: 100,
        renderer: renderAmount,
      },
      {
        name: 'supplierCompanyIdLov',
        width: 100,
        editor: true,
      },
      {
        name: 'supplierList',
        width: 100,
        editor: true,
      },
      {
        name: 'referencePriceDisplayFlag',
        width: 100,
        // renderer: ({ record }) => <ReferPrice currentRecord={record} fetchPrice={fetchPrice} />,
        renderer: ({ record }) => (
          <ReferencePrice
            record={record}
            headerDs={headerDs}
            sourceForm="create"
            uomControl={uomControl}
            remote={remote}
          />
        ),
      },
      {
        name: 'prRequestedLov',
        width: 100,
        editor: true,
      },
      {
        name: 'purchaseAgentLov',
        width: 100,
        editor: true,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'accountSubjectLov',
        width: 100,
        editor: true,
      },
      {
        name: 'costLov',
        width: 100,
        editor: true,
      },
      {
        name: 'expBearDepLov',
        width: 100,
        editor: true,
      },
      {
        name: 'projectNum',
        width: 100,
        editor: true,
      },
      {
        name: 'projectName',
        width: 100,
        editor: true,
      },
      {
        name: 'projectCategoryLov',
        width: 100,
        editor: true,
      },
      {
        name: 'wbsLov',
        width: 100,
        editor: true,
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        width: 100,
        align: 'right',
        editor: true,
        renderer: renderAmount,
      },
      {
        name: 'budgetIoFlag',
        width: 100,
        editor: true,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'budgetAccountLov',
        width: 100,
        editor: true,
      },
      {
        name: 'pcNum',
        width: 100,
      },
      {
        name: 'receiveAddress',
        width: 100,
        editor: true,
      },
      {
        name: 'receiveContactName',
        width: 100,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 280,
        editor: true,
      },
      {
        name: 'lineFreight',
        width: 100,
        editor: true,
        align: 'right',
        renderer: renderAmount,
      },
      {
        name: 'remark',
        width: 100,
        editor: true,
      },
      {
        name: 'mallLineNum',
        width: 100,
      },
      {
        name: 'productSpecsJson',
        width: 100,
        renderer: ({ value }) => {
          return <ProductSpecsModal value={value} />;
        },
      },
      {
        name: 'priceList', // 比价单
        width: 100,
        // eslint-disable-next-line no-unused-vars
        renderer: ({ record }) => {
          return <PriceList record={record} />;
        },
      },
      {
        name: 'budgetOccupyFlag',
        width: 100,
      },
      {
        name: 'projectTaskId',
        width: 100,
        editor: (record) => (
          <Lov
            editor
            dataSet={listDs}
            name="projectTaskId"
            tableProps={{
              mode: 'tree',
              onRow: (row) => {
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
                      record.set({
                        projectTaskId: row?.record?.toData(),
                      });
                      Modal.destroyAll();
                    }
                  },
                };
              },
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
          />
        ),
      },
      {
        name: 'attachmentUuid',
        width: 100,
        editor: true,
      },
    ];

    const baseUomInfo =
      uomControl === 1 ? [] : ['secondaryUomId', 'secondaryTaxInUnitPrice', 'secondaryQuantity'];
    // 来源计划行
    if (headerDs?.current?.get('rpSourceFlag') === 1) {
      allCols.push({ name: 'rpSourceNum', width: 100 });
    }

    // E-COMMERCE
    if (prSourcePlatform === 'E-COMMERCE') {
      allCols = allCols
        .concat([
          {
            name: 'skuType',
            width: 100,
          },
          {
            name: 'customUomName',
            width: 100,
          },
          { width: 100, name: 'customUomName' },
          {
            name: 'customQuantity',
            width: 100,
          },
          {
            name: 'packageQuantity',
            width: 100,
          },
          {
            width: 100,
            name: 'customSpecsJson',
            renderer: ({ value }) => {
              return <CustomSpecsModal value={value} />;
            },
          },
        ])
        .filter(
          (ele) =>
            ![
              'lastPurPrice',
              'receiveAddress',
              'receiveContactName',
              'receiveTelNum',
              'unitPriceBatch',
              'customMadeFlag',
              'customAttributeList',
              'referencePriceDisplayFlag',
              ...baseUomInfo,
            ].includes(ele.name)
        );
    }

    // CATALOGUE
    if (prSourcePlatform === 'CATALOGUE') {
      const concatList = allCols.concat([
        {
          name: 'skuType',
          width: 100,
        },
        {
          name: 'customUomName',
          width: 100,
        },
        { width: 100, name: 'customUomName' },
        {
          name: 'customQuantity',
          width: 100,
        },
        {
          name: 'packageQuantity',
          width: 100,
        },
        {
          width: 100,
          name: 'customSpecsJson',
          renderer: ({ value }) => {
            return <CustomSpecsModal value={value} />;
          },
        },
      ]);
      allCols = concatList.filter(
        (ele) =>
          ![
            'unitPriceBatch',
            'lastPurPrice',
            'customMadeFlag',
            'customAttributeList',
            'referencePriceDisplayFlag',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    // SHOP
    if (prSourcePlatform === 'SHOP') {
      allCols = allCols.filter(
        (ele) =>
          ![
            'productNum',
            'productName',
            'catalogName',
            'primaryUrl',
            'lastPurPrice',
            'thirdSkuCode',
            'productBrand',
            'productModel',
            'packingList',
            'thirdSkuName',
            'productSpecsJson',
            'customMadeFlag',
            'customAttributeList',
            'referencePriceDisplayFlag',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    // ERP
    if (prSourcePlatform === 'ERP') {
      allCols = allCols.filter(
        (ele) =>
          ![
            'productNum',
            'productName',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'primaryUrl',
            'productModel',
            'packingList',
            'projectTaskId',
            'catalogName',
            'productSpecsJson',
            'referencePriceDisplayFlag',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    // SRM
    if (['SRM', null, undefined].includes(prSourcePlatform)) {
      allCols = allCols.filter(
        (ele) =>
          ![
            'mallLineNum',
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'productBrand',
            'productModel',
            'packingList',
            'catalogName',
            'productSpecsJson',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    return isFunction(renderCreateLineColumns)
      ? renderCreateLineColumns({ lineColumns: allCols, prSourcePlatform, headerDs, listDs })
      : allCols;
  }, [prSourcePlatform, headerDs, renderCreateLineColumns]);

  const cuxTableProps = remote.process(
    'SPRM_PURCHASE_PLAFORM_LINE_CHANGE_TABLE',
    {},
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASELINE',
      headerDs,
      listDs,
      lineColumns,
      location,
    }
  );

  const table = customizeTable(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASELINE',
      buttonCode: 'SPRM.PURCHASE_PLAFORM_CREATE.TABLE_BTNS',
      dataSet: listDs,
      // __force_record_to_update__: true,
      custLoading: false,
      lovIgnore: false,
    },
    <SearchBarTable
      code="editTable"
      style={{ maxHeight: '450px' }}
      pagination={{
        pageSizeOptions: ['10', '20', '50', '100', '200'],
      }}
      virtual
      virtualSpin
      virtualCell
      ref={tableRef}
      dataSet={listDs}
      columns={lineColumns}
      buttons={TableButton}
      searchCode="SPRM.PURCHASE_PLAFORM_CREATE.PURCHASELINE_SEARCHBAR"
      {...cuxTableProps}
    />
  );

  useLayoutEffect(() => {
    if (prSourcePlatform === 'SRM') {
      renderAutoFillTip(tableRef?.current?.props);
    }
  }, [tableRef, listDs, prSourcePlatform]);

  const remoteRender = remote.render('SPRM_PURCHASE_PLAFORM_LINE_REMOTE_RENDER', <></>, {
    headerDs,
    listDs,
  });

  const remoteRenderBottom = remote.render(
    'SPRM_PURCHASE_PLAFORM_LINE_REMOTE_RENDER_BOTTOM',
    <></>,
    {
      headerDs,
      listDs,
      prHeaderId,
      cuxLineRef,
    }
  );

  return (
    <>
      {remoteRender}
      {table}
      {remoteRenderBottom}
    </>
  );
};

export default PurchaseLineInfo;
