import React, { Fragment, useMemo } from 'react';
import { flowRight } from 'lodash';
import { DataSet, Button, Form, TextField, Lov } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import { tableDs, formDs } from './ds';
import { fetchEnableSupplier, fetchNewSupplier } from '@/services/platformSupplierManage';
import c7nModal from '@/utils/c7nModal';
import Detail from '../MarketSupplierManage/Detail';

function PlatformSupplierManage() {
  const ds = useMemo(() => new DataSet(tableDs()), []);

  const handleEnable = async (record) => {
    const result = getResponse(await fetchEnableSupplier(record));
    if (result) {
      notification.success();
      ds.query(ds.currentPage);
    }
  };

  const customTag = (value, yesText, noText) => {
    return (
      <Tag
        color={value === 1 ? 'rgba(71,184,129,0.10)' : '#ffeeeb'}
        style={{ color: value === 1 ? 'rgba(71,184,129,1)' : '#f56649' }}
      >
        {value === 1 ? yesText : noText}
      </Tag>
    );
  };

  const handleAdd = () => {
    const createDs = new DataSet(formDs());
    c7nModal({
      style: { width: 380 },
      title: intl.get('smkt.supplierManage.view.modal.newSupplier').d('新建平台甄选供应商'),
      children: (
        <Form dataSet={createDs} labelLayout="float">
          <Lov name="companyLov" />
          <TextField name="companyName" />
        </Form>
      ),
      onOk: () => handleOk(createDs),
    });
  };

  const handleOk = async (createDs) => {
    const flag = await createDs.validate();
    if (flag) {
      const result = getResponse(await fetchNewSupplier(createDs.current?.toData()));
      if (result) {
        notification.success();
        ds.query(ds.currentPage);
        return true;
      }
    }
    return false;
  };

  const openDetail = (record) => {
    c7nModal({
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      style: { width: 800 },
      title: intl.get('smkt.supplierManage.view.modal.supplierInfo').d('供应商信息'),
      children: <Detail record={record} isPlatform />,
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'enableFlag',
        width: 100,
        renderer: ({ value }) =>
          customTag(
            value,
            intl.get('smpc.product.status.enable').d('启用'),
            intl.get('smpc.product.status.disable').d('禁用')
          ),
        align: 'left',
      },
      {
        name: 'companyName',
        renderer: ({ text, record }) => <a onClick={() => openDetail(record)}>{text}</a>,
      },
      {
        name: 'companyNum',
        minWidth: 160,
      },
      {
        name: 'creationDate',
        minWidth: 150,
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => handleEnable(record.toData())}>
            {record.get('enableFlag') === 1
              ? intl.get('hzero.common.status.disable').d('禁用')
              : intl.get('hzero.common.status.enable').d('启用')}
          </a>
        ),
      },
    ];
  }, []);

  const searchBarProps = {
    searchBarConfig: {
      fieldProps: {
        supplierId: { lovPara: { tenantId: 0 } },
      },
    },
    cacheState: true,
    searchCode: 'SMKT.MARKT.PLATFORM_SUPPLIER_MANAGE.SEARCHBAR',
  };

  return (
    <Fragment>
      <Header
        title={intl.get('smkt.platformSupplierManage.view.title.table').d('平台甄选供应商管理')}
      >
        <Button onClick={handleAdd} icon="add" color="primary">
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable
          dataSet={ds}
          columns={columns}
          customizedCode="SMKT.MARKT.PLATFORM_SUPPLIER_MANAGE.LIST"
          {...searchBarProps}
          style={{ maxHeight: 'calc(100vh - 310px)' }}
        />
      </Content>
    </Fragment>
  );
}

export default flowRight(
  //   withCustomize({ unitCode: getTabs('custCode') }),
  formatterCollections({
    code: ['smkt.platformSupplierManage', 'hzero.common', 'smpc.product', 'smkt.supplierManage'],
  })
)(PlatformSupplierManage);
