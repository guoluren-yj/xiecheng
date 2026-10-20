import React, { useMemo, useState, useEffect } from 'react';
import { Spin, message } from 'choerodon-ui/pro';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { closeTab, getActiveTabKey } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import { HZERO_SRDM } from '@/common/config';
import styles from './index.less';

const jsonDiffPatch = require('../../utils/jsonDiffPatch.umd.min');

const ConfigObjectCompare = (props) => {
  const { objectCode } = props.match.params;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (objectCode) {
        try {
          const res = getResponse(
            await request(
              `${HZERO_SRDM}/v1/hpdm-config-objects/config-compare?objectCode=${objectCode}`
            )
          );
          setLoading(false);
          if (getResponse(res)) {
            setData(res);
          }
        } catch (error) {
          setLoading(false);
        }
      }
    })();
  }, []);

  const delta = useMemo(() => {
    const { target, origin } = data;
    if (jsonDiffPatch && origin && target) {
      const result = jsonDiffPatch.diff(origin, target);
      if (result === undefined) {
        message.warning(
          '当前数据对比无差异，即将关闭页面...',
          5,
          () => {
            closeTab(getActiveTabKey());
          },
          'top'
        );
      }
      return result;
    }
    return null;
  }, [data, jsonDiffPatch]);

  return (
    <>
      <Header title="配置对象对比" backPath="/srdm/config-object" />
      <Content className={styles['config-object-compare']}>
        <Spin spinning={loading}>
          {delta ? (
            <div
              dangerouslySetInnerHTML={{
                __html: jsonDiffPatch.formatters.html.format(delta, data.target),
              }}
            />
          ) : (
            data.message
          )}
        </Spin>
      </Content>
    </>
  );
};

export default ConfigObjectCompare;
