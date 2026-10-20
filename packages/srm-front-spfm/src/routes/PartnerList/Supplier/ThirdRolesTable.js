/*
 * @Date: 2025-02-12 14:34:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import {isEmpty} from "lodash";
import { observer } from 'mobx-react';
import {Table, DataSet, useDataSet, Button, Lov, Icon, Modal} from "choerodon-ui/pro";

import intl from "utils/intl";
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { bacthAssignThirdRoles, bacthRecycleThirdRoles } from '@/services/supplierService';
import {getRolesTableDs, getAssignRolesDs} from "./stores/getThirdRolesDS";

const ThirdRolesTable = observer(({record})=>{
  const {partnerId, supplierCompanyId, partnerTenantId} = record;
  const dataSet = useDataSet(()=>getRolesTableDs(partnerId), [partnerId]);

  const columns=[
    {
      name: "loginName",
    },
    {
      name: "realName",
    },
  ];

  // 批量分配第三方角色
  const handleBatchAssign = lovDs => {
    const selectedRows = (lovDs?.selected || []).map(curRecord => curRecord.toData());
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    } else {
      bacthAssignThirdRoles({partnerId, selectedRows })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              dataSet.query();
            }
          });
    }
  };

  // 批量回收第三方角色
  const handleBatchRecycle=()=>{
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get('spfm.supplier.model.supplier.platform.batchRecycleMsg').d('是否确认回收第三方角色？'),
      onOk: () => {
        const selectedRows = dataSet.selected.map(curRecord => curRecord.toData());
       return bacthRecycleThirdRoles(selectedRows)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dataSet.query();
          }
        });
      },
    });
  };

  const getButtons = ()=>{
    const assignRolesDs = new DataSet(getAssignRolesDs({supplierCompanyId, partnerTenantId}));
    const lovDs = assignRolesDs.getField("assignRoles").getOptions(assignRolesDs.current);
    const disabled = isEmpty(dataSet.selected);

    return [
      <Lov
        mode="button"
        name="assignRoles"
        clearButton={false}
        dataSet={assignRolesDs}
        onBeforeSelect={()=>!isEmpty(lovDs?.selected)}
        modalProps={{
          onOk: ()=>handleBatchAssign(lovDs),
          beforeOpen: () => {
            if (lovDs) {
              lovDs.unSelectAll();
              lovDs.clearCachedSelected();
            }
          },
        }}
      >
        <Icon type="edit_note" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
        {intl.get('sslm.common.model.message.assign').d('分配')}
      </Lov>,
      <Button icon='add_to_drive' disabled={disabled} onClick={handleBatchRecycle}>
        {intl.get('sslm.common.model.message.recycle').d('回收')}
      </Button>,
    ];
  };
  return <Table dataSet={dataSet} columns={columns} buttons={getButtons()} style={{maxHeight: "calc(100vh - 200px)"}} />;
});

export default ThirdRolesTable;