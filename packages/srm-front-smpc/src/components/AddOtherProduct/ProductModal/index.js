import React, { useMemo, useEffect, useState } from 'react';
import { autorun } from 'mobx';
import { Alert } from 'choerodon-ui';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';

import FilterBarTable from '_components/FilterBarTable';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import Image from '@/components/Image';
import imgDefault from '@/assets/sku_default.svg';
import { tableDS } from './store';
import SkuPriviewModal from '../SkuPriviewModal';
import { addPriceComparisonService } from '../api';

function ProductModal({ addressInfo, modal, onOkCallback = (e) => e }) {
  const { fullAddress, contactName, mobile, addressId, prLineId, companyId, regionCodeList = [] } =
    addressInfo || {};
  // 查询接口的数据，缓存起来做手动分页
  const [resData, setResData] = useState();
  const [alertFlag, setAlertFlag] = useState(true);
  const tableDs = useMemo(
    () => new DataSet(tableDS({ fullAddress, addressId, companyId, regionCodeList, setResData })),
    []
  );

  useEffect(() => {
    autorun(() => {
      modal.update({
        onOk: handleOnok,
        okProps: {
          disabled: tableDs.selected.length === 0,
        },
      });
    });
  }, [tableDs]);

  // 加入比价
  async function handleOnok() {
    const skuPublishDTOList = tableDs.selected.map((r) => ({ ...r.toData(), prLineId })) || [];
    const params = {
      addressId,
      fullAddress,
      contactName,
      mobile,
      skuPublishDTOList,
    };
    const res = getResponse(await addPriceComparisonService(params));
    if (res) {
      notification.success();
      onOkCallback();
    } else {
      return false;
    }
  }

  function getImagePath(record) {
    const { imagePath, skuImageList } = record.get(['imagePath', 'skuImageList']);
    const { mediaPath } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};
    return imagePath || mediaPath || imgDefault;
  }

  // 打开详细页
  function handleOpenPdtDetail(record) {
    const { skuId = '' } = record.get(['skuId']);
    const props = {
      skuId,
    };
    Modal.open({
      title: intl.get('smpc.product.view.skuDetail').d('商品详情'),
      drawer: true,
      style: { width: 1090 },
      children: <SkuPriviewModal {...props} />,
      okText: intl.get('smpc.product.button.selectAndClose').d('选择并关闭'),
      onOk: () => tableDs.select(record),
    });
  }

  // 手动分页
  function handlePageChange(page, size) {
    const start = (page - 1) * size;
    const end = page * size;
    tableDs.setState('queryFlag', 0);
    tableDs.currentPage = page;
    tableDs.loadData(resData.slice(start, end));
  }

  const columns = [
    {
      name: 'saleState',
      width: 120,
      renderer: ({ record }) => {
        return record.get('saleState') === 1
          ? intl.get('smpc.product.model.saleState.saleAvailable').d('可售')
          : intl.get('smpc.product.model.saleState.noSaleAvailable').d('不可售');
      },
    },
    { name: 'supplierCompanyCode', width: 120 },
    { name: 'supplierCompanyName', width: 150 },
    {
      name: 'skuCode',
      width: 120,
      renderer: ({ text, record }) => {
        return record.get('saleState') === 1 ? (
          <Button funcType="link" onClick={() => handleOpenPdtDetail(record)}>
            {text}
          </Button>
        ) : (
          text
        );
      },
    },
    { name: 'skuName' },
    {
      name: 'imagePath',
      width: 100,
      renderer: ({ record }) => <Image value={getImagePath(record)} width={32} height={32} />,
    },
    {
      name: 'salePrice',
      width: 100,
      align: 'right',
    },
    {
      name: 'uomName',
      width: 100,
    },
    { name: 'currencyName', width: 100 },
    {
      name: 'limitQuantity',
      width: 100,
      align: 'right',
    },
    {
      name: 'skuStock',
      width: 100,
      align: 'right',
      renderer: ({ value }) =>
        +value >= 50 || +value === -1
          ? intl.get('smpc.product.model.skuStock.inStock').d('有货')
          : value || 0,
    },
    {
      name: 'deliveryCycle',
      width: 100,
      align: 'right',
    },
  ];
  return (
    <>
      <Alert
        showIcon
        style={{
          margin: '-20px -20px 20px',
          border: 'none',
          color: '#1890ff',
        }}
        type="info"
        iconType="help"
        message={intl
          .get('smpc.product.view.addProductAlert')
          .d(
            '温馨提示：查询商品前请先输入搜索条件；当商品不支持勾选时，代表此商品暂不可售，请选择其他商品加入比价'
          )}
        closable
        afterClose={() => setAlertFlag(false)}
      />
      <FilterBarTable
        customizedCode="SMPC_ADD_OTHER_PRODUCT_TABLE"
        dataSet={tableDs}
        columns={columns}
        filterBarConfig={{
          // defaultSortedField: 'quantity',
          autoQuery: false,
        }}
        style={{ maxHeight: alertFlag ? 'calc(100% - 40px)' : 'calc(100% - 5px)' }}
        pagination={{
          onChange: handlePageChange,
        }}
      />
    </>
  );
}

export default ProductModal;
