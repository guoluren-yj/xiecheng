/**
 * 确认合约类型定义
 *
 * ConfirmationContract 接口：每个需要用户确认的工具实现此合约。
 * 通用管线：pendingStore.get() → 找到 contract → onConfirm/onCancel
 *   → forHistory 精简 → batchSaveToolExchange → resumeSession
 *
 * @date: 2026-06-12
 */

export default {};
