import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import Context from '@/routes/ScriptUtility/store';
import { ListItem } from 'components/Page';
import DetailPage from './Detail';
import EditPage from './Edit';
import styles from './index.less';

export default observer((props: any) => {
  const { history } = props;
  const { store } = useContext<any>(Context);

  // 使用页面 //
  const mainPage = useMemo(() => {
    return getPage(store.state.mainPage, history);
  }, [store.state.mainPage]);

  return <ListItem className={styles.main}>{mainPage}</ListItem>;
});

function getPage(pageName: 'detail' | 'edit', history) {
  switch (pageName) {
    case 'detail':
      return <DetailPage />;
    case 'edit':
      return <EditPage history={history} />;
    default:
      return <DetailPage />;
  }
}
