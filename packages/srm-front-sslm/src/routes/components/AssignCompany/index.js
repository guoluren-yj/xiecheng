/*
 * AssignCompany - 调查表模板配置 - 分配公司
 * @Date: 2023-06-26 10:49:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isFunction, isEmpty } from 'lodash';
import React, { Fragment, useEffect, useCallback } from 'react';
import { Table, useDataSet, Form, Select, Lov, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { assignCompany } from '@/services/orgInvestigateTemplateService';
import { getFormDS, getTableDS, getColumns } from './getIndexDS';

const Index = ({ record, onRef }) => {
  const templateCode = isFunction(record.get) ? record.get('templateCode') : record.templateCode;
  const assignMenuScope = isFunction(record.get)
    ? record.get('assignMenuScope')
    : record.assignMenuScope;
  const formDs = useDataSet(() => getFormDS(), []);
  const tableDs = useDataSet(() => getTableDS(), []);

  useEffect(() => {
    tableDs.setQueryParameter('templateCode', templateCode);
    tableDs.query();
    formDs.current.set({
      assignMenuScope: assignMenuScope ? assignMenuScope.split(',') : null,
    });
    onRef(formDs);
  }, []);

  const handleAssignCompany = useCallback(records => {
    if (isEmpty(records)) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    } else {
      const companyList = records.map(item => item.toData());
      return new Promise((resolve, reject) => {
        assignCompany({ companyList, templateCode }).then(response => {
          const res = getResponse(response);
          if (res) {
            tableDs.query();
            resolve();
          } else {
            reject();
          }
        });
      });
    }
  }, []);

  const getButtons = useCallback(() => {
    return [
      <Lov
        mode="button"
        funcType="flat"
        name="assignCompany"
        clearButton={false}
        dataSet={tableDs}
        onBeforeSelect={records => handleAssignCompany(records)}
      >
        <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
        {intl.get('hzero.common.button.add').d('新增')}
      </Lov>,
      'delete',
    ];
  }, []);

  return (
    <Fragment>
      <Form columns={1} dataSet={formDs} labelLayout="float" style={{ marginBottom: 16 }}>
        <Select name="assignMenuScope" maxTagCount={4} />
      </Form>
      <Table
        dataSet={tableDs}
        columns={getColumns()}
        buttons={getButtons()}
        style={{ maxHeight: 'calc(100vh - 310px)' }}
        customizedCode="sslm-investigation-assign-company" // 没有个性化编码用这种方式实现配置
      />
    </Fragment>
  );
};

export default Index;
