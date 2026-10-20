import { setLayout } from './layout';

// 注入 hzero-front 时 注入 自定义的 layouts
// 侧边平铺布局
setLayout('inline', async () => import('../layouts/DefaultLayout'));
// 上方菜单布局
setLayout('horizontal', async () => import('../layouts/TopLayout'));
// 侧边级联布局
setLayout('side', async () => import('../layouts/SideLayout'));
// 侧边展开布局
setLayout('side-all', async () => import('../layouts/CommonLayout'));
// 新主题布局
setLayout('new', async () => import('../layouts/NewLayout'));
// 注入 hzero-front 时 注入 自定义的 layouts
