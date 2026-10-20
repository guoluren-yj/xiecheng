// 权限范围
import React, { memo } from 'react';
import { Table, Output, Tooltip, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import c7nModal, { openList, openSelectList } from '@/utils/c7nModal';

import SkuTable from './SkuTable';
import getDimensionConfig from './getDimensionConfig';
import styles from './style.less';

const organizationId = getCurrentOrganizationId();

// 商品穿梭框组件
function openSku({ title, url, authRecord, viewSkuBackPath }) {
  const params = authRecord?.get(['authorityListId', 'agreementHeaderId', 'agreementType']) || {};
  c7nModal({
    title,
    okCancel: false,
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <SkuTable backPath={viewSkuBackPath} url={url} params={params} />,
  });
}

export default memo(function AuthorityRange(props) {
  const {
    initDs,
    userDs,
    skuDs,
    viewSkuBackPath,
    allUserEnable,
    allSkuEnable,
    isExcludeSku,
    isExcludeUser,
    exCludeSubAccount = [],
  } = props;
  const { controlRange } = initDs.current ? initDs.current.toData() : {};

  const getColumns = () => [
    {
      name: 'dimension',
      width: 150,
      renderer: ({ record }) => (record.get('dimension') || {}).meaning,
    },
    {
      name: 'dimensionValue',
      renderer: renderDimensionRead,
    },
  ];

  function renderDimensionRead({ record }) {
    const code = record.get('dimensionCode');
    let data = record.get(code) || [];
    const isCustom = record.getState('customDimension');
    const baseConfigs = getDimensionConfig();

    const dimensionConfigs = {
      ...baseConfigs,
      SKU: {
        comp: (
          <a
            onClick={() => {
              openSku({
                url: `/sagm/v1/${organizationId}/auth-sku-details`,
                title: intl.get('sagm.common.view.assignedSku').d('已分配商品'),
                authRecord: initDs?.current,
                viewSkuBackPath,
              });
            }}
          >
            {intl.get('sagm.common.model.product').d('商品')}
          </a>
        ),
      },
      PRICE_RANGE: {
        comp: <Output record={record} name="PRICE_RANGE" />,
      },
      COMMODITY_SOURCE: {
        comp: <Output record={record} name="COMMODITY_SOURCE" />,
      },
    };

    const baseConfig = dimensionConfigs[code];

    let config = baseConfig;
    if (isCustom) {
      data = record.get('customDimension') || [];
      const { lovCode, componentType, dimensionName } = isCustom;
      config = {
        columns: record.get('columns') || [],
        title: dimensionName,
      };
      if (componentType === 'SELECT') {
        config.comp = (
          <a
            onClick={() =>
              openSelectList({
                data: record.get('customSelect'),
                title: dimensionName,
                code: lovCode,
              })
            }
          >
            {dimensionName}
          </a>
        );
      }
    }

    if (!config) return '-';
    const { comp, title, columns } = config;
    return comp || <a onClick={() => openList({ data, title, columns })}>{title}</a>;
  }

  const viewExcludeUser = () => {
    const title = intl.get('sagm.common.view.button.viewExcludeUser').d('查看排除用户');
    const baseConfigs = getDimensionConfig();
    const { columns } = baseConfigs.USER;
    openList({ data: exCludeSubAccount, title, columns });
  };

  return (
    <div className={styles['authority-range']}>
      <div className="range-table">
        <div className="range-title">
          {intl.get('sagm.common.view.title.userRange').d('用户条件范围（多个条件间为且的关系）')}
        </div>
        {allUserEnable ? (
          <span className="range-all-read">
            {intl.get('sagm.common.model.allUser').d('全部用户')}
          </span>
        ) : (
          <Table dataSet={userDs} columns={getColumns('USER')} />
        )}
      </div>
      {isExcludeUser && controlRange !== 'MEMBER' && (
        <Tooltip
          title={intl
            .get('sagm.common.view.message.excludeSomeUserOpt')
            .d('在用户条件范围为全部用户或部分用户的基础上，再排除一部分用户')}
        >
          <Button
            funcType="link"
            color="primary"
            className={styles['exclude-user-lov-btn']}
            onClick={viewExcludeUser}
          >
            {intl.get('sagm.common.view.button.viewExcludeUser').d('查看排除用户')}
          </Button>
        </Tooltip>
      )}
      <div className="range-table">
        <div className="range-title">
          {intl.get('sagm.common.view.title.skuRange').d('商品条件范围（多个条件间为且的关系）')}
        </div>
        {allSkuEnable ? (
          <span className="range-all-read">
            {intl.get('sagm.common.model.allSku').d('全部商品')}
          </span>
        ) : (
          <Table dataSet={skuDs} columns={getColumns('SKU')} />
        )}
      </div>
      {isExcludeSku && (
        <Tooltip
          title={intl
            .get('sagm.common.view.message.excludeSomeSkuOpt')
            .d('在商品条件范围为全部商品或部分商品的基础上，再排除一部分商品')}
        >
          <Button
            className={styles['exclude-user-lov-btn']}
            funcType="link"
            color="primary"
            onClick={() =>
              openSku({
                url: `/sagm/v1/${organizationId}/auth-exclude-sku-details`,
                title: intl.get('sagm.common.view.hasExcludeSku').d('已排除商品'),
                authRecord: initDs?.current,
                viewSkuBackPath,
              })
            }
          >
            {intl.get('sagm.common.view.button.viewExcludeSku').d('查看排除商品')}
          </Button>
        </Tooltip>
      )}
    </div>
  );
});
