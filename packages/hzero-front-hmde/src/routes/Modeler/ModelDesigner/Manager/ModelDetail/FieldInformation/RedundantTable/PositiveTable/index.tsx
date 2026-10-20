/* eslint-disable react/jsx-props-no-spreading */
/*
 * @filename:
 * @Date: 2020-04-13 15:14:56
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { forwardRef, useImperativeHandle, useMemo, useState, useEffect, FC } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import FirstStep from './FirstStep';
import QuoteIndex from './FirstStep/QuoteIndex';
import SecondParts from './SecondParts';
import ThirdStep from './ThirdStep';
import EmptyStep from './EmptyStep';
import BaseTableDataSet from './FirstStep/baseTableDataSet';
import QuoteIndexDataSet from './FirstStep/quoteIndexDataSet';
import FieldTableDataSet from './SecondParts/fieldTableDataSet';
import IndexTableDataSet from './ThirdStep/indexTableDataSet';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
interface IVal {
  id: number;
  dataSourceType: string;
  name: string;
}
interface IIndex {
  step: number;
  lovInfo: IVal;
  tableType: string | null;
  checkObj: model.LogicModel;
  createRedundantTable: () => void;
  isShowEmpty: boolean;
  redundantTableName: string | null;
  tableId: string | number | null;
  modelId: string | number | null;
  onChangeTable: (val: IVal | null) => void;
  secondData: any[] | undefined;
  thirdData: any[] | undefined;
  setFirstData: any;
  setSecondData: any;
  setThirdData: any;
  refDataSourceType: string;
  refServiceCode: string | null;
  refSchemaName: string | null;
  lockStatus: boolean;
  setLockStatus: any;
  primaryKeyField: any;
}
const Index: FC<IIndex> = forwardRef(
  (
    {
      step,
      lovInfo,
      tableType,
      checkObj,
      createRedundantTable,
      isShowEmpty,
      redundantTableName,
      tableId,
      modelId,
      onChangeTable,
      secondData,
      thirdData = [],
      setFirstData,
      setSecondData,
      setThirdData,
      refDataSourceType,
      refServiceCode,
      refSchemaName,
      lockStatus,
      setLockStatus,
      primaryKeyField,
    },
    ref
  ) => {
    const [baseData, setBaseData] = useState<any[]>([]); // 第一步缓存数据 // fixme
    const [secondCreated, setSecondCreated] = useState<any[]>([]); // 第二步缓存数据
    const [thirdCreated, setThirdCreated] = useState<any[]>([]); // 基第三步缓存数据
    const [secondQuery, setSecondQuery] = useState<any[]>([]); // 第二步缓存表格查询获取的数据，用于第三步校验匹配code同步更改索引字段名称
    const quoteIndexDataSet: DataSet = useMemo(() => {
      // lov请求增加 dataSourceType，serviceCode 参数
      const lovPara = {
        dataSourceType: refDataSourceType,
        serviceCode: refServiceCode,
        schemaName: refSchemaName,
      };
      return new DataSet(QuoteIndexDataSet(organizationId, modelId, lovPara) as DataSetProps);
    }, [organizationId, modelId, refDataSourceType, refServiceCode, refSchemaName]);
    const baseTableDataSet: DataSet = useMemo(
      () => new DataSet(BaseTableDataSet(checkObj, modelId, redundantTableName) as DataSetProps),
      [checkObj, modelId, redundantTableName]
    );

    const fieldTableDataSet: DataSet = useMemo(
      () =>
        new DataSet(
          FieldTableDataSet(
            tableId,
            modelId,
            step,
            secondCreated,
            refDataSourceType
          ) as DataSetProps
        ),
      [tableId, modelId, step, secondCreated, refDataSourceType]
    );
    const indexTableDataSet: DataSet = useMemo(
      () =>
        new DataSet(
          IndexTableDataSet(
            tableId,
            redundantTableName,
            tableType,
            lovInfo,
            baseData,
            thirdCreated
          ) as DataSetProps
        ),
      [tableId, redundantTableName, tableType, lovInfo, baseData, thirdCreated]
    );

    useEffect(() => {
      if (!redundantTableName && !tableId) {
        // 自建扩展表
        // 默认创建扩展字段
        const arr = [
          {
            name: 'REDUNDANT_ID',
            type: refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
            description: '扩展表主键',
            dataSize: '19',
            requiredFlag: 1,
            primaryFlag: 1,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'REDUNDANT_RELATION_TABLE',
            type: refDataSourceType !== 'Oracle' ? 'VARCHAR' : 'VARCHAR2',
            dataSize: 120,
            description: '关联业务表名',
            requiredFlag: 1,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'REDUNDANT_RELATION_KEY',
            type: refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
            description: '关联业务表主键',
            dataSize: '19',
            requiredFlag: 1,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          // 默认创建who字段
          {
            name: 'LAST_UPDATE_DATE',
            type: refDataSourceType !== 'Oracle' ? 'DATETIME' : 'DATE',
            description: '更新时间',
            dataSize: '',
            decimalDigits: 0,
            defaultValue: 'CURRENT_TIMESTAMP',
            requiredFlag: 1,
            primaryFlag: 0,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'LAST_UPDATED_BY',
            type: refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
            description: '更新人',
            dataSize: '19',
            decimalDigits: 0,
            defaultValue: '-1',
            requiredFlag: 1,
            primaryFlag: 0,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'CREATION_DATE',
            type: refDataSourceType !== 'Oracle' ? 'DATETIME' : 'DATE',
            description: '创建时间',
            dataSize: '',
            decimalDigits: 0,
            defaultValue: 'CURRENT_TIMESTAMP',
            requiredFlag: 1,
            primaryFlag: 0,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'CREATED_BY',
            type: refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
            description: '创建人',
            dataSize: '19',
            decimalDigits: 0,
            defaultValue: '-1',
            requiredFlag: 1,
            primaryFlag: 0,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
          {
            name: 'OBJECT_VERSION_NUMBER',
            type: refDataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
            description: '乐观锁版本号',
            dataSize: '19',
            decimalDigits: 0,
            defaultValue: '1',
            requiredFlag: 1,
            primaryFlag: 0,
            keyword: true, // 关键字标识 用于控制是够可编辑
          },
        ];

        const thirdArr =
          baseData?.[0]?.redundantMode === 'REDUNDANT_X'
            ? []
            : [
                {
                  indexName:
                    baseData &&
                    baseData[0] &&
                    baseData[0].name &&
                    `${baseData[0].name.toLowerCase()}_u1`,
                  columnNameList: ['REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY '],
                  indexType: 'Unique',
                  unIque: 1,
                  keyword: true, // 关键字标识 用于控制是够可编辑
                },
              ];

        let secondCatchData = !isEmpty(secondData) ? secondData : arr; // 第二步存下来的数据替代原始默认值
        const thirdCatchData = !isEmpty(thirdData) ? thirdData.filter((item) => !item.keyword) : []; // 第三步存下来的数据替代原始默认值

        if (secondCatchData && Array.isArray(secondCatchData)) {
          if (
            baseData?.[0]?.redundantMode === 'REDUNDANT_X' &&
            !secondCatchData.some(({ name }) => name === primaryKeyField.physicalFieldName)
          ) {
            secondCatchData.unshift({
              name: primaryKeyField.physicalFieldName,
              type: primaryKeyField.physicalFieldDataType,
              description: primaryKeyField.description,
              dataSize: primaryKeyField.dataSize,
              decimalDigits: primaryKeyField.physicalFieldDecimalDigits,
              requiredFlag: primaryKeyField.physicalFieldRequiredFlag,
              primaryFlag: primaryKeyField.primaryFlag,
              keyword: true,
            });
            secondCatchData = secondCatchData?.filter(
              ({ name }) =>
                !['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'].includes(
                  name
                )
            );
          } else if (baseData?.[0]?.redundantMode === 'REDUNDANT') {
            secondCatchData = secondCatchData?.filter(
              ({ name }) => name !== primaryKeyField?.physicalFieldName
            );
          }
        }
        if (isEmpty(fieldTableDataSet.toData())) {
          fieldTableDataSet.reset();
          (secondCatchData || []).forEach((item) => {
            // 创建默认值
            fieldTableDataSet.create(item);
          });
        }
        if (step === 2 && isEmpty(indexTableDataSet.toData())) {
          [...thirdCatchData, ...thirdArr].forEach((item) => {
            indexTableDataSet.create(item);
          });
        }
      }
    }, [step, redundantTableName]);

    useImperativeHandle(ref, () => ({
      baseTableSave: async () => {
        const val = await baseTableDataSet?.current?.validate(true);
        if (val) {
          const data = baseTableDataSet.toData();
          setBaseData(data);
          return data;
        }
        return null;
      }, // 保存当前数据
      quoteTableSave: async () => {
        const val = await quoteIndexDataSet?.current?.validate(true);
        if (val) {
          const data = quoteIndexDataSet.toData();
          return data;
        }
        return null;
      }, // 保存当前数据
      fieldTableSave: async () => {
        if (fieldTableDataSet.length === 0) {
          // 如果没有字段
          return [];
        }
        const val = await fieldTableDataSet.validate();
        const primaryKeyVal = (fieldTableDataSet || []).some(
          (record) => record.get('primaryFlag') === 1
        );
        if (val && primaryKeyVal) {
          const createData: any[] = []; // fixme
          fieldTableDataSet.created.forEach((record) => {
            createData.push(record.toData()); // 转化为普通数据
          });
          setSecondCreated(createData); // mobx对象数组
          return fieldTableDataSet.toData();
        }
        if (!primaryKeyVal) {
          notification.error({
            message: '警告',
            description: '请选择至少一个主键！',
          });
        }
        return null;
      }, // 保存当前数据

      /**
       * 保存第三步索引列表数据
       */
      indexTableSave: async (arg: string | null) => {
        if (indexTableDataSet.length === 0) {
          // 如果没有字段
          return [];
        }
        const val = await indexTableDataSet.validate();
        if (val) {
          if (!arg || arg !== 'save') {
            // 最后一步点击完成时不需要走setThirdCreated 否则会触发useMemo更新生成新的第三步ds
            const createData: any[] = []; // fixme
            indexTableDataSet.created.forEach((record) => {
              createData.push(record.toData()); // 转化为普通数据
            });
            setThirdCreated(createData); // mobx对象数组
          }
          return indexTableDataSet.toData(); // 返回普通数据
        }
        return null;
      },

      refreshAll: () => {
        setSecondCreated([]); // 清除第二步缓存
        setThirdCreated([]); // 清除第三步缓存
        setFirstData([]);
        setSecondData([]);
        setThirdData([]);
        baseTableDataSet.removeAll();
        baseTableDataSet.reset();
        quoteIndexDataSet.removeAll();
        quoteIndexDataSet.reset();
        fieldTableDataSet.removeAll();
        fieldTableDataSet.reset();
        indexTableDataSet.removeAll();
        indexTableDataSet.reset();
      },
    }));

    const firstStepsProps = {
      modelId,
      baseTableDataSet,
      redundantTableName,
    };
    const secondPartsProps = {
      tableId,
      tableType,
      refDataSourceType,
      fieldTableDataSet,
      lockStatus,
      setLockStatus,
      setSecondQuery,
    };
    const thirdStepProps = {
      secondData,
      tableId,
      lovInfo,
      baseData,
      indexTableDataSet,
      redundantTableName,
      lockStatus,
      tableType,
      secondQuery,
    };

    const quoteIndexProps = {
      modelId,
      onChangeTable,
      baseTableDataSet,
      quoteIndexDataSet,
      redundantTableName,
    };

    /**
     * 创建步骤数组
     */
    const createSteps = [
      {
        title: '新建扩展表',
        content: isShowEmpty ? (
          <EmptyStep createRedundantTable={createRedundantTable} />
        ) : (
          <FirstStep {...firstStepsProps} />
        ),
      },
      {
        title: '新建扩展表',
        content: <SecondParts {...secondPartsProps} />,
      },
      {
        title: '新建扩展表',
        content: <ThirdStep {...thirdStepProps} />,
      },
    ];

    /**
     * 引用步骤数组
     */
    const quoteSteps = [
      {
        title: '设计扩展表',
        content: <QuoteIndex {...quoteIndexProps} />,
      },
      {
        title: '设计扩展表',
        content: <SecondParts {...secondPartsProps} />,
      },
      {
        title: '设计扩展表',
        content: <ThirdStep {...thirdStepProps} />,
      },
    ];

    enum ETableType {
      OWNER = 'OWNER',
      REFERENCE = 'REFERENCE',
    }
    return (
      <div className={styles['positive-table']}>
        <div>
          {tableType === ETableType.OWNER ? createSteps[step].content : quoteSteps[step].content}
        </div>
      </div>
    );
  }
);
export default Index;
