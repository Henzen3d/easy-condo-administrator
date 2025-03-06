
import { useState } from "react";

// Define billing data type
export interface BillingData {
  reference: { month: number; year: number };
  name: string;
  dueDate: string | Date;
  includeGasConsumption: boolean;
  includeWaterConsumption: boolean;
  gasConsumptionItems: any[];
  waterConsumptionItems: any[];
  earlyPaymentDiscount: {
    enabled: boolean;
    dueDate: string | Date;
    discountType: "fixed" | "percentage";
    discountValue: number;
  };
  chargeItems: any[];
  targetUnits: string;
  specificUnit: string;
  statementPeriod: {
    startDate: string | Date;
    endDate: string | Date;
  };
  additionalMessage: string;
}

export const useBillingForm = () => {
  // Initialize with default values
  const [billingData, setBillingData] = useState<BillingData>({
    reference: { month: new Date().getMonth(), year: new Date().getFullYear() },
    name: "",
    dueDate: "",
    includeGasConsumption: false,
    includeWaterConsumption: false,
    gasConsumptionItems: [],
    waterConsumptionItems: [],
    earlyPaymentDiscount: {
      enabled: false,
      dueDate: "",
      discountType: "fixed",
      discountValue: 0,
    },
    chargeItems: [],
    targetUnits: "all",
    specificUnit: "",
    statementPeriod: {
      startDate: "",
      endDate: "",
    },
    additionalMessage: "",
  });

  // Function to update billing data
  const updateBillingData = (newData: Partial<BillingData>) => {
    setBillingData(prevData => ({ ...prevData, ...newData }));
  };

  // Prepare all charge items including consumption items
  const prepareAllChargeItems = () => {
    let allItems = [...billingData.chargeItems];
    
    if (billingData.includeGasConsumption && billingData.gasConsumptionItems.length > 0) {
      allItems = [...allItems, ...billingData.gasConsumptionItems];
    }
    
    if (billingData.includeWaterConsumption && billingData.waterConsumptionItems.length > 0) {
      allItems = [...allItems, ...billingData.waterConsumptionItems];
    }
    
    return allItems;
  };

  return {
    billingData,
    updateBillingData,
    prepareAllChargeItems
  };
};
