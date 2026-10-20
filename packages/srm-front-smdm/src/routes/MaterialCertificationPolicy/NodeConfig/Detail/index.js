/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useContext } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import classnames from 'classnames';
import { compose, isEmpty, isFunction } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Form, Table, TextField, Select, DateTimePicker, Modal } from 'choerodon-ui/pro';

import { saveNodeConfig, releaseNodeConfig, deleteStage } from '@/services/materialCertificationPolicyService';

import { Store } from '../storeProvider';
import StoreProvider from '../storeProvider';
import { colorRender } from '../hook';
import styles from '../../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Detail = function Detail() {
  const {
    source,
    formDs,
    listDs,
    nodeId,
    dispatch,
    getDetailInfo,
    handleCuxEditColumns,
  } = useContext(Store);

  const columns = useMemo(() => {
    const newColumns = [
      {
        name: 'attachmentCode',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentName',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentTypeCode',
        editor: true,
        width: 150,
      },
      {
        name: 'attachmentUuid',
        editor: true,
        width: 150,
      },
      {
        name: 'requiredFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'supplierRequiredFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'attachDeleteFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'supplierVisibleFlag',
        editor: true,
        width: 200,
      },
      {
        name: 'itemAuthNodeAttSupcatList',
        editor: true,
        width: 200,
      },
      {
        name: 'itemAuthNodeAttRoleList',
        editor: true,
        width: 150,
      },
      {
        name: 'itemAuthNodeAttUserList',
        editor: true,
        width: 150,
      },
      {
        name: 'itemAuthNodeAttCategoryList',
        editor: true,
        width: 150,
      },
    ];

    if (isFunction(handleCuxEditColumns)) {
      return handleCuxEditColumns(newColumns);
    } else {
      return newColumns;
    }
  }, [handleCuxEditColumns]);

  const DeleteBtn = observer(() => {
    const { selected } = listDs;
    return (
      <Button
        key="delete"
        funcType="flat"
        icon="delete_sweep"
        color="primary"
        type="c7n-pro"
        onClick={() => {
          if (selected.every((record) => !record.get('nodeAttachmentId'))) {
            listDs.remove(selected);
          } else {
            listDs.delete(selected, {
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>
                  {intl
                    .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
                    .d('确认删除选中行？')}
                </div>
              ),
            });
          }
        }}
        disabled={isEmpty(selected)}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    );
  });

  const buttons = useMemo(() => {
    return ['add', <DeleteBtn />];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listDs]);

  const handleSave = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await getDetailInfo();

      if (detailInfo) {
        saveNodeConfig({
          ...detailInfo,
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              if (nodeId === 'new') {
                dispatch(
                  routerRedux.push({
                    pathname: `/smdm/material-certification-policy/node-detail/${res?.nodeId}`,
                  })
                );
              } else {
                formDs.query();
                listDs.query();
              }
              resolve();
            } else {
              resolve();
            }
          })
          .finally(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const handleDelete = () => {
    return new Promise(async (resolve) => {
      const detailInfo = formDs?.current?.toData();
      if (detailInfo) {
        deleteStage({
          ...detailInfo,
          deleteOnlyCheckFlag: 1,
        }).then((res) => {
          if (getResponse(res)) {
            Modal.confirm({
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: (
                <div>{intl.get(`${commonPrompt}.deleteStage`).d(`是否确认删除该状态`)}</div>
              ),
            }).then((button) => {
              if (button === 'ok') {
                return new Promise((resolve) => {
                  deleteStage({
                    ...detailInfo,
                    deleteOnlyCheckFlag: 0,
                  })
                    .then((res) => {
                      if (getResponse(res)) {
                        notification.success();
                        dispatch(
                          routerRedux.push({
                            pathname: `/smdm/material-certification-policy/list`,
                          })
                        );
                      }
                    })
                    .finally(() => {
                      resolve();
                    });
                });
              }
            });
          }
        })
          .finally(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const handleRelease = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await getDetailInfo();

      if (detailInfo) {
        releaseNodeConfig({
          ...detailInfo,
        }).then((res) => {
          if (getResponse(res)) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/smdm/material-certification-policy/list`,
              })
            );
            resolve();
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  };

  return (
    <>
      <Header
        backPath={
          source === 'read'
            ? `/smdm/material-certification-policy/node-read/${nodeId}`
            : '/smdm/material-certification-policy/list'
        }
        title={
          nodeId === 'new'
            ? intl.get(`${commonPrompt}.creatCertificationNodeConfig`).d('新建认证阶段配置')
            : intl.get(`${commonPrompt}.editCertificationNodeConfig`).d('编辑认证阶段配置')
        }
      >
        <Button
          onClick={() => handleRelease()}
          type="c7n-pro"
          icon="publish2"
          color="primary"
          funcType="raised"
        >
          {intl.get(`hzero.common.btn.release`).d('发布')}
        </Button>
        <Button onClick={() => handleSave()} type="c7n-pro" icon="save" funcType="flat">
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
        {nodeId !== 'new' && (
        <Button
          onClick={() => handleDelete()}
          type="c7n-pro"
          icon="delete"
          funcType="flat"
          permissionList={[
          {
            code: 'srm.smdm.material.certification.policy.template.button.stage.delete',
          },
        ]}
        >
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
)}
      </Header>
      <div className={classnames(styles['new-detail-content'])}>
        <Content>
          <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>
          <Form
            dataSet={formDs}
            showLines={6}
            columns={3}
            labelLayout="float"
            useColon={false}
            useWidthPercent
          >
            <TextField name="orderSeq" />
            <Select name="nodeCode" />
            <Select
              name="enabledFlag"
              renderer={({ value, text }) => colorRender(value, text)}
              disabled
            />
            <TextField name="nodeVersionNumber" disabled />
            <TextField name="createdByName" />

            {nodeId && <DateTimePicker name="lastUpdateDate" />}
          </Form>
        </Content>

        <Content className="attment-content">
          <h3 className="content-title">
            {intl.get(`${commonPrompt}.attachmentDefined`).d('附件定义')}
          </h3>
          <Table
            style={{ maxHeight: '420px' }}
            dataSet={listDs}
            columns={columns}
            buttons={buttons}
            customizable
            customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_ATTACHMENT_LIST"
          />
        </Content>
      </div>
    </>
  );
};

const Index = function Index(props) {
  const { nodeId } = props.match.params;
  return (
    <StoreProvider {...{ ...props, nodeId, readOnly: false }}>
      <Detail />
    </StoreProvider>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['smdm.common', 'hzero.common', 'hzero.c7nProUI'],
  })
)(observer(Index));
