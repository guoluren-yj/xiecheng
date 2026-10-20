/*
 * OrganizationInfo - 订单明细页-交易方及采买组织信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';
import { Form, Lov, TextField } from 'choerodon-ui/pro';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

const OrganizationInfo = (props) => {
  const { ds, customizeForm, supplierLovFlag, remote } = props;
  const { enableSupplierSiteFlag, supplierId, ouId, companyId } = ds.current.get([
    'enableSupplierSiteFlag',
    'supplierId',
    'ouId',
    'companyId',
  ]);
  return customizeForm(
    {
      code: 'SODR.WORKSPACE_SOURCINGRESULTS_DETAIL.ORGANIZATIONINFO',
      __force_record_to_update__: true,
      lovIgnore: false,
    },
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <Lov name="companyId" />
      {supplierLovFlag ? (
        <SupplierLov
          queryData={{ companyId: companyId?.companyId }}
          name="supplierLov"
          dataSet={ds}
        />
      ) : (
        <Lov name="supplierLov" tableProps={{ queryBarProps: { defaultShowMore: true } }} />
      )}
      <Lov name="ouId" />
      <Lov name="purchaseOrgId" />
      <Lov name="agentId" />
      {/* 默认隐藏字段 */}
      <Lov name="settleCompanyId" />
      <Lov name="settleSupplierLov" newLine />
      {enableSupplierSiteFlag === 1 && supplierId && ouId?.ouId && <Lov name="supplierSiteId" />}
      <TextField name="supplierContactName" />
      <TextField name="supplierContactTelNum" />
      {remote.process('organizationInfoExtraForm', null, props)}
    </Form>
  );
};

export default compose(observer)(OrganizationInfo);
