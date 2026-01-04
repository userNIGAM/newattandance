/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import jsQR from "jsqr";

export default function CameraView({
  videoRef,
  canvasRef,
  scanning,
  loading,
  processScannedQR
}) {

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    let isMounted = true;
    const video = videoRef.current;

    // Wait for video to be ready
    const startScanning = () => {
      if (!isMounted) return;

      const interval = setInterval(() => {
        if (!isMounted || loading) return;

        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imageData.data, imageData.width, imageData.height);

          if (qr?.data) {
            clearInterval(interval);
            processScannedQR(qr.data);
          }
        } catch (error) {
          console.error("Error during QR scanning:", error);
        }
      }, 300);

      return interval;
    };

    // Listen for video metadata to ensure video is loaded
    const handleLoadedMetadata = () => {
      if (isMounted) {
        console.log("Video metadata loaded, starting scan");
        startScanning();
      }
    };

    // If video is already loaded, start immediately
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      startScanning();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      isMounted = false;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [scanning, loading, processScannedQR]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden flex-1 flex items-center justify-center min-h-80">

      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {/* Scan frame overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-56 h-56 border-4 border-blue-400 rounded-lg animate-pulse"></div>
      </div>

      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm font-medium">Processing...</p>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
