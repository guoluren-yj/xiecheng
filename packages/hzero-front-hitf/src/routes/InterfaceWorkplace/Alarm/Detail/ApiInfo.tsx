import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { DataSet, TextField, Lov, Table, Select, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { ViewMode } from 'choerodon-ui/pro/lib/lov/enum';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { TableButtonType, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';

// @ts-ignore
import styles from './index.less';


interface ApiInfoProps {
  tableDs: DataSet,
}


const ApiInfo: React.FC<ApiInfoProps> = ({ tableDs }) => {
  const [selectListas, setSelectList] = useState([]);

  useEffect(() => {
    queryMapIdpValue(
      {
        fieldList: 'HITF.OPEN.FIELD_TYPE',
        fieldLists: 'HITF.OPEN_MESSAGE_SEND_TYPE',
      },
    ).then((res) => {
      const result = getResponse(res);
      setSelectList(result.fieldList);
    });
  }, [tableDs]);

  const bom = ((value) => {
    const apiRecord: any = tableDs.current;
    if (value === 'REQUEST') {
      apiRecord.set('messageSendMethod', 'SYNC');
      apiRecord.set('messageSendStartTime', null);
      apiRecord.set('messageSendCycle', null);
    }
    if (value === 'INTERFACE') {
      apiRecord.set('messageSendMethod', 'TIMI');
    }
    if (value === 'APPLICATION') {
      apiRecord.set('messageSendMethod', 'TIMI');
    }
  });

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'email',
        width: 430,
        header: (
          <span>
            {intl.get('hitf.application.email').d('通知邮箱')}
            <Tooltip
              title={() => {
                return (
                  <span>
                    {intl.get('hitf.application.email.placeholder').d('可填写多个邮箱,请用英文逗号分割')}
                  </span>
                );
              }}
            >
              <Icon
                type='help'
                style={{
                  cursor: 'pointer',
                  color: '#a5a5a5',
                  fontSize: '13px',
                }}
              />
            </Tooltip>
          </span>
        ),
        editor: () =>
          <TextField name='email' />,
      },
      {
        name: 'remark',
        editor: true,
      },
      {
        name: 'messageSendType',
        header: (
          <span>
            {intl.get('hitf.application.messageSendType').d('发送类型')}
            <Tooltip
              title={() => {
                return (
                  <span>
                    {intl.get('hitf.application.messageSendType.request').d('按请求：按照接口的单个请求为纬度实时发送告警邮件。')}
                    <br />
                    {intl.get('hitf.application.messageSendType.interface').d('按接口：按照接口下时间段请求汇集后定时发送告警邮件。')}
                    <br />
                    {intl.get('hitf.application.messageSendType.application').d('按应用：按照应用下所有接口汇集后定时发送告警邮件。')}
                  </span>
                );
              }}
            >
              <Icon
                type='help'
                style={{
                  cursor: 'pointer',
                  color: '#a5a5a5',
                  fontSize: '13px',
                }}
              />
            </Tooltip>
          </span>
        ),
        editor: () =>
          <Select onChange={bom} />,
      },
      {
        name: 'messageSendMethod',
        editor: true,
      },
      {
        name: 'messageSendStartTime',
        editor: true,
      },
      {
        name: 'messageSendCycle',
        editor: true,
      },
      {
        name: 'interfaceIds',
        width: 200,
        renderer: () => {
          return (
            <div className={styles['lov-btn']}>
              <span
                className={styles['api-link-span']}
              >
                {intl.get('hzero.common.view.button.edit').d('编辑')}
              </span>
              <Lov
                dataSet={tableDs}
                name='interfaces'
                viewMode={TriggerViewMode.drawer}
                mode={ViewMode.button}
                noCache
                selectionProps={{
                  nodeRenderer: (record)=>{
                    return <div>【{record.get('applicationName')}】{record.get('interfaceName')}</div>;
                  },
                  placeholder: intl.get('hitf.application.modal.select.placeholder').d('请勾选左侧数据'),
                }}
                modalProps={{
                  className: styles.lovModal,
                }}
                tableProps={{
                  autoHeight: {
                    type: TableAutoHeightType.minHeight,
                    diff: 0,
                  },
                }}
              />
            </div>
          );
        },
      },

    ],
    [selectListas, tableDs],
  );

  const handleDelete = useCallback(() => {
    tableDs.delete(tableDs.selected, {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？'),
    });
  }, [tableDs]);

  return (
    <>
      <Table
        columns={columns}
        dataSet={tableDs}
        buttons={[
          TableButtonType.add,
          [TableButtonType.delete, { onClick: handleDelete }],
        ]}
      />
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ApiInfo));
