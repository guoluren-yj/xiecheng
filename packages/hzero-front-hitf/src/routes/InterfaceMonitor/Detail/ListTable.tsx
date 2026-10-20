import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import intl from 'hzero-front/lib/utils/intl';
import { isEmpty } from 'lodash';
import { TableColumnTooltip, SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { Tag } from 'hzero-ui';
import { DataSet, Modal, CodeArea } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { filterFormDs } from '@/stores/InterfaceMonitor/DetailDs';
import { handleReSend } from '@/services/InterfaceMonitorService';
import notification from 'hzero-front/lib/utils/notification';
import { fetchErrorMessage } from '@/services/InterfaceMonitorService';
// @ts-ignore
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();
const currentDate = new Date();
const month = currentDate.setMonth(currentDate.getMonth() - 3);
const setDate = new Date(month);

interface ListTableProps {
  dynamicSearch: Array<any>,
  tenantInterfaceId: number | string,
  dynamicColumn: Array<any>,
  executeResultOptions: Array<any>,
  interfaceTypeOptions: Array<any>,
  responseStatusOptions: Array<any>,
  history: any,
  tableDs: DataSet,
  searchDs: DataSet,
}

const ListTable: React.FC<ListTableProps> = ({
  dynamicSearch = [],
  tenantInterfaceId,
  dynamicColumn = [],
  // executeResultOptions = [],
  // interfaceTypeOptions = [],
  // responseStatusOptions = [],
  history,
  tableDs,
  searchDs,
}) => {
  const filterBarRef = useRef<any>();
  const [formDs] = useState(new DataSet(filterFormDs()));
  const [fieldsArr, setFieldsArr] = useState<any[]>([]);
  useEffect(() => {
    // 判断是否存在接口id，如果存在接口id，根据id查监控详情
    if (tenantInterfaceId) {
      tableDs.setState('tenantInterfaceId', tenantInterfaceId);
      formDs.reset();
      tableDs.setQueryParameter('queryParams', {
        tenantInterfaceId,
        tenantId: !isTenant && searchDs.current ? searchDs.current.get('tenantId') : null,
      });
      const originPage = window.sessionStorage.getItem('detailListPage');
      if (originPage) {
        if (tableDs) {
          tableDs.currentPage = parseInt(originPage, 10);
        }
        window.sessionStorage.removeItem('detailListPage');
      }
      // 避免切换接口查两次
      // tableDs.query(tableDs?.currentPage);
    } else {
      tableDs.setState('tenantInterfaceId', '');
    }
  }, [tenantInterfaceId, searchDs]);

  const fieldsArrOrigin = [
    // {
    //   name: 'interfaceName',
    //   type: FieldType.string,
    //   label: intl.get('hitf.interfaceMonitor.model.interfaceName').d('接口名称'),
    //   display: true,
    // },
    {
      name: 'dataExecuteResult',
      type: FieldType.string,
      label: intl.get('hitf.interfaceMonitor.model.dataExecuteResult').d('数据执行结果'),
      display: true,
      lookupCode: 'HITF.OPEN_DATA_RESULT',
    },
    {
      name: 'interfaceType',
      type: FieldType.string,
      label: intl.get('hitf.interfaceMonitor.model.interfaceType').d('接口类型'),
      display: true,
      lookupCode: 'SOPP.INTERFACE_TYPE',
    },
    {
      name: 'insideBatchNum',
      type: FieldType.string,
      label: intl.get('hitf.interfaceMonitor.model.batchCode').d('请求编码'),
      display: true,
    },
    {
      name: 'requestTime',
      type: FieldType.dateTime,
      multiple: true,
      label: intl.get('hitf.interfaceMonitor.model.requestTime').d('请求时间'),
      display: true,
      required: true,
      defaultValue: [setDate],
    },
    // {
    //   name: 'triggerType',
    //   type: FieldType.string,
    //   label: intl.get('hitf.interfaceMonitor.trigger.type').d('触发类型'),
    //   display: true,
    // },
  ];

  useEffect(() => {
    dynamicSearch.forEach(item => {
      fieldsArrOrigin.splice(0, 0, {
        name: item.name,
        label: item.title,
        display: true,
        type: FieldType.string,
      });
    });
    setFieldsArr(fieldsArrOrigin);
  }, [dynamicSearch]);

  // const handleSearch = (params?: any) => {
  //   const { requestTime = '', insideBatchNum = '' } = params || {};
  //   const requestTimeArr = requestTime ? requestTime.split(',') : [];
  //   const filterValues = omit(params, ['__dirty', 'requestTime']);
  //   tableDs.setQueryParameter('queryParams', {
  //     ...filterValues,
  //     requestTimeFrom: isEmpty(requestTimeArr) ? null : requestTimeArr[0],
  //     requestTimeTo: isEmpty(requestTimeArr) ? null : requestTimeArr[1],
  //     // interfaceCode: interfaceName,
  //     externalBatchNum: insideBatchNum,
  //     tenantInterfaceId,
  //     tenantId: !isTenant && searchDs.current ? searchDs.current.get('tenantId') : null,
  //   });
  //   tableDs.query(tableDs?.currentPage);
  // };

  // tag标签渲染表格内容
  const TagRender = ({ value }) => {
    let tagStyle = '';
    let text = '';
    if (value === 'SUCCESS') {
      tagStyle = 'tag-green';
      text = intl.get('hzero.common.status.success').d('成功');
    } else if (value === 'ERROR') {
      tagStyle = 'tag-red';
      text = intl.get('hzero.common.status.failure').d('失败');
    } else if (value === 'NEW') {
      tagStyle = 'tag-yellow';
      text = intl.get('hzero.common.button.creat').d('新建');
    } else if (value === 'RUNNING') {
      tagStyle = 'tag-blue';
      text = intl.get('hzero.common.executing').d('执行中');
    }
    return useMemo(() => {
      return (<Tag className={styles[tagStyle]}>{text}</Tag>);
    }, [value]);
  };

  // 点击查看错误信息弹窗
  const handleOpenModal = useCallback(
    async ({ record }) => {
      const response = await fetchErrorMessage(record.get('monitorDetailId'));
      const res = getResponse(response);
      if (res) {
        Modal.open({
          drawer: true,
          closable: true,
          style: {
            width: '800px',
          },
          destroyOnClose: true,
          title: intl.get('hitf.interfaceMonitor.modal.title.errorMessage').d('查看错误信息'),
          children: (
            <CodeArea readOnly value={res.errorMessage} style={{ height: 'calc(100vh - 1.6rem)' }} />
          ),
        });
      }
    },
    [Modal],
  );

  // 单条数据重新执行
  const reExecute = (record) => {
    const params: any = {
      monitorDetailId: record.get('monitorDetailId'),
    };
    const tenantId = searchDs.current ? searchDs.current.get('tenantId') : null;
    handleReSend(isTenant ? { ...params } : { ...params, tenantId }).then(res => {
      const response = getResponse(res);
      if (response) {
        notification.success({});
        tableDs.query();
        // handleSearch();
      }
    });
  };

  // 跳转报文详情页面，detail表示从监控详情跳转过去的
  const toParameterDetail = (record) => {
    const id = record && record.get('monitorDetailId');
    const tenantId = !isTenant && searchDs.current ? `/${searchDs.current.get('tenantId')}` : '';
    history.push({
      pathname: `/hitf/interface-monitor-workbench${isTenant ? '' : '-platform'}/parameter-detail/detail/${id}${tenantId}`,
    });
    window.sessionStorage.setItem('detailListPage', (tableDs.currentPage || 1).toString());
  };

  const handleColumns = (columns) => [
    ...columns,
    {
      name: 'operate',
      width: 100,
      renderer: ({ record }) => {
        if (record && !(record.get('interfaceType') === 'EXPORT' || record.get('dataExecuteResult') === 'SUCCESS' || record.get('dataExecuteResult') === 'RUNNING')) {
          return (
            <span
              className={styles['link-span']}
              onClick={() => reExecute(record)}
            >
              {intl.get('hitf.interfaceMonitor.button.reExecute').d('重新执行')}
            </span>
          );
        }
      },
    },
    {
      name: 'dataExecuteResult',
      width: 120,
      tooltip: TableColumnTooltip.overflow,
      renderer: ({ value }) => {
        return value && <TagRender value={value} />;
      },
    },
    {
      name: 'executeErrorMessage',
      width: 100,
      renderer: ({ record }) => {
        if (record && record.get('dataExecuteResult') === 'ERROR') {
          return (
            <span
              className={styles['link-span']}
              onClick={() => handleOpenModal({ record })}
            >
              {intl.get('hitf.interfaceMonitor.model.common.view').d('查看')}
            </span>
          );
        }
      },
    },
    {
      name: 'parameterDetail',
      width: 100,
      renderer: ({ record }) => {
        return (
          <span
            className={styles['link-span']}
            onClick={() => toParameterDetail(record)}
          >
            {intl.get('hitf.interfaceMonitor.model.common.view').d('查看')}
          </span>
        );
      },
    },
    {
      name: 'interfaceCode',
      width: 190,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'interfaceName',
      width: 120,
      tooltip: TableColumnTooltip.overflow,
    },
    // {
    //   name: 'triggerType',
    //   width: 100,
    //   tooltip: TableColumnTooltip.overflow,
    // },
    {
      name: 'traceId',
      width: 90,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'interfaceType',
      width: 100,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'insideBatchNum',
      width: 150,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'externalBatchNum',
      width: 150,
      tooltip: TableColumnTooltip.overflow,
    },
    {
      name: 'requestTime',
      width: 140,
      tooltip: TableColumnTooltip.overflow,
    },
  ];

  const columns = useMemo(
    (): ColumnProps[] => handleColumns(dynamicColumn),
    [dynamicColumn, tenantInterfaceId],
  );

  const setDefaultValue = useCallback(() => {
    if (filterBarRef && filterBarRef.current) {
      filterBarRef.current.setField('requestTime', [setDate]);
    }
  }, []);

  const formRender = useMemo(() => {
    return (
      <FilterBarTable
        key={tenantInterfaceId}
        border={false}
        columns={columns}
        dataSet={tableDs}
        cacheState
        selectionMode={SelectionMode.none}
        filterBarRef={ref => { filterBarRef.current = ref; }}
        filterBarConfig={{
          fields: fieldsArr,
          cacheKey: tenantInterfaceId as string,
          // onQuery: ({ params }) => handleSearch(params),
          // 若设置false则无法获取最新筛选值
          // autoQuery: false,
          onClear: setDefaultValue,
        }}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -50 }}
      />
    );
  }, [fieldsArr, tenantInterfaceId]);

  return (
    <>
      {formRender}
    </>
  );
};


export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(ListTable));
