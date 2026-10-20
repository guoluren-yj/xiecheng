import React, { useContext } from 'react';
// import emptyApi from '@/routes/Model/assets/no-model@2x.png';
import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

import ImgIcon from '@/utils/ImgIcon';

type IGetPageTypeNameParams = (pageType: string) => void; // fixme enum
const getPageTypeName: IGetPageTypeNameParams = (pageType) => {
  switch (pageType) {
    case 'model':
      return '模型';
    case 'authorization':
      return '模型';
    default:
  }
};

const Index = () => {
  const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const {
    pageFun: { type: pageType },
  }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

  const pageTypeName = getPageTypeName(pageType);

  const platformRoleWithoutTenantSelection =
    !isTenantRoleLevel() &&
    modelManagerStore.storeData.resourceUponRoleHierarchy === 'tenant' &&
    !modelManagerStore.storeData.selectedTenantId;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 250,
        margin: '88px auto',
        width: 572,
      }}
    >
      {/* <img src={emptyApi} alt="" style={{ width: '200px' }} /> */}
      <ImgIcon name="no-model@2x.png" size={200} style={{ width: '200px' }} />
      <div style={{ marginLeft: 40 }}>
        <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)' }}>
          {platformRoleWithoutTenantSelection
            ? '当前位于租户资源层但未选择租户'
            : `检测到您未选择任何${pageTypeName}`}
        </div>
        <div style={{ fontSize: '20px', marginTop: 10 }}>
          {platformRoleWithoutTenantSelection
            ? '请选择租户或检查角色权限'
            : `请在左侧树状图中选择您要查看的${pageTypeName}`}
        </div>
      </div>
    </div>
  );
};
export default Index;
