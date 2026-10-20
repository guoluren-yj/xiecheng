import React from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import noOrder from '@/assets/sign/noPermission.svg';

const RedirectPage = () => {
  return (
    <>
      <div
        style={{
          height: 'calc(100vh)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <img src={noOrder} alt="" />
        <div
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#1D2129',
            fontWeight: '500',
            lineHeight: '24px',
            marginTop: '16px',
          }}
        >
          {intl
            .get('spfm.buyerElectronicSign.view.message.noPremission')
            .d('您暂无权限管理印章，请联系印章管理员处理')}
        </div>
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['spfm.buyerElectronicSign'],
})(RedirectPage);
