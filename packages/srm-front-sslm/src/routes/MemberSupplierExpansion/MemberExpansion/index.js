/*
 * @Date: 2024-07-30 14:35:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useContext } from 'react';
import { Button, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import { ReactComponent as PaidAlready } from '@/assets/memberExpansion/paid-already.svg';
import { ReactComponent as UnpaidPayment } from '@/assets/memberExpansion/unpaid-payment.svg';

import styles from '../styles.less';
import HeaderBtns from './HeaderBtns';
import { Store } from '../stores';
import Detail from './Detail';

const Index = props => {
  const { isPay, loading, showDetailFlag, renderLoading, handleSupplementaryInfo } = useContext(
    Store
  );
  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.memberExpansion.view.title.memberInfoExpansion')
          .d('会员供应商信息拓展')}
      >
        {showDetailFlag && <HeaderBtns />}
      </Header>
      <Content wrapperClassName={styles['member-expansion-container']}>
        {renderLoading ? (
          <Spin spinning={loading}>
            {showDetailFlag ? (
              <Detail {...props} />
            ) : (
              <div className="illustration">
                <div className="illustration-detail">
                  {isPay === 1 ? <PaidAlready /> : <UnpaidPayment />}
                  {isPay === 1 ? (
                    <Button color="primary" onClick={() => handleSupplementaryInfo()}>
                      {intl
                        .get('sslm.memberExpansion.model.btn.supplementaryInfo')
                        .d('开始补充信息')}
                    </Button>
                  ) : (
                    <div style={{ color: '#868D9C' }}>
                      {intl
                        .get('sslm.memberExpansion.model.message.functionMsg')
                        .d('此功能为付费会员供应商使用功能，您的企业暂未开通')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Spin>
        ) : (
          <Spin spinning />
        )}
      </Content>
    </Fragment>
  );
};

export default Index;
