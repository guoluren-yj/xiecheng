import React, { useEffect } from 'react';
import { Spin, Form, TextField, Tree, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getExportDs } from './exportDS';
import styles from './index.less';

function ExportContent(props = {}) {
  const exportDs = new DataSet(getExportDs(props));
  const { queryDs } = props;

  useEffect(() => {
    exportDs.query();
  }, []);

  const nodeRenderer = ({ record }) => {
    return {
      title: <span>{record?.get('title')}</span>,
      disableCheckbox: true,
      checkable: true,
      className: styles['export-btn-treeNode'],
    };
  };

  return (
    <Spin dataSet={exportDs}>
      <div className={styles['export-content']}>
        <div className="export-content-title">
          {intl.get('hzero.common.view.baseInfo').d('基本信息')}
        </div>
        <Form labelLayout="float" dataSet={queryDs} columns={2} className="export-search-form">
          <TextField name="fileName" />
        </Form>
        <div className="export-content-title" style={{ marginTop: '32px' }}>
          {intl.get('hzero.common.components.export.choose.a').d('要导出的列')}
        </div>
        <Tree
          dataSet={exportDs}
          // showLine={{
          //   showLeafIcon: false,
          // }}
          showIcon={false}
          checkable
          treeNodeRenderer={nodeRenderer}
        />
      </div>
    </Spin>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(ExportContent);
