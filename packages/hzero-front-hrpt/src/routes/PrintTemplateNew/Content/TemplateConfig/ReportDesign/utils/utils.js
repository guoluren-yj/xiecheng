/* eslint-disable no-shadow */
/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import {
  keys,
  values,
  isArray,
  omit,
  isString,
  parseInt,
  pick,
  isNumber,
  isEmpty,
  cloneDeep,
  isNil,
} from 'lodash';

import { Modal } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel, filterNullValueObject } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import intl from 'utils/intl';
import { axios } from 'srm-front-boot/lib/utils/c7nUiConfig';
// import { qrCodeDefaultConfig } from './constant';

const { API_HOST, HZERO_RPT } = getEnvConfig();

// 判断是否为空
/**
 * px 转 mm
 * @param {} px
 * @returns
 */
export function parsePxToMm(px) {
  let targetEleWidth = 1;
  let mm;
  const createEle = document.createElement('input');
  const body = document.getElementsByTagName('body');
  createEle.setAttribute(
    'style',
    'width:1mm !important;height:1mm !important;border-width:0px !important;padding:0px !important;margin:0px !important;'
  );
  createEle.id = `elementId_${new Date().getTime()}`;
  createEle.type = 'hidden';
  body[0].appendChild(createEle);
  const targetEle = document.getElementById(createEle.id);
  targetEleWidth = window.getComputedStyle(targetEle).width.match(/^\d+\.?\d*/)[0];
  // eslint-disable-next-line prefer-const
  mm = px / targetEleWidth;
  targetEle.parentNode.removeChild(targetEle);
  return Number(mm.toFixed(2));
}

export function hexToRgba(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${opacity || 1
      })`;
  }
}

// 将边框信息转换成map
export function getCellBorderMark(sheet) {
  const { cellData, config } = sheet;
  const { borderInfo, merge } = config || {};
  if (!borderInfo) {
    return {};
  }
  const borderMap = {};
  borderInfo.forEach((border) => {
    if (border.rangeType === 'cell') {
      const { value } = border;
      const { col_index, row_index, t, b, l, r } = value || {};
      if (!borderMap[`${col_index}-${row_index}`]) {
        borderMap[`${col_index}-${row_index}`] = {};
      }
      if (!isEmpty(t)) {
        borderMap[`${col_index}-${row_index}`].t = {
          ...t,
          color: transformRGBColor(t.color),
        };
      }
      if (!isEmpty(b)) {
        borderMap[`${col_index}-${row_index}`].b = {
          ...b,
          color: transformRGBColor(b.color),
        };
      }
      if (!isEmpty(l)) {
        borderMap[`${col_index}-${row_index}`].l = {
          ...l,
          color: transformRGBColor(l.color),
        };
      }
      if (!isEmpty(r)) {
        borderMap[`${col_index}-${row_index}`].r = {
          ...r,
          color: transformRGBColor(r.color),
        };
      }
    } else if (border.rangeType === 'range') {
      const { borderType, range = [], color: rgbColor, style } = border;
      const { column, row } = range[0] || {};
      if (!column || !row) {
        return;
      }
      const color = transformRGBColor(rgbColor);
      if (borderType === 'border-none') {
        for (let c = column[0]; c <= column[1]; c++) {
          for (let r = row[0]; r <= row[1]; r++) {
            if (!borderMap[`${c}-${r}`]) {
              borderMap[`${c}-${r}`] = {};
            }
            borderMap[`${c}-${r}`] = {
              t: null,
              b: null,
              l: null,
              r: null,
            };
            if (r === row[0] && r - 1 >= 0) {
              const inMergeBlock = findCellInMergeBlock({ c, r: r - 1 }, merge);
              if (
                inMergeBlock &&
                column[0] <= inMergeBlock.c &&
                inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b);
              } else if (!inMergeBlock) {
                if (!borderMap[`${c}-${r - 1}`]) {
                  borderMap[`${c}-${r - 1}`] = {};
                }
                markOriginBorder(borderMap[`${c}-${r - 1}`].b);
              }
            }
            if (r === row[1]) {
              const inMergeBlock = findCellInMergeBlock({ c, r: r + 1 }, merge);
              if (
                inMergeBlock &&
                column[0] <= inMergeBlock.c &&
                inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].t);
              } else if (!inMergeBlock) {
                if (!borderMap[`${c}-${r + 1}`]) {
                  borderMap[`${c}-${r + 1}`] = {};
                }
                markOriginBorder(borderMap[`${c}-${r + 1}`].t);
              }
            }
            if (c === column[0] && c - 1 >= 0) {
              const inMergeBlock = findCellInMergeBlock({ c: c - 1, r }, merge);
              if (
                inMergeBlock &&
                row[0] <= inMergeBlock.r &&
                inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r);
              } else {
                if (!borderMap[`${c - 1}-${r}`]) {
                  borderMap[`${c - 1}-${r}`] = {};
                }
                markOriginBorder(borderMap[`${c - 1}-${r}`].r);
              }
            }
            if (c === column[1]) {
              const inMergeBlock = findCellInMergeBlock({ c: c + 1, r }, merge);
              if (
                inMergeBlock &&
                row[0] <= inMergeBlock.r &&
                inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].l);
              } else if (!inMergeBlock) {
                if (!borderMap[`${c + 1}-${r}`]) {
                  borderMap[`${c + 1}-${r}`] = {};
                }
                markOriginBorder(borderMap[`${c + 1}-${r}`].l);
              }
            }
          }
        }
      } else if (borderType === 'border-all') {
        for (let c = column[0]; c <= column[1]; c++) {
          for (let r = row[0]; r <= row[1]; r++) {
            if (!borderMap[`${c}-${r}`]) {
              borderMap[`${c}-${r}`] = {};
            }
            borderMap[`${c}-${r}`].t = { color, style };
            markOriginBorder(borderMap[`${c}-${r}`].t);
            if (r === row[0]) {
              borderMap[`${c}-${r}`].t = { color, style };
              if (r - 1 >= 0) {
                const inMergeBlock = findCellInMergeBlock({ c, r: r - 1 }, merge);
                if (
                  inMergeBlock &&
                  column[0] <= inMergeBlock.c &&
                  inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
                ) {
                  if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                    borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                  }
                  markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b);
                } else if (!inMergeBlock) {
                  if (!borderMap[`${c}-${r - 1}`]) {
                    borderMap[`${c}-${r - 1}`] = {};
                  }
                  markOriginBorder(borderMap[`${c}-${r - 1}`].b);
                }
              }
            }
            borderMap[`${c}-${r}`].b = { color, style };
            if (r === row[1]) {
              const inMergeBlock = findCellInMergeBlock({ c, r: r + 1 }, merge);
              if (
                inMergeBlock &&
                column[0] <= inMergeBlock.c &&
                inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].t);
              } else if (!inMergeBlock) {
                if (!borderMap[`${c}-${r + 1}`]) {
                  borderMap[`${c}-${r + 1}`] = {};
                }
                markOriginBorder(borderMap[`${c}-${r + 1}`].t);
              }
            }
            borderMap[`${c}-${r}`].l = { color, style };
            markOriginBorder(borderMap[`${c}-${r}`].l);
            if (c === column[0]) {
              borderMap[`${c}-${r}`].l = { color, style };
              if (c - 1 >= 0) {
                const inMergeBlock = findCellInMergeBlock({ c: c - 1, r }, merge);
                if (
                  inMergeBlock &&
                  row[0] <= inMergeBlock.r &&
                  inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
                ) {
                  if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                    borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                  }
                  markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r);
                } else if (!inMergeBlock) {
                  if (!borderMap[`${c - 1}-${r}`]) {
                    borderMap[`${c - 1}-${r}`] = {};
                  }
                  markOriginBorder(borderMap[`${c - 1}-${r}`].r);
                }
              }
            }
            borderMap[`${c}-${r}`].r = { color, style };
            if (c === column[1]) {
              const inMergeBlock = findCellInMergeBlock({ c: c + 1, r }, merge);
              if (
                inMergeBlock &&
                row[0] <= inMergeBlock.r &&
                inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
              ) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].l);
              } else if (!inMergeBlock) {
                if (!borderMap[`${c + 1}-${r}`]) {
                  borderMap[`${c + 1}-${r}`] = {};
                }
                markOriginBorder(borderMap[`${c + 1}-${r}`].l);
              }
            }
          }
        }
      } else if (borderType === 'border-top') {
        for (let c = column[0]; c <= column[1]; c++) {
          const r = row[0];
          if (!borderMap[`${c}-${r}`]) {
            borderMap[`${c}-${r}`] = {};
          }
          borderMap[`${c}-${r}`].t = { color, style };
          if (r - 1 >= 0) {
            const inMergeBlock = findCellInMergeBlock({ c, r: r - 1 }, merge);
            if (
              inMergeBlock &&
              column[0] <= inMergeBlock.c &&
              inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
            ) {
              if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
              }
              markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b);
            } else if (!inMergeBlock) {
              if (!borderMap[`${c}-${r - 1}`]) {
                borderMap[`${c}-${r - 1}`] = {};
              }
              markOriginBorder(borderMap[`${c}-${r - 1}`].b);
            }
          }
        }
      } else if (borderType === 'border-bottom') {
        for (let c = column[0]; c <= column[1]; c++) {
          const r = row[1];
          if (!borderMap[`${c}-${r}`]) {
            borderMap[`${c}-${r}`] = {};
          }
          const inMergeBlock = findCellInMergeBlock({ c, r }, merge);
          if (inMergeBlock) {
            if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
              borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
            }
            borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b = { color, style };
          } else {
            borderMap[`${c}-${r}`].b = { color, style };
          }
          const inMergeBlockNew = findCellInMergeBlock({ c, r: r + 1 }, merge);
          if (
            inMergeBlockNew &&
            column[0] <= inMergeBlockNew.c &&
            inMergeBlockNew.cs + inMergeBlockNew.c - 1 <= column[1]
          ) {
            if (!borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`]) {
              borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`] = {};
            }
            markOriginBorder(borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`].t);
          } else if (!inMergeBlockNew) {
            if (!borderMap[`${c}-${r + 1}`]) {
              borderMap[`${c}-${r + 1}`] = {};
            }
            markOriginBorder(borderMap[`${c}-${r + 1}`].t);
          }
        }
      } else if (borderType === 'border-left') {
        for (let r = row[0]; r <= row[1]; r++) {
          const c = column[0];
          if (!borderMap[`${c}-${r}`]) {
            borderMap[`${c}-${r}`] = {};
          }
          borderMap[`${c}-${r}`].l = { color, style };
          if (c - 1 >= 0) {
            const inMergeBlock = findCellInMergeBlock({ c: c - 1, r }, merge);
            if (
              inMergeBlock &&
              row[0] <= inMergeBlock.r &&
              inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
            ) {
              if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
              }
              markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r);
            } else if (!inMergeBlock) {
              if (!borderMap[`${c - 1}-${r}`]) {
                borderMap[`${c - 1}-${r}`] = {};
              }
              markOriginBorder(borderMap[`${c - 1}-${r}`].r);
            }
          }
        }
      } else if (borderType === 'border-right') {
        for (let r = row[0]; r <= row[1]; r++) {
          const c = column[1];
          // 对于合并单元格的右边框，需要将边框设到起始合并单元格上
          const cellObj = sheet.cellData.find((target) => target.c === c && target.r === r);
          const inMergeBlock = findCellInMergeBlock(cellObj, merge);
          if (inMergeBlock) {
            if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
              borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
            }
            borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r = { color, style };
          } else {
            if (!borderMap[`${c}-${r}`]) {
              borderMap[`${c}-${r}`] = {};
            }
            borderMap[`${c}-${r}`].r = { color, style };
          }
          const inMergeBlockNew = findCellInMergeBlock({ c: c + 1, r }, merge);
          // eslint-disable-next-line eqeqeq
          if (inMergeBlockNew && inMergeBlockNew.r === r && inMergeBlockNew.rs == 1) {
            if (!borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`]) {
              borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`] = {};
            }
            markOriginBorder(borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`].l);
          } else if (!inMergeBlockNew) {
            if (!borderMap[`${c + 1}-${r}`]) {
              borderMap[`${c + 1}-${r}`] = {};
            }
            markOriginBorder(borderMap[`${c + 1}-${r}`].l);
          }
        }
      } else if (borderType === 'border-outside') {
        for (let c = column[0]; c <= column[1]; c++) {
          for (let r = row[0]; r <= row[1]; r++) {
            if (!borderMap[`${c}-${r}`]) {
              borderMap[`${c}-${r}`] = {};
            }
            if (c === column[0]) {
              borderMap[`${c}-${r}`].l = { color, style };
              if (c - 1 >= 0) {
                const inMergeBlock = findCellInMergeBlock({ c: c - 1, r }, merge);
                if (
                  inMergeBlock &&
                  row[0] <= inMergeBlock.r &&
                  inMergeBlock.rs + inMergeBlock.r - 1 <= row[1]
                ) {
                  if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                    borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                  }
                  markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r);
                } else if (!inMergeBlock) {
                  if (!borderMap[`${c - 1}-${r}`]) {
                    borderMap[`${c - 1}-${r}`] = {};
                  }
                  markOriginBorder(borderMap[`${c - 1}-${r}`].r);
                }
              }
            }
            if (c === column[1]) {
              const inMergeBlock = findCellInMergeBlock({ c, r }, merge);
              if (inMergeBlock) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].r = { color, style };
              } else {
                borderMap[`${c}-${r}`].r = { color, style };
              }
              const inMergeBlockNew = findCellInMergeBlock({ c: c + 1, r }, merge);
              if (
                inMergeBlockNew &&
                row[0] <= inMergeBlockNew.r &&
                inMergeBlockNew.rs + inMergeBlockNew.r - 1 <= row[1]
              ) {
                if (!borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`]) {
                  borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`].l);
              } else if (!inMergeBlockNew) {
                if (!borderMap[`${c + 1}-${r}`]) {
                  borderMap[`${c + 1}-${r}`] = {};
                }
                markOriginBorder(borderMap[`${c + 1}-${r}`].l);
              }
            }
            if (r === row[0]) {
              borderMap[`${c}-${r}`].t = { color, style };
              if (r - 1 >= 0) {
                const inMergeBlock = findCellInMergeBlock({ c, r: r - 1 }, merge);
                if (
                  inMergeBlock &&
                  column[0] <= inMergeBlock.c &&
                  inMergeBlock.cs + inMergeBlock.c - 1 <= column[1]
                ) {
                  if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                    borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                  }
                  markOriginBorder(borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b);
                } else if (!inMergeBlock) {
                  if (!borderMap[`${c}-${r - 1}`]) {
                    borderMap[`${c}-${r - 1}`] = {};
                  }
                  markOriginBorder(borderMap[`${c}-${r - 1}`].b);
                }
              }
            }
            if (r === row[1]) {
              const inMergeBlock = findCellInMergeBlock({ c, r }, merge);
              if (inMergeBlock) {
                if (!borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`]) {
                  borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`] = {};
                }
                borderMap[`${inMergeBlock.c}-${inMergeBlock.r}`].b = { color, style };
              } else {
                borderMap[`${c}-${r}`].b = { color, style };
              }
              const inMergeBlockNew = findCellInMergeBlock({ c, r: r + 1 }, merge);
              if (
                inMergeBlockNew &&
                column[0] <= inMergeBlockNew.c &&
                inMergeBlockNew.cs + inMergeBlockNew.c - 1 <= column[1]
              ) {
                if (!borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`]) {
                  borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`] = {};
                }
                markOriginBorder(borderMap[`${inMergeBlockNew.c}-${inMergeBlockNew.r}`].t);
              } else if (!inMergeBlockNew) {
                if (!borderMap[`${c}-${r + 1}`]) {
                  borderMap[`${c}-${r + 1}`] = {};
                }
                markOriginBorder(borderMap[`${c}-${r + 1}`].t);
              }
            }
          }
        }
      }
    }
  });
  if (!isEmpty(borderMap)) {
    cellData.forEach((cell, index) => {
      const { r, c } = cell;
      const borderInfo = borderMap[`${c}-${r}`];
      if (borderInfo) {
        const { t: top, b: bottom, l: left, r: right } = borderInfo;
        if (!isEmpty(top)) {
          sheet.cellData[index] = setCellBorder(sheet.cellData[index], top, 'top');
        }
        if (!isEmpty(bottom)) {
          sheet.cellData[index] = setCellBorder(sheet.cellData[index], bottom, 'bottom');
        }
        if (!isEmpty(left)) {
          sheet.cellData[index] = setCellBorder(sheet.cellData[index], left, 'left');
        }
        if (!isEmpty(right)) {
          sheet.cellData[index] = setCellBorder(sheet.cellData[index], right, 'right');
        }
      }
    });
  }
  return borderMap;
}

// 添加空单元格,并且将合并信息也放到cellData内
function createEmptyCell(sheet) {
  const { cellData, config, visibledatacolumn, visibledatarow } = sheet;
  const { merge } = config || {};
  const emptyCell = [];
  visibledatacolumn.forEach((col, colIndex) => {
    visibledatarow.forEach((row, rowIndex) => {
      const target = cellData.some((cell) => cell.c === colIndex && cell.r === rowIndex);
      if (!target) {
        const newCell = {
          r: rowIndex,
          c: colIndex,
        };
        if (merge) {
          keys(merge).forEach((m) => {
            const mi = merge[m];
            // 判断在那个合并单元格内
            if (
              mi.r <= newCell.r &&
              newCell.r <= mi.r + mi.rs &&
              mi.c <= newCell.c &&
              newCell.c <= mi.c + mi.cs
            ) {
              const newCell_mc = {
                r: mi.r,
                c: mi.c,
              };
              // 判断是否是合并单元格起始单元格
              if (newCell.r === mi.r && newCell.c === mi.c) {
                newCell_mc.rs = mi.rs;
                newCell_mc.cs = mi.cs;
              }
            }
          });
        }
        emptyCell.push(newCell);
      }
    });
  });
  sheet.cellData = sortCell([...sheet.cellData, ...emptyCell]);
}

// 单元格按照行列顺序排序
function sortCell(cells) {
  cells.sort((before, after) => {
    if (before.r !== after.r) {
      return before.r - after.r;
    } else {
      return before.c - after.c;
    }
  });
  return cells;
}

// 标记合并单元格中的空单元格
function markMergeEmptyCell(sheet) {
  const { cellData, visibledatacolumn, visibledatarow } = sheet;
  const newCellData = [];
  cellData.forEach((item) => {
    if (item.r > visibledatarow.length - 1 || item.c > visibledatacolumn.length - 1) {
      return;
    }
    if (item.v) {
      if (item.v.mc) {
        if (item.v.mc.r !== item.r || item.v.mc.c !== item.c) {
          item.mergeEmpty = true;
        } else {
          item.mergeStart = true;
        }
      }
      item.elasticMergeCode = item.v.elasticMergeCode;
    }
    newCellData.push(item);
  });
  sheet.cellData = newCellData;
}

// 设置单元格的边框属性
function setCellBorder(cell, border, borderType) {
  // 空单元格不处理
  if (cell.mergeEmpty) {
    return cell;
  }
  if (!cell.border) {
    cell.border = {};
  }
  if (!cell.originBorder) {
    cell.originBorder = {};
  }
  if (isString(borderType)) {
    if (!border.origin) {
      cell.border[borderType] = border;
    } else {
      cell.border[borderType] = null;
    }

    cell.originBorder[borderType] = border;
  } else if (isArray(borderType)) {
    borderType.forEach((type) => {
      if (!border.origin) {
        cell.border[type] = border;
      } else {
        cell.border[type] = null;
      }
      cell.originBorder[type] = border;
    });
  }
  return cell;
}

// 处理图片
function transformImages(sheet) {
  const { images, visibledatacolumn, visibledatarow, config } = sheet;
  const { merge, sheetViewZoom: { viewNormalZoomScale: vNZ = 1 } = {} } = config || {};
  const viewNormalZoomScale = Number(math.toFixed(vNZ, 6));
  const newIamges = {};
  const imageList = keys(images);

  const inCellImags = [];
  const floatImags = [];
  imageList.forEach((i) => {
    if (images[i].isCell) {
      inCellImags.push(i);
    } else {
      floatImags.push(i);
    }
  });
  const qrConfigCache = {};
  sheet.cellData = sheet.cellData.map((c) => {
    if (c.v) {
      if (c.v.image) {
        delete c.v.image;
      }
      if (c.v.qrcode) {
        delete c.v.qrcode;
      }
      if (c.v.barCode) {
        delete c.v.barCode;
      }
      if (c.v.qrCode) {
        delete c.v.qrCode;
      }
      if (!c.v.v && c.v.extra) {
        delete c.v.extra;
      }
      if (c.v.qrCodeAdvancedConfig) {
        qrConfigCache[`${c.r}_${c.c}`] = c.v.qrCodeAdvancedConfig;
        delete c.v.qrCodeAdvancedConfig;
      }
    }
    return c;
  });
  delete sheet.absoluteImages;
  if (inCellImags.length > 0) {
    sheet.cellData = sheet.cellData.map((cell) => {
      const targeImage = inCellImags.find(
        (img) =>
          images[img].cellIndex &&
          images[img].cellIndex.col === cell.c &&
          images[img].cellIndex.row === cell.r
      );
      if (targeImage) {
        const mergeCell = findCellInMergeBlock(cell, merge);
        let imgWidth;
        let imgHeight;
        if (mergeCell) {
          const { r, c, rs, cs } = mergeCell;
          const startX = c === 0 ? 0 : visibledatacolumn[c - 1];
          const endX = visibledatacolumn[c + cs - 1];
          imgWidth = endX - startX;
          const startY = r === 0 ? 0 : visibledatarow[r - 1];
          const endY = visibledatarow[r + rs - 1];
          imgHeight = endY - startY;
        } else {
          const c = images[targeImage].cellIndex.col;
          const r = images[targeImage].cellIndex.row;
          imgWidth =
            c === 0 ? visibledatacolumn[0] : visibledatacolumn[c] - visibledatacolumn[c - 1];
          imgHeight = r === 0 ? visibledatarow[0] : visibledatarow[r] - visibledatarow[r - 1];
        }
        imgWidth = parsePxToMm(imgWidth / viewNormalZoomScale);
        imgHeight = parsePxToMm(imgHeight / viewNormalZoomScale);
        const newImg = cloneDeep(images[targeImage]);
        if (newImg.isBarcode) {
          if (cell.v && cell.v.qrcode) {
            delete cell.v.qrcode;
          }
          if (cell.v && cell.v.qrCode) {
            delete cell.v.qrCode;
          }
          if (!cell.v) {
            cell.v = {};
          }
          cell.v.barCode = {
            width: imgWidth,
            height: imgHeight,
            format: images[targeImage].format || 'Code128',
          };
        } else if (newImg.isQrcode) {
          if (cell.v && cell.v.barCode) {
            delete cell.v.barCode;
          }
          if (cell.v && cell.v.qrcode) {
            delete cell.v.qrcode;
          }
          if (!cell.v) {
            cell.v = {};
          }
          cell.v.qrCode = {
            width: imgWidth,
            height: imgHeight,
          };
          if (qrConfigCache[`${cell.r}_${cell.c}`]) {
            cell.v.qrCodeAdvancedConfig = qrConfigCache[`${cell.r}_${cell.c}`];
          }
        } else {
          if (newImg.default) {
            const { top, left } = newImg.default;
            newImg.default = {
              width: imgWidth,
              height: imgHeight,
              left: parsePxToMm(Number(Number(left / viewNormalZoomScale).toFixed(2))),
              top: parsePxToMm(Number(Number(top / viewNormalZoomScale).toFixed(2))),
            };
          }
          cell.image = newImg;
          if (cell.v) {
            if (cell.v.qrcode) {
              delete cell.v.qrcode;
            }
            if (cell.v.barCode) {
              delete cell.v.barCode;
            }
          }
        }
      }
      return cell;
    });
  }
  if (floatImags.length > 0) {
    sheet.absoluteImages = floatImags.map((i) => {
      const {
        default: { top, left, width, height },
        src,
        dynamicSrc,
        srcType,
      } = images[i];
      let topCell = 0;
      let offsetTop = 0;
      if (top > 0) {
        visibledatarow.find((rowHeight, index) => {
          if (top <= rowHeight) {
            topCell = index;
            offsetTop = (top - (index === 0 ? 0 : visibledatarow[index - 1])) / viewNormalZoomScale;
            return true;
          }
          return false;
        });
      }
      let leftCell = 0;
      let offsetLeft = 0;
      if (left > 0) {
        visibledatacolumn.find((colWidth, index) => {
          if (left <= colWidth) {
            leftCell = index;
            offsetLeft = (left - (index === 0 ? 0 : visibledatacolumn[index - 1])) / viewNormalZoomScale;
            return true;
          }
          return false;
        });
      }
      const mergeCell = findCellInMergeBlock(
        {
          r: topCell,
          c: leftCell,
        },
        merge
      );
      if (mergeCell) {
        topCell = mergeCell.r;
        leftCell = mergeCell.c;
        offsetTop = (top - (topCell === 0 ? 0 : visibledatarow[topCell - 1])) / viewNormalZoomScale;
        offsetLeft =
          (left - (leftCell === 0 ? 0 : visibledatacolumn[leftCell - 1])) / viewNormalZoomScale;
      }
      offsetTop = Number(offsetTop.toFixed(2));
      offsetLeft = Number(offsetLeft.toFixed(2));
      let bottomCell = 0;
      if (height > 0) {
        visibledatarow.find((rowHeight, index) => {
          if (top + height <= rowHeight) {
            bottomCell = index;
            return true;
          }
          return false;
        });
      }
      let rightCell = 0;
      if (width > 0) {
        visibledatacolumn.find((colWidth, index) => {
          if (left + width <= colWidth) {
            rightCell = index;
            return true;
          }
          return false;
        });
      }
      return {
        topCell,
        bottomCell,
        leftCell,
        rightCell,
        src,
        dynamicSrc,
        srcType,
        top: parsePxToMm(offsetTop),
        left: parsePxToMm(offsetLeft),
        width: parsePxToMm(width / viewNormalZoomScale),
        height: parsePxToMm(height / viewNormalZoomScale),
      };
    });
  }
  imageList.forEach((imgId) => {
    const img = images[imgId];
    img.default.width = Number((img.default.width / viewNormalZoomScale).toFixed(2));
    img.default.height = Number((img.default.height / viewNormalZoomScale).toFixed(2));
    img.default.left = Number((img.default.left / viewNormalZoomScale).toFixed(2));
    img.default.top = Number((img.default.top / viewNormalZoomScale).toFixed(2));
    img.crop = { width: img.default.width, height: img.default.height, offsetLeft: 0, offsetTop: 0 };
    img.default.widthMm = parsePxToMm(img.default.width);
    img.default.heightMm = parsePxToMm(img.default.height);
    img.default.leftMm = parsePxToMm(img.default.left);
    img.default.topMm = parsePxToMm(img.default.top);
    newIamges[imgId] = img;
  });
  sheet.images = newIamges;
}

function computePageNumPosition({ pageNum, block, sheet }) {
  const { row, column, pattern } = pageNum;
  const { top: block_start_row, left: block_start_col } = block;
  let top =
    row === 0
      ? 0
      : sheet.visibledatarowMm[row - 1] -
      (block_start_row === 0 ? 0 : sheet.visibledatarowMm[block_start_row - 1]);
  let left =
    column === 0
      ? 0
      : sheet.visibledatacolumnMm[column - 1] -
      (block_start_col === 0 ? 0 : sheet.visibledatacolumnMm[block_start_col - 1]);
  const targetCell = sheet.cellData.find((c) => c.c === column && c.r === row);
  if (!targetCell || !targetCell.v || !targetCell.v.v) {
    return undefined;
  }
  const { ht = 1, mc, fs = 10, vt = 0 } = targetCell.v || {};
  let cellWidth =
    column === 0
      ? sheet.visibledatacolumnMm[column]
      : sheet.visibledatacolumnMm[column] - sheet.visibledatacolumnMm[column - 1];
  const cellHeight =
    row === 0
      ? sheet.visibledatarowMm[row]
      : sheet.visibledatarowMm[row] - sheet.visibledatarowMm[row - 1];
  const patterWidth = parsePxToMm(pattern.replace(/currentNum|countNum/g, 'X').length * fs); // 页码格式文字宽度
  const patterHeight = parsePxToMm(fs); // 页码格式文字高度
  // 合并单元格另外计算
  if (mc) {
    // mc: {r: 16, c: 0, rs: 1, cs: 23}
    const start_X = mc.c === 0 ? 0 : sheet.visibledatacolumnMm[mc.c - 1];
    const end_X = sheet.visibledatacolumnMm[mc.c + mc.cs - 1];
    cellWidth = end_X - start_X;
  }
  // 居左不用处理
  // 居中
  if (ht === 0) {
    left += (cellWidth - patterWidth) / 2;
  } else if (ht === 2) {
    // 居右
    left = left + cellWidth - patterWidth;
  } else {
    left += parsePxToMm(1);
  }
  // 居顶不处理
  // 居中
  if (vt === 0) {
    top += (cellHeight - patterHeight) / 2;
  } else if (vt === 2) {
    // 居底
    top = top + cellHeight - patterHeight;
  }
  return {
    ...pageNum,
    top,
    left,
    cell: targetCell.v,
  };
}

// 列宽行高按比例转换成mm
function transformUnit(sheet) {
  // 页眉
  if (sheet.headerBlock) {
    if (sheet.headerBlock.pageNums && sheet.headerBlock.pageNums.length > 0) {
      sheet.headerBlock.pageNums = sheet.headerBlock.pageNums
        .map((i) => computePageNumPosition({ pageNum: i, block: sheet.headerBlock, sheet }))
        .filter(Boolean);
    }
  }
  // 页脚
  if (sheet.footerBlock) {
    if (sheet.footerBlock.pageNums && sheet.footerBlock.pageNums.length > 0) {
      sheet.footerBlock.pageNums = sheet.footerBlock.pageNums
        .map((i) => computePageNumPosition({ pageNum: i, block: sheet.footerBlock, sheet }))
        .filter(Boolean);
    }
  }
  return sheet;
}

// 过滤掉底部空行单元格
function filterEmptyRow(sheet) {
  const { cellData, cycleBlock, visibledatacolumn, absoluteImages } = sheet;
  let emptyRowIndex = 0;
  const lastIndex = cellData.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    const cell = cellData[i];
    const isEmptyCell =
      isEmpty(omit(cell, ['r', 'c', 'v', 'elasticMergeCode'])) && (!cell.v || !cell.v.v);
    const inCycleBlockFlag = checkCellInCycleBlock(cell, cycleBlock);
    const inFloatImgFlag = checkCellInFloatImg(cell, absoluteImages);
    // 空白单元格且不在循环块内,不在浮动图片下
    if (isEmptyCell && !inCycleBlockFlag && !inFloatImgFlag) {
      emptyRowIndex = cell.r;
    } else {
      // 如果是最后一列, 表明应截止到当前行，此处需设置emptyRowIndex为当前行
      if (cell.c === visibledatacolumn.length - 1) {
        emptyRowIndex = cell.r;
      }
      break;
    }
  }
  sheet.cellData = cellData.filter((cell) => cell.r <= emptyRowIndex);
}

// 调整循环块超出尺寸线区域
function transformCycleBlock(sheet) {
  const { cycleBlock, visibledatacolumn } = sheet;
  if (cycleBlock && cycleBlock.length > 0) {
    sheet.cycleBlock = cycleBlock.map((block) => {
      return {
        ...block,
        right:
          block.right > visibledatacolumn.length - 1 ? visibledatacolumn.length - 1 : block.right,
      };
    });
  }
}

function handleRepeatTitleRows(sheet) {
  const { repeateTitleRows, cellData } = sheet;
  if (repeateTitleRows && repeateTitleRows.length > 0) {
    repeateTitleRows.forEach((titleRow) => {
      const { top, left, bottom } = titleRow;
      const cell = cellData.find((i) => {
        return i.c === left && i.r === top;
      });
      if (cell) {
        cell.repeatTitleRowFlag = true;
        cell.repeatTitleRows = bottom - top + 1;
      }
    });
  }
}

function filterEmptyAttribute(sheet) {
  const attributes = ['pagingRowIndex', 'repeateTitleRows', 'headerBlock', 'footerBlock'];
  attributes.forEach((attr) => {
    if (isEmpty(sheet[attr])) {
      delete sheet[attr];
    }
  });
}

function handleConditionFormat(sheet) {
  const { conditionFormat, cellData } = sheet;
  const conditionFormatMap = {};
  if (conditionFormat && conditionFormat.length) {
    conditionFormat.forEach((condition) => {
      if (condition.range && condition.range.position) {
        const { r, c } = condition.range.position;
        if (!conditionFormatMap[`${r}-${c}`]) {
          conditionFormatMap[`${r}-${c}`] = [];
        }
        conditionFormatMap[`${r}-${c}`].push(condition);
      }
    });
  }
  if (cellData) {
    cellData.forEach((cell, index) => {
      const conditionalStyles = conditionFormatMap[`${cell.r}-${cell.c}`];
      if (
        conditionalStyles &&
        conditionalStyles.length &&
        cell.v &&
        cell.v.extra &&
        cell.v.extra.type === 'FIELD'
      ) {
        cell.conditionalStyles = conditionalStyles.map(i => {
          if (!isNil(cell.v.ht)) {
            i.ht = cell.v.ht;
            if (!i.style) {
              i.style = {};
            }
            i.style.ht = i.ht;
          }
          if (!isNil(cell.v.vt)) {
            i.vt = cell.v.vt;
            if (!i.style) {
              i.style = {};
            }
            i.style.vt = i.vt;
          }
          return i;
        });
      } else {
        delete cell.conditionalStyles;
      }
      sheet[index] = cell;
    });
  }
}

function checkCellValue(sheet) {
  sheet.cellData = sheet.cellData.map(i => {
    if (i && isString(i.v)) {
      i.v = {};
    }
    return i;
  });
}

export function handleConfigRowAndColLen(sheet) {
  if (sheet && sheet.config) {
    if (sheet.config.rowlen) {
      keys(sheet.config.rowlen).forEach(row => {
        const value = sheet.config.rowlen[row];
        if (isNumber(value)) {
          sheet.config.rowlen[row] = Number(value.toFixed(2));
        }
      })
    }
    if (sheet.config.columnlen) {
      keys(sheet.config.columnlen).forEach(col => {
        const value = sheet.config.columnlen[col];
        if (isNumber(value)) {
          sheet.config.columnlen[col] = Number(value.toFixed(2));
        }
      })
    }
  }
}

function handleNoPagingAreaBlock(sheet) {
  const { noPagingAreaBlock, cellData } = sheet;
  if (noPagingAreaBlock && noPagingAreaBlock.length > 0 && cellData) {
    const noPagingAreaBlockMap = { start: [], end: [] };
    noPagingAreaBlockMap.start = noPagingAreaBlock.map(i => i.top);
    noPagingAreaBlockMap.end = noPagingAreaBlock.map(i => i.bottom);
    sheet.cellData = cellData.map(cell => {
      const { r, c } = cell;
      if (c !== 0) {
        return cell;
      }
      if (noPagingAreaBlockMap.start.includes(r)) {
        cell.nonPagingAreaStartFlag = true;
      }
      if (noPagingAreaBlockMap.end.includes(r)) {
        cell.nonPagingAreaEndFlag = true;
      }
      return cell;
    });
  }
}

// 获取最后一行有内容的单元格所在行坐标
function getCellLastRowIndex(sheet) {
  const { visibledatacolumn, visibledatarow, data } = sheet;
  const lastColIndex = visibledatacolumn.length - 1;
  let lastRowIndex = visibledatarow.length - 1;
  let flag = false;
  while (lastRowIndex >= 0) {
    for (let colIndex = 0; colIndex <= lastColIndex; colIndex++) {
      const cell = data[lastRowIndex][colIndex];
      if (!cell) {
        continue;
      }
      let isEmptyCell = !cell.v && !cell.mc;
      if (!isEmptyCell) {
        flag = true;
      }
    }
    if (flag) {
      break;
    } else {
      lastRowIndex--;
    }
  }
  if (lastRowIndex < 0) {
    lastRowIndex = 0;
  }
  return lastRowIndex;
}

// 获取最下面一张图片的底部所在行坐标
function getImageLastRowIndex(sheet) {
  const { images, visibledatacolumn, visibledatarow } = sheet;
  if (isEmpty(images)) {
    return 0;
  }
  let maxBottom = 0;
  values(images).forEach((img) => {
    const { isCell, cellIndex, default: { top, height, left } = {} } = img;
    // 宽度超过尺寸线的不考虑
    if (isCell && cellIndex && cellIndex.col > visibledatacolumn.length - 1) {
      return;
    } else if (!isCell && left > visibledatacolumn[visibledatacolumn.length - 1]) {
      return;
    }
    const bottom = top + height;
    if (top + height > maxBottom) {
      maxBottom = bottom;
    }
  });
  let lastRowIndex = visibledatarow.length - 1;
  while (lastRowIndex >= 0) {
    if (visibledatarow[lastRowIndex - 1] < maxBottom && maxBottom <= visibledatarow[lastRowIndex]) {
      break;
    }
    lastRowIndex--;
  }
  if (lastRowIndex < 0) {
    lastRowIndex = 0;
  }
  return lastRowIndex;
}

// 获取最后一个循环块的底部所在行坐标
function getCycleBlockLastRowIndex(sheet) {
  const { cycleBlock, visibledatacolumn } = sheet;
  if (isEmpty(cycleBlock)) {
    return 0;
  }
  let lastRowIndex = 0;
  cycleBlock.forEach((block) => {
    const { bottom, left } = block;
    if (left > visibledatacolumn.length - 1) {
      return;
    }
    if (bottom > lastRowIndex) {
      lastRowIndex = bottom;
    }
  });
  return lastRowIndex;
}

// 获取固定区域最底部所在行坐标
function getFixedBlockLastRowIndex(sheet) {
  const { footerBlock } = sheet;
  if (!footerBlock) {
    return 0;
  }
  return footerBlock.bottom;
}

// 获取最底部一个边框的底部所在行坐标
function getBorderLastRowIndex(sheet) {
  // 迷之borderMap可能为undefined
  const borderMap = getCellBorderMark(sheet) || {};
  let lastRowIndex = 0;
  Object.keys(borderMap).forEach((key) => {
    if (!isEmpty(filterNullValueObject(borderMap[key]))) {
      const row = Number((key || '').split('-')[1]);
      if (row > lastRowIndex) {
        lastRowIndex = row;
      }
    }
  });
  return lastRowIndex;
}

// 过滤出有效循环块，且根据数据集的父子关系同步循环块的父子节点字段
function checkCycleBlock(sheet, treeDs) {
  if (sheet.cycleBlock) {
    const newCycleBlock = [];
    sheet.cycleBlock.forEach((block) => {
      if (block.id && block.code) {
        const newBlock = block;
        const treeNode = treeDs.find(
          (r) => r.get('type') === 'node' && r.get('code') === newBlock.code
        );
        if (treeNode) {
          newBlock.parentId = treeNode.get('parentId');
          newBlock.parentCode = treeNode.get('parentCode');
        }
        newCycleBlock.push(newBlock);
      }
    });
    sheet.cycleBlock = newCycleBlock;
  }
}

function filterSheetArea(sheet, { reportType, createVersion }) {
  const { printConfig, visibledatacolumn, visibledatarow, zoomRatio = 1, cycleBlock } = sheet;
  const { height: height_mm, width: width_mm, margin } = printConfig;
  const { top = 0, bottom = 0, left = 0, right = 0 } = margin || {};
  const rootBlock = cycleBlock && cycleBlock.find((block) => !block.parentId && !block.parentCode);
  let blockRightMm = 0;
  // 20231209版本标记后，走新的单元格宽高裁剪逻辑。原来的缩放存在逻辑错误，但只能将错就错
  let sumCellWidthMm = 0;
  let sumCellHeightMm = 0;
  const realWidthMm = width_mm - left - right;
  // 列
  sheet.visibledatacolumnMm = visibledatacolumn
    .map((item, index) => {
      let value;
      if (createVersion === "20231209") {
        const colWidth = (window.luckysheet.getColumnWidth([index]) || {})[index];
        value = parsePxToMm(colWidth);
        if (rootBlock && rootBlock.right >= index) {
          blockRightMm += value;
        }
        const maxRightMm = reportType === 'EXCEL' ? blockRightMm :  Math.max(blockRightMm, realWidthMm);
        if (sumCellWidthMm >= maxRightMm && ['PDF', 'EXCEL'].includes(reportType)) return null;
        sumCellWidthMm += value;
        if (sumCellWidthMm > maxRightMm && ['PDF', 'EXCEL'].includes(reportType)) {
          sumCellWidthMm = maxRightMm;
        }
        return Number(Number(sumCellWidthMm).toFixed(2));
      }
      value = parsePxToMm(item / zoomRatio);
      if (reportType === 'EXCEL') {
        if (rootBlock && rootBlock.right >= index) {
          return value;
        }
        return null;
      }     
      // 只有PDF才进行列裁剪
      if (value > width_mm && reportType === 'PDF') {
        return null;
      } else {
        // 按比例
        const result = (value * (width_mm - left - right)) / width_mm;
        return Math.round(result);
      }
    })
    .filter(Boolean);
  sheet.visibledatacolumn = sheet.visibledatacolumn.slice(0, sheet.visibledatacolumnMm.length);
  // 行
  let lastRowIndex = 0;
  if (reportType === 'EXCEL' && rootBlock) {
    lastRowIndex = rootBlock.bottom;
  } else {
    let cellLastRowIndex = getCellLastRowIndex(sheet);
    const imageLastRowIndex = getImageLastRowIndex(sheet);
    const cycleBlockLastRowIndex = getCycleBlockLastRowIndex(sheet);
    const fixedBlockLastRowIndex = getFixedBlockLastRowIndex(sheet);
    const borderBlockLastRowIndex = getBorderLastRowIndex(sheet);
    lastRowIndex = max([
      cellLastRowIndex,
      imageLastRowIndex,
      cycleBlockLastRowIndex,
      fixedBlockLastRowIndex,
      borderBlockLastRowIndex,
    ]);
    if (lastRowIndex > cycleBlockLastRowIndex) {
      lastRowIndex = cycleBlockLastRowIndex;
    }
  }
  sheet.visibledatarow = visibledatarow.slice(0, lastRowIndex + 1);
  sheet.visibledatarowMm = sheet.visibledatarow
    .map((item, index) => {
      let value;
      if (createVersion === "20231209") {
        const rowHeight = (window.luckysheet.getRowHeight([index]) || {})[index];
        value = parsePxToMm(rowHeight);
        sumCellHeightMm += value;
        return Number(Number(sumCellHeightMm).toFixed(2));
      }
      value = parsePxToMm(item / zoomRatio);
      // 按比例
      const result = (value * (height_mm - top - bottom)) / height_mm;
      return Math.round(result);
    })
    .filter(Boolean);
}

export function transformSheetData(sheet, treeDs, { reportType, createVersion }) {
  // 转换参数key
  sheet.cellData = sheet.celldata;
  if (sheet.pageTotalRows && sheet.pageTotalRows.top && sheet.pageTotalRows.bottom) {
    sheet.pageTotalRange = [sheet.pageTotalRows.top, sheet.pageTotalRows.bottom];
  } else {
    sheet.pageTotalRange = undefined;
  }
  // 过滤掉无效循环块
  checkCycleBlock(sheet, treeDs);
  // 先圈定表格有效区域
  filterSheetArea(sheet, { reportType, createVersion });
  // 依赖visibledatarow这类数据，需要放在filterSheetArea之后
  processPageAggregates(sheet);
  // 检验循环块大小、重复标题行是否存在重叠、包含循环块、分页符
  checkSheet(sheet);
  // 先填充空白单元格
  createEmptyCell(sheet);
  // 标记合并单元格中的空白单元格
  markMergeEmptyCell(sheet);
  // 将边框信息填充到每个单元格上
  getCellBorderMark(sheet);
  // 处理px和mm单位转换
  transformUnit(sheet);
  // 调整循环块超出尺寸线区域
  transformCycleBlock(sheet);
  // 处理图片信息
  transformImages(sheet);
  // 过滤掉底部的空白行
  filterEmptyRow(sheet);
  // 处理重复标题行
  handleRepeatTitleRows(sheet);
  // 清除空值属性
  filterEmptyAttribute(sheet);
  // 处理条件格式
  handleConditionFormat(sheet);
  // 针对异常单元格v格式处理
  checkCellValue(sheet);
  // 转换config下的columnlen 和 rowlen
  handleConfigRowAndColLen(sheet);
  // 处理跨页范围
  handleNoPagingAreaBlock(sheet);
  const sheetData = {
    ...pick(sheet, [
      'index',
      'order',
      'name',
      'cellData',
      'images',
      'config',
      'hyperlink',
      'visibledatacolumn',
      'visibledatacolumnMm',
      'visibledatarow',
      'visibledatarowMm',
      'printConfig',
      'watermark',
      'cycleBlock',
      'absoluteImages',
      'pagingRowIndex',
      'footerBlock',
      'headerBlock',
      'repeateTitleRows',
      'conditionFormat',
      'tempPageAggregates',
      'createVersion',
      'waterMarkConfig',
      'pageTotalRows',
      'pageTotalRange',
      'noPagingAreaBlock',
    ]),
    index: 0,
  };
  updateCellIsFixedHeight(sheet);
  // 提交和预览强制缩放比为1，因为初始化配置时按100%初始化，却不会重置该比例。
  if (!sheet.config) sheet.config = {};
  if (!sheet.config.sheetViewZoom) sheet.config.sheetViewZoom = {};
  sheet.config.sheetViewZoom.viewNormalZoomScale = 1;
  return sheetData;
} 

// 预览
export function printPriview(data, option) {
  return request(isTenantRoleLevel()
    ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/preview`
    : `${HZERO_RPT}/v1/print/preview`, {
      method: 'POST',
      body: data,
      query: option,
      responseType: option.outType === "PDF" ? 'blob' : "text",
    }, {
      encryptBody: true,
    });
}

// 校验单元格是否在循环块内
function checkCellInCycleBlock(cell, cycleBlock) {
  let flag = false;
  if (cycleBlock && cycleBlock.length > 0) {
    const { r, c } = cell;
    flag = cycleBlock.some((block) => {
      const { top, bottom, left, right } = block;
      return r >= top && r <= bottom && c >= left && c <= right;
    });
  }
  return flag;
}

function checkCellInFloatImg(cell, floatImgs) {
  if (!floatImgs || !floatImgs.length) {
    return false;
  }
  return floatImgs.some(
    (img) =>
      img.topCell <= cell.r &&
      cell.r <= img.bottomCell &&
      img.leftCell <= cell.c &&
      cell.c <= img.rightCell
  );
}

function findCellInMergeBlock(cell, mergeBlock) {
  if (!cell || !mergeBlock) {
    return null;
  }
  return values(mergeBlock).find((block) => {
    const { r, c, rs, cs } = block;
    return r <= cell.r && cell.r <= r + rs - 1 && c <= cell.c && cell.c <= c + cs - 1;
  });
}

export function downloadTemplateByUrl(url) {
  return request(url, {
    method: 'GET',
    responseType: 'blob',
  });
}

export function filterChildren(data, cycleBlock, { fieldFilter, allLineField, sheetRef, onlyChildLineField }) {
  const children = [];
  let rootCycleBlock = null;
  let sheetData = [];
  if (sheetRef && sheetRef.current) {
    rootCycleBlock = (sheetRef.current.getAllSheets()[0].cycleBlock || []).find(
      (b) => !b.parentCode && !b.parentId
    );
    sheetData = sheetRef.current.getSheetData();
    if (sheetData && sheetData.length) {
      sheetData = sheetData.flat().filter(i => !isNil(i));
    }
  }
  const { code: currentNodeCode } =
    (onlyChildLineField ? cycleBlock : (allLineField && rootCycleBlock ? rootCycleBlock : cycleBlock) || {});
  const _func = (code) => {
    const parentNode = data.filter((i) => i.parentCode === code && i.type === 'node');
    children.push(...parentNode);
    const parentNodeCodes = parentNode.map((i) => i.code);
    data.forEach((i) => {
      if (parentNodeCodes.includes(i.parentCode)) {
        if (!fieldFilter || fieldFilter({ record: i, sheetData })) children.push(i);
        if (i.type === 'node') {
          _func(i.code);
        }
      }
    });
  };
  _func(currentNodeCode);
  return children;
}

export function filterParentAndSelf(data, cycleBlock) {
  const { code: currentNodeCode, parentCode: currentParentCode } = cycleBlock;
  const self = data.filter(
    (i) => i.code === currentNodeCode || (i.parentCode === currentNodeCode && i.type === 'field')
  );
  const parent = [];
  const _func = (code) => {
    const parentNode = data.find((i) => i.code === code && i.type === 'node');
    if (parentNode) {
      parent.push(parentNode);
      const parentFields = data.filter(
        (i) => i.parentCode === parentNode.code && i.type === 'field'
      );
      parent.push(...parentFields);
      if (parentNode.parentCode) {
        _func(parentNode.parentCode);
      }
    }
  };
  _func(currentParentCode);
  const result = parent.concat(self);
  return result;
}

export function transformRGBColor(color) {
  if (!color) {
    return undefined;
  }
  if (color.indexOf('rgb(') !== -1) {
    return color.replace('rgb(', 'rgba(').replace(')', ', 1)');
  }
  if (color.indexOf('#') !== 0) {
    return color;
  }
  const value = color.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function max(param) {
  let result = param[0];
  let i = 1;
  while (i < param.length) {
    if (param[i] > result) {
      result = param[i];
    }
    i++;
  }
  return result;
}

// 后端生成边框时，对于pdf和excel有不同的处理，此处使用border.origin用来标识是专门用于excel处理的边框
function markOriginBorder(border) {
  if (!border) {
    border = {};
  }
  border.origin = true;
}

function processPageAggregates(sheet) {
  const { visibledatarowMm, cellData } = sheet;
  sheet.tempPageAggregates = luckysheetCache.tempPageAggregates || [];
  (luckysheetCache.tempPageAggregates || []).forEach((pa) => {
    const { row, column } = pa;
    const cell = (cellData || []).find((c) => c.r === row && c.c === column);
    if (!cell || !cell.v || !cell.v.v) return;
    const { ht = 1, fs = 10, vt = 0 } = cell.v || {};
    const cellHeight =
      row === 0 ? visibledatarowMm[row] : visibledatarowMm[row] - visibledatarowMm[row - 1];

    // 垂直坐标参数修正倍率
    const fontTimes = fs / 10;
    const fixVerticalConst = 0.6 * fontTimes;
    const fh = parsePxToMm(fs);
    // top = 0时文字地步与边框上对齐
    let top = fh;
    // 居顶不处理
    // 居中
    if (vt === 0) {
      top += (cellHeight - fh + fixVerticalConst) / 2;
    } else if (vt === 2) {
      // 居底，除去修正倍率影响，因为倍率存在时，回随着字体变大而向中心偏
      top += cellHeight - fh - fixVerticalConst / fontTimes;
    } else if (vt === 1) {
      // 除去修正倍率影响，因为倍率存在时，回随着字体变大而向中心偏
      top += fixVerticalConst / fontTimes;
    }
    let alignType = 0;
    if (ht === 0) alignType = 1;
    else if (ht === 1) alignType = 0;
    else if (ht === 2) alignType = 2;
    cell.pageAggregate = {
      ...pa,
      top,
      alignType,
      cell: cell.v,
    };
  });
}
export const luckysheetCache = {};
export function savePageAggregates({
  formulaData,
  sheetRef,
  rootCycleBlock,
  row_focus,
  column_focus,
}) {
  if (!sheetRef.current) return {};
  const sheet = sheetRef.current.getAllSheets()[0] || {};
  const { cycleBlock: AllCycleBlock, celldata } = sheet;
  const [scopeData] = formulaData.paramList || [];

  let expressionText = `=${formulaData.code}(`;
  let expressionValue = `${rootCycleBlock.code}_${formulaData.code}(`;
  expressionText += `${scopeData.value.text || ''}`;
  expressionValue += `${scopeData.value.value || ''}, "${rootCycleBlock.code}"`;
  const targetFieldCode = scopeData.value.code;
  const targetLineCode = scopeData.value.parentCode;
  const targetLineName = scopeData.value.parentName;
  const targetLineBlock = AllCycleBlock.find((block) => block.code === targetLineCode);
  const targetField = celldata.find((c) => c.v && c.v.extra && c.v.extra.code === targetFieldCode);
  let errorMsg = '';
  if (!targetLineBlock) {
    errorMsg = intl
      .get('hrpt.reportDesign.formula.validator.noFoundCycleBlock', {
        targetLine: `${targetLineName}(${targetLineCode})`,
      })
      .d('未找到循环块{targetLine}');
  } else if (isNil(targetLineBlock.fixedRowSize)) {
    errorMsg = intl
      .get('hrpt.reportDesign.formula.validator.noSetCycleBlockLines', {
        targetLine: `${targetLineName}(${targetLineCode})`,
      })
      .d('循环块{targetLine}未设置固定行数');
  }
  if (!targetField) {
    errorMsg = intl
      .get('hrpt.reportDesign.formula.validator.noFoundSumField', {
        targetField: `${scopeData.value.name}(${scopeData.value.code})`,
      })
      .d('未找到小记字段{targetField}');
  }
  const cell = (celldata || []).find((c) => c.r === row_focus && c.c === column_focus);

  if (errorMsg) {
    Modal.error({
      children: errorMsg,
    });
    if (cell) {
      delete cell.extra;
      delete cell.pageAggregate;
    }
    throw new Error('validator error');
  }
  expressionValue += `, ${targetLineBlock.fixedRowSize}`;
  luckysheetCache.tempPageAggregates = (luckysheetCache.tempPageAggregates || []).filter(
    (pa) => pa.row !== row_focus || pa.column !== column_focus
  );
  luckysheetCache.tempPageAggregates.push({
    row: row_focus,
    column: column_focus,
    expression: `${expressionValue})`,
    tLC: targetLineCode,
  });

  return { expressionText, expressionValue };
}

function checkSheet(sheet) {
  if (sheet.cycleBlock && sheet.cycleBlock.length) {
    sheet.cycleBlock.forEach(block => {
      if (block.parentCode) {
        const parentCycleBlock = sheet.cycleBlock.find(parent => parent.code === block.parentCode);
        if (parentCycleBlock && (
          parentCycleBlock.top > block.top
          || parentCycleBlock.bottom < block.bottom
          || parentCycleBlock.left > block.left
          || parentCycleBlock.right < block.right
        )) {
          throw new Error(
            intl.get('hrpt.reportDesign.error.cycleBlockSizeLimit').d('子循环块不允许超出父循环块范围')
          );
        }
        if (sheet.headerBlock && (
          (sheet.headerBlock.top <= block.top && block.top <= sheet.headerBlock.bottom) ||
          (sheet.headerBlock.top <= block.bottom && block.bottom <= sheet.headerBlock.bottom)
        )) {
          throw new Error(
            intl.get('hrpt.reportDesign.error.cycleBlockithFixBlock').d('固定区域不支持包含子循环块，请检查模板设置')
          );
        }
        if (sheet.footerBlock && (
          (sheet.footerBlock.top <= block.top && block.top <= sheet.footerBlock.bottom) ||
          (sheet.footerBlock.top <= block.bottom && block.bottom <= sheet.footerBlock.bottom)
        )) {
          throw new Error(
            intl.get('hrpt.reportDesign.error.cycleBlockithFixBlock').d('固定区域不支持包含子循环块，请检查模板设置')
          );
        }
      }
      if (block.code === 'XXXapprovalRecordRootXXX') {
        const flag = sheet.cycleBlock.some(item => item.code !== block.code && item.parentCode === block.parentCode && 
          !(item.bottom < block.top || item.top > block.bottom || item.right < block.left || item.left > block.right)
        );
        if (flag) {
          throw new Error(
            intl.get('hrpt.reportDesign.error.cycleBlockApproveWithSibling').d('审批记录节点及其子节点循环块区域不得与同级其他循环块区域重叠')
          );
        }
      }
    });
  }
  if (sheet.repeateTitleRows && sheet.repeateTitleRows.length) {
    const repeatRowsRange = [];
    sheet.repeateTitleRows.forEach((repeatRow) => {
      if (sheet.headerBlock && (
        (repeatRow.top <= sheet.headerBlock.top && sheet.headerBlock.top <= repeatRow.bottom) ||
        (repeatRow.top <= sheet.headerBlock.bottom && sheet.headerBlock.bottom <= repeatRow.bottom)
      )) {
        throw new Error(
          intl.get('hrpt.reportDesign.error.repeateTitleRowWithFixBlock').d('固定区域不可与重复标题行重合，请检查模板配置')
        );
      }
      if (sheet.footerBlock && (
        (repeatRow.top <= sheet.footerBlock.top && sheet.footerBlock.top <= repeatRow.bottom) ||
        (repeatRow.top <= sheet.footerBlock.bottom && sheet.footerBlock.bottom <= repeatRow.bottom)
      )) {
        throw new Error(
          intl.get('hrpt.reportDesign.error.repeateTitleRowWithFixBlock').d('固定区域不可与重复标题行重合，请检查模板配置')
        );
      }
      if (sheet.pagingRowIndex && sheet.pagingRowIndex.length) {
        sheet.pagingRowIndex.forEach((row) => {
          if (repeatRow.top <= row && repeatRow.bottom >= row) {
            throw new Error(
              intl.get('hrpt.reportDesign.error.pagingInRepeatRow').d('重复标题行中不能存在分页符')
            );
          }
        });
      }
      if (sheet.cycleBlock && sheet.cycleBlock.length) {
        sheet.cycleBlock.forEach((cycBlock) => {
          if (repeatRow.top <= cycBlock.top && repeatRow.bottom >= cycBlock.bottom) {
            throw new Error(
              intl
                .get('hrpt.reportDesign.error.cycBlockInRepeatRow')
                .d('循环块不能放在重复标题行内')
            );
          }
        });
      }
      if (repeatRowsRange.length) {
        repeatRowsRange.forEach(([top, bottom]) => {
          if (repeatRow.top < bottom && repeatRow.bottom > top) {
            throw new Error(
              intl.get('hrpt.reportDesign.error.superimposedRepeatRow').d('重复标题行不能重叠')
            );
          }
        });
      }
      repeatRowsRange.push([repeatRow.top, repeatRow.bottom]);
    });
  }
  // 校验固定区域
  let mainBlock;
  if (sheet.cycleBlock && sheet.cycleBlock.length) {
    mainBlock = sheet.cycleBlock.find((b) => isNil(b.parentCode) && isNil(b.parentId));
  }
  if (mainBlock) {
    if (sheet.headerBlock && sheet.headerBlock.code && sheet.headerBlock.top !== mainBlock.top) {
      throw new Error(
        intl.get('hrpt.reportDesign.error.headerBlockOverTop').d('顶部固定显示区域需从第一行开始')
      );
    }
    if (
      sheet.footerBlock &&
      sheet.footerBlock.code &&
      sheet.footerBlock.bottom !== mainBlock.bottom
    ) {
      throw new Error(
        intl
          .get('hrpt.reportDesign.error.footerBlockOverBottom')
          .d('底部固定显示区域需为最外层循环块底部')
      );
    }
  }
}
function updateCellIsFixedHeight(sheet) {
  const { config, cellData } = sheet;
  const { isFixedHeight } = config || {};
  if (isFixedHeight) {
    sheet.cellData = cellData.map(cell => {
      if (isFixedHeight[cell.r]) {
        cell.fixedHeight = true;
      } else {
        delete cell.fixedHeight;
      }
      return cell;
    });
  }
}
export function syncCurrentCell(sheetRef, setCurrentCell) {
  let c = null;
  let position = null;
  const [{ row_focus = null, column_focus = null }] = sheetRef.current.getluckysheet_select_save() || [{}];
  const file = sheetRef.current.getluckysheetfile()[0];
  if (row_focus != null && column_focus != null) {
    c = file.data[row_focus][column_focus];
    position = {
      r: row_focus,
      c: column_focus,
      start_r: row_focus === 0 ? 0 : file.visibledatarow[row_focus - 1],
      start_c: column_focus === 0 ? 0 : file.visibledatacolumn[column_focus - 1],
      end_r: file.visibledatarow[row_focus],
      end_c: file.visibledatacolumn[column_focus],
    };
    setCurrentCell({
      value: c,
      position,
    });
  }
}

export function exitEditMode() {
  if (window.luckysheet) {
    window.luckysheet.exitEditMode();
  }
}

export function arrayToTree(array, idField, parentIdField, childrenField) {
  // 创建一个映射，以便我们可以快速查找每个项目的引用
  const idMap = {};
  array.forEach(item => {
    idMap[item[idField]] = { ...item, [childrenField]: [] };
  });

  // 构建树
  const tree = [];
  // 再次遍历，如果parentId存在，但idMap中没有parent，说明这是一个树的片段，同样作为父节点加入
  array.forEach(item => {
    if (!isNil(item[parentIdField]) && isNil(idMap[item[parentIdField]])) {
      tree.push(idMap[item[idField]]);
    }
  });
  array.forEach(item => {
    // 如果项目没有parentId，那么它是一个根节点
    if (isNil(item[parentIdField])) {
      tree.push(idMap[item[idField]]);
    } else {
      // 否则，将其添加到其父节点的children数组中
      if (!isNil(idMap[item[parentIdField]])) {
        if (isNil(idMap[item[parentIdField]][childrenField])) {
          idMap[item[parentIdField]][childrenField] = [];
        }
        idMap[item[parentIdField]][childrenField].push(idMap[item[idField]]);
      }
    }
  });
  return tree;
}

export function filterHeaderNodeFields(data) {
  if (data && data.length) {
    const headerNode = data.find(i => i.type === 'node' && isNil(i.parentId));
    if (headerNode) {
      return [headerNode].concat(data.filter(i => i.type === 'field' && i.parentId === headerNode.id));
    }
  }
  return [];
}

export function filterHeaderNodeFieldsRecords(dataSet) {
  if (dataSet && dataSet.length) {
    const headerNode = dataSet.find(i => i.get('type') === 'node' && isNil(i.get('parentId')));
    if (headerNode) {
      return [headerNode].concat(data.filter(i => i.get('type') === 'field' && i.get('parentId') === headerNode.get('id')));
    }
  }
  return [];
}

export function handleTempPageAggregatesChange(index, value, type, direction) {
  if (!luckysheetCache.tempPageAggregates || !luckysheetCache.tempPageAggregates.length) {
    return;
  }
  const newTempPageAggregates = [];
  luckysheetCache.tempPageAggregates.forEach(item => {
    const { column, row } = item;
    if ((type === 'rightbottom' && index < item[direction]) || (type === 'lefttop' && index <= item[direction])) {
      item[direction] += value;
    }
    newTempPageAggregates.push(item);
  });
  luckysheetCache.tempPageAggregates = newTempPageAggregates;
}

export function handleRowColChange(index, value, type, direction) {
  // 行列改变时同步调整 luckysheetCache.tempPageAggregates
  handleTempPageAggregatesChange(index, value, type, direction);
}

export function compressImage(file, option) {
  const {
    quality = 0.5,
    maxWidth = 500,
    maxHeight = 500,
  } = option || {};
  return new Promise((resolve, reject) => {
    // 创建 FileReader 对象
    const reader = new FileReader();
    // 读取文件为 DataURL
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      // 创建 Image 对象
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // 创建 canvas 元素
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // 计算压缩后的尺寸
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
        // 设置 canvas 的尺寸
        canvas.width = width;
        canvas.height = height;
        // 在 canvas 上绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        // 将 canvas 内容转换为 Blob 对象
        canvas.toBlob((blob) => {
          if (blob) {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => {
                  resolve({
                      file: reader.result,
                      width, 
                      height,
                  });
              };
          } else {
            reject(new Error('无法将 canvas 转换为 Blob'));
          }
        }, file.type, quality);
      };
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
  });
}