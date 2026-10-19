import apiClient from "../services/apiClient";

// All invoice documents are rendered by the server's shared HTML template.
export const downloadInvoicePdf = async (path, filename = "invoice", preview = false) => {
  const tab = preview ? window.open("about:blank", "_blank") : null;
  try {
    const { data, headers } = await apiClient.get(path, { responseType: "blob", timeout: 60000 });
    if (data.type && !data.type.includes("application/pdf")) throw new Error("The server did not return a PDF invoice.");
    const url = URL.createObjectURL(data);
    if (tab) {
      tab.opener = null;
      tab.location.replace(url);
    } else {
      const link = document.createElement("a");
      link.href = url;
      const serverFilename = headers["content-disposition"]?.match(/filename="([A-Za-z0-9_-]+\.pdf)"/)?.[1];
      link.download = serverFilename || `${String(filename).replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    tab?.close();
    let message = error.message || "Unable to download invoice. Please retry.";
    if (error.response?.data instanceof Blob) {
      try { message = JSON.parse(await error.response.data.text()).message || message; } catch { /* Non-JSON error response. */ }
    }
    throw new Error(message, { cause: error });
  }
};
