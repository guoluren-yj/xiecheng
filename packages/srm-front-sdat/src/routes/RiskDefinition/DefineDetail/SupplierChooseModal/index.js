import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Icon, Tooltip } from 'choerodon-ui/pro';

import QueryBarMore from './QueryBarMore';
import styles from './index.less';

const CompanyChooseModal = (props) => {
  const { companyLovDS, selectedIds } = props;

  const [selectList, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    companyLovDS.addEventListener('select', selectEvent);
    companyLovDS.addEventListener('unSelect', selectEvent);
    companyLovDS.addEventListener('selectAll', selectEvent);
    companyLovDS.addEventListener('unSelectAll', selectEvent);

    return () => {
      companyLovDS.removeEventListener('select', selectEvent);
      companyLovDS.removeEventListener('unSelect', selectEvent);
      companyLovDS.removeEventListener('selectAll', selectEvent);
      companyLovDS.removeEventListener('unSelectAll', selectEvent);
      companyLovDS.data = [];
      companyLovDS.clearCachedSelected();
    };
  }, []);

  useEffect(() => {
    if (selectedIds && selectedIds.length) {
      companyLovDS.setQueryParameter('idList', selectedIds.join(','));
    } else {
      companyLovDS.setQueryParameter('idList', '');
    }
    companyLovDS.query();
  }, [selectedIds]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const selectEvent = ({ dataSet }) => {
    const list = dataSet.selected.map((item) => item.toData());
    setList(list || []);
  };

  /**
   * 删除列表中的某条数据
   */
  const handleRemoveItem = (item) => {
    if (companyLovDS.selected.length) {
      const record = companyLovDS.filter((result) => result.get('categoryId') === item.categoryId);
      companyLovDS.unSelect(record && record.length ? record[0] : {});
    }
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (selectList.length) {
      return selectList.map((item) => {
        return (
          <div className={styles['select-item-row']} key={item.categoryId}>
            <Tooltip title={`${item.categoryCode}  ${item.categoryDescription}`}>
              <span
                style={{
                  display: 'inline-block',
                  width: '230px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {`${item.categoryDescription}`}
              </span>
            </Tooltip>
            <Icon
              type="cancel"
              style={{
                fontSize: '16px',
                color: 'rgb(140, 140, 140)',
                float: 'right',
                marginTop: '10px',
                marginRight: '16px',
              }}
              onClick={() => handleRemoveItem(item)}
            />
          </div>
        );
      });
    }
  };

  const columns = () => {
    return [{ name: 'categoryCode' }, { name: 'categoryDescription' }];
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const tableProps = {
    dataSet: companyLovDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    columns: columns(),
    queryBar: renderQueryBar,
    autoHeight: { type: 'maxHeight', diff: 20 },
  };

  return (
    <div className={styles['topic-subscribe-modal-content']}>
      <div className={styles['topic-modal-left-table']}>
        <div style={{ fontSize: '16px', fontWeight: '500' }}>
          {intl.get('sdat.riskDefinition.view.title.chooseSupplier').d('选择供应商')}
        </div>

        <div className={styles['add-subscribe-modal']}>
          <Table {...tableProps} />
        </div>
      </div>
      <div className={styles['topic-modal-select-list']}>
        <p style={{ paddingLeft: '20px', color: '#868D9C' }}>
          <span>{intl.get('sdat.riskDefinition.view.message.hasSelect').d('已选择')}</span>
          <span className={styles['risk-manager-modal-right-count']}>
            {selectList?.length ?? 0}
          </span>
          <span>{intl.get('sdat.riskDefinition.view.message.pieceOfData').d('条数据')}</span>
        </p>
        {drawSelectItem()}
      </div>
    </div>
  );
};

export default CompanyChooseModal;
