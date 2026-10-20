/*
 * ContractTextCompare - 合同文本对比
 * @date: 2025/04/24 15:12:06
 * @author: CDJ
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useEffect, useMemo } from 'react';
import querystring from 'querystring';
import { compose } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';

const Index = ({ location }) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);

  const { fileUrl = '' } = routerParams;

  useEffect(() => {}, []);

  return (
    <React.Fragment>
      <Header
        title={intl.get('hzero.common.view.title.contractTextComparison').d('合同文本对比')}
      />
      <Content>
        {fileUrl ? (
          <iframe
            style={{
              height: 'calc(100vh - 190px)',
              width: '100%',
              border: 'none',
            }}
            id="spcmContractTextCompare"
            src={fileUrl}
            title="Online Compare"
          />
        ) : null}
      </Content>
    </React.Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common'],
  }),
  withProps(
    () => {
      return {};
    },
    { cacheState: true }
  )
)(Index);
