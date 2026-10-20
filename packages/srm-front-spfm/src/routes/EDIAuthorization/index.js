/**
 * index.js
 * EDI的供应商接口授权
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { isEmpty } from 'lodash';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import listDS from './store/listDS';
import typeListDS from './store/typeListDS';

const organizationId = getCurrentOrganizationId();

function EDIAuth(props = {}) {
  let newRecord = {};
  let typeList = [];
  let authTypeCodeMeaning;

  const { authDS } = props.valueDs;
  const ModalKey = Modal.key();
  const typeDS = new DataSet({
    ...typeListDS(),
    transport: {
      read: ({ data = {} }) => {
        const { authId } = data;
        return {
          url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-itf-auth-types/${authId}`,
          method: 'GET',
        };
      },
      submit: ({ data = {} }) => {
        if (isEmpty(typeDS.destroyed)) {
          const { authId } = newRecord;
          return {
            url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-itf-auth-types`,
            method: 'POST',
            data: data.map((e) => {
              return { ...e, authId };
            }),
          };
        }
      },
      destroy: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/supplier-itf-auth-types`,
        method: 'DELETE',
      },
    },
    events: {
      update: ({ record, name, value }) => {
        if (name === 'authTypeCode') {
          typeList.find((e) => {
            if (e.value === value) {
              authTypeCodeMeaning = e.meaning;
              return true;
            } else {
              return false;
            }
          });
          record.set('authTypeCodeMeaning', authTypeCodeMeaning);
        }
      },
    },
  });

  const typeColumns = [
    {
      name: 'authTypeCode',
      editor: true,
    },
    {
      name: 'authTypeCodeMeaning',
      width: 500,
    },
  ];

  const openModal = (record) => {
    newRecord = record.toData();
    typeDS.setQueryParameter('authId', record.get('authId'));
    typeDS.query();
    Modal.open({
      closable: true,
      movable: false,
      keyboardClosable: true,
      style: {
        width: 1200,
      },
      key: ModalKey,
      title: intl.get('spfm.ediAuth.view.header.type').d('类型配置'),
      children: (
        <Table
          dataSet={typeDS}
          columns={typeColumns}
          buttons={['add', 'save', 'delete']}
          queryFieldsLimit={2}
        />
      ),
    });
  };

  const columns = [
    {
      name: 'supplierCompanyObj',
      width: 200,
      editor: (record) => {
        return record.status === 'add';
      },
    },
    {
      name: 'supplierCompanyName',
      width: 250,
    },
    {
      name: 'authUuid',
    },
    {
      name: 'enabledFlag',
      editor: true,
    },
    {
      header: intl.get('spfm.ediAuth.view.header.action').d('操作'),
      width: 120,
      renderer: ({ record }) => (
        <span className="action-link">
          {record.status === 'add' ? (
            <a onClick={() => authDS.remove(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          ) : (
            <a onClick={() => openModal(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          )}
        </span>
      ),
    },
  ];

  useEffect(() => {
    (async function () {
      typeList = await queryIdpValue('SPFM.SUPPLIER_ITF_AUTH_TYPE');
    })();
  }, []);

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.ediAuth.view.header.title').d('EDI供应商接口授权配置')} />
      <Content>
        <Table dataSet={authDS} columns={columns} buttons={['add', 'save']} />
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.ediAuth', 'hzero.common'],
})(
  withProps(
    () => {
      const authDS = new DataSet(listDS());
      const valueDs = {
        authDS,
      };
      return { valueDs };
    },
    { cacheState: true }
  )(EDIAuth)
);
