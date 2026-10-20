import React, { ReactNode, useMemo, useCallback, useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import request from 'hzero-front/lib/utils/request';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { observer } from 'mobx-react-lite';
import { DataSet, Tree, Form, NumberField, Output, Switch, TextField } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { useDrop } from 'react-dnd';
import classnames from 'classnames';

// TODO:提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL, uuid } from '@/utils/common';

import ImgIcon from '@/utils/ImgIcon';
import { treeDs } from '@/stores/BusinessObject/OptionListDS';
import MenuTitle from './MenuTitle';
import Field from './Field';

import styles from './index.less';

// const { TreeNode } = Tree;

function getDraggingStyle(isActive: boolean, canDrop: boolean): React.CSSProperties {
  if (isActive) {
    return { backgroundColor: '#E6EBFE', border: '1px dashed #9CB3FC' };
  }
  if (canDrop) {
    return { backgroundColor: 'rgba(230, 235, 254, 0.5)', border: '1px dashed #9CB3FC' };
  }
  return {};
}
export interface IFieldProps {
  businessObjectFieldCode: string;
  businessObjectFieldName: string;
  displayName: string;
  componentType: string;
  tableFieldWidth: number;
  queryFieldFlag: true;
  orderSeq: number;
  queryOrderSeq: number;
}

const SelectFieldsModal = ({ modal, optionFieldDs, businessObjectCode }) => {
  modal.handleOk(() => {
    if (!optionFieldDs.data.length) {
      setDraggingStyle({
        border: '1px solid #d50000',
        backgroundColor: '#fcebeb',
      });
      return false;
    }
  });

  const treeListDs = useMemo(() => new DataSet(treeDs(businessObjectCode)), [businessObjectCode]);
  const [treeSearch, setTreeSearch] = useState('');

  const getFieldsTreeList = (id, parentId) => {
    return new Promise(resolve => {
      request(`${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-options/drill`, {
        method: 'GET',
        query: {
          businessObjectCode: id,
        },
      }).then(res => {
        if (getResponse(res)) {
          resolve(
            res?.businessObjectFields.map(item => ({
              ...item,
              businessObjectCode: item.businessObjectCode,
              businessObjectName: item.businessObjectName,
              // drillFlag: !item.drillFlag,
              drillFlag: true,
              parentId,
              id: uuid(),
            })) || []
          );
        }
      });
    });
  };
  const loop = ({ record }) => ({
    title: (
      <MenuTitle
        currentNodeData={record.toData()}
        treeSearch={treeSearch}
        dataSet={optionFieldDs}
      />
    ),
    isLeaf: record?.get('drillFlag'),
    className: classnames({
      [styles.treeNode]: true,
      [styles['treeNode-switch']]:
        !record?.get('drillFlag') ||
        fieldsData.some(
          ({ businessObjectFieldCode }) =>
            businessObjectFieldCode?.split(':')?.[
              businessObjectFieldCode?.split(':')?.length - 1
            ] === `${record?.get('businessObjectFieldCode')}` // FIXME: === `$\{${record?.get('businessObjectCode').${record?.get('businessObjectFieldCode')}}`
        ),
    }),
  });

  const onLoadTreeData = useCallback(async ({ children, record }) => {
    if (!children) {
      const res: any = await getFieldsTreeList(
        record?.get('masterBusinessObjectCode'),
        record?.get('id')
      );
      treeListDs.appendData(res);
    }
  }, []);

  const getDrillFieldDetail = obj => {
    const treeData: any = treeListDs.toData();
    function mapTree(treeItem, [fieldCode, fieldName]) {
      if (treeItem.parentId) {
        const parentField = treeData.find(item => item.id === treeItem.parentId);
        if (parentField) {
          // const code = `$\{${parentField.businessObjectCode}.${parentField.businessObjectFieldCode}:${fieldCode}}`;
          // const name = `$\{${parentField.businessObjectName}.${parentField.businessObjectFieldName}:${fieldName}}`;
          const code = `${fieldCode}`;
          const name = `${fieldName}`;
          return mapTree(parentField, [code, name]);
        }
      } else {
        return [fieldCode, fieldName];
      }
    }
    return mapTree(obj, [
      // `$\{${obj.businessObjectCode}.${obj.businessObjectFieldCode}}`,
      // `$\{${obj.businessObjectName}.${obj.businessObjectFieldName}}`,
      `${obj.businessObjectFieldCode}`,
      `${obj.businessObjectFieldName}`,
    ]);
  };
  const TextTooltip = ({ value = '' }) => {
    const matchText = ((value.match(/\${[^{}]*}/g) || [])[0] || "").replace(/\${|}$/g, "") || value;
    const [visible, setVisible] = useState(false);
    return (
      <Tooltip visible={visible} title={matchText} arrowPointAtCenter>
        <span
          style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
          onMouseEnter={e => {
            if ((e.target as any).offsetWidth > (e.target as any).parentNode.offsetWidth) {
              setVisible(true);
            }
          }}
          onMouseLeave={() => setVisible(false)}
        >
          {matchText}
        </span>
      </Tooltip>
    );
  };

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'field',
    drop: () => ({
      callback: obj => {
        optionFieldDs.create({
          ...obj,
          id: undefined,
          parentId: undefined,
          businessObjectFieldCode: getDrillFieldDetail(obj)[0],
          businessObjectFieldName: getDrillFieldDetail(obj)[1],
          displayName: '',
          tableFieldWidth: 200,
          orderSeq: fieldsData?.length + 1 || 1,
        });
      },
    }),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive: boolean = canDrop && isOver; // 在元素上，并且在拖动状态

  const [draggingStyle, setDraggingStyle] = React.useState({});
  React.useEffect(() => {
    setDraggingStyle(getDraggingStyle(isActive, canDrop));
  }, [isActive, canDrop]);

  const [fieldsData, queryFieldsData] = useMemo(
    () => [
      (optionFieldDs.toData() as IFieldProps[]).sort((a, b) => a?.orderSeq - b?.orderSeq),
      (optionFieldDs.toData() as IFieldProps[])
        .filter(({ queryFieldFlag }) => queryFieldFlag)
        .sort((a, b) => a?.queryOrderSeq - b?.queryOrderSeq),
    ],
    [optionFieldDs.toData()]
  );

  const handleChangeQueryX = val => {
    if (optionFieldDs.current) {
      if (val) {
        const maxQueryOrderSeq =
          queryFieldsData?.[Math.max(queryFieldsData?.length - 1, 0)]?.queryOrderSeq;
        optionFieldDs.current.set('queryOrderSeq', maxQueryOrderSeq + 1 || 1);
      } else {
        optionFieldDs.current.set('queryOrderSeq', null);
      }
      optionFieldDs.current.set('queryFieldFlag', val);
    }
  };

  const moveField = (fieldType, dragIndex, dropIndex) => {
    const dragField = optionFieldDs.find(record => record.get(fieldType) === dragIndex);
    const dropField = optionFieldDs.find(record => record.get(fieldType) === dropIndex);
    dragField.set(fieldType, dropIndex);
    dropField.set(fieldType, dragIndex);
  };

  const handleOnDropField = (dragData, dropData, dir, fieldType) => {
    const dragIndex = dragData?.[fieldType];
    const dropIndex = dropData?.[fieldType];
    const diffNum = dragIndex - (dir === 'right' ? dropIndex : dropIndex - 1);
    if (diffNum > 0) {
      for (let i = 0; i < diffNum - 1; i++) {
        moveField(fieldType, dragIndex - i, dragIndex - i - 1);
      }
    } else {
      for (let i = 0; i > diffNum; i--) {
        moveField(fieldType, dragIndex - i, dragIndex - i + 1);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Card
        title={intl.get('hmde.bo.option.field.select').d('字段')}
        icon="option-fields.svg"
        description={
          <p className={styles['card-description']} style={{ marginTop: 8 }}>
            {intl
              .get('hmde.bo.option.field.select.description')
              .d('请把此处字段拖拽至右侧[列表]区域')}
          </p>
        }
        style={{ gridRow: 'span 2' }}
      >
        <TextField
          className={styles['treeList-search']}
          onInput={e => setTreeSearch((e?.target as any)?.value || '')}
          prefix={<ImgIcon name="search@v4.0.svg" size={14} />}
        />
        <div style={{ height: 'calc(100% - 44px)', overflow: 'auto' }}>
          <Tree
            dataSet={treeListDs}
            loadData={onLoadTreeData}
            treeNodeRenderer={({ record }) => loop({ record })}
            blockNode
          />
        </div>
      </Card>
      <Card
        title={intl.get('hmde.bo.option.displayField').d('显示字段')}
        icon="option-displayFields.svg"
        description={
          <p className={styles['card-description']} style={{ marginTop: 8 }}>
            {intl
              .get('hmde.bo.option.displayField.description')
              .d(
                '查询域暂不支持字段拖拽，需配置已拖入列表的字段，字段属性为查询域字段，即可显示在查询域。'
              )}
          </p>
        }
      >
        <div className={styles['displayFields-container']}>
          <Card title={intl.get('hmde.bo.option.query').d('查询域')}>
            <div className={styles['fields-list']}>
              {queryFieldsData.map((data, index) => {
                const curRecord = optionFieldDs.find(
                  record => record?.get('businessObjectFieldCode') === data.businessObjectFieldCode
                );
                return (
                  <Field
                    dndType="queryFields"
                    data={data}
                    onDrop={(dragData, dropData, dir) =>
                      handleOnDropField(dragData, dropData, dir, 'queryOrderSeq')
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <div className={styles.field}>
                      <div className={styles['field-index']}>{index + 1}</div>
                      <div
                        className={classnames({
                          [styles['field-tag']]: true,
                        })}
                      >
                        {data?.displayName ||
                          (data?.businessObjectFieldName
                            ?.match(new RegExp('[\\w\\u4e00-\\u9fa5]*', 'gm'))
                            ?.filter(Boolean)
                            ?.reverse?.()?.[0] ??
                            data?.businessObjectFieldName)}
                      </div>
                      <ImgIcon
                        className={styles['field-delete']}
                        name="failed@3x.png"
                        size={12}
                        alt="delete"
                        onClick={e => {
                          if (e.stopPropagation) e.stopPropagation();
                          if (curRecord) curRecord.set('queryFieldFlag', false);
                        }}
                      />
                    </div>
                  </Field>
                );
              })}
            </div>
          </Card>
          <Card
            title={intl.get('hmde.bo.option.fieldList').d('列表')}
            _ref={drop}
            style={draggingStyle}
          >
            <div className={styles['fields-list']}>
              {fieldsData.map((data, index) => {
                const curRecord = optionFieldDs.find(
                  record => record?.get('businessObjectFieldCode') === data.businessObjectFieldCode
                );
                return (
                  <Field
                    dndType="columns"
                    data={data}
                    onDrop={(dragData, dropData, dir) =>
                      handleOnDropField(dragData, dropData, dir, 'orderSeq')
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <div
                      className={styles.field}
                      onClick={() => optionFieldDs.locate(curRecord?.index || 0)}
                    >
                      <div className={styles['field-index']}>{index + 1}</div>
                      <div
                        className={classnames({
                          [styles['field-tag']]: true,
                          [styles['field-tag-active']]: curRecord?.isCurrent,
                        })}
                      >
                        {data?.displayName ||
                          (data?.businessObjectFieldName
                            ?.match(new RegExp('[\\w\\u4e00-\\u9fa5]*', 'gm'))
                            ?.filter(Boolean)
                            ?.reverse?.()?.[0] ??
                            data?.businessObjectFieldName)}
                      </div>
                      <ImgIcon
                        className={styles['field-delete']}
                        name="failed@3x.png"
                        size={12}
                        alt="delete"
                        onClick={e => {
                          if (e.stopPropagation) e.stopPropagation();
                          if (curRecord) optionFieldDs.delete(curRecord, false);
                        }}
                      />
                    </div>
                  </Field>
                );
              })}
            </div>
            <div className={styles['content-center']}>
              {canDrop ? (
                <a>{intl.get('hmde.bo.option.fieldList.canDrop').d('可拖拽区域')}</a>
              ) : null}
              {!canDrop && fieldsData.length === 0
                ? intl.get('hmde.bo.option.fieldList.description').d('暂无内容，请先配置列表字段。')
                : null}
            </div>
          </Card>
        </div>
      </Card>
      <Card
        title={intl.get('hmde.bo.field.props').d('字段属性')}
        icon="option-field-props.svg"
        description={
          <p
            className={styles['card-description']}
            style={{ display: 'inline-block', marginLeft: 12 }}
          >
            {intl
              .get('hmde.bo.option.fieldProps.description')
              .d('修改字段显示名称后，列表、查询域均会同步更新。')}
          </p>
        }
      >
        {optionFieldDs?.current ? (
          <Form record={optionFieldDs.current} columns={2} useColon={false}>
            <Output
              name="businessObjectFieldCode"
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: 12,
              }}
              renderer={({ value }) => <TextTooltip value={value} />}
            />
            <Output
              name="businessObjectFieldName"
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: 12,
              }}
              renderer={({ value }) => <TextTooltip value={value} />}
            />
            <TextField name="displayName" />
            <Output name="componentType" />
            <NumberField name="tableFieldWidth" />
            <Switch name="queryFieldFlag" onChange={handleChangeQueryX} />
          </Form>
        ) : (
          <div className={styles['content-center']}>
            {intl
              .get('hmde.bo.option.fieldProps.none')
              .d('暂无内容，选中列表中的字段，即可配置 [字段属性]')}
          </div>
        )}
      </Card>
    </div>
  );
};

interface ICardProps {
  title: string;
  icon?: string; // ImgIcon name
  description?: ReactNode;
  style?: React.CSSProperties;
  children: ReactNode;
  _ref?: any;
}
const Card = ({ icon, title, description, style, children, _ref }: ICardProps) => (
  <div className={styles['card-container']} style={style} ref={_ref}>
    <div className={styles['card-title']}>
      {icon && <ImgIcon name={icon} size={14} style={{ marginRight: 4 }} />}
      {title}
      {description}
    </div>
    <div className={styles['card-content']}>{children}</div>
  </div>
);

export default formatterCollections({ code: ['hmde.bo'] })(observer(SelectFieldsModal));
