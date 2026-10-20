import React, { Fragment, useMemo, useContext } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { Spin } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import BasicForm from './components/BasicForm';
import LineTable from './components/LineTable';
import CardContent from '../components/CardContent';
import type { StoreValueType} from './stores/StoreProvider';
import StoreProvider, { Store } from './stores/StoreProvider';
import { getSubTitle } from '../utils/utils';
import { DetailCustomizeCode } from '../utils/constant';

import styles from "../index.less";

// 设置sbdm国际化前缀
const langPrefixCode = 'smdm.subRelation.model.common';

const Index = () => {
  // subRelationId - 有效表id
  const { headerDS } = useContext(Store) as StoreValueType;
  const displaySubRelationNum = headerDS?.current?.get('displaySubRelationNum');

  // 面板列表
  const CardList = useMemo(() => {
    return [
      {
        key: 'basicForm',
        header: intl.get(`${langPrefixCode}.model.common.basicInformation`).d('基础信息'),
        content: <BasicForm />,
      },
      {
        key: 'lineTable',
        header: intl.get(`${langPrefixCode}.model.common.itemTitle`).d('物料'),
        content: <LineTable />,
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header
        title={getSubTitle('detail', displaySubRelationNum)}
        backPath='/smdm/substitute-relation/list'
      />
      <Content className={classNames(styles['smdm-sub-relation-entry-content'])}>
        <Spin spinning={false}>
          {
            CardList.map(card => <CardContent {...card} />)
          }
        </Spin>
      </Content>
    </Fragment>
  );
};

const SubDetailIndex = props => {
  return (
    <StoreProvider {...props}><Index /></StoreProvider>
  );
};

export default formatterCollections({
  code: ['smdm.subRelation', 'hzero.common'],
})(
  withCustomize({
    unitCode: Object.values(DetailCustomizeCode),
  })(SubDetailIndex)
);