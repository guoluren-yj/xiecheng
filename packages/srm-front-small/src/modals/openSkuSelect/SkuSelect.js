import React, { useMemo } from 'react';
import { DataSet, Table, Icon } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';
import OverflowTip from '@/components/OverflowTip';
import styles from './styles.less';

// const categoryOptions = new DataSet({
//   autoQuery: true,
//   paging: false,
//   primaryKey: 'categoryId',
//   childrenField: 'children',
//   transport: {
//     read: {
//       url: `${SRM_SMPC}/v1/category/${getCurrentOrganizationId()}/getTreeWithThreeList`,
//       method: 'GET',
//     },
//   },
// });

export default function SkuSelect(props) {
  const { onOk = e => e, modal, queryParams = {}, selection = 'multiple' } = props;

  // // 写在外面 平台级别账号会报错 todo问题排查
  // const categoryOptions = new DataSet({
  //   autoQuery: true,
  //   paging: false,
  //   primaryKey: 'categoryId',
  //   childrenField: 'children',
  //   transport: {
  //     read: {
  //       url: `${SRM_SMPC}/v1/category/${getCurrentOrganizationId()}/getTreeWithThreeList`,
  //       method: 'GET',
  //     },
  //   },
  // });

  modal.handleOk(() => {
    const selectedData = dataSet.selected.map(m => m.toData());
    return onOk(selectedData);
  });

  const dataSet = useMemo(() => {
    const organizationId = getCurrentOrganizationId();
    return new DataSet({
      autoQuery: true,
      primaryKey: 'skuId',
      cacheSelection: true,
      pageSize: 20,
      selection: selection || 'multiple',
      queryFields: [
        {
          name: 'categoryLov',
          type: 'object',
          ignore: 'always',
          valueField: 'id',
          textField: 'categoryPath',
          label: intl.get(`small.common.model.product.category`).d('商品分类'),
          // transformRequest: value => value?.pop(),
          // options: categoryOptions,
          lovCode: 'SMAL.PLAT_CATEGORY_THREE',
          lovPara: { tenantId: organizationId },
        },
        {
          name: 'categoryId',
          bind: `categoryLov.id`,
        },
        {
          name: 'supplierLov',
          type: 'object',
          ignore: 'always',
          lovCode: 'SMAL.SUPPLIER_BY_PUR',
          textField: 'supplierName',
          valueField: 'supplierId',
          lovPara: { tenantId: organizationId },
          label: intl.get(`small.common.model.supplier`).d('供应商'),
        },
        {
          name: 'supplierCompanyId',
          bind: `supplierLov.supplierId`,
        },
        {
          name: 'skuName',
          label: intl.get(`small.common.model.common.product`).d('商品'),
        },
        {
          name: 'sourceFrom',
          label: intl.get(`small.common.model.common.sourceType`).d('商品类型'),
          lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
        },
        {
          name: 'labelLov',
          label: intl.get(`small.common.model.productLabel`).d('商品标签'),
          lovCode: 'SMPC.SKU_LABEL',
          type: 'object',
          ignore: 'always',
          lovPara: { tenantId: organizationId },
          multiple: true,
        },
        {
          name: 'labelCodes',
          bind: 'labelLov.labelCode',
          multiple: ',',
        },
      ],
      fields: [
        {
          name: 'skuCode',
          label: intl.get(`small.common.model.common.ecProductNum`).d('商品编码'),
        },
        {
          name: 'skuName',
          label: intl.get(`small.common.model.common.ecProductName`).d('商品名称'),
        },
        {
          name: 'supplierCompanyNum',
          label: intl.get(`small.common.model.supplier.code`).d('供应商编码'),
        },
        {
          name: 'supplierCompanyName',
          label: intl.get(`small.common.model.supplier.name`).d('供应商名称'),
        },
        {
          name: 'agreementNumber',
          label: intl.get(`small.common.model.agreementNumber`).d('协议编号'),
        },
        {
          name: 'sourceFrom',
          label: intl.get(`small.common.model.common.sourceType`).d('商品类型'),
          lookupCode: 'SMAL.PRODUCT_SOURCE_FROM',
        },
      ],
      transport: {
        read: ({ data }) => ({
          url: `${SRM_SMPC}/v1/${organizationId}/pur-skus/all-sku-list`,
          method: 'GET',
          data: { ...data, shelfFlag: 1, companyId: -1, belongType: 0, ...queryParams },
        }),
      },
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'skuCode',
        width: 140,
      },
      {
        name: 'skuName',
      },
      {
        name: 'supplierCompanyNum',
        width: 140,
      },
      {
        name: 'supplierCompanyName',
        width: 140,
      },
      {
        name: 'agreementNumber',
        width: 150,
      },
      {
        name: 'sourceFrom',
        width: 130,
      },
    ],
    []
  );

  return (
    <div className={styles['sku-select']}>
      <div className="sku-table-wrapper">
        <div className="sku-select-title">
          {intl.get('small.common.view.skuSelect').d('选择商品')}
        </div>
        <Table
          dataSet={dataSet}
          columns={columns}
          queryFieldsLimit={2}
          style={{ maxHeight: 'calc(100vh - 320px)' }}
        />
      </div>
      {selection === 'multiple' && (
        <Observer>
          {() => {
            const count = dataSet.selected.length;
            return (
              <div className="selected-data">
                <div className="selected-data-count">
                  {count > 0
                    ? intl
                        .get('small.common.mode.dataSelected', { count })
                        .d(`已选择${count}条数据`)
                    : intl.get('small.common.mode.plsChooseLeft').d(`请勾选左侧数据`)}
                  <Icon type="close" onClick={() => modal.close()} />
                </div>
                <div className="selected-data-content" style={{ maxHeight: 'calc(100vh - 110px)' }}>
                  {dataSet.selected.map(m => (
                    <div className="selected-data-item" key={m.get('skuId')}>
                      <OverflowTip className="selected-data-text">{m.get('skuName')}</OverflowTip>
                      <div className="selected-data-remove" onClick={() => dataSet.unSelect(m)}>
                        <Icon type="close" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        </Observer>
      )}
    </div>
  );
}
