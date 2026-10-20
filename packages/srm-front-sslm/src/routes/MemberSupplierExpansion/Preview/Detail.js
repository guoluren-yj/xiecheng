/*
 * @Date: 2024-08-20 14:01:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useMemo, useContext } from 'react';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import styles from '../styles.less';
import { getPreviewCard } from './utils';
import { Store } from '../stores';

const Detail = () => {
  const { loading, dataSource, customCard, companyData } = useContext(Store);
  const [activeKey, setActiveKey] = useState('findSupplier');
  const cardList = useMemo(() => getPreviewCard({ activeKey, customCard }), [
    activeKey,
    JSON.stringify(customCard),
  ]);

  return (
    <Fragment>
      <Header title={intl.get('hzero.common.preview').d('预览')}>
        <div className={styles['preview-tab-wrap']}>
          <div className="preview-tab-content">
            <div
              className={activeKey === 'findSupplier' ? 'active' : ''}
              onClick={() => setActiveKey('findSupplier')}
            >
              {intl.get('sslm.common.view.field.findSupplier').d('发现供应商')}
            </div>
            <div
              className={activeKey === 'supplierDetail' ? 'active' : ''}
              onClick={() => setActiveKey('supplierDetail')}
            >
              {intl.get('sslm.common.view.field.supplierDetail').d('供应商详情')}
            </div>
          </div>
        </div>
      </Header>
      <Content wrapperClassName={styles['member-expansion-container']}>
        <Spin spinning={loading}>
          <div className="member-expansion-wrap">
            {cardList.map(card => (
              <div className="member-expansion-content" key={card.key}>
                <div className="member-expansion-detail">
                  {card.title && (
                    <div className="expansion-card-title-wrap">
                      <div className="expansion-card-title">
                        <div className="expansion-card-title-label">{card.title}</div>
                      </div>
                    </div>
                  )}
                  <card.component
                    {...(card.componentProps || {})}
                    registerData={companyData.basic}
                    businessData={companyData.business}
                    contactData={dataSource.memberContactList}
                    productData={dataSource.memberMainProductList}
                    listType={activeKey === 'findSupplier' ? 'LIST' : 'GRID'}
                  />
                </div>
              </div>
            ))}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default Detail;
