/**
 * 供应商关系排查
 * @date: 2022-12-01
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useEffect, useState } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Alert, Result, Icon } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import qs from 'querystring';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';
import { queryRelationPath } from '@/services/supplierBlacklistService';
import { ReactExportButton } from './ReactExportButton';
import RelationMap from './RelationMap';

import style from './index.less';

import { getBlackListDs } from './store/relationshipDetailDs';

const { Column } = Table;
const tenantId = getCurrentOrganizationId();

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/supplier-blacklist/relation-path-export`;

function SupplierBlacklistDetail(props = {}) {
  const { key = '' } = qs.parse(props.location.search.substr(1)); // 截取url上面传递参数
  const { blackListDs } = props.valueDs;
  const [orgName, setOrgName] = useState('');
  const [totalNum, setTotalNum] = useState(null);

  useEffect(() => {
    if (key) {
      blackListDs.status = 'loading';
      queryRelationPath({ key })
        .then((res) => {
          if (getResponse(res)) {
            setTotalNum(res?.pathList?.length ?? null);
            blackListDs.loadData(res?.pathList ?? []);
            setOrgName(res?.targetName ?? '');
          }
        })
        .finally(() => {
          blackListDs.status = 'ready';
        });
    }
  }, []);

  return (
    <>
      <Header
        title={intl.get('sdat.blacklistRelationship.view.header.relationDetail').d('关系明细')}
      >
        {key && (
          <ReactExportButton
            btnText={intl.get('hzero.common.button.confirm.export').d('导出')}
            exportRequestUrl={exportRequestUrl}
            params={{ key }}
            ds={blackListDs}
            funcType="flat"
            color=""
          />
        )}
      </Header>
      <Content>
        {key ? (
          <div className={style['table-box']}>
            <Alert
              message={
                totalNum
                  ? `【${orgName}】${intl
                      .get('sdat.blacklistRelationship.view.alert.totallyHas')
                      .d('共查询到')} ${totalNum} ${intl
                      .get('sdat.blacklistRelationship.view.alert.relationPaths')
                      .d('条关联路径')}`
                  : `${intl
                      .get('sdat.blacklistRelationship.view.alert.totallyHas')
                      .d('共查询到')} 0 ${intl
                      .get('sdat.blacklistRelationship.view.alert.relationPaths')
                      .d('条关联路径')}`
              }
              type="success"
              banner
              showIcon={false}
              closable
              style={{
                textAlign: 'center',
                margin: '-16px 0 8px -16px',
                width: 'calc(100vw - 220px - 32px)',
              }}
            />
            {totalNum ? (
              <Table
                dataSet={blackListDs}
                queryBar="none"
                border={false}
                autoHeight={{ type: 'maxHeight', diff: 0 }}
                pagination={false}
              >
                <Column name="number" width={80} />
                <Column name="enterpriseName" width={200} />
                <Column name="level" width={80} />
                <Column
                  name="relationPath"
                  renderer={({ record }) => {
                    const { detailList, desc } = record?.get(['detailList', 'desc']);
                    if (!detailList) return desc;
                    // 如果 detailList 存在，那么需要绘制箭头
                    // 先按照 level 排序
                    const list = [detailList[0], detailList[1], detailList[2]];
                    list.sort((a, b) => (a?.level ?? 0) - (b?.level ?? 0));
                    return <RelationMap detailList={list} />;
                  }}
                />
              </Table>
            ) : (
              <Result
                className={style['no-data-result']}
                icon={<Icon className={style['no-data-icon']} />}
                title={<span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>}
              />
            )}
          </div>
        ) : (
          <Result
            className={style['no-data-result']}
            icon={<Icon className={style['no-data-icon']} />}
            title={<span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>}
          />
        )}
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.blacklistRelationship', 'hzero.common'],
})(
  withProps(
    () => {
      const blackListDs = new DataSet(getBlackListDs());
      const valueDs = { blackListDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SupplierBlacklistDetail)
);
