/*
 * @Date: 2023-08-17 20:13:04
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Lov, useDataSet } from 'choerodon-ui/pro';
import { getHeaderDS } from './stores/getHeaderDS';

import styles from './styles.less';

const HeaderBtns = ({ supplierCompanyInfo = {}, handleSupplierCompanyChange = () => {} }) => {
  const { supplierCompanyId, supplierCompanyName } = supplierCompanyInfo;
  const headerDs = useDataSet(() => getHeaderDS({}), []);

  useEffect(() => {
    init();
  }, [supplierCompanyId]);

  const init = () => {
    // 初始化默认带出一个供应商公司信息
    const supplierInfo = {
      supplierCompanyId: {
        supplierCompanyId,
        supplierCompanyName,
      },
    };
    headerDs.loadData([supplierInfo]);
  };

  // 切换供应商公司
  const handleSupplierChange = value => {
    handleSupplierCompanyChange(value);
  };

  return (
    <div className={styles['supplier-master-data-header-btn']}>
      <div className={styles['supplier-master-data-header-btn-left']}>
        <Lov
          dataSet={headerDs}
          name="supplierCompanyId"
          clearButton={false}
          searchable={false}
          onChange={value => handleSupplierChange(value)}
        />
      </div>
      <div className={styles['supplier-master-data-header-btn-right']}>
        {/* <Button
          icon="mode_edit"
          funcType="flat"
          // loading={loading}
          // onClick={() => this.handleSaveAndPublish(false)}
          // hidden={!isEdit || buttonHidden}
          wait={800}
          waitType="throttle"
        >
          {intl.get('sslm.supplierMasterData.button.change').d('变更')}
        </Button> */}
      </div>
    </div>
  );
};

export default HeaderBtns;
