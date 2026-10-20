/**
 * index.js - 供货能力主数据（采）
 * @date: 2024-06-20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { compose } from 'lodash';
import { Spin, useDataSet } from 'choerodon-ui/pro';

import remotes from 'utils/remote';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';

import HeaderInfo from '../../components/HeaderInfo';
import CategoryMaterial from '../../components/CategoryMaterial';
import { getHeaderDs } from './stores/getHeaderDS';
import { getCategoryMaterialDs } from './stores/getCategoryMaterialDS';

import styles from '../../index.less';

const headerCode = 'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.HEADER_INFO';
const categoryCodeList = [
  'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.CATEGORYS_SEARCH_BAR',
  'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.CATEGORYS_TABLE',
];

const Detail = ({
  remote,
  custLoading,
  customizeForm,
  customizeTable,
  customizeBtnGroup,
  match: {
    params: { supplyAbilityId },
  },
}) => {
  const headerDs = useDataSet(() => getHeaderDs(), []);
  const categoryMaterialDs = useDataSet(() => getCategoryMaterialDs(), []);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleQuery();
  }, [supplyAbilityId]);

  // 加载全部数据
  const handleQuery = useCallback(async () => {
    if (!supplyAbilityId) {
      return;
    }

    // 设置查询参数
    headerDs.setQueryParameter('queryParam', {
      supplyAbilityId,
      customizeUnitCode: headerCode,
    });
    categoryMaterialDs.setQueryParameter('queryParam', {
      supplyAbilityId,
      customizeUnitCode: categoryCodeList.join(','),
    });
    try {
      // 查询数据
      setLoading(true);
      await Promise.all([headerDs.query()]);
    } finally {
      setLoading(false);
    }
  }, [supplyAbilityId]);

  return (
    <Fragment>
      <Header
        title={intl.get(`sslm.supplyAbility.view.message.title.viewDetail`).d('查看供货能力清单')}
        backPath="/sslm/supply-ability-query-supplier/list"
      >
        {remote.process('SSLM_SUPPLY_ABLILITY_QUERY_SUPPLIER_DETAIL_HEADER_BTNS', [], {
          headerDs,
          categoryMaterialDs,
        })}
      </Header>
      <Content wrapperClassName={styles['supply-ability-query-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              code={headerCode}
              pageSource="supplier"
            />
            <CategoryMaterial
              remote={remote}
              dataSet={categoryMaterialDs}
              customizeTable={customizeTable}
              customizeUnitCode={categoryCodeList[1]}
              customizeSearchCode={categoryCodeList[0]}
              customizeForm={customizeForm}
              customizeBtnGroup={customizeBtnGroup}
              custLoading={custLoading}
              pageSource="supplier"
              attUnitCode="SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.CATEGORYS_LINE_MASTER_ATT"
            />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplyAbility'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.CATEGORYS_TABLE',
      'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.HEADER_INFO',
      'SSLM.SUPPLY_ABLILITY_QUERY.SUPPLIER_DETAIL.CATEGORYS_LINE_MASTER_ATT',
    ],
  }),
  remotes({
    code: 'SSLM_SUPPLY_ABLILITY_QUERY_SUPPLIER_DETAIL',
  })
)(Detail);
