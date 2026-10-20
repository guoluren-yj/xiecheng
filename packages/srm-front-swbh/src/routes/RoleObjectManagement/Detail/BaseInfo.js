import React, { useEffect } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { getManagementDetail } from '@/services/roleObjectService';
import { PublishStatus } from '../../components/utils/common';
import styles from './index.less';

const BaseInfo = ({ docObjectId, tableDs }) => {
  /**
   * 父路由
   * @docObjectId --主键ID
   */
  useEffect(() => {
    getManagementDetail(docObjectId).then((res) => {
      if (getResponse(res)) {
        tableDs.loadData([res]);
      }
    });
  }, [docObjectId]);
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <h3 className={styles.title}>{intl.get('swbh.common.view.message.baseInfo').d('基础信息')}</h3>
      </div>
      <Form dataSet={tableDs} useColon={false} columns={3}>
        <Output name="combineName" colSpan={1} />
        <Output name="combineCode" colSpan={1} />
        <Output name="masterObjectName" colSpan={1} />
        <Output name="masterObjectCode" colSpan={1} />
        <Output
          name="publishStatus"
          colSpan={1}
          renderer={({ value }) => {
            const statusList = [
              {
                status: PublishStatus.PUBLISHED,
                color: 'green',
                text: intl.get('swbh.common.status.published').d('已发布'),
              },
              {
                status: PublishStatus.UNPUBLISHED,
                text: intl.get('swbh.common.status.unpublished').d('未发布'),
              },
              {
                status: PublishStatus.PENDING,
                color: 'yellow',
                text: intl.get('hmde.common.status.pending').d('待发布'),
              },
            ];
            return TagRender(value, statusList);
          }}
        />
      </Form>
      <h3 className={styles.title} style={{ margin: '18px 0 10px' }}>
        {intl.get('swbh.common.view.message.createInfo').d('创建信息')}
      </h3>
      <Form dataSet={tableDs} useColon={false} columns={3}>
        <Output
          label={intl.get('swbh.common.date.creationDate').d('创建时间')}
          renderer={({ record }) => record?.get('creationDate')}
          colSpan={1}
          newLine
        />
        <Output
          label={intl.get('swbh.common.date.lastUpdateDate').d('更新时间')}
          renderer={({ record }) => record?.get('lastUpdateDate')}
          colSpan={1}
        />
      </Form>
    </>
  );
};

export default observer(BaseInfo);
