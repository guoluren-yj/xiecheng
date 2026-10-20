import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { Table, DataSet, Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

import { fetchPreviewData } from '@/services/quotationTemplateNewService';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.quotationTemplate';

const tableDs = ({ templateId, handleDataSource }) => ({
  primaryKey: 'templateDetailId',
  paging: 'server',
  idField: 'templateDetailId',
  parentField: 'parentDetailId',
  expandField: 'expand',
  selection: false,
  fields: [
    {
      label: intl.get(`${promptCode}.model.template.configCode`).d('报价明细项编码'),
      name: 'configCode',
    },
    {
      label: intl.get(`${promptCode}.model.template.configName`).d('报价明细项名称'),
      name: 'configName',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/quotation-column/${templateId}/line`,
        method: 'GET',
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const { content = [], ...pages } = result;
            const data = handleDataSource(content);
            return { ...pages, content: data };
          }
        },
      };
    },
  },
});

export default function Preview({ templateId, moduleRule }) {
  const tableDsRef = useRef(new Map());
  const moduleListRef = useRef([]);
  const [dynamicColumns, setDynamicColumns] = useState({});
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    setQueryLoading(true);
    fetchPreviewData({ templateId })
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 缓存moduleList数据
          moduleListRef.current = result;
          let columns = {};
          result.forEach((item) => {
            tableDsRef.current.set(
              item.templateId,
              new DataSet(tableDs({ templateId: item.templateId, handleDataSource }))
            );
            columns = { ...columns, [item.templateId]: handleDynamicColumns(item) };
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current
              ?.get(item.templateId)
              ?.loadData(
                handleDataSource(item?.supQuotationDetailPage?.content),
                item?.supQuotationDetailPage?.totalElements
              );
          });
          setDynamicColumns(columns);
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 处理数据
  const handleDataSource = (source = []) => {
    if (isEmpty(source)) return [];
    const restructureSource = source.map((item) => {
      let elementValue = {};
      const { quotationColumns = [], ...otherItem } = item;
      // eslint-disable-next-line no-unused-expressions
      quotationColumns?.forEach((newItem) => {
        elementValue = {
          ...elementValue,
          [newItem.columnCode]: renderColumnValue(item, newItem),
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        quotationColumns,
        expand: false, // 控制树形是否默认展开
      };
    });
    return restructureSource;
  };

  /**
   * 渲染单元格值
   */
  const renderColumnValue = (item = {}, elementItem = {}) => {
    let value = elementItem.supQuotationColumnValue;
    if (item.quotationDetailType === 'NO') {
      value = elementItem.columnDefaultValue;
    }
    return value;
  };

  // 设置动态列
  const handleDynamicColumns = (data = {}) => {
    const { quotationColumns = [] } = data || {};
    const columns = [];
    quotationColumns.forEach((item) => {
      // visible过滤
      // if (item.visible === 1 || item.visible === 2) {
      // eslint-disable-next-line no-unused-expressions
      tableDsRef.current?.get(data.templateId).addField(item.columnCode, {
        name: item.columnCode,
        label: item.columnName,
        ...renderFieldType(item),
      });
      columns.push({
        name: item.columnCode,
        width: 150,
      });
      // }
    });
    return columns;
  };

  // 渲染类型
  const renderFieldType = (field = {}) => {
    let fieldConfig = {};

    switch (field.componentType) {
      case 'Input':
      case 'TextArea':
        // case 'Upload':
        fieldConfig = {
          type: 'string',
        };
        break;
      case 'InputNumber':
        fieldConfig = {
          type: 'number',
        };
        break;
      default:
        fieldConfig = {
          type: 'string',
        };
        break;
    }
    return fieldConfig;
  };

  const getColumns = useCallback(
    (id) => [
      {
        name: 'configCode',
        width: 150,
      },
      {
        name: 'configName',
        width: 130,
      },
      ...(dynamicColumns?.[id] || []),
    ],
    [dynamicColumns]
  );

  return (
    <Fragment>
      {/* <h2 style={{ textAlign: 'center' }}>{templateName}</h2> */}
      <Spin spinning={queryLoading}>
        {moduleRule === 'SUB_MODULE' &&
          moduleListRef.current?.map((item) => (
            <Fragment>
              <h3
                style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center' }}
              >
                <div className={styles['card-sub-title-line']} />
                <div>{item.templateName}</div>
              </h3>
              <Table
                customizable
                customizedCode='code'
                mode="tree"
                dataSet={tableDsRef?.current?.get?.(item.templateId) || new DataSet({})}
                columns={getColumns(item.templateId) || []}
                style={{ maxHeight: '430px', marginBottom: '32px' }}
              />
            </Fragment>
          ))}
        {moduleRule === 'NO_DISTINCTION' && (
          <Table
            customizable
            customizedCode='code'
            mode="tree"
            dataSet={tableDsRef.current?.get(templateId) || new DataSet({})}
            columns={getColumns(templateId)}
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        )}
      </Spin>
    </Fragment>
  );
}
