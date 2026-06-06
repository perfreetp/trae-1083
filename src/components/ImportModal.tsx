import { useState, useRef } from "react";
import { X, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { parseCSV, detectDuplicates } from "@/utils/csv";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  keyField: string;
  keyFieldLabel: string;
  existingItems: Record<string, any>[];
  existingKeyField: string;
  sampleHeaders: string[];
  onImport: (data: Record<string, any>[]) => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  title,
  keyField,
  keyFieldLabel,
  existingItems,
  existingKeyField,
  sampleHeaders,
  onImport,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [duplicates, setDuplicates] = useState<Record<string, any>[]>([]);
  const [validData, setValidData] = useState<Record<string, any>[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "success">("upload");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    try {
      const data = await parseCSV(selectedFile);
      if (data.length === 0) {
        setError("CSV文件为空或格式不正确");
        return;
      }

      const { duplicates: dup, valid } = detectDuplicates(
        data,
        keyField,
        existingItems,
        existingKeyField
      );

      setPreviewData(data);
      setDuplicates(dup);
      setValidData(valid);
      setStep("preview");
    } catch (err) {
      setError("解析CSV文件失败，请检查文件格式");
    }
  };

  const handleConfirmImport = () => {
    if (validData.length > 0) {
      onImport(validData);
      setStep("success");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setDuplicates([]);
    setValidData([]);
    setStep("upload");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      <div className="space-y-4">
        {step === "upload" && (
          <>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">点击或拖拽文件到此处上传</p>
              <p className="text-sm text-gray-400 mb-4">支持 CSV 格式文件</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                选择文件
              </label>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">CSV格式示例：</p>
              <p className="text-xs text-gray-500 font-mono bg-white p-2 rounded border border-gray-100">
                {sampleHeaders.join(", ")}
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </>
        )}

        {step === "preview" && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{previewData.length}</p>
                <p className="text-xs text-blue-600">总记录数</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{validData.length}</p>
                <p className="text-xs text-green-600">可导入</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{duplicates.length}</p>
                <p className="text-xs text-red-600">重复（将跳过）</p>
              </div>
            </div>

            {duplicates.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">发现 {duplicates.length} 条重复记录</p>
                  <p className="text-yellow-600 text-xs mt-1">
                    以下 {keyFieldLabel} 已存在，将被跳过：
                    {duplicates.slice(0, 3).map((d, i) => (
                      <span key={i} className="ml-1 font-mono">
                        {d[keyField]}
                        {i < Math.min(duplicates.length, 3) - 1 && "、"}
                      </span>
                    ))}
                    {duplicates.length > 3 && `等 ${duplicates.length} 条`}
                  </p>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    {Object.keys(previewData[0] || {}).slice(0, 5).map((key) => (
                      <th
                        key={key}
                        className="text-left px-3 py-2 font-medium text-gray-600 text-xs"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.keys(row).slice(0, 5).map((key) => (
                        <td key={key} className="px-3 py-2 text-gray-700 truncate max-w-32">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                重新选择
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={validData.length === 0}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  确认导入 {validData.length} 条
                </button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">导入成功</h3>
            <p className="text-gray-500 mb-6">
              已成功导入 {validData.length} 条数据
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
