/* eslint-disable react/state-in-constructor */
import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import { routerRedux } from 'dva/router';
import { Collapse, Popover, Tag } from 'choerodon-ui';
import { Button, DataSet, Form, IntlField, Output, Spin, Tabs, TextArea, TextField } from 'choerodon-ui/pro';
import { Header } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import request from "hzero-front/lib/utils/request";
import notification from 'hzero-front/lib/utils/notification';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import "../../../../common.less";
import styles from "../../../style.less";
import stylesCover from "../style.less";
import PageTree from './PageTree';
import { templateDsFields } from '../../common/dataSets';
import { initUnits, openFieldDetailImpl, tplVersionListContainer } from '../modelImpl';
import UnitConfigImpl from './UnitConfigImpl';
import ImportDetailButton from '../ImportButton/DetailButton';

const statusColorMap = {
  "NOT_RELEASE": 'gray',
  "RELEASED": 'green',
  "MODIFIED": 'orange',
};
function renderUnitStatus(_){return <Tag style={{border: "none", height: "20px"}} color={statusColorMap[_.value]}>{_.text}</Tag>;}
@formatterCollections({ code: ['hzero.common', 'hpfm.doc', 'hpfm.individuationUnit', 'hpfm.customize'] })
@observer
export default class DocTenantDetail extends Component<any, any> {
  urlParams: any;

  moduleCode?: string;

  startMove: boolean = false;

  wrapClientRect: any;

  backPathList: string[];

  modal: any;

  historyShowData: [boolean, any] = [false, undefined];

  constructor(props) {
    super(props);
    const search = this.props.location.search.split("?")[1];
    const urlParams: any = {};
    if (search) {
      search.split("&").forEach(param => {
        const [paramKey, paramValue] = param.split("=");
        urlParams[paramKey] = paramValue;
      });
    }
    this.urlParams = urlParams;
    this.state = {
      publishLoading: true,
      newVersionLoading: true,
      stages: [],
      currentStage: undefined,
      unitTypeObj: {},
      currentUnitCode: '',
      pageUuid: '',
      unitData: {},
      headerCollapse: []
    };
    queryMapIdpValue({
      unitType: 'HPFM.CUST.UNIT_TYPE',
    }).then(res => {
      if (res) {
        const unitTypeObj = {};
        (res.unitType || []).forEach(i => {
          unitTypeObj[i.value] = i.meaning;
        });
        this.setState({
          unitTypeObj,
        });
      }
    });
    this.backPathList = [];
  }

  formDs = new DataSet({
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: templateDsFields(intl),
    transport: {
      read: ({ dataSet }) => ({
        url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/${dataSet!.getState("templateId")}`,
        method: "GET",
      }),
    },
  });

  unitConfigRef = createRef<UnitConfigImpl>();

  componentDidMount() {
    this.queryHeader();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const search = this.props.location.search.split("?")[1];
      const urlParams: any = {};
      if (search) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          publishLoading: true,
          newVersionLoading: true,
          stages: [],
          currentStage: undefined,
          currentUnitCode: '',
          pageUuid: '',
          unitData: {},
        });
        search.split("&").forEach(param => {
          const [paramKey, paramValue] = param.split("=");
          urlParams[paramKey] = paramValue;
        });
        this.urlParams = urlParams;
        this.queryHeader();
      }
    }
  }

  openInitUnitsModal = () => {
    const { templateId } = this.urlParams;
    initUnits(
      { templateId },
      {
        unitTypeObj: this.state.unitTypeObj,
        callback: () => {
          this.unitConfigRef.current!.queryUnit();
        },
      }
    );
  };

  queryHeader = () => {
    if (this.modal) {
      this.modal.close();
      this.modal = null;
    }
    this.formDs.setState({ templateId: this.urlParams.templateId });
    this.formDs.query().then((res) => {
      const currentStage = res.docStageList && res.docStageList.length > 0 ? res.docStageList[0] : undefined;
      this.setState({
        publishLoading: false,
        newVersionLoading: false,
        stages: res.docStageList || [],
        currentStage,
      });
    });
  }

  queryStages = () => {
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/${this.urlParams.docId}/doc-stages`, {
      method: "GET",
      query: { templateId: this.urlParams.templateId },
    }).then(res => {
      if (getResponse(res)) {
        // eslint-disable-next-line no-nested-ternary
        const currentStage = this.state.currentStage ? this.state.currentStage : res.length > 0 ? res[0] : undefined;
        this.setState({
          stages: res,
          currentStage,
        });
      }
    });
  }

  changeStage = (e) => {
    if (e) {
      const stageInfo = this.state.stages.find(i => i.stageCode === e);
      this.setState({
        currentStage: stageInfo,
      });
    }
  }

  changeUnitCode = (currentUnitCode, pageUuid, data) => {
    this.setState({ currentUnitCode, pageUuid, unitData: data });
  }

  onPublish = () => {
    const save = () => {
      this.setState({ publishLoading: true });

      return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/release`, {
        method: "POST",
        body: { ...this.formDs.current!.toJSONData(), docStageList: undefined, tenantId: getCurrentOrganizationId() },
      }).then(res => {
        if (getResponse(res)) {
          notification.success({});
          this.queryHeader();
        }
      }).finally(() => {
        this.setState({ publishLoading: false });
      });
    };
    if (this.syncPromise) {
      return this.syncPromise.then(save).finally(() => {
        this.syncPromise = undefined;
        this.syncResolve = undefined;
      });
    } else return save();
  }

  // wrap对应unit-wrap-container
  dragStart = () => {
    this.startMove = true;
    this.wrapClientRect = document.getElementById("unit-wrap-container")!.getBoundingClientRect() as any;
    const divide = document.getElementById("unit-tree-divide")!;
    const divideRect = divide.getBoundingClientRect();
    divide.style.position = 'absolute';
    divide.style.zIndex = '9999';
    divide.style.backgroundImage = 'linear-gradient(90deg, transparent 2px, #e8e8e8 3px, transparent 5px)';
    divide.style.left = `${divideRect.left - this.wrapClientRect.left}px`;
    divide.style.height = `100%`;
    // 15 = 10 + 5; 10 是unit-left-container的右外边距 5是分割线宽度
    document.getElementById("unit-tree-container")!.style.marginRight = '15px';
    document.body.style.userSelect = "none";
  }

  // wrap对应unit-wrap-container
  dragEnd = () => {
    if (!this.startMove) return;
    this.startMove = false;
    const divide = document.getElementById("unit-tree-divide")!;
    const divideRect = divide.getBoundingClientRect();
    divide.style.position = '';
    divide.style.backgroundImage = '';
    divide.style.left = '';
    divide.style.height = '';
    divide.style.zIndex = '';
    document.getElementById("unit-tree-container")!.style.marginRight = '';
    // 10 是unit-left-container的右外边距
    document.getElementById("unit-tree-container")!.style.width = `${divideRect.left - this.wrapClientRect.left - 10}px`;

    document.body.style.userSelect = "";
  }

  // wrap对应unit-wrap-container
  dragMove = e => {
    if (this.startMove) {
      document.getElementById("unit-tree-divide")!.style.left = `${e.clientX - this.wrapClientRect.left}px`;
    }
  }

  onUpgradeVersion = () => {
    this.setState({ newVersionLoading: true });
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/upgrade-version`, {
      method: "POST",
      body: { ...this.formDs.current!.toJSONData(), tenantId: getCurrentOrganizationId() },
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        this.backPathList = [];
        this.updateGlobalTabsSearch(`?templateId=${res.templateId}&docId=${res.docId}`);
        this.props.dispatch(
          routerRedux.push({
            pathname: "/hpfm/ui-customize/unify-entry/org/doc",
            search: `templateId=${res.templateId}&docId=${res.docId}`,
          })
        );
      }
    }).finally(() => {
      this.setState({ newVersionLoading: false });
    });
  }

  updateGlobalTabsSearch = (newSearch) => {
    const oldState = (window as any).dvaApp._store.getState().global;
    (window as any).dvaApp._store.dispatch({
      type: 'global/updateState',
      payload: {
        tabs: oldState.tabs.map(tab => ({
          ...tab,
          search: tab.path === "/hpfm/ui-customize/unify-entry/org/doc" ? newSearch : tab.search,
        })),
      },
    });
  }

  onBack = () => {
    const targetUrl = this.backPathList.pop();
    if (targetUrl) {
      this.updateGlobalTabsSearch(`?${targetUrl.split('?')[1]}`);
    }
  }

  onSaveHeader = () => {
    this.setState({saveLoading: true});
    return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/save-header`, {
      method: "POST",
      body: { ...this.formDs.current!.toJSONData(), tenantId: getCurrentOrganizationId() },
    }).then((res) => {
      if(getResponse(res)){
        return this.formDs.query();
      }
    }).finally(() => {
      this.setState({saveLoading: false});
    });
  }

  /**
   * 控制版本备注失焦保存和发布动作的时序问题
   */
  syncPromise;

  syncResolve;

  remarkSyncStart = () => {
    this.syncPromise = new Promise(resolve => {
      this.syncResolve = resolve;
    });
  }

  remarkSyncRemove = () => {
    if (this.syncPromise) {
      this.syncPromise.then(this.onSaveHeader);
      setTimeout(this.syncResolve, 0);
    }
  }
  showHistory = () => {
    // 每次点击版本历史生成一个唯一id，以进行重新查询数据
    this.historyShowData = [!this.historyShowData[0], new Date().valueOf()];
  }

  render() {
    const {
      saveLoading = false,
      publishLoading,
      newVersionLoading,
      stages,
      currentStage = {},
      unitTypeObj,
      currentUnitCode,
      pageUuid,
      unitData,
      headerCollapse,
    } = this.state;

    const { backPathList } = this;
    const { publishStatus, enabledFlag, docCode, templateCode, docName, templateName } = this.formDs.current ? this.formDs.current.get([
      "publishStatus", "enabledFlag", "docCode", "templateCode", "docName", "templateName"
    ]) : {} as any;
    const editable = !!enabledFlag && ["NOT_RELEASE", "MODIFIED"].includes(publishStatus) && this.urlParams.disabled !== "true";
    return (
      <div className={stylesCover["doc-tpl"]}>
        <Header
          title={`${docName}-${templateName}(${templateCode})`}
          backPath={backPathList.length > 0 ? backPathList[backPathList.length - 1] : '/hpfm/ui-customize/unify-entry/org/index'}
          onBack={this.onBack}
        >
          <div className={styles['ui-fix']}>
            {editable && (
              <Button icon="publish2" funcType={FuncType.flat} loading={publishLoading} color={ButtonColor.primary} onClick={this.onPublish}>{intl.get('hzero.common.button.release').d("发布")}</Button>
            )}
            {/* {editable && (
            <Button loading={publishLoading} funcType={FuncType.flat} icon="baseline-file_copy">
              {intl.get('hpfm.doc.common.copyFromTemplate').d("模版复制自")}
            </Button>
          )} */}
            {!this.urlParams.history && publishStatus === "RELEASED" && (
              <Button
                loading={newVersionLoading}
                funcType={FuncType.flat}
                color={ButtonColor.primary}
                onClick={() => this.onUpgradeVersion()}
                icon="add"
              >
                {intl.get('hpfm.doc.common.newVersion').d("新增版本")}
              </Button>
            )}
            {!this.urlParams.history && publishStatus !== "NOT_RELEASE" && (
              <Popover
                content={() => {
                  const current = this.formDs.current!;
                  return tplVersionListContainer(
                    current.get("templateId"),
                    current.get("templateCode"),
                    { domId: "#ver-btn-detail", allowMaxHeight: 500, id: this.historyShowData }
                  );
                }}
                trigger='click'
                placement="bottomLeft"
              >
                <Button id="ver-btn-detail" loading={publishLoading} funcType={FuncType.flat} icon="menu_book" onClick={this.showHistory}>
                  {intl.get('hzero.common.button.viewHistory').d("查看历史版本")}
                </Button>
              </Popover>
            )}
            {editable && (
              <Button loading={publishLoading} funcType={FuncType.flat} icon="settings_backup_restore" onClick={this.openInitUnitsModal}>
                {intl.get('hpfm.doc.common.initUnitConfig').d("初始化单元配置")}
              </Button>
            )}
            <ImportDetailButton docCode={docCode} templateCode={templateCode} loading={publishLoading} />
          </div>
        </Header>
        <div className="unit-main-container-wrapper">
          <Spin spinning={publishLoading || saveLoading}>
            <div className='unit-main-container unit-common-style' style={{ display: "flex", flexDirection: "column" }}>
              <Collapse className={`unit-collapse-container ${styles['self-module1-style']}`} ghost expandIconPosition="text-right" onChange={(value) => this.setState({ headerCollapse: value })}>
                <Collapse.Panel
                  key="basic"
                  header={intl.get('hpfm.doc.common.basicInfo').d('基础信息')}
                >
                  {
                    // eslint-disable-next-line no-nested-ternary
                    publishLoading ? null : editable ? (
                      <Form
                        dataSet={this.formDs}
                        columns={4}
                        labelLayout={LabelLayout.float}
                        useColon={false}
                      >
                        <TextField name="templateCode" />
                        <IntlField name="templateName" />
                        <TextField name="templateVersion" />
                        <TextField name="publishStatus" />
                        <TextArea
                          name="remark"
                          colSpan={2}
                          onFocus={this.remarkSyncStart}
                          onBlur={this.remarkSyncRemove}
                        />
                      </Form>
                    ) : (
                      <Form
                        className="c7n-pro-vertical-form-display"
                        dataSet={this.formDs}
                        columns={4}
                        labelLayout={LabelLayout.vertical}
                        useColon={false}
                      >
                        <Output name="templateCode" />
                        <Output name="templateName" />
                        <Output name="templateVersion" />
                        <Output name="publishStatus" renderer={renderUnitStatus} />
                        <Output name="remark" colSpan={2} />
                      </Form>
                    )
                  }
                </Collapse.Panel>
              </Collapse>
              <div className={`unit-vertical-container ${styles["self-module2-style"]}`} style={{ flex: 1 }}>
                {
                  stages.length > 0 ? (
                    <>
                      <Tabs onChange={this.changeStage} activeKey={currentStage.stageCode}>
                        {stages.map(i => {
                          return (
                            <Tabs.TabPane tab={i.stageName} key={i.stageCode} />
                          );
                        })}
                      </Tabs>
                      <div id="unit-wrap-container" className="unit-wrap-container" style={{ marginTop: '-16px', height: "calc(100% - 41px)" }} onMouseMove={this.dragMove}>
                        <div id="unit-tree-container" className="unit-left-container" style={{ paddingTop: '16px', paddingLeft: '16px', overflow: "auto" }}>
                          <PageTree
                            editable={editable}
                            publishStatus={publishStatus}
                            templateId={this.urlParams.templateId}
                            stage={currentStage}
                            onUnitChange={this.changeUnitCode}
                            unitTypeObj={unitTypeObj}
                          />
                        </div>
                        <div
                          id="unit-tree-divide"
                          style={{ height: "100%" }}
                          className='vertical-divide movable'
                          onMouseDown={this.dragStart}
                          onMouseUp={this.dragEnd}
                        />
                        <div className="unit-right-container unit-new">
                          <UnitConfigImpl
                            openFieldDetailImpl={openFieldDetailImpl}
                            templateId={this.urlParams.templateId}
                            unitId={unitData.unitId}
                            onRef={this.unitConfigRef}
                            pageId={unitData.pageId}
                            unitCode={currentUnitCode}
                            unitType={unitData.unitType}
                            unitTypeObj={unitTypeObj}
                            uuid={pageUuid}
                            editable={editable}
                            headerCollapse={headerCollapse}
                            tabsClassName='unit-config-tabs'
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-data-block">
                      {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
                    </div>
                  )
                }
              </div>
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}
