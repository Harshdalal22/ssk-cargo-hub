import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateLRPDF = async (lr: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  let yPos = 10;
  
  // Add logo if available
  if (lr.company_logo_url) {
    try {
      doc.addImage(lr.company_logo_url, 'PNG', 10, yPos, 35, 25);
    } catch (error) {
      console.log("Could not add logo to PDF");
    }
  }
  
  // Phone numbers box on right
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(180, yPos, 25, 20);
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("7834819005", 181, yPos + 4);
  doc.text("8929920007", 181, yPos + 8);
  doc.text("7600026311", 181, yPos + 12);
  doc.text("9619905027", 181, yPos + 16);
  
  // Header - Company Info (centered)
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text("Jai Dada Udmiram Ki", 105, yPos + 2, { align: "center" });
  doc.setFontSize(7);
  doc.text("SUBJECT TO DELHI JURISDICTION", 105, yPos + 6, { align: "center" });
  
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text("SSK INDIA LOGISTICS", 105, yPos + 13, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text("(Fleet Owner & Contractor)", 105, yPos + 18, { align: "center" });
  
  doc.setFontSize(7);
  doc.text("Shop No. 362-A/2, Sataya Puram Colony, Jharoda Border, Near Ashram, New Delhi-110072", 105, yPos + 22, { align: "center" });
  doc.text("Mail : sskindialogistics@gmail.com, Web : www.indialogistics.com", 105, yPos + 26, { align: "center" });
  
  yPos += 35;
  
  // Three column section - Available At, CAUTION, AT OWNERS RISKS
  const col1X = 10;
  const col2X = 70;
  const col3X = 130;
  const rowHeight = 30;
  
  // Available At box
  doc.rect(col1X, yPos, 58, rowHeight);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("Available At :", col1X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  doc.text("AHMEDABAD", col1X + 2, yPos + 10);
  doc.text("SURAT", col1X + 2, yPos + 14);
  doc.text("VAPI", col1X + 2, yPos + 18);
  doc.text("MUMBAI", col1X + 2, yPos + 22);
  doc.text("PUNE", col1X + 2, yPos + 26);
  
  // CAUTION box
  doc.rect(col2X, yPos, 58, rowHeight);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("CAUTION", col2X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("This Consignment Will Not Be Detained Divorted,Re-Routed", col2X + 2, yPos + 9);
  doc.text("Or Re-Booked Without Consignee Bank Written Permission", col2X + 2, yPos + 13);
  doc.text("Will be Delivered At the Destination.", col2X + 2, yPos + 17);
  
  // AT OWNERS RISKS box
  doc.rect(col3X, yPos, 75, rowHeight);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("AT OWNERS RISKS", col3X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);
  doc.text("Pan No. : CMFPS3661A", col3X + 2, yPos + 10);
  doc.setTextColor(220, 38, 38);
  doc.setFont(undefined, 'bold');
  doc.text("GST No. : 07CMFPS3661A1Z6", col3X + 2, yPos + 15);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  
  yPos += rowHeight;
  
  // Second row - NOTICE, INSURANCE, SCHEDULE OF DEMURRAGE CHARGES
  // NOTICE box
  doc.rect(col1X, yPos, 58, rowHeight);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("NOTICE", col1X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(5.5);
  doc.text("This consignment covered in this set of special lorry receipt", col1X + 2, yPos + 9);
  doc.text("shall be stored at the destination under the control of the", col1X + 2, yPos + 12);
  doc.text("transport operator & shall be delivered to or to the order of", col1X + 2, yPos + 15);
  doc.text("the Consignee Bank whose name is mentioned in the lorry", col1X + 2, yPos + 18);
  doc.text("receipt.", col1X + 2, yPos + 21);
  
  // INSURANCE box
  doc.rect(col2X, yPos, 58, rowHeight);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("INSURANCE", col2X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("The Customer Has Started That", col2X + 2, yPos + 10);
  doc.text("He Has Not Insured The Consignement", col2X + 2, yPos + 14);
  doc.text("Policy No _______ Date_______", col2X + 2, yPos + 18);
  doc.text("Amount_______ Risk_______", col2X + 2, yPos + 22);
  
  // SCHEDULE OF DEMURRAGE CHARGES box
  doc.rect(col3X, yPos, 75, rowHeight);
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text("SCHEDULE OF DEMURRAGE CHARGES", col3X + 2, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("Demmurrage Chargeable After 5 days Arrival Of Goods Rs.", col3X + 2, yPos + 10);
  doc.text("7/per Qtl.Per Day On Weight Charged", col3X + 2, yPos + 14);
  
  yPos += rowHeight + 5;
  
  // Address of Delivery section
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("Address Of Delivery :", col1X, yPos);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  if (lr.address_of_delivery) {
    doc.text(lr.address_of_delivery, col1X + 40, yPos);
  }
  
  // Vehicle No
  doc.setFont(undefined, 'bold');
  doc.text("Vehicle No. :", col3X, yPos);
  doc.setFont(undefined, 'normal');
  if (lr.truck_no) {
    doc.text(lr.truck_no, col3X + 25, yPos);
  }
  
  yPos += 6;
  
  // C NOTE No
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text(`C NOTE No. : ${lr.lr_no || ''}`, col3X, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 8;
  
  // Main details section
  doc.setFontSize(8);
  doc.text(`Consignor : ${lr.consignor_name || ''}`, col1X, yPos);
  doc.text(`DATE : ${lr.date ? new Date(lr.date).toLocaleDateString('en-GB') : ''}`, col3X, yPos);
  
  yPos += 5;
  doc.text(`Consignee : ${lr.consignee_name || ''}`, col1X, yPos);
  doc.text(`FROM : ${lr.from_place || ''}`, col3X, yPos);
  
  yPos += 5;
  doc.text(`TO : ${lr.to_place || ''}`, col3X, yPos);
  
  yPos += 8;
  
  // GST section box
  doc.rect(col1X, yPos, 195, 6);
  doc.setFontSize(8);
  doc.text(`Consignor GST No : ${lr.consignor_gst || ''}`, col1X + 2, yPos + 4);
  
  yPos += 8;
  
  // Main table
  const items = Array.isArray(lr.items) ? lr.items : [];
  const tableBody = [];
  
  // Add item rows
  if (items.length > 0) {
    items.forEach((item: any) => {
      tableBody.push([
        item.pcs || '',
        item.description || '',
        item.weight || '',
        '',
        '',
        '',
        'To PAY Rs. :'
      ]);
    });
  } else {
    // Empty rows for manual filling
    for (let i = 0; i < 3; i++) {
      tableBody.push(['', '', '', '', '', '', i === 0 ? 'To PAY Rs. :' : '']);
    }
  }
  
  // Add the structured rows
  tableBody.push(['', '', 'Actual', 'Charged', 'Hamail', '', 'Paid RS. :']);
  tableBody.push(['', '', lr.weight || '', lr.charged_weight || '', 'Sur.CH.', '', '']);
  tableBody.push(['', `Invoice No.: ${lr.invoice_no || ''}`, '', '', 'St.CH.', '', '']);
  tableBody.push(['', `Date : ${lr.invoice_date ? new Date(lr.invoice_date).toLocaleDateString('en-GB') : ''}`, '', 'Mark', 'Collection CH.', '', '']);
  tableBody.push(['', 'GST NO. :', '', '', 'D.Dty CH.', '', '']);
  tableBody.push(['', '', '', '', 'Other CH.', '', '']);
  tableBody.push(['', '', '', '', 'Risk CH.', '', '']);
  tableBody.push(['', '', '', '', 'Total', '', '']);
  
  (doc as any).autoTable({
    startY: yPos,
    head: [['Packages', 'Description', 'Weight', '', 'Rate', 'Amount', 'Any Other Information\nRemarks']],
    body: tableBody,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      halign: 'left'
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.3
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 35 },
    },
  });
  
  // Footer section
  const footerY = (doc as any).lastAutoTable.finalY + 5;
  
  doc.setFontSize(6);
  doc.text("Endorsement Its Is Intended To use Consignee Copy Of the Set For The Purpose Of Borrowing From The", col1X, footerY);
  doc.text("Consignee Bank", col1X, footerY + 3);
  
  doc.text("The Court In Delhi Alone Shall Have Jurisdiction In Respect Of The Claims And Matters", col1X, footerY + 8);
  doc.text("Arising Under The Consignment Or Of the Claims And Matter Arising Under The Goods", col1X, footerY + 11);
  doc.text("Entrusted For Transport", col1X, footerY + 14);
  
  doc.setFontSize(7);
  doc.text("Value :", col1X, footerY + 20);
  
  // GST PAYABLE BY (centered)
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("GST PAYABLE BY", 105, footerY + 15, { align: "center" });
  doc.setFont(undefined, 'normal');
  
  // For SSK INDIA LOGISTICS signature section
  doc.setFontSize(8);
  doc.text("For SSK INDIA LOGISTICS", 160, footerY + 12);
  doc.text("Auth. Signatory", 165, footerY + 25);
  
  // Save the PDF
  doc.save(`LR_${lr.lr_no}.pdf`);
};
