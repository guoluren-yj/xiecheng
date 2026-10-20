/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useCallback, useMemo, useEffect, useState, Fragment } from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Table, Button, Modal, SelectBox } from 'choerodon-ui/pro';
import { operatorRender } from 'hzero-front/lib/utils/renderer';

import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { stringify } from 'querystring';
import notification from 'utils/notification';
import { createRoManagement, release, deleteEsBill } from '@/services/roleObjectService';
import { Store } from './StoreProvider';
import CreateRoleModal from './CreateRoleModal';
import { PublishStatus } from '../components/utils/common';
import { statusRender } from '../components/utils/render';

const List = () => {
  const { history, tableDs, createModalDs } = useContext(Store);
  const [selectBoxValue, setSelectBoxValue] = useState('only-main');
  useEffect(() => {
    tableDs.query();
  }, []);

  /**
   * @description--跳转详情页面
   * @combineId --对象编码ID
   * @combineCode --对象编码
   * @combineName --对象名称
   * @docObjectId --主键ID
   */
  const handlePush = useCallback(
    (record) => {
      history.push({
        pathname: `/swbh/role-object-management/detail/${record.get('combineId')}`,
        search: stringify({
          combineId: record.get('combineId'),
          combineCode: record.get('combineCode'),
          combineName: record.get('combineName'),
          docObjectId: record.get('docObjectId'),
        }),
      });
    },
    [history]
  );

  /**
   * @description: 新建单据
   * @param {Object} 字段名称
   * @return {*}
   */
  const handleCreateRole = () => {
    Modal.open({
      key: Modal.key(),
      title: intl.get('swbh.roManagement.button.createRole').d('新建单据对象'),
      drawer: false,
      closable: true,
      style: { width: '600px' },
      destroyOnClose: true,
      children: <CreateRoleModal createModalDs={createModalDs} />,
      okText: intl.get('hzero.common.button.sure').d('确定'),

      onOk: async () => {
        const validate = await createModalDs.current?.validate();
        const { roleCombineCode, roleCombineId } =
          createModalDs?.current?.get(['roleCombineCode', 'roleCombineId']) || {};
        if (validate) {
          const res = await createRoManagement({
            body: {
              combineCode: roleCombineCode,
              combineId: roleCombineId,
            },
          });
          if (getResponse(res)) {
            notification.success();
            // eslint-disable-next-line no-unused-expressions
            createModalDs?.current?.reset();
            tableDs.query();
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };
  /**
   * 发布
   */
  const handlePublish = () => {
    const publishModal = Modal.open({
      key: Modal.key(),
      title: intl.get('swbh.roManagement.vivew.title.publishRole').d('发布单据对象'),
      drawer: false,
      closable: true,
      style: { width: '600px' },
      destroyOnClose: true,
      children: (
        <Fragment>
          <SelectBox name="level" colSpan={2} value={selectBoxValue} onChange={handleChange} disabled>
            <SelectBox.Option value="only-main">
              {intl.get('swbh.common.view.select.primaryObjectOnly').d('仅主对象')}
            </SelectBox.Option>
            <SelectBox.Option value="main-rel">
              {intl.get('swbh.common.view.select.allAssociated').d('所有关联表')}
            </SelectBox.Option>
          </SelectBox>
        </Fragment>
      ),
      footer: (
        <>
          <Button onClick={() => publishModal.close()}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
          <Button color={ButtonColor.primary} onClick={() => handlePublishType({ publishModal }, 'time=current')}>
            {intl.get('swbh.common.button.publishNow').d('立即发布')}
          </Button>
          {/* <Button color={ButtonColor.primary} onClick={() => handlePublishType({ publishModal }, 'time=delay')}>
            {intl.get('swbh.common.button.delayedRelease').d('延迟发布')}
          </Button> */}
        </>
      ),
    });
  };
  const handleChange = (value, oldValue) => {
    setSelectBoxValue(value);
  };
  const handlePublishType = async ({ publishModal }, type) => {
    const combineCodes = tableDs.selected.map((i) => i.get('combineCode'));
    const data = {
      combineCode: combineCodes,
      level: selectBoxValue,
      type,
    };
    const res = getResponse(await release({ data }));
    if (res) {
      publishModal.close();
      notification.success();
      // eslint-disable-next-line no-unused-expressions
      createModalDs?.current?.reset();
      tableDs.query();
    }
  };

  const handleDelete = (record) => {
    deleteEsBill(record.get('combineCode')).then((res) => {
      if (getResponse(res)) {
        tableDs.query();
      }
    });
  };
  /**
   * @PublishStatus --发布状态
   * @return {*}
   */
  const columns = useMemo(() => {
    return [
      {
        name: 'combineName',
        align: ColumnAlign.left,
        renderer: ({ value, record }) => {
          return <a onClick={() => handlePush(record)}>{value}</a>;
        },
      },
      {
        name: 'combineCode',
        align: ColumnAlign.left,
      },
      {
        name: 'masterObjectName',
        align: ColumnAlign.left,
      },
      {
        name: 'masterObjectCode',
        align: ColumnAlign.left,
      },
      {
        name: 'publishStatus',
        align: ColumnAlign.center,
        renderer: ({ value }) => {
          const statusList = [
            {
              value: PublishStatus.PUBLISHED,
              status: 'success',
              text: intl.get('swbh.common.status.published').d('已发布'),
            },
            {
              value: PublishStatus.UNPUBLISHED,
              status: 'default',
              text: intl.get('swbh.common.status.unpublished').d('未发布'),
            },
            {
              value: PublishStatus.PENDING,
              status: 'warning',
              text: intl.get('swbh.common.status.pending').d('待发布'),
            },
          ];
          return statusRender(value?.toUpperCase(), statusList);
        },
      },
      {
        name: 'operation',
        align: ColumnAlign.left,
        lock: ColumnLock.right,
        renderer: ({ record }) => {
          const operators = [];
          if (record?.get('publishStatus')?.toUpperCase() === PublishStatus.UNPUBLISHED) {
            operators.push({
              key: 'enable',
              ele: (
                <a
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    Modal.confirm({
                      children: (
                        <span>
                          {intl.get('swbh.roManagement.view.message.deleteConfirm').d('请确认是否删除该单据对象？')}
                        </span>
                      ),
                      okText: intl.get('hzero.common.button.sure').d('确定'),
                      onOk: () => {
                        handleDelete(record);
                      },
                    });
                  }}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            });
          }
          return operatorRender(operators, record, { limit: 1 });
        },
      },
    ];
  }, [handlePush, statusRender]);
  return (
    <>
      <Header title={intl.get('swbh.roManagement.view.message.title.esObjectManager').d('es对象管理')}>
        <Button icon="add" color={ButtonColor.primary} onClick={handleCreateRole}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button icon="publish2" onClick={handlePublish} disabled={tableDs.selected.length === 0}>
          {intl.get('hzero.common.button.publish').d('发布')}
        </Button>
      </Header>
      <Content>
        <Table dataSet={tableDs} columns={columns} style={{ overflow: 'auto' }} />
      </Content>
    </>
  );
};

export default observer(List);
