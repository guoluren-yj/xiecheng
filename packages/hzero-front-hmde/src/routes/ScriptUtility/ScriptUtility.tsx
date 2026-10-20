/**
 * 脚本应用
 */
import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './index.less';
import Context from '@/routes/ScriptUtility/store';
import FrontPage from './FrontPage';
import AddPage from './AddPage';

export default observer((props: any) => {
  const { history } = props;
  const { store } = useContext<any>(Context);

  // 使用页面 //
  const currentPage = useMemo(() => {
    return getPage(store.state.currentPage, history);
  }, [store.state.currentPage]);

  return <div className={styles['script-utility']}>{currentPage}</div>;
});
function getPage(pageName: 'front' | 'add', history) {
  switch (pageName) {
    case 'front':
      return <FrontPage history={history} />;
    case 'add':
      return <AddPage history={history} />;
    default:
      return <FrontPage history={history} />;
  }
}
