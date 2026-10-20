export const WPSReadOnlyConfig = {
  commandBars: [
    {
      cmbId: 'HeaderLeft',
      attributes: {
        visible: false, // 隐藏文件名
      },
    },
    {
      cmbId: 'MoreMenus',
      attributes: {
        visible: false,
      },
    },
    {
      cmbId: 'FloatQuickHelp',
      attributes: {
        visible: false,
      },
    },
    {
      cmbId: 'HeaderRight',
      attributes: {
        visible: false,
      },
    },
  ],
  wordOptions: {
    // isShowDocMap: false, // 是否开启目录功能，默认开启
    // isBestScale: false, // 打开文档时，默认以最佳比例显示
    // isShowBottomStatusBar: false, // 是否展示底部状态栏
  },
  onToast: () => {
    // 拦截原 toast 提示
  },
};

export const WPSEditConfig = {
  commandBars: [
    {
      cmbId: 'HeaderLeft',
      attributes: {
        visible: false, // 隐藏文件名
      },
    },
  ],
  onToast: () => {
    // 拦截原 toast 提示
  },
};