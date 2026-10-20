import React, { useEffect, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Button, Modal, Form, Lov, TextField } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';

// import EditServiceList from './EditServiceList';

import { AppListDS, DetailDS } from './stores/aiAppManageDS';

function AiOrgConfig(props) {
  const { listDS } = props;

  // const serviceListDS = useMemo(() => new DataSet({ ...ServiceListDS() }), []);
  const detailDS = useMemo(() => new DataSet({ ...DetailDS(), forceValidate: true }), []);

  useEffect(() => {
    listDS.query();
  }, []);

  const handleDelete = (rcd) => {
    listDS.delete(rcd).then(() => {
      listDS.query();
    });
  };

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        header: intl.get('sdat.aiOrgConfig.view.model.serialNumber').d('序号'),
        width: 65,
        lock: 'left',
        renderer: ({ record }) => {
          const { currentPage, pageSize } = listDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'tenantNum',
        width: 200,
      },
      {
        name: 'tenantName',
        width: 200,
      },

      {
        name: 'applicationCode',
      },
      // {
      //   name: 'serviceList',
      //   header: intl.get('sdat.aiOrgConfig.view.model.serviceList').d('服务列表'),
      //   renderer: ({ record }) => {
      //     return (
      //       <span>
      //         <a onClick={() => handleOpenServiceModal(record)}>
      //           {intl.get('sdat.aiOrgConfig.view.model.serviceManage').d('管理服务')}
      //         </a>
      //       </span>
      //     );
      //   },
      // },
      {
        name: 'operation',
        header: intl.get('sdat.aiOrgConfig.view.model.operation').d(' 操作'),
        renderer: ({ record }) => {
          return (
            <span>
              <a onClick={() => handleOpenEditModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>

              <a style={{ marginLeft: '10px' }} onClick={() => handleDelete(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  /**
   * 维护服务列表
   * @param {object} item
   */
  // const handleOpenServiceModal = item => {
  //   let modal = null;
  //   const tenantId = item?.get('tenantId') ?? '';
  //   const handleCloseModal = () => {
  //     if (modal) {
  //       modal.close();
  //     }
  //   };

  //   modal = Modal.open({
  //     title: intl.get('sdat.aiOrgConfig.view.title.editAppList').d('编辑服务列表'),
  //     children: <EditServiceList listDS={serviceListDS} tenantId={tenantId} />,
  //     closable: true,
  //     drawer: true,
  //     mask: true,
  //     fullScreen: true,
  //     style: { width: ' 1000px' },
  //     footer: null,
  //     onCancel: handleCloseModal,
  //   });
  // };

  /**
   * 新建或编辑数据
   * @param {object} item
   */
  const handleOpenEditModal = (item) => {
    let modal = null;
    let uId = null;
    if (item) {
      // 编辑操作
      detailDS.data = [item];
      uId = item?.get('id') ?? '';
    } else {
      detailDS.data = [];
      detailDS.create({});
    }

    const handleCloseModal = () => {
      if (modal) {
        detailDS.reset();
        detailDS.loadData([]);
        modal.close();
      }
    };

    const handleCreate = async () => {
      const isValid = await detailDS.validate();

      if (isValid) {
        detailDS.submit().then(() => {
          handleCloseModal();
        });
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.aiOrgConfig.view.title.editServiceApp').d('编辑服务配置'),
      children: (
        <Form dataSet={detailDS} columns={1} labelLayout="float">
          <Lov name="tenantObj" disabled={!!uId} />
          <TextField name="applicationCode" />
        </Form>
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
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

  return (
    <>
      <Header title={intl.get('sdat.aiOrgConfig.view.title.aiServiceMgt').d('租户AI应用管理')}>
        <Button icon="add" color="primary" onClick={() => handleOpenEditModal('')}>
          {intl.get('sdat.aiOrgConfig.view.title.createNew').d('新增')}
        </Button>
      </Header>
      <Content>
        <Table
          dataSet={listDS}
          columns={columns()}
          customizable
          customizedCode="SDAT.AI_AGENT_ORG_CONFIG_LIST"
        />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.aiOrgConfig'],
})(
  withProps(
    () => {
      const listDS = new DataSet(AppListDS());
      return { listDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(AiOrgConfig)
);
