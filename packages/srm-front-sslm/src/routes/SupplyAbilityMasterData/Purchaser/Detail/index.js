/**
 * index.js - 供货能力主数据（采）
 * @date: 2024-06-20
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { compose, isEmpty } from 'lodash';

import { Spin, useDataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import remotes from 'utils/remote';

import { handleSupplierDetail } from '@/routes/components/utils/utils';

import HeaderInfo from '../../components/HeaderInfo';
import CategoryMaterial from '../../components/CategoryMaterial';
import HeaderBtns from './HeaderBtns';
import { getHeaderDs } from './stores/getHeaderDS';
import { getCategoryMaterialDs } from './stores/getCategoryMaterialDS';

import styles from '../../index.less';

const headerCode = 'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.HEADER_INFO';
const categoryCodeList = [
  'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.CATEGORYS_SEARCH_BAR',
  'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.CATEGORYS_TABLE',
];

const Detail = ({
  remote,
  custLoading,
  customizeForm,
  customizeTable,
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

  // 跳转360
  const handleJumpSupplierDetail = () => {
    const data = headerDs.current?.toData();
    if (!isEmpty(data)) {
      handleSupplierDetail(data);
    }
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`sslm.supplyAbility.view.message.title.viewDetail`).d('查看供货能力清单')}
        backPath="/sslm/supply-ability-query-purchaser/list"
      >
        <HeaderBtns
          remote={remote}
          loading={loading}
          headerDs={headerDs}
          handleJumpSupplierDetail={handleJumpSupplierDetail}
        />
      </Header>
      <Content wrapperClassName={styles['supply-ability-query-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              code={headerCode}
              pageSource="purchaser"
            />
            <CategoryMaterial
              remote={remote}
              dataSet={categoryMaterialDs}
              customizeTable={customizeTable}
              customizeUnitCode={categoryCodeList[1]}
              customizeSearchCode={categoryCodeList[0]}
              pageSource="purchaser"
              attUnitCode="SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.CATEGORYS_LINE_MASTER_ATT"
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
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.CATEGORYS_TABLE',
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.HEADER_INFO',
      'SSLM.SUPPLY_ABLILITY_QUERY.PURCHASER_DETAIL.CATEGORYS_LINE_MASTER_ATT',
    ],
  }),
  remotes({
    code: 'SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER',
  })
)(Detail);
