/*
 * @Description: 分屏模式-基础信息-协议头
 * @Date: 2025-01-23 17:26:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
// import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';
import ConstructForm from '../../ContractHeader/ConstructForm';

const HeaderInfo = observer(({ headerFormDs, customizeForm, editable }) => {
  // 供应商修改回调
  const handleChangeSupplier = () => {
    if (headerFormDs.current && headerFormDs.current?.get('pcKindCode')) {
      headerFormDs.current.set('supplierCompanyId', -1);
    }
  };

  return customizeForm(
    {
      code: `SPCM.WORKSPACE_DETAIL.HEADER`,
      disableMaxCol: true,
      dataSet: headerFormDs,
    },
    <CollapseForm dataSet={headerFormDs} columns={1} labelAlign="left" labelLayout="float">
      <ConstructForm dataSet={headerFormDs} formType="TextField" isEdit={editable} name="pcName" />
      <ConstructForm dataSet={headerFormDs} formType="Lov" isEdit={editable} name="companyIdLov" />
      {headerFormDs?.current?.get('pcKindCodeValue') === 'NOT_SYS_SUPPLIER' ? (
        <ConstructForm
          formType="TextField"
          isEdit={editable}
          name="supplierCompanyName"
          onChange={handleChangeSupplier}
          dataSet={headerFormDs}
        />
      ) : (
        <ConstructForm
          formType="SupplierLov"
          isEdit={editable}
          name="supplierCompanyIdLov"
          dataSet={headerFormDs}
          queryData={{ companyId: headerFormDs?.current?.get('companyId') }}
        />
      )}
    </CollapseForm>
  );
});

export default HeaderInfo;
