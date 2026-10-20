/* eslint-disable react/state-in-constructor */
import React, { Component, createRef, cloneElement } from 'react';
import { Popover, Tag } from 'choerodon-ui';
import ResizeObserver from 'resize-observer-polyfill';
import { Button, DataSet, Dropdown, Form, Icon, IntlField, Menu, Modal, Switch, Tabs, TextField } from 'choerodon-ui/pro';
import { Header } from 'hzero-front/lib/components/Page';
import { debounce, memoize, isArray } from "lodash";
import { routerRedux } from 'dva/router';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import intl from "srm-front-boot/lib/utils/intl";
import withProps from 'hzero-front/lib/utils/withProps';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import _SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExpressionEngineRule from "srm-front-boot/lib/components/ExpressionEngineRule";
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import request from "hzero-front/lib/utils/request";
import ExportButton from './ExportButton';
import ImportButton from './ImportButton';

import ModuleTree from './ModuleTree';
import { templateDsFields } from '../common/dataSets';

import "../../../common.less";
import styles from '../../style.less';
import stylesCover from "./style.less";

import { tplVersionListContainer } from './modelImpl';

const SearchBarTable: any = _SearchBarTable;
const statusColorMap = {
  "NOT_RELEASE": 'gray',
  "RELEASED": 'green',
  "MODIFIED": 'orange',
};
@formatterCollections({ code: ['hzero.common', 'hpfm.doc', 'hpfm.customize', 'hpfm.individual'] })
@withProps(() => {
  return {
    tableDs: new DataSet({
      autoQuery: false,
      fields: templateDsFields(intl, 1),
      pageSize: 20,
      transport: {
        read: ({ dataSet, params }) => {
          const docId = dataSet!.getState("docId");
          return {
            url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates${docId !== undefined ? `/template/${docId}` : ''}`,
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
    tenantInfo: getCurrentTenant() as any,
  };
},
  { cacheState: true })
export default class DocTenant extends Component<any, any> {

  columns: () => ColumnProps[];

  searchBarRef: any = null;

  engineRef = createRef<typeof ExpressionEngineRule>();

  historyShowData: [boolean, any] = [false, undefined];

  moduleTreeHeightObserver= new ResizeObserver(entries => {  
    for (let entry of entries) {  
      if (entry.target && entry.target.id === "doc-tpl-module-tree") {
        const parentDom = document.querySelector('#doc-tpl-module-tree-container');
        if (parentDom && Number(Number(parentDom.getBoundingClientRect().height)) < entry.contentRect.height) {
          this.setState({ observerAffixLeft: "222px", observerVerticalLineLeft: "234px" })
        } else {
          this.setState({ observerAffixLeft: "229px", observerVerticalLineLeft: "240px" })
        }
      }
    }  
  });

  constructor(props) {
    super(props);
    const { currentDoc, activeTabKey } = props.listCache.current || {};
    this.state = {
      currentDoc: currentDoc || {},
      activeTabKey: activeTabKey || "tplConfig",
      collapse: false,
    };
    if (!props.tableDs.__initUpdateEvents__) {
      props.tableDs.addEventListener("update", debounce(({ record, dataSet, name }) => {
        if (name !== "templateName") return;
        // eslint-disable-next-line no-param-reassign
        dataSet.status = "loading";
        this.onSave(record);
      }, 300));
      // eslint-disable-next-line no-param-reassign
      props.tableDs.__initUpdateEvents__ = true;
    }
    this.columns = memoize(() => {
      return [
        {
          name: 'publishStatus',
          width: 100,
          renderer: ({ text, value }) => <Tag color={statusColorMap[value]}>{text}</Tag>,
        },
        {
          name: 'templateCode',
          width: 230,
          renderer: ({ text, record }) => {
            return (
              <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={() => this.onEdit(record!.get("templateId"), record!.get("docId"), true)}>
                {text}
              </Button>
            );
          },
        },
        {
          name: 'templateName',
          editor: true,
          width: 180,
        },
        {
          name: 'templateVersion',
          align: "right",
          width: 100,
        },
        {
          name: 'enabledFlag',
          width: 100,
          renderer: ({ value }) => {
            const commonProps = { border: false };
            if (value) {
              return <Tag color='green' {...commonProps}>{intl.get("hzero.common.status.enabled").d("启用")}</Tag>;
            } else {
              return <Tag color='red' {...commonProps}>{intl.get("hzero.common.status.disabled").d("禁用")}</Tag>;
            }
          },
        },
        {
          name: '_op',
          header: intl.get('hzero.common.button.action').d("操作"),
          width: 300,
          renderer: ({ record }) => {
            const publishStatus = record!.get("publishStatus");
            const enabledFlag = record!.getPristineValue("enabledFlag");
            const templateVersion = record!.get('templateVersion');
            const operator = [
              !!enabledFlag && (
                <Button loading={record!.getState("__onUpgrade")} funcType={FuncType.link} color={ButtonColor.primary} onClick={() => this.onUpgradeVersion(record)}>
                  {intl.get('hzero.common.button.edit').d("编辑")}
                </Button>
              ),
              !!enabledFlag && publishStatus === "NOT_RELEASE" && (
                <Button loading={record!.getState("__onDelete")} color={ButtonColor.primary} funcType={FuncType.link} onClick={() => this.onDelete(record)}>
                  {intl.get('hzero.common.button.delete').d("删除")}
                </Button>
              ),
              <Button loading={record!.getState("__onEnabledChange")} color={ButtonColor.primary} funcType={FuncType.link} onClick={() => this.changeEnabled(record)}>
                {enabledFlag ? intl.get("hzero.common.status.disabled").d("禁用") : intl.get("hzero.common.status.enabled").d("启用")}
              </Button>,
              !!enabledFlag && publishStatus === "MODIFIED" && (
                <Button loading={record!.getState("__onBack")} funcType={FuncType.link} color={ButtonColor.primary} onClick={() => this.onDelete(record, 'back')}>
                  {intl.get('hzero.common.button.reset').d("重置")}
                </Button>
              ),
              templateVersion > 1 && (publishStatus === "RELEASED" || publishStatus === "MODIFIED") && ([
                {
                  content: () => tplVersionListContainer(
                    record.get("templateId"),
                    record.get("templateCode"),
                    { domId: `#ver-btn-rid${record.id}`, id: this.historyShowData }
                  ),
                  trigger: 'click',
                  placement: "rightTop"
                },
                <Button
                  id={`ver-btn-rid${record.id}`}
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  onClick={this.showHistory}
                >
                  {intl.get('hzero.common.button.viewHistory').d("查看历史版本")}
                </Button>
              ]),
            ];
            let externalBtns = operator.filter(Boolean);
            if (externalBtns.length > 3) {
              const moreBtns = externalBtns.slice(2);
              externalBtns = externalBtns.slice(0, 2);
              return (
                <div className={styles["op-btn-container"]}>
                  {externalBtns}
                  <Dropdown
                    overlay={(
                      <Menu>
                        {moreBtns.map((e) => {
                          let ele: any = e;
                          if (isArray(ele)) {
                            ele = ele[1];
                            return (
                              <Menu.Item onClick={ele.props.onClick}>
                                <Popover {...e[0] as any}>
                                  {cloneElement(ele as any, { onClick: undefined, style: { color: "#000" } })}
                                </Popover>
                              </Menu.Item>
                            )
                          }
                          return <Menu.Item onClick={ele.props.onClick}>{cloneElement(ele as any, { onClick: undefined, style: { color: "#000" }  })}</Menu.Item>;
                        })}
                      </Menu>
                    )}
                  >
                    <Button funcType={FuncType.link} color={ButtonColor.primary}>
                      {intl.get("hzero.common.button.option").d("更多")}
                      <Icon type="expand_more"/>
                    </Button>
                  </Dropdown>
                </div>
              );
            }
            if (externalBtns.length > 0) {
              return (
                <div className={styles["op-btn-container"]}>
                  {externalBtns.map(i => {
                    if (isArray(i)) {
                      return (
                        <Popover {...i[0] as any}>
                          {i[1]}
                        </Popover>
                      )
                    }
                    return i;
                  })}
                </div>
              );
            } else return "-";
          },
        },
      ].filter(Boolean) as unknown[] as ColumnProps[];
      // __root__对应key、菜单节点对应moduleCode、
    }, () => this.state.currentDoc.key === "__root__");
  }

  componentDidMount(): void {
    const dom = document.querySelector("#doc-tpl-module-tree");
    if (dom) {
      this.moduleTreeHeightObserver.observe(dom)
    }
  }

  componentWillUnmount() {
    const dom = document.querySelector("#doc-tpl-module-tree");
    if (dom) {
      this.moduleTreeHeightObserver.unobserve(dom)
    }
    this.moduleTreeHeightObserver.disconnect();
  }

  async onSave(record) {
    if (await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/save-single`, {
      method: "POST",
      body: record.toJSONData(),
    }).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        return true;
      }
    // eslint-disable-next-line no-param-reassign
    }).finally(() => {record.dataSet.status = "ready";})) {
      this.props.tableDs.query();
    }
  }

  onCreate = () => {
    const dataSet = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'templateCode',
          required: true,
          label: intl.get('hpfm.doc.common.templateCode').d("模板编码"),
          format: "uppercase",
          pattern: /^[_A-Z0-9]+(\.[_A-Z0-9]*)*$/,
        },
        {
          name: 'templateName',
          label: intl.get('hpfm.doc.common.templateName').d('模板名称'),
          type: FieldType.intl,
          required: true,
        },
      ],
    });
    Modal.open({
      title: intl.get("hpfm.doc.common.templateCreate").d('新建模板'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={dataSet} labelLayout={LabelLayout.float}>
          <TextField name="templateCode" className={styles['template-code']} />
          <IntlField name="templateName" />
        </Form>
      ),
      onOk: async () => {
        if (!await dataSet.validate()) return false;
        const templateId = await request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/save-single`, {
          method: "POST",
          body: {
            ...dataSet.current!.toJSONData(),
            enabledFlag: 1,
            tenantId: getCurrentOrganizationId(),
            docId: this.state.currentDoc.docId,
          },
        }).then(res => {
          if (getResponse(res)) {
            notification.success(undefined as any);
            return res.templateId;
          }
        });
        if (!templateId) return false;
        this.onEdit(templateId, this.state.currentDoc.docId);
      },
    });
  }

  // 查看也走此跳转，页面内部会重新查询单据状态
  onEdit = (templateId, docId, disabled = false) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: "/hpfm/ui-customize/unify-entry/org/doc",
        search: `templateId=${templateId}&docId=${docId}&disabled=${disabled}`,
      })
    );
  }

  async onDelete(record, type?) {
    if (await Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d("提示"),
      children: type === "back"
        ? intl.get("hpfm.doc.common.backVersionTip").d("回退至此版本最新的已发布版本，当前未发布的修改将会丢失，请确认是否重置模板")
        : intl.get("hzero.common.message.confirm.delete").d("是否删除此条记录"),
    }) !== "ok") return;
    
    record.setState({ [type === "back" ? "__onBack" : "__onDelete"]: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates`, {
      method: "DELETE",
      body: record.toJSONData(),
    }).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.props.tableDs.query();
        return res.docId;
      }
    }).finally(() => {
      record.setState({ [type === "back" ? "__onBack" : "__onDelete"]: false });
    });
  }

  setCache(options: { moduleCode?, currentDoc?, expandTreeKeys?, activeTabKey?}) {
    const { moduleCode, currentDoc, expandTreeKeys, activeTabKey } = options;
    const { current } = this.props.listCache;
    this.props.listCache.current = {
      moduleCode: moduleCode,
      currentDoc: currentDoc || this.state.currentDoc,
      expandTreeKeys: expandTreeKeys || current && current.expandTreeKeys,
      activeTabKey: activeTabKey || this.state.activeTabKey,
    };
  }

  expandTree = (e) => {
    this.setCache({ expandTreeKeys: e });
  }

  changeEnabled = (record) => {
    record.set("enabledFlag", record.getPristineValue("enabledFlag") ? 0 : 1)
    record.setState({ "__onEnabledChange": true })
    this.onSave(record);
  }

  onUpgradeVersion(record) {
    const publishStatus = record!.get("publishStatus");
    if (["MODIFIED", "NOT_RELEASE"].includes(publishStatus)) {
      this.onEdit(record!.get("templateId"), record!.get("docId"));
      return;
    }
    record.setState({ __onUpgrade: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/upgrade-version`, {
      method: "POST",
      body: { ...record.toData(), tenantId: getCurrentOrganizationId() },
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        this.props.dispatch(
          routerRedux.push({
            pathname: "/hpfm/ui-customize/unify-entry/org/doc",
            search: `templateId=${res.templateId}&docId=${res.docId}`,
          })
        );
      }
    }).finally(() => {
      record.setState({ __onUpgrade: false });
    });
  }

  onDocChange = (docInfo) => {
    const currentDoc = docInfo.docId ? docInfo : {};
    this.setState({ currentDoc });
    this.setCache({ currentDoc });
    this.props.tableDs.setState("docId", currentDoc.docId);
    const timer = setTimeout(() => {
      if (this.props.tableDs.getState("queryStatus") === 'ready') {
        if (this.searchBarRef) {
          this.searchBarRef.handleQuery(true);
        }
        clearTimeout(timer);
      }
    }, 200);
  }

  changeTabKey = (key) => {
    this.setState({activeTabKey: key});
    this.setCache({activeTabKey: key});
  }

  updateLeftLovPara = (newDefaultData) => {
    let { templateCode: activeTpl } = newDefaultData || {};
    const { currentDoc } = this.state;
    const { tenantInfo } = this.props;
    let templateCode;
    if (typeof activeTpl === "string") {
      try {
        activeTpl = JSON.parse(activeTpl);
        // eslint-disable-next-line prefer-destructuring
        templateCode = activeTpl.templateCode;
      } catch (e){ console.error(e); }
    }
    this.setState({engineLeftValuePara: { docCode: currentDoc.docCode, templateCode, tenantId: tenantInfo.tenantId }});
  }

  showHistory = () => {

    // 每次点击版本历史生成一个唯一id，以进行重新查询数据
    this.historyShowData = [true, new Date().valueOf()];
  }

  toggleCollapse = () => {
    this.setState({ collapse: !this.state.collapse })
  }

  render() {
    const {
      state: {
        currentDoc,
        activeTabKey,
        engineLeftValuePara,
        collapse,
      },
      props: {tenantInfo: {tenantId, tenantNum}},
    } = this;
    const { docId = "__root__", moduleCode = "__root__" } = currentDoc;
    return (
      <div className={stylesCover["doc-tpl"]}>
        <Header title={intl.get('hpfm.doc.common.docBasicStyle').d('单据基础样式')}>
          <ExportButton />
          <ImportButton />
        </Header>
        <div className="unit-main-container unit-common-style">
          <div className='unit-wrap-container'>
            <div className="unit-left-container shadow" style={{ width: collapse ? "0" : "240px" }}>
              <ModuleTree
                onDocChange={this.onDocChange}
                hasRootNode
                disableUnSelect
                defaultSelectKey={docId}
                defaultSelectKeyModuleCode={moduleCode}
                onExpand={this.expandTree}
                collapse={collapse}
                toggleCollapse={this.toggleCollapse}
              />
            </div>

            <div
              className={`${stylesCover["doc-left-container-ctrl"]}${this.state.collapse ? " collapse" : ""}`}
              onClick={this.toggleCollapse}
              style={{ left: this.state.collapse ? 0 : this.state.observerAffixLeft || "229px" }}
            />
            <div className='vertical-split-line' style={{ left: this.state.collapse ? 0 : this.state.observerVerticalLineLeft || "240px" }}/>
            <div className='unit-right-container shadow'>
              <div className="right-box-area">
                <Tabs animated={false} activeKey={activeTabKey} onChange={this.changeTabKey}>
                  {
                    moduleCode !== "__root__" && (
                      <Tabs.TabPane tab={intl.get("hpfm.doc.common.activeCondConfig").d("生效条件配置")} key="activeCondConfig">
                        <ExpressionEngineRule
                          code={`${tenantNum}:SRM.CUSZ.ACTIVE-TPL-DEF:${currentDoc.docCode}`}
                          sceneCode="SRM.CUSZ.ACTIVE-TPL-DEF"
                          leftValueCode="HPFM.DOC.DOC_CONDITION_PARAM.LIST"
                          leftValueLovQueryPara={engineLeftValuePara}
                          dsConfigHook={dsConfigHook}
                          defaultDataChangeHook={this.updateLeftLovPara}
                          dataSource={{docCode: currentDoc.docCode, publishStatus: "RELEASED", tenantId}}
                        />
                      </Tabs.TabPane>
                    )
                  }
                  <Tabs.TabPane tab={intl.get("hpfm.doc.common.tplConfig").d("模板配置")} key="tplConfig">
                    {
                      docId ? (
                        <SearchBarTable
                          key={moduleCode}
                          searchBarRef={ref => this.searchBarRef = ref}
                          searchBarConfig={{
                            autoQuery: false,
                            closeFilterSelector: true,
                          } as any}
                          cacheState
                          style={{ maxHeight: 'calc(100vh - 249px)' }}
                          selectionMode={SelectionMode.none}
                          searchCode='HPFM_CUSZ_TEMPLATE.LIST'
                          customizedCode='HPFM_CUSZ_TEMPLATE.LIST'
                          dataSet={this.props.tableDs}
                          columns={this.columns()}
                          buttons={[
                            <Button
                              icon="add"
                              funcType={FuncType.flat}
                              color={ButtonColor.primary}
                              onClick={this.onCreate}
                              disabled={!currentDoc || !currentDoc.docId}
                            >
                              {intl.get("hzero.common.button.create").d("新建")}
                            </Button>
                          ]}
                        />
                      ) : (
                        <div className="no-data">
                          {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
                        </div>
                      )
                    }
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function dsConfigHook(dsConfig: DataSetProps): DataSetProps {
  return {
    ...dsConfig,
    fields: dsConfig.fields!.map(field => {
      if (field.name === "leftValue") {
        return {
          ...field,
          optionsProps: {
            paging: false,
          }
        }
      } else if (field.name === "rightValue") {
        return {
          ...field,
          dynamicProps: {
            ...field.dynamicProps,
            optionsProps: ({record}) => {
              if (!record) return;
              const rightValueType = record.get('rightValueType');
              if (rightValueType === 'variable') {
                return { paging: false };
              }
            }
          }
        }
      }
      return field;
    })
  }
}