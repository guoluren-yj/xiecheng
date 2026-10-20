/**
 * @author: Danica <ke.wang01@gonig-link.com>
 * @since: 2021-06-24 14:23:03
 * @lastTime: 2021-06-25 14:27:58
 * @description: 自定义多语言弹窗
 * @copyright: Copyright (c) 2020, Hand
 */

import React from 'react';
import { Tabs, RichText } from 'choerodon-ui/pro';
import { observer, useComputed } from 'mobx-react-lite';
import UploadImage from './UploadImage';
import styles from './setting.less';

const { TabPane } = Tabs;

export default observer((props) => {
  const { type, record, languageList } = props;
  const isUpload = type === 'upload';
  const formatterSource = useComputed(
    () =>
      languageList.map((item) => ({
        type: item.code,
        data: { ...record.get(item.code) },
        name: item.description,
      })),
    [record]
  );
  return (
    <div className={styles['formatter-from-modal']}>
      <Tabs>
        {formatterSource.map((item) => (
          <TabPane tab={item.name} key={item.type}>
            {isUpload ? (
              <UploadImage result={item} record={record} />
            ) : (
              <RichText
                record={record}
                name={item.type}
                style={{ height: "calc(100vh - 220px)" }}
                defaultValue={item.data}
              />
            )}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
});
