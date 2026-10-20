export default function lucksheetLangData(intl) {
  return {
    "hrpt.common.design.button.confirm": intl.get("hzero.common.button.sure").d("确定"), // OK
    "hrpt.common.design.button.cancel": intl.get("hzero.common.button.cancel").d("取消"), // Cancel
    "hrpt.common.design.button.close": intl.get("hzero.common.button.close").d("关闭"), // Close
    "hrpt.common.design.paint.start": intl.get("hrpt.common.design.paint.start").d("格式刷开启"), // Paint Format Start
    "hrpt.common.design.paint.end": intl.get("hrpt.common.design.paint.end").d("ESC键退出"), // ESC
    "hrpt.common.design.paint.tipSelectRange": intl.get("hrpt.common.design.paint.tipSelectRange").d("请选择需要复制格式的区域"), // Please select the range to be copied
    "hrpt.common.design.paint.tipNotMulti": intl.get("hrpt.common.design.paint.tipNotMulti").d("无法对多重选择区域执行此操作"), // Cannot perform this operation on multiple selection ranges
    "hrpt.common.design.paint.pageSplit": intl.get("hrpt.common.design.paint.pageSplit").d("分页符"), // Page Break
    "hrpt.common.design.info.row": intl.get("hrpt.common.design.info.row").d("行"), // Row
    "hrpt.common.design.info.column": intl.get("hrpt.common.design.info.column").d("列"), // Column
    "hrpt.common.design.info.loading": intl.get("hrpt.common.design.info.loading").d("渲染中···"), // Loading...
    "hrpt.common.design.info.add": intl.get("hrpt.common.design.info.add").d("添加"), // Add
    "hrpt.common.design.info.addLast": intl.get("hrpt.common.design.info.addLast").d("在底部添加"), // More Rows at Bottom
    "hrpt.common.design.info.backTop": intl.get("hrpt.common.design.info.backTop").d("回到顶部"), // Back to The Top
    "hrpt.common.design.info.tipInputNumber": intl.get("hrpt.common.design.info.tipInputNumber").d("请输入数字"), // Please Enter The Number
    "hrpt.common.design.info.tipInputNumberLimit": intl.get("hrpt.common.design.info.tipInputNumberLimit").d("增加范围限制在1-100"), // The increase range is limited to 1-100
    "hrpt.common.design.info.tipRowHeightLimit": intl.get("hrpt.common.design.info.tipRowHeightLimit").d("行高必须在0 ~ 545之间"), // Row height must be between 0 ~ 545
    "hrpt.common.design.info.tipColumnWidthLimit": intl.get("hrpt.common.design.info.tipColumnWidthLimit").d("列宽必须在0 ~ 2038之间"), // The column width must be between 0 ~ 2038
    "hrpt.common.design.info.mergeMultipleValues": intl.get("hrpt.common.design.info.mergeMultipleValues").d("合并后将只保留左上角单元格中的内容"), // After merging, only the contents in the upper left cell will be retained
    "hrpt.common.design.info.cycleBlockCannotCross": intl.get("hrpt.common.design.info.cycleBlockCannotCross").d("循环块区域设置不能交叉"), // The setting of the loop block area cannot cross
    "hrpt.common.design.info.cycleBlockOnlyOne": intl.get("hrpt.common.design.info.cycleBlockOnlyOne").d("当前节点已设置循环块，请勿重复设置"), // Current node has loop block set, do not duplicate the setting.
    "hrpt.common.design.info.cycleBlockCannotRepeat": intl.get("hrpt.common.design.info.cycleBlockCannotRepeat").d("当前区域已设置循环块，请勿重复设置"), // Current area has loop block set, do not duplicate the setting.
    "hrpt.common.design.info.fieldNotInCycleBlock": intl.get("hrpt.common.design.info.fieldNotInCycleBlock").d("字段需拖动到循环块区域内！"), // Fields need to be dragged into the loop block area
    "hrpt.common.design.info.fieldInValidCycleBlock": intl.get("hrpt.common.design.info.fieldInValidCycleBlock").d("该字段不能拖动到当前循环块区域内！"), // This field cannot be dragged into the current loop block area
    "hrpt.common.design.info.cycleBlockChildInvalid": intl.get("hrpt.common.design.info.cycleBlockChildInvalid").d("子节点需拖动到父节点内!"), // Child nodes need to be dragged into the parent node
    "hrpt.common.design.info.cycleBlockApproveWithSibling": intl.get("hrpt.common.design.info.cycleBlockApproveWithSibling").d("审批记录节点及其子节点循环块区域不得与同级其他循环块区域重叠!"), // Child nodes need to be dragged into the parent node
    "hrpt.common.design.info.headerFixAreaMustFormFirstRow": intl.get("hrpt.common.design.info.headerFixAreaMustFormFirstRow").d("顶部固定显示区域需从第一行开始"), // The top fixed display area needs to start from the first row
    "hrpt.common.design.info.footerFixAreaMustFormLastRow": intl.get("hrpt.common.design.info.footerFixAreaMustFormLastRow").d("底部固定显示区域需从根循环块末行位置向上展开"), // The bottom fixed display area needs to start from the last row of the root loop block and expand upward
    "hrpt.common.design.info.fixBlockMustBeInCycleBlock": intl.get("hrpt.common.design.info.fixBlockMustBeInCycleBlock").d("固定显示区域需设置到循环块区域内"), // Fixed display area needs to be set within the loop block area
    "hrpt.common.design.info.repeatTitleRowMustBeInCycleBlock": intl.get("hrpt.common.design.info.repeatTitleRowMustBeInCycleBlock").d("重复标题行需设置到循环块区域内"), // Repeating header row needs to be set within the loop block area
    "hrpt.common.design.info.pageNumNotInFixArea": intl.get("hrpt.common.design.info.pageNumNotInFixArea").d("页码需设置在固定区域内！"), // Page number needs to be set in a fixed area
    "hrpt.common.design.info.overPaper": intl.get("hrpt.common.design.info.overPaper").d("纸张外部"), // Area outside the paper
    "hrpt.common.design.info.confirmDelete": intl.get("hrpt.common.design.info.confirmDelete").d("确认删除吗"), // Confirm deletion
    "hrpt.common.design.info.mergeCellChangeFailed": intl.get("hrpt.common.design.info.mergeCellChangeFailed").d("不能对合并单元格做部分更改"), // Partial changes cannot be made to merged cells
    "hrpt.common.design.info.tips": intl.get("hrpt.common.design.info.tips").d("提示"), // Tips
    "hrpt.common.design.info.headerBlock": intl.get("hrpt.common.design.info.headerBlock").d("每页顶部固定区域"), // Fixed Top Area Per Page
    "hrpt.common.design.info.footerBlock": intl.get("hrpt.common.design.info.footerBlock").d("每页底部固定区域"), // Fixed Bottom Area Per Page
    "hrpt.common.design.info.repeatBlock": intl.get("hrpt.common.design.info.repeatBlock").d("每页重复标题行"), // Repeat Header Rows Per Page
    "hrpt.common.design.info.pageTotalRows": intl.get("hrpt.common.design.info.pageTotalRows").d("每页重复汇总行"), // Repeat Header Rows Per Page
    "hrpt.common.design.info.editCycleBlockNode": intl.get("hrpt.common.design.info.editCycleBlockNode").d("选择节点进行编辑"), // Select Node for Editing
    "hrpt.common.design.info.noPagingAreaBlock": intl.get("hrpt.common.design.info.noPagingAreaBlock").d("不可跨页区域"), // Select Node for Editing
    "hrpt.common.design.rightclick.cut": intl.get("hrpt.common.design.rightclick.cut").d("剪切"), // Cut
    "hrpt.common.design.rightclick.copy": intl.get("hzero.common.button.copy").d("复制"), // Copy
    "hrpt.common.design.rightclick.paste": intl.get("hrpt.common.design.rightclick.paste").d("粘贴"), // Paste
    "hrpt.common.design.rightclick.delete": intl.get("hrpt.common.design.rightclick.delete").d("删除"), // Delete
    "hrpt.common.design.rightclick.deleteSelected": intl.get("hrpt.common.design.rightclick.deleteSelected").d("删除选中"), // Delete Selected
    "hrpt.common.design.rightclick.row": intl.get("hrpt.common.design.rightclick.row").d("行"), // Row
    "hrpt.common.design.rightclick.column": intl.get("hrpt.common.design.rightclick.column").d("列"), // Column
    "hrpt.common.design.rightclick.width": intl.get("hrpt.common.design.rightclick.width").d("宽"), // Width
    "hrpt.common.design.rightclick.height": intl.get("hrpt.common.design.rightclick.height").d("高"), // Height
    "hrpt.common.design.rightclick.number": intl.get("hrpt.common.design.rightclick.number").d("数字"), // Number
    "hrpt.common.design.rightclick.clearContent": intl.get("hrpt.common.design.rightclick.clearContent").d("清除内容"), // Clear Content
    "hrpt.common.design.rightclick.mergeAutoStretch": intl.get("hrpt.common.design.rightclick.mergeAutoStretch").d("自动合并单元格"), // Auto Merge Cells
    "hrpt.common.design.rightclick.generateNewMatrix": "Generate new matrix",
    "hrpt.common.design.rightclick.insertTop": intl.get("hrpt.common.design.rightclick.insertTop").d("在上方插入"), // Insert Above
    "hrpt.common.design.rightclick.insertBottom": intl.get("hrpt.common.design.rightclick.insertBottom").d("在下方插入"), // Insert Below
    "hrpt.common.design.rightclick.insertLeft": intl.get("hrpt.common.design.rightclick.insertLeft").d("在左侧插入"), // Insert on The Left
    "hrpt.common.design.rightclick.insertRight": intl.get("hrpt.common.design.rightclick.insertRight").d("在右侧插入"), // Insert on The Right
    "hrpt.common.design.rightclick.insertPagingFlag": intl.get("hrpt.common.design.rightclick.insertPagingFlag").d("所选行插入分页符"), // Insert Page Break in Selected Row
    "hrpt.common.design.rightclick.insertPageNum": intl.get("hrpt.common.design.rightclick.insertPageNum").d("插入页码"), // Insert Page Number
    "hrpt.common.design.rightclick.pageNumFormat1": "1,2,3", // 1,2,3
    "hrpt.common.design.rightclick.pageNumFormat2": "-1-,-2-,-3-", // -1-,-2-,-3-
    "hrpt.common.design.rightclick.pageNumFormat3": intl.get("hrpt.common.design.rightclick.pageNumFormat3").d("第1页"), // Page 1
    "hrpt.common.design.rightclick.pageNumFormat4": intl.get("hrpt.common.design.rightclick.pageNumFormat4").d("第1页 共X页"), // Page 1, Total X pages
    "hrpt.common.design.rightclick.pageNumFormat5": intl.get("hrpt.common.design.rightclick.pageNumFormat5").d("第1页/共X页"), // Page 1 / Total X pages
    "hrpt.common.design.rightclick.removePagingFlag": intl.get("hrpt.common.design.rightclick.removePagingFlag").d("清除所选行分页符"), // Clear Page Break in Selected Row
    "hrpt.common.design.rightclick.setSetRepeatTitleRow": intl.get("hrpt.common.design.rightclick.setSetRepeatTitleRow").d("所选行设为每页重复标题行"), // Set as Repeating Header Row on Each Page
    "hrpt.common.design.rightclick.setPageTotalRange": intl.get("hrpt.common.design.rightclick.setPageTotalRange").d("所选行设为每页重复汇总行"), // Set as Repeating Header Row on Each Page
    "hrpt.common.design.rightclick.setFixHeaderShowArea": intl.get("hrpt.common.design.rightclick.setFixHeaderShowArea").d("所选行设为每页顶部固定显示区域"), // Set the Selected Row as A Fixed Display Area at the Top of Each Page
    "hrpt.common.design.rightclick.setFixFooterShowArea": intl.get("hrpt.common.design.rightclick.setFixFooterShowArea").d("所选行设为每页底部固定显示区域"), // Set the Selected Row as A Fixed Display Area at the Bottom of Each Page
    "hrpt.common.design.rightclick.setRowFixHeightFlag": intl.get("hrpt.common.design.rightclick.setRowFixHeightFlag").d("固定行高"), // Fixed Row Height
    "hrpt.common.design.rightclick.setNoPagingArea": intl.get("hrpt.common.design.rightclick.setNoPagingArea").d("所选行设为不允许跨页展示区域"), // Fixed Row Height
    "hrpt.common.design.rightclick.uploadLocalImg": intl.get("hrpt.common.design.rightclick.uploadLocalImg").d("上传本地图片"), // Upload Local Image
    "hrpt.common.design.rightclick.selectDataSource": intl.get("hrpt.common.design.rightclick.selectDataSource").d("选择字段作为图片来源"), // Select Fields as Image Source
    "hrpt.common.design.rightclick.selectDataSourceHelp": intl.get("hrpt.common.design.rightclick.selectDataSourceHelp").d("动态图片请维护合适大小，避免影响打印效果；图片压缩渲染规则：大于5000 * 5000 像素则不会进行渲染，大于1000 * 1000 像素则压缩渲染，其他则正常展示渲染"), // Select Fields as Image Source
    "hrpt.common.design.rightclick.insertFloatImage": intl.get("hrpt.common.design.rightclick.insertFloatImage").d("插入浮动图片"), // Insert Floating Image
    "hrpt.common.design.rightclick.insertCellImage": intl.get("hrpt.common.design.rightclick.insertCellImage").d("插入单元格图片"), // Insert Cell Image
    "hrpt.common.design.rightclick.insertFormula": intl.get("hrpt.common.design.rightclick.insertFormula").d("插入公式"), // Insert Formula
    "hrpt.common.design.rightclick.setQrcode": intl.get("hrpt.common.design.rightclick.setQrcode").d("设置为二维码"), // Set as QR Code
    "hrpt.common.design.rightclick.cancelQrcode": intl.get("hrpt.common.design.rightclick.cancelQrcode").d("取消设置二维码"), // Cancel Set as QR Code
    "hrpt.common.design.rightclick.setBarcode": intl.get("hrpt.common.design.rightclick.setBarcode").d("设置为条形码"), // Set as Barcode
    "hrpt.common.design.rightclick.cellFormat": intl.get("hrpt.common.design.rightclick.cellFormat").d("设置单元格格式"), // Set Cell Format
    "hrpt.common.design.findAndReplace.find": intl.get("hrpt.common.design.findAndReplace.find").d("查找"), // Find
    "hrpt.common.design.findAndReplace.replace": intl.get("hrpt.common.design.findAndReplace.replace").d("替换"), // Replace
    "hrpt.common.design.findAndReplace.goto": intl.get("hrpt.common.design.findAndReplace.goto").d("转到"), // Go to
    "hrpt.common.design.findAndReplace.location": intl.get("hrpt.common.design.findAndReplace.location").d("定位条件"), // Location
    "hrpt.common.design.findAndReplace.formula": intl.get("hrpt.common.design.findAndReplace.formula").d("公式"), // Formula
    "hrpt.common.design.findAndReplace.date": intl.get("hrpt.common.design.findAndReplace.date").d("日期"), // Date
    "hrpt.common.design.findAndReplace.number": intl.get("hrpt.common.design.findAndReplace.number").d("数字"), // Number
    "hrpt.common.design.findAndReplace.string": intl.get("hrpt.common.design.findAndReplace.string").d("字符"), // String
    "hrpt.common.design.findAndReplace.error": intl.get("hrpt.common.design.findAndReplace.error").d("错误"), // Error
    "hrpt.common.design.findAndReplace.condition": intl.get("hrpt.common.design.findAndReplace.condition").d("条件格式"), // Condition
    "hrpt.common.design.findAndReplace.rowSpan": intl.get("hrpt.common.design.findAndReplace.rowSpan").d("间隔行"), // Row span
    "hrpt.common.design.findAndReplace.columnSpan": intl.get("hrpt.common.design.findAndReplace.columnSpan").d("间隔列"), // Column span
    "hrpt.common.design.findAndReplace.locationExample": intl.get("hrpt.common.design.findAndReplace.locationExample").d("定位"), // Location
    "hrpt.common.design.findAndReplace.lessTwoRowTip": intl.get("hrpt.common.design.findAndReplace.lessTwoRowTip").d("请选择最少两行"), // Please select at least two rows
    "hrpt.common.design.findAndReplace.lessTwoColumnTip": intl.get("hrpt.common.design.findAndReplace.lessTwoColumnTip").d("请选择最少两列"), // Please select at least two columns
    "hrpt.common.design.findAndReplace.findTextbox": intl.get("hrpt.common.design.findAndReplace.findTextbox").d("查找内容"), // Find Content
    "hrpt.common.design.findAndReplace.replaceTextbox": intl.get("hrpt.common.design.findAndReplace.replaceTextbox").d("替换内容"), // Replace Content
    "hrpt.common.design.findAndReplace.wholeTextbox": intl.get("hrpt.common.design.findAndReplace.wholeTextbox").d("整词匹配"), // Whole Word
    "hrpt.common.design.findAndReplace.distinguishTextbox": intl.get("hrpt.common.design.findAndReplace.distinguishTextbox").d("区分大小写匹配"), // Case Sensitive
    "hrpt.common.design.findAndReplace.allReplaceBtn": intl.get("hrpt.common.design.findAndReplace.allReplaceBtn").d("全部替换"), // Replace All
    "hrpt.common.design.findAndReplace.replaceBtn": intl.get("hrpt.common.design.findAndReplace.replaceBtn").d("替换"), // Replace
    "hrpt.common.design.findAndReplace.allFindBtn": intl.get("hrpt.common.design.findAndReplace.allFindBtn").d("查找全部"), // Find All
    "hrpt.common.design.findAndReplace.findBtn": intl.get("hrpt.common.design.findAndReplace.findBtn").d("查找下一个"), // Find next
    "hrpt.common.design.findAndReplace.noFindTip": intl.get("hrpt.common.design.findAndReplace.noFindTip").d("没有查找到该内容"), // The content was not found
    "hrpt.common.design.findAndReplace.modeTip": intl.get("hrpt.common.design.findAndReplace.modeTip").d("该模式下不可进行此操作"), // This operation is not available in this mode
    "hrpt.common.design.findAndReplace.searchTargetSheet": intl.get("hrpt.common.design.findAndReplace.searchTargetSheet").d("工作表"), // Sheet
    "hrpt.common.design.findAndReplace.searchTargetCell": intl.get("hrpt.common.design.findAndReplace.searchTargetCell").d("单元格"), // Cell
    "hrpt.common.design.findAndReplace.searchTargetValue": intl.get("hrpt.common.design.findAndReplace.searchTargetValue").d("值"), // Value
    "hrpt.common.design.findAndReplace.searchInputTip": intl.get("hrpt.common.design.findAndReplace.searchInputTip").d("请输入查找内容"), // Please enter the search content
    "hrpt.common.design.findAndReplace.noReplceTip": intl.get("hrpt.common.design.findAndReplace.noReplceTip").d("没有可替换的内容"), // There is nothing to replace
    "hrpt.common.design.findAndReplace.noMatchTip": intl.get("hrpt.common.design.findAndReplace.noMatchTip").d("找不到匹配项"), // No match found
    "hrpt.common.design.findAndReplace.successTip": intl.get("hrpt.common.design.findAndReplace.successTip").d("已经帮您搜索并进行了${xlength}处替换"), // ${xlength} items found
    "hrpt.common.design.drag.noMerge": intl.get("hrpt.common.design.drag.noMerge").d("无法对合并单元格执行此操作"), // Cannot perform this operation on merged cells
    "hrpt.common.design.drag.noMulti": intl.get("hrpt.common.design.drag.noMulti").d("无法对多重选择区域执行此操作,请选择单个区域"), // Cannot perform this operation on multiple selection areas, please select a single area
    "hrpt.common.design.drag.noPaste": intl.get("hrpt.common.design.drag.noPaste").d("无法在此处粘贴此内容，请选择粘贴区域的一个单元格，然后再次尝试粘贴"), // Unable to paste this content here, please select a cell in the paste area and try to paste again
    "hrpt.common.design.drag.noPartMerge": intl.get("hrpt.common.design.drag.noPartMerge").d("无法对部分合并单元格执行此操作"), // Cannot perform this operation on partially merged cells
  };
}
