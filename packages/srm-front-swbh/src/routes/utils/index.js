import React from 'react';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { Modal } from 'choerodon-ui/pro';
import { Badge } from 'hzero-ui';
// import ALL from '@/assets/docIcon/ALL.svg';
import querystring from 'querystring';
// import todo from '@/assets/roleWorkbench/todo.svg';
// import attention from '@/assets/roleWorkbench/attention.svg';
// import history from '@/assets/roleWorkbench/history.svg';
import intl from 'utils/intl';

import styles from './index.less';

// 角色工作台单据列表tag颜色
const colorRender = (value, meaning) => {
  if (['SUBMIT_SYNC', 'EXCUTED', 'ASSIGNED', 'APPROVED'].includes(value)) {
    // 绿色
    return <Tag className={classnames('c7n-tag-has-color', styles['success-tag'])}>{meaning}</Tag>;
  } else if (['PENDING', 'EXOSYS_APPROVAL', 'WORKFLOW_APPROVAL', 'SUBMITTED'].includes(value)) {
    // 蓝色
    return <Tag className={classnames('c7n-tag-has-color', styles['notice-tag'])}>{meaning}</Tag>;
  } else if (['REJECTED', 'SEND_BACK', 'CANCELLED', 'CLOSED'].includes(value)) {
    //  红色
    return <Tag className={classnames('c7n-tag-has-color', styles['danger-tag'])}>{meaning}</Tag>;
  } else {
    // 橘色
    return <Tag className={classnames('c7n-tag-has-color', styles['warning-tag'])}>{meaning}</Tag>;
  }
};

// SWBH_card 单据图标及图标背景色
const docImgMap = new Map([
  [
    'ALL',
    {
      // 全部
      backgroundColor: '',
      iconType: 'widgets_line',
    },
  ],
  [
    'SINV',
    {
      // 物流 收发货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'local_shipping',
    },
  ],
  [
    'SINV-SLOD',
    {
      // 物流 发货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'local_shipping',
    },
  ],
  [
    'SINV-TRX',
    {
      // 物流 收货
      backgroundColor: '#FF9E01', // 橙
      iconType: 'archive',
    },
  ],
  [
    'SMALL',
    {
      // 商城
      backgroundColor: '#F56349', // 红
      iconType: 'storefront-o',
    },
  ],
  [
    'SODR',
    {
      // 订单
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'wysiwyg',
    },
  ],
  [
    'SPCM',
    {
      // 协议
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'assignment_turned_in',
    },
  ],
  [
    'SQAM',
    {
      // 质量
      backgroundColor: '#0A7DF5', // 蓝
      iconType: 'security',
    },
  ],
  [
    'SPRM',
    {
      // 需求
      backgroundColor: '#FF9E01', // 橙
      iconType: 'post_add',
    },
  ],
  [
    'SSLM',
    {
      // 供应商
      backgroundColor: '#36C2CF', // 绿
      iconType: 'supervised_user_circle',
    },
  ],
  [
    'SSRC',
    {
      // 寻源
      backgroundColor: '#36C2CF', // 绿
      iconType: 'travel_explore',
    },
  ],
  [
    'SSTA',
    {
      // 结算
      backgroundColor: '#F56349', // 绿
      iconType: 'calculate',
    },
  ],
]);

// const docMenuIconMap = new Map([
//   ['UPCOMING', todo],
//   ['ATTENTION', attention],
//   ['HISTORY', history],
// ]);

function getFlexLink(val, path = '', params = {}, search = {}, isModalPage = false, closeCb, record) {
  if (!path) {
    return;
  }
  const newSearch = querystring.stringify(search);
  const _search = `?${newSearch}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    // type,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  // 审批页面需单独添加样式
  if (path && path.includes('/hwfp')) {
    flexLinkProps.contentStyle = { height: '100%' };
  }
  Modal.open({
    key: Modal.key(),
    className: styles.flexLinkModal,
    drawer: true,
    children: <EmbedPage href={path} {...flexLinkProps} />,

    style: { minWidth: 1000, maxWidth: 'calc(100vw - 200px)' },
    bodyStyle: { padding: isModalPage ? '28px 36px' : '0' },

    header: isModalPage ? <div className={styles.flexLinkModalHeader}>{val}</div> : null,
    title: isModalPage ? val : null,
    footer: null,
    destroyOnClose: true,
    closable: true,
    maskClosable: false,
    customizable: true,
    resizable: true,
    customizedCode: 'SWBH.ROLE_WORKBENCH.LINK_MODAL',
    afterClose: (e) => {
      if (closeCb) {
        closeCb(record);
      }
    },
  });
}

function statusRender(...args) {
  const statusList = args.length > 1 && args[1] !== undefined ? args[1] : [];
  const value = args[0];
  const text = args.length > 2 && args[2] !== undefined ? args[2] : '';
  if (value === '' || value === undefined || value === null) return '';
  const currentStatus =
    statusList.find((item) => {
      return item.value === value;
    }) ||
    statusList.find((item) => {
      return item.status === 'default';
    }) ||
    {};

  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: currentStatus.status || 'default',
        text: text || currentStatus.text,
      })}
    </div>
  );
}

const config = () => {
  return [
    {
      enable: true,
      code: 'SWBH_ROLEWORKBENCH_CARD_TAB',
      type: 'strong',
      // 向导组优先级，在多个向导同时满足条件时，数值大的优先显示
      priority: 2,
      version: 1,
      title: '导航卡片',
      delay: 1000,
      // 是否为可选步骤，当该选项为true时，向导组内的各步骤遵循哪一步满足条件哪一步显示，直到整个向导组均已被阅读过为止
      // optionalSteps: true,
      steps: [
        {
          selector: '.swbh-card-tab',
          title: '提示',
          htmlText: intl
            .get('swbh.common.model.common.guide.cardTab')
            .d(
              '【导航卡片】总览各模块待处理任务数量、待阅读单据消息数量等信息，点击导航卡片可以切换对应模块（下方列表内容联动切换）。'
            ),
          placement: 'auto',
        },
        {
          selector: '.swbh-card-tab-switch',
          title: '提示',
          htmlText: intl
            .get('swbh.common.model.common.guide.cardTabSwitch')
            .d('【当前模块】：点击此区域可以收起或展开顶部导航栏。'),
          placement: 'auto',
        },
        {
          selector: '.swbh-menu-todo',
          title: '提示',
          htmlText: intl
            .get('swbh.common.model.common.guide.menu.todo')
            .d('【待处理】：展示与我相关的待处理事项，包括单据经办和工作流审批等，点击右侧操作按钮可进行处理。'),
          placement: 'auto',
        },
        {
          selector: '.swbh-menu-focus',
          title: '提示',
          htmlText: intl
            .get('swbh.common.model.common.guide.menu.focus')
            .d(
              '【待阅读】：展示需要我知悉的单据重要消息，光标浮于单据卡片中的消息标签时，显示消息完整内容；点击“已阅”按钮，可将单据消息从列表中消除。'
            ),
          placement: 'auto',
        },
        {
          selector: '.swbh-menu-group-title-history',
          title: '提示',
          htmlText: `${intl
            .get('swbh.common.model.common.guide.menu.initiate')
            .d('【我发起】：展示创建人为自己的单据。')}<br />${intl
            .get('swbh.common.model.common.guide.menu.handle')
            .d('【我经办】：展示自己处理过的单据。')}`,
          placement: 'auto',
        },
        {
          selector: '.swbh-btn-mode',
          title: '提示',
          htmlText: `${intl
            .get('swbh.common.model.common.guide.btn.mode.focus')
            .d('【精简模式】：仅展示展示左侧主页区域')}<br />${intl
            .get('swbh.common.model.common.guide.btn.mode.common')
            .d('【完整模式】：完整展示左侧主页区域、隐藏快速入口和未读消息')}<br />${intl
            .get('swbh.common.model.common.guide.btn.mode.report')
            .d('【驾驶舱（需开通）】：可进入数据分析驾驶舱')}`,
          placement: 'auto',
        },

        // {
        //   selector: '.swbh-menu-group-title-new',
        //   title: '提示',
        //   htmlText: intl
        //     .get('swbh.common.model.common.guide.menu.newGroup')
        //     .d(
        //       '【手工建】页签：可选择需创建的单据类型并快速创建单据。【待转单】页签：转单操作页面，可引用上游单据创建单据。【草稿箱】页签：可查询、编辑所有新建状态的有效单据。'
        //     ),
        //   placement: 'auto',
        // },
        // {
        //   selector: '.swbh-card-business',
        //   title: '提示',
        //   htmlText: intl
        //     .get('swbh.common.model.common.guide.businessCard')
        //     .d('【快速入口】卡片：可快速跳转到单据工作台。'),
        //   placement: 'auto',
        // },
      ],
    },
  ];
};

/**
 * @function getUrlHashParam 解析HASH参数
 * @param {name} - name
 */
const getUrlHashParam = (name) => {
  const { hash } = window.location;
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`); // 构造一个含有目标参数的正则表达式对象
  const r = hash.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
};

export { colorRender, docImgMap, statusRender, getFlexLink, config, getUrlHashParam };
