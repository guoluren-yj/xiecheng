import { isEmpty, isNil } from 'lodash';
import React, { useState } from 'react';
import { DataSet, Modal, Button, Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

// import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableHeight } from '@/routes/components/utils';
import styles from '@/routes/index.less';

import { registerDomainDS } from '../stores/getEnterpriseManageDS';
import privateStyles from '../index.less';

const Index = ({ dataSet, searchCode, customizeUnitCode, customizeTable }) => {
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  const getColumns = () => {
    const columns = [
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'groupName',
        width: 160,
      },
      {
        name: 'tenantName',
        width: 140,
      },
      {
        name: 'unifiedSocialCode',
        width: 160,
      },
      {
        name: 'organizingInstitutionCode',
        width: 140,
      },
      {
        name: 'businessRegistrationNumber',
        width: 140,
      },
      {
        name: 'dunsCode',
        width: 140,
      },
      {
        name: 'creationDate',
        width: 160,
      },
      {
        name: 'businessType',
        width: 120,
      },
      {
        name: 'interBusinessShield',
        renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
      },
      {
        name: 'registerDomain',
        width: 120,
        renderer: ({ record }) => {
          return (
            <Button
              funcType="link"
              onClick={() => {
                handleRegisterDomain(record);
              }}
            >
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          );
        },
      },
    ];
    return columns;
  };

  // 查看域名
  const handleRegisterDomain = record => {
    if (record) {
      const companyId = record.get('sourceKey');
      const tableDs = new DataSet(registerDomainDS());
      tableDs.setQueryParameter('companyId', companyId);
      tableDs.query();
      Modal.open({
        key: Modal.key(),
        closable: false,
        movable: false,
        destroyOnClose: true,
        drawer: true,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        style: { width: 742 },
        title: intl.get('sslm.registerAuthManage.modal.user.registerDomain').d('查看注册域名'),
        children: (
          <Table
            dataSet={tableDs}
            columns={getRegisterDomainCol()}
            style={{ maxHeight: `calc(100% - 48px)` }}
            customizedCode="sslm-register-auth-manage-enterprise"
          />
        ),
        className: privateStyles['register-auth-drawer-modal'],
      });
    }
  };

  // 注册域名列字段
  const getRegisterDomainCol = () => {
    return [
      {
        name: 'tenantNum',
      },
      {
        name: 'tenantName',
      },
      {
        name: 'registerWebUrl',
      },
      {
        name: 'dataSourceMeaning',
      },
      {
        name: 'lastUpdateDate',
      },
    ];
  };

  // 查询
  const handleQuery = (queryProps = {}) => {
    const { params } = queryProps;
    if (isEmpty(params)) {
      notification.warning({
        message: intl
          .get('hzero.common.message.query.atLeast.one.condition')
          .d('请至少使用一个查询条件进行查询'),
      });
      return;
    }
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else {
      dataSet.query(dataSet.currentPage);
    }
  };

  // 清空、重置回调
  const clearValues = () => {
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  };

  return (
    <div style={{ height: tableHeight.hasTab }}>
      <Alert
        banner
        showIcon
        closable
        type="info"
        iconType="help"
        message={intl
          .get('hzero.common.message.query.atLeast.one.condition')
          .d('请至少使用一个查询条件进行查询')}
        className={styles['alert-styles']}
        style={{ marginBottom: 16, border: 0 }}
      />
      {customizeTable(
        {
          code: customizeUnitCode,
        },
        <SearchBarTable
          cacheState
          dataSet={dataSet}
          columns={getColumns()}
          searchCode={searchCode}
          style={{ maxHeight: `calc(100% - 75px)` }}
          searchBarConfig={{
            onQuery: queryProps => handleQuery(queryProps),
            onReset: () => clearValues(),
            onClear: () => clearValues(),
            onFieldChange: () => {
              setPageChacheFlag(false);
            },
          }}
        />
      )}
    </div>
  );
};

export default Index;
