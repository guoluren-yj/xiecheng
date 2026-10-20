import React, { useEffect, useState, useMemo, Fragment } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { useDataSet, Table, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  getPermission,
  saveMenuAssign,
  submitMenuAssign,
} from '@/services/menuPermissionAllocationService';

import { listDs } from './indexDs';

const Index = () => {
  const listDS = useDataSet(() => listDs(), []);
  const [show, setShow] = useState(false);

  const allowEdit = (record) => {
    if (!isTenantRoleLevel()) {
      return false;
    }
    if (['add', 'update'].includes(record.get('updateStatus'))) {
      return true;
    } else {
      return false;
    }
  };

  const handleClear = (record) => {
    if (record?.get('updateStatus') === 'add') {
      listDS.remove(record);
    } else {
      record.reset();
    }
  };

  useEffect(() => {
    getPermission().then((res) => {
      if (res === true) {
        listDS.query();
        setShow(true);
      }
    });
  }, []);

  const columns = useMemo(() => {
    const cols = [
      {
        name: 'status',
        width: 150,
      },
      {
        name: 'type',
        width: 150,
        editor: (record) => allowEdit(record),
      },
      {
        name: 'menuId',
        width: 200,
        editor: (record) => allowEdit(record),
      },
      {
        name: 'permissionId',
        width: 200,
        editor: (record) => allowEdit(record),
      },
      {
        name: 'tenantName',
        width: 200,
      },
      {
        name: 'creator',
        width: 150,
      },
      {
        name: 'execStatus',
        width: 150,
      },
      {
        name: 'errorMsg',
        width: 150,
      },
    ];

    if (isTenantRoleLevel()) {
      cols.push({
        name: 'action',
        renderer: ({ record }) => {
          if (['add', 'update'].includes(record.get('updateStatus'))) {
            return (
              <a onClick={() => handleClear(record)}>
                {intl.get(`hzero.common.button.clean`).d('清除')}
              </a>
            );
          } else if (record.get('status') === 'NEW') {
            return (
              <a onClick={() => record.set({ updateStatus: 'update' })}>
                {intl.get(`hzero.common.button.editor`).d('编辑')}
              </a>
            );
          }
        },
      });
    }

    return cols;
  }, []);

  const HeaderBtn = observer(() => {
    const { selected, dirty } = listDS;

    const handleCreate = () => {
      listDS.create(
        {
          updateStatus: 'add',
        },
        0
      );
    };

    console.log(dirty);

    const handleSave = () => {
      return new Promise(async (resolve) => {
        const flag = await listDS.validate();
        if (flag) {
          saveMenuAssign([...listDS?.toJSONData()]).then((res) => {
            if (getResponse(res)) {
              listDS.unSelectAll();
              listDS.clearCachedSelected();
              listDS.query();
              notification.success();
            }
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    };

    const handleSubmit = () => {
      return new Promise(async (resolve) => {
        if (dirty) {
          notification.error({
            message: '有未保存的数据，请先保存再提交',
          });
          resolve(true);
        } else {
          submitMenuAssign(selected.map((ele) => ele.toData())).then((res) => {
            if (getResponse(res)) {
              listDS.unSelectAll();
              listDS.clearCachedSelected();
              listDS.query();
              notification.success();
            }
            resolve(true);
          });
        }
      });
    };

    return (
      <>
        <Button
          icon="check"
          type="c7n-pro"
          color="primary"
          funcType="raised"
          disabled={isEmpty(selected)}
          onClick={handleSubmit}
        >
          {intl.get(`hzero.common.button.sumbit`).d('提交')}
        </Button>
        <Button icon="save" type="c7n-pro" funcType="flat" disabled={!dirty} onClick={handleSave}>
          {intl.get(`hzero.common.btn.save`).d('保存')}
        </Button>
        <Button icon="add" type="c7n-pro" funcType="flat" onClick={handleCreate}>
          {intl.get(`hzero.common.button.new`).d('新建')}
        </Button>
      </>
    );
  });

  return (
    <Fragment>
      <Header title="菜单权限分配">{show && isTenantRoleLevel() && <HeaderBtn />}</Header>
      <Content>
        {show ? <Table dataSet={listDS} columns={columns} /> : '没有权限访问该页面'}
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['smdm.common'],
})(Index);
