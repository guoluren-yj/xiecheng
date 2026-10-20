/**
 * 页面字段关系查询 租户级
 */
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { compose } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { DataSet } from 'choerodon-ui/pro';

import { SRM_DATA_SDAT } from '@/utils/config';
// import { getResponse } from '@/utils/utils';
import { fetchOrderStatus } from '@/services/fieldQueryService';

import { FieldListDS } from './stores/fieldRelationshipDS';
import CustomizeTableComp from './CustomizeTableComp';

function FieldRelationshipQuery(props) {
  const { listDS } = props;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchOrderStatus().then((res) => {
      if (res && !res.failed) {
        setIsOpen(true);
      }
    });
  }, []);

  const queryParams = () => {
    const param = listDS?.queryDataSet?.toData()[0] ?? {};
    return { ...param, tenantId: getCurrentOrganizationId() };
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.fieldRelationship.view.title.fieldRelationshipQuery')
          .d('页面字段关系查询')}
      >
        {isOpen ? (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              style: { border: 'none' },
            }}
            defaultSelectAll
            requestUrl={`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/page-field-relation/field-export`}
            queryParams={queryParams}
            templateCode="SDAT.PAGE_FIELD_RELATION_EXPORT"
            buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
          />
        ) : null}
      </Header>
      <Content>
        {isOpen ? (
          <CustomizeTableComp dataSet={listDS} {...props} />
        ) : (
          <div
            style={{
              height: 'calc(100vh - 185px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            {intl
              .get('sdat.fieldRelationship.view.message.notOpenOrder')
              .d('您未开通云仓一体服务或服务已过期，请联系管理员。')}
          </div>
        )}
      </Content>
    </>
  );
}

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SDAT.ORG_FIELD_RELATIONSHIP_QUERY.LIST`,
      `SDAT.ORG_FIELD_RELATIONSHIP_QUERY.QUERYBAR`, // 标签页
    ],
  }),
  withProps(
    () => {
      const listDS = new DataSet(FieldListDS());

      return {
        listDS,
      };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  ),
  formatterCollections({
    code: ['sdat.fieldRelationship'],
  })
)(FieldRelationshipQuery);
