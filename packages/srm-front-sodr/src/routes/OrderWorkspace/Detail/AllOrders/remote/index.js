export default [
  { code: 'SODR.WORKSPACE_ALLORDERS_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      // 基础信息额外表单字段
      basicInfoExtraForm(value) {
        return value;
      },
      cuxLineDetailAttrmentUuidChange: undefined,
      // 信息补录额外表单字段
      supplementaryInfoExtraForm: () => {},
      dynamicButtons: (buttons) => buttons,
      processPanels: (panels) => panels,
    },
    events: {
      // 信息补录弹窗前置埋点
      beforSupplementaryInfo: async () => {
        return true;
      },
      detailSelection: () => {},
    },
  },
];
