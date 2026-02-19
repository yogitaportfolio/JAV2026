 export const openPrintPopup = (data) => {
        const width = 1000;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const uniqueWindowName = `PrintWindow_${data._id}_${Date.now()}`;
        const printWindow = window.open(
            `/print_details?id=${data._id}`,
            uniqueWindowName,
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (printWindow) {
            const handleMessage = (event) => {
                if (event.data && event.data.type === 'PRINT_WINDOW_READY') {
                    printWindow.postMessage({
                        type: 'PRINT_APPDATA',
                        payload: {
                            testResults: data
                        }
                    }, '*');
                    window.removeEventListener('message', handleMessage);
                }
            };
            window.addEventListener('message', handleMessage);
        }
    };