import React, { useEffect } from 'react';
import {
  Button,
  // DataSet,
} from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { openTab, getMenuId } from 'utils/menuTab';
import { observer } from 'mobx-react-lite';
import qs from 'qs';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import c7nModal from '@/utils/c7nModal';
import {
  fetchSaveApplyLine,
  fetchDeleteApplyLine,
  fetchSaveApply,
} from '@/services/product/shelfApply';
import Product from './Product';

const organizationId = getCurrentOrganizationId();

const ObserverBtn = observer(({ dataSet, children, ...others }) => (
  <Button disabled={dataSet.selected.length === 0} {...others}>
    {children}
  </Button>
));

export default withRouter(
  observer(function LineDetail(props) {
    const {
      isPub,
      dataSet,
      headerDs,
      applyHeaderId,
      readOnly,
      lineSearchCode,
      history: { push },
      location: { pathname, search },
    } = props;

    useEffect(() => {
      Object.assign(dataSet, { selection: readOnly ? false : 'multiple' });
    }, [readOnly, dataSet]);

    function handleViewDetail(record) {
      const { spuId, skuId, supplierShelfFlag } = record.toData();
      const searchPara = qs.stringify(
        filterNullValueObject({
          spuId,
          skuId,
          menuId: isPub ? getMenuId() : null,
          anchor: isPub ? 'SHELF-APPLY-PUB' : 'SHELF-APPLY',
          hiddenSku: 'y',
          supplierShelfFlag,
          backPath: `${pathname}${search}`,
        })
      );
      if (isPub) {
        openTab({
          key: '/smpc/shelf-apply-pub/sku-detail-sup',
          title: 'srm.common.view.skuDetail',
          search: searchPara,
        });
      } else {
        push({
          pathname: `/smpc/shelf-apply/sku-detail-sup`,
          search: searchPara,
        });
      }
    }

    // 协议行添加商品
    async function addProduct(records) {
      if (records.length < 1) return true;
      const data = records.map((r) => ({ ...r.toData() }));
      const params = data.map((m) => ({
        applyHeaderId,
        purSkuStatusMeaning: m.purSkuStatusMeaning,
        skuCode: m.skuCode,
        skuName: m.skuName,
        skuId: m.skuId,
        supplierCompanyId: m.supplierCompanyId,
        supplierCompanyName: m.supplierCompanyName,
        catalogId: m.catalogId,
        catalogName: m.catalogName,
        categoryId: m.categoryId,
        categoryName: m.categoryName,
      }));
      const res = await fetchSaveApplyLine(params);
      if (getResponse(res)) {
        // 同时保存头数据（申请明细依赖于头，未点保存，保持数据一致）
        const baseData = headerDs.current.toJSONData();
        const headerRes = getResponse(await fetchSaveApply({ ...baseData }));
        if (headerRes) {
          notification.success();
          headerDs.query();
          dataSet.query(dataSet.currentPage);
        }
      }
    }

    function handleCreate() {
      c7nModal({
        title: intl.get('smpc.ShelfApply.view.modal.title.addProduct').d('新增商品'),
        style: { width: 900 },
        children: (
          <Product
            onOk={addProduct}
            applyHeaderId={applyHeaderId}
            handleViewDetail={handleViewDetail}
            applyType={headerDs.current.get('applyType')}
            supplierCompanyId={headerDs?.current?.get('supplierCompanyId')}
          />
        ),
      });
    }

    // 删除申请行 || 批量
    async function handleDeleteLine(record) {
      const selects = record ? [record] : dataSet.selected;
      // selects.forEach((i) => {
      //   Object.assign(i, { status: 'add' });
      // });
      const params = selects.map((r) => ({ applyLineId: r.get('applyLineId') }));
      const res = await fetchDeleteApplyLine(params);
      if (getResponse(res)) {
        // dataSet.remove(selects);
        dataSet.query(dataSet.currentPage);
        notification.success();
      }
    }

    const columns = [
      {
        name: 'num',
        width: 50,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'purSkuStatusMeaning',
        width: 100,
      },
      {
        name: 'skuCode',
        width: 200,
      },
      {
        name: 'skuName',
        width: 200,
      },
      {
        name: 'supplier',
        width: 250,
      },
      {
        name: 'categoryName',
        width: 200,
      },
      {
        name: 'catalogName',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        lock: 'right',
        minWidth: 100,
        renderer: ({ record }) => (
          <span>
            <Button funcType="link" color="primary" onClick={() => handleViewDetail(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
            {!readOnly && (
              <Button funcType="link" color="primary" onClick={() => handleDeleteLine(record)}>
                {intl.get('hzero.common.button.remove').d('移除')}
              </Button>
            )}
          </span>
        ),
      },
    ];

    const buttons = [
      <Button icon="playlist_add" onClick={handleCreate}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <ObserverBtn icon="delete" dataSet={dataSet} onClick={() => handleDeleteLine(null)}>
        {intl.get('hzero.common.button.remove').d('移除')}
      </ObserverBtn>,
    ];
    return (
      <SearchBarTable
        dataSet={dataSet}
        columns={columns}
        buttons={readOnly ? [] : buttons}
        searchCode={lineSearchCode}
        searchBarConfig={{
          defaultExpand: false,
          closeFilterSelector: true,
          fieldProps: {
            catalogId: { lovPara: { tenantId: organizationId } },
            categoryId: { lovPara: { tenantId: organizationId } },
          },
        }}
      />
    );
  })
);
