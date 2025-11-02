import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateLRPDF = async (lr: any) => {
  const doc = new jsPDF();
  
  // Header - Company Info
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38);
  doc.text("SSK INDIA LOGISTICS", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("(Fleet Owner & Contractor)", 105, 26, { align: "center" });
  
  doc.setFontSize(8);
  doc.text("Shop No. 362-A/2, Sataya Puram Colony, Jharoda Border, Near Ashram, New Delhi-110072", 105, 31, { align: "center" });
  doc.text("Mail : sskindialogistics@gmail.com, Web : www.indialogistics.com", 105, 35, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("7834819005 | 8929920007 | 7600026311 | 9619905027", 105, 40, { align: "center" });
  
  // Subject and Jurisdiction
  doc.setFontSize(8);
  doc.text("Jai Dada Udmiram Ki", 105, 12, { align: "center" });
  doc.text("SUBJECT TO DELHI JURISDICTION", 105, 45, { align: "center" });
  
  // Available At section
  let yPos = 50;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("Available At :", 15, yPos);
  doc.setFont(undefined, 'normal');
  doc.text("AHMEDABAD, SURAT, VAPI, MUMBAI, PUNE", 15, yPos + 4);
  
  // Caution, At Owner's Risks, Schedule sections
  doc.setFontSize(7);
  doc.rect(15, yPos + 8, 60, 15);
  doc.text("CAUTION", 17, yPos + 11);
  doc.setFontSize(6);
  doc.text("This Consignment Will Not Be Detained Divorted,Re-Routed", 17, yPos + 14);
  doc.text("Or Re-Booked Without Consignee Bank Written Permission", 17, yPos + 17);
  doc.text("Will be Delivered At the Destination.", 17, yPos + 20);
  
  doc.rect(77, yPos + 8, 58, 15);
  doc.setFontSize(7);
  doc.text("AT OWNERS RISKS", 79, yPos + 11);
  doc.setFontSize(6);
  doc.text(`Pan No. : CMFPS3661A`, 79, yPos + 14);
  doc.setTextColor(220, 38, 38);
  doc.text(`GST No. : 07CMFPS3661A1Z6`, 79, yPos + 17);
  doc.setTextColor(0, 0, 0);
  
  doc.rect(137, yPos + 8, 60, 15);
  doc.setFontSize(7);
  doc.text("SCHEDULE OF DEMURRAGE CHARGES", 139, yPos + 11);
  doc.setFontSize(6);
  doc.text("Demmurrage Chargeable After 5 days Arrival Of Goods Rs.", 139, yPos + 14);
  doc.text("7/per Qtl.Per Day On Weight Charged", 139, yPos + 17);
  
  // Vehicle No and C NOTE No
  yPos += 28;
  doc.setFontSize(10);
  doc.text("Address Of Delivery :", 15, yPos);
  doc.setFontSize(12);
  doc.text(`Vehicle No. : ${lr.truck_no || ''}`, 105, yPos);
  doc.setFont(undefined, 'bold');
  doc.text(`C NOTE No. : ${lr.lr_no || ''}`, 105, yPos + 6);
  doc.setFont(undefined, 'normal');
  
  // Consignor and Consignee details
  yPos += 12;
  doc.setFontSize(10);
  doc.text(`Consignor : ${lr.consignor_name || ''}`, 15, yPos);
  doc.text(`DATE : ${lr.date ? new Date(lr.date).toLocaleDateString('en-GB') : ''}`, 140, yPos);
  
  yPos += 5;
  doc.text(`Consignee : ${lr.consignee_name || ''}`, 15, yPos);
  doc.text(`FROM : ${lr.from_place || ''}`, 140, yPos);
  
  yPos += 5;
  doc.text(`TO : ${lr.to_place || ''}`, 140, yPos);
  
  yPos += 5;
  doc.text(`Consignor GST No : ${lr.consignor_gst || ''}`, 15, yPos);
  
  // Items table
  yPos += 8;
  const items = Array.isArray(lr.items) ? lr.items : [];
  const tableData = items.length > 0 
    ? items.map((item: any) => [item.description || '', item.pcs || '', item.weight || ''])
    : [['', '', '']];
  
  (doc as any).autoTable({
    startY: yPos,
    head: [['Packages', 'Description', 'Weight', 'Rate', 'Amount', 'Any Other Information\nRemarks']],
    body: [
      ...tableData.map((row: any) => [...row, '', '', 'To PAY Rs. :']),
      ['', '', '', '', '', 'Paid RS. :'],
      ['', 'Invoice No.: ' + (lr.invoice_no || ''), 'Date: ' + (lr.invoice_date ? new Date(lr.invoice_date).toLocaleDateString('en-GB') : ''), '', '', ''],
      ['', 'GST NO. :', '', '', '', ''],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 45 },
    },
  });
  
  // Weight details table
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  (doc as any).autoTable({
    startY: finalY,
    body: [
      ['', 'Actual', 'Charged', 'Hamail', '', ''],
      ['Weight (MT)', lr.weight || '', '', 'Sur.CH.', '', ''],
      ['', '', '', 'St.CH.', '', ''],
      ['Height', '', '', 'Collection CH.', '', ''],
      ['', '', '', 'D.Dty CH.', '', ''],
      ['', '', 'Mark', 'Other CH.', '', ''],
      ['', '', '', 'Risk CH.', '', ''],
      ['', '', '', 'Total', '', ''],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
  });
  
  // Footer
  const footerY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(7);
  doc.text("Endorsement Its Is Intended To use Consignee Copy Of the Set For The Purpose Of Borrowing From The", 15, footerY);
  doc.text("Consignee Bank", 15, footerY + 3);
  
  doc.text("The Court In Delhi Alone Shall Have Jurisdiction In Respect Of The Claims And Matters", 15, footerY + 8);
  doc.text("Arising Under The Consignment Or Of the Claims And Matter Arising Under The Goods", 15, footerY + 11);
  doc.text("Entrusted For Transport", 15, footerY + 14);
  
  doc.text("Value :", 15, footerY + 20);
  
  doc.text("GST PAYABLE BY", 105, footerY + 8, { align: "center" });
  
  doc.text("For SSK INDIA LOGISTICS", 160, footerY + 8);
  doc.text("Auth. Signatory", 165, footerY + 20);
  
  // Save the PDF
  doc.save(`LR_${lr.lr_no}.pdf`);
};
