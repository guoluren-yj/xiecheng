import FilterBarTable from '_components/FilterBarTable';
import { Header, Content } from 'components/Page';
import React, { useMemo } from 'react';
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const AiRequestQuery = function() {
  const ds = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        selection: false,
        pageSize: 20,
        queryFields: [
          { name: 'commonCondition', type: 'string', merge: true },
          {
            name: 'requestDateFrom',
            type: 'date',
            label: intl.get('sprm.aiSource.model.requestDateFrom').d('需求时间从'),
            max: 'requestDateTo',
            display: true,
            transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
          },
          {
            name: 'requestDateTo',
            type: 'date',
            label: intl.get('sprm.aiSource.model.requestDateTo').d('需求时间至'),
            min: 'requestDateFrom',
            display: true,
            transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
          },
        ],
        fields: [
          {
            name: 'displayLineNum',
            type: 'string',
            label: intl.get('sprm.common.model.common.lineNumber').d('行号'),
          },
          {
            name: 'displayPrNum',
            type: 'string',
            label: intl.get('sprm.common.model.common.prNum').d('申请编号'),
          },
          {
            name: 'itemCode',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemCode').d('物料编码'),
          },
          {
            name: 'itemName',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemName').d('物料名称'),
          },
          {
            name: 'quantity',
            type: 'string',
            label: intl.get('sprm.common.model.common.quantity').d('数量'),
          },
          {
            name: 'companyName',
            type: 'string',
            label: intl.get('sprm.common.model.common.companyName').d('公司'),
          },
          {
            name: 'ouName',
            type: 'string',
            label: intl.get('sprm.common.model.common.ouName').d('业务实体'),
          },
          {
            name: 'requestDate',
            type: 'string',
            label: intl.get('sprm.common.model.common.neededDate').d('需求日期'),
          },
        ],
        transport: {
          read: {
            url: `/sprm/v1/${getCurrentOrganizationId()}/agent/pr-transfer/query/pr-to-po`,
            method: 'post',
          },
        },
      }),
    []
  );

  const columns = useMemo(
    () => [
      { name: 'displayLineNum' },
      { name: 'displayPrNum' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'quantity' },
      { name: 'companyName' },
      { name: 'ouName' },
      { name: 'requestDate' },
    ],
    []
  );

  return (
    <>
      <Header title={intl.get('sprm.aiSource.view.title.requestQuery').d('申请查询')} />
      <Content>
        <FilterBarTable dataSet={ds} columns={columns} searchCode="AIRREQUESTQUERY.SEARCH" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'sprm.aiSource'],
})(AiRequestQuery);
