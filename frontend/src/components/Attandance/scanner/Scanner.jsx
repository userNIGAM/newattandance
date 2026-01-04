import CameraView from "./CameraView";
import StatsDashboard from "./StatsDashboard";
import LastScanResult from "./LastScanResult";
import ScanHistory from "./ScanHistory";
import ScannerControls from "./ScannerControls";
import { useScanner } from "./useScanner";

export default function ScannerContainer({ currentEvent, onQRScanned }) {
  const scanner = useScanner(currentEvent, onQRScanned);

  return (
    <div className="flex flex-col h-full gap-4">
      {scanner.cameraError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Camera Error</p>
          <p className="text-sm mt-1">{scanner.cameraError}</p>
          <p className="text-xs mt-2 text-red-700">Please check browser camera permissions and refresh the page.</p>
        </div>
      )}

      <StatsDashboard stats={scanner.stats} />
      <LastScanResult result={scanner.lastScanResult} />

      <CameraView
        videoRef={scanner.videoRef}
        canvasRef={scanner.canvasRef}
        scanning={scanner.scanning}
        loading={scanner.loading}
        processScannedQR={scanner.processScannedQR}
      />

      <ScannerControls
        scanning={scanner.scanning}
        setScanning={scanner.setScanning}
        onDemo={() =>
          scanner.processScannedQR(
            JSON.stringify({ name: "Demo User", rollno: "TEST", userId: "123", faculty: "BCA" })
          )
        }
        loading={scanner.loading}
      />

      <ScanHistory scanHistory={scanner.scanHistory} />
    </div>
  );
}
