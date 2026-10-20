/*
 * @Date: 2024-07-30 14:35:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isFunction } from 'lodash';
import React, { useMemo, useContext } from 'react';
import { Store } from '../stores';
import { getCardList } from './utils';

const Detail = () => {
  const { isEdit, customCard, dataSource, contactRef } = useContext(Store);
  const cardList = useMemo(() => getCardList({ isEdit, customCard }), [
    isEdit,
    JSON.stringify(customCard),
  ]);

  const refList = {
    contact: contactRef,
  };

  return (
    <div className="member-expansion-wrap">
      {cardList.map(card => (
        <div className="member-expansion-content" key={card.key}>
          <div className="member-expansion-detail">
            <div className="expansion-card-title-wrap">
              <div className="expansion-card-title">
                <div className="expansion-card-title-label">
                  {isFunction(card.title) ? card.title({ dataSource }) : card.title}
                </div>
                {isEdit && card.extra && (
                  <div className="expansion-card-title-extra">
                    <card.extra {...(card.componentProps || {})} />
                  </div>
                )}
              </div>
              {isEdit && card.help && <div className="expansion-card-help">{card.help}</div>}
            </div>
            <card.component
              {...(card.componentProps || {})}
              isEdit={isEdit}
              ref={refList[card.key]}
              contactData={dataSource.memberContactList}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Detail;
