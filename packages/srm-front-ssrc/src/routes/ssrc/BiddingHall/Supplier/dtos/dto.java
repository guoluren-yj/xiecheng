package routes.ssrc.BiddingHall.Supplier.dtos;

import io.swagger.annotations.ApiModelProperty;
import org.hibernate.validator.constraints.NotBlank;
import org.srm.common.mybatis.domain.ExpandDomain;
import org.srm.source.bidding.supplier.domain.entity.BiddingSupHeader;
import org.srm.source.bidding.supplier.domain.entity.BiddingSupHeaderCur;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Date;

/**
 * @author feibao.han@going-link.com 2023-05-09 11:44:38
 */
public class BiddingSupHeaderDTO extends ExpandDomain {

    //
    // 业务方法(按public protected private顺序排列)
    // ------------------------------------------------------------------------------

    //
    // 数据库字段
    // ------------------------------------------------------------------------------

    @ApiModelProperty("")
    @Id
    @GeneratedValue
    private Long biddingSupHeaderCurId;
    @ApiModelProperty(value = "所属租户ID，hpfm_tenant.tenant_id", required = true)
    @NotNull
    private Long tenantId;
    @ApiModelProperty(value = "RFx单头ID", required = true)
    @NotNull
    private Long rfxHeaderId;
    @ApiModelProperty(value = "RFx报价单号", required = true)
    @NotBlank
    private String quotationNum;
    @ApiModelProperty(value = "轮次", required = true)
    @NotNull
    private Long roundNumber;
    @ApiModelProperty(value = "报价单状态SSRC.RFX_QUOTATION_STATUS(NEW/新建|QUOTED/已报价|FINISHED/结束)", required = true)
    @NotBlank
    private String quotationStatus;
    @ApiModelProperty(value = "")
    private Long supplierTenantId;
    @ApiModelProperty(value = "")
    private Long supplierCompanyId;
    @ApiModelProperty(value = "供应方企业名称", required = true)
    @NotBlank
    private String supplierCompanyName;
    @ApiModelProperty(value = "含税标识", required = true)
    @NotNull
    private Integer taxIncludedFlag;
    @ApiModelProperty(value = "税率ID")
    private Long taxId;
    @ApiModelProperty(value = "税率")
    private BigDecimal taxRate;
    @ApiModelProperty(value = "")
    private String currencyCode;
    @ApiModelProperty(value = "汇率")
    private Long exchangeRateId;
    @ApiModelProperty(value = "汇率类型")
    private String exchangeRateType;
    @ApiModelProperty(value = "汇率日期")
    private Date exchangeRateDate;
    @ApiModelProperty(value = "汇率期间")
    private String exchangeRatePeriod;
    @ApiModelProperty(value = "备注")
    private String quotationRemark;
    @ApiModelProperty(value = "商务附件UUID")
    private String businessAttachmentUuid;
    @ApiModelProperty(value = "技术附件UUID")
    private String techAttachmentUuid;
    @ApiModelProperty(value = "报价单头附件提交标识")
    private Integer submitAttachmentFlag;
    @ApiModelProperty(value = "供应商行表id")
    private Long rfxLineSupplierId;
    @ApiModelProperty(value = "汇率")
    private BigDecimal exchangeRate;
    @ApiModelProperty(value = "付款方式ID")
    private Long paymentTypeId;
    @ApiModelProperty(value = "付款条款ID")
    private Long paymentTermId;
    @ApiModelProperty(value = "签到标识：1已签到0未签到")
    private Integer signInFlag;

    //
    // 非数据库字段
    // ------------------------------------------------------------------------------
    private BiddingSupHeader biddingSupHeader;
    private BiddingSupHeaderCur biddingSupHeaderCur;
    private BiddingSupHeaderCur trialBiddingSupHeaderCur;
    @ApiModelProperty(value = "竞价方式(竞价大厅专用字段):SSRC.BIDDING_QUOTATION_METHOD:竞价：BIDDING；拍卖：AUCTION")
    private String biddingQuotationMethod;
    @ApiModelProperty(value = "竞价模式(竞价大厅专用字段):SSRC.BIDDING_MODE英式竞价：BRITISH_BIDDING；荷兰式竞价DUTCH_BIDDING;日式竞价：JAPANESE_BIDDING")
    private String biddingMode;
    @ApiModelProperty(value = "在线签到:用于配置竞价开始前，供应商是否需要在线签到。0:否,1:是")
    private Integer biddingOnlineSignInFlag;
    @ApiModelProperty(value = "试竞价标识(竞价大厅专用字段):用于配置正式竞价开始前，供应商是否试竞价：1:是；0:否")
    private Integer biddingTrialBiddingFlag;
    @ApiModelProperty(value = "竞价对象(竞价大厅专用字段):SSRC.BIDDING_TARGET:单价：UNIT_PRICE；总价：TOTAL_PRICE")
    private String biddingTarget;
    @ApiModelProperty(value = "报价次序(竞价大厅专用字段):SSRC.BIDDING_QUOTATION_ORDER并行:PARALLEL;序列:SEQUENCE")
    private String quotationOrderType;
    @ApiModelProperty(value = "出价策略(竞价大厅专用字段):SSRC.BIDDING_STRATEGY:低于最低价:BELOW_THE_LOWEST_PRICE;低于上次报价: LOWER_THAN_LAST_QUOTE;高于最高价:ABOVE_MAXIMUM_PRICE;高于上次报价: ABOVE_THAN_LAST_QUOTE")
    private String biddingStrategy;
    @ApiModelProperty(value = "延时总时长限制:用于配置延时竞价时，延时总时长的限制。竞价大厅专用字段")
    private BigDecimal biddingTotalDelayLimit;
    @ApiModelProperty(value = "允许报价次数:用于配置竞价过程中，供应商最多可报价次数。(竞价大厅专用字段)")
    private Long biddingAllowedQuotationCount;
    @ApiModelProperty(value = "匿名报价:用于配置竞价过程中，采购是否可以查看供应商名称。0:否,1:是 (竞价大厅专用字段)")
    private Integer biddingAnonymousQuotesFlag;
    @ApiModelProperty(value = "淘汰规则-淘汰轮次(竞价大厅专用字段)：日式竞价供应商超过多少轮未响应，自动被淘汰")
    private Long biddingEliminateRoundNumber;
    @ApiModelProperty(value = "公开淘汰供应商数标识(竞价大厅专用字段)：1是；0否")
    private Integer biddingOpenEliminateSupplierFlag;
    @ApiModelProperty(value = "最少入围供应商数(竞价大厅专用字段)")
    private Long biddingMinShortlistedSupplierNumber;
    @ApiModelProperty(value = "公开最低/最高限价(竞价大厅专用字段)：1是；0否")
    private Integer biddingOpenLimitPriceFlag;
    @ApiModelProperty(value = "竞价大厅模版标识(竞价大厅专用字段)")
    private Integer biddingFlag;
    @ApiModelProperty(value = "起竞价(竞价大厅专用字段)")
    private BigDecimal startingBiddingPrice;
    @ApiModelProperty(value = "浮动方式(竞价大厅专用字段)")
    private String floatType;
    @ApiModelProperty(value = "报价幅度(竞价大厅专用字段)")
    private BigDecimal quotationRange;
    @ApiModelProperty(value = "安全价(竞价大厅专用字段)")
    private BigDecimal safePrice;
    @ApiModelProperty(value = "签到设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer signInRunningDurationFlag;
    @ApiModelProperty(value = "签到发布即开始标识(竞价大厅专用字段)")
    private Integer signInStartFlag;
    @ApiModelProperty(value = "签到开始时间(竞价大厅专用字段)")
    private Date signInStartDate;
    @ApiModelProperty(value = "签到运行时间(竞价大厅专用字段)")
    private BigDecimal signInRunningDuration;
    @ApiModelProperty(value = "签到截止时间(竞价大厅专用字段)")
    private Date signInEndDate;
    @ApiModelProperty(value = "试竞价设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer startingTrialBiddingRunningDurationFlag;
    @ApiModelProperty(value = "试竞价发布即开始标识(竞价大厅专用字段)")
    private Integer startingTrialBiddingStartFlag;
    @ApiModelProperty(value = "试竞价开始时间(竞价大厅专用字段)")
    private Date startingTrialBiddingStartDate;
    @ApiModelProperty(value = "试竞价运行时间(竞价大厅专用字段)")
    private BigDecimal startingTrialBiddingRunningDuration;
    @ApiModelProperty(value = "试竞价截止时间(竞价大厅专用字段)")
    private Date startingTrialBiddingEndDate;
    @ApiModelProperty(value = "设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)")
    private Integer startingBiddingRunningDurationFlag;
    @ApiModelProperty(value = "延时触发规规则(竞价大厅专用字段):SSRC.AUTO_DEFER_TYPE：出现新的报价时触发：NEW_OFFER ；第1名价格发生变化时触发)：TOP_ONE_CHANGE")
    private String autoDeferType;
    @ApiModelProperty(value = "延时触发时间段（分钟）(竞价大厅专用字段)")
    private BigDecimal autoDeferPeriod;
    @ApiModelProperty(value = "延时触发规则(竞价大厅专用字段)：SSRC.AUTO_DEFER_TIME_RULE：基于新报价出现时间延时NEW_QUOTE；基于第一名价格变化时间延时：TOP_ONE_CHANGE；基于报价截止时间延时：QUOTE_END")
    private String autoDeferTimeRule;
    @ApiModelProperty(value = "最大延时次数 (竞价大厅专用字段)")
    private Long maxDeferCount;
    private String rfxStatus;
    /**
     * 竞价头状态
     */
    private String displayBiddingSupHeaderStatus;
    @ApiModelProperty(value = "报价开始时间")
    private Date quotationStartDate;
    private Date latestQuotationEndDate;
    private String openRule;
    @ApiModelProperty(value = "供应商牌号")
    private String supplierNumberPlate;

    //
    // getter/setter
    // ------------------------------------------------------------------------------

    public String getSupplierNumberPlate() {
        return supplierNumberPlate;
    }

    public void setSupplierNumberPlate(String supplierNumberPlate) {
        this.supplierNumberPlate = supplierNumberPlate;
    }

    public String getOpenRule() {
        return openRule;
    }

    public void setOpenRule(String openRule) {
        this.openRule = openRule;
    }

    public Date getQuotationStartDate() {
        return quotationStartDate;
    }

    public Date getLatestQuotationEndDate() {
        return latestQuotationEndDate;
    }

    public void setLatestQuotationEndDate(Date latestQuotationEndDate) {
        this.latestQuotationEndDate = latestQuotationEndDate;
    }

    public void setQuotationStartDate(Date quotationStartDate) {
        this.quotationStartDate = quotationStartDate;
    }

    public String getDisplayBiddingSupHeaderStatus() {
        return displayBiddingSupHeaderStatus;
    }

    public void setDisplayBiddingSupHeaderStatus(String displayBiddingSupHeaderStatus) {
        this.displayBiddingSupHeaderStatus = displayBiddingSupHeaderStatus;
    }

    public String getRfxStatus() {
        return rfxStatus;
    }

    public void setRfxStatus(String rfxStatus) {
        this.rfxStatus = rfxStatus;
    }

    public BiddingSupHeaderCur getTrialBiddingSupHeaderCur() {
        return trialBiddingSupHeaderCur;
    }

    public void setTrialBiddingSupHeaderCur(BiddingSupHeaderCur trialBiddingSupHeaderCur) {
        this.trialBiddingSupHeaderCur = trialBiddingSupHeaderCur;
    }

    public String getBiddingQuotationMethod() {
        return biddingQuotationMethod;
    }

    public void setBiddingQuotationMethod(String biddingQuotationMethod) {
        this.biddingQuotationMethod = biddingQuotationMethod;
    }

    public String getBiddingMode() {
        return biddingMode;
    }

    public void setBiddingMode(String biddingMode) {
        this.biddingMode = biddingMode;
    }

    public Integer getBiddingOnlineSignInFlag() {
        return biddingOnlineSignInFlag;
    }

    public void setBiddingOnlineSignInFlag(Integer biddingOnlineSignInFlag) {
        this.biddingOnlineSignInFlag = biddingOnlineSignInFlag;
    }

    public Integer getBiddingTrialBiddingFlag() {
        return biddingTrialBiddingFlag;
    }

    public void setBiddingTrialBiddingFlag(Integer biddingTrialBiddingFlag) {
        this.biddingTrialBiddingFlag = biddingTrialBiddingFlag;
    }

    public String getBiddingTarget() {
        return biddingTarget;
    }

    public void setBiddingTarget(String biddingTarget) {
        this.biddingTarget = biddingTarget;
    }

    public String getBiddingQuotationOrder() {
        return quotationOrderType;
    }

    public void setBiddingQuotationOrder(String quotationOrderType) {
        this.quotationOrderType = quotationOrderType;
    }

    public String getBiddingStrategy() {
        return biddingStrategy;
    }

    public void setBiddingStrategy(String biddingStrategy) {
        this.biddingStrategy = biddingStrategy;
    }

    public BigDecimal getBiddingTotalDelayLimit() {
        return biddingTotalDelayLimit;
    }

    public void setBiddingTotalDelayLimit(BigDecimal biddingTotalDelayLimit) {
        this.biddingTotalDelayLimit = biddingTotalDelayLimit;
    }

    public Long getBiddingAllowedQuotationCount() {
        return biddingAllowedQuotationCount;
    }

    public void setBiddingAllowedQuotationCount(Long biddingAllowedQuotationCount) {
        this.biddingAllowedQuotationCount = biddingAllowedQuotationCount;
    }

    public Integer getBiddingAnonymousQuotesFlag() {
        return biddingAnonymousQuotesFlag;
    }

    public void setBiddingAnonymousQuotesFlag(Integer biddingAnonymousQuotesFlag) {
        this.biddingAnonymousQuotesFlag = biddingAnonymousQuotesFlag;
    }

    public Long getBiddingEliminateRoundNumber() {
        return biddingEliminateRoundNumber;
    }

    public void setBiddingEliminateRoundNumber(Long biddingEliminateRoundNumber) {
        this.biddingEliminateRoundNumber = biddingEliminateRoundNumber;
    }

    public Integer getBiddingOpenEliminateSupplierFlag() {
        return biddingOpenEliminateSupplierFlag;
    }

    public void setBiddingOpenEliminateSupplierFlag(Integer biddingOpenEliminateSupplierFlag) {
        this.biddingOpenEliminateSupplierFlag = biddingOpenEliminateSupplierFlag;
    }

    public Long getBiddingMinShortlistedSupplierNumber() {
        return biddingMinShortlistedSupplierNumber;
    }

    public void setBiddingMinShortlistedSupplierNumber(Long biddingMinShortlistedSupplierNumber) {
        this.biddingMinShortlistedSupplierNumber = biddingMinShortlistedSupplierNumber;
    }

    public Integer getBiddingOpenLimitPriceFlag() {
        return biddingOpenLimitPriceFlag;
    }

    public void setBiddingOpenLimitPriceFlag(Integer biddingOpenLimitPriceFlag) {
        this.biddingOpenLimitPriceFlag = biddingOpenLimitPriceFlag;
    }

    public Integer getBiddingFlag() {
        return biddingFlag;
    }

    public void setBiddingFlag(Integer biddingFlag) {
        this.biddingFlag = biddingFlag;
    }

    public BigDecimal getStartingBiddingPrice() {
        return startingBiddingPrice;
    }

    public void setStartingBiddingPrice(BigDecimal startingBiddingPrice) {
        this.startingBiddingPrice = startingBiddingPrice;
    }

    public String getFloatType() {
        return floatType;
    }

    public void setFloatType(String floatType) {
        this.floatType = floatType;
    }

    public BigDecimal getQuotationRange() {
        return quotationRange;
    }

    public void setQuotationRange(BigDecimal quotationRange) {
        this.quotationRange = quotationRange;
    }

    public BigDecimal getSafePrice() {
        return safePrice;
    }

    public void setSafePrice(BigDecimal safePrice) {
        this.safePrice = safePrice;
    }

    public Integer getSignInRunningDurationFlag() {
        return signInRunningDurationFlag;
    }

    public void setSignInRunningDurationFlag(Integer signInRunningDurationFlag) {
        this.signInRunningDurationFlag = signInRunningDurationFlag;
    }

    public Integer getSignInStartFlag() {
        return signInStartFlag;
    }

    public void setSignInStartFlag(Integer signInStartFlag) {
        this.signInStartFlag = signInStartFlag;
    }

    public Date getSignInStartDate() {
        return signInStartDate;
    }

    public void setSignInStartDate(Date signInStartDate) {
        this.signInStartDate = signInStartDate;
    }

    public BigDecimal getSignInRunningDuration() {
        return signInRunningDuration;
    }

    public void setSignInRunningDuration(BigDecimal signInRunningDuration) {
        this.signInRunningDuration = signInRunningDuration;
    }

    public Date getSignInEndDate() {
        return signInEndDate;
    }

    public void setSignInEndDate(Date signInEndDate) {
        this.signInEndDate = signInEndDate;
    }

    public Integer getStartingTrialBiddingRunningDurationFlag() {
        return startingTrialBiddingRunningDurationFlag;
    }

    public void setStartingTrialBiddingRunningDurationFlag(Integer startingTrialBiddingRunningDurationFlag) {
        this.startingTrialBiddingRunningDurationFlag = startingTrialBiddingRunningDurationFlag;
    }

    public Integer getStartingTrialBiddingStartFlag() {
        return startingTrialBiddingStartFlag;
    }

    public void setStartingTrialBiddingStartFlag(Integer startingTrialBiddingStartFlag) {
        this.startingTrialBiddingStartFlag = startingTrialBiddingStartFlag;
    }

    public Date getStartingTrialBiddingStartDate() {
        return startingTrialBiddingStartDate;
    }

    public void setStartingTrialBiddingStartDate(Date startingTrialBiddingStartDate) {
        this.startingTrialBiddingStartDate = startingTrialBiddingStartDate;
    }

    public BigDecimal getStartingTrialBiddingRunningDuration() {
        return startingTrialBiddingRunningDuration;
    }

    public void setStartingTrialBiddingRunningDuration(BigDecimal startingTrialBiddingRunningDuration) {
        this.startingTrialBiddingRunningDuration = startingTrialBiddingRunningDuration;
    }

    public Date getStartingTrialBiddingEndDate() {
        return startingTrialBiddingEndDate;
    }

    public void setStartingTrialBiddingEndDate(Date startingTrialBiddingEndDate) {
        this.startingTrialBiddingEndDate = startingTrialBiddingEndDate;
    }

    public Integer getStartingBiddingRunningDurationFlag() {
        return startingBiddingRunningDurationFlag;
    }

    public void setStartingBiddingRunningDurationFlag(Integer startingBiddingRunningDurationFlag) {
        this.startingBiddingRunningDurationFlag = startingBiddingRunningDurationFlag;
    }

    public String getAutoDeferType() {
        return autoDeferType;
    }

    public void setAutoDeferType(String autoDeferType) {
        this.autoDeferType = autoDeferType;
    }

    public BigDecimal getAutoDeferPeriod() {
        return autoDeferPeriod;
    }

    public void setAutoDeferPeriod(BigDecimal autoDeferPeriod) {
        this.autoDeferPeriod = autoDeferPeriod;
    }

    public String getAutoDeferTimeRule() {
        return autoDeferTimeRule;
    }

    public void setAutoDeferTimeRule(String autoDeferTimeRule) {
        this.autoDeferTimeRule = autoDeferTimeRule;
    }

    public Long getMaxDeferCount() {
        return maxDeferCount;
    }

    public void setMaxDeferCount(Long maxDeferCount) {
        this.maxDeferCount = maxDeferCount;
    }

    public BiddingSupHeader getBiddingSupHeader() {
        return biddingSupHeader;
    }

    public void setBiddingSupHeader(BiddingSupHeader biddingSupHeader) {
        this.biddingSupHeader = biddingSupHeader;
    }

    public BiddingSupHeaderCur getBiddingSupHeaderCur() {
        return biddingSupHeaderCur;
    }

    public void setBiddingSupHeaderCur(BiddingSupHeaderCur biddingSupHeaderCur) {
        this.biddingSupHeaderCur = biddingSupHeaderCur;
    }

    /**
     * @return
     */
    public Long getBiddingSupHeaderCurId() {
        return biddingSupHeaderCurId;
    }

    public void setBiddingSupHeaderCurId(Long biddingSupHeaderCurId) {
        this.biddingSupHeaderCurId = biddingSupHeaderCurId;
    }

    /**
     * @return 所属租户ID，hpfm_tenant.tenant_id
     */
    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    /**
     * @return RFx单头ID
     */
    public Long getRfxHeaderId() {
        return rfxHeaderId;
    }

    public void setRfxHeaderId(Long rfxHeaderId) {
        this.rfxHeaderId = rfxHeaderId;
    }

    /**
     * @return RFx报价单号
     */
    public String getQuotationNum() {
        return quotationNum;
    }

    public void setQuotationNum(String quotationNum) {
        this.quotationNum = quotationNum;
    }

    /**
     * @return 轮次
     */
    public Long getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(Long roundNumber) {
        this.roundNumber = roundNumber;
    }

    /**
     * @return 报价单状态SSRC.RFX_QUOTATION_STATUS(NEW / 新建 | QUOTED / 已报价 | FINISHED /
     *         结束)
     */
    public String getQuotationStatus() {
        return quotationStatus;
    }

    public void setQuotationStatus(String quotationStatus) {
        this.quotationStatus = quotationStatus;
    }

    /**
     * @return
     */
    public Long getSupplierTenantId() {
        return supplierTenantId;
    }

    public void setSupplierTenantId(Long supplierTenantId) {
        this.supplierTenantId = supplierTenantId;
    }

    /**
     * @return
     */
    public Long getSupplierCompanyId() {
        return supplierCompanyId;
    }

    public void setSupplierCompanyId(Long supplierCompanyId) {
        this.supplierCompanyId = supplierCompanyId;
    }

    /**
     * @return 供应方企业名称
     */
    public String getSupplierCompanyName() {
        return supplierCompanyName;
    }

    public void setSupplierCompanyName(String supplierCompanyName) {
        this.supplierCompanyName = supplierCompanyName;
    }

    /**
     * @return 含税标识
     */
    public Integer getTaxIncludedFlag() {
        return taxIncludedFlag;
    }

    public void setTaxIncludedFlag(Integer taxIncludedFlag) {
        this.taxIncludedFlag = taxIncludedFlag;
    }

    /**
     * @return 税率ID
     */
    public Long getTaxId() {
        return taxId;
    }

    public void setTaxId(Long taxId) {
        this.taxId = taxId;
    }

    /**
     * @return 税率
     */
    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    /**
     * @return
     */
    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    /**
     * @return 汇率
     */
    public Long getExchangeRateId() {
        return exchangeRateId;
    }

    public void setExchangeRateId(Long exchangeRateId) {
        this.exchangeRateId = exchangeRateId;
    }

    /**
     * @return 汇率类型
     */
    public String getExchangeRateType() {
        return exchangeRateType;
    }

    public void setExchangeRateType(String exchangeRateType) {
        this.exchangeRateType = exchangeRateType;
    }

    /**
     * @return 汇率日期
     */
    public Date getExchangeRateDate() {
        return exchangeRateDate;
    }

    public void setExchangeRateDate(Date exchangeRateDate) {
        this.exchangeRateDate = exchangeRateDate;
    }

    /**
     * @return 汇率期间
     */
    public String getExchangeRatePeriod() {
        return exchangeRatePeriod;
    }

    public void setExchangeRatePeriod(String exchangeRatePeriod) {
        this.exchangeRatePeriod = exchangeRatePeriod;
    }

    /**
     * @return 备注
     */
    public String getQuotationRemark() {
        return quotationRemark;
    }

    public void setQuotationRemark(String quotationRemark) {
        this.quotationRemark = quotationRemark;
    }

    /**
     * @return 商务附件UUID
     */
    public String getBusinessAttachmentUuid() {
        return businessAttachmentUuid;
    }

    public void setBusinessAttachmentUuid(String businessAttachmentUuid) {
        this.businessAttachmentUuid = businessAttachmentUuid;
    }

    /**
     * @return 技术附件UUID
     */
    public String getTechAttachmentUuid() {
        return techAttachmentUuid;
    }

    public void setTechAttachmentUuid(String techAttachmentUuid) {
        this.techAttachmentUuid = techAttachmentUuid;
    }

    /**
     * @return 报价单头附件提交标识
     */
    public Integer getSubmitAttachmentFlag() {
        return submitAttachmentFlag;
    }

    public void setSubmitAttachmentFlag(Integer submitAttachmentFlag) {
        this.submitAttachmentFlag = submitAttachmentFlag;
    }

    /**
     * @return 供应商行表id
     */
    public Long getRfxLineSupplierId() {
        return rfxLineSupplierId;
    }

    public void setRfxLineSupplierId(Long rfxLineSupplierId) {
        this.rfxLineSupplierId = rfxLineSupplierId;
    }

    /**
     * @return 汇率
     */
    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    /**
     * @return 付款方式ID
     */
    public Long getPaymentTypeId() {
        return paymentTypeId;
    }

    public void setPaymentTypeId(Long paymentTypeId) {
        this.paymentTypeId = paymentTypeId;
    }

    /**
     * @return 付款条款ID
     */
    public Long getPaymentTermId() {
        return paymentTermId;
    }

    public void setPaymentTermId(Long paymentTermId) {
        this.paymentTermId = paymentTermId;
    }

    /**
     * @return 签到标识：1已签到0未签到
     */
    public Integer getSignInFlag() {
        return signInFlag;
    }

    public void setSignInFlag(Integer signInFlag) {
        this.signInFlag = signInFlag;
    }
}
