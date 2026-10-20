import React, { useMemo, memo, useRef, useState } from 'react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import Image from '@/components/Image';
import QueryField from '@/components/QueryField';
import { openSkuDetail, openSkuEdit } from '@/utils/openCommonTab';
import {
  taxPriceRender,
  regionRender,
  productStatusRender,
} from '../ProtocolWorkbench/renderUtils';
import ViewFilter from '../ProtocolWorkbench/component/ViewFilter';
import { getOptions, openTransfer } from '../agreement';
import { agmLineDelSku } from '../agreement/api';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

function AgmDetailTable(props) {
  const [aggregation, setAggregation] = useState(true);
  const {
    dataSet,
    uomFlag,
    skuPermission,
    searchBarCode,
    customizeUnitCode,
    customizeTable,
    onViewAgmDetail = (e) => e,
  } = props;

  const queryRef = useRef();
  const backPath = '/small/mall-received-agreement/list';

  const handleViewSku = (record) => {
    openSkuDetail({
      record,
      backPath,
      type: 'sup',
    });
  };

  async function handleDelSku(record) {
    dataSet.status = 'submitting';
    const res = getResponse(await agmLineDelSku([record.toData()]));
    dataSet.status = 'ready';
    if (res) {
      notification.success();
      dataSet.query();
    }
  }

  // 操作列
  const renderOptions = ({ record, aggregation: _aggregation }) => {
    const agreementStatus = record.get('agreementStatus');
    const statusControl = !['TERMINATED', 'DISABLED'].includes(agreementStatus);
    const actions = [
      {
        text: intl.get('hzero.common.model.edit').d('编辑'),
        event: () => openSkuEdit({ type: 'sup', spuId: record.get('spuId'), backPath }),
      },
      {
        text: intl.get('sagm.protocolManagement.view.btn.addPlusProduct').d('追加商品'),
        _show: statusControl,
        event: () =>
          openTransfer({
            mode: 'add',
            record,
            isSup: true,
            backPath,
            skuApprove: skuPermission,
            afterRequest: () => dataSet.query(),
          }),
      },
      {
        text: intl.get('sagm.protocolManagement.view.btn.changeProduct').d('变更商品'),
        _show: statusControl,
        event: () =>
          openTransfer({
            mode: 'update',
            record,
            isSup: true,
            backPath,
            skuApprove: skuPermission,
            afterRequest: () => dataSet.query(),
          }),
      },
      {
        text: intl.get('sagm.protocolManagement.view.btn.remove').d('移除'),
        _show: statusControl,
        event: () => handleDelSku(record),
      },
    ];
    const maxLength = _aggregation ? 4 : 3;
    return getOptions(actions, maxLength);
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'shelfFlagMeaning',
          width: 100,
          renderer: productStatusRender,
          tooltip: 'none',
        },
        {
          name: 'operate',
          title: intl.get('hzero.common.action').d('操作'),
          width: aggregation ? 100 : 180,
          align: 'left',
          command: renderOptions,
          tooltip: 'none',
          show: skuPermission,
        },
        {
          name: 'imagePath',
          width: 100,
          show: !aggregation,
          renderer: ({ value }) => {
            return <Image value={value} width={32} height={32} />;
          },
        },
        {
          key: 'skuInfo',
          minWidth: 290,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.productInfo').d('商品信息'),
          children: [
            {
              name: 'skuCode',
              minWidth: 150,
              renderer: ({ value, record }) => <a onClick={() => handleViewSku(record)}>{value}</a>,
            },
            {
              name: 'skuName',
              minWidth: 180,
            },
            {
              name: 'skuUom',
              width: 80,
              hidden: !uomFlag,
            },
            {
              name: 'skuBrand',
              minWidth: 180,
            },
          ],
          renderer: ({ text, record }) => {
            const imagePath = record.get('imagePath');
            return (
              <div className={styles['sku-container']}>
                <div className="sku-info">
                  <Image className="sku-img" value={imagePath} width={64} height={64} />
                  <div className="sku-content">{text}</div>
                </div>
              </div>
            );
          },
        },
        {
          key: 'agmInfo',
          aggregation: true,
          align: 'left',
          minWidth: 290,
          header: intl.get('sagm.protocolManagement.view.protocolInfo').d('协议信息'),
          children: [
            {
              name: 'agreementNumber',
              minWidth: 170,
              renderer: ({ text, record }) => <a onClick={() => onViewAgmDetail(record)}>{text}</a>,
            },
            {
              name: 'agreementName',
              minWidth: 180,
            },
            {
              name: 'agreementStatusMeaning',
              width: 100,
              header: intl.get('sagm.protocolManagement.view.agreementStatus').d('协议状态'),
            },
            {
              name: 'versionNum',
              width: 80,
              renderer: ({ value }) => (value ? `v${value}` : '-'),
            },
          ],
        },
        {
          key: 'companyInfo',
          width: 220,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.companyInfo').d('供采公司'),
          children: [
            {
              name: 'companyName',
              minWidth: 180,
            },
            {
              name: 'supplierCompanyName',
              minWidth: 180,
            },
          ],
        },
        {
          key: 'itemInfo',
          width: 220,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.itemInfo').d('物料信息'),
          children: [
            {
              name: 'itemCode',
              width: 120,
            },
            {
              name: 'itemName',
              minWidth: 180,
            },
            {
              name: 'itemCategoryCode',
              width: 150,
              renderer: ({ value, record }) => {
                const itemCategoryName = record.get('itemCategoryName');
                return value ? `${value}-${itemCategoryName || ''}` : '-';
              },
            },
            {
              name: 'uomName',
              width: 100,
            },
          ],
        },
        {
          key: 'priceInfo',
          width: 180,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.priceInfo').d('价格信息'),
          children: [
            {
              name: 'taxPrice',
              width: 120,
              renderer: taxPriceRender,
            },
            {
              name: 'currencyName',
              width: 120,
            },
            {
              name: 'tax',
              width: 120,
              renderer: ({ value }) => value && math.floor(value),
            },
          ],
        },
        {
          name: 'saleRegion',
          width: 120,
          header: intl.get('sagm.protocolManagement.view.saleRegion').d('可售区域'),
          renderer: regionRender,
        },
      ].filter((f) => f.show || !('show' in f)),
    [uomFlag, skuPermission, aggregation]
  );

  const searchBarProps = {
    aggregation,
    style: { maxHeight: 'calc(100% - 22px)' },
    searchBarConfig: {
      fieldProps: {
        companyId: { lovPara: { tenantId: organizationId } },
        skuId: { lovPara: { tenantId: organizationId } },
      },
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      left: {
        render: () => (
          <QueryField
            name="agreementNumbers"
            dataSet={dataSet}
            onRef={(ref) => {
              queryRef.current = ref;
            }}
            placeholder={intl
              .get('sagm.common.view.queryMsg.agreementCode')
              .d('请输入协议编码查询')}
          />
        ),
      },
      right: {
        render: () => (
          <ViewFilter
            aggregation={aggregation}
            onAggregationChange={(_aggregation) => {
              setAggregation(_aggregation);
            }}
          />
        ),
      },
    },
    cacheState: true,
    searchCode: searchBarCode,
    customizedCode: customizeUnitCode,
    onAggregationChange: setAggregation,
  };

  if (!aggregation) {
    searchBarProps.rowHeight = 32;
  }
  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable dataSet={dataSet} columns={columns} {...searchBarProps} />
  );
}

export default memo(AgmDetailTable);
