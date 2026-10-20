/* eslint-disable react/state-in-constructor */
import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import { Icon, Button, Spin } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import ResizeObserver from 'resize-observer-polyfill';
import { Header } from 'hzero-front/lib/components/Page';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { queryMapIdpValue, downloadFileByAxios } from 'hzero-front/lib/services/api';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import "../../../../common.less";
import styles from "../../../style.less";
import styles2 from "./style.less";
import PageTree from './PageTree';
import { openFieldDetailImpl } from './modelImpl';
import UnitConfigImpl from './UnitConfigImpl';
import ImportUnitButton from '../../../../../components/ImportUnitButton';

const CUSZ_DATR_MIGRATE_ENABLE = window.$$env.HZERO_PLATFORM_CUSZ_DATA_MIGRATE_ENABLE; // 环境变量，用于控制导入导出按钮是否显示
@formatterCollections({ code: ['hzero.common', 'hpfm.doc', 'hpfm.individuationUnit', 'hpfm.customize', 'hpfm.individual'] })
@observer
export default class UnitTenantDetail extends Component<any, {
  unitTypeObj: any;
  unit: any;
  groupCode?: string;
  headerTitle?: string;
  queryUnitConfigLoading?: boolean;
  observerVerticalLineLeft;
}> {
  urlParams: any;

  startMove: boolean = false;

  wrapClientRect: any;

  backPathList: string[];

  unitConfigRef = createRef<UnitConfigImpl>();

  firstLoadFlag: string[] = [];

  moduleTreeHeightObserver= new ResizeObserver(entries => {  
    for (let entry of entries) {
      if (entry.target && entry.target.id === "unit-detail-left-tree-content") {
        const parentDom = document.querySelector('#unit-tree-container-cusz');
        const targetDom = document.querySelector('#unit-detail-left-tree-content > .c7n-tree');
        if (parentDom && Number(Number(parentDom.getBoundingClientRect().height)) < (targetDom && Number(Number(targetDom.getBoundingClientRect().height)) || 0)) {
          this.setState({ observerVerticalLineLeft: 0 })
        } else {
          this.setState({ observerVerticalLineLeft: 10 })
        }
      }
    }  
  });

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
      unitTypeObj: {},
      unit: {
        id: urlParams.unitId,
        unitCode: urlParams.unitCode,
        unitType: urlParams.unitType,
      },
      groupCode: urlParams.groupCode,
      headerTitle: decodeURIComponent(urlParams.menuName),
      observerVerticalLineLeft: '236px',
      queryUnitConfigLoading: false,
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

  componentDidMount(): void {
    const dom = document.querySelector("#unit-detail-left-tree-content");
    if (dom) {
      this.moduleTreeHeightObserver.observe(dom)
    }
  }

  componentWillUnmount() {
    const dom = document.querySelector("#unit-detail-left-tree-content");
    if (dom) {
      this.moduleTreeHeightObserver.unobserve(dom)
    }
    this.moduleTreeHeightObserver.disconnect();
  }

  changeUnitCode = (_unit, groupCode, forceUpdate = false) => {
    const unit = _unit || this.state.unit || {};
    this.setState({ groupCode, unit }, () => {
      history.replaceState(null, "", [
        ((window.$$env || {}).BASE_PATH || "").replace(/\/$/, ""),
        '/hpfm/ui-customize/cust-config/detail?',
        `unitId=${unit.id}&`,
        `unitCode=${unit.unitCode}&`,
        `unitType=${unit.unitType}&`,
        `groupCode=${groupCode}&`,
        `menuCode=${this.urlParams.menuCode}&`,
        `menuName=${this.state.headerTitle}`,
      ].join(""));
      if (forceUpdate) this.unitConfigRef.current!.queryUnit();
    });
  }

  handleQueryUnitConfigLoading = loading => {
    this.setState({ queryUnitConfigLoading: loading });
  };

  // wrap对应unit-wrap-container
  dragStart = () => {
    this.startMove = true;
    this.wrapClientRect = document.getElementById("unit-wrap-container-cusz")!.getBoundingClientRect() as any;
    const divide = document.getElementById("unit-tree-divide-cusz")!;
    const divideRect = divide.getBoundingClientRect();
    console.log(divideRect.left - this.wrapClientRect.left)
    divide.style.marginLeft = '0px';
    divide.style.position = 'absolute';
    divide.style.zIndex = '9999';
    divide.style.backgroundImage = 'linear-gradient(90deg, transparent 2px, #e8e8e8 3px, transparent 5px)';
    divide.style.left = `${divideRect.left - this.wrapClientRect.left - 1.5}px`;
    divide.style.height = `100%`;
    // 5是分割线宽度
    // document.getElementById("unit-tree-container-cusz")!.style.marginRight = '5px';
    document.body.style.userSelect = "none";
  }

  // wrap对应unit-wrap-container
  dragEnd = () => {
    if (!this.startMove) return;
    this.startMove = false;
    const divide = document.getElementById("unit-tree-divide-cusz")!;
    const divideRect = divide.getBoundingClientRect();
    divide.style.position = '';
    divide.style.backgroundImage = '';
    divide.style.left = '';
    divide.style.height = '';
    divide.style.zIndex = '';
    divide.style.marginLeft = `-${this.state.observerVerticalLineLeft}px`;
    document.getElementById("unit-tree-container-cusz")!.style.width = `${divideRect.left - this.wrapClientRect.left + 1.5 - 16}px`;

    console.log(divideRect.left, this.wrapClientRect.left)
    document.body.style.userSelect = "";
  }

  // wrap对应unit-wrap-container
  dragMove = e => {
    if (this.startMove) {
      document.getElementById("unit-tree-divide-cusz")!.style.left = `${e.clientX - this.wrapClientRect.left - 1.5}px`;
      console.log(e.clientX - this.wrapClientRect.left)
    }
  }

  exportOperationRecord = async() => {
    const {
      unit: {
        unitCode,
      },
    } = this.state;
    await downloadFileByAxios({
      requestUrl: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/cusz/audit?unitCode=${unitCode}`,
      method: 'GET',
    });
  };

  render() {
    const {
      unitTypeObj,
      groupCode,
      unit: {
        unitCode,
        id,
        unitType,
        unitName,
      },
      headerTitle,
      queryUnitConfigLoading,
    } = this.state;

    const showImportHistoryButton = groupCode && unitCode;
    return (
      <div className={[styles2["unit-detail"], styles["self-module2-style"], "unit-common-style"].join(" ")} style={{ flex: 1 }}>
        <Header title={headerTitle} backPath="/hpfm/ui-customize/cust-config/entry" >
          {
            showImportHistoryButton && CUSZ_DATR_MIGRATE_ENABLE === 'true' ? (
              <ImportUnitButton
                groupCode={groupCode}
                unitCode={unitCode}
                unitType={unitType}
              />
            ) : null
          }
          {(window.$$env || {}).CUSZ_EXPORT_RECORD === "true" && !!unitCode && (
            <Button
              icon='archive'
              funcType={FuncType.flat}
              onClick={this.exportOperationRecord}
            >
              {intl.get('hpfm.customize.button.exportOperationRecord').d('导出操作记录')}
            </Button>
          )}
        </Header>
        <div id="unit-wrap-container-cusz" className="unit-detail-container" onMouseMove={this.dragMove}>
          <div id="unit-tree-container-cusz" className="unit-detail-left">
            <div id="unit-detail-left-tree-content" className='unit-tree-container-content'>
              <Spin spinning={queryUnitConfigLoading} indicator={<div></div>}>
                <PageTree
                  unitCode={unitCode}
                  groupCode={groupCode}
                  menuCode={this.urlParams.menuCode}
                  onUnitChange={this.changeUnitCode}
                  unitTypeObj={unitTypeObj}
                  firstLoadFlag={this.firstLoadFlag}
                />
              </Spin>
            </div>
          </div>

          <div
            id="unit-tree-divide-cusz"
            className='vertical-divide movable'
            onMouseDown={this.dragStart}
            onMouseUp={this.dragEnd}
            style={{ marginLeft: `-${this.state.observerVerticalLineLeft}px`, height: "100%" }}
          >
            <Icon type="baseline-arrow_left" />
            <Icon type="baseline-arrow_right" />
          </div>
          <div id="unit-right-container-cusz" className="unit-right-container unit-info">
            <UnitConfigImpl
              onRef={this.unitConfigRef}
              openFieldDetailImpl={openFieldDetailImpl}
              unitType={unitType}
              unitTypeObj={unitTypeObj}
              unitCode={unitCode}
              unitName={unitName}
              unitId={id}
              groupCode={groupCode}
              menuCode={this.urlParams.menuCode}
              editable
              onQueryUnitConfigLoading={this.handleQueryUnitConfigLoading}
            />
          </div>
        </div>
      </div>
    );
  }
}
