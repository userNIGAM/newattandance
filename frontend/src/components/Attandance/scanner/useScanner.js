import { useState, useRef, useCallback, useEffect } from "react";
// import jsQR from "jsqr";
import { checkDuplicateScan, markAttendance } from "../../../services/Api";
import successSound from "../../../assets/beep-08b.wav";
import errorSound from "../../../assets/beep-06.mp3";

export function useScanner(currentEvent, onQRScanned) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scanHistory, setScanHistory] = useState([]);
    const [lastScanResult, setLastScanResult] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    const [stats, setStats] = useState({
        todayCount: 0,
        successCount: 0,
        duplicatesBlocked: 0
    });

    const validateQRData = (data) => {
        // QR code contains: userId, rollno, name, faculty, semester (optional), year (optional)
        const required = ["userId", "rollno", "name", "faculty"];
        return required.every(f => data[f]);
    };

    const getTodayDate = () =>
        new Date().toISOString().split("T")[0];

    // Initialize camera when scanning starts
    useEffect(() => {
        if (!scanning) return;

        let isMounted = true;
        setCameraError(null);

        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });

                if (isMounted && videoRef.current) {
                    streamRef.current = stream;
                    videoRef.current.srcObject = stream;

                    // Ensure video plays
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.error("Error playing video:", playError);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Camera initialization error:", error);
                    setCameraError(error.message || "Unable to access camera");
                    setScanning(false);
                    setLastScanResult({
                        type: "error",
                        message: "❌ Camera access denied. Please check permissions.",
                        data: null
                    });
                }
            }
        };

        initCamera();

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [scanning]);


    const processScannedQR = useCallback(async (qrDataString) => {
        try {
            setLoading(true);

            let qrData;
            try {
                qrData = JSON.parse(qrDataString);
            } catch {
                const audio = new Audio(errorSound);
                audio.play().catch(err => console.error("Error playing sound:", err));

                setLastScanResult({
                    type: "error",
                    message: "Invalid QR format."
                });
                return;
            }

            if (!validateQRData(qrData)) {
                const audio = new Audio(errorSound);
                audio.play().catch(err => console.error("Error playing sound:", err));

                setLastScanResult({
                    type: "error",
                    message: "QR missing required data."
                });
                return;
            }

            const scanDate = getTodayDate();
            const dup = await checkDuplicateScan(qrData.userId, scanDate);

            if (dup.alreadyScanned) {
                setStats(prev => ({
                    ...prev,
                    duplicatesBlocked: prev.duplicatesBlocked + 1
                }));

                setLastScanResult({
                    type: "warning",
                    message: `${qrData.name} already scanned.`,
                    data: qrData
                });

                return;
            }

            const attendance = await markAttendance({
                ...qrData,
                scanDate,
                scanTime: new Date().toISOString(),
                eventId: currentEvent?.eventId || "default-event"
            });

            if (attendance.success) {
                // Play success sound
                const audio = new Audio(successSound);
                audio.play().catch(err => console.error("Error playing sound:", err));

                setStats(prev => ({
                    ...prev,
                    todayCount: prev.todayCount + 1,
                    successCount: prev.successCount + 1
                }));

                setLastScanResult({
                    type: "success",
                    message: `${qrData.name} marked present`,
                    data: qrData
                });

                setScanHistory(prev => [{
                    id: Date.now(),
                    ...qrData,
                    scanTime: new Date().toLocaleTimeString(),
                    status: "present"
                }, ...prev]);

                onQRScanned?.(qrData);
            } else {
                const audio = new Audio(errorSound);
                audio.play().catch(err => console.error("Error playing sound:", err));

                setLastScanResult({
                    type: "error",
                    message: attendance.message || "Failed to mark attendance."
                });
            }
        } finally {
            setLoading(false);
            setTimeout(() => setScanning(true), 2000);
        }
    }, [currentEvent, onQRScanned]);

    return {
        videoRef,
        canvasRef,
        streamRef,
        scanning,
        loading,
        stats,
        scanHistory,
        lastScanResult,
        setScanning,
        processScannedQR,
        cameraError
    };
}
