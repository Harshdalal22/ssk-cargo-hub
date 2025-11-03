import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateLRPDF = async (lr: any) => {
  const doc = new jsPDF();
  
  // Add logo if available
  if (lr.company_logo_url) {
    try {
      doc.addImage(lr.company_logo_url, 'PNG', 15, 10, 30, 20);
    } catch (error) {
      console.log("Could not add logo to PDF");
    }
  }
  
  // Header - Company Info
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38);
  doc.text("Jai Dada Udmiram Ki", 105, 12, { align: "center" });
  doc.text("SUBJECT TO DELHI JURISDICTION", 105, 17, { align: "center" });
  
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text("SSK INDIA LOGISTICS", 105, 27, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text("(Fleet Owner & Contractor)", 105, 33, { align: "center" });
  
  doc.setFontSize(8);
  doc.text("Shop No. 362-A/2, Sataya Puram Colony, Jharoda Border, Near Ashram, New Delhi-110072", 105, 38, { align: "center" });
  doc.text("Mail : sskindialogistics@gmail.com, Web : www.indialogistics.com", 105, 42, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("7834819005 | 8929920007 | 7600026311 | 9619905027", 105, 47, { align: "center" });
  
  // Phone numbers box on right
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.rect(175, 10, 25, 20);
  doc.text("7834819005", 177, 15);
  doc.text("8929920007", 177, 20);
  doc.text("7600026311", 177, 25);
  doc.text("9619905027", 177, 28);
  
  // Available At section
  let yPos = 52;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("Available At :", 15, yPos);
  doc.setFont(undefined, 'normal');
  
  // Available cities box
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos + 2, 55, 12);
  doc.setFontSize(8);
  doc.text("AHMEDABAD", 17, yPos + 6);
  doc.text("SURAT", 17, yPos + 9);
  doc.text("VAPI", 17, yPos + 12);
  doc.text("MUMBAI", 17, yPos + 15);
  doc.text("PUNE", 43, yPos + 15);
  
  // CAUTION section
  doc.rect(72, yPos + 2, 60, 12);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("CAUTION", 74, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("This Consignment Will Not Be Detained Divorted,Re-Routed", 74, yPos + 8);
  doc.text("Or Re-Booked Without Consignee Bank Written Permission", 74, yPos + 11);
  doc.text("Will be Delivered At the Destination.", 74, yPos + 14);
  
  // AT OWNERS RISKS section
  doc.rect(134, yPos + 2, 65, 12);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("AT OWNERS RISKS", 136, yPos + 5);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("Pan No. : CMFPS3661A", 136, yPos + 8);
  doc.setTextColor(220, 38, 38);
  doc.text("GST No. : 07CMFPS3661A1Z6", 136, yPos + 11);
  doc.setTextColor(0, 0, 0);
  
  // SCHEDULE OF DEMURRAGE CHARGES
  yPos += 18;
  doc.rect(134, yPos, 65, 12);
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text("SCHEDULE OF DEMURRAGE CHARGES", 136, yPos + 3);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("Demmurrage Chargeable After 5 days Arrival Of Goods Rs.", 136, yPos + 6);
  doc.text("7/per Qtl.Per Day On Weight Charged", 136, yPos + 9);
  
  // INSURANCE
  doc.rect(72, yPos, 60, 12);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text("INSURANCE", 74, yPos + 3);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);
  doc.text("The Customer Has Started That", 74, yPos + 6);
  doc.text("He Has Not Insured The Consignement", 74, yPos + 9);
  doc.text("Policy No _______ Date_______", 74, yPos + 12);
  
  // NOTICE section
  doc.rect(15, yPos, 55, 12);
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text("NOTICE", 17, yPos + 3);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(5);
  doc.text("This consignment covered in this set of special lorry receipt", 17, yPos + 5);
  doc.text("shall be stored at the destination under the control of the", 17, yPos + 7);
  doc.text("transport operator & shall be delivered to or to the order of", 17, yPos + 9);
  doc.text("the Consignee Bank whose name is mentioned in the lorry", 17, yPos + 11);
  doc.text("receipt.", 17, yPos + 13);
  
  // Address Of Delivery and Vehicle No
  yPos += 16;
  doc.setFontSize(10);
  doc.text("Address Of Delivery :", 15, yPos);
  
  // Vehicle and C NOTE
  doc.setFontSize(11);
  doc.text("Vehicle No. :", 134, yPos);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text(`C NOTE No. : ${lr.lr_no || ''}`, 134, yPos + 6);
  doc.setFont(undefined, 'normal');
  
  // Consignor and details
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Consignor : ${lr.consignor_name || ''}`, 15, yPos);
  doc.text(`DATE : ${lr.date ? new Date(lr.date).toLocaleDateString('en-GB') : ''}`, 134, yPos);
  
  yPos += 5;
  doc.text(`Consignee : ${lr.consignee_name || ''}`, 15, yPos);
  doc.text(`FROM : ${lr.from_place || ''}`, 134, yPos);
  
  yPos += 5;
  doc.text(`TO : ${lr.to_place || ''}`, 134, yPos);
  
  yPos += 5;
  doc.text(`Consignor GST No : ${lr.consignor_gst || ''}`, 15, yPos);
  
  // Items table
  yPos += 8;
  const items = Array.isArray(lr.items) ? lr.items : [];
  
  // Create table body
  const tableBody = [];
  
  // Add item rows
  if (items.length > 0) {
    items.forEach((item: any) => {
      tableBody.push([
        item.pcs || '',
        item.description || '',
        '',
        item.weight || '',
        '',
        '',
        'To PAY Rs. :'
      ]);
    });
  } else {
    tableBody.push(['', '', '', '', '', '', 'To PAY Rs. :']);
  }
  
  // Add additional rows
  tableBody.push(['', '', 'Actual', 'Charged', 'Hamail', '', 'Paid RS. :']);
  tableBody.push(['', '', '', '', 'Sur.CH.', '', '']);
  tableBody.push(['', 'Invoice No.: ' + (lr.invoice_no || ''), '', '', 'St.CH.', '', '']);
  tableBody.push(['', 'Date: ' + (lr.invoice_date ? new Date(lr.invoice_date).toLocaleDateString('en-GB') : ''), '', '', 'Collection CH.', '', '']);
  tableBody.push(['', 'GST NO. :', '', '', 'D.Dty CH.', '', '']);
  tableBody.push(['', '', '', 'Mark', 'Other CH.', '', '']);
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
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center' },
      1: { cellWidth: 45 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 35 },
    },
  });
  
  // Footer
  const footerY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(6);
  doc.text("Endorsement Its Is Intended To use Consignee Copy Of the Set For The Purpose Of Borrowing From The", 15, footerY);
  doc.text("Consignee Bank", 15, footerY + 3);
  
  doc.text("The Court In Delhi Alone Shall Have Jurisdiction In Respect Of The Claims And Matters", 15, footerY + 8);
  doc.text("Arising Under The Consignment Or Of the Claims And Matter Arising Under The Goods", 15, footerY + 11);
  doc.text("Entrusted For Transport", 15, footerY + 14);
  
  doc.setFontSize(8);
  doc.text("Value :", 15, footerY + 20);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("GST PAYABLE BY", 105, footerY + 10, { align: "center" });
  doc.setFont(undefined, 'normal');
  
  doc.setFontSize(9);
  doc.text("For SSK INDIA LOGISTICS", 160, footerY + 10);
  doc.text("Auth. Signatory", 165, footerY + 25);
  
  // Save the PDF
  doc.save(`LR_${lr.lr_no}.pdf`);
};
