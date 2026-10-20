import React from 'react';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import { ReactComponent as ApproveEmptySvg } from '@/assets/no_operate.svg';

import style from './index.less';

const EmotionFill = ({ children, type = '', showEmotion = false, ds, emptyCom }) => {
  const getSvg = () => {
    if (type === 'approve') {
      return {
        Com: ApproveEmptySvg,
        emptyInfo: emptyCom || intl.get('smodr.common.view.noApproveListData').d('暂无操作记录'),
      };
    }
    return {};
  };
  const { Com, emptyInfo } = getSvg();
  // 解决svg 闪现
  return showEmotion || (ds && ds.status !== 'loading' && ds.length === 0) ? (
    <div className={style['empty-warper']}>
      <p className={style['primary-color']}>{Com && <Com />}</p>
      <div className={style['empty-info']}>{emptyInfo}</div>
    </div>
  ) : (
    children
  );
};

export default observer(EmotionFill);
