/**
 * 页面字段关系查询 平台级
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { compose } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { DataSet } from 'choerodon-ui/pro';

import { SRM_DATA_SDAT } from '@/utils/config';

import { FieldListDS } from './stores/fieldRelationshipDS';
import CustomizeTableComp from './CustomizeTableComp';

import styles from './index.less';

function FieldRelationshipQuery(props) {
  const { listDS } = props;

  const queryParams = () => {
    const param = listDS?.queryDataSet?.toData() ?? {};
    return { ...param };
  };

  return (
    <div className={styles['field-relation-page-basic']}>
      <Header
        title={intl
          .get('sdat.fieldRelationship.view.title.fieldRelationshipQuery')
          .d('页面字段关系查询')}
      >
        <ExcelExportPro
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            style: { border: 'none' },
          }}
          defaultSelectAll
          requestUrl={`${SRM_DATA_SDAT}/v1/rule-define-site/rule-export`}
          queryParams={queryParams}
          buttonText={intl.get('hzero.common.button.confirm.export').d('导出')}
        />
      </Header>
      <Content>
        <CustomizeTableComp dataSet={listDS} {...props} />
      </Content>
    </div>
  );
}

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SDAT.FIELD_RELATIONSHIP_QUERY_LIST`,
      // `SDAT.FIELD_RELATIONSHIP_QUERY_LIST_SEARCHBAR`, // 标签页
      // 'SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED_FILTER'
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
