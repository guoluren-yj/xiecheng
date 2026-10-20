import React, { Fragment, useContext } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import Bill from './Bill';
import Supplier from './Supplier';
import Matter from './Matter';
import { Store } from '../../stores';
import styles from './index.less';
/**
 * 综合单据分类
 * @param {*}
 * @returns
 */
const Index = (props) => {
  const { handleQueryPanel } = props;
  const { userRequest, loading } = useContext(Store);
  const { billData, supplierData, itemData } = userRequest;
  return (
    <Fragment>
      <div
        className={styles['srm-card-wrapper']}
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        <Spin spinning={loading}>
          <div>
            {!isEmpty(billData) && <Bill handleQueryPanel={handleQueryPanel} />}
            {!isEmpty(supplierData) && <Supplier handleQueryPanel={handleQueryPanel} />}
            {!isEmpty(itemData) && <Matter handleQueryPanel={handleQueryPanel} />}
          </div>
        </Spin>
      </div>
    </Fragment>
  );
};
export default Index;
