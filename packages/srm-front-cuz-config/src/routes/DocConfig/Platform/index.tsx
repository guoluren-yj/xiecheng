/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Popconfirm } from 'choerodon-ui';
import { Button, DataSet, Form, IntlField, Modal, TextField, Switch } from 'choerodon-ui/pro';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { routerRedux } from 'dva/router';
import { debounce } from "lodash";
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import intl from "srm-front-boot/lib/utils/intl";
import withProps from 'hzero-front/lib/utils/withProps';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import _SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import request from "hzero-front/lib/utils/request";
import { docDsFields } from './dataSets';
import ModuleTree from '../ModuleTree';

import styles from '../../UnifyEntry/style.less';
import "../../common.less";

const SearchBarTable: any = _SearchBarTable;

@formatterCollections({ code: ['hzero.common', 'hpfm.doc', 'hpfm.customize'] })
@withProps(() => {
  return {
    tableDs: new DataSet({
      autoQuery: false,
      pageSize: 20,
      fields: docDsFields(intl, { dsStatus: 1 }),
      transport: {
        read: ({ params }) => {
          return {
            url: `${HZERO_PLATFORM}/v1/docs`,
            method: "GET",
            params: {
              ...params,
              customizeUnitCode: 'HPFM_CUSZ_TEMPLATE.LIST',
            },
          };
        },
      },
    }),
    listCache: {} as any,
  };
},
  { cacheState: true })
export default class DocPlatform extends Component<any, any> {

  isTenant = true;

  constructor(props) {
    super(props);
    const { moduleCode, menuTitle, expandTreeKeys } = props.listCache.current || {};
    this.state = {
      currentModuleCode: (!moduleCode || moduleCode === "__root__") ? '' : moduleCode,
      currentModuleTitle: menuTitle || '',
      // 为ModuleTree组件缓存的初始属性
      expandTreeKeys,
      selectTreeKey: moduleCode,
    };
    if (!props.tableDs.__initUpdateEvents__) {
      props.tableDs.addEventListener("update", debounce(({ record, dataSet, name, value }) => {
        // eslint-disable-next-line no-param-reassign
        dataSet.status = "loading";
        if (name === "enabledFlag" && !value) this.onEnabledChange(record);
        else this.onSave(record);
      }, 300));
      // eslint-disable-next-line no-param-reassign
      props.tableDs.__initUpdateEvents__ = true;
    }
  }

  componentDidMount() {
    this.props.tableDs.setQueryParameter("moduleCode", this.state.currentModuleCode);
  }

  columns: any[] = [
    {
      name: 'docCode',
      renderer: ({ text, record }) => {
        return (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            onClick={() => this.onEdit(record.get("docId"))}
          >
            {text}
          </Button>
        );
      },
    },
    {
      name: 'docName',
    },
    {
      name: 'enabledFlag',
      editor: <Switch />,
    },
    {
      name: '_op',
      header: intl.get('hzero.common.button.action').d("操作"),
      renderer: ({ record }) => {
        return (
          <Popconfirm title={intl.get("hzero.common.message.confirm.delete").d("是否删除此条记录")} onConfirm={() => this.onDelete(record)}>
            <Button
              loading={record.getState("__onDelete")}
              funcType={FuncType.link}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.button.delete').d("删除")}
            </Button>
          </Popconfirm>

        );
      },
    },
  ];

  onModuleChange = (_menuCode: string, _menuTitle?: string) => {
    let moduleCode = _menuCode as (string | undefined);
    let menuTitle = _menuTitle as (string | undefined);
    this.setCache({ moduleCode, menuTitle });
    if (moduleCode === "__root__") {
      moduleCode = undefined;
      menuTitle = undefined;
    }
    this.setState({ currentModuleCode: moduleCode, currentModuleTitle: menuTitle });
    this.props.tableDs.setQueryParameter("moduleCode", moduleCode);
    this.props.tableDs.query(1);
  }

  onCreate = () => {
    const dataSet = new DataSet({
      autoCreate: true,
      fields: docDsFields(intl, { dsStatus: 3 }),
    });
    dataSet.current!.set("moduleCode", {moduleCode: this.state.currentModuleCode});

    Modal.open({
      title: intl.get("hpfm.doc.common.docTemplateCreate").d('新建单据模版'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={dataSet} labelLayout={LabelLayout.float}>
          <TextField name="docCode" />
          <IntlField name="docName" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      onOk: async () => {
        if (!await dataSet.validate()) return false;
        const docId = await request(`${HZERO_PLATFORM}/v1/docs`, {
          method: "POST",
          body: {
            ...dataSet.current!.toJSONData(),
            enabledFlag: 1,
            tenantId: getCurrentOrganizationId(),
          },
        }).then(res => {
          if (getResponse(res)) {
            notification.success(undefined as any);
            return res.docId;
          }
        });
        if (!docId) return false;
        this.onEdit(docId);
      },
    });
  }

  onEdit = (docId) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: "/hpfm/ui-customize/doc/platform/update",
        search: `docId=${docId}`,
      })
    );
  }

  onEnabledChange = (record) => {
    request(`${HZERO_PLATFORM}/v1/docs/exist/${record.get("docId")}`, {
      method: "GET",
    }).then(res => {
      if (getResponse(res)) {
        if (res.message) {
          Modal.confirm({
            title: res.message,
            onOk: () => this.onSave(record),
            onCancel: () => {
              record.reset();
              // eslint-disable-next-line no-param-reassign
              record.dataSet.status = "ready";
            },
          });
        } else {
          this.onSave(record);
        }
      }
    });
  }

  onDelete = (record) => {
    record.setState({ __onDelete: true });
    request(`${HZERO_PLATFORM}/v1/docs`, {
      method: "DELETE",
      body: record.toJSONData(),
    }).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.props.tableDs.query();
        return res.docId;
      }
    }).finally(() => {
      record.setState({ __onDelete: false });
    });
  }

  onSave(record) {
    record.setState({ __onSave: true });
    request(`${HZERO_PLATFORM}/v1/docs`, {
      method: "POST",
      body: {
        ...record.toJSONData(),
        tenantId: getCurrentOrganizationId(),
      },
    }).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.props.tableDs.query();
      }
    }).finally(() => {
      // eslint-disable-next-line no-param-reassign
      record.dataSet.status = "ready";
      record.setState({ __onSave: false });
    });
  }

  setCache(options: { moduleCode?, menuTitle?, expandTreeKeys?}) {
    const { moduleCode, menuTitle, expandTreeKeys } = options;
    const { current } = this.props.listCache;
    this.props.listCache.current = {
      moduleCode: moduleCode || this.state.currentModuleCode,
      menuTitle: menuTitle || this.state.currentModuleTitle,
      expandTreeKeys: expandTreeKeys || current && current.expandTreeKeys,
    };
  }

  expandTree = (e) => {
    this.setCache({ expandTreeKeys: e });
  }

  render() {
    const {
      state: {
        currentModuleCode,
        currentModuleTitle,
        expandTreeKeys,
        selectTreeKey,
      },
    } = this;
    return (
      <>
        <Header title={intl.get('hpfm.doc.common.docBasicStyle').d('单据基础样式')}>
          <div className={styles['ui-fix']}>
            <Button funcType={FuncType.flat} color={ButtonColor.primary} onClick={this.onCreate} icon="add" disabled={!currentModuleCode}>{intl.get("hzero.common.button.create").d("新建")}</Button>
          </div>
        </Header>
        <div className='unit-main-container unit-common-style'>
          <div className='unit-wrap-container'>
            <div className='unit-left-container'>
              <ModuleTree
                onModuleChange={this.onModuleChange}
                defaultExpandKeys={expandTreeKeys}
                defaultSelectKey={selectTreeKey}
                onExpand={this.expandTree}
                disableUnSelect
              />
            </div>
            <div className='unit-right-container'>
              <div className="platform-list-title">{currentModuleTitle || intl.get("hzero.common.scope.all").d('全部')}</div>
              <Content>
                <SearchBarTable
                  key={currentModuleCode}
                  style={{ maxHeight: "calc(100vh - 400px)" }}
                  selectionMode={SelectionMode.none}
                  searchCode='HPFM_CUSZ_DOC.LIST'
                  dataSet={this.props.tableDs}
                  columns={this.columns}
                />
              </Content>
            </div>
          </div>
        </div>
      </>
    );
  }
}
