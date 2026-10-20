import React, { Fragment } from 'react';
import { Table, Tag, Tooltip } from 'hzero-ui';
import { Popconfirm } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { deleteLanguageTranslate } from '@/services/promptTranslateService';

const isTenant = isTenantRoleLevel();
function List(props) {
  const { dataList, languageInfo = [], pagination, handleSearch, loading, handleModal } = props;

  const handleDelete = (record = {}) => {
    deleteLanguageTranslate(record).then((res) => {
      const response = getResponse(res);
      if (response && response.statusCodeValue === 200) {
        notification.success();
        handleSearch();
      }
    });
  };

  const getColumns = () => {
    let baseColumns = [
      {
        title: intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码'),
        width: 200,
        dataIndex: 'promptKey',
      },
      {
        title: intl.get('hpfm.prompt.model.prompt.promptCode').d('代码'),
        align: 'left',
        width: 200,
        dataIndex: 'promptCode',
      },
    ];
    if (!isTenant) {
      baseColumns = [
        ...baseColumns,
        {
          title: intl.get('entity.tenant.code').d('租户编码'),
          align: 'left',
          width: 120,
          dataIndex: 'tenantNum',
        },
        {
          title: intl.get('entity.tenant.name').d('租户名称'),
          align: 'left',
          width: 200,
          dataIndex: 'tenantName',
        },
      ];
    } else {
      baseColumns = [
        ...baseColumns,
        {
          title: intl.get('hzero.common.source').d('来源'),
          align: 'left',
          width: 120,
          dataIndex: 'origin',
          render: (text, record) => (
            <Tag color={record.tenantId === 0 ? 'orange' : 'green'}>{text}</Tag>
          ),
        },
      ];
    }
    const languageColumns = languageInfo.map((info) => {
      return {
        title: info.description,
        width: 150,
        align: 'left',
        dataIndex: info.code,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      };
    });
    return [
      ...baseColumns,
      ...languageColumns,
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        fixed: 'right',
        render: (val, record) => (
          <>
            <a onClick={() => handleModal(record, true)}>
              {intl.get('hzero.common.button.maintain').d('维护')}
            </a>
            {/* 租户级预定义不能删除 */}
            {!isTenant || (record.tenantId === 0 && isTenant) ? (
              ''
            ) : (
              <>
                &nbsp;&nbsp;
                <Popconfirm
                  title={intl
                    .get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm')
                    .d('确认删除吗?')}
                  onConfirm={() => {
                    handleDelete(record);
                  }}
                >
                  <a>{intl.get('hzero.common.button.detele').d('删除')}</a>
                </Popconfirm>
              </>
            )}
          </>
        ),
      },
    ];
  };

  return (
    <Fragment>
      <Table
        bordered
        loading={loading}
        pagination={pagination}
        columns={getColumns()}
        dataSource={dataList}
        rowKey="tempId"
        onChange={handleSearch}
      />
    </Fragment>
  );
}

export default List;
