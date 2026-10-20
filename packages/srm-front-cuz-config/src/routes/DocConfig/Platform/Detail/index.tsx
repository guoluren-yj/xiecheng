/* eslint-disable react/state-in-constructor */
import React, { Component, createRef } from 'react';
import { Collapse, Alert } from 'choerodon-ui';
import { Button, DataSet, Dropdown, Form, Icon, IntlField, Lov, Menu, Modal, Spin, Switch, TextField } from 'choerodon-ui/pro';
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
import styles from "../../../UnifyEntry/style.less";
import "../../../common.less";
import { pageModal, stageModal } from './modalUtils';
import PageTree from './PageTree';
import UnitConfig from './UnitConfig';
import { docDsFields } from '../dataSets';
import CondParaConfig from './CondParaConfig';


@formatterCollections({ code: ['hzero.common', 'hpfm.doc', 'hpfm.individuationUnit'] })
export default class DocPlatformDetail extends Component<any, any> {
  urlParams: any;

  menuCode?: string;

  pageTreeInstance: any;

  wrapClientRect: any;

  startMove: boolean = false;

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
      saving: true,
      locking: false,
      stages: [],
      currentStage: undefined,
      unitTypeObj: {},
      currentUnitId: '',
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
  }

  formDs = new DataSet({
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: docDsFields(intl, { dsStatus: 1 }),
    transport: {
      read: ({ dataSet }) => ({
        url: `${HZERO_PLATFORM}/v1/docs/${dataSet!.getState("docId")}`,
        method: "GET",
      }),
    },
  });

  componentDidMount() {
    this.queryHeader();
    this.queryStages();
  }

  queryHeader = () => {
    this.formDs.setState({ docId: this.urlParams.docId });
    this.formDs.query().then(() => this.setState({ saving: false }));
  }

  queryStages = () => {
    request(`${HZERO_PLATFORM}/v1/doc-stages`, {
      method: "GET",
      query: { docId: this.urlParams.docId },
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

  onSave = () => {
    const current = this.formDs.current!;
    if (current.getField("enabledFlag")!.dirty && !current.get("enabledFlag")) {
      request(`${HZERO_PLATFORM}/v1/docs/exist/${current.get("docId")}`, {
        method: "GET",
      }).then(res => {
        if (getResponse(res)) {
          if (res.message) {
            Modal.confirm({
              title: res.message,
              onOk: () => this.saveHeader(current),
            });
          } else {
            this.saveHeader(current);
          }
        }
      });
    } else this.saveHeader(current);
  }

  saveHeader = async (record) => {
    if (!await record.validate()) return;
    request(`${HZERO_PLATFORM}/v1/docs`, {
      method: "POST",
      body: {
        ...record.toData(),
        tenantId: getCurrentOrganizationId(),
      },
    }).then(res => {
      if (getResponse(res)) {
        notification.success(undefined as any);
        this.queryHeader();
      }
    });
  }

  createStage = () => {
    stageModal(undefined, this.urlParams, this.queryStages);
  }

  clickStageCtrl = (stageCode, op) => {
    const stageInfo = this.state.stages.find(i => i.stageCode === stageCode);
    if (op === 'edit') {
      stageModal([stageInfo], this.urlParams, this.queryStages);
    }
    else if (op === 'add') {
      pageModal(undefined, {
        docId: this.urlParams.docId,
        stageId: stageInfo.stageId,
      },
        () => {

          if (stageCode === this.state.currentStage.stageCode) { this.pageTreeInstance.queryPages(stageInfo.stageId); }
          else { this.changeStage(stageCode); }
        }
      );
    }
  }

  pageTreeRef = (ins) => {
    this.pageTreeInstance = ins;
  }

  changeStage = (e) => {
    const stageCode = typeof e === "string" ? e : e.target.getAttribute("data-code");
    if (stageCode) {
      const stageInfo = this.state.stages.find(i => i.stageCode === stageCode);
      this.setState({
        currentStage: stageInfo,
        currentUnitId: undefined,
      });
    }
  }

  changeUnitId = (currentUnitId) => {
    this.setState({ currentUnitId });
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
    // 5是分割线宽度
    document.getElementById("unit-tree-container")!.style.marginRight = '5px';
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
    document.getElementById("unit-tree-container")!.style.marginRight = '0';
    document.getElementById("unit-tree-container")!.style.width = `${divideRect.left - this.wrapClientRect.left}px`;

    document.body.style.userSelect = "";
  }

  // wrap对应unit-wrap-container
  dragMove = e => {
    if (this.startMove) {
      document.getElementById("unit-tree-divide")!.style.left = `${e.clientX - this.wrapClientRect.left}px`;
    }
  }

  openCondParaConfig = () => {
    const {
      docCode,
      docId,
    } = this.formDs.current!.get(["docCode", "docId"]);
    const externalRef = createRef<any>();
    Modal.open({
      title: intl.get("hpfm.doc.common.title.activeCondPara").d("激活条件参数配置"),
      style: {width: "1080px"},
      drawer: true,
      children: (
        <CondParaConfig
          externalRef={externalRef}
          docCode={docCode}
          docId={docId}
        />
      ),
      onOk: () => externalRef.current.saveData(this.queryHeader),
    });
  }

  render() {
    const {
      saving,
      locking,
      stages,
      currentStage,
      unitTypeObj,
      currentUnitId,
    } = this.state;

    return (
      <>
        <Header
          title={intl.get('hpfm.doc.common.docBasicStyleConfig').d('单据基础样式配置')}
          backPath='/hpfm/ui-customize/doc/platform/list'
        >
          <div className={styles['ui-fix']}>
            <Button
              funcType={FuncType.flat}
              loading={this.state.saving}
              icon="save"
              color={ButtonColor.primary}
              onClick={this.onSave}
            >
              {intl.get('hzero.common.button.save').d("保存")}
            </Button>
            <Button
              funcType={FuncType.flat}
              icon="alt_route-o"
              onClick={this.openCondParaConfig}
            >
              {intl.get('hpfm.doc.common.activeCondPara').d("激活条件参数")}
            </Button>
          </div>
        </Header>
        <div className="unit-main-container-wrapper">
          <Spin spinning={saving || locking}>
            <div className='unit-main-container unit-common-style' style={{ display: "flex", flexDirection: "column" }}>
              <Collapse
                className={`unit-collapse-container ${styles['self-module1-style']}`}
                ghost
                expandIconPosition="text-right"
                onChange={(value) => this.setState({ headerCollapse: value })}
              >
                <Collapse.Panel
                  key="basic"
                  header={intl.get('hpfm.doc.common.basicInfo').d('基础信息')}
                >
                  <Form dataSet={this.formDs} columns={4} labelLayout={LabelLayout.float} useColon={false}>
                    <TextField name="docCode" />
                    <IntlField name="docName" />
                    <Lov name="moduleCode" />
                    <Switch name="enabledFlag" />
                  </Form>
                </Collapse.Panel>
              </Collapse>
              <div className={`unit-vertical-container ${styles["self-module2-style"]}`} style={{ flex: 1 }}>
                <Alert
                  type="warning"
                  showIcon 
                  closable
                  message={(
                    <>
                      {intl.get('hzero.common.message.confirm.title').d('提示')}
                      <span style={{ marginRight: '4px', display: 'inline-block' }}>:</span>
                      {intl.get('hpfm.doc.view.message.save.tip')
                      .d('单据样式定制选用的所有单元，在租户层将无法直接通过页面个性化功能编辑，请谨慎操作！')}
                    </>
                  )}
                  className={styles.alert}
                />
                <div className='unit-doc-stage-bar' onClick={this.changeStage}>
                  {stages.map(i => {
                    return (
                      <div className={`unit-doc-stage-bar-item ${currentStage.stageCode === i.stageCode ? 'active' : ''}`} data-code={i.stageCode}>
                        {i.stageName}
                        <Dropdown
                          overlay={(
                            <Menu className='unit-doc-stage-popover-menu' onClick={({ key }) => this.clickStageCtrl(i.stageCode, key)}>
                              <Menu.Item key="edit">{intl.get('hzero.common.button.edit').d("编辑")}</Menu.Item>
                              <Menu.Item key="add">{intl.get('hpfm.doc.common.addPage').d("增加页面")}</Menu.Item>
                            </Menu>
                          )}
                        >
                          <Icon type="more_vert" className='doc-page-header-ctrl' style={{ lineHeight: "22px", verticalAlign: "bottom" }} />
                        </Dropdown>
                      </div>
                    );
                  })}
                  <Button color={ButtonColor.primary} funcType={FuncType.flat} icon="add" onClick={this.createStage}>{intl.get('hpfm.doc.common.createStage').d('创建阶段')}</Button>
                </div>
                <div id="unit-wrap-container" className="unit-wrap-container" style={{ marginTop: '-16px', height: "calc(100% - 43px)" }} onMouseMove={this.dragMove}>
                  <div id="unit-tree-container" className="unit-left-container" style={{ paddingTop: '16px', marginRight: 0, paddingLeft: '20px' }}>
                    <PageTree
                      onRef={this.pageTreeRef}
                      docId={this.urlParams.docId}
                      stageId={currentStage && currentStage.stageId}
                      onUnitChange={this.changeUnitId}
                      unitTypeObj={unitTypeObj}
                    />
                  </div>
                  <div
                    id="unit-tree-divide"
                    style={{ height: "100%" }}
                    className='vertical-divide movable'
                    onMouseDown={this.dragStart}
                    onMouseUp={this.dragEnd}
                  >
                    <Icon type="baseline-arrow_left" />
                    <Icon type="baseline-arrow_right" />
                  </div>
                  <div className="unit-right-container unit-new">
                    <UnitConfig unitId={currentUnitId} headerCollapse={this.state.headerCollapse}/>
                  </div>
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </>
    );
  }
}
