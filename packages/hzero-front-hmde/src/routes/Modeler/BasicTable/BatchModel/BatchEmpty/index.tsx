import React from 'react';
import ImgIcon from '@/utils/ImgIcon';

export default () => (
  <div
    style={{
      textAlign: 'center',
      height: 400,
      margin: '0px auto',
      width: 572,
    }}
  >
    <ImgIcon name="noright.svg" alt="" size={300} />
    <div style={{ marginLeft: 40 }}>
      <div style={{ fontSize: '16px', color: 'rgba(0,0,0,0.65)' }}>检测到您没有可用基础表</div>
      <div style={{ fontSize: '22px', marginTop: 10 }}>
        请先正向建表或联系平台管理员进行基础表授权
      </div>
    </div>
  </div>
);
