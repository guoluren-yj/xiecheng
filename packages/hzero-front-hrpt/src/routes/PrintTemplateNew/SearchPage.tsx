/* eslint-disable react/display-name */
import React, { memo, useMemo, useContext } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import type { normalField } from 'srm-front-boot/lib/components/FilterBarTable/util';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { observer } from 'mobx-react-lite';

import type { IStore } from './store';
import Store, { getFilterTableDsConfig, idField } from './store';
import styles from './index.less';

const SearchPage = observer(() => {
  const { setCurrentDocument, setEditing, setCurrentTemplate, setAutoOpenModal }: IStore = useContext<any>(Store).store;
  const tableDs = useMemo(() => {
    return new DataSet(getFilterTableDsConfig());
  }, []);

  const queryFields: normalField[] = useMemo(() => {
    return [
      {
        name: 'docCode',
        label: intl.get('hrpt.printTemplate.model.field.docCode').d('单据编码'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'docName',
        label: intl.get('hrpt.printTemplate.model.field.docName').d('单据名称'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'reportCode',
        label: intl.get('hrpt.printTemplate.report.reportCode').d('模板编码'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'reportName',
        label: intl.get('hrpt.printTemplate.report.reportName').d('模板名称'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'datasetCode',
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'datasetName',
        label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'),
        type: FieldType.string,
        lock: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hrpt.printTemplate.model.reportDefinition.status').d('状态'),
        type: FieldType.string,
        lock: true,
        optionsData: [
          { value: '1', meaning: intl.get('hzero.common.status.enable').d('启用') },
          { value: '0', meaning: intl.get('hzero.common.status.disable').d('禁用') },  
        ]
      },
    ];
  }, []);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => {
          const commonProps = { border: false };
          if (value) {
            return <Tag color='green' {...commonProps}>{intl.get("hzero.common.status.enabled").d("启用")}</Tag>;
          } else {
            return <Tag color='red' {...commonProps}>{intl.get("hzero.common.status.disabled").d("禁用")}</Tag>;
          }
        },
      },
      { name: 'reportCode' },
      { name: 'reportName' },
      { name: 'datasetCode' },
      { name: 'datasetName' },
      { name: 'docCode' },
      { name: 'docName' },
      { name: 'combineCode' },
      {
        name: 'operation',
        lock: ColumnLock.right,
        header: intl.get('hrpt.printTemplate.view.title.operation').d('操作'),
        width: 50,
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          return (
            <a onClick={() => {
              setEditing(true);
              setCurrentDocument({ ...record.toData(), [idField]: record.get('docCode') });
              setAutoOpenModal(true);
              setCurrentTemplate(record);
            }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
  }, []);

  return (
    <FilterBarTable
      style={{ maxHeight: "calc(100% - 36px)" }}
      className={styles['search-table']}
      dataSet={tableDs}
      columns={columns}
      customizedCode='HRPT_PRINT_TEMPLATE_DOCUMENT'
      filterBarConfig={{
        cacheKey: 'HRPT_PRINT_TEMPLATE_DOCUMENT',
        fields: queryFields,
      } as any}
    />
  );
});

export default memo(SearchPage);