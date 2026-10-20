import React, { useState, useMemo, useCallback } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { isString } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import styles from '../index.less';
import SearchInput from './SearchInput';
import TplTree from './TplTree';
import ExportUnits from './ExportUnits';
import { exportTplConfig } from '../../../../../../services/customizeConfigService';
import { isJSON } from '../../../../../../utils/util';

const treeDS = () => ({
  childrenField: 'children',
  checkField: 'isChecked',
  paging: false,
  fields: [],
});
const ExportModal = ({ modal }: {modal?}) => {
  const [checkedRecords, setCheckedRecords] = useState([] as any[]);
  const [filterStr, setFilterStr] = useState('');
  const treeDs = useMemo(() => new DataSet(treeDS() as DataSetProps), []);
  const [loading, setLoading] = useState(false);
  const handleExport = useCallback(async () => {
    if (!checkedRecords.length) {
      notification.warning({
        message: intl
          .get('hpfm.individual.message.confirm.selected.atLeastTpl')
          .d('请至少选择一个模板进行导出'),
      });
      return;
    }
    setLoading(true);
    const templateIds = checkedRecords.map(item => item.nodeKey);
    const res = await exportTplConfig(templateIds);
    if (res && isString(res)) {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
        setLoading(false);
      } else {
        const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`;
        const queryParams = [
          { name: 'url', value: res },
          { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
        ];
        downloadFileByAxios({
          requestUrl: api, queryParams,
          method: 'GET',
        })
          .then(resp => getResponse(resp))
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      notification.error({});
      setLoading(false);
    }
  }, [checkedRecords]);

  const handleCheck = useCallback(() => {
    const selectedData = treeDs.filter(r => r.get("isChecked") && r.get("type") === 'tpl').map(r => r.toData());
    setCheckedRecords(selectedData);
  }, [checkedRecords]);

  const handleUnCheckTreeRecord = useCallback(
    unCheckKey => {
      const record = treeDs.find(item => item.get("nodeKey") === unCheckKey);
      if (record) {
        record.set('isChecked', false);
      }
      const newCheckedKeys = checkedRecords.filter(r => r.nodeKey !== unCheckKey);
      setCheckedRecords(newCheckedKeys);
    },
    [checkedRecords]
  );

  return (
    <div className={styles['content-container']}>
      <div className={styles['left-content']}>
        <div className={styles['left-title']}>
          {intl.get('hpfm.individual.view.title.selectExportTpl').d('选择导出模板')}
        </div>
        <div className={styles['left-query-input']}>
          <SearchInput filterData={setFilterStr} />
        </div>
        <div className={styles['left-tree']}>
          <TplTree
            treeDs={treeDs}
            filterStr={filterStr}
            onCheck={handleCheck}
          />
        </div>
        <div className={styles['left-footer']}>
          <Button color={ButtonColor.primary} onClick={handleExport} loading={loading}>
            {intl.get('hzero.common.export').d('导出')}
          </Button>
          <Button disabled={loading} onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </div>
      <div className={styles['right-content']}>
        <ExportUnits
          checkedRecords={checkedRecords}
          onUnCheckTreeRecord={handleUnCheckTreeRecord}
          dataSet={treeDS}
        />
      </div>
    </div>
  );
};

export default ExportModal;
