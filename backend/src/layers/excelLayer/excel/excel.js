const ExcelJS = require("exceljs");
const { Parser } = require("json-2-csv");

const ExcelUtils = {
  /**
   * Converte um JSON para CSV.
   * @param {Array} jsonData - Dados JSON para conversão.
   * @returns {string} - CSV gerado.
   */
  convertToCSV: (jsonData) => {
    const parser = new Parser();
    return parser.parse(jsonData);
  },

  /**
   * Cria um arquivo Excel a partir de dados JSON.
   * @param {Array} jsonData - Dados a serem incluídos no Excel.
   * @returns {Promise<Buffer>} - Buffer do arquivo Excel gerado.
   */
  convertToExcel: async (jsonData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    if (!jsonData || jsonData.length === 0) {
      throw new Error("Nenhum dado disponível para exportação.");
    }

    // 🔹 Definição dos cabeçalhos, idênticos ao Lambda original
    worksheet.columns = [
      { header: "id", key: "Id", width: 20 },
      { header: "SKUs", key: "Skus", width: 30 },
      { header: "confirmed", key: "Confirmed", width: 15 },
      {
        header: "subtotal_price_shop_money",
        key: "SubtotalPriceShopMoney",
        width: 20,
      },
      {
        header: "subtotal_price_shop_money_currency",
        key: "SubtotalPriceShopMoneyCurrency",
        width: 20,
      },
      {
        header: "subtotal_price_presented_money",
        key: "SubtotalPricePresentedMoney",
        width: 20,
      },
      {
        header: "subtotal_price_presented_money_currency",
        key: "SubtotalPricePresentedMoneyCurrency",
        width: 20,
      },
      {
        header: "total_discount_shop_money",
        key: "TotalDiscountShopMoney",
        width: 20,
      },
      {
        header: "total_discount_shop_money_currency",
        key: "TotalDiscountShopMoneyCurrency",
        width: 20,
      },
      {
        header: "total_price_shop_money",
        key: "TotalPriceShopMoney",
        width: 20,
      },
      {
        header: "total_price_shop_money_currency",
        key: "TotalPriceShopMoneyCurrency",
        width: 20,
      },
      {
        header: "total_price_presented_money",
        key: "TotalPricePresentedMoney",
        width: 20,
      },
      {
        header: "total_price_presented_money_currency",
        key: "TotalPricePresentedMoneyCurrency",
        width: 20,
      },
      { header: "tax_lines", key: "TaxLines", width: 30 },
      { header: "updated_at", key: "UpdatedAt", width: 20 },
      { header: "created_at", key: "CreatedAt", width: 20 },
      { header: "shipbob_response", key: "ShipbobResponse", width: 30 },
      { header: "shipping_address", key: "ShippingAddress", width: 30 },
      { header: "financial_status", key: "FinancialStatus", width: 20 },
      { header: "current_total_price", key: "CurrentTotalPrice", width: 20 },
      { header: "client_email", key: "ClientEmail", width: 20 },
    ];

    // 🔹 Adiciona os dados na planilha
    jsonData.forEach((order) => {
      worksheet.addRow({
        Id: order.Id,
        Skus: order.Skus ? order.Skus.join(", ") : "",
        Confirmed: order.Confirmed ? "Yes" : "No",
        SubtotalPriceShopMoney: order.SubtotalPriceShopMoney || "0",
        SubtotalPriceShopMoneyCurrency:
          order.SubtotalPriceShopMoneyCurrency || "USD",
        SubtotalPricePresentedMoney: order.SubtotalPricePresentedMoney || "0",
        SubtotalPricePresentedMoneyCurrency:
          order.SubtotalPricePresentedMoneyCurrency || "USD",
        TotalDiscountShopMoney: order.TotalDiscountShopMoney || "0",
        TotalDiscountShopMoneyCurrency:
          order.TotalDiscountShopMoneyCurrency || "USD",
        TotalPriceShopMoney: order.TotalPriceShopMoney || "0",
        TotalPriceShopMoneyCurrency: order.TotalPriceShopMoneyCurrency || "USD",
        TotalPricePresentedMoney: order.TotalPricePresentedMoney || "0",
        TotalPricePresentedMoneyCurrency:
          order.TotalPricePresentedMoneyCurrency || "USD",
        TaxLines: JSON.stringify(order.TaxLines),
        UpdatedAt: order.UpdatedAt ? order.UpdatedAt.toISOString() : "",
        CreatedAt: order.CreatedAt ? order.CreatedAt.toISOString() : "",
        ShipbobResponse: JSON.stringify(order.ShipbobResponse),
        ShippingAddress: order.ShippingAddress || "",
        FinancialStatus: order.FinancialStatus || "",
        CurrentTotalPrice: order.CurrentTotalPrice || "0",
        ClientEmail: order.ClientEmail || "",
      });
    });

    // 🔹 Gera o buffer do Excel
    return workbook.xlsx.writeBuffer();
  },
};

module.exports = ExcelUtils;
