// OCR Module for extracting Student Data via Tesseract.js

window.triggerOCR = function() {
    document.getElementById('ocr-upload').click();
}

window.handleOCRUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show Scanning Modal
    const modal = document.getElementById('ocr-scanning-modal');
    modal.classList.add('active');
    
    const statusText = document.getElementById('ocr-status-text');
    const progressBar = document.getElementById('ocr-progress-bar');
    
    statusText.innerText = "Initializing neural engine...";
    progressBar.style.width = "10%";
    progressBar.style.background = "linear-gradient(135deg, var(--primary), #3b82f6)";

    try {
        if (typeof Tesseract === 'undefined') {
            throw new Error("Tesseract.js engine not loaded yet. Please ensure internet connection.");
        }

        const worker = await Tesseract.createWorker("eng", 1, {
            workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
            corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
            logger: m => {
                // M contains status and progress
                if (m.status === 'recognizing text') {
                    statusText.innerText = `Analyzing document pattern... ${Math.round(m.progress * 100)}%`;
                    progressBar.style.width = `${10 + (m.progress * 90)}%`;
                } else if (m.status) {
                    let capStatus = m.status.charAt(0).toUpperCase() + m.status.slice(1);
                    statusText.innerText = `${capStatus}...`;
                }
            }
        });

        const result = await worker.recognize(file);
        await worker.terminate();

        const text = result.data.text;
        statusText.innerText = "Extraction complete! Parsing semantics...";
        progressBar.style.width = "100%";

        extractAndFillData(text);

        setTimeout(() => {
            modal.classList.remove('active');
            window.showToast("Data Extracted Automatically!", "success");
            // Reset input so the same file can be selected again
            document.getElementById('ocr-upload').value = '';
        }, 1200);

    } catch (err) {
        console.error("OCR Error:", err);
        statusText.innerText = "System error during analysis.";
        progressBar.style.background = "var(--danger)";
        setTimeout(() => {
            modal.classList.remove('active');
            window.showToast("OCR Scan Failed: " + err.message, "error");
            document.getElementById('ocr-upload').value = '';
            progressBar.style.background = "linear-gradient(135deg, var(--primary), #3b82f6)";
        }, 3000);
    }
}

function extractAndFillData(text) {
    console.log("OCR Extracted Text:\n", text);
    
    let fieldsFilled = 0;

    // Data Extraction Patterns
    const nameMatch = text.match(/(?:Name|Applicant Name|Student Name|Full Name)[\s:*-]+([A-Za-z\s]+)(?:\n|$)/i);
    const guardianMatch = text.match(/(?:Father(?:'s)? Name|Guardian Name)[\s:*-]+([A-Za-z\s]+)(?:\n|$)/i);
    const cnicMatch = text.match(/\b(\d{5}[-\s]?\d{7}[-\s]?\d{1})\b/);
    const dobMatch = text.match(/\b(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})\b/);
    
    // Find all phone numbers globally
    const allPhones = [...text.matchAll(/\b(03\d{2}[-\s]?\d{7})\b/g)];

    if (nameMatch && nameMatch[1]) {
        let name = nameMatch[1].trim().split('\n')[0];
        name = name.split(' ').slice(0, 3).join(' '); // prevent run-ons
        setInputAndTriggerFormatter('student-name', name);
        fieldsFilled++;
    } else {
        // Smart Fallback: Find the first uppercase phrase that looks like a name
        const lines = text.split('\n').map(l => l.trim().replace(/[^A-Za-z\s]/g, '')).filter(l => l.length > 5);
        for(let line of lines) {
             let words = line.split(/\s+/);
             if(words.length >= 2 && words.length <= 4 && !/Registration|Academy|Institute|Form|School/i.test(line)) {
                  setInputAndTriggerFormatter('student-name', line);
                  fieldsFilled++;
                  break;
             }
        }
    }

    if (guardianMatch && guardianMatch[1]) {
        let gName = guardianMatch[1].trim().split('\n')[0];
        gName = gName.split(' ').slice(0, 3).join(' ');
        setInputAndTriggerFormatter('student-g-name', gName);
        fieldsFilled++;
    }

    if (cnicMatch && cnicMatch[1]) {
        let cnic = cnicMatch[1].replace(/[\s]/g, '-');
        if(cnic.length >= 13) {
            setInputAndTriggerFormatter('student-cnic', cnic);
            fieldsFilled++;
        }
    }

    // Phone parsing logic
    if (allPhones.length >= 1) {
        let phone1 = allPhones[0][1].replace(/[\s-]/g, '');
        setInputAndTriggerFormatter('student-phone', phone1);
        fieldsFilled++;
    }
    if (allPhones.length >= 2) {
        let phone2 = allPhones[1][1].replace(/[\s-]/g, '');
        setInputAndTriggerFormatter('student-g-phone', phone2);
        fieldsFilled++;
    }

    if (dobMatch && dobMatch[1]) {
        let dobStr = dobMatch[1].trim();
        let parts = dobStr.split(/[-/]/);
        if (parts.length === 3) {
            // YYYY-MM-DD
            if (parts[2].length === 4) {
                 setInputAndTriggerFormatter('student-dob', `${parts[2]}-${parts[1]}-${parts[0]}`);
                 fieldsFilled++;
            } else if (parts[0].length === 4) {
                 setInputAndTriggerFormatter('student-dob', `${parts[0]}-${parts[1]}-${parts[2]}`);
                 fieldsFilled++;
            }
        }
    }
    
    if (fieldsFilled === 0) {
        setTimeout(() => window.showToast("Could not confidently detect form data. Please ensure the image is clear.", "warning"), 1500);
    } else {
        setTimeout(() => window.showToast(`${fieldsFilled} fields extracted & auto-filled!`, "success"), 1500);
    }
}

function setInputAndTriggerFormatter(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
        el.value = value;
        // Dispatch 'input' so any formatters catch the value and mask it (e.g. adding dashes)
        el.dispatchEvent(new Event('input', { bubbles: true }));
        // Add a highlight class temporarily for visually showing the auto-filled nature
        el.style.transition = "background-color 0.5s";
        el.style.backgroundColor = "var(--primary-light)";
        setTimeout(() => {
            el.style.backgroundColor = "";
        }, 1500);
    }
}
