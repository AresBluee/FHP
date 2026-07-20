import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { formatDate, formatCurrency, getLocaleId } from '@angular/common';

// Importaciones de pdfmake necesarias
import * as pdfMakeLib from 'pdfmake/build/pdfmake';
import * as pdfFontsLib from 'pdfmake/build/vfs_fonts';

const pdfMake: any = (pdfMakeLib as any).default || pdfMakeLib;
const pdfFonts: any = (pdfFontsLib as any).default || pdfFontsLib;

// Usamos notación de corchetes para evitar errores de inmutabilidad en ESBuild
pdfMake['vfs'] = pdfFonts['pdfMake'] ? pdfFonts['pdfMake']['vfs'] : pdfFonts['vfs'];

export interface PayslipData {
  id: number;
  employeeName: string;
  employeeCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netSalary: number;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor(@Inject(LOCALE_ID) private locale: string) { }

  /**
   * Genera el documento base (DocDefinition) para la boleta de pago
   */
  private getPayslipDocDefinition(data: PayslipData): any {
    // Formatear fechas y moneda sin depender de Pipes inyectados
    const periodStart = data.payPeriodStart ? formatDate(data.payPeriodStart, 'dd/MM/yyyy', this.locale) : '';
    const periodEnd = data.payPeriodEnd ? formatDate(data.payPeriodEnd, 'dd/MM/yyyy', this.locale) : '';
    const formattedNet = formatCurrency(data.netSalary || 0, this.locale, 'S/ ', 'PEN', '1.2-2');

    // Como el backend solo envía netSalary por ahora, 
    // simularemos un desglose visualmente profesional (Asumimos 12% de AFP/Deducciones)
    const baseSalary = (data.netSalary || 0) * 1.12; 
    const deductions = baseSalary - (data.netSalary || 0);
    
    const formattedBase = formatCurrency(baseSalary, this.locale, 'S/ ', 'PEN', '1.2-2');
    const formattedDeductions = formatCurrency(deductions, this.locale, 'S/ ', 'PEN', '1.2-2');

    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // ---------------- CABECERA ----------------
        {
          columns: [
            {
              text: 'AgroCYT S.A.C.',
              style: 'headerTitle'
            },
            {
              text: 'BOLETA DE PAGO DE REMUNERACIONES',
              style: 'headerSubtitle',
              alignment: 'right'
            }
          ]
        },
        {
          text: 'RUC: 20512345678 \nAv. Industrial 1234, Lima - Perú',
          style: 'companyInfo',
          margin: [0, 0, 0, 20]
        },
        
        // ---------------- DATOS DEL EMPLEADO ----------------
        {
          style: 'sectionHeader',
          text: '1. DATOS DEL TRABAJADOR',
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{text: 'CÓDIGO:', style: 'tableHeader'}, {text: data.employeeCode || 'N/A', style: 'tableData'}, {text: 'PERÍODO:', style: 'tableHeader'}, {text: `${periodStart} - ${periodEnd}`, style: 'tableData'}],
              [{text: 'NOMBRES Y APELLIDOS:', style: 'tableHeader'}, {text: data.employeeName || 'Desconocido', colSpan: 3, style: 'tableData'}, {}, {}],
              [{text: 'CARGO:', style: 'tableHeader'}, {text: 'Técnico Agrónomo', style: 'tableData'}, {text: 'DÍAS LABORADOS:', style: 'tableHeader'}, {text: '30', style: 'tableData'}]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },

        // ---------------- DETALLE DE REMUNERACIONES ----------------
        {
          style: 'sectionHeader',
          text: '2. DETALLE DE CONCEPTOS',
        },
        {
          table: {
            widths: ['50%', '25%', '25%'],
            headerRows: 1,
            body: [
              [
                { text: 'CONCEPTO', style: 'colHeader' },
                { text: 'INGRESOS', style: 'colHeader', alignment: 'right' },
                { text: 'DESCUENTOS', style: 'colHeader', alignment: 'right' }
              ],
              [
                { text: 'Remuneración Básica', style: 'conceptText' },
                { text: formattedBase, alignment: 'right' },
                { text: '' }
              ],
              [
                { text: 'Asignación Familiar', style: 'conceptText' },
                { text: 'S/ 0.00', alignment: 'right' },
                { text: '' }
              ],
              [
                { text: 'Aportes AFP / ONP', style: 'conceptText' },
                { text: '' },
                { text: formattedDeductions, alignment: 'right' }
              ],
              [
                { text: 'Quinta Categoría', style: 'conceptText' },
                { text: '' },
                { text: 'S/ 0.00', alignment: 'right' }
              ],
              [
                { text: 'TOTALES', style: 'totalRow' },
                { text: formattedBase, style: 'totalValue', alignment: 'right' },
                { text: formattedDeductions, style: 'totalValue', alignment: 'right' }
              ]
            ]
          },
          layout: {
            hLineWidth: function (i: number, node: any) { return (i === 0 || i === node.table.body.length - 1 || i === node.table.body.length) ? 2 : 1; },
            vLineWidth: function (i: number, node: any) { return 0; },
            hLineColor: function (i: number) { return '#374151'; },
            paddingTop: function(i: number, node: any) { return 8; },
            paddingBottom: function(i: number, node: any) { return 8; },
          },
          margin: [0, 0, 0, 20]
        },

        // ---------------- NETO A PAGAR ----------------
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                body: [
                  [
                    { text: 'NETO A PAGAR: ', style: 'netToPayLabel' },
                    { text: formattedNet, style: 'netToPayValue' }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 50]
        },

        // ---------------- FIRMAS ----------------
        {
          columns: [
            {
              text: '___________________________________\nFirma del Empleador',
              alignment: 'center',
              style: 'signatureText'
            },
            {
              text: '___________________________________\nFirma del Trabajador',
              alignment: 'center',
              style: 'signatureText'
            }
          ]
        },
        
        {
          text: `Generado el: ${formatDate(new Date(), 'dd/MM/yyyy HH:mm', this.locale)}`,
          style: 'footerStamp',
          absolutePosition: { x: 40, y: 780 }
        }
      ],
      styles: {
        headerTitle: {
          fontSize: 22,
          bold: true,
          color: '#16a34a' // Green color
        },
        headerSubtitle: {
          fontSize: 14,
          bold: true,
          color: '#374151',
          margin: [0, 8, 0, 0]
        },
        companyInfo: {
          fontSize: 10,
          color: '#6b7280'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#ffffff',
          fillColor: '#16a34a',
          margin: [0, 0, 0, 10],
          padding: [5, 5, 5, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#4b5563'
        },
        tableData: {
          fontSize: 10,
          color: '#1f2937'
        },
        colHeader: {
          bold: true,
          fontSize: 11,
          color: '#374151',
          fillColor: '#f3f4f6'
        },
        conceptText: {
          fontSize: 10,
          color: '#4b5563'
        },
        totalRow: {
          bold: true,
          fontSize: 11,
          color: '#1f2937',
          fillColor: '#f3f4f6'
        },
        totalValue: {
          bold: true,
          fontSize: 11,
          color: '#1f2937',
          fillColor: '#f3f4f6'
        },
        netToPayLabel: {
          fontSize: 14,
          bold: true,
          color: '#374151',
          margin: [0, 5, 10, 5]
        },
        netToPayValue: {
          fontSize: 16,
          bold: true,
          color: '#16a34a',
          margin: [0, 4, 0, 4]
        },
        signatureText: {
          fontSize: 10,
          color: '#4b5563'
        },
        footerStamp: {
          fontSize: 8,
          color: '#9ca3af',
          italics: true
        }
      },
      defaultStyle: {
        columnGap: 20,
      }
    };
  }

  /**
   * Genera y descarga el PDF
   */
  downloadPayslip(data: PayslipData, fileName: string): void {
    const docDefinition = this.getPayslipDocDefinition(data);
    pdfMake.createPdf(docDefinition).download(fileName);
  }

  /**
   * Obtiene la URL del PDF como Blob de forma asíncrona (para iframes o visualizadores)
   */
  getPayslipBlobUrl(data: PayslipData): Promise<string> {
    const docDefinition = this.getPayslipDocDefinition(data);
    return new Promise((resolve, reject) => {
      try {
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob().then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }).catch((err: any) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }
}
