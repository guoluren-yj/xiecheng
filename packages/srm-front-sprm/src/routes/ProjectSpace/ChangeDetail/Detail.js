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

import {
  saveUpdateInfo,
  deleteProPurInfo,
  submitProChangeInfo,
  invalidProPurInfo,
} from '@/services/projectSpaceService.js';
import BaseInfo from './../EditDetail/BaseInfo';
import TaskTable from './TaskInfo.js';
import PurList from './PurList.js';
import SupplierInfo from './SupplierInfo.js';
import { Store } from '../commonDetail/sotreProvider';
import SubmitForm from './submitForm';
import Operation from '../commonDetail/OperationHistory';
import './../EditDetail/index.less';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.project.model.common';

const Detail = () => {
  const {
    headerDs,
    customizeBtnGroup,
    history,
    getAllErrorMsg,
    detailReqDs,
    projectReqHeaderId,
    customizeTabPane,
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
          await saveUpdateInfo({
            ...data,
            deleteTaskPurchaseItemList,
            deleteSupplierList,
            customizeUnitCode:
              'SIEC.PROJECT_CHANGE.BASEINFO,SIEC.PROJECT_CHANGE.ATTACE,SIEC.PROJECT_CHANGE.TASK,SIEC.PROJECT_CHANGE.PUR_LIST,SIEC.PROJECT_CHANGE.SUPPLIER',
          })
        );
        if (res && !res?.failed && res?.projectReqHeaderId) {
          notification.success();
          headerDs.query().finally(() => {
            setLoading(false);
          });
          headerDs.setState({
            deleteSupplierList: [],
            deletePurList: [],
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
  }, []);

  const handleOperate = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation id={projectReqHeaderId} type="projectReqHeaderId" field='projectReqHeaderId' />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const headerValidate = await headerDs.validate();
    if (headerValidate) {
      return new Promise(async (reslove) => {
        const data = headerDs?.current?.toJSONData();
        const deleteTaskPurchaseItemList = headerDs.getState('deletePurList') || [];
        const deleteSupplierList = headerDs.getState('deleteSupplierList') || [];
        const res = getResponse(
          await saveUpdateInfo({
            ...data,
            deleteTaskPurchaseItemList,
            deleteSupplierList,
            customizeUnitCode:
              'SIEC.PROJECT_CHANGE.BASEINFO,SIEC.PROJECT_CHANGE.ATTACE,SIEC.PROJECT_CHANGE.TASK,SIEC.PROJECT_CHANGE.PUR_LIST,SIEC.PROJECT_CHANGE.SUPPLIER',
          })
        );
        if (res) {
          detailReqDs.setQueryParameter('projectReqHeaderId', projectReqHeaderId);
          detailReqDs.setQueryParameter('updateFlag', 1);
          detailReqDs.query();
          Modal.open({
            key: Modal.key(),
            drawer: true,
            style: { width: '1020px' },
            bodyStyle: { paddingTop: 0 },
            title: intl.get('sprm.project.model.updatePro').d('变更项目控制申请单'),
            children: (
              <SubmitForm
                dataSet={detailReqDs}
                type="change"
                projectReqHeaderId={projectReqHeaderId}
              />
            ),
            closable: true,
            movable: false,
            destroyOnClose: true,
            onCancel: () => {
              reslove();
              headerDs.query().finally(() => {
                setLoading(false);
              });
            },
            onOk: async () => {
              const validateFlag = await detailReqDs.validate();
              if (validateFlag) {
                const [dataModal] = detailReqDs.toJSONData();
                const resSave = getResponse(await submitProChangeInfo({ ...dataModal }));
                if (resSave) {
                  notification.success();
                  setLoading(false);
                  history.push({
                    pathname: `/sprm/project-workspace/list`,
                  });
                } else {
                  setLoading(false);
                  return false;
                }
              } else {
                return false;
              }
            },
            footer: (okBtn, cancelBtn) => (
              <div>
                {okBtn} {cancelBtn}
              </div>
            ),
          });
        } else {
          setLoading(false);
          reslove();
        }
      });
    } else {
      getAllErrorMsg();
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setLoading(true);
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <p>
          {intl.get('sprm.common.view.message.deleteProjectChange').d('是否确认删除项目控制单?')}
        </p>
      ),
      onOk: async () => {
        const data = detailReqDs?.current?.toJSONData();
        const res = getResponse(await deleteProPurInfo(data));
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
  };

  const handleInvalid = () => {
    setLoading(true);
    return new Promise(async (reslove) => {
      const data = detailReqDs?.current?.toJSONData();
      const res = getResponse(await invalidProPurInfo(data));
      if (res) {
        notification.success();
        setLoading(false);
        history.push({
          pathname: `/sprm/project-workspace/list`,
        });
      } else {
        setLoading(false);
        reslove();
      }
    });
  };

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
          disabled: projectReqHeaderId && !current?.get('projectId'),
          onClick: handleSubmit,
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
          disabled: projectReqHeaderId && !current?.get('projectId'),
          color: 'default',
          funcType: 'flat',
          onClick: handleSave,
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
          hidden: detailReqDs?.current?.get('reqStatus') === 'APPROVAL_REJECTED',
          funcType: 'flat',
          loading: updateLoading,
          onClick: handleDelete,
        },
        child: intl.get(`hzero.common.button.delete`).d('删除'),
      },
      {
        name: 'invalid',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          wait: 300,
          type: 'c7n-pro',
          funcType: 'flat',
          hidden: detailReqDs?.current?.get('reqStatus') !== 'APPROVAL_REJECTED',
          loading: updateLoading,
          onClick: handleInvalid,
        },
        child: intl.get(`hzero.common.button.invalid`).d('作废'),
      },
      {
        name: 'operation',
        btnComp: Button,
        btnProps: {
          icon: 'assignment',
          type: 'c7n-pro',
          hidden: !projectReqHeaderId,
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
            code: 'SIEC.PROJECT_CHANGE.HEADER_BTNS',
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
        title={intl.get('sprm.project.model.updatePro').d('项目控制申请单-变更')}
        backPath="/sprm/project-workspace/list"
      >
        <HeaderBtn />
      </Header>

      <div className="sprm-project-edit-detail">
        {customizeTabPane(
          {
            code: 'SIEC.PROJECT_CHANGE.TABS',
          },
          <Tabs tabPosition="left" className="tab-padding">
            <TabPane
              tab={intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
              key="baseInfo"
            >
              <BaseInfo
                baseCode="SIEC.PROJECT_CHANGE.BASEINFO"
                attachCode="SIEC.PROJECT_CHANGE.ATTACH"
              />
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
      </div>
    </Fragment>
  );
};

export default observer(Detail);
