import { Tooltip } from 'choerodon-ui';
import React from 'react';
import intl from 'utils/intl';

export default function getDimensionConfig() {
  return {
    ORG: {
      columns: [
        {
          dataIndex: 'unitCode',
          title: intl.get('sagm.common.view.organization.code').d('组织编码'),
        },
        {
          dataIndex: 'unitName',
          title: intl.get('sagm.common.view.organization.name').d('组织名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedOrg').d('已选组织'),
    },
    ROLE: {
      columns: [
        {
          dataIndex: 'code',
          title: intl.get('sagm.common.view.role.code').d('角色代码'),
        },
        {
          dataIndex: 'name',
          title: intl.get('sagm.common.view.role.name').d('角色名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedRole').d('已选角色'),
    },
    USER: {
      columns: [
        {
          dataIndex: 'loginName',
          title: intl.get('sagm.common.view.account').d('账户'),
        },
        {
          dataIndex: 'realName',
          title: intl.get('sagm.common.view.name').d('名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedAccount').d('已选子账户'),
    },
    AREA: {
      columns: [
        {
          dataIndex: 'regionCode',
          title: intl.get('sagm.common.view.region.code').d('区域编码'),
        },
        {
          dataIndex: 'regionName',
          title: intl.get('sagm.common.view.region.name').d('区域名称'),
          renderer: ({ value, record }) => {
            const valid = record.get('regionEnableFlag') === 0; // 失效
            return (
              <Tooltip
                title={
                  valid
                    ? intl
                        .get('smpc.product.model.skuSalesRegions.validator')
                        .d('地址库已升级，该地址已经不存在，请重新编辑。')
                    : ''
                }
              >
                <span style={{ color: valid ? 'red' : '#000' }}>{value}</span>
              </Tooltip>
            );
          },
        },
      ],
      title: intl.get('sagm.common.view.selectedRegion').d('已选区域'),
    },
    CATALOG: {
      columns: [
        {
          dataIndex: 'categoryCode',
          title: intl.get('sagm.common.view.category.code').d('分类编码'),
        },
        {
          dataIndex: 'categoryName',
          title: intl.get('sagm.common.view.category.name').d('分类名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedCategory').d('已选分类'),
    },
    DIRECTORY: {
      columns: [
        {
          dataIndex: 'directoryCode',
          title: intl.get('sagm.common.view.catalog.code').d('目录编码'),
        },
        {
          dataIndex: 'directoryName',
          title: intl.get('sagm.common.view.catalog.name').d('目录名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedCatalog').d('已选目录'),
    },
    SUPPLIER: {
      columns: [
        {
          dataIndex: 'supplierNum',
          title: intl.get('sagm.common.view.supplier.code').d('供应商编码'),
        },
        {
          dataIndex: 'supplierName',
          title: intl.get('sagm.common.view.supplier.name').d('供应商名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedSupplier').d('已选供应商'),
    },
    SKU_LABEL: {
      columns: [
        {
          dataIndex: 'labelCode',
          title: intl.get('sagm.common.view.skuLabel.code').d('标签编码'),
        },
        {
          dataIndex: 'labelName',
          title: intl.get('sagm.common.view.skuLabel.name').d('标签名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedSkuLabel').d('已选商品标签'),
    },
    MEMBER: {
      columns: [
        {
          dataIndex: 'memberCode',
          title: intl.get('sagm.common.view.member.code').d('会员编码'),
        },
        {
          dataIndex: 'memberName',
          title: intl.get('sagm.common.view.member.name').d('会员名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedMember').d('已选会员'),
    },
    MEMBER_LABEL: {
      columns: [
        {
          dataIndex: 'labelCode',
          title: intl.get('sagm.common.view.label.code').d('标签编码'),
        },
        {
          dataIndex: 'labelName',
          title: intl.get('sagm.common.view.label.name').d('标签名称'),
        },
      ],
      title: intl.get('sagm.common.view.selectedMemberLabel').d('已选会员标签'),
    },
  };
}
