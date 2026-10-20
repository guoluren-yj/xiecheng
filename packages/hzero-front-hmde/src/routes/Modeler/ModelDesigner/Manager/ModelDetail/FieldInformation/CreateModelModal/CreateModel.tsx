/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/order */
import React, { useEffect } from 'react';
import {
  DataSet,
  Form,
  Select,
  Table,
  TextField,
  // Output,
  Lov,
  Tooltip,
  TextArea,
  // CheckBox,
} from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui'; // notification
import { observer, Observer } from 'mobx-react-lite';
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { EWhoFieldsList } from '@/globalData/modelManager';
import { searchMatcher, capitalToHump } from '@/utils/common';
import keyIcon from '@/assets/icon/key@3x.png';
// import addPic from '@/routes/Model/assets/add-to@3x.png';
// import removePic from '@/routes/Model/assets/remove@3x.png';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';
import { isPresetField, hasNumberType } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { modelDataTypeList } from '@/routes/Modeler/ModelDesigner/utils/config';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import MoveButton from '@/routes/Modeler/component/MoveButton';
import { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

import styles from './createModel.less';
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
// 字段icon
function iconRenderer({ record, text }: { record: Record; text: string }) {
  return [
    record.get('primaryFlag') === 1 && (
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
 * 第一步 选择模型信息
 */
const AddBaseInfo = ({
  editModelDataSet,
  resourceUponRoleHierarchy,
}: {
  editModelDataSet: DataSet;
  resourceUponRoleHierarchy: string;
}) => {
  const { extendsParentCode } = editModelDataSet?.current?.toData();
  return (
    <div style={{ textAlign: 'center', margin: '60px auto 0px', width: '503px' }}>
      <Form dataSet={editModelDataSet}>
        {/* <Output name="dataSourceType" renderer={() => '数据表'} />
        <Output name="refTable" renderer={() => modelManagerStore?.storeData?.refTableName} /> */}
        <Select searchable name="dataSourceType" disabled>
          <Option value="TABLE">数据表</Option>
          <Option value="API">API</Option>
        </Select>
        <Lov name="refTable" modalProps={{ style: { width: 800 } }} noCache disabled />
        <Select name="type" disabled>
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
        {extendsParentCode && <TextField name="extendsParentName" disabled />}
        <TextField name="code" disabled />
        <TextField name="name" disabled />
        <TextArea name="description" disabled />
      </Form>
    </div>
  );
};

/**
 * 第二步 添加模型字段
 */
const AddFieldInfo = ({
  baseTableFieldDataSet,
  dataModelFieldDataSet,
  refDataSourceType,
  resourceUponRoleHierarchy,
  modelManagerStore,
}: {
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
  resourceUponRoleHierarchy: string;
  modelManagerStore: IModelManagerStore;
}) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <div className={styles.createModelFieldContain}>
        <div className={styles.baseTableField}>
          <Table
            className={globalStyles['table-style']}
            dataSet={baseTableFieldDataSet}
            header="基础表"
            rowHeight={26}
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
                  .forEach((record) => {
                    dataModelFieldDataSet.create({
                      ...record.toData(),
                      originDataType:
                        refDataSourceType !== 'Oracle'
                          ? MySQLJdbcType(record.get('jdbcType'))
                          : OracleJdbcType(
                              record.get('jdbcType'),
                              record.get('dataSize'),
                              record.get('decimalDigits')
                            ),
                      physicalFieldDataSize: record.get('dataSize'),
                      physicalFieldRequiredFlag: record.get('requiredFlag'),
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
                      code: uuidv4hyphenless(),
                      physicalFieldCode: record.get('code'),
                      deleteFlag: true, // 判断是前端删除还是后端删除
                      displayName:
                        (record.get('description') && record.get('description').slice(0, 20)) ||
                        record.get('name'),
                      requiredFlag:
                        record.get('primaryFlag') === 1 ||
                        whoNameList.includes(record.get('name')) ||
                        ['TENANT_ID'].includes(record.get('name'))
                          ? 0
                          : record.get('requiredFlag'),
                      status: 'update',
                    });
                  });
                baseTableFieldDataSet.remove(baseTableFieldDataSet.selected);
              }}
            >
              <Tooltip placement="top" title="字段添加到数据模型">
                <Observer>
                  {() => (
                    <MoveButton
                      selectedLength={baseTableFieldDataSet.selected.length}
                      direction="left"
                    />
                  )}
                </Observer>
              </Tooltip>
            </span>
            <span
              style={{ marginTop: '3px' }}
              onClick={async () => {
                const deleteList = dataModelFieldDataSet.selected;
                if (deleteList.length !== 0) {
                  dataModelFieldDataSet.remove(deleteList); // 后端删除
                  baseTableFieldDataSet.query(undefined, {
                    code: modelManagerStore.storeData.refTableCode,
                  });
                }
              }}
            >
              <Tooltip placement="top" title="移除选中数据模型字段">
                <Observer>
                  {() => (
                    <MoveButton
                      selectedLength={dataModelFieldDataSet.selected.length}
                      direction="right"
                    />
                  )}
                </Observer>
              </Tooltip>
            </span>
          </div>
        </div>
        <div className={styles.dataModelField}>
          <Table
            className={globalStyles['table-style']}
            dataSet={dataModelFieldDataSet}
            header="逻辑模型"
            rowHeight={26}
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
              // editor={<TextField maxLength={20} />}
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
};

/**
 * 第三步 添加模型字段
 */
enum EReDType {
  REDUNDANT_RELATION_TABLE = 'REDUNDANT_RELATION_TABLE',
  REDUNDANT_RELATION_KEY = 'REDUNDANT_RELATION_KEY',
}
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
          className={globalStyles['table-style']}
          dataSet={dataModelFieldDataSet}
          header="逻辑模型"
          rowHeight={30}
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="displayName"
            editor={(record) =>
              record.get('parentFieldFlag') && !record.get('subCanEditFlag') ? (
                false
              ) : (
                <TextField maxLength={20} />
              )
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="fieldName"
            width={140}
            renderer={iconRenderer as Renderer}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="dataType"
            width={140}
            editor={(record) => {
              const optionStrArr =
                refDataSourceType !== 'Oracle'
                  ? MySQLDataType(record.get('originDataType'))
                  : OracleDataType(record.get('originDataType'));
              if (
                !optionStrArr ||
                optionStrArr.length === 0 ||
                isPresetField(record.get('fieldName'), ['redNameList']) ||
                isPresetField(record.get('fieldName'), [
                  'others',
                  [
                    EWhoFieldsList.TENANT_ID,
                    EWhoFieldsList.LAST_UPDATED_BY,
                    EWhoFieldsList.CREATED_BY,
                    EWhoFieldsList.OBJECT_VERSION_NUMBER,
                  ],
                ]) ||
                (record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
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
            name="requiredFlag"
            width={100}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['whoNameList']) &&
              !isPresetField(record.get('fieldName'), [
                'others',
                [EReDType.REDUNDANT_RELATION_TABLE, EReDType.REDUNDANT_RELATION_KEY],
              ]) &&
              record.get('primaryFlag') !== 1 &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="description"
            width={120}
            editor={(record) => !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="dataSize"
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['whoNameList', 'TENANT_ID']) &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
            }
          />
          <Column tooltip={TableColumnTooltip.overflow} name="defaultValue" />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="valueList"
            width={120}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['whoNameList', 'TENANT_ID']) &&
              !isPresetField(record.get('fieldName')) &&
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
              !isPresetField(record.get('fieldName'), ['whoNameList', 'TENANT_ID']) &&
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
              !['objectversionnumber'].includes(record?.get('fieldName')) &&
              hasNumberType(record?.get('dataType')) &&
              !(record.get('parentFieldFlag') && !record.get('subCanEditFlag'))
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
  step: number;
  editModelDataSet: DataSet;
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
  resourceUponRoleHierarchy: string;
  modelManagerStore: IModelManagerStore;
}
export default observer(
  ({
    step,
    editModelDataSet,
    baseTableFieldDataSet,
    dataModelFieldDataSet,
    refDataSourceType,
    resourceUponRoleHierarchy,
    modelManagerStore,
  }: ICreateModel) => {
    useEffect(() => {
      if (
        baseTableFieldDataSet.selected.length &&
        baseTableFieldDataSet.selected.length === baseTableFieldDataSet.length
      ) {
        baseTableFieldDataSet.selectAll();
      }
    }, [baseTableFieldDataSet.selected]);

    const steps = [
      {
        title: '填写模型基本信息',
        content: (
          <AddBaseInfo
            editModelDataSet={editModelDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          />
        ),
      },
      {
        title: '添加模型字段',
        content: (
          <AddFieldInfo
            modelManagerStore={modelManagerStore}
            refDataSourceType={refDataSourceType}
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
            dataModelFieldDataSet={dataModelFieldDataSet}
            refDataSourceType={refDataSourceType}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          />
        ),
      },
    ];

    return (
      <div className={globalStyles['step-style']}>
        <Steps current={step}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className={`${styles.table} ${styles['input-table']}`}>{steps[step].content}</div>
      </div>
    );
  }
);
