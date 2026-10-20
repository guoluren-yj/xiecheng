import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { TableColumnTooltip, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel, getResponse } from 'hzero-front/lib/utils/utils';
import { Tag } from 'hzero-ui';
import { TextField, DataSet, Modal, CodeArea, Lov } from 'choerodon-ui/pro';

import interfaceMonitor from '@/models/interfaceMonitor';
import { fetchErrorMessage } from '@/services/InterfaceMonitorService';

// @ts-ignore
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();
const currentDate = new Date();
const month = currentDate.setMonth(currentDate.getMonth() - 3);
const setDate = new Date(month);

interface ListTableProps {
  tableDs: DataSet,
  history: any,
}

const ListTable: React.FC<ListTableProps> = ({ tableDs, history }) => {
  const searchBarRef = useRef<any>();

  useEffect(() => {
    tableDs.query(tableDs?.currentPage);
  }, []);
  // 检索
  // const handleSearch = (params) => {
  //   const { insideBatchNum, interfaceName } = params;
  //   const rangeDate = params.requestTime_range;
  //   let filterValues = params;
  //   filterValues = omit(filterValues, ['__dirty', 'requestTime_range']);
  //   tableDs.setQueryParameter('queryParams', {
  //     ...filterValues,
  //     requestTimeFrom: rangeDate ? rangeDate.split(',')[0] : null,
  //     requestTimeTo: rangeDate ? rangeDate.split(',')[1] : null,
  //     interfaceCode: interfaceName,
  //     externalBatchNum: insideBatchNum,
  //   });
  //   tableDs.query(tableDs?.currentPage);
  // };

  // 状态渲染
  const TagRender = ({ value, type }) => {
    let tagStyle = '';
    let text = '';
    if (type === 'responseStatus') {
      if (value === 'SUCCESS') {
        tagStyle = 'tag-green';
        text = intl.get('hzero.common.status.success').d('成功');
      } else if (value === 'ERROR') {
        tagStyle = 'tag-red';
        text = intl.get('hzero.common.status.failure').d('失败');
      } else if (value === 'PARTIAL_SUCCESS') {
        tagStyle = 'tag-yellow';
        text = intl.get('hzero.common.partially.successful').d('部分成功');
      } else if (value === 'RUNNING') {
        tagStyle = 'tag-blue';
        text = intl.get('hzero.common.executing').d('执行中');
      }
    }
    if (type === 'status') {
      if (value === 'NEW') {
        tagStyle = 'tag-yellow';
        text = intl.get('hzero.common.button.creat').d('新建');
      } else if (value === 'RUNNING') {
        tagStyle = 'tag-blue';
        text = intl.get('hzero.common.status.running').d('运行中');
      } else if (value === 'ERROR') {
        tagStyle = 'tag-red';
        text = intl.get('hzero.common.status.mistake').d('错误');
      } else {
        tagStyle = 'tag-green';
        text = intl.get('hzero.common.status.success').d('成功');
      }
    }
    return useMemo(() => {
      return (<Tag className={styles[tagStyle]}>{text}</Tag>);
    }, [value, type]);
  };

  // 跳转报文详情页面，overview表示从监控总览跳转过去的
  const toParameterDetail = (record) => {
    const id = record && record.get('monitorId');
    const tenantId = !isTenant ? `/${interfaceMonitor.monitorTenantId}` : '';
    history.push({
      pathname: `/hitf/interface-monitor-workbench${isTenant ? '' : '-platform'}/parameter-detail/overview/${id}${tenantId}`,
    });
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
          destroyOnClose: true,
          title: intl.get('hitf.interfaceMonitor.modal.title.errorMessage').d('查看错误信息'),
          children: (
            <CodeArea readOnly value={res.errorMessage} />
          ),
        });
      }
    },
    [Modal],
  );

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'applicationType',
        width: 150,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'applicationName',
        width: 120,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'insideBatchNum',
        width: 120,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'externalBatchNum',
        width: 120,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'interfaceCode',
        width: 135,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'interfaceName',
        width: 130,
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
        width: 90,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'callTypeMeaning',
        width: 90,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'status',
        width: 100,
        renderer: ({ value }) => {
          return value && <TagRender value={value} type='status' />;
        },
      },
      {
        name: 'executeErrorMessage',
        width: 120,
        renderer: ({ record }) => {
          if (record && record.get('errorMessage')) {
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
        name: 'responseStatus',
        width: 100,
        renderer: ({ value }) => {
          return value && <TagRender value={value} type='responseStatus' />;
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
        name: 'requestMethod',
        width: 100,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'interactiveMethodMeaning',
        width: 100,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'requestTime',
        width: 150,
        tooltip: TableColumnTooltip.overflow,
      },
    ],
    [],
  );

  const handleTenantChange = (value) => {
    interfaceMonitor.setMonitorTenantId(value ? value.tenantId : '');
    searchBarRef.current.queryDs.getField('applicationName').setLovPara('tenantId', value ? value.tenantId : '');
  };

  const setDefaultValue = () => {
    if (searchBarRef && searchBarRef.current) {
      searchBarRef.current.setField('requestTime', [setDate]);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 242px)' }}>
      <SearchBarTable
        searchCode={isTenant ? 'HITF.INTERFACE_MONITOR_WORKBENCH.OVERVIEW.FILTER' : 'HITF.INTERFACE_MONITOR_PLATFORM.OVERVIEW.FILTER'}
        columns={columns}
        dataSet={tableDs}
        cacheState
        border={false}
        searchBarRef={ref => { searchBarRef.current = ref; }}
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <>
                  {!isTenant && (
                    <Lov
                      dataSet={dataSet}
                      name='tenantLov'
                      placeholder={
                        intl
                          .get('hitf.interfaceMonitor.select.tenant.first')
                          .d('请先选择租户')
                      }
                      onChange={handleTenantChange}
                      style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                    />
                  )}
                  <TextField
                    clearButton
                    dataSet={dataSet}
                    name='interfaceName'
                    placeholder={
                      intl
                        .get('hitf.interfaceMonitor.overview.filter.code')
                        .d('请输入接口名称查询')
                    }
                    prefix={<Icon type='search' />}
                    style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                  />
                </>
              );
            },
          },
          autoQuery: false,
          // onQuery: ({ params }) => handleSearch(params),
          fieldProps: {
            tenantLov: {
              lovCode: 'HPFM.TENANT',
              required: true,
              type: FieldType.object,
              textField: 'tenantName',
              valueField: 'tenantId',
              ignore: FieldIgnore.always,
              lovQueryAxiosConfig: () => {
                return {
                  url: `${HZERO_PLATFORM}/v1/lovs/sql/data?lovCode=HPFM.TENANT_PAGING`,
                  method: 'GET',
                  transformResponse: (data) => {
                    const res = JSON.parse(data || '{}');
                    const newContent = res.content.filter(item => item.tenantId !== "0");
                    const totalNum = res.totalElements - 1;
                    return {
                      ...res,
                      content: newContent,
                      totalElements: totalNum,
                    };
                  },
                };
              },
            },
            tenantId: {
              type: FieldType.string,
              bind: 'tenantLov.tenantId',
            },
            requestTime: {
              type: FieldType.dateTime,
              required: true,
              defaultValue: [setDate],
            },
          },
          onClear: setDefaultValue,
        }}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -90 }}
      />
    </div>
  );
};


export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(ListTable));
