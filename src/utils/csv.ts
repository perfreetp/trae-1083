export const exportToCSV = (
  data: Record<string, any>[],
  filename: string,
  headers: { key: string; label: string }[]
) => {
  const headerRow = headers.map((h) => h.label).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h.key];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",")
  );
  const csvContent = [headerRow, ...dataRows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (file: File): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          resolve([]);
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g)?.map((v) => 
            v.startsWith(",") ? v.slice(1) : v
          ).map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"')) || [];
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "UTF-8");
  });
};

export const detectDuplicates = (
  data: Record<string, any>[],
  keyField: string,
  existingItems: Record<string, any>[],
  existingKeyField: string
): { duplicates: Record<string, any>[]; valid: Record<string, any>[] } => {
  const existingKeys = new Set(existingItems.map((item) => item[existingKeyField]));
  const seenKeys = new Set();
  const duplicates: Record<string, any>[] = [];
  const valid: Record<string, any>[] = [];

  data.forEach((row) => {
    const key = row[keyField];
    if (existingKeys.has(key) || seenKeys.has(key)) {
      duplicates.push(row);
    } else {
      seenKeys.add(key);
      valid.push(row);
    }
  });

  return { duplicates, valid };
};
