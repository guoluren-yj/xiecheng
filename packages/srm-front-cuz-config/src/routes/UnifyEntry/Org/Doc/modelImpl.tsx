import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Spin, DataSet, Tree, TextField, Tooltip } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import notification from 'hzero-front/lib/utils/notification';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import request from "hzero-front/lib/utils/request";
import { Tag, Form as BaseForm } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import {
  queryTemplateRelatedUnits,
} from '../../../../services/customizeConfigService';
import ComputeRule from '../../../../components/ComputeRule';
import ParamsConfig from '../../../../components/ParamsConfig';
import { filterFxUnitType, unitTypeColorMap } from "../../../../utils/constConfig";
import styles from "../../style.less";
import { openFieldDetail } from '../common/modals';

class ParamsConfigImpl extends ParamsConfig {
  queryRelatedUnits() {
    return queryTemplateRelatedUnits({ ...this.props.relatedParams, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
}

@(BaseForm.create as any)({ fieldNameProp: null })
class ComputeRuleImpl extends ComputeRule {
  queryRelatedUnits() {
    return queryTemplateRelatedUnits({ ...this.props.relatedParams, returnVirtual: true, filterUnitType: filterFxUnitType });
  }
}

export function openFieldDetailImpl(record, options) {
  const {unitId, templateId, pageId, uuid, ...baseOptions} = options;
  const subModalCommonParams = {templateId, pageId, version: uuid, unitId};
  openFieldDetail(record, {...baseOptions, subModalCommonParams, mode: "tpl", isTemplate: true}, {
    ComputeRuleImpl, ParamsConfigImpl,
    saveFieldUrl: (data) => {
      // eslint-disable-next-line no-param-reassign
      data.configId = (options.unitInfoFun().config || {}).id;
      return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/save`, {
        method: "POST",
        body: data,
        query: { templateId },
      }, { encryptBody: true });
    },
  });
}

export const HistoryVersionImpl = observer<{
  templateId: string | number, templateCode?: string, dispatch,
  parentThis?: any,
  modal?: any,
  id: [boolean, any],
}>(({ templateId, templateCode, parentThis, id = [false, undefined] }) => {
  const [versionList, setVersionList] = useState([]);
  const [versionLoading, setVersionLoading] = useState(true);
  useEffect(() => {
    if (!id[0]) return;
    setVersionLoading(true);
    request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/history/${templateId}`, {
      method: "GET", query: { templateCode },
    }).then(res => {
      if (getResponse(res)) {
        setVersionList(res);
      }
    }).finally(() => {
      setVersionLoading(false);
    });
  }, [id]);
  const view = useCallback((tId, docId) => {
    const newSearch = `templateId=${tId}&docId=${docId}&history=1`;
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
    const basePath = (window.$$env.BASE_PATH || "").replace(/\/$/, '');
    const { search, pathname } = window.location;
    // eslint-disable-next-line no-unused-expressions
    parentThis && parentThis.backPathList.push(`${pathname.replace(basePath, '')}${search}`);
    (window as any).dvaApp._store.dispatch(
      routerRedux.push({
        pathname: "/hpfm/ui-customize/unify-entry/org/doc",
        search: newSearch,
      })
    );
  }, []);
  return (
    <Spin spinning={versionLoading}>
      {versionLoading ? (
        <div className="no-data" style={{ margin: "20px 0" }}>
        {intl.get("hzero.common.components.noticeIcon.null").d("暂无数据")}
        </div>
      ) : (
        <div className='version-list'>
          {
            versionList.map((i: any) => (
              <div style={{ marginBottom: "8px" }}>
                <div className='version-list-item-header'>
                  <span onClick={() => view(i.templateId, i.docId)}>
                    {intl.get("hzero.common.readVersion")}v
                    {i.templateVersion}
                  </span>
                </div>
                <div className="version-list-group">
                  <div className='version-list-item-info'>
                    {i.publishName}
                  </div>
                  <div className='version-list-item-info'>
                    {i.creationDate}
                  </div>
                </div>
                <div className='version-list-item-info' style={{overflow: 'hidden', textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                  <span className='version-label'>{intl.get('hzero.common.model.remark')}</span>
                  <span className='version-value'><Tooltip title={i.remark}>{i.remark}</Tooltip></span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </Spin>
  );
});

export function initUnits(options: { templateId: string }, { unitTypeObj, callback }) {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    style: {
      width: '742px',
    },
    className: styles["unit-choose-modal"],
    children: (
      <ChooseUnit {...options} unitTypeObj={unitTypeObj} callback={callback} />
    ),
    footer: null,
  });
}

const ChooseUnit = observer<{ modal?: any, templateId: string, unitTypeObj: any, callback?: Function }>((props) => {
  const { templateId, unitTypeObj, callback } = props;
  const [treeLoading, setTreeLoading] = useState(true);
  const searchDs = useMemo(() => new DataSet({
    autoCreate: true, fields: [{ name: 'search' }],
  }), []);
  const filterStr = searchDs.current && searchDs.current.get("search");
  const filterReg = new RegExp(filterStr);
  const treeDs = useMemo(() => new DataSet({
    autoQuery: true,
    selection: false,
    checkField: 'initFlag',
    childrenField: "children",
    fields: [
      {
        name: 'initFlag',
        required: true,
        type: FieldType.boolean,
      },
    ],
    events: {
      load: () => {
        setTreeLoading(false);
      },
    },
    transport: {
      read: {
        url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/doc-templates/init-cusz-data/${templateId}`,
        method: 'GET',
      },
    },
  }), []);
  const cacheSearchParent = useMemo(() => {
    const cache = {};
    if (!filterStr) return cache;
    treeDs.records.forEach(record => {
      const path = record.path.slice(0, record.path.length - 1);
      let name; let code;
      switch (record.get("type")) {
        case "stage":
          name = record.get("stageName");
          code = record.get("stageCode");
          break;
        case "page":
          name = record.get("pageName");
          code = record.get("pageCode");
          break;
        case "unit":
          name = record.get("unitName");
          code = record.get("unitCode");
          break;
        default: ;
      }
      const match = filterReg.test(name) || filterReg.test(code);
      if (match) {
        cache[record.id] = 2;
        path.forEach(r => {
          if ((cache[r.id] || 0) < 2) cache[r.id] = 1;
        });
      }
    });
    return cache;
  }, [filterStr]);
  const onCheck = useCallback((checkedKeys) => {
    treeDs.records.forEach(record => {
      const type = record.get("type");
      if (type === "unit" && checkedKeys.includes(String(record.id))) {
        record.set('initFlag', true);
      } else if (type === 'U') {
        record.set('initFlag', false);
      }
    });
  }, []);
  const filter = useCallback((record) => {
    if (!filterStr) return true;
    const path = record.path.slice(0, record.path.length - 1);
    if ((cacheSearchParent[record.id] || 0) > 0) return true;
    if (path.length > 0 && path.some(r => cacheSearchParent[r.id] === 2)) {
      return true;
    }
    return false;
  }, [filterStr]);
  const treeRender = useCallback(({ record }): ReactNode => {
    const { type, unitType } = record.get(['type', 'unitType']);
    let name;
    switch (type) {
      case "stage": name = record.get("stageName"); break;
      case "page": name = record.get("pageName"); break;
      default: name = record.get("unitName");
    }
    switch (type) {
      case 'unit': return (
        <>
          <div className='tree-unit-name customize-treenode-wrapper'>
            <Tag color={unitTypeColorMap[unitType]}>{unitTypeObj[unitType]}</Tag>
            {name}
          </div>
          <div className='tree-unit-code'>{record.get('unitCode')}</div>
        </>
      );
      default: return name;
    }
  }, []);
  const [onSave, onCancel] = useMemo(() => [
    // pro button接受的onClick如果返回promise，会根据promise的状态自动loading
    async function save() {
      const confirm = await Modal.confirm({
        title: intl
          .get('hzero.common.message.confirm.title')
          .d('提示'),
        children: intl
        .get('hpfm.doc.confirm.initUnit')
        .d('使用页面个性化的单元配置覆盖当前单元配置，当前已有配置会丢失，是否确认'),
      });
      if (confirm !== "ok") return;
      const tenantId = getCurrentOrganizationId();
      const submitData: any = {};
      treeDs.records.forEach(r => {
        const { pageUuid, type, unitCode, initFlag } = r.get(["pageUuid", "type", "unitCode", "initFlag"]);
        if (!initFlag) return;
        if (type === "unit") {
          if (!submitData[pageUuid]) submitData[pageUuid] = [];
          submitData[pageUuid].push(unitCode);
        }
      });
      return request(`${HZERO_PLATFORM}/v1/${tenantId}/unit-config/tpl/sync`, {
        method: "POST",
        body: submitData,
        query: { templateId },
      }).then(res => {
        if (getResponse(res)) {
          notification.success(undefined as any);
          // eslint-disable-next-line no-unused-expressions
          callback && callback();
          props.modal.close();
        }
      });
    },
    function cancel() {
      props.modal.close();
    },
  ], []);
  return (
    <Spin spinning={treeLoading}>
      <div className="unit-choose-modal-main">
        <div className="unit-choose-modal-left" style={{ width: "100%" }}>
          <header className="unit-choose-modal-left-header">
            <h3 className="header-title header-title-tenant">{intl.get("hpfm.doc.common.chooseUnit").d('选择单元')}</h3>
            <div className="search-label">{intl.get("hpfm.doc.common.chooseUnit.tip").d("选择模板下需要初始化的单元，导入页面个性化单元下的现有配置")}</div>
            <TextField clearButton dataSet={searchDs} name="search" placeholder={intl.get("hpfm.doc.common.queryByUnitMenu").d('请输入单元编码、单元名称、菜单名称查询')} />
          </header>
          <section className='unit-choose-modal-left-tree'>
            <Tree
              checkable
              showLine={{ showLeafIcon: false }}
              showIcon={false}
              onCheck={onCheck}
              dataSet={treeDs}
              renderer={treeRender as any}
              filter={filter}
            />
          </section>
        </div>
      </div>
      <div className="unit-choose-modal-footer unit-choose-modal-footer-tenant">
        <Button onClick={onSave} color={ButtonColor.primary}>{intl.get('hzero.common.button.save').d("保存")}</Button>
        <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d("取消")}</Button>
      </div>
    </Spin>
  );
});

export function tplVersionListContainer(templateId, templateCode, options = {} as any) {
  const { dispatch, parentThis, domId, allowMaxHeight = 300, id = [] } = options;
  let maxHeight = "300px";
  if (domId && document.querySelector(domId)) {
    const ele = document.querySelector(domId);
    const rect = ele.getBoundingClientRect();
    const remainHeight = document.body.clientHeight - rect.top - 40;
    if (remainHeight < allowMaxHeight) maxHeight = `${remainHeight}px`;
  }
  return (
    <div className={styles["self-module1-style"]} style={{ maxHeight, width: "380px", overflow: "auto" }} >
      <HistoryVersionImpl templateId={templateId} templateCode={templateCode} dispatch={dispatch} parentThis={parentThis} id={id}/>
    </div>
  )
}
