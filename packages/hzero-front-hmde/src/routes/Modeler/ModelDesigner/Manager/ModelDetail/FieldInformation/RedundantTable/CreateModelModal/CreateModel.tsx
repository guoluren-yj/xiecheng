/*
 * 新增模型扩展字段
 * @Date: 2020-04-05 14:59:10
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect } from 'react';
import { DataSet, Form, Table, Select, Output, TextField } from 'choerodon-ui/pro';
import { Steps, Tooltip } from 'choerodon-ui';
import { observer, Observer } from 'mobx-react-lite';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Renderer } from 'choerodon-ui/pro/lib/field/FormField';

import { searchMatcher, capitalToHump } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import keyIcon from '@/assets/icon/key@3x.png';
import { isPresetField, hasNumberType } from '@/routes/Modeler/ModelDesigner/utils/utils';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';
import { MySQLDataType, OracleDataType } from '@/routes/Modeler/ModelDesigner/utils/dataTypeChange';
import styles from './createModel.less';

import MoveButton from '@/routes/Modeler/component/MoveButton';
import uuidv4hyphenless from '@/utils/uuidv4hyphenless';

const { Step } = Steps;
const { Column } = Table;
const { Option } = Select;
const redNameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'];
// 扩展表新增表字段不存在who字段的情况 设计扩展表会存在
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
  redundantTableName,
}: {
  editModelDataSet: DataSet;
  redundantTableName: string | null;
}) => (
  <div
    style={{
      top: '50%',
      position: 'absolute',
      marginTop: '-47px',
      left: '50%',
      marginLeft: '-120px',
      width: '240px',
    }}
  >
    <Form dataSet={editModelDataSet} className={styles['add-base-info']}>
      <Output name="dataSourceType" renderer={() => '数据表'} />
      <Output name="refTable" renderer={() => redundantTableName} />
    </Form>
  </div>
);

/**
 * 第二步 添加模型字段
 */
const AddFieldInfo = ({
  baseTableFieldDataSet,
  dataModelFieldDataSet,
  refDataSourceType,
}: {
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
}) => (
  <div style={{ marginTop: '20px' }}>
    <div className={styles.createModelFieldContain}>
      <div className={styles.baseTableField}>
        <Table
          className={globalStyles['table-style']}
          dataSet={baseTableFieldDataSet}
          header="扩展表"
          rowHeight={26}
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="name"
            renderer={iconRenderer as Renderer}
          />
          <Column tooltip={TableColumnTooltip.overflow} name="description" />
        </Table>
      </div>
      <div className={styles.moveControl}>
        <div className="transport-button-group">
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
                    fieldType: 'REDUNDANT_FIELD',
                    code: uuidv4hyphenless(),
                    physicalFieldCode: record.get('code'),
                    deleteFlag: true, // 判断是前端删除还是后端删除
                    displayName:
                      (record.get('description') && record.get('description').slice(0, 20)) ||
                      record.get('name'),
                    requiredFlag:
                      ['REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'].includes(
                        record.get('name')
                      ) || record.get('primaryFlag') === 1
                        ? 0
                        : record.get('requiredFlag'),
                    status: 'update',
                  });
                });
              baseTableFieldDataSet.remove(baseTableFieldDataSet.selected);
            }}
          >
            {/* <Tooltip placement="top" title="字段添加到逻辑模型"> */}
            {/* <ImgIcon name="add-to@3x.png" size={30} /> */}
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
            onClick={async () => {
              const deleteList = dataModelFieldDataSet.selected;
              if (deleteList.length !== 0) {
                dataModelFieldDataSet.remove(deleteList); // 后端删除
                baseTableFieldDataSet.query();
              }
            }}
          >
            {/* <Tooltip placement="top" title="移除选中逻辑模型字段"> */}
            {/* <ImgIcon name="remove@3x.png" size={30} /> */}
            <Observer>
              {() => (
                <MoveButton
                  selectedLength={dataModelFieldDataSet.selected.length}
                  direction="right"
                />
              )}
            </Observer>
            {/* </Tooltip> */}
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
            editor={(record) =>
              !redNameList.includes(record.get('fieldName')) ? (
                <TextField maxLength={20} />
              ) : (
                record.get('displayName')
              )
            }
          />
        </Table>
      </div>
    </div>
  </div>
);

/**
 * 第三步 编辑模型扩展字段
 */
const AddFieldInfo2 = ({
  dataModelFieldDataSet,
  refDataSourceType,
}: {
  dataModelFieldDataSet: DataSet;
  refDataSourceType: string;
}) => (
  <div style={{ marginTop: '20px' }}>
    <div className={styles.createModelFieldContain}>
      <div className={styles.dataModelField2}>
        <Table
          className={globalStyles['table-style']}
          dataSet={dataModelFieldDataSet}
          rowHeight={30}
          filter={(record) => record.status !== 'delete'}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="displayName"
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['redNameList']) && (
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
                record.get('primaryFlag') === 1 || // 主键who字段不可编辑
                isPresetField(record.get('fieldName'), ['TENANT_ID'])
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
                  <Option value="Byte">Byte</Option>
                  <Option value="Short">Short</Option>
                  <Option value="Integer">Integer</Option>
                  <Option value="Long">Long</Option>
                  <Option value="Float">Float</Option>
                  <Option value="Double">Double</Option>
                  <Option value="LocalDate">LocalDate</Option>
                  <Option value="Time">Time</Option>
                  <Option value="ZonedDateTime">ZonedDateTime</Option>
                  <Option value="BigDecimal">BigDecimal</Option>
                  <Option value="String">String</Option>
                </Select>
              );
            }}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="requiredFlag"
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['redNameList']) &&
              record.get('primaryFlag') !== 1
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="description"
            width={120}
            editor={(record) => !isPresetField(record.get('fieldName'), ['redNameList'])}
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="dataSize"
            editor={(record) => !isPresetField(record.get('fieldName'), ['redNameList'])}
          />
          <Column tooltip={TableColumnTooltip.overflow} name="defaultValue" />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="valueList"
            width={120}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['redNameList', 'TENANT_ID']) &&
              record.get('primaryFlag') !== 1 &&
              !record.get('ruleCode')
            }
          />
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="encodingRule"
            width={120}
            editor={(record) =>
              !isPresetField(record.get('fieldName'), ['redNameList', 'TENANT_ID']) &&
              record.get('primaryFlag') !== 1 &&
              !record.get('valueListCode')
            }
          />
          <Column
            name="encryptFlag"
            align={ColumnAlign.center}
            width={100}
            editor={(record) =>
              !['objectVersionNumber'].includes(record?.get('fieldName')) &&
              hasNumberType(record?.get('dataType'))
            }
          />
        </Table>
      </div>
    </div>
  </div>
);

interface ICreateModel {
  editModelDataSet: DataSet;
  step: number;
  refDataSourceType: string;
  redundantTableName: string | null;
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
}
export default observer(
  ({
    editModelDataSet,
    step,
    refDataSourceType,
    redundantTableName,
    baseTableFieldDataSet,
    dataModelFieldDataSet,
  }: ICreateModel) => {
    useEffect(() => {
      if (
        baseTableFieldDataSet.selected.length &&
        baseTableFieldDataSet.selected.length === baseTableFieldDataSet.length
      ) {
        baseTableFieldDataSet.selectAll();
      }
    }, [baseTableFieldDataSet.selected]);

    // const step = stepRef.current === -1 ? 0 : stepRef.current;
    /**
     * 步骤数组
     */
    const steps = [
      {
        title: '确认模型基本信息',
        content: (
          <AddBaseInfo
            editModelDataSet={editModelDataSet}
            redundantTableName={redundantTableName}
          />
        ),
      },
      {
        title: '添加模型扩展字段',
        content: (
          <AddFieldInfo
            refDataSourceType={refDataSourceType}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
          />
        ),
      },
      {
        title: '编辑模型扩展字段',
        content: (
          <AddFieldInfo2
            dataModelFieldDataSet={dataModelFieldDataSet}
            refDataSourceType={refDataSourceType}
          />
        ),
      },
    ];

    return (
      <div
        style={{ height: '60vh' }}
        className={`${globalStyles['model-body']} ${globalStyles['step-style']}`}
      >
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
