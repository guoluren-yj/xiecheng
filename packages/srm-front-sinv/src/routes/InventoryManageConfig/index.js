/* eslint-disable no-param-reassign */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import List from './List';
// import { c7nModal } from '@/routes/components/CustomSpecsModal';
import { ListDateSet } from './store/ListDs';
// import PermissionCompDs from './Add/store/permissionCompDs';
// import PermissionComp from './Add/PermissionComp';
import {
  delInventoryList,
  saveInventoryList,
  // queryInventoryDetail,
} from '@/services/inventoryManageService';

// import Add from './Add';

function Index(props) {
  const { history } = props;
  const ListDs = useMemo(() => new DataSet(ListDateSet()), []);
  // const PermissionCompDS = useMemo(() => new DataSet(PermissionCompDs()), []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ListDs.query(ListDs.currentPage);
  }, []);

  const handleDelete = () => {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.inventory.model.view.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('sinv.inventory.model.view.orderDelete').d(`确认删除选中行？`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        setLoading(true);
        const params = ListDs.selected.map((i) => i.toJSONData());
        ListDs.status = 'submitting';
        delInventoryList(params)
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              ListDs.query();
              ListDs.status = 'ready';
              setLoading(false);
            }
          })
          .finally(() => {
            ListDs.status = 'ready';
            setLoading(false);
          });
      },
    });
  };

  // const handleSure = async (modalTwo, res = {}) => {
  //   const lineFlag = await ConfigDs.validate();
  //   const autoFlag =
  //     res?.processFactory === 1
  //       ? AutoDs.map((i) => i.toJSONData())?.[0]?.cycleAuto
  //         ? (await AutoDs.validate()) && (await WeekDs.validate())
  //         : await WeekDs.validate()
  //       : true;
  //   if (!lineFlag || !autoFlag) return false;
  //   if (lineFlag && autoFlag) {
  //     const params = {
  //       stockOutStrategyLines: ConfigDs.map((i) => i.toJSONData()).map((x) => ({
  //         ...x,
  //         strategyHeaderId: res.strategyHeaderId,
  //         tenantId: getCurrentOrganizationId(),
  //       })),
  //       stockOutStockMappingList:
  //         res.processFactory === 1
  //           ? WeekDs.map((i) => i.toJSONData()).map((x) => ({
  //               ...x,
  //               strategyHeaderId: res.strategyHeaderId,
  //               tenantId: getCurrentOrganizationId(),
  //             }))
  //           : [],
  //       ...AutoDs.map((i) => i.toJSONData())?.[0],
  //       tenantId: getCurrentOrganizationId(),
  //       strategyHeaderId: res.strategyHeaderId,
  //       objectVersionNumber: res.objectVersionNumber,
  //       ...res,
  //     };
  //     saveInventoryList(params).then((rec) => {
  //       if (getResponse(rec)) {
  //         notification.success();
  //         ListDs.query();
  //         if (modalTwo) {
  //           AutoDs.reset();
  //           ConfigDs.removeAll(true);
  //           WeekDs.removeAll(true);
  //           modalTwo.close();
  //         }
  //       }
  //     });
  //   }
  // };

  // const handleNext = useCallback(async (modal, id) => {
  //   // 调保存接口
  //   const flag = await ListDs.current.validate();
  //   const params = {
  //     ...ListDs.current.toData(),
  //     tenantId: getCurrentOrganizationId(),
  //     strategyHeaderId: id,
  //   };
  //   if (!flag) return false;
  //   saveInventoryList(params).then((res) => {
  //     if (getResponse(res)) {
  //       modal.close();
  //       AutoDs.reset();
  //       ConfigDs.removeAll(true);
  //       WeekDs.removeAll(true);
  //       const extra = {
  //         strategyHeaderId: res.strategyHeaderId,
  //         objectVersionNumber: res.objectVersionNumber,
  //         processFactory: res.processFactory,
  //       };
  //       // processFactory 调拨单0 盘点1 普通2
  //       ConfigDs.setState('processFactory', res.processFactory);
  //       const modalTwo = c7nModal({
  //         style: { width: 742 },
  //         title: `${intl
  //           .get(`sinv.common.model.common.createInventoryConfig`)
  //           .d('新建委外协同类型')}`,
  //         children: <Add {...extra} ds={ConfigDs} AutoDs={AutoDs} WeekDs={WeekDs} />,
  //         footer: (
  //           <>
  //             <Button color="primary" onClick={() => handleSure(modalTwo, res)}>
  //               {intl.get('hzero.common.button.sure').d('确定')}
  //             </Button>
  //             <Button onClick={() => handleCreate(modalTwo, 'prev', res.strategyHeaderId)}>
  //               {intl.get('hzero.common.button.front').d('上一步')}
  //             </Button>
  //             <Button
  //               onClick={() => {
  //                 modalTwo.close();
  //                 ListDs.query();
  //                 AutoDs.reset();
  //                 ConfigDs.removeAll(true);
  //                 WeekDs.removeAll(true);
  //               }}
  //             >
  //               {intl.get('hzero.common.btn.cancel').d('取消')}
  //             </Button>
  //           </>
  //         ),
  //       });
  //     }
  //   });
  // }, []);

  // // 权限维护
  // const openModal = (strategyHeaderId) => {
  //   const props = { tableDs: PermissionCompDS, strategyHeaderId };
  //   c7nModal({
  //     style: { width: 742 },
  //     title: intl.get('slod.shipmentsConfiguration.model.queryOperate').d('操作/查询权限角色维护'),
  //     children: <PermissionComp {...props} />,
  //     okText: intl.get(`hzero.common.button.save`).d('保存'),
  //     onOk: async () => {
  //       const data = PermissionCompDS.toData();
  //       const params = { strategyHeaderId, data };
  //       const flag = await PermissionCompDS.validate();
  //       if (flag) {
  //         const res = await savePermissonModal(params);
  //         if (getResponse(res)) {
  //           notification.success();
  //           PermissionCompDS.query();
  //         }
  //         return false;
  //       } else {
  //         return false;
  //       }
  //     },
  //   });
  // };

  const handleCreate = useCallback(() => {
    history.push({
      pathname: '/sinv/inventoryManageConfig/detail',
      search: `create=1`,
    });
    // if (type !== 'prev') {
    //   ListDs.create({});
    // }
    // if (modalTwo && isFunction(modalTwo.close)) {
    //   modalTwo.close();
    // }
    // if (id) {
    //   queryInventoryDetail(id).then((res) => {
    //     ListDs.loadData([res]);
    //   });
    // }
    // const BaseInfo = () => (
    //   <Form labelLayout="float" columns={2} dataSet={ListDs}>
    //     <TextField name="strategyCode" />
    //     <IntlField name="strategyName" />
    //     <Select name="processFactory" />
    //     <Lov name="cuszDocTmplCodeObj" />
    //     <Lov name="codeRuleLov" />
    //     <Select name="enableFlag" />
    //     <TextField name="creationName" disabled />
    //     {/* <Output
    //       name="per"
    //       renderer={({ record }) => (
    //         <>
    //           <Button
    //             icon="assignment_ind"
    //             style={{
    //               float: 'left',
    //               width: ' 100%',
    //               textAlign: 'left',
    //               // borderColor: ' #ffbc00',
    //               border: 'none',
    //               color: '#29BECE',
    //             }}
    //             onClick={() => openModal(record.get('strategyHeaderId'))}
    //           >
    //             {intl
    //               .get('slod.shipmentsConfiguration.model.queryOperate')
    //               .d('操作/查询权限角色维护')}
    //           </Button>
    //         </>
    //       )}
    //     /> */}
    //   </Form>
    // );
    // const modalOne = c7nModal({
    //   style: { width: 742 },
    //   title: `${intl.get(`sinv.inventoryBench.view.createInventoryConfig`).d('新建委外协同管理')}`,
    //   children: <BaseInfo />,
    //   footer: (
    //     <>
    //       <Button color="primary" onClick={() => handleNext(modalOne, id)}>
    //         {intl.get('hzero.common.button.next').d('下一步')}
    //       </Button>
    //       <Button
    //         onClick={() => {
    //           modalOne.close();
    //           ListDs.query();
    //         }}
    //       >
    //         {intl.get('hzero.common.btn.cancel').d('取消')}
    //       </Button>
    //     </>
    //   ),
    //   afterClose: () => ListDs.query(),
    // });
  }, []);

  // 启用/禁用
  const handleEnableFlagChange = async (record, typeNum) => {
    const data = { ...record?.toData(), enableFlag: typeNum };
    const result = await saveInventoryList(data);
    if (getResponse(result)) {
      ListDs.query();
    }
  };

  const HeaderBtns = observer(({ dataSet }) => {
    const buttons = [
      {
        name: 'export',
        group: true,
        child: (
          <Button icon="add" loading={loading} onClick={handleCreate} color="primary">
            {intl.get(`sinv.inventoryBench.model.view.create`).d('新建')}
          </Button>
        ),
      },
      {
        name: 'del',
        group: true,
        child: (
          <>
            <Button
              loading={loading}
              icon="delete_sweep"
              onClick={handleDelete}
              disabled={dataSet?.selected.length === 0}
              funcType="flat"
            >
              {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
            </Button>
          </>
        ),
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  });

  const listProps = {
    ListDs,
    history,
    handleEnableFlagChange,
  };

  return (
    <>
      <Header title={intl.get(`sinv.inventoryBench.model.view.title`).d('委外库存管理配置')}>
        <HeaderBtns dataSet={ListDs} />
      </Header>
      <Content>
        <List {...listProps} />
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: [
      'sinv.inventoryBench',
      'sinv.common',
      'sinv.inventory',
      'slod.deliveryWorkbench',
      'slod.shipmentsConfiguration',
    ],
  })
)(Index);
