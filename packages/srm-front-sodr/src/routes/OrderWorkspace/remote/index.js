export default [
  { code: 'SODR.WORKSPACE_LIST' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
      // 待签署列表支持ds定义额外参数
      getSignedDsProps: (props) => props,
      /**
       *
       * @returns true 继续走标准取消逻辑｜ false 不关闭取消原因弹窗 ｜null 关闭取消原因弹窗
       */
      beforLineCancelOrClose: async () => {
        return true;
      },
      // 列表页各批量操作按钮前置埋点
      beforHandleAction: async (res) => {
        return res;
      },
      // 表格columns
      processColumns: (columns) => columns,
      // 表格按钮二开逻辑
      actionsBtnsFx: (defaultActions) => defaultActions,
      // 明细反馈审核中列表ds配置
      processDetailFeedbackDsConfig: (config) => config,
      // 是否使用标准的安行取消/关闭弹窗
      processCancelOrCloseModal: () => true,
    },
    events: {
      // 筛选器值变更事件
      searchBarTableFieldChange() {},
      // 批量取消关闭前置埋点
      beforBatchActionByLine: async (_) => _,
      // 明细列表页table关闭前置埋点
      cuxIsCloseFn() {},
      cuxTabChange() {},
    },
    render: {
      // 各tab下表格render埋点
      tableRender: ({ children }) => {
        return children;
      },
    },
  },
];
