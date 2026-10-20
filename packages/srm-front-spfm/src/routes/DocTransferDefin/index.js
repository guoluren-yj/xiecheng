/**
 * index.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useMemo } from 'react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  queryTransferOne,
  createTransfer,
  updateTransfer,
} from '@/services/docTransferDefinService';
import listDS from './store/listDS';
import DocForm from './DocForm';
import SurfaceDS from './store/surfaceDS';
import TenantDS from './store/tenantDS';
import PostWhereDS from './store/postWhereDS';
// @connect()

const deliverType = {
  USER: 'USER',
  AGENT: 'AGENT',
};

function DocTransferDefin(props = {}) {
  const { docListDS } = props.valueDs;
  const surfaceDS = useMemo(() => new DataSet(SurfaceDS()), []);
  const surfacePurchaserDS = useMemo(() => new DataSet(SurfaceDS()), []);

  const tenantDS = useMemo(() => new DataSet(TenantDS()), []);
  const docListDSCopy = useMemo(() => new DataSet(listDS()), []);
  const postWhereDS = useMemo(() => new DataSet(PostWhereDS()), []);
  const [state, setState] = useState({
    loading: false,
  });

  const ModalKey = Modal.key();

  const handleCreate = async (record, flag) => {
    const formFlag = await record.validate();
    const surfaceFlag = await surfaceDS.validate();
    const surfacePurchaserFlag = await surfacePurchaserDS.validate();
    const postWhereFlag = await postWhereDS.validate();
    const tenantFlag = record.get('enabledFlag') ? await tenantDS.validate() : true;
    if (formFlag && surfaceFlag && surfacePurchaserFlag && postWhereFlag && tenantFlag) {
      setState({
        loading: true,
      });
      let surfaceData = surfaceDS.toData();
      let surfacePurchaserData = surfacePurchaserDS.toData();
      const postWhereData = postWhereDS.toData();
      let postWhere = '';
      if (postWhereData.length > 0) {
        postWhere = postWhereData.map(i => `${i.tableName}:${i.condition}`).join(';');
      }
      if (surfaceData.length > 0) {
        surfaceData = surfaceData.map(item => ({ ...item, deliverType: deliverType.USER }));
        if (surfaceData.filter(e => !!e.tableMasterFlag).length !== 1) {
          setState({
            loading: false,
          });
          notification.error({
            description: intl
              .get('spfm.docTransferDefin.model.view.tableMasterFlag.validate1')
              .d('子账户必须维护一个主表且只能有一个'),
          });
          return false;
        }
      }
      if (surfacePurchaserData.length > 0) {
        surfacePurchaserData = surfacePurchaserData.map(item => ({
          ...item,
          deliverType: deliverType.AGENT,
        }));
        if (surfacePurchaserData.filter(e => !!e.tableMasterFlag).length !== 1) {
          setState({
            loading: false,
          });
          notification.error({
            description: intl
              .get('spfm.docTransferDefin.model.view.tableMasterFlag.validate2')
              .d('采购员必须维护一个主表且只能有一个'),
          });
          return false;
        }
      }
      if (flag) {
        const res = getResponse(
          await createTransfer({
            ...record.toData(),
            postWhere,
            deliverLines: [...surfaceData, ...surfacePurchaserData],
            conditionalRuleFlag: record.get('conditionalRuleFlag') ? 1 : 0,
            deliverTenants: record.get('docLevel') === 'TENANT' ? tenantDS.toData() : [],
          })
        );
        if (res && !res.failed) {
          notification.success();
          docListDS.query();
        } else {
          setState({
            loading: false,
          });
          return false;
        }
      } else {
        const res = getResponse(
          await updateTransfer({
            ...record.toData(),
            postWhere,
            deliverLines: [...surfaceData, ...surfacePurchaserData],
            deliverTenants: record.get('docLevel') === 'TENANT' ? tenantDS.toData() : [],
          })
        );
        if (res && !res.failed) {
          docListDS.query();
          notification.success();
        } else {
          setState({
            loading: false,
          });
          return false;
        }
      }
    } else {
      return false;
    }
    setState({
      loading: false,
    });
  };
  const handleClose = record => {
    docListDSCopy.remove(record);
    surfaceDS.loadData([]);
    surfacePurchaserDS.loadData([]);
    tenantDS.loadData([]);
  };
  const handleAddModal = async (data, flag) => {
    const formData = !flag ? getResponse(await queryTransferOne(data.docHeaderId)) : {};
    let postWhereDSInitData = [];
    if (formData && formData.postWhere) {
      postWhereDSInitData = formData.postWhere.split(';').map(item => ({
        tableNameObj: { tableName: item.split(':')[0] },
        condition: item.split(':')[1],
      }));
    }
    postWhereDS.loadData(postWhereDSInitData);
    const record = docListDSCopy.create(formData);
    record.status = 'update';
    Modal.open({
      closable: true,
      drawer: true,
      keyboardClosable: true,
      style: {
        width: 1000,
      },
      key: ModalKey,
      title:
        flag === 'create'
          ? intl.get('spfm.docTransferDefin.view.header.create').d('创建单据转交定义')
          : intl.get('spfm.docTransferDefin.view.header.edit').d('编辑单据转交定义'),
      children: (
        <DocForm
          dataRecord={record}
          deliverType={deliverType}
          surfaceDS={surfaceDS}
          surfacePurchaserDS={surfacePurchaserDS}
          tenantDS={tenantDS}
          postWhereDS={postWhereDS}
          create={flag === 'create'}
        />
      ),
      onOk: () => handleCreate(record, flag),
      okProps: { loading: state.loading },
      onClose: () => handleClose(record, flag),
    });
  };

  const columns = [
    {
      name: 'docCode',
      width: 200,
    },
    {
      name: 'docName',
      width: 250,
    },
    {
      name: 'docLevel',
    },
    {
      name: 'orderSeq',
    },
    {
      name: 'enabledFlag',
      width: 120,
      renderer: data => {
        return enableRender(data.value);
      },
    },
    {
      name: 'action',
      width: 120,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => handleAddModal(record.toData())}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        </span>
      ),
    },
  ];
  return (
    <React.Fragment>
      <Header title={intl.get('spfm.docTransferDefin.view.header.title').d('单据转交定义')}>
        <Button color="primary" onClick={() => handleAddModal({}, 'create')}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={docListDS} columns={columns} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.docTransferDefin', 'hzero.common'],
})(
  withProps(
    () => {
      const docListDS = new DataSet(listDS());
      const valueDs = {
        docListDS,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(DocTransferDefin)
);
