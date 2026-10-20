import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { DataSet, Form, IntlField, Modal, NumberField, Spin, Switch, TextField, Tree, Button, Output, Icon, CheckBox } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import { runInAction } from "mobx";
import { uniqWith } from "lodash";
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import request from "hzero-front/lib/utils/request";
import notification from 'hzero-front/lib/utils/notification';
import { Tag } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import styles from "../../../UnifyEntry/style.less";
import { pageDs, stageDs } from '../dataSets';
import { unitTypeColorMap } from '../../../../utils/constConfig.js';

export function stageModal(dsData: any = [], otherData: any = {}, callback) {
  const dataSet = new DataSet(stageDs(dsData, intl));
  Modal.open({
    title: intl.get("hpfm.doc.common.docStage").d('阶段配置'),
    key: Modal.key(),
    drawer: true,
    style: {
      width: '380px',
    },
    children: (
      <Form dataSet={dataSet} labelLayout={LabelLayout.float}>
        <TextField name="stageCode" />
        <IntlField name="stageName" />
        <NumberField name="orderSeq" />
        <Switch name="enabledFlag" />
      </Form>
    ),
    onOk: async () => {
      if (!await dataSet.validate()) return false;
      const createSuccess = await request(`${HZERO_PLATFORM}/v1/doc-stages`, {
        method: "POST",
        body: {
          ...dataSet.current!.toJSONData(),
          docId: otherData.docId,
          tenantId: getCurrentOrganizationId(),
        },
      }).then(res => {
        if (getResponse(res)) {
          notification.success(undefined as any);
          return true;
        }
      });
      if (!createSuccess) return false;
      // eslint-disable-next-line no-unused-expressions
      callback && callback();
    },
  });
}

export function pageModal(dsData: any = [], otherData: any = {}, callback?) {
  const dataSet = new DataSet(pageDs(dsData, intl));
  Modal.open({
    title: intl.get("hpfm.doc.common.docPage").d('页面配置'),
    key: Modal.key(),
    drawer: true,
    style: {
      width: '380px',
    },
    children: (
      <Form dataSet={dataSet} labelLayout={LabelLayout.float}>
        <TextField name="pageCode" />
        <IntlField name="pageName" />
        <NumberField name="orderSeq" />
        <Switch name="enabledFlag" />
      </Form>
    ),
    onOk: async () => {
      if (!await dataSet.validate()) return false;
      const createSuccess = await request(`${HZERO_PLATFORM}/v1/doc-pages`, {
        method: "POST",
        body: {
          ...dataSet.current!.toJSONData(),
          docId: otherData.docId,
          stageId: otherData.stageId,
          tenantId: getCurrentOrganizationId(),
        },
      }).then(res => {
        if (getResponse(res)) {
          notification.success(undefined as any);
          return true;
        }
      });
      if (!createSuccess) return false;
      // eslint-disable-next-line no-unused-expressions
      callback && callback();
    },
  });
}
export function openFieldDetail(record, isSearchBarType) {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    style: {
      width: '380px',
    },
    maskClosable: true,
    className: styles["self-module1-style"],
    closable: true,
    title: intl.get('hpfm.doc.common.fieldConfig').d('字段配置'),
    children: (
      <Form record={record} labelLayout={LabelLayout.vertical} columns={1} className="c7n-pro-vertical-form-display">
        <Output name="field.modelName" />
        <Output name="fieldCode" />
        <Output name="field.fieldCategoryMeaning" />
        <Output name="fieldName" />
        <Output name="helpMessage" />
        <Output name="labelWrapperCol" />
        <Output name="bindField" />
        <Output name="renderOptions" />
        <Output name="widget.fieldWidget" />
        <Output name="showFieldFlag" hidden={isSearchBarType} />
        <Output name="uiFeature" hidden={isSearchBarType} />
        <Output name='sortedFlag' hidden={!isSearchBarType} />
        <Output name='widget.multipleFlag' hidden={!isSearchBarType} />
        <Output name='mergeFlag' hidden={!isSearchBarType} />
        <Output name='fieldVisible' hidden={!isSearchBarType} />
      </Form>
    ),
    footer: (_ok, _cancel, modal) => (
      <Button color={ButtonColor.primary} onClick={()=>modal.close()}>
        {intl.get("hzero.common.button.close").d("关闭")}
      </Button>
    ),
  });
}

export function chooseUnit(options: { docId?: string, stageId?: string, pageId?: string }, { unitTypeObj, callback }) {
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

const ChooseUnit = observer<{ modal?: any, docId?: string, stageId?: string, pageId?: string, unitTypeObj: any, callback?: Function }>((props) => {
  const { docId, stageId, pageId, unitTypeObj, callback } = props;
  const [treeLoading, setTreeLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [initSelectedData, setInitSelectedData] = useState([] as any[]);
  const [selectedData, setSelectedData] = useState([] as any[]);
  const [treeSelectedkeys, setTreeSelectedkeys] = useState([] as any[]);
  const searchDs = useMemo(() => new DataSet({
    autoCreate: true, fields: [{ name: 'search' }],
  }), []);
  const filterStr = searchDs.current && searchDs.current.get("search");
  const filterReg = new RegExp(filterStr);

  const treeDs = useMemo(() => new DataSet({
    autoQuery: true,
    selection: false,
    queryParameter: { pageId },
    childrenField: 'children',
    checkField: 'checkedFlag',
    fields: [
      {
        name: 'checkedFlag',
        label: intl.get('hpfm.doc.common.enabledFlag').d('启用'),
        required: true,
        type: FieldType.boolean,
        transformRequest(value) {
          // eslint-disable-next-line no-nested-ternary
          return value === undefined ? value : value ? 1 : 0;
        },
        transformResponse(value) {
          return value === undefined ? undefined : !!value;
        },
      },
    ],
    events: {
      query: () => {
        setTreeLoading(true);
      },
      load: ({ dataSet }) => {
        let tempList: any[] = [];
        const tempTreeSelectedKeys: number[] = [];
        dataSet.records.forEach(record => {
          if (record.get("type") === "U" && record.get("checkedFlag")) {
            tempList.push(record.toData());
            tempTreeSelectedKeys.push(record.id);
          }
        });
        tempList = uniqWith(tempList, (a, b) => a.code === b.code);
        setInitSelectedData(tempList);
        setTreeSelectedkeys(tempTreeSelectedKeys);
        setSelectedData(tempList);
        setTreeLoading(false);
      },
    },
    transport: {
      read: {
        url: `${HZERO_PLATFORM}/v1/doc-units/all-unit-tree`,
        method: 'GET',
      },
    },
  }), []);
  const cacheSearchParent = useMemo(() => {
    const cache = {};
    if (!filterStr) return cache;
    treeDs.records.forEach(record => {
      const path = record.path.slice(0, record.path.length - 1);
      const match = filterReg.test(record.get("name")) || filterReg.test(record.get("code"));
      if (match) {
        cache[record.id] = 2;
        path.forEach(r => {
          if ((cache[r.id] || 0) < 2) cache[r.id] = 1;
        });
      }
    });
    return cache;
  }, [filterStr]);
  const onCheck = useCallback((checkedKeys, event, oldCheckedKeys) => {
    const removedKeys: string[] = [];
    const addedKeys: string[] = [];

    const removedUnitCodes: string[] = [];
    const addedUnitCodes: string[] = [];
    const tempList: any[] = [];
    const newTreeSelectedKeys: number[] = [];
    if (event.checked) {
      checkedKeys.forEach(k => {
        if(!oldCheckedKeys.includes(k)) addedKeys.push(k);
      });
    } else {
      oldCheckedKeys.forEach(k => {
        if(!checkedKeys.includes(k)) removedKeys.push(k);
      });
    }
    treeDs.records.forEach(record => {
      if (addedKeys.includes(String(record.id))) {
        addedUnitCodes.push(record.get("code"));
      }
      if (removedKeys.includes(String(record.id))) {
        removedUnitCodes.push(record.get("code"));
      }
    });
    runInAction(() => {
      treeDs.records.forEach(record => {
        const type = record.get("type");
        const code = record.get("code");
        const editedFlag = record.get("editedFlag");
        const checkedFlag = record.get("checkedFlag");
        if (type === "U"){
          if (addedUnitCodes.includes(code)) {
            tempList.push(record.toJSONData());
            newTreeSelectedKeys.push(record.id);
            record.set('checkedFlag', true);
          } else if (editedFlag !== 0 && removedUnitCodes.includes(code)) {
            // 只有可编辑的项目可以被移除
            record.set('checkedFlag', false);
          } else if (checkedFlag) {
            tempList.push(record.toJSONData());
            newTreeSelectedKeys.push(record.id);
          }
        }
      });
    });
    setSelectedData(uniqWith(tempList, (a, b) => a.code === b.code));
    setTreeSelectedkeys(newTreeSelectedKeys);
  }, [treeSelectedkeys]);
  const treeRender = useCallback(({ record }): ReactNode => {
    const type = record.get('type');
    const unitType = record.get('unitType');
    switch (type) {
      case 'U': return (
        <>
          <div className='tree-unit-name'>
            <Tag color={unitTypeColorMap[unitType]}>{unitTypeObj[unitType]}</Tag>
            {record.get('name')}
          </div>
          <div className='tree-unit-code'>{record.get('code')}</div>
        </>
      );
      default: return record.get('name');
    }
  }, []);
  const treeNodeRenderer = useCallback(({ record }) => {
    const type = record.get('type');
    const children = record.get("children");
    const editedFlag = record.get('editedFlag');
    return { disabled: editedFlag === 0, checkable: type === "U" || ["M", "G"].includes(type) && !!children && children.length > 0 };
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
  const removeSelected = useCallback((record) => {
    const treeRecords = treeDs.filter(r => r.get("code") === record.code);
    if (treeRecords && treeRecords.length) {
      treeRecords.forEach(treeRecord => {
        treeRecord.set("checkedFlag", false);
      });
    }
    setSelectedData(selectedData.filter(r => r.code !== record.code));
  }, [selectedData]);
  const [onSave, onCancel] = useMemo(() => [
    function save() {
      setSaveLoading(true);
      const selectedKeys = selectedData.map(r => r.code);
      const initSelectedKeys = initSelectedData.map(r => r.code);
      const addRecords: any[] = [];
      const tenantId = getCurrentOrganizationId();
      selectedData.forEach(r => {
        if (!initSelectedKeys.includes(r.code)) {
          addRecords.push({
            id: r.docUnitId,
            checkedFlag: r.checkedFlag,
            enableFlag: r.docUnitId === undefined ? 1 : r.enableFlag,
            unitName: r.name,
            unitType: r.unitType,
            unitCode: r.code, unitId: r.id, unitGroupId: r.parentId,
            docId, stageId, pageId, tenantId,
          });
        }
      });
      const submitData = initSelectedData.map(r => selectedKeys.includes(r.code) ? {
        id: r.docUnitId,
        checkedFlag: r.checkedFlag,
        enableFlag: r.docUnitId === undefined ? 1 : r.enableFlag,
        unitName: r.name,
        unitType: r.unitType,
        unitCode: r.code, unitId: r.id, unitGroupId: r.parentId,
        docId, stageId, pageId, tenantId,
      } : {
        id: r.docUnitId,
        checkedFlag: 0,
        enableFlag: r.docUnitId === undefined ? 1 : r.enableFlag,
        unitName: r.name,
        unitType: r.unitType,
        unitCode: r.code, unitId: r.id, unitGroupId: r.parentId,
        docId, stageId, pageId, tenantId,
      }).concat(addRecords);
      request(`${HZERO_PLATFORM}/v1/doc-units`, {
        method: "POST",
        body: submitData,
      }).then(res => {
        if (getResponse(res)) {
          notification.success(undefined as any);
          // eslint-disable-next-line no-unused-expressions
          callback && callback();
          props.modal.close();
        }
      }).finally(() => {
        setSaveLoading(false);
      });
    },
    function cancel() {
      props.modal.close();
    },
  ], [selectedData, initSelectedData]);
  return (
    <Spin spinning={treeLoading}>
      <div className="unit-choose-modal-main">
        <div className="unit-choose-modal-left">
          <header className="unit-choose-modal-left-header">
            <h3 className="header-title">{intl.get("hpfm.doc.common.chooseUnit").d('选择单元')}</h3>
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
              treeNodeRenderer={treeNodeRenderer}
              filter={filter}
            />
          </section>
        </div>
        <div className="unit-choose-modal-right">
          <header className="unit-choose-modal-right-header">
            {intl.get("hzero.common.components.list.select").d('已选择')}
            <span className="unit-choose-modal-right-select-num">{selectedData.length}</span>
            {intl.get("hzero.common.components.list.item").d('项')}
          </header>
          <section className='unit-choose-modal-right-content'>
            {
              selectedData.map(record => {
                return (
                  <div className="unit-selected-item">
                    <header className="unit-selected-name"><Tag color={unitTypeColorMap[record.unitType]}>{unitTypeObj[record.unitType]}</Tag>{record.name}</header>
                    <div className="unit-selected-code">{record.code}</div>
                    {record.editedFlag !== 0 && (<Icon className="unit-selected-close" onClick={() => removeSelected(record)} type="cancel" />)}
                  </div>
                );
              })
            }
          </section>
        </div>
      </div>
      <div className="unit-choose-modal-footer">
        <Button loading={saveLoading} onClick={onSave} color={ButtonColor.primary}>{intl.get('hzero.common.button.save').d("保存")}</Button>
        <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d("取消")}</Button>
      </div>
    </Spin>
  );
});