import React, { useEffect, useState, useMemo } from 'react';
import { Col, Icon, Row, Timeline } from 'choerodon-ui';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentLanguage, getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { HZERO_HFLE } from 'utils/config';
import styles from './index.less';

const AttachmentHistory = (props) => {
  const {
    attachment: { url, fileName },
  } = props;
  const [opList, setOpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataSet = useMemo(() => {
    return new DataSet({
      pageSize: 10,
      dataKey: 'logs.content',
      totalKey: 'logs.totalElements',
      transport: {
        read: () => {
          return {
            url: `${HZERO_HFLE}/v1/files/${getCurrentOrganizationId()}/oplog?fileUrlOrKey=${decodeURIComponent(
              url
            )}`,
            method: 'GET',
            headers: {
              'h-request-auto-decrypt': true,
            },
          };
        },
      },
    });
  }, [url]);
  useEffect(() => {
    if (url) {
      dataSet.query();
    }
  }, [url]);

  if (dataSet.status !== 'loading' && dataSet.length === 0) {
    return intl.get('hzero.common.components.noticeIcon.null').d('暂无数据');
  }
  return (
    <Spin dataSet={dataSet}>
      <Timeline>
        {dataSet.map((line) => (
          <Timeline.Item color="#e8e8e8" className={styles['srm-attachment-history-detail']}>
            <Row>
              <Col span={2} className="history-detail-icon">
                <Icon type={line.get('opTypeCode') === 'UPLOAD' ? 'file_upload' : 'get_app'} />
              </Col>
              <Col span={22} className="history-detail-item">
                <div>
                  <span className="realName">
                    {line.get('realName')}({line.get('userName')})
                  </span>
                  <span>
                    {line.get('opType')}
                    {getCurrentLanguage() === 'zh_CN' ? '了' : undefined}
                  </span>
                  <span className="realName">{`【${fileName}】`}</span>
                </div>
                <div>{line.get('tenantName')}</div>
                <div>{dateTimeRender(line.get('date'))}</div>
              </Col>
            </Row>
          </Timeline.Item>
        ))}
      </Timeline>
    </Spin>
  );
};

export default observer(AttachmentHistory);
