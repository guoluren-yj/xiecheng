import React from 'react';
import { Header, ListContent } from 'components/Page';
import { observer } from 'mobx-react-lite';
import SideList from './SideList';
import Main from './Main';
import styles from './index.less';

export default observer((props: any) => {
  const { history } = props;

  return (
    <div className={`script-event ${styles['front-page']}`}>
      <Header title="脚本应用" />
      <ListContent className={styles['front-page-list-content']}>
        <SideList />
        <Main history={history} />
      </ListContent>
    </div>
  );
});
