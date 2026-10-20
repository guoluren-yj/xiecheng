import React, { useContext, Fragment, useCallback, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Tabs, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import { Header } from 'components/Page';
// import { Card } from 'choerodon-ui';
// import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';

import { saveProInfo, deleteProInfo, submitProInfo } from '@/services/projectSpaceService.js';
import BaseInfo from './BaseInfo.js';
import TaskTable from './TaskInfo.js';
import PurList from './PurList.js';
import SupplierInfo from './SupplierInfo.js';
import Operation from './../commonDetail/OperationHistory';
import { Store } from '../commonDetail/sotreProvider';
import './index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.project.model.common';

const Detail = () => {
  const {
    headerDs,
    projectId,
    customizeBtnGroup,
    customizeTabPane,
    history,
    getAllErrorMsg,
  } = useContext(Store);
  const { current } = headerDs;
  const [updateLoading, setLoading] = useState(false);

  const handleSave = useCallback(() => {
    setLoading(true);
    return new Promise(async (reslove) => {
      const headerValidate = await headerDs.validate();
      if (headerValidate) {
        const data = headerDs?.current?.toJSONData();
        const deleteTaskPurchaseItemList = headerDs.getState('deletePurList') || [];
        const deleteSupplierList = headerDs.getState('deleteSupplierList') || [];
        const res = getResponse(
          await saveProInfo({
            ...data,
            deleteTaskPurchaseItemList,
            deleteSupplierList,
            customizeUnitCode:
              'SIEC.PROJECT_EDIT.BASE,SIEC.PROJECT_EDIT.ATTACHMENT,SIEC.PROJECT_EDIT.COST_LIST,SIEC.PROJECT_EDIT.PUR_LIST,SIEC.PROJECT_EDIT.SUPPLIER',
          })
        );
        if (res && !res?.failed && !projectId) {
          notification.success();
          setLoading(false);
          headerDs.setState({
            deleteSupplierList: [],
            deletePurList: [],
          });
          history.push({
            pathname: `/sprm/project-workspace/edit-detail/${res?.projectId}`,
          });
        } else if (!res?.failed && res?.projectId) {
          notification.success();
          headerDs.setState({
            deleteSupplierList: [],
            deletePurList: [],
          });
          setLoading(false);
          headerDs.query();
        } else {
          setLoading(false);
          reslove();
        }
      } else {
        getAllErrorMsg();
        setLoading(false);
        reslove();
      }
    });
  }, []);

  const handleOperate = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation id={projectId} type="projectId" field='projectId' />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleSubmit = () => {
    setLoading(true);
    return new Promise(async (reslove) => {
      const headerValidate = await headerDs.validate();
      if (headerValidate) {
        const data = headerDs?.current?.toJSONData();
        const deleteTaskPurchaseItemList = headerDs.getState('deletePurList') || [];
        const deleteSupplierList = headerDs.getState('deleteSupplierList') || [];
        const res = getResponse(
          await submitProInfo({
            ...data,
            deleteTaskPurchaseItemList,
            deleteSupplierList,
            customizeUnitCode:
              'SIEC.PROJECT_EDIT.BASE,SIEC.PROJECT_EDIT.ATTACHMENT,SIEC.PROJECT_EDIT.COST_LIST,SIEC.PROJECT_EDIT.PUR_LIST,SIEC.PROJECT_EDIT.SUPPLIER',
          })
        );
        if (res && res?.projectId) {
          notification.success();
          setLoading(false);
          history.push({
            pathname: `/sprm/project-workspace/list`,
          });
        } else {
          setLoading(false);
          reslove();
        }
      } else {
        getAllErrorMsg();
        setLoading(false);
        reslove();
      }
    });
  };

  const handleDelete = useCallback(() => {
    setLoading(true);
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <p>{intl.get('sprm.common.view.message.deleteProject').d('是否确认删除项目?')}</p>,
      onOk: async () => {
        const data = headerDs?.current?.toJSONData();
        const res = getResponse(await deleteProInfo(data));
        if (res) {
          notification.success();
          setLoading(false);
          history.push({
            pathname: `/sprm/project-workspace/list`,
          });
        } else {
          setLoading(false);
        }
      },
      onCancel: () => {
        setLoading(false);
      },
    });
  }, []);

  const HeaderBtn = () => {
    const headerButtons = [
      {
        name: 'submit',
        btnComp: Button,
        btnProps: {
          icon: 'done',
          wait: 300,
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          loading: updateLoading,
          hidden: !current?.get('projectId'),
          onClick: handleSubmit,
          permissionList: [
            {
              code: `srm.bg.management.project.button.submit`,
              type: 'button',
            },
          ],
        },
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      },
      {
        name: 'save',
        btnComp: Button,
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          wait: 300,
          loading: updateLoading,
          disabled: projectId && !current?.get('projectId'),
          color: !projectId ? 'primary' : 'default',
          funcType: !projectId ? 'raised' : 'flat',
          onClick: handleSave,
          permissionList: [
            {
              code: `srm.bg.management.project.button.save`,
              type: 'button',
            },
          ],
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'delete',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          wait: 300,
          type: 'c7n-pro',
          hidden: !current?.get('projectId'),
          funcType: 'flat',
          loading: updateLoading,
          onClick: handleDelete,
          permissionList: [
            {
              code: `srm.bg.management.project.button.delete`,
              type: 'button',
            },
          ],
        },
        child: intl.get(`hzero.common.button.delete`).d('删除'),
      },
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'assignment',
          type: 'c7n-pro',
          hidden: !projectId,
          wait: 300,
          funcType: 'flat',
          onClick: handleOperate,
        },
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ];
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SIEC.PROJECT_EDIT.BTN',
            pro: true,
          },
          <DynamicButtons buttons={headerButtons} />
        )}
      </>
    );
  };

  return (
    <Fragment>
      <Header
        title={
          projectId
            ? intl.get('sprm.project.model.maintainProject').d('编辑项目')
            : intl.get('sprm.project.model.createPro').d('新建项目')
        }
        backPath="/sprm/project-workspace/list"
      >
        <HeaderBtn />
      </Header>
      <div className="sprm-project-edit-detail">
        {!projectId ? (
          <BaseInfo />
        ) : (
          <Fragment>
            {customizeTabPane(
              {
                code: 'SIEC.PROJECT_EDIT.TABS',
              },
              <Tabs tabPosition="left" className="tab-padding">
                <TabPane
                  tab={intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
                  key="baseInfo"
                >
                  <BaseInfo />
                </TabPane>
                <TabPane tab={intl.get(`${commonPrompt}.taskCost`).d('任务成本')} key="taskCost">
                  <TaskTable />
                </TabPane>
                <TabPane
                  tab={intl.get(`${commonPrompt}.purPartsList`).d('采购件清单')}
                  key="purPartsList"
                >
                  <PurList />
                </TabPane>
                <TabPane tab={intl.get(`${commonPrompt}.supplier`).d('供应商')} key="supplier">
                  <SupplierInfo />
                </TabPane>
              </Tabs>
            )}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default observer(Detail);
