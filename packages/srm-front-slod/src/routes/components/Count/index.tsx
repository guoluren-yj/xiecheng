/* eslint-disable array-callback-return */
/*
 * @Description: index
 * @Date: 2023-08-30 15:16:16
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';

import './index.less';

export default function CountMenu(props) {
  const { _obj = {}, countMenu = [] } = props;
  const [hidden, setHidden]: any = useState({ display: "none" });
  const [display, setDisplay]: any = useState({ display: "block" });
  useEffect(() => {
    if (countMenu?.length>0) {
      setTimeout(() => {
        setHidden({ display: "block" });
        setDisplay({ display: "none" });
      }, 500);
    }
  }, [countMenu?.length]);
    return (
      <>
        <div style={display} className="text-style-tab-left">
          {intl.get('hzero.common.view.load.loadingMsg').d('正在加载...')}
        </div>
        <div style={hidden}>
          {(countMenu || [])?.map((item) => {
            if (item?.nodeConfigId === _obj?.nodeConfigId) {
                return (
                  <>
                    {item?.createTotal>0 && (
                      <div
                        className="text-style-tab-left"
                        style={{ padding: '2px 4px 2px 4px' }}
                      >
                        {intl.get('slod.deliveryWorkbench.view.title.waitCreate').d('待新建')}
                        {item?.createTotal > 99 ? '99+' : item?.createTotal}
                      </div>
                    )}
                    {item?.confirmTotal > 0 && (
                    <div
                      className={item?.createTotal >0 ? 'text-style-tab-right': 'text-style-tab-right-create'}
                      style={{ padding: '2px 4px 2px 4px' }}
                    >
                      {intl.get('slod.deliveryWorkbench.view.title.waitAffirm').d('待确认')}
                      {item?.confirmTotal > 99 ? '99+' : item?.confirmTotal}
                    </div>
                    )}
                  </>
                );
                }
            })}
        </div>
      </>
    );
};