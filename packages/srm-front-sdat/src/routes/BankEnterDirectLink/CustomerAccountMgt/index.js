import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Tabs } from 'choerodon-ui';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';

import {
  ListDS,
  ServiceListDS,
  DetailDS,
  ServiceDetailDS,
  // DomainDetailDS,
} from './store/customerDS';
import EditModal from './EditModal';
import ServiceEditModal from './ServiceEditModal';
import CustomerAccountComp from './CustomerAccountComp';
import ServiceConfig from './ServiceConfig';
import DomainEditModal from './DomainEditModal';
// import DomainConfig from './DomainConfig';

import styles from './index.less';

const { TabPane } = Tabs;

function CustomerAccountMgt(props) {
  const { listDS, serviceListDS, customizeTable } = props;

  const detailDS = useMemo(() => new DataSet(DetailDS()), []);
  const serviceDetailDS = useMemo(() => new DataSet(ServiceDetailDS()));
  // const domainDetailDS = useMemo(() => new DataSet(DomainDetailDS()), []);

  const [refresh, setRefresh] = useState(false);
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleOpenCreateModel = () => {
    let modal = null;

    const handleCloseModal = () => {
      detailDS.data = [];
      serviceDetailDS.data = [];
      detailDS.reset();
      serviceDetailDS.reset();
      modal.close();
    };

    const dsMap = {
      1: detailDS,
      2: serviceDetailDS,
      // '3': domainDetailDS,
    };

    const handleCreate = async () => {
      const commonDS = dsMap[activeKey];

      const isValid = await commonDS.validate();
      if (isValid) {
        const res = await commonDS.submit();
        if (getResponse(res)) {
          modal.close();
          commonDS.data = [];
          commonDS.reset();
          listDS.query();
          serviceListDS.query();
        }
      }
    };

    const titleMap = {
      1: intl
        .get('sdat.customerAccount.view.title.createTenantInterface')
        .d('新建租户接口调用信息'),
      2: intl.get('sdat.customerAccount.view.title.createServiceConfig').d('新建服务信息配置'),
      3: intl.get('sdat.customerAccount.view.title.createDomainConfig').d('新建域名信息配置'),
    };

    const title = titleMap[activeKey];

    modal = Modal.open({
      title,
      children: (
        <>
          {activeKey === '1' ? (
            <EditModal detailDS={detailDS} localRecord={null} />
          ) : activeKey === '2' ? (
            <ServiceEditModal detailDS={serviceDetailDS} localRecord={null} />
          ) : (
            <DomainEditModal />
          )}
        </>
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      onCancel: handleCloseModal,
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
  };

  // const handleEdit = () => {
  //   domainDetailDS.setState('editFlag', true);
  //   const record = domainDetailDS?.current;
  //   if (record) {
  //     record.status = 'update';
  //   }
  //   setRefresh(true);
  // };

  // const handleSave = async () => {
  //   const isValid = await domainDetailDS.validate();

  //   if (isValid) {
  //     const res = await domainDetailDS.submit();

  //     if (getResponse(res)) {
  //       domainDetailDS.setState('editFlag', false);
  //       setRefresh(true);
  //     }
  //   }
  // };

  // const editFlag = domainDetailDS.getState('editFlag');

  return (
    <div className={styles['customer-account-basic-panel']}>
      <Header
        title={intl
          .get('sdat.customerAccount.view.title.customerAccountMgt')
          .d('租户接口调用信息配置')}
      >
        {activeKey !== '3' ? (
          <Button color="primary" icon="add" onClick={handleOpenCreateModel}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        ) : null}
        {/* {activeKey === '3' ? (
          <>
            {editFlag ? (
              <Button color="primary" icon="save" onClick={handleSave}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            ) : (
              <Button color="primary" icon="mode_edit" onClick={handleEdit}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            )}
          </>
        ) : null} */}
      </Header>
      <Content style={{ margin: '8px' }}>
        <Tabs defaultActiveKey="1" onChange={handleChangeTab}>
          <TabPane
            tab={intl.get('sdat.customerAccount.view.title.tenantConfig').d('租户信息配置')}
            key="1"
          >
            <CustomerAccountComp listDS={listDS} customizeTable={customizeTable} />
          </TabPane>
          <TabPane
            tab={intl.get('sdat.customerAccount.view.title.serviceConfig').d('服务信息配置')}
            key="2"
          >
            <ServiceConfig listDS={serviceListDS} customizeTable={customizeTable} />
          </TabPane>
          {/* <TabPane
            tab={intl.get('sdat.customerAccount.view.title.doMainConfig').d('系统配置')}
            key="3"
          >
            <DomainConfig detailDS={domainDetailDS} customizeTable={customizeTable} />
          </TabPane> */}
        </Tabs>
      </Content>
    </div>
  );
}

export default formatterCollections({
  code: ['sdat.customerAccount'],
})(
  withCustomize({
    unitCode: ['SDAT.CUSTOMER_ACCOUNT_MGT', 'SDAT.SERVICE_CONFIG_MGT'],
  })(
    withProps(
      () => {
        const listDS = new DataSet(ListDS());
        const serviceListDS = new DataSet(ServiceListDS());
        // const domainListDS = new DataSet(DomainListDS());
        return { listDS, serviceListDS };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(CustomerAccountMgt)
  )
);
