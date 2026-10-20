/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import {
  MySqlDataTypeCascade,
  OracleDataTypeCascade,
} from '@/routes/Modeler/ModelDesigner/utils/dataTypeCascade';
import FirstStep from './FirstStep';
import SecondParts from './SecondParts';
import ThirdStep from './ThirdStep';
import BaseTableDataSet from './FirstStep/baseTableDataSet';
import FieldTableDataSet from './SecondParts/fieldTableDataSet';
import IndexTableDataSet from './ThirdStep/indexTableDataSet';
import styles from './index.less';

interface IIndex {
  step: number;
  serviceCode?: string;
  schemaName?: string;
  propsDataSourceType?: string;
  level?: string;
  _tenantId?: string;
}
export default forwardRef(
  ({ step, serviceCode, schemaName, propsDataSourceType, _tenantId, level }: IIndex, ref) => {
    const [dataSourceType, setDataSourceType] = useState(propsDataSourceType);
    const preConfigFields = useMemo(
      () => [
        {
          name: 'ID',
          type: dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
          description: '主键',
          dataSize: '19',
          decimalDigits: 0,
          // defaultValue: '1',
          requiredFlag: 1,
          primaryFlag: 1,
          // keyword: true,
        },
        {
          name: 'OBJECT_VERSION_NUMBER',
          type: dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
          description: '乐观锁版本号',
          dataSize: '19',
          decimalDigits: 0,
          defaultValue: '1',
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
        {
          name: 'TENANT_ID',
          type: dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
          description: '租户ID',
          dataSize: '19',
          decimalDigits: 0,
          defaultValue: null,
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
        {
          name: 'CREATED_BY',
          type: dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
          description: '创建人',
          dataSize: '19',
          decimalDigits: 0,
          defaultValue: '-1',
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
        {
          name: 'CREATION_DATE',
          type: dataSourceType !== 'Oracle' ? 'DATETIME' : 'DATE',
          description: '创建时间',
          dataSize: dataSourceType === 'Oracle' ? '7' : '19',
          decimalDigits: 0,
          defaultValue: 'CURRENT_TIMESTAMP',
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
        {
          name: 'LAST_UPDATED_BY',
          type: dataSourceType !== 'Oracle' ? 'BIGINT' : 'NUMBER',
          description: '更新人',
          dataSize: '19',
          decimalDigits: 0,
          defaultValue: '-1',
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
        {
          name: 'LAST_UPDATE_DATE',
          type: dataSourceType !== 'Oracle' ? 'DATETIME' : 'DATE',
          description: '更新时间',
          dataSize: dataSourceType === 'Oracle' ? '7' : '19',
          decimalDigits: 0,
          defaultValue: 'CURRENT_TIMESTAMP',
          requiredFlag: 1,
          primaryFlag: 0,
          keyword: true,
        },
      ],
      [dataSourceType]
    );

    const baseTableDataSet = useMemo(
      () =>
        new DataSet(
          BaseTableDataSet({
            serviceCode,
            schemaName,
            dataSourceType: propsDataSourceType,
            _tenantId,
            level,
          })
        ),
      [serviceCode, schemaName, propsDataSourceType, _tenantId, level]
    );
    const fieldTableDataSet = useMemo(() => new DataSet(FieldTableDataSet(dataSourceType)), [
      dataSourceType,
    ]);
    const indexTableDataSet = useMemo(() => new DataSet(IndexTableDataSet()), []);

    useEffect(() => {
      const update = ({ name, value }) => {
        if (name === 'source' && value) {
          setDataSourceType(value.dataSourceType);
        }
      };
      baseTableDataSet.addEventListener('update', update);
      return (): any => baseTableDataSet.removeEventListener('update', update);
    }, [baseTableDataSet]);

    useImperativeHandle(ref, () => ({
      baseTableSave: async () => {
        const val = await baseTableDataSet.validate();
        if (val) {
          return baseTableDataSet.toData();
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
          return fieldTableDataSet.toData().map((item) => ({
            ...item,
            // defaultValue: item.defaultValue === 'NULL' ? null : item.defaultValue,
          }));
        }
        if (!primaryKeyVal) {
          notification.error({
            message: '错误',
            description: '请选择至少一个主键！',
          });
        }
        return null;
      }, // 保存当前数据

      /**
       * 保存第三步索引列表数据
       */
      indexTableSave: async () => {
        if (indexTableDataSet.length === 0) {
          // 如果没有字段
          return [];
        }
        const val = await indexTableDataSet.validate();
        if (val) {
          return indexTableDataSet.toData(); // 返回普通数据
        }
        return null;
      },
      refreshAll: () => {
        baseTableDataSet.removeAll();
        baseTableDataSet.reset();
        fieldTableDataSet.removeAll();
        fieldTableDataSet.reset();
      },
    }));

    /**
     * 添加默认字段
     */
    useEffect(() => {
      if (fieldTableDataSet.data.length === 0) {
        fieldTableDataSet.reset();
        preConfigFields.forEach((item) => {
          fieldTableDataSet.create(item);
        });
        // 设置禁选
        fieldTableDataSet.forEach((ele) => {
          if (ele.get('keyword')) {
            Object.assign(ele, { selectable: false });
          }
          // 执行批量编辑时重置一下编辑框样式
          const typeCascade =
            dataSourceType !== 'Oracle'
              ? MySqlDataTypeCascade(ele.get('type'))
              : OracleDataTypeCascade(ele.get('type'));
          ele.set('typeCascade', typeCascade);
        });
      }
    }, [step]);

    /**
     * 步骤数组
     */
    const steps = [
      {
        title: '填写表信息',
        content: <FirstStep baseTableDataSet={baseTableDataSet} serviceCode={serviceCode} />,
      },
      {
        title: '新建字段',
        content: (
          <SecondParts fieldTableDataSet={fieldTableDataSet} dataSourceType={dataSourceType} />
        ),
      },
      {
        title: '新建索引',
        content: (
          <ThirdStep indexTableDataSet={indexTableDataSet} fieldTableDataSet={fieldTableDataSet} />
        ),
      },
    ];
    return (
      <div className={styles['positive-table']}>
        <div>{steps[step].content}</div>
      </div>
    );
  }
);
