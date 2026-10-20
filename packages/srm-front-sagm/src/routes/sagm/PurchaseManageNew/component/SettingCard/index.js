import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import defaultImg from '@/assets/purchase_img1.svg';
import style from './index.less';

export default function SettingCard(props) {
  const {
    imgSrc = defaultImg,
    description,
    onImmediateApply = (e) => e,
    onPreview = (e) => e,
  } = props;
  return (
    <div className={style['setting-card']}>
      <img className={style['setting-card-img']} src={imgSrc} alt="img" />
      <p className={style['setting-card-description']}> {description}</p>
      <Button className={style['setting-card-apply-btn']} onClick={onImmediateApply}>
        {' '}
        {intl.get('sagm.common.button.immediateApply').d('立即应用')}{' '}
      </Button>
      <Button funcType="link" color="primary" onClick={onPreview}>
        {intl.get('sagm.common.button.preview').d('效果预览')}
      </Button>
    </div>
  );
}
