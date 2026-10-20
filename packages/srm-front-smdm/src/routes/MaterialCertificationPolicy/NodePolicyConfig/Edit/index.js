/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useContext } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import classnames from 'classnames';
import { compose, isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Form, Table, TextField, Select, Modal } from 'choerodon-ui/pro';

import {
  saveNodePolicyConfig,
  releaseNodePolicyConfig,
  deleteStrategy,
} from '@/services/materialCertificationPolicyService';

import { Store } from '../storeProvider';
import StoreProvider from '../storeProvider';

import styles from '../../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Detail = function Detail() {
  const { source, formDs, listDs, dispatch, getDetailInfo, strategyHeaderId } = useContext(Store);

  const allowEdit = (record, field) => {
    if (field === 'nodeCode') {
      const nodeCodes = listDs.filter((ele) => ele !== record).map((ele) => ele.get('nodeCode'));
      return (
        <Select
          name={field}
          record={record}
          noCache
          optionsFilter={(data) => !nodeCodes.includes(data.get('value'))}
        />
      );
    } else {
      return true;
    }
  };

  const columns = useMemo(() => {
    const roleList = [
      {
        name: 'operateRoleList',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'queryRoleList',
        editor: allowEdit,
        width: 150,
      },
    ];

    return [
      {
        name: 'orderSeq',
        align: 'left',
        width: 150,
      },
      {
        name: 'nodeCode',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'releaseRule',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'skipFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'earlyTerminationFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'closedFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'feedbackFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'preapprovalFlag',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'testingResultEnterFlag',
        editor: allowEdit,
        width: 200,
      },
      {
        name: 'closedRule',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'feedbackRule',
        editor: allowEdit,
        width: 150,
      },
      {
        name: 'feedbackRejectReturnRule',
        editor: allowEdit,
        width: 150,
      },
      ...roleList,
    ];
  }, []);

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
          if (selected.every((record) => !record.get('strategyLineId'))) {
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
  }, [listDs]);

  const handleSave = () => {
    return new Promise(async (resolve) => {
      const detailInfo = await getDetailInfo();

      if (detailInfo) {
        saveNodePolicyConfig({
          ...detailInfo,
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              if (strategyHeaderId === 'new') {
                dispatch(
                  routerRedux.push({
                    pathname: `/smdm/material-certification-policy/node-palicy-detail/${res.strategyHeaderId}`,
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
        deleteStrategy({
          ...detailInfo,
          deleteOnlyCheckFlag: 1,
        })
          .then((res) => {
            if (getResponse(res)) {
              Modal.confirm({
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: (
                  <div>{intl.get(`${commonPrompt}.deleteStrategy`).d(`是否确认删除该策略`)}</div>
                ),
              }).then((button) => {
                if (button === 'ok') {
                  return new Promise((resolve) => {
                    deleteStrategy({
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

      const { itemAuthStrLineList } = detailInfo || {};

      if (!itemAuthStrLineList?.length) {
        notification.error({
          message: intl.get(`${commonPrompt}.poliyMustLine`).d('该策略没有行不能发布'),
        });
        return resolve();
      }

      if (detailInfo) {
        releaseNodePolicyConfig({
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
            ? `/smdm/material-certification-policy/node-policy-read/${strategyHeaderId}`
            : '/smdm/material-certification-policy/list'
        }
        title={
          strategyHeaderId === 'new'
            ? intl.get(`${commonPrompt}.createCertificationNodePolicyConfig`).d('新建认证策略配置')
            : intl.get(`${commonPrompt}.editCertificationNodePolicyConfig`).d('编辑认证策略配置')
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
        {strategyHeaderId !== 'new' && (
          <Button
            onClick={() => handleDelete()}
            type="c7n-pro"
            icon="delete"
            funcType="flat"
            permissionList={[
              {
                code: 'srm.smdm.material.certification.policy.template.button.strategy.delete',
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
            <TextField name="strategyNum" />
            <TextField name="strategyName" colSpan={2} />
            <Select name="strategyStatusCode" />

            <Select name="strategyDimension" />
            <TextField name="versionNumber" />
            <TextField name="createdByName" />
          </Form>
        </Content>

        <Content className="stage-detail-content">
          <h3 className="content-title">{intl.get(`${commonPrompt}.stageDetail`).d('策略明细')}</h3>

          <Table
            style={{ maxHeight: '420px' }}
            dataSet={listDs}
            columns={columns}
            buttons={buttons}
            customizable
            customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_POLICY_LINE_LIST"
          />
        </Content>
      </div>
    </>
  );
};

const Index = function Index(props) {
  const { strategyHeaderId } = props.match.params;
  return (
    <StoreProvider {...{ ...props, strategyHeaderId, readOnly: false }}>
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
