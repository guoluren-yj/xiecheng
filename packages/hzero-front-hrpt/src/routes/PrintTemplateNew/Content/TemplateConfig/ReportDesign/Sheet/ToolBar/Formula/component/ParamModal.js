/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState, useImperativeHandle } from 'react';
import {
  DataSet,
  Tree,
  Tabs,
  TextArea,
} from 'choerodon-ui/pro';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { transformTreeToArr } from 'hzero-front/lib/utils/utils';
import styles from '../index.less';
import { getFormulaList, getSpecialValueList} from '../../../../utils/constant';
import { getFieldSvg } from '../../../../utils/constant';
import { filterChildren, filterParentAndSelf } from '../../../../utils/utils';

const { TabPane } = Tabs;

const treeNodeRenderer = ({ record }) => {
  const isLeaf = !!record.get('parentCode');
  if (isLeaf) {
    return (
      <div className={styles['tree-leaf-node']}>
        <div>{record.get('text')}</div>
        <div className="func-desc">
          <div className="desc-content">{record.get('desc')}<span className="mask-ellipsis" /></div>
          <div className='block-mask'>...</div>
        </div>
      </div>
    );
  } else {
    return record.get('text');
  }
};

function ParamModal({ fieldTreeDs, cycleBlock, param, onSubmit, sheetRef, isInFixedArea, parentFunc, modalRef, modal }) {
  const [activeTabKey, setActiveTabKey] = useState('formField');
  const [paramValue, setParamValue] = useState();
  const specialValues = useMemo(() => getSpecialValueList(), []);
  const paramInitialValue = useMemo(() => param && param.value, [param]);
  const onlyParamType = useMemo(() => param && param.type, [param]);
  const treeDs = useMemo(() => {
    const allFields = fieldTreeDs.toData();
    let data = [];
    if (cycleBlock) {
      data = param.onlyLineField
        ? filterChildren(allFields, cycleBlock, {
          fieldFilter: param.fieldFilter, sheetRef, allLineField: param.onlyLineField, onlyChildLineField: param.onlyChildLineField
        })
        : filterParentAndSelf(allFields, cycleBlock);
    }
    return new DataSet({
      paging: false,
      idField: 'id',
      parentField: 'parentId',
      selection: 'single',
      fields: [
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldName').d('字段名称'),
          name: 'name',
        },
      ],
      data,
      events: {
        load: ({ dataSet }) => {
          dataSet.forEach((record) => {
            record.isSelected = paramInitialValue && record.get('code') === paramInitialValue.value;
            record.selectable = record.get('type') === 'field';
          });
        },
      },
    });
  }, [fieldTreeDs, cycleBlock, param.onlyLineField, param.onlyChildLineField]);
  const funTreeDs = useMemo(() => {
    return new DataSet({
      selection: 'single',
      expandField: 'expand',
      idField: 'code',
      parentField: 'parentCode',
      fields: [
        { name: 'code' },
        { name: 'text' },
        { name: 'parentCode' },
        { name: 'expand', type: 'boolean' },
      ],
      data: parentFunc.supportNestFunc && parentFunc.supportNestFunc.length ? transformTreeToArr(
        getFormulaList(),
        'code',
        'children',
        'code',
        'parentCode'
      ).map((i) => ({ ...i, key: i.code })) : [],
    });
  }, []);
  useEffect(() => {
    if (paramInitialValue) {
      setParamValue(paramInitialValue);
      if (!param.onlyLineField) {
        setActiveTabKey(paramInitialValue.type);
      }
    }

    if (param && param.child) {
      setActiveTabKey("FUN");
    }
    funTreeDs.find((record) => {
      if (['common', 'text', 'money', 'dateAndTime', 'number'].includes(record.get('code'))) {
        record.set('expand', true);
      }
      if (param && param.code === record.get('code')) {
        record.isSelected = true;
      }
    });
  }, [param, paramInitialValue, funTreeDs]);

  useEffect(() => {
    if (param.onlyLineField) {
      if (treeDs.selected[0]) {
        const field = treeDs.selected[0].toData();
        setParamValue({
          ...field,
          value: field.code,
          text: `#{${field.name}}`,
          type: 'formField',
        });
      } else {
        setParamValue(null);
      }
    }
  }, [param.onlyLineField, treeDs.selected]);

  const submit = useCallback(() => {
    if (!paramValue) return false;
    onSubmit(paramValue);
  }, [paramValue, onSubmit, modal]);
  useImperativeHandle(modalRef, () => {
    return {
      submit,
    };
  }, [modalRef, submit]);
  const handleChangeTab = useCallback((tabKey) => {
    setActiveTabKey(tabKey);
    setParamValue(undefined);
  }, []);

  const handleSelectFormField = useCallback((_, { node, selected }) => {
    if (!selected) {
      setParamValue(null);
      return;
    }
    const fieldRecord = node.record;
    const field = fieldRecord.toData();
    const newParamValue = {
      ...field,
      value: field.code,
      text: `#{${field.name}}`,
      type: 'formField',
    };
    setParamValue(newParamValue);
    onSubmit(newParamValue);
    modal.close();
  }, [onSubmit, modal]);

  const handleChangeFixValue = useCallback((value) => {
    setParamValue({
      value,
      text: value,
      type: 'fixedValue',
    });
  }, []);


  const handleSelectSpecialValue = useCallback((selectedValue) => {
    const { value, title } = selectedValue;
    const newParamValue = {
      value,
      text: `#{${title}}`,
      type: 'specialValue',
    };
    setParamValue(newParamValue);
  });

  const nodeRenderer = useCallback(({ record }) => {
    const { name, parentName, type, color, dataType } = record.get([
      'id',
      'code',
      'name',
      'parentId',
      'parentCode',
      'parentName',
      'type',
      'color',
      'dataType',
    ]);
    if (type !== 'field') {
      return (
        <div className={styles['field-tree-node']}>
          <span>{getFieldSvg('header', color)}</span>
          <span className={styles['field-tree-node-content']}>{name}</span>
        </div>
      );
    } else {
      return (
        <div className={styles['field-tree-node']}>
          <span>{getFieldSvg(dataType, color)}</span>
          <span className={styles['field-tree-node-content']} title={name}>
            {parentName}.{name}
          </span>
        </div>
      );
    }
  }, []);

  const renderFormField = useCallback(() => {
    return <Tree defaultExpandAll dataSet={treeDs} showIcon={false} renderer={nodeRenderer} onSelect={handleSelectFormField} />;
  }, [treeDs, nodeRenderer]);

  const renderFixedValue = useCallback(() => {
    return (
      <div>
        <div className={styles['fixed-value-textarea']}>
          <TextArea
            value={paramValue && paramValue.type === 'fixedValue' ? paramValue.value : ''}
            onChange={handleChangeFixValue}
            placeholder={intl.get('hrpt.reportDesign.view.title.pleaseFixValue').d('请输入固定值')}
          />
        </div>
      </div>
    );
  }, [paramValue, handleChangeFixValue]);

  const renderSpecialValue = useCallback(() => {
    return (
      <div className={styles['special-value-list']}>
        {specialValues.map((v) => (
          <div
            className={classnames(styles['special-value-list-item'], {
              [styles['special-value-list-item-active']]:
                !!paramValue && paramValue.type === 'specialValue' && paramValue.value === v.value,
            })}
            key={v.name}
            onClick={() => handleSelectSpecialValue(v)}
          >
            {v.title}
          </div>
        ))}
      </div>
    );
  }, [specialValues, paramValue, handleSelectSpecialValue]);
  const handleSelect = useCallback(
    (_, { node, selected }) => {
      if (!selected) {
        setParamValue(null);
        return;
      }
      const { record } = node;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {__dirty, ...funcData} = record.toData();
      const newParamValue = {
        ...funcData,
        type: "FUN",
      };
      setParamValue(newParamValue);
    },
    [param]
  );

  const onTreeNode = useCallback(({ record }) => {
    const { supportNestFunc } = parentFunc;
    const code = record.get('code');
    const disabled = !['common', 'text', 'money', 'dateAndTime', 'number'].includes(code) && (!supportNestFunc || !supportNestFunc.includes(code));
    return {
      selectable: !disabled,
      disabled: disabled,
    };
  }, [funTreeDs, parentFunc]);
  const children = [];
  const isDynamic = onlyParamType === "dynamic";
  if (isDynamic || !onlyParamType || onlyParamType === 'formField') {
    children.push({
      key: "formField",
      tab: intl.get('hrpt.reportDesign.view.title.field').d('模板字段'),
      node: renderFormField(),
    });
  }
  // onlyParamType来自于type值，如果onlyLineField为true，则type比定位formField，所以原逻辑简写，仅根据onlyParamType确定是否可配置该类型字段
  if (isDynamic || !onlyParamType || onlyParamType === 'fixedValue') {
    children.push({
      key: "fixedValue",
      tab: intl.get('hrpt.reportDesign.view.title.fixedValue').d('固定值'),
      node: renderFixedValue(),
    });
  }
  if (isDynamic || !onlyParamType || onlyParamType === 'specialValue') {
    children.push({
      key: "specialValue",
      tab: intl.get('hrpt.reportDesign.view.title.specialValue').d('特殊字符'),
      node: renderSpecialValue(),
    });
  }

  if (parentFunc.supportNestFunc && parentFunc.supportNestFunc.length) {
    children.push({
      key: "FUN",
      tab: intl.get('hrpt.reportDesign.view.title.nestFun').d('函数'),
      node: (
        <Tree
          showIcon
          className={styles["tree-common"]}
          showLine={{ showLeafIcon: false }}
          dataSet={funTreeDs}
          renderer={treeNodeRenderer}
          onSelect={handleSelect}
          onTreeNode={onTreeNode}
          filter={(record) => isInFixedArea || record.get("code") !== "PAGE_TOTAL"}
        />
      ),
    });
  }
  if (children.length === 1) return children[0].node;
  return (
    <Tabs tabPosition="left" activeKey={activeTabKey} onChange={handleChangeTab}>
      {children.map((item) => (
        <TabPane key={item.key} tab={item.tab}>
          {item.node}
        </TabPane>
      ))}
    </Tabs>
  );
}

export default observer(ParamModal);
