/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/order */
import React, { FC, useEffect } from 'react';
import { DataSet, Form, Select, TextField, TextArea, Table, SelectBox } from 'choerodon-ui/pro';
import { Steps, Tooltip } from 'choerodon-ui'; // notification
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import Lov from '@/components/LowcodeLov';
import { observer, Observer } from 'mobx-react-lite';
import { searchMatcher, capitalToHump } from '@/utils/common';
import { getFieldValueType, isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';
import { modelDataTypeList } from '@/routes/Modeler/ModelDesigner/utils/config';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import keyIcon from '@/assets/icon/key@3x.png';
import MoveButton from '@/routes/Modeler/component/MoveButton';

import styles from './createModel.less';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import uuidv4hyphenless from '@/utils/uuidv4hyphenless';

const { Step } = Steps;
const { Column } = Table;
const { Option } = Select;
const whoNameList = [
  'LAST_UPDATE_DATE',
  'LAST_UPDATED_BY',
  'CREATION_DATE',
  'CREATED_BY',
  'OBJECT_VERSION_NUMBER',
];

function iconRenderer({ record, text }: { record: Record; text: string }): React.ReactElement[] {
  return [
    record.get('primaryFlag') === 1 ? (
      <Tooltip title="主键">
        <img
          key="key"
          src={keyIcon}
          style={{
            width: '14px',
            visibility: 'visible',
            verticalAlign: 'sub',
            marginRight: '8px',
          }}
          alt="icon"
        />
      </Tooltip>
    ) : (
      <></>
    ),
    <span key="text">
      {record.get('requiredFlag') === 1 && (
        <Tooltip title="必输">
          <i
            style={{
              color: 'red',
              fontStyle: 'normal',
              marginRight: '4px',
              fontSize: '16px',
              verticalAlign: 'bottom',
            }}
          >
            *
          </i>
        </Tooltip>
      )}
      {text}
    </span>,
  ];
}

/**
 * 第一步 确认模型基本信息
 */
const AddBaseInfo = (args) => {
  const { editModelDataSet, resourceUponRoleHierarchy, currentNodeData, editor } = args;
  const disabledFlag: boolean = !!currentNodeData;
  const editModelDataSetData = editModelDataSet.toData();
  return (
    <div className={styles['add-base-info']}>
      <Form dataSet={editModelDataSet}>
        {/* {currentNodeData && (
          <Select searchable name="dataSourceType" disabled={disabledFlag}>
            <Option value="TABLE">数据表</Option>
            <Option value="API">API</Option>
          </Select>
        )} */}
        <Lov
          name="refTable"
          modalProps={{ style: { width: 800 } }}
          noCache
          disabled={disabledFlag}
        />
        <Select
          name="type"
          disabled={resourceUponRoleHierarchy === 'tenant' || isTenantRoleLevel()}
        >
          {!isTenantRoleLevel() && resourceUponRoleHierarchy === 'platform' && (
            <Option value="PLATFORM_SHARED">平台共享模型</Option>
          )}
          {!isTenantRoleLevel() && resourceUponRoleHierarchy === 'platform' && (
            <Option value="PLATFORM">平台自定义模型</Option>
          )}
          {(resourceUponRoleHierarchy === 'tenant' || isTenantRoleLevel()) && (
            <Option value="TENANT">租户自定义模型</Option>
          )}
        </Select>
        {/* {currentNodeData && <TextField name="extendsParentName" disabled />} */}
        {editModelDataSetData[0].extendsParentName && (
          <TextField name="extendsParentName" disabled />
        )}
        <TextField name="code" />
        <TextField name="name" />
        <TextArea name="description" />
        {editor ? (
          <SelectBox name="assignPattern">
            <Option value="ALLOW_LIST">白名单模式</Option>
            <Option value="BLOCK_LIST">黑名单模式</Option>
          </SelectBox>
        ) : null}
      </Form>
    </div>
  );
};

/**
 * 第二步 添加模型字段
 */
interface IAddField {
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
  resourceUponRoleHierarchy: string;
}
type IAddFieldInfo = (props: IAddField) => React.ReactElement;
const AddFieldInfo: IAddFieldInfo = ({
  baseTableFieldDataSet,
  dataModelFieldDataSet,
  refDataSourceType,
  resourceUponRoleHierarchy,
}) => (
  <div style={{ marginTop: '20px' }}>
    <div className={styles.createModelFieldContain}>
      <div className={styles.baseTableField}>
        <Table
          dataSet={baseTableFieldDataSet}
          header="基础表"
          rowHeight={26}
          className={globalStyles['table-style']}
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="name"
            renderer={iconRenderer as Renderer}
          />
          <Column tooltip={TableColumnTooltip.overflow} name="description" />
          {resourceUponRoleHierarchy === 'platform' && (
            <Column tooltip={TableColumnTooltip.overflow} name="subCanAddFlag" editor />
          )}
        </Table>
      </div>
      <div className={styles.moveControl}>
        <div>
          <span
            onClick={() => {
              baseTableFieldDataSet.selected
                .filter((record) => record.status !== 'delete')
                .forEach((record) =>
                  dataModelFieldDataSet.create({
                    ...record.toData(),
                    code: uuidv4hyphenless(),
                    physicalFieldCode: record.get('code'),
                    originDataType:
                      record.get('originDataType') ||
                      (refDataSourceType !== 'Oracle'
                        ? MySQLJdbcType(record.get('jdbcType'))
                        : OracleJdbcType(
                            record.get('jdbcType'),
                            record.get('dataSize'),
                            record.get('decimalDigits')
                          )),
                    physicalFieldDataSize:
                      record.get('physicalFieldDataSize') || record.get('dataSize'),
                    physicalFieldRequiredFlag: isNaN(record.get('physicalFieldRequiredFlag'))
                      ? record.get('requiredFlag')
                      : record.get('physicalFieldRequiredFlag'),
                    fieldName: record.get('name') && capitalToHump(record.get('name')),
                    dataType:
                      refDataSourceType !== 'Oracle'
                        ? MySQLJdbcType(record.get('jdbcType'))
                        : OracleJdbcType(
                            record.get('jdbcType'),
                            record.get('dataSize'),
                            record.get('decimalDigits')
                          ),
                    fieldType: 'TABLE_FIELD',
                    displayName:
                      (record &&
                        record.get('description') &&
                        record.get('description').slice(0, 20)) ||
                      record.get('name'),
                    requiredFlag:
                      whoNameList.includes(record.get('name')) ||
                      record.get('primaryFlag') === 1 ||
                      ['TENANT_ID'].includes(record.get('name'))
                        ? 0
                        : record.get('requiredFlag'),
                  })
                );
              baseTableFieldDataSet.remove(baseTableFieldDataSet.selected);
            }}
          >
            {/* <Tooltip placement="top" title="字段添加到逻辑模型"> */}
            <Observer>
              {() => (
                <MoveButton
                  selectedLength={baseTableFieldDataSet.selected.length}
                  direction="left"
                />
              )}
            </Observer>
            {/* </Tooltip> */}
          </span>
          <span
            style={{ marginTop: '3px' }}
            onClick={() => {
              dataModelFieldDataSet.remove(dataModelFieldDataSet.selected);
              baseTableFieldDataSet.query();
            }}
          >
            <Observer>
              {() => (
                <MoveButton
                  selectedLength={dataModelFieldDataSet.selected.length}
                  direction="right"
                />
              )}
            </Observer>
          </span>
        </div>
      </div>
      <div className={styles.dataModelField}>
        <Table
          rowHeight={26}
          className={globalStyles['table-style']}
          dataSet={dataModelFieldDataSet}
          header="逻辑模型"
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="fieldName"
            renderer={iconRenderer as Renderer}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="displayName"
            editor={(record) => {
              return record.get('parentFieldFlag') && !record.get('subCanEditFlag') ? (
                false
              ) : (
                <TextField maxLength={20} />
              );
            }}
          />
        </Table>
      </div>
    </div>
  </div>
);

/**
 * 第三步 编辑字段信息
 */
const AddFieldInfo2 = ({
  dataModelFieldDataSet,
  refDataSourceType,
  resourceUponRoleHierarchy,
}: {
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
  resourceUponRoleHierarchy: string;
}) => (
  <div style={{ marginTop: '20px' }}>
    <div className={styles.createModelFieldContain}>
      <div className={styles.dataModelField2}>
        <Table
          rowHeight={30}
          className={globalStyles['table-style']}
          dataSet={dataModelFieldDataSet}
          // header="逻辑模型"
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="displayName"
            width={150}
            editor={(record) =>
              record.get('parentFieldFlag') && !record.get('subCanEditFlag') ? (
                false
              ) : (
                <TextField maxLength={20} />
              )
            }
          />
          <Column
            name="fieldName"
            width={150}
            renderer={iconRenderer as Renderer}
            tooltip={TableColumnTooltip.overflow}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="dataType"
            width={100}
            editor={(record) => {
              const optionStrArr =
                refDataSourceType !== 'Oracle'
                  ? MySQLDataType(record.get('originDataType'))
                  : OracleDataType(record.get('originDataType'));
              if (
                !optionStrArr ||
                optionStrArr.length === 0 ||
                isPresetField(record.get('fieldName'), ['redNameList']) ||
                // redNameList.includes(record.get('fieldName')) ||
                record.get('primaryFlag') === 1 || // 主键who字段不可编辑
                isPresetField(record.get('fieldName'), [
                  'others',
                  ['TENANT_ID', 'LAST_UPDATED_BY', 'CREATED_BY', 'OBJECT_VERSION_NUMBER'],
                ]) ||
                (record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
                // ['TENANT_ID', 'LAST_UPDATED_BY', 'CREATED_BY', 'OBJECT_VERSION_NUMBER'].includes(
                //   record.get('fieldName')
                // )
              ) {
                return false;
              }
              return (
                <Select
                  optionsFilter={(optionRecord) =>
                    optionStrArr.includes(optionRecord.toData().value)
                  }
                  searchMatcher={searchMatcher}
                >
                  {modelDataTypeList.map((item) => (
                    <Option value={item}>{item}</Option>
                  ))}
                </Select>
              );
            }}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            width={85}
            name="requiredFlag"
            // editor={record => record.get('physicalFieldRequiredFlag') !== 1}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['whoNameList', 'redNameList']) &&
              // !whoNameList.includes(record.get('fieldName')) &&
              record.get('primaryFlag') !== 1 &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="description"
            editor={(record) => !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="dataSize"
            editor={(record) =>
              // !['TENANT_ID'].includes(record.get('fieldName')) &&
              !isPresetField(record.get('fieldName'), [
                'TENANT_ID',
                'whoNameList',
                'redNameList',
              ]) &&
              // !whoNameList.includes(record.get('fieldName')) &&
              record.get('primaryFlag') !== 1 &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column tooltip={TableColumnTooltip.overflow} width={100} name="defaultValue" />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="valueList"
            width={120}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), [
                'TENANT_ID',
                'whoNameList',
                'redNameList',
              ]) &&
              record.get('primaryFlag') !== 1 &&
              !record.get('ruleCode') &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="encodingRule"
            width={120}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), [
                'TENANT_ID',
                'whoNameList',
                'redNameList',
              ]) &&
              record.get('primaryFlag') !== 1 &&
              !record.get('valueListCode') &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column
            name="encryptFlag"
            align={ColumnAlign.center}
            width={100}
            editor={(record) =>
              !['objectVersionNumber'].includes(record?.get('fieldName')) &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag')) &&
              // && hasNumberType(record?.get('dataType'))
              getFieldValueType(record?.get('dataType')) === 'NUMBER'
            }
          />
          {resourceUponRoleHierarchy === 'platform' && (
            <Column
              name="subCanEditFlag"
              align={ColumnAlign.center}
              width={120}
              editor={(record) =>
                !isPresetField(record.get('fieldName'), [
                  'TENANT_ID',
                  'whoNameList',
                  'redNameList',
                ]) &&
                record.get('primaryFlag') !== 1 &&
                !['objectVersionNumber'].includes(record?.get('fieldName'))
              }
            />
          )}
        </Table>
      </div>
    </div>
  </div>
);

interface ICreateModel {
  editModelDataSet: DataSet;
  step: number;
  editor: boolean;
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  dataModelFieldNoSelDataSet: DataSet;
  assignPatternDs?: DataSet;
  resourceUponRoleHierarchy: 'platform' | 'tenant';
  currentNodeData?: model.LogicModel;
  currentNodeDataRef?: any;
}
const CreateModel: FC<ICreateModel> = observer(
  ({
    editor,
    editModelDataSet,
    step,
    baseTableFieldDataSet,
    dataModelFieldDataSet,
    dataModelFieldNoSelDataSet,
    resourceUponRoleHierarchy,
    // currentNodeData,
    currentNodeDataRef,
    // assignPatternDs,
  }) => {
    const currentNodeData = currentNodeDataRef.current;
    useEffect(() => {
      if (
        baseTableFieldDataSet.selected.length &&
        baseTableFieldDataSet.selected.length === baseTableFieldDataSet.length
      ) {
        baseTableFieldDataSet.selectAll();
      }
    }, [baseTableFieldDataSet.selected]);

    // const step = step.current === -1 ? 0 : step.current;
    /**
     * 步骤数组
     */
    const steps = [
      {
        title: '确认模型基本信息',
        content: (
          <AddBaseInfo
            editModelDataSet={editModelDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
            currentNodeData={currentNodeData}
            editor={editor}
          />
        ),
      },
      {
        title: '添加模型字段',
        content: (
          <AddFieldInfo
            refDataSourceType={editModelDataSet.current?.get('refDataSourceType')}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          />
        ),
      },
      {
        title: '编辑字段信息',
        content: (
          <AddFieldInfo2
            dataModelFieldDataSet={dataModelFieldNoSelDataSet}
            refDataSourceType={editModelDataSet.current?.get('refDataSourceType')}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          />
        ),
      },
    ];

    return (
      <div className={`${globalStyles['step-style']} ${styles['modal-content']}`}>
        <Steps current={step}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div>{steps[step].content}</div>
      </div>
    );
  }
);
export default CreateModel;
