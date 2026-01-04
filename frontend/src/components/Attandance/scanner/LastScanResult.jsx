export default function LastScanResult({ result }) {
  if (!result) return null;

  const styles =
    result.type === "success"
      ? "bg-green-50 border-green-500 text-green-800"
      : result.type === "warning"
      ? "bg-yellow-50 border-yellow-500 text-yellow-800"
      : "bg-red-50 border-red-500 text-red-800";

  return (
    <div className={`mb-4 p-4 rounded-lg border-l-4 ${styles}`}>
      <p className="font-medium">{result.message}</p>

      {result.data && (
        <p className="text-xs mt-1 opacity-75">
          {result.data.name} • {result.data.rollno}
        </p>
      )}
    </div>
  );
}
