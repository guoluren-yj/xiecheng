import React, { useMemo, useEffect } from 'react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { Tag } from 'choerodon-ui';
import { isFunction } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import { useDataSet, Tooltip, Modal } from 'choerodon-ui/pro';

import { PriceModal } from '@/routes/components/priceModal';
import ViewPrimaryUrl from '@/routes/ProductImage.js';
import PriceList from './PriceList';
import { ItemCustom } from './ItemCustomC7N';
import CustomSpecsModal from './CustomSpecsModal';
import ProductSpecsModal from './ProductSpecsModal';

import { line } from '../store';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const PurchaseLineInfo = function PurchaseLineInfo(props) {
  const { ds, code, isChange, isCancel, isShowAll, uomControl, customizeTable } = props;

  const colorRender = (value, meaning) => {
    if (['SUBMIT_SYNC', 'EXCUTED', 'ASSIGNED', 'APPROVED'].includes(value)) {
      // 绿色
      return (
        <Tag color="green" style={{ border: 'none' }}>
          {meaning}
        </Tag>
      );
    } else if (['PENDING', 'EXOSYS_APPROVAL', 'WORKFLOW_APPROVAL', 'SUBMITTED'].includes(value)) {
      // 蓝色
      return (
        <Tag color="blue" style={{ border: 'none' }}>
          {meaning}
        </Tag>
      );
    } else if (['REJECTED', 'SEND_BACK', 'CANCELLED', 'CLOSED'].includes(value)) {
      //  红色
      return (
        <Tag color="red" style={{ border: 'none' }}>
          {meaning}
        </Tag>
      );
    } else {
      // 橘色
      return (
        <Tag color="orange" style={{ border: 'none' }}>
          {meaning}
        </Tag>
      );
    }
  };

  // 变更前的ds
  const beforelistDs = useDataSet(
    () =>
      line({
        source: 'inquery',
      }),
    []
  );

  // 渲染变更前的
  const renderChangeField = ({ value, record, name, text, dataSet }, renderFunc) => {
    const beforeRecord = beforelistDs.get(ds.indexOf(record));

    const result = isFunction(renderFunc)
      ? renderFunc({ value, record, name, text, dataSet })
      : text;

    if (beforeRecord) {
      const changeFiledMap = beforeRecord.get('changeFiledMap');

      const changeFileds = Object.keys(changeFiledMap || {});

      if (changeFileds.includes(name)) {
        const beforeValue = beforeRecord.get(name);

        const beforeText = changeFiledMap[name];

        // 改变了的字段
        const beforeResult = isFunction(renderFunc)
          ? renderFunc({
              value: beforeValue,
              record: beforeRecord,
              name,
              text: beforeText,
              dataSet: beforelistDs,
            })
          : beforeText;

        return (
          <Tooltip
            title={intl
              .get(`${commonPrompt}.beforeChanged`, {
                value: beforeResult,
              })
              .d(`变更前：${beforeResult}`)}
          >
            <span style={{ color: 'red' }}> {result || '-'} </span>
          </Tooltip>
        );
      }
    }
    if (record.get('changeInsertFlag') === 1 && name === 'displayLineNum') {
      return (
        <Tooltip title={intl.get(`${commonPrompt}.addLine`).d(`新增行`)}>
          <span style={{ color: 'red' }}> {result || '-'} </span>
        </Tooltip>
      );
    }
    return result;
  };

  // 变更前
  const handleUpdate = ({ dataSet }) => {
    beforelistDs.loadData([]);

    dataSet.forEach((record) => {
      const changeFiledMap = record.get('changeFiledMap');

      const changeFileds = Object.keys(changeFiledMap || {});

      // 改变的lov对应映射 name-展示文本
      const changeLovTextMap = {};

      // beforelistDs 获取数据
      const beforeRecord = beforelistDs.create({
        ...record.toData(),
        ...changeFiledMap,
      });

      // 改变的值可能是值集
      changeFileds.forEach((ele) => {
        const filed = beforeRecord.getField(ele);
        if (filed && filed.get('bind')) {
          const changeLovName = filed.get('bind').split('.')[0];
          const changeLovFiled = beforeRecord.getField(changeLovName);
          changeLovTextMap[changeLovName] = changeLovFiled.getText();
        }
      });

      // 将改变的 Lov 的属性赋值上去
      beforeRecord.set({
        changeFiledMap: {
          ...changeFiledMap,
          ...changeLovTextMap,
        },
      });
    });
  };

  const renderAmount = ({ record, name, text }) => {
    // 判断来源是头还是行
    const field = 'linePriceHiddenFlag';

    if (record && record.get(field) === 1) {
      return record.get(`${name}Meaning`);
    }

    return text;
  };

  const viewPrimaryUrl = ({ record }) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      children: <ViewPrimaryUrl currentPrLineId={record?.get('prLineId')} />,
    });
  };

  useEffect(() => {
    ds.addEventListener('load', handleUpdate);

    return () => {
      ds.removeEventListener('load', handleUpdate);
    };
  }, [beforelistDs, ds]);

  const newColums = useMemo(() => {
    let columns = [
      {
        name: 'changeInsertFlag',
        width: 150,
        renderer: ({ value }) => {
          if (String(value) === '1') {
            // return '新增';
            return (
              <Tag color="green" style={{ verticalAlign: 'text-top', border: 'none' }}>
                {intl.get(`sprm.common.common.view.create`).d('新增')}
              </Tag>
            );
          } else {
            return (
              <Tag color="yellow" style={{ verticalAlign: 'text-top', border: 'none' }}>
                {intl.get(`sprm.common.common.view.change`).d('变更')}
              </Tag>
            );
          }
        },
      },
      {
        name: 'prLineStatusCodeMeaning',
        width: 150,
        renderer: ({ value, record }) => colorRender(record.get('prLineStatusCode'), value),
      },
      {
        name: 'displayLineNum',
        width: 150,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        renderer: ({ record }) => record?.get('invOrganizationName'),
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryId',
        width: 150,
        renderer: ({ record }) => record?.get('categoryName'),
      },
      {
        name: 'quantity',
        width: 150,
      },
      {
        name: 'secondaryQuantity',
        width: 150,
      },
      {
        name: 'uomId',
        width: 150,
        renderer: ({ record }) => record?.get('uomCodeAndName'),
      },
      {
        name: 'secondaryUomId',
        width: 150,
        renderer: ({ record }) => record?.get('secondaryUomCodeAndName'),
      },
      {
        name: 'neededDate',
        width: 150,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'secondaryTaxInUnitPrice',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'taxIncludedLineAmount',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'productNum',
        width: 150,
      },
      {
        name: 'productName',
        width: 150,
      },
      {
        name: 'primaryUrl',
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => viewPrimaryUrl({ record })}>
            {intl.get('sprm.common.model.view.primaryUrl').d('查看主图')}
          </a>
        ),
      },
      {
        name: 'customMadeFlag',
        width: 150,
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'customAttributeList',
        width: 150,
        renderer: ({ record }) =>
          record.get('customMadeFlag') === 1 ? <ItemCustom record={record} /> : null,
      },
      {
        name: 'thirdSkuCode',
        width: 150,
      },
      {
        name: 'thirdSkuName',
        width: 150,
      },
      {
        name: 'skuType',
        width: 150,
      },
      {
        name: 'customUomName',
        width: 150,
      },
      {
        name: 'customQuantity',
        width: 150,
      },
      {
        name: 'packageQuantity',
        width: 150,
      },
      {
        name: 'customSpecsJson',
        width: 150,
        renderer: ({ value }) => {
          return <CustomSpecsModal value={value} />;
        },
      },
      {
        name: 'catalogName',
        width: 150,
      },
      {
        name: 'productSpecsJson',
        width: 150,
        renderer: ({ value }) => <ProductSpecsModal value={value} />,
      },
      {
        name: 'productBrand',
        width: 150,
      },
      {
        name: 'productModel',
        width: 150,
      },
      {
        name: 'packingList',
        width: 150,
      },
      {
        name: 'itemModel',
        width: 150,
      },
      {
        name: 'itemSpecs',
        width: 150,
      },
      {
        name: 'changeQuantity',
        width: 150,
      },
      {
        name: 'lastPurchasePrice',
        width: 150,
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
        width: 150,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'localCurrencyNoTaxSum',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyNoTaxUnit',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxSum',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'localCurrencyTaxUnit',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'supplierList',
        width: 150,
      },
      {
        name: 'supplierCompanyId',
        width: 150,
        renderer: ({ record }) => record?.get('displaySupplierName'),
      },
      {
        name: 'prRequestedName',
        width: 150,
      },
      {
        name: 'purchaseAgentId',
        width: 150,
        renderer: ({ record }) => record?.get('purchaseAgentName'),
      },
      {
        name: 'executorName',
        width: 150,
      },
      {
        name: 'accountSubjectId',
        width: 150,
        renderer: ({ record }) => record?.get('accountSubjectName'),
      },
      {
        name: 'costId',
        width: 150,
        renderer: ({ record }) => record?.get('costName'),
      },
      {
        name: 'expBearDep',
        width: 150,
      },
      {
        name: 'projectNum',
        width: 150,
      },

      {
        name: 'projectName',
        width: 150,
      },
      {
        name: 'projectCategory',
        width: 150,
        renderer: ({ record }) => record?.get('projectCategoryMeaning'),
      },
      {
        name: 'wbs',
        width: 150,
      },
      {
        name: 'taxIncludedBudgetUnitPrice',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'budgetIoFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(Number(value)),
      },
      {
        name: 'budgetAccountId',
        width: 150,
        renderer: ({ record }) => record?.get('budgetAccountName'),
      },
      {
        name: 'receiveAddress',
        width: 150,
      },
      {
        name: 'receiveContactName',
        width: 150,
      },
      {
        name: 'receiveTelNum',
        width: 150,
        renderer: ({ value, record }) =>
          value ? `${record?.get('internationalTelCode') || ''} ${value}` : '',
      },
      {
        name: 'lineFreight',
        width: 150,
        renderer: renderAmount,
      },
      {
        name: 'rpSourceNum',
        width: 150,
      },
      {
        name: 'rpNumAndLineNums',
        width: 150,
      },
      {
        name: 'mallLineNum',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
      },
      {
        name: 'budgetOccupyFlag',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      {
        name: 'changeAttachmentUuid',
        width: 150,
      },
      {
        name: 'priceList',
        width: 150,
        renderer: ({ record }) => {
          return <PriceList record={record} />;
        },
      },
    ];

    const baseUomInfo =
      uomControl === 1
        ? []
        : [
            'secondaryTaxInUnitPrice',
            'secondaryUomCodeAndName',
            'secondaryUomId',
            'secondaryQuantity',
          ];

    if (isChange) {
      columns = columns.filter(
        (ele) =>
          ![
            'prLineStatusCodeMeaning',
            'productNum',
            'productName',
            'primaryUrl',
            'thirdSkuCode',
            'thirdSkuName',
            'skuType',
            'customUomName',
            'customQuantity',
            'packageQuantity',
            'customSpecsJson',
            'catalogName',
            'productSpecsJson',
            'productBrand',
            'productModel',
            'packingList',
            'lastPurchasePrice',
            'lineFreight',
            'mallLineNum',
            'budgetOccupyFlag',
            'priceList',
            ...baseUomInfo,
          ].includes(ele.name)
      );
      if (isShowAll) {
        columns = columns.filter((ele) => !['changeInsertFlag'].includes(ele.name));
      }
    }

    if (isCancel) {
      columns = columns.filter(
        (ele) =>
          ![
            'changeInsertFlag',
            'changeQuantity',
            'lastPurchasePrice',
            'budgetOccupyFlag',
            'changeAttachmentUuid',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    if (!isCancel && !isChange) {
      columns = columns.filter(
        (ele) =>
          ![
            'changeQuantity',
            'changeInsertFlag',
            'changeAttachmentUuid',
            'prLineStatusCodeMeaning',
            ...baseUomInfo,
          ].includes(ele.name)
      );
    }

    // 不会改变的字段
    const noChangefields = [
      'customAttributeList',
      'lastPurchasePrice',
      'executionBillDetail',
      'productSpecsJson',
      'attachmentUuid',
      'customSpecsJson',
      'executorName',
      'occupiedQuantity',
      'changeQuantity',
      'executionHeaderBillNum',
      'sourceOccupiedQuantity',
      'restSourceQuantity',
      'orderOccupiedQuantity',
      'restPoQuantity',
      'secondLevelStrategyCode',
      'sourceExecuteStatus',
      'orderExecuteStatus',
      'orderExcessRuleCode',
      'sourceExcessRuleCode',
      'contractExcessRuleCode',
      'sourceDisposableExcessFlag',
      'changeAttachmentUuid',
      'secondaryQuantity',
      'secondaryUomId',
      'changeInsertFlag',
      'secondaryTaxInUnitPrice',
    ];

    return columns.map((ele) => {
      const renderFunc = ele.renderer;
      return {
        ...ele,
        renderer: !noChangefields.includes(ele.name)
          ? ({ value, record, name, text, dataSet }) =>
              renderChangeField({ value, record, name, text, dataSet }, renderFunc)
          : renderFunc,
      };
    });
  }, [beforelistDs, handleUpdate, renderChangeField, isChange, isCancel, isShowAll, uomControl]);

  const table = customizeTable(
    {
      code,
      dataSet: ds,
    },
    <SearchBarTable
      dataSet={ds}
      columns={newColums}
      style={{ maxHeight: '450px' }}
      searchCode="SPRM.PURCHASE_PLAFORM_APPROVALFORM.LINE_SEARCH"
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
      }}
    />
  );

  return table;
};

export default PurchaseLineInfo;
