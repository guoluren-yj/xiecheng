import React, { Component } from 'react';
import SupplierItem from './SupplierItem';
import styles from './index.less';

export default class SupplierList extends Component{
  constructor(props){
    super(props);

  }
  render() {
    const { children, list = [], fetchTabList = () => {}, currentId = '' } = this.props;
    return (
      <div style={{ display: 'flex' }}>
        <div className={styles['supplier-box']}>
          {
            list.map(item => <SupplierItem {...item } fetchTabList={fetchTabList} currentId={currentId} />)
          }
        </div>
        <div className={styles['import-box']}>{children}</div>
      </div>
    );
  }
}