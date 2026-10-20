/* eslint-disable prefer-destructuring */
import { Utils, getConfig as getConfigDefault } from 'choerodon-ui/dataset';
import { Tooltip } from 'choerodon-ui/pro';

const formatFileSize: typeof Utils.formatFileSize = Utils.formatFileSize;
const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};
function showValidationMessage(e, message?, tooltipTheme?, tooltipPlacement?, getConfig: any = getConfigDefault): void {
  Tooltip.show(e.currentTarget, {
    suffixCls: `form-tooltip ${(getConfig as any)('proPrefixCls')}-tooltip`,
    title: message,
    theme: tooltipTheme,
    placement: tooltipPlacement || 'bottomLeft',
  });
}

export {
  formatFileSize,
  BUILT_IN_PLACEMENTS,
  showValidationMessage,
};

