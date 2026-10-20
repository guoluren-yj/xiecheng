import React, { useContext, useEffect, useMemo, useState } from 'react';
import Context, { IStore } from '@/routes/ScriptEvent/store';
import { getResponse } from 'utils/utils';
import { Button, Dropdown, Icon, Menu, Modal, Table } from 'choerodon-ui/pro/lib';
import notification from 'utils/notification';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { enableRender } from 'utils/renderer';
import { Content, Header } from 'components/Page';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import constructTableDataSet from '../datasets/constructTableDataSet';
import styles from './index.less';
import CreateScriptEventModalConfig from './ModalCreateScriptEvent';
import EditScriptEventModalConfig from './ModalEditScriptEvent';
import { lowcodeRequest as request } from '@/utils/lowcodeRequest';
import { deleteScriptService, setScriptAvailabilityService } from '@/services/scriptEventService';
import { DSBoolean } from '@/utils/common';

export default observer((props: any) => {
  const { store } = useContext<{ store: IStore }>(Context as any);

  const [curParams, setCurParams] = useState({} as any);

  const tableDataSet = useMemo(() => {
    return constructTableDataSet({ store, setCurParams });
  }, []);

  // // on: init //
  // useEffect(() => {
  //   tableDataSet.query();
  // }, []);

  // on: update //
  useEffect(() => {
    const scriptQueryState = sessionStorage.getItem('scriptQueryState');
    const scriptPageState = sessionStorage.getItem('scriptPageState');
    // eslint-disable-next-line no-unused-expressions
    tableDataSet?.queryDataSet?.current?.set('keyword', scriptQueryState || '');
    tableDataSet
      .query(scriptPageState ? Number(scriptPageState) + 1 : 1, { keyword: scriptQueryState || '' })
      .then(() => {
        if (tableDataSet?.queryDataSet?.current) {
          sessionStorage.removeItem('scriptQueryState');
          sessionStorage.removeItem('scriptPageState');
        }
      });
  }, [store.state.signalQueryTableDS, tableDataSet?.queryDataSet?.current]);

  return (
    <div className={`script-event ${styles['front-page']}`}>
      <Header title="脚本事件">
        <Button
          color={ButtonColor.primary}
          onClick={() => Modal.open(CreateScriptEventModalConfig({ store, isCreate: true }))}
        >
          新建
        </Button>
      </Header>
      <Content>
        <Table
          className="script-event-table"
          dataSet={tableDataSet}
          // queryBar={TableQueryBarType.filterBar}
        >
          <Table.Column name="scriptName" />
          <Table.Column name="scriptCode" />
          <Table.Column name="tenantName" />
          <Table.Column name="remark" />
          <Table.Column
            name="enabledFlag"
            width={72}
            renderer={({ value }) => {
              return enableRender(value);
            }}
          />
          <Table.Column
            header="操作"
            command={(e) =>
              constructTableCommandCell({
                store,
                record: e.record.data,
                perProps: props,
                curParams,
              })
            }
            lock={ColumnLock.right}
            width={56}
          />
        </Table>
      </Content>
    </div>
  );
});

// helpers //
function constructTableCommandCell(props: { store: IStore; record: any; perProps; curParams }) {
  const { curParams } = props;
  const menu = (
    <Menu className="script-event-front-page-table-ops-dropdown">
      <Menu.Item>
        <a
          className="disable"
          onClick={() => {
            props.store.setState('currentSelectedScriptAbstract', props.record);

            request(setScriptAvailabilityService.url, {
              method: setScriptAvailabilityService.method,
              body: {
                ...props.record,
                enabledFlag: props.record.enabledFlag ^ 1,
              },
            }).then((res) => {
              if (getResponse(res)) {
                props.store.queryTableDS();
                notification.success({ message: '操作成功' });
              }
            });
          }}
        >
          {DSBoolean(props.record.enabledFlag) ? '禁用' : '启用'}
        </a>
        ,
      </Menu.Item>
      <Menu.Item>
        <a
          className="edit"
          onClick={() => {
            props.store.setState('currentSelectedScriptAbstract', props.record);
            Modal.open(EditScriptEventModalConfig({ store: props.store }));
          }}
        >
          编辑
        </a>
        ,
      </Menu.Item>
      <Menu.Item>
        <a
          className="copy"
          onClick={() => {
            props.store.setState('currentSelectedScriptAbstract', props.record);
            Modal.open(CreateScriptEventModalConfig({ store: props.store, isCreate: false }));
          }}
        >
          复制
        </a>
        ,
      </Menu.Item>
      <Menu.Item>
        <a
          className="edit-script"
          onClick={() => {
            props.perProps.history.push({
              pathname: `/hmde/script-event/edit/${props.record.scriptId}`,
              state: curParams,
            });
          }}
        >
          编写脚本
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          className="delete"
          onClick={() => {
            Modal.confirm({
              title: `确认删除脚本 ${props.record.scriptName} ？`,
            }).then((result) => {
              if (result === 'ok') {
                props.store.setState('currentSelectedScriptAbstract', props.record);

                request(deleteScriptService.url, {
                  method: deleteScriptService.method,
                  body: {
                    ...props.record,
                  },
                }).then((res) => {
                  if (getResponse(res)) {
                    props.store.queryTableDS();
                    notification.success({ message: '删除成功' });
                  }
                });
              }
            });
          }}
        >
          删除
        </a>
        ,
      </Menu.Item>
    </Menu>
  );

  const cell = [
    <Dropdown overlay={menu}>
      <Icon type="more_vert" />
    </Dropdown>,
  ];

  return cell;
}
