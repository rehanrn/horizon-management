// PDF Generator Engine - Powered by pdf-lib
window.PDFEngine = {
    async generateAdmissionForm(student, openInBrowser = true) {
        try {
            if (openInBrowser) {
                window.showToast("Generating PDF Form...", "info");
            }

            // 1. Fetch the blank template
            const url = 'assets/pdf/form.pdf';
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

            // 2. Load into pdf-lib
            const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];

            // Define custom styles
            const { rgb } = PDFLib;
            const textSize = 11;
            const textColor = rgb(0.1, 0.1, 0.2); // Dark slate for professional look

            // 3. Coordinate Mapping (Bottom-Left is 0,0. Top-Left is approx X:0, Y:842 on A4)
            // Note for User: Adjust these X / Y values if the text prints slightly off-center!
            const coordinates = {
                serialNo: { x: 450, y: 720 },
                name: { x: 150, y: 645 },
                gName: { x: 150, y: 615 },
                dob: { x: 150, y: 585 },

                // Draw an X for Gender
                genderMale: { x: 385, y: 585 },
                genderFemale: { x: 435, y: 585 },

                address: { x: 150, y: 520 },
                phone: { x: 150, y: 490 },
                gPhone: { x: 380, y: 490 },

                // Education
                graduatedYes: { x: 195, y: 460 },
                graduatedNo: { x: 235, y: 460 },
                graduationInfo: { x: 300, y: 460 },

                // Office Works
                course: { x: 150, y: 395 },
                date: { x: 410, y: 395 },
                cTimeStart: { x: 120, y: 365 },
                duration: { x: 360, y: 365 },
            };

            // 4. Draw data onto the page
            const drawText = (val, coords) => {
                if(!val || val === '') return;
                firstPage.drawText(String(val), {
                    x: coords.x,
                    y: coords.y,
                    size: textSize,
                    color: textColor
                });
            };

            // Mapping Execution
            drawText(student.serialNo, coordinates.serialNo);
            drawText(student.name, coordinates.name);
            drawText(student.guardianName, coordinates.gName);
            drawText(student.dob, coordinates.dob);

            // Handle specific logic like tick boxes
            if(student.gender === 'Male') drawText('X', coordinates.genderMale);
            if(student.gender === 'Female') drawText('X', coordinates.genderFemale);

            drawText(student.address, coordinates.address);
            drawText(student.phone, coordinates.phone);
            drawText(student.guardianPhone, coordinates.gPhone);

            if(student.isGraduated === 'YES') drawText('X', coordinates.graduatedYes);
            if(student.isGraduated === 'NO') drawText('X', coordinates.graduatedNo);
            drawText(student.graduationInfo, coordinates.graduationInfo);

            const courseName = window.Store.getById('courses', student.courseId)?.title || '';
            drawText(courseName, coordinates.course);
            drawText(student.joinDate, coordinates.date);
            drawText(student.classTime, coordinates.cTimeStart);
            drawText(student.classDuration, coordinates.duration);

            // 4.5 Try embedding Profile Photo if one exists!
            if (student.avatarString) {
                try {
                    const base64Data = student.avatarString.split(',')[1];
                    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                    let pdfImage;
                    if (student.avatarString.includes('image/jpeg') || student.avatarString.includes('image/jpg')) {
                        pdfImage = await pdfDoc.embedJpg(imageBytes);
                    } else if (student.avatarString.includes('image/png')) {
                        pdfImage = await pdfDoc.embedPng(imageBytes);
                    } else {
                        // Fallback attempt
                        pdfImage = await pdfDoc.embedPng(imageBytes);
                    }

                    if (pdfImage) {
                        firstPage.drawImage(pdfImage, {
                            x: 445, // Square photo box position roughly
                            y: 735,
                            width: 75,
                            height: 75
                        });
                    }
                } catch(e) {
                    console.error("Failed to embed avatar...", e);
                }
            }

            // 5. Package the PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });

            if (openInBrowser) {
                const pdfUrl = URL.createObjectURL(blob);
                // Open specifically in new tab
                window.open(pdfUrl, '_blank');
                window.showToast("Admission Form Opened in Viewer!", "success");
            }

            return blob;

        } catch (error) {
            console.error(error);
            if (openInBrowser) {
                window.showToast("Failed to generate PDF. Make sure form.pdf exists in assets/pdf", "error");
            }
            return null;
        }
    }
};
